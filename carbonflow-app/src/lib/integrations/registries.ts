import { resilientCall } from "@/lib/resilience";

export interface RegistryMatch {
  registro: "Verra" | "Gold Standard" | "RENARE";
  encontrado: boolean;
  nombreProyecto?: string;
  estado?: string;
  enlaceOficial: string;
}

function officialSearchLinks(termino: string) {
  const q = encodeURIComponent(termino);
  return {
    verra: `https://registry.verra.org/app/search/VCS?keyword=${q}`,
    goldStandard: `https://registry.goldstandard.org/projects?q=${q}`,
    renare: `https://www.minambiente.gov.co/registro-nacional-de-reduccion-de-las-emisiones-de-gei-renare/?s=${q}`,
  };
}

async function queryConfigurableRegistry(
  envUrl: string | undefined,
  termino: string,
  fallbackLink: string,
  registro: RegistryMatch["registro"]
): Promise<RegistryMatch> {
  if (!envUrl) {
    // Sin endpoint confirmado todavia: se ofrece igual una busqueda real via
    // enlace directo a la fuente oficial, en vez de bloquear la funcionalidad.
    return { registro, encontrado: false, enlaceOficial: fallbackLink };
  }

  const res = await fetch(`${envUrl}?q=${encodeURIComponent(termino)}`);
  if (!res.ok) throw new Error(`${registro} respondio ${res.status}`);
  const json = await res.json();
  const first = Array.isArray(json?.results) ? json.results[0] : json?.data?.[0];

  return {
    registro,
    encontrado: Boolean(first),
    nombreProyecto: first?.name ?? first?.nombre,
    estado: first?.status ?? first?.estado,
    enlaceOficial: fallbackLink,
  };
}

export async function searchOfficialRegistries(termino: string) {
  const links = officialSearchLinks(termino);

  const [verra, goldStandard, renare] = await Promise.all([
    resilientCall(
      () =>
        queryConfigurableRegistry(process.env.VERRA_REGISTRY_API_URL, termino, links.verra, "Verra"),
      { cacheKey: `verra:${termino}`, timeoutMs: 6000 }
    ),
    resilientCall(
      () =>
        queryConfigurableRegistry(
          process.env.GOLD_STANDARD_REGISTRY_API_URL,
          termino,
          links.goldStandard,
          "Gold Standard"
        ),
      { cacheKey: `gs:${termino}`, timeoutMs: 6000 }
    ),
    resilientCall(
      () =>
        queryConfigurableRegistry(
          process.env.RENARE_REGISTRY_API_URL,
          termino,
          links.renare,
          "RENARE"
        ),
      { cacheKey: `renare:${termino}`, timeoutMs: 6000 }
    ),
  ]);

  const toResult = (
    r: Awaited<ReturnType<typeof resilientCall<RegistryMatch>>>,
    registro: RegistryMatch["registro"],
    fallbackLink: string
  ): RegistryMatch =>
    r.ok
      ? r.data!
      : { registro, encontrado: false, enlaceOficial: fallbackLink };

  return [
    toResult(verra, "Verra", links.verra),
    toResult(goldStandard, "Gold Standard", links.goldStandard),
    toResult(renare, "RENARE", links.renare),
  ];
}

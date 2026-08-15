import { resilientCall } from "@/lib/resilience";

export interface AdminLocation {
  municipio?: string;
  departamento?: string;
  displayName: string;
}

async function reverseGeocode(lat: number, lon: number): Promise<AdminLocation> {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(lat),
    lon: String(lon),
    addressdetails: "1",
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
    headers: { "User-Agent": "CarbonFlow-Hackathon/1.0 (contacto@carbonflow.demo)" },
  });
  if (!res.ok) throw new Error(`Nominatim respondio ${res.status}`);
  const json = await res.json();
  const addr = json?.address ?? {};
  return {
    municipio: addr.municipality || addr.city || addr.town || addr.village,
    departamento: addr.state,
    displayName: json?.display_name ?? "Ubicación no determinada",
  };
}

// Nominatim exige maximo 1 solicitud por segundo; este espaciador simple
// evita disparar varias llamadas concurrentes durante la demo.
let lastCallAt = 0;
async function throttle() {
  const wait = 1000 - (Date.now() - lastCallAt);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCallAt = Date.now();
}

export async function getAdminLocation(lat: number, lon: number) {
  const cacheKey = `nominatim:${lat.toFixed(4)},${lon.toFixed(4)}`;
  return resilientCall(
    async () => {
      await throttle();
      return reverseGeocode(lat, lon);
    },
    { cacheKey, timeoutMs: 5000, cacheTtlMs: 60 * 60 * 1000 }
  );
}

export function fallbackAdminLocation(): AdminLocation {
  return { displayName: "Ubicación aproximada (sin datos administrativos detallados)" };
}

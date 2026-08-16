import { useEffect, useState } from "react";
import { isPddData } from "@/lib/expedientePdd";
import { labelTipoProyecto } from "@/lib/validacionRegistro";
import type { MarketplaceListing, ProjectContext } from "@/lib/marketplace/types";

const PUBLIC_FIELDS = [
  { id: "nombre", label: "Nombre del proyecto", required: true },
  { id: "ubicacion", label: "Ubicación general", required: true },
  { id: "resumen", label: "Resumen ejecutivo", required: true },
  { id: "tipo", label: "Tipo de iniciativa", required: true },
  { id: "area", label: "Área/capacidad general", required: true },
  { id: "co2e", label: "CO2e estimada", required: false },
  { id: "documentos", label: "Documentos públicos", required: false },
  { id: "renare", label: "Referencia RENARE", required: false },
  { id: "registro", label: "Enlace de registro externo", required: false },
];

interface PredioOption {
  id: string;
  nombre: string;
  tipo_proyecto: string;
  area_hectareas: number;
  ubicacion_display: string | null;
}

function initiativeFromTipo(tipo: string) {
  if (tipo.includes("reforest")) return "Reforestación";
  if (tipo.includes("conserv") || tipo.includes("restaur")) return "Conservación";
  if (tipo.includes("solar") || tipo.includes("eolic") || tipo.includes("biog") || tipo.includes("energia")) {
    return "Energía";
  }
  return labelTipoProyecto(tipo);
}

function emptyForm(context?: ProjectContext | null) {
  return {
    title: context?.projectName ?? "",
    location: "Colombia",
    summary: "",
    type: context?.tipo ? initiativeFromTipo(context.tipo) : "Conservación",
    area: "",
    co2e: "",
    need: "Comprador ancla",
    category: "Conservación/restauración de ecosistemas",
    amount: "",
    uses: "Estudios y diseño técnico, Línea base y formulación",
    renare: "",
  };
}

export function PublishProjectModal({
  context,
  onClose,
  onPublish,
}: {
  context?: ProjectContext | null;
  onClose: () => void;
  onPublish: (listings: MarketplaceListing[]) => void;
}) {
  const [destination, setDestination] = useState<"carbon" | "finance" | "both">("carbon");
  const [preview, setPreview] = useState(false);
  const [shared, setShared] = useState<string[]>(["nombre", "ubicacion", "resumen", "tipo", "area"]);
  const [form, setForm] = useState(() => emptyForm(context));
  const [predios, setPredios] = useState<PredioOption[]>([]);
  const [selectedPredioId, setSelectedPredioId] = useState(context?.predioId ?? "");
  const [loadingPredios, setLoadingPredios] = useState(true);
  const [loadingContext, setLoadingContext] = useState(false);
  const [sourceNote, setSourceNote] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/predios")
      .then((r) => r.json())
      .then((data) => {
        const list = (data.predios ?? []) as PredioOption[];
        setPredios(list);
        const initial = context?.predioId && list.some((p) => p.id === context.predioId)
          ? context.predioId
          : "";
        if (initial) setSelectedPredioId(initial);
      })
      .finally(() => setLoadingPredios(false));
  }, [context?.predioId]);

  useEffect(() => {
    if (!selectedPredioId) {
      setSourceNote(null);
      return;
    }
    setLoadingContext(true);
    fetch(`/api/validacion-registro?predioId=${encodeURIComponent(selectedPredioId)}`)
      .then((r) => r.json())
      .then((data) => {
        const predio = data.contexto?.predio;
        if (!predio) return;
        const diagnostico = data.contexto?.diagnostico;
        const expediente = data.contexto?.expediente;
        const renare = data.contexto?.referenciaRenare;
        const pdd = isPddData(expediente?.pdd_data) ? expediente.pdd_data : null;
        const location =
          predio.ubicacion_display ||
          [predio.departamento, predio.municipio].filter(Boolean).join(", ") ||
          "Colombia";
        const summary =
          pdd?.resumenEjecutivo?.visionGeneral ||
          predio.objetivo_intervencion ||
          expediente?.linea_base ||
          `Proyecto ${predio.nombre} en ${location}. Información tomada del diagnóstico y la formulación disponibles.`;
        const co2e = diagnostico?.co2e_horizonte ?? diagnostico?.co2e_por_anio;
        const nextShared = ["nombre", "ubicacion", "resumen", "tipo", "area"];
        if (co2e) nextShared.push("co2e");
        if (renare?.codigo_referencia) nextShared.push("renare");
        setShared(nextShared);
        setForm({
          title: predio.nombre ?? "",
          location,
          summary,
          type: initiativeFromTipo(predio.tipo_proyecto ?? ""),
          area: predio.area_hectareas != null ? String(predio.area_hectareas) : "",
          co2e: co2e != null ? String(co2e) : "",
          need: "Comprador ancla",
          category: "Conservación/restauración de ecosistemas",
          amount: expediente?.presupuesto || pdd?.evaluacionFinanciera?.capexInicial || "",
          uses: "Estudios y diseño técnico, Línea base y formulación",
          renare: renare?.codigo_referencia ?? "",
        });
        const pieces = ["predio"];
        if (diagnostico) pieces.push("diagnóstico");
        if (expediente) pieces.push("formulación");
        if (renare?.codigo_referencia) pieces.push("RENARE");
        setSourceNote(`Campos precargados desde ${pieces.join(", ")}. Puedes editarlos antes de publicar.`);
      })
      .finally(() => setLoadingContext(false));
  }, [selectedPredioId]);

  const toggle = (id: string, required: boolean) => {
    if (required) return;
    setShared((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  };

  const buildListings = (): MarketplaceListing[] => {
    const now = new Date().toISOString().slice(0, 10);
    const base = {
      description: form.summary || "Publicación creada por el titular. Información declarada.",
      location: form.location,
      initiativeType: form.type,
      areaHa: form.area ? Number(form.area) : undefined,
      co2eEstimate: shared.includes("co2e") && form.co2e ? Number(form.co2e) : undefined,
      co2eDisclaimer: "Estimación preliminar, no certificada",
      renareRef: shared.includes("renare") ? form.renare || undefined : undefined,
      updatedAt: now,
      demo: false,
      publicationStatus: "Publicado" as const,
      contactHidden: true,
    };
    const listings: MarketplaceListing[] = [];
    if (destination === "carbon" || destination === "both") {
      listings.push({
        ...base,
        id: `user-carbon-${Date.now()}`,
        kind: "carbon_project_development",
        tab: "carbon",
        title: form.title,
        projectStatus: "En estructuración",
        need: form.need,
        trustLabels: ["En estructuración", "Información declarada por el usuario", "Requiere revisión técnica"],
      });
    }
    if (destination === "finance" || destination === "both") {
      listings.push({
        ...base,
        id: `user-finance-${Date.now() + 1}`,
        kind: "green_finance_project",
        tab: "finance",
        title: form.title,
        environmentalCategory: form.category,
        projectStage: "Estructuración",
        indicativeAmount: form.amount || "A definir",
        currency: "COP",
        resourceUses: form.uses.split(",").map((s) => s.trim()).filter(Boolean),
        projectStatus: "En búsqueda de financiación",
        trustLabels: ["En búsqueda de financiación", "Información declarada por el usuario", "No constituye oferta de valores"],
      });
    }
    return listings;
  };

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-xl"
      >
        <h3 className="font-heading text-headline-sm">Publicar mi proyecto</h3>
        {!preview ? (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              setPreview(true);
            }}
          >
            <label className="flex flex-col gap-1.5">
              <span className="font-data text-label-caps text-on-surface-variant">Cargar un proyecto existente</span>
              <select
                value={selectedPredioId}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedPredioId(value);
                  if (!value) {
                    setForm(emptyForm(context));
                    setSourceNote(null);
                  }
                }}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
              >
                <option value="">Escribir desde cero</option>
                {predios.map((predio) => (
                  <option key={predio.id} value={predio.id}>
                    {predio.nombre} — {predio.area_hectareas} ha
                  </option>
                ))}
              </select>
              {loadingPredios && <span className="text-disclaimer-italic">Cargando tus predios…</span>}
              {!loadingPredios && predios.length === 0 && (
                <span className="text-disclaimer-italic text-on-surface-variant">
                  No hay predios diagnosticados aún. Completa un diagnóstico para precargar datos, o llena el
                  formulario manualmente.
                </span>
              )}
              {loadingContext && <span className="text-disclaimer-italic">Cargando información del proyecto…</span>}
              {sourceNote && <span className="text-disclaimer-italic text-on-surface-variant">{sourceNote}</span>}
            </label>

            <fieldset className="space-y-2">
              <legend className="font-medium text-body-sm">¿Dónde deseas publicar?</legend>
              <label className="flex gap-2 text-body-sm">
                <input type="radio" checked={destination === "carbon"} onChange={() => setDestination("carbon")} />
                <span>
                  <strong>Proyecto en desarrollo — Créditos de Carbono.</strong> Para buscar comprador ancla, alianza o
                  financiación de estructuración.
                </span>
              </label>
              <label className="flex gap-2 text-body-sm">
                <input type="radio" checked={destination === "finance"} onChange={() => setDestination("finance")} />
                <span>
                  <strong>Proyecto financiable — Financiación Verde.</strong> Para buscar banco, fondo, estructurador o
                  aliado financiero.
                </span>
              </label>
              <label className="flex gap-2 text-body-sm">
                <input type="radio" checked={destination === "both"} onChange={() => setDestination("both")} />
                <span>
                  <strong>Ambos.</strong> Se crearán dos perfiles independientes con advertencias específicas.
                </span>
              </label>
            </fieldset>
            <input
              required
              placeholder="Nombre del proyecto"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
            <input
              required
              placeholder="Ubicación general (sin coordenadas)"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
            <textarea
              required
              rows={3}
              placeholder="Resumen ejecutivo"
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
            <input
              required
              placeholder="Tipo de iniciativa"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
            <input
              required
              placeholder="Área (ha)"
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
            <input
              placeholder="CO2e estimada (opcional)"
              value={form.co2e}
              onChange={(e) => setForm({ ...form, co2e: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
            {destination !== "finance" && (
              <input
                placeholder="Necesidad comercial"
                value={form.need}
                onChange={(e) => setForm({ ...form, need: e.target.value })}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
              />
            )}
            {destination !== "carbon" && (
              <>
                <input
                  placeholder="Monto orientativo"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
                />
                <input
                  placeholder="Uso previsto de recursos"
                  value={form.uses}
                  onChange={(e) => setForm({ ...form, uses: e.target.value })}
                  className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
                />
              </>
            )}
            <fieldset className="space-y-1">
              <legend className="font-data text-label-caps text-on-surface-variant">Información pública</legend>
              {PUBLIC_FIELDS.map((field) => (
                <label key={field.id} className="flex items-center gap-2 text-body-sm">
                  <input
                    type="checkbox"
                    checked={shared.includes(field.id)}
                    disabled={field.required}
                    onChange={() => toggle(field.id, field.required)}
                  />
                  {field.label}
                </label>
              ))}
            </fieldset>
            <p className="text-disclaimer-italic text-on-surface-variant">
              No se publican coordenadas exactas, documentos de tenencia ni datos personales. Un resultado o crédito
              reportado requiere fuente, ID, enlace oficial, estado y fecha de consulta; no está disponible en este
              formulario.
            </p>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 rounded-lg bg-forest-deep text-on-primary py-2">
                Vista previa
              </button>
              <button type="button" onClick={onClose} className="rounded-lg border border-outline-variant px-4">
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-body-sm">Revisa la información pública antes de publicar.</p>
            {buildListings().map((listing) => (
              <div key={listing.id} className="rounded-lg border border-outline-variant p-3 text-body-sm space-y-1">
                <p className="font-medium">{listing.title}</p>
                <p>{listing.tab === "carbon" ? "Créditos de Carbono — proyecto en desarrollo" : "Financiación Verde"}</p>
                <p>{listing.location}</p>
                <p>{listing.description}</p>
                <p>Estado de publicación: Publicado</p>
              </div>
            ))}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onPublish(buildListings());
                  onClose();
                }}
                className="flex-1 rounded-lg bg-forest-deep text-on-primary py-2"
              >
                Publicar
              </button>
              <button type="button" onClick={() => setPreview(false)} className="rounded-lg border border-outline-variant px-4">
                Editar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

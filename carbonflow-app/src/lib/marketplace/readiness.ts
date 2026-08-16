import {
  computeFormulacionPct,
  computePreparacion,
  type DiagnosticoContexto,
  type ExpedienteContexto,
  type PredioContexto,
} from "@/lib/validacionRegistro";
import type { MarketplaceListing, ProjectReadiness } from "./types";

export function readinessFromContext(
  predio: PredioContexto,
  diagnostico: DiagnosticoContexto | null,
  expediente: ExpedienteContexto | null,
  renare?: { referencia_id?: string | null; codigo_referencia?: string | null } | null
): ProjectReadiness {
  const preparacion = computePreparacion(predio, diagnostico, expediente);
  const formulationPct = computeFormulacionPct(expediente);
  const ref = renare?.referencia_id ?? renare?.codigo_referencia;
  return {
    stage: preparacion.estado,
    validationScore: preparacion.puntaje,
    diagnosisAvailable: Boolean(diagnostico),
    formulationPct,
    traceability: ref
      ? `Referencia RENARE ${ref}`
      : "Referencia RENARE no iniciada",
    shareableDocs: {
      available: [predio.nombre, diagnostico, expediente?.linea_base].filter(Boolean).length,
      total: 8,
    },
    gaps: preparacion.brechas.slice(0, 3).map((b) => b.nombre),
    sources: ["Diagnóstico", "Formulación", "Validación y Registro"],
  };
}

export function readinessForListing(listing: MarketplaceListing): ProjectReadiness {
  if (listing.readiness) return listing.readiness;
  const stage = listing.projectStatus ?? listing.projectStage ?? "En estructuración";
  const publicDocs = listing.dataRoomLevels?.public.length ?? listing.dataRoom?.filter((d) => d.shared).length ?? 0;
  const requestDocs = listing.dataRoomLevels?.request.length ?? 0;
  return {
    stage,
    validationScore: stage.includes("avanzada") ? 72 : stage.includes("Listo") ? 86 : 48,
    diagnosisAvailable: Boolean(listing.co2eEstimate || listing.areaHa),
    formulationPct: stage.includes("Listo") ? 80 : stage.includes("avanzada") ? 65 : 35,
    traceability: listing.renareRef ?? "Referencia RENARE no iniciada",
    shareableDocs: { available: publicDocs + requestDocs, total: 8 },
    gaps: listing.kind.includes("project")
      ? ["Metodología/estándar por definir", "Soporte de control del predio pendiente"]
      : [],
    sources: ["Información declarada por el usuario"],
  };
}

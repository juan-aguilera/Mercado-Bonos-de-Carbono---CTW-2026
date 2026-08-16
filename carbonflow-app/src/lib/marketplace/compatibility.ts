import type { CompatibilityResult, MarketplaceListing, MarketplaceNeed, PreparationLevel } from "./types";

const STAGE_RANK: Record<string, number> = {
  initial: 1,
  Inicial: 1,
  structured: 2,
  "En estructuración": 2,
  Estructuración: 2,
  advanced: 3,
  "Preparación avanzada": 3,
  ready_for_review: 4,
  "Listo para revisión técnica": 4,
  "Listo para solicitar revisión técnica": 4,
};

function includesLoose(haystack: string | undefined, needle: string) {
  if (!haystack) return false;
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function listOverlap(left: string[] | undefined, right: string[] | undefined) {
  if (!left?.length || !right?.length) return false;
  return left.some((item) => right.some((other) => includesLoose(item, other) || includesLoose(other, item)));
}

function stageMet(listing: MarketplaceListing, minimum?: PreparationLevel) {
  if (!minimum) return true;
  const current = listing.readiness?.stage ?? listing.projectStatus ?? listing.projectStage ?? "";
  return (STAGE_RANK[current] ?? 0) >= (STAGE_RANK[minimum] ?? 0);
}

export function compatibilityLabel(score: number): CompatibilityResult["label"] {
  if (score >= 85) return "Muy alta";
  if (score >= 70) return "Alta";
  if (score >= 40) return "Parcial";
  return "Baja";
}

export function computeCompatibility(listing: MarketplaceListing, need: MarketplaceNeed): CompatibilityResult {
  const typeHit =
    need.projectTypes.some((type) => includesLoose(listing.initiativeType, type) || listing.sectors?.includes(type)) ||
    listOverlap(listing.sectors, need.projectTypes);
  const locationHit =
    need.locationScope.some(
      (scope) =>
        includesLoose(listing.location, scope) ||
        includesLoose(listing.coverage, scope) ||
        scope === "Colombia"
    );
  const stageHit = stageMet(listing, need.minimumPreparationLevel);
  const useHit =
    listOverlap(listing.resourceUses, need.resourceUses) ||
    (need.carbonInterest ? includesLoose(listing.need, need.carbonInterest) : false) ||
    includesLoose(listing.need, need.needType) ||
    (need.financeInstrument ? includesLoose(listing.need, need.financeInstrument) : false) ||
    (!need.resourceUses?.length && !need.carbonInterest && !need.financeInstrument);
  const cobenefitHit = !need.cobenefits.length || listOverlap(listing.cobenefits, need.cobenefits);
  const docsAvailable = (listing.dataRoomLevels?.public.length ?? listing.dataRoom?.length ?? 0) > 0;
  const docsHit = need.requiredDocuments.length === 0 || docsAvailable || (listing.readiness?.shareableDocs.available ?? 0) > 0;

  const breakdown = [
    { criterion: "Tipo de proyecto coincide", weight: 25, matched: typeHit, note: listing.initiativeType ?? "No declarado" },
    { criterion: "Ubicación coincide", weight: 15, matched: locationHit, note: listing.location ?? listing.coverage ?? "No declarada" },
    { criterion: "Etapa/preparación mínima cumplida", weight: 20, matched: stageHit, note: listing.readiness?.stage ?? listing.projectStatus ?? "No declarada" },
    { criterion: "Necesidad/uso de recursos coincide", weight: 15, matched: useHit, note: listing.need ?? listing.resourceUses?.join(", ") ?? "No declarado" },
    { criterion: "Co-beneficios coinciden", weight: 10, matched: cobenefitHit, note: listing.cobenefits?.join(", ") ?? "No declarados" },
    { criterion: "Documentos/información solicitada disponible", weight: 15, matched: docsHit, note: `${listing.readiness?.shareableDocs.available ?? 0} documentos compartibles` },
  ];

  const score = breakdown.reduce((sum, item) => sum + (item.matched ? item.weight : 0), 0);
  return {
    score,
    label: compatibilityLabel(score),
    matches: breakdown.filter((item) => item.matched).map((item) => item.criterion),
    gaps: [
      ...breakdown.filter((item) => !item.matched).map((item) => item.criterion),
      ...(listing.readiness?.gaps ?? []),
    ],
    breakdown,
  };
}

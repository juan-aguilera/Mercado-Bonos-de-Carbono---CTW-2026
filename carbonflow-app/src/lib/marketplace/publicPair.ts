import { readinessForListing } from "./readiness";
import type { MarketplaceListing, MarketplaceNeed, PublicNeedCard, PublicProjectCard } from "./types";

export function toPublicProjectCard(listing: MarketplaceListing): PublicProjectCard {
  const readiness = readinessForListing(listing);
  return {
    id: listing.id,
    title: listing.title,
    type: listing.initiativeType,
    location: listing.location ?? listing.coverage,
    stage: readiness.stage,
    need: listing.need,
    summary: listing.description,
    cobenefits: listing.cobenefits,
    areaHa: listing.areaHa,
    co2eEstimate: listing.co2eEstimate,
    diagnosisAvailable: readiness.diagnosisAvailable,
    formulationPct: readiness.formulationPct,
    validationScore: readiness.validationScore,
    traceability: readiness.traceability,
    gaps: readiness.gaps,
    publicDocuments: listing.dataRoomLevels?.public.map((item) => item.name) ?? listing.dataRoom?.filter((item) => item.shared).map((item) => item.name),
    requestDocuments: listing.dataRoomLevels?.request.map((item) => item.name),
  };
}

export function toPublicNeedCard(need: MarketplaceNeed): PublicNeedCard {
  return {
    id: need.id,
    title: need.title,
    organization: need.organization,
    actorType: need.actorType,
    category: need.category,
    summary: need.summary,
    needType: need.needType,
    projectTypes: need.projectTypes,
    locationScope: need.locationScope,
    minimumPreparationLevel: need.minimumPreparationLevel,
    carbonInterest: need.carbonInterest,
    financeInstrument: need.financeInstrument,
    resourceUses: need.resourceUses,
    volumeHint: need.volumeHint,
    cobenefits: need.cobenefits,
    requiredDocuments: need.requiredDocuments,
  };
}

export function listingFromPublicCard(card: PublicProjectCard): MarketplaceListing {
  return {
    id: card.id,
    kind: "carbon_project_development",
    tab: "carbon",
    title: card.title,
    description: card.summary,
    location: card.location,
    initiativeType: card.type,
    projectStatus: (card.stage as MarketplaceListing["projectStatus"]) ?? "En estructuración",
    need: card.need,
    cobenefits: card.cobenefits,
    areaHa: card.areaHa,
    co2eEstimate: card.co2eEstimate,
    updatedAt: "",
    demo: false,
    trustLabels: ["Información declarada por el usuario"],
    publicationStatus: "Publicado",
    contactHidden: true,
    readiness: {
      stage: card.stage ?? "En estructuración",
      validationScore: card.validationScore,
      diagnosisAvailable: Boolean(card.diagnosisAvailable),
      formulationPct: card.formulationPct ?? 0,
      traceability: card.traceability ?? "Referencia RENARE no iniciada",
      shareableDocs: { available: card.publicDocuments?.length ?? 0, total: 8 },
      gaps: card.gaps ?? [],
      sources: ["Información declarada por el usuario"],
    },
    dataRoomLevels: {
      public: (card.publicDocuments ?? []).map((name, index) => ({ id: `p-${index}`, name, shared: true })),
      request: (card.requestDocuments ?? []).map((name, index) => ({ id: `r-${index}`, name, shared: false })),
      confidential: [],
    },
  };
}

export function needFromPublicCard(card: PublicNeedCard): MarketplaceNeed {
  return {
    id: card.id,
    category: card.category,
    status: "published",
    title: card.title,
    summary: card.summary,
    organization: card.organization,
    actorType: card.actorType,
    needType: card.needType,
    projectTypes: card.projectTypes,
    locationScope: card.locationScope,
    minimumPreparationLevel: card.minimumPreparationLevel,
    carbonInterest: card.carbonInterest,
    financeInstrument: card.financeInstrument,
    resourceUses: card.resourceUses,
    volumeHint: card.volumeHint,
    cobenefits: card.cobenefits,
    requiredDocuments: card.requiredDocuments,
    requiredPreparationItems: [],
    isSimulated: true,
    publishedAt: "",
    createdAt: "",
  };
}

export type MarketplaceTab = "ovv" | "carbon" | "finance";
export type MarketplaceRole = "ovv" | "empresa" | "propietario";
export type MarketplaceRoleView =
  | "ovv-profile"
  | "ovv-projects"
  | "empresa-projects"
  | "empresa-need"
  | "empresa-matches"
  | "owner-needs"
  | "owner-ovvs"
  | "owner-matches";
export type MarketplaceMode = "offer" | "needs" | "publish-need";
export type NeedCategory = "ovv" | "carbon" | "green_finance";
export type NeedStatus = "draft" | "published" | "paused" | "closed" | "expired";
export type HolderType = "Comunidad" | "Asociación" | "Cooperativa" | "Pequeño productor" | "Desarrollador";
export type DataRoomLevel = 1 | 2 | 3;
export type CompatibilityLabel = "Baja" | "Parcial" | "Alta" | "Muy alta";
export type PreparationLevel = "initial" | "structured" | "advanced" | "ready_for_review";

export type ListingKind =
  | "ovv_profile"
  | "technical_firm_profile"
  | "carbon_project_development"
  | "reported_carbon_result"
  | "reported_retired_credit"
  | "carbon_buyer_demand"
  | "green_finance_project"
  | "green_finance_provider";

export type RequestCategory = "ovv" | "carbon_project" | "reported_credit" | "green_finance";

export type ProjectStatus =
  | "En estructuración"
  | "Preparación avanzada"
  | "Listo para revisión técnica"
  | "En validación externa"
  | "Resultados verificados reportados"
  | "Créditos emitidos reportados"
  | "Créditos retirados reportados"
  | "En búsqueda de financiación"
  | "Pausado";

export type PublicationStatus = "Borrador" | "Publicado" | "Pausado" | "Cerrado";

export type RequestStatus =
  | "Nueva"
  | "Enviada"
  | "Respuesta simulada recibida"
  | "En contacto"
  | "Cerrada"
  | "Archivada";

export type TrustLabel =
  | "Información declarada por el usuario"
  | "Fuente oficial enlazada"
  | "Resultado reportado en registro externo"
  | "Documento compartido por el titular"
  | "En estructuración"
  | "En búsqueda de financiación"
  | "Requiere revisión técnica"
  | "Perfil demostrativo"
  | "Respuesta simulada para demo"
  | "No constituye oferta vinculante"
  | "No constituye oferta de valores"
  | "Retirado / no disponible para nueva asignación"
  | "Necesidad activa"
  | "Necesidad simulada para demo"
  | "Proyecto comunitario / Pequeño productor";

export interface DataRoomItem {
  id: string;
  name: string;
  shared: boolean;
}

export interface MarketplaceListing {
  id: string;
  kind: ListingKind;
  tab: MarketplaceTab;
  title: string;
  organization?: string;
  entityType?: string;
  description: string;
  location?: string;
  services?: string[];
  sectors?: string[];
  coverage?: string;
  languages?: string[];
  modality?: string;
  accreditation?: string;
  accreditor?: string;
  accreditationScope?: string;
  accreditationValidUntil?: string;
  publicDocumentUrl?: string;
  experienceNote?: string;
  updatedAt: string;
  demo: boolean;
  trustLabels: TrustLabel[];
  publicationStatus: PublicationStatus;
  projectStatus?: ProjectStatus;
  initiativeType?: string;
  areaHa?: number;
  co2eEstimate?: number;
  co2eDisclaimer?: string;
  need?: string;
  cobenefits?: string[];
  renareRef?: string;
  registry?: string;
  externalId?: string;
  officialUrl?: string;
  reportedStatus?: string;
  consultedAt?: string;
  methodology?: string;
  vintage?: string;
  volumeIssued?: number;
  volumeRetired?: number;
  tonsNeeded?: number;
  budgetAmount?: string;
  budgetCurrency?: string;
  environmentalCategory?: string;
  projectStage?: string;
  indicativeAmount?: string;
  currency?: string;
  resourceUses?: string[];
  financeTypes?: string[];
  instruments?: string[];
  ticketRange?: string;
  evaluationCriteria?: string;
  requiredDocuments?: string[];
  dataRoom?: DataRoomItem[];
  dataRoomLevels?: {
    public: DataRoomItem[];
    request: DataRoomItem[];
    confidential: DataRoomItem[];
  };
  holderType?: HolderType;
  beneficiariesEstimate?: number;
  participationMechanism?: string;
  benefitDistribution?: "Por definir" | "En construcción" | "Documentado";
  needsTechnicalAssistance?: boolean;
  needsSeedFinance?: boolean;
  readiness?: ProjectReadiness;
  contactHidden: boolean;
}

export interface ProjectReadiness {
  stage: string;
  validationScore?: number;
  diagnosisAvailable: boolean;
  formulationPct: number;
  traceability: string;
  shareableDocs: { available: number; total: number };
  gaps: string[];
  sources: string[];
}

export interface MarketplaceNeed {
  id: string;
  category: NeedCategory;
  status: NeedStatus;
  title: string;
  summary: string;
  organization: string;
  actorType: string;
  needType: string;
  projectTypes: string[];
  locationScope: string[];
  minimumPreparationLevel?: PreparationLevel;
  validationService?: string;
  carbonInterest?: string;
  financeInstrument?: string;
  resourceUses?: string[];
  fundingTicketMin?: number;
  fundingTicketMax?: number;
  currency?: string;
  volumeHint?: string;
  cobenefits: string[];
  requiredDocuments: string[];
  requiredPreparationItems: string[];
  targetDate?: string;
  expiresAt?: string;
  isSimulated: boolean;
  publishedAt: string;
  createdAt: string;
}

export interface CompatibilityBreakdownItem {
  criterion: string;
  weight: number;
  matched: boolean;
  note: string;
}

export interface CompatibilityResult {
  score: number;
  label: CompatibilityLabel;
  matches: string[];
  gaps: string[];
  breakdown: CompatibilityBreakdownItem[];
}

export interface PublicProjectCard {
  id: string;
  title: string;
  type?: string;
  location?: string;
  stage?: string;
  need?: string;
  summary: string;
  cobenefits?: string[];
  areaHa?: number;
  co2eEstimate?: number;
  diagnosisAvailable?: boolean;
  formulationPct?: number;
  validationScore?: number;
  traceability?: string;
  gaps?: string[];
  publicDocuments?: string[];
  requestDocuments?: string[];
}

export interface PublicNeedCard {
  id: string;
  title: string;
  organization: string;
  actorType: string;
  category: NeedCategory;
  summary: string;
  needType: string;
  projectTypes: string[];
  locationScope: string[];
  minimumPreparationLevel?: PreparationLevel;
  carbonInterest?: string;
  financeInstrument?: string;
  resourceUses?: string[];
  volumeHint?: string;
  cobenefits: string[];
  requiredDocuments: string[];
}

export interface StrongMatchNarrative {
  whyStrong: string;
  toValidate: string[];
  sharePublic: string[];
  shareOnRequest: string[];
  draftMessage: string;
}

export interface StrongMatch extends StrongMatchNarrative {
  needId?: string;
  needTitle?: string;
  projectId?: string;
  projectTitle?: string;
  organization: string;
  compatibility: CompatibilityResult;
}

export interface MarketplaceRequest {
  id: string;
  category: RequestCategory;
  listingId: string;
  listingTitle: string;
  needId?: string;
  projectId?: string;
  compatibilityScore?: number;
  requesterName: string;
  requesterOrganization: string;
  requesterEmail: string;
  requesterPhone?: string;
  requestType: string;
  message: string;
  sharedFields: string[];
  consentAt: string;
  status: RequestStatus;
  createdAt: string;
  responseType: "real" | "simulated";
  simulatedResponse?: string;
}

export interface ProjectContext {
  predioId?: string | null;
  projectName?: string | null;
  tipo?: string | null;
  estado?: string | null;
  preparacion?: string | null;
  brechas?: string | null;
  necesidad?: string | null;
}

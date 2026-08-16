import type { MarketplaceNeed, MarketplaceTab, NeedCategory } from "./types";

export const DEMO_NEEDS: MarketplaceNeed[] = [
  {
    id: "need-ovv-preeval-forestal",
    category: "ovv",
    status: "published",
    title: "OVV busca iniciativas forestales para preevaluación",
    summary:
      "Organismo demostrativo que declara interés en revisar iniciativas de conservación o restauración en etapa de preparación avanzada.",
    organization: "Andina Revisión Técnica",
    actorType: "OVV",
    needType: "Preevaluación",
    projectTypes: ["Conservación", "Restauración"],
    locationScope: ["Colombia"],
    minimumPreparationLevel: "advanced",
    validationService: "Preevaluación",
    requiredDocuments: ["Resumen público", "Línea base", "Control del predio"],
    requiredPreparationItems: ["Línea base", "Objetivo de validación"],
    cobenefits: [],
    targetDate: "2026-11-30",
    isSimulated: true,
    publishedAt: "2026-08-01",
    createdAt: "2026-08-01",
  },
  {
    id: "need-carbon-cafe-andino",
    category: "carbon",
    status: "published",
    title: "Café Andino busca proyecto de conservación para compensación",
    summary:
      "Empresa de café que declara necesidad de conectar con un proyecto en desarrollo. Volumen orientativo 8,000 tCO2e. No es orden de compra.",
    organization: "Café Andino SAS",
    actorType: "Comprador",
    needType: "Proyecto en desarrollo",
    projectTypes: ["Conservación", "Restauración"],
    locationScope: ["Colombia"],
    minimumPreparationLevel: "structured",
    carbonInterest: "Compra futura",
    volumeHint: "8,000 tCO2e",
    cobenefits: ["Comunidades", "Biodiversidad"],
    requiredDocuments: ["Resumen público", "Perfil de preparación"],
    requiredPreparationItems: ["Diagnóstico geoespacial"],
    targetDate: "2026-12-15",
    isSimulated: true,
    publishedAt: "2026-08-10",
    createdAt: "2026-08-10",
  },
  {
    id: "need-carbon-logistica",
    category: "carbon",
    status: "published",
    title: "Logística Caribe busca restauración con comprador ancla",
    summary:
      "Operador logístico que declara interés en un proyecto forestal 2026-2028. Presupuesto orientativo USD 180,000.",
    organization: "Logística Caribe Ltda.",
    actorType: "Comprador",
    needType: "Proyecto en desarrollo",
    projectTypes: ["Restauración", "Reforestación"],
    locationScope: ["Colombia", "Caribe"],
    minimumPreparationLevel: "advanced",
    carbonInterest: "Comprador ancla",
    volumeHint: "3,500 tCO2e",
    cobenefits: ["Comunidades"],
    requiredDocuments: ["Resumen público", "Cronograma"],
    requiredPreparationItems: ["Formulación"],
    isSimulated: true,
    publishedAt: "2026-08-04",
    createdAt: "2026-08-04",
  },
  {
    id: "need-fin-fondo-restauracion",
    category: "green_finance",
    status: "published",
    title: "Fondo busca proyectos de restauración en Colombia",
    summary:
      "Fondo de impacto demostrativo que declara interés en restauración forestal con implementación y monitoreo.",
    organization: "Fondo de Impacto Andino",
    actorType: "Financiador",
    needType: "Capital de impacto",
    projectTypes: ["Restauración"],
    locationScope: ["Colombia"],
    minimumPreparationLevel: "advanced",
    financeInstrument: "Capital de impacto",
    resourceUses: ["Implementación", "Monitoreo y seguimiento"],
    fundingTicketMin: 500_000_000,
    fundingTicketMax: 2_000_000_000,
    currency: "COP",
    cobenefits: ["Biodiversidad", "Comunidades"],
    requiredDocuments: ["Resumen ejecutivo", "Presupuesto preliminar", "Cronograma"],
    requiredPreparationItems: ["Formulación", "Diagnóstico"],
    targetDate: "2026-10-31",
    isSimulated: true,
    publishedAt: "2026-07-28",
    createdAt: "2026-07-28",
  },
  {
    id: "need-fin-asistencia",
    category: "green_finance",
    status: "published",
    title: "Estructurador busca proyectos comunitarios para asistencia técnica",
    summary:
      "Mesa de estructuración que declara interés en acompañar proyectos de pequeño productor o comunidad.",
    organization: "Mesa Verde Estructuración",
    actorType: "Estructurador",
    needType: "Asistencia técnica",
    projectTypes: ["Conservación", "Restauración"],
    locationScope: ["Colombia"],
    minimumPreparationLevel: "initial",
    financeInstrument: "Asistencia técnica",
    resourceUses: ["Estudios y diseño técnico", "Línea base y formulación"],
    cobenefits: ["Comunidades"],
    requiredDocuments: ["Resumen público"],
    requiredPreparationItems: [],
    isSimulated: true,
    publishedAt: "2026-07-12",
    createdAt: "2026-07-12",
  },
];

export function tabToNeedCategory(tab: MarketplaceTab): NeedCategory {
  if (tab === "finance") return "green_finance";
  return tab;
}

export function needCategoryLabel(category: NeedCategory) {
  if (category === "ovv") return "Validación y Verificación";
  if (category === "carbon") return "Créditos de Carbono";
  return "Financiación Verde";
}

export function preparationLevelLabel(level?: string) {
  if (level === "ready_for_review") return "Listo para revisión técnica";
  if (level === "advanced") return "Preparación avanzada";
  if (level === "structured") return "En estructuración";
  if (level === "initial") return "Inicial";
  return "No indicada";
}

export function formatTicket(need: MarketplaceNeed) {
  if (need.fundingTicketMin == null && need.fundingTicketMax == null) return null;
  const currency = need.currency ?? "COP";
  const min = need.fundingTicketMin != null ? `${currency} ${need.fundingTicketMin.toLocaleString("en-US")}` : "";
  const max = need.fundingTicketMax != null ? `${currency} ${need.fundingTicketMax.toLocaleString("en-US")}` : "";
  if (min && max) return `${min} – ${max}`;
  return min || max;
}

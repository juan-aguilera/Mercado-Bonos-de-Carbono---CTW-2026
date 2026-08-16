import type { CompatibilityResult, PublicNeedCard, PublicProjectCard, StrongMatchNarrative } from "./types";

export const MATCH_DISCLAIMER =
  "Sugerencia informativa. No es recomendación, aprobación ni probabilidad de certificación.";

export function fallbackNarrative(
  project: PublicProjectCard,
  need: PublicNeedCard,
  compatibility: CompatibilityResult
): StrongMatchNarrative {
  const matched = compatibility.breakdown.filter((item) => item.matched).map((item) => item.criterion);
  const missing = compatibility.breakdown.filter((item) => !item.matched).map((item) => item.criterion);
  const whyStrong =
    matched.length > 0
      ? `${project.title} y la necesidad de ${need.organization} coinciden en ${matched.join(", ").toLowerCase()}. La compatibilidad de criterios es ${compatibility.label} (${compatibility.score}/100).`
      : `${project.title} y ${need.title} tienen una compatibilidad ${compatibility.label} (${compatibility.score}/100) según criterios declarados.`;

  const toValidate = [
    ...missing,
    ...(project.gaps ?? []).slice(0, 2),
  ].slice(0, 4);

  return {
    whyStrong,
    toValidate: toValidate.length > 0 ? toValidate : ["Confirmar vigencia y alcance de la necesidad con la contraparte."],
    sharePublic: ["Resumen público", "Ubicación general", "Perfil de preparación resumido"],
    shareOnRequest: need.requiredDocuments.length
      ? need.requiredDocuments
      : ["Diagnóstico geoespacial resumido", "Cronograma"],
    draftMessage:
      `Hola ${need.organization}: manifiesto interés no vinculante desde el proyecto "${project.title}" ` +
      `(${project.type ?? "iniciativa climática"} en ${project.location ?? "Colombia"}). ` +
      `La compatibilidad de criterios es ${compatibility.label} (${compatibility.score}/100). ` +
      `Puedo compartir el resumen público y el perfil de preparación. Esta nota no constituye oferta, reserva ni contrato.`,
  };
}

export function fallbackNarrativeForCompany(
  project: PublicProjectCard,
  need: PublicNeedCard,
  compatibility: CompatibilityResult
): StrongMatchNarrative {
  const matched = compatibility.breakdown.filter((item) => item.matched).map((item) => item.criterion);
  const missing = compatibility.breakdown.filter((item) => !item.matched).map((item) => item.criterion);
  const whyStrong =
    matched.length > 0
      ? `Tu necesidad y el proyecto "${project.title}" coinciden en ${matched.join(", ").toLowerCase()}. La compatibilidad de criterios es ${compatibility.label} (${compatibility.score}/100).`
      : `El proyecto "${project.title}" tiene una compatibilidad ${compatibility.label} (${compatibility.score}/100) con tu necesidad declarada.`;

  return {
    whyStrong,
    toValidate: (missing.length > 0 ? missing : ["Confirmar etapa, documentos y vigencia con el titular."]).slice(0, 4),
    sharePublic: ["Tipo de interés", "Volumen o ticket orientativo", "Ubicación buscada"],
    shareOnRequest: ["Criterios de evaluación", "Documentos mínimos requeridos"],
    draftMessage:
      `Hola, equipo de "${project.title}": somos ${need.organization} y publicamos la necesidad "${need.title}". ` +
      `Vemos compatibilidad ${compatibility.label} (${compatibility.score}/100) en criterios declarados. ` +
      `Nos interesa explorar un contacto no vinculante. Esta nota no constituye orden de compra, precio ni contrato.`,
  };
}

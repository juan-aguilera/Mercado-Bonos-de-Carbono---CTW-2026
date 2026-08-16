import type { TrustLabel as TrustLabelValue } from "@/lib/marketplace/types";

const VARIANTS: Record<TrustLabelValue, string> = {
  "Información declarada por el usuario": "bg-surface-container text-on-surface-variant",
  "Fuente oficial enlazada": "bg-primary-container/15 text-primary",
  "Resultado reportado en registro externo": "bg-primary-container/15 text-primary",
  "Documento compartido por el titular": "bg-secondary-container/40 text-on-surface",
  "En estructuración": "bg-tertiary-container/20 text-on-tertiary-fixed-variant",
  "En búsqueda de financiación": "bg-tertiary-container/20 text-on-tertiary-fixed-variant",
  "Requiere revisión técnica": "bg-tertiary-container/20 text-on-tertiary-fixed-variant",
  "Perfil demostrativo": "bg-surface-container-high text-on-surface-variant",
  "Respuesta simulada para demo": "bg-tertiary-container/20 text-on-tertiary-fixed-variant",
  "No constituye oferta vinculante": "bg-surface-container text-on-surface-variant",
  "No constituye oferta de valores": "bg-surface-container text-on-surface-variant",
  "Retirado / no disponible para nueva asignación": "bg-error-container text-on-error-container",
  "Necesidad activa": "bg-primary-container/15 text-primary",
  "Necesidad simulada para demo": "bg-tertiary-container/20 text-on-tertiary-fixed-variant",
  "Proyecto comunitario / Pequeño productor": "bg-secondary-container/40 text-on-surface",
};

export function TrustLabel({ label }: { label: TrustLabelValue }) {
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-body-sm leading-tight ${VARIANTS[label]}`}>
      {label}
    </span>
  );
}

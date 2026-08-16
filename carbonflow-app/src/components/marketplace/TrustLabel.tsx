import type { TrustLabel as TrustLabelValue } from "@/lib/marketplace/types";

const VARIANTS: Record<TrustLabelValue, string> = {
  "Información declarada por el usuario": "bg-surface-container text-on-surface-variant border-outline-variant",
  "Fuente oficial enlazada": "bg-primary-container/15 text-primary border-primary/20",
  "Resultado reportado en registro externo": "bg-primary-container/15 text-primary border-primary/20",
  "Documento compartido por el titular": "bg-secondary-container/40 text-on-surface border-outline-variant",
  "En estructuración": "bg-[#fff8e6] text-on-surface border-[#ffecb3]",
  "En búsqueda de financiación": "bg-[#fff8e6] text-on-surface border-[#ffecb3]",
  "Requiere revisión técnica": "bg-[#fff8e6] text-on-surface border-[#ffecb3]",
  "Perfil demostrativo": "bg-surface-container-high text-on-surface-variant border-outline-variant",
  "Respuesta simulada para demo": "bg-[#fff8e6] text-on-surface border-[#ffecb3]",
  "No constituye oferta vinculante": "bg-surface-container text-on-surface-variant border-outline-variant",
  "No constituye oferta de valores": "bg-surface-container text-on-surface-variant border-outline-variant",
  "Retirado / no disponible para nueva asignación": "bg-error-container text-on-error-container border-error/20",
  "Necesidad activa": "bg-primary-container/15 text-primary border-primary/20",
  "Necesidad simulada para demo": "bg-[#fff8e6] text-on-surface border-[#ffecb3]",
  "Proyecto comunitario / Pequeño productor": "bg-secondary-container/40 text-on-surface border-outline-variant",
};

export function TrustLabel({ label }: { label: TrustLabelValue }) {
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] leading-tight border ${VARIANTS[label]}`}>
      {label}
    </span>
  );
}

import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function ScopeCard() {
  return (
    <div className="rounded-lg bg-tertiary-fixed/40 border border-outline-variant p-6 md:p-7">
      <div className="flex items-center gap-2 mb-3">
        <MaterialIcon name="fact_check" className="text-on-tertiary-fixed-variant" />
        <span className="font-data text-label-caps uppercase tracking-wide text-on-tertiary-fixed-variant">
          Ficha de alcance — MVP hackathon
        </span>
      </div>
      <p className="text-disclaimer-italic text-on-surface-variant max-w-3xl">
        <strong className="text-on-surface not-italic">Aviso de alcance:</strong> todas las
        estimaciones son indicativas y no certificadas. Las respuestas de contraparte en
        marketplace son simuladas. El módulo de validación y registro y su chatbot ofrecen
        orientación informativa y no constituyen asesoría legal ni garantizan validación,
        registro o elegibilidad ante ningún estándar o autoridad.
      </p>
    </div>
  );
}

import type { ProjectReadiness } from "@/lib/marketplace/types";

export function ProjectReadinessProfile({
  readiness,
  onShare,
}: {
  readiness: ProjectReadiness;
  onShare?: () => void;
}) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 space-y-3">
      <h4 className="font-heading text-headline-sm text-primary">Perfil de preparación del proyecto</h4>
      <dl className="grid sm:grid-cols-2 gap-2 text-body-sm">
        <div>
          <dt className="font-data text-label-caps text-outline">Etapa</dt>
          <dd>{readiness.stage}</dd>
        </div>
        {readiness.validationScore != null && (
          <div>
            <dt className="font-data text-label-caps text-outline">Validación y Registro</dt>
            <dd>{readiness.validationScore}/100</dd>
          </div>
        )}
        <div>
          <dt className="font-data text-label-caps text-outline">Diagnóstico geoespacial</dt>
          <dd>{readiness.diagnosisAvailable ? "Disponible" : "Pendiente"}</dd>
        </div>
        <div>
          <dt className="font-data text-label-caps text-outline">Formulación</dt>
          <dd>{readiness.formulationPct}% completada</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-data text-label-caps text-outline">Trazabilidad</dt>
          <dd>{readiness.traceability}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-data text-label-caps text-outline">Documentos compartibles</dt>
          <dd>
            {readiness.shareableDocs.available} de {readiness.shareableDocs.total}
          </dd>
        </div>
      </dl>
      {readiness.gaps.length > 0 && (
        <div>
          <p className="font-data text-label-caps text-outline mb-1">Brechas prioritarias</p>
          <ul className="list-disc list-inside text-body-sm">
            {readiness.gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-disclaimer-italic text-on-surface-variant">Fuentes: {readiness.sources.join(", ")}</p>
      {onShare && (
        <button type="button" onClick={onShare} className="text-primary text-body-sm hover:underline">
          Compartir perfil
        </button>
      )}
    </div>
  );
}

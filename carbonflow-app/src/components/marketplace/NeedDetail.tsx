import { formatTicket, needCategoryLabel, preparationLevelLabel } from "@/lib/marketplace/needs";
import type { CompatibilityResult, MarketplaceNeed } from "@/lib/marketplace/types";
import { CompatibilityScoreCard } from "./CompatibilityScoreCard";
import { TrustLabel } from "./TrustLabel";

export function NeedDetail({
  need,
  compatibility,
  onClose,
  onRespond,
}: {
  need: MarketplaceNeed;
  compatibility?: CompatibilityResult | null;
  onClose: () => void;
  onRespond: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-xl"
      >
        <div className="flex justify-between gap-4">
          <div>
            <p className="font-data text-label-caps text-outline">{needCategoryLabel(need.category)}</p>
            <h3 className="font-heading text-headline-md text-primary">{need.title}</h3>
          </div>
          <button type="button" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <TrustLabel label="Necesidad activa" />
          {need.isSimulated && <TrustLabel label="Necesidad simulada para demo" />}
          <TrustLabel label="No constituye oferta vinculante" />
        </div>
        <p className="text-body-sm">{need.summary}</p>
        <dl className="grid sm:grid-cols-2 gap-3 text-body-sm">
          <div>
            <dt className="font-data text-label-caps text-outline">Organización</dt>
            <dd>
              {need.organization} · {need.actorType}
            </dd>
          </div>
          <div>
            <dt className="font-data text-label-caps text-outline">Tipo de necesidad</dt>
            <dd>{need.needType}</dd>
          </div>
          <div>
            <dt className="font-data text-label-caps text-outline">Criterios requeridos</dt>
            <dd>
              {need.projectTypes.join(", ")} · {preparationLevelLabel(need.minimumPreparationLevel)} ·{" "}
              {need.locationScope.join(", ")}
            </dd>
          </div>
          {formatTicket(need) && (
            <div>
              <dt className="font-data text-label-caps text-outline">Ticket orientativo</dt>
              <dd>{formatTicket(need)}</dd>
            </div>
          )}
          {need.volumeHint && (
            <div>
              <dt className="font-data text-label-caps text-outline">Volumen orientativo</dt>
              <dd>{need.volumeHint}</dd>
            </div>
          )}
          <div>
            <dt className="font-data text-label-caps text-outline">Documentos solicitados</dt>
            <dd>{need.requiredDocuments.join(", ") || "No indicados"}</dd>
          </div>
          {need.targetDate && (
            <div>
              <dt className="font-data text-label-caps text-outline">Fecha objetivo</dt>
              <dd>{need.targetDate}</dd>
            </div>
          )}
          <div>
            <dt className="font-data text-label-caps text-outline">Estado</dt>
            <dd>Publicado</dd>
          </div>
        </dl>
        {compatibility && <CompatibilityScoreCard result={compatibility} />}
        <p className="text-disclaimer-italic text-on-surface-variant">
          Esta necesidad es informativa y no constituye una oferta vinculante, una aprobación, una contratación ni un
          compromiso de compra o financiación.
        </p>
        <button type="button" onClick={onRespond} className="w-full rounded-lg bg-forest-deep text-on-primary py-2.5">
          Manifestar interés
        </button>
      </div>
    </div>
  );
}

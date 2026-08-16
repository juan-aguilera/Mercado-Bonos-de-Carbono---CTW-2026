import { formatTicket, needCategoryLabel, preparationLevelLabel } from "@/lib/marketplace/needs";
import type { CompatibilityResult, MarketplaceNeed } from "@/lib/marketplace/types";
import { CompatibilityScoreCard } from "./CompatibilityScoreCard";
import { TrustLabel } from "./TrustLabel";

export function NeedCard({
  need,
  compatibility,
  onOpen,
  onRespond,
}: {
  need: MarketplaceNeed;
  compatibility?: CompatibilityResult | null;
  onOpen: () => void;
  onRespond: () => void;
}) {
  return (
    <article className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 space-y-3 shadow-sm">
      <div className="flex flex-wrap gap-1.5">
        <TrustLabel label="Necesidad activa" />
        {need.isSimulated && <TrustLabel label="Necesidad simulada para demo" />}
      </div>
      <p className="font-data text-label-caps text-outline">{needCategoryLabel(need.category)}</p>
      <h3 className="font-heading text-headline-sm text-primary">{need.title}</h3>
      <p className="text-body-sm text-on-surface-variant">
        Publica: {need.organization} ({need.actorType}
        {need.isSimulated ? ", perfil demostrativo" : ""})
      </p>
      <ul className="text-body-sm text-on-surface-variant space-y-1">
        <li>Tipo: {need.projectTypes.join(", ") || "No indicado"}</li>
        <li>Etapa mínima: {preparationLevelLabel(need.minimumPreparationLevel)}</li>
        <li>Ubicación: {need.locationScope.join(", ")}</li>
        {need.resourceUses && <li>Uso de recursos: {need.resourceUses.join(", ")}</li>}
        {formatTicket(need) && <li>Ticket orientativo: {formatTicket(need)}</li>}
        {need.volumeHint && <li>Volumen orientativo: {need.volumeHint}</li>}
        {need.cobenefits.length > 0 && <li>Co-beneficios: {need.cobenefits.join(", ")}</li>}
      </ul>
      {compatibility && <CompatibilityScoreCard result={compatibility} compact />}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={onOpen} className="rounded-md border border-outline-variant py-2 text-body-sm">
          Ver necesidad
        </button>
        <button type="button" onClick={onRespond} className="rounded-md bg-earth-sandy text-primary font-semibold py-2 text-body-sm">
          Manifestar interés
        </button>
      </div>
    </article>
  );
}

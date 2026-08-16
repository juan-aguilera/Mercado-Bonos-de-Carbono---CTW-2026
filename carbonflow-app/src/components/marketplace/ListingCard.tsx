import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { formatNumber } from "@/lib/format";
import type { MarketplaceListing } from "@/lib/marketplace/types";
import { CommunityProjectBadge } from "./CommunityProjectBadge";
import { ListingStatusBadge } from "./ListingStatusBadge";
import { TrustLabel } from "./TrustLabel";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function ListingCard({
  listing,
  onOpen,
  onPrimary,
  primaryLabel,
  primaryDisabled,
  compared,
  onToggleCompare,
}: {
  listing: MarketplaceListing;
  onOpen: () => void;
  onPrimary: () => void;
  primaryLabel: string;
  primaryDisabled?: boolean;
  compared?: boolean;
  onToggleCompare?: () => void;
}) {
  const isOrg =
    listing.kind.includes("profile") ||
    listing.kind === "green_finance_provider" ||
    listing.kind === "carbon_buyer_demand";

  return (
    <article className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col hover:bg-surface-container-low transition-colors">
      <div className="h-28 w-full bg-gradient-to-br from-primary-container to-primary-container relative flex items-center justify-center">
        {isOrg ? (
          <span className="w-14 h-14 rounded-full bg-surface/90 text-primary font-heading text-headline-sm flex items-center justify-center">
            {initials(listing.organization ?? listing.title)}
          </span>
        ) : (
          <MaterialIcon name="forest" className="text-primary-fixed-dim text-5xl" />
        )}
        {listing.demo && (
          <span className="absolute top-3 left-3 bg-surface/90 px-2 py-1 rounded-md text-[11px] text-on-surface-variant">
            Perfil demostrativo
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="space-y-1">
          <h3 className="font-heading text-headline-sm text-primary line-clamp-2">{listing.title}</h3>
          {listing.entityType && (
            <p className="text-body-sm text-on-surface-variant">Tipo: {listing.entityType}</p>
          )}
          {listing.initiativeType && (
            <p className="text-body-sm text-on-surface-variant">Tipo: {listing.initiativeType}</p>
          )}
          {(listing.location || listing.coverage) && (
            <p className="text-body-sm text-on-surface-variant">
              {listing.location ?? listing.coverage}
            </p>
          )}
        </div>

        {listing.projectStatus && <ListingStatusBadge status={listing.projectStatus} />}
        {listing.reportedStatus && <ListingStatusBadge status={listing.reportedStatus} />}

        <div className="text-body-sm text-on-surface-variant space-y-1">
          {listing.services && <p>Servicios: {listing.services.join(" · ")}</p>}
          {listing.sectors && <p>Sectores: {listing.sectors.join(" · ")}</p>}
          {listing.areaHa != null && <p>Área: {formatNumber(listing.areaHa, 0)} ha</p>}
          {listing.co2eEstimate != null && (
            <p>
              CO2e: {formatNumber(listing.co2eEstimate)} t — {listing.co2eDisclaimer ?? "estimación indicativa, no certificada"}
            </p>
          )}
          {listing.tonsNeeded != null && (
            <p>Toneladas a compensar: {formatNumber(listing.tonsNeeded)} tCO2e</p>
          )}
          {listing.budgetAmount && (
            <p>
              Presupuesto orientativo: {listing.budgetCurrency} {listing.budgetAmount}
            </p>
          )}
          {listing.need && <p>Necesidad: {listing.need}</p>}
          {listing.registry && listing.externalId && (
            <p>
              Fuente: {listing.registry} · ID: {listing.externalId}
            </p>
          )}
          {listing.indicativeAmount && (
            <p>
              Monto orientativo: {listing.currency} {listing.indicativeAmount}
            </p>
          )}
          {listing.instruments && <p>Instrumentos: {listing.instruments.join(" · ")}</p>}
          {listing.ticketRange && <p>Ticket orientativo: {listing.ticketRange}</p>}
          {listing.accreditation && <p>Acreditación: {listing.accreditation}</p>}
        </div>

        {(listing.holderType === "Comunidad" ||
          listing.holderType === "Pequeño productor" ||
          listing.holderType === "Asociación" ||
          listing.holderType === "Cooperativa") && <CommunityProjectBadge />}
        <div className="flex flex-wrap gap-1.5">
          {listing.trustLabels.slice(0, 3).map((label) => (
            <TrustLabel key={label} label={label} />
          ))}
        </div>
        {onToggleCompare && (
          <label className="flex items-center gap-2 text-body-sm text-on-surface-variant">
            <input type="checkbox" checked={compared} onChange={onToggleCompare} />
            Comparar
          </label>
        )}

        <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={onOpen}
            className="rounded-md border border-outline-variant py-2 text-body-sm hover:bg-surface-container-low"
          >
            {listing.kind.includes("project") || listing.kind.includes("credit") || listing.kind.includes("result")
              ? "Ver ficha"
              : "Ver perfil"}
          </button>
          <button
            type="button"
            onClick={onPrimary}
            disabled={primaryDisabled}
            className="rounded-md bg-tertiary-fixed text-primary font-semibold py-2 text-body-sm disabled:opacity-40"
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </article>
  );
}

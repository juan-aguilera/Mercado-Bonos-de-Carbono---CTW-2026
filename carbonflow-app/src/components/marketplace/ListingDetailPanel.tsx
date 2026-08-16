import { formatNumber } from "@/lib/format";
import type { MarketplaceListing } from "@/lib/marketplace/types";
import { readinessForListing } from "@/lib/marketplace/readiness";
import { CommunityProjectBadge } from "./CommunityProjectBadge";
import { DataRoomAccessPanel } from "./DataRoomAccessPanel";
import { ListingStatusBadge } from "./ListingStatusBadge";
import { ProjectReadinessProfile } from "./ProjectReadinessProfile";
import { TrustLabel } from "./TrustLabel";

function noticeFor(listing: MarketplaceListing) {
  if (listing.tab === "ovv") {
    return "CarbonFlow no acredita, recomienda ni garantiza a esta organización. El titular debe verificar directamente la vigencia, el alcance de acreditación, la independencia y la idoneidad de la entidad antes de contratarla.";
  }
  if (listing.kind === "carbon_project_development") {
    return "Este proyecto está en estructuración. No representa créditos emitidos, disponibles para compra, ni una oferta vinculante. Las estimaciones son preliminares y requieren validación/verificación independiente según la ruta aplicable.";
  }
  if (listing.kind === "reported_retired_credit") {
    return "Este resultado está reportado como retirado. No está disponible para nueva asignación comercial. CarbonFlow no ejecuta transferencias ni retiros.";
  }
  if (listing.kind === "reported_carbon_result") {
    return "Resultado reportado en una fuente externa. No constituye oferta vinculante, disponibilidad verificada por CarbonFlow ni recomendación de compra.";
  }
  if (listing.kind === "carbon_buyer_demand") {
    return "Esta empresa declara una necesidad de compensación. No constituye orden de compra, precio vinculante ni compromiso de transacción. CarbonFlow solo facilita el contacto.";
  }
  return "CarbonFlow facilita conexiones y solicitudes de información. No ejecuta transacciones, pagos, certificaciones ni recomendaciones de inversión.";
}

export function ListingDetailPanel({
  listing,
  onClose,
  onPrimary,
  primaryLabel,
  primaryDisabled,
}: {
  listing: MarketplaceListing;
  onClose: () => void;
  onPrimary: () => void;
  primaryLabel: string;
  primaryDisabled?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 ambient-shadow"
      >
        <div className="flex justify-between gap-4">
          <div>
            <h3 className="font-heading text-headline-md text-primary">{listing.title}</h3>
            {listing.entityType && <p className="text-body-sm text-on-surface-variant">{listing.entityType}</p>}
          </div>
          <button type="button" onClick={onClose} className="text-on-surface-variant">
            Cerrar
          </button>
        </div>

        <p className="text-body-sm text-on-surface">{listing.description}</p>
        {(listing.projectStatus || listing.reportedStatus) && (
          <ListingStatusBadge status={listing.projectStatus ?? listing.reportedStatus ?? ""} />
        )}

        <dl className="grid sm:grid-cols-2 gap-3 text-body-sm">
          {listing.location && (
            <div>
              <dt className="font-data text-label-caps text-outline">Ubicación general</dt>
              <dd>{listing.location}</dd>
            </div>
          )}
          {listing.coverage && (
            <div>
              <dt className="font-data text-label-caps text-outline">Cobertura</dt>
              <dd>{listing.coverage}</dd>
            </div>
          )}
          {listing.services && (
            <div>
              <dt className="font-data text-label-caps text-outline">Servicios</dt>
              <dd>{listing.services.join(", ")}</dd>
            </div>
          )}
          {listing.sectors && (
            <div>
              <dt className="font-data text-label-caps text-outline">Sectores</dt>
              <dd>{listing.sectors.join(", ")}</dd>
            </div>
          )}
          {listing.languages && (
            <div>
              <dt className="font-data text-label-caps text-outline">Idiomas</dt>
              <dd>{listing.languages.join(", ")}</dd>
            </div>
          )}
          {listing.modality && (
            <div>
              <dt className="font-data text-label-caps text-outline">Modalidad</dt>
              <dd>{listing.modality}</dd>
            </div>
          )}
          {listing.accreditation && (
            <div className="sm:col-span-2">
              <dt className="font-data text-label-caps text-outline">Acreditación declarada</dt>
              <dd>
                {listing.accreditation}
                {listing.accreditor ? ` · ${listing.accreditor}` : ""}
                {listing.accreditationScope ? ` · ${listing.accreditationScope}` : ""}
                {listing.accreditationValidUntil ? ` · vigencia ${listing.accreditationValidUntil}` : ""}
              </dd>
            </div>
          )}
          {listing.areaHa != null && (
            <div>
              <dt className="font-data text-label-caps text-outline">Área</dt>
              <dd>{formatNumber(listing.areaHa, 0)} ha</dd>
            </div>
          )}
          {listing.co2eEstimate != null && (
            <div>
              <dt className="font-data text-label-caps text-outline">CO2e indicativa</dt>
              <dd>
                {formatNumber(listing.co2eEstimate)} t — {listing.co2eDisclaimer ?? "no certificada"}
              </dd>
            </div>
          )}
          {listing.tonsNeeded != null && (
            <div>
              <dt className="font-data text-label-caps text-outline">Toneladas a compensar</dt>
              <dd>{formatNumber(listing.tonsNeeded)} tCO2e</dd>
            </div>
          )}
          {listing.budgetAmount && (
            <div>
              <dt className="font-data text-label-caps text-outline">Presupuesto orientativo</dt>
              <dd>
                {listing.budgetCurrency} {listing.budgetAmount}
              </dd>
            </div>
          )}
          {listing.need && (
            <div className="sm:col-span-2">
              <dt className="font-data text-label-caps text-outline">Necesidad</dt>
              <dd>{listing.need}</dd>
            </div>
          )}
          {listing.registry && (
            <div>
              <dt className="font-data text-label-caps text-outline">Fuente / ID</dt>
              <dd>
                {listing.registry} · {listing.externalId}
              </dd>
            </div>
          )}
          {listing.consultedAt && (
            <div>
              <dt className="font-data text-label-caps text-outline">Última consulta</dt>
              <dd>{listing.consultedAt}</dd>
            </div>
          )}
          {listing.indicativeAmount && (
            <div>
              <dt className="font-data text-label-caps text-outline">Monto orientativo</dt>
              <dd>
                {listing.currency} {listing.indicativeAmount}
              </dd>
            </div>
          )}
          {listing.resourceUses && (
            <div className="sm:col-span-2">
              <dt className="font-data text-label-caps text-outline">Uso previsto de recursos</dt>
              <dd>
                <ul className="list-disc list-inside">
                  {listing.resourceUses.map((use) => (
                    <li key={use}>{use}</li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
          {listing.instruments && (
            <div>
              <dt className="font-data text-label-caps text-outline">Instrumentos</dt>
              <dd>{listing.instruments.join(", ")}</dd>
            </div>
          )}
          {listing.ticketRange && (
            <div>
              <dt className="font-data text-label-caps text-outline">Ticket orientativo</dt>
              <dd>{listing.ticketRange}</dd>
            </div>
          )}
          {listing.evaluationCriteria && (
            <div className="sm:col-span-2">
              <dt className="font-data text-label-caps text-outline">Criterios declarados</dt>
              <dd>{listing.evaluationCriteria}</dd>
            </div>
          )}
          <div>
            <dt className="font-data text-label-caps text-outline">Última actualización</dt>
            <dd>{listing.updatedAt}</dd>
          </div>
        </dl>

        {listing.officialUrl && (
          <a href={listing.officialUrl} target="_blank" rel="noreferrer" className="text-primary text-body-sm hover:underline">
            Ver fuente oficial
          </a>
        )}

        <div className="flex flex-wrap gap-1.5">
          {listing.trustLabels.map((label) => (
            <TrustLabel key={label} label={label} />
          ))}
        </div>

        {(listing.holderType === "Comunidad" || listing.holderType === "Pequeño productor") && (
          <CommunityProjectBadge />
        )}
        {(listing.kind === "green_finance_project" || listing.kind === "carbon_project_development") && (
          <>
            <ProjectReadinessProfile readiness={readinessForListing(listing)} />
            <DataRoomAccessPanel listing={listing} />
          </>
        )}

        <p className="text-disclaimer-italic text-on-surface-variant">{noticeFor(listing)}</p>
        <p className="text-disclaimer-italic text-on-surface-variant">
          El contacto directo permanece oculto. Usa el formulario interno para el primer contacto.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrimary}
            disabled={primaryDisabled}
            className="flex-1 rounded-lg bg-primary-container text-on-primary py-2.5 font-medium disabled:opacity-40"
          >
            {primaryLabel}
          </button>
          <button type="button" onClick={onClose} className="rounded-lg border border-outline-variant px-4">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

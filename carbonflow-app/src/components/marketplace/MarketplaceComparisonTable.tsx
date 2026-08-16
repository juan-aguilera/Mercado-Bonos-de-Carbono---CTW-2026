import { readinessForListing } from "@/lib/marketplace/readiness";
import type { MarketplaceListing, MarketplaceTab } from "@/lib/marketplace/types";

export function MarketplaceComparisonTable({
  listings,
  tab,
  onClear,
}: {
  listings: MarketplaceListing[];
  tab: MarketplaceTab;
  onClear: () => void;
}) {
  if (listings.length < 2) return null;

  const rows =
    tab === "ovv"
      ? [
          ["Servicios declarados", (l: MarketplaceListing) => l.services?.join(", ") ?? "—"],
          ["Acreditación declarada", (l: MarketplaceListing) => l.accreditation ?? "—"],
          ["Tipos de iniciativa", (l: MarketplaceListing) => l.sectors?.join(", ") ?? "—"],
          ["Cobertura", (l: MarketplaceListing) => l.coverage ?? "—"],
          ["Modalidad", (l: MarketplaceListing) => l.modality ?? "—"],
          ["Idiomas", (l: MarketplaceListing) => l.languages?.join(", ") ?? "—"],
          ["Última actualización", (l: MarketplaceListing) => l.updatedAt],
        ]
      : tab === "finance"
        ? [
            ["Categoría ambiental", (l: MarketplaceListing) => l.environmentalCategory ?? l.initiativeType ?? "—"],
            ["Etapa", (l: MarketplaceListing) => l.projectStage ?? l.projectStatus ?? "—"],
            ["Uso de recursos", (l: MarketplaceListing) => l.resourceUses?.join(", ") ?? "—"],
            ["Monto orientativo", (l: MarketplaceListing) => l.indicativeAmount ?? l.ticketRange ?? "—"],
            ["Tipo de financiación", (l: MarketplaceListing) => l.financeTypes?.join(", ") ?? l.instruments?.join(", ") ?? "—"],
            ["Brechas", (l: MarketplaceListing) => readinessForListing(l).gaps.join("; ") || "—"],
          ]
        : [
            ["Tipo de proyecto", (l: MarketplaceListing) => l.initiativeType ?? "—"],
            ["Ubicación general", (l: MarketplaceListing) => l.location ?? "—"],
            ["Etapa", (l: MarketplaceListing) => readinessForListing(l).stage],
            ["Preparación", (l: MarketplaceListing) => `${readinessForListing(l).validationScore ?? "—"}/100`],
            ["Área", (l: MarketplaceListing) => (l.areaHa != null ? `${l.areaHa} ha` : "—")],
            ["Trazabilidad", (l: MarketplaceListing) => l.renareRef ?? readinessForListing(l).traceability],
            ["Necesidad", (l: MarketplaceListing) => l.need ?? "—"],
            ["Co-beneficios", (l: MarketplaceListing) => l.cobenefits?.join(", ") ?? "—"],
            ["Documentos compartibles", (l: MarketplaceListing) => `${readinessForListing(l).shareableDocs.available}`],
            ["Brechas", (l: MarketplaceListing) => readinessForListing(l).gaps.join("; ") || "—"],
          ];

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 space-y-3 overflow-x-auto">
      <div className="flex justify-between gap-3">
        <h3 className="font-heading text-headline-sm">Comparar perfiles</h3>
        <button type="button" onClick={onClear} className="text-body-sm text-primary">
          Limpiar comparación
        </button>
      </div>
      <p className="text-disclaimer-italic text-on-surface-variant">
        Comparación informativa. CarbonFlow no recomienda ni califica perfiles.
      </p>
      <table className="w-full text-body-sm">
        <thead>
          <tr>
            <th className="text-left p-2">Criterio</th>
            {listings.map((listing) => (
              <th key={listing.id} className="text-left p-2">
                {listing.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, getter]) => (
            <tr key={String(label)} className="border-t border-outline-variant">
              <td className="p-2 font-medium">{label as string}</td>
              {listings.map((listing) => (
                <td key={listing.id} className="p-2">
                  {(getter as (l: MarketplaceListing) => string)(listing)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

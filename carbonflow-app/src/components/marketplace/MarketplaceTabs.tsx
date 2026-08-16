import type { MarketplaceTab } from "@/lib/marketplace/types";

const TABS: { id: MarketplaceTab; label: string }[] = [
  { id: "ovv", label: "Validación y Verificación" },
  { id: "carbon", label: "Créditos de Carbono" },
  { id: "finance", label: "Financiación Verde" },
];

export function MarketplaceTabs({
  value,
  onChange,
}: {
  value: MarketplaceTab;
  onChange: (tab: MarketplaceTab) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categorías del Marketplace">
      {TABS.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2 rounded-lg text-body-sm font-medium transition-colors ${
              active
                ? "bg-forest-deep text-on-primary"
                : "bg-surface-container-low text-on-surface-variant hover:text-primary border border-outline-variant"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

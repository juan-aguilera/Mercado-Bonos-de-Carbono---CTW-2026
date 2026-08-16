import type { MarketplaceMode } from "@/lib/marketplace/types";

const MODES: { id: MarketplaceMode; label: string }[] = [
  { id: "offer", label: "Explorar oferta" },
  { id: "needs", label: "Necesidades activas" },
  { id: "publish-need", label: "Publicar necesidad" },
];

export function MarketplaceModeTabs({
  value,
  onChange,
}: {
  value: MarketplaceMode;
  onChange: (mode: MarketplaceMode) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Modo del Marketplace">
      {MODES.map((mode) => {
        const active = value === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(mode.id)}
            className={`px-4 py-2 rounded-lg text-body-sm ${
              active ? "bg-primary text-on-primary" : "border border-outline-variant text-on-surface-variant"
            }`}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}

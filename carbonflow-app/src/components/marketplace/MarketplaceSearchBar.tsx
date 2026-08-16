import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function MarketplaceSearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar por nombre, organización, tipo, ubicación o palabra clave"
        className="w-full pl-11 pr-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-sm"
      />
    </div>
  );
}

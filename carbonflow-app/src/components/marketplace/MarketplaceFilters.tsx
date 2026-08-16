import type { ReactNode } from "react";

export function MarketplaceFilters({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 space-y-4">
        <h2 className="font-heading text-headline-sm text-primary">{title ?? "Filtros"}</h2>
        {children}
      </div>
    </aside>
  );
}

export function FilterField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-data text-label-caps text-on-surface-variant">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface-container-low border border-outline-variant rounded-md px-3 py-2 text-body-sm"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

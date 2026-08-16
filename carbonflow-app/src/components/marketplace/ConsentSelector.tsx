export function ConsentSelector({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 text-body-sm text-on-surface">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1" />
      <span>
        Autorizo a CarbonFlow a compartir la información seleccionada y mis datos de contacto con la
        organización receptora, exclusivamente para atender esta solicitud.
      </span>
    </label>
  );
}

export function SharedInfoSelector({
  options,
  selected,
  onToggle,
}: {
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="font-data text-label-caps text-on-surface-variant">Información que autorizo compartir</legend>
      {options.map((option) => (
        <label key={option.id} className="flex items-center gap-2 text-body-sm">
          <input
            type="checkbox"
            checked={selected.includes(option.id)}
            onChange={() => onToggle(option.id)}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}

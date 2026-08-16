const SOURCES = [
  { name: "Global Forest Watch", detail: "cobertura y alertas de deforestación" },
  { name: "RUNAP", detail: "áreas protegidas — Parques Nacionales" },
  { name: "Nominatim / OSM", detail: "geocodificación de predios" },
];

export function LiveSourcesStrip() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      {SOURCES.map((s) => (
        <div key={s.name} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary-fixed-dim shrink-0" />
          <span className="font-data text-body-sm text-on-primary/70">
            <span className="text-on-primary font-medium">{s.name}</span> · {s.detail}
          </span>
        </div>
      ))}
    </div>
  );
}

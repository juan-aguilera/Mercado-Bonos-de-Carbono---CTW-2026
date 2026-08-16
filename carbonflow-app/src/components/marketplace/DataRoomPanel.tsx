import type { DataRoomItem } from "@/lib/marketplace/types";

export function DataRoomPanel({ items }: { items?: DataRoomItem[] }) {
  const shared = items?.filter((item) => item.shared) ?? [];
  if (shared.length === 0) {
    return (
      <p className="text-body-sm text-on-surface-variant">
        Este perfil no tiene documentos públicos disponibles. Puedes solicitar información al titular
        mediante el formulario de contacto.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="font-data text-label-caps text-on-surface-variant">
        Data room · {shared.length} documentos compartidos
      </p>
      <ul className="space-y-1">
        {shared.map((item) => (
          <li key={item.id} className="text-body-sm text-on-surface">
            {item.name}
          </li>
        ))}
      </ul>
      <p className="text-disclaimer-italic text-on-surface-variant">
        La información compartida es preliminar y no sustituye debida diligencia financiera, jurídica,
        técnica ni ambiental.
      </p>
    </div>
  );
}

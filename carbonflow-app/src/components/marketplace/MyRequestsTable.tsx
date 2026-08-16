import type { MarketplaceRequest } from "@/lib/marketplace/types";
import { SimulatedResponsePanel } from "./SimulatedResponsePanel";

export function MyRequestsTable({
  requests,
  selectedId,
  onSelect,
}: {
  requests: MarketplaceRequest[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  if (requests.length === 0) {
    return (
      <p className="text-body-sm text-on-surface-variant">
        Aún no has enviado solicitudes. Explora una categoría y usa el formulario de contacto.
      </p>
    );
  }

  const selected = requests.find((r) => r.id === selectedId);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border border-outline-variant rounded-lg">
        <table className="w-full text-body-sm">
          <thead className="bg-surface-container-low text-left">
            <tr>
              <th className="p-3">Categoría</th>
              <th className="p-3">Proyecto/perfil</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Tipo de interés</th>
              <th className="p-3">Estado</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-t border-outline-variant">
                <td className="p-3">{request.category}</td>
                <td className="p-3">{request.listingTitle}</td>
                <td className="p-3">{new Date(request.createdAt).toLocaleDateString("es-CO")}</td>
                <td className="p-3">{request.requestType}</td>
                <td className="p-3">{request.status}</td>
                <td className="p-3">
                  <button type="button" className="text-primary hover:underline" onClick={() => onSelect(request.id)}>
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className="rounded-lg border border-outline-variant p-4 space-y-3">
          <div className="flex justify-between">
            <h3 className="font-heading text-headline-sm">{selected.listingTitle}</h3>
            <button type="button" onClick={() => onSelect(null)} className="text-body-sm">
              Cerrar
            </button>
          </div>
          <p className="text-body-sm text-on-surface-variant">{selected.message}</p>
          {selected.simulatedResponse && <SimulatedResponsePanel message={selected.simulatedResponse} />}
        </div>
      )}
    </div>
  );
}

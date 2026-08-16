import type { MarketplaceListing } from "@/lib/marketplace/types";

export function DataRoomAccessPanel({
  listing,
  onRequestAccess,
}: {
  listing: MarketplaceListing;
  onRequestAccess?: () => void;
}) {
  const levels = listing.dataRoomLevels ?? {
    public: listing.dataRoom?.filter((item) => item.shared) ?? [],
    request: listing.dataRoom?.filter((item) => !item.shared) ?? [],
    confidential: [],
  };

  return (
    <div className="space-y-3">
      <h4 className="font-heading text-headline-sm">Data room</h4>
      <div className="space-y-2 text-body-sm">
        <p>Público — {levels.public.length} elementos disponibles</p>
        <p>Bajo solicitud — {levels.request.length} elementos disponibles</p>
        <p>Confidencial — Solicitar acceso al titular</p>
      </div>
      {levels.public.length === 0 && levels.request.length === 0 && (
        <p className="text-body-sm text-on-surface-variant">
          Este perfil no tiene documentos públicos disponibles. Puedes solicitar información al titular mediante el
          formulario de contacto.
        </p>
      )}
      <p className="text-disclaimer-italic text-on-surface-variant">
        Coordenadas exactas, soportes de tenencia y datos personales permanecen privados por defecto.
      </p>
      {onRequestAccess && (
        <button type="button" onClick={onRequestAccess} className="rounded-md border border-outline-variant px-3 py-2 text-body-sm">
          Solicitar acceso
        </button>
      )}
    </div>
  );
}

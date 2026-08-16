"use client";

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { MapContainer, TileLayer, Polygon as LeafletPolygon, useMap, useMapEvents } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import type { Polygon } from "geojson";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

interface MapDrawProps {
  onGeometryChange: (geometry: Polygon | null) => void;
  onStatusChange?: (status: { vertices: number; closed: boolean }) => void;
}

const COLOMBIA_CENTER: [number, number] = [4.5709, -74.2973];

const BASEMAPS = {
  normal: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satelite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
  },
} as const;

type Basemap = keyof typeof BASEMAPS;

function MapRef({ mapRef }: { mapRef: MutableRefObject<LeafletMap | null> }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
}

function ClickCapture({ onClick }: { onClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function pointsToPolygon(points: [number, number][]): Polygon | null {
  if (points.length < 3) return null;
  const ring = points.map(([lat, lon]) => [lon, lat]);
  ring.push(ring[0]);
  return { type: "Polygon", coordinates: [ring] };
}

export function MapDraw({ onGeometryChange, onStatusChange }: MapDrawProps) {
  const [points, setPoints] = useState<[number, number][]>([]);
  const [closed, setClosed] = useState(false);
  const [basemap, setBasemap] = useState<Basemap>("normal");
  const [showDrawHint, setShowDrawHint] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    onStatusChange?.({ vertices: points.length, closed });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.length, closed]);

  const addPoint = useCallback(
    (lat: number, lon: number) => {
      if (closed) return;
      setPoints((prev) => [...prev, [lat, lon]]);
    },
    [closed]
  );

  const closePolygon = () => {
    if (points.length < 3) return;
    setClosed(true);
    onGeometryChange(pointsToPolygon(points));
  };

  const zoomToPolygon = () => {
    if (points.length === 0 || !mapRef.current) return;
    mapRef.current.fitBounds(points, { padding: [48, 48], maxZoom: 16 });
  };

  const reset = () => {
    setPoints([]);
    setClosed(false);
    onGeometryChange(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const geometry: Polygon | undefined =
        json.type === "Polygon"
          ? json
          : json.type === "Feature" && json.geometry?.type === "Polygon"
          ? json.geometry
          : json.type === "FeatureCollection" && json.features?.[0]?.geometry?.type === "Polygon"
          ? json.features[0].geometry
          : undefined;

      if (!geometry) {
        alert("El archivo debe contener un GeoJSON de tipo Polygon.");
        return;
      }
      const ring: [number, number][] = geometry.coordinates[0].map(
        (pos) => [pos[1], pos[0]] as [number, number]
      );
      setPoints(ring.slice(0, -1));
      setClosed(true);
      onGeometryChange(geometry);
    } catch {
      alert("No se pudo leer el archivo. Debe ser un GeoJSON válido.");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const readyToClose = points.length >= 3 && !closed;

  return (
    <div className="flex flex-col h-full w-full">
      {showDrawHint && (
        <div
          role="note"
          className="shrink-0 z-[1000] border-b border-outline-variant bg-primary-container text-on-primary px-4 py-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-heading text-body-md font-medium mb-2">Dibuja el predio en 3 pasos</p>
              <ol className="grid gap-2 sm:grid-cols-3 text-body-sm">
                <li className="flex gap-2">
                  <span className="font-data text-label-caps shrink-0 mt-0.5">1</span>
                  <span>
                    Acércate al predio: arrastra el mapa y usa la rueda del mouse. A la derecha, el ícono de satélite
                    muestra el bosque.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-data text-label-caps shrink-0 mt-0.5">2</span>
                  <span>
                    Haz clic en cada esquina del linde, en orden. Mínimo 3 clics. El área se pinta de verde.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-data text-label-caps shrink-0 mt-0.5">3</span>
                  <span>
                    Con el área verde lista, pulsa el botón{" "}
                    <MaterialIcon name="check_circle" className="text-[18px] align-middle" />{" "}
                    <strong className="font-medium">Cerrar polígono</strong> a la derecha. Sin eso no hay diagnóstico.
                  </span>
                </li>
              </ol>
            </div>
            <button
              type="button"
              onClick={() => setShowDrawHint(false)}
              aria-label="Cerrar nota"
              className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-on-primary/80 hover:text-on-primary hover:bg-primary transition-colors"
            >
              <MaterialIcon name="close" />
            </button>
          </div>
        </div>
      )}

      <div className="relative flex-1 min-h-0">
        <MapContainer center={COLOMBIA_CENTER} zoom={6} scrollWheelZoom className="h-full w-full">
          <MapRef mapRef={mapRef} />
          <TileLayer key={basemap} attribution={BASEMAPS[basemap].attribution} url={BASEMAPS[basemap].url} />
          <ClickCapture onClick={addPoint} />
          {points.length > 0 && (
            <LeafletPolygon
              positions={points}
              pathOptions={{ color: "#006D36", weight: 2, lineJoin: "round", fillColor: "#006D36", fillOpacity: 0.25 }}
            />
          )}
        </MapContainer>

        {/* Map Controls Overlay — replica del patrón "vertical stack of square buttons" del design system */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
          <button
            type="button"
            onClick={() => setBasemap((b) => (b === "normal" ? "satelite" : "normal"))}
            title={basemap === "normal" ? "Ver satelital" : "Ver normal"}
            className="w-10 h-10 bg-surface-container-lowest border border-outline-variant rounded-md flex items-center justify-center text-on-surface hover:text-primary hover:bg-surface-container-low transition-colors"
          >
            <MaterialIcon name={basemap === "normal" ? "satellite_alt" : "map"} />
          </button>
          <button
            type="button"
            onClick={zoomToPolygon}
            disabled={points.length === 0}
            title="Centrar en polígono"
            className="w-10 h-10 bg-surface-container-lowest border border-outline-variant rounded-md flex items-center justify-center text-on-surface hover:text-primary hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:hover:text-on-surface"
          >
            <MaterialIcon name="my_location" />
          </button>
          <div className="relative">
            {readyToClose && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-secondary text-on-secondary text-body-sm font-medium px-3 py-1.5 shadow-sm pointer-events-none">
                Clic aquí para cerrar el polígono
              </div>
            )}
            <button
              type="button"
              onClick={closePolygon}
              disabled={!readyToClose}
              title="Cerrar polígono"
              aria-label="Cerrar polígono"
              className={`w-10 h-10 border rounded-md flex items-center justify-center transition-colors ${
                readyToClose
                  ? "bg-secondary text-on-secondary border-secondary hover:bg-primary"
                  : "bg-surface-container-lowest border-outline-variant text-on-surface hover:text-primary hover:bg-surface-container-low disabled:opacity-40 disabled:hover:text-on-surface"
              }`}
            >
              <MaterialIcon name="check_circle" filled={readyToClose} />
            </button>
          </div>
          <label
            title="Cargar GeoJSON"
            className="w-10 h-10 bg-surface-container-lowest border border-outline-variant rounded-md flex items-center justify-center text-on-surface hover:text-primary hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <MaterialIcon name="upload" />
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.geojson,application/geo+json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={reset}
            title="Reiniciar"
            className="w-10 h-10 bg-surface-container-lowest border border-outline-variant rounded-md flex items-center justify-center text-on-surface hover:text-error hover:bg-surface-container-low transition-colors"
          >
            <MaterialIcon name="delete" />
          </button>
        </div>

        <div className="absolute bottom-4 left-4 z-[1000] glass-panel rounded-full px-4 py-2">
          <span className="text-body-sm text-on-surface">
            {closed
              ? `Polígono cerrado · ${points.length} vértices. Genera el diagnóstico a la izquierda.`
              : readyToClose
                ? `Área lista · ${points.length} vértices. Pulsa ✓ Cerrar polígono a la derecha.`
                : `Clic en el mapa para marcar esquinas · ${points.length} de 3 mínimo`}
          </span>
        </div>
      </div>
    </div>
  );
}

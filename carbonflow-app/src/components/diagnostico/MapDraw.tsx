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

  return (
    <div className="relative h-full w-full">
      <MapContainer center={COLOMBIA_CENTER} zoom={6} scrollWheelZoom className="h-full w-full">
        <MapRef mapRef={mapRef} />
        <TileLayer key={basemap} attribution={BASEMAPS[basemap].attribution} url={BASEMAPS[basemap].url} />
        <ClickCapture onClick={addPoint} />
        {points.length > 0 && (
          <LeafletPolygon
            positions={points}
            pathOptions={{ color: "#2D6A4F", weight: 2, lineJoin: "round", fillColor: "#2D6A4F", fillOpacity: 0.25 }}
          />
        )}
      </MapContainer>

      {/* Map Controls Overlay — replica del patrón "vertical stack of square buttons" del design system */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        <button
          type="button"
          onClick={() => setBasemap((b) => (b === "normal" ? "satelite" : "normal"))}
          title={basemap === "normal" ? "Ver satelital" : "Ver normal"}
          className="w-10 h-10 bg-surface-container-lowest border border-outline-variant rounded-md shadow-sm flex items-center justify-center text-on-surface hover:text-primary hover:bg-surface-container-low transition-colors"
        >
          <MaterialIcon name={basemap === "normal" ? "satellite_alt" : "map"} />
        </button>
        <button
          type="button"
          onClick={zoomToPolygon}
          disabled={points.length === 0}
          title="Centrar en polígono"
          className="w-10 h-10 bg-surface-container-lowest border border-outline-variant rounded-md shadow-sm flex items-center justify-center text-on-surface hover:text-primary hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:hover:text-on-surface"
        >
          <MaterialIcon name="my_location" />
        </button>
        <button
          type="button"
          onClick={closePolygon}
          disabled={points.length < 3 || closed}
          title="Cerrar polígono"
          className="w-10 h-10 bg-surface-container-lowest border border-outline-variant rounded-md shadow-sm flex items-center justify-center text-on-surface hover:text-primary hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:hover:text-on-surface"
        >
          <MaterialIcon name="check_circle" />
        </button>
        <label
          title="Cargar GeoJSON"
          className="w-10 h-10 bg-surface-container-lowest border border-outline-variant rounded-md shadow-sm flex items-center justify-center text-on-surface hover:text-primary hover:bg-surface-container-low transition-colors cursor-pointer"
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
          className="w-10 h-10 bg-surface-container-lowest border border-outline-variant rounded-md shadow-sm flex items-center justify-center text-on-surface hover:text-status-error hover:bg-surface-container-low transition-colors"
        >
          <MaterialIcon name="delete" />
        </button>
      </div>

      <div className="absolute bottom-4 left-4 z-[1000] glass-panel rounded-full px-4 py-2 shadow-sm">
        <span className="text-body-sm text-on-surface">
          {closed
            ? `Polígono cerrado · ${points.length} vértices`
            : `Clic en el mapa para dibujar · ${points.length} vértices`}
        </span>
      </div>
    </div>
  );
}

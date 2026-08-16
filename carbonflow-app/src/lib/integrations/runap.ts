import type { Geometry, Polygon, MultiPolygon } from "geojson";
import { resilientCall } from "@/lib/resilience";

export interface ProtectedAreaResult {
  intersectsProtectedArea: boolean;
  nearestAreaName?: string;
}

// Servicio ArcGIS REST publico del RUNAP (Parques Nacionales Naturales de Colombia).
// Confirmado en vivo: layer 0 "Registro Unico Nacional AP", geometryType esriGeometryPolygon.
// Se puede sobreescribir con la variable de entorno RUNAP_REGISTRY_API_URL.
const DEFAULT_RUNAP_URL =
  "https://mapas.parquesnacionales.gov.co/arcgis/rest/services/pnn/runap/FeatureServer/0/query";

function ringToEsriPolygon(geometry: Polygon | MultiPolygon) {
  const rings =
    geometry.type === "Polygon" ? geometry.coordinates : geometry.coordinates.flat();
  return { rings, spatialReference: { wkid: 4326 } };
}

async function queryRunap(geometry: Geometry): Promise<ProtectedAreaResult> {
  if (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon") {
    throw new Error("geometria no soportada para consulta RUNAP");
  }
  const url = process.env.RUNAP_REGISTRY_API_URL || DEFAULT_RUNAP_URL;
  const esriGeometry = ringToEsriPolygon(geometry);

  const params = new URLSearchParams({
    f: "json",
    geometry: JSON.stringify(esriGeometry),
    geometryType: "esriGeometryPolygon",
    spatialRel: "esriSpatialRelIntersects",
    inSR: "4326",
    outFields: "ap_nombre,ap_categoria",
    returnGeometry: "false",
  });

  const res = await fetch(`${url}?${params.toString()}`);
  if (!res.ok) throw new Error(`RUNAP respondio ${res.status}`);
  const json = await res.json();
  // ArcGIS REST suele devolver 200 OK con un objeto "error" en el cuerpo
  // (servicio/organizacion inexistente, parametros invalidos, etc.). Sin esta
  // validacion, una URL mal configurada se reportaria como "live" con un
  // falso negativo silencioso en vez de caer al fallback declarado.
  if (json?.error) {
    throw new Error(`RUNAP devolvio error: ${json.error.message ?? json.error.code ?? "desconocido"}`);
  }
  const features = json?.features ?? [];

  return {
    intersectsProtectedArea: features.length > 0,
    nearestAreaName: features[0]?.attributes?.ap_nombre,
  };
}

export async function getProtectedAreaOverlap(geometry: Geometry) {
  const cacheKey = `runap:${JSON.stringify(geometry)}`;
  return resilientCall(() => queryRunap(geometry), { cacheKey, timeoutMs: 6000 });
}

export function fallbackProtectedArea(): ProtectedAreaResult {
  return { intersectsProtectedArea: false };
}

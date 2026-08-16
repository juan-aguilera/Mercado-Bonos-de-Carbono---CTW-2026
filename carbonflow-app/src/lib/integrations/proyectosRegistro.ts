export const REGISTROS_OFICIALES = ["Verra", "Gold Standard", "RENARE"] as const;

export type RegistroOficial = (typeof REGISTROS_OFICIALES)[number];

export interface ProyectoRegistroOficial {
  id: string;
  registro: RegistroOficial;
  nombre: string;
  desarrollador: string | null;
  departamento: string;
  municipio: string | null;
  estado: string;
  tipo_proyecto: string;
  area_hectareas: number | null;
  vintage: number | null;
  enlace_oficial: string | null;
}

export function statusVariant(estado: string): "success" | "warning" | "neutral" | "info" {
  const value = estado.toLowerCase();
  if (/(registrad|certificad|implementaci)/.test(value)) return "success";
  if (/(validaci|verificaci|factibilidad|listad)/.test(value)) return "warning";
  if (/(formulaci|design)/.test(value)) return "info";
  return "neutral";
}

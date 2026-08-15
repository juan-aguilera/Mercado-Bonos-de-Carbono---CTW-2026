export type ProjectTypeId =
  | "forestal-conservacion"
  | "reforestacion"
  | "agroforesteria"
  | "solar"
  | "eolica"
  | "biogas"
  | "biomasa"
  | "eficiencia-energetica";

export interface ProjectType {
  id: ProjectTypeId;
  label: string;
  enabled: boolean;
}

export const PROJECT_TYPES: ProjectType[] = [
  { id: "forestal-conservacion", label: "Conservación / restauración forestal", enabled: true },
  { id: "reforestacion", label: "Reforestación y revegetación", enabled: false },
  { id: "agroforesteria", label: "Agroforestería y agricultura climáticamente inteligente", enabled: false },
  { id: "solar", label: "Energía solar", enabled: false },
  { id: "eolica", label: "Energía eólica", enabled: false },
  { id: "biogas", label: "Biogás", enabled: false },
  { id: "biomasa", label: "Biomasa", enabled: false },
  { id: "eficiencia-energetica", label: "Eficiencia energética", enabled: false },
];

export const DEFAULT_PROJECT_TYPE: ProjectTypeId = "forestal-conservacion";

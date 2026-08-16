import type { PddData } from "@/lib/docx/pddDocxGenerator";
import { PROJECT_TYPES } from "@/lib/projectTypes";

export type PredioPddInput = {
  id: string;
  nombre: string;
  area_hectareas: number;
  tipo_proyecto: string;
  ubicacion_display: string | null;
};

export function tipoProyectoLabel(id: string) {
  return PROJECT_TYPES.find((t) => t.id === id)?.label ?? id;
}

export function legacyFieldsFromPdd(pdd: PddData) {
  return {
    lineaBase: pdd.analisisTecnico?.lineaBaseReferencia ?? "",
    adicionalidad: pdd.analisisTecnico?.demostracionAdicionalidad ?? "",
    riesgosPermanencia: pdd.riesgosSalvaguardas?.riesgosPermanenciaFugas ?? "",
    salvaguardas: pdd.riesgosSalvaguardas?.salvaguardasSocialesAmbientales ?? "",
    cronograma: JSON.stringify(pdd.cronogramaOperativo ?? []),
    presupuesto: `CAPEX: ${pdd.evaluacionFinanciera?.capexInicial || ""} | OPEX: ${pdd.evaluacionFinanciera?.opexAnual || ""}`,
  };
}

export function isPddData(value: unknown): value is PddData {
  if (!value || typeof value !== "object") return false;
  const v = value as PddData;
  return Boolean(v.resumenEjecutivo && v.problematica && v.analisisTecnico);
}

export function buildPddFromGenerateResponse(predio: PredioPddInput, data: Partial<PddData>): PddData {
  return {
    predioNombre: predio.nombre,
    tipoProyecto: tipoProyectoLabel(predio.tipo_proyecto),
    areaHectareas: predio.area_hectareas,
    ubicacion: predio.ubicacion_display || "Colombia",
    resumenEjecutivo: data.resumenEjecutivo || {
      visionGeneral: "Proyecto de conservación forestal.",
      creditosEstimadosAnual: "45,000 tCO2e/año",
      inversionRequerida: "$400,000 USD",
      tirEstimada: "24%",
      vanEstimado: "$1,200,000 USD",
      beneficiariosDirectos: "Comunidades locales",
    },
    problematica: data.problematica || {
      diagnosticoTerritorial: "",
      causasDeforestacion: "",
      arbolProblemasSoluciones: "",
      actoresClave: [],
    },
    analisisTecnico: data.analisisTecnico || {
      localizacionLimites: "",
      metodologiaEstandar: "",
      lineaBaseReferencia: "",
      demostracionAdicionalidad: "",
      proyeccionRemociones: "",
    },
    riesgosSalvaguardas: data.riesgosSalvaguardas || {
      riesgosPermanenciaFugas: "",
      salvaguardasSocialesAmbientales: "",
      mecanismoDistribucionBeneficios: "",
      gobernanzaConsultaPrevia: "",
    },
    evaluacionFinanciera: data.evaluacionFinanciera || {
      capexInicial: "",
      opexAnual: "",
      flujoCajaProyectado: "",
      indicadoresFinancieros: { vpn: "", tir: "", payback: "", precioCarbonoSostenibilidad: "" },
      analisisSensibilidad: "",
    },
    cronogramaOperativo: data.cronogramaOperativo || [],
    kpisSeguimiento: data.kpisSeguimiento || [],
  };
}

export async function persistExpedientePdd(predioId: string, pdd: PddData) {
  const legacy = legacyFieldsFromPdd(pdd);
  const res = await fetch("/api/expedientes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      predioId,
      ...legacy,
      pddData: pdd,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `El servidor respondió ${res.status}`);
  }
  return legacy;
}

export async function generateAndSavePdd(params: {
  predio: PredioPddInput;
  amenazas: string;
  actividades: string;
  comunidad: string;
}): Promise<PddData> {
  const res = await fetch("/api/formulacion/generar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      predio: {
        nombre: params.predio.nombre,
        area_hectareas: params.predio.area_hectareas,
        tipo_proyecto: params.predio.tipo_proyecto,
        ubicacion_display: params.predio.ubicacion_display,
      },
      amenazas: params.amenazas,
      actividades: params.actividades,
      comunidad: params.comunidad,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `El servidor respondió con código ${res.status}`);
  }

  const data = (await res.json()) as Partial<PddData>;
  const pdd = buildPddFromGenerateResponse(params.predio, data);
  await persistExpedientePdd(params.predio.id, pdd);
  return pdd;
}

import * as turf from "@turf/turf";
import type { Polygon, MultiPolygon } from "geojson";
import type { ForestCoverResult } from "@/lib/integrations/gfw";
import type { ProtectedAreaResult } from "@/lib/integrations/runap";
import { formatNumber } from "@/lib/format";

// Formula de score y CO2e definida en la seccion 2.4 del PRD: suma ponderada
// de factores normalizados 0-100, cada uno con su fuente visible en la UI.

export const MIN_VIABLE_HECTARES = 20;

export interface DiagnosticoFormInput {
  usoDelSuelo: string;
  tenenciaDeclarada: string;
  objetivoIntervencion: string;
}

export interface ScoreFactor {
  key: string;
  label: string;
  weight: number;
  value0to100: number;
  explanation: string;
  source: string;
}

export interface ScoreResult {
  score: number;
  factors: ScoreFactor[];
}

export interface Co2eEstimate {
  toneladasCO2ePorAnio: number;
  toneladasCO2eHorizonte: number;
  horizonteAnios: number;
  factorEmisionTHaAnio: number;
  supuestos: string;
  fechaCalculo: string;
}

export function computeAreaHectares(geometry: Polygon | MultiPolygon): number {
  const areaM2 = turf.area(turf.feature(geometry));
  return areaM2 / 10000;
}

function completenessScore(form: Partial<DiagnosticoFormInput>): number {
  const fields = [form.usoDelSuelo, form.tenenciaDeclarada, form.objetivoIntervencion];
  const filled = fields.filter((f) => f && f.trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
}

export function computeScore(params: {
  areaHectares: number;
  forestCover: ForestCoverResult;
  protectedArea: ProtectedAreaResult;
  form: Partial<DiagnosticoFormInput>;
  dataSources: { gfwSource: string; runapSource: string };
}): ScoreResult {
  const { areaHectares, forestCover, protectedArea, form, dataSources } = params;

  const sizeValue = Math.round(Math.min(100, (areaHectares / MIN_VIABLE_HECTARES) * 100));
  const completeness = completenessScore(form);

  let protectedValue: number;
  let protectedExplanation: string;
  if (protectedArea.intersectsProtectedArea) {
    protectedValue = 20;
    protectedExplanation = `El predio se traslapa con un área protegida${
      protectedArea.nearestAreaName ? ` (${protectedArea.nearestAreaName})` : ""
    }; probablemente requiera permisos y autorizaciones adicionales.`;
  } else {
    protectedValue = 60;
    protectedExplanation = "No se detecta traslape con áreas protegidas registradas en RUNAP.";
  }

  const deforestationValue = forestCover.recentLossAlerts ? 80 : 40;
  const deforestationExplanation = forestCover.recentLossAlerts
    ? `Se registran ${forestCover.alertsLast12Months} alertas de deforestación en los últimos 12 meses: puede sustentar un argumento de adicionalidad, pero también indica mayor riesgo y necesidad de salvaguardas.`
    : "No se registran alertas recientes de deforestación en la fuente consultada.";

  const factors: ScoreFactor[] = [
    {
      key: "cobertura",
      label: "Cobertura boscosa actual",
      weight: 0.3,
      value0to100: Math.round(forestCover.treeCoverPct2000),
      explanation: `Cobertura boscosa estimada de ${formatNumber(forestCover.treeCoverPct2000, 1)}%.`,
      source: dataSources.gfwSource,
    },
    {
      key: "deforestacion",
      label: "Presión de deforestación",
      weight: 0.2,
      value0to100: deforestationValue,
      explanation: deforestationExplanation,
      source: dataSources.gfwSource,
    },
    {
      key: "area_protegida",
      label: "Traslape con área protegida",
      weight: 0.15,
      value0to100: protectedValue,
      explanation: protectedExplanation,
      source: dataSources.runapSource,
    },
    {
      key: "tamano",
      label: "Tamaño del polígono vs. mínimo viable",
      weight: 0.15,
      value0to100: sizeValue,
      explanation: `Área de ${formatNumber(areaHectares, 1)} ha frente a un mínimo viable orientativo de ${formatNumber(MIN_VIABLE_HECTARES)} ha para proyectos forestales.`,
      source: "Cálculo geométrico local (Turf.js)",
    },
    {
      key: "completitud",
      label: "Completitud de la información declarada",
      weight: 0.2,
      value0to100: completeness,
      explanation: `${completeness}% de los campos clave del formulario están completos.`,
      source: "Formulario del usuario",
    },
  ];

  const score = Math.round(factors.reduce((sum, f) => sum + f.value0to100 * f.weight, 0));

  return { score, factors };
}

// Factores de emision/remocion ilustrativos, tipo IPCC Tier 1, para bosques
// de Colombia. Deben tratarse como valores por defecto no verificados.
function emissionFactorForCover(coverPct: number): number {
  if (coverPct >= 70) return 7.5; // bosque denso: conservacion / evitacion de deforestacion
  if (coverPct >= 40) return 5.0; // bosque intermedio
  return 3.0; // cobertura baja: restauracion / revegetacion
}

export function computeCo2eEstimate(params: {
  areaHectares: number;
  forestCover: ForestCoverResult;
  horizonteAnios?: number;
}): Co2eEstimate {
  const { areaHectares, forestCover, horizonteAnios = 20 } = params;
  const factor = emissionFactorForCover(forestCover.treeCoverPct2000);
  const toneladasCO2ePorAnio = Math.round(areaHectares * factor);

  return {
    toneladasCO2ePorAnio,
    toneladasCO2eHorizonte: toneladasCO2ePorAnio * horizonteAnios,
    horizonteAnios,
    factorEmisionTHaAnio: factor,
    supuestos: `Factor por defecto de ${factor} tCO2e/ha/año según cobertura boscosa estimada (tipo IPCC Tier 1, no verificado). Estimación indicativa, no certificada.`,
    fechaCalculo: new Date().toISOString(),
  };
}

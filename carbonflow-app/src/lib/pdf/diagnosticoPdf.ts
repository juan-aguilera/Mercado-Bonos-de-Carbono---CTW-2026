import { jsPDF } from "jspdf";
import type { ScoreFactor, Co2eEstimate } from "@/lib/scoring";

export interface DiagnosticoPdfInput {
  nombrePredio: string;
  tipoProyecto: string;
  areaHectareas: number;
  ubicacion: string;
  score: number;
  factors: ScoreFactor[];
  co2e: Co2eEstimate;
  fechaCalculo: string;
}

export function generateDiagnosticoPdf(data: DiagnosticoPdfInput) {
  const doc = new jsPDF();
  let y = 18;

  doc.setFontSize(18);
  doc.setTextColor(5, 150, 105);
  doc.text("CarbonFlow — Diagnóstico preliminar", 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text("Estimación no certificada. No sustituye validación o verificación oficial.", 14, y);
  y += 10;

  doc.setTextColor(20);
  doc.setFontSize(12);
  const rows: [string, string][] = [
    ["Predio", data.nombrePredio],
    ["Tipo de proyecto", data.tipoProyecto],
    ["Área", `${data.areaHectareas.toFixed(2)} ha`],
    ["Ubicación", data.ubicacion],
    ["Score de prefactibilidad", `${data.score} / 100`],
    ["Fecha de cálculo", new Date(data.fechaCalculo).toLocaleString("es-CO")],
  ];
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value), 70, y);
    y += 7;
  });

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Factores del score", 14, y);
  y += 7;
  doc.setFontSize(10);

  data.factors.forEach((f) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${f.label} — ${f.value0to100}/100 (peso ${Math.round(f.weight * 100)}%)`, 14, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const explanationLines = doc.splitTextToSize(f.explanation, 180);
    doc.text(explanationLines, 14, y);
    y += explanationLines.length * 4.5;
    doc.setTextColor(130);
    doc.text(`Fuente: ${f.source}`, 14, y);
    doc.setTextColor(20);
    y += 7;
  });

  y += 3;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Estimación de CO2e", 14, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.co2e.toneladasCO2ePorAnio} tCO2e/año (indicativo)`, 14, y);
  y += 5;
  doc.text(
    `${data.co2e.toneladasCO2eHorizonte} tCO2e en horizonte de ${data.co2e.horizonteAnios} años`,
    14,
    y
  );
  y += 5;
  const supuestosLines = doc.splitTextToSize(`Supuestos: ${data.co2e.supuestos}`, 180);
  doc.text(supuestosLines, 14, y);

  doc.save(`carbonflow-diagnostico-${Date.now()}.pdf`);
}

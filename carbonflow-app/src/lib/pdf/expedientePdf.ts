import { jsPDF } from "jspdf";

export interface ExpedientePdfInput {
  nombrePredio: string;
  tipoProyecto: string;
  lineaBase: string;
  adicionalidad: string;
  riesgosPermanencia: string;
  salvaguardas: string;
  cronograma: string;
  presupuesto: string;
}

export function generateExpedientePdf(data: ExpedientePdfInput) {
  const doc = new jsPDF();
  let y = 18;

  doc.setFontSize(18);
  doc.setTextColor(5, 150, 105);
  doc.text("CarbonFlow — Expediente de formulación (borrador)", 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text("Documento preliminar. Pendiente de validación profesional.", 14, y);
  y += 10;

  doc.setTextColor(20);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Predio: ${data.nombrePredio}`, 14, y);
  y += 7;
  doc.text(`Tipo de proyecto: ${data.tipoProyecto}`, 14, y);
  y += 10;

  const sections: [string, string][] = [
    ["Línea base y escenario de proyecto", data.lineaBase],
    ["Adicionalidad y viabilidad financiera inicial", data.adicionalidad],
    ["Riesgos, permanencia y fugas", data.riesgosPermanencia],
    ["Salvaguardas sociales, ambientales y comunitarias", data.salvaguardas],
    ["Cronograma", data.cronograma],
    ["Presupuesto y fuentes de financiación", data.presupuesto],
  ];

  sections.forEach(([title, content]) => {
    if (y > 265) {
      doc.addPage();
      y = 18;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(title, 14, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(content || "(pendiente)", 180);
    doc.text(lines, 14, y);
    y += lines.length * 4.5 + 6;
  });

  doc.save(`carbonflow-expediente-${Date.now()}.pdf`);
}

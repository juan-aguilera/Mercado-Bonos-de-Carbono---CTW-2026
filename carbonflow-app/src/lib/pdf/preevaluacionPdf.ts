import { jsPDF } from "jspdf";
import { formatNumber } from "@/lib/format";
import {
  AVISO_ORIENTATIVO,
  labelTipoProyecto,
  type DiagnosticoContexto,
  type ExpedienteContexto,
  type ItemPaquete,
  type PredioContexto,
  type ResultadoPreparacion,
} from "@/lib/validacionRegistro";

export interface PreevaluacionPdfInput {
  predio: PredioContexto;
  diagnostico: DiagnosticoContexto | null;
  expediente: ExpedienteContexto | null;
  preparacion: ResultadoPreparacion;
  items: ItemPaquete[];
  incluirUbicacionPrecisa: boolean;
}

function writeWrapped(doc: jsPDF, text: string, x: number, y: number, maxWidth: number): number {
  const lines = doc.splitTextToSize(text || "(pendiente)", maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * 4.6;
}

export function generatePreevaluacionPdf(data: PreevaluacionPdfInput) {
  const doc = new jsPDF();
  const incompleto = data.preparacion.brechas.some((b) => b.nivel === "critico");
  let y = 18;

  doc.setFontSize(16);
  doc.setTextColor(5, 150, 105);
  doc.text("CarbonFlow — Paquete de preevaluación", 14, y);
  y += 7;

  if (incompleto) {
    doc.setFontSize(12);
    doc.setTextColor(180, 80, 0);
    doc.text("Paquete incompleto — contiene brechas críticas", 14, y);
    y += 7;
  }

  doc.setFontSize(9);
  doc.setTextColor(90);
  y = writeWrapped(
    doc,
    "Este paquete no equivale a una solicitud formal de validación ni a un expediente certificado. " +
      AVISO_ORIENTATIVO,
    14,
    y,
    180
  );
  y += 4;

  doc.setTextColor(20);
  doc.setFontSize(10);
  const fecha = new Date().toLocaleString("es-CO");
  const filas: [string, string][] = [
    ["Proyecto", data.predio.nombre],
    ["Tipo", labelTipoProyecto(data.predio.tipo_proyecto)],
    ["Área", `${formatNumber(data.predio.area_hectareas, 2)} ha`],
    [
      "Ubicación",
      data.incluirUbicacionPrecisa
        ? data.predio.ubicacion_display || "No registrada"
        : [data.predio.departamento, data.predio.municipio].filter(Boolean).join(", ") ||
          "Ubicación general (coordenadas omitidas)",
    ],
    ["Preparación", `${data.preparacion.puntaje}/100 — ${data.preparacion.estado}`],
    ["Fecha de generación", fecha],
    ["Fuente diagnóstico", data.diagnostico ? `Diagnóstico ${data.diagnostico.created_at}` : "No disponible"],
  ];

  filas.forEach(([label, value]) => {
    if (y > 275) {
      doc.addPage();
      y = 18;
    }
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 14, y);
    doc.setFont("helvetica", "normal");
    y = writeWrapped(doc, value, 55, y, 140);
    y += 2;
  });

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Cálculo del indicador de preparación", 14, y);
  y += 6;
  doc.setFontSize(9);
  data.preparacion.criterios.forEach((c) => {
    if (y > 275) {
      doc.addPage();
      y = 18;
    }
    doc.setFont("helvetica", "normal");
    y = writeWrapped(doc, `${c.label}: ${c.puntos}/${c.max} (fuente: ${c.fuente})`, 14, y, 180);
  });

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Contenido del paquete", 14, y);
  y += 6;
  doc.setFontSize(9);
  data.items.forEach((item) => {
    if (y > 275) {
      doc.addPage();
      y = 18;
    }
    doc.setFont("helvetica", "normal");
    y = writeWrapped(doc, `${item.incluido ? "[incluido]" : "[pendiente]"} ${item.label}`, 14, y, 180);
  });

  if (data.preparacion.brechas.length) {
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Brechas y advertencias", 14, y);
    y += 6;
    doc.setFontSize(9);
    data.preparacion.brechas.forEach((b) => {
      if (y > 270) {
        doc.addPage();
        y = 18;
      }
      doc.setFont("helvetica", "bold");
      y = writeWrapped(doc, `${b.nivel.toUpperCase()} · ${b.nombre} (${b.fuente})`, 14, y, 180);
      doc.setFont("helvetica", "normal");
      y = writeWrapped(doc, b.explicacion, 14, y, 180);
      y += 2;
    });
  }

  if (data.diagnostico) {
    y += 4;
    if (y > 250) {
      doc.addPage();
      y = 18;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Síntesis de diagnóstico (indicativa)", 14, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    y = writeWrapped(
      doc,
      `Score de prefactibilidad ${data.diagnostico.score}/100. Estimación ${formatNumber(Number(data.diagnostico.co2e_por_anio))} tCO2e/año (indicativa, no verificada).`,
      14,
      y,
      180
    );
  }

  const textos: [string, string][] = [
    ["Línea base", data.expediente?.linea_base ?? ""],
    ["Adicionalidad", data.expediente?.adicionalidad ?? ""],
    ["Riesgos", data.expediente?.riesgos_permanencia ?? ""],
    ["Salvaguardas", data.expediente?.salvaguardas ?? ""],
    ["Cronograma", data.expediente?.cronograma ?? ""],
    ["Presupuesto", data.expediente?.presupuesto ?? ""],
  ];
  textos.forEach(([title, content]) => {
    if (y > 250) {
      doc.addPage();
      y = 18;
    }
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(title, 14, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    y = writeWrapped(doc, content || "(pendiente)", 14, y, 180);
  });

  doc.save(`carbonflow-preevaluacion-${Date.now()}.pdf`);
}

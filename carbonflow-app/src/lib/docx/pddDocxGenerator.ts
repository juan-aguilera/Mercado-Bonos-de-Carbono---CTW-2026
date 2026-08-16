import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  Footer,
  PageNumber,
  NumberFormat,
} from "docx";

export interface PddData {
  predioNombre: string;
  tipoProyecto: string;
  areaHectareas: number;
  ubicacion: string;
  resumenEjecutivo: {
    visionGeneral: string;
    creditosEstimadosAnual: string;
    inversionRequerida: string;
    tirEstimada: string;
    vanEstimado: string;
    beneficiariosDirectos: string;
  };
  problematica: {
    diagnosticoTerritorial: string;
    causasDeforestacion: string;
    arbolProblemasSoluciones: string;
    actoresClave: Array<{
      actor: string;
      rol: string;
      interesImpacto: string;
      estrategiaInvolucramiento: string;
    }>;
  };
  analisisTecnico: {
    localizacionLimites: string;
    metodologiaEstandar: string;
    lineaBaseReferencia: string;
    demostracionAdicionalidad: string;
    proyeccionRemociones: string;
  };
  riesgosSalvaguardas: {
    riesgosPermanenciaFugas: string;
    salvaguardasSocialesAmbientales: string;
    mecanismoDistribucionBeneficios: string;
    gobernanzaConsultaPrevia: string;
  };
  evaluacionFinanciera: {
    capexInicial: string;
    opexAnual: string;
    flujoCajaProyectado: string;
    indicadoresFinancieros: {
      vpn: string;
      tir: string;
      payback: string;
      precioCarbonoSostenibilidad: string;
    };
    analisisSensibilidad: string;
  };
  cronogramaOperativo: Array<{
    fase: string;
    periodo: string;
    actividadesClave: string;
    entregableHito: string;
  }>;
  kpisSeguimiento: Array<{
    categoria: string;
    indicador: string;
    metaAnual: string;
    frecuenciaMonitoreo: string;
  }>;
}

const COLOR_PRIMARY = "1B4332"; // Deep Forest Green
const COLOR_SECONDARY = "2D6A4F"; // Emerald
const COLOR_ACCENT = "40916C";
const COLOR_DARK = "1F2937"; // Charcoal Slate
const COLOR_MUTED = "4B5563";
const COLOR_LIGHT_BG = "F3F6F4";
const COLOR_BORDER = "E5E7EB";

export async function generatePddDocx(data: PddData): Promise<Blob> {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Arial",
            size: 22, // 11pt
            color: COLOR_DARK,
          },
          paragraph: {
            spacing: { line: 276, after: 120 }, // 1.15 line spacing
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 inch
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `CarbonFlow PDD — ${data.predioNombre} | Página `,
                    size: 18,
                    color: COLOR_MUTED,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    color: COLOR_MUTED,
                  }),
                  new TextRun({
                    text: " de ",
                    size: 18,
                    color: COLOR_MUTED,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 18,
                    color: COLOR_MUTED,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // PORTADA CORPORATIVA INSTITUCIONAL
          new Paragraph({
            spacing: { before: 360, after: 180 },
            children: [
              new TextRun({
                text: "DOCUMENTO DE DISEÑO DE PROYECTO (PDD)",
                bold: true,
                size: 20,
                color: COLOR_SECONDARY,
                allCaps: true,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 240 },
            children: [
              new TextRun({
                text: `Proyecto Forestal: ${data.predioNombre}`,
                bold: true,
                size: 48, // 24pt
                color: COLOR_PRIMARY,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 360 },
            children: [
              new TextRun({
                text: `Estructuración Integral bajo Estándares Internacionales de Carbono (VCS / Gold Standard / CCB)`,
                italics: true,
                size: 24, // 12pt
                color: COLOR_MUTED,
              }),
            ],
          }),

          // Metadata Banner Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell("Ubicación Territorial", 25),
                  createHeaderCell("Área Total", 25),
                  createHeaderCell("Tipo de Proyecto", 25),
                  createHeaderCell("Créditos Proyectados", 25),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell(data.ubicacion || "Colombia", 25),
                  createDataCell(`${data.areaHectareas.toLocaleString("es-CO")} ha`, 25),
                  createDataCell(data.tipoProyecto, 25),
                  createDataCell(data.resumenEjecutivo.creditosEstimadosAnual, 25),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 400, after: 100 }, text: "" }),

          // RESUMEN EJECUTIVO (CALLOUT BOX)
          createSectionHeading("Resumen Ejecutivo"),
          createCalloutBox(data.resumenEjecutivo.visionGeneral),

          new Paragraph({ spacing: { before: 200, after: 100 }, text: "" }),

          // Highlights Financieros / Métricas Clave Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell("Inversión Requerida (CAPEX)", 33),
                  createHeaderCell("Tasa Interna de Retorno (TIR)", 33),
                  createHeaderCell("Valor Presente Neto (VPN)", 34),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell(data.resumenEjecutivo.inversionRequerida, 33, true),
                  createDataCell(data.resumenEjecutivo.tirEstimada, 33, true),
                  createDataCell(data.resumenEjecutivo.vanEstimado, 34, true),
                ],
              }),
            ],
          }),

          // 1. PROBLEMÁTICA Y MATRIZ DE ACTORES
          createSectionHeading("1. Identificación de la Problemática y Análisis de Actores"),
          createSubHeading("1.1 Diagnóstico Territorial y Causas de Deforestación"),
          createBodyParagraph(data.problematica.diagnosticoTerritorial),
          createBodyParagraph(data.problematica.causasDeforestacion),

          createSubHeading("1.2 Árbol de Problemas y Alternativas de Solución"),
          createBodyParagraph(data.problematica.arbolProblemasSoluciones),

          createSubHeading("1.3 Matriz de Análisis de Actores Clave"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell("Actor / Comunidad", 22),
                  createHeaderCell("Rol en el Territorio", 25),
                  createHeaderCell("Interés e Impacto", 25),
                  createHeaderCell("Estrategia de Involucramiento", 28),
                ],
              }),
              ...(data.problematica.actoresClave.length > 0
                ? data.problematica.actoresClave.map((a) =>
                    new TableRow({
                      children: [
                        createDataCell(a.actor, 22, true),
                        createDataCell(a.rol, 25),
                        createDataCell(a.interesImpacto, 25),
                        createDataCell(a.estrategiaInvolucramiento, 28),
                      ],
                    })
                  )
                : [
                    new TableRow({
                      children: [
                        createDataCell("Comunidad Local", 22),
                        createDataCell("Custodia del bosque y patrullaje", 25),
                        createDataCell("Alto impacto en medios de vida", 25),
                        createDataCell("Acuerdos de conservación y empleo verde", 28),
                      ],
                    }),
                  ]),
            ],
          }),

          // 2. ANÁLISIS TÉCNICO Y METODOLOGÍA
          createSectionHeading("2. Análisis Técnico, Localización y Metodología de Carbono"),
          createSubHeading("2.1 Localización, Límites y Elegibilidad Territorial"),
          createBodyParagraph(data.analisisTecnico.localizacionLimites),

          createSubHeading("2.2 Metodología y Estándar de Certificación Seleccionado"),
          createBodyParagraph(data.analisisTecnico.metodologiaEstandar),

          createSubHeading("2.3 Línea Base y Demostración de Adicionalidad"),
          createBodyParagraph(data.analisisTecnico.lineaBaseReferencia),
          createBodyParagraph(data.analisisTecnico.demostracionAdicionalidad),

          createSubHeading("2.4 Proyección de Reducción / Remoción de Emisiones (tCO2e)"),
          createCalloutBox(data.analisisTecnico.proyeccionRemociones),

          // 3. RIESGOS, SALVAGUARDAS Y GOBERNANZA
          createSectionHeading("3. Estructura de Riesgos, Salvaguardas y Gobernanza"),
          createSubHeading("3.1 Mitigación de Riesgos de Permanencia y Fugas"),
          createBodyParagraph(data.riesgosSalvaguardas.riesgosPermanenciaFugas),

          createSubHeading("3.2 Salvaguardas Sociales y Ambientales (Cancún & CCB)"),
          createBodyParagraph(data.riesgosSalvaguardas.salvaguardasSocialesAmbientales),

          createSubHeading("3.3 Consulta Previa, Libre e Informada (CLPI) y Distribución de Beneficios"),
          createBodyParagraph(data.riesgosSalvaguardas.mecanismoDistribucionBeneficios),
          createBodyParagraph(data.riesgosSalvaguardas.gobernanzaConsultaPrevia),

          // 4. MODELO Y EVALUACIÓN FINANCIERA
          createSectionHeading("4. Presupuesto, Modelo y Evaluación Financiera"),
          createSubHeading("4.1 Estructura de Costos (CAPEX & OPEX)"),
          createBodyParagraph(data.evaluacionFinanciera.capexInicial),
          createBodyParagraph(data.evaluacionFinanciera.opexAnual),

          createSubHeading("4.2 Flujo de Caja Proyectado e Indicadores Financieros"),
          createBodyParagraph(data.evaluacionFinanciera.flujoCajaProyectado),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell("Indicador Financiero", 50),
                  createHeaderCell("Valor Estimado", 50),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("Valor Presente Neto (VPN)", 50, true),
                  createDataCell(data.evaluacionFinanciera.indicadoresFinancieros.vpn, 50),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("Tasa Interna de Retorno (TIR)", 50, true),
                  createDataCell(data.evaluacionFinanciera.indicadoresFinancieros.tir, 50),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("Periodo de Recuperación (Payback)", 50, true),
                  createDataCell(data.evaluacionFinanciera.indicadoresFinancieros.payback, 50),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("Precio de Sustentabilidad por tCO2e", 50, true),
                  createDataCell(
                    data.evaluacionFinanciera.indicadoresFinancieros.precioCarbonoSostenibilidad,
                    50
                  ),
                ],
              }),
            ],
          }),

          createSubHeading("4.3 Análisis de Sensibilidad"),
          createBodyParagraph(data.evaluacionFinanciera.analisisSensibilidad),

          // 5. CRONOGRAMA OPERATIVO Y FASES
          createSectionHeading("5. Plan Operativo y Cronograma de Implementación"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell("Fase del Proyecto", 22),
                  createHeaderCell("Periodo Estimado", 22),
                  createHeaderCell("Actividades Principales", 32),
                  createHeaderCell("Hito / Entregable Clave", 24),
                ],
              }),
              ...(data.cronogramaOperativo.length > 0
                ? data.cronogramaOperativo.map((c) =>
                    new TableRow({
                      children: [
                        createDataCell(c.fase, 22, true),
                        createDataCell(c.periodo, 22),
                        createDataCell(c.actividadesClave, 32),
                        createDataCell(c.entregableHito, 24),
                      ],
                    })
                  )
                : [
                    new TableRow({
                      children: [
                        createDataCell("Fase 1: Formulación", 22, true),
                        createDataCell("Mes 1 - 3", 22),
                        createDataCell("Diseño de PDD y consulta comunitaria", 32),
                        createDataCell("PDD Finalizado", 24),
                      ],
                    }),
                  ]),
            ],
          }),

          // 6. CUADRO DE MANDO Y KPIS (MRV)
          createSectionHeading("6. Cuadro de Mando y KPIs de Seguimiento (MRV)"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell("Dimensión / Categoría", 22),
                  createHeaderCell("Indicador Clave (KPI)", 34),
                  createHeaderCell("Meta de Impacto", 24),
                  createHeaderCell("Frecuencia", 20),
                ],
              }),
              ...(data.kpisSeguimiento.length > 0
                ? data.kpisSeguimiento.map((k) =>
                    new TableRow({
                      children: [
                        createDataCell(k.categoria, 22, true),
                        createDataCell(k.indicador, 34),
                        createDataCell(k.metaAnual, 24),
                        createDataCell(k.frecuenciaMonitoreo, 20),
                      ],
                    })
                  )
                : [
                    new TableRow({
                      children: [
                        createDataCell("Climática", 22, true),
                        createDataCell("Emisiones evitadas de CO2e", 34),
                        createDataCell("100% de la cuota anual", 24),
                        createDataCell("Anual (dMRV)", 20),
                      ],
                    }),
                  ]),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

// Helpers para formato y diseño institucional
function createSectionHeading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 160 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 32, // 16pt
        color: COLOR_PRIMARY,
      }),
    ],
  });
}

function createSubHeading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 26, // 13pt
        color: COLOR_SECONDARY,
      }),
    ],
  });
}

function createBodyParagraph(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 60, after: 120 },
    children: [
      new TextRun({
        text: text || "—",
        size: 22, // 11pt
        color: COLOR_DARK,
      }),
    ],
  });
}

function createCalloutBox(text: string): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: {
              fill: COLOR_LIGHT_BG,
              type: ShadingType.CLEAR,
            },
            borders: {
              left: { style: BorderStyle.SINGLE, size: 24, color: COLOR_PRIMARY },
              top: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
            },
            margins: { top: 160, bottom: 160, left: 240, right: 200 },
            children: [
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [
                  new TextRun({
                    text: text || "—",
                    size: 22,
                    color: COLOR_DARK,
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function createHeaderCell(text: string, widthPercent: number): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: {
      fill: COLOR_PRIMARY,
      type: ShadingType.CLEAR,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_PRIMARY },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_PRIMARY },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
    },
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({
            text,
            bold: true,
            size: 20, // 10pt
            color: "FFFFFF",
          }),
        ],
      }),
    ],
  });
}

function createDataCell(text: string, widthPercent: number, bold = false): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: {
      fill: "FFFFFF",
      type: ShadingType.CLEAR,
    },
    borders: {
      bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      top: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
    },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({
            text: text || "—",
            bold,
            size: 20, // 10pt
            color: COLOR_DARK,
          }),
        ],
      }),
    ],
  });
}

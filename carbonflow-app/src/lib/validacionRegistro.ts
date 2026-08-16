import type { ScoreFactor } from "@/lib/scoring";
import { PROJECT_TYPES } from "@/lib/projectTypes";

export const AVISO_ORIENTATIVO =
  "La información de CarbonFlow es orientativa y se basa en datos ingresados por el usuario y módulos previos. No reemplaza a una entidad validadora, una autoridad competente, RENARE/SUIA, un estándar ni asesoría jurídica, técnica o financiera.";

export const AVISO_NO_CERTIFICA =
  "CarbonFlow orienta y organiza la preparación del proyecto. No valida, verifica, certifica, registra ante RENARE ni garantiza emisión de créditos o pagos por resultados.";

export const RENARE_OFICIAL_URL = "https://www.minambiente.gov.co/";

export type NivelBrecha = "critico" | "importante" | "recomendado";
export type EstadoPreparacionLabel =
  | "Inicial"
  | "En estructuración"
  | "Preparación avanzada"
  | "Listo para solicitar revisión técnica";

export type EstadoEtapa =
  | "completada"
  | "en_curso"
  | "pendiente"
  | "bloqueada"
  | "futura"
  | "requiere_verificacion_externa";

export type EstadoRenare =
  | "no_iniciado"
  | "en_preparacion"
  | "referencia_registrada"
  | "resultados_reportados"
  | "cierre_reportado";

export const ESTADOS_RENARE: { id: EstadoRenare; label: string }[] = [
  { id: "no_iniciado", label: "No iniciado" },
  { id: "en_preparacion", label: "En preparación" },
  { id: "referencia_registrada", label: "Referencia RENARE registrada por el usuario" },
  { id: "resultados_reportados", label: "Resultados reportados por el usuario" },
  { id: "cierre_reportado", label: "Cierre reportado por el usuario" },
];

export interface PredioContexto {
  id: string;
  nombre: string;
  tipo_proyecto: string;
  area_hectareas: number;
  ubicacion_display: string | null;
  tenencia_declarada: string | null;
  uso_del_suelo: string | null;
  objetivo_intervencion: string | null;
  codigo_catastral: string | null;
  departamento: string | null;
  municipio: string | null;
  created_at: string;
}

export interface DiagnosticoContexto {
  id: string;
  score: number;
  factores: ScoreFactor[];
  co2e_por_anio: number;
  co2e_horizonte: number;
  horizonte_anios: number;
  fuentes: Record<string, string> | null;
  created_at: string;
}

export interface ExpedienteContexto {
  id: string;
  linea_base: string | null;
  adicionalidad: string | null;
  riesgos_permanencia: string | null;
  salvaguardas: string | null;
  cronograma: string | null;
  presupuesto: string | null;
  estado: string;
  updated_at: string;
}

export interface ReferenciaRenare {
  predio_id: string;
  estado: EstadoRenare;
  referencia_id: string | null;
  url_publica: string | null;
  observaciones: string | null;
  updated_at: string;
}

export interface CriterioPreparacion {
  id: string;
  label: string;
  max: number;
  puntos: number;
  fuente: "Diagnóstico" | "Formulación" | "Diagnóstico/Formulación";
  cumplido: boolean;
}

export interface BrechaAccionable {
  id: string;
  nombre: string;
  explicacion: string;
  nivel: NivelBrecha;
  fuente: "Diagnóstico" | "Formulación";
  href: string;
  cta: string;
}

export interface ItemPaquete {
  id: string;
  label: string;
  incluido: boolean;
  pendiente?: string;
}

export interface ResultadoPreparacion {
  puntaje: number;
  estado: EstadoPreparacionLabel;
  criterios: CriterioPreparacion[];
  fortalezas: string[];
  brechas: BrechaAccionable[];
  formulacionPct: number;
  tieneDiagnostico: boolean;
  tieneFormulacionMinima: boolean;
}

function filled(text?: string | null, min = 40): boolean {
  return Boolean(text && text.trim().length >= min);
}

function mentions(text: string | null | undefined, pattern: RegExp): boolean {
  return Boolean(text && pattern.test(text));
}

export function labelTipoProyecto(id: string): string {
  return PROJECT_TYPES.find((t) => t.id === id)?.label ?? id;
}

export function labelEstadoPreparacion(puntaje: number): EstadoPreparacionLabel {
  if (puntaje >= 85) return "Listo para solicitar revisión técnica";
  if (puntaje >= 70) return "Preparación avanzada";
  if (puntaje >= 40) return "En estructuración";
  return "Inicial";
}

export function computeFormulacionPct(expediente: ExpedienteContexto | null): number {
  if (!expediente) return 0;
  const sections = [
    expediente.linea_base,
    expediente.adicionalidad,
    expediente.riesgos_permanencia,
    expediente.salvaguardas,
    expediente.cronograma,
    expediente.presupuesto,
  ];
  const done = sections.filter((s) => filled(s)).length;
  return Math.round((done / sections.length) * 100);
}

export function computePreparacion(
  predio: PredioContexto,
  diagnostico: DiagnosticoContexto | null,
  expediente: ExpedienteContexto | null
): ResultadoPreparacion {
  const predioId = predio.id;
  const tienePoligono = Boolean(predio.area_hectareas > 0 && predio.nombre);
  const tieneGeo = Boolean(diagnostico);
  const tenenciaTexto = filled(predio.tenencia_declarada, 3);
  const soporteIndicativo = Boolean(predio.codigo_catastral?.trim());
  const tenenciaPuntos = tenenciaTexto && soporteIndicativo ? 15 : tenenciaTexto ? 8 : soporteIndicativo ? 7 : 0;

  const linea = filled(expediente?.linea_base);
  const adicionalidad = filled(expediente?.adicionalidad);
  const riesgos = filled(expediente?.riesgos_permanencia);
  const salvaguardas = filled(expediente?.salvaguardas);
  const crono = filled(expediente?.cronograma, 20);
  const presupuesto = filled(expediente?.presupuesto, 20);
  const cronoPresu = crono && presupuesto ? 10 : crono || presupuesto ? 5 : 0;

  const monitoreoTexto = [expediente?.cronograma, expediente?.salvaguardas, expediente?.riesgos_permanencia]
    .filter(Boolean)
    .join(" ");
  const monitoreo = mentions(monitoreoTexto, /monitor/i);

  const criterios: CriterioPreparacion[] = [
    {
      id: "poligono",
      label: "Proyecto y polígono definidos",
      max: 10,
      puntos: tienePoligono ? 10 : 0,
      fuente: "Diagnóstico",
      cumplido: tienePoligono,
    },
    {
      id: "geo",
      label: "Datos geoespaciales y área disponibles",
      max: 10,
      puntos: tieneGeo ? 10 : 0,
      fuente: "Diagnóstico",
      cumplido: tieneGeo,
    },
    {
      id: "tenencia",
      label: "Control/tenencia declarada y soporte indicado",
      max: 15,
      puntos: tenenciaPuntos,
      fuente: "Diagnóstico/Formulación",
      cumplido: tenenciaPuntos === 15,
    },
    {
      id: "linea",
      label: "Línea base preliminar completa",
      max: 15,
      puntos: linea ? 15 : filled(expediente?.linea_base, 10) ? 7 : 0,
      fuente: "Formulación",
      cumplido: linea,
    },
    {
      id: "adicionalidad",
      label: "Adicionalidad documentada",
      max: 10,
      puntos: adicionalidad ? 10 : filled(expediente?.adicionalidad, 10) ? 5 : 0,
      fuente: "Formulación",
      cumplido: adicionalidad,
    },
    {
      id: "riesgos",
      label: "Riesgos de permanencia y fuga identificados",
      max: 10,
      puntos: riesgos ? 10 : filled(expediente?.riesgos_permanencia, 10) ? 5 : 0,
      fuente: "Formulación",
      cumplido: riesgos,
    },
    {
      id: "salvaguardas",
      label: "Salvaguardas y partes interesadas registradas",
      max: 10,
      puntos: salvaguardas ? 10 : filled(expediente?.salvaguardas, 10) ? 5 : 0,
      fuente: "Formulación",
      cumplido: salvaguardas,
    },
    {
      id: "crono",
      label: "Cronograma y presupuesto iniciales",
      max: 10,
      puntos: cronoPresu,
      fuente: "Formulación",
      cumplido: cronoPresu === 10,
    },
    {
      id: "monitoreo",
      label: "Plan de monitoreo inicial",
      max: 10,
      puntos: monitoreo ? 10 : 0,
      fuente: "Formulación",
      cumplido: monitoreo,
    },
  ];

  const puntaje = criterios.reduce((sum, c) => sum + c.puntos, 0);
  const formulacionPct = computeFormulacionPct(expediente);
  const brechas: BrechaAccionable[] = [];

  if (!tienePoligono || !tieneGeo) {
    brechas.push({
      id: "diagnostico",
      nombre: "Diagnóstico geoespacial",
      explicacion: "Necesitamos al menos un polígono, área, actividad y ubicación general para construir la ruta de preparación.",
      nivel: "critico",
      fuente: "Diagnóstico",
      href: `/diagnostico`,
      cta: "Completar diagnóstico",
    });
  }
  if (tenenciaPuntos < 15) {
    brechas.push({
      id: "tenencia",
      nombre: "Control del predio",
      explicacion: "No se ha registrado soporte de propiedad, tenencia, autorización o derecho de uso.",
      nivel: "critico",
      fuente: "Diagnóstico",
      href: `/diagnostico`,
      cta: "Completar en Diagnóstico",
    });
  }
  const metodologiaTexto = [expediente?.linea_base, expediente?.adicionalidad].filter(Boolean).join(" ");
  if (!mentions(metodologiaTexto, /metodolog|est[aá]ndar|vcs|verra|gold standard|redd/i)) {
    brechas.push({
      id: "metodologia",
      nombre: "Metodología / estándar",
      explicacion: "Metodología o estándar por definir con revisión especializada.",
      nivel: "importante",
      fuente: "Formulación",
      href: `/formulacion?predioId=${predioId}`,
      cta: "Completar en Formulación",
    });
  }
  if (!linea) {
    brechas.push({
      id: "linea",
      nombre: "Línea base preliminar",
      explicacion: "La línea base aún no tiene el detalle mínimo para una preevaluación.",
      nivel: "critico",
      fuente: "Formulación",
      href: `/formulacion?predioId=${predioId}`,
      cta: "Completar en Formulación",
    });
  }
  if (!adicionalidad) {
    brechas.push({
      id: "adicionalidad",
      nombre: "Adicionalidad",
      explicacion: "Falta documentar por qué los resultados no ocurrirían en el escenario de referencia.",
      nivel: "importante",
      fuente: "Formulación",
      href: `/formulacion?predioId=${predioId}`,
      cta: "Completar en Formulación",
    });
  }
  if (!riesgos) {
    brechas.push({
      id: "riesgos",
      nombre: "Riesgos de permanencia y fuga",
      explicacion: "Los riesgos iniciales de permanencia o fuga no están identificados.",
      nivel: "importante",
      fuente: "Formulación",
      href: `/formulacion?predioId=${predioId}`,
      cta: "Completar en Formulación",
    });
  }
  if (!salvaguardas) {
    brechas.push({
      id: "salvaguardas",
      nombre: "Salvaguardas y participación",
      explicacion: "Salvaguardas y partes interesadas por completar.",
      nivel: "importante",
      fuente: "Formulación",
      href: `/formulacion?predioId=${predioId}`,
      cta: "Completar en Formulación",
    });
  }
  if (cronoPresu < 10) {
    brechas.push({
      id: "crono",
      nombre: "Cronograma y presupuesto",
      explicacion: "El cronograma o el presupuesto inicial aún están incompletos.",
      nivel: "recomendado",
      fuente: "Formulación",
      href: `/formulacion?predioId=${predioId}`,
      cta: "Completar en Formulación",
    });
  }
  if (!monitoreo) {
    brechas.push({
      id: "monitoreo",
      nombre: "Plan de monitoreo",
      explicacion: "El plan de monitoreo requiere mayor detalle en formulación.",
      nivel: "importante",
      fuente: "Formulación",
      href: `/formulacion?predioId=${predioId}`,
      cta: "Completar en Formulación",
    });
  }

  const fortalezas: string[] = [];
  if (tienePoligono) fortalezas.push("Polígono y ubicación definidos");
  if (tieneGeo) fortalezas.push("Diagnóstico geoespacial disponible");
  if (linea) fortalezas.push("Línea base preliminar diligenciada");
  if (riesgos) fortalezas.push("Riesgos iniciales identificados");
  if (adicionalidad) fortalezas.push("Adicionalidad preliminar documentada");
  if (salvaguardas) fortalezas.push("Salvaguardas y partes interesadas registradas");
  if (cronoPresu === 10) fortalezas.push("Cronograma y presupuesto iniciales");
  if (monitoreo) fortalezas.push("Plan inicial de monitoreo mencionado");

  return {
    puntaje,
    estado: labelEstadoPreparacion(puntaje),
    criterios,
    fortalezas,
    brechas,
    formulacionPct,
    tieneDiagnostico: tieneGeo,
    tieneFormulacionMinima: formulacionPct >= 40,
  };
}

export function itemsPaquete(
  predio: PredioContexto,
  diagnostico: DiagnosticoContexto | null,
  expediente: ExpedienteContexto | null
): ItemPaquete[] {
  const metodologiaTexto = [expediente?.linea_base, expediente?.adicionalidad].filter(Boolean).join(" ");
  const monitoreoTexto = [expediente?.cronograma, expediente?.salvaguardas].filter(Boolean).join(" ");
  return [
    { id: "resumen", label: "Resumen de proyecto", incluido: Boolean(predio.nombre && predio.tipo_proyecto) },
    { id: "poligono", label: "Polígono y área", incluido: predio.area_hectareas > 0 },
    { id: "diagnostico", label: "Resultado de diagnóstico geoespacial", incluido: Boolean(diagnostico) },
    { id: "linea", label: "Línea base preliminar", incluido: filled(expediente?.linea_base) },
    { id: "adicionalidad", label: "Adicionalidad preliminar", incluido: filled(expediente?.adicionalidad) },
    { id: "riesgos", label: "Riesgos iniciales", incluido: filled(expediente?.riesgos_permanencia) },
    { id: "salvaguardas", label: "Salvaguardas y partes interesadas", incluido: filled(expediente?.salvaguardas) },
    {
      id: "crono",
      label: "Cronograma y presupuesto",
      incluido: filled(expediente?.cronograma, 20) && filled(expediente?.presupuesto, 20),
    },
    { id: "monitoreo", label: "Plan inicial de monitoreo", incluido: mentions(monitoreoTexto, /monitor/i) },
    {
      id: "tenencia",
      label: "Soporte de control del predio",
      incluido: Boolean(predio.tenencia_declarada?.trim() && predio.codigo_catastral?.trim()),
      pendiente: "pendiente",
    },
    {
      id: "metodologia",
      label: "Metodología objetivo",
      incluido: mentions(metodologiaTexto, /metodolog|est[aá]ndar|vcs|verra|gold standard|redd/i),
      pendiente: "pendiente",
    },
  ];
}

export interface EtapaRuta {
  id: number;
  titulo: string;
  objetivo: string;
  titular: string;
  renare?: string;
  ovv?: string;
  marketplace?: string;
  resultado: string;
  accionLabel: string;
  accionHref: string;
  accionSecundaria?: { label: string; href: string };
}

export const ETAPAS_RUTA: EtapaRuta[] = [
  {
    id: 1,
    titulo: "Factibilidad",
    objetivo: "Determinar si existe una iniciativa con información mínima para estructurarse.",
    titular: "Delimita el área, describe la actividad y registra información inicial.",
    renare: "La iniciativa debe revisar su ruta de inscripción y reporte desde factibilidad cuando aplique.",
    ovv: "Normalmente no interviene aún.",
    resultado: "Diagnóstico y decisión de continuar a formulación.",
    accionLabel: "Ver diagnóstico",
    accionHref: "/diagnostico",
  },
  {
    id: 2,
    titulo: "Formulación",
    objetivo: "Estructurar la línea base, adicionalidad, riesgos, salvaguardas, cronograma, presupuesto y monitoreo inicial.",
    titular: "Completa el expediente preliminar.",
    renare: "Revisar requisitos de registro/reporte aplicables.",
    ovv: "Puede revisar posteriormente el diseño bajo el marco aplicable.",
    resultado: "Paquete de preevaluación para revisión técnica.",
    accionLabel: "Completar formulación",
    accionHref: "/formulacion",
  },
  {
    id: 3,
    titulo: "Validación por entidad validadora",
    objetivo: "Obtener evaluación independiente del diseño de la iniciativa, según la ruta aplicable.",
    titular: "Contrata una entidad validadora competente e independiente y entrega el paquete de diseño.",
    ovv: "Valida metodología, línea base, adicionalidad, cuantificación, salvaguardas y plan de monitoreo, según su alcance acreditado.",
    renare: "Registrar/actualizar fase y soportes cuando corresponda.",
    resultado: "Declaración o informe de validación.",
    accionLabel: "Preparar paquete para entidad validadora",
    accionHref: "#paquete",
    accionSecundaria: { label: "Ver entidades validadoras en Marketplace", href: "/marketplace" },
  },
  {
    id: 4,
    titulo: "Registro y reporte en RENARE",
    objetivo: "Asegurar trazabilidad nacional de la iniciativa y de sus resultados, conforme a los requisitos aplicables.",
    titular: "Registra o actualiza información de la iniciativa y reporta avances/resultados cuando corresponda.",
    renare: "Concentra el registro y trazabilidad de las iniciativas de mitigación de GEI.",
    ovv: "Puede aportar documentos de validación/verificación cuando sean requeridos.",
    resultado: "Referencia o constancia de la gestión realizada, según la fuente oficial.",
    accionLabel: "Preparar información RENARE",
    accionHref: "#renare",
    accionSecundaria: { label: "Registrar referencia", href: "#renare" },
  },
  {
    id: 5,
    titulo: "Implementación y monitoreo",
    objetivo: "Ejecutar las actividades y recopilar evidencia de resultados.",
    titular: "Implementa el proyecto y aplica el plan de monitoreo.",
    ovv: "No monitorea por el titular; interviene en la verificación independiente posterior.",
    renare: "Se reportan resultados y cambios según requisitos aplicables.",
    resultado: "Informe de monitoreo y evidencia.",
    accionLabel: "Ver roadmap MRV",
    accionHref: "#recursos",
  },
  {
    id: 6,
    titulo: "Verificación de resultados por entidad validadora",
    objetivo: "Comprobar de manera independiente los resultados de mitigación reportados.",
    titular: "Entrega informe de monitoreo, cálculos y soportes.",
    ovv: "Verifica datos, metodología, resultados, fugas, permanencia y evidencia, según alcance acreditado.",
    renare: "Recibe o referencia resultados reportados conforme a la ruta aplicable.",
    resultado: "Declaración o informe de verificación.",
    accionLabel: "Ver requisitos futuros de MRV",
    accionHref: "#recursos",
  },
  {
    id: 7,
    titulo: "Resultados verificados / emisión según la ruta aplicable",
    objetivo: "Obtener el reconocimiento, certificación o emisión aplicable a los resultados verificados.",
    titular: "Tramita el reconocimiento ante el estándar, programa o registro aplicable.",
    ovv: "Su informe de verificación respalda el trámite, pero no emite créditos.",
    renare: "Mantiene trazabilidad nacional de los resultados cuando aplique.",
    resultado: "Resultados reconocidos o certificados según la ruta aplicable.",
    accionLabel: "Consultar referentes",
    accionHref: "#recursos",
  },
  {
    id: 8,
    titulo: "Pago por resultados, transferencia o retiro",
    objetivo: "Acordar el uso comercial o programático de resultados verificables.",
    titular: "Negocia con comprador, programa o financiador y formaliza el acuerdo.",
    marketplace: "Conecta titulares con compradores, financiadores, consultores y entidades validadoras; no ejecuta pagos en el MVP.",
    renare: "Puede requerirse trazabilidad o reporte para prevenir doble uso, según el caso.",
    resultado: "Pago por resultados, transferencia o retiro conforme a contrato y normas aplicables.",
    accionLabel: "Ir a Marketplace",
    accionHref: "/marketplace",
  },
  {
    id: 9,
    titulo: "Cierre y seguimiento",
    objetivo: "Cerrar formalmente la iniciativa o cumplir obligaciones posteriores de seguimiento.",
    titular: "Reporta cierre, conserva soportes y gestiona obligaciones pendientes.",
    renare: "Se actualiza el estado de cierre cuando corresponda.",
    ovv: "Puede intervenir si la ruta exige una verificación final.",
    resultado: "Iniciativa cerrada o en seguimiento post-cierre.",
    accionLabel: "Ver guía de cierre",
    accionHref: "#recursos",
  },
];

export function etapaActualId(
  preparacion: ResultadoPreparacion,
  referencia?: ReferenciaRenare | null
): number {
  if (referencia?.estado === "cierre_reportado") return 9;
  if (referencia?.estado === "resultados_reportados") return 5;
  if (referencia?.estado === "referencia_registrada") return 4;
  if (!preparacion.tieneDiagnostico) return 1;
  if (preparacion.formulacionPct < 70) return 2;
  if (preparacion.puntaje < 85) return 3;
  return 3;
}

export function estadoDeEtapa(
  etapaId: number,
  actual: number,
  preparacion: ResultadoPreparacion,
  referencia?: ReferenciaRenare | null
): EstadoEtapa {
  if (etapaId < actual) return "completada";
  if (etapaId === actual) {
    if (etapaId >= 3 && etapaId <= 6) return "requiere_verificacion_externa";
    return "en_curso";
  }
  if (etapaId === 2 && !preparacion.tieneDiagnostico) return "bloqueada";
  if (etapaId === 3 && preparacion.formulacionPct < 70) return "bloqueada";
  if (etapaId >= 5) return "futura";
  if (etapaId === 4 && referencia?.estado === "no_iniciado") return "pendiente";
  return "pendiente";
}

export function labelEstadoEtapa(estado: EstadoEtapa): string {
  switch (estado) {
    case "completada":
      return "Completada";
    case "en_curso":
      return "En curso";
    case "pendiente":
      return "Pendiente";
    case "bloqueada":
      return "Bloqueada";
    case "futura":
      return "Futura";
    case "requiere_verificacion_externa":
      return "Requiere verificación externa";
  }
}

export function factorByKey(factores: ScoreFactor[] | undefined, key: string): ScoreFactor | undefined {
  return factores?.find((f) => f.key === key);
}

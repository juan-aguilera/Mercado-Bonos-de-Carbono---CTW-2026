export interface GuiaPlantilla {
  id: string;
  titulo: string;
  descripcion: string;
  etapa: string;
  tipo: "guia" | "plantilla";
  contenido: string;
}

export interface CasoReferencia {
  id: string;
  nombre: string;
  tipo: string;
  region: string;
  estandar: string;
  etapaPublica: string;
  metodologia: string;
  enlace: string;
  aprendizaje: string;
  fechaConsulta: string;
}

export const GUIAS_PLANTILLAS: GuiaPlantilla[] = [
  {
    id: "linea-base",
    titulo: "Guía de línea base preliminar",
    descripcion: "Qué información mínima reunir para describir el escenario de referencia.",
    etapa: "Formulación",
    tipo: "guia",
    contenido:
      "Describe el uso del suelo, la cobertura y las presiones actuales. Explica qué ocurriría sin el proyecto y con qué fuentes (diagnóstico, literatura, datos oficiales). Esta guía es orientativa: adáptala a la metodología y al estándar aplicables.",
  },
  {
    id: "adicionalidad",
    titulo: "Matriz de adicionalidad",
    descripcion: "Preguntas para argumentar por qué el resultado no ocurriría en el escenario de referencia.",
    etapa: "Formulación",
    tipo: "plantilla",
    contenido:
      "Barreras: financieras, institucionales, de tenencia, de capacidad. Alternativas: ¿qué haría el titular sin el incentivo de resultados verificables? Evidencia: costos, precios, prácticas locales. Orientativo — adaptar a metodología y estándar aplicable.",
  },
  {
    id: "tenencia",
    titulo: "Lista de información sobre control del predio",
    descripcion: "Soportes habituales de propiedad, tenencia, autorización o derecho de uso.",
    etapa: "Factibilidad",
    tipo: "plantilla",
    contenido:
      "Identificación del titular o responsable, tipo de derecho (propiedad, posesión, uso, mandato), documento de soporte, vigencia, autorizaciones de terceros o comunidades, y código catastral si existe. No sustituye revisión jurídica.",
  },
  {
    id: "riesgos",
    titulo: "Matriz de riesgos de permanencia y fuga",
    descripcion: "Identifica amenazas a la permanencia de resultados y posibles fugas.",
    etapa: "Formulación",
    tipo: "plantilla",
    contenido:
      "Permanencia: fuego, tala, cambio de uso, conflicto, gobernanza. Fuga: desplazamiento de la actividad a áreas vecinas. Para cada riesgo: probabilidad, impacto, medida de mitigación y evidencia. Orientativo — adaptar a metodología y estándar aplicable.",
  },
  {
    id: "salvaguardas",
    titulo: "Guía de salvaguardas y participación",
    descripcion: "Partes interesadas, consulta y salvaguardas sociales y ambientales.",
    etapa: "Formulación",
    tipo: "guia",
    contenido:
      "Mapea comunidades, autoridades y otros interesados. Documenta consulta, acuerdos y distribución de beneficios. Revisa salvaguardas ambientales (biodiversidad, agua) y sociales (derechos, género, trabajo). Orientativo — adaptar a metodología y estándar aplicable.",
  },
  {
    id: "cronograma",
    titulo: "Plantilla de cronograma y presupuesto",
    descripcion: "Fases, hitos y costos iniciales de estructuración e implementación.",
    etapa: "Formulación",
    tipo: "plantilla",
    contenido:
      "Fases sugeridas: factibilidad, formulación, revisión técnica/OVV, registro/reporte, implementación, verificación. Incluye CAPEX inicial, OPEX de monitoreo y reserva para salvaguardas. Orientativo — adaptar a metodología y estándar aplicable.",
  },
  {
    id: "ovv",
    titulo: "Preguntas para contratar consultor o OVV",
    descripcion: "Alcance, independencia, acreditación y entregables a pedir.",
    etapa: "Validación por OVV",
    tipo: "guia",
    contenido:
      "¿Está acreditada para el alcance y la metodología? ¿Es independiente del desarrollador? ¿Qué documentos pide? ¿Cuál es el plazo y el producto (informe de validación o verificación)? CarbonFlow no contrata ni valida en tu nombre.",
  },
  {
    id: "renare",
    titulo: "Guía de información inicial para RENARE",
    descripcion: "Datos frecuentes a preparar antes de gestionar el registro o reporte nacional.",
    etapa: "Registro y reporte en RENARE",
    tipo: "guia",
    contenido:
      "Identificación del titular, ubicación y polígono, tipo de iniciativa, línea base y metodología prevista, periodo de implementación, salvaguardas, plan de monitoreo y resultados reportados si existen. Verifica campos y procedimiento en RENARE/SUIA.",
  },
];

export const CASOS_REFERENCIA: CasoReferencia[] = [
  {
    id: "visso-amazon",
    nombre: "Iniciativas REDD+ de referencia pública en la Amazonía",
    tipo: "Conservación / REDD+",
    region: "Colombia — Amazonía (referencia general)",
    estandar: "Registros públicos (p. ej. Verra) y trazabilidad nacional cuando aplique",
    etapaPublica: "Según la ficha pública del registro consultado",
    metodologia: "Metodologías REDD+ publicadas por el estándar correspondiente",
    enlace: "https://registry.verra.org/",
    aprendizaje:
      "Revisa cómo se describe el área, la amenaza de deforestación, la adicionalidad y los documentos públicos de validación. No copies el diseño: úsalo para entender el nivel de evidencia que pide una revisión independiente.",
    fechaConsulta: "2026-08-16",
  },
  {
    id: "restauracion-andina",
    nombre: "Proyectos de restauración en ecosistemas andinos",
    tipo: "Restauración forestal",
    region: "Colombia — región andina (referencia general)",
    estandar: "Estándares voluntarios y/o programas nacionales, según ficha pública",
    etapaPublica: "Según fuente pública",
    metodologia: "Metodologías de forestación/reforestación o restauración publicadas",
    enlace: "https://www.goldstandard.org/projects",
    aprendizaje:
      "Observa el tratamiento de línea base en tierras degradadas, salvaguardas comunitarias y el plan de monitoreo de supervivencia y cobertura.",
    fechaConsulta: "2026-08-16",
  },
  {
    id: "renare-consulta",
    nombre: "Consulta de iniciativas en fuentes oficiales colombianas",
    tipo: "Cualquier iniciativa de mitigación de GEI",
    region: "Colombia",
    estandar: "RENARE / SUIA (fuente oficial)",
    etapaPublica: "La fase publicada por la autoridad, si está disponible",
    metodologia: "La declarada en la ficha oficial",
    enlace: "https://www.minambiente.gov.co/",
    aprendizaje:
      "Usa la fuente oficial para contrastar nombres, fases y documentos. CarbonFlow no consulta RENARE en tu nombre en esta versión.",
    fechaConsulta: "2026-08-16",
  },
];

export const PREGUNTAS_FAQ = [
  "¿Qué diferencia hay entre validación y verificación?",
  "¿Qué hace una OVV?",
  "¿Qué debo preparar para RENARE?",
  "¿Qué es adicionalidad?",
  "¿Qué significa un resultado verificado?",
  "¿Qué necesito antes de buscar un comprador?",
];

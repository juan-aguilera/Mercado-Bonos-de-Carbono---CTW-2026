export interface CertificadoTradicionResult {
  codigoCatastral: string | null;
  departamento: string | null;
  municipio: string | null;
}

// Extrae los campos del Certificado de Tradicion y Libertad (SNR) a partir de
// su texto plano. Los tres campos viven siempre en la misma linea, cerca del
// inicio del documento (antes del historial de anotaciones), por lo que una
// regex por etiqueta es suficiente y no requiere IA. Ver PRD / CLAUDE.md.
export function extraerCertificadoTradicion(text: string): CertificadoTradicionResult {
  const codigoCatastralMatch = text.match(/CODIGO CATASTRAL:\s*(\d+)/i);
  const departamentoMatch = text.match(/DEPTO:\s*(.+?)\s*MUNICIPIO:/i);
  const municipioMatch = text.match(/MUNICIPIO:\s*(.+?)\s*VEREDA:/i);

  return {
    codigoCatastral: codigoCatastralMatch?.[1]?.trim() || null,
    departamento: departamentoMatch?.[1]?.trim() || null,
    municipio: municipioMatch?.[1]?.trim() || null,
  };
}

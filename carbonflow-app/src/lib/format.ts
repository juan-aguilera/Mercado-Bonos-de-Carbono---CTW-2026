// Formato numerico estandar de la plataforma: separador de miles (coma) y
// punto decimal, p. ej. 4,744,668.51 — nunca cifras sin agrupar ni con coma
// decimal.
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

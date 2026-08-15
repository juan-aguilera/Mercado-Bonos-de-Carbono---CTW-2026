// Simulador de contraparte (PRD seccion 2.4/2.5): tras una solicitud real del
// usuario, genera una respuesta automatica que completa el flujo end-to-end
// sin necesitar un vendedor o aliado financiero humano. Se declara como
// simulado tanto en el codigo como en la interfaz.

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function simulatedVendorReply(params: {
  titulo: string;
  precioOrientativo?: number | null;
  volumenToneladas?: number | null;
}): string {
  const { titulo, precioOrientativo, volumenToneladas } = params;
  const precio = precioOrientativo ? `USD ${precioOrientativo}/tCO2e` : "un precio a definir";
  const volumen = volumenToneladas ? `${volumenToneladas} tCO2e disponibles` : "el volumen consultado";
  return (
    `[Respuesta simulada] Gracias por tu interés en "${titulo}". Podemos ofrecer ${volumen} a ${precio}, ` +
    `sujeto a verificación final del estándar. ¿Quieres agendar una llamada para revisar condiciones y documentación de soporte?`
  );
}

export function simulatedFinancierReply(params: { titulo: string; montoRequerido?: number | null }): string {
  const { titulo, montoRequerido } = params;
  const monto = montoRequerido ? `USD ${montoRequerido.toLocaleString("en-US")}` : "el monto solicitado";
  return (
    `[Respuesta simulada] Hemos revisado el perfil de "${titulo}". Existe interés preliminar en explorar ` +
    `una estructura de financiación verde por ${monto}, sujeto a debida diligencia y revisión del data room. ` +
    `Un analista se pondría en contacto para los siguientes pasos.`
  );
}

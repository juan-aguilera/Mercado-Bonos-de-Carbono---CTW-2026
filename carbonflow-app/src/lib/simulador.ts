// Simulador de contraparte (PRD seccion 2.4/2.5): tras una solicitud real del
// usuario, genera una respuesta automatica que completa el flujo end-to-end
// sin necesitar un vendedor o aliado financiero humano. Se declara como
// simulado tanto en el codigo como en la interfaz.

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function simulatedOvvReply(): string {
  return (
    "Hemos recibido la información preliminar. Para evaluar un posible alcance de preevaluación, requeriríamos revisar " +
    "la información de control del predio, línea base y objetivo de validación. Esto no constituye aceptación, cotización, " +
    "contratación ni inicio de validación."
  );
}

export function simulatedCarbonProjectReply(): string {
  return (
    "Hemos recibido tu manifestación de interés. La organización evaluará la compatibilidad con su necesidad declarada " +
    "y podrá solicitar información adicional. Esto no constituye disponibilidad de créditos, precio, reserva, compra ni contrato."
  );
}

export function simulatedGreenFinanceReply(): string {
  return (
    "Hemos recibido la información preliminar. La solicitud será revisada frente a criterios de etapa, documentación, " +
    "uso previsto de recursos y perfil de riesgo. Esto no constituye una aprobación, oferta, compromiso de financiación " +
    "ni recomendación de inversión."
  );
}

export function simulatedMarketplaceReply(category: "ovv" | "carbon_project" | "reported_credit" | "green_finance") {
  if (category === "ovv") return simulatedOvvReply();
  if (category === "green_finance") return simulatedGreenFinanceReply();
  return simulatedCarbonProjectReply();
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "La API key de OpenRouter (OPENROUTER_API_KEY) no está configurada en .env.local" },
      { status: 400 }
    );
  }

  let body: {
    predio: {
      nombre: string;
      area_hectareas: number;
      tipo_proyecto: string;
      ubicacion_display: string | null;
    };
    amenazas: string;
    actividades: string;
    comunidad: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  const { predio, amenazas, actividades, comunidad } = body;
  if (!predio) {
    return NextResponse.json({ error: "Faltan los datos del predio" }, { status: 400 });
  }

  const systemInstruction = `Eres un consultor líder de estrategia ambiental y estructurador sénior de proyectos de créditos de carbono y bonos verdes bajo estándares internacionales de alta integridad.
Tu objetivo es formular un Documento de Diseño de Proyecto (PDD - Project Design Document) riguroso, institucional y exhaustivo para un proyecto forestal en Colombia bajo estándares internacionales (VCS/Verra, Gold Standard, CCB).

Debes responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura exacta:
{
  "resumenEjecutivo": {
    "visionGeneral": "Resumen ejecutivo institucional de alto nivel explicando el propósito, alcance y propuesta de valor del proyecto.",
    "creditosEstimadosAnual": "ej. 45,000 tCO2e/año",
    "inversionRequerida": "ej. $450,000 USD",
    "tirEstimada": "ej. 24.5%",
    "vanEstimado": "ej. $1,250,000 USD (tasa 10%)",
    "beneficiariosDirectos": "ej. 120 familias locales"
  },
  "problematica": {
    "diagnosticoTerritorial": "Diagnóstico exhaustivo del territorio, presiones sobre el ecosistema y estado de conservación.",
    "causasDeforestacion": "Identificación de factores directos e indirectos de deforestación y degradación (ganadería, tala, quemas).",
    "arbolProblemasSoluciones": "Análisis estructurado de causas raíz, efectos y alternativas de solución sostenibles.",
    "actoresClave": [
      {
        "actor": "Nombre del grupo o actor (ej. Comunidades Afrocolombianas / Indígenas / Pequeños Propietarios)",
        "rol": "Rol en el territorio",
        "interesImpacto": "Interés e impacto en el proyecto",
        "estrategiaInvolucramiento": "Estrategia de participación y acuerdos"
      },
      {
        "actor": "Autoridad Ambiental Local (CAR / Parques)",
        "rol": "Vigilancia y regulación normativa",
        "interesImpacto": "Cumplimiento normativo y conectividad de corredores",
        "estrategiaInvolucramiento": "Mesa técnica de coordinación y articulación"
      },
      {
        "actor": "Empresas Compradoras / Inversionistas",
        "rol": "Demanda de créditos y cofinanciación",
        "interesImpacto": "Compensación de huella de carbono y no causación de impuesto",
        "estrategiaInvolucramiento": "Contratos de compra anticipada (Offtake agreements)"
      }
    ]
  },
  "analisisTecnico": {
    "localizacionLimites": "Límites geoespaciales, coordenadas de referencia, accesibilidad y criterios de elegibilidad de tierras.",
    "metodologiaEstandar": "Estándar aplicable (VCS VM0007 / REDD+ / Gold Standard) y justificación metodológica.",
    "lineaBaseReferencia": "Definición cuantitativa de la línea base histórica y proyección de deforestación evitada.",
    "demostracionAdicionalidad": "Pruebas de adicionalidad financiera, de barreras de inversión y de práctica común conforme a la Resolución 1447 de 2018.",
    "proyeccionRemociones": "Cálculo y modelación de remociones/reducciones netas de GEI anuales y acumuladas a 20 años."
  },
  "riesgosSalvaguardas": {
    "riesgosPermanenciaFugas": "Identificación de riesgos de reversión (incendios, plagas, fugas de actividad) y reserva en buffer pool.",
    "salvaguardasSocialesAmbientales": "Cumplimiento de Salvaguardas de Cancún y estándares CCB (Clima, Comunidad y Biodiversidad).",
    "mecanismoDistribucionBeneficios": "Mecanismo transparente y equitativo de distribución de ingresos de carbono (Benefit-Sharing Plan).",
    "gobernanzaConsultaPrevia": "Protocolo de Consulta Previa, Libre e Informada (CLPI / FPIC) y mecanismo de peticiones, quejas y reclamos (PQR)."
  },
  "evaluacionFinanciera": {
    "capexInicial": "Desglose de inversión inicial (estudios de campo, dMRV, validación y siembra/guardabosques).",
    "opexAnual": "Costos operativos anuales (monitoreo satelital, auditorías de verificación, pagos a guardabosques).",
    "flujoCajaProyectado": "Proyección de ingresos brutos por venta de créditos de carbono vs. costos operativos netos a 20 años.",
    "indicadoresFinancieros": {
      "vpn": "$1,180,000 USD",
      "tir": "23.8%",
      "payback": "3.5 años",
      "precioCarbonoSostenibilidad": "$9.50 USD / tCO2e"
    },
    "analisisSensibilidad": "Evaluación ante variaciones en el precio del carbono (±20%) y cambios en la tasa de deforestación evitada."
  },
  "cronogramaOperativo": [
    {
      "fase": "Fase 1: Prefactibilidad y Diseño (PDD)",
      "periodo": "Meses 1 - 3",
      "actividadesClave": "Levantamiento LiDAR/satelital, talleres de CLPI y redacción final del PDD",
      "entregableHito": "PDD radicado ante organismo validador"
    },
    {
      "fase": "Fase 2: Validación y Registro",
      "periodo": "Meses 4 - 7",
      "actividadesClave": "Auditoría VVB externa y registro oficial en plataforma (Verra/RENARE)",
      "entregableHito": "Dictamen positivo de validación"
    },
    {
      "fase": "Fase 3: Implementación y Monitoreo dMRV",
      "periodo": "Meses 8 - 18",
      "actividadesClave": "Instalación de estaciones de monitoreo, patrullajes y enriquecimiento forestal",
      "entregableHito": "Primer reporte de monitoreo verificado"
    },
    {
      "fase": "Fase 4: Verificación y Primera Emisión",
      "periodo": "Meses 19 - 24",
      "actividadesClave": "Auditoría de verificación ex-post y emisión de créditos en el registro",
      "entregableHito": "Emisión formal de créditos de carbono"
    }
  ],
  "kpisSeguimiento": [
    {
      "categoria": "Impacto Climático",
      "indicador": "Emisiones netas evitadas / removidas (tCO2e)",
      "metaAnual": "100% de la cuota anual estimada",
      "frecuenciaMonitoreo": "Monitoreo continuo dMRV / Reporte anual"
    },
    {
      "categoria": "Biodiversidad",
      "indicador": "Hectáreas de bosque primario y secundario bajo conservación efectiva",
      "metaAnual": "Cobertura vegetal >= 95% del polígono",
      "frecuenciaMonitoreo": "Semestral (Satelital Sentinel/Planet)"
    },
    {
      "categoria": "Desarrollo Comunitario",
      "indicador": "Empleos verdes directos y familias vinculadas al mecanismo de beneficios",
      "metaAnual": ">= 30 empleos locales creados",
      "frecuenciaMonitoreo": "Trimestral"
    },
    {
      "categoria": "Gobernanza",
      "indicador": "Resolución de solicitudes en el mecanismo de quejas (PQR)",
      "metaAnual": "100% de solicitudes atendidas en < 15 días",
      "frecuenciaMonitoreo": "Mensual"
    }
  ]
}

No incluyas explicaciones adicionales fuera del JSON. Todo el contenido debe ser profesional, realista y en español.`;

  const userPrompt = `INFORMACIÓN DEL PREDIO:
- Nombre: ${predio.nombre}
- Área: ${predio.area_hectareas} hectáreas
- Ubicación: ${predio.ubicacion_display || "Colombia"}
- Tipo de proyecto: ${predio.tipo_proyecto}

DATOS SUMINISTRADOS POR EL USUARIO:
- Amenazas del predio / deforestación: ${amenazas}
- Actividades de restauración/conservación planeadas: ${actividades}
- Participación y acuerdos comunitarios: ${comunidad}`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "CarbonFlow PDD Generator",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Error de OpenRouter: ${response.status} - ${errText}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Respuesta vacía de OpenRouter" }, { status: 500 });
    }

    const result = JSON.parse(content);

    // Mapear también los campos legacy para compatibilidad con la base de datos de expedientes
    const fullResult = {
      ...result,
      lineaBase: result.analisisTecnico?.lineaBaseReferencia || "",
      adicionalidad: result.analisisTecnico?.demostracionAdicionalidad || "",
      riesgosPermanencia: result.riesgosSalvaguardas?.riesgosPermanenciaFugas || "",
      salvaguardas: result.riesgosSalvaguardas?.salvaguardasSocialesAmbientales || "",
      cronograma: JSON.stringify(result.cronogramaOperativo || []),
      presupuesto: `CAPEX: ${result.evaluacionFinanciera?.capexInicial || ""} | OPEX: ${result.evaluacionFinanciera?.opexAnual || ""}`,
    };

    return NextResponse.json(fullResult);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error desconocido al llamar a OpenRouter" },
      { status: 500 }
    );
  }
}

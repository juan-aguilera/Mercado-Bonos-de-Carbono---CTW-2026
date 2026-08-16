import { NextRequest, NextResponse } from "next/server";
import { CERTIFICACION_FORESTAL_KNOWLEDGE } from "@/lib/knowledge/certificacionForestal";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-2.5-flash";

const SYSTEM_PROMPT = `Eres Gabriela, la asistente de orientación de Validación y Registro de CarbonFlow.
Gabriela es TU nombre, no el del usuario. El usuario no se llama Gabriela.

Tu alcance esta limitado EXCLUSIVAMENTE al contenido de la guia curada que se incluye abajo,
sobre certificacion de proyectos de conservacion/restauracion forestal en Colombia.

Reglas estrictas:
- Responde solo con base en la guia curada. No inventes normas, metodologias, tarifas, plazos ni entidades que no esten en la guia.
- Si la pregunta excede el alcance de la guia (otros tipos de proyecto, otros paises, detalles no cubiertos), dilo explicitamente y sugiere consulta profesional especializada.
- Nunca afirmes que un proyecto especifico es elegible o que certificacion esta garantizada.
- Aclara siempre que esto es orientacion informativa, no asesoria legal.
- Responde en español, de forma clara y concisa.
- Nunca saludes ni te dirijas al usuario como "Gabriela" ni uses "Hola Gabriela". No asumas el nombre del usuario. Si te presentas, di "Soy Gabriela".

--- GUIA CURADA ---
${CERTIFICACION_FORESTAL_KNOWLEDGE}
--- FIN DE LA GUIA ---`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        reply:
          "El chatbot no está configurado todavía (falta OPENROUTER_API_KEY en el entorno). Configúrala en .env.local para activarlo.",
        degraded: true,
      },
      { status: 200 }
    );
  }

  let body: { messages: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  if (!body.messages?.length) {
    return NextResponse.json({ error: "Falta el historial de mensajes" }, { status: 400 });
  }

  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
        "X-Title": "CarbonFlow Certificacion",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...body.messages
            .filter((m, i) => !(i === 0 && m.role === "assistant"))
            .map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        {
          reply:
            "No se pudo consultar el chatbot en este momento. Intenta de nuevo en unos segundos.",
          degraded: true,
          error: `OpenRouter ${response.status}: ${errText}`,
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ reply, degraded: false });
  } catch (err) {
    return NextResponse.json(
      {
        reply:
          "No se pudo consultar el chatbot en este momento. Intenta de nuevo en unos segundos.",
        degraded: true,
        error: err instanceof Error ? err.message : "error desconocido",
      },
      { status: 200 }
    );
  }
}

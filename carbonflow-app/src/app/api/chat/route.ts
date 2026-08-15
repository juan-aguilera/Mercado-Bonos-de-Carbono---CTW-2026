import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CERTIFICACION_FORESTAL_KNOWLEDGE } from "@/lib/knowledge/certificacionForestal";

const SYSTEM_PROMPT = `Eres el asistente de orientación de certificación de CarbonFlow.

Tu alcance esta limitado EXCLUSIVAMENTE al contenido de la guia curada que se incluye abajo,
sobre certificacion de proyectos de conservacion/restauracion forestal en Colombia.

Reglas estrictas:
- Responde solo con base en la guia curada. No inventes normas, metodologias, tarifas, plazos ni entidades que no esten en la guia.
- Si la pregunta excede el alcance de la guia (otros tipos de proyecto, otros paises, detalles no cubiertos), dilo explicitamente y sugiere consulta profesional especializada.
- Nunca afirmes que un proyecto especifico es elegible o que certificacion esta garantizada.
- Aclara siempre que esto es orientacion informativa, no asesoria legal.
- Responde en español, de forma clara y concisa.

--- GUIA CURADA ---
${CERTIFICACION_FORESTAL_KNOWLEDGE}
--- FIN DE LA GUIA ---`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        reply:
          "El chatbot no está configurado todavía (falta ANTHROPIC_API_KEY en el entorno). Configúrala en .env.local para activarlo.",
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

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: body.messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const reply = textBlock && "text" in textBlock ? textBlock.text : "";

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

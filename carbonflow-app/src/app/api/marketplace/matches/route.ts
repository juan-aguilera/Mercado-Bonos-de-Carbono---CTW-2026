import { NextRequest, NextResponse } from "next/server";
import { computeCompatibility } from "@/lib/marketplace/compatibility";
import { fallbackNarrative, fallbackNarrativeForCompany, MATCH_DISCLAIMER } from "@/lib/marketplace/matchNarrative";
import { listingFromPublicCard, needFromPublicCard } from "@/lib/marketplace/publicPair";
import type { PublicNeedCard, PublicProjectCard, StrongMatch, StrongMatchNarrative } from "@/lib/marketplace/types";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-2.5-flash";
const MIN_SCORE = 40;
const MAX_PAIRS = 5;

const SYSTEM_PROMPT = `Eres un asistente de CarbonFlow que redacta explicaciones de coincidencia entre un proyecto climático y una necesidad publicada.

Reglas:
- Usa SOLO los datos públicos que te entregan. No inventes acreditaciones, precios, volúmenes certificados, elegibilidad ni compromisos.
- No recomiendes "la mejor" contraparte. No califiques calidad climática ni probabilidad de certificación.
- No uses las palabras rating, recomendado, garantizado, créditos disponibles, comprar ahora.
- Escribe en español, breve y concreto.
- Distingue información pública de información bajo solicitud.
- El borrador de manifestación debe ser no vinculante y decirlo explícitamente.
- Conserva los id que te pasan (needId o projectId).

Responde ÚNICAMENTE con JSON válido:
{
  "items": [
    {
      "needId": "si aplica",
      "projectId": "si aplica",
      "whyStrong": "1 o 2 frases",
      "toValidate": ["brecha o criterio a confirmar"],
      "sharePublic": ["campo o documento de nivel público"],
      "shareOnRequest": ["campo o documento bajo solicitud"],
      "draftMessage": "borrador de manifestación de interés, 4-6 líneas"
    }
  ]
}`;

function extractJson(text: string): { items?: Array<StrongMatchNarrative & { needId?: string; projectId?: string }> } | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as {
      items?: Array<StrongMatchNarrative & { needId?: string; projectId?: string }>;
    };
  } catch {
    return null;
  }
}

async function narrate(payload: unknown, fallbackMatches: StrongMatch[]): Promise<{ matches: StrongMatch[]; degraded: boolean }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return { matches: fallbackMatches, degraded: true };

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
        "X-Title": "CarbonFlow Marketplace Matches",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
        max_tokens: 1600,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: "Explica estas coincidencias filtradas por reglas.\n" + JSON.stringify(payload) },
        ],
      }),
    });
    if (!response.ok) return { matches: fallbackMatches, degraded: true };

    const data = await response.json();
    const parsed = extractJson(data.choices?.[0]?.message?.content ?? "");
    const items = parsed?.items ?? [];

    const matches = fallbackMatches.map((match) => {
      const ai = items.find((item) =>
        match.projectId ? item.projectId === match.projectId : item.needId === match.needId
      );
      if (!ai) return match;
      return {
        ...match,
        whyStrong: ai.whyStrong || match.whyStrong,
        toValidate: ai.toValidate?.length ? ai.toValidate : match.toValidate,
        sharePublic: ai.sharePublic?.length ? ai.sharePublic : match.sharePublic,
        shareOnRequest: ai.shareOnRequest?.length ? ai.shareOnRequest : match.shareOnRequest,
        draftMessage: ai.draftMessage || match.draftMessage,
      };
    });
    return { matches, degraded: false };
  } catch {
    return { matches: fallbackMatches, degraded: true };
  }
}

export async function POST(req: NextRequest) {
  let body: {
    direction?: "project-to-needs" | "need-to-projects";
    project?: PublicProjectCard;
    need?: PublicNeedCard;
    needs?: PublicNeedCard[];
    projects?: PublicProjectCard[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  const direction = body.direction ?? (body.need && body.projects?.length ? "need-to-projects" : "project-to-needs");

  if (direction === "need-to-projects") {
    if (!body.need || !body.projects?.length) {
      return NextResponse.json({ error: "Se requiere una necesidad y una lista de proyectos" }, { status: 400 });
    }
    const need = needFromPublicCard(body.need);
    const scored = body.projects
      .map((projectCard) => {
        const listing = listingFromPublicCard(projectCard);
        return { projectCard, listing, compatibility: computeCompatibility(listing, need) };
      })
      .filter((row) => row.compatibility.score >= MIN_SCORE)
      .sort((a, b) => b.compatibility.score - a.compatibility.score)
      .slice(0, MAX_PAIRS);

    if (scored.length === 0) {
      return NextResponse.json({ matches: [], disclaimer: MATCH_DISCLAIMER, degraded: false });
    }

    const fallbackMatches: StrongMatch[] = scored.map((row) => ({
      projectId: row.listing.id,
      projectTitle: row.listing.title,
      organization: row.projectCard.location ?? "Colombia",
      compatibility: row.compatibility,
      ...fallbackNarrativeForCompany(row.projectCard, body.need!, row.compatibility),
    }));

    const narrated = await narrate(
      {
        perspectiva: "empresa",
        necesidad: body.need,
        coincidencias: scored.map((row) => ({
          projectId: row.listing.id,
          proyecto: row.projectCard,
          compatibilidad: {
            score: row.compatibility.score,
            label: row.compatibility.label,
            coincide: row.compatibility.matches,
            falta: row.compatibility.gaps.slice(0, 4),
          },
        })),
      },
      fallbackMatches
    );
    return NextResponse.json({ ...narrated, disclaimer: MATCH_DISCLAIMER });
  }

  if (!body.project || !body.needs?.length) {
    return NextResponse.json({ error: "Se requiere un proyecto y una lista de necesidades" }, { status: 400 });
  }

  const listing = listingFromPublicCard(body.project);
  const scored = body.needs
    .map((needCard) => {
      const need = needFromPublicCard(needCard);
      return { needCard, need, compatibility: computeCompatibility(listing, need) };
    })
    .filter((row) => row.compatibility.score >= MIN_SCORE)
    .sort((a, b) => b.compatibility.score - a.compatibility.score)
    .slice(0, MAX_PAIRS);

  if (scored.length === 0) {
    return NextResponse.json({ matches: [], disclaimer: MATCH_DISCLAIMER, degraded: false });
  }

  const fallbackMatches: StrongMatch[] = scored.map((row) => ({
    needId: row.need.id,
    needTitle: row.need.title,
    organization: row.need.organization,
    compatibility: row.compatibility,
    ...fallbackNarrative(body.project!, row.needCard, row.compatibility),
  }));

  const narrated = await narrate(
    {
      perspectiva: "propietario",
      proyecto: body.project,
      coincidencias: scored.map((row) => ({
        needId: row.need.id,
        necesidad: row.needCard,
        compatibilidad: {
          score: row.compatibility.score,
          label: row.compatibility.label,
          coincide: row.compatibility.matches,
          falta: row.compatibility.gaps.slice(0, 4),
        },
      })),
    },
    fallbackMatches
  );
  return NextResponse.json({ ...narrated, disclaimer: MATCH_DISCLAIMER });
}

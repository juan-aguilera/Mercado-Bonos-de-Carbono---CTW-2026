import { NextRequest, NextResponse } from "next/server";
import { searchOfficialRegistries } from "@/lib/integrations/registries";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  let body: { termino?: string; expedienteId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  const termino = body.termino?.trim();
  if (!termino) {
    return NextResponse.json({ error: "Falta el término de búsqueda" }, { status: 400 });
  }

  const resultados = await searchOfficialRegistries(termino);

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("consultas_registro").insert(
        resultados.map((r) => ({
          expediente_id: body.expedienteId ?? null,
          owner_id: user.id,
          termino_busqueda: termino,
          registro: r.registro,
          resultado: r,
          enlace_oficial: r.enlaceOficial,
        }))
      );
    }
  } catch {
    // No bloquear la busqueda si Supabase no esta disponible.
  }

  return NextResponse.json({ resultados });
}

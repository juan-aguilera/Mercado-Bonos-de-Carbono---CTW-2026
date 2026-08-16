import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EstadoRenare } from "@/lib/validacionRegistro";

const ESTADOS: EstadoRenare[] = [
  "no_iniciado",
  "en_preparacion",
  "referencia_registrada",
  "resultados_reportados",
  "cierre_reportado",
];

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    const body = await req.json();
    const predioId = body.predioId as string | undefined;
    const estado = body.estado as EstadoRenare | undefined;

    if (!predioId || !estado || !ESTADOS.includes(estado)) {
      return NextResponse.json({ error: "predioId y estado válidos son requeridos" }, { status: 400 });
    }

    const payload = {
      predio_id: predioId,
      owner_id: user.id,
      estado,
      referencia_id: body.referenciaId ?? null,
      url_publica: body.urlPublica ?? null,
      observaciones: body.observaciones ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from("referencias_renare")
      .select("id")
      .eq("predio_id", predioId)
      .maybeSingle();

    const query = existing
      ? supabase.from("referencias_renare").update(payload).eq("id", existing.id).select().single()
      : supabase.from("referencias_renare").insert(payload).select().single();

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message, referencia: payload }, { status: 200 });
    return NextResponse.json({ referencia: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Supabase no está configurado" },
      { status: 500 }
    );
  }
}

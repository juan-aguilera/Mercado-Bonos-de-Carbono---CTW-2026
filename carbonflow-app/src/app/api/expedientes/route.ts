import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const predioId = req.nextUrl.searchParams.get("predioId");
  if (!predioId) {
    return NextResponse.json({ error: "predioId requerido" }, { status: 400 });
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("expedientes")
      .select("*")
      .eq("predio_id", predioId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ expediente: data });
  } catch (err) {
    return NextResponse.json(
      { expediente: null, error: err instanceof Error ? err.message : "Supabase no está configurado" },
      { status: 200 }
    );
  }
}

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
    const { predioId, ...fields } = body;
    if (!predioId) {
      return NextResponse.json({ error: "predioId requerido" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("expedientes")
      .select("id")
      .eq("predio_id", predioId)
      .maybeSingle();

    const payload: Record<string, unknown> = {
      predio_id: predioId,
      owner_id: user.id,
      linea_base: fields.lineaBase,
      adicionalidad: fields.adicionalidad,
      riesgos_permanencia: fields.riesgosPermanencia,
      salvaguardas: fields.salvaguardas,
      cronograma: fields.cronograma,
      presupuesto: fields.presupuesto,
      estado: fields.estado ?? "borrador",
      updated_at: new Date().toISOString(),
    };

    if (fields.pddData !== undefined) {
      payload.pdd_data = fields.pddData;
    }

    const query = existing
      ? supabase.from("expedientes").update(payload).eq("id", existing.id).select().single()
      : supabase.from("expedientes").insert(payload).select().single();

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ expediente: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Supabase no está configurado" },
      { status: 500 }
    );
  }
}

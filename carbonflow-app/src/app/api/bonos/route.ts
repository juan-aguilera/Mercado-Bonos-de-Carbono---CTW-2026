import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("perfiles_bonos_verdes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ perfiles: [], error: error.message });
    return NextResponse.json({ perfiles: data ?? [] });
  } catch (err) {
    return NextResponse.json({
      perfiles: [],
      error: err instanceof Error ? err.message : "Supabase no está configurado",
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Debes iniciar sesión para publicar" }, { status: 401 });
    }

    const body = await req.json();
    const { data, error } = await supabase
      .from("perfiles_bonos_verdes")
      .insert({
        owner_id: user.id,
        expediente_id: body.expedienteId ?? null,
        titulo: body.titulo,
        monto_requerido: body.montoRequerido ? Number(body.montoRequerido) : null,
        uso_de_recursos: body.usoDeRecursos,
        data_room_urls: body.dataRoomUrls ?? [],
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ perfil: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Supabase no está configurado" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("publicaciones_marketplace")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ publicaciones: [], error: error.message });
    return NextResponse.json({ publicaciones: data ?? [] });
  } catch (err) {
    return NextResponse.json({
      publicaciones: [],
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
      .from("publicaciones_marketplace")
      .insert({
        owner_id: user.id,
        expediente_id: body.expedienteId ?? null,
        titulo: body.titulo,
        tipo_proyecto: body.tipoProyecto,
        estandar: body.estandar,
        vintage: body.vintage ? Number(body.vintage) : null,
        co_beneficios: body.coBeneficios,
        precio_orientativo: body.precioOrientativo ? Number(body.precioOrientativo) : null,
        volumen_toneladas: body.volumenToneladas ? Number(body.volumenToneladas) : null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ publicacion: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Supabase no está configurado" },
      { status: 500 }
    );
  }
}

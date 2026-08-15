import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ predios: [] });
    }

    const { data, error } = await supabase
      .from("predios")
      .select("id, nombre, tipo_proyecto, area_hectareas, ubicacion_display, created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ predios: [], error: error.message });
    }

    return NextResponse.json({ predios: data ?? [] });
  } catch (err) {
    // Supabase todavia no configurado (.env.local): degradar sin romper la UI.
    return NextResponse.json({
      predios: [],
      error: err instanceof Error ? err.message : "Supabase no está configurado",
    });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { delay, simulatedFinancierReply } from "@/lib/simulador";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Debes iniciar sesión para conectar" }, { status: 401 });
    }

    const body = await req.json();
    const { perfilId, mensaje } = body;
    if (!perfilId) {
      return NextResponse.json({ error: "perfilId requerido" }, { status: 400 });
    }

    const { data: perfil, error: perfilError } = await supabase
      .from("perfiles_bonos_verdes")
      .select("titulo, monto_requerido")
      .eq("id", perfilId)
      .single();
    if (perfilError || !perfil) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    const { data: solicitud, error: insertError } = await supabase
      .from("solicitudes_conexion_financiera")
      .insert({ perfil_id: perfilId, inversor_id: user.id, mensaje })
      .select()
      .single();
    if (insertError || !solicitud) {
      return NextResponse.json({ error: insertError?.message ?? "No se pudo crear la solicitud" }, { status: 500 });
    }

    await delay(1500);

    const respuestaSimulada = simulatedFinancierReply({
      titulo: perfil.titulo,
      montoRequerido: perfil.monto_requerido,
    });

    const { data: actualizada } = await supabase
      .from("solicitudes_conexion_financiera")
      .update({ estado: "respondido", respuesta_simulada: respuestaSimulada, respondido_en: new Date().toISOString() })
      .eq("id", solicitud.id)
      .select()
      .single();

    return NextResponse.json({ solicitud: actualizada ?? solicitud });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Supabase no está configurado" },
      { status: 500 }
    );
  }
}

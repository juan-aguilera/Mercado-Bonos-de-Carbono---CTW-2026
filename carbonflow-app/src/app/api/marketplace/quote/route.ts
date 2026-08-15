import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { delay, simulatedVendorReply } from "@/lib/simulador";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Debes iniciar sesión para cotizar" }, { status: 401 });
    }

    const body = await req.json();
    const { publicacionId, mensaje } = body;
    if (!publicacionId) {
      return NextResponse.json({ error: "publicacionId requerido" }, { status: 400 });
    }

    const { data: publicacion, error: pubError } = await supabase
      .from("publicaciones_marketplace")
      .select("titulo, precio_orientativo, volumen_toneladas")
      .eq("id", publicacionId)
      .single();
    if (pubError || !publicacion) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 });
    }

    const { data: solicitud, error: insertError } = await supabase
      .from("solicitudes_cotizacion")
      .insert({ publicacion_id: publicacionId, comprador_id: user.id, mensaje })
      .select()
      .single();
    if (insertError || !solicitud) {
      return NextResponse.json({ error: insertError?.message ?? "No se pudo crear la solicitud" }, { status: 500 });
    }

    await delay(1500);

    const respuestaSimulada = simulatedVendorReply({
      titulo: publicacion.titulo,
      precioOrientativo: publicacion.precio_orientativo,
      volumenToneladas: publicacion.volumen_toneladas,
    });

    const { data: actualizada } = await supabase
      .from("solicitudes_cotizacion")
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

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PREDIO_FIELDS =
  "id, nombre, tipo_proyecto, area_hectareas, ubicacion_display, tenencia_declarada, uso_del_suelo, objetivo_intervencion, codigo_catastral, departamento, municipio, created_at";

export async function GET(req: NextRequest) {
  const predioId = req.nextUrl.searchParams.get("predioId");

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ predios: [], contexto: null });
    }

    const { data: predios, error: prediosError } = await supabase
      .from("predios")
      .select(PREDIO_FIELDS)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (prediosError) {
      return NextResponse.json({ predios: [], contexto: null, error: prediosError.message });
    }

    const lista = predios ?? [];
    const selectedId = predioId && lista.some((p) => p.id === predioId) ? predioId : lista[0]?.id;

    if (!selectedId) {
      return NextResponse.json({ predios: lista, contexto: null });
    }

    const predio = lista.find((p) => p.id === selectedId)!;

    const [{ data: diagnostico }, { data: expediente }, renareResult] = await Promise.all([
      supabase
        .from("diagnosticos")
        .select("id, score, factores, co2e_por_anio, co2e_horizonte, horizonte_anios, fuentes, created_at")
        .eq("predio_id", selectedId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("expedientes")
        .select("*")
        .eq("predio_id", selectedId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("referencias_renare").select("*").eq("predio_id", selectedId).maybeSingle(),
    ]);

    const referenciaRenare = renareResult.error ? null : renareResult.data;

    return NextResponse.json({
      predios: lista,
      contexto: {
        predio,
        diagnostico: diagnostico ?? null,
        expediente: expediente ?? null,
        referenciaRenare: referenciaRenare ?? null,
      },
    });
  } catch (err) {
    return NextResponse.json({
      predios: [],
      contexto: null,
      error: err instanceof Error ? err.message : "Supabase no está configurado",
    });
  }
}

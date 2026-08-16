import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { REGISTROS_OFICIALES, type RegistroOficial } from "@/lib/integrations/proyectosRegistro";

export async function GET(req: NextRequest) {
  const registro = req.nextUrl.searchParams.get("registro")?.trim();
  const departamento = req.nextUrl.searchParams.get("departamento")?.trim();

  if (!registro || !REGISTROS_OFICIALES.includes(registro as RegistroOficial)) {
    return NextResponse.json(
      { error: "Selecciona un registro oficial: Verra, Gold Standard o RENARE." },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("proyectos_registro_oficial")
      .select(
        "id, registro, nombre, desarrollador, departamento, municipio, estado, tipo_proyecto, area_hectareas, vintage, enlace_oficial"
      )
      .eq("registro", registro)
      .order("departamento", { ascending: true })
      .order("nombre", { ascending: true });

    if (departamento) {
      query = query.eq("departamento", departamento);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json(
        {
          error:
            "No se pudo leer el catálogo. Ejecuta supabase/migrations/0003_proyectos_registro_oficial.sql en el SQL Editor de Supabase.",
          detail: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ proyectos: data ?? [] });
  } catch {
    return NextResponse.json(
      { error: "Supabase no está configurado. No se pueden listar los proyectos del registro." },
      { status: 503 }
    );
  }
}

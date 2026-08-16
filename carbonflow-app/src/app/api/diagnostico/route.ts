import { NextRequest, NextResponse } from "next/server";
import * as turf from "@turf/turf";
import type { Polygon, MultiPolygon } from "geojson";
import { getForestCover, fallbackForestCover } from "@/lib/integrations/gfw";
import { getProtectedAreaOverlap, fallbackProtectedArea } from "@/lib/integrations/runap";
import { getAdminLocation, fallbackAdminLocation } from "@/lib/integrations/geocode";
import { computeAreaHectares, computeScore, computeCo2eEstimate } from "@/lib/scoring";
import { createClient } from "@/lib/supabase/server";

interface DiagnosticoRequestBody {
  nombre?: string;
  tipoProyecto: string;
  geometry: Polygon | MultiPolygon;
  usoDelSuelo?: string;
  tenenciaDeclarada?: string;
  objetivoIntervencion?: string;
  codigoCatastral?: string;
  departamento?: string;
  municipio?: string;
}

export async function POST(req: NextRequest) {
  let body: DiagnosticoRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  if (!body.geometry) {
    return NextResponse.json({ error: "Falta la geometría del predio" }, { status: 400 });
  }

  const areaHectareas = computeAreaHectares(body.geometry);
  const centroid = turf.centroid(turf.feature(body.geometry));
  const [lon, lat] = centroid.geometry.coordinates;

  const [forestCoverResult, protectedAreaResult, locationResult] = await Promise.all([
    getForestCover(body.geometry),
    getProtectedAreaOverlap(body.geometry),
    getAdminLocation(lat, lon),
  ]);

  const forestCover = forestCoverResult.ok ? forestCoverResult.data! : fallbackForestCover();
  const protectedArea = protectedAreaResult.ok ? protectedAreaResult.data! : fallbackProtectedArea();
  const location = locationResult.ok ? locationResult.data! : fallbackAdminLocation();

  const sources = {
    cobertura: `Global Forest Watch Data API (${forestCoverResult.source})`,
    areaProtegida: `RUNAP / ArcGIS REST (${protectedAreaResult.source})`,
    ubicacion: `Nominatim / OpenStreetMap (${locationResult.source})`,
  };

  const { score, factors } = computeScore({
    areaHectares: areaHectareas,
    forestCover,
    protectedArea,
    form: {
      usoDelSuelo: body.usoDelSuelo ?? "",
      tenenciaDeclarada: body.tenenciaDeclarada ?? "",
      objetivoIntervencion: body.objetivoIntervencion ?? "",
    },
    dataSources: { gfwSource: sources.cobertura, runapSource: sources.areaProtegida },
  });

  const co2e = computeCo2eEstimate({ areaHectares: areaHectareas, forestCover });

  let predioId: string | undefined;
  let diagnosticoId: string | undefined;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: predio, error: predioError } = await supabase
        .from("predios")
        .insert({
          owner_id: user.id,
          nombre: body.nombre || "Predio sin nombre",
          tipo_proyecto: body.tipoProyecto,
          geometria: body.geometry,
          area_hectareas: areaHectareas,
          ubicacion_display: location.displayName,
          uso_del_suelo: body.usoDelSuelo,
          tenencia_declarada: body.tenenciaDeclarada,
          objetivo_intervencion: body.objetivoIntervencion,
          codigo_catastral: body.codigoCatastral,
          departamento: body.departamento,
          municipio: body.municipio,
        })
        .select("id")
        .single();

      if (!predioError && predio) {
        predioId = predio.id;
        const { data: diagnostico } = await supabase
          .from("diagnosticos")
          .insert({
            predio_id: predio.id,
            score,
            factores: factors,
            co2e_por_anio: co2e.toneladasCO2ePorAnio,
            co2e_horizonte: co2e.toneladasCO2eHorizonte,
            horizonte_anios: co2e.horizonteAnios,
            fuentes: sources,
          })
          .select("id")
          .single();
        diagnosticoId = diagnostico?.id;
      }
    }
  } catch {
    // Si Supabase no esta configurado todavia, el diagnostico se devuelve
    // igual sin persistir, para no bloquear la demo del nucleo diferenciador.
  }

  return NextResponse.json({
    predioId,
    diagnosticoId,
    areaHectareas,
    ubicacion: location.displayName,
    score,
    factors,
    co2e,
    forestCover,
    protectedArea,
    sources,
    fechaCalculo: new Date().toISOString(),
  });
}

"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { Polygon } from "geojson";
import { PROJECT_TYPES, DEFAULT_PROJECT_TYPE, type ProjectTypeId } from "@/lib/projectTypes";
import type { ScoreFactor, Co2eEstimate } from "@/lib/scoring";
import { generateDiagnosticoPdf } from "@/lib/pdf/diagnosticoPdf";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { StatusPill } from "@/components/ui/StatusPill";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import Link from "next/link";

const MapDraw = dynamic(
  () => import("@/components/diagnostico/MapDraw").then((m) => m.MapDraw),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-surface-container animate-pulse flex items-center justify-center text-on-surface-variant text-body-sm">
        Cargando mapa…
      </div>
    ),
  }
);

interface DiagnosticoResponse {
  predioId?: string;
  areaHectareas: number;
  ubicacion: string;
  score: number;
  factors: ScoreFactor[];
  co2e: Co2eEstimate;
  sources: Record<string, string>;
  fechaCalculo: string;
}

export default function DiagnosticoPage() {
  const [geometry, setGeometry] = useState<Polygon | null>(null);
  const [mapStatus, setMapStatus] = useState({ vertices: 0, closed: false });
  const [tipoProyecto, setTipoProyecto] = useState<ProjectTypeId>(DEFAULT_PROJECT_TYPE);
  const [nombre, setNombre] = useState("");
  const [usoDelSuelo, setUsoDelSuelo] = useState("");
  const [tenenciaDeclarada, setTenenciaDeclarada] = useState("");
  const [objetivoIntervencion, setObjetivoIntervencion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosticoResponse | null>(null);

  const selectedType = PROJECT_TYPES.find((t) => t.id === tipoProyecto)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geometry) {
      setError("Dibuja o carga un polígono antes de continuar.");
      return;
    }
    if (!selectedType.enabled) {
      setError(
        "Este tipo de proyecto está marcado como próximamente; solo conservación/restauración forestal está habilitado en el MVP."
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre || "Predio sin nombre",
          tipoProyecto,
          geometry,
          usoDelSuelo,
          tenenciaDeclarada,
          objetivoIntervencion,
        }),
      });
      if (!res.ok) throw new Error(`El servidor respondió ${res.status}`);
      const data: DiagnosticoResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? `No se pudo completar el diagnóstico (${err.message}). Intenta de nuevo.`
          : "No se pudo completar el diagnóstico. Intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 md:h-[calc(100vh-64px)] md:overflow-hidden">
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        {/* Left: control panel */}
        <div className="w-full md:w-[360px] shrink-0 border-r border-outline-variant bg-surface-container-lowest overflow-y-auto p-margin-mobile md:p-6 space-y-5">
          <div>
            <p className="font-data text-label-caps text-secondary mb-1">NÚCLEO DIFERENCIADOR</p>
            <h1 className="font-heading text-headline-lg text-on-surface">Diagnóstico geoespacial</h1>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Datos en vivo: Global Forest Watch, RUNAP y OpenStreetMap.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-body-sm font-medium text-on-surface mb-1">Tipo de proyecto</label>
              <div className="relative">
                <select
                  value={tipoProyecto}
                  onChange={(e) => setTipoProyecto(e.target.value as ProjectTypeId)}
                  className="w-full appearance-none bg-surface-container-lowest border border-outline-variant rounded text-on-surface text-body-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                >
                  {PROJECT_TYPES.map((t) => (
                    <option key={t.id} value={t.id} disabled={!t.enabled}>
                      {t.label}
                      {!t.enabled ? " (próximamente)" : ""}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
                  <MaterialIcon name="expand_more" />
                </div>
              </div>
              {!selectedType.enabled && (
                <p className="text-disclaimer-italic text-status-warning mt-1">
                  Este tipo de proyecto aún no está habilitado en el MVP.
                </p>
              )}
            </div>

            <div className="bg-surface-container-low rounded-lg border border-outline-variant p-3">
              <span className="font-data text-label-caps text-secondary block mb-1">Estado del polígono</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${mapStatus.closed ? "bg-status-success" : "bg-outline"}`} />
                <span className="font-data text-data-mono text-on-surface">
                  {mapStatus.closed ? `Cerrado · ${mapStatus.vertices} vértices` : `Dibujando · ${mapStatus.vertices} vértices`}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-body-sm font-medium text-on-surface mb-1">Nombre del predio</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Finca La Esperanza"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded text-body-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium text-on-surface mb-1">Uso del suelo</label>
              <input
                value={usoDelSuelo}
                onChange={(e) => setUsoDelSuelo(e.target.value)}
                placeholder="Ej. bosque natural"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded text-body-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium text-on-surface mb-1">Tenencia declarada</label>
              <input
                value={tenenciaDeclarada}
                onChange={(e) => setTenenciaDeclarada(e.target.value)}
                placeholder="Ej. propiedad privada con título"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded text-body-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-body-sm font-medium text-on-surface mb-1">Objetivo de la intervención</label>
              <textarea
                value={objetivoIntervencion}
                onChange={(e) => setObjetivoIntervencion(e.target.value)}
                rows={2}
                placeholder="Ej. conservar bosque en pie amenazado por expansión ganadera"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded text-body-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            {error && (
              <p className="text-body-sm text-on-error-container bg-error-container rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest-deep text-on-primary font-medium text-body-md py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-primary transition-colors disabled:opacity-50"
            >
              {loading ? "Consultando fuentes en vivo…" : "Generar diagnóstico"}
            </button>
          </form>
        </div>

        {/* Center: map */}
        <div className="flex-1 relative min-h-[360px] md:min-h-0">
          <MapDraw onGeometryChange={setGeometry} onStatusChange={setMapStatus} />
        </div>

        {/* Right: diagnostic results (glass panel) */}
        <aside className="w-full md:w-panel-width-md shrink-0 border-l border-outline-variant bg-surface/95 md:glass-panel flex flex-col md:h-full overflow-y-auto">
          {result ? (
            <ResultsPanel result={result} nombre={nombre || "Predio sin nombre"} tipoProyecto={selectedType.label} />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div>
                <MaterialIcon name="analytics" className="text-outline text-4xl mb-3" />
                <p className="text-body-sm text-on-surface-variant">
                  El resultado del diagnóstico (score, CO2e y alertas) aparecerá aquí.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function ResultsPanel({
  result,
  nombre,
  tipoProyecto,
}: {
  result: DiagnosticoResponse;
  nombre: string;
  tipoProyecto: string;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-outline-variant flex justify-between items-start bg-surface/50">
        <div>
          <h3 className="font-heading text-headline-md text-primary mb-1">Análisis Diagnóstico</h3>
          <p className="text-body-sm text-on-surface-variant">
            Predio: <span className="font-data text-data-mono text-on-surface">{nombre}</span>
          </p>
        </div>
        <StatusPill variant="success">Área activa</StatusPill>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <section>
          <h4 className="font-data text-label-caps text-on-surface-variant mb-4 uppercase tracking-wider">
            Score de prefactibilidad
          </h4>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
            <div className="flex items-center justify-center mb-6">
              <ScoreGauge score={result.score} />
            </div>
            <div className="space-y-0">
              {result.factors.map((f, i) => (
                <div
                  key={f.key}
                  className={`py-3 ${i < result.factors.length - 1 ? "border-b border-outline-variant/50" : ""}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm text-on-surface">{f.label}</span>
                    <span className="font-data text-data-mono text-primary font-bold">
                      {f.value0to100}/100 · {Math.round(f.weight * 100)}%
                    </span>
                  </div>
                  <p className="text-disclaimer-italic text-on-surface-variant mt-1">{f.explanation}</p>
                  <p className="text-disclaimer-italic text-outline mt-0.5">Fuente: {f.source}</p>
                </div>
              ))}
            </div>
            <p className="text-disclaimer-italic text-on-surface-variant mt-4 text-center border-t border-outline-variant pt-3">
              {result.areaHectareas.toFixed(2)} ha · {result.ubicacion}
            </p>
          </div>
        </section>

        <section>
          <h4 className="font-data text-label-caps text-on-surface-variant mb-4 uppercase tracking-wider">
            Impacto estimado
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-4 shadow-sm">
              <p className="text-body-sm text-on-surface-variant mb-1">CO2e estimado</p>
              <p className="font-heading text-headline-md text-primary font-bold">
                {result.co2e.toneladasCO2ePorAnio.toLocaleString("es-CO")}
                <span className="text-body-sm font-normal text-on-surface-variant"> t/año</span>
              </p>
            </div>
            <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-4 shadow-sm">
              <p className="text-body-sm text-on-surface-variant mb-1">Área total</p>
              <p className="font-heading text-headline-md text-primary font-bold">
                {result.areaHectareas.toFixed(1)}
                <span className="text-body-sm font-normal text-on-surface-variant"> ha</span>
              </p>
            </div>
          </div>
          <p className="text-disclaimer-italic text-on-surface-variant mt-3">{result.co2e.supuestos}</p>
        </section>
      </div>

      <div className="p-6 border-t border-outline-variant bg-surface/80 space-y-2">
        <button
          onClick={() =>
            generateDiagnosticoPdf({
              nombrePredio: nombre,
              tipoProyecto,
              areaHectareas: result.areaHectareas,
              ubicacion: result.ubicacion,
              score: result.score,
              factors: result.factors,
              co2e: result.co2e,
              fechaCalculo: result.fechaCalculo,
            })
          }
          className="w-full bg-secondary-container text-on-secondary-fixed-variant font-medium text-body-md py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-secondary-fixed transition-colors border border-outline-variant"
        >
          <MaterialIcon name="picture_as_pdf" />
          Exportar informe de diagnóstico
        </button>
        {result.predioId && (
          <Link
            href={`/formulacion?predioId=${result.predioId}`}
            className="w-full text-center rounded-lg bg-forest-deep text-on-primary py-3 font-medium text-body-md flex items-center justify-center gap-2 hover:bg-primary transition-colors"
          >
            Continuar a formulación
            <MaterialIcon name="arrow_forward" />
          </Link>
        )}
      </div>
    </div>
  );
}

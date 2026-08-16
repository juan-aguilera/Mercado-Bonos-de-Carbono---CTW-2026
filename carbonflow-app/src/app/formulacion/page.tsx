"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { generateExpedientePdf } from "@/lib/pdf/expedientePdf";
import { PROJECT_TYPES } from "@/lib/projectTypes";
import { formatNumber } from "@/lib/format";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Footer } from "@/components/Footer";

interface Predio {
  id: string;
  nombre: string;
  tipo_proyecto: string;
  area_hectareas: number;
  ubicacion_display: string | null;
}

const SECTIONS = [
  { id: "linea-base", label: "Línea Base y Adicionalidad" },
  { id: "riesgos", label: "Riesgos y Salvaguardas" },
  { id: "cronograma", label: "Cronograma y Presupuesto" },
];

function labelForType(id: string) {
  return PROJECT_TYPES.find((t) => t.id === id)?.label ?? id;
}

function FormulacionInner() {
  const searchParams = useSearchParams();
  const initialPredioId = searchParams.get("predioId");

  const [predios, setPredios] = useState<Predio[]>([]);
  const [predioId, setPredioId] = useState<string>(initialPredioId ?? "");
  const [loadingPredios, setLoadingPredios] = useState(true);

  const [lineaBase, setLineaBase] = useState("");
  const [adicionalidad, setAdicionalidad] = useState("");
  const [riesgosPermanencia, setRiesgosPermanencia] = useState("");
  const [salvaguardas, setSalvaguardas] = useState("");
  const [cronograma, setCronograma] = useState("");
  const [presupuesto, setPresupuesto] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/predios")
      .then((r) => r.json())
      .then((data) => {
        setPredios(data.predios ?? []);
        if (!predioId && data.predios?.[0]) setPredioId(data.predios[0].id);
      })
      .finally(() => setLoadingPredios(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!predioId) return;
    fetch(`/api/expedientes?predioId=${predioId}`)
      .then((r) => r.json())
      .then((data) => {
        const exp = data.expediente;
        if (exp) {
          setLineaBase(exp.linea_base ?? "");
          setAdicionalidad(exp.adicionalidad ?? "");
          setRiesgosPermanencia(exp.riesgos_permanencia ?? "");
          setSalvaguardas(exp.salvaguardas ?? "");
          setCronograma(exp.cronograma ?? "");
          setPresupuesto(exp.presupuesto ?? "");
        }
      });
  }, [predioId]);

  const predioSeleccionado = predios.find((p) => p.id === predioId);
  const completeness = [lineaBase, adicionalidad, riesgosPermanencia, salvaguardas, cronograma, presupuesto].filter(
    (v) => v.trim().length > 0
  ).length;
  const progressPct = Math.round((completeness / 6) * 100);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!predioId) {
      setMessage("Selecciona un predio ya diagnosticado antes de continuar.");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/expedientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          predioId,
          lineaBase,
          adicionalidad,
          riesgosPermanencia,
          salvaguardas,
          cronograma,
          presupuesto,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `El servidor respondió ${res.status}`);
      }
      setMessage("Expediente guardado.");
    } catch (err) {
      setMessage(
        err instanceof Error
          ? `No se pudo guardar (${err.message}). Si no has iniciado sesión, el diagnóstico no se persiste todavía.`
          : "No se pudo guardar el expediente."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!loadingPredios && predios.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-margin-mobile py-16 text-center space-y-4">
        <MaterialIcon name="assignment" className="text-outline text-4xl" />
        <h1 className="font-heading text-headline-lg text-on-surface">Formulación guiada</h1>
        <p className="text-on-surface-variant max-w-md">
          Aún no tienes ningún predio diagnosticado. La formulación continúa siempre desde un predio
          ya diagnosticado.
        </p>
        <Link
          href="/diagnostico"
          className="inline-flex items-center gap-2 rounded-lg bg-forest-deep text-on-primary px-5 py-2.5 font-medium hover:bg-primary transition-colors"
        >
          Ir al diagnóstico
          <MaterialIcon name="arrow_forward" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 flex flex-col md:flex-row w-full">
        {/* Form Section (Left Split) */}
        <div className="w-full md:w-[58%] flex flex-col bg-surface border-r border-outline-variant">
          <div className="p-margin-mobile md:p-margin-desktop border-b border-outline-variant bg-surface-container-lowest">
            <p className="font-data text-label-caps text-secondary mb-2">
              PROYECTO DE CONSERVACIÓN / RESTAURACIÓN FORESTAL
            </p>
            <h1 className="font-heading text-headline-lg text-on-surface">Formulación del Proyecto</h1>
            <p className="text-body-md text-on-surface-variant mt-2">
              Complete los detalles requeridos para la evaluación de adicionalidad y línea base.
            </p>

            <div className="mt-6">
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 mb-1">
                <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="flex justify-between font-data text-label-caps text-on-surface-variant">
                <span className="text-primary">{completeness} de 6 secciones</span>
                <span>{progressPct}% completado</span>
              </div>
            </div>

            <div className="flex gap-4 mt-6 overflow-x-auto pb-1">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="shrink-0 text-body-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <div className="p-margin-mobile md:p-margin-desktop flex-grow">
            <div className="mb-6">
              <label className="block text-body-sm font-medium text-on-surface mb-1">Predio</label>
              <select
                value={predioId}
                onChange={(e) => setPredioId(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded text-body-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                {predios.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — {formatNumber(p.area_hectareas, 1)} ha — {labelForType(p.tipo_proyecto)}
                  </option>
                ))}
              </select>
              {predioSeleccionado && !predioSeleccionado.tipo_proyecto.includes("forestal") && (
                <p className="text-disclaimer-italic text-status-warning mt-1">
                  Este tipo de proyecto todavía no tiene formulación completa habilitada en el MVP.
                </p>
              )}
            </div>

            {predioSeleccionado && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant">
                  <span className="font-data text-label-caps text-secondary block mb-1">Área total</span>
                  <div className="flex items-center gap-2">
                    <MaterialIcon name="straighten" className="text-secondary text-[18px]" />
                    <span className="font-data text-data-mono text-on-surface text-lg">
                      {formatNumber(predioSeleccionado.area_hectareas, 2)} ha
                    </span>
                  </div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant">
                  <span className="font-data text-label-caps text-secondary block mb-1">Ubicación</span>
                  <div className="flex items-center gap-2">
                    <MaterialIcon name="location_on" className="text-secondary text-[18px]" />
                    <span className="font-data text-data-mono text-on-surface text-sm truncate">
                      {predioSeleccionado.ubicacion_display ?? "No determinada"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-8">
              <div id="linea-base">
                <h2 className="font-heading text-headline-md text-on-surface mb-4 border-b border-outline-variant pb-2">
                  1. Línea base y adicionalidad
                </h2>
                <div className="space-y-5">
                  <Section
                    label="Línea base y escenario de proyecto"
                    value={lineaBase}
                    onChange={setLineaBase}
                    placeholder="Describe la situación actual del predio y el escenario proyectado sin intervención."
                  />
                  <Section
                    label="Adicionalidad y viabilidad financiera inicial"
                    value={adicionalidad}
                    onChange={setAdicionalidad}
                    placeholder="¿Por qué el proyecto no ocurriría sin el incentivo de créditos de carbono?"
                  />
                </div>
              </div>

              <div id="riesgos">
                <h2 className="font-heading text-headline-md text-on-surface mb-4 border-b border-outline-variant pb-2">
                  2. Riesgos y salvaguardas
                </h2>
                <div className="space-y-5">
                  <Section
                    label="Riesgos, permanencia y fugas"
                    value={riesgosPermanencia}
                    onChange={setRiesgosPermanencia}
                    placeholder="Riesgos de reversión, medidas de mitigación y monitoreo de permanencia."
                  />
                  <Section
                    label="Salvaguardas sociales, ambientales y comunitarias"
                    value={salvaguardas}
                    onChange={setSalvaguardas}
                    placeholder="Consentimiento, distribución de beneficios, mecanismos de queja."
                  />
                </div>
              </div>

              <div id="cronograma">
                <h2 className="font-heading text-headline-md text-on-surface mb-4 border-b border-outline-variant pb-2">
                  3. Cronograma y presupuesto
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Section label="Cronograma" value={cronograma} onChange={setCronograma} placeholder="Hitos clave y fechas." rows={4} />
                  <Section
                    label="Presupuesto y fuentes de financiación"
                    value={presupuesto}
                    onChange={setPresupuesto}
                    placeholder="Costos estimados y fuentes de recursos."
                    rows={4}
                  />
                </div>
              </div>

              {message && <p className="text-body-sm rounded-lg px-3 py-2 bg-surface-container-low">{message}</p>}
            </form>
          </div>

          <div className="p-margin-mobile md:p-margin-desktop border-t border-outline-variant bg-surface-container-lowest flex flex-col sm:flex-row justify-between items-center gap-3">
            <button
              type="button"
              onClick={() =>
                generateExpedientePdf({
                  nombrePredio: predioSeleccionado?.nombre ?? "Predio",
                  tipoProyecto: predioSeleccionado ? labelForType(predioSeleccionado.tipo_proyecto) : "",
                  lineaBase,
                  adicionalidad,
                  riesgosPermanencia,
                  salvaguardas,
                  cronograma,
                  presupuesto,
                })
              }
              className="w-full sm:w-auto px-6 py-2.5 rounded font-medium border border-primary text-primary hover:bg-primary-container/10 transition-colors flex items-center justify-center gap-2"
            >
              <MaterialIcon name="picture_as_pdf" className="text-[20px]" />
              Exportar PDF
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 rounded font-medium bg-forest-deep text-on-primary hover:bg-primary transition-colors disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar y continuar"}
            </button>
          </div>

          <div className="px-margin-mobile md:px-margin-desktop pb-margin-mobile md:pb-margin-desktop flex gap-6 text-body-sm">
            <Link href={`/certificacion?predioId=${predioId}`} className="text-primary hover:underline flex items-center gap-1">
              Continuar a certificación <MaterialIcon name="arrow_forward" className="text-[16px]" />
            </Link>
            <Link href={`/marketplace?predioId=${predioId}`} className="text-primary hover:underline flex items-center gap-1">
              Publicar en marketplace <MaterialIcon name="arrow_forward" className="text-[16px]" />
            </Link>
          </div>
        </div>

        {/* Right Side: contexto geoespacial (decorativo, con datos reales del predio) */}
        <div className="hidden md:block md:w-[42%] relative bg-gradient-to-br from-forest-deep via-primary-container to-secondary overflow-hidden">
          <div className="absolute inset-0 bg-map-overlay mix-blend-multiply" />
          <div className="absolute top-margin-desktop right-margin-desktop left-margin-desktop glass-panel p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-3 border-b border-outline-variant pb-2">
              <MaterialIcon name="satellite_alt" className="text-secondary" />
              <h3 className="text-body-sm font-semibold text-on-surface">Contexto espacial</h3>
            </div>
            <div className="space-y-3">
              <div>
                <span className="font-data text-label-caps text-on-surface-variant block mb-1">Tipo de proyecto</span>
                <span className="font-data text-data-mono text-on-surface block">
                  {predioSeleccionado ? labelForType(predioSeleccionado.tipo_proyecto) : "—"}
                </span>
              </div>
              <div className="h-[1px] bg-outline-variant w-full" />
              <div>
                <span className="font-data text-label-caps text-on-surface-variant block mb-1">Estatus del polígono</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-status-success" />
                  <span className="font-data text-data-mono text-on-surface">Validado geométricamente</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-body-sm font-medium text-on-surface mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full bg-surface-container-lowest border border-outline-variant rounded text-body-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
      />
    </div>
  );
}

export default function FormulacionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-on-surface-variant">Cargando…</div>}>
      <FormulacionInner />
    </Suspense>
  );
}

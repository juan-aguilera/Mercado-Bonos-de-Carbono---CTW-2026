"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Footer } from "@/components/Footer";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { StatusPill } from "@/components/ui/StatusPill";
import { GenerarPddModal } from "@/components/formulacion/GenerarPddModal";
import { CertificacionChatbot } from "@/components/validacion/CertificacionChatbot";
import { FlujoInfografia } from "@/components/validacion/FlujoInfografia";
import { formatNumber } from "@/lib/format";
import { generatePreevaluacionPdf } from "@/lib/pdf/preevaluacionPdf";
import { CASOS_REFERENCIA, GUIAS_PLANTILLAS, PREGUNTAS_FAQ } from "@/lib/recursosValidacion";
import {
  AVISO_NO_CERTIFICA,
  AVISO_ORIENTATIVO,
  ESTADOS_RENARE,
  ETAPAS_RUTA,
  RENARE_OFICIAL_URL,
  computePreparacion,
  estadoDeEtapa,
  etapaActualId,
  factorByKey,
  itemsPaquete,
  labelEstadoEtapa,
  labelTipoProyecto,
  type DiagnosticoContexto,
  type EstadoRenare,
  type ExpedienteContexto,
  type PredioContexto,
  type ReferenciaRenare,
} from "@/lib/validacionRegistro";

const STORAGE_PREDIO = "carbonflow.activePredioId";
const STORAGE_RENARE = "carbonflow.referenciasRenare";

type RecursoTab = "guias" | "casos" | "faq";

function pillForEtapa(estado: ReturnType<typeof estadoDeEtapa>) {
  if (estado === "completada") return "success" as const;
  if (estado === "en_curso") return "info" as const;
  if (estado === "requiere_verificacion_externa") return "warning" as const;
  if (estado === "bloqueada") return "error" as const;
  return "neutral" as const;
}

function nivelVariant(nivel: string) {
  if (nivel === "critico") return "error" as const;
  if (nivel === "importante") return "warning" as const;
  return "info" as const;
}

function readLocalRenare(predioId: string): ReferenciaRenare | null {
  try {
    const raw = localStorage.getItem(STORAGE_RENARE);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, ReferenciaRenare>;
    return map[predioId] ?? null;
  } catch {
    return null;
  }
}

function writeLocalRenare(ref: ReferenciaRenare) {
  try {
    const raw = localStorage.getItem(STORAGE_RENARE);
    const map = raw ? (JSON.parse(raw) as Record<string, ReferenciaRenare>) : {};
    map[ref.predio_id] = ref;
    localStorage.setItem(STORAGE_RENARE, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function ValidacionRegistroInner() {
  const searchParams = useSearchParams();
  const initialPredioId = searchParams.get("predioId");

  const [predios, setPredios] = useState<PredioContexto[]>([]);
  const [predioId, setPredioId] = useState("");
  const [diagnostico, setDiagnostico] = useState<DiagnosticoContexto | null>(null);
  const [expediente, setExpediente] = useState<ExpedienteContexto | null>(null);
  const [referencia, setReferencia] = useState<ReferenciaRenare | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [detalleBrechas, setDetalleBrechas] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [iaMsg, setIaMsg] = useState<string | null>(null);
  const [etapaAbierta, setEtapaAbierta] = useState<number | null>(null);
  const [previewPaquete, setPreviewPaquete] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [recursoTab, setRecursoTab] = useState<RecursoTab>("guias");
  const [guiaAbierta, setGuiaAbierta] = useState<string | null>(null);
  const [faqQuestion, setFaqQuestion] = useState<string | null>(null);
  const [renareForm, setRenareForm] = useState({
    estado: "no_iniciado" as EstadoRenare,
    referenciaId: "",
    urlPublica: "",
    observaciones: "",
  });
  const [savingRenare, setSavingRenare] = useState(false);
  const [renareMsg, setRenareMsg] = useState<string | null>(null);

  const predio = predios.find((p) => p.id === predioId) ?? null;

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_PREDIO) : null;
    const requested = initialPredioId || stored || "";
    fetch(`/api/validacion-registro${requested ? `?predioId=${requested}` : ""}`)
      .then((r) => r.json())
      .then((data) => {
        const lista = (data.predios ?? []) as PredioContexto[];
        setPredios(lista);
        setLoadError(data.error ?? null);
        const nextId = data.contexto?.predio?.id ?? lista[0]?.id ?? "";
        setPredioId(nextId);
        setDiagnostico(data.contexto?.diagnostico ?? null);
        setExpediente(data.contexto?.expediente ?? null);
        const fromApi = data.contexto?.referenciaRenare ?? null;
        const fromLocal = nextId ? readLocalRenare(nextId) : null;
        const ref = fromApi ?? fromLocal;
        setReferencia(ref);
        if (ref) {
          setRenareForm({
            estado: ref.estado,
            referenciaId: ref.referencia_id ?? "",
            urlPublica: ref.url_publica ?? "",
            observaciones: ref.observaciones ?? "",
          });
        }
      })
      .catch(() => setLoadError("No se pudo cargar el proyecto."))
      .finally(() => setLoading(false));
  }, [initialPredioId]);

  useEffect(() => {
    if (!predioId || loading) return;
    localStorage.setItem(STORAGE_PREDIO, predioId);
    fetch(`/api/validacion-registro?predioId=${predioId}`)
      .then((r) => r.json())
      .then((data) => {
        setDiagnostico(data.contexto?.diagnostico ?? null);
        setExpediente(data.contexto?.expediente ?? null);
        const fromApi = data.contexto?.referenciaRenare ?? null;
        const fromLocal = readLocalRenare(predioId);
        const ref = fromApi ?? fromLocal;
        setReferencia(ref);
        if (ref) {
          setRenareForm({
            estado: ref.estado,
            referenciaId: ref.referencia_id ?? "",
            urlPublica: ref.url_publica ?? "",
            observaciones: ref.observaciones ?? "",
          });
        } else {
          setRenareForm({ estado: "no_iniciado", referenciaId: "", urlPublica: "", observaciones: "" });
        }
      });
  }, [predioId, loading]);

  const preparacion = useMemo(
    () => (predio ? computePreparacion(predio, diagnostico, expediente) : null),
    [predio, diagnostico, expediente]
  );
  const paquete = useMemo(
    () => (predio ? itemsPaquete(predio, diagnostico, expediente) : []),
    [predio, diagnostico, expediente]
  );
  const actual = preparacion ? etapaActualId(preparacion, referencia) : 1;

  useEffect(() => {
    if (etapaAbierta == null && preparacion) setEtapaAbierta(actual);
  }, [actual, etapaAbierta, preparacion]);

  const cobertura = factorByKey(diagnostico?.factores, "cobertura");
  const deforestacion = factorByKey(diagnostico?.factores, "deforestacion");

  const marketplaceHref = (necesidad: string) => {
    if (!predio || !preparacion) return "/marketplace";
    const params = new URLSearchParams({
      from: "validacion-registro",
      tab: "ovv",
      predioId: predio.id,
      proyecto: predio.nombre,
      necesidad,
      tipo: predio.tipo_proyecto,
      estado: preparacion.estado,
      preparacion: String(preparacion.puntaje),
      brechas: preparacion.brechas.map((b) => b.nombre).join(", "),
    });
    return `/marketplace?${params.toString()}`;
  };

  const resumenCompartible = () => {
    if (!predio || !preparacion) return "";
    return [
      `Proyecto: ${predio.nombre}`,
      `Tipo: ${labelTipoProyecto(predio.tipo_proyecto)}`,
      `Área: ${formatNumber(predio.area_hectareas, 1)} ha`,
      `Ubicación general: ${[predio.departamento, predio.municipio].filter(Boolean).join(", ") || "Colombia"}`,
      `Preparación: ${preparacion.puntaje}/100 (${preparacion.estado})`,
      `Brechas: ${preparacion.brechas.map((b) => b.nombre).join("; ") || "ninguna crítica"}`,
      "Resumen no sensible. CarbonFlow no comparte documentos privados.",
    ].join("\n");
  };

  const descargarPdf = (incluirUbicacionPrecisa: boolean) => {
    if (!predio || !preparacion) return;
    generatePreevaluacionPdf({
      predio,
      diagnostico,
      expediente,
      preparacion,
      items: paquete,
      incluirUbicacionPrecisa,
    });
  };

  const guardarRenare = async () => {
    if (!predioId) return;
    setSavingRenare(true);
    setRenareMsg(null);
    const local: ReferenciaRenare = {
      predio_id: predioId,
      estado: renareForm.estado,
      referencia_id: renareForm.referenciaId || null,
      url_publica: renareForm.urlPublica || null,
      observaciones: renareForm.observaciones || null,
      updated_at: new Date().toISOString(),
    };
    writeLocalRenare(local);
    setReferencia(local);
    try {
      const res = await fetch("/api/validacion-registro/renare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          predioId,
          estado: renareForm.estado,
          referenciaId: renareForm.referenciaId,
          urlPublica: renareForm.urlPublica,
          observaciones: renareForm.observaciones,
        }),
      });
      const data = await res.json();
      if (data.referencia) setReferencia({ ...local, ...data.referencia });
      setRenareMsg("Referencia guardada como información declarada por el usuario.");
    } catch {
      setRenareMsg("Guardada en este navegador. La persistencia en servidor no está disponible.");
    } finally {
      setSavingRenare(false);
    }
  };

  const recargarContexto = async (id: string) => {
    const res = await fetch(`/api/validacion-registro?predioId=${id}`);
    const data = await res.json();
    setDiagnostico(data.contexto?.diagnostico ?? null);
    setExpediente(data.contexto?.expediente ?? null);
  };

  const card = "bg-surface rounded-lg border border-outline-variant p-6";

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 px-margin-mobile md:px-margin-desktop py-8 md:py-margin-desktop pb-24 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="font-heading text-headline-lg text-primary mb-2">Validación y Registro</h1>
              <p className="text-body-lg text-on-surface-variant max-w-3xl">
                Prepara tu iniciativa para la validación independiente, el registro y reporte en RENARE, y la futura
                verificación de resultados.
              </p>
            </div>
            {predios.length > 0 && (
              <div className="w-full lg:w-80">
                <label className="block font-data text-label-caps text-on-surface-variant mb-1">Proyecto activo</label>
                <select
                  value={predioId}
                  onChange={(e) => setPredioId(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:border-primary outline-none"
                >
                  {predios.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} — {formatNumber(p.area_hectareas, 1)} ha
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-surface-container border border-outline-variant p-4 flex items-start gap-3">
            <MaterialIcon name="info" className="text-outline shrink-0 mt-0.5" />
            <p className="text-disclaimer-italic text-on-surface-variant">{AVISO_NO_CERTIFICA}</p>
          </div>

          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_19rem] gap-6 items-start">
            <div className="space-y-6 min-w-0 order-2 lg:order-1">
          {loading && <p className="text-body-sm text-on-surface-variant">Cargando proyecto…</p>}
          {loadError && !predio && (
            <p className="text-body-sm text-on-error-container bg-error-container rounded-lg px-3 py-2">{loadError}</p>
          )}

          {!loading && predios.length === 0 && (
            <div className={`${card} text-center space-y-4`}>
              <h2 className="font-heading text-headline-md">No encontramos un proyecto activo para evaluar.</h2>
              <p className="text-body-md text-on-surface-variant">
                Para usar esta ruta, primero crea un proyecto y completa el diagnóstico inicial.
              </p>
              <p className="text-body-sm text-on-surface-variant">Aún no tienes un proyecto preparado.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/diagnostico" className="rounded-lg bg-primary-container text-on-primary px-4 py-2 font-medium">
                  Crear proyecto / Ir a Diagnóstico
                </Link>
                <Link href="/formulacion" className="rounded-lg border border-outline-variant px-4 py-2">
                  Ir a Formulación
                </Link>
              </div>
            </div>
          )}

          {predio && preparacion && (
            <>
              {!preparacion.tieneDiagnostico && (
                <div className="rounded-lg border border-tertiary-container/40 bg-tertiary-fixed/40 p-4 space-y-2">
                  <p className="font-medium">Tu proyecto aún no tiene un diagnóstico completo.</p>
                  <p className="text-body-sm text-on-surface-variant">
                    Necesitamos al menos un polígono, área, actividad y ubicación general para construir la ruta de
                    preparación.
                  </p>
                  <Link href="/diagnostico" className="inline-flex text-primary hover:underline text-body-sm">
                    Completar diagnóstico
                  </Link>
                </div>
              )}
              {preparacion.tieneDiagnostico && preparacion.formulacionPct < 70 && (
                <div className="rounded-lg border border-outline-variant bg-surface p-4 space-y-2">
                  <p className="font-medium">Tu formulación aún está en progreso.</p>
                  <p className="text-body-sm text-on-surface-variant">
                    Completa línea base, adicionalidad, riesgos, salvaguardas, presupuesto y plan de monitoreo para
                    obtener una evaluación más útil.
                  </p>
                  <Link
                    href={`/formulacion?predioId=${predio.id}`}
                    className="inline-flex text-primary hover:underline text-body-sm"
                  >
                    Continuar formulación
                  </Link>
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-gutter">
                <section className={card} id="preparacion">
                  <h2 className="font-heading text-headline-md text-on-surface mb-1">Estado de preparación</h2>
                  <p className="text-body-sm text-on-surface-variant mb-5">
                    Evalúa qué información ya está disponible y qué brechas debes resolver antes de solicitar una
                    revisión técnica o de avanzar en la ruta de registro.
                  </p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-24 h-24 shrink-0">
                      <ScoreGauge score={preparacion.puntaje} />
                    </div>
                    <div>
                      <p className="font-heading text-headline-sm">
                        Preparación para validación y registro: {preparacion.puntaje}/100
                      </p>
                      <StatusPill variant={preparacion.puntaje >= 70 ? "success" : "warning"}>
                        {preparacion.estado}
                      </StatusPill>
                    </div>
                  </div>

                  <p className="font-data text-label-caps text-on-surface-variant mb-2">Fortalezas</p>
                  <ul className="space-y-1 mb-4">
                    {preparacion.fortalezas.length === 0 && (
                      <li className="text-body-sm text-on-surface-variant">Aún no hay fortalezas registradas.</li>
                    )}
                    {preparacion.fortalezas.map((f) => (
                      <li key={f} className="text-body-sm flex gap-2">
                        <span className="text-on-secondary-container">✓</span> {f}
                      </li>
                    ))}
                  </ul>

                  <p className="font-data text-label-caps text-on-surface-variant mb-2">Brechas prioritarias</p>
                  <ul className="space-y-1 mb-4">
                    {preparacion.brechas.slice(0, 4).map((b) => (
                      <li key={b.id} className="text-body-sm flex gap-2">
                        <span className="text-on-tertiary-fixed-variant">!</span> {b.nombre}
                      </li>
                    ))}
                    {preparacion.brechas.length === 0 && (
                      <li className="text-body-sm text-on-surface-variant">No hay brechas prioritarias abiertas.</li>
                    )}
                  </ul>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setShowAiModal(true)}
                      disabled={!predio}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary-container text-on-primary px-3 py-2 text-body-sm disabled:opacity-50"
                    >
                      <MaterialIcon name="auto_awesome" className="text-[16px]" />
                      Llenar brechas con IA
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetalleBrechas((v) => !v)}
                      className="rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
                    >
                      {detalleBrechas ? "Ocultar detalle" : "Ver detalle de brechas"}
                    </button>
                    <button
                      type="button"
                      onClick={() => descargarPdf(true)}
                      className="rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
                    >
                      Descargar resumen
                    </button>
                  </div>

                  {iaMsg && (
                    <p className="text-body-sm text-primary mb-4">{iaMsg}</p>
                  )}

                  {detalleBrechas && (
                    <div className="space-y-3 border-t border-outline-variant pt-4">
                      {preparacion.brechas.map((b) => (
                        <div key={b.id} className="rounded-lg bg-surface-container-lowest border border-outline-variant p-3">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <StatusPill variant={nivelVariant(b.nivel)}>{b.nivel}</StatusPill>
                            <span className="font-medium text-body-sm">{b.nombre}</span>
                            <span className="text-disclaimer-italic text-on-surface-variant">Fuente: {b.fuente}</span>
                          </div>
                          <p className="text-body-sm text-on-surface-variant mb-2">{b.explicacion}</p>
                          <Link href={b.href} className="text-body-sm text-primary hover:underline">
                            {b.cta}
                          </Link>
                        </div>
                      ))}
                      <div className="text-disclaimer-italic text-on-surface-variant space-y-1">
                        {preparacion.criterios.map((c) => (
                          <p key={c.id}>
                            {c.label}: {c.puntos}/{c.max} · {c.fuente}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-disclaimer-italic text-on-surface-variant mt-4">
                    Este indicador es una herramienta de preparación interna. No constituye una decisión de validación,
                    registro, certificación ni elegibilidad.
                  </p>
                  <p className="text-disclaimer-italic text-on-surface-variant mt-2">{AVISO_ORIENTATIVO}</p>
                </section>

                <section className={card} id="ruta">
                  <h2 className="font-heading text-headline-md text-on-surface mb-1">Ruta de la iniciativa</h2>
                  <p className="text-body-sm text-on-surface-variant mb-5">
                    Esta ruta organiza las etapas frecuentes desde la factibilidad hasta los resultados verificables. La
                    ruta definitiva depende de la metodología, estándar, requisitos nacionales y revisión de un
                    profesional competente.
                  </p>
                  <ol className="space-y-2">
                    {ETAPAS_RUTA.map((etapa) => {
                      const estado = estadoDeEtapa(etapa.id, actual, preparacion, referencia);
                      const abierta = etapaAbierta === etapa.id;
                      return (
                        <li key={etapa.id} className="border border-outline-variant rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setEtapaAbierta(abierta ? null : etapa.id)}
                            className="w-full text-left px-3 py-2 flex items-center justify-between gap-2 hover:bg-surface-container-lowest"
                          >
                            <span className="text-body-sm font-medium">
                              {etapa.id}. {etapa.titulo}
                            </span>
                            <StatusPill variant={pillForEtapa(estado)}>{labelEstadoEtapa(estado)}</StatusPill>
                          </button>
                          {abierta && (
                            <div className="px-3 pb-3 space-y-1 text-body-sm text-on-surface-variant border-t border-outline-variant">
                              <p>
                                <strong className="text-on-surface">Objetivo:</strong> {etapa.objetivo}
                              </p>
                              <p>
                                <strong className="text-on-surface">Titular:</strong> {etapa.titular}
                              </p>
                              {etapa.renare && (
                                <p>
                                  <strong className="text-on-surface">RENARE:</strong> {etapa.renare}
                                </p>
                              )}
                              {etapa.ovv && (
                                <p>
                                  <strong className="text-on-surface">Entidad validadora:</strong> {etapa.ovv}
                                </p>
                              )}
                              {etapa.marketplace && (
                                <p>
                                  <strong className="text-on-surface">Marketplace:</strong> {etapa.marketplace}
                                </p>
                              )}
                              <p>
                                <strong className="text-on-surface">Resultado:</strong> {etapa.resultado}
                              </p>
                              <div className="flex flex-wrap gap-2 pt-2">
                                {etapa.accionHref.startsWith("#") ? (
                                  <a href={etapa.accionHref} className="text-primary hover:underline">
                                    {etapa.accionLabel}
                                  </a>
                                ) : etapa.accionHref === "/marketplace" ? (
                                  <button
                                    type="button"
                                    className="text-primary hover:underline"
                                    onClick={() => setConsentOpen(true)}
                                  >
                                    {etapa.accionLabel}
                                  </button>
                                ) : (
                                  <Link
                                    href={
                                      etapa.accionHref === "/formulacion"
                                        ? `/formulacion?predioId=${predio.id}`
                                        : etapa.accionHref
                                    }
                                    className="text-primary hover:underline"
                                  >
                                    {etapa.accionLabel}
                                  </Link>
                                )}
                                {etapa.accionSecundaria && (
                                  <button
                                    type="button"
                                    className="text-primary hover:underline"
                                    onClick={() => setConsentOpen(true)}
                                  >
                                    {etapa.accionSecundaria.label}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                  <p className="text-disclaimer-italic text-on-surface-variant mt-4">{AVISO_ORIENTATIVO}</p>
                </section>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-gutter">
                <section className={card} id="paquete">
                  <h2 className="font-heading text-headline-md mb-1">Paquete de preevaluación</h2>
                  <p className="text-body-sm text-on-surface-variant mb-4">
                    Reúne la información ya disponible para solicitar una revisión técnica. Este paquete no equivale a
                    una solicitud formal de validación ni a un expediente certificado.
                  </p>
                  <ul className="space-y-1 mb-4">
                    {paquete.map((item) => (
                      <li key={item.id} className="text-body-sm flex gap-2">
                        <span className={item.incluido ? "text-on-secondary-container" : "text-on-tertiary-fixed-variant"}>
                          {item.incluido ? "✓" : "!"}
                        </span>
                        {item.label}
                        {!item.incluido && item.pendiente ? ": pendiente" : ""}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewPaquete(true)}
                      className="rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
                    >
                      Vista previa
                    </button>
                    <button
                      type="button"
                      onClick={() => descargarPdf(true)}
                      className="rounded-lg bg-primary-container text-on-primary px-3 py-2 text-body-sm"
                    >
                      Descargar PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(resumenCompartible())}
                      className="rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
                    >
                      Compartir enlace
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsentOpen(true)}
                      className="rounded-lg border border-primary text-primary px-3 py-2 text-body-sm"
                    >
                      Solicitar revisión en Marketplace
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3 text-body-sm">
                    <button type="button" className="text-primary hover:underline" onClick={() => setConsentOpen(true)}>
                      Encontrar consultor
                    </button>
                    <button type="button" className="text-primary hover:underline" onClick={() => setConsentOpen(true)}>
                      Encontrar entidad validadora
                    </button>
                    <button type="button" className="text-primary hover:underline" onClick={() => setConsentOpen(true)}>
                      Buscar comprador
                    </button>
                    <button type="button" className="text-primary hover:underline" onClick={() => setConsentOpen(true)}>
                      Buscar financiador
                    </button>
                  </div>
                </section>

                <section className={card} id="renare">
                  <h2 className="font-heading text-headline-md mb-1">RENARE y trazabilidad nacional</h2>
                  <p className="text-body-sm text-on-surface-variant mb-4">
                    RENARE es el Registro Nacional de Reducción de Emisiones de Gases de Efecto Invernadero. CarbonFlow
                    te ayuda a preparar y organizar información, pero no presenta ni modifica registros ante RENARE.
                  </p>
                  <StatusPill variant="warning">
                    {referencia?.url_publica
                      ? "Referencia externa enlazada — validar en la fuente oficial"
                      : "Información declarada por el usuario"}
                  </StatusPill>
                  <div className="grid gap-3 mt-4">
                    <label className="text-body-sm">
                      Estado de gestión
                      <select
                        value={renareForm.estado}
                        onChange={(e) =>
                          setRenareForm((f) => ({ ...f, estado: e.target.value as EstadoRenare }))
                        }
                        className="mt-1 w-full border border-outline-variant rounded-lg px-3 py-2 bg-surface"
                      >
                        {ESTADOS_RENARE.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <input
                      placeholder="Número o ID de referencia (opcional)"
                      value={renareForm.referenciaId}
                      onChange={(e) => setRenareForm((f) => ({ ...f, referenciaId: e.target.value }))}
                      className="border border-outline-variant rounded-lg px-3 py-2 text-body-sm"
                    />
                    <input
                      placeholder="URL pública (opcional)"
                      value={renareForm.urlPublica}
                      onChange={(e) => setRenareForm((f) => ({ ...f, urlPublica: e.target.value }))}
                      className="border border-outline-variant rounded-lg px-3 py-2 text-body-sm"
                    />
                    <textarea
                      placeholder="Observaciones"
                      value={renareForm.observaciones}
                      onChange={(e) => setRenareForm((f) => ({ ...f, observaciones: e.target.value }))}
                      rows={2}
                      className="border border-outline-variant rounded-lg px-3 py-2 text-body-sm"
                    />
                    {referencia?.updated_at && (
                      <p className="text-disclaimer-italic text-on-surface-variant">
                        Última actualización: {new Date(referencia.updated_at).toLocaleString("es-CO")}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      type="button"
                      onClick={guardarRenare}
                      disabled={savingRenare}
                      className="rounded-lg bg-primary-container text-on-primary px-3 py-2 text-body-sm disabled:opacity-50"
                    >
                      {savingRenare ? "Guardando…" : "Registrar referencia"}
                    </button>
                    <a
                      href={RENARE_OFICIAL_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
                    >
                      Abrir RENARE/SUIA
                    </a>
                    <button
                      type="button"
                      onClick={() => setFaqQuestion("¿Qué debo preparar para RENARE?")}
                      className="rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
                    >
                      Consultar al asistente
                    </button>
                  </div>
                  {renareMsg && <p className="text-body-sm text-on-secondary-container mt-2">{renareMsg}</p>}
                  <div className="mt-4 rounded-lg bg-surface-container-lowest border border-outline-variant p-3">
                    <p className="font-medium text-body-sm mb-2">Información a preparar</p>
                    <ul className="text-body-sm text-on-surface-variant list-disc list-inside space-y-1">
                      <li>Identificación del titular o responsable.</li>
                      <li>Ubicación y polígono.</li>
                      <li>Tipo de iniciativa y actividad.</li>
                      <li>Línea base y metodología prevista.</li>
                      <li>Periodo de implementación.</li>
                      <li>Salvaguardas y partes interesadas.</li>
                      <li>Plan de monitoreo.</li>
                      <li>Resultados reportados, cuando existan.</li>
                    </ul>
                    <p className="text-disclaimer-italic text-on-surface-variant mt-2">
                      La obligación, los campos y el procedimiento aplicable deben verificarse directamente en
                      RENARE/SUIA y con la regulación vigente.
                    </p>
                    <p className="text-disclaimer-italic text-on-surface-variant mt-2">
                      La consulta directa a RENARE no está habilitada en esta versión. Puedes registrar una referencia,
                      preparar tu información y abrir la fuente oficial para continuar el trámite.
                    </p>
                  </div>
                </section>
              </div>

              <section className={card} id="recursos">
                  <h2 className="font-heading text-headline-md mb-1">Recursos y referentes</h2>
                  <p className="text-body-sm text-on-surface-variant mb-4">
                    Guías, plantillas y casos públicos para entender la ruta de validación y registro.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(
                      [
                        ["guias", "Guías y plantillas"],
                        ["casos", "Casos de referencia"],
                        ["faq", "Preguntas frecuentes"],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setRecursoTab(id)}
                        className={`px-3 py-1.5 rounded-full text-body-sm ${
                          recursoTab === id
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container-low text-on-surface-variant"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {recursoTab === "guias" && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {GUIAS_PLANTILLAS.map((g) => (
                        <div key={g.id} className="border border-outline-variant rounded-lg p-3 space-y-2">
                          <p className="font-medium text-body-sm">{g.titulo}</p>
                          <p className="text-body-sm text-on-surface-variant">{g.descripcion}</p>
                          <p className="text-disclaimer-italic">Etapa: {g.etapa}</p>
                          <StatusPill variant="neutral">Orientativo — adaptar a metodología y estándar aplicable</StatusPill>
                          <button
                            type="button"
                            onClick={() => setGuiaAbierta(g.id)}
                            className="text-primary text-body-sm hover:underline"
                          >
                            {g.tipo === "plantilla" ? "Descargar plantilla" : "Ver guía"}
                          </button>
                          {guiaAbierta === g.id && (
                            <p className="text-body-sm text-on-surface-variant border-t border-outline-variant pt-2">
                              {g.contenido}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {recursoTab === "casos" && (
                    <div className="space-y-3">
                      {CASOS_REFERENCIA.map((c) => (
                        <div key={c.id} className="border border-outline-variant rounded-lg p-3 space-y-1 text-body-sm">
                          <p className="font-medium">{c.nombre}</p>
                          <p>Tipo: {c.tipo}</p>
                          <p>Región: {c.region}</p>
                          <p>Estándar o registro: {c.estandar}</p>
                          <p>Etapa/estado (fuente pública): {c.etapaPublica}</p>
                          <p>Metodología: {c.metodologia}</p>
                          <p>Qué aprender: {c.aprendizaje}</p>
                          <p className="text-disclaimer-italic">Última consulta: {c.fechaConsulta}</p>
                          <a href={c.enlace} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                            Abrir fuente oficial
                          </a>
                          <p className="text-disclaimer-italic text-on-surface-variant">
                            Caso público de referencia. CarbonFlow no certifica ni garantiza la información o
                            disponibilidad de resultados asociados.
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {recursoTab === "faq" && (
                    <div className="flex flex-col gap-2">
                      {PREGUNTAS_FAQ.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setFaqQuestion(q)}
                          className="text-left rounded-lg border border-outline-variant px-3 py-2 text-body-sm hover:bg-surface-container-lowest"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
              </section>

              {predio && diagnostico && (
                <p className="text-disclaimer-italic text-on-surface-variant">
                  {predio.nombre} · {labelTipoProyecto(predio.tipo_proyecto)} · {formatNumber(predio.area_hectareas, 1)} ha
                  {cobertura ? ` · cobertura: ${cobertura.explanation}` : ""}
                  {deforestacion ? ` · ${deforestacion.explanation}` : ""} · score diagnóstico {diagnostico.score}/100 ·
                  CO2e indicativo {formatNumber(Number(diagnostico.co2e_por_anio))} t/año · diagnóstico{" "}
                  {new Date(diagnostico.created_at).toLocaleDateString("es-CO")}
                </p>
              )}
            </>
          )}
            </div>
            <div className="order-1 lg:order-2 mb-6 lg:mb-0">
              <FlujoInfografia
                etapaNueveActual={preparacion ? actual : undefined}
                predioId={predioId || undefined}
                onMarketplace={() => setConsentOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {previewPaquete && predio && preparacion && (
        <div
          className="fixed inset-0 bg-inverse-surface/40 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewPaquete(false)}
        >
          <div
            className="bg-surface rounded-lg max-w-lg w-full p-6 space-y-3 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-heading text-headline-sm">Vista previa del paquete</h3>
            <p className="text-body-sm">
              {predio.nombre} — preparación {preparacion.puntaje}/100
            </p>
            <ul className="text-body-sm space-y-1">
              {paquete.map((i) => (
                <li key={i.id}>
                  {i.incluido ? "✓" : "!"} {i.label}
                </li>
              ))}
            </ul>
            <p className="text-disclaimer-italic">
              La versión compartible omite coordenadas precisas salvo que descargues el PDF desde tu sesión.
            </p>
            <button
              type="button"
              onClick={() => setPreviewPaquete(false)}
              className="w-full rounded-lg bg-primary-container text-on-primary py-2"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {consentOpen && predio && preparacion && (
        <div
          className="fixed inset-0 bg-inverse-surface/40 z-50 flex items-center justify-center p-4"
          onClick={() => setConsentOpen(false)}
        >
          <div
            className="bg-surface rounded-lg max-w-lg w-full p-6 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-heading text-headline-sm">Compartir contexto con Marketplace</h3>
            <p className="text-body-sm text-on-surface-variant">
              Se enviará un resumen no sensible. No se comparten documentos privados ni coordenadas precisas.
            </p>
            <pre className="text-disclaimer-italic whitespace-pre-wrap bg-surface-container-low rounded-lg p-3">
              {`Tipo de necesidad: Revisión de validación
Tipo de proyecto: ${labelTipoProyecto(predio.tipo_proyecto)}
Estado: ${preparacion.estado}
Preparación: ${preparacion.puntaje}/100
Brechas: ${preparacion.brechas.map((b) => b.nombre).join(", ") || "ninguna"}`}
            </pre>
            <div className="flex gap-2">
              <Link
                href={marketplaceHref("revision-validacion")}
                className="flex-1 text-center rounded-lg bg-primary-container text-on-primary py-2"
              >
                Acepto y continuar
              </Link>
              <button
                type="button"
                onClick={() => setConsentOpen(false)}
                className="rounded-lg border border-outline-variant px-4"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <GenerarPddModal
        open={showAiModal}
        predio={
          predio
            ? {
                id: predio.id,
                nombre: predio.nombre,
                area_hectareas: predio.area_hectareas,
                tipo_proyecto: predio.tipo_proyecto,
                ubicacion_display: predio.ubicacion_display,
              }
            : null
        }
        onClose={() => setShowAiModal(false)}
        onGenerated={async () => {
          if (predioId) await recargarContexto(predioId);
          setIaMsg("Expediente generado con IA y guardado. El estado de preparación se actualizó con esos datos.");
        }}
      />
      <CertificacionChatbot
        questionToSend={faqQuestion}
        onQuestionConsumed={() => setFaqQuestion(null)}
      />
      <Footer />
    </div>
  );
}

export default function ValidacionRegistroPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-on-surface-variant">Cargando…</div>}>
      <ValidacionRegistroInner />
    </Suspense>
  );
}

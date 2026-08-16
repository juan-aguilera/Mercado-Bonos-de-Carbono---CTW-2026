"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PROJECT_TYPES } from "@/lib/projectTypes";
import { formatNumber } from "@/lib/format";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Footer } from "@/components/Footer";
import { GenerarPddModal } from "@/components/formulacion/GenerarPddModal";
import { generatePddDocx, PddData } from "@/lib/docx/pddDocxGenerator";
import { isPddData, legacyFieldsFromPdd, persistExpedientePdd } from "@/lib/expedientePdd";

interface Predio {
  id: string;
  nombre: string;
  tipo_proyecto: string;
  area_hectareas: number;
  ubicacion_display: string | null;
}

function labelForType(id: string) {
  return PROJECT_TYPES.find((t) => t.id === id)?.label ?? id;
}

function FormulacionInner() {
  const searchParams = useSearchParams();
  const initialPredioId = searchParams.get("predioId");

  const [predios, setPredios] = useState<Predio[]>([]);
  const [predioId, setPredioId] = useState<string>(initialPredioId ?? "");
  const predioIdRef = useRef(predioId);
  predioIdRef.current = predioId;
  const [loadingPredios, setLoadingPredios] = useState(true);

  // PDD structured state
  const [pddData, setPddData] = useState<PddData | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Form legacy fields for saving to Supabase
  const [lineaBase, setLineaBase] = useState("");
  const [adicionalidad, setAdicionalidad] = useState("");
  const [riesgosPermanencia, setRiesgosPermanencia] = useState("");
  const [salvaguardas, setSalvaguardas] = useState("");
  const [cronograma, setCronograma] = useState("");
  const [presupuesto, setPresupuesto] = useState("");

  const [saving, setSaving] = useState(false);
  const [loadingExpediente, setLoadingExpediente] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [showAiModal, setShowAiModal] = useState(false);

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

  const predioSeleccionado = predios.find((p) => p.id === predioId);

  const applyLegacyFields = (fields: ReturnType<typeof legacyFieldsFromPdd>) => {
    setLineaBase(fields.lineaBase);
    setAdicionalidad(fields.adicionalidad);
    setRiesgosPermanencia(fields.riesgosPermanencia);
    setSalvaguardas(fields.salvaguardas);
    setCronograma(fields.cronograma);
    setPresupuesto(fields.presupuesto);
  };

  const persistExpediente = async (pdd: PddData | null, targetPredioId = predioId) => {
    if (!targetPredioId) {
      throw new Error("Selecciona un predio ya diagnosticado antes de continuar.");
    }
    if (pdd) {
      const legacy = await persistExpedientePdd(targetPredioId, pdd);
      if (targetPredioId === predioIdRef.current) applyLegacyFields(legacy);
      return;
    }
    const legacy = {
      lineaBase,
      adicionalidad,
      riesgosPermanencia,
      salvaguardas,
      cronograma,
      presupuesto,
    };
    const res = await fetch("/api/expedientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ predioId: targetPredioId, ...legacy, pddData: pdd }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `El servidor respondió ${res.status}`);
    }
  };

  useEffect(() => {
    if (!predioId) return;
    let cancelled = false;
    setLoadingExpediente(true);
    setPddData(null);
    setLineaBase("");
    setAdicionalidad("");
    setRiesgosPermanencia("");
    setSalvaguardas("");
    setCronograma("");
    setPresupuesto("");
    setMessage(null);
    setActiveTab(0);

    fetch(`/api/expedientes?predioId=${predioId}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const exp = data.expediente;
        if (!exp) {
          setPddData(null);
          return;
        }
        setLineaBase(exp.linea_base ?? "");
        setAdicionalidad(exp.adicionalidad ?? "");
        setRiesgosPermanencia(exp.riesgos_permanencia ?? "");
        setSalvaguardas(exp.salvaguardas ?? "");
        setCronograma(exp.cronograma ?? "");
        setPresupuesto(exp.presupuesto ?? "");
        setPddData(isPddData(exp.pdd_data) ? exp.pdd_data : null);
      })
      .finally(() => {
        if (!cancelled) setLoadingExpediente(false);
      });

    return () => {
      cancelled = true;
    };
  }, [predioId]);

  const handlePddGenerated = (pdd: PddData) => {
    if (predioIdRef.current !== predioSeleccionado?.id) return;
    setPddData(pdd);
    applyLegacyFields(legacyFieldsFromPdd(pdd));
    setMessage("Documento de Diseño del Proyecto (PDD) generado y guardado en la base de datos.");
  };

  const handleDownloadDocx = async () => {
    if (!pddData) return;
    setDownloadingDocx(true);
    try {
      const blob = await generatePddDocx(pddData);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PDD_${pddData.predioNombre.replace(/\s+/g, "_")}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setMessage("Error al compilar el archivo Word: " + (err instanceof Error ? err.message : "desconocido"));
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handleSave = async () => {
    if (!predioId) {
      setMessage("Selecciona un predio ya diagnosticado antes de continuar.");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await persistExpediente(pddData);
      setMessage("Expediente guardado exitosamente en la base de datos.");
    } catch (err) {
      setMessage(
        err instanceof Error
          ? `No se pudo guardar (${err.message}).`
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
        <h1 className="font-heading text-headline-lg text-on-surface">Formulación del Proyecto</h1>
        <p className="text-on-surface-variant max-w-md">
          Aún no tienes ningún predio diagnosticado. La formulación continúa siempre desde un predio ya diagnosticado.
        </p>
        <Link
          href="/diagnostico"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-container text-on-primary px-5 py-2.5 font-medium hover:bg-primary transition-colors"
        >
          Ir al diagnóstico
          <MaterialIcon name="arrow_forward" />
        </Link>
      </div>
    );
  }

  // Pestañas temáticas con colores distintivos
  const PDD_TABS = [
    {
      id: 0,
      label: "Resumen Ejecutivo",
      icon: "dashboard",
      colorClass: "hover:text-primary-container",
      activeClass: "bg-primary-container text-on-primary font-bold",
      inactiveClass: "bg-surface-container-lowest text-on-surface-variant hover:bg-primary-container/10",
    },
    {
      id: 1,
      label: "1. Problemática y Actores",
      icon: "groups",
      colorClass: "hover:text-secondary",
      activeClass: "bg-secondary text-on-secondary font-bold",
      inactiveClass: "bg-surface-container-lowest text-on-surface-variant hover:bg-secondary/10",
    },
    {
      id: 2,
      label: "2. Análisis Técnico",
      icon: "science",
      colorClass: "hover:text-on-tertiary-fixed-variant",
      activeClass: "bg-tertiary-fixed text-on-tertiary-fixed-variant font-bold",
      inactiveClass: "bg-surface-container-lowest text-on-surface-variant hover:bg-tertiary-fixed/30",
    },
    {
      id: 3,
      label: "3. Riesgos y Salvaguardas",
      icon: "shield",
      colorClass: "hover:text-primary-container",
      activeClass: "bg-primary-container text-on-primary font-bold",
      inactiveClass: "bg-surface-container-lowest text-on-surface-variant hover:bg-primary-container/10",
    },
    {
      id: 4,
      label: "4. Evaluación Financiera",
      icon: "payments",
      colorClass: "hover:text-secondary",
      activeClass: "bg-secondary text-on-secondary font-bold",
      inactiveClass: "bg-surface-container-lowest text-on-surface-variant hover:bg-secondary/10",
    },
    {
      id: 5,
      label: "5. Cronograma y KPIs",
      icon: "fact_check",
      colorClass: "hover:text-on-tertiary-fixed-variant",
      activeClass: "bg-tertiary-fixed text-on-tertiary-fixed-variant font-bold",
      inactiveClass: "bg-surface-container-lowest text-on-surface-variant hover:bg-tertiary-fixed/30",
    },
  ];

  return (
    <div className="flex flex-col flex-1 bg-surface-container-lowest">
      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Cabecera Principal */}
        <div className="border-b border-outline-variant pb-6">
          <p className="font-data text-label-caps text-secondary mb-1">
            MÓDULO DE FORMULACIÓN ESTRUCTURADA
          </p>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-headline-lg text-on-surface font-bold">
                Formulación del Proyecto
              </h1>
              <p className="text-body-md text-on-surface-variant mt-1">
                Estructuración integral bajo estándares internacionales del mercado voluntario de carbono.
              </p>
            </div>
            {/* Selector de Predio */}
            <div className="w-full md:w-80">
              <label className="block text-body-sm font-medium text-on-surface-variant mb-1">
                Predio Seleccionado
              </label>
              <select
                value={predioId}
                onChange={(e) => setPredioId(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg text-body-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                {predios.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — {formatNumber(p.area_hectareas, 1)} ha
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ficha Rápida del Predio con Efectos Hover */}
          {predioSeleccionado && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-surface p-4 rounded-lg border border-outline-variant flex items-center gap-3 transition-colors hover:bg-surface-container-low hover:border-primary/60 cursor-pointer group">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                  <MaterialIcon name="straighten" className="text-xl" />
                </div>
                <div>
                  <span className="font-data text-label-caps text-on-surface-variant block">Área Total</span>
                  <span className="font-data text-data-mono font-bold text-on-surface text-lg group-hover:text-primary transition-colors">
                    {formatNumber(predioSeleccionado.area_hectareas, 2)} ha
                  </span>
                </div>
              </div>

              <div className="bg-surface p-4 rounded-lg border border-outline-variant flex items-center gap-3 transition-colors hover:bg-surface-container-low hover:border-primary/60 cursor-pointer group">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                  <MaterialIcon name="location_on" className="text-xl" />
                </div>
                <div className="truncate">
                  <span className="font-data text-label-caps text-on-surface-variant block">Ubicación</span>
                  <span className="font-data text-data-mono font-bold text-on-surface text-sm truncate block group-hover:text-primary transition-colors">
                    {predioSeleccionado.ubicacion_display ?? "No determinada"}
                  </span>
                </div>
              </div>

              <div className="bg-surface p-4 rounded-lg border border-outline-variant flex items-center gap-3 transition-colors hover:bg-surface-container-low hover:border-primary/60 cursor-pointer group">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                  <MaterialIcon name="nature" className="text-xl" />
                </div>
                <div>
                  <span className="font-data text-label-caps text-on-surface-variant block">Tipo de Proyecto</span>
                  <span className="font-data text-data-mono font-bold text-on-surface text-sm group-hover:text-primary transition-colors">
                    {labelForType(predioSeleccionado.tipo_proyecto)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECCIÓN PRINCIPAL: DOCUMENTO DE DISEÑO DEL PROYECTO (PDD) */}
        <div className="bg-surface rounded-lg border border-outline-variant overflow-hidden">
          {/* Barra de Título del PDD con el Botón de IA */}
          <div className="p-6 bg-surface-container-low border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <MaterialIcon name="description" className="text-primary text-2xl" />
                <h2 className="font-heading text-headline-md text-on-surface font-bold">
                  Documento de Diseño del Proyecto (PDD)
                </h2>
              </div>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Estructurado bajo estándares internacionales del mercado de carbono.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAiModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-container text-on-primary px-5 py-2.5 text-body-sm font-semibold hover:bg-primary transition-colors cursor-pointer"
              >
                <MaterialIcon name="auto_awesome" className="text-[18px]" />
                Autocompletar con IA
              </button>

              {pddData && (
                <button
                  type="button"
                  onClick={handleDownloadDocx}
                  disabled={downloadingDocx}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/30 text-primary px-5 py-2.5 text-body-sm font-semibold hover:bg-primary/20 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <MaterialIcon name="download" className="text-[18px]" />
                  {downloadingDocx ? "Generando Word..." : "Descargar Word (.docx)"}
                </button>
              )}
            </div>
          </div>

          {/* Mensajes de Notificación */}
          {message && (
            <div className="p-4 bg-primary/10 border-b border-primary/20 text-primary text-body-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MaterialIcon name="info" className="text-[18px]" />
                <span>{message}</span>
              </div>
              <button onClick={() => setMessage(null)} className="text-primary hover:opacity-75">
                <MaterialIcon name="close" className="text-[16px]" />
              </button>
            </div>
          )}

          {/* CONTENIDO DEL PDD */}
          {loadingExpediente ? (
            <div className="p-12 text-center text-on-surface-variant">Cargando expediente de este predio…</div>
          ) : pddData ? (
            <div className="flex flex-col">
              {/* Pestañas de Navegación del Documento con Colores Vivos */}
              <div className="flex overflow-x-auto border-b border-outline-variant bg-surface-container-lowest p-2 gap-2">
                {PDD_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-body-sm whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                        isActive ? tab.activeClass : tab.inactiveClass
                      }`}
                    >
                      <MaterialIcon name={tab.icon} className="text-[18px]" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Contenido según Pestaña Activa */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* TAB 0: RESUMEN EJECUTIVO */}
                {activeTab === 0 && (
                  <div className="space-y-6">
                    {/* Tarjetas de Métricas Clave (KPIs Ejecutivos con Efecto Hover y Resalte) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant transition-colors hover:bg-surface-container hover:border-primary-container/40 cursor-pointer group">
                        <span className="text-label-caps font-data text-on-surface-variant block mb-1">Créditos Anuales</span>
                        <span className="text-headline-sm font-bold text-primary-container block">
                          {pddData.resumenEjecutivo.creditosEstimadosAnual}
                        </span>
                      </div>
                      <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant transition-colors hover:bg-surface-container hover:border-secondary/40 cursor-pointer group">
                        <span className="text-label-caps font-data text-on-surface-variant block">CAPEX Estimado</span>
                        <span className="text-headline-sm font-bold text-secondary block">
                          {pddData.resumenEjecutivo.inversionRequerida}
                        </span>
                      </div>
                      <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant transition-colors hover:bg-surface-container hover:border-on-tertiary-fixed-variant/40 cursor-pointer group">
                        <span className="text-label-caps font-data text-on-surface-variant block">TIR Proyectada</span>
                        <span className="text-headline-sm font-bold text-on-tertiary-fixed-variant block">
                          {pddData.resumenEjecutivo.tirEstimada}
                        </span>
                      </div>
                      <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant transition-colors hover:bg-surface-container hover:border-primary-container/40 cursor-pointer group">
                        <span className="text-label-caps font-data text-on-surface-variant block">VPN Estimado</span>
                        <span className="text-headline-sm font-bold text-primary-container block">
                          {pddData.resumenEjecutivo.vanEstimado}
                        </span>
                      </div>
                      <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant transition-colors hover:bg-surface-container hover:border-secondary/40 cursor-pointer group">
                        <span className="text-label-caps font-data text-on-surface-variant block">Impacto Social</span>
                        <span className="text-headline-sm font-bold text-secondary block">
                          {pddData.resumenEjecutivo.beneficiariosDirectos}
                        </span>
                      </div>
                    </div>

                    {/* Visión General Callout */}
                    <div className="p-6 bg-surface-container-low rounded-lg border-l-4 border-primary border-outline-variant space-y-2">
                      <h3 className="font-heading font-bold text-body-lg text-primary flex items-center gap-2">
                        <MaterialIcon name="lightbulb" className="text-[20px]" />
                        Propuesta de Valor y Visión Estratégica
                      </h3>
                      <p className="text-body-md text-on-surface leading-relaxed whitespace-pre-line">
                        {pddData.resumenEjecutivo.visionGeneral}
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 1: PROBLEMÁTICA Y MATRIZ DE ACTORES */}
                {activeTab === 1 && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-5 bg-surface-container-low rounded-lg border border-outline-variant space-y-2 transition-colors hover:bg-surface-container">
                        <h3 className="font-heading font-bold text-body-lg text-on-surface flex items-center gap-2">
                          <MaterialIcon name="crisis_alert" className="text-on-tertiary-fixed-variant" />
                          Diagnóstico Territorial y Deforestación
                        </h3>
                        <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                          {pddData.problematica.diagnosticoTerritorial}
                        </p>
                        <p className="text-body-md text-on-surface-variant whitespace-pre-line mt-2">
                          {pddData.problematica.causasDeforestacion}
                        </p>
                      </div>

                      <div className="p-5 bg-surface-container-low rounded-lg border border-outline-variant space-y-2 transition-colors hover:bg-surface-container">
                        <h3 className="font-heading font-bold text-body-lg text-on-surface flex items-center gap-2">
                          <MaterialIcon name="account_tree" className="text-primary" />
                          Árbol de Problemas y Soluciones
                        </h3>
                        <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                          {pddData.problematica.arbolProblemasSoluciones}
                        </p>
                      </div>
                    </div>

                    {/* Matriz de Actores Clave */}
                    <div>
                      <h3 className="font-heading font-bold text-body-lg text-on-surface mb-3 flex items-center gap-2">
                        <MaterialIcon name="groups" className="text-secondary" />
                        Matriz de Análisis de Actores Clave
                      </h3>
                      <div className="overflow-x-auto border border-outline-variant rounded-lg">
                        <table className="w-full text-left text-body-sm">
                          <thead className="bg-primary text-on-primary font-bold">
                            <tr>
                              <th className="p-3">Actor / Comunidad</th>
                              <th className="p-3">Rol Territorial</th>
                              <th className="p-3">Interés / Impacto</th>
                              <th className="p-3">Estrategia de Involucramiento</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant bg-surface">
                            {pddData.problematica.actoresClave.map((actor, idx) => (
                              <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                                <td className="p-3 font-semibold text-on-surface">{actor.actor}</td>
                                <td className="p-3 text-on-surface-variant">{actor.rol}</td>
                                <td className="p-3 text-on-surface-variant">{actor.interesImpacto}</td>
                                <td className="p-3 text-on-surface-variant">{actor.estrategiaInvolucramiento}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: ANÁLISIS TÉCNICO */}
                {activeTab === 2 && (
                  <div className="space-y-6">
                    <div className="p-5 bg-surface-container-low rounded-lg border border-outline-variant space-y-2 transition-colors hover:bg-surface-container">
                      <h3 className="font-heading font-bold text-body-lg text-on-surface">
                        Localización, Límites y Criterios de Elegibilidad
                      </h3>
                      <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                        {pddData.analisisTecnico.localizacionLimites}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-5 bg-surface-container-low rounded-lg border border-outline-variant space-y-2 transition-colors hover:bg-surface-container">
                        <h3 className="font-heading font-bold text-body-lg text-on-surface">
                          Estándar y Metodología Aplicable
                        </h3>
                        <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                          {pddData.analisisTecnico.metodologiaEstandar}
                        </p>
                      </div>

                      <div className="p-5 bg-surface-container-low rounded-lg border border-outline-variant space-y-2 transition-colors hover:bg-surface-container">
                        <h3 className="font-heading font-bold text-body-lg text-on-surface">
                          Demostración de Adicionalidad (Res. 1447/2018)
                        </h3>
                        <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                          {pddData.analisisTecnico.demostracionAdicionalidad}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 bg-surface-container-low rounded-lg border border-outline-variant space-y-2 transition-colors hover:bg-surface-container">
                      <h3 className="font-heading font-bold text-body-lg text-on-surface">
                        Línea Base y Escenario de Referencia
                      </h3>
                      <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                        {pddData.analisisTecnico.lineaBaseReferencia}
                      </p>
                    </div>

                    <div className="p-6 bg-primary/10 rounded-lg border border-primary/20 space-y-2">
                      <h3 className="font-heading font-bold text-body-lg text-primary flex items-center gap-2">
                        <MaterialIcon name="co2" className="text-2xl" />
                        Proyección de Remociones Netas de Carbono (tCO2e)
                      </h3>
                      <p className="text-body-md text-on-surface whitespace-pre-line">
                        {pddData.analisisTecnico.proyeccionRemociones}
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 3: RIESGOS Y SALVAGUARDAS */}
                {activeTab === 3 && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-5 bg-surface-container-low rounded-lg border border-outline-variant space-y-2 transition-colors hover:bg-surface-container">
                        <h3 className="font-heading font-bold text-body-lg text-on-surface flex items-center gap-2">
                          <MaterialIcon name="shield_with_heart" className="text-secondary" />
                          Mitigación de Permanencia y Fugas
                        </h3>
                        <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                          {pddData.riesgosSalvaguardas.riesgosPermanenciaFugas}
                        </p>
                      </div>

                      <div className="p-5 bg-surface-container-low rounded-lg border border-outline-variant space-y-2 transition-colors hover:bg-surface-container">
                        <h3 className="font-heading font-bold text-body-lg text-on-surface flex items-center gap-2">
                          <MaterialIcon name="eco" className="text-on-secondary-container" />
                          Salvaguardas de Cancún & CCB
                        </h3>
                        <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                          {pddData.riesgosSalvaguardas.salvaguardasSocialesAmbientales}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-5 bg-surface-container-low rounded-lg border border-outline-variant space-y-2 transition-colors hover:bg-surface-container">
                        <h3 className="font-heading font-bold text-body-lg text-on-surface">
                          Mecanismo de Distribución de Beneficios (Benefit Sharing)
                        </h3>
                        <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                          {pddData.riesgosSalvaguardas.mecanismoDistribucionBeneficios}
                        </p>
                      </div>

                      <div className="p-5 bg-surface-container-low rounded-lg border border-outline-variant space-y-2 transition-colors hover:bg-surface-container">
                        <h3 className="font-heading font-bold text-body-lg text-on-surface">
                          Consulta Previa (CLPI) y Mecanismo PQR
                        </h3>
                        <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                          {pddData.riesgosSalvaguardas.gobernanzaConsultaPrevia}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: EVALUACIÓN FINANCIERA */}
                {activeTab === 4 && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-5 bg-surface-container-low rounded-lg border border-outline-variant space-y-2 transition-colors hover:bg-surface-container">
                        <h3 className="font-heading font-bold text-body-lg text-on-surface">
                          Presupuesto de Inversión Inicial (CAPEX)
                        </h3>
                        <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                          {pddData.evaluacionFinanciera.capexInicial}
                        </p>
                      </div>

                      <div className="p-5 bg-surface-container-low rounded-lg border border-outline-variant space-y-2 transition-colors hover:bg-surface-container">
                        <h3 className="font-heading font-bold text-body-lg text-on-surface">
                          Costos Operativos Anuales (OPEX)
                        </h3>
                        <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                          {pddData.evaluacionFinanciera.opexAnual}
                        </p>
                      </div>
                    </div>

                    {/* Indicadores Financieros con Hover y Resalte */}
                    <div>
                      <h3 className="font-heading font-bold text-body-lg text-on-surface mb-3 flex items-center gap-2">
                        <MaterialIcon name="monitoring" className="text-secondary" />
                        Indicadores de Retorno y Viabilidad Financiera
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant text-center transition-colors hover:bg-surface-container hover:border-secondary/40 cursor-pointer group">
                          <span className="text-label-caps text-on-surface-variant block">Valor Presente Neto (VPN)</span>
                          <span className="text-headline-sm font-bold text-secondary mt-1 block">
                            {pddData.evaluacionFinanciera.indicadoresFinancieros.vpn}
                          </span>
                        </div>
                        <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant text-center transition-colors hover:bg-surface-container hover:border-primary-container/40 cursor-pointer group">
                          <span className="text-label-caps text-on-surface-variant block">TIR Estimada</span>
                          <span className="text-headline-sm font-bold text-primary-container mt-1 block">
                            {pddData.evaluacionFinanciera.indicadoresFinancieros.tir}
                          </span>
                        </div>
                        <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant text-center transition-colors hover:bg-surface-container hover:border-secondary/40 cursor-pointer group">
                          <span className="text-label-caps text-on-surface-variant block">Periodo de Recuperación</span>
                          <span className="text-headline-sm font-bold text-secondary mt-1 block">
                            {pddData.evaluacionFinanciera.indicadoresFinancieros.payback}
                          </span>
                        </div>
                        <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant text-center transition-colors hover:bg-surface-container hover:border-on-tertiary-fixed-variant/40 cursor-pointer group">
                          <span className="text-label-caps text-on-surface-variant block">Precio Sostenible tCO2e</span>
                          <span className="text-headline-sm font-bold text-on-tertiary-fixed-variant mt-1 block">
                            {pddData.evaluacionFinanciera.indicadoresFinancieros.precioCarbonoSostenibilidad}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-surface-container-low rounded-lg border border-outline-variant space-y-2 transition-colors hover:bg-surface-container">
                      <h3 className="font-heading font-bold text-body-lg text-on-surface">
                        Flujo de Caja Proyectado y Análisis de Sensibilidad
                      </h3>
                      <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                        {pddData.evaluacionFinanciera.flujoCajaProyectado}
                      </p>
                      <p className="text-body-md text-on-surface-variant whitespace-pre-line mt-2">
                        {pddData.evaluacionFinanciera.analisisSensibilidad}
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 5: CRONOGRAMA Y KPIS */}
                {activeTab === 5 && (
                  <div className="space-y-6">
                    {/* Cronograma Operativo */}
                    <div>
                      <h3 className="font-heading font-bold text-body-lg text-on-surface mb-3 flex items-center gap-2">
                        <MaterialIcon name="schedule" className="text-on-tertiary-fixed-variant" />
                        Plan Operativo y Cronograma de Implementación
                      </h3>
                      <div className="overflow-x-auto border border-outline-variant rounded-lg">
                        <table className="w-full text-left text-body-sm">
                          <thead className="bg-primary text-on-primary font-bold">
                            <tr>
                              <th className="p-3">Fase del Proyecto</th>
                              <th className="p-3">Periodo</th>
                              <th className="p-3">Actividades Clave</th>
                              <th className="p-3">Entregable / Hito</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant bg-surface">
                            {pddData.cronogramaOperativo.map((c, idx) => (
                              <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                                <td className="p-3 font-semibold text-on-surface">{c.fase}</td>
                                <td className="p-3 text-on-tertiary-fixed-variant font-medium">{c.periodo}</td>
                                <td className="p-3 text-on-surface-variant">{c.actividadesClave}</td>
                                <td className="p-3 text-on-surface font-medium">{c.entregableHito}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Matriz de KPIs (MRV) */}
                    <div>
                      <h3 className="font-heading font-bold text-body-lg text-on-surface mb-3 flex items-center gap-2">
                        <MaterialIcon name="fact_check" className="text-on-tertiary-fixed-variant" />
                        Cuadro de Mando y KPIs de Seguimiento (MRV)
                      </h3>
                      <div className="overflow-x-auto border border-outline-variant rounded-lg">
                        <table className="w-full text-left text-body-sm">
                          <thead className="bg-primary text-on-primary font-bold">
                            <tr>
                              <th className="p-3">Dimensión</th>
                              <th className="p-3">Indicador Clave (KPI)</th>
                              <th className="p-3">Meta Anual de Impacto</th>
                              <th className="p-3">Frecuencia de Monitoreo</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant bg-surface">
                            {pddData.kpisSeguimiento.map((k, idx) => (
                              <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                                <td className="p-3 font-semibold text-on-surface">{k.categoria}</td>
                                <td className="p-3 text-on-surface-variant">{k.indicador}</td>
                                <td className="p-3 font-medium text-primary-container">{k.metaAnual}</td>
                                <td className="p-3 text-on-surface-variant">{k.frecuenciaMonitoreo}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Estado Vacío / Invitación a Generar */
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-3xl">
                <MaterialIcon name="auto_awesome" />
              </div>
              <h3 className="font-heading text-headline-sm font-bold text-on-surface">
                Aún no has generado el Documento de Diseño del Proyecto (PDD)
              </h3>
              <p className="text-body-md text-on-surface-variant max-w-lg">
                Genera con un solo clic el expediente completo bajo estándares internacionales de carbono, incluyendo análisis de actores, viabilidad financiera (VAN/TIR), cronograma y matriz de KPIs.
              </p>
              <button
                type="button"
                onClick={() => setShowAiModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-container text-on-primary px-6 py-3 font-semibold hover:bg-primary transition-colors cursor-pointer"
              >
                <MaterialIcon name="auto_awesome" className="text-[20px]" />
                Autocompletar con IA
              </button>
            </div>
          )}

          {/* Barra de Acciones Final */}
          <div className="p-6 border-t border-outline-variant bg-surface-container-lowest flex flex-col sm:flex-row justify-between items-center gap-3">
            {pddData ? (
              <button
                type="button"
                onClick={handleDownloadDocx}
                disabled={downloadingDocx}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium border border-primary text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <MaterialIcon name="download" className="text-[20px]" />
                {downloadingDocx ? "Generando Word..." : "Descargar Word (.docx)"}
              </button>
            ) : <div />}

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium bg-primary-container text-on-primary hover:bg-primary transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MaterialIcon name="save" className="text-[18px]" />
                {saving ? "Guardando…" : "Guardar en Expediente"}
              </button>
            </div>
          </div>
        </div>

        {/* Links de Navegación a Otros Módulos */}
        <div className="flex flex-wrap gap-6 text-body-sm pt-2">
          <Link href={`/validacion-registro?predioId=${predioId}`} className="text-primary hover:underline flex items-center gap-1">
            Continuar a validación y registro <MaterialIcon name="arrow_forward" className="text-[16px]" />
          </Link>
          <Link href={`/marketplace?predioId=${predioId}&publish=1`} className="text-primary hover:underline flex items-center gap-1">
            Publicar en marketplace <MaterialIcon name="arrow_forward" className="text-[16px]" />
          </Link>
        </div>
      </main>

      <Footer />

      <GenerarPddModal
        open={showAiModal}
        predio={predioSeleccionado ?? null}
        onClose={() => setShowAiModal(false)}
        onGenerated={handlePddGenerated}
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

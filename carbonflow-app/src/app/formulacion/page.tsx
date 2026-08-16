"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PROJECT_TYPES } from "@/lib/projectTypes";
import { formatNumber } from "@/lib/format";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Footer } from "@/components/Footer";
import { generatePddDocx, PddData } from "@/lib/docx/pddDocxGenerator";

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
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // AI Generation States
  const [showAiModal, setShowAiModal] = useState(false);
  const [amenazas, setAmenazasInput] = useState("");
  const [actividades, setActividadesInput] = useState("");
  const [comunidad, setComunidadInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

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

          // Si hay datos previos en la base de datos, estructuramos un PDD inicial
          if (exp.linea_base && !pddData && predioSeleccionado) {
            setPddData({
              predioNombre: predioSeleccionado.nombre,
              tipoProyecto: labelForType(predioSeleccionado.tipo_proyecto),
              areaHectareas: predioSeleccionado.area_hectareas,
              ubicacion: predioSeleccionado.ubicacion_display || "Colombia",
              resumenEjecutivo: {
                visionGeneral: `Proyecto de conservación y restauración forestal en el predio ${predioSeleccionado.nombre}, orientado a mitigar el cambio climático mediante la emisión de créditos de carbono de alta integridad.`,
                creditosEstimadosAnual: "Estimación calculada",
                inversionRequerida: exp.presupuesto || "Por definir",
                tirEstimada: "22.5%",
                vanEstimado: "$950,000 USD",
                beneficiariosDirectos: "Comunidad local",
              },
              problematica: {
                diagnosticoTerritorial: "Predio con alta cobertura vegetal y presión por deforestación.",
                causasDeforestacion: "Expansión agropecuaria y tala no controlada.",
                arbolProblemasSoluciones: "La conservación directa y la reforestación activa proveen alternativas económicas sostenibles.",
                actoresClave: [
                  {
                    actor: "Comunidad Local",
                    rol: "Custodia del bosque y monitoreo",
                    interesImpacto: "Generación de empleo y bienestar",
                    estrategiaInvolucramiento: "Acuerdos de conservación y distribución equitativa de beneficios",
                  },
                ],
              },
              analisisTecnico: {
                localizacionLimites: predioSeleccionado.ubicacion_display || "Colombia",
                metodologiaEstandar: "VCS VM0007 / Metodologías REDD+ Colombia",
                lineaBaseReferencia: exp.linea_base,
                demostracionAdicionalidad: exp.adicionalidad,
                proyeccionRemociones: "Modelación de captura de carbono según cobertura forestal.",
              },
              riesgosSalvaguardas: {
                riesgosPermanenciaFugas: exp.riesgos_permanencia,
                salvaguardasSocialesAmbientales: exp.salvaguardas,
                mecanismoDistribucionBeneficios: "Distribución directa del 50% de ingresos a las comunidades participantes.",
                gobernanzaConsultaPrevia: "Protocolo de consentimiento previo, libre e informado (CLPI).",
              },
              evaluacionFinanciera: {
                capexInicial: exp.presupuesto || "Estudios y formulación",
                opexAnual: "Monitoreo dMRV continuo y vigilancia",
                flujoCajaProyectado: "Flujo positivo proyectado a partir del año 3 con la primera emisión de créditos.",
                indicadoresFinancieros: {
                  vpn: "$950,000 USD",
                  tir: "22.5%",
                  payback: "3.8 años",
                  precioCarbonoSostenibilidad: "$10.00 USD / tCO2e",
                },
                analisisSensibilidad: "Viable ante variaciones de precio del carbono de hasta -30%.",
              },
              cronogramaOperativo: [
                {
                  fase: "Fase 1: Formulación",
                  periodo: "Meses 1-3",
                  actividadesClave: "Diseño de PDD y consulta",
                  entregableHito: "PDD radicado",
                },
              ],
              kpisSeguimiento: [
                {
                  categoria: "Clima",
                  indicador: "tCO2e emitidas/evitadas",
                  metaAnual: "100%",
                  frecuenciaMonitoreo: "Anual",
                },
              ],
            });
          }
        }
      });
  }, [predioId, predioSeleccionado, pddData]);

  const handleGenerateAi = async () => {
    if (!predioSeleccionado) return;
    setGenerating(true);
    setAiError(null);
    try {
      const res = await fetch("/api/formulacion/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          predio: {
            nombre: predioSeleccionado.nombre,
            area_hectareas: predioSeleccionado.area_hectareas,
            tipo_proyecto: predioSeleccionado.tipo_proyecto,
            ubicacion_display: predioSeleccionado.ubicacion_display,
          },
          amenazas,
          actividades,
          comunidad,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `El servidor respondió con código ${res.status}`);
      }

      const data = await res.json();

      const newPddData: PddData = {
        predioNombre: predioSeleccionado.nombre,
        tipoProyecto: labelForType(predioSeleccionado.tipo_proyecto),
        areaHectareas: predioSeleccionado.area_hectareas,
        ubicacion: predioSeleccionado.ubicacion_display || "Colombia",
        resumenEjecutivo: data.resumenEjecutivo || {
          visionGeneral: "Proyecto de conservación forestal.",
          creditosEstimadosAnual: "45,000 tCO2e/año",
          inversionRequerida: "$400,000 USD",
          tirEstimada: "24%",
          vanEstimado: "$1,200,000 USD",
          beneficiariosDirectos: "Comunidades locales",
        },
        problematica: data.problematica || {
          diagnosticoTerritorial: "",
          causasDeforestacion: "",
          arbolProblemasSoluciones: "",
          actoresClave: [],
        },
        analisisTecnico: data.analisisTecnico || {
          localizacionLimites: "",
          metodologiaEstandar: "",
          lineaBaseReferencia: "",
          demostracionAdicionalidad: "",
          proyeccionRemociones: "",
        },
        riesgosSalvaguardas: data.riesgosSalvaguardas || {
          riesgosPermanenciaFugas: "",
          salvaguardasSocialesAmbientales: "",
          mecanismoDistribucionBeneficios: "",
          gobernanzaConsultaPrevia: "",
        },
        evaluacionFinanciera: data.evaluacionFinanciera || {
          capexInicial: "",
          opexAnual: "",
          flujoCajaProyectado: "",
          indicadoresFinancieros: { vpn: "", tir: "", payback: "", precioCarbonoSostenibilidad: "" },
          analisisSensibilidad: "",
        },
        cronogramaOperativo: data.cronogramaOperativo || [],
        kpisSeguimiento: data.kpisSeguimiento || [],
      };

      setPddData(newPddData);

      // Sincronizar campos legacy
      setLineaBase(data.lineaBase || newPddData.analisisTecnico.lineaBaseReferencia);
      setAdicionalidad(data.adicionalidad || newPddData.analisisTecnico.demostracionAdicionalidad);
      setRiesgosPermanencia(data.riesgosPermanencia || newPddData.riesgosSalvaguardas.riesgosPermanenciaFugas);
      setSalvaguardas(data.salvaguardas || newPddData.riesgosSalvaguardas.salvaguardasSocialesAmbientales);
      setCronograma(data.cronograma || JSON.stringify(newPddData.cronogramaOperativo));
      setPresupuesto(data.presupuesto || newPddData.evaluacionFinanciera.capexInicial);

      setShowAiModal(false);
      setMessage("Documento de Diseño del Proyecto (PDD) generado con éxito. Listo para revisar y exportar en Word.");
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Error al generar el documento.");
    } finally {
      setGenerating(false);
    }
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
          className="inline-flex items-center gap-2 rounded-lg bg-forest-deep text-on-primary px-5 py-2.5 font-medium hover:bg-primary transition-colors"
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
      colorClass: "hover:text-emerald-700 dark:hover:text-emerald-400",
      activeClass: "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-700/20",
      inactiveClass: "bg-surface-container-lowest text-on-surface-variant hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30",
    },
    {
      id: 1,
      label: "1. Problemática y Actores",
      icon: "groups",
      colorClass: "hover:text-blue-700 dark:hover:text-blue-400",
      activeClass: "bg-blue-600 text-white font-bold shadow-md shadow-blue-700/20",
      inactiveClass: "bg-surface-container-lowest text-on-surface-variant hover:bg-blue-50/60 dark:hover:bg-blue-950/30",
    },
    {
      id: 2,
      label: "2. Análisis Técnico",
      icon: "science",
      colorClass: "hover:text-indigo-700 dark:hover:text-indigo-400",
      activeClass: "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-700/20",
      inactiveClass: "bg-surface-container-lowest text-on-surface-variant hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30",
    },
    {
      id: 3,
      label: "3. Riesgos y Salvaguardas",
      icon: "shield",
      colorClass: "hover:text-amber-700 dark:hover:text-amber-400",
      activeClass: "bg-amber-600 text-white font-bold shadow-md shadow-amber-700/20",
      inactiveClass: "bg-surface-container-lowest text-on-surface-variant hover:bg-amber-50/60 dark:hover:bg-amber-950/30",
    },
    {
      id: 4,
      label: "4. Evaluación Financiera",
      icon: "payments",
      colorClass: "hover:text-teal-700 dark:hover:text-teal-400",
      activeClass: "bg-teal-600 text-white font-bold shadow-md shadow-teal-700/20",
      inactiveClass: "bg-surface-container-lowest text-on-surface-variant hover:bg-teal-50/60 dark:hover:bg-teal-950/30",
    },
    {
      id: 5,
      label: "5. Cronograma y KPIs",
      icon: "fact_check",
      colorClass: "hover:text-purple-700 dark:hover:text-purple-400",
      activeClass: "bg-purple-600 text-white font-bold shadow-md shadow-purple-700/20",
      inactiveClass: "bg-surface-container-lowest text-on-surface-variant hover:bg-purple-50/60 dark:hover:bg-purple-950/30",
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
                className="w-full bg-surface border border-outline-variant rounded-lg text-body-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-sm"
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
              <div className="bg-surface p-4 rounded-xl border border-outline-variant shadow-sm flex items-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/60 cursor-pointer group">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <MaterialIcon name="straighten" className="text-xl" />
                </div>
                <div>
                  <span className="font-data text-label-caps text-on-surface-variant block">Área Total</span>
                  <span className="font-data text-data-mono font-bold text-on-surface text-lg group-hover:text-primary transition-colors">
                    {formatNumber(predioSeleccionado.area_hectareas, 2)} ha
                  </span>
                </div>
              </div>

              <div className="bg-surface p-4 rounded-xl border border-outline-variant shadow-sm flex items-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/60 cursor-pointer group">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <MaterialIcon name="location_on" className="text-xl" />
                </div>
                <div className="truncate">
                  <span className="font-data text-label-caps text-on-surface-variant block">Ubicación</span>
                  <span className="font-data text-data-mono font-bold text-on-surface text-sm truncate block group-hover:text-primary transition-colors">
                    {predioSeleccionado.ubicacion_display ?? "No determinada"}
                  </span>
                </div>
              </div>

              <div className="bg-surface p-4 rounded-xl border border-outline-variant shadow-sm flex items-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/60 cursor-pointer group">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
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
        <div className="bg-surface rounded-2xl border border-outline-variant shadow-md overflow-hidden">
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
                className="inline-flex items-center gap-2 rounded-xl bg-forest-deep text-on-primary px-5 py-2.5 text-body-sm font-semibold hover:bg-primary transition-all shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02]"
              >
                <MaterialIcon name="auto_awesome" className="text-[18px]" />
                Autocompletar con IA
              </button>

              {pddData && (
                <button
                  type="button"
                  onClick={handleDownloadDocx}
                  disabled={downloadingDocx}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/30 text-primary px-5 py-2.5 text-body-sm font-semibold hover:bg-primary/20 transition-all shadow-sm cursor-pointer disabled:opacity-50 hover:shadow-md hover:scale-[1.02]"
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
          {pddData ? (
            <div className="flex flex-col">
              {/* Pestañas de Navegación del Documento con Colores Vivos */}
              <div className="flex overflow-x-auto border-b border-outline-variant bg-surface-container-lowest p-2 gap-2">
                {PDD_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-body-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
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
                      <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-emerald-500/80 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 cursor-pointer group">
                        <span className="text-label-caps font-data text-on-surface-variant block mb-1">Créditos Anuales</span>
                        <span className="text-headline-sm font-bold text-emerald-700 dark:text-emerald-400 block group-hover:scale-105 transition-transform">
                          {pddData.resumenEjecutivo.creditosEstimadosAnual}
                        </span>
                      </div>
                      <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-blue-500/80 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 cursor-pointer group">
                        <span className="text-label-caps font-data text-on-surface-variant block">CAPEX Estimado</span>
                        <span className="text-headline-sm font-bold text-blue-700 dark:text-blue-400 block group-hover:scale-105 transition-transform">
                          {pddData.resumenEjecutivo.inversionRequerida}
                        </span>
                      </div>
                      <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-teal-500/80 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 cursor-pointer group">
                        <span className="text-label-caps font-data text-on-surface-variant block">TIR Proyectada</span>
                        <span className="text-headline-sm font-bold text-teal-700 dark:text-teal-400 block group-hover:scale-105 transition-transform">
                          {pddData.resumenEjecutivo.tirEstimada}
                        </span>
                      </div>
                      <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-indigo-500/80 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 cursor-pointer group">
                        <span className="text-label-caps font-data text-on-surface-variant block">VPN Estimado</span>
                        <span className="text-headline-sm font-bold text-indigo-700 dark:text-indigo-400 block group-hover:scale-105 transition-transform">
                          {pddData.resumenEjecutivo.vanEstimado}
                        </span>
                      </div>
                      <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-amber-500/80 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 cursor-pointer group">
                        <span className="text-label-caps font-data text-on-surface-variant block">Impacto Social</span>
                        <span className="text-headline-sm font-bold text-amber-700 dark:text-amber-400 block group-hover:scale-105 transition-transform">
                          {pddData.resumenEjecutivo.beneficiariosDirectos}
                        </span>
                      </div>
                    </div>

                    {/* Visión General Callout */}
                    <div className="p-6 bg-surface-container-low rounded-xl border-l-4 border-primary border-outline-variant shadow-sm space-y-2 hover:shadow-md transition-shadow">
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
                      <div className="p-5 bg-surface-container-low rounded-xl border border-outline-variant space-y-2 hover:shadow-md transition-all">
                        <h3 className="font-heading font-bold text-body-lg text-on-surface flex items-center gap-2">
                          <MaterialIcon name="crisis_alert" className="text-status-warning" />
                          Diagnóstico Territorial y Deforestación
                        </h3>
                        <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                          {pddData.problematica.diagnosticoTerritorial}
                        </p>
                        <p className="text-body-md text-on-surface-variant whitespace-pre-line mt-2">
                          {pddData.problematica.causasDeforestacion}
                        </p>
                      </div>

                      <div className="p-5 bg-surface-container-low rounded-xl border border-outline-variant space-y-2 hover:shadow-md transition-all">
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
                      <div className="overflow-x-auto border border-outline-variant rounded-xl shadow-sm">
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
                              <tr key={idx} className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors">
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
                    <div className="p-5 bg-surface-container-low rounded-xl border border-outline-variant space-y-2 hover:shadow-md transition-all">
                      <h3 className="font-heading font-bold text-body-lg text-on-surface">
                        Localización, Límites y Criterios de Elegibilidad
                      </h3>
                      <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                        {pddData.analisisTecnico.localizacionLimites}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-5 bg-surface-container-low rounded-xl border border-outline-variant space-y-2 hover:shadow-md transition-all">
                        <h3 className="font-heading font-bold text-body-lg text-on-surface">
                          Estándar y Metodología Aplicable
                        </h3>
                        <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                          {pddData.analisisTecnico.metodologiaEstandar}
                        </p>
                      </div>

                      <div className="p-5 bg-surface-container-low rounded-xl border border-outline-variant space-y-2 hover:shadow-md transition-all">
                        <h3 className="font-heading font-bold text-body-lg text-on-surface">
                          Demostración de Adicionalidad (Res. 1447/2018)
                        </h3>
                        <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                          {pddData.analisisTecnico.demostracionAdicionalidad}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 bg-surface-container-low rounded-xl border border-outline-variant space-y-2 hover:shadow-md transition-all">
                      <h3 className="font-heading font-bold text-body-lg text-on-surface">
                        Línea Base y Escenario de Referencia
                      </h3>
                      <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                        {pddData.analisisTecnico.lineaBaseReferencia}
                      </p>
                    </div>

                    <div className="p-6 bg-primary/10 rounded-xl border border-primary/20 space-y-2 hover:shadow-md transition-all">
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
                      <div className="p-5 bg-surface-container-low rounded-xl border border-outline-variant space-y-2 hover:shadow-md transition-all">
                        <h3 className="font-heading font-bold text-body-lg text-on-surface flex items-center gap-2">
                          <MaterialIcon name="shield_with_heart" className="text-secondary" />
                          Mitigación de Permanencia y Fugas
                        </h3>
                        <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                          {pddData.riesgosSalvaguardas.riesgosPermanenciaFugas}
                        </p>
                      </div>

                      <div className="p-5 bg-surface-container-low rounded-xl border border-outline-variant space-y-2 hover:shadow-md transition-all">
                        <h3 className="font-heading font-bold text-body-lg text-on-surface flex items-center gap-2">
                          <MaterialIcon name="eco" className="text-status-success" />
                          Salvaguardas de Cancún & CCB
                        </h3>
                        <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                          {pddData.riesgosSalvaguardas.salvaguardasSocialesAmbientales}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-5 bg-surface-container-low rounded-xl border border-outline-variant space-y-2 hover:shadow-md transition-all">
                        <h3 className="font-heading font-bold text-body-lg text-on-surface">
                          Mecanismo de Distribución de Beneficios (Benefit Sharing)
                        </h3>
                        <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                          {pddData.riesgosSalvaguardas.mecanismoDistribucionBeneficios}
                        </p>
                      </div>

                      <div className="p-5 bg-surface-container-low rounded-xl border border-outline-variant space-y-2 hover:shadow-md transition-all">
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
                      <div className="p-5 bg-surface-container-low rounded-xl border border-outline-variant space-y-2 hover:shadow-md transition-all">
                        <h3 className="font-heading font-bold text-body-lg text-on-surface">
                          Presupuesto de Inversión Inicial (CAPEX)
                        </h3>
                        <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                          {pddData.evaluacionFinanciera.capexInicial}
                        </p>
                      </div>

                      <div className="p-5 bg-surface-container-low rounded-xl border border-outline-variant space-y-2 hover:shadow-md transition-all">
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
                        <MaterialIcon name="monitoring" className="text-teal-600" />
                        Indicadores de Retorno y Viabilidad Financiera
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-teal-500/80 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 cursor-pointer group">
                          <span className="text-label-caps text-on-surface-variant block">Valor Presente Neto (VPN)</span>
                          <span className="text-headline-sm font-bold text-teal-700 dark:text-teal-400 mt-1 block group-hover:scale-105 transition-transform">
                            {pddData.evaluacionFinanciera.indicadoresFinancieros.vpn}
                          </span>
                        </div>
                        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-emerald-500/80 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 cursor-pointer group">
                          <span className="text-label-caps text-on-surface-variant block">TIR Estimada</span>
                          <span className="text-headline-sm font-bold text-emerald-700 dark:text-emerald-400 mt-1 block group-hover:scale-105 transition-transform">
                            {pddData.evaluacionFinanciera.indicadoresFinancieros.tir}
                          </span>
                        </div>
                        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-blue-500/80 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 cursor-pointer group">
                          <span className="text-label-caps text-on-surface-variant block">Periodo de Recuperación</span>
                          <span className="text-headline-sm font-bold text-blue-700 dark:text-blue-400 mt-1 block group-hover:scale-105 transition-transform">
                            {pddData.evaluacionFinanciera.indicadoresFinancieros.payback}
                          </span>
                        </div>
                        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-amber-500/80 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 cursor-pointer group">
                          <span className="text-label-caps text-on-surface-variant block">Precio Sostenible tCO2e</span>
                          <span className="text-headline-sm font-bold text-amber-700 dark:text-amber-400 mt-1 block group-hover:scale-105 transition-transform">
                            {pddData.evaluacionFinanciera.indicadoresFinancieros.precioCarbonoSostenibilidad}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-surface-container-low rounded-xl border border-outline-variant space-y-2 hover:shadow-md transition-all">
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
                        <MaterialIcon name="schedule" className="text-purple-600" />
                        Plan Operativo y Cronograma de Implementación
                      </h3>
                      <div className="overflow-x-auto border border-outline-variant rounded-xl shadow-sm">
                        <table className="w-full text-left text-body-sm">
                          <thead className="bg-purple-700 text-white font-bold">
                            <tr>
                              <th className="p-3">Fase del Proyecto</th>
                              <th className="p-3">Periodo</th>
                              <th className="p-3">Actividades Clave</th>
                              <th className="p-3">Entregable / Hito</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant bg-surface">
                            {pddData.cronogramaOperativo.map((c, idx) => (
                              <tr key={idx} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors">
                                <td className="p-3 font-semibold text-on-surface">{c.fase}</td>
                                <td className="p-3 text-purple-700 dark:text-purple-400 font-medium">{c.periodo}</td>
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
                        <MaterialIcon name="fact_check" className="text-purple-600" />
                        Cuadro de Mando y KPIs de Seguimiento (MRV)
                      </h3>
                      <div className="overflow-x-auto border border-outline-variant rounded-xl shadow-sm">
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
                              <tr key={idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                                <td className="p-3 font-semibold text-on-surface">{k.categoria}</td>
                                <td className="p-3 text-on-surface-variant">{k.indicador}</td>
                                <td className="p-3 font-medium text-emerald-700 dark:text-emerald-400">{k.metaAnual}</td>
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
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl">
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
                className="inline-flex items-center gap-2 rounded-xl bg-forest-deep text-on-primary px-6 py-3 font-semibold hover:bg-primary transition-all shadow-md cursor-pointer hover:shadow-lg hover:scale-105"
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
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium border border-primary text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:shadow-sm"
              >
                <MaterialIcon name="download" className="text-[20px]" />
                {downloadingDocx ? "Generando Word..." : "Descargar Word (.docx)"}
              </button>
            ) : <div />}

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium bg-forest-deep text-on-primary hover:bg-primary transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer hover:shadow-md"
              >
                <MaterialIcon name="save" className="text-[18px]" />
                {saving ? "Guardando…" : "Guardar en Expediente"}
              </button>
            </div>
          </div>
        </div>

        {/* Links de Navegación a Otros Módulos */}
        <div className="flex flex-wrap gap-6 text-body-sm pt-2">
          <Link href={`/certificacion?predioId=${predioId}`} className="text-primary hover:underline flex items-center gap-1">
            Continuar a certificación <MaterialIcon name="arrow_forward" className="text-[16px]" />
          </Link>
          <Link href={`/marketplace?predioId=${predioId}`} className="text-primary hover:underline flex items-center gap-1">
            Publicar en marketplace <MaterialIcon name="arrow_forward" className="text-[16px]" />
          </Link>
          <Link href={`/bonos-verdes?predioId=${predioId}`} className="text-primary hover:underline flex items-center gap-1">
            Ver perfiles de Bonos Verdes <MaterialIcon name="arrow_forward" className="text-[16px]" />
          </Link>
        </div>
      </main>

      <Footer />

      {/* Modal de Generación con IA */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-surface rounded-2xl border border-outline-variant max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-fade-in text-on-surface">
            <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-container-low rounded-t-2xl">
              <div className="flex items-center gap-2">
                <MaterialIcon name="auto_awesome" className="text-primary text-xl" />
                <h3 className="text-headline-sm font-heading font-bold text-on-surface">
                  Generar Documento de Diseño (PDD) con IA
                </h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-highest transition-colors cursor-pointer"
                disabled={generating}
              >
                <MaterialIcon name="close" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <p className="text-body-md text-on-surface-variant">
                Aporta información básica sobre el predio. La IA estructurará el PDD completo bajo estándares internacionales de carbono, incluyendo análisis de actores, modelo financiero (VAN/TIR), cronograma y matriz de KPIs.
              </p>

              <div>
                <label className="block text-body-sm font-medium text-on-surface mb-1">
                  1. Amenazas de deforestación / degradación territorial
                </label>
                <textarea
                  value={amenazas}
                  onChange={(e) => setAmenazasInput(e.target.value)}
                  placeholder="Ej: Presión por tala ilegal de madera fina, expansión de la ganadería extensiva y riesgo de quemas estacionales."
                  rows={3}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg text-body-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-on-surface"
                  disabled={generating}
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-on-surface mb-1">
                  2. Actividades propuestas de conservación y restauración
                </label>
                <textarea
                  value={actividades}
                  onChange={(e) => setActividadesInput(e.target.value)}
                  placeholder="Ej: Reforestación activa con plántulas nativas (Abarco, Choibá), enriquecimiento de rastrojos y vigilancia satelital con guardabosques."
                  rows={3}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg text-body-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-on-surface"
                  disabled={generating}
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-on-surface mb-1">
                  3. Relación comunitaria, empleo verde y acuerdos
                </label>
                <textarea
                  value={comunidad}
                  onChange={(e) => setComunidadInput(e.target.value)}
                  placeholder="Ej: Vinculación laboral de 40 familias locales, distribución directa del 50% de ingresos de carbono y talleres de capacitación ambiental."
                  rows={3}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg text-body-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-on-surface"
                  disabled={generating}
                />
              </div>

              {aiError && (
                <div className="p-3 bg-error-container/20 border border-error/30 text-error text-body-sm rounded-lg flex items-start gap-2">
                  <MaterialIcon name="error" className="text-[18px] shrink-0 mt-0.5" />
                  <span>{aiError}</span>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-outline-variant bg-surface-container-low rounded-b-2xl flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-5 py-2.5 rounded-xl font-medium border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest transition-colors cursor-pointer"
                disabled={generating}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGenerateAi}
                disabled={generating || !amenazas.trim() || !actividades.trim()}
                className="px-5 py-2.5 rounded-xl font-medium bg-forest-deep text-on-primary hover:bg-primary transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-md hover:scale-105"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    Generando PDD...
                  </>
                ) : (
                  <>
                    <MaterialIcon name="auto_awesome" className="text-[18px]" />
                    Generar PDD con IA
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
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

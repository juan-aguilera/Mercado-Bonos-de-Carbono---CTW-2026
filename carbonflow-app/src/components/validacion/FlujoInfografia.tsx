"use client";

import { useState } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { StatusPill } from "@/components/ui/StatusPill";

const AVISO_RUTA =
  "Esta ruta es orientativa. CarbonFlow no valida, verifica, certifica, registra ante RENARE ni garantiza pagos por resultados.";

type ActorId = "titular" | "carbonflow" | "renare" | "ovv" | "mercado";

const ACTORES: { id: ActorId; label: string; icon: string; tooltip: string; chip: string }[] = [
  {
    id: "titular",
    label: "Titular",
    icon: "person",
    tooltip: "Define la iniciativa, contrata la OVV, implementa y gestiona acuerdos.",
    chip: "bg-[#E8F1FF] text-[#2563EB] border-[#2563EB]/30",
  },
  {
    id: "carbonflow",
    label: "CarbonFlow",
    icon: "eco",
    tooltip:
      "Diagnostica, formula, organiza brechas y conecta aliados. No valida, verifica, certifica, registra ni paga.",
    chip: "bg-[#EAF8EF] text-[#15803D] border-[#15803D]/30",
  },
  {
    id: "renare",
    label: "RENARE",
    icon: "account_balance",
    tooltip: "Registro, actualización, reporte y trazabilidad nacional cuando aplique.",
    chip: "bg-[#EAF4FF] text-[#0369A1] border-[#0369A1]/30",
  },
  {
    id: "ovv",
    label: "OVV",
    icon: "verified",
    tooltip: "Validación del diseño y verificación independiente de resultados. No emite créditos ni paga.",
    chip: "bg-[#F3E8FF] text-[#7E22CE] border-[#7E22CE]/30",
  },
  {
    id: "mercado",
    label: "Mercado",
    icon: "handshake",
    tooltip: "Comprador o pagador de resultados verificables. CarbonFlow no ejecuta la transacción.",
    chip: "bg-[#FFF7E6] text-[#B45309] border-[#B45309]/30",
  },
];

interface EtapaInfo {
  id: number;
  titulo: string;
  resumen: string;
  actores: ActorId[];
  lider: string;
  objetivo: string;
  rolCarbonFlow: string;
  rolRenare: string;
  rolOvv: string;
  resultado: string;
  futura?: boolean;
  acciones: { label: string; href: string }[];
}

const ETAPAS: EtapaInfo[] = [
  {
    id: 1,
    titulo: "Factibilidad",
    resumen: "Define predio, actividad y objetivo.",
    actores: ["titular", "carbonflow"],
    lider: "Titular",
    objetivo: "Determinar si existe una iniciativa con información mínima para estructurarse.",
    rolCarbonFlow: "Diagnóstico, análisis geoespacial, score y CO2e preliminar.",
    rolRenare: "Revisar si aplica inscripción o reporte desde factibilidad.",
    rolOvv: "No interviene normalmente.",
    resultado: "Decisión de estructurar la iniciativa.",
    acciones: [{ label: "Ir a Diagnóstico", href: "/diagnostico" }],
  },
  {
    id: 2,
    titulo: "Formulación",
    resumen: "Línea base, adicionalidad, riesgos y salvaguardas.",
    actores: ["titular", "carbonflow"],
    lider: "Titular",
    objetivo: "Completar el expediente preliminar y un paquete de preevaluación.",
    rolCarbonFlow: "Formulario guiado, expediente y brechas de preparación.",
    rolRenare: "Revisar requisitos aplicables de información.",
    rolOvv: "Puede contratarse posteriormente para revisar el diseño.",
    resultado: "Paquete de preevaluación.",
    acciones: [{ label: "Continuar Formulación", href: "/formulacion" }],
  },
  {
    id: 3,
    titulo: "Validación",
    resumen: "Revisión independiente del diseño.",
    actores: ["ovv", "renare"],
    lider: "Titular / OVV",
    objetivo: "Obtener evaluación independiente del diseño, según la ruta aplicable.",
    rolCarbonFlow: "Prepara y organiza el expediente para revisión técnica.",
    rolRenare: "Registro o actualización de fase y soportes, cuando aplique.",
    rolOvv: "Evalúa independientemente el diseño.",
    resultado: "Informe o declaración de validación.",
    acciones: [
      { label: "Generar paquete", href: "#paquete" },
      { label: "Encontrar una OVV", href: "#consentimiento" },
      { label: "Referencia RENARE", href: "#renare" },
    ],
  },
  {
    id: 4,
    titulo: "Implementación",
    resumen: "Ejecuta y monitorea resultados.",
    actores: ["titular", "renare"],
    lider: "Titular",
    objetivo: "Ejecutar las actividades y recopilar evidencia de resultados.",
    rolCarbonFlow: "Fase futura: MRV operativo.",
    rolRenare: "Reporte de avances o resultados, cuando aplique.",
    rolOvv: "No ejecuta el monitoreo por el titular.",
    resultado: "Datos y evidencias del periodo.",
    futura: true,
    acciones: [{ label: "Ver recursos de MRV", href: "#recursos" }],
  },
  {
    id: 5,
    titulo: "Verificación",
    resumen: "Revisión independiente de resultados.",
    actores: ["ovv", "titular"],
    lider: "Titular / OVV",
    objetivo: "Comprobar de manera independiente los resultados de mitigación reportados.",
    rolCarbonFlow: "Fase futura: apoyo a la preparación del reporte.",
    rolRenare: "Recibe o referencia resultados reportados, según la ruta.",
    rolOvv: "Revisa resultados, evidencias y cálculos.",
    resultado: "Informe o declaración de verificación.",
    futura: true,
    acciones: [{ label: "Ver requisitos de MRV", href: "#recursos" }],
  },
  {
    id: 6,
    titulo: "Resultados",
    resumen: "Reconocimiento y pago según ruta.",
    actores: ["renare", "mercado"],
    lider: "Titular",
    objetivo: "Obtener reconocimiento o remuneración de resultados verificables.",
    rolCarbonFlow: "Marketplace: conexiones, no transacciones.",
    rolRenare: "Trazabilidad de resultados y usos, cuando aplique.",
    rolOvv: "El informe respalda la ruta; no emite ni paga.",
    resultado: "Reconocimiento, emisión o pago según contrato y ruta.",
    futura: true,
    acciones: [{ label: "Ir a Marketplace", href: "/marketplace" }],
  },
  {
    id: 7,
    titulo: "Cierre",
    resumen: "Reporte de cierre y seguimiento.",
    actores: ["titular", "renare"],
    lider: "Titular",
    objetivo: "Cerrar formalmente la iniciativa o cumplir el seguimiento post-cierre.",
    rolCarbonFlow: "Guía y recordatorios futuros.",
    rolRenare: "Actualización de cierre, cuando corresponda.",
    rolOvv: "Puede intervenir si la ruta lo exige.",
    resultado: "Iniciativa cerrada o en seguimiento.",
    futura: true,
    acciones: [{ label: "Ver guía de cierre", href: "#recursos" }],
  },
];

function mapEtapaNueveASiete(etapaNueve: number): number {
  if (etapaNueve <= 1) return 1;
  if (etapaNueve === 2) return 2;
  if (etapaNueve <= 4) return 3;
  if (etapaNueve === 5) return 4;
  if (etapaNueve === 6) return 5;
  if (etapaNueve <= 8) return 6;
  return 7;
}

function actorChip(id: ActorId) {
  return ACTORES.find((a) => a.id === id)!;
}

export function FlujoInfografia({
  etapaNueveActual,
  predioId,
  onMarketplace,
}: {
  etapaNueveActual?: number;
  predioId?: string;
  onMarketplace?: () => void;
}) {
  const actual = mapEtapaNueveASiete(etapaNueveActual ?? 1);
  const [maximizado, setMaximizado] = useState(false);
  const [abierta, setAbierta] = useState<number | null>(null);
  const visibles = maximizado ? ETAPAS : ETAPAS.slice(0, 2);
  const etapa = ETAPAS.find((e) => e.id === abierta) ?? null;

  const hrefConPredio = (href: string) => {
    if (href.startsWith("#") || !predioId) return href;
    if (href === "/formulacion") return `/formulacion?predioId=${predioId}`;
    return href;
  };

  return (
    <aside
      className={`lg:sticky lg:top-24 bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col ${
        maximizado ? "lg:max-h-[calc(100vh-7.5rem)]" : ""
      }`}
    >
      <div className="px-4 py-3 bg-[#0b2218] text-on-primary flex items-start justify-between gap-2">
        <div>
          <p className="font-data text-label-caps text-primary-fixed-dim">Ruta del proceso</p>
          <h2 className="font-heading text-body-md font-semibold">Validación y registro</h2>
        </div>
        <button
          type="button"
          onClick={() => setMaximizado((v) => !v)}
          className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-white/10 hover:bg-white/15 px-2 py-1 text-disclaimer-italic"
          aria-expanded={maximizado}
        >
          <MaterialIcon name={maximizado ? "close_fullscreen" : "open_in_full"} className="text-[16px]" />
          {maximizado ? "Minimizar" : "Maximizar"}
        </button>
      </div>

      <div className={`p-3 space-y-2 ${maximizado ? "overflow-y-auto" : ""}`}>
        <ol className="space-y-1.5">
          {visibles.map((e, i) => (
            <li key={e.id}>
              <EtapaCard
                etapa={e}
                actual={actual}
                selected={abierta === e.id}
                compact={!maximizado}
                onSelect={() => {
                  if (!maximizado) setMaximizado(true);
                  setAbierta(abierta === e.id ? null : e.id);
                }}
              />
              {i < visibles.length - 1 && (
                <div className="flex justify-center text-[#15803D] py-0.5" aria-hidden>
                  <MaterialIcon name="south" className="text-[18px]" />
                </div>
              )}
            </li>
          ))}
        </ol>

        {!maximizado && (
          <button
            type="button"
            onClick={() => setMaximizado(true)}
            className="w-full rounded-lg border border-dashed border-outline-variant px-3 py-2 text-body-sm text-on-surface-variant hover:bg-surface-container-lowest"
          >
            + 5 etapas más · ver todo el proceso
          </button>
        )}

        {maximizado && etapa && (
          <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-3 space-y-2">
            <h3 className="font-heading text-body-md font-semibold">
              {etapa.id}. {etapa.titulo}
            </h3>
            {etapa.futura && <StatusPill variant="neutral">Fase futura</StatusPill>}
            <p className="text-body-sm text-on-surface-variant">{etapa.objetivo}</p>
            <ul className="text-body-sm text-on-surface-variant space-y-1">
              <li>
                <strong className="text-on-surface">Responsable:</strong> {etapa.lider}
              </li>
              <li>
                <strong className="text-on-surface">CarbonFlow:</strong> {etapa.rolCarbonFlow}
              </li>
              <li>
                <strong className="text-on-surface">RENARE:</strong> {etapa.rolRenare}
              </li>
              <li>
                <strong className="text-on-surface">OVV:</strong> {etapa.rolOvv}
              </li>
              <li>
                <strong className="text-on-surface">Resultado:</strong> {etapa.resultado}
              </li>
            </ul>
            <div className="flex flex-col gap-1.5">
              {etapa.acciones.map((a) =>
                a.label === "Encontrar una OVV" && onMarketplace ? (
                  <button
                    key={a.label}
                    type="button"
                    onClick={onMarketplace}
                    className="rounded-lg bg-forest-deep text-on-primary px-3 py-1.5 text-body-sm"
                  >
                    {a.label}
                  </button>
                ) : a.href.startsWith("#") ? (
                  <a key={a.label} href={a.href} className="rounded-lg border border-outline-variant px-3 py-1.5 text-body-sm">
                    {a.label}
                  </a>
                ) : (
                  <Link
                    key={a.label}
                    href={hrefConPredio(a.href)}
                    className="rounded-lg border border-outline-variant px-3 py-1.5 text-body-sm"
                  >
                    {a.label}
                  </Link>
                )
              )}
            </div>
          </div>
        )}

        {maximizado && (
          <>
            <div className="flex flex-wrap gap-1">
              {ACTORES.map((a) => (
                <span key={a.id} title={a.tooltip} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] ${a.chip}`}>
                  <MaterialIcon name={a.icon} className="text-[13px]" />
                  {a.label}
                </span>
              ))}
            </div>
            <p className="text-disclaimer-italic text-on-surface-variant">{AVISO_RUTA}</p>
          </>
        )}
      </div>
    </aside>
  );
}

function EtapaCard({
  etapa,
  actual,
  selected,
  compact,
  onSelect,
}: {
  etapa: EtapaInfo;
  actual: number;
  selected: boolean;
  compact: boolean;
  onSelect: () => void;
}) {
  const esActual = etapa.id === actual;
  const hecha = etapa.id < actual;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-lg border p-2.5 transition-shadow ${
        selected
          ? "border-primary shadow-sm bg-surface"
          : esActual
            ? "border-[#2563EB] bg-[#E8F1FF]/60"
            : hecha
              ? "border-[#15803D]/40 bg-[#EAF8EF]/50"
              : "border-outline-variant bg-surface-container-lowest"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center font-data text-[11px] shrink-0 ${
            hecha
              ? "bg-[#15803D] text-white"
              : esActual
                ? "bg-[#2563EB] text-white"
                : "bg-surface-container-high text-on-surface-variant"
          }`}
        >
          {hecha ? "✓" : etapa.id}
        </span>
        <span className="font-heading text-body-sm font-semibold truncate">{etapa.titulo}</span>
      </div>
      {!compact && <p className="text-disclaimer-italic text-on-surface-variant mt-1.5 pl-8">{etapa.resumen}</p>}
      {!compact && (
        <div className="flex flex-wrap gap-1 mt-2 pl-8">
          {etapa.actores.map((id) => {
            const a = actorChip(id);
            return (
              <span key={id} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border text-[10px] ${a.chip}`}>
                <MaterialIcon name={a.icon} className="text-[12px]" />
                {a.label}
              </span>
            );
          })}
        </div>
      )}
    </button>
  );
}

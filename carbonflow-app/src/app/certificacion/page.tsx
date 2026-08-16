"use client";

import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { StatusPill } from "@/components/ui/StatusPill";
import { Footer } from "@/components/Footer";
import { DEPARTAMENTOS_COLOMBIA } from "@/lib/departamentos";
import { formatNumber } from "@/lib/format";
import {
  REGISTROS_OFICIALES,
  statusVariant,
  type ProyectoRegistroOficial,
  type RegistroOficial,
} from "@/lib/integrations/proyectosRegistro";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const PREGUNTAS_SUGERIDAS = [
  "¿Qué estándar me conviene para un proyecto de conservación forestal?",
  "¿Qué es la adicionalidad y cómo la sustento?",
  "¿Qué pasos sigue el proceso de certificación?",
  "¿Necesito registrar mi proyecto en RENARE?",
];

function ChatAvatar({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <img
      src="/mujer-corporativa.avif"
      alt="Asistente de Certificación"
      className={`${size === "md" ? "w-10 h-10" : "w-8 h-8"} rounded-full object-cover object-top shrink-0`}
    />
  );
}

export default function CertificacionPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hola. Soy el asistente de CarbonFlow. Puedo ayudarte con normatividad, estándares, metodologías y entidades acreditadas para proyectos de conservación/restauración forestal en Colombia. Esto es orientación informativa, no asesoría legal.",
    },
  ]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const [registro, setRegistro] = useState<RegistroOficial>("Verra");
  const [departamento, setDepartamento] = useState("");
  const [proyectos, setProyectos] = useState<ProyectoRegistroOficial[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "No se pudo consultar el chatbot en este momento. Intenta de nuevo." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setListLoading(true);
      setListError(null);
      try {
        const params = new URLSearchParams({ registro });
        if (departamento) params.set("departamento", departamento);
        const res = await fetch(`/api/registries/proyectos?${params}`, { signal: controller.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `El servidor respondió ${res.status}`);
        setProyectos(data.proyectos ?? []);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setProyectos([]);
        setListError(
          err instanceof Error ? err.message : "No se pudo cargar el catálogo de proyectos."
        );
      } finally {
        setListLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [registro, departamento]);

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 px-margin-mobile md:px-margin-desktop py-8 md:py-margin-desktop bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="font-heading text-headline-lg text-primary mb-2">Módulo de Certificación</h1>
            <p className="text-body-lg text-on-surface-variant">
              Consulta en vivo de registros oficiales y orientación normativa.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter items-start">
            {/* Left: chatbot */}
            <div className="xl:col-span-7 flex flex-col h-[640px] xl:h-[min(780px,calc(100vh-12rem))] xl:sticky xl:top-24 border border-outline-variant rounded-xl bg-surface shadow-sm overflow-hidden">
              <div className="p-4 bg-forest-deep text-on-primary flex items-center gap-3 border-b border-primary-container">
                <ChatAvatar size="md" />
                <div>
                  <h3 className="text-body-md font-semibold">Asistente de Certificación</h3>
                  <p className="text-body-sm text-primary-fixed-dim">Guía normativa con IA</p>
                </div>
              </div>

              <div className="bg-[#fff8e6] border-l-4 border-status-warning p-3 flex items-start gap-2">
                <MaterialIcon name="info" className="text-status-warning text-[20px]" />
                <p className="text-disclaimer-italic text-[#55340d]">
                  Orientación informativa, no constituye asesoría legal. Consulta siempre las fuentes oficiales.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container-lowest">
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "ml-auto justify-end" : ""}`}>
                    {m.role === "assistant" && (
                      <div className="mt-1 shrink-0">
                        <ChatAvatar />
                      </div>
                    )}
                    <div
                      className={
                        m.role === "user"
                          ? "bg-primary-container text-on-primary-container p-3 rounded-2xl rounded-tr-sm shadow-sm"
                          : "bg-surface border border-outline-variant p-3 rounded-2xl rounded-tl-sm shadow-sm"
                      }
                    >
                      <p className="text-body-sm whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="mt-1 shrink-0">
                      <ChatAvatar />
                    </div>
                    <div className="bg-surface border border-outline-variant p-3 rounded-2xl rounded-tl-sm shadow-sm text-on-surface-variant text-body-sm">
                      Escribiendo…
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-surface border-t border-outline-variant space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {PREGUNTAS_SUGERIDAS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-disclaimer-italic px-2 py-1 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage(input);
                  }}
                  className="relative"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu consulta normativa…"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-full pl-4 pr-12 py-3 text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center hover:bg-forest-deep hover:text-on-primary transition-colors disabled:opacity-50"
                  >
                    <MaterialIcon name="send" filled className="text-[18px]" />
                  </button>
                </form>
              </div>
            </div>

            {/* Right: catálogo por registro y departamento */}
            <div className="xl:col-span-5 flex flex-col gap-6">
              <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm">
                <h3 className="font-heading text-headline-md text-on-surface mb-4 flex items-center gap-2">
                  <MaterialIcon name="search_check" className="text-primary" />
                  Búsqueda en registros oficiales
                </h3>
                <p className="text-body-sm text-on-surface-variant mb-6">
                  Elige un registro y, si quieres, un departamento para ver proyectos disponibles y revisar su estado.
                </p>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-data text-label-caps text-on-surface-variant">Registro oficial</label>
                    <div className="relative">
                      <select
                        value={registro}
                        onChange={(e) => setRegistro(e.target.value as RegistroOficial)}
                        className="w-full appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      >
                        {REGISTROS_OFICIALES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant">
                        <MaterialIcon name="expand_more" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-data text-label-caps text-on-surface-variant">Departamento</label>
                    <div className="relative">
                      <select
                        value={departamento}
                        onChange={(e) => setDepartamento(e.target.value)}
                        className="w-full appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      >
                        <option value="">Todos los departamentos</option>
                        {DEPARTAMENTOS_COLOMBIA.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant">
                        <MaterialIcon name="expand_more" />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-disclaimer-italic text-on-surface-variant mt-6">
                  Catálogo de consulta para la demo. Los proyectos son ilustrativos y no constituyen un extracto oficial.
                </p>
              </div>

              {listError && (
                <p className="text-body-sm text-on-error-container bg-error-container rounded-lg px-3 py-2">{listError}</p>
              )}

              <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                <div className="p-4 border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center gap-3">
                  <span className="font-data text-label-caps text-on-surface">PROYECTOS</span>
                  <span className="font-data text-data-mono text-outline">
                    {listLoading ? "Cargando…" : `${proyectos.length} en ${registro}`}
                  </span>
                </div>
                <div className="divide-y divide-outline-variant max-h-[520px] overflow-y-auto">
                  {proyectos.map((p) => (
                    <div key={p.id} className="p-4 hover:bg-surface-container-lowest transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="text-body-md font-semibold text-on-surface">{p.nombre}</h4>
                        <StatusPill variant={statusVariant(p.estado)}>{p.estado}</StatusPill>
                      </div>
                      <p className="text-body-sm text-on-surface-variant">
                        {[p.municipio, p.departamento].filter(Boolean).join(", ")}
                      </p>
                      {p.desarrollador && (
                        <p className="text-body-sm text-on-surface-variant">{p.desarrollador}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-on-surface-variant">
                        {p.area_hectareas != null && (
                          <span>{formatNumber(Number(p.area_hectareas))} ha</span>
                        )}
                        {p.vintage != null && <span>Vintage {p.vintage}</span>}
                      </div>
                      {p.enlace_oficial && (
                        <a
                          href={p.enlace_oficial}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-body-sm text-primary hover:underline"
                        >
                          Ver en el registro oficial
                          <MaterialIcon name="arrow_forward" className="text-[16px]" />
                        </a>
                      )}
                    </div>
                  ))}
                  {!listLoading && proyectos.length === 0 && !listError && (
                    <p className="p-6 text-body-sm text-on-surface-variant">
                      No hay proyectos en {registro}
                      {departamento ? ` para ${departamento}` : ""}. Prueba otro departamento o registro.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

"use client";

import { useState } from "react";
import type { RegistryMatch } from "@/lib/integrations/registries";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { StatusPill } from "@/components/ui/StatusPill";
import { Footer } from "@/components/Footer";

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

const FUENTES = ["VERRA", "Gold Standard", "RENARE"];

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

  const [termino, setTermino] = useState("");
  const [resultados, setResultados] = useState<RegistryMatch[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termino.trim()) return;
    setSearchLoading(true);
    setSearchError(null);
    try {
      const res = await fetch("/api/registries/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ termino }),
      });
      if (!res.ok) throw new Error(`El servidor respondió ${res.status}`);
      const data = await res.json();
      setResultados(data.resultados);
    } catch (err) {
      setSearchError(
        err instanceof Error ? `No se pudo completar la búsqueda (${err.message}).` : "No se pudo completar la búsqueda."
      );
    } finally {
      setSearchLoading(false);
    }
  };

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

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
            {/* Left: búsqueda + resultados */}
            <div className="xl:col-span-7 flex flex-col gap-6">
              <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm">
                <h3 className="font-heading text-headline-md text-on-surface mb-4 flex items-center gap-2">
                  <MaterialIcon name="search_check" className="text-primary" />
                  Búsqueda en registros oficiales
                </h3>
                <p className="text-body-sm text-on-surface-variant mb-6">
                  Consulta el estado de proyectos en las principales bases certificadoras.
                </p>
                <form onSubmit={handleSearch} className="flex gap-3 mb-8">
                  <input
                    value={termino}
                    onChange={(e) => setTermino(e.target.value)}
                    placeholder="Nombre del proyecto, desarrollador o ubicación"
                    className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                  <button
                    type="submit"
                    disabled={searchLoading}
                    className="bg-forest-deep text-on-primary px-6 rounded-lg font-semibold hover:bg-primary transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <MaterialIcon name="search" filled />
                    {searchLoading ? "Buscando…" : "Buscar"}
                  </button>
                </form>

                <div className="flex items-center flex-wrap gap-4 sm:gap-8 border-t border-outline-variant pt-6">
                  <span className="font-data text-label-caps text-outline">FUENTES CONSULTADAS:</span>
                  <div className="flex gap-6 items-center opacity-70">
                    {FUENTES.map((f) => (
                      <span key={f} className="font-heading text-headline-sm font-bold text-on-surface">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {searchError && (
                <p className="text-body-sm text-on-error-container bg-error-container rounded-lg px-3 py-2">{searchError}</p>
              )}

              <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                <div className="p-4 border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center">
                  <span className="font-data text-label-caps text-on-surface">RESULTADOS</span>
                  {resultados && (
                    <span className="font-data text-data-mono text-outline">{resultados.length} fuentes consultadas</span>
                  )}
                </div>
                <div className="divide-y divide-outline-variant">
                  {resultados?.map((r) => (
                    <div
                      key={r.registro}
                      className="p-4 hover:bg-surface-container-lowest transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-data text-data-mono text-primary font-bold">{r.registro}</span>
                        </div>
                        {r.nombreProyecto ? (
                          <>
                            <h4 className="text-body-md font-semibold text-on-surface">{r.nombreProyecto}</h4>
                            {r.estado && <p className="text-body-sm text-on-surface-variant">{r.estado}</p>}
                          </>
                        ) : (
                          <p className="text-body-sm text-on-surface-variant">Sin coincidencia directa en esta fuente.</p>
                        )}
                      </div>
                      <div className="flex flex-col sm:items-end gap-2">
                        <StatusPill
                          variant={r.encontrado ? "success" : "neutral"}
                          icon={r.encontrado ? "check_circle" : "search_off"}
                        >
                          {r.encontrado ? "Coincidencia encontrada" : "Sin coincidencia"}
                        </StatusPill>
                        <a
                          href={r.enlaceOficial}
                          target="_blank"
                          rel="noreferrer"
                          className="text-body-sm text-primary hover:underline flex items-center gap-1"
                        >
                          Ver en el registro oficial
                          <MaterialIcon name="arrow_forward" className="text-[16px]" />
                        </a>
                      </div>
                    </div>
                  ))}
                  {!resultados && (
                    <p className="p-6 text-body-sm text-on-surface-variant">
                      Busca tu proyecto para ver si ya aparece registrado en Verra, Gold Standard o RENARE.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: chatbot */}
            <div className="xl:col-span-5 flex flex-col h-[600px] xl:h-auto border border-outline-variant rounded-xl bg-surface shadow-sm overflow-hidden">
              <div className="p-4 bg-forest-deep text-on-primary flex items-center gap-3 border-b border-primary-container">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                  <MaterialIcon name="smart_toy" />
                </div>
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
                      <div className="w-8 h-8 rounded-full bg-forest-deep text-on-primary flex items-center justify-center shrink-0 mt-1">
                        <MaterialIcon name="smart_toy" className="text-[18px]" />
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
                    <div className="w-8 h-8 rounded-full bg-forest-deep text-on-primary flex items-center justify-center shrink-0 mt-1">
                      <MaterialIcon name="smart_toy" className="text-[18px]" />
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
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

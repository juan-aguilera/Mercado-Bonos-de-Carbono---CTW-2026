"use client";

import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

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
      alt="Gabriela, asistente de Validación y Registro"
      className={`${size === "md" ? "w-10 h-10" : "w-8 h-8"} rounded-full object-cover object-top shrink-0`}
    />
  );
}

export function CertificacionChatbot({
  questionToSend,
  onQuestionConsumed,
}: {
  questionToSend?: string | null;
  onQuestionConsumed?: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hola. Soy Gabriela, la asistente de Validación y Registro de CarbonFlow. Puedo ayudarte con normatividad, estándares, metodologías y entidades acreditadas para proyectos de conservación/restauración forestal en Colombia. Esto es orientación informativa, no asesoría legal.",
    },
  ]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [open, setOpen] = useState(false);

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
    if (!questionToSend || chatLoading) return;
    setOpen(true);
    void sendMessage(questionToSend);
    onQuestionConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionToSend]);

  return (
    <div id="asistente" className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="flex flex-col w-[min(100vw-2.5rem,400px)] h-[min(70vh,620px)] border border-outline-variant rounded-lg bg-surface ambient-shadow overflow-hidden">
      <div className="p-4 bg-primary-container text-on-primary flex items-center gap-3 border-b border-primary-container">
        <ChatAvatar size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="text-body-md font-semibold">Asistente de Validación y Registro</h3>
          <p className="text-body-sm text-primary-fixed-dim">Gabriela · Guía normativa con IA</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 shrink-0"
          aria-label="Minimizar chat"
        >
          <MaterialIcon name="remove" className="text-[20px]" />
        </button>
      </div>

      <div className="bg-tertiary-fixed/40 border-l-4 border-tertiary-container p-3 flex items-start gap-2">
        <MaterialIcon name="info" className="text-on-tertiary-fixed-variant text-[20px]" />
        <p className="text-disclaimer-italic text-on-tertiary-fixed-variant">
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
                  ? "bg-primary-container text-on-primary-container p-3 rounded-lg rounded-tr-sm"
                  : "bg-surface border border-outline-variant p-3 rounded-lg rounded-tl-sm"
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
            <div className="bg-surface border border-outline-variant p-3 rounded-lg rounded-tl-sm text-on-surface-variant text-body-sm">
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
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-50"
          >
            <MaterialIcon name="send" filled className="text-[18px]" />
          </button>
        </form>
      </div>
        </div>
      )}

      <div className="relative w-[88px] h-[88px] flex items-end justify-center">
        <svg
          viewBox="0 0 88 88"
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          aria-hidden
        >
          <defs>
            <path id="asistente-arc" d="M 8 60 A 36 36 0 0 0 80 60" fill="none" />
          </defs>
          <text
            className="fill-primary"
            style={{ fontFamily: "var(--font-hanken-grotesk), sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em" }}
          >
            <textPath href="#asistente-arc" startOffset="50%" textAnchor="middle">
              Gabriela
            </textPath>
          </text>
        </svg>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center hover:bg-primary transition-colors border-2 border-primary-fixed-dim"
          aria-label={open ? "Minimizar chat" : "Abrir chat"}
          aria-expanded={open}
        >
          {open ? (
            <MaterialIcon name="close" className="text-[26px]" />
          ) : (
            <img
              src="/mujer-corporativa.avif"
              alt=""
              className="w-full h-full rounded-full object-cover object-top"
            />
          )}
        </button>
      </div>
    </div>
  );
}

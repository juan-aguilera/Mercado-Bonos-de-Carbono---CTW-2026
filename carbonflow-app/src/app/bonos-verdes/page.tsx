"use client";

import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Footer } from "@/components/Footer";

interface Perfil {
  id: string;
  titulo: string;
  monto_requerido: number | null;
  uso_de_recursos: string | null;
  estado: string;
}

export default function BonosVerdesPage() {
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titulo: "", montoRequerido: "", usoDeRecursos: "" });
  const [publishing, setPublishing] = useState(false);

  const [activePerfil, setActivePerfil] = useState<Perfil | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [respuesta, setRespuesta] = useState<string | null>(null);

  const load = () => {
    fetch("/api/bonos")
      .then((r) => r.json())
      .then((d) => setPerfiles(d.perfiles ?? []));
  };

  useEffect(load, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    try {
      const res = await fetch("/api/bonos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo,
          montoRequerido: form.montoRequerido,
          usoDeRecursos: form.usoDeRecursos,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ titulo: "", montoRequerido: "", usoDeRecursos: "" });
        load();
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePerfil) return;
    setConnecting(true);
    setRespuesta(null);
    try {
      const res = await fetch("/api/bonos/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ perfilId: activePerfil.id, mensaje }),
      });
      const data = await res.json();
      setRespuesta(data.solicitud?.respuesta_simulada ?? "No se pudo obtener respuesta.");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <header className="px-margin-mobile md:px-margin-desktop py-12 bg-forest-deep text-on-primary relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary opacity-40 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10">
          <div>
            <span className="font-data text-label-caps text-primary-fixed-dim uppercase tracking-wider">
              Inversión institucional
            </span>
            <h1 className="font-display text-display-lg mt-1">Bonos Verdes</h1>
            <p className="text-body-lg text-surface-variant max-w-2xl mt-2">
              Data rooms reales para financiación verde. La respuesta del aliado financiero es simulada.
            </p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="shrink-0 rounded-lg bg-primary-fixed text-on-primary-fixed px-5 py-2.5 font-semibold hover:bg-primary-fixed-dim transition-colors flex items-center gap-2"
          >
            <MaterialIcon name={showForm ? "close" : "add"} />
            {showForm ? "Cancelar" : "Publicar perfil"}
          </button>
        </div>
      </header>

      <div className="px-margin-mobile md:px-margin-desktop pt-6 bg-surface">
        <div className="max-w-7xl mx-auto flex items-start gap-3 bg-surface-container border border-outline-variant rounded-lg p-4 max-w-xl">
          <MaterialIcon name="info" className="text-outline" />
          <p className="text-body-sm text-on-surface-variant">
            Recibirás una respuesta simulada para fines de demostración al solicitar una conexión.
          </p>
        </div>
      </div>

      {showForm && (
        <div className="px-margin-mobile md:px-margin-desktop py-6 bg-surface">
          <form onSubmit={handlePublish} className="max-w-7xl mx-auto grid gap-3 bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
            <input required placeholder="Título del proyecto" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2" />
            <input placeholder="Monto requerido (USD)" value={form.montoRequerido} onChange={(e) => setForm({ ...form, montoRequerido: e.target.value })} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2" />
            <textarea placeholder="Uso de los recursos" value={form.usoDeRecursos} onChange={(e) => setForm({ ...form, usoDeRecursos: e.target.value })} rows={3} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2" />
            <button disabled={publishing} type="submit" className="rounded-lg bg-forest-deep text-on-primary py-2.5 font-medium hover:bg-primary transition-colors">
              {publishing ? "Publicando…" : "Publicar perfil"}
            </button>
          </form>
        </div>
      )}

      <section className="flex-1 px-margin-mobile md:px-margin-desktop py-8 bg-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {perfiles.map((p) => (
            <div
              key={p.id}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="h-32 w-full bg-gradient-to-br from-tertiary-container to-forest-deep relative flex items-center justify-center">
                <MaterialIcon name="eco" className="text-tertiary-fixed text-5xl" />
                <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-md font-data text-label-caps text-on-tertiary-container flex items-center gap-1 shadow-sm">
                  <MaterialIcon name="account_balance" className="text-sm" /> Green Bond
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-heading text-headline-sm text-primary">{p.titulo}</h3>
                <p className="text-body-sm text-on-surface-variant my-3 line-clamp-3">
                  {p.uso_de_recursos || "Sin descripción del uso de recursos."}
                </p>
                <div className="mb-6 pt-4 border-t border-outline-variant">
                  <span className="font-data text-label-caps text-outline block mb-1">Monto requerido</span>
                  <span className="font-data text-data-mono text-on-surface text-lg">
                    {p.monto_requerido ? `USD ${p.monto_requerido.toLocaleString("en-US")}` : "A definir"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActivePerfil(p);
                    setRespuesta(null);
                    setMensaje("");
                  }}
                  className="mt-auto w-full bg-earth-sandy text-primary font-semibold text-body-sm py-2.5 rounded-md hover:brightness-95 transition-all flex justify-center items-center gap-2"
                >
                  <MaterialIcon name="handshake" className="text-sm" />
                  Conectar con aliado financiero
                </button>
              </div>
            </div>
          ))}
          {perfiles.length === 0 && (
            <p className="text-on-surface-variant text-body-sm md:col-span-2">Todavía no hay perfiles publicados.</p>
          )}
        </div>
      </section>

      {activePerfil && (
        <div className="fixed inset-0 bg-inverse-surface/40 flex items-center justify-center p-4 z-50" onClick={() => setActivePerfil(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-surface-container-lowest rounded-xl p-6 max-w-md w-full space-y-3 shadow-xl">
            <h3 className="font-heading text-headline-sm text-on-surface">Conectar: {activePerfil.titulo}</h3>
            {!respuesta ? (
              <form onSubmit={handleConnect} className="space-y-3">
                <textarea
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Cuéntanos qué tipo de financiación buscas…"
                  rows={3}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm"
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={connecting} className="flex-1 rounded-lg bg-forest-deep text-on-primary py-2 font-medium hover:bg-primary transition-colors">
                    {connecting ? "Enviando…" : "Enviar solicitud"}
                  </button>
                  <button type="button" onClick={() => setActivePerfil(null)} className="rounded-lg bg-surface-container-highest px-4">
                    Cerrar
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <p className="text-body-sm bg-surface-container-low rounded-lg p-3">{respuesta}</p>
                <p className="text-disclaimer-italic text-status-warning">Respuesta simulada para efectos de demostración.</p>
                <button onClick={() => setActivePerfil(null)} className="w-full rounded-lg bg-forest-deep text-on-primary py-2 font-medium hover:bg-primary transition-colors">
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

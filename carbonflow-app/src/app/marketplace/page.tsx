"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Footer } from "@/components/Footer";
import { formatNumber } from "@/lib/format";

interface Publicacion {
  id: string;
  titulo: string;
  tipo_proyecto: string;
  estandar: string | null;
  vintage: number | null;
  co_beneficios: string | null;
  precio_orientativo: number | null;
  volumen_toneladas: number | null;
  estado: string;
}

function MarketplaceInner() {
  const searchParams = useSearchParams();
  const predioId = searchParams.get("predioId");

  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    estandar: "",
    vintage: "",
    coBeneficios: "",
    precioOrientativo: "",
    volumenToneladas: "",
  });
  const [publishing, setPublishing] = useState(false);

  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroEstandar, setFiltroEstandar] = useState("todos");

  const [activeQuote, setActiveQuote] = useState<Publicacion | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [quoting, setQuoting] = useState(false);
  const [respuesta, setRespuesta] = useState<string | null>(null);

  const load = () => {
    fetch("/api/marketplace")
      .then((r) => r.json())
      .then((d) => setPublicaciones(d.publicaciones ?? []));
  };

  useEffect(load, []);

  const estandares = useMemo(
    () => Array.from(new Set(publicaciones.map((p) => p.estandar).filter(Boolean))) as string[],
    [publicaciones]
  );

  const publicacionesFiltradas = publicaciones.filter((p) => {
    const matchesTexto = filtroTexto
      ? p.titulo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        p.co_beneficios?.toLowerCase().includes(filtroTexto.toLowerCase())
      : true;
    const matchesEstandar = filtroEstandar === "todos" ? true : p.estandar === filtroEstandar;
    return matchesTexto && matchesEstandar;
  });

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo,
          tipoProyecto: "forestal-conservacion",
          estandar: form.estandar,
          vintage: form.vintage,
          coBeneficios: form.coBeneficios,
          precioOrientativo: form.precioOrientativo,
          volumenToneladas: form.volumenToneladas,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ titulo: "", estandar: "", vintage: "", coBeneficios: "", precioOrientativo: "", volumenToneladas: "" });
        load();
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuote) return;
    setQuoting(true);
    setRespuesta(null);
    try {
      const res = await fetch("/api/marketplace/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicacionId: activeQuote.id, mensaje }),
      });
      const data = await res.json();
      setRespuesta(data.solicitud?.respuesta_simulada ?? "No se pudo obtener respuesta.");
    } finally {
      setQuoting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <header className="px-margin-mobile md:px-margin-desktop py-12 bg-surface-container-lowest border-b border-outline-variant">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-display-lg text-primary">CarbonFlow Marketplace</h1>
              <p className="text-body-lg text-on-surface-variant max-w-2xl mt-2">
                Explora proyectos verificados de conservación y restauración. Cada oferta viene con un data room de soporte.
              </p>
            </div>
            <button
              onClick={() => setShowForm((s) => !s)}
              className="shrink-0 rounded-lg bg-forest-deep text-on-primary px-5 py-2.5 font-medium hover:bg-primary transition-colors flex items-center gap-2"
            >
              <MaterialIcon name={showForm ? "close" : "add"} />
              {showForm ? "Cancelar" : "Publicar oferta"}
            </button>
          </div>

          <div className="mt-2 flex items-start gap-3 bg-surface-container border border-outline-variant rounded-lg p-4 max-w-xl">
            <MaterialIcon name="info" className="text-outline" />
            <p className="text-body-sm text-on-surface-variant">
              Recibirás una respuesta simulada para fines de demostración al solicitar una cotización.
            </p>
          </div>
        </div>
      </header>

      {showForm && (
        <div className="px-margin-mobile md:px-margin-desktop py-6 bg-surface border-b border-outline-variant">
          <form onSubmit={handlePublish} className="max-w-7xl mx-auto grid sm:grid-cols-2 gap-3 bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
            <input required placeholder="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 sm:col-span-2" />
            <input placeholder="Estándar (ej. Verra VCS)" value={form.estandar} onChange={(e) => setForm({ ...form, estandar: e.target.value })} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2" />
            <input placeholder="Vintage (año)" value={form.vintage} onChange={(e) => setForm({ ...form, vintage: e.target.value })} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2" />
            <input placeholder="Co-beneficios" value={form.coBeneficios} onChange={(e) => setForm({ ...form, coBeneficios: e.target.value })} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 sm:col-span-2" />
            <input placeholder="Precio orientativo (USD/tCO2e)" value={form.precioOrientativo} onChange={(e) => setForm({ ...form, precioOrientativo: e.target.value })} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2" />
            <input placeholder="Volumen (tCO2e)" value={form.volumenToneladas} onChange={(e) => setForm({ ...form, volumenToneladas: e.target.value })} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2" />
            <button disabled={publishing} type="submit" className="sm:col-span-2 rounded-lg bg-forest-deep text-on-primary py-2.5 font-medium hover:bg-primary transition-colors">
              {publishing ? "Publicando…" : "Publicar"}
            </button>
          </form>
        </div>
      )}

      <section className="flex-1 px-margin-mobile md:px-margin-desktop py-8 bg-surface">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-gutter">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-panel-width-md shrink-0 flex flex-col gap-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              <h2 className="font-heading text-headline-sm text-primary mb-6 flex items-center gap-2">
                <MaterialIcon name="filter_list" />
                Filtros
              </h2>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="font-data text-label-caps text-on-surface-variant">Buscar</label>
                  <input
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    placeholder="Título o co-beneficio"
                    className="bg-surface-container-low border border-outline-variant rounded-md px-3 py-2 text-body-sm w-full"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-data text-label-caps text-on-surface-variant">Estándar</label>
                  <select
                    value={filtroEstandar}
                    onChange={(e) => setFiltroEstandar(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant rounded-md px-3 py-2 text-body-sm w-full"
                  >
                    <option value="todos">Todos</option>
                    {estandares.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2 mt-1">
                  <label className="font-data text-label-caps text-on-surface-variant">Impacto ODS</label>
                  <div className="flex flex-wrap gap-2">
                    {["13 CLIMA", "15 VIDA TERRESTRE", "6 AGUA"].map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-surface-container border border-outline-variant rounded-full font-data text-label-caps text-on-surface"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-forest-deep text-on-primary rounded-xl p-6 relative overflow-hidden shadow-md">
              <div className="relative z-10 flex flex-col gap-4">
                <span className="font-data text-label-caps text-primary-fixed-dim uppercase tracking-wider">
                  Inversión institucional
                </span>
                <h3 className="font-heading text-headline-md">Bonos Verdes Corporativos</h3>
                <p className="text-body-sm text-surface-variant">
                  Accede a bonos verdes estructurados con data rooms ESG verificados y trazabilidad geoespacial.
                </p>
                <Link
                  href="/bonos-verdes"
                  className="mt-2 self-start bg-primary-fixed text-on-primary-fixed font-semibold text-body-sm py-2 px-5 rounded-md hover:bg-primary-fixed-dim transition-colors"
                >
                  Ver emisiones
                </Link>
              </div>
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary opacity-50 rounded-full blur-3xl" />
            </div>
          </aside>

          {/* Projects Grid */}
          <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-gutter content-start">
            {publicacionesFiltradas.map((p) => (
              <div
                key={p.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="h-32 w-full bg-gradient-to-br from-primary-container to-forest-deep relative flex items-center justify-center">
                  <MaterialIcon name="forest" className="text-primary-fixed-dim text-5xl" />
                  <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-md font-data text-label-caps text-status-success flex items-center gap-1 shadow-sm">
                    <MaterialIcon name="forest" className="text-sm" /> Forestry
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-heading text-headline-sm text-primary line-clamp-2">{p.titulo}</h3>
                  <p className="text-body-sm text-on-surface-variant my-3 line-clamp-2">
                    {p.co_beneficios || "Sin descripción de co-beneficios."}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-outline-variant">
                    <div>
                      <span className="font-data text-label-caps text-outline block mb-1">CO2e disponible</span>
                      <span className="font-data text-data-mono text-on-surface">
                        {p.volumen_toneladas ? `${formatNumber(p.volumen_toneladas)} t` : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="font-data text-label-caps text-outline block mb-1">Precio por crédito</span>
                      <span className="font-data text-data-mono text-on-surface">
                        {p.precio_orientativo ? `USD ${p.precio_orientativo}` : "A consultar"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <button
                      onClick={() => {
                        setActiveQuote(p);
                        setRespuesta(null);
                        setMensaje("");
                      }}
                      className="w-full bg-earth-sandy text-primary font-semibold text-body-sm py-2.5 rounded-md hover:brightness-95 transition-all flex justify-center items-center gap-2"
                    >
                      <MaterialIcon name="shopping_cart" className="text-sm" />
                      Solicitar cotización
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {publicacionesFiltradas.length === 0 && (
              <p className="text-on-surface-variant text-body-sm md:col-span-2">
                {publicaciones.length === 0
                  ? "Todavía no hay publicaciones. Sé el primero en publicar una oferta."
                  : "No hay ofertas que coincidan con el filtro."}
              </p>
            )}
          </div>
        </div>
      </section>

      {activeQuote && (
        <div className="fixed inset-0 bg-inverse-surface/40 flex items-center justify-center p-4 z-50" onClick={() => setActiveQuote(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-surface-container-lowest rounded-xl p-6 max-w-md w-full space-y-3 shadow-xl">
            <h3 className="font-heading text-headline-sm text-on-surface">Cotizar: {activeQuote.titulo}</h3>
            {!respuesta ? (
              <form onSubmit={handleQuote} className="space-y-3">
                <textarea
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Volumen que buscas, plazo, condiciones…"
                  rows={3}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm"
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={quoting} className="flex-1 rounded-lg bg-forest-deep text-on-primary py-2 font-medium hover:bg-primary transition-colors">
                    {quoting ? "Enviando…" : "Enviar solicitud"}
                  </button>
                  <button type="button" onClick={() => setActiveQuote(null)} className="rounded-lg bg-surface-container-highest px-4">
                    Cerrar
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <p className="text-body-sm bg-surface-container-low rounded-lg p-3">{respuesta}</p>
                <p className="text-disclaimer-italic text-status-warning">Respuesta simulada para efectos de demostración.</p>
                <button onClick={() => setActiveQuote(null)} className="w-full rounded-lg bg-forest-deep text-on-primary py-2 font-medium hover:bg-primary transition-colors">
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {predioId && <p className="px-margin-desktop text-disclaimer-italic text-on-surface-variant">Predio de referencia: {predioId}</p>}

      <Footer />
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-on-surface-variant">Cargando…</div>}>
      <MarketplaceInner />
    </Suspense>
  );
}

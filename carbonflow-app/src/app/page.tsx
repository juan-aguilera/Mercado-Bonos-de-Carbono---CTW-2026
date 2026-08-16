import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { StatusPill } from "@/components/ui/StatusPill";
import { ScanHero } from "@/components/home/ScanHero";
import { RevealOnScroll } from "@/components/home/RevealOnScroll";
import { PipelineConnector } from "@/components/home/PipelineConnector";
import { LiveSourcesStrip } from "@/components/home/LiveSourcesStrip";
import { ScopeCard } from "@/components/home/ScopeCard";

const MODULOS = [
  {
    href: "/diagnostico",
    icono: "satellite_alt",
    titulo: "Diagnóstico geoespacial",
    estado: "Real — APIs en vivo",
    variant: "success" as const,
    descripcion:
      "Dibuja o carga un polígono y recibe cobertura boscosa, deforestación, áreas protegidas, score explicable y estimación de CO2e en segundos.",
  },
  {
    href: "/formulacion",
    icono: "assignment",
    titulo: "Formulación guiada",
    estado: "Real — solo conservación/restauración forestal",
    variant: "success" as const,
    descripcion:
      "Línea base, adicionalidad, riesgos, salvaguardas, cronograma y presupuesto, conectado al predio diagnosticado.",
  },
  {
    href: "/validacion-registro",
    icono: "verified",
    titulo: "Validación y Registro",
    estado: "Real — preparación, ruta y chatbot",
    variant: "success" as const,
    descripcion:
      "Prepara la iniciativa para revisión técnica, RENARE y entidad validadora con el expediente ya formulado. El chatbot de orientación se mantiene como apoyo.",
  },
  {
    href: "/marketplace",
    icono: "hub",
    titulo: "Marketplace",
    estado: "Conexión, contraparte simulada",
    variant: "warning" as const,
    descripcion:
      "Plaza de conexión con entidades validadoras, proyectos de carbono y financiación verde. Solicitudes de información con respuesta simulada; sin pagos ni transacciones.",
  },
];

const PROXIMOS_PASOS = [
  "MRV operativo completo (checklist, evidencias, versionado, bitácora)",
  "Diagnóstico y formulación para energía renovable, agroforestería y demás tipos de proyecto",
  "Marketplace transaccional, con contrapartes reales y data room avanzado",
];

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1">
      <section className="relative overflow-hidden min-h-[600px] flex items-center px-margin-mobile md:px-margin-desktop py-20 md:py-28">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/bosque y comunidad.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-primary-container/80" aria-hidden="true" />

        <div className="relative z-10 max-w-[1440px] mx-auto w-full grid gap-stack-xl lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-stack-lg">
            <h1 className="font-display text-display-hero text-on-primary">
              Democratizamos el acceso al mercado de carbono
            </h1>
            <p className="text-body-lg text-on-primary/85 max-w-xl">
              Conectamos empresas que buscan compensar su huella de carbono con comunidades
              rurales que gestionan sosteniblemente sus territorios.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/diagnostico"
                className="inline-flex items-center gap-2 rounded bg-secondary text-on-secondary font-medium px-6 py-3 text-body-md hover:bg-on-secondary-container transition-colors"
              >
                <MaterialIcon name="satellite_alt" />
                Diagnosticar mi predio
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded border border-on-primary/40 text-on-primary px-6 py-3 text-body-md hover:bg-on-primary/10 transition-colors"
              >
                Explorar el marketplace
              </Link>
            </div>

            <div className="pt-stack-md border-t border-on-primary/20">
              <p className="font-data text-label-caps uppercase tracking-wide text-on-primary/60 mb-3">
                Fuentes conectadas en vivo
              </p>
              <LiveSourcesStrip />
            </div>
          </div>

          <ScanHero />
        </div>
      </section>

      <section className="flex-1 px-margin-mobile md:px-margin-desktop py-16 md:py-20 bg-surface-container-low border-t border-outline-variant">
        <div className="max-w-[1440px] mx-auto space-y-stack-xl">
          <RevealOnScroll className="max-w-2xl space-y-3">
            <span className="font-data text-label-caps uppercase tracking-wide text-secondary">
              El recorrido
            </span>
            <h2 className="font-heading text-headline-lg text-on-surface">
              Cuatro etapas, en orden, sobre el mismo predio
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Cada módulo alimenta al siguiente: el diagnóstico sostiene la formulación, la
              formulación alimenta la validación, y el expediente completo es lo que se
              comparte en el marketplace.
            </p>
          </RevealOnScroll>

          <div className="flex flex-col lg:flex-row lg:items-stretch">
            {MODULOS.map((m, i) => (
              <div key={m.href} className="flex flex-col lg:contents">
                <RevealOnScroll delayMs={i * 120} className="flex-1">
                  <Link
                    href={m.href}
                    className="group h-full flex flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-6 hover:bg-surface-container-low hover:border-primary-container/40 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded bg-primary-container/10 flex items-center justify-center">
                        <MaterialIcon name={m.icono} className="text-primary-container text-2xl" />
                      </div>
                      <span className="font-data text-headline-sm text-outline-variant">
                        0{i + 1}
                      </span>
                    </div>
                    <h3 className="font-heading text-headline-sm text-on-surface group-hover:text-primary-container transition-colors">
                      {m.titulo}
                    </h3>
                    <div className="mt-2 mb-3">
                      <StatusPill variant={m.variant}>{m.estado}</StatusPill>
                    </div>
                    <p className="text-body-sm text-on-surface-variant">{m.descripcion}</p>
                  </Link>
                </RevealOnScroll>
                {i < MODULOS.length - 1 && <PipelineConnector orientation="horizontal" />}
                {i < MODULOS.length - 1 && <PipelineConnector orientation="vertical" />}
              </div>
            ))}
          </div>

          <RevealOnScroll className="rounded-lg border border-outline-variant p-6 bg-surface-container-lowest">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded bg-surface-container-high flex items-center justify-center shrink-0">
                <MaterialIcon name="map" className="text-outline text-2xl" />
              </div>
              <div>
                <h3 className="font-heading text-headline-sm text-on-surface-variant mb-2">
                  Próximos pasos del roadmap
                </h3>
                <ul className="text-body-sm text-on-surface-variant space-y-1.5">
                  {PROXIMOS_PASOS.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <MaterialIcon name="spa" className="text-outline text-[16px] mt-0.5 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <ScopeCard />
          </RevealOnScroll>
        </div>
      </section>

      <Footer />
    </div>
  );
}

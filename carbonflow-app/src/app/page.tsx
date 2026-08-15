import Link from "next/link";
import { Footer } from "@/components/Footer";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { StatusPill } from "@/components/ui/StatusPill";

const MODULOS = [
  {
    href: "/diagnostico",
    icono: "satellite_alt",
    titulo: "1. Diagnóstico geoespacial",
    estado: "Real — APIs en vivo",
    variant: "success" as const,
    descripcion:
      "Dibuja o carga un polígono y recibe cobertura boscosa, deforestación, áreas protegidas, score explicable y estimación de CO2e en segundos.",
  },
  {
    href: "/formulacion",
    icono: "assignment",
    titulo: "2. Formulación guiada",
    estado: "Real — solo conservación/restauración forestal",
    variant: "success" as const,
    descripcion:
      "Línea base, adicionalidad, riesgos, salvaguardas, cronograma y presupuesto, conectado al predio diagnosticado.",
  },
  {
    href: "/certificacion",
    icono: "smart_toy",
    titulo: "3. Certificación",
    estado: "Real — chatbot + búsqueda en registros",
    variant: "success" as const,
    descripcion:
      "Chatbot de orientación normativa y búsqueda del proyecto en registros oficiales (Verra, Gold Standard, RENARE).",
  },
  {
    href: "/marketplace",
    icono: "shopping_cart",
    titulo: "4. Marketplace",
    estado: "Real, contraparte simulada",
    variant: "warning" as const,
    descripcion:
      "Catálogo y solicitud de cotización reales; la respuesta del vendedor es simulada para completar el flujo sin contraparte humana.",
  },
  {
    href: "/bonos-verdes",
    icono: "eco",
    titulo: "5. Bonos verdes",
    estado: "Real, contraparte simulada",
    variant: "warning" as const,
    descripcion:
      "Data room y conexión con aliado financiero reales; la respuesta del aliado es simulada.",
  },
];

const PROXIMOS_PASOS = [
  "MRV operativo completo (checklist, evidencias, versionado, bitácora)",
  "Diagnóstico y formulación para energía renovable, agroforestería y demás tipos de proyecto",
  "Marketplace y bonos verdes transaccionales, con contrapartes reales",
];

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1">
      <section className="px-margin-mobile md:px-margin-desktop py-16 bg-surface-container-lowest border-b border-outline-variant">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="font-display text-display-lg text-primary">CarbonFlow</h1>
          <p className="text-body-lg text-on-surface-variant">
            Plataforma para diagnosticar, formular, certificar y comercializar proyectos de
            carbono en Colombia. CarbonFlow no certifica, verifica ni emite créditos por cuenta
            propia.
          </p>
        </div>
      </section>

      <section className="flex-1 px-margin-mobile md:px-margin-desktop py-12 bg-surface">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
            {MODULOS.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="group rounded-xl border border-outline-variant bg-surface-container-lowest p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-primary-container/15 flex items-center justify-center mb-4">
                  <MaterialIcon name={m.icono} className="text-primary text-2xl" />
                </div>
                <h2 className="font-heading text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                  {m.titulo}
                </h2>
                <div className="mt-2 mb-3">
                  <StatusPill variant={m.variant}>{m.estado}</StatusPill>
                </div>
                <p className="text-body-sm text-on-surface-variant">{m.descripcion}</p>
              </Link>
            ))}

            <div className="rounded-xl border border-dashed border-outline-variant p-6 flex flex-col justify-center bg-surface-container-low">
              <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center mb-4">
                <MaterialIcon name="map" className="text-outline text-2xl" />
              </div>
              <h2 className="font-heading text-headline-sm text-on-surface-variant">
                Próximos pasos (roadmap)
              </h2>
              <ul className="text-body-sm text-on-surface-variant list-disc list-inside mt-3 space-y-1.5">
                {PROXIMOS_PASOS.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-lg bg-surface-container border border-outline-variant p-5 flex items-start gap-3">
            <MaterialIcon name="info" className="text-outline shrink-0 mt-0.5" />
            <p className="text-disclaimer-italic text-on-surface-variant">
              <strong className="text-on-surface not-italic">Aviso de alcance:</strong> todas las
              estimaciones son indicativas y no certificadas. Las respuestas de contraparte en
              marketplace y bonos verdes son simuladas. El chatbot de certificación ofrece
              orientación informativa y no constituye asesoría legal ni garantiza elegibilidad
              ante ningún estándar o registro.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

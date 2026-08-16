import { useMemo, useState, type FormEvent } from "react";
import type { MarketplaceListing, ProjectContext, RequestCategory } from "@/lib/marketplace/types";
import { ConsentSelector, SharedInfoSelector } from "./ConsentSelector";
import { ErrorState } from "./EmptyState";
import { SimulatedResponsePanel } from "./SimulatedResponsePanel";

const SHARE_OPTIONS = [
  { id: "resumen", label: "Resumen público del proyecto" },
  { id: "brechas", label: "Estado de preparación y brechas" },
  { id: "diagnostico", label: "Diagnóstico geoespacial detallado" },
  { id: "expediente", label: "Expediente de formulación" },
  { id: "documentos", label: "Documentos adicionales" },
];

function categoryFor(listing: MarketplaceListing): RequestCategory {
  if (listing.tab === "ovv") return "ovv";
  if (listing.kind === "reported_carbon_result" || listing.kind === "reported_retired_credit") {
    return "reported_credit";
  }
  if (listing.tab === "finance") return "green_finance";
  return "carbon_project";
}

function requestTypes(listing: MarketplaceListing) {
  if (listing.tab === "ovv") return ["Preevaluación", "Validación", "Verificación", "Contacto general"];
  if (listing.kind === "carbon_project_development") {
    return ["Compra futura", "Comprador ancla", "Financiación", "Alianza técnica", "Otro"];
  }
  if (listing.kind === "carbon_buyer_demand") {
    return ["Proponer mi proyecto", "Explorar compatibilidad", "Otro"];
  }
  if (listing.tab === "finance") {
    return ["Deuda verde", "Capital de impacto", "Asistencia técnica", "Estructuración financiera", "Otro"];
  }
  return ["Solicitar información", "Consulta histórica"];
}

function confirmation(listing: MarketplaceListing) {
  if (listing.tab === "ovv") {
    return "Tu solicitud fue enviada. No constituye contratación, asignación de una entidad validadora ni inicio formal de validación o verificación.";
  }
  if (listing.tab === "finance") {
    return "Tu solicitud fue enviada. No constituye una oferta de valores, recomendación de inversión, aprobación de crédito, compromiso de financiación ni contrato.";
  }
  if (listing.kind === "carbon_buyer_demand") {
    return "Tu propuesta fue enviada a la empresa. No constituye venta, reserva, compensación ni contrato.";
  }
  return "Tu manifestación de interés fue enviada al titular. No constituye compra, reserva, compensación, transferencia ni contrato.";
}

export function ContactRequestModal({
  listing,
  context,
  onClose,
  onCreated,
  initialMessage,
}: {
  listing: MarketplaceListing;
  context?: ProjectContext | null;
  onClose: () => void;
  onCreated: (request: import("@/lib/marketplace/types").MarketplaceRequest) => void;
  initialMessage?: string;
}) {
  const types = requestTypes(listing);
  const [form, setForm] = useState({
    name: "",
    organization: "",
    email: "",
    phone: "",
    requestType: types[0],
    message: initialMessage ?? "",
    amount: "",
  });
  const [shared, setShared] = useState<string[]>(["resumen", "brechas"]);
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ response: string } | null>(null);

  const prefill = useMemo(() => {
    if (!context) return null;
    return [
      context.projectName ? `Proyecto: ${context.projectName}` : null,
      context.tipo ? `Tipo de iniciativa: ${context.tipo}` : null,
      context.preparacion ? `Estado de preparación: ${context.preparacion}` : null,
      context.necesidad ? `Necesidad: ${context.necesidad}` : null,
      context.brechas ? `Brechas principales: ${context.brechas}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }, [context]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/marketplace/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: categoryFor(listing),
          listingId: listing.id,
          listingTitle: listing.title,
          requesterName: form.name,
          requesterOrganization: form.organization,
          requesterEmail: form.email,
          requesterPhone: form.phone || undefined,
          requestType: form.requestType,
          message: [prefill, form.message, form.amount ? `Monto orientativo: ${form.amount}` : ""]
            .filter(Boolean)
            .join("\n\n"),
          sharedFields: shared,
          consentAt: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.request) {
        setError("send");
        return;
      }
      onCreated(data.request);
      setDone({ response: data.request.simulatedResponse ?? "" });
    } catch {
      setError("send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 ambient-shadow"
      >
        <h3 className="font-heading text-headline-sm">
          {listing.tab === "carbon" && listing.kind === "carbon_project_development"
            ? "Manifestar interés"
            : "Solicitar contacto"}
        </h3>
        <p className="text-body-sm text-on-surface-variant">{listing.title}</p>

        {done ? (
          <div className="space-y-3">
            <p className="text-body-sm">{confirmation(listing)}</p>
            <SimulatedResponsePanel message={done.response} />
            <button type="button" onClick={onClose} className="w-full rounded-lg bg-primary-container text-on-primary py-2">
              Cerrar
            </button>
          </div>
        ) : error ? (
          <ErrorState
            title="No pudimos enviar tu solicitud en este momento."
            body="Tu información no se perdió. Intenta nuevamente o vuelve más tarde."
            onRetry={() => setError(null)}
          />
        ) : (
          <form onSubmit={submit} className="space-y-3">
            {prefill && (
              <pre className="text-disclaimer-italic whitespace-pre-wrap bg-surface-container-low rounded-lg p-3">
                {prefill}
              </pre>
            )}
            <input
              required
              placeholder="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
            <input
              required
              placeholder="Organización"
              value={form.organization}
              onChange={(e) => setForm({ ...form, organization: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
            <input
              required
              type="email"
              placeholder="Correo"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
            <input
              placeholder="Teléfono opcional"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
            <select
              value={form.requestType}
              onChange={(e) => setForm({ ...form, requestType: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            >
              {types.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            {listing.tab === "finance" && (
              <input
                placeholder="Monto orientativo requerido (opcional)"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
              />
            )}
            <textarea
              required
              rows={3}
              placeholder="Mensaje"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
            <SharedInfoSelector
              options={SHARE_OPTIONS}
              selected={shared}
              onToggle={(id) =>
                setShared((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]))
              }
            />
            <ConsentSelector checked={consent} onChange={setConsent} />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!consent || sending}
                className="flex-1 rounded-lg bg-primary-container text-on-primary py-2 font-medium disabled:opacity-40"
              >
                {sending ? "Enviando…" : "Enviar solicitud de contacto"}
              </button>
              <button type="button" onClick={onClose} className="rounded-lg border border-outline-variant px-4">
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

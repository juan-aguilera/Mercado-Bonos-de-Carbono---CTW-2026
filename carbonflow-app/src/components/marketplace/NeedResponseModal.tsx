import { useState, type FormEvent } from "react";
import { computeCompatibility } from "@/lib/marketplace/compatibility";
import type { MarketplaceListing, MarketplaceNeed, MarketplaceRequest } from "@/lib/marketplace/types";
import { ConsentSelector, SharedInfoSelector } from "./ConsentSelector";
import { CompatibilityScoreCard } from "./CompatibilityScoreCard";
import { ErrorState } from "./EmptyState";
import { SimulatedResponsePanel } from "./SimulatedResponsePanel";

const SHARE_OPTIONS = [
  { id: "resumen", label: "Resumen público" },
  { id: "preparacion", label: "Perfil de preparación" },
  { id: "ubicacion", label: "Ubicación general" },
  { id: "diagnostico", label: "Diagnóstico geoespacial resumido" },
  { id: "presupuesto", label: "Presupuesto agregado" },
  { id: "cronograma", label: "Cronograma" },
  { id: "dataroom", label: "Data room bajo solicitud" },
];

function shareIdsFromLabels(labels?: string[]): string[] {
  if (!labels?.length) return ["resumen", "preparacion", "ubicacion"];
  const mapped: string[] = [];
  for (const label of labels) {
    const value = label.toLowerCase();
    if (value.includes("resumen")) mapped.push("resumen");
    else if (value.includes("prepar")) mapped.push("preparacion");
    else if (value.includes("ubic")) mapped.push("ubicacion");
    else if (value.includes("diagn")) mapped.push("diagnostico");
    else if (value.includes("presup")) mapped.push("presupuesto");
    else if (value.includes("crono")) mapped.push("cronograma");
    else if (value.includes("data")) mapped.push("dataroom");
  }
  return mapped.length > 0 ? Array.from(new Set(mapped)) : ["resumen", "preparacion", "ubicacion"];
}

export function NeedResponseModal({
  need,
  projects,
  onClose,
  onCreated,
  initialProjectId,
  initialMessage,
  initialSharedLabels,
}: {
  need: MarketplaceNeed;
  projects: MarketplaceListing[];
  onClose: () => void;
  onCreated: (request: MarketplaceRequest) => void;
  initialProjectId?: string;
  initialMessage?: string;
  initialSharedLabels?: string[];
}) {
  const eligible = projects.filter((p) => p.kind.includes("project") || p.kind.includes("result"));
  const [projectId, setProjectId] = useState(initialProjectId && eligible.some((p) => p.id === initialProjectId) ? initialProjectId : eligible[0]?.id ?? "");
  const [shared, setShared] = useState<string[]>(shareIdsFromLabels(initialSharedLabels));
  const [message, setMessage] = useState(initialMessage ?? "");
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const project = eligible.find((p) => p.id === projectId) ?? eligible[0];
  const compatibility = project ? computeCompatibility(project, need) : null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!consent || !project) return;
    setSending(true);
    setError(false);
    try {
      const res = await fetch("/api/marketplace/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: need.category === "green_finance" ? "green_finance" : need.category === "ovv" ? "ovv" : "carbon_project",
          listingId: need.id,
          listingTitle: need.title,
          needId: need.id,
          projectId: project.id,
          compatibilityScore: compatibility?.score,
          requesterName: "Titular del proyecto",
          requesterOrganization: project.title,
          requesterEmail: "titular@carbonflow.demo",
          requestType: "Manifestación de interés",
          message,
          sharedFields: shared,
          consentAt: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.request) {
        setError(true);
        return;
      }
      onCreated(data.request);
      setDone(data.request.simulatedResponse ?? "");
    } catch {
      setError(true);
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
        <h3 className="font-heading text-headline-sm">Responder a necesidad</h3>
        {done ? (
          <div className="space-y-3">
            <p className="text-body-sm">
              Tu manifestación de interés fue enviada. La contraparte recibirá la información que autorizaste compartir.
              Esta acción no constituye compra, oferta vinculante, contratación, validación, financiación ni contrato.
            </p>
            <SimulatedResponsePanel message={done} />
            <button type="button" onClick={onClose} className="w-full rounded-lg bg-primary-container text-on-primary py-2">
              Cerrar
            </button>
          </div>
        ) : error ? (
          <ErrorState
            title="No pudimos enviar tu solicitud en este momento."
            body="Tu información no se perdió. Intenta nuevamente o vuelve más tarde."
            onRetry={() => setError(false)}
          />
        ) : (
          <form onSubmit={submit} className="space-y-3">
            {eligible.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">
                Publica un proyecto primero para responder con información ya registrada.
              </p>
            ) : (
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
              >
                {eligible.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            )}
            {compatibility && <CompatibilityScoreCard result={compatibility} compact />}
            <SharedInfoSelector
              options={SHARE_OPTIONS}
              selected={shared}
              onToggle={(id) =>
                setShared((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]))
              }
            />
            <textarea
              required
              rows={3}
              placeholder="Mensaje para la contraparte"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
            <ConsentSelector checked={consent} onChange={setConsent} />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!consent || sending || !project}
                className="flex-1 rounded-lg bg-primary-container text-on-primary py-2 disabled:opacity-40"
              >
                {sending ? "Enviando…" : "Enviar manifestación de interés"}
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

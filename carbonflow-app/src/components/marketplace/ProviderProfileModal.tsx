import { useState, type FormEvent } from "react";
import type { MarketplaceListing } from "@/lib/marketplace/types";

export function ProviderProfileModal({
  kind,
  onClose,
  onCreate,
}: {
  kind: "ovv" | "finance";
  onClose: () => void;
  onCreate: (listing: MarketplaceListing) => void;
}) {
  const [consent, setConsent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    entityType: kind === "ovv" ? "OVV" : "Fondo",
    description: "",
    services: kind === "ovv" ? "Validación, Verificación" : "Deuda verde, Asistencia técnica",
    sectors: "Conservación, Restauración",
    coverage: "Colombia",
    languages: "Español",
    accreditation: "No verificada en CarbonFlow",
    accreditor: "",
    scope: "",
    validUntil: "",
    url: "",
    email: "",
    ticket: "",
    criteria: "",
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    const now = new Date().toISOString().slice(0, 10);
    const listing: MarketplaceListing =
      kind === "ovv"
        ? {
            id: `user-ovv-${Date.now()}`,
            kind: form.entityType === "OVV" ? "ovv_profile" : "technical_firm_profile",
            tab: "ovv",
            title: form.name,
            organization: form.name,
            entityType: form.entityType,
            description: form.description,
            services: form.services.split(",").map((s) => s.trim()),
            sectors: form.sectors.split(",").map((s) => s.trim()),
            coverage: form.coverage,
            languages: form.languages.split(",").map((s) => s.trim()),
            accreditation: form.accreditation,
            accreditor: form.accreditor || undefined,
            accreditationScope: form.scope || undefined,
            accreditationValidUntil: form.validUntil || undefined,
            publicDocumentUrl: form.url || undefined,
            updatedAt: now,
            demo: true,
            trustLabels: ["Perfil demostrativo", "Información declarada por el usuario"],
            publicationStatus: "Publicado",
            contactHidden: true,
          }
        : {
            id: `user-finprov-${Date.now()}`,
            kind: "green_finance_provider",
            tab: "finance",
            title: form.name,
            organization: form.name,
            entityType: form.entityType,
            description: form.description,
            instruments: form.services.split(",").map((s) => s.trim()),
            sectors: form.sectors.split(",").map((s) => s.trim()),
            ticketRange: form.ticket,
            coverage: form.coverage,
            evaluationCriteria: form.criteria,
            updatedAt: now,
            demo: true,
            trustLabels: ["Perfil demostrativo", "Información declarada por el usuario"],
            publicationStatus: "Publicado",
            contactHidden: true,
          };
    onCreate(listing);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/40 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="bg-surface-container-lowest rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-3 shadow-xl"
      >
        <h3 className="font-heading text-headline-sm">
          {kind === "ovv" ? "Perfil de OVV o firma técnica" : "Perfil de financiador o estructurador"}
        </h3>
        <input
          required
          placeholder="Nombre de la organización"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
        />
        <select
          value={form.entityType}
          onChange={(e) => setForm({ ...form, entityType: e.target.value })}
          className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
        >
          {kind === "ovv" ? (
            <>
              <option>OVV</option>
              <option>Firma técnica</option>
              <option>Consultor especializado</option>
            </>
          ) : (
            <>
              <option>Banco</option>
              <option>Fondo</option>
              <option>Inversionista de impacto</option>
              <option>Estructurador</option>
              <option>Garantía</option>
              <option>Asistencia técnica</option>
            </>
          )}
        </select>
        <textarea
          required
          rows={3}
          placeholder="Descripción"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
        />
        <input
          placeholder={kind === "ovv" ? "Servicios" : "Instrumentos ofrecidos"}
          value={form.services}
          onChange={(e) => setForm({ ...form, services: e.target.value })}
          className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
        />
        <input
          placeholder="Sectores / tipos de iniciativa"
          value={form.sectors}
          onChange={(e) => setForm({ ...form, sectors: e.target.value })}
          className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
        />
        <input
          placeholder="Cobertura geográfica"
          value={form.coverage}
          onChange={(e) => setForm({ ...form, coverage: e.target.value })}
          className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
        />
        {kind === "ovv" && (
          <>
            <input
              placeholder="Idiomas"
              value={form.languages}
              onChange={(e) => setForm({ ...form, languages: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
            <input
              placeholder="Acreditación declarada"
              value={form.accreditation}
              onChange={(e) => setForm({ ...form, accreditation: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
            <input
              placeholder="Entidad acreditadora"
              value={form.accreditor}
              onChange={(e) => setForm({ ...form, accreditor: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
            <input
              placeholder="Alcance declarado"
              value={form.scope}
              onChange={(e) => setForm({ ...form, scope: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
            <input
              placeholder="Vigencia"
              value={form.validUntil}
              onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
            <input
              placeholder="Enlace o documento público"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
          </>
        )}
        {kind === "finance" && (
          <>
            <input
              placeholder="Ticket orientativo"
              value={form.ticket}
              onChange={(e) => setForm({ ...form, ticket: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
            <input
              placeholder="Criterios de evaluación declarados"
              value={form.criteria}
              onChange={(e) => setForm({ ...form, criteria: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
          </>
        )}
        <input
          required
          type="email"
          placeholder="Correo de contacto (no se publica)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
        />
        <label className="flex items-start gap-2 text-body-sm">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
          Consentimiento de publicación. El perfil se marcará como demostrativo en este MVP.
        </label>
        <div className="flex gap-2">
          <button type="submit" disabled={!consent} className="flex-1 rounded-lg bg-forest-deep text-on-primary py-2 disabled:opacity-40">
            Publicar perfil
          </button>
          <button type="button" onClick={onClose} className="rounded-lg border border-outline-variant px-4">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

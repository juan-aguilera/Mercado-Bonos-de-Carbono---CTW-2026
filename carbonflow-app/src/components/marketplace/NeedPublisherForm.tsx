import { useState, type FormEvent } from "react";
import type { MarketplaceNeed, MarketplaceTab, NeedCategory, PreparationLevel } from "@/lib/marketplace/types";
import { tabToNeedCategory } from "@/lib/marketplace/needs";

const NEED_KINDS = [
  { id: "ovv", label: "Servicios de validación o verificación", category: "ovv" as NeedCategory },
  { id: "carbon", label: "Proyecto o resultados de carbono", category: "carbon" as NeedCategory },
  { id: "finance", label: "Proyecto para financiación verde", category: "green_finance" as NeedCategory },
  { id: "buyer", label: "Comprador ancla o acuerdo futuro no vinculante", category: "carbon" as NeedCategory },
  { id: "alliance", label: "Asistencia técnica o alianza especializada", category: "green_finance" as NeedCategory },
];

export function NeedPublisherForm({
  defaultTab,
  onPublish,
}: {
  defaultTab: MarketplaceTab;
  onPublish: (need: MarketplaceNeed) => void;
}) {
  const [kind, setKind] = useState(NEED_KINDS.find((k) => k.category === tabToNeedCategory(defaultTab))?.id ?? "carbon");
  const [consent, setConsent] = useState(false);
  const [form, setForm] = useState({
    title: "",
    summary: "",
    organization: "",
    service: "Preevaluación",
    projectType: "Conservación",
    location: "Colombia",
    stage: "advanced" as PreparationLevel,
    interest: "Compra futura",
    instrument: "Capital de impacto",
    docs: "Resumen público",
    ticketMin: "",
    ticketMax: "",
    currency: "COP",
    volume: "",
    cobenefits: "Biodiversidad",
    targetDate: "",
    uses: "Implementación",
  });

  const selected = NEED_KINDS.find((k) => k.id === kind)!;
  const category = selected.category;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    const min = form.ticketMin ? Number(form.ticketMin) : undefined;
    const max = form.ticketMax ? Number(form.ticketMax) : undefined;
    if (min != null && max != null && min > max) return;
    const now = new Date().toISOString();
    onPublish({
      id: `user-need-${Date.now()}`,
      category,
      status: "published",
      title: form.title,
      summary: form.summary,
      organization: form.organization || "Organización no publicada",
      actorType: category === "ovv" ? "OVV" : category === "carbon" ? "Comprador" : "Financiador",
      needType: category === "ovv" ? form.service : category === "carbon" ? form.interest : form.instrument,
      projectTypes: [form.projectType],
      locationScope: [form.location],
      minimumPreparationLevel: form.stage,
      validationService: category === "ovv" ? form.service : undefined,
      carbonInterest: category === "carbon" ? form.interest : undefined,
      financeInstrument: category === "green_finance" ? form.instrument : undefined,
      resourceUses: category === "green_finance" ? form.uses.split(",").map((s) => s.trim()) : undefined,
      fundingTicketMin: min,
      fundingTicketMax: max,
      currency: form.currency,
      volumeHint: form.volume || undefined,
      cobenefits: form.cobenefits.split(",").map((s) => s.trim()).filter(Boolean),
      requiredDocuments: form.docs.split(",").map((s) => s.trim()).filter(Boolean),
      requiredPreparationItems: [],
      targetDate: form.targetDate || undefined,
      isSimulated: true,
      publishedAt: now.slice(0, 10),
      createdAt: now,
    });
  };

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
      <h2 className="font-heading text-headline-md text-primary">Publicar necesidad</h2>
      <fieldset className="space-y-2">
        <legend className="font-medium text-body-sm">¿Qué necesitas?</legend>
        {NEED_KINDS.map((option) => (
          <label key={option.id} className="flex gap-2 text-body-sm">
            <input type="radio" checked={kind === option.id} onChange={() => setKind(option.id)} />
            {option.label}
          </label>
        ))}
      </fieldset>
      <input
        required
        placeholder="Título de la necesidad"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
      />
      <input
        placeholder="Organización (opcional, no se publica contacto)"
        value={form.organization}
        onChange={(e) => setForm({ ...form, organization: e.target.value })}
        className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
      />
      <textarea
        required
        rows={3}
        placeholder="Descripción / mensaje adicional"
        value={form.summary}
        onChange={(e) => setForm({ ...form, summary: e.target.value })}
        className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
      />
      {category === "ovv" && (
        <select
          value={form.service}
          onChange={(e) => setForm({ ...form, service: e.target.value })}
          className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
        >
          <option>Preevaluación</option>
          <option>Validación</option>
          <option>Verificación</option>
          <option>Ambos</option>
        </select>
      )}
      {category === "carbon" && (
        <>
          <select
            value={form.interest}
            onChange={(e) => setForm({ ...form, interest: e.target.value })}
            className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
          >
            <option>Proyecto en desarrollo</option>
            <option>Resultados reportados</option>
            <option>Compra futura</option>
            <option>Comprador ancla</option>
            <option>Alianza técnica</option>
          </select>
          <input
            placeholder="Volumen orientativo opcional"
            value={form.volume}
            onChange={(e) => setForm({ ...form, volume: e.target.value })}
            className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
          />
        </>
      )}
      {category === "green_finance" && (
        <>
          <select
            value={form.instrument}
            onChange={(e) => setForm({ ...form, instrument: e.target.value })}
            className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
          >
            <option>Deuda verde</option>
            <option>Capital de impacto</option>
            <option>Garantía</option>
            <option>Asistencia técnica</option>
            <option>Pago por resultados</option>
            <option>Otro</option>
          </select>
          <div className="grid grid-cols-3 gap-2">
            <input
              placeholder="Ticket mín."
              value={form.ticketMin}
              onChange={(e) => setForm({ ...form, ticketMin: e.target.value })}
              className="rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
            <input
              placeholder="Ticket máx."
              value={form.ticketMax}
              onChange={(e) => setForm({ ...form, ticketMax: e.target.value })}
              className="rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
            <input
              placeholder="Moneda"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
          </div>
          <input
            placeholder="Uso de recursos aceptado"
            value={form.uses}
            onChange={(e) => setForm({ ...form, uses: e.target.value })}
            className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
          />
        </>
      )}
      <input
        required
        placeholder="Tipo de iniciativa"
        value={form.projectType}
        onChange={(e) => setForm({ ...form, projectType: e.target.value })}
        className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
      />
      <input
        required
        placeholder="Cobertura / ubicación"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
        className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
      />
      <select
        required
        value={form.stage}
        onChange={(e) => setForm({ ...form, stage: e.target.value as PreparationLevel })}
        className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
      >
        <option value="initial">Etapa mínima: Inicial</option>
        <option value="structured">Etapa mínima: En estructuración</option>
        <option value="advanced">Etapa mínima: Preparación avanzada</option>
        <option value="ready_for_review">Etapa mínima: Listo para revisión</option>
      </select>
      <input
        placeholder="Documentos o información requerida"
        value={form.docs}
        onChange={(e) => setForm({ ...form, docs: e.target.value })}
        className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
      />
      <input
        placeholder="Co-beneficios deseados"
        value={form.cobenefits}
        onChange={(e) => setForm({ ...form, cobenefits: e.target.value })}
        className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
      />
      <input
        type="date"
        value={form.targetDate}
        onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
        className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
      />
      {form.interest === "Resultados reportados" && (
        <p className="text-disclaimer-italic">
          Esta necesidad no se interpreta como compra inmediata de créditos. Solo busca resultados reportados en fuente
          externa.
        </p>
      )}
      <label className="flex items-start gap-2 text-body-sm">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        Confirmo que esta publicación no constituye oferta vinculante, contrato, recomendación financiera ni garantía de
        compra, validación o financiación.
      </label>
      <button type="submit" disabled={!consent} className="rounded-lg bg-forest-deep text-on-primary px-4 py-2 disabled:opacity-40">
        Publicar necesidad
      </button>
    </form>
  );
}

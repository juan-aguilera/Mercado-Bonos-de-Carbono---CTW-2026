import { useState } from "react";
import { MATCH_DISCLAIMER } from "@/lib/marketplace/matchNarrative";
import { toPublicNeedCard, toPublicProjectCard } from "@/lib/marketplace/publicPair";
import type { MarketplaceListing, MarketplaceNeed, StrongMatch } from "@/lib/marketplace/types";
import { CompatibilityScoreCard } from "./CompatibilityScoreCard";
import { EmptyState } from "./EmptyState";

export function StrongMatchesPanel({
  perspective,
  ownProjects = [],
  exampleProject,
  catalogProjects = [],
  ownNeeds = [],
  exampleNeed,
  needs = [],
  onUseOwnerDraft,
  onUseCompanyDraft,
}: {
  perspective: "owner" | "empresa";
  ownProjects?: MarketplaceListing[];
  exampleProject?: MarketplaceListing | null;
  catalogProjects?: MarketplaceListing[];
  ownNeeds?: MarketplaceNeed[];
  exampleNeed?: MarketplaceNeed | null;
  needs?: MarketplaceNeed[];
  onUseOwnerDraft?: (need: MarketplaceNeed, project: MarketplaceListing, draft: string, sharePublic: string[]) => void;
  onUseCompanyDraft?: (project: MarketplaceListing, draft: string) => void;
}) {
  const ownerOptions = ownProjects.length > 0 ? ownProjects : exampleProject ? [exampleProject] : [];
  const companyOptions = ownNeeds.length > 0 ? ownNeeds : exampleNeed ? [exampleNeed] : [];
  const [selectedId, setSelectedId] = useState(
    perspective === "owner" ? ownerOptions[0]?.id ?? "" : companyOptions[0]?.id ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [degraded, setDegraded] = useState(false);
  const [matches, setMatches] = useState<StrongMatch[] | null>(null);

  const selectedProject = ownerOptions.find((item) => item.id === selectedId) ?? ownerOptions[0];
  const selectedNeed = companyOptions.find((item) => item.id === selectedId) ?? companyOptions[0];
  const usingExample = perspective === "owner" ? ownProjects.length === 0 : ownNeeds.length === 0;
  const canSearch = perspective === "owner" ? Boolean(selectedProject) : Boolean(selectedNeed);

  const findMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/marketplace/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          perspective === "owner"
            ? {
                direction: "project-to-needs",
                project: selectedProject ? toPublicProjectCard(selectedProject) : undefined,
                needs: needs.map(toPublicNeedCard),
              }
            : {
                direction: "need-to-projects",
                need: selectedNeed ? toPublicNeedCard(selectedNeed) : undefined,
                projects: catalogProjects.map(toPublicProjectCard),
              }
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudieron calcular coincidencias.");
        return;
      }
      setMatches(data.matches ?? []);
      setDegraded(Boolean(data.degraded));
    } catch {
      setError("No se pudieron calcular coincidencias en este momento.");
    } finally {
      setLoading(false);
    }
  };

  const options = perspective === "owner" ? ownerOptions : companyOptions;
  const manyOwn = perspective === "owner" ? ownProjects.length > 1 : ownNeeds.length > 1;

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 space-y-3 max-w-3xl">
        <h2 className="font-heading text-headline-md text-primary">Encontrar coincidencias fuertes</h2>
        <p className="text-body-sm text-on-surface-variant">
          {perspective === "owner"
            ? "Comparamos tu proyecto con las necesidades publicadas por empresas. Las reglas puntúan; la IA explica las coincidencias más fuertes."
            : "Comparamos tu necesidad con los proyectos publicados. Las reglas puntúan; la IA explica los proyectos más compatibles."}
        </p>
        {!canSearch ? (
          <p className="text-body-sm text-on-surface-variant">
            {perspective === "owner" ? "Publica un proyecto para calcular coincidencias." : "Publica una necesidad para calcular coincidencias."}
          </p>
        ) : manyOwn ? (
          <label className="flex flex-col gap-1.5">
            <span className="font-data text-label-caps text-on-surface-variant">
              {perspective === "owner"
                ? "¿Para cuál de tus proyectos buscas contraparte?"
                : "¿Para cuál de tus necesidades buscas proyectos?"}
            </span>
            <select
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setMatches(null);
              }}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            >
              {options.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="text-body-sm text-on-surface">
            {usingExample ? "Ejemplo de demostración: " : perspective === "owner" ? "Tu proyecto: " : "Tu necesidad: "}
            <strong>{perspective === "owner" ? selectedProject?.title : selectedNeed?.title}</strong>
            {usingExample
              ? perspective === "owner"
                ? ". Publica un proyecto propio si quieres comparar con tus datos."
                : ". Publica una necesidad propia si quieres comparar con tus criterios."
              : "."}
          </p>
        )}
        <button
          type="button"
          disabled={!canSearch || loading}
          onClick={findMatches}
          className="rounded-lg bg-primary-container text-on-primary px-4 py-2 text-body-sm disabled:opacity-40"
        >
          {loading ? "Buscando coincidencias…" : "Encontrar coincidencias fuertes"}
        </button>
        <p className="text-disclaimer-italic text-on-surface-variant">{MATCH_DISCLAIMER}</p>
        {degraded && matches && (
          <p className="text-disclaimer-italic text-on-surface-variant">
            La explicación se generó con las reglas de compatibilidad porque el modelo de IA no estuvo disponible.
          </p>
        )}
      </div>

      {error && (
        <EmptyState
          title="No pudimos calcular coincidencias."
          body={error}
          actions={
            <button type="button" onClick={findMatches} className="rounded-lg bg-primary-container text-on-primary px-4 py-2 text-body-sm">
              Reintentar
            </button>
          }
        />
      )}

      {matches && matches.length === 0 && (
        <EmptyState
          title={
            perspective === "owner"
              ? "No encontramos coincidencias actuales para este proyecto."
              : "No encontramos proyectos compatibles con esta necesidad."
          }
          body="Puedes ampliar criterios o completar información para mejorar la compatibilidad."
        />
      )}

      {matches && matches.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          {matches.map((match) => {
            const need = match.needId ? needs.find((item) => item.id === match.needId) : undefined;
            const projectMatch = match.projectId
              ? catalogProjects.find((item) => item.id === match.projectId)
              : undefined;
            return (
              <article
                key={match.needId ?? match.projectId}
                className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 space-y-3"
              >
                <div>
                  <p className="font-data text-label-caps text-outline">{match.organization}</p>
                  <h3 className="font-heading text-headline-sm text-primary">
                    {match.needTitle ?? match.projectTitle}
                  </h3>
                </div>
                <CompatibilityScoreCard result={match.compatibility} compact />
                <p className="text-body-sm">{match.whyStrong}</p>
                {match.toValidate.length > 0 && (
                  <div>
                    <p className="font-data text-label-caps text-outline">Requiere validar</p>
                    <ul className="text-body-sm list-disc list-inside">
                      {match.toValidate.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-3 text-body-sm">
                  <div>
                    <p className="font-data text-label-caps text-outline">Compartir en público</p>
                    <ul className="list-disc list-inside">
                      {match.sharePublic.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-data text-label-caps text-outline">Bajo solicitud</p>
                    <ul className="list-disc list-inside">
                      {match.shareOnRequest.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <pre className="text-disclaimer-italic whitespace-pre-wrap bg-surface-container-low rounded-lg p-3">
                  {match.draftMessage}
                </pre>
                <button
                  type="button"
                  disabled={perspective === "owner" ? !need || !selectedProject : !projectMatch}
                  onClick={() => {
                    if (perspective === "owner" && need && selectedProject) {
                      onUseOwnerDraft?.(need, selectedProject, match.draftMessage, match.sharePublic);
                    }
                    if (perspective === "empresa" && projectMatch) {
                      onUseCompanyDraft?.(projectMatch, match.draftMessage);
                    }
                  }}
                  className="w-full rounded-lg bg-tertiary-fixed text-primary font-semibold py-2 text-body-sm disabled:opacity-40"
                >
                  Usar este borrador
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

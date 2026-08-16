"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Footer } from "@/components/Footer";
import { ContactRequestModal } from "@/components/marketplace/ContactRequestModal";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { FilterField, MarketplaceFilters } from "@/components/marketplace/MarketplaceFilters";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { ListingDetailPanel } from "@/components/marketplace/ListingDetailPanel";
import { MarketplaceComparisonTable } from "@/components/marketplace/MarketplaceComparisonTable";
import { MarketplaceRolePicker, roleLabel } from "@/components/marketplace/MarketplaceRolePicker";
import { MarketplaceSearchBar } from "@/components/marketplace/MarketplaceSearchBar";
import { NeedCard } from "@/components/marketplace/NeedCard";
import { NeedDetail } from "@/components/marketplace/NeedDetail";
import { NeedPublisherForm } from "@/components/marketplace/NeedPublisherForm";
import { NeedResponseModal } from "@/components/marketplace/NeedResponseModal";
import { ProviderProfileModal } from "@/components/marketplace/ProviderProfileModal";
import { PublishProjectModal } from "@/components/marketplace/PublishProjectModal";
import { StrongMatchesPanel } from "@/components/marketplace/StrongMatchesPanel";
import { DEMO_LISTINGS, listingMatchesQuery } from "@/lib/marketplace/catalog";
import { computeCompatibility } from "@/lib/marketplace/compatibility";
import { loadLocalRequests, loadUserListings, loadUserNeeds, saveLocalRequests, saveUserListings, saveUserNeeds } from "@/lib/marketplace/local";
import { DEMO_NEEDS } from "@/lib/marketplace/needs";
import type {
  MarketplaceListing,
  MarketplaceNeed,
  MarketplaceRequest,
  MarketplaceRole,
  MarketplaceRoleView,
  MarketplaceTab,
  ProjectContext,
} from "@/lib/marketplace/types";

const ROLE_KEY = "cf_marketplace_role";

function isProjectListing(listing: MarketplaceListing) {
  return (
    listing.kind === "carbon_project_development" ||
    listing.kind === "green_finance_project" ||
    listing.kind === "reported_carbon_result"
  );
}

function isOvvListing(listing: MarketplaceListing) {
  return listing.kind === "ovv_profile" || listing.kind === "technical_firm_profile";
}

function primaryAction(listing: MarketplaceListing, role: MarketplaceRole | null) {
  if (listing.kind === "reported_retired_credit") return "Consultar información histórica";
  if (role === "ovv" && isProjectListing(listing)) return "Postularse como entidad validadora";
  if (isOvvListing(listing)) return "Solicitar contacto";
  if (listing.kind === "reported_carbon_result") return "Solicitar información";
  return "Manifestar interés";
}

function MarketplaceInner() {
  const searchParams = useSearchParams();
  const intent = searchParams.get("intent");
  const publishFlag = searchParams.get("publish") === "1" || intent === "publish";

  const context: ProjectContext = {
    predioId: searchParams.get("predioId"),
    projectName: searchParams.get("proyecto"),
    tipo: searchParams.get("tipo"),
    estado: searchParams.get("estado"),
    preparacion: searchParams.get("preparacion"),
    brechas: searchParams.get("brechas"),
    necesidad: searchParams.get("necesidad"),
  };
  const fromValidacion = searchParams.get("from") === "validacion-registro";

  const [role, setRole] = useState<MarketplaceRole | null>(null);
  const [view, setView] = useState<MarketplaceRoleView | null>(null);
  const [query, setQuery] = useState("");
  const [holderFilter, setHolderFilter] = useState("Todos");
  const [projectScope, setProjectScope] = useState<"todos" | "carbon" | "finance">("todos");
  const [filters, setFilters] = useState({ tipo: "Todos", estado: "Todos" });
  const [userListings, setUserListings] = useState<MarketplaceListing[]>([]);
  const [userNeeds, setUserNeeds] = useState<MarketplaceNeed[]>([]);
  const [requests, setRequests] = useState<MarketplaceRequest[]>([]);
  const [detail, setDetail] = useState<MarketplaceListing | null>(null);
  const [contact, setContact] = useState<MarketplaceListing | null>(null);
  const [needDetail, setNeedDetail] = useState<MarketplaceNeed | null>(null);
  const [respondNeed, setRespondNeed] = useState<MarketplaceNeed | null>(null);
  const [draftForNeed, setDraftForNeed] = useState<{
    projectId: string;
    message: string;
    shareLabels: string[];
  } | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [ovvProfileOpen, setOvvProfileOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    setUserListings(loadUserListings());
    setUserNeeds(loadUserNeeds());
    setRequests(loadLocalRequests());
    const stored = sessionStorage.getItem(ROLE_KEY) as MarketplaceRole | null;
    if (fromValidacion || publishFlag) {
      setRole("propietario");
      setView(publishFlag ? null : "owner-ovvs");
      if (publishFlag) setPublishOpen(true);
      return;
    }
    if (stored === "ovv" || stored === "empresa" || stored === "propietario") {
      setRole(stored);
    }
  }, [fromValidacion, publishFlag]);

  const selectRole = (next: MarketplaceRole) => {
    setRole(next);
    sessionStorage.setItem(ROLE_KEY, next);
    setView(null);
    setCompareIds([]);
    if (next === "ovv") setView("ovv-projects");
    if (next === "empresa") setView("empresa-matches");
    if (next === "propietario") setView("owner-matches");
  };

  const clearRole = () => {
    setRole(null);
    setView(null);
    sessionStorage.removeItem(ROLE_KEY);
  };

  const listings = useMemo(() => [...userListings, ...DEMO_LISTINGS], [userListings]);
  const needs = useMemo(() => [...userNeeds, ...DEMO_NEEDS], [userNeeds]);
  const ownProjects = useMemo(
    () =>
      userListings.filter(
        (listing) => listing.kind === "carbon_project_development" || listing.kind === "green_finance_project"
      ),
    [userListings]
  );
  const exampleProject = useMemo(
    () => listings.find((listing) => listing.kind === "carbon_project_development") ?? null,
    [listings]
  );
  const matchProjects = ownProjects.length > 0 ? ownProjects : exampleProject ? [exampleProject] : [];

  const persistListings = (next: MarketplaceListing[]) => {
    setUserListings(next);
    saveUserListings(next);
  };
  const persistNeeds = (next: MarketplaceNeed[]) => {
    setUserNeeds(next);
    saveUserNeeds(next);
  };
  const persistRequests = (next: MarketplaceRequest[]) => {
    setRequests(next);
    saveLocalRequests(next);
  };

  const visibleListings = listings.filter((listing) => {
    if (!listingMatchesQuery(listing, query)) return false;
    if (view === "ovv-projects" || view === "empresa-projects") {
      if (!isProjectListing(listing)) return false;
      if (projectScope === "carbon" && listing.tab !== "carbon") return false;
      if (projectScope === "finance" && listing.tab !== "finance") return false;
    }
    if (view === "owner-ovvs" && !isOvvListing(listing)) return false;
    if (holderFilter !== "Todos" && listing.holderType !== holderFilter) return false;
    if (filters.tipo !== "Todos" && listing.initiativeType !== filters.tipo && !listing.sectors?.includes(filters.tipo)) {
      return false;
    }
    if (filters.estado !== "Todos" && listing.projectStatus !== filters.estado && listing.projectStage !== filters.estado) {
      return false;
    }
    return true;
  });

  const visibleNeeds = needs.filter((need) => {
    if (need.category === "ovv") return false;
    if (!query.trim()) return true;
    const hay = `${need.title} ${need.summary} ${need.organization} ${need.projectTypes.join(" ")}`.toLowerCase();
    return hay.includes(query.toLowerCase());
  });

  const referenceProject = matchProjects[0];
  const compared = listings.filter((listing) => compareIds.includes(listing.id));
  const showingCatalog = view === "ovv-projects" || view === "empresa-projects" || view === "owner-ovvs";
  const compareTab: MarketplaceTab = view === "owner-ovvs" ? "ovv" : projectScope === "finance" ? "finance" : "carbon";

  const toggleCompare = (id: string) => {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  };

  const roleActions =
    role === "ovv"
      ? [
          { id: "ovv-profile" as const, label: "Crear mi perfil de entidad validadora" },
          { id: "ovv-projects" as const, label: "Ver proyectos y postularme" },
        ]
      : role === "empresa"
        ? [
            { id: "empresa-matches" as const, label: "Encontrar coincidencias fuertes" },
            { id: "empresa-projects" as const, label: "Explorar proyectos" },
            { id: "empresa-need" as const, label: "Publicar necesidad" },
          ]
        : role === "propietario"
          ? [
              { id: "owner-matches" as const, label: "Encontrar coincidencias fuertes" },
              { id: "owner-needs" as const, label: "Ver necesidades de empresas" },
              { id: "owner-ovvs" as const, label: "Ver entidades validadoras disponibles" },
              { id: "owner-publish" as const, label: "Publicar proyecto" },
            ]
          : [];

  return (
    <div className="flex flex-col flex-1">
      <div className="bg-tertiary-fixed/70 border-b border-outline-variant px-margin-mobile md:px-margin-desktop py-2">
        <p className="max-w-7xl mx-auto text-body-sm text-on-surface">
          CarbonFlow facilita conexiones y el intercambio controlado de información. No ejecuta transacciones,
          certificaciones, validaciones, verificaciones, transferencias, pagos ni recomendaciones de inversión.
        </p>
      </div>

      <header className="px-margin-mobile md:px-margin-desktop py-10 bg-surface-container-lowest border-b border-outline-variant">
        <div className="max-w-7xl mx-auto space-y-5">
          <div>
            <h1 className="font-display text-display-lg text-primary">Marketplace</h1>
            <p className="text-body-lg text-on-surface-variant max-w-2xl mt-2">
              {role
                ? `Entraste como ${roleLabel(role)}. Elige una acción para continuar.`
                : "¿Quién eres en esta visita? Elige un rol para ver solo las acciones que te corresponden."}
            </p>
          </div>
          {role && (
            <div className="flex flex-wrap items-center gap-2">
              {roleActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => {
                    if (action.id === "ovv-profile") {
                      setOvvProfileOpen(true);
                      return;
                    }
                    if (action.id === "owner-publish") {
                      setPublishOpen(true);
                      return;
                    }
                    setView(action.id);
                    setCompareIds([]);
                  }}
                  className={`px-4 py-2 rounded-lg text-body-sm ${
                    view === action.id
                      ? "bg-primary-container text-on-primary"
                      : "border border-outline-variant text-on-surface-variant"
                  }`}
                >
                  {action.label}
                </button>
              ))}
              <button type="button" onClick={clearRole} className="text-body-sm text-primary hover:underline ml-2">
                Cambiar rol
              </button>
            </div>
          )}
          {role && view && view !== "empresa-need" && view !== "owner-matches" && view !== "empresa-matches" && (
            <MarketplaceSearchBar value={query} onChange={setQuery} />
          )}
          {fromValidacion && role === "propietario" && (
            <div className="rounded-lg border border-primary/20 bg-primary-container/10 p-4 max-w-2xl space-y-1">
              <p className="font-medium text-body-sm text-primary">Contexto desde Validación y Registro</p>
              {context.necesidad && <p className="text-body-sm">Necesidad: {context.necesidad.replace("-", " ")}</p>}
              {context.tipo && <p className="text-body-sm">Tipo de iniciativa: {context.tipo}</p>}
              {context.estado && <p className="text-body-sm">Estado de preparación: {context.estado}</p>}
            </div>
          )}
        </div>
      </header>

      <section className="flex-1 px-margin-mobile md:px-margin-desktop py-8 bg-surface">
        <div className="max-w-7xl mx-auto space-y-6">
          {!role && <MarketplaceRolePicker onSelect={selectRole} />}

          {role && view === "empresa-need" && (
            <NeedPublisherForm
              defaultTab="carbon"
              onPublish={(need) => {
                persistNeeds([need, ...userNeeds]);
                setView("empresa-matches");
              }}
            />
          )}

          {role === "propietario" && view === "owner-matches" && (
            <StrongMatchesPanel
              perspective="owner"
              ownProjects={ownProjects}
              exampleProject={exampleProject}
              needs={needs.filter((need) => need.category !== "ovv")}
              onUseOwnerDraft={(need, project, draft, sharePublic) => {
                setDraftForNeed({ projectId: project.id, message: draft, shareLabels: sharePublic });
                setRespondNeed(need);
              }}
            />
          )}

          {role === "empresa" && view === "empresa-matches" && (
            <StrongMatchesPanel
              perspective="empresa"
              ownNeeds={userNeeds}
              exampleNeed={needs.find((need) => need.category !== "ovv") ?? null}
              catalogProjects={listings.filter(
                (listing) =>
                  listing.kind === "carbon_project_development" || listing.kind === "green_finance_project"
              )}
              onUseCompanyDraft={(project, draft) => {
                setDraftForNeed({ projectId: project.id, message: draft, shareLabels: [] });
                setContact(project);
              }}
            />
          )}

          {role === "propietario" && view === "owner-needs" && (
            <div className="space-y-4">
              <p className="text-body-sm text-on-surface-variant">
                Empresas y aliados que publicaron una necesidad. Puedes responder con uno de tus proyectos.
              </p>
              {visibleNeeds.length === 0 ? (
                <EmptyState
                  title="Aún no hay necesidades de empresas."
                  body="Vuelve más tarde o publica tu proyecto para que las empresas puedan encontrarte."
                  actions={
                    <button type="button" onClick={() => setPublishOpen(true)} className="rounded-lg bg-primary-container text-on-primary px-4 py-2 text-body-sm">
                      Publicar proyecto
                    </button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  {visibleNeeds.map((need) => (
                    <NeedCard
                      key={need.id}
                      need={need}
                      compatibility={referenceProject ? computeCompatibility(referenceProject, need) : null}
                      onOpen={() => setNeedDetail(need)}
                      onRespond={() => {
                        setDraftForNeed(null);
                        setRespondNeed(need);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {showingCatalog && (
            <>
              {(view === "ovv-projects" || view === "empresa-projects") && (
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["todos", "Todos los proyectos"],
                      ["carbon", "Créditos de carbono"],
                      ["finance", "Financiación verde"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setProjectScope(id)}
                      className={`px-4 py-2 rounded-lg text-body-sm ${
                        projectScope === id ? "bg-primary text-on-primary" : "border border-outline-variant"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              <MarketplaceComparisonTable listings={compared} tab={compareTab} onClear={() => setCompareIds([])} />
              <div className="flex flex-col lg:flex-row gap-gutter">
                <MarketplaceFilters>
                  <FilterField
                    label="Tipo de iniciativa"
                    value={filters.tipo}
                    onChange={(tipo) => setFilters({ ...filters, tipo })}
                    options={["Todos", "Conservación", "Restauración", "Reforestación", "Energía"]}
                  />
                  {view !== "owner-ovvs" && (
                    <FilterField
                      label="Etapa"
                      value={filters.estado}
                      onChange={(estado) => setFilters({ ...filters, estado })}
                      options={["Todos", "En estructuración", "Preparación avanzada", "Listo para revisión técnica"]}
                    />
                  )}
                  {view !== "owner-ovvs" && (
                    <FilterField
                      label="Tipo de titular"
                      value={holderFilter}
                      onChange={setHolderFilter}
                      options={["Todos", "Comunidad", "Asociación", "Cooperativa", "Pequeño productor", "Desarrollador"]}
                    />
                  )}
                </MarketplaceFilters>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-gutter content-start">
                  {visibleListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onOpen={() => setDetail(listing)}
                      onPrimary={() => {
                        setDraftForNeed(null);
                        setContact(listing);
                      }}
                      primaryLabel={primaryAction(listing, role)}
                      compared={compareIds.includes(listing.id)}
                      onToggleCompare={() => toggleCompare(listing.id)}
                    />
                  ))}
                  {visibleListings.length === 0 && (
                    <div className="md:col-span-2">
                      <EmptyState
                        title="No encontramos perfiles con estos filtros."
                        body="Prueba ampliar tipo, etapa o titular."
                        actions={
                          <button
                            type="button"
                            onClick={() => {
                              setQuery("");
                              setHolderFilter("Todos");
                              setFilters({ tipo: "Todos", estado: "Todos" });
                              setProjectScope("todos");
                            }}
                            className="rounded-lg bg-primary-container text-on-primary px-4 py-2 text-body-sm"
                          >
                            Limpiar filtros
                          </button>
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {detail && (
        <ListingDetailPanel
          listing={detail}
          onClose={() => setDetail(null)}
          onPrimary={() => {
            const listing = detail;
            setDetail(null);
            setContact(listing);
          }}
          primaryLabel={primaryAction(detail, role)}
        />
      )}
      {contact && (
        <ContactRequestModal
          listing={contact}
          context={fromValidacion || context.predioId ? context : null}
          initialMessage={draftForNeed?.projectId === contact.id ? draftForNeed.message : undefined}
          onClose={() => {
            setContact(null);
            setDraftForNeed(null);
          }}
          onCreated={(request) => persistRequests([request, ...requests.filter((r) => r.id !== request.id)])}
        />
      )}
      {needDetail && (
        <NeedDetail
          need={needDetail}
          compatibility={referenceProject ? computeCompatibility(referenceProject, needDetail) : null}
          onClose={() => setNeedDetail(null)}
          onRespond={() => {
            setRespondNeed(needDetail);
            setNeedDetail(null);
          }}
        />
      )}
      {respondNeed && (
        <NeedResponseModal
          need={respondNeed}
          projects={matchProjects}
          initialProjectId={draftForNeed?.projectId}
          initialMessage={draftForNeed?.message}
          initialSharedLabels={draftForNeed?.shareLabels}
          onClose={() => {
            setRespondNeed(null);
            setDraftForNeed(null);
          }}
          onCreated={(request) => persistRequests([request, ...requests.filter((r) => r.id !== request.id)])}
        />
      )}
      {publishOpen && (
        <PublishProjectModal
          context={context}
          onClose={() => setPublishOpen(false)}
          onPublish={(created) => persistListings([...created, ...userListings])}
        />
      )}
      {ovvProfileOpen && (
        <ProviderProfileModal
          kind="ovv"
          onClose={() => setOvvProfileOpen(false)}
          onCreate={(listing) => persistListings([listing, ...userListings])}
        />
      )}
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

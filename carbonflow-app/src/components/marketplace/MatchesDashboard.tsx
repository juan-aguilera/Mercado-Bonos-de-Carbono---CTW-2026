import { computeCompatibility } from "@/lib/marketplace/compatibility";
import { needCategoryLabel } from "@/lib/marketplace/needs";
import type { MarketplaceListing, MarketplaceNeed } from "@/lib/marketplace/types";
import { EmptyState } from "./EmptyState";

export function MatchesDashboard({
  projects,
  needs,
  onOpenNeed,
}: {
  projects: MarketplaceListing[];
  needs: MarketplaceNeed[];
  onOpenNeed: (needId: string) => void;
}) {
  const rows = projects.flatMap((project) =>
    needs.map((need) => {
      const compatibility = computeCompatibility(project, need);
      return { project, need, compatibility };
    })
  );
  const visible = rows.filter((row) => row.compatibility.score >= 40).sort((a, b) => b.compatibility.score - a.compatibility.score);

  if (projects.length === 0) {
    return (
      <EmptyState
        title="Tu perfil de preparación aún no tiene información suficiente para calcular compatibilidad."
        body="Completa diagnóstico, formulación o Validación y Registro, y publica un proyecto para activar coincidencias."
        actions={
          <a href="/validacion-registro" className="rounded-lg bg-forest-deep text-on-primary px-4 py-2 text-body-sm">
            Ir a Validación y Registro
          </a>
        }
      />
    );
  }

  if (visible.length === 0) {
    return (
      <EmptyState
        title="No encontramos coincidencias actuales para este proyecto."
        body="Puedes publicar tu proyecto, ampliar criterios o completar información para mejorar la compatibilidad con futuras necesidades."
      />
    );
  }

  return (
    <div className="overflow-x-auto border border-outline-variant rounded-xl">
      <table className="w-full text-body-sm">
        <thead className="bg-surface-container-low text-left">
          <tr>
            <th className="p-3">Proyecto</th>
            <th className="p-3">Necesidad</th>
            <th className="p-3">Categoría</th>
            <th className="p-3">Compatibilidad</th>
            <th className="p-3">Estado</th>
            <th className="p-3">Acción</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((row) => (
            <tr key={`${row.project.id}-${row.need.id}`} className="border-t border-outline-variant">
              <td className="p-3">{row.project.title}</td>
              <td className="p-3">{row.need.title}</td>
              <td className="p-3">{needCategoryLabel(row.need.category)}</td>
              <td className="p-3">
                {row.compatibility.label} {row.compatibility.score}/100
              </td>
              <td className="p-3">Nueva</td>
              <td className="p-3">
                <button type="button" className="text-primary hover:underline" onClick={() => onOpenNeed(row.need.id)}>
                  Ver necesidad
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { MaterialIcon } from "@/components/ui/MaterialIcon";
import type { MarketplaceRole } from "@/lib/marketplace/types";

const ROLES: {
  id: MarketplaceRole;
  icon: string;
  title: string;
  description: string;
}[] = [
  {
    id: "ovv",
    icon: "verified",
    title: "Soy OVV",
    description: "Crea tu perfil y postúlate a proyectos de créditos o financiación que buscan revisión técnica.",
  },
  {
    id: "empresa",
    icon: "apartment",
    title: "Soy Empresa",
    description: "Explora proyectos y publica una necesidad de compensación, alianza o financiación.",
  },
  {
    id: "propietario",
    icon: "forest",
    title: "Soy propietario",
    description: "Consulta necesidades de empresas, revisa OVV disponibles y publica tu proyecto.",
  },
];

export function MarketplaceRolePicker({ onSelect }: { onSelect: (role: MarketplaceRole) => void }) {
  return (
    <div className="grid gap-gutter sm:grid-cols-3">
      {ROLES.map((role) => (
        <button
          key={role.id}
          type="button"
          onClick={() => onSelect(role.id)}
          className="text-left rounded-xl border border-outline-variant bg-surface-container-lowest p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <div className="w-12 h-12 rounded-lg bg-primary-container/15 flex items-center justify-center mb-4">
            <MaterialIcon name={role.icon} className="text-primary text-2xl" />
          </div>
          <h2 className="font-heading text-headline-sm text-primary">{role.title}</h2>
          <p className="text-body-sm text-on-surface-variant mt-2">{role.description}</p>
        </button>
      ))}
    </div>
  );
}

export function roleLabel(role: MarketplaceRole) {
  if (role === "ovv") return "OVV";
  if (role === "empresa") return "Empresa";
  return "Propietario";
}

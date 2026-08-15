"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const LINKS = [
  { href: "/", label: "Visión" },
  { href: "/diagnostico", label: "Diagnóstico" },
  { href: "/formulacion", label: "Formulación" },
  { href: "/certificacion", label: "Certificación" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/bonos-verdes", label: "Bonos Verdes" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="bg-surface/85 backdrop-blur-md border-b border-outline-variant shadow-sm sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16">
        <div className="flex items-center gap-8 min-w-0">
          <Link href="/" className="font-heading text-headline-md font-bold text-primary shrink-0 tracking-tight">
            CarbonFlow
          </Link>
          <nav className="hidden lg:flex gap-6 items-center">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-body-md pb-1 transition-colors ${
                    active
                      ? "text-primary border-b-2 border-primary font-medium"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden xl:block">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]" />
            <input
              className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-56"
              placeholder="Buscar predio, coordenadas..."
              type="text"
            />
          </div>
          <button className="text-on-surface-variant hover:text-primary transition-colors p-1" aria-label="Notificaciones">
            <MaterialIcon name="notifications" />
          </button>
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container border border-outline-variant shrink-0">
            <MaterialIcon name="person" className="text-[18px]" />
          </div>
        </div>
      </div>
      <nav className="lg:hidden flex gap-4 overflow-x-auto px-margin-mobile pb-3 -mt-1">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 text-body-sm px-3 py-1 rounded-full ${
                active ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

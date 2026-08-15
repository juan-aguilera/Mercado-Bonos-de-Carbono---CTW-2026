export function Footer() {
  return (
    <footer className="bg-surface-container-highest w-full border-t border-outline-variant">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop py-8 gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <span className="font-data text-label-caps text-on-surface">CarbonFlow</span>
          <span className="text-body-sm text-secondary">© 2024 CarbonFlow. Todos los derechos reservados.</span>
        </div>
        <nav className="flex gap-6">
          <a className="text-body-sm text-on-surface-variant hover:underline decoration-primary" href="#">
            Privacidad
          </a>
          <a className="text-body-sm text-on-surface-variant hover:underline decoration-primary" href="#">
            Términos
          </a>
          <a className="text-body-sm text-on-surface-variant hover:underline decoration-primary" href="#">
            Metodología
          </a>
          <a className="text-body-sm text-on-surface-variant hover:underline decoration-primary" href="#">
            Soporte
          </a>
        </nav>
      </div>
    </footer>
  );
}

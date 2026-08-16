type PillVariant = "success" | "warning" | "neutral" | "error" | "info";

const VARIANT_CLASSES: Record<PillVariant, string> = {
  success: "bg-secondary/12 text-on-secondary-container",
  warning: "bg-tertiary-container/20 text-on-tertiary-fixed-variant",
  neutral: "bg-surface-variant text-on-surface-variant",
  error: "bg-error-container text-on-error-container",
  info: "bg-primary-container/10 text-primary-container",
};

export function StatusPill({
  children,
  variant = "neutral",
  icon,
}: {
  children: React.ReactNode;
  variant?: PillVariant;
  icon?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-data text-label-caps uppercase tracking-wide ${VARIANT_CLASSES[variant]}`}
    >
      {icon && <span className="material-symbols-outlined fill text-[14px]">{icon}</span>}
      {children}
    </span>
  );
}

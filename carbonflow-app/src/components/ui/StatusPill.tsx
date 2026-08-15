type PillVariant = "success" | "warning" | "neutral" | "error" | "info";

const VARIANT_CLASSES: Record<PillVariant, string> = {
  success: "bg-secondary-container text-status-success border border-[#cce8d6]",
  warning: "bg-[#fff8e6] text-status-warning border border-[#ffecb3]",
  neutral: "bg-surface-variant text-on-surface-variant border border-outline-variant opacity-60",
  error: "bg-error-container text-on-error-container border border-error/20",
  info: "bg-primary-container/20 text-primary border border-primary/20",
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

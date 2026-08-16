import type { ReactNode } from "react";

export function EmptyState({
  title,
  body,
  actions,
}: {
  title: string;
  body: string;
  actions?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center space-y-3">
      <h3 className="font-heading text-headline-sm text-on-surface">{title}</h3>
      <p className="text-body-sm text-on-surface-variant max-w-lg mx-auto">{body}</p>
      {actions && <div className="flex flex-wrap justify-center gap-2 pt-2">{actions}</div>}
    </div>
  );
}

export function ErrorState({
  title,
  body,
  onRetry,
}: {
  title: string;
  body: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-lg border border-error/20 bg-error-container/40 p-6 space-y-3">
      <h3 className="font-heading text-headline-sm text-on-error-container">{title}</h3>
      <p className="text-body-sm text-on-surface-variant">{body}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-primary-container text-on-primary px-4 py-2 text-body-sm"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

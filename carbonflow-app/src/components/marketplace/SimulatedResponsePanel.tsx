export function SimulatedResponsePanel({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-outline-variant bg-tertiary-fixed/40 p-4 space-y-2">
      <p className="font-data text-label-caps text-on-surface">Respuesta simulada para demo</p>
      <p className="text-body-sm text-on-surface">“{message}”</p>
    </div>
  );
}

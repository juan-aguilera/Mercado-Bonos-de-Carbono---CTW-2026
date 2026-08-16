import type { CompatibilityResult } from "@/lib/marketplace/types";

export function CompatibilityScoreCard({
  result,
  compact,
}: {
  result: CompatibilityResult;
  compact?: boolean;
}) {
  return (
    <div className="rounded-lg border border-outline-variant p-3 space-y-2">
      <p className="text-body-sm font-medium">
        Compatibilidad de criterios: {result.label} — {result.score}/100
      </p>
      {!compact && (
        <>
          {result.matches.length > 0 && (
            <div>
              <p className="font-data text-label-caps text-outline">Coincide en</p>
              <ul className="text-body-sm">
                {result.breakdown
                  .filter((item) => item.matched)
                  .map((item) => (
                    <li key={item.criterion}>✓ {item.criterion}</li>
                  ))}
              </ul>
            </div>
          )}
          {result.gaps.length > 0 && (
            <div>
              <p className="font-data text-label-caps text-outline">Requiere validar</p>
              <ul className="text-body-sm">
                {result.gaps.slice(0, 4).map((gap) => (
                  <li key={gap}>! {gap}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-disclaimer-italic text-on-surface-variant">
            La compatibilidad compara únicamente criterios declarados. No representa una recomendación, aprobación,
            calificación de calidad, probabilidad de certificación ni compromiso comercial.
          </p>
        </>
      )}
    </div>
  );
}

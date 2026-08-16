"use client";

import { useEffect, useRef, useState } from "react";

const FACTORS = [
  { key: "cobertura", label: "Cobertura boscosa", weight: 30, value: 82 },
  { key: "deforestacion", label: "Deforestación reciente", weight: 20, value: 40 },
  { key: "area-protegida", label: "Área protegida (RUNAP)", weight: 15, value: 60 },
  { key: "tamano", label: "Tamaño del predio", weight: 15, value: 100 },
  { key: "completitud", label: "Completitud del formulario", weight: 20, value: 100 },
];

const SCORE = Math.round(FACTORS.reduce((sum, f) => sum + (f.weight / 100) * f.value, 0));

function useCountUp(target: number, active: boolean, durationMs = 1100) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, durationMs]);

  return value;
}

/**
 * The explainable-score preview: an "Editorial Card" (DESIGN.md component spec —
 * headline-sm header, hairline divider, no shadow) showing the same five weighted
 * factors the real /diagnostico flow scores a predio on.
 */
export function ScanHero() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const score = useCountUp(SCORE, active);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const circumference = 2 * Math.PI * 15.9155;
  const dash = (score / 100) * circumference;

  return (
    <div ref={ref} className="w-full max-w-md mx-auto lg:mx-0">
      <div className="rounded-lg border border-outline-variant bg-surface-container-lowest overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <h2 className="font-heading text-headline-sm text-on-surface">Ejemplo de diagnóstico</h2>
          <span className="font-data text-label-caps uppercase tracking-wide text-on-surface-variant">Ilustrativo</span>
        </div>

        <div className="p-6 flex flex-col items-center">
          <svg viewBox="0 0 36 36" className="w-28 h-28 mb-1">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="var(--color-outline-variant)"
              strokeWidth="1.5"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="var(--color-primary-container)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={`${dash}, ${circumference}`}
              style={{ transition: "stroke-dasharray 0.2s linear" }}
            />
            <text
              x="18"
              y="21"
              textAnchor="middle"
              className="font-heading"
              style={{ fill: "var(--color-on-surface)", fontWeight: 400, fontSize: "0.68em" }}
            >
              {score}
            </text>
          </svg>
          <p className="font-data text-label-caps uppercase tracking-wide text-on-surface-variant mb-5">
            score de prefactibilidad
          </p>

          <div className="w-full space-y-3">
            {FACTORS.map((f, i) => (
              <div key={f.key} className="flex items-center gap-3">
                <span className="font-data text-body-sm text-on-surface-variant w-9 shrink-0">{f.weight}%</span>
                <span className="text-body-sm text-on-surface-variant flex-1 truncate">{f.label}</span>
                <div className="w-16 h-1 rounded-full bg-surface-container-high overflow-hidden shrink-0">
                  <div
                    className="h-full rounded-full bg-secondary"
                    style={{
                      width: active ? `${f.value}%` : "0%",
                      transition: `width 0.9s cubic-bezier(0.16,1,0.3,1) ${0.12 * i + 0.15}s`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

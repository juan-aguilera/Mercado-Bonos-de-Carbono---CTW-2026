"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A hairline that draws itself in on scroll — connects two pipeline steps
 * that genuinely happen in order.
 */
export function PipelineConnector({ orientation }: { orientation: "horizontal" | "vertical" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (orientation === "vertical") {
    return (
      <div ref={ref} className="flex justify-center py-1 lg:hidden" aria-hidden="true">
        <svg width="1" height="32" viewBox="0 0 1 32" className="overflow-visible">
          <line
            x1="0.5"
            y1="0"
            x2="0.5"
            y2="32"
            pathLength={100}
            className={`connector-track-v ${drawn ? "is-drawn" : ""}`}
            stroke="var(--color-outline-variant)"
            strokeWidth="1"
          />
        </svg>
      </div>
    );
  }

  return (
    <div ref={ref} className="hidden lg:flex items-center px-1" aria-hidden="true">
      <svg width="40" height="1" viewBox="0 0 40 1" className="overflow-visible">
        <line
          x1="0"
          y1="0.5"
          x2="40"
          y2="0.5"
          pathLength={100}
          className={`connector-track ${drawn ? "is-drawn" : ""}`}
          stroke="var(--color-outline-variant)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

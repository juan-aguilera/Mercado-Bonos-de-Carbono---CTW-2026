export function ScoreGauge({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const color =
    clamped >= 70 ? "var(--color-status-success)" : clamped >= 40 ? "var(--color-status-warning)" : "var(--color-status-error)";

  return (
    <svg className="circular-chart" viewBox="0 0 36 36">
      <path
        className="circle-bg"
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <path
        className="circle"
        style={{ stroke: color }}
        strokeDasharray={`${clamped}, 100`}
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <text x="18" y="20.35" textAnchor="middle" className="font-heading" style={{ fill: "var(--color-primary)", fontWeight: 700, fontSize: "0.5em" }}>
        {clamped}
      </text>
    </svg>
  );
}

import type { Geometry } from "geojson";
import { resilientCall } from "@/lib/resilience";

export interface ForestCoverResult {
  treeCoverPct2000: number;
  treeCoverLossHa: number;
  recentLossAlerts: boolean;
  alertsLast12Months: number;
}

const GFW_BASE = "https://data-api.globalforestwatch.org";

async function queryTreeCover(geometry: Geometry): Promise<ForestCoverResult> {
  const apiKey = process.env.GFW_API_KEY;
  if (!apiKey) throw new Error("GFW_API_KEY no configurada");

  const coverRes = await fetch(
    `${GFW_BASE}/dataset/umd_tree_cover_loss/latest/query`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({
        sql: "SELECT SUM(area__ha) as loss_ha FROM data WHERE umd_tree_cover_density_2000__threshold >= 30",
        geometry,
      }),
    }
  );
  if (!coverRes.ok) throw new Error(`GFW respondio ${coverRes.status}`);
  const coverJson = await coverRes.json();
  const lossHa = Number(coverJson?.data?.[0]?.loss_ha ?? 0);

  const alertsRes = await fetch(
    `${GFW_BASE}/dataset/gfw_integrated_alerts/latest/query`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({
        sql: "SELECT COUNT(*) as alert_count FROM data WHERE gfw_integrated_alerts__date >= current_date - interval '365' day",
        geometry,
      }),
    }
  );
  const alertCount = alertsRes.ok
    ? Number((await alertsRes.json())?.data?.[0]?.alert_count ?? 0)
    : 0;

  // Cobertura boscosa actual estimada como 100% menos la perdida reciente,
  // acotada a un rango razonable; el equipo puede refinar esta formula en
  // el bloque 0-2h del plan al validar la respuesta real de GFW.
  const estimatedCoverPct = Math.max(0, Math.min(100, 100 - lossHa * 2));

  return {
    treeCoverPct2000: estimatedCoverPct,
    treeCoverLossHa: lossHa,
    recentLossAlerts: alertCount > 0,
    alertsLast12Months: alertCount,
  };
}

export async function getForestCover(geometry: Geometry) {
  const cacheKey = `gfw:${JSON.stringify(geometry)}`;
  return resilientCall(() => queryTreeCover(geometry), { cacheKey, timeoutMs: 8000 });
}

export function fallbackForestCover(): ForestCoverResult {
  return {
    treeCoverPct2000: 50,
    treeCoverLossHa: 0,
    recentLossAlerts: false,
    alertsLast12Months: 0,
  };
}

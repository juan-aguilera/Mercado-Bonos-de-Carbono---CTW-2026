@AGENTS.md

# CarbonFlow — project guide

Hackathon MVP (CTW 2026) for a carbon-market / green-bonds platform in Colombia. This file documents the app in `carbonflow-app/`; the product spec lives one level up.

## Source of truth documents

- `../PRD_CarbonFlow.md` — the actual product spec: what's in/out of scope for the hackathon, the scoring formula, the API strategy, the roadmap. Read this before changing scope or adding a feature.
- `../stitch_comprehensive_app_design/stitch_comprehensive_app_design/carbonflow_core/DESIGN.md` — the design system (colors, typography, spacing, component rules) that every screen must follow. The sibling folders (`dashboard_diagn_stico_geoespacial/`, `formulaci_n_de_proyecto_forestal/`, `m_dulo_de_certificaci_n_b_squeda/`, `marketplace_bonos_verdes/`) each have a `screen.png` + `code.html` reference mockup.
- `@AGENTS.md` (imported above) — Next.js 16 breaking-change notes. Read `node_modules/next/dist/docs/` before assuming Next 15/14 APIs still apply (e.g. `params`/`cookies()` are async, `PageProps`/`LayoutProps`/`RouteContext` are generated global types, Turbopack is default).

## What this product is

CarbonFlow takes a landowner/developer from "I have a piece of forest" to "I have a diagnostic, a formulated project, certification guidance, and a marketplace listing" — without CarbonFlow itself certifying, verifying, or issuing carbon credits.

Five modules, all reachable from the top nav (`src/components/NavBar.tsx`):

| # | Route | Status | What it does |
|---|---|---|---|
| 1 | `/diagnostico` | **Real, live APIs** | Draw/upload a polygon → live queries to Global Forest Watch, RUNAP, Nominatim → explainable prefactibility score + CO2e estimate → PDF export. This is the differentiator flow. |
| 2 | `/formulacion` | **Real** | Guided expediente (línea base, adicionalidad, riesgos, salvaguardas, cronograma, presupuesto) tied to an already-diagnosed predio. |
| 3 | `/certificacion` | **Real** | Chatbot (Claude, grounded in a curated knowledge doc) for certification guidance + live search across Verra/Gold Standard/RENARE. |
| 4 | `/marketplace` | **Real, simulated counterparty** | Real catalog + real quote requests; the seller's reply is auto-generated after a delay (see `src/lib/simulador.ts`). |
| 5 | `/bonos-verdes` | **Real, simulated counterparty** | Same pattern as marketplace, for green-bond financing profiles. |

Explicitly **out of scope** for the hackathon (see PRD §2.2): full MRV (checklists/evidence/versioning/audit log), any project type other than conservación/restauración forestal, real transactions/payments.

## Architecture

- **Framework**: Next.js 16 (App Router, Turbopack, React 19). Route handlers under `src/app/api/*/route.ts` are plain server functions — no separate backend.
- **Styling**: Tailwind v4, CSS-first config. All design tokens (colors, font families, custom text sizes, spacing) are defined via `@theme` in `src/app/globals.css` — there is no `tailwind.config.js`. Fonts (Hanken Grotesk / Inter / JetBrains Mono) are loaded via `next/font/google` in `src/app/layout.tsx`; Material Symbols Outlined icons are loaded via a `<link>` tag and rendered through `src/components/ui/MaterialIcon.tsx`.
- **Data**: Supabase (Postgres + Auth + Storage). Schema + RLS policies in `supabase/migrations/0001_init.sql` — run this in the Supabase SQL Editor before anything will persist. Every table is owner-scoped (`owner_id = auth.uid()`); marketplace/bonos-verdes catalogs are public-read.
- **Auth**: there is no login screen (out of scope). `src/components/AuthBootstrap.tsx` silently calls `supabase.auth.signInAnonymously()` on first load so every visitor gets a stable `auth.uid()` for RLS to key off of. This requires **"Allow anonymous sign-ins" enabled in Supabase → Authentication**, or nothing persists and the diagnostico page shows an explicit warning instead of the "Continuar a formulación" button.
- **Maps**: `react-leaflet` + OpenStreetMap tiles (no API key). `src/components/diagnostico/MapDraw.tsx` is a client-only component (dynamically imported with `ssr:false`) that handles click-to-draw, GeoJSON upload, and exposes vertex/closed status to the parent page.
- **PDF export**: `jspdf`, generated client-side in `src/lib/pdf/`.
- **LLM**: OpenRouter (`https://openrouter.ai/api/v1/chat/completions`), default model `google/gemini-2.5-flash`. Used server-side from `src/app/api/chat/route.ts` (certificación) and `src/app/api/formulacion/generar/route.ts` (PDD). Override the model with `OPENROUTER_MODEL`.

## Cross-cutting patterns (reuse these, don't reinvent)

- **External API resilience** (`src/lib/resilience.ts`): every call to GFW/RUNAP/Nominatim/registries goes through `resilientCall(fn, {cacheKey, timeoutMs, retries})`. It caches by key, times out, retries once, and returns `{ok, data, source: "live"|"cache"|"fallback"}` instead of throwing. Each integration module (`src/lib/integrations/*.ts`) also exports a `fallback*()` function for when `ok` is false. **Never call `fetch()` directly against an external API in a route — wrap it in `resilientCall` and provide a fallback.**
- **Number formatting** (`src/lib/format.ts`): `formatNumber(value, decimals)` — comma thousands separator, period decimal separator (e.g. `4,744,668.51`). Use this for every user-facing figure; don't use bare `.toFixed()` or `.toLocaleString("es-CO")` (that produces the opposite separators and was a reported bug).
- **Scoring formula** (`src/lib/scoring.ts`): the prefactibility score is a transparent weighted sum of five factors (cobertura 30%, deforestación 20%, área protegida 15%, tamaño 15%, completitud 20%), each carrying its own source label — not an ML model. `computeCo2eEstimate` uses a simple IPCC-Tier-1-style default factor keyed off forest cover %. If you change weights or factors, update the PRD §2.4 too.
- **Simulated counterparty** (`src/lib/simulador.ts`): marketplace/bonos-verdes "responses" are real DB rows, generated synchronously after `await delay(1500)` inside the API route (not a background job) so it survives serverless environments. Always label these as simulated in the UI (see existing disclaimer banners).

## Data model (see migration for full detail)

`predios` → `diagnosticos` (1:1-ish, latest wins) → `expedientes` → (`conversaciones_certificacion`, `consultas_registro`) and → `publicaciones_marketplace` → `solicitudes_cotizacion`, and → `perfiles_bonos_verdes` → `solicitudes_conexion_financiera`. Everything hangs off `predios.owner_id` / the equivalent `owner_id` column.

## Environment variables

See `.env.local.example` for the full list. Required for anything beyond static UI:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the `sb_publishable_...` key), `SUPABASE_SERVICE_ROLE_KEY` (the `sb_secret_...` key — server-only, never prefix a secret key with `NEXT_PUBLIC_`).
- `GFW_API_KEY` — Global Forest Watch Data API key (self-serve signup).
- `OPENROUTER_API_KEY` — for the certification chatbot and PDD generation. Optional `OPENROUTER_MODEL` overrides the default (`google/gemini-2.5-flash`).
- `RUNAP_REGISTRY_API_URL` — optional override; the default in `src/lib/integrations/runap.ts` is the **confirmed, working** public ArcGIS FeatureServer (`mapas.parquesnacionales.gov.co/.../pnn/runap/FeatureServer/0/query`, fields `ap_nombre`/`ap_categoria`), verified live against real protected areas (e.g. Chingaza).
- `VERRA_REGISTRY_API_URL`, `GOLD_STANDARD_REGISTRY_API_URL`, `RENARE_REGISTRY_API_URL` — optional overrides; still unconfirmed placeholders, these registries integrations fall back to a direct link to the official registry when no URL is configured.

Without Supabase configured, the app still runs and the diagnostic flow still computes scores — it just can't persist or hand off to formulación (this is intentional graceful degradation, not a bug).

## Local dev

```
npm install
npm run dev
```

Then visit `http://localhost:3000`. Type-check with `npx tsc --noEmit` before committing — there's no separate lint-on-save step configured beyond that.

## Known gaps (don't be surprised by these)

- No login/signup UI — anonymous auth only (see Auth above).
- Verra/Gold Standard/RENARE registry URLs (certificación module) are still unconfirmed placeholders; those searches degrade to a direct link to the official source rather than a live result until someone validates the real endpoints. (RUNAP itself is confirmed live — see Environment variables above.)
- `createServiceRoleClient()` in `src/lib/supabase/server.ts` exists but nothing currently calls it.
- Only `forestal-conservacion` is enabled in `src/lib/projectTypes.ts`; the rest render disabled with a "próximamente" label by design (PRD FR-02).

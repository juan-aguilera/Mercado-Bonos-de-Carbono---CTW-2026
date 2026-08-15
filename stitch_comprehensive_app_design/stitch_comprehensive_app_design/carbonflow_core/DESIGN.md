---
name: CarbonFlow Core
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#414944'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#717973'
  outline-variant: '#c1c8c2'
  surface-tint: '#3e6752'
  primary: '#002d1c'
  on-primary: '#ffffff'
  primary-container: '#1a4331'
  on-primary-container: '#85b098'
  inverse-primary: '#a4d0b8'
  secondary: '#43664d'
  on-secondary: '#ffffff'
  secondary-container: '#c2e9c9'
  on-secondary-container: '#486a51'
  tertiary: '#3b1f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#55340d'
  on-tertiary-container: '#cd9c6d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c0edd3'
  primary-fixed-dim: '#a4d0b8'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#264e3c'
  secondary-fixed: '#c5eccc'
  secondary-fixed-dim: '#aad0b1'
  on-secondary-fixed: '#00210e'
  on-secondary-fixed-variant: '#2c4e36'
  tertiary-fixed: '#ffdcbd'
  tertiary-fixed-dim: '#f0bd8b'
  on-tertiary-fixed: '#2c1600'
  on-tertiary-fixed-variant: '#623f18'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  forest-deep: '#0B2218'
  earth-sandy: '#E9EDC6'
  status-success: '#2D6A4F'
  status-warning: '#FFB703'
  status-error: '#D90429'
  map-overlay: rgba(45, 106, 79, 0.2)
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  disclaimer-italic:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  panel-width-md: 420px
---

## Brand & Style

The design system is engineered for the intersection of environmental science and financial technology. It communicates a high level of **technical authority, precision, and transparency**, moving beyond generic "eco-friendly" aesthetics toward a **Corporate Modern** style with **Data-Driven** accents.

The visual narrative centers on "scientific clarity." It employs generous negative space to allow complex geospatial data to breathe, while using high-contrast typography to ensure legal and technical disclaimers are unmistakable. The interface should feel like a sophisticated instrument—reliable, objective, and forward-looking.

**Design Principles:**
- **Scientific Rigor:** Use structured grids and consistent metadata labels to validate every data point.
- **Geospatial Depth:** Leverage layered surfaces (glassmorphism) to maintain context when UI panels overlay live maps.
- **Status-as-Navigation:** Use color and shape to clearly distinguish between active analysis, simulated results, and "Coming Soon" features.

## Colors

The palette is rooted in a professional "Deep Forest" spectrum, moving away from bright neons to more grounded, authoritative tones. 

- **Primary Forest (#1A4331):** Used for navigation, primary actions, and branding to establish trust and environmental focus.
- **Secondary Sage (#84A98C):** Used for interactive states and non-critical data visualizations.
- **Tertiary Earth (#D4A373):** Used sparingly for highlighting "Marketplace" features or financial instruments, providing a warm contrast to the greens.
- **Neutral Surface (#F8F9FA):** A clean, cool white for the primary background to ensure maximum legibility of data density.

**Status Colors:**
- Use **status-success** for certified data or completed diagnostics.
- Use **status-warning** for LLM-generated guidance and "Not Certified" disclaimers.
- Use **status-error** for API failures or high-risk diagnostic flags.

## Typography

This design system uses a triple-font strategy to balance character, readability, and technical precision.

1.  **Hanken Grotesk (Headlines):** A sharp, contemporary sans-serif that provides an authoritative and tech-forward feel for display text.
2.  **Inter (Body):** The workhorse for the dashboard, chosen for its exceptional legibility at small sizes and neutral tone.
3.  **JetBrains Mono (Data/Labels):** Used for all numerical data (CO2e, coordinates, area) and table headers. This reinforces the "scientific" nature of the platform.

**Special Scales:**
- **Mobile Adjustments:** For `display-lg`, scale down to 32px on mobile devices.
- **Data Tables:** Always use `data-mono` for figures to ensure tabular numbers align perfectly.
- **Disclaimers:** Use `disclaimer-italic` in a muted gray for all legal and LLM-limitation text.

## Layout & Spacing

The layout follows a **Hybrid Fluid/Fixed** model. The main Map interface is fluid, expanding to fill the viewport, while diagnostic panels and sidebars have fixed widths to maintain data readability.

**Grid Philosophy:**
- **Split-Screen:** A primary pattern for diagnostic tools where the left side (40% or fixed 420px) holds data inputs and results, and the right side (60% or fluid) displays the geospatial map.
- **Dashboard Grid:** A 12-column grid for the Marketplace and Data Room views, with 24px gutters.
- **Spacing Rhythm:** Based on a 4px baseline. Components typically use 8px (xs), 16px (md), or 24px (lg) padding to maintain high information density without clutter.

**Responsive Behavior:**
- **Desktop (1280px+):** Full split-screen with visible sidebars.
- **Tablet (768px - 1279px):** Sidebars become collapsible drawers; map remains the primary focus.
- **Mobile (< 768px):** Stacked layout. Data panels appear as bottom sheets over the map.

## Elevation & Depth

This design system uses **Tonal Layering** combined with **Backdrop Blurs** to manage information hierarchy over complex map backgrounds.

- **Level 0 (Base):** The live Map (Leaflet/Mapbox).
- **Level 1 (Substrate):** Main content cards and dashboard backgrounds using `neutral_color_hex`.
- **Level 2 (Panels):** Floating sidebars and diagnostic controls. These use a "Glassmorphic" effect (White at 85% opacity with a 12px blur) to maintain a sense of location on the map.
- **Level 3 (Modals/Popovers):** Highest elevation. Uses soft, extra-diffused shadows (0px 10px 30px rgba(0,0,0,0.08)) to draw focus.

**Borders:**
Instead of heavy shadows, use 1px solid dividers in a light gray (#E9ECEF) to separate factors within a score breakdown.

## Shapes

The shape language is **Professional and Rounded**, balancing the organic nature of environmental data with the precision of SaaS.

- **Standard Radius:** 0.5rem (8px) for buttons, input fields, and cards.
- **Large Radius:** 1rem (16px) for main container panels and modals.
- **Pills:** Used exclusively for status tags (e.g., "Active," "Coming Soon," "Certified") to distinguish them from interactive buttons.
- **Map Elements:** GeoJSON polygons should have a 2px stroke width with rounded join corners to appear more integrated with the UI.

## Components

**Buttons:**
- **Primary:** Forest-deep background with white text. High-contrast, no gradient.
- **Secondary:** Earth-sandy background with primary-forest text for "Market-related" actions.
- **Ghost:** Primary-forest border with transparent background for secondary map tools.

**Diagnostic Cards:**
- Cards displaying "Score Breakdown" must include a hairline divider between factors.
- Use `data-mono` for all scores (0-100).
- Include a "Source/Date" metadata tag at the bottom of every data card in `label-caps`.

**Inputs & Fields:**
- Use a soft gray border (1px) that darkens to `primary_color_hex` on focus.
- Validation states must use `status-error` for "Invalid Polygon" or "Missing Data."

**Status Tags (Pills):**
- **"Próximamente":** Neutral gray background with dark gray text; reduced opacity (60%) to signal inactivity.
- **"Forestry":** Light green background with `status-success` text.

**Map Controls:**
- Vertical stack of square buttons (rounded-md) in the top-right of the map.
- Use "Lucide" or "Phosphor" icons for Draw, Upload, and Delete functions.

**Chatbot / LLM Overlay:**
- Positioned as a floating bubble in the bottom right.
- Text must be wrapped in a container that explicitly uses `ui-warning` border accents to signal "Informational Guidance Only."
---
name: CarbonFlow Core
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#414944'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#717973'
  outline-variant: '#c1c8c2'
  surface-tint: '#3e6752'
  primary: '#002d1c'
  on-primary: '#ffffff'
  primary-container: '#1a4331'
  on-primary-container: '#85b098'
  inverse-primary: '#a4d0b8'
  secondary: '#006d36'
  on-secondary: '#ffffff'
  secondary-container: '#6dfe9c'
  on-secondary-container: '#007439'
  tertiary: '#1d2823'
  on-tertiary: '#ffffff'
  tertiary-container: '#333e38'
  on-tertiary-container: '#9ca9a1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c0edd3'
  primary-fixed-dim: '#a4d0b8'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#264e3c'
  secondary-fixed: '#6dfe9c'
  secondary-fixed-dim: '#4de082'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005227'
  tertiary-fixed: '#d9e6dd'
  tertiary-fixed-dim: '#bdcac1'
  on-tertiary-fixed: '#131e19'
  on-tertiary-fixed-variant: '#3e4943'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Lexend
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Lexend
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  headline-md:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  title-lg:
    fontFamily: Lexend
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Lexend
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

The design system is built upon the "Functionalist Minimal" philosophy, prioritizing the rapid comprehension of geospatial and environmental data without sacrificing aesthetic intent. It is designed for researchers, analysts, and policy-makers who require high-precision tools that feel human and approachable.

The style is characterized by expansive whitespace, a disciplined use of color, and high-quality typography. It avoids unnecessary decoration, instead using subtle tonal shifts and precise alignment to create hierarchy. The result is a UI that feels "airy" and "light," reducing cognitive load during complex data analysis while maintaining a sophisticated, modern professional edge.

## Colors

The palette is anchored by **Forest Green (#1a4331)**, used primarily for high-level branding, primary actions, and key semantic indicators. This is contrasted against a **Light/Airy Surface (#f8fafc)** to ensure the interface feels breathable.

- **Primary:** Forest Green is the voice of authority. Use it for buttons, active states, and navigation headers.
- **Secondary:** A vibrant Mint/Leaf green (#4ade80) is used sparingly for data visualization highlights and success states.
- **Surface/Tertiary:** A very pale mint-tinted white (#f0fdf4) is used for container backgrounds to distinguish them from the pure white background.
- **Neutral:** A range of cool slates is used for secondary text and borders to maintain a crisp, technical feel.

## Typography

The design system utilizes **Lexend** exclusively across all levels. Lexend’s unique variable width and rhythm specifically improve reading proficiency, making it ideal for data-dense environments.

- **Headlines:** Use Medium (500) or SemiBold (600) weights with slight negative letter-spacing to create a tight, intentional look.
- **Body:** Standard reading text should use the Regular (400) weight with generous line height (1.5x) to maintain the "airy" brand promise.
- **Labels:** Use SemiBold (600) and All-Caps for the smallest labels (`label-sm`) to ensure legibility on maps and complex charts.

## Layout & Spacing

The layout follows a **Fluid-Fixed Hybrid** model. Navigation and sidebars are fixed-width to ensure tool accessibility, while the central data/map canvas is fluid.

- **Grid:** A 12-column grid is used for dashboard layouts with a 24px gutter.
- **Rhythm:** All vertical spacing must be a multiple of the 4px base unit. 
- **Density:** High-density is permitted for data tables, but a "Comfortable" density (24px+ padding) is required for all content containers and cards to uphold the minimalist aesthetic.
- **Breakpoints:** 
  - Mobile: < 600px (Single column, 16px margins)
  - Tablet: 600px - 1024px (Reduced margins, collapsed sidebars)
  - Desktop: > 1024px (Full 48px margins)

## Elevation & Depth

Depth is communicated through **Tonal Layering** and **Low-Contrast Outlines** rather than heavy shadows. This maintains the clean, "functionalist" look.

- **Level 0 (Background):** Pure white (#FFFFFF) or the lightest neutral.
- **Level 1 (Cards/Panels):** Use the tertiary light green (#f0fdf4) with a 1px border (#e2e8f0).
- **Level 2 (Dropdowns/Modals):** Pure white background with a very soft, diffused shadow (0px 10px 25px rgba(26, 67, 49, 0.05)) to suggest floating without looking "heavy."
- **Focus States:** Use a 2px offset ring in the secondary mint color to provide clear interactive feedback.

## Shapes

The shape language is defined by a consistent 12px radius (`rounded-twelve`). This radius strikes a balance between professional precision and approachable softness.

- **Small elements (Buttons, Inputs):** 0.5rem (8px) for a slightly tighter look.
- **Medium elements (Cards, Modals):** 1rem (16px) for the standard container look.
- **Large elements (Outer Wrappers):** 1.5rem (24px) for distinct sectioning.
- **Interaction:** Hover states should not change the radius but may subtly increase the border-weight or deepen the background tint.

## Components

### Buttons
- **Primary:** Forest Green background, white text, 12px radius. High contrast.
- **Secondary:** Transparent background, Forest Green 1px border and text.
- **Ghost:** No background or border; Forest Green text. Used for low-priority actions.

### Input Fields
- **Style:** 1px neutral border, 8px padding. On focus, the border changes to Forest Green with a soft mint-tinted glow. Labels are always positioned above the field in `label-md`.

### Cards
- **Structure:** 16px or 24px internal padding. Cards should use Level 1 elevation (subtle border, no shadow). Header areas within cards should have a thin bottom-stroke separator.

### Chips & Tags
- **Data Tags:** Small, 12px radius, using a very light tint of the primary color with dark green text. Used for filtering categories or status indicators.

### Geospatial Controls
- **Floating Action Buttons (FABs):** Used for map zoom/layer controls. Circular (pill-shaped), white background, 1px border, utilizing the subtle Level 2 shadow for depth over the map surface.
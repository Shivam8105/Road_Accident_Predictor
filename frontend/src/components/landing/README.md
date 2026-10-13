# AcciPredict landing page design system

This README documents the current landing page refactor. It applies only to the landing page shell in `frontend/src/pages/Home.tsx` and the landing-specific components in `frontend/src/components/landing/`.

## Visual direction

AcciPredict uses a simple premium light theme: restrained, civic, and trustworthy. The page is inspired by the clarity and spacing discipline of Vercel, Linear, and Mapbox, without copying their layouts or visual assets.

The page avoids glassmorphism, neon effects, heavy gradients, fake statistics, uppercase section labels, badge-heavy layouts, and text-dense marketing blocks.

## Colors

Defined in `frontend/src/index.css` with Tailwind theme tokens.

- Brand blue: `brand-600` / `#2563eb`
- Brand hover: `brand-700` / `#1d4ed8`
- Brand deep: `brand-900` / `#1e3a8a`
- Soft brand surface: `brand-50` / `#eff6ff`
- Page background: white and very light blue-gray surfaces
- Text: `slate-950` for headings, `slate-600` for body, `slate-500` for supporting text
- Data severity colors are not used as brand colors; reserve them for real severity states only.

## Typography

- Font family: Geist Variable, self-hosted via `@fontsource-variable/geist`
- Mono: Geist Mono for verified numeric facts and dataset metadata
- Headings: tight tracking, strong weight, short line lengths
- Body: 16 to 18px with generous line-height for readability

## Spacing and layout

- Page max width: `max-w-7xl`
- Section padding: `py-20` on mobile/tablet, `lg:py-28` for major sections
- Hero: split layout with copy on the left and product visual on the right
- Feature area: asymmetric cards rather than a generic three-card row
- Map and explainability sections alternate composition without repeating the same split pattern too often
- Buttons use an 8px radius; cards and large visual containers use 16 to 24px radii

## Components

- `frontend/src/pages/Home.tsx`
  - Complete landing page composition
  - Connects CTAs to the existing tab-based routes via `setActiveTab`
- `frontend/src/components/landing/LandingNav.tsx`
  - Sticky light navigation for landing sections
  - Dashboard CTA routes to the existing dashboard tab
- `frontend/src/components/landing/LandingFooter.tsx`
  - Landing-only footer with route buttons into product modules
- `frontend/src/components/landing/Button` in `ui.tsx`
  - Shared button primitive with primary, secondary, and quiet variants
- `frontend/src/components/landing/Figure.tsx`
  - Reusable responsive visual slot with graceful fallback while assets are pending
- `frontend/src/components/landing/Reveal.tsx`
  - IntersectionObserver-based reveal animation with reduced-motion support

## Visual asset filenames

Add these files under `frontend/public/visuals/`. The implementation already references these exact paths, so adding the assets will populate the page without code changes.

| Filename | Used in | Aspect ratio | Suggested size | Content direction |
| --- | --- | --- | --- | --- |
| `landing-hero-dashboard.png` | Hero right visual | 16:11 | 1600 x 1100 | Polished overview of AcciPredict with prediction probabilities, SHAP explanation, and a compact map or chart. |
| `landing-accident-heatmap.png` | Accident heatmap preview | 16:10 | 1600 x 1000 | Light-theme map/heatmap screenshot showing spatial accident concentration across India. |
| `landing-analytics-overview.png` | Analytics preview card | 16:9 | 1400 x 788 | Light-theme analytics screenshot with city/time/weather/road trend charts. |

## Capture guidelines

- Use real AcciPredict screens or purpose-built product renders, not mock data presented as real.
- Keep the screenshots light themed to match the landing page.
- Avoid browser chrome and desktop backgrounds.
- Export PNG at 2x resolution for sharp text.
- Keep filename spelling exactly as listed above.

## Route behavior

Current landing buttons route to existing app tabs:

- Predict severity: `predict`
- Explore map / Open map: `map`
- Review trends / Open analytics: `analytics`
- Explain a prediction: `explain`
- Open dashboard: `dashboard`

Do not change these labels or targets unless the app navigation model changes.

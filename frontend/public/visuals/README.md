# AcciPredict Landing Page Visuals

Place the final WebP files in this directory using the exact filenames below. The landing page will replace its built-in visual fallbacks automatically.

## Visual direction

- Use a clean, natural daylight grade with restrained blue accents.
- Match the product palette: primary blue `#175CD3`, deep blue `#11479F`, soft blue `#EAF2FF`, ink `#101828`, canvas `#F7F9FC`, and divider `#D9E1EC`.
- Prioritize credible Indian road infrastructure, real geography, and legible product UI.
- Avoid neon color grading, artificial glow, glass effects, dramatic cyberpunk scenes, and text baked into photography.
- Keep important subjects away from the outer 10% so responsive crops remain useful.
- Export in sRGB as WebP. Aim for less than 350 KB per file.

## Required files

### `landing-hero-road.webp`

- Recommended size: 1600 x 1800 px
- Composition: high-angle modern Indian junction or divided arterial road, with visible traffic movement and clear lane geometry
- Tone: calm, observant, premium editorial photography
- Crop behavior: `object-fit: cover`; keep the key junction near the center
- Current alt text: “A high-angle view of a modern Indian road junction with moving traffic”

### `landing-map-overview.webp`

- Recommended size: 1800 x 1260 px
- Composition: final AcciPredict map interface showing historical concentration across India
- Content: use real product UI, realistic filters, and readable map hierarchy
- Crop behavior: `object-fit: cover`; protect the India map and primary controls
- Current alt text: “AcciPredict map showing historical accident concentrations across India”

### `landing-explanation.webp`

- Recommended size: 1400 x 1200 px
- Composition: final prediction explanation interface with road and weather factors clearly ranked
- Content: use an authentic product capture, not a concept dashboard
- Crop behavior: `object-fit: cover`; keep the factor explanation centered
- Current alt text: “AcciPredict explanation view with clear contributing road and weather factors”

## Replacement check

After adding the files, run `npm run build` from the repository root and review the page at desktop, tablet, and mobile widths. If a visual changes meaning, update its alt text in `frontend/src/pages/Home.tsx`.

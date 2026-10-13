# Landing page visuals

The landing page references these files by exact path. Drop each image into this folder with the filename below and it will appear automatically. Until then, each slot renders as a neutral placeholder surface, so the layout stays intact.

All visuals should be real AcciPredict UI captures or deliberate product renders. Do not use mock statistics presented as real project data.

| File | Where it appears | Aspect ratio | Suggested size | Content |
| --- | --- | --- | --- | --- |
| `landing-hero-dashboard.png` | Hero, right column | `16 / 11` | 1600 x 1100 | Product overview: severity prediction with class probabilities, SHAP contribution panel, and small map or chart. |
| `landing-accident-heatmap.png` | Map preview section | `16 / 10` | 1600 x 1000 | India accident heatmap or spatial risk map from AcciPredict. |
| `landing-analytics-overview.png` | Analytics preview section | `16 / 9` | 1400 x 788 | Analytics overview with city, time, weather, and road trend charts. |

## Capture guidelines

- Light UI theme, white or very light grey surfaces.
- Crop tight to the relevant panel. Avoid browser chrome, desktop backgrounds, and personal data.
- Use a consistent zoom level and, where possible, the same window width across shots.
- Export at 2x when possible so text stays sharp on retina displays.
- Prefer PNG for UI screenshots.

If you change any filename, update the matching `src` in `frontend/src/pages/Home.tsx` at the same time.

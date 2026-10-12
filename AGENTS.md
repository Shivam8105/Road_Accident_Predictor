# Repository Guidelines

## Project Structure & Module Organization

The FastAPI application lives in `backend/main.py`; domain logic is under `backend/services/`. Training is in `backend/training/`, while generated models and analytics exports belong in `backend/models_artifacts/`. The React/Vite frontend is under `frontend/`: pages are in `src/pages/`, shared UI in `src/components/`, and API access in `src/api/`. Root CSV files are source datasets. `api/index.py` adapts FastAPI for Vercel.

Keep `indian_roads_dataset.csv` and `Road.csv` strictly independent. Do not merge, join, or derive cross-dataset features; they represent different schemas and populations.

## Build, Test, and Development Commands

- `python3 -m venv .venv && source .venv/bin/activate`: create and enter a local Python environment.
- `pip install -r requirements.txt`: install Python dependencies.
- `cd frontend && npm ci`: install the locked frontend dependency set.
- `npm run dev`: start Vite on port 3000; run `python backend/main.py` separately for the API on port 8000.
- `npm run build`: type-check and build the frontend into `frontend/dist/`.
- `npm --prefix frontend run lint`: run Oxlint over frontend code.
- `python backend/training/train_models.py`: retrain and replace artifacts after intentional model or feature changes.

## Coding Style & Naming Conventions

Use four spaces and PEP 8 naming in Python: `snake_case` functions/modules and `PascalCase` classes. Keep route handlers thin and data or ML behavior in services. TypeScript uses two-space indentation, single quotes, semicolons, `PascalCase` components, and `camelCase` variables. Preserve strict compiler checks and prefer typed interfaces over `any`. Style React with Tailwind v4 utilities; reserve `src/index.css` for Tailwind theme tokens and vendor imports rather than page-specific selectors.

## Testing Guidelines

Build the frontend first, then run `python backend/test_backend.py`; this executable smoke suite checks the static app and primary REST endpoints using FastAPI `TestClient`. Add endpoint assertions when routes change, including status codes and meaningful response fields. Name additional Python tests `test_*.py` and functions `test_*`. No coverage threshold is configured; prioritize prediction, analytics, and dataset-isolation paths.

## Commit & Pull Request Guidelines

History is short and uses concise subjects (for example, `Deploy production UI & ML API`). Write imperative, focused titles and avoid vague messages such as `updated`. Pull requests should summarize changes, list verification commands, and call out retrained artifacts or dataset changes. Link issues, include screenshots for UI changes, and provide sample payloads for API changes.

## Security & Configuration

Do not commit credentials, virtual environments, caches, or ad hoc exports. Read deployment settings from environment variables such as `PORT`, and validate locally and with Docker.

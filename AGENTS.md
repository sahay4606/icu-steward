# ICU Steward 2.0 — Agent Guidelines

## Project

Yarn v1 workspaces monorepo: `frontend/` (Expo Router app) + `backend/` (Express + Supabase).

**Use `yarn` never `npm`** — root `package.json` uses `yarn workspace` commands. A `cmd-guard.js` exists but is not wired as a preinstall hook; rely on yarn regardless.

## Commands (run from repo root)

| Command | Action |
|---------|--------|
| `yarn dev` | API (port 4000) + Expo (port 8081) in parallel via `concurrently` |
| `yarn start` / `yarn web` / `yarn ios` / `yarn android` | Platform-specific Expo |
| `yarn lint` | Frontend only (`expo lint`) |
| `cd backend && yarn start` | API server only |
| `cd backend && yarn dev` | API server with `--watch` |
| `node --check backend/src/index.js` | Backend syntax check |

No tests exist anywhere in the repo. Manual verification only.

## Backend

- **Entrypoint** `backend/src/index.js` → `backend/src/app.js` (modular, routes as middleware fns). `backend/src/server.js` is a stale monolithic version — do not edit.
- ESM (`"type": "module"`). All imports must use explicit `.js` extensions.
- `createApp()` in `app.js` wires 11 entity route modules + 4 special routes (`auth`, `dashboard`, `profile`, `hospital-settings`). Each entity module calls `buildRepoRoutes()` from `middleware/build-repo-routes.js` — **no auth middleware is applied to CRUD endpoints**.
- Route modules live in `backend/src/modules/<entity>/<entity>.routes.js`. Domain data access in `backend/src/domain/`. Services in `backend/src/services/`.
- Repo pattern: `createRepository(client, tableName)` in `db/repository.js` provides `list/getById/insert/update/remove`. All entities carry `hospital_id` for tenant scoping.
- `.env` (gitignored) template at `.env.example` requires `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `APP_ENV`.

## Frontend

- **Expo Router v6** (file-based routes in `frontend/app/`). Entry: `expo-router/entry`.
- `(tabs)/_layout.js` uses `useState` + `display: none` instead of Expo Router's `Tabs` — avoids full-page reloads on web. Tab screens stay mounted.
- Dynamic detail routes: `patients/[id].js`, `investigations/[id].js`, `antibiotics/[id].js`. New/create route at `new.js`. Global search at `search.js`.
- **`DataContext` does not depend on `AuthContext`** — API client created at module level without a token. Data endpoints on backend have no auth guard anyway.
- API responses use snake_case; frontend normalizes to camelCase via `normalizeKeys()` from `src/lib/format.js`. Use camelCase everywhere in JS.
- `src/lib/config.js` hardcodes `ACTIVE_HOSPITAL_ID = 'hosp-st-john'` and `ACTIVE_USER_ID = 'u-admin'`. Override API URL via `EXPO_PUBLIC_API_URL` env var (defaults to `https://icu-steward-api.onrender.com`, falls back to `localhost:4000` when `window.location.hostname === 'localhost'`).
- Platform storage shims at `src/utils/storage/` (`.native.js`/`.web.js` pattern).
- Design tokens: `src/theme.js` (colors, spacing, radius, typography, shadow). White cards on `#F4F6F9`. Icons: `lucide-react-native`.
- Every interactive element must have `data-testid`.

## Database (Supabase)

- URL: `https://zxdcyfwfquoptkpnwrzu.supabase.co`
- `backend/supabase/master.sql` — full schema + seed data (run once in SQL Editor).
- Incremental migrations in `backend/supabase/migrations/` — run in order:
  1. `00001_create_tables.sql` — schema (if master.sql not run)
  2. `001_add_auth_columns.sql` — adds `email` + `password_hash`
  3. `002_add_drarushi_user.sql` — renames St. John → General Hospital, adds AIIMS + Dr. Arushi
- Backend uses `service_role` key (bypasses RLS — trusted server context).

## Auth

- JWT-based (`jsonwebtoken`). Login/signup return `{ user, token }`. `/api/auth/me` is the only protected route (uses `auth-middleware.js` Bearer token check).
- Token stored as `@icu_auth_token`, user as `@icu_auth_user` via platform storage.
- `AuthContext` provides `{ user, token, login, signup, logout, isAuthenticated }`. On startup, verifies stored token via `authService.getMe()`.
- Test credentials:
  - `meera@stjohn.icu` / `admin123` — Hospital Admin (General Hospital)
  - `arjun@stjohn.icu` / `consult123` — ICU Consultant (General Hospital)
  - `isha@stjohn.icu` / `resident123` — Senior Resident (General Hospital)
  - `drarushitest@gmail.com` / `aiimsonian` — ICU Consultant (AIIMS)
- ⚠️ Passwords stored as SHA-256 (not bcrypt). DO NOT use in production.

## Deploy

| Target | URL / Command |
|--------|--------------|
| Backend API (Render) | `https://icu-steward-api.onrender.com` (free tier, ~50s cold start) |
| Frontend Web (Render) | `https://aiims-icu.onrender.com` (SPA via `public/_redirects`) |
| Android APK (EAS) | `eas build --profile preview --platform android` (project `7507f0e9-c382-4f8d-8bc4-7313720d2fc3`) |
| Render auto-deploys | Every push to `main` |

`frontend/vercel.json` also configured for Vercel (SPA rewrites).

## Conventions

- **JavaScript only** — no TypeScript anywhere.
- Functional components. Filenames: lowercase-kebab or `[id].js`.
- Commit messages: imperative style (`feat: ...`, `fix: ...`).
- `yarn dev` root command: frontend runs with `CI=1` (skips interactive Expo prompts).

## Security

Full audit at `PROJECT_TECHNICAL_AUDIT_REPORT.txt` (score 1.5/10). Critical known issues:
- No auth on 50+ CRUD endpoints
- Passwords as SHA-256
- CORS `*` in production
- No input validation, rate limiting, or RLS policies

# ICU Steward 2.0 — Agent Guidelines

## Project
Yarn v1 workspaces monorepo: `frontend/` (Expo Router app) + `backend/` (Supabase domain scaffold).

**Must use `yarn` never `npm`** — the preinstall guard at `frontend/scripts/cmd-guard.js` rejects npm.

## Commands (run from repo root)
| Command | Action |
|---------|--------|
| `yarn dev` | API (port 4000) + Expo (port 8081) in parallel |
| `yarn start` | Expo dev server (port 8081) |
| `yarn web` / `yarn ios` / `yarn android` | Platform-specific |
| `yarn lint` | `expo lint` (frontend only) |
| `node --check backend/src/index.js` | Backend syntax check |
| `cd backend && yarn start` | API server only (port 4000) |
| `cd backend && yarn dev` | API server with watch |

No test framework configured. Manual verification only.

## Frontend (Expo Router v6, React Native 0.81, Expo 54, JavaScript only)
- **Routes** — file-based under `frontend/app/`. Tabbed screens in `(tabs)/`. Detail screens at `patients/[id].js`, `investigations/[id].js`, `antibiotics/[id].js`.
- **Shared code** — `src/components/` (reusable UI), `src/lib/` (API client + formatters), `src/data/mock.js` (static helpers only), `src/hooks/`, `src/theme.js` (design tokens).
- **Storage** — platform shims at `src/utils/storage/` (`.native.js` / `.web.js` pattern).
- **Multi-tenant** — all entities carry `hospital_id`. Frontend uses `ACTIVE_HOSPITAL_ID = 'hosp-st-john'` in `config.js`.
- **Style** — white-card on `#F4F6F9` background. Design tokens in `src/theme.js` (colors, spacing, radius, typography, shadow). Every interactive element must have `data-testid`.
- **Icons** — `lucide-react-native`.

### Tab navigation (web-specific fix)
`(tabs)/_layout.js` does NOT use Expo Router's `Tabs` component — it imports screen components directly and switches with `useState` + `display: none`. Reason: Expo Router Tabs on web causes full page reloads when switching tabs. All tab screens stay mounted (state preserved), only visibility toggles.

### Auth
- JWT-based auth with `jsonwebtoken` on backend, `Bearer` token on frontend.
- Login/signup return `{ user, token }`. Token stored in `@icu_auth_token`, user in `@icu_auth_user` (via platform storage).
- No token verification on every startup — JWT is self-validating; backend rejects expired tokens.
- `AuthContext` provides `{ user, token, login, signup, logout, isAuthenticated }`.
- Login credentials (seed):
  - `meera@stjohn.icu` / `admin123` — Hospital Admin (General Hospital)
  - `arjun@stjohn.icu` / `consult123` — ICU Consultant (General Hospital)
  - `isha@stjohn.icu` / `resident123` — Senior Resident (General Hospital)
  - `drarushitest@gmail.com` / `aiimsonian` — ICU Consultant (AIIMS)

### Data fetching
- `DataContext` does NOT depend on `AuthContext` — API client created once at module level (backend uses `service_role` key, no auth needed for data endpoints).
- All entities loaded on mount via `Promise.all` (9 concurrent calls + dashboard + timeline for first 3 patients).
- Loading spinners removed from all screens — content renders immediately with whatever data is available (empty states handle missing data).

### Deployments
- **Backend API**: `https://icu-steward-api.onrender.com` (Render Web Service, free tier)
- **Frontend Web**: `https://aiims-icu.onrender.com` (Render Static Site, free tier, SPA via `_redirects`)
- **Android APK**: built via EAS Free tier, download at `https://expo.dev/artifacts/eas/NbxuBdL1sOYML9iNfwQP0r8GV469JC3s_qDyfd-rHqM.apk`
- **Render auto-deploys** on every push to `main`. Free tier caveat: backend spins down after ~50s inactivity (~50s cold start).
- **EAS project ID**: `7507f0e9-c382-4f8d-8bc4-7313720d2fc3`

### UI Polish applied
- **Dashboard**: Removed magic `+1` on positive cultures count; `Updated` time reads from `hospital.updatedAt` instead of `new Date().toISOString()`.
- **Settings**: Uses `useAuth().user` instead of `users[0]` (shows actual logged-in user).
- **Investigation Detail**: Replaced placeholder filler text with real reminder data; action buttons show honest alerts instead of navigating to wrong screens.
- **Antibiotic Detail**: "Continue"/"Stop" buttons show alerts instead of navigating to wrong screens.
- **New Resource**: Save button has loading state (disabled + ActivityIndicator + "Saving...").
- **Search**: Shows "No results found" empty state when query yields no matches.
- **Auth fetch**: 10-second timeout via `AbortController` (avoids silent hangs when API is down).

## Backend (ESM, `"type": "module"`)
- Entrypoint `backend/src/index.js` exports factory functions (e.g. `createPatientsRepository`) that accept a Supabase client.
- REST server at `backend/src/server.js` (Express, port 4000) — maps `/api/*` routes to repositories.
- Domain files in `backend/src/domain/` — one per entity (patients, investigations, etc.).
- Services in `backend/src/services/` — auth, access-control, audit-log, notification-router.
- Credentials in `backend/.env` (gitignored). `.env.example` has the template.
- `JWT_SECRET` env var required for auth (defaults to `icu-steward-dev-secret` in dev).
- Migration SQL at `backend/supabase/master.sql` — run entire file in Supabase SQL Editor once to create tables + seed data. Includes both General Hospital (`hosp-st-john`) and AIIMS (`hosp-aiims`) hospitals.
- Incremental migrations at `backend/supabase/migrations/` — run in order:
  1. `001_add_auth_columns.sql` — add email/password_hash if master.sql was run before auth columns existed
  2. `002_add_drarushi_user.sql` — rename St. John → General Hospital, add AIIMS hospital + Dr. Arushi user
- Supabase URL: `https://zxdcyfwfquoptkpnwrzu.supabase.co`
- `service_role` key in backend `.env` (bypasses RLS — trusted server context).
- Install separately with `cd backend && yarn install`.
- Start server: `cd backend && yarn start` (or `yarn dev` for watch mode).

## Conventions
- **JavaScript only** (no TypeScript anywhere).
- **Functional components**, lowercase-kebab or `[id].js` route filenames.
- Commit messages use imperative style (`feat: ...`, `fix: ...`).
- Backend must use explicit `.js` extensions in all ESM imports.
- `yarn dev` from root uses `concurrently` to run both servers; frontend uses `CI=1` to skip interactive Expo prompts.

## Security Audit Status
Full audit at `PROJECT_TECHNICAL_AUDIT_REPORT.txt` — score 1.5/10. Key issues (not yet addressed):
- P0: No auth checks on 50+ CRUD endpoints (only `/api/auth/login`, `/api/auth/signup`, `/api/auth/me` are secured)
- P0: Passwords stored as SHA-256 (not bcrypt)
- P0: CORS set to `*` in production
- P1: No input validation/sanitization
- P1: No rate limiting
- P1: Service role key usable from anon context (no RLS policies defined)
- P2: No row-level access control per hospital
- P3: No tests, no CI/CD

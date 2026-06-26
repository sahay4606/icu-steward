# Repository Master Guide

## What This Project Is
This repository is a workspace with an Expo frontend and a backend scaffold for ICU operations. The frontend is a JavaScript-only React Native app that targets mobile and web from one codebase. The product focuses on multi-tenant ICU stewardship: patients, investigations, antibiotics, tasks, notifications, profiles, and hospital settings. Tenant separation is expressed through `hospitalId` / `hospital_id` throughout the data and UI model.

Seed hospitals: **General Hospital** (`hosp-st-john`) and **AIIMS General** (`hosp-aiims`).

## Top-Level Architecture
The repo is split into three layers:

1. `frontend/app/` defines navigation and screens through Expo Router.
2. `frontend/src/` contains shared UI, API client, formatters, storage adapters, and theme tokens.
3. Root config files control workspace behavior, backend scaffolding, bundling, and install policy.

Data flows: Supabase → REST API (Express, port 4000) → `src/lib/api.js` → `src/contexts/DataContext.js` → screens.

## Root Files
- `package.json` is the workspace root and forwards app scripts to `frontend/`.
- `frontend/package.json` defines the Expo scripts and dependency set.
- `frontend/app.json` sets the Expo app name, scheme, web bundler, and platform defaults.
- `frontend/babel.config.js` enables `babel-preset-expo` and Expo Router Babel support.
- `frontend/scripts/cmd-guard.js` enforces Yarn v1, rejecting npm installs (removed from package.json — Render uses npm).
- `backend/package.json` has `"type": "module"` for ESM support.
- `backend/.env.example` lists the required Supabase + JWT env vars.
- `backend/supabase/master.sql` — run in Supabase SQL Editor for full schema + seed data (General Hospital + AIIMS).
- `backend/supabase/migrations/` — run in order:
  1. `001_add_auth_columns.sql` — add email/password_hash columns (if master.sql was run before auth existed)
  2. `002_add_drarushi_user.sql` — rename St. John → General Hospital, add AIIMS hospital + Dr. Arushi user

## Navigation and Screens
`frontend/app/_layout.js` is the root shell. It boots storage, installs `SafeAreaProvider`, and registers stack routes.

`frontend/app/(tabs)/_layout.js` defines the primary navigation bar via direct component imports + `useState` (not Expo Router's `Tabs` — see: Tab navigation web fix):
- Dashboard
- Patients
- Tasks
- Alerts
- Profile

The rest of `frontend/app/` is screen-level feature code:
- `frontend/app/(tabs)/index.js` is the dashboard and action hub.
- `frontend/app/(tabs)/patients.js` is the roster, filtering, and sorting screen.
- `frontend/app/patients/[id].js` shows patient detail, checklist, devices, antibiotics, investigations, and timeline.
- `frontend/app/investigations/[id].js` and `frontend/app/antibiotics/[id].js` are detail/action views for stewardship workflows.
- `frontend/app/new.js` is a form factory driven by `?type=patient|investigation|antibiotic|task`.
- `frontend/app/search.js` is global search across entities.
- `frontend/app/settings.js` and `frontend/app/hospital-settings.js` separate personal vs tenant-level configuration.
- `frontend/app/login.js` and `frontend/app/signup.js` are auth screens.

## Shared UI Layer
The reusable component system lives in `frontend/src/components/ui/` — individual files with a barrel `index.js` export. Components: `Surface`, `SectionHeader`, `StatCard`, `ActionTile`, `Pill`, `ToggleChip`, `SearchField`, `Field`, `InfoRow`.

Additional components: `DailyChecklist` (`src/components/checklist.js`), `Timeline` (`src/components/timeline.js`).

Most interactive elements include `data-testid`.

## Domain Data and Helpers
`frontend/src/data/mock.js` is the static helpers file (filters, `getPatientRiskScore`, `getOpenChecklistCount`). Data comes from the API, not mock arrays.

`frontend/src/lib/format.js` contains date and elapsed-time helpers (formats dates in `en-IN`).

`frontend/src/lib/api.js` — fetch wrapper with optional Bearer token auth. `createApiClient(baseUrl, token?)` creates the API client.

## Theme and Visual System
`frontend/src/theme.js` defines the design tokens: colors, spacing, radii, typography families, shadows. Light background (`#F4F6F9`) with white surfaces.

## Auth (JWT-based)
- Backend: `POST /api/auth/login`, `POST /api/auth/signup`, `GET /api/auth/me` (all return `{ user, token }`).
- Frontend: `AuthContext` stores user (`@icu_auth_user`) and token (`@icu_auth_token`) via platform storage.
- No startup token verification — JWT is self-validating; backend rejects expired tokens.
- Login credentials (seed):
  - `meera@stjohn.icu` / `admin123` — Hospital Admin (General Hospital)
  - `arjun@stjohn.icu` / `consult123` — ICU Consultant (General Hospital)
  - `isha@stjohn.icu` / `resident123` — Senior Resident (General Hospital)
  - `drarushitest@gmail.com` / `aiimsonian` — ICU Consultant (AIIMS)

## Data Context
`DataContext` does NOT depend on `AuthContext` — API client created once at module level (backend uses `service_role` key, data endpoints don't need auth). All entities loaded on mount via `Promise.all`. Loading spinners removed — screens render immediately with whatever data is available.

## Storage and Platform Behavior
`frontend/src/utils/storage/` abstracts storage by platform:
- `index.web.js` uses `localStorage` with in-memory fallback.
- `index.native.js` uses `expo-secure-store` plus in-memory adapter.
- `index.js` selects implementation using `Platform.OS`.

## Backend Stack (ESM, `"type": "module"`)
- Entrypoint: `backend/src/index.js` — boots app on port 4000.
- App factory: `backend/src/app.js` — mounts all route modules.
- DB layer: `backend/src/db/client.js` (Supabase client), `backend/src/db/repository.js` (generic CRUD), `backend/src/db/backend.js` (factory).
- Modules: `backend/src/modules/*/` — route files per feature (auth, patients, dashboard, etc.).
- Middleware: `async-handler.js`, `auth-middleware.js`, `build-repo-routes.js`, `error-handler.js`.
- JWT: `jsonwebtoken`, `JWT_SECRET` env var (default `icu-steward-dev-secret`).
- Credentials in `backend/.env` (gitignored). `.env.example` has the template.

## Deployments
- **Backend API**: `https://icu-steward-api.onrender.com` (Render Web Service, free tier, spins down after ~50s inactivity)
- **Frontend Web**: `https://aiims-icu.onrender.com` (Render Static Site, free tier, SPA via `_redirects`)
- **Android APK**: `https://expo.dev/artifacts/eas/NbxuBdL1sOYML9iNfwQP0r8GV469JC3s_qDyfd-rHqM.apk` (EAS Free tier)
- **EAS project ID**: `7507f0e9-c382-4f8d-8bc4-7313720d2fc3`
- **Supabase**: `https://zxdcyfwfquoptkpnwrzu.supabase.co` (service_role key on backend, bypasses RLS)
- **Auto-deploys**: Render builds on every push to `main`

## Security Audit Status
Full audit at `PROJECT_TECHNICAL_AUDIT_REPORT.txt` — score 1.5/10. Key issues (not yet addressed):
- P0: No auth checks on 50+ CRUD endpoints (only login, signup, `/me` are secured)
- P0: Passwords stored as SHA-256 (not bcrypt)
- P0: CORS set to `*` in production
- P1: No input validation/sanitization, no rate limiting
- P1: Service role key usable from anon context (no RLS policies defined)
- P2: No row-level access control per hospital
- P3: No tests, no CI/CD

## Known Issues & Fixes (this session)

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Login button hangs silently | `fetch()` has no default timeout | Added `AbortController` 10s timeout in `auth.service.js` |
| Auth returns raw user, no session | No JWT implementation | Added `jsonwebtoken`, JWT signing on login/signup, JWT middleware for protected routes |
| 2-second startup delay | `AuthContext` called `getMe()` on every app start | Removed startup `getMe` call — JWT is self-validating |
| `query is not defined` crash | Edit accidentally removed `useState` lines while consolidating duplicate `useData()` | Restored missing `const [query]`, `[status]`, `[sortBy]` state declarations |
| Tab clicks cause full page reload | Expo Router `Tabs` on web renders `<a>` tags + custom `TabButton` spread `href` prop | Replaced `Tabs` + custom button with `Stack` + direct component imports + `useState` tab switching |
| 2-second loading spinner on every tab | Loading guards showed `ActivityIndicator` while data fetches | Removed all loading guards from every screen — content renders immediately |
| White flash / flicker when switching tabs | `router.replace()` caused app re-mount | Replaced `router.replace()` with `useState` + `display: none` (no routing, no navigation on tab switch) |
| Dashboard positive cultures had `+1` | Hardcoded magic number | Removed `+ 1` |
| Dashboard "Updated" showed current time | Used `new Date().toISOString()` instead of real data | Changed to `hospital.updatedAt` |
| Settings showed wrong user | Used `users[0]` instead of auth context | Changed to `useAuth().user` |
| Investigation detail had filler text | "Clinical context" section had generic placeholder | Replaced with actual reminder data from the investigation |
| Action buttons navigated to wrong screens | "Mark reviewed" → `/notifications`, "Continue"/"Stop" → `/notifications` | Changed to honest `Alert.alert` messages |
| Save button had no loading state | No busy indicator or disabled state | Added `saving` state + `ActivityIndicator` + "Saving..." text |
| Search showed no results feedback | No empty state for empty search results | Added "No results found" with `SearchX` icon |
| DataContext re-fetched on auth change | Depended on `useAuth()` for token-based API client | Decoupled — API client created once at module level (backend uses `service_role` key) |

## Runtime and Dependency Notes
Node `20.x`. Yarn v1 preferred locally (`frontend/scripts/cmd-guard.js` exists but preinstall hook removed — npm works too). Icons use `lucide-react-native`. Backend uses Express + cors. `yarn dev` from root starts both servers via `concurrently`; frontend uses `CI=1` to skip interactive Expo prompts.

## How To Read The Codebase
Start here:
1. `frontend/app/_layout.js` — root structure, auth gate, data provider
2. `frontend/src/contexts/AuthContext.js` — auth flow
3. `frontend/src/contexts/DataContext.js` — data loading
4. `frontend/app/(tabs)/index.js` — dashboard
5. `backend/src/modules/auth/auth.routes.js` — backend auth
6. `backend/src/app.js` — backend route wiring

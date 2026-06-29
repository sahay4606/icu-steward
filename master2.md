# AI Project Crux

Git history tracked on `main` — see `git log` for full history. This repo is a workspace with an Expo frontend for ICU operations plus a backend scaffold. The frontend is a JavaScript-only Expo Router app that targets mobile and web from one codebase. The important mental model is:

- `frontend/app/` = navigation and screens
- `frontend/src/` = reusable UI, API client, formatters, storage, theme, contexts
- `frontend/dist/` = exported web build output
- `backend/` = Supabase-facing repositories, services, auth, and role scaffolding

Seed hospitals: **General Hospital** (`hosp-st-john`) and **AIIMS General** (`hosp-aiims`).

Key files:
- `frontend/app/_layout.js` boots storage and defines the root stack with auth gate + data provider.
- `frontend/app/(tabs)/_layout.js` defines the main tab bar via `useState` + `display: none` (not Expo Router Tabs — web reload fix).
- `frontend/src/contexts/AuthContext.js` — JWT-based auth with token storage (`@icu_auth_user`, `@icu_auth_token`).
- `frontend/src/contexts/DataContext.js` — loads all REST endpoints on mount; no dependency on AuthContext.
- `frontend/src/lib/api.js` — fetch client with optional Bearer token auth.
- `frontend/src/components/ui/` — individual card/pill/search/toggle components.
- `frontend/src/utils/storage/` — platform-specific storage (`localStorage` on web, `expo-secure-store` on native).
- `backend/src/` holds repositories, route modules, middleware, and Supabase wiring.
- `backend/.env` requires `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`.

Project rules:
- Use Yarn v1 locally (npm now also works — preinstall guard removed for Render compatibility).
- Prefer Node `20.x`.
- JavaScript only (no TypeScript anywhere).
- Keep UI consistent with the existing light, white-card ICU design system.
- Keep `data-testid` on interactive elements. Icons via `lucide-react-native`.
- Preserve multi-tenant boundaries with `hospitalId` / `hospital_id`.
- Backend ESM imports must use explicit `.js` extensions.
- `yarn dev` from root starts both servers via `concurrently`; frontend uses `CI=1` to skip interactive prompts.

Important screens:
- Dashboard: `frontend/app/(tabs)/index.js`
- Patients list: `frontend/app/(tabs)/patients.js`
- Patient detail: `frontend/app/patients/[id].js`
- Investigation detail: `frontend/app/investigations/[id].js`
- Antibiotic detail: `frontend/app/antibiotics/[id].js`
- Create flow: `frontend/app/new.js`
- Search: `frontend/app/search.js`
- Personal settings: `frontend/app/settings.js`
- Hospital settings: `frontend/app/hospital-settings.js`
- Login: `frontend/app/login.js`
- Signup: `frontend/app/signup.js`

Auth (JWT-based):
- Login/signup return `{ user, token }`. Token stored in `@icu_auth_token`, user in `@icu_auth_user`.
- No startup token verification — JWT is self-validating; backend rejects expired tokens.
- Seed credentials:
  - `meera@stjohn.icu` / `admin123` — Hospital Admin (General Hospital)
  - `arjun@stjohn.icu` / `consult123` — ICU Consultant (General Hospital)
  - `isha@stjohn.icu` / `resident123` — Senior Resident (General Hospital)
  - `drarushitest@gmail.com` / `aiimsonian` — ICU Consultant (AIIMS)

Deployments:
- **Backend API**: `https://icu-steward-api.onrender.com` (Render Web Service, free tier, ~50s cold start)
- **Frontend Web**: `https://aiims-icu.onrender.com` (Render Static Site, free tier, SPA via `_redirects`)
- **Android APK**: `https://expo.dev/artifacts/eas/NbxuBdL1sOYML9iNfwQP0r8GV469JC3s_qDyfd-rHqM.apk`
- **Auto-deploys**: on every push to `main`

Runtime notes:
- Data comes from REST API, not mock arrays. Mock file (`src/data/mock.js`) has static helpers only.
- `DataContext` fetches all entities on mount (9 concurrent calls + dashboard + timeline). No loading spinners — content renders immediately.
- `src/lib/format.js` centralizes date formatting and elapsed-day helpers (en-IN locale).
- Web builds require `react-dom`, `react-native-web`, `expo-linking`, and `react-native-svg`.
- Backend is ESM (`"type": "module"`) — install separately with `cd backend && yarn install`.
- REST API server at `backend/src/index.js` (Express, port 4000). Start with `cd backend && yarn start`.
- Run `backend/supabase/master.sql` in Supabase SQL Editor — creates all tables + seed data in one shot.
- Then run all migrations in order: `001` through `013` (see AGENTS.md or master.md for full list).
- No test framework configured; verify manually with `node --check backend/src/index.js`.

Key issues fixed (web-specific):
- Tab navigation full page reloads → replaced Expo Router Tabs with `useState` + direct component imports + `display: none`.
- Login hang → added 10s AbortController timeout.
- No session → JWT auth with `jsonwebtoken`.
- Loading spinners slowing UX → removed all loading guards; data renders on arrival.
- Data re-fetch on auth change → decoupled DataContext from AuthContext.
- Filler text / wrong navigation → replaced with real data and honest alerts.
- Save button no feedback → added loading state.
- Search empty → added "No results" empty state.
- Dashboard bugs → removed magic `+1`, fixed stale time, fixed user reference.

Security audit (full report at `PROJECT_TECHNICAL_AUDIT_REPORT.txt`, score 1.5/10):
- P0: No auth checks on 50+ CRUD endpoints, SHA-256 passwords (not bcrypt), CORS `*`
- P1: No input validation, no rate limiting, service role key exposed
- P2: No row-level access control
- P3: No tests, no CI/CD

If you need to change the app, start from `master.md` for the detailed system map, then update the relevant route and shared component, not just the screen file.

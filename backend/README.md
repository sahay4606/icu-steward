# Backend Scaffold

This folder is the backend-ready layer for the ICU Steward app. It does not replace Supabase; it defines the domain boundaries, data access patterns, and service hooks that will later sit on top of Supabase tables, RLS policies, and edge functions.

## Current Domain Map
- `patients` maps to the roster and patient detail screens.
- `investigations` maps to investigation list/detail flows.
- `antibiotics` maps to stewardship review flows.
- `devices` maps to device review data inside patient detail.
- `tasks` maps to follow-up work and reminders.
- `notifications` maps to alerting, acknowledgements, and escalation.
- `timeline_events` maps to patient activity history.
- `reminder_rules` maps to tenant-level ICU reminder configuration.
- `daily_checklists` maps to the bedside review checklist.
- `users` and `hospitals` map to auth, tenant, and profile data.

## Screen To Backend Mapping
- Dashboard: `patients`, `investigations`, `antibiotics`, `notifications`, `analytics` snapshot data.
- Patients: `patients` with roster filters and risk calculations.
- Patient detail: `patients`, `devices`, `antibiotics`, `investigations`, `timeline_events`, `daily_checklists`.
- Investigation detail: `investigations`, linked `patients`, notifications, audit log.
- Antibiotic detail: `antibiotics`, linked `investigations`, notifications, audit log.
- Create flow: inserts into `patients`, `investigations`, `antibiotics`, or `tasks`.
- Search: cross-table lookup across all clinical entities.
- Settings: `users`, auth session, device/offline preferences.
- Hospital settings: `hospitals`, `reminder_rules`, role configuration.

## Planned Services
- Auth/session bootstrap
- Role-based access control
- Tenant scoping
- Notification fan-out
- Audit logging
- Supabase repository wrappers

## How To Use This Layer
Use `backend/src/index.js` as the integration surface. It exports factory helpers that accept a Supabase client and return ready-to-use repositories and services.

When you begin wiring Supabase, install the backend package separately from the app root:
```bash
cd backend
yarn install
```

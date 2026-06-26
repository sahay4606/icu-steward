# Domain Repositories

The frontend already exposes these business areas, so the backend layer mirrors them one-for-one:

- `hospitals`
- `users`
- `patients`
- `investigations`
- `antibiotics`
- `devices`
- `tasks`
- `notifications`
- `timeline_events`
- `reminder_rules`
- `daily_checklists`
- `audit_logs`
- `sessions`
- `role_assignments`

The repository factory in `backend/src/lib/repository.js` should be reused for each table instead of hand-writing query code in screens.


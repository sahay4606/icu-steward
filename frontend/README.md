# ICU Steward SaaS 2.0

Greenfield Expo Router scaffold for an ICU operations platform focused on:

- Antibiotic stewardship
- Investigation tracking
- Device review
- Notifications and tasks
- Patient roster and timeline visibility
- Multi-tenant hospital isolation via `hospital_id`

## Routes

- `/` redirects to the dashboard
- `/patients`
- `/patients/[id]`
- `/investigations/[id]`
- `/antibiotics/[id]`
- `/tasks`
- `/notifications`
- `/profile`
- `/search`
- `/new?type=patient|investigation|antibiotic|task`
- `/settings`
- `/hospital-settings`

## Notes

- JavaScript only, per ICU frontend guidelines
- Data-dense, white-card, light-background design system
- Every interactive element carries `data-testid`
- Mock data lives in `src/data/mock.js`
- REST client scaffolding lives in `src/lib/api.js`
- Storage shim lives in `src/utils/storage/`

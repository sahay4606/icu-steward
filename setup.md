# Setup Guide

## Prerequisites
- Node.js `20.x` is recommended. Expo was unstable on Node `25` in this repo.
- Yarn v1 is required. The `preinstall` guard blocks `npm install`.
- A browser is enough for local verification. iOS/Android simulators are optional.

## Repository Layout
- `frontend/app/` contains Expo Router screens and routes.
- `frontend/app/(tabs)/` contains the main tabbed experience.
- `frontend/src/components/` holds reusable UI blocks.
- `frontend/src/data/mock.js` provides the seed ICU data.
- `frontend/src/utils/storage/` contains web/native storage shims.
- `frontend/dist/` is generated when you export the web build.

## One-Time Setup
```bash
source ~/.nvm/nvm.sh
nvm install 20
nvm use 20
yarn install
```

If `yarn install` complains about mixing package managers, keep using Yarn and avoid `npm`.

## Run Locally
### Web development
```bash
source ~/.nvm/nvm.sh
nvm use 20
yarn web -- --port 8081
```
Open `http://localhost:8081`.

### iOS or Android
```bash
yarn ios
yarn android
```
Use the Expo app on a device or a simulator/emulator.

## Verify The App
- Dashboard should redirect from `/` to the tab layout.
- `data-testid` attributes are present on interactive controls.
- The app should load mock ICU data from `frontend/src/data/mock.js`.

## Troubleshooting
- If web startup fails on Node `25`, switch back to Node `20`.
- If the web bundle fails because of missing packages, rerun `yarn install`.
- The storage layer is platform-specific; web uses `localStorage`, native uses `expo-secure-store`.

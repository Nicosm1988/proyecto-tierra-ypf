# ECOA Tierra YPF Project Instructions

ECOA Tierra YPF is a premium CesiumJS geospatial experience. The app must remain
legal, maintainable and deployable on Vercel.

## Principles

- Do not copy Google Earth code, UI, assets or proprietary data.
- Keep CesiumJS as the primary geospatial engine.
- Treat all operational information in this repository as demo data unless a
  trusted source is explicitly documented.
- Keep Google Photorealistic 3D Tiles behind feature flags, API-key checks and
  visible attribution.
- Never commit private keys or `.env.local`.
- Preserve current production behavior while evolving the architecture.

## Engineering

- Prefer small, incremental changes.
- Keep Cesium viewer lifecycle isolated and destroy resources in cleanup.
- Do not store heavy Cesium objects in React or Zustand state.
- Use declarative registries for layers and tours.
- Run `npm run build`, `npm run test` and relevant Playwright checks before
  deploying.

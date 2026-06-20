# ECOA Tierra YPF

Experiencia geoespacial 3D premium para exploracion energetica, ambiental y territorial. La app usa CesiumJS como motor de Tierra navegable, con capas activables, recorridos cinematograficos, buscador, datos demo y despliegue en Vercel.

Produccion: https://proyecto-tierra-ypf.vercel.app/

## Stack

- Vite + React
- CesiumJS
- Zustand para estado de HUD/capas/tours
- Motion para microinteracciones UI
- lucide-react para iconografia
- GeoJSON local para fronteras y ubicaciones demo
- Vitest + Testing Library
- Playwright + axe-core

## Desarrollo

```bash
npm install
npm run dev
```

## Comandos

```bash
npm run build
npm run test
npm run test:e2e
npm run lint
npm run format
```

`test:e2e` usa Chrome del sistema mediante Playwright. Si el equipo no tiene Chrome instalado, ejecutar `npx playwright install --with-deps` o ajustar `playwright.config.js`.

## Variables de entorno

Copiar `.env.example` a `.env.local` para desarrollo local:

```bash
cp .env.example .env.local
```

Variables publicas de Vite:

- `VITE_APP_NAME`
- `VITE_ENABLE_GOOGLE_PHOTOREALISTIC_TILES`
- `VITE_CESIUM_ION_TOKEN`
- `VITE_GOOGLE_MAPS_API_KEY`
- `VITE_DEFAULT_LAT`
- `VITE_DEFAULT_LON`
- `VITE_DEFAULT_HEIGHT`

Todo valor `VITE_*` queda expuesto al cliente. Las claves de Google Maps deben restringirse por dominio/referrer y API permitida. Google Photorealistic 3D Tiles queda desactivado por defecto y tiene fallback al globo Cesium/Esri.

## Datos

Los datos incluidos son demo, no oficiales:

- `src/data/sites.json`
- `src/data/arcs.json`
- `src/data/feed.json`
- `src/data/ypf-demo-locations.geojson`
- `src/data/camera-tours.json`

Cada capa o marcador demo debe conservar metadata de fuente, fecha, categoria y estado. No presentar datos demo como datos reales.

## Arquitectura

- `src/globe/EarthGlobe.jsx`: ciclo de vida Cesium, entidades, capas geograficas y comandos de camara.
- `src/components/hud/`: HUD premium, buscador, capas, tours, informacion y rendimiento.
- `src/earth/layerRegistry.js`: registro declarativo de capas.
- `src/store/useEarthStore.js`: estado global liviano.
- `src/utils/env.js`: feature flags y variables publicas.
- `src/earth/googlePhotorealisticTiles.js`: integracion opcional y protegida para Google Photorealistic 3D Tiles.

## Deploy

Vercel detecta Vite y publica `dist`. `vercel.json` incluye rewrite SPA a `index.html`.

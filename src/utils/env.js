function getBooleanEnv(value) {
  return value === true || value === "true";
}

function getNumberEnv(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const publicEnv = {
  appName: import.meta.env.VITE_APP_NAME || "ECOA Tierra YPF",
  cesiumIonToken: import.meta.env.VITE_CESIUM_ION_TOKEN || "",
  defaultCamera: {
    height: getNumberEnv(import.meta.env.VITE_DEFAULT_HEIGHT, 14_500_000),
    lat: getNumberEnv(import.meta.env.VITE_DEFAULT_LAT, -34.2),
    lng: getNumberEnv(import.meta.env.VITE_DEFAULT_LON, -58.8)
  },
  enableGooglePhotorealisticTiles: getBooleanEnv(
    import.meta.env.VITE_ENABLE_GOOGLE_PHOTOREALISTIC_TILES
  ),
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
};

export function canUseGooglePhotorealisticTiles() {
  return publicEnv.enableGooglePhotorealisticTiles && Boolean(publicEnv.googleMapsApiKey);
}

export function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

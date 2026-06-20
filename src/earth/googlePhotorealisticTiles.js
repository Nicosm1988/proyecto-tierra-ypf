import { Cesium3DTileset } from "cesium";
import { canUseGooglePhotorealisticTiles, publicEnv } from "../utils/env.js";

export async function loadGooglePhotorealisticTiles(viewer) {
  if (!canUseGooglePhotorealisticTiles()) {
    return {
      loaded: false,
      reason: "disabled"
    };
  }

  const key = encodeURIComponent(publicEnv.googleMapsApiKey);
  const tileset = await Cesium3DTileset.fromUrl(
    `https://tile.googleapis.com/v1/3dtiles/root.json?key=${key}`,
    {
      showCreditsOnScreen: true
    }
  );

  viewer.scene.primitives.add(tileset);
  viewer.scene.globe.show = false;

  return {
    loaded: true,
    tileset
  };
}

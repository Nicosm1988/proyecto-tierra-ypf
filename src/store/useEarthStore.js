import { create } from "zustand";
import { initialLayerVisibility } from "../earth/layerRegistry.js";

let commandSeed = 0;

function createCommand(type, payload = {}) {
  commandSeed += 1;
  return {
    id: commandSeed,
    payload,
    type
  };
}

export const useEarthStore = create((set) => ({
  activeTourId: null,
  cameraCommand: null,
  hudSection: "layers",
  layerVisibility: initialLayerVisibility,
  measurementMode: true,
  performanceMode: false,
  setHudSection: (hudSection) => set({ hudSection }),
  toggleLayer: (layerId) =>
    set((state) => ({
      layerVisibility: {
        ...state.layerVisibility,
        [layerId]: !state.layerVisibility[layerId]
      }
    })),
  setLayerVisibility: (layerId, visible) =>
    set((state) => ({
      layerVisibility: {
        ...state.layerVisibility,
        [layerId]: visible
      }
    })),
  runCameraCommand: (type, payload) =>
    set({
      activeTourId: type === "tour" ? (payload?.tour?.id ?? null) : null,
      cameraCommand: createCommand(type, payload)
    }),
  stopTour: () =>
    set({
      activeTourId: null,
      cameraCommand: createCommand("stop-tour")
    }),
  toggleMeasurementMode: () =>
    set((state) => ({
      measurementMode: !state.measurementMode
    })),
  togglePerformanceMode: () =>
    set((state) => ({
      performanceMode: !state.performanceMode
    }))
}));

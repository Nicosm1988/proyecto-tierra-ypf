import { describe, expect, it } from "vitest";
import {
  getEnabledLayerCount,
  initialLayerVisibility,
  isInfrastructureVisibleByLayers,
  layerGroups
} from "../../earth/layerRegistry.js";

describe("layerRegistry", () => {
  it("defines real infrastructure layers enabled by default", () => {
    const layers = layerGroups.flatMap((group) => group.layers);

    expect(layerGroups).toHaveLength(2);
    expect(layers.map((layer) => layer.id)).toContain("rv-ypf-pipelines");
    expect(layers.map((layer) => layer.id)).toContain("rv-installations");
    expect(getEnabledLayerCount(initialLayerVisibility)).toBe(layers.length);
  });

  it("maps infrastructure visibility to layer toggles", () => {
    const pipeline = { layerId: "rv-ypf-pipelines" };

    expect(isInfrastructureVisibleByLayers(pipeline, initialLayerVisibility)).toBe(true);
    expect(
      isInfrastructureVisibleByLayers(pipeline, {
        ...initialLayerVisibility,
        "rv-ypf-pipelines": false
      })
    ).toBe(false);
  });
});

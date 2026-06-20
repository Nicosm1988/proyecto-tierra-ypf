import { describe, expect, it } from "vitest";
import {
  getEnabledLayerCount,
  initialLayerVisibility,
  isSiteVisibleByLayers,
  layerGroups
} from "../../earth/layerRegistry.js";

describe("layerRegistry", () => {
  it("defines grouped premium layers enabled by default", () => {
    expect(layerGroups.length).toBeGreaterThanOrEqual(5);
    expect(getEnabledLayerCount(initialLayerVisibility)).toBeGreaterThanOrEqual(8);
  });

  it("maps site visibility to layer toggles", () => {
    const site = { type: "upstream" };
    expect(isSiteVisibleByLayers(site, initialLayerVisibility)).toBe(true);
    expect(
      isSiteVisibleByLayers(site, {
        ...initialLayerVisibility,
        "sites-upstream": false
      })
    ).toBe(false);
  });
});

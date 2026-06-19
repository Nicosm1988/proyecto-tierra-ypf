import Globe from "globe.gl";
import { useEffect, useMemo, useRef } from "react";
import { typeMeta } from "../constants.js";

const initialView = {
  lat: -37.8,
  lng: -63.2,
  altitude: 1.8
};

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const value = Number.parseInt(clean, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function tooltip(site) {
  const meta = typeMeta[site.type];
  return `
    <div class="globe-tooltip">
      <strong>${site.name}</strong>
      <span>${meta.label} - ${site.region}</span>
      <em>${site.status}</em>
    </div>
  `;
}

export default function EarthGlobe({
  arcs,
  focusKey,
  onSelectSite,
  selectedSite,
  sites
}) {
  const containerRef = useRef(null);
  const globeRef = useRef(null);
  const selectedId = selectedSite?.id;

  const labelSites = useMemo(() => {
    return sites.filter((site) => site.priority === "alta" || site.id === selectedId);
  }, [selectedId, sites]);

  const ringSites = useMemo(() => {
    return sites.filter((site) => site.priority === "alta" || site.id === selectedId);
  }, [selectedId, sites]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const globe = Globe()(container)
      .backgroundColor("rgba(0,0,0,0)")
      .backgroundImageUrl("/assets/night-sky.png")
      .globeImageUrl("/assets/earth-night.jpg")
      .bumpImageUrl("/assets/earth-topology.png")
      .showAtmosphere(true)
      .atmosphereColor("#38bdf8")
      .atmosphereAltitude(0.18)
      .pointOfView(initialView, 0);

    globeRef.current = globe;

    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.38;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 210;
    controls.maxDistance = 620;

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      globe.width(Math.max(320, width));
      globe.height(Math.max(360, height));
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => {
      observer.disconnect();
      globe._destructor?.();
      globeRef.current = null;
      container.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) {
      return;
    }

    globe
      .pointsData(sites)
      .pointLat("lat")
      .pointLng("lng")
      .pointAltitude((site) => (site.id === selectedId ? 0.085 : 0.035))
      .pointRadius((site) => (site.id === selectedId ? 0.38 : 0.22))
      .pointResolution(18)
      .pointColor((site) => typeMeta[site.type].color)
      .pointLabel(tooltip)
      .onPointClick((site) => onSelectSite(site));
  }, [onSelectSite, selectedId, sites]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) {
      return;
    }

    globe
      .arcsData(arcs)
      .arcStartLat("startLat")
      .arcStartLng("startLng")
      .arcEndLat("endLat")
      .arcEndLng("endLng")
      .arcAltitude((arc) => 0.18 + arc.intensity * 0.22)
      .arcStroke((arc) => 0.35 + arc.intensity * 0.95)
      .arcColor((arc) => {
        const startColor = arc.kind === "decision" ? "#a78bfa" : "#38bdf8";
        const endColor = arc.kind === "exportacion" ? "#22c55e" : "#ff4d57";
        return [startColor, endColor];
      })
      .arcDashLength(0.44)
      .arcDashGap(0.78)
      .arcDashInitialGap(() => Math.random())
      .arcDashAnimateTime((arc) => 2600 + (1 - arc.intensity) * 2200);
  }, [arcs]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) {
      return;
    }

    globe
      .ringsData(ringSites)
      .ringLat("lat")
      .ringLng("lng")
      .ringAltitude(0.018)
      .ringMaxRadius((site) => (site.id === selectedId ? 5.5 : 3.3))
      .ringPropagationSpeed((site) => (site.id === selectedId ? 1.5 : 0.9))
      .ringRepeatPeriod((site) => (site.id === selectedId ? 900 : 1500))
      .ringColor((site) => {
        const color = typeMeta[site.type].color;
        return (t) => hexToRgba(color, 1 - t);
      });
  }, [ringSites, selectedId]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) {
      return;
    }

    globe
      .htmlElementsData(labelSites)
      .htmlLat("lat")
      .htmlLng("lng")
      .htmlAltitude((site) => (site.id === selectedId ? 0.105 : 0.06))
      .htmlElement((site) => {
        const marker = document.createElement("button");
        marker.className =
          site.id === selectedId ? "globe-label selected" : "globe-label";
        marker.type = "button";
        marker.textContent = site.shortName;
        marker.style.setProperty("--accent", typeMeta[site.type].color);
        marker.onclick = () => onSelectSite(site);
        return marker;
      });
  }, [labelSites, onSelectSite, selectedId]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !selectedSite) {
      return;
    }

    globe.pointOfView(
      {
        lat: selectedSite.lat,
        lng: selectedSite.lng,
        altitude: selectedSite.priority === "alta" ? 1.72 : 1.82
      },
      1100
    );
  }, [focusKey, selectedSite]);

  return (
    <div className="earth-globe" ref={containerRef}>
      <div className="globe-vignette" aria-hidden="true" />
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import EarthGlobe from "./globe/EarthGlobe.jsx";
import TopBar from "./components/TopBar.jsx";
import SidePanel from "./components/SidePanel.jsx";
import PremiumHud from "./components/hud/PremiumHud.jsx";
import sitesData from "./data/sites.json";
import arcsData from "./data/arcs.json";
import feedData from "./data/feed.json";
import toursData from "./data/camera-tours.json";
import {
  areArcsVisibleByLayers,
  isSiteVisibleByLayers,
  layerGroups
} from "./earth/layerRegistry.js";
import { useEarthStore } from "./store/useEarthStore.js";

function parseDay(value) {
  return new Date(`${value}T00:00:00`).getTime();
}

function buildArcs(sites, arcs) {
  const siteMap = new Map(sites.map((site) => [site.id, site]));

  return arcs
    .map((arc) => {
      const start = siteMap.get(arc.from);
      const end = siteMap.get(arc.to);

      if (!start || !end) {
        return null;
      }

      return {
        ...arc,
        startLat: start.lat,
        startLng: start.lng,
        endLat: end.lat,
        endLng: end.lng
      };
    })
    .filter(Boolean);
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeNav, setActiveNav] = useState("Radar");
  const [cameraState, setCameraState] = useState(null);
  const [selectedSite, setSelectedSite] = useState(sitesData[0]);
  const [focusKey, setFocusKey] = useState(0);
  const {
    activeTourId,
    cameraCommand,
    hudSection,
    layerVisibility,
    measurementMode,
    performanceMode,
    runCameraCommand,
    setHudSection,
    setLayerVisibility,
    stopTour,
    toggleLayer,
    toggleMeasurementMode,
    togglePerformanceMode
  } = useEarthStore();

  const visibleSites = useMemo(() => {
    return sitesData.filter((site) => {
      return isSiteVisibleByLayers(site, layerVisibility);
    });
  }, [layerVisibility]);

  const visibleSiteIds = useMemo(
    () => new Set(visibleSites.map((site) => site.id)),
    [visibleSites]
  );

  const visibleArcs = useMemo(() => {
    if (!areArcsVisibleByLayers(layerVisibility)) {
      return [];
    }

    return buildArcs(visibleSites, arcsData);
  }, [layerVisibility, visibleSites]);

  const visibleFeed = useMemo(() => {
    return feedData
      .filter((item) => visibleSiteIds.has(item.siteId))
      .sort((a, b) => parseDay(b.date) - parseDay(a.date));
  }, [visibleSiteIds]);

  const metrics = useMemo(() => {
    const regions = new Set(visibleSites.map((site) => site.region));
    const highPriority = visibleSites.filter((site) => site.priority === "alta").length;

    return {
      sites: visibleSites.length,
      news: visibleFeed.length,
      regions: regions.size,
      highPriority,
      arcs: visibleArcs.length
    };
  }, [visibleArcs.length, visibleFeed.length, visibleSites]);

  const siteMap = useMemo(() => {
    return new Map(sitesData.map((site) => [site.id, site]));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 2600);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!selectedSite || visibleSiteIds.has(selectedSite.id)) {
      return;
    }

    setSelectedSite(visibleSites[0] ?? null);
    setFocusKey((key) => key + 1);
  }, [selectedSite, visibleSiteIds, visibleSites]);

  function handleSelectSite(site) {
    setSelectedSite(site);
    setFocusKey((key) => key + 1);
  }

  function handleRunCameraCommand(type, payload) {
    if (type === "tour" && payload?.tour?.layers) {
      payload.tour.layers.forEach((layerId) => setLayerVisibility(layerId, true));
    }

    runCameraCommand(type, payload);
  }

  return (
    <main className="app-shell">
      {showSplash ? (
        <div className="earth-loading-screen" aria-label="Cargando ECOA Tierra">
          <div className="loading-stars" />
          <div className="loading-limb" />
          <div className="loading-brand">
            <strong>ECOA Tierra</strong>
            <p>Exploracion geoespacial energetica y ambiental</p>
            <span />
          </div>
        </div>
      ) : null}

      <TopBar activeNav={activeNav} metrics={metrics} onNavChange={setActiveNav} />

      <section className="workspace" aria-label="Radar territorial YPF">
        <div className="globe-stage">
          <EarthGlobe
            arcs={visibleArcs}
            cameraCommand={cameraCommand}
            focusKey={focusKey}
            layerVisibility={layerVisibility}
            onCameraStateChange={setCameraState}
            onSelectSite={handleSelectSite}
            performanceMode={performanceMode}
            selectedSite={selectedSite}
            sites={visibleSites}
          />

          <PremiumHud
            activeTourId={activeTourId}
            cameraState={cameraState}
            hudSection={hudSection}
            layerGroups={layerGroups}
            layerVisibility={layerVisibility}
            measurementMode={measurementMode}
            onRunCommand={handleRunCameraCommand}
            onSelectSite={handleSelectSite}
            onSetHudSection={setHudSection}
            onStopTour={stopTour}
            onToggleLayer={toggleLayer}
            onToggleMeasurement={toggleMeasurementMode}
            onTogglePerformance={togglePerformanceMode}
            performanceMode={performanceMode}
            selectedSite={selectedSite}
            sites={sitesData}
            tours={toursData}
          />
        </div>

        <SidePanel
          feed={visibleFeed}
          metrics={metrics}
          onSelectSite={handleSelectSite}
          selectedSite={selectedSite}
          siteMap={siteMap}
        />
      </section>
    </main>
  );
}

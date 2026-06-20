import { useEffect, useMemo, useState } from "react";
import TopBar from "./components/TopBar.jsx";
import EarthGlobe from "./globe/EarthGlobe.jsx";
import rvData from "./data/rv/rvData.json";
import {
  getEnabledLayerCount,
  isInfrastructureVisibleByLayers,
  layerGroups
} from "./earth/layerRegistry.js";
import { useEarthStore } from "./store/useEarthStore.js";

const allLayers = layerGroups.flatMap((group) => group.layers);

function toSelectableFeature(feature, kind) {
  return {
    ...feature,
    kind
  };
}

export default function App() {
  const [globeReady, setGlobeReady] = useState(false);
  const [minimumSplashDone, setMinimumSplashDone] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [cameraState, setCameraState] = useState(null);
  const [focusKey, setFocusKey] = useState(0);
  const [selectedFeature, setSelectedFeature] = useState(() =>
    toSelectableFeature(
      rvData.installations.find((item) => item.status === "En Construcción") ??
        rvData.installations[0],
      "installation"
    )
  );
  const {
    cameraCommand,
    layerVisibility,
    performanceMode,
    runCameraCommand,
    toggleLayer,
    togglePerformanceMode
  } = useEarthStore();

  const visibleInstallations = useMemo(() => {
    return rvData.installations
      .map((item) => toSelectableFeature(item, "installation"))
      .filter((feature) => isInfrastructureVisibleByLayers(feature, layerVisibility));
  }, [layerVisibility]);

  const visiblePipelines = useMemo(() => {
    return rvData.pipelines
      .map((item) => toSelectableFeature(item, "pipeline"))
      .filter((feature) => isInfrastructureVisibleByLayers(feature, layerVisibility));
  }, [layerVisibility]);

  const metrics = useMemo(() => {
    const construction = visiblePipelines.filter(
      (item) => item.status === "En Construcción"
    ).length;
    const project = visiblePipelines.filter((item) => item.status === "Proyecto").length;

    return {
      construction,
      enabledLayers: getEnabledLayerCount(layerVisibility),
      installations: visibleInstallations.length,
      pipelines: visiblePipelines.length,
      project,
      resolvedRoutes: rvData.summary.endpointsResolved,
      sourceFiles: rvData.sourceFiles.length
    };
  }, [layerVisibility, visibleInstallations.length, visiblePipelines]);

  useEffect(() => {
    const minimumTimer = window.setTimeout(() => setMinimumSplashDone(true), 1800);
    const fallbackTimer = window.setTimeout(() => setShowSplash(false), 7000);
    return () => {
      window.clearTimeout(minimumTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    if (globeReady && minimumSplashDone) {
      setShowSplash(false);
    }
  }, [globeReady, minimumSplashDone]);

  function handleSelectFeature(feature, shouldFocus = true) {
    setSelectedFeature(feature);
    if (shouldFocus) {
      setFocusKey((key) => key + 1);
    }
  }

  function handleRunCameraCommand(type, payload) {
    runCameraCommand(type, payload);
  }

  return (
    <main className="app-shell">
      {showSplash ? (
        <div className="earth-loading-screen" aria-label="Cargando YPF GeoEnergia 3D">
          <div className="loading-stars" />
          <div className="loading-orb" />
          <div className="loading-brand">
            <strong>YPF GeoEnergia 3D</strong>
            <p>Infraestructura gasifera, midstream y transporte territorial</p>
            <span />
          </div>
        </div>
      ) : null}

      <TopBar
        cameraState={cameraState}
        layers={allLayers}
        layerVisibility={layerVisibility}
        metrics={metrics}
        onRunCommand={handleRunCameraCommand}
        onToggleLayer={toggleLayer}
        onTogglePerformance={togglePerformanceMode}
        performanceMode={performanceMode}
        selectedFeature={selectedFeature}
      />

      <section className="workspace" aria-label="YPF GeoEnergia 3D">
        <div className="globe-stage">
          <EarthGlobe
            cameraCommand={cameraCommand}
            focusKey={focusKey}
            installations={visibleInstallations}
            layerVisibility={layerVisibility}
            onCameraStateChange={setCameraState}
            onReady={() => setGlobeReady(true)}
            onSelectFeature={handleSelectFeature}
            performanceMode={performanceMode}
            pipelines={visiblePipelines}
            selectedFeature={selectedFeature}
          />
        </div>
      </section>
    </main>
  );
}

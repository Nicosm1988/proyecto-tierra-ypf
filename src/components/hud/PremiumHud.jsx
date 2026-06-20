import { AnimatePresence, motion } from "motion/react";
import {
  Compass,
  Layers3,
  MapPinned,
  PanelRightOpen,
  Route,
  Search,
  Settings2
} from "lucide-react";
import { useMemo } from "react";
import { clsx } from "clsx";
import InfoDrawer from "./InfoDrawer.jsx";
import LayerPanel from "./LayerPanel.jsx";
import PerformanceBadge from "./PerformanceBadge.jsx";
import SearchCommand from "./SearchCommand.jsx";
import TourPanel from "./TourPanel.jsx";
import { getEnabledLayerCount } from "../../earth/layerRegistry.js";

const tabs = [
  { id: "search", label: "Buscar", icon: Search },
  { id: "layers", label: "Capas", icon: Layers3 },
  { id: "tours", label: "Tours", icon: Route },
  { id: "info", label: "Info", icon: PanelRightOpen },
  { id: "settings", label: "Visual", icon: Settings2 }
];

export default function PremiumHud({
  activeTourId,
  cameraState,
  hudSection,
  layerGroups,
  layerVisibility,
  measurementMode,
  onRunCommand,
  onSelectSite,
  onSetHudSection,
  onStopTour,
  onToggleLayer,
  onToggleMeasurement,
  onTogglePerformance,
  performanceMode,
  selectedSite,
  sites,
  tours
}) {
  const flatLayers = useMemo(
    () => layerGroups.flatMap((group) => group.layers),
    [layerGroups]
  );
  const enabledLayerCount = getEnabledLayerCount(layerVisibility);

  return (
    <aside className="premium-hud" aria-label="Centro de control geoespacial">
      <div className="hud-topline">
        <div>
          <strong>Mission control</strong>
          <span>{enabledLayerCount} capas activas · datos demo</span>
        </div>
        <PerformanceBadge
          onTogglePerformance={onTogglePerformance}
          performanceMode={performanceMode}
        />
      </div>

      <div className="hud-command-row" aria-label="Accesos de camara">
        <button onClick={() => onRunCommand("home")} type="button">
          <Compass aria-hidden="true" size={16} />
          <span>Vista global</span>
        </button>
        <button onClick={() => onRunCommand("argentina")} type="button">
          <MapPinned aria-hidden="true" size={16} />
          <span>Argentina</span>
        </button>
        <button
          onClick={() => {
            const site = sites.find((item) => item.id === "vaca-muerta");
            if (site) {
              onSelectSite(site);
              onRunCommand("site", { site });
            }
          }}
          type="button"
        >
          <MapPinned aria-hidden="true" size={16} />
          <span>Vaca Muerta</span>
        </button>
        <button
          onClick={() => {
            const tour = tours.find((item) => item.id === "vaca-muerta") ?? tours[0];
            if (tour) {
              onSetHudSection("tours");
              onRunCommand("tour", { tour });
            }
          }}
          type="button"
        >
          <Route aria-hidden="true" size={16} />
          <span>Tour YPF</span>
        </button>
      </div>

      <nav className="hud-tabs" aria-label="Secciones de HUD">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              className={clsx(hudSection === tab.id && "active")}
              key={tab.id}
              onClick={() => onSetHudSection(tab.id)}
              type="button"
            >
              <Icon aria-hidden="true" size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="hud-section"
          exit={{ opacity: 0, y: 8 }}
          initial={{ opacity: 0, y: 8 }}
          key={hudSection}
          transition={{ duration: 0.18 }}
        >
          {hudSection === "search" ? (
            <SearchCommand
              layers={flatLayers}
              onRunCommand={onRunCommand}
              onSelectSite={onSelectSite}
              onToggleLayer={onToggleLayer}
              sites={sites}
              tours={tours}
            />
          ) : null}

          {hudSection === "layers" ? (
            <LayerPanel
              layerGroups={layerGroups}
              layerVisibility={layerVisibility}
              onToggleLayer={onToggleLayer}
            />
          ) : null}

          {hudSection === "tours" ? (
            <TourPanel
              activeTourId={activeTourId}
              onRunCommand={onRunCommand}
              onStopTour={onStopTour}
              tours={tours}
            />
          ) : null}

          {hudSection === "info" ? (
            <InfoDrawer
              cameraState={cameraState}
              measurementMode={measurementMode}
              onToggleMeasurement={onToggleMeasurement}
              selectedSite={selectedSite}
            />
          ) : null}

          {hudSection === "settings" ? (
            <div className="hud-panel-stack">
              <section className="info-card">
                <h3>Configuracion visual</h3>
                <p>
                  Ajusta rendimiento y lectura de camara sin perder la navegacion Cesium 3D.
                </p>
                <button
                  className={
                    performanceMode ? "hud-inline-command active" : "hud-inline-command"
                  }
                  onClick={onTogglePerformance}
                  type="button"
                >
                  <Settings2 aria-hidden="true" size={16} />
                  <span>
                    {performanceMode ? "Performance activo" : "Activar performance"}
                  </span>
                </button>
                <button
                  className={
                    measurementMode ? "hud-inline-command active" : "hud-inline-command"
                  }
                  onClick={onToggleMeasurement}
                  type="button"
                >
                  <PanelRightOpen aria-hidden="true" size={16} />
                  <span>{measurementMode ? "Medicion activa" : "Activar medicion"}</span>
                </button>
              </section>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}

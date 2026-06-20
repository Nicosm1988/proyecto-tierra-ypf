import {
  Activity,
  Construction,
  Database,
  Gauge,
  Globe2,
  Home,
  Layers3,
  MapPinned,
  Pipette,
  RadioTower,
  Route,
  Satellite,
  Settings2
} from "lucide-react";

const layerIcons = {
  admin0: Globe2,
  admin1: MapPinned,
  "rv-installations": RadioTower,
  "rv-midstream-construction": Construction,
  "rv-midstream-project": Route,
  "rv-ypf-pipelines": Pipette,
  "rv-transport-pipelines": Layers3
};

function formatHeight(value) {
  if (!Number.isFinite(value)) {
    return "sin lectura";
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} Mm`;
  }

  if (value >= 1_000) {
    return `${Math.round(value / 1_000)} km`;
  }

  return `${Math.round(value)} m`;
}

function selectedLabel(feature) {
  if (!feature) {
    return "Sin seleccion";
  }

  if (feature.kind === "pipeline") {
    return `${feature.name} - ${feature.status}`;
  }

  return `${feature.name} - ${feature.type}`;
}

export default function TopBar({
  cameraState,
  layers,
  layerVisibility,
  metrics,
  onRunCommand,
  onToggleLayer,
  onTogglePerformance,
  performanceMode,
  selectedFeature
}) {
  return (
    <header className="top-bar mission-top">
      <div className="brand-lockup" aria-label="YPF GeoEnergia 3D">
        <div className="brand-mark">
          <span>YPF</span>
        </div>
        <div className="brand-title">
          <strong>YPF GeoEnergia 3D</strong>
          <span>Mapa inmersivo de infraestructura gasifera y midstream</span>
        </div>
      </div>

      <section className="mission-strip" aria-label="Mission Control">
        <div className="mission-heading">
          <div>
            <strong>Mission Control</strong>
            <span>{selectedLabel(selectedFeature)}</span>
          </div>
          <div className="mission-metrics" aria-label="Metricas de datos">
            <span>
              <Database aria-hidden="true" size={14} />
              {metrics.sourceFiles} CSV
            </span>
            <span>
              <Route aria-hidden="true" size={14} />
              {metrics.pipelines} ductos
            </span>
            <span>
              <RadioTower aria-hidden="true" size={14} />
              {metrics.installations} puntos
            </span>
            <span>
              <Gauge aria-hidden="true" size={14} />
              {formatHeight(cameraState?.height)}
            </span>
          </div>
        </div>

        <div className="mission-actions" aria-label="Comandos de camara">
          <button onClick={() => onRunCommand("home")} type="button">
            <Home aria-hidden="true" size={16} />
            <span>Tierra completa</span>
          </button>
          <button
            onClick={() =>
              onRunCommand("frame", {
                heading: 0,
                height: 720_000,
                lat: -38.38,
                lng: -68.72,
                pitch: -90
              })
            }
            type="button"
          >
            <MapPinned aria-hidden="true" size={16} />
            <span>Vaca Muerta</span>
          </button>
          <button
            onClick={() =>
              onRunCommand("frame", {
                heading: 0,
                height: 95_000,
                lat: -38.38,
                lng: -68.72,
                pitch: -72
              })
            }
            type="button"
          >
            <Satellite aria-hidden="true" size={16} />
            <span>Anelo operativo</span>
          </button>
          <button
            onClick={() =>
              onRunCommand("frame", {
                heading: 0,
                height: 2_800_000,
                lat: -37.65,
                lng: -65.4,
                pitch: -72
              })
            }
            type="button"
          >
            <Activity aria-hidden="true" size={16} />
            <span>Tratayen - Saliquelo</span>
          </button>
          <button
            className={performanceMode ? "active" : ""}
            onClick={onTogglePerformance}
            type="button"
          >
            <Settings2 aria-hidden="true" size={16} />
            <span>{performanceMode ? "Performance" : "Max calidad"}</span>
          </button>
        </div>

        <div className="layer-ribbon" aria-label="Filtros de capas">
          {layers.map((layer) => {
            const Icon = layerIcons[layer.id] ?? Layers3;
            const isActive = layerVisibility[layer.id] !== false;
            return (
              <button
                aria-pressed={isActive}
                className={isActive ? "layer-chip active" : "layer-chip"}
                key={layer.id}
                onClick={() => onToggleLayer(layer.id)}
                title={`${layer.label} - ${layer.source}`}
                type="button"
              >
                <Icon aria-hidden="true" size={15} />
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="partner-lockup" aria-label="Cobertura YPF">
        <div className="partner-chip">
          <Globe2 aria-hidden="true" size={18} />
          <span>{metrics.enabledLayers}</span>
        </div>
        <strong>YPF</strong>
      </div>
    </header>
  );
}

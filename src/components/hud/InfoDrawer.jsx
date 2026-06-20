import { Crosshair, Database, MapPin } from "lucide-react";
import { typeMeta } from "../../constants.js";
import { formatCameraHeight, formatCoordinate } from "../../utils/format.js";

export default function InfoDrawer({
  cameraState,
  measurementMode,
  onToggleMeasurement,
  selectedSite
}) {
  return (
    <div className="hud-panel-stack">
      <section className="info-card">
        <div className="info-card-heading">
          <MapPin aria-hidden="true" size={17} />
          <span>Activo seleccionado</span>
        </div>
        {selectedSite ? (
          <>
            <h3>{selectedSite.name}</h3>
            <p>{selectedSite.summary}</p>
            <dl>
              <div>
                <dt>Tipo</dt>
                <dd>{typeMeta[selectedSite.type].label}</dd>
              </div>
              <div>
                <dt>Estado dato</dt>
                <dd>demo</dd>
              </div>
              <div>
                <dt>Latitud</dt>
                <dd>{formatCoordinate(selectedSite.lat)}</dd>
              </div>
              <div>
                <dt>Longitud</dt>
                <dd>{formatCoordinate(selectedSite.lng)}</dd>
              </div>
            </dl>
          </>
        ) : (
          <p>Selecciona un marcador demo para ver coordenadas, fuente y estado.</p>
        )}
      </section>

      <section className="info-card">
        <div className="info-card-heading">
          <Crosshair aria-hidden="true" size={17} />
          <span>Mediciones base</span>
        </div>
        <dl>
          <div>
            <dt>Altura camara</dt>
            <dd>{formatCameraHeight(cameraState?.height)}</dd>
          </div>
          <div>
            <dt>Centro lat/lon</dt>
            <dd>
              {formatCoordinate(cameraState?.lat)} / {formatCoordinate(cameraState?.lng)}
            </dd>
          </div>
        </dl>
        <button
          aria-pressed={measurementMode}
          className={measurementMode ? "hud-inline-command active" : "hud-inline-command"}
          onClick={onToggleMeasurement}
          type="button"
        >
          <Database aria-hidden="true" size={16} />
          <span>{measurementMode ? "Lectura activa" : "Activar lectura"}</span>
        </button>
      </section>
    </div>
  );
}

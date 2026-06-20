import { CheckCircle2, Circle } from "lucide-react";

export default function LayerPanel({ layerGroups, layerVisibility, onToggleLayer }) {
  return (
    <div className="hud-panel-stack" aria-label="Capas geograficas">
      {layerGroups.map((group) => (
        <section className="hud-layer-group" key={group.id}>
          <div>
            <h3>{group.label}</h3>
            <p>{group.description}</p>
          </div>
          <div className="hud-layer-list">
            {group.layers.map((layer) => {
              const checked = layerVisibility[layer.id] !== false;
              return (
                <button
                  aria-pressed={checked}
                  className={checked ? "hud-layer active" : "hud-layer"}
                  key={layer.id}
                  onClick={() => onToggleLayer(layer.id)}
                  type="button"
                >
                  {checked ? (
                    <CheckCircle2 aria-hidden="true" size={16} />
                  ) : (
                    <Circle aria-hidden="true" size={16} />
                  )}
                  <span>{layer.label}</span>
                  <em>{layer.source}</em>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

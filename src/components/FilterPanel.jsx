import { ChevronDown, Filter, RotateCcw } from "lucide-react";
import { typeMeta } from "../constants.js";

export default function FilterPanel({
  activeTypes,
  dateRange,
  isOpen,
  metrics,
  onDateChange,
  onReset,
  onToggleOpen,
  onToggleType
}) {
  return (
    <aside className={isOpen ? "filter-panel open" : "filter-panel"}>
      <button className="filter-heading" onClick={onToggleOpen} type="button">
        <Filter aria-hidden="true" size={20} />
        <span>FILTROS</span>
        <ChevronDown aria-hidden="true" size={18} />
      </button>

      {isOpen ? (
        <div className="filter-body">
          <div className="filter-stat-row">
            <strong>{metrics.sites}</strong>
            <span>activos visibles</span>
          </div>

          <div className="filter-grid" role="group" aria-label="Tipos de activo">
            {Object.entries(typeMeta).map(([type, meta]) => {
              const checked = activeTypes.includes(type);
              return (
                <label className="check-row" key={type}>
                  <input
                    checked={checked}
                    onChange={() => onToggleType(type)}
                    type="checkbox"
                  />
                  <span style={{ "--accent": meta.color }} />
                  <em>{meta.label}</em>
                </label>
              );
            })}
          </div>

          <div className="filter-date-grid">
            <label>
              <span>Desde</span>
              <input
                max={dateRange.to}
                onChange={(event) =>
                  onDateChange((current) => ({
                    ...current,
                    from: event.target.value
                  }))
                }
                type="date"
                value={dateRange.from}
              />
            </label>
            <label>
              <span>Hasta</span>
              <input
                min={dateRange.from}
                onChange={(event) =>
                  onDateChange((current) => ({
                    ...current,
                    to: event.target.value
                  }))
                }
                type="date"
                value={dateRange.to}
              />
            </label>
          </div>

          <button className="ghost-command" onClick={onReset} type="button">
            <RotateCcw aria-hidden="true" size={16} />
            <span>Restablecer</span>
          </button>
        </div>
      ) : null}
    </aside>
  );
}

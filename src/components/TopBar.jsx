import { Crosshair, Globe2, Radar, Search, Sparkles, Users } from "lucide-react";
import { navItems } from "../constants.js";

const iconMap = {
  Radar,
  Hallazgos: Search,
  "Hechos futuros": Sparkles,
  "Action board": Crosshair,
  Players: Users
};

export default function TopBar({ activeNav, metrics, onNavChange }) {
  return (
    <header className="top-bar">
      <div className="brand-lockup" aria-label="ECOA estrategia co-aumentada">
        <div className="brand-mark">
          <span>ECOA</span>
        </div>
        <div className="brand-title">
          <strong>ESTRATEGIA</strong>
          <strong>CO-AUMENTADA</strong>
        </div>
      </div>

      <nav className="nav-tabs" aria-label="Vistas">
        {navItems.map((item) => {
          const Icon = iconMap[item];
          return (
            <button
              className={item === activeNav ? "nav-tab active" : "nav-tab"}
              key={item}
              onClick={() => onNavChange(item)}
              title={item}
              type="button"
            >
              <Icon aria-hidden="true" size={20} />
              <span>{item}</span>
            </button>
          );
        })}
      </nav>

      <div className="top-actions">
        <div className="partner-lockup" aria-label="YPF">
          <div className="partner-chip">
            <Globe2 aria-hidden="true" size={18} />
            <span>{metrics.regions}</span>
          </div>
          <strong>YPF</strong>
        </div>
      </div>
    </header>
  );
}

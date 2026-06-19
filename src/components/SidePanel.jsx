import {
  Activity,
  AlertTriangle,
  Clock3,
  FileText,
  MapPin,
  Newspaper,
  Radio,
  Route
} from "lucide-react";
import MetricPill from "./MetricPill.jsx";
import { priorityMeta, typeMeta } from "../constants.js";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

function formatDate(value) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

export default function SidePanel({
  feed,
  metrics,
  onSelectSite,
  selectedSite,
  siteMap
}) {
  return (
    <aside className="side-panel" aria-label="Feed y detalle">
      <section className="live-summary">
        <div className="section-title">
          <Radio aria-hidden="true" size={18} />
          <h2>FEED EN VIVO</h2>
        </div>
        <div className="metric-grid">
          <MetricPill icon={Newspaper} label="noticias" tone="blue" value={metrics.news} />
          <MetricPill icon={MapPin} label="regiones" tone="green" value={metrics.regions} />
          <MetricPill
            icon={AlertTriangle}
            label="criticas"
            tone="amber"
            value={metrics.highPriority}
          />
          <MetricPill icon={Route} label="flujos" tone="violet" value={metrics.arcs} />
        </div>
      </section>

      {selectedSite ? (
        <section className="selected-detail">
          <div className="detail-kicker">
            <span style={{ "--accent": typeMeta[selectedSite.type].color }} />
            <em>{typeMeta[selectedSite.type].label}</em>
          </div>
          <h2>{selectedSite.name}</h2>
          <p>{selectedSite.summary}</p>
          <dl>
            <div>
              <dt>{selectedSite.metricLabel}</dt>
              <dd>{selectedSite.metricValue}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>{selectedSite.status}</dd>
            </div>
          </dl>
          <div className="tag-row">
            {selectedSite.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </section>
      ) : null}

      <section className="feed-list" aria-label="Noticias">
        {feed.map((item) => {
          const site = siteMap.get(item.siteId);
          const priority = priorityMeta[item.priority];
          return (
            <article className="feed-card" key={item.id}>
              <button
                onClick={() => site && onSelectSite(site)}
                style={{ "--accent": priority.color }}
                type="button"
              >
                <div className="feed-card-head">
                  <span
                    className="category-badge"
                    style={{ "--accent": priority.color }}
                  >
                    {item.category}
                  </span>
                  <Activity aria-hidden="true" size={17} />
                </div>
                <h3>{item.title}</h3>
                <div className="feed-meta">
                  <span>
                    <MapPin aria-hidden="true" size={15} />
                    {site?.region ?? item.country}
                  </span>
                  <span>
                    <Clock3 aria-hidden="true" size={15} />
                    {formatDate(item.date)}
                  </span>
                </div>
                <div className="feed-source">
                  <FileText aria-hidden="true" size={15} />
                  <span>{item.source}</span>
                </div>
                <div className="tag-row">
                  {item.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </button>
            </article>
          );
        })}
      </section>
    </aside>
  );
}

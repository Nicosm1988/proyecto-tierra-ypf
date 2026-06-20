import { useEffect, useMemo, useState } from "react";
import EarthGlobe from "./globe/EarthGlobe.jsx";
import TopBar from "./components/TopBar.jsx";
import FilterPanel from "./components/FilterPanel.jsx";
import SidePanel from "./components/SidePanel.jsx";
import sitesData from "./data/sites.json";
import arcsData from "./data/arcs.json";
import feedData from "./data/feed.json";
import { typeMeta } from "./constants.js";

const initialDateRange = {
  from: "2026-05-20",
  to: "2026-06-19"
};

const allTypes = Object.keys(typeMeta);

function parseDay(value) {
  return new Date(`${value}T00:00:00`).getTime();
}

function isInsideRange(value, dateRange) {
  const current = parseDay(value);
  return current >= parseDay(dateRange.from) && current <= parseDay(dateRange.to);
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
  const [activeNav, setActiveNav] = useState("Radar");
  const [activeTypes, setActiveTypes] = useState(allTypes);
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState(sitesData[0]);
  const [focusKey, setFocusKey] = useState(0);

  const visibleSites = useMemo(() => {
    return sitesData.filter((site) => {
      return activeTypes.includes(site.type) && isInsideRange(site.date, dateRange);
    });
  }, [activeTypes, dateRange]);

  const visibleSiteIds = useMemo(
    () => new Set(visibleSites.map((site) => site.id)),
    [visibleSites]
  );

  const visibleArcs = useMemo(() => buildArcs(visibleSites, arcsData), [visibleSites]);

  const visibleFeed = useMemo(() => {
    return feedData
      .filter((item) => visibleSiteIds.has(item.siteId))
      .filter((item) => isInsideRange(item.date, dateRange))
      .sort((a, b) => parseDay(b.date) - parseDay(a.date));
  }, [dateRange, visibleSiteIds]);

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

  function handleToggleType(type) {
    setActiveTypes((current) => {
      if (current.includes(type)) {
        return current.filter((item) => item !== type);
      }

      return [...current, type];
    });
  }

  function handleResetFilters() {
    setActiveTypes(allTypes);
    setDateRange(initialDateRange);
  }

  return (
    <main className="app-shell">
      <TopBar
        activeNav={activeNav}
        dateRange={dateRange}
        metrics={metrics}
        onDateChange={setDateRange}
        onNavChange={setActiveNav}
      />

      <section className="workspace" aria-label="Radar territorial YPF">
        <div className="globe-stage">
          <FilterPanel
            activeTypes={activeTypes}
            dateRange={dateRange}
            isOpen={filtersOpen}
            metrics={metrics}
            onDateChange={setDateRange}
            onReset={handleResetFilters}
            onToggleOpen={() => setFiltersOpen((value) => !value)}
            onToggleType={handleToggleType}
          />

          <EarthGlobe
            arcs={visibleArcs}
            focusKey={focusKey}
            onSelectSite={handleSelectSite}
            selectedSite={selectedSite}
            sites={visibleSites}
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

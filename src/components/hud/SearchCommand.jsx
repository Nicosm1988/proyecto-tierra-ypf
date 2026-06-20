import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export default function SearchCommand({
  layers,
  onRunCommand,
  onSelectSite,
  onToggleLayer,
  sites,
  tours
}) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("es-AR");

  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const results = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    const siteResults = sites
      .filter((site) =>
        [site.name, site.shortName, site.region, site.type]
          .join(" ")
          .toLocaleLowerCase("es-AR")
          .includes(normalizedQuery)
      )
      .slice(0, 4)
      .map((site) => ({
        id: `site-${site.id}`,
        label: site.name,
        meta: `${site.region} · demo`,
        onSelect: () => {
          onSelectSite(site);
          onRunCommand("site", { site });
          setQuery("");
        }
      }));

    const tourResults = tours
      .filter((tour) =>
        [tour.name, tour.summary]
          .join(" ")
          .toLocaleLowerCase("es-AR")
          .includes(normalizedQuery)
      )
      .slice(0, 3)
      .map((tour) => ({
        id: `tour-${tour.id}`,
        label: tour.name,
        meta: "Recorrido",
        onSelect: () => {
          onRunCommand("tour", { tour });
          setQuery("");
        }
      }));

    const layerResults = layers
      .filter((layer) =>
        [layer.label, layer.category, layer.source]
          .join(" ")
          .toLocaleLowerCase("es-AR")
          .includes(normalizedQuery)
      )
      .slice(0, 3)
      .map((layer) => ({
        id: `layer-${layer.id}`,
        label: layer.label,
        meta: "Capa",
        onSelect: () => {
          onToggleLayer(layer.id);
          setQuery("");
        }
      }));

    return [...siteResults, ...tourResults, ...layerResults].slice(0, 8);
  }, [layers, normalizedQuery, onRunCommand, onSelectSite, onToggleLayer, sites, tours]);

  return (
    <div className="search-command">
      <Search aria-hidden="true" size={17} />
      <input
        aria-label="Buscar lugares, capas o recorridos"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar lugar, capa o tour"
        ref={inputRef}
        type="search"
        value={query}
      />
      <kbd>Ctrl K</kbd>

      {results.length > 0 ? (
        <div className="search-results">
          {results.map((result) => (
            <button key={result.id} onClick={result.onSelect} type="button">
              <strong>{result.label}</strong>
              <span>{result.meta}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export const layerGroups = [
  {
    id: "territorio",
    label: "Territorio",
    description: "Fronteras politicas, jurisdicciones y lectura administrativa.",
    layers: [
      {
        id: "admin0",
        label: "Fronteras politicas",
        source: "Natural Earth demo",
        category: "territorio",
        defaultVisible: true
      },
      {
        id: "admin1",
        label: "Divisiones jurisdiccionales",
        source: "Natural Earth demo",
        category: "territorio",
        defaultVisible: true
      }
    ]
  },
  {
    id: "energia",
    label: "Energia",
    description: "Activos energeticos y puntos de decision demo.",
    layers: [
      {
        id: "sites-upstream",
        label: "Vaca Muerta",
        source: "ECOA demo",
        category: "energia",
        defaultVisible: true
      },
      {
        id: "sites-refining",
        label: "Refinerias demo",
        source: "ECOA demo",
        category: "energia",
        defaultVisible: true
      },
      {
        id: "sites-renewables",
        label: "Renovables demo",
        source: "ECOA demo",
        category: "energia",
        defaultVisible: true
      }
    ]
  },
  {
    id: "infraestructura",
    label: "Infraestructura",
    description: "Terminales, ductos y flujos logisticos demo.",
    layers: [
      {
        id: "sites-logistics",
        label: "Terminales y ductos",
        source: "ECOA demo",
        category: "infraestructura",
        defaultVisible: true
      },
      {
        id: "arcs-logistics",
        label: "Rutas logisticas",
        source: "ECOA demo",
        category: "infraestructura",
        defaultVisible: true
      }
    ]
  },
  {
    id: "ambiente",
    label: "Ambiente",
    description: "Zonas sensibles y lectura ambiental demo.",
    layers: [
      {
        id: "environmental-zones",
        label: "Zonas ambientales demo",
        source: "ECOA demo",
        category: "ambiente",
        defaultVisible: true
      }
    ]
  },
  {
    id: "demo-ypf",
    label: "Demo YPF",
    description: "Marcadores institucionales no oficiales.",
    layers: [
      {
        id: "institutional",
        label: "Marcadores institucionales",
        source: "ECOA demo",
        category: "demo",
        defaultVisible: true
      }
    ]
  }
];

export const initialLayerVisibility = Object.fromEntries(
  layerGroups.flatMap((group) =>
    group.layers.map((layer) => [layer.id, layer.defaultVisible !== false])
  )
);

export const siteTypeLayerId = {
  energia: "sites-renewables",
  logistica: "sites-logistics",
  oficina: "institutional",
  refineria: "sites-refining",
  terminal: "sites-logistics",
  upstream: "sites-upstream"
};

export function getLayerById(layerId) {
  return layerGroups.flatMap((group) => group.layers).find((layer) => layer.id === layerId);
}

export function isLayerEnabled(layerVisibility, layerId) {
  return layerVisibility?.[layerId] !== false;
}

export function isSiteVisibleByLayers(site, layerVisibility) {
  return isLayerEnabled(layerVisibility, siteTypeLayerId[site.type] ?? "institutional");
}

export function areArcsVisibleByLayers(layerVisibility) {
  return isLayerEnabled(layerVisibility, "arcs-logistics");
}

export function getEnabledLayerCount(layerVisibility) {
  return Object.values(layerVisibility).filter(Boolean).length;
}

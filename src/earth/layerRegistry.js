export const layerGroups = [
  {
    id: "territorio",
    label: "Territorio",
    description: "Fronteras politicas y jurisdicciones provinciales.",
    layers: [
      {
        id: "admin0",
        label: "Fronteras",
        source: "Natural Earth",
        category: "territorio",
        defaultVisible: true
      },
      {
        id: "admin1",
        label: "Jurisdicciones",
        source: "Natural Earth",
        category: "territorio",
        defaultVisible: true
      }
    ]
  },
  {
    id: "infraestructura-real",
    label: "Infraestructura energetica",
    description: "Capas construidas desde rvpruebamapa.zip.",
    layers: [
      {
        id: "rv-installations",
        label: "Instalaciones",
        source: "rvpruebamapa.zip",
        category: "puntos",
        defaultVisible: true
      },
      {
        id: "rv-midstream-construction",
        label: "En construccion",
        source: "rvpruebamapa.zip",
        category: "ductos",
        defaultVisible: true
      },
      {
        id: "rv-midstream-project",
        label: "Midstream proyecto",
        source: "rvpruebamapa.zip",
        category: "ductos",
        defaultVisible: true
      },
      {
        id: "rv-ypf-pipelines",
        label: "Ductos YPF",
        source: "rvpruebamapa.zip",
        category: "ductos",
        defaultVisible: true
      },
      {
        id: "rv-transport-pipelines",
        label: "Transporte gas",
        source: "rvpruebamapa.zip",
        category: "ductos",
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

export function getLayerById(layerId) {
  return layerGroups.flatMap((group) => group.layers).find((layer) => layer.id === layerId);
}

export function isLayerEnabled(layerVisibility, layerId) {
  return layerVisibility?.[layerId] !== false;
}

export function isInfrastructureVisibleByLayers(feature, layerVisibility) {
  return isLayerEnabled(layerVisibility, feature.layerId);
}

export function getEnabledLayerCount(layerVisibility) {
  return Object.values(layerVisibility).filter(Boolean).length;
}

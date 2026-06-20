const coordinateFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 4,
  minimumFractionDigits: 2
});

const meterFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 0
});

export function formatCoordinate(value) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  return coordinateFormatter.format(value);
}

export function formatCameraHeight(value) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  if (value >= 1_000_000) {
    return `${meterFormatter.format(value / 1_000_000)} Mm`;
  }

  if (value >= 1_000) {
    return `${meterFormatter.format(value / 1_000)} km`;
  }

  return `${meterFormatter.format(value)} m`;
}

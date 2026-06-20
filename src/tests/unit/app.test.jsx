import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "../../App.jsx";

vi.mock("../../globe/EarthGlobe.jsx", () => ({
  default: function MockEarthGlobe() {
    return <div data-testid="earth-viewer">Earth viewer</div>;
  }
}));

describe("App", () => {
  it("renders the geospatial shell, layer controls and Cesium placeholder", () => {
    render(<App />);

    expect(screen.getAllByText("YPF GeoEnergia 3D").length).toBeGreaterThan(0);
    expect(screen.getByText("Mission Control")).toBeInTheDocument();
    expect(screen.getByText("Tierra completa")).toBeInTheDocument();
    expect(screen.getByText("Ductos YPF")).toBeInTheDocument();
    expect(screen.getByTestId("earth-viewer")).toBeInTheDocument();
  });
});

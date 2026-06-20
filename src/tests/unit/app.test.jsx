import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "../../App.jsx";

vi.mock("../../globe/EarthGlobe.jsx", () => ({
  default: function MockEarthGlobe() {
    return <div data-testid="earth-viewer">Earth viewer</div>;
  }
}));

describe("App", () => {
  it("renders the premium shell, HUD and Cesium placeholder", () => {
    render(<App />);

    expect(screen.getByText("ESTRATEGIA")).toBeInTheDocument();
    expect(screen.getByText("Mission control")).toBeInTheDocument();
    expect(screen.getByText("Vista global")).toBeInTheDocument();
    expect(screen.getByTestId("earth-viewer")).toBeInTheDocument();
  });
});

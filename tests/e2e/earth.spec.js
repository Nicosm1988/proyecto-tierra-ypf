import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.errors = errors;
});

test("loads the YPF geospatial experience", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/YPF GeoEnergia 3D/);
  await expect(page.getByLabel("Cargando YPF GeoEnergia 3D")).toBeHidden({
    timeout: 8_000
  });
  const missionControl = page.getByLabel("Mission Control");
  await expect(missionControl).toBeVisible();
  await expect(
    missionControl.getByRole("button", { name: /Tierra completa/i })
  ).toBeVisible();
  await expect(page.locator(".cesium-widget canvas")).toBeVisible();
  expect(page.errors).toEqual([]);
});

test("toggles real infrastructure layers", async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile",
    "Mobile shell coverage is handled by the load test; this interaction uses desktop controls."
  );

  await page.goto("/");
  await expect(page.getByLabel("Cargando YPF GeoEnergia 3D")).toBeHidden({
    timeout: 8_000
  });

  const ductosYpf = page.locator(".layer-chip").filter({ hasText: "Ductos YPF" });
  await ductosYpf.dispatchEvent("click");
  await expect(ductosYpf).toHaveAttribute("aria-pressed", "false");
  await ductosYpf.dispatchEvent("click");
  await expect(ductosYpf).toHaveAttribute("aria-pressed", "true");
  await page
    .getByLabel("Mission Control")
    .getByRole("button", { name: /Vaca Muerta/i })
    .dispatchEvent("click");
  await expect(page.locator(".cesium-widget-errorPanel")).toHaveCount(0);
  expect(page.errors).toEqual([]);
});

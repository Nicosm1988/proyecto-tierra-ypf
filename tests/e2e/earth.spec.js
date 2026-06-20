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

test("loads the premium Earth experience", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/ECOA Tierra YPF/);
  await expect(page.getByLabel("Cargando ECOA Tierra")).toBeHidden({ timeout: 8_000 });
  await expect(page.getByLabel("Centro de control geoespacial")).toBeVisible();
  await expect(page.getByRole("button", { name: /Vista global/i })).toBeVisible();
  await expect(page.locator(".cesium-widget canvas")).toBeVisible();
  expect(page.errors).toEqual([]);
});

test("toggles a layer and starts a tour", async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile",
    "Mobile shell coverage is handled by the load test; this interaction uses desktop HUD space."
  );

  await page.goto("/");
  await expect(page.getByLabel("Cargando ECOA Tierra")).toBeHidden({ timeout: 8_000 });

  await page.getByRole("button", { name: /Fronteras politicas/i }).click();
  await expect(page.getByRole("button", { name: /Fronteras politicas/i })).toHaveAttribute(
    "aria-pressed",
    "false"
  );

  await page.getByRole("button", { name: /Tour YPF/i }).click({ force: true });
  await expect(page.getByRole("button", { name: /Pausar/i }).first()).toBeVisible();
  expect(page.errors).toEqual([]);
});

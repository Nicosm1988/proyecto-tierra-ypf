import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("has no critical accessibility violations in the application shell", async ({
  page
}, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile",
    "Desktop accessibility shell covers semantic regressions; mobile layout is covered by E2E load."
  );

  await page.goto("/");
  await expect(page.getByLabel("Cargando ECOA Tierra")).toBeHidden({ timeout: 8_000 });

  const results = await new AxeBuilder({ page })
    .exclude(".cesium-widget")
    .exclude(".cesium-credit-shelf")
    .analyze();
  const critical = results.violations.filter(
    (violation) => violation.impact === "critical" || violation.impact === "serious"
  );

  expect(critical).toEqual([]);
});

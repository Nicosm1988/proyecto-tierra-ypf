import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  workers: 2,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL: "http://127.0.0.1:5173",
    channel: "chrome",
    trace: "retain-on-failure"
  },
  webServer: {
    command: "npm run dev -- --port 5173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    url: "http://127.0.0.1:5173"
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome"
      }
    },
    {
      name: "mobile",
      use: {
        ...devices["Pixel 5"],
        channel: "chrome"
      }
    }
  ]
});

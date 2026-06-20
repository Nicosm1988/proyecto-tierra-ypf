import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/tests/unit/**/*.{test,spec}.{js,jsx}"],
    setupFiles: ["./src/tests/setup.js"]
  }
});

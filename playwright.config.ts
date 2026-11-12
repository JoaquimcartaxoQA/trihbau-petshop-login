import { defineConfig, devices } from "@playwright/test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.TRIHBAU_DB_PATH ??= join(mkdtempSync(join(tmpdir(), "trihbau-playwright-")), "test.db");

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:15176",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "npm run dev -- --host 127.0.0.1 --port 15176 --strictPort",
      url: "http://127.0.0.1:15176",
      env: { VITE_API_URL: "http://127.0.0.1:15301" },
      reuseExistingServer: false,
    },
    {
      command: "node server/index.js",
      url: "http://127.0.0.1:15301/health",
      env: { TRIHBAU_PORT: "15301", TRIHBAU_HOST: "127.0.0.1" },
      reuseExistingServer: false,
    },
  ],
});

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  use: {
    headless: true,
    viewport: { width: 375, height: 667 },
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'Mobile Safari',
      use: devices['iPhone SE'],
    },
    {
      name: 'Pixel Fold',
      use: devices['Pixel 7'],
    },
  ],
}); 
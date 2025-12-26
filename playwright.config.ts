import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    headless: true
  },
  webServer: {
    command: 'npm run dev -- --host 0.0.0.0 --port 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000
  }
});

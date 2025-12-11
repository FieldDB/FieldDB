// Playwright Test configuration (best practices)
// See https://playwright.dev/docs/test-configuration
// This file configures retries, reporters, tracing, screenshots, and baseURL.

// eslint-disable-next-line import/no-extraneous-dependencies
const { defineConfig, devices } = require('@playwright/test');

const { BASE_URL = '', HEADLESS = '', PORT = '3188' } = process.env;

module.exports = defineConfig({
  // General
  testDir: './test',
  /* Maximum time one test can run for. */
  timeout: 35000,
  /* Fail the build on CI if you accidentally left test.only in the source. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on macOS if flakiness observed */
  workers: process.env.CI ? undefined : undefined,
  /* Reporter */
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  // Configure slow test reporting
  reportSlowTests: {
    max: 5, // Maximum number of slow test files to report (defaults to 5)
    // Test file duration in milliseconds that is considered slow
    threshold: 5000,
  },

  // Shared options for all projects
  use: {
    // If BASE_URL is not provided, default to the webServer URL
    baseURL: BASE_URL || `https://localhost:${PORT}`,
    headless: HEADLESS ? HEADLESS !== 'false' : true,
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    // Persist traces for all tests to aid debugging.
    trace: 'retain-on-failure',
  },

  // Browser coverage
  projects: [
    {
      name: 'Chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'Firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'WebKit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Optional: start a dev server before running tests
  // Uncomment and adjust to your app if needed.
  webServer: !BASE_URL ? {
    // Pipe server stdout/stderr to a log file you can tail while tests run.
    command: 'cd ../backbone_client && npm run start 2>&1 | tee -a ../test-e2e/webserver.log',
    // Use port-based readiness check to avoid HTTPS certificate validation during probing.
    port: Number(PORT),
    reuseExistingServer: !process.env.CI,
    timeout: 10000,
    env: {
      PORT,
      ...process.env,
    }, // Pass all current process.env variables
    // Note: Playwright buffers webServer output; tee ensures logs go to a file.
  } : undefined,
});

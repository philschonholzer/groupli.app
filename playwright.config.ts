import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

// Load test environment variables if available
const testEnvPath = path.join(__dirname, 'e2e', '.test-env.json')
if (existsSync(testEnvPath)) {
	const testEnv = JSON.parse(readFileSync(testEnvPath, 'utf-8'))
	Object.assign(process.env, testEnv)
}

// Set required environment variables for e2e tests
process.env.DB_URL = process.env.DB_URL || 'data.sqlite'
process.env.OTLP_URL = process.env.OTLP_URL || 'http://localhost:4318/v1/traces'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: './e2e',
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: 1,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: 'html',
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: process.env.BASE_URL ?? 'http://localhost:3000',

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on-first-retry',
	},

	/* Configure projects for major browsers */
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},

		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] },
		},

		// Webkit is disabled on NixOS due to system dependency issues
		// Uncomment below if running on a different platform
		// {
		// 	name: 'webkit',
		// 	use: { ...devices['Desktop Safari'] },
		// },
	],

	/* Run your local dev server before starting the tests */
	webServer: {
		command: process.env.CI ? 'npm run start' : 'npm run dev',
		url: 'http://127.0.0.1:3000',
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
		env: {
			DB_URL: 'data.sqlite',
			OTLP_URL: 'http://localhost:4318/v1/traces',
		},
	},
})

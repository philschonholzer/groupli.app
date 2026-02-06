# E2E Tests

End-to-end tests using Playwright.

## Setup

The e2e tests require a seeded database and environment configuration. This is handled automatically by the test scripts.

## Running Tests

### Run all e2e tests (with setup)
```bash
npm run test:e2e
```

This will:
1. Run the setup script (`e2e/setup.ts`)
2. Seed the database with test data
3. Create `e2e/.test-env.json` with environment variables
4. Start dev server (`npm run dev`)
5. Run all Playwright tests

### Run tests without re-running setup
```bash
npm run playwright
```

Use this if you've already run setup and just want to run tests again.

### Run specific test file
```bash
npm run test:e2e -- e2e/basic.spec.ts
```

### Run only chromium tests
```bash
npm run playwright -- --project=chromium
```

## CI Mode

### Run complete CI pipeline
```bash
npm run ci
```

This will:
1. Run unit tests (`npm run test`)
2. Run type checking (`npm run check`)
3. Build production bundle (`npm run build:ci`)
4. Setup e2e environment
5. Start production server (`npm run start`)
6. Run e2e tests against production build

### Run e2e tests in CI mode only
```bash
npm run test:e2e:ci
```

This runs e2e tests against the production build instead of dev server.

## Manual Setup

If you need to run setup separately:

```bash
npm run setup:e2e
```

This will:
- Set environment variables (`DB_URL`, `OTLP_URL`)
- Seed the database with test group and persons
- Generate `e2e/.test-env.json`

## Test Data

The setup creates:
- **Group**: `e2e-test-group` (name: "E2E Test Group")
- **Persons**: Alice, Bob, Charlie, Diana, Eve, Frank

The test group ID is available in tests via `process.env.E2E_GROUP_TEST_ID`.

## Environment Variables

The following environment variables are automatically set for tests:

- `DB_URL`: `data.sqlite` - Database file path
- `OTLP_URL`: `http://localhost:4318/v1/traces` - OpenTelemetry endpoint
- `E2E_GROUP_TEST_ID`: `e2e-test-group` - Test group ID

## Dev vs CI Mode

- **Dev Mode**: Uses `npm run dev` (hot reload, faster iteration)
- **CI Mode**: Uses `npm run start` (production build, closer to production)

The mode is controlled by the `CI` environment variable.

## Browsers

Tests run on:
- ✅ Chromium
- ✅ Firefox
- ❌ WebKit (disabled on NixOS due to system dependencies)

## Files

- `e2e/setup.ts` - Setup script that seeds DB and creates env config
- `e2e/seed.ts` - Database seeding script
- `e2e/.test-env.json` - Generated environment config (gitignored)
- `playwright.config.ts` - Playwright configuration

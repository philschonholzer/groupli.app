# E2E Tests

End-to-end tests using Playwright.

## Setup

The e2e tests require a seeded database. This is handled automatically by the test scripts.

## Running Tests

### Run all e2e tests (with setup)

```bash
npm run test:e2e
```

This will:

1. Seed the database with test data (`npm run seed:e2e`)
2. Start dev server (`npm run dev`)
3. Run all Playwright tests

### Run tests without re-seeding

```bash
npm run playwright
```

Use this if you've already seeded the database and just want to run tests again.

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

This executes `scripts/ci.sh` which:

1. Runs type checking (`npm run check`)
2. Runs unit tests (`npm run test`)
3. Builds production bundle (`npm run build`)
4. Seeds database with test data
5. Starts production server (`npm run start`)
6. Runs e2e tests against production build

## Test Data

The seed script (`e2e/seed.ts`) creates:

- **Group**: `e2e-test-group` (name: "E2E Test Group")
- **Persons**: Alice, Bob, Charlie, Diana, Eve, Frank

The test group ID is available in tests by importing from `constants.ts`:

```typescript
import { TEST_GROUP_ID } from './constants'
```

## Environment Variables

The following environment variables are automatically set by `playwright.config.ts`:

- `DB_URL`: `data.sqlite` - Database file path
- `OTLP_URL`: `http://localhost:4318/v1/traces` - OpenTelemetry endpoint

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

- `e2e/seed.ts` - Database seeding script
- `e2e/constants.ts` - Shared constants (TEST_GROUP_ID)
- `playwright.config.ts` - Playwright configuration

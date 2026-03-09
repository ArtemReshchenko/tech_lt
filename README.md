# QA Automation & Performance Testing

Playwright UI tests + K6 performance tests for the [Saucedemo](https://www.saucedemo.com) web app and [Reqres](https://reqres.in) API.

## Prerequisites

- **Node.js** ≥ 18
- **k6** — [Install k6](https://grafana.com/docs/k6/latest/set-up/install-k6/)

## Setup

```bash
npm install
npx playwright install
```

## Running Tests

### UI Tests (Playwright)

```bash
# Run all UI tests (all browsers)
npm run test:ui

# Run with Playwright UI mode
npm run test:ui:ui

# Run on a specific browser
npm run test:ui:chromium
npm run test:ui:firefox
npm run test:ui:webkit
```

### Performance Tests (K6)

Reqres.in requires an API key. Get a free key at [reqres.in/signup](https://reqres.in/signup), then:

```bash
# Set the API key
set REQRES_API_KEY=your_api_key_here

# Run the test
npm run test:perf

# Or run directly with k6
k6 run -e REQRES_API_KEY=your_api_key_here tests/performance/reqres-load-test.js
```

### Test Reports

After running UI tests, open the HTML report:

```bash
npx playwright show-report
```

On failure, traces and screenshots are saved to `test-results/`.

## Project Structure

```
tests/
├── ui/
│   ├── fixtures/
│   │   └── saucedemo-fixtures.ts   # Custom Playwright fixtures
│   ├── pages/
│   │   ├── login-page.ts           # Login page object
│   │   ├── inventory-page.ts       # Inventory/products page object
│   │   ├── cart-page.ts            # Cart page object
│   │   └── checkout-page.ts        # Checkout page object
│   └── saucedemo.spec.ts           # UI test scenarios
└── performance/
    └── reqres-load-test.js          # K6 load test script
```

## Design Decisions

### UI Tests

- **Page Object Model (POM)**: Each page has a dedicated class encapsulating locators and actions. This keeps tests readable and makes maintenance easier when the UI changes — you update one page class, not every test.

- **Custom Playwright Fixtures**: Instead of instantiating page objects in every test, a custom fixture file extends Playwright's base `test` to auto-inject `loginPage`, `inventoryPage`, `cartPage`, and `checkoutPage`. This eliminates boilerplate and enforces consistency.

- **Locator Strategy**: Tests primarily use `data-test` attribute selectors (e.g., `[data-test="username"]`), which are the most resilient to UI changes since they're decoupled from styling and structure.

- **No Hardcoded Sleeps**: All waits rely on Playwright's built-in auto-waiting via `expect()` assertions and locator actions. No `waitForTimeout()` or `sleep()` calls.

- **Sequential Execution**: `workers: 1` and `fullyParallel: false` ensure tests run sequentially. Since tests share state on saucedemo.com (cart, session), parallel execution could cause flakiness. Determinism is prioritized over speed.

- **Failure Artifacts**: `trace: 'retain-on-failure'` and `screenshot: 'only-on-failure'` capture debugging info without cluttering passing runs.

### Performance Tests

- **100 VUs for 2 minutes**: Simulates 100 concurrent users over a duration long enough to capture stable, representative metrics and observe any performance degradation trends.

- **Pacing with `sleep(1)`**: Each VU sends exactly 1 request per second, simulating realistic user behavior rather than hammering the API.

- **Percentile Thresholds**: P50 < 300ms, P95 < 500ms, P99 < 1000ms — these thresholds establish a performance baseline and will cause the test to fail if the API degrades.

- **Throughput Threshold**: `http_reqs rate > 50` ensures the system maintains adequate throughput under load.

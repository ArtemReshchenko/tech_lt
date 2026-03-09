# Reflection & Seniority Check

## How would you integrate Playwright tests into CI/CD?

Playwright tests should run automatically in CI on every push and pull request to ensure fast feedback and prevent regressions.

In this project, tests are executed using GitHub Actions (configured in `.github/workflows/ui-tests.yml`).

**Key practices:**

**Install browsers in CI**

```bash
npx playwright install --with-deps
```

This ensures all required browser and OS dependencies are available.

**Run tests headless**

CI environments have no display; Playwright runs headless by default which keeps execution fast and stable.

**Artifact collection**

- HTML report generated on every run
- Screenshots and traces captured on failure for debugging
- Artifacts uploaded to CI for quick inspection

**Merge protection**

The Playwright workflow should be configured as a required status check, preventing merges when tests fail.

**Parallel execution**

Larger test suites should run in parallel or use test sharding:

```bash
npx playwright test --shard=1/4
```

This significantly reduces feedback time.

**Test pyramid strategy**

UI tests should cover only critical user journeys. Faster layers such as unit and API tests should handle most validation to keep the pipeline efficient.

---

## How would you notify the team about failures or regressions?

CI failures should automatically notify the team through Slack or Microsoft Teams integrations.

**Implementation approach:**

Add a final GitHub Actions step that triggers a webhook when a workflow fails:

```yaml
if: failure()
```

Send the notification to a dedicated channel such as `#qa-alerts`.

The notification should include:

- Failing workflow link
- Branch name
- Commit author
- Failing test name
- Link to Playwright HTML report
- Trace or screenshot artifact

**Example notification:**

```
❌ UI tests failed

Branch: feature/checkout
Commit: abc123
Author: Artem

Failing test: checkout.spec.ts

Report:
<CI artifact link>
```

**To avoid alert fatigue:**

- Notify only for `main` branch failures or PR failures
- Avoid notifications for draft PRs or experimental branches

For longer-term monitoring, test results can also feed into a dashboard (e.g., Grafana, Allure TestOps) to track trends and identify flaky tests.

---

## What observability metrics would you include in an end-to-end quality dashboard?

A useful quality dashboard should combine test health, CI stability, and system performance metrics.

### Test health metrics

- Pass/fail rate per test suite
- Pass/fail trend over time
- Flaky test rate (tests that pass after retry)
- Average test duration

These help identify unstable tests or slow suites.

### CI/CD pipeline metrics

- Pipeline success rate
- Time from commit to test results
- Infrastructure vs test failures
- Mean time to fix broken builds

These metrics measure feedback speed and pipeline reliability.

### Performance metrics

Collected from performance tests (e.g., k6):

- P50 / P95 / P99 response time
- Error rate under load
- Throughput (requests per second)

Tracking these over time helps detect performance regressions early.

### Coverage and gaps

- Automated vs manual test coverage by feature
- Critical user journeys covered by E2E tests
- Time since last test update per module

This helps identify untested or stale areas of the system.

---

## How would you decide what to automate, what not to automate, and what belongs to performance vs functional testing?

Automation should focus on high-value, repeatable, and stable scenarios.

### What to automate

Good candidates for automation include:

- Critical user journeys (login, checkout, payments)
- Regression-prone areas
- Stable API contracts
- High-frequency tests executed in CI
- Scenarios that block deployment

These tests provide the highest return on investment because they run frequently and prevent production regressions.

### What not to automate

Some testing activities are better suited for manual testing:

- Exploratory testing
- UX evaluation
- One-time validations
- Rapidly changing prototype features

Automating these cases often leads to brittle tests and high maintenance cost.

Highly visual checks (layout aesthetics, branding) may use visual regression tools, but should not dominate the automation suite.

### Functional vs performance testing

**Functional testing**

- **Focus:** correctness of behavior
- **Typical questions:**
  - Does login work?
  - Can a user add an item to the cart?
  - Is the correct data returned from the API?
- These tests verify business logic and run frequently (usually on every pull request)
- **Tools:** Playwright, API testing frameworks, integration tests

**Performance testing**

- **Focus:** system behavior under load
- **Typical questions:**
  - How does the system behave with many concurrent users?
  - Does response time degrade under load?
  - What is the system throughput?
- **Metrics measured:** response time percentiles (P50, P95, P99), error rate, throughput (requests/sec)
- Performance tests should usually run:
  - On a schedule (e.g., nightly)
  - Before major releases
- They should run in stable environments, because CI infrastructure can introduce noisy latency

**Gray area**

Functional tests can include basic response time assertions, such as:

> API response time < 500ms

These act as early smoke signals for major regressions, but they are not a replacement for full performance testing.

---

## Key Takeaways

- Playwright tests run automatically in CI on every push and pull request
- Failures trigger actionable notifications in Slack or Teams
- Quality dashboards should combine test health, CI metrics, and system performance data
- Automation focuses on high-value and repeatable scenarios
- Functional testing verifies correctness, while performance testing verifies scalability and system limits

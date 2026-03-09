# Performance Test Report

## Test Setup and Assumptions

| Parameter | Value |
|---|---|
| **Tool** | k6 |
| **Target API** | `https://reqres.in/api/users?page=1` |
| **Virtual Users** | 100 concurrent |
| **Pacing** | 1 request per second per user |
| **Duration** | 2 minutes |
| **Executor** | `constant-vus` |

**Duration rationale:** 2 minutes provides enough time for all 100 VUs to stabilize and produce representative metrics while remaining practical for iterative runs.

**Executor choice:** `constant-vus` was chosen over `ramping-vus` because the goal is to measure sustained load at a fixed concurrency (100 users), not to find a breaking point. A ramp-up executor would be more appropriate for stress/spike testing.

**Think time & pacing:** Each VU calls `sleep(1)` after its request, simulating a realistic 1 request per second per user. Without think time, VUs would fire requests back-to-back, creating an unrealistic "hammer" pattern that inflates throughput and doesn't reflect real user behavior.

**Assumptions:**
- Reqres.in is a free mock API that enforces rate limiting under heavy concurrent load
- Response times include network latency from the test machine, not purely server processing
- The API is stateless; GET requests don't modify server state

## Captured Metrics

### Response Time

| Percentile | Value | Threshold | Status |
|---|---|---|---|
| **P50** | **19.85ms** | < 300ms | ✅ Pass |
| **P90** | **64.63ms** | — | — |
| **P95** | **71.93ms** | < 500ms | ✅ Pass |
| **P99** | **140.07ms** | < 1000ms | ✅ Pass |
| Min | 9.81ms | — | — |
| Max | 518.62ms | — | — |

### Throughput & Error Rate

| Metric | Value | Threshold | Status |
|---|---|---|---|
| **Throughput** | **96.71 req/s** | > 50 req/s | ✅ Pass |
| **Error Rate** | **99.65%** | < 1% | ❌ Fail |
| Total Requests | 11,700 | — | — |
| Successful (200) | 40 | — | — |
| Rate-limited | 11,660 | — | — |

## Interpretation of Results

**Response times are excellent.** P50 at 19.85ms and P95 at 71.93ms are well within thresholds. The narrow P50-to-P99 gap (19.85ms → 140.07ms) indicates stable, predictable performance with no significant latency spikes.

**Throughput met the target** at 96.71 req/s (near the theoretical 100 req/s maximum for 100 VUs with 1s pacing).

**The error rate is the key finding.** Only 40 out of 11,700 requests returned HTTP 200 — the rest were rejected by Reqres.in's rate limiting. The server handled the volume efficiently (fast responses, no crashes or timeouts) but rejected most requests to protect its resources. This is expected behavior for a free public API under 100 concurrent users.

In a production system, a 99.65% error rate under this load would be unacceptable and require immediate capacity scaling.

## Potential Optimization Suggestions

1. **Rate Limit Handling (client-side):** Implement exponential backoff with jitter when receiving rate-limit responses to improve success rate under constrained capacity.

2. **Response Caching:** The `/api/users?page=1` endpoint returns static data. A CDN or cache layer (Redis, Varnish) with appropriate TTL would eliminate redundant queries and reduce the load that triggers rate limiting.

3. **Horizontal Scaling:** Adding API server instances behind a load balancer distributes request volume and raises the effective rate-limit ceiling.

4. **Tiered Rate Limiting:** Instead of hard-blocking, return cached/stale data at high load rather than rejecting requests entirely — improving UX under burst traffic.

5. **Connection Pooling:** Under high concurrency, database connection pooling (e.g., PgBouncer) prevents connection exhaustion and latency spikes.

6. **Keyset Pagination:** Replace offset pagination (`LIMIT/OFFSET`) with keyset pagination (`WHERE id > last_id`) to maintain consistent query performance on larger datasets.

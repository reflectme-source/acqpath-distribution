# Current Phase 5 baseline

Observed 2026-09-11T17:13:33.601Z: **0 mainnet paid reports; 0 received USDC; 0 repeat payer identifiers**. External paid reports and external revenue are zero within this current aggregate scope. Independent customers and repeat external demand: none proven. Billable/UNKNOWN ratio and verified delivery attribution remain UNKNOWN. Owner-funded purchases are disabled. Hourly read-only monitoring is authorized in Phase 5; see docs/PHASE5-MONITOR.md.

The snapshot below is historical and its earlier authorization limits are superseded only for Phase 5 read-only monitoring.

# Revenue baseline — before Phase 2 optimization

Captured on 2026-09-10, before the distribution changes. Public contract and GitHub snapshot: **13:40:17 UTC**. The owner-approved, single aggregate read: **13:43:12 UTC**. This is an operator aggregate snapshot, not an independently reconciled accounting statement. No further production aggregate read is scheduled or authorized by this report.

| Funnel stage | Observed baseline | Meaning / missing evidence |
|---|---:|---|
| Official MCP Registry | Active `com.getacqpath/acqpath`, metadata rc.1 | Public record and endpoint read back; no semantic ranking implied |
| Bazaar | No matching resource in six bounded queries | Query-specific absence; not proof of global absence |
| GitHub views / unique views | 0 / 0 over reported 14-day window | Repository created only at 12:49 UTC that day; reporting latency and most of window predate it |
| GitHub clones / unique cloners | 0 / 0 over reported window | Not unique customers or verified integrations |
| GitHub stars / forks | 0 / 0 | Visibility context, not business success metrics |
| Documentation visits | UNKNOWN | Web Analytics was disabled at baseline; Pages Functions zero requests do not measure static docs visits |
| Integration actions | UNKNOWN | No installation, successful client setup or download-to-payer instrumentation |
| Available quote records | 0 | Excludes rejected/unavailable inputs; not a complete quote-attempt denominator |
| Metadata fetches | 0 | Reported aggregate scope/retention, not independently verified lifetime traffic |
| Base mainnet paid reports | 0 | Reported `eip155:8453` aggregates |
| Completed and verified deliveries | UNKNOWN | Not included in the approved aggregate projection |
| Mainnet receipts | 0 micro-USDC = **0 USDC** | Gross received aggregate; not profit |
| Mainnet payer identifiers | 0 | Identifiers are not verified independent people or organizations |
| Repeat payer identifiers | 0 | No proven repeat external buyer |
| Independent external payers | UNKNOWN / none verified | Aggregate read cannot establish payer independence |
| Organic customers / organic revenue | UNKNOWN | No attribution, independence or self-purchase exclusion evidence |
| Known actual operating costs | UNKNOWN | `CLOUD_BILLING_NOT_IMPORTED`; no cloud/facilitator invoices imported |
| Net profit | UNKNOWN | Revenue minus costs cannot be computed |
| Unresolved settlements / refund outcomes | UNKNOWN | Approved snapshot does not contain these fields; prior degraded recovery warning remains |
| Conversion rate / revenue per qualified discovered agent | UNKNOWN | Missing qualified-discovery and integration denominators; do not report 0% from absent measurements |

Local audit evidence is retained in `.local/phase2-baseline/baseline.json`, `.local/phase2-baseline/business-summary.json` and the public-contract snapshots. Credentials remain local and are not included in reports, Git or docs. The aggregate projection is defined in `scripts/metrics.mjs`. Public contract provenance is in `metadata/public-contract.json`.

## Measurement added in Phase 2

Distinct docs entry paths (`/from-mcp-registry`, `/from-smithery`, `/from-github`, `/from-glama`) can identify the entry link used when a measurable browser loads it. They canonicalize to the integration guide to avoid duplicate search pages. Unused prepared paths are not evidence that a directory listing exists.

Cloudflare Pages Web Analytics was enabled for this distribution project only; it starts with a new deployment and is not retroactive. Browser loads, blockers, bot filters, validation traffic and sampling limit interpretation. Owner/agent verification visits are QA and must not be counted as qualified acquisition. Plain HTTP clients generally do not execute the beacon. A page path is not proof that the visitor is independent or can pay. [Cloudflare Pages analytics](https://developers.cloudflare.com/pages/how-to/web-analytics/), [measurement limitations](https://developers.cloudflare.com/web-analytics/faq/).

**Discovery attribution is not payment attribution.** No referral parameter is sent to production quotes, no new API field is invented, and no wallet, claim or signature is sent to analytics. The API does not preserve a channel identifier for this measurement. End-to-end conversion and channel revenue remain UNKNOWN.

Next observable commercial milestone: one independently attributable external integration completes a verified report and later repeats. The distribution daily workflow can detect availability and metadata regressions; it cannot supply that commercial evidence. Any future operator read or payment test requires its own authorization.

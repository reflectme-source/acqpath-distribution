# Revenue baseline — Day 0 ground truth

period: requested 7-day review ending 2026-09-27T08:48:51Z; production aggregate endpoint read at 2026-09-27T08:48:51Z does not expose per-event timestamps in this projection, so funnel counts below are current aggregate/retention-scope evidence unless explicitly marked UNKNOWN.
independent_external_payers: 0 verified
organic_paid_operations: 0 verified
repeat_external_payers: 0 verified
organic_gross_revenue_usdc: 0
revenue_per_payer: UNKNOWN — no verified independent external payer
paid_operations_per_payer: UNKNOWN — no verified independent external payer
quote_to_payment_conversion: organic 0/60 recorded offers; gross marketplace-including 1/60 = 1.67%; denominator is aggregate/retention-scope, not exact 7-day
payment_to_repeat_conversion: organic UNKNOWN; gross marketplace-including 0/1 repeat wallet identifiers
marketplace_verifier_settlements: 1
owner_team_test_settlements: 0 verified by this aggregate; internal QA outside aggregate remains excluded if discovered
unknown_settlements: 0 in current mainnet aggregate beyond the known PayAPI marketplace verification

## Read-only evidence used

- `node scripts/cli.mjs prepare` at 2026-09-27T08:47Z: PASS. Public production health/readiness/capabilities/OpenAPI/MCP initialize/tools-list passed; no quote or payment created by that audit.
- `node scripts/cli.mjs metrics-read C:\Users\shyxz\Documents\GitHub\AcqPath\PROD\acqpath` at 2026-09-27T08:48:51Z: one guarded read-only aggregate request using local credentials. No credentials are included here.
- Public readback probe evidence: `.local/day0/public-channel-readback.json`.
- Distribution verification: 111 tests PASS, static secret pattern scan PASS, vendor integrity PASS, `coreChanged:false`, `walletUsed:false`.

## Aggregate funnel

| Stage | Evidence | Classification |
|---|---:|---|
| Recorded eligible/offered operations | 60 offers | Aggregate includes all observed SKU offers in retention scope; not exact 7-day attribution. |
| Metadata/source fetches | 150 | Utility/work performed; not revenue and not customer demand. |
| Mainnet successful settlements | 1 paid report | Known PayAPI marketplace verification settlement. |
| Gross mainnet received | 20,000 micro-USDC = 0.02 USDC | Marketplace verification, excluded from organic revenue. |
| Mainnet wallet identifiers | 1 | Not independently verified as organic customer; known marketplace verifier context. |
| Repeat wallet identifiers | 0 | No repeat payer evidence. |
| Payment attempts | UNKNOWN | Current aggregate projection does not expose failed verify/settle attempts by reason. |
| Delivered results verified | UNKNOWN from aggregate | PayAPI marketplace verification is externally reported as verified; aggregate alone does not prove organic delivery. |

## SKU activity

| SKU | Network | Offers | Settled operations | Gross USDC | Cache hits | Source fetches | Organic classification |
|---|---|---:|---:|---:|---:|---:|---|
| rights.preflight.v1 | null / secure route | 49 | 0 | 0 | 0 | 147 | 0 organic settlements |
| rights.preflight.stock.fresh.v1 | eip155:8453 | 1 | 1 | 0.02 | 0 | 3 | PayAPI marketplace verification, not organic |
| rights.ingestion-gate.v1 | null | 10 | 0 | 0 | 0 | 0 | 0 organic settlements |
| rights.revalidate.v1 | not present in current aggregate | 0 | 0 | 0 | UNKNOWN | UNKNOWN | 0 organic settlements |

## Settlement classification

| Settlement class | Count | Revenue | Evidence |
|---|---:|---:|---|
| MARKETPLACE_VERIFIER | 1 | 0.02 USDC | PayAPI listing has `payment_verified:true`; prior operator notes classify this as PayAPI verification. |
| INDEPENDENT_EXTERNAL | 0 verified | 0 | No independent payer, repeat payer, or attributed external integration evidence. |
| OWNER / TEAM / CANARY / TEST | 0 verified in current aggregate | 0 | No owner wallet/payment was used in this audit. Historical QA remains excluded. |
| UNKNOWN | 0 additional settled operations | 0 | No extra settlement beyond the known PayAPI verification is visible in the aggregate. |

## Interpretation

Organic revenue is still zero because there is no evidence of an independent external payer or repeat external use. The single settlement proves the stock endpoint can be paid by at least one marketplace verifier, but it does not prove demand, retention, or high-volume workflow integration.

The current aggregate cannot answer several commercially important questions: failed payment attempts, unique external eligible requests, failed facilitator verify/settle reasons, and per-channel conversion. Those remain UNKNOWN rather than inferred.

# ACQPATH — 72H EXECUTION REPORT

H0: 2026-09-27T11:47:41Z
DEADLINE: 2026-09-30T11:47:41Z
OBSERVATION_TIME: 2026-09-27T11:48:32Z
ETAP: first execution block — live coverage, billability, Wave 1 readback, channel eligibility, monitoring evidence, near-term sales qualification

## LIVE COVERAGE

Source: public live reads saved in `.local/sprint72/public-read.json`; no credentials, quotes, wallet signatures, payments or production changes.

- Production health: PASS, `GET https://api.getacqpath.com/health` HTTP 200, deployment `production`, payments `live`, source SHA `e593d69795f9b3f841ec7352c30b7ae26c2aec2b0d181ab0559981dcbc7b17c8`.
- Live native coverage: exactly these origins from `/v1/capabilities`: `https://medium.com`, `https://theguardian.com`, `https://rslstandard.org`, `https://rslcollective.org`.
- Supported stock purposes from live OpenAPI: `ai-input`, `ai-train`, `ai-index`, `search`.
- Stock request schema requires `resource`, `purpose`, `max_total_micro`; `additionalProperties:false`.
- Stock endpoint is fresh only; `tier` can only be `fresh`; `max_total_micro` must allow the fixed 20,000 micro-USDC charge.
- Gateway services exist for Ingestion Gate and Revalidation but require the AcqPath SIWX adapter; they are not stock zero-config buyer targets.

Important qualification limits:

- Supported origin is not proof every subdomain/path/query is supported or useful.
- One homepage check does not prove rights for an entire site.
- HTTP 402 is an offer, not a customer and not a delivered report.
- HTTP 200 is not automatically a paid report; unavailable/no-charge results must be distinguished from settlement-backed reports.
- `UNKNOWN`, `DENY_DECLARED`, and `LICENSE_REQUIRED` do not grant permission.

## BILLABLE PATH

Live unpaid stock request performed once:

- Request: `POST https://api.getacqpath.com/v1/rights/preflight/x402`
- Body: `{ "resource":"https://rslstandard.org/", "purpose":"ai-input", "max_total_micro":"20000" }`
- Result: HTTP 402, no signature, no settlement.
- Amount: `20000` micro-USDC = 0.02 USDC.
- Network: `eip155:8453` Base mainnet.
- Asset: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`.
- payTo: `0xf69DBbd053fb0Fbc78ADfdB1BFe3b0D1F57300ec`.
- Bazaar extension: present in the unpaid 402 challenge.
- Request binding: stock mode binds one request at first valid use; it does not provide pre-signature body binding.

Conditions for a real billable stock report:

1. Buyer sends syntactically valid stock JSON for a reviewed origin and matching purpose.
2. Server returns a fresh 402 offer with exact Base USDC terms.
3. Buyer authorizes the x402 payment with their own wallet/client and own spend limit.
4. Server verifies and settles one authorization for one bound request.
5. Result must include signed report evidence, settlement receipt and delivery proof to count as delivered.
6. If the source is unsupported or no billable declaration can be verified, outcome may be unavailable/no-charge or UNKNOWN; do not infer revenue.

Existing delivery evidence:

- Last verified aggregate baseline recorded one PayAPI marketplace verification settlement for stock fresh Preflight, 0.02 USDC.
- That settlement is MARKETPLACE_VERIFIER, not organic customer revenue.
- Current public-only reads do not include raw PayAPI `EXTENSION-RESPONSES`; Bazaar success/processing/rejected for that settlement remains UNKNOWN from preserved public evidence.

## AGENT402 EXECUTION ELIGIBILITY

Source: `https://agent402.tools/api/index?seller=api.getacqpath.com`, read 2026-09-27T11:48Z.

- AcqPath indexed origin: yes.
- Health: `1`.
- Tool count: 16.
- Paid tool count: 4.
- Stock route listed: `POST /v1/rights/preflight/x402`, price `$0.02`, required body fields `resource`, `purpose`, `max_total_micro`, lastVerifiedAt `2026-09-27T11:39:50.373Z`.
- Network: `eip155:8453`; payTo readback: `0xf69DBbd053fb0Fbc78ADfdB1BFe3b0D1F57300ec`.
- `routable:true` is present, but router execution eligibility is false.
- `routerDispatchEligible:false`.
- `routerDispatchReason:"settlement_required"`.
- Base detail: `eligible:false`, `reason:"settlement_required"`, `detail:"below the settlement floor"`.

Buyer-intent readback:

- Current `/api/find?q=RSL rights before RAG ingestion`: HTTP 200, no AcqPath hit in returned JSON.
- Current `/api/find?q=AI usage rights`: HTTP 200, no AcqPath hit in returned JSON.
- `training content rights` and `AcqPath`: HTTP 503 from Agent402 free discovery: free/discovery paused briefly so paid calls keep flowing. Not counted as absence.
- Retired `/api/index/search` now returns 404 with a hint to use `/api/find`; earlier historical search rankings should not be treated as current.

Commercial interpretation: Agent402 is a discovery surface, not currently an executable router buyer for AcqPath. Exact blocker is `settlement_required` / below settlement floor.

## BAZAAR STATUS + EVIDENCE

Source: existing `scripts/phase5-monitor.mjs` public mode, 2026-09-27T11:48:03Z; no credentials, no quote, no payment.

- Health check: PASS.
- CDP merchant lookup by AcqPath payTo: HTTP 200, 0 matched resources.
- CDP filtered merchant/search by payTo/network/urlSubstring: HTTP 200, 0 matched resources.
- CDP searches for `AcqPath`, `RSL rights`, `AI usage rights`, `crawl rights`, `RAG ingestion rights`, `AI training rights`, `batch content rights check`, `did this website AI policy change`: HTTP 200, 0 AcqPath matches.
- Bazaar by SKU: all AcqPath paid endpoints remain `AWAITING FIRST EXTERNAL SETTLEMENT` in monitor output.
- Current stock 402 includes Bazaar extension metadata, but CDP catalog readback does not contain the AcqPath endpoint.

Commercial interpretation: Bazaar/CDP is not currently a source of external buyers. No owner-funded indexing payment was made.

## WAVE 1

- Marketplace: https://github.com/rtolpin/Agentic-Research-Marketplace/issues/1 — open, 0 comments, no maintainer response, no update since publication at 2026-09-27T10:36:04Z.
- AgentRAG: https://github.com/agentx402-ai/agentrag/issues/21 — open, 0 comments, label `enhancement`, no maintainer response, no update since publication at 2026-09-27T10:36:39Z.
- Sentinel: https://github.com/valeo-cash/Sentinel/issues/3 — open, 0 comments, no maintainer response, no update since publication at 2026-09-27T10:37:05Z.

No duplicate posts, no pings, no PRs, no emails.

## SALES QUALIFICATION

READY_FOR_DIRECT_OFFER: none verified.

NEEDS_QUALIFICATION:

1. Agentic Research Marketplace — strongest near-term path. Evidence: deployed app is documented, Base mainnet x402 buyer code verified, repeated web/search source flow verified, AcqPath patch prepared. Missing: maintainer/operator interest and proof they will run paid AcqPath in a real workflow.
2. AgentRAG — strong RAG-source fit and Base mainnet default. Missing: maintainer interest and chosen policy shape for cost-controlled pre-ingest checks.
3. Sentinel — good policy/audit example channel. Missing: exact operator workflow and Base route confirmation for a concrete paid AcqPath call.

DISTRIBUTION_CHANNEL:

- Agent402 — indexed but router payment blocked by settlement floor; current `/api/find` did not surface AcqPath in checked buyer-intent results.
- PayAPI — listing/verification channel; one marketplace verification settlement already recorded, no evidence of subsequent organic buyer activity in current public-only read.
- CDP/Bazaar — current public readback has no AcqPath listing.

NO_CURRENT_FIT:

- AgentProcure remains HOLD because current source is Base Sepolia, not Base mainnet.
- Other previously scored prospects remain outside this 72h first package unless Wave 1 produces no signal and a separate Wave 2 approval package is prepared.

NOWE ZATWIERDZONE PUBLIKACJE: none.

## REVENUE

INDEPENDENT CUSTOMER REVENUE: 0 USDC verified from last approved aggregate baseline; no fresh credentialed aggregate read performed.
PAID EVALUATION REVENUE: 0 verified.
PRODUCTION WORKFLOW PAID OPS: 0 verified independent operations.
REPEAT CUSTOMERS: verified 0 / unknown beyond last aggregate limits.
MARKETPLACE_VERIFICATION: 1 PayAPI verification settlement, 0.02 USDC, not organic.
CONTRIBUTION MARGIN: UNKNOWN — current report has no fresh cloud/facilitator variable cost import.
NEW EXTERNAL SPEND: 0.
OWNER WALLET USED: no.
PAYMENTS MADE: none.

## MONITORING

MONITORING: BLOCKED / NOT RUNNING VERIFIED.

Evidence:

- Local Codex automations directory contains no active AcqPath revenue monitor. Only unrelated `dustkeeper-batch-preflight-recovery` exists and is PAUSED.
- Public GitHub workflow `.github/workflows/visibility.yml` is scheduled daily by cron `23 6 * * *` and runs public `node scripts/phase5-monitor.mjs` plus `node scripts/discovery-check.mjs` without credentials.
- Latest three public scheduled visibility runs failed:
  - 2026-09-26 run 36239111531 failure: https://github.com/reflectme-source/acqpath-distribution/actions/runs/36239111531
  - 2026-09-25 run 36132174228 failure: https://github.com/reflectme-source/acqpath-distribution/actions/runs/36132174228
  - 2026-09-24 run 35995810680 failure: https://github.com/reflectme-source/acqpath-distribution/actions/runs/35995810680
- Latest successful CI/docs deployment workflows are push workflows from 2026-09-18, not active revenue monitoring proof.
- Manual public monitor run in this session succeeded and wrote `.local/phase5/monitor.json`.

LAST_SUCCESS: manual public monitor at 2026-09-27T11:48:03Z; scheduled visibility last success UNKNOWN from latest three checked runs.
NEXT_RUN: nominal GitHub cron 2026-09-28T06:23:00Z, but current schedule is not healthy until failure cause is reviewed.
LOG LOCATION: `.local/phase5/monitor.json`; GitHub run URLs above.
REQUIRED AVAILABILITY: GitHub scheduled workflow for public monitor; local credentialed aggregate monitor is not scheduled and would require local machine/Codex plus separately authorized credentialed read.

## BEST SALES OPPORTUNITY

NAJLEPSZA MOŻLIWOŚĆ SPRZEDAŻY: Agentic Research Marketplace, if maintainer/operator responds.

DLACZEGO KLIENT POTRZEBUJE WYNIKU: Their workflow converts paid search results into findings used for synthesis. AcqPath can add observed rights evidence only for selected sources that enter context, before synthesis, with an explicit cost cap. This maps to a repeated research workflow and does not require AcqPath production changes.

NASTĘPNA CZYNNOŚĆ: wait for Wave 1 maintainer response; no same-day ping. If Agentic Research Marketplace requests a PR, prepare a minimal PR from the existing patch, disclose syntax-pass/full-typecheck-blocked status, and test only in an isolated target checkout. In parallel, do no more than one bounded Wave 2 approval package if Wave 1 remains silent after a reasonable observation window.

OWNER ACTION: NONE.

## DECYZJA H72

Current interim state: NO_NEAR_TERM_SIGNAL so far, because there is no maintainer response, no direct operator asking to buy, no new independent settlement and no repeat paid use. This is an interim first-block result, not a 72h market conclusion.

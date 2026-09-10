# Bazaar compatibility — proposal only, no core change

**BLOCKED BY CORE.** Public MCP discovery and native HTTP x402 are available, but the current AcqPath flow is not a proven directly invocable Bazaar paid tool. Distribution metadata cannot enable it. No quote, wallet signature, real settlement, new route or production change was made for this analysis.

Evidence date: 2026-09-10. Public API version is `3.1.0-rc.1`, source hash `7b7b830d434bac12bf7b42f7b706757e2ca8dab15349adc367985208f4329671`. `metadata/public-contract.json` and `metadata/openapi.public.json` record the public contract. Six unchanged SDK source modules are integrity-pinned in `metadata/vendor-provenance.json`. The approved core comparison is a fixed nine-file hash comparison, not permission to copy or modify production.

## Exact contract comparison

| Requirement | Current AcqPath public/client contract | Result |
|---|---|---|
| HTTPS, x402 v2, exact settlement | Native paid report uses HTTP GET and `PAYMENT-REQUIRED` / `PAYMENT-SIGNATURE`; Base USDC terms are pinned | Matches protocol family; no live purchase tested here |
| Explicit amount and recipient | Fresh 20,000 / deep 50,000 micro-USDC; signed offer binds exact quote URL, network, asset, recipient and expiry | Matches bounded authorization design; do not replace values |
| Discoverable input | First POST `/v1/rights/quote` with resource, purpose, user_class, geo, tier, max_total_micro | Existing preparation step; not a paid one-call MCP tool |
| Paid resource | GET `/v1/rights/reports/{id}` where ID is 48 lower-case hex characters | Dynamic route can be described, but arbitrary IDs are invalid |
| Retrieval authorization | `X-AcqPath-Claim` required; returned claim is 64 hex characters | Buyer-private bearer capability, unsuitable for public catalog examples |
| Bazaar discovery extension | Missing in reviewed native challenge/settlement integration | Required production protocol change |
| Valid metadata forwarded to CDP | No verified Bazaar forwarding path; signer/client preserve only explicitly handled extension state | Must test the entire challenge → payload → facilitator chain |
| Generic discovery probe | Must obtain a valid preparation and private claim before a usable paid-report challenge | Generic unauthenticated placeholder route probe is not demonstrated |
| Signed evidence/retry | Client verifies offer, report, receipt and delivery binding; saves authorization for recovery | Keep these invariants; a generic pay-and-fetch client is insufficient |
| Paid MCP | MCP exposes capabilities and quote preparation; redeem is HTTP | Do not advertise paid MCP compatibility |

## Current official requirements

CDP discovery uses `extensions.bazaar`; there is no separate registration form. A valid declaration, reachable paid challenge and successful eligible CDP settlement precede indexing. Validation is non-settling and can simulate acceptance without an API key. Facilitator extension responses distinguish success, processing and rejection. Accepted metadata does not guarantee editorial curation or immediate ranking. [Official seller discovery guide](https://docs.cdp.coinbase.com/x402/seller/get-discovered).

Dynamic routes are supported. The current declaration helpers accept `pathParamsSchema`; a server route template such as `/v1/rights/reports/:id` can describe this resource family. Keep the concrete quote URL in the signed offer and payment payload. Do not substitute a template in cryptographically bound resource fields or assume an arbitrary 48-hex ID will be automatically normalized by the catalog. [x402 extension implementation](https://github.com/x402-foundation/x402/tree/main/typescript/packages/extensions/src/bazaar), [x402 v2 specification](https://github.com/x402-foundation/x402/blob/main/specs/x402-specification-v2.md).

A CDP settlement would be eligible to index only if the facilitator actually receives and accepts valid Bazaar metadata with the concrete resource association. Today a payment alone cannot repair the missing extension. The production facilitator's full active configuration and acceptance of this proposed extension were not independently established in this task. No indexing payment is authorized.

## Smallest production delta to evaluate separately

This is an exact protocol proposal, not an applied source diff or a claim that a compile-ready patch has been reviewed. No new paid endpoint, proxy, wallet access, recipient, price or unlimited permission is proposed for the first step.

1. In the native report's 402 challenge construction, merge an `extensions.bazaar` declaration alongside the existing signed offer/receipt extension. Describe **GET** `/v1/rights/reports/:id`, an ID schema matching `^[a-f0-9]{48}$`, the JSON evidence response, and a concise truthful description (within the documented 500-character constraint). Include preparation instructions without any live ID, private claim or authorization. Do not overwrite existing extensions.
2. Add the corresponding Bazaar resource-server hook/manual equivalent so declared input and route template validate under the current extension schema. Preserve the concrete `resource.url` and all signed-offer fields. Metadata-only templates must never become paid resource identities.
3. Preserve validated Bazaar extension data and `paymentPayload.resource` through the buyer signer, checkpoint, verify and settle path. Current wrapper behavior must be audited explicitly: adding `payment-identifier` does not imply that `bazaar` was forwarded. Record a redacted extension acceptance outcome; never log the claim or payment signature.
4. Prove private preparation in the buyer adapter: select supported input, obtain one quote and claim, verify offer, attach the private header, checkpoint once and resume the same authorization. The model receives a sanitized evidence summary. The catalog record must not contain a reusable private token. Whether the target Bazaar agent can execute this private multi-step adapter is an additional compatibility gate.

Steps 1–3 are the smallest metadata/protocol candidate for indexing. They are **not sufficient evidence of generic one-call compatibility**. If a target agent cannot run the private preparation adapter or a health probe cannot reach the paid challenge safely, a stable paid entry operation would require a separate core behavior design and approval. Do not weaken claim checks, accept made-up IDs, reuse one public quote, expose claim-in-query URLs or build a second-fee proxy as a shortcut.

## Required acceptance tests before any indexing claim

Use isolated fixtures and a separately approved environment, not `acqpath-production` or `acqpath-staging` under this task. Test both fresh/deep, every current paid purpose, invalid/expired ID, absent/wrong claim, unsupported origin, forged offer, changed amount/recipient/resource, invalid extension input, missing forwarded resource, signed report tampering, ambiguous submit and exact-checkpoint retry. One valid non-settling preparation must reach an unchanged 402 and pass extension schema/simulation checks without exposing the claim to a third party. Validate that the same authorization cannot charge again on recovery.

CDP's public validator takes a resource and method and makes a probe. It was **not called with a private quote**, and no fabricated report ID was used as a success test. If the validator cannot supply the required private claim, that is a test/protocol compatibility issue to solve; it is not justification to publish the token. Any eventual mainnet smoke test needs separate explicit buyer approval, a bounded amount and an independent buyer wallet. A self-funded QA transaction does not establish organic demand.

## Other paid-agent surfaces

Agentic Market and Agentic Wallet service search consume the Bazaar resource layer; do not count them as independently published channels just because MCP Registry accepted a record. [Agentic Market](https://agentic.market/about), [Agentic Wallet service search](https://docs.cdp.coinbase.com/agentic-wallet/cli/skills/search-for-service).

x402scan now discovers the payment operation from `/openapi.json` at the API origin, using `x-payment-info`, declared inputs and a reachable runtime challenge. Its registration can require SIWX wallet authentication. The current public AcqPath API document lacks that discovery metadata, and arbitrary report routes cannot bypass private preparation. A docs-subdomain OpenAPI overlay does not alter API-origin behavior. Registration was not attempted, nor were the scanner's multi-method probes run against production. Poncho and agentcash discovery inherit this gap. [x402scan current specification](https://www.x402scan.com/discovery/spec), [maintained scanner source](https://github.com/Merit-Systems/x402scan).

## Recommendation and commercial effect

Recommend the bounded compatibility implementation and non-settling tests as the next separately approved technical action. It could expose the existing report product to agents already able to pay, with less manual integration, but traffic and revenue uplift remain unknown. Approval must name the environment and permitted code/protocol delta. It must not imply changes to PAYMENT_MODE, PAY_TO, pricing, Access, reconciliation, provider routing or authority to make a real payment.

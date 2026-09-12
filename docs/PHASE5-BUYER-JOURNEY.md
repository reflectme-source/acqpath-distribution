# Final technical release — 2026-09-11

Production version 0b952e13-d76c-4226-a117-521741d30769; core commit b2a9273f7269f137af2336d7819bbd3a7595a0b3. Configured official TS/Python x402 + SIWX integration is deployed. Local/CI/workerd and public unpaid checks PASS; no owner wallet/payment. MAINNET PAID E2E = UNVERIFIED. Acquisition UNPROVEN. See [configured integration](https://developers.getacqpath.com/public-http).

# Phase 5: external buyer journey

Current production: 0b952e13-d76c-4226-a117-521741d30769. This table reflects the final deployed SIWX buyer integration; the docs hotfix changes no core behavior or configuration.

| Stage | Finding | Resolution / boundary |
|---|---|---|
| Discover | RSL-first naming obscured agent use cases | Intent descriptions, five use-case paths and public HTTP entry |
| Understand capability | Crawl could be confused with a paid purpose | Four exact purposes; no paid crawl; robots/access separate |
| Coverage | Only four reviewed origins; support does not ensure declarations | Live capability link, unsupported and UNKNOWN hold guidance |
| Endpoint | New buyer could be sent into quote/claim legacy flow | Stable POST /v1/rights/preflight first; legacy examples labeled |
| 402 | Empty discovery offer could be confused with prepared offer | Explicit prepared binding requirement and unavailable-200 distinction |
| Price | Fee must be visible without a private account | 0.02/0.05 USDC, Base asset and recipient pinned in examples |
| Payment | Tested official TS/Python payment signers keep their normal random nonce | Use the AcqPath SIWX adapter; no custom bound payment nonce for new buyers; generic zero-config clients not claimed |
| Evidence | Decoding can be confused with verification | Samples declare signatureVerified:false; full cryptographic checks documented |
| Retry | A blind retry could create another authorization | Persist identical context/payment; no second signing after ambiguity |
| Demand | Internal QA could inflate demand | Buyer helper stopped/disabled; external evidence classifier and monitoring |

No external paid delivery or generic paid interoperability is proven. The reviewed compatibility change is deployed. Development is complete; await genuine external usage through existing monitoring.


## Live Rights Gateway release

Preflight remains **0.02 USDC fresh / 0.05 deep**. **Ingestion Gate** checks 1–4 unique reviewed URLs: **0.04 + 0.02 per URL fresh**, **0.06 + 0.04 per URL deep**. **Revalidation** compares one resource with an authentic signed prior gateway checkpoint: **0.03 fresh / 0.06 deep**. All payments use Base USDC. Gateway fees cover bounded observation attempts, including UNKNOWN. No legal clearance, license purchase or whole-domain coverage.

Use the tested official TS/Python signer + AcqPath SIWX adapter. [Complete gateway examples](https://developers.getacqpath.com/examples/GATEWAY.md) include private state, retry and delivery verification. [Live gateway guide](https://developers.getacqpath.com/gateway). Mainnet paid E2E awaits a real external buyer; verified organic revenue remains 0 USDC. Development freeze: only incidents, security, standards compatibility and monitoring.


## Separate stock marketplace mode

`POST /v1/rights/preflight/x402` accepts unmodified official TypeScript x402 2.25.0 and Python x402 2.22.0 buyers, with no AcqPath SIWX/custom signer/buyer hook. Fresh only, **0.02 USDC on Base**. The first valid payment atomically binds one request; it does not provide pre-signature cryptographic body binding. A leaked pre-use authorization can be raced. Keep exact signed requests private and recover with the same authorization; never sign again after uncertainty. SIWX remains recommended on the existing secure route. [Stock JSON, official clients and recovery](https://developers.getacqpath.com/examples/STOCK-X402.md). External mainnet paid E2E remains UNVERIFIED until independently evidenced.

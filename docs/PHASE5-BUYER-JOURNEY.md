# Phase 5: external buyer journey

Observed 2026-09-11. Production remains Phase 4 version 61b19442-bd51-46ec-be31-01422a07f877. No core behavior, routing, payment terms, Access or reconciliation changes.

| Stage | Finding | Resolution / boundary |
|---|---|---|
| Discover | RSL-first naming obscured agent use cases | Intent descriptions, five use-case paths and public HTTP entry |
| Understand capability | Crawl could be confused with a paid purpose | Four exact purposes; no paid crawl; robots/access separate |
| Coverage | Only four reviewed origins; support does not ensure declarations | Live capability link, unsupported and UNKNOWN hold guidance |
| Endpoint | New buyer could be sent into quote/claim legacy flow | Stable POST /v1/rights/preflight first; legacy examples labeled |
| 402 | Empty discovery offer could be confused with prepared offer | Explicit prepared binding requirement and unavailable-200 distinction |
| Price | Fee must be visible without a private account | 0.02/0.05 USDC, Base asset and recipient pinned in examples |
| Payment | Required custom nonce incompatible with generic clients | Explicit blocker; no false standard-client purchase recipe |
| Evidence | Decoding can be confused with verification | Samples declare signatureVerified:false; full cryptographic checks documented |
| Retry | A blind retry could create another authorization | Persist identical context/payment; no second signing after ambiguity |
| Demand | Internal QA could inflate demand | Buyer helper stopped/disabled; external evidence classifier and monitoring |

No external paid delivery or generic paid interoperability is proven. Highest-impact next action: obtain a narrowly reviewed core compatibility change that preserves request binding and one-charge semantics while permitting standard x402 buyers, or deliver a separately reviewed extension-aware buyer SDK. Production changes require separate approval; this phase does not apply them.

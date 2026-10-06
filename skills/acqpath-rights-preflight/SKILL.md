---
name: acqpath-rights-preflight
description: Integrate observed RSL rights evidence before selected supported content enters AI input, RAG indexing, training or search. Use for AcqPath MCP connection, bounded HTTP x402 buyer integration and safe evidence recovery. Reports do not grant crawl permission, licenses or legal clearance.
---

# AcqPath rights preflight

Use before an agent summarizes, ingests into RAG, trains on or indexes a supported URL when it needs machine-readable evidence of declared usage/licensing terms. Start with the [public HTTP journey](https://developers.getacqpath.com/public-http): stable POST `/v1/rights/preflight`, no AcqPath account or API key. Use the configured [official TS/Python SIWX adapter](https://developers.getacqpath.com/examples/OFFICIAL-CLIENTS.md) with the unchanged official EIP-3009 signer and random nonce. New buyers do not implement the legacy bound payment nonce. Generic zero-config clients remain unsupported on the secure SIWX endpoint; the legacy quote/claim SDK is not a drop-in public client. Clients outside the documented secure and stock flows must verify compatibility against the endpoint contract before production use.

Read [machine discovery](https://developers.getacqpath.com/.well-known/acqpath-distribution.json) and [quickstart](https://developers.getacqpath.com/quickstart). Connect the existing Streamable HTTP MCP endpoint `https://api.getacqpath.com/mcp`; public connection requires no seller credential.

Use `acqpath_capabilities` or GET `/v1/capabilities` before integrating. Permit `acqpath_rights_quote` only when a selected supported resource needs evidence; it can fetch metadata and consume quota, and its result contains a private claim. Exclude the disabled legacy `acqpath_quote` tool.

Choose the actual purpose: `ai-input` for model context/summarization, `ai-index` for indexing/RAG corpus preparation, `ai-train` for training, `search` for search. RAG may need separate indexing and model-input evaluations. No paid `crawl` purpose exists; crawler access/robots policy is separate. Coverage is an exact origin allowlist and does not guarantee usable declarations for every page.

Read [documented OpenAPI](https://developers.getacqpath.com/openapi.json) for input constraints. Do not invent endpoints or send referral parameters to the API. Fresh and deep prices are documented as 0.02 and 0.05 USDC; re-read live capabilities and verify the signed quote before payment.

MCP prepares quotes; paid report delivery uses HTTP x402 outside MCP. Use the [reviewed buyer integration](https://github.com/reflectme-source/acqpath-distribution/tree/main/examples) for offer/report/receipt/delivery verification and private durable checkpoints. The SIWX store is not application-level encrypted: use private ACLs and preferably encrypted storage. Use the documented client source and examples. Never import a seller credential into a buyer application.

Only enter a purchase when the user's existing authorization covers its resource, purpose and finite spending limit. Use the buyer's configured signer; do not request or expose wallet keys/seeds. Keep claims, signatures and checkpoints outside LLM prompts and logs. Save the checkpoint before submitting authorization. One logical ID identifies one purchase; after ambiguity, resume the same checkpoint without re-quoting, signing again or deleting recovery state.

UNKNOWN, unavailable/unsupported, DENY_DECLARED and LICENSE_REQUIRED hold ingestion. ALLOW_DECLARED records an observed allowance under the supported profile; it is not ownership verification or a license. Preserve resource, purpose, context and timestamp with the evidence. A verified service receipt is not independent chain finality.

Use [recovery guidance](https://developers.getacqpath.com/recovery) when state is ambiguous. Reuse the saved authorization and checkpoint for the same operation. Do not treat a service receipt as independent chain finality or marketplace indexing as part of the API contract.


## Rights Gateway products

Preflight remains **0.02 USDC fresh / 0.05 deep**. **Ingestion Gate** checks 1–4 unique reviewed URLs: **0.04 + 0.02 per URL fresh**, **0.06 + 0.04 per URL deep**. **Revalidation** compares one resource with an authentic signed prior gateway checkpoint: **0.03 fresh / 0.06 deep**. All payments use Base USDC. Gateway fees cover bounded observation attempts, including UNKNOWN. No legal clearance, license purchase or whole-domain coverage.

Use the official TS/Python signer with the AcqPath SIWX adapter on secure routes. [Complete gateway examples](https://developers.getacqpath.com/examples/GATEWAY.md) cover private state, retry and delivery verification. [Gateway guide](https://developers.getacqpath.com/gateway). Payments MCP and generic paid proxy integrations are not supported.


## Separate stock marketplace mode

`POST /v1/rights/preflight/x402` accepts unmodified official TypeScript x402 2.25.0 and Python x402 2.22.0 buyers, with no AcqPath SIWX/custom signer/buyer hook. Fresh only, **0.02 USDC on Base**. The first valid payment atomically binds one request; it does not provide pre-signature cryptographic body binding. A leaked pre-use authorization can be raced. Keep exact signed requests private and recover with the same authorization; never sign again after uncertainty. SIWX remains recommended on the existing secure route. [Stock JSON, official clients and recovery](https://developers.getacqpath.com/examples/STOCK-X402.md).

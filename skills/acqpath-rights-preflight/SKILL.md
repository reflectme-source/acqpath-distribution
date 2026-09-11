---
name: acqpath-rights-preflight
description: Integrate observed RSL rights evidence before selected supported content enters AI input, RAG indexing, training or search. Use for AcqPath MCP connection, bounded HTTP x402 buyer integration and safe evidence recovery. Reports do not grant crawl permission, licenses or legal clearance.
---

# AcqPath rights preflight

Use before an agent summarizes, ingests into RAG, trains on or indexes a supported URL when it needs machine-readable evidence of declared usage/licensing terms. Start with the [public HTTP journey](https://developers.getacqpath.com/public-http): stable POST `/v1/rights/preflight`, no AcqPath account or API key. Required `acqpath-request-binding` nonce support means unmodified generic x402 clients cannot buy; the legacy quote/claim SDK is not a drop-in client. Do not claim standard paid interoperability from unpaid validation. Owner-funded QA/indexing purchases are disabled; never prompt the owner to fund or sign.

Read [machine discovery](https://developers.getacqpath.com/.well-known/acqpath-distribution.json) and [quickstart](https://developers.getacqpath.com/quickstart). Connect the existing Streamable HTTP MCP endpoint `https://api.getacqpath.com/mcp`; public connection requires no seller credential.

Use `acqpath_capabilities` or GET `/v1/capabilities` before integrating. Permit `acqpath_rights_quote` only when a selected supported resource needs evidence; it can fetch metadata and consume quota, and its result contains a private claim. Exclude the disabled legacy `acqpath_quote` tool.

Choose the actual purpose: `ai-input` for model context/summarization, `ai-index` for indexing/RAG corpus preparation, `ai-train` for training, `search` for search. RAG may need separate indexing and model-input evaluations. No paid `crawl` purpose exists; crawler access/robots policy is separate. Coverage is an exact origin allowlist and does not guarantee usable declarations for every page.

Read [documented OpenAPI](https://developers.getacqpath.com/openapi.json) for input constraints. Do not invent endpoints or send referral parameters to the API. Fresh and deep prices were 0.02 and 0.05 USDC on 2026-09-10; re-read live capabilities and verify the signed quote.

MCP prepares quotes; paid report delivery uses HTTP x402 outside MCP. Use the [reviewed buyer integration](https://github.com/reflectme-source/acqpath-distribution/tree/main/examples) for offer/report/receipt/delivery verification and encrypted checkpoints. The npm SDK is unpublished; use repository source. Never import a seller credential into a buyer application.

Only enter a purchase when the user's existing authorization covers its resource, purpose and finite spending limit. Use the buyer's configured signer; do not request or expose wallet keys/seeds. Keep claims, signatures and checkpoints outside LLM prompts and logs. Save the checkpoint before submitting authorization. One logical ID identifies one purchase; after ambiguity, resume the same checkpoint without re-quoting, signing again or deleting recovery state.

UNKNOWN, unavailable/unsupported, DENY_DECLARED and LICENSE_REQUIRED hold ingestion. ALLOW_DECLARED records an observed allowance under the supported profile; it is not ownership verification or a license. Preserve resource, purpose, context and timestamp with the evidence. A verified service receipt is not independent chain finality.

Use [recovery guidance](https://developers.getacqpath.com/recovery) when state is ambiguous. Reconciliation has not been repaired by distribution work; do not promise zero-support recovery, paid-MCP compatibility, Bazaar indexing or successful purchases without separate evidence.

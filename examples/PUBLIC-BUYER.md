# Public HTTP buyer integration

Use before RAG ingestion (`ai-index`), research/summarization (`ai-input`), training (`ai-train`) or search indexing (`search`). Crawling is not a paid purpose. Check robots, terms and access controls separately.

Stable endpoint: `https://api.getacqpath.com/v1/rights/preflight`. No AcqPath account, API key or operator token. Existing supported origins are medium.com, theguardian.com, rslstandard.org and rslcollective.org; inspect live capabilities for exact coverage. Unsupported or blocked resources are not promises of a purchasable result.

```json
{"resource":"https://rslstandard.org/","purpose":"ai-input","tier":"fresh","max_total_micro":"20000"}
```

JavaScript: run `node examples/public-preflight.mjs`. Python: run `python examples/public-preflight.py`. Both prepare an unpaid real request and print only a safe summary. TypeScript: pass that probe into `workflows` in public-workflows.ts. MCP clients connect to `https://api.getacqpath.com/mcp`; discover capabilities first. MCP does not perform the HTTP purchase and is not a universal paid proxy. These commands never invoke a wallet.

| Stage | Required buyer behavior | Current verification |
|---|---|---|
| Discover | Read capabilities and canonical contract GET | Live unpaid |
| Prepare | POST resource and purpose; retain private X-AcqPath-Request | Live unpaid 402 |
| Review | Verify Ed25519 binding and JWS offer with pinned public key; bind normalized input hash and exact nonce | Reviewed Phase 4 reference, real unpaid verification |
| Pay | Standard x402 v2 PAYMENT-SIGNATURE envelope carrying an exact EIP-3009 authorization with the verified binding nonce | Generic random-nonce clients incompatible; external paid result unproven |
| Deliver | Verify report evidence, settlement receipt, delivery proof, amount, input and transaction | Schema and offline behavior; no external paid delivery claimed |
| Retry | Same persisted body/context/payment only; no second signature | Unpaid context idempotency verified; live paid retry unproven |

The public required extension is `acqpath-request-binding`. A generic `wrapFetchWithPayment`, Python x402 client, Payments MCP or proxy that generates its own nonce must not be advertised as a working purchase example. A custom scheme integration must support the extension **before signing**. Never change nonce after signing, pass the private request header through catalogs, use quote/claim APIs as an undocumented prerequisite, or infer successful payment from a 402.

The executable samples deliberately stop before signature verification/signing rather than pretending decoded headers are trusted. They are unpaid preparation examples, not production payment SDKs. The repository legacy client targets legacy report URLs, and npm remains unpublished. This is the principal remaining self-service conversion blocker; fixing generic interoperability requires separate production-core authorization or a reviewed extension-aware buyer SDK.

A successful response uses the schema returned by GET at the same public endpoint, including `report`, `evidence`, `payment_settlement` and `delivery_proof`. An HTTP 200 `{available:false,charge_micro:"0"}` is an unavailable response, not a delivered paid report. Example outputs in the schema are synthetic and their zero signatures must never be accepted as evidence.

Fresh 20,000 micro-USDC (0.02 USDC); deep 50,000 (0.05 USDC), Base eip155:8453. Verify live terms and a finite buyer budget. Paying buys observed evidence, not a license. ALLOW_DECLARED does not grant permission; DENY_DECLARED, LICENSE_REQUIRED and UNKNOWN require a hold under buyer policy. Preserve encrypted recovery state outside prompts/logs; after ambiguous submission, never create a replacement payment.

No owner-funded test, signature, wallet funding or indexing settlement is part of this workflow.

Live validation: JavaScript reached a prepared LICENSE_REQUIRED 402. Python urllib received HTTP 403 from this environment and stopped without bypass; its paid or network equivalence is not verified. Syntax and offline behavior do not override that network limitation.

# AcqPath — can your agent use this content?

Check observed content-use declarations **before AI input, RAG indexing, training or search**. AcqPath returns signed evidence of observed RSL declarations for supported URLs. It does not grant a license, establish ownership or provide legal clearance. UNKNOWN never authorizes ingestion.

[Start integrating](https://developers.getacqpath.com/from-github) · [Supported scope](https://developers.getacqpath.com/scope) · [Examples](examples/README.md) · [MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers/com.getacqpath%2Facqpath/versions/3.1.0-rc.3) · [Smithery](https://smithery.ai/servers/reflectme-project/acqpath-rights-preflight) · [Glama](https://glama.ai/mcp/connectors/com.getacqpath/acqpath)

| Before this workflow | Report purpose | Boundary |
|---|---|---|
| Model context, summarization, research | `ai-input` | Observed declarations; application policy still decides use |
| RAG corpus ingestion and indexing | `ai-index` | Indexing evidence is separate from model input |
| Training dataset ingestion | `ai-train` | Training evidence does not acquire a license |
| Search indexing | `search` | Search evidence does not authorize crawling |
| Crawling | No paid crawl purpose | Check robots, terms and crawler policy separately before downstream preflight |

Fresh **0.02 USDC**; deep **0.05 USDC**, observed 2026-09-10. Read live [capabilities](https://api.getacqpath.com/v1/capabilities) and verify the signed quote before authorizing payment. Current origin coverage is exactly `https://medium.com`, `https://theguardian.com`, `https://rslstandard.org`, and `https://rslcollective.org`. Coverage is not a promise that every URL returns a purchasable or permissive report.

## Start with the stable public endpoint

POST `https://api.getacqpath.com/v1/rights/preflight` with a resource URL and purpose. No AcqPath account, API key or private operator token. [Public buyer journey](https://developers.getacqpath.com/public-http) · [JavaScript/Python/TypeScript examples](examples/PUBLIC-BUYER.md).

**Compatibility:** The public endpoint supports unchanged official exact-EVM payment signers through the AcqPath SIWX adapter (TypeScript/Node and Python/httpx). The adapter reserves unsigned authorization fields, validates and signs the official SIWX request/payment challenge, then submits the original payment. Existing acqpath-request-binding nonce clients remain supported. On the secure SIWX endpoint, generic zero-config x402 clients and stock SIWX-only hooks are not compatible. Payments MCP and generic paid proxies are not claimed. Mainnet paid E2E remains UNVERIFIED; no owner-funded payment. [Configured TS/Python examples](examples/OFFICIAL-CLIENTS.md).

Bazaar: **AWAITING FIRST EXTERNAL SETTLEMENT**. No owner-funded payments, wallet funding or indexing QA is requested.

## Connect once

For clients supporting remote HTTP MCP configuration:

```json
{"mcpServers":{"acqpath":{"url":"https://api.getacqpath.com/mcp"}}}
```

[Client-specific configuration](https://developers.getacqpath.com/connect) includes VS Code and the supported Streamable HTTP transport. Use `acqpath_capabilities` first. `acqpath_rights_quote` can prepare a quote and consume metadata quota. The upstream legacy `acqpath_quote` routing tool is disabled; exclude it in your client.

**MCP prepares quotes. Paid report delivery uses HTTP x402 outside MCP.** Quote claims belong in private application state, outside model context, telemetry and gateway logs. Do not enable blanket tool approval.

## Integrate the current public SIWX buyer

[Install and call from TS/Python](examples/OFFICIAL-CLIENTS.md) · [Node wrapper](examples/official-node.mjs) · [Python wrapper](examples/official-python.py) · [Example index](examples/README.md)

1. Check current origin coverage and select the downstream purpose.
2. Call public Rights Preflight through the AcqPath SIWX adapter with one stable operation ID; hold unsupported/UNKNOWN outcomes.
3. Verify the signed offer and its exact URL, recipient, network, asset and amount.
4. Keep the official EIP-3009 signer and random nonce unchanged. The adapter persists private state and adds SIWX authorization. Its checkpoint store is not application-level encrypted; use private ACLs/encrypted storage.
5. Retrieve over HTTP x402; verify report, receipt and delivery binding.
6. After ambiguous submission, resume the same checkpoint and authorization. Never blindly create a second payment.
7. Keep the evidence and private recovery state separate from application permission. Even `ALLOW_DECLARED` requires an application policy decision.

The public SIWX adapters are supplied in [examples](examples/OFFICIAL-CLIENTS.md). The separate [packages/rights-client](packages/rights-client) SDK is the retained legacy quote/claim integration. **npm publication is on owner hold**; do not attempt an npm install of this unpublished package. Examples use repository-relative imports. The configured Python/httpx adapter is supplied as source; no PyPI package is published.

## Machine-readable integration reference

[llms.txt](https://developers.getacqpath.com/llms.txt) · [Full reference](https://developers.getacqpath.com/llms-full.txt) · [OpenAPI subset](https://developers.getacqpath.com/openapi.json) · [Discovery profile](https://developers.getacqpath.com/.well-known/acqpath-distribution.json) · [Pricing snapshot](https://developers.getacqpath.com/pricing.json) · [Agent skill](skills/acqpath-rights-preflight/SKILL.md)

The public skill describes when and how to integrate; it never authorizes spending. Its source is ready for compatible skills clients. Presence in this repository is not proof of ranking in a skills directory.

## Verification and operating scope

This repository contains distribution documentation and the client, not the production backend. Node 22.16+ is required; no root runtime dependencies or install step is needed for tests/build. Maintainer commands are documented in [the execution plan](docs/EXECUTION-PLAN.md).

Daily [public discovery verification](.github/workflows/visibility.yml) checks public metadata, docs and links without quotes, wallets or operator secrets. A GitHub push runs CI; the isolated Cloudflare Pages project uses a separate reviewed direct upload.

[Channel matrix](CHANNEL-MATRIX.md) · [Discovery tests](DISCOVERY-TESTS.md) · [Bazaar compatibility](BAZAAR-COMPATIBILITY.md) · [Revenue baseline](REVENUE-BASELINE.md) · [Revenue analysis](REVENUE-OPTIMIZATION.md) · [Acceptance](docs/ACCEPTANCE.md)

The SDK's MIT license applies only to its [client package](packages/rights-client/LICENSE). No blanket license is granted to the backend, service output or publishers' content. The distribution root remains UNLICENSED. No real payment, wallet signature, independent customer or organic revenue is claimed by this release.

## Documentation for coding agents

The public [integration skill](skills/acqpath-rights-preflight/SKILL.md) and [full machine reference](https://developers.getacqpath.com/llms-full.txt) describe the private buyer flow. A separate [GitMCP documentation endpoint](https://gitmcp.io/reflectme-source/acqpath-distribution) exposes this public repository as searchable context; it does not execute or replace the paid AcqPath service. Its metadata connection was verified; search quality is recorded separately in DISCOVERY-TESTS.md.

## Common integration questions

**Can I use this page for RAG?** AcqPath can report observed RSL declarations for a supported page. Use `ai-index` for corpus indexing and separately evaluate `ai-input` when supplying content to a model. UNKNOWN, unsupported coverage and license-required outcomes hold ingestion. Signed evidence supports your own policy decision; it does not grant permission or replace a license.

**Where do I check machine-readable usage restrictions?** Read the current capabilities, then prepare an RSL rights quote for the actual purpose and supported origin. The private HTTP/x402 integration obtains and verifies the signed report. AcqPath does not prove ownership or legal clearance, and crawl/robots policy remains a separate check.


## Live Rights Gateway release

Preflight remains **0.02 USDC fresh / 0.05 deep**. **Ingestion Gate** checks 1–4 unique reviewed URLs: **0.04 + 0.02 per URL fresh**, **0.06 + 0.04 per URL deep**. **Revalidation** compares one resource with an authentic signed prior gateway checkpoint: **0.03 fresh / 0.06 deep**. All payments use Base USDC. Gateway fees cover bounded observation attempts, including UNKNOWN. No legal clearance, license purchase or whole-domain coverage.

Use the tested official TS/Python signer + AcqPath SIWX adapter. [Complete gateway examples](https://developers.getacqpath.com/examples/GATEWAY.md) include private state, retry and delivery verification. [Live gateway guide](https://developers.getacqpath.com/gateway). Mainnet paid E2E awaits a real external buyer; verified organic revenue remains 0 USDC. Development freeze: only incidents, security, standards compatibility and monitoring.


## Separate stock marketplace mode

`POST /v1/rights/preflight/x402` accepts unmodified official TypeScript x402 2.25.0 and Python x402 2.22.0 buyers, with no AcqPath SIWX/custom signer/buyer hook. Fresh only, **0.02 USDC on Base**. The first valid payment atomically binds one request; it does not provide pre-signature cryptographic body binding. A leaked pre-use authorization can be raced. Keep exact signed requests private and recover with the same authorization; never sign again after uncertainty. SIWX remains recommended on the existing secure route. [Stock JSON, official clients and recovery](https://developers.getacqpath.com/examples/STOCK-X402.md). External mainnet paid E2E remains UNVERIFIED until independently evidenced.

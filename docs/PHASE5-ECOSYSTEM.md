# Current machine discovery ecosystem — 2026-09-11

| Surface | Classification | AcqPath state / action |
|---|---|---|
| Official MCP Registry | LIVE NOW | Existing canonical server; intent metadata revision, no duplicate server |
| Smithery / Glama | LIVE NOW | Existing MCP discovery/quote listings; generic paid execution not claimed |
| GitHub / developer docs / GitMCP | LIVE NOW | Public intent and machine-readable reference; no payment attribution implied |
| CDP Bazaar | AUTO-INDEX AFTER EXTERNAL SETTLEMENT | AWAITING FIRST EXTERNAL SETTLEMENT |
| Agentic.Market | AUTO-INDEX AFTER EXTERNAL SETTLEMENT | Coinbase marketplace surfaces Bazaar; no separate registration form claimed |
| CDP Agentic Wallet search | AUTO-INDEX AFTER EXTERNAL SETTLEMENT | Catalog discovery available; direct buying requires client nonce compatibility |
| Payments MCP / Bazaar proxy_tool_call | NOT COMPATIBLE | No proof these standard clients support AcqPath required nonce/context; do not invoke paid tools |
| x402scan | LOW VALUE | Useful independent transaction/resource cross-check; not a substitute for signed delivery or buyer independence; submission path unverified |
| x402 Foundation membership directory | LOW VALUE | Ecosystem membership, not a self-service paid resource catalog; no membership or paid placement sought |
| Existing Docker/PulseMCP submissions | MANUAL SUBMISSION AVAILABLE | Prepared metadata exists; moderation is not publication; avoid duplicate submissions |

[CDP seller discovery](https://docs.cdp.coinbase.com/x402/seller/get-discovered) says eligible discovery follows successful settlement, with no separate registration form. Validation alone is insufficient. [Agentic Market](https://agentic.market/) links a validator; it is operated by Coinbase. This phase does not force indexing through an internal purchase.

[Public Bazaar discovery](https://docs.cdp.coinbase.com/x402/buyer/discover-services) offers merchant lookup and intent search without a CDP key. [Agentic Wallet search](https://docs.cdp.coinbase.com/agentic-wallet/cli/skills/search-for-service) consumes Bazaar and can cache results; inspect current public APIs for readback. Search rank and partial results are not inventory completeness or demand.

[Payments MCP FAQ](https://docs.cdp.coinbase.com/agentic-wallet/mcp/faq) describes automatic x402 payment tooling. AcqPath's required binding must be independently supported before calling such paid tooling. [Bazaar MCP](https://docs.cdp.coinbase.com/api-reference/v2/rest-api/x402-facilitator/bazaar-mcp-server) provides discovery and a paid proxy; metadata availability alone does not prove proxy compatibility.

[x402scan](https://www.x402scan.com/) is an explorer; [x402 get involved](https://x402.org/get-involved/) concerns community participation. Neither is evidence AcqPath has an independent customer. No cold outreach, purchased traffic, fake reviews or self-purchases are used.

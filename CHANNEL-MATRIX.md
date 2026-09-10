# Phase 2 channel matrix — 2026-09-10

This is a bounded review of the active, relevant surfaces below, not a claim to exhaust the internet. Qualified traffic and incremental revenue are UNKNOWN for every channel. Tier and potential describe buyer fit, not a traffic forecast. No ads, paid directory placements, fabricated reviews, self-installs or settlement traffic were purchased.

A = agents already capable of payments; B = developers actively selecting agent tools; C = broader developer discovery; D = general directory/SEO traffic. A healthy MCP connector does not prove the separate paid HTTP integration works.

| Channel / primary source | Tier | Decision | Actual state and next gate |
|---|---|---|---|
| [Official MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers/com.getacqpath%2Facqpath/versions/3.1.0-rc.2) | B | ALREADY_PUBLISHED | VERIFIED LIVE: exact rc.2 record, active, read back 14:42 UTC. New version changes metadata only; core remains rc.1. |
| [Smithery](https://smithery.ai/servers/reflectme-project/acqpath-rights-preflight) | B | PUBLISH_NOW | VERIFIED LIVE: endpoint release succeeded; public description and tools read back. Precise RSL capability search found the listing; other queries are mixed. |
| [Glama remote connector](https://glama.ai/mcp/connectors/com.getacqpath/acqpath) and per-tool index | B | ALREADY_PUBLISHED | VERIFIED LIVE: an existing official-registry-linked record is healthy and found by brand. Duplicate submission was rejected, so no duplicate was created. Owner-approved DNS proof verified; detailed metadata editing is supported. |
| [Docker MCP Catalog](https://github.com/docker/mcp-registry/blob/main/CONTRIBUTING.md) | B | SUBMIT_FOR_REVIEW | READY BUT OWNER ACTION REQUIRED: three-file remote entry prepared in metadata/docker/acqpath; public fork/PR awaits specific approval requested after automatic review rejected it. No PR is claimed. |
| [PulseMCP](https://www.pulsemcp.com/submit) | B | SUBMIT_FOR_REVIEW | PENDING SERVICE REOPENING, NOT SUBMITTED: intake paused since 2026-09-03; page directs publishers to the official registry for later ingestion. No email or support-ticket bypass. |
| [GitHub distribution repository](https://github.com/reflectme-source/acqpath-distribution) | C/B for coding agents | ALREADY_PUBLISHED | VERIFIED LIVE repository; Phase 2 README, examples, topics/homepage and release are tracked in acceptance evidence. Public source is distribution/client only. |
| [GitHub curated MCP gallery](https://github.com/mcp) | B | LOW_VALUE / SKIP direct submission | Active curated surface; no open self-service seller publication route was verified. Official-registry publication does not prove inclusion here. Direct client config remains usable. |
| [Context7 Add Libraries](https://context7.com/add-library) | B | PUBLISH_NOW | READY BUT OWNER ACTION REQUIRED: adding public docs requires sign-in. Use the distribution repository/docs only after deployment; never authorize production repository access. |
| [GitMCP](https://gitmcp.io/) | B | PUBLISH_NOW | Public repository URL supports documentation MCP conversion; separate metadata-only verification is recorded in DISCOVERY-TESTS. It is documentation retrieval, not the paid AcqPath endpoint. |
| [Agent Skills / skills.sh](https://skills.sh/docs) | B/C | PUBLISH_NOW source; LOW_VALUE / SKIP artificial ranking | Valid public integration skill prepared in skills/acqpath-rights-preflight/SKILL.md and served as /SKILL.md. Directory indexing is not inferred from source availability; no fake installs to create rankings. |
| [Docs, llms, OpenAPI, robots and sitemap](https://developers.getacqpath.com/llms.txt) | B/C; machine readable | PUBLISH_NOW | Published distribution build with 19 pages and explicit machine assets; exact public bytes/headers/links verified in deployment acceptance. Search engine indexing remains separately observable. |
| [Coinbase x402 Bazaar](https://docs.cdp.coinbase.com/x402/seller/get-discovered) | A | REQUIRES_CORE_CHANGE | BLOCKED BY CORE: missing native Bazaar extension and unproven private-preparation compatibility. No indexing payment. See BAZAAR-COMPATIBILITY. |
| [Agentic Market](https://agentic.market/about) | A | REQUIRES_CORE_CHANGE | BLOCKED BY CORE: Bazaar-derived paid discovery; not a separate successful listing. No-match Bazaar queries are query-specific. |
| [Agentic Wallet service search](https://docs.cdp.coinbase.com/agentic-wallet/cli/skills/search-for-service) | A | REQUIRES_CORE_CHANGE | BLOCKED BY CORE: consumes the same resource discovery layer. No wallet initialization, signatures or paid fetches performed. |
| [Amazon Bedrock AgentCore via CDP discovery](https://docs.cdp.coinbase.com/x402/seller/get-discovered) | A/B | REQUIRES_CORE_CHANGE | BLOCKED BY CORE for the advertised Bazaar route. This is downstream availability described by CDP, not an independent AcqPath publication. No AWS account or infrastructure created. |
| [x402scan](https://www.x402scan.com/discovery/spec) | A | REQUIRES_CORE_CHANGE | BLOCKED BY CORE: API-origin OpenAPI payment metadata and probeable private workflow missing. SIWX registration would additionally require a separately approved wallet signature. |
| [agentcash / Poncho](https://www.x402scan.com/discovery) | A | REQUIRES_CORE_CHANGE | BLOCKED BY CORE for scanner-derived paid discovery/storefronts. No paid proxy, new seller wallet or storefront is claimed. |
| [MCP.so remote submissions](https://mcp.so/submit?type=remote-server) | B/D | LOW_VALUE / SKIP | SKIPPED AS LOW VALUE: actual remote form requires $39 placement. No free option was offered; no payment or advertisement. |
| [MCP Market remote submissions](https://mcpmarket.com/submit) | B/D | LOW_VALUE / SKIP | SKIPPED AS LOW VALUE: remote form requires $69. Its free queue applies to other submission types; do not mislabel the docs repository as backend source. |
| [Microsoft MCP registry](https://github.com/microsoft/mcp-server-registry) | B | TECHNICALLY_INCOMPATIBLE | Current documented scope is Microsoft first-party servers. AcqPath is not eligible under that scope. |
| Generic awesome lists / cloned directories / paid badges | C/D | LOW_VALUE / SKIP | No unreviewed mass submissions. Favor the working remote indexes, concrete intent pages and private buyer integration over vanity count. |

## Expected commercial quality and operating cost

| Surface group | Relevance / expected qualified traffic | Integration cost | Maintenance | Revenue potential and uncertainty |
|---|---|---|---|---|
| Bazaar + paid-agent derivatives | Highest payment readiness; actual qualified volume UNKNOWN | High now: separately approved protocol/adapter work and acceptance | Medium/high: probes, schema drift, settlement/recovery | Potentially strongest fit; no demonstrated AcqPath demand or uplift |
| MCP Registry + Smithery + Glama | High tool-selection intent; precise rights queries outperform broad crawl traffic | Low metadata cost; medium private HTTP buyer integration | Low/medium: daily public checks and listing updates | Leads can become recurring integrations, but MCP connection alone cannot pay |
| Docker remote catalog | High developer adoption intent, curated trust | Low metadata; review queue and optional client-specific validation | Low if accepted | Unquantified; submission is not distribution until merged/indexed |
| Context7 + GitMCP + integration skill | Strong implementation context after intent discovery | Low public-docs indexing/config; owner login where required | Low: keep examples and canonical docs current | Can reduce integration/support friction; not independently measured acquisition |
| GitHub + search-indexable docs | Mixed machine and developer intent; volume UNKNOWN | Low, already hosted | Low: docs/links/examples/CI | Useful durable context; views and stars are not sales |
| Paid generic listings | Unproven qualified incremental reach | Monetary fee plus upkeep | Low/medium | No demonstrated return; skipped under no-ad-spend instruction |

## Publication integrity

Only factual supported purposes (`ai-input`, `ai-index`, `ai-train`, `search`) are advertised. Crawl is a separate policy boundary. Documentation tool descriptions are explicitly an overlay; remote tools/list remains unchanged, including the disabled legacy entry. No listing asserts licensing authority, ownership verification, legal clearance, provider routing or proven paid MCP.

Current-source checks used each service's own docs, public API, maintained repository or live submission form. The forms on MCP.so, MCP Market, PulseMCP, Glama and Context7 were inspected directly on 2026-09-10; older third-party guides can describe obsolete free submission flows. Smithery now links its Arcade.dev acquisition notice; no obsolete deployment assumption is used.

Final verification evidence and pending owner actions are maintained in [DISCOVERY-TESTS.md](DISCOVERY-TESTS.md) and [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md). No channel is promoted from pending to published without independent public readback.

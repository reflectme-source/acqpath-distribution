# Channel status — Day 0 public readback

Readback time: 2026-09-27T08:50Z unless noted. Scope is public/read-only channel state. No wallet signature, payment, Cloudflare mutation, production deployment, price change or core change occurred.

## Summary

| Channel | Current state | Buyer value | Revenue status | Next commercial gate |
|---|---|---|---|---|
| Production API | LIVE; public audit PASS; expected source hash and protected values match config | Purchase path exists | One marketplace verification settlement; zero organic | Independent external buyer repeats |
| Developer docs | PUBLIC_DOCS_VERIFIED on `developers.getacqpath.com` and Pages origin | Clear secure-vs-stock buyer path | Documentation only | External workflow uses it |
| Agent402 | Seller index live; health 1; 16 tools, 4 paid tools, paywall 402 OK | Good machine-buyer surface | No Agent402 settlement evidence | Routed/agent buyer pays and repeats |
| PayAPI | Listing live, `payment_verified:true` | Marketplace proof of stock payment path | 1 marketplace verification settlement | Subsequent non-verification buyer activity |
| CDP/Bazaar discovery | No AcqPath hit by payTo, brand or rights-intent queries | Not discoverable through Bazaar yet | 0 | Real external settlement that carries valid Bazaar extension/indexing signal |
| Bazaar MCP | Not callable for AcqPath because Bazaar catalog has no AcqPath resource | Blocked by discovery absence | 0 | AcqPath appears in CDP/Bazaar search_resources |
| MCP Registry | `com.getacqpath/acqpath` rc.3 active/latest | MCP discovery and quote prep | MCP itself does not settle paid HTTP | Convert MCP users to HTTP/x402 buyer path |
| Smithery | Public page responds; listing exists | MCP tool discovery | No paid MCP compatibility claimed | Integration lead uses HTTP paid path |
| Glama | Public connector page responds | MCP connector discovery | No paid MCP compatibility claimed | Integration lead uses HTTP paid path |
| true402 | Free listing live by API search, reputation transactions 0 | Stock x402 endpoint discovery | 0 true402 settlements | Buyer discovers and pays stock route |
| x402.new | Site live; no AcqPath marker in fetched page/search evidence | Not currently a verified listing | 0 | Appears after upstream x402/Bazaar discovery or direct index inclusion |
| x402scan | No verified AcqPath visibility from current public search evidence | UNVERIFIED | 0 | Listing/readback appears without payment |

## Production values verified

- network: `eip155:8453`
- asset: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- payTo: `0xf69DBbd053fb0Fbc78ADfdB1BFe3b0D1F57300ec`
- Rights Preflight fresh: `20000` micro-USDC = 0.02 USDC
- Rights Preflight deep: `50000` micro-USDC = 0.05 USDC
- provider routing: false in public audit
- npm SDK publication: disabled by owner request

## Agent402 readback

Agent402 public index returned:

- origin `https://api.getacqpath.com`
- `health:1`, `routable:true`
- networks `eip155:8453`
- payTo `0xf69DBbd053fb0Fbc78ADfdB1BFe3b0D1F57300ec`
- USDC asset `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- paid routes:
  - `POST /v1/rights/preflight` — `$0.02`, last verified 2026-09-27T08:39:46Z
  - `POST /v1/rights/ingestion-gate` — `$0.06`, last verified 2026-09-27T08:39:46Z
  - `POST /v1/rights/revalidate` — `$0.03`, last verified 2026-09-27T08:39:46Z
  - `POST /v1/rights/preflight/x402` — `$0.02`, last verified 2026-09-27T08:39:47Z

This is strong route visibility, not proof of a routed payment.

## PayAPI readback

PayAPI public listing returned:

- slug `acqpath-rights-preflight`
- status `live`
- `payment_verified:true`
- network `base`
- price range `0.02`–`0.05`
- base URL `https://api.getacqpath.com`

The verified payment remains classified as MARKETPLACE_VERIFIER, not organic demand.

## CDP/Bazaar readback

Queries against `https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources` returned HTTP 200 but no AcqPath hit for:

- payTo `0xf69DBbd053fb0Fbc78ADfdB1BFe3b0D1F57300ec`
- `AcqPath`
- `RSL rights preflight`
- `AI content usage rights`
- `RAG ingestion rights`
- `training usage rights`

Bazaar remains the biggest machine-buyer discovery gap. The live 402 contains Bazaar extension metadata, but no catalog hit is visible. No owner-funded indexing payment was made.

## Development freeze confirmation

No production code, Cloudflare, price, payTo, payment asset/network/facilitator, Access, provider routing, reconciliation or database schema was changed. The acquisition problem remains distribution/integration, not a proven product incident.

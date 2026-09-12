# Current public Rights Preflight examples

Start with the [complete TypeScript / Python installation, call and delivery verification guide](OFFICIAL-CLIENTS.md). The tested official x402 payment signer and random nonce remain unchanged; use the AcqPath SIWX adapter. No AcqPath account or seller API key is required. New buyers do not construct a legacy bound payment nonce.

| File | Role |
|---|---|
| [acqpath.mjs](acqpath.mjs) + [official-node.mjs](official-node.mjs) | Tested official TypeScript/Node x402 + AcqPath SIWX integration |
| [acqpath_httpx.py](acqpath_httpx.py) + [official-python.py](official-python.py) | Tested official Python x402/httpx + AcqPath SIWX integration |
| [official-client-package.json](official-client-package.json) | Exact Node dependency pins; save as package.json in a separate buyer application |
| [official-requirements.txt](official-requirements.txt) | Tested Python dependency pins, including ABNF compatibility |
| [public-preflight.mjs](public-preflight.mjs), [public-preflight.py](public-preflight.py) | Unpaid preparation only; decoding does not verify signatures |
| [read-only.mjs](read-only.mjs), [read-only.py](read-only.py) | Capability GET only; no quote or payment |
| [public-workflows.ts](public-workflows.ts) | Unpaid purpose/workflow gates |
| [evidence-gate.mjs](evidence-gate.mjs), [workflows.ts](workflows.ts) | Existing legacy quote/claim SDK examples, not the public SIWX adapter |

Fresh 0.02 USDC; deep 0.05 USDC on Base. Verify live signed terms. The adapters verify the offer, report, receipt and delivery binding. Use a stable operation ID and private durable store; after ambiguity reuse the SAME ID, input and directory. Stored bearer authorizations are not application-level encrypted. Protect storage with private ACLs and preferably disk encryption; never share it or delete unresolved operations.

Generic zero-config x402, stock SIWX-only hooks, Payments MCP and generic paid proxies are NOT CLAIMED compatible. Independent external MAINNET PAID E2E remains UNVERIFIED; verified external revenue is 0 USDC. UNKNOWN is not permission and a report is not a license. No example initializes a wallet or contains secrets.


## Live Rights Gateway release

Preflight remains **0.02 USDC fresh / 0.05 deep**. **Ingestion Gate** checks 1–4 unique reviewed URLs: **0.04 + 0.02 per URL fresh**, **0.06 + 0.04 per URL deep**. **Revalidation** compares one resource with an authentic signed prior gateway checkpoint: **0.03 fresh / 0.06 deep**. All payments use Base USDC. Gateway fees cover bounded observation attempts, including UNKNOWN. No legal clearance, license purchase or whole-domain coverage.

Use the tested official TS/Python signer + AcqPath SIWX adapter. [Complete gateway examples](https://developers.getacqpath.com/examples/GATEWAY.md) include private state, retry and delivery verification. [Live gateway guide](https://developers.getacqpath.com/gateway). Mainnet paid E2E awaits a real external buyer; verified organic revenue remains 0 USDC. Development freeze: only incidents, security, standards compatibility and monitoring.


## Separate stock marketplace mode

`POST /v1/rights/preflight/x402` accepts unmodified official TypeScript x402 2.25.0 and Python x402 2.22.0 buyers, with no AcqPath SIWX/custom signer/buyer hook. Fresh only, **0.02 USDC on Base**. The first valid payment atomically binds one request; it does not provide pre-signature cryptographic body binding. A leaked pre-use authorization can be raced. Keep exact signed requests private and recover with the same authorization; never sign again after uncertainty. SIWX remains recommended on the existing secure route. [Stock JSON, official clients and recovery](https://developers.getacqpath.com/examples/STOCK-X402.md). External mainnet paid E2E remains UNVERIFIED until independently evidenced.

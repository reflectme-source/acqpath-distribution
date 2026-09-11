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

# Public Rights Preflight buyer journey

Use [configured official TS/Python integration](OFFICIAL-CLIENTS.md) for the deployed SIWX profile. No AcqPath account or seller API key is needed. The legacy quote/claim SDK remains separate.

1. Read live capabilities and select a supported resource/purpose.
2. Prepare POST /v1/rights/preflight with a private stable context and finite budget. Empty POST is discovery-only.
3. Verify the signed offer, normalized request binding and independently pinned terms/key.
4. The adapter keeps the official EIP-3009 signer and random nonce unchanged, reserves unsigned authorization fields, verifies and signs the official SIWX challenge, then submits the saved payment/proof. Existing request-bound-nonce clients remain supported.
5. Verify the report, receipt and delivery proof. An available:false response with charge_micro:0 is not a purchased report.
6. Recover with exactly the same operation ID, input and private store. No new payment signature on resume. Uncertain 503 requires existing reconciliation.

Generic zero-config x402 clients, stock SIWX-only hooks, Payments MCP and paid proxies are not supported by these tests. EOA only. Store bearer authorizations outside prompts/logs/Git in private ACL-protected storage; see the guide for retention and canonical-input restrictions.

Public Node, standard Python/httpx and urllib reachability PASS after the narrow BIC rule on 2026-09-11. Real rslstandard.org/ prepared LICENSE_REQUIRED at 20000 micro-USDC (0.02 USDC), Base eip155:8453. No publisher 403 or SSRF restriction was bypassed.

Fresh 0.02 USDC, deep 0.05 USDC; exact live signed terms control a buyer-authorized purchase. UNKNOWN is not permission. Reports do not provide a license or legal clearance.

Local cryptographic E2E and unpaid production validation PASS. MAINNET PAID E2E = UNVERIFIED. No owner-funded payment or indexing settlement.

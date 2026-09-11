> Historical pre-release record — superseded for buyer integration. Production `0c3b5794-f428-4e69-879e-29cab293cd1a` (core `9533e49d262d20d5bb3712321fbc66981e477418`) supports tested official TS/Python x402 signers through the AcqPath SIWX adapter. Old blocker/design statements below describe only their dated snapshot; they are not current buyer instructions or authorization for another phase/payment. Use the [current installation, purchase and recovery guide](https://developers.getacqpath.com/examples/OFFICIAL-CLIENTS.md). Generic zero-config clients are not claimed; independent mainnet paid E2E remains UNVERIFIED.

# Historical AcqPath paid flow

> Historical Phase 3 review. Its no-core-change status records that phase only. The subsequently authorized additive Phase 3B adapter is implemented; see [current engineering status](BAZAAR-ENGINEERING-STATUS.md). Production and payment boundaries still apply.

Review date: 2026-09-10. State: **BLOCKED** for Bazaar. Core source was inspected before preparing any review files. No core file was edited.

## Source identity

The clean local core HEAD is `45d3bd1530246bd653206196c748b975140691d5`. Its source digest is `77cf20d889b818b94439e1040828fa416d6b2a2a8f5d3741c78f9cb569a0b45a`.

The public `/health` response at 17:15 UTC advertises `7b7b830d434bac12bf7b42f7b706757e2ca8dab15349adc367985208f4329671`. Reconstructing the preceding commit `abe759698646c0fa5bb3ab75fa5e74003273d012` reproduces that digest exactly. The only intervening changes are `.github/scripts/tooling-audit.mjs`, `.github/scripts/tooling-audit.test.mjs` and `.github/workflows/ci.yml`. Runtime, SDK, payment, rights and reconciliation source is identical between these two commits. This is source/readback correspondence, not independent attestation of Cloudflare's deployed binary.

The source digest in `scripts/source-hash.mjs` hashes sorted `[relativePath, SHA256(normalized UTF-8)]` pairs. CRLF becomes LF. Included roots are src, scripts, packages, db, tests, public, .github, tooling, examples and docs; root command launchers, package manifests, .gitignore, .env.example and config examples also participate. Private directories, node_modules and real operator configuration are excluded. Thus a CI-only commit legitimately changes this digest.

## Exact sequence

1. `POST /v1/rights/quote` enters `src/worker.mjs` and `rightsQuote` in `src/native/service.mjs`. JSON is capped at 4096 bytes. Required inputs are resource, purpose and max_total_micro. Paid purposes are exactly ai-input, ai-train, ai-index and search. Defaults: commercial user, fresh tier, freshness 300 seconds; geo is optional. Paid crawl is rejected.
2. `src/native/input.mjs` rejects noncanonical or unsafe resource URLs. `rightsConfig` restricts origins. The service checks payment pause, budget and quote quota, then prepares/caches the bounded diagnostic report through the existing RightsCache Durable Object. Quote creation can consume source-fetch capacity even though it does not charge the caller.
3. No discovered declaration means an unavailable quote, UNKNOWN and zero charge. An unsupported but discovered declaration can produce a payable UNKNOWN report, disclosed before purchase. UNKNOWN never grants permission.
4. For a payable report, the server creates a random 24-byte quote ID (48 hex characters), a separate 32-byte claim (64 hex characters), and an expiry using the existing 120-second default. It stores only the claim hash in the intent. The quote response returns the claim privately, the quote ID, expiry, fee and redeem URL.
5. `challengeFor` in `src/payments/x402.mjs` constructs x402 **v2** requirements. The native service replaces the generic plan resource with `https://api.getacqpath.com/v1/rights/reports/<quote_id>`, description `Signed report of observed RSL declarations; not a license or legal clearance.`, MIME `application/json`.
6. `enrichOffer` in `src/payments/extensions.mjs` adds the existing payment-identifier declaration and signed offer-receipt extension. The signed offer binds the concrete report URL, amount, asset, recipient, network and expiry. There is no Bazaar declaration.
7. `GET /v1/rights/reports/<quote_id>` accepts only the matching private `X-AcqPath-Claim`. A missing/wrong claim gets 401 **before 402**. Unknown quotes get 404; expired unpaid quotes get 410. With a valid claim and no signature, `paymentRequiredResponse` returns the stored challenge as both JSON body and base64 `PAYMENT-REQUIRED`; cache-control is no-store.
8. A paid retry supplies the same private claim and `PAYMENT-SIGNATURE`. `parsePayment` checks v2, exact requirements, EIP-3009 authorization, EOA signature shape, validity window and optional resource URL equality. It accepts authorization expiry at most 300 seconds ahead; the advertised maxTimeoutSeconds remains 120. These existing rules were not changed.
9. `PaymentIntent` verifies through the existing Facilitator, reserves the optional payment identifier, financial capacity and global signer/token/network/nonce identity, then persists the complete deliverable and SETTLING journal before settlement. `/verify` and `/settle` receive the buyer's paymentPayload and stored accepted requirements.
10. Confirmed settlement becomes SETTLED. Timeout/uncertainty becomes UNCONFIRMED: no new signature or automatic second settlement. Existing operator-authorized reconciliation is unchanged. Serialized intent handling, NonceGuard and stored responses protect retries and cross-quote replay.
11. The JSON report has evidence, billing, payment_settlement and delivery_proof. `PAYMENT-RESPONSE` carries the signed receipt extension. The SDK verifies the offer, report context, receipt payer/transaction and delivery binding. A settled retry returns the existing report. Retired delivery returns 410; the financial journal remains.

## Requirements preserved

Exact / Base mainnet `eip155:8453`; USDC `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`; recipient `0xf69DBbd053fb0Fbc78ADfdB1BFe3b0D1F57300ec`; fresh `20000` and deep `50000` micro-USDC; maxTimeoutSeconds `120`; extra name `USD Coin`, version `2`.

MCP `/mcp` uses protocol 2025-06-18 and free metadata/quote tools. Payment is HTTP report redemption; there is no existing paid MCP tool. Native-only mode disables provider quotes and paid planning. Administrative paths retain their existing Access/operator boundary.

## Precise integration point and decision

An additive declaration would enter `rightsQuote` immediately after the native resource assignment and before `enrichOffer`/intent storage. However that alone cannot satisfy safe discovery. The existing SDK delegates payload construction to a signer and only adds payment-identifier; Bazaar roundtrip is not guaranteed for every old signer. The server forwards buyer-controlled extensions without binding them to the stored offer. The public catalog probe cannot manufacture the private prerequisite.

The existing **paid report retrieval** is the only truthful paid operation. Quote creation and XML inspection are free; the disabled provider plan is not a product; advertising MCP payment would invent functionality. A wrapper that creates an order, exposes a reusable challenge or accepts quote inputs at a paid endpoint changes request/authorization semantics. It requires a separately reviewed architecture decision. No misleading canonical public URL or metadata-only core patch was applied.

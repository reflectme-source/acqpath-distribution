# Purchase path audit — Day 0

Readback time: 2026-09-27T08:50Z. Method: public GET/readback plus two unpaid POST probes to production Rights Preflight routes using `https://rslstandard.org/`, `purpose: ai-input`, `tier: fresh`, `max_total_micro: 20000`. No signature, settlement, wallet, owner payment or second-charge test occurred.

## Intended buyer paths

| Route | Mode | Buyer compatibility claim | Price | Current unpaid result |
|---|---|---|---:|---|
| `POST /v1/rights/preflight` | secure x402 + AcqPath request binding / SIWX adapter | Official TS/Python x402 signer with AcqPath SIWX adapter; generic zero-config clients not claimed | 0.02 fresh / 0.05 deep | HTTP 402 with expected network/asset/payTo/amount and request-binding extensions |
| `POST /v1/rights/preflight/x402` | stock x402 v2 | Stock x402 v2 fresh-only; no SIWX/custom signer; no pre-signature body binding | 0.02 fresh only | HTTP 402 with expected network/asset/payTo/amount and Bazaar extension |
| `POST /v1/rights/ingestion-gate` | secure existing integration | Higher-value gateway SKU; stock route not claimed | starts 0.06 fresh | Agent402 indexes route; no payment tested |
| `POST /v1/rights/revalidate` | secure existing integration | Revalidation SKU; stock route not claimed | starts 0.03 fresh | Agent402 indexes route; no payment tested |

## Secure route unpaid probe

`POST https://api.getacqpath.com/v1/rights/preflight`

Result: HTTP 402.

Observed:

- network: expected `eip155:8453` present
- asset: expected Base USDC present
- payTo: expected AcqPath recipient present
- amount: `20000` present
- extensions: `bazaar`, `payment-identifier`, `offer-receipt`, `acqpath-request-binding`
- service name: `AcqPath Rights Preflight`
- description explicitly says this route requires request-binding nonce support or the AcqPath SIWX adapter; generic random-nonce clients cannot buy without the adapter.

This route is secure and explicit, but not zero-config stock.

## Stock route unpaid probe

`POST https://api.getacqpath.com/v1/rights/preflight/x402`

Result: HTTP 402.

Observed:

- network: expected `eip155:8453` present
- asset: expected Base USDC present
- payTo: expected AcqPath recipient present
- amount: `20000` present
- extensions: `bazaar`
- service name: `AcqPath`
- description: stock x402 v2 EIP-3009 fresh Rights Preflight, 0.02 USDC on Base, no SIWX, no pre-signature body binding.

This is the current lowest-friction machine-buyer path for generic stock x402 clients.

## Metadata quality notes

Both secure and stock 402 responses include Bazaar extension metadata. The illustrative Bazaar output example still includes `payment_settlement.network: eip155:84532` while the actual payable `accepts` entry correctly uses `eip155:8453`. This did not change during the audit. It is a metadata-quality issue to consider only if there is evidence it blocks real external Bazaar indexing or buyer execution; it is not evidence of wrong payment configuration.

## Discovery metadata

- `.well-known/x402`: HTTP 200 and includes stock/secure route metadata.
- OpenAPI: HTTP 200 and includes stock/secure routes and SIWX wording.
- Developer docs: public docs readback verified 69 files and 48 links on both production docs origins.
- `llms.txt`: HTTP 200 and distinguishes secure-vs-stock buyer paths.

## Compatibility assessment

- A stock x402 v2 buyer can target `/v1/rights/preflight/x402` for fresh Rights Preflight at 0.02 USDC without SIWX or a custom signer.
- A stock buyer should not be pointed at `/v1/rights/preflight` unless it implements the AcqPath SIWX/request-binding adapter.
- Ingestion Gate and Revalidation are valuable higher-price SKUs, but they are not currently claimed as stock zero-config endpoints.
- No live paid compatibility was retested in this audit because the mission prohibits owner-funded or artificial settlements.

## Current blockers to revenue

1. No verified independent external payer or repeat usage.
2. Bazaar/CDP discovery has no AcqPath catalog hit despite live unpaid 402 metadata.
3. Marketplace listings are visible, but visibility has not converted into organic paid operations.
4. The current aggregate does not expose failed payment attempts or channel attribution, so payment-friction diagnosis remains limited.

## Recommendation within development freeze

Do not build new product. Start Days 3–7 acquisition research: identify high-volume external-content workflows that already have x402/autonomous payment capability, prepare specific integration proposals, and prioritize routes where the stock endpoint can be inserted immediately before RAG/indexing/training/search ingestion.

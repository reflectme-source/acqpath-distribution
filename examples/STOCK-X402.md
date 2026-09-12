# Stock x402 fresh Rights Preflight

Use `POST https://api.getacqpath.com/v1/rights/preflight/x402` for the fixed fresh marketplace SKU: **0.02 USDC (20000 micro-USDC), Base mainnet `eip155:8453`**. USDC asset: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`; recipient: `0xf69DBbd053fb0Fbc78ADfdB1BFe3b0D1F57300ec`. Deep, Ingestion Gate and Revalidation are not offered through this endpoint.

This endpoint uses the normal official EIP-3009 signer and random nonce. **No AcqPath SIWX, custom signer, custom nonce or custom buyer hook.** Tested locally with official TypeScript x402 **2.25.0** and Python x402 **2.22.0** using real cryptographic signatures and simulated settlement. Independent external mainnet paid E2E remains **UNVERIFIED** until an external buyer completes it.

## Exact request and unpaid check

```json
{
  "resource": "https://rslstandard.org/",
  "purpose": "ai-input",
  "max_total_micro": "20000"
}
```

Use top-level `resource`, not `url`, `resources` or an `input` wrapper. Fresh is the default and the only accepted tier. Optional `"tier":"fresh"` is accepted. Purposes: `ai-input`, `ai-train`, `ai-index`, `search`. RAG corpus indexing and model input can require distinct purpose evaluations. `crawl` is not a purpose. Other allowed fields are `user_class`, `geo`, `freshness_seconds`; see [live OpenAPI](https://api.getacqpath.com/openapi.json).

```sh
curl -i https://api.getacqpath.com/v1/rights/preflight/x402 \
  -H 'Content-Type: application/json' \
  --data '{"resource":"https://rslstandard.org/","purpose":"ai-input","max_total_micro":"20000"}'
```

Expect HTTP **402** with x402 v2 `PAYMENT-REQUIRED`, exact amount `20000`, Base/USDC/recipient above and Bazaar schema. This unpaid request does not fetch the source or create an order. No `SIGN-IN-WITH-X` or `X-AcqPath-Request` is required. A 402 proves an offer, not report delivery or successful settlement.

Coverage is limited to the currently approved origins in [capabilities](https://api.getacqpath.com/v1/capabilities). The source is evaluated only after valid payment authorization verification. If no declaration can be verified, the response is `available:false`, `charge_micro:"0"` and no settlement occurs; the authorization stays bound to that attempted request. A paid UNKNOWN result remains UNKNOWN and does not authorize use.

## TypeScript / Node

```sh
npm install --save-exact @x402/core@2.25.0 @x402/evm@2.25.0 @x402/fetch@2.25.0 viem@2.56.3
```

The following function uses an already configured **buyer's** standard viem signer. Calling it authorizes the stock client's normal 402/payment/retry flow; call only within that buyer's explicit spending authorization. AcqPath does not need a seller credential, operator token or another signing adapter.

```js
import { x402Client } from '@x402/core/client';
import { ExactEvmScheme } from '@x402/evm/exact/client';
import { wrapFetchWithPayment } from '@x402/fetch';

export async function buyFreshRights(buyerSigner) {
  const client = new x402Client()
    .register('eip155:8453', new ExactEvmScheme(buyerSigner));
  const paidFetch = wrapFetchWithPayment(fetch, client);
  const response = await paidFetch(
    'https://api.getacqpath.com/v1/rights/preflight/x402', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resource: 'https://rslstandard.org/',
        purpose: 'ai-input',
        max_total_micro: '20000'
      })
    });
  if (!response.ok) throw new Error(`AcqPath HTTP ${response.status}; preserve the signed request, do not purchase again`);
  return { result: await response.json(), paymentResponse: response.headers.get('PAYMENT-RESPONSE') };
}
```

## Python / httpx

```sh
python -m pip install 'x402[httpx,evm]==2.22.0' 'httpx==0.28.1'
```

Pass the buyer's configured official `EthAccountSigner` or another supported standard EVM signer; keep its credentials in the buyer's secret store. No key or seed belongs in the JSON body, public logs or chat.

```python
from x402 import x402Client
from x402.mechanisms.evm.exact import ExactEvmScheme
from x402.http.clients import x402HttpxClient

async def buy_fresh_rights(buyer_signer):
    client = x402Client().register(
        "eip155:8453", ExactEvmScheme(signer=buyer_signer)
    )
    async with x402HttpxClient(client) as buyer:
        response = await buyer.post(
            "https://api.getacqpath.com/v1/rights/preflight/x402",
            json={
                "resource": "https://rslstandard.org/",
                "purpose": "ai-input",
                "max_total_micro": "20000",
            },
        )
        if not response.is_success:
            raise RuntimeError(f"AcqPath HTTP {response.status_code}; preserve the signed request, do not purchase again")
        return response.json(), response.headers.get("PAYMENT-RESPONSE")
```

## Security difference and recovery

The stock signature authorizes the USDC transfer; it **does not cryptographically bind the POST body before presentation**. The first valid paid retry atomically binds its authorization identity to one canonical input and the fixed stock SKU. Same signed authorization plus same normalized input recovers the existing result. Changed input or another route/product is rejected after binding. A leaked pre-use authorization can be raced for another same-priced request; TLS and keeping signed requests private are essential. Use the [recommended SIWX integration](https://developers.getacqpath.com/examples/OFFICIAL-CLIENTS.md) when payer-signed body binding is required.

Store the exact outgoing signed HTTP request and body privately in the buyer's existing durable HTTP request/retry infrastructure **before transmission** if lost-response recovery is required. `PAYMENT-SIGNATURE` is a bearer credential. Do not expose it in model context, ordinary access logs, support tickets or this documentation. No custom payment hook is needed for the initial stock flow; the examples above do not add a durable recovery store for you.

After a timeout, resend the **same saved body and same PAYMENT-SIGNATURE** directly. Do not call a payment wrapper again without the original signed state: it may generate a new nonce and a new purchase. Repeated identical delivery does not cause another charge. `409` means a binding mismatch. `503 SETTLEMENT_UNCONFIRMED` requires operator reconciliation; retain the state and do not sign again. `410 REPORT_RETIRED` means delivery retention ended. During a rollback, stock recovery may require restoring the reviewed stock reader.

## Verify delivery

A paid response must contain `version:"acqpath-stock-rights-v1"`, SKU `rights.preflight.stock.fresh.v1`, the normalized input SHA-256, expected resource/purpose, `billing.amount_micro:"20000"`, `evidence`, `payment_settlement`, and `delivery_proof`. Verify the Ed25519 evidence signatures using the published [AcqPath DID verification keys](https://api.getacqpath.com/.well-known/did.json). Compare the evidence payload to the report fields and the delivery proof's report hash, resource URL, recipient, asset, network, amount and transaction. Retain the settlement transaction and authenticate the `PAYMENT-RESPONSE` receipt. HTTP 200 alone is insufficient: first distinguish a no-charge unavailable response from a signed paid report. A service receipt is not independent on-chain finality.

These reports describe observed declarations; they do not purchase a publisher license or establish legal clearance. `LICENSE_REQUIRED`, `DENY_DECLARED` and `UNKNOWN` do not grant ingestion permission. Marketplace verification settlements are separate from organic customer revenue. No owner-funded verification is performed.

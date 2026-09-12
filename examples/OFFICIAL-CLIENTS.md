# Configured official x402 buyers

Gateway release deployed 2026-09-12. The public endpoint supports unchanged official exact-EVM payment signers through the AcqPath SIWX adapter (TypeScript/Node and Python/httpx). The adapter reserves unsigned authorization fields, validates and signs the official SIWX request/payment challenge, then submits the original payment. Existing acqpath-request-binding nonce clients remain supported. Generic zero-config x402 clients, stock SIWX-only hooks, Payments MCP and paid proxies are not verified compatible. Mainnet paid E2E remains UNVERIFIED; no owner-funded payment.

Node 22.16+; official @x402/core, evm, fetch and extensions 2.25.0, viem 2.56.3. Python 3.12/3.13, x402 2.22.0 and httpx 0.28.1. EOA only; no smart-wallet or Permit2 support. These source files are not an npm or PyPI publication.

## Install into a separate buyer application

Use an empty, separate buyer application directory. These commands download public source and install dependencies; they do not initialize a wallet or buy a report. AcqPath itself is not an npm/PyPI package. Do not run these installation commands at the distribution repository root. Existing applications should merge the pinned dependencies instead of overwriting their package.json.

Node / TypeScript (use `curl.exe` in Windows PowerShell):

```sh
curl --fail --silent --show-error --location https://developers.getacqpath.com/examples/acqpath.mjs --output acqpath.mjs
curl --fail --silent --show-error --location https://developers.getacqpath.com/examples/official-node.mjs --output official-node.mjs
curl --fail --silent --show-error --location https://developers.getacqpath.com/examples/official-client-package.json --output package.json
npm install --ignore-scripts --no-fund
```

Python, in an activated private Python 3.12/3.13 virtual environment (use `curl.exe` on Windows):

```sh
curl --fail --silent --show-error --location https://developers.getacqpath.com/examples/acqpath_httpx.py --output acqpath_httpx.py
curl --fail --silent --show-error --location https://developers.getacqpath.com/examples/official-python.py --output buyer_example.py
curl --fail --silent --show-error --location https://developers.getacqpath.com/examples/official-requirements.txt --output official-requirements.txt
python -m pip install -r official-requirements.txt
```

The Node manifest pins @x402/core, @x402/evm, @x402/fetch and @x402/extensions to 2.25.0, plus viem 2.56.3. Python requirements pin the tested dependency set including x402 2.22.0, httpx 0.28.1, eth-account 0.13.7 and abnf 2.2.0. Keep the resulting lock/environment with the buyer application. Adapter provenance: core commit `b2a9273f7269f137af2336d7819bbd3a7595a0b3`, production version `0b952e13-d76c-4226-a117-521741d30769`; [source hashes](https://github.com/reflectme-source/acqpath-distribution/blob/main/metadata/official-client-provenance.json).

## TypeScript / Node integration

The JavaScript module can be imported from TypeScript. Supply your existing viem EOA signer, a private directory, one stable operation ID and the actual input. Enable allowPayment only when your buyer policy authorizes that exact purchase. No AcqPath account, API key or seller credential is needed.

```js
import { createAcqPathFetch, privateFileStore } from './acqpath.mjs';

// Inject an existing buyer-controlled viem EOA signer. No key is stored here.
export async function preflight({ signer, operationId, input, privateDirectory, allowPayment = false }) {
  const buy = createAcqPathFetch({
    signer, expected: {"origin":"https://api.getacqpath.com","network":"eip155:8453","asset":"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913","payTo":"0xf69DBbd053fb0Fbc78ADfdB1BFe3b0D1F57300ec","amount":"20000"},
    publicJwk: {"key_ops":["verify"],"ext":true,"alg":"Ed25519","crv":"Ed25519","x":"PzeeZ8d8Np85ix9ialbrLZz9ebY_Og72dScn1IAft6M","kty":"OKP"},
    store: privateFileStore(privateDirectory), allowPayment,
  });
  return buy('https://api.getacqpath.com/v1/rights/preflight', {
    method: 'POST', operationId, body: JSON.stringify(input),
  });
}
```

## Python integration

```python
from acqpath_httpx import AcqPathClient, PrivateFileStore

# Inject an existing buyer-controlled eth_account LocalAccount.
async def preflight(account, operation_id, input, private_directory, allow_payment=False):
    buyer = AcqPathClient(
        signer=account, expected={"origin":"https://api.getacqpath.com","network":"eip155:8453","asset":"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913","payTo":"0xf69DBbd053fb0Fbc78ADfdB1BFe3b0D1F57300ec","amount":"20000"},
        public_jwk={"kty":"OKP","crv":"Ed25519","x":"PzeeZ8d8Np85ix9ialbrLZz9ebY_Og72dScn1IAft6M"},
        store=PrivateFileStore(private_directory), allow_payment=allow_payment,
    )
    try:
        return await buyer.post('https://api.getacqpath.com/v1/rights/preflight',
                                json=input, operation_id=operation_id)
    finally:
        await buyer.aclose()
```

Example input: {"resource":"https://rslstandard.org/","purpose":"ai-input","tier":"fresh","max_total_micro":"20000"}. That resource returned LICENSE_REQUIRED in the unpaid production check; recheck current evidence. A report is not a license. UNKNOWN never permits use.

## Call from the buyer application and verify delivery

The application supplies an already configured EOA signer/account, a persisted operation ID, a private storage directory and its explicit purchase decision. No seed, private-key literal or environment-secret dump belongs in this example. EOA support does not imply support for every wallet provider. The official payment signer is constructed inside the adapter; do not add a second payment wrapper or alter its nonce. The TypeScript caller below imports the tested JavaScript adapter through its wrapper; use your application's existing ESM/JavaScript module support.

```ts
import type { LocalAccount } from 'viem';
import { preflight } from './official-node.mjs';

export async function buyRights(
  signer: LocalAccount, operationId: string,
  privateDirectory: string, purchaseApproved: boolean,
) {
  if (!purchaseApproved) throw new Error('Buyer approval required');
  const response = await preflight({
    signer, operationId, privateDirectory, allowPayment: true,
    input: { resource: 'https://rslstandard.org/', purpose: 'ai-input',
             tier: 'fresh', max_total_micro: '20000' },
  });
  if (response.status !== 200) throw new Error(`Preserve state; HTTP ${response.status}`);
  const result = await response.json();
  if (result.available === false) return { paid: false, available: false };
  // The adapter has already verified the signed report, receipt and delivery proof.
  // Return only a minimal summary; never log the raw response or checkpoint.
  return { paid: true, deliveryVerified: true, resource: result.report.resource,
           purpose: result.report.purpose, ingestionAuthorized: false };
}
```

```python
from buyer_example import preflight

async def buy_rights(account, operation_id, private_directory, purchase_approved):
    if not purchase_approved:
        raise ValueError("Buyer approval required")
    response = await preflight(
        account, operation_id,
        {"resource": "https://rslstandard.org/", "purpose": "ai-input",
         "tier": "fresh", "max_total_micro": "20000"},
        private_directory, allow_payment=True,
    )
    if response.status_code != 200:
        raise RuntimeError(f"Preserve state; HTTP {response.status_code}")
    result = response.json()
    if result.get("available") is False:
        return {"paid": False, "available": False}
    # Verification has completed inside the adapter. Do not log raw signed artifacts.
    return {"paid": True, "deliveryVerified": True,
            "resource": result["report"]["resource"],
            "purpose": result["report"]["purpose"], "ingestionAuthorized": False}
```

The samples deliberately have no automatic entrypoint. Invoke the function from the existing buyer application after its purchase policy approves. On retry, supply the identical account, operation ID, input and private directory. Do not generate a fresh ID inside a retry loop. A verification exception is a failed delivery check, never a reason to create a second purchase.

The adapters validate the signed offer before signing; on paid HTTP 200 they verify Ed25519 report evidence, normalized request/purpose, signed settlement receipt, payer/network/transaction, and delivery proof binding the report, offer, recipient, asset and exact amount. They throw on a mismatch. An HTTP 200 unavailable result is explicitly unpaid. A verified service receipt is not independent blockchain finality. Save any verified report only in the buyer's private evidence store; expose a minimal summary to agents.

Fresh is **20,000 micro-USDC = 0.02 USDC**; deep is **50,000 = 0.05 USDC**. These examples pin fresh. For a deliberate deep request, set `tier: 'deep'`, `max_total_micro: '50000'`, and the wrapper's expected `amount` to `'50000'` together, using a new logical operation. Never edit an unresolved operation. Both prices use Base `eip155:8453`, USDC `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`, recipient `0xf69DBbd053fb0Fbc78ADfdB1BFe3b0D1F57300ec`; the verified live offer must match these independent pins.

## Exact extra step

The stock EIP-3009 signer and random nonce are unchanged. The adapter adds one unsigned prebinding request and one official SIWX message signature binding the request, private context and exact payment. Normal flow: prepared 402, SIWX 402, paid response. This is one extra round trip and one SIWX signature over stock x402. Merely registering a generic SIWX login hook is insufficient. Independently pinned terms and report key are mandatory.

## Recovery and private state

After a timeout, use the SAME operation ID, input and directory. The adapter durably saves the exact authorization before disclosure and never creates a second payment on resume. An uncertain 503 requires existing operator reconciliation. Do not delete a pending checkpoint or retry under a new ID. Abandoned locks fail closed; inspect the saved state before clearing only a stale lock after confirming no process owns it.

The store writes no signer private key. It does retain bearer payment/SIWX authorizations for exact retry; files are not application-level encrypted. Use a trusted private POSIX directory (0700/0600) or private Windows ACL, preferably encrypted storage. Never log, commit or share it. Automatic cleanup is not provided: preserve unresolved operations; archive or remove a completed/expired record only under a policy that never reuses its operation ID. Treat late network settlement ambiguity as unresolved.

## Limits and evidence

ABNF 2.2.0 is intentionally pinned for official signinwithethereum 5.0.1 compatibility; no permissive parser fallback or library patch is used. Python rejects unsupported floats/non-ASCII object keys and noncanonical ASCII HTTPS publisher URLs. Both clients reject purchase redirects. SIWX enforces binding at AcqPath application entrypoints, not an on-chain POST-body witness.

Local official-client cryptographic E2E, substitution, concurrency and recovery tests PASS; public Node/Python unpaid contract checks PASS; CDP valid=true. MAINNET PAID E2E = UNVERIFIED. No external customer, revenue, zero-config generic client or Bazaar indexing claim follows from these checks.


## Live Rights Gateway release

Preflight remains **0.02 USDC fresh / 0.05 deep**. **Ingestion Gate** checks 1–4 unique reviewed URLs: **0.04 + 0.02 per URL fresh**, **0.06 + 0.04 per URL deep**. **Revalidation** compares one resource with an authentic signed prior gateway checkpoint: **0.03 fresh / 0.06 deep**. All payments use Base USDC. Gateway fees cover bounded observation attempts, including UNKNOWN. No legal clearance, license purchase or whole-domain coverage.

Use the tested official TS/Python signer + AcqPath SIWX adapter. [Complete gateway examples](https://developers.getacqpath.com/examples/GATEWAY.md) include private state, retry and delivery verification. [Live gateway guide](https://developers.getacqpath.com/gateway). Mainnet paid E2E awaits a real external buyer; verified organic revenue remains 0 USDC. Development freeze: only incidents, security, standards compatibility and monitoring.

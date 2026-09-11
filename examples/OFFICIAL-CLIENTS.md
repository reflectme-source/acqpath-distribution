# Configured official x402 buyers

Deployed 2026-09-11. The public endpoint supports unchanged official exact-EVM payment signers through the AcqPath SIWX adapter (TypeScript/Node and Python/httpx). The adapter reserves unsigned authorization fields, validates and signs the official SIWX request/payment challenge, then submits the original payment. Existing acqpath-request-binding nonce clients remain supported. Generic zero-config x402 clients, stock SIWX-only hooks, Payments MCP and paid proxies are not verified compatible. Mainnet paid E2E remains UNVERIFIED; no owner-funded payment.

Node 22.16+; official @x402/core, evm, fetch and extensions 2.25.0, viem 2.56.3. Python 3.12/3.13, x402 2.22.0 and httpx 0.28.1. EOA only; no smart-wallet or Permit2 support. These source files are not an npm or PyPI publication.

## Install into a separate buyer application

Download acqpath.mjs and official-node.mjs into the buyer application. Use official-client-package.json as its package.json and install that pinned manifest. For Python, download acqpath_httpx.py, official-python.py and official-requirements.txt, then install the requirements in the buyer application's private virtual environment. The distribution maintainer build needs no root dependency installation.

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

## Exact extra step

The stock EIP-3009 signer and random nonce are unchanged. The adapter adds one unsigned prebinding request and one official SIWX message signature binding the request, private context and exact payment. Normal flow: prepared 402, SIWX 402, paid response. This is one extra round trip and one SIWX signature over stock x402. Merely registering a generic SIWX login hook is insufficient. Independently pinned terms and report key are mandatory.

## Recovery and private state

After a timeout, use the SAME operation ID, input and directory. The adapter durably saves the exact authorization before disclosure and never creates a second payment on resume. An uncertain 503 requires existing operator reconciliation. Do not delete a pending checkpoint or retry under a new ID. Abandoned locks fail closed; inspect the saved state before clearing only a stale lock after confirming no process owns it.

The store writes no signer private key. It does retain bearer payment/SIWX authorizations for exact retry; files are not application-level encrypted. Use a trusted private POSIX directory (0700/0600) or private Windows ACL, preferably encrypted storage. Never log, commit or share it. Automatic cleanup is not provided: preserve unresolved operations; archive or remove a completed/expired record only under a policy that never reuses its operation ID. Treat late network settlement ambiguity as unresolved.

## Limits and evidence

ABNF 2.2.0 is intentionally pinned for official signinwithethereum 5.0.1 compatibility; no permissive parser fallback or library patch is used. Python rejects unsupported floats/non-ASCII object keys and noncanonical ASCII HTTPS publisher URLs. Both clients reject purchase redirects. SIWX enforces binding at AcqPath application entrypoints, not an on-chain POST-body witness.

Local official-client cryptographic E2E, substitution, concurrency and recovery tests PASS; public Node/Python unpaid contract checks PASS; CDP valid=true. MAINNET PAID E2E = UNVERIFIED. No external customer, revenue, zero-config generic client or Bazaar indexing claim follows from these checks.

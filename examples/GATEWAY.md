# Rights gateway buyer integration

Use the tested official TypeScript/Node x402 2.25.0 or Python x402 2.22.0 signer with the AcqPath SIWX adapter. The normal EIP-3009 payment signature and random nonce are unchanged. The adapter handles the additional SIWX order signature, request binding, durable retry and verification. Generic zero-config x402, stock SIWX-only hooks, Agent402 automatic router payment, Payments MCP and generic proxies are not claimed compatible. Mainnet paid E2E awaits a real external buyer.

## Select an operation

| POST path | Buyer job | Fresh / deep price in USDC |
|---|---|---|
| `/v1/rights/preflight` | One observed RSL diagnostic | 0.02 / 0.05, unchanged |
| `/v1/rights/ingestion-gate` | One signed decision set before ingesting 1–4 unique URLs | 0.04 + 0.02 per URL / 0.06 + 0.04 per URL |
| `/v1/rights/revalidate` | Compare one resource to its authentic prior gateway checkpoint | 0.03 / 0.06 |

Gate costs 0.06–0.12 fresh or 0.10–0.22 deep. Duplicates count once after canonical URL normalization; at most four input entries. `max_total_micro` is mandatory. The adapter pins the deterministic exact amount and rejects mismatching 402 terms before signing. Payment is Base mainnet (`eip155:8453`), USDC `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`, recipient `0xf69DBbd053fb0Fbc78ADfdB1BFe3b0D1F57300ec`.

Gateway fees buy a bounded observation attempt, including UNKNOWN, partial or unavailable sources. Preflight alone retains no-declaration/no-paid-offer behavior. Payment buys evidence, never legal clearance or a license. Four reviewed origins only: medium.com, theguardian.com, rslstandard.org, rslcollective.org. Exact HTTPS origins must match [live capabilities](https://api.getacqpath.com/v1/capabilities). A 403 is not bypassed; no domain-wide coverage is implied.

## Install the reviewed adapter

Follow [the dependency and private-directory setup](./OFFICIAL-CLIENTS.md). Use `acqpath.mjs`, `official-node.mjs`, `acqpath_httpx.py`, `official-python.py`, `official-client-package.json` and `official-requirements.txt` from this same distribution release. Node ≥22.16; @x402/core, /evm, /fetch and /extensions 2.25.0; viem 2.56.3. Python x402 2.22.0, httpx 0.28.1, eth-account 0.13.7; install the complete pinned requirements. No AcqPath npm/PyPI publication is required.

The application supplies an existing buyer-controlled viem EOA signer (Node) or eth_account LocalAccount (Python). Keep signer secrets in the buyer's own signer/wallet system. Never put keys, seeds, signed authorizations or private request state in prompts, source control or logs. Provision a private filesystem directory using Windows ACLs or POSIX owner-only access; the state files are not application-level encrypted. Use a stable operation ID from the application's own persisted job record. Do not generate a new ID on retry.

## TypeScript / Node

This function fits an ESM/TypeScript application using its existing signer. It requests one paid operation only when the application passes `purchaseApproved=true`. The adapter verifies report, receipt and delivery binding before returning HTTP 200.

```typescript
import { ingestionGate, revalidate } from './official-node.mjs';

export async function checkBeforeIngestion({ signer, jobId, privateDirectory,
  resources, purchaseApproved }) {
  const response = await ingestionGate({ signer, operationId: jobId,
    privateDirectory, allowPayment: purchaseApproved,
    input: { resources, purpose: 'ai-input', tier: 'fresh',
      freshness_seconds: 300, max_total_micro: '120000' } });
  if (response.status !== 200) throw new Error(`AcqPath HTTP ${response.status}; retain job state`);
  const verified = await response.json();
  // Persist verified.report privately with the application's ingestion job.
  // This function does not interpret UNKNOWN, LICENSE_REQUIRED or CONFLICT as permission.
  return verified.report.resources;
}

export async function checkPolicyAgain({ signer, jobId, privateDirectory,
  previousItem, purchaseApproved }) {
  const checkpoint = previousItem.checkpoint;
  if (!checkpoint) throw new Error('No complete signed checkpoint; do not infer permission');
  const scope = checkpoint.payload;
  const response = await revalidate({ signer, operationId: jobId,
    privateDirectory, allowPayment: purchaseApproved,
    input: { resources: [scope.resource], purpose: scope.purpose,
      user_class: scope.user_class, geo: scope.geo, tier: scope.tier,
      freshness_seconds: 0, max_total_micro: scope.tier === 'deep' ? '60000' : '30000',
      previous: checkpoint } });
  if (response.status !== 200) throw new Error(`AcqPath HTTP ${response.status}; retain job state`);
  return (await response.json()).report;
}
```

Each explicit revalidation is a separate paid operation with its own application job ID and approval. Never invoke it automatically as a retry of the Gate purchase. Retrying either function after a lost response uses its original job ID, input and private directory, so the saved signature is reused.

## Python

The installation steps save the Python wrapper as buyer_example.py:

```python
import buyer_example as buyer

async def check_before_ingestion(account, job_id, private_directory,
                                 resources, purchase_approved=False):
    response = await buyer.ingestion_gate(account, job_id, {
        'resources': resources, 'purpose': 'ai-input', 'tier': 'fresh',
        'freshness_seconds': 300, 'max_total_micro': '120000'
    }, private_directory, allow_payment=purchase_approved)
    if response.status_code != 200:
        raise RuntimeError(f'AcqPath HTTP {response.status_code}; retain job state')
    return response.json()['report']['resources']  # already cryptographically verified

async def check_policy_again(account, job_id, private_directory,
                             previous_item, purchase_approved=False):
    checkpoint = previous_item.get('checkpoint')
    if not checkpoint:
        raise ValueError('No complete signed checkpoint; no permission inference')
    scope = checkpoint['payload']
    response = await buyer.revalidate(account, job_id, {
        'resources': [scope['resource']], 'purpose': scope['purpose'],
        'user_class': scope['user_class'], 'geo': scope['geo'], 'tier': scope['tier'],
        'freshness_seconds': 0,
        'max_total_micro': '60000' if scope['tier'] == 'deep' else '30000',
        'previous': checkpoint
    }, private_directory, allow_payment=purchase_approved)
    if response.status_code != 200:
        raise RuntimeError(f'AcqPath HTTP {response.status_code}; retain job state')
    return response.json()['report']
```

## Interpret and recover

Use the returned policy classification as input to the buyer's own policy: PERMITTED_BY_OBSERVED_DECLARATION, PROHIBITED_BY_OBSERVED_DECLARATION, LICENSE_REQUIRED, NO_MACHINE_READABLE_DECLARATION, CONFLICT or UNKNOWN. Even a permitted declaration is not legal clearance or ownership verification. License references are observed publisher handoff URLs; AcqPath does not purchase or validate a publisher license. Core interpretation is deterministic RSL 1.0; AIPREF drafts are not evaluated. `rag-ingestion` and `summarization` are aliases for ai-input; training maps to ai-train. Crawl is not a supported paid usage purpose.

Keep observation/evaluation time and cache age. Fresh/deep change evidence work budget; a cached result preserves its original observation time. Revalidation forces a new source observation, can use ETag/Last-Modified/304, and can share a concurrent observation newer than request arrival. It compares authentic checkpoints from Gate/Revalidation with the same scope/depth. CHANGED can include declaration byte/provenance changes with a stable classification. SOURCE_UNAVAILABLE/UNKNOWN cannot prove removal or unchanged rights.

Limits: request 24,576 bytes, checkpoint/item 12,000 bytes, report 52,000 bytes, at most two concurrent resource observations. Fresh ≤4 GETs/resource; deep ≤8, reviewed redirects only. Complex evidence over a safe item limit yields explicit UNKNOWN. No unbounded domain crawl or whole-domain guarantee.

After a signature exists, resume the same operation ID/body/private directory with the same approved pins. Do not sign a new payment after 402, 409 or 503. The adapter reuses the stored authorization, verifies the exact report input/fee, Ed25519 evidence, receipt and delivery proof, and checks checkpoint fingerprints. If source work was interrupted before a deliverable was durably saved, the service refuses repeat execution and settlement; retain the context. SETTLING/UNCONFIRMED uses operator reconciliation, not another charge. Report retention is 30 days; retirement returns 410 while replay protection remains.

No owner-funded payment has been used to validate these examples. Local tests use generated fixture accounts and a cryptographic settlement simulator. Independent mainnet paid E2E and organic buyer demand remain unverified until real external evidence exists.

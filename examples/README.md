# Integrate once, preserve evidence, retry the same purchase

These are buyer-side examples. The npm SDK is unpublished. Clone the distribution repository and import its reviewed client source. No example requires a seller credential, wallet seed or private key. The read-only JavaScript and Python commands perform only a capability GET.

| Example | When to use | Purpose / behavior |
|---|---|---|
| `read-only.mjs` | Verify current availability and origin coverage | No quote, signer or payment |
| `read-only.py` | Feed the same coverage into a Python workflow | Standard-library probe; no unsupported Python payment SDK |
| `evidence-gate.mjs` | Private buyer application needs dated signed evidence | One task budget and durable purchase IDs; verified HTTP/x402 buyer client |
| `workflows.ts` | RAG, research, training, search and crawler workflows | Thin adapters over the same verified gate; no framework dependency |

```js
import {createEvidenceGate} from './examples/evidence-gate.mjs';

// Both values come directly from your private buyer application, not an LLM.
const gate = createEvidenceGate({
  pay: buyerControlledSigner,
  checkpointDirectory: buyerPrivateCheckpointDirectory,
  checkpointPassword: buyerPrivateCheckpointPassword,
  taskBudgetMicro: '50000'
});

// Called only when this selected supported source needs new evidence.
// Keep this logical ID with the job and reuse it on retry.
const evidence = await gate({
  id: 'persisted-job-id-index-evidence-v1',
  resource: 'https://rslstandard.org/',
  purpose: 'ai-index',
  tier: 'fresh'
});
```

The URL is illustrative, on an observed supported origin. It has not been demonstrated to produce a purchasable declaration. The signer variables above are intentional buyer-supplied dependencies; this is not a paste-and-spend command.

1. Call before selected content enters the intended workflow. RAG indexing uses `ai-index`; model context uses `ai-input`; training uses `ai-train`; search uses `search`. Crawl/robots policy is separate.
2. Read live coverage, validate the canonical HTTPS URL and fix the per-report/task budget. The examples cap fresh at 20,000 and deep at 50,000 micro-USDC without increasing production prices.
3. Hold unsupported/unavailable inputs. UNKNOWN, DENY_DECLARED and LICENSE_REQUIRED never authorize ingestion. A purchasable UNKNOWN report can still have diagnostic value; your buyer signer/policy must deliberately accept that purchase.
4. `buyOnce` prepares a quote once. The client obtains the private-claim 402 challenge, verifies the signed offer, invokes the bounded buyer-controlled signer and saves an encrypted checkpoint before submission.
5. The client verifies report signature and exact resource/purpose/context, signed settlement receipt, and delivery-proof amount/transaction binding. This is not an independent on-chain finality check or a license.
6. After an ambiguous response, call the same gate with the same ID and input. Existing checkpoints take precedence over changed coverage. The client reuses the exact authorization and payment identifier without invoking the wallet.
7. Do not delete locked/starting checkpoints or reinitialize a budget to clear an error. A new logical purchase ID means a deliberate new evidence request. TaskBudget limits one gate instance; use your buyer application's durable spending ledger for limits spanning processes or tasks.

Never log raw quote, claim, payment payload, signature or checkpoint. The adapter returns a public summary and always leaves `ingestionAuthorized:false`. Your application evaluates evidence under its own policy; even ALLOW_DECLARED does not grant permission.

Reconciliation remains unverified/degraded as reported. Keep ambiguous purchases on hold for recovery; zero manual support is an objective, not a demonstrated property.

See [HTTP contract](https://developers.getacqpath.com/http-x402), [OpenAPI](https://developers.getacqpath.com/openapi.json), and [recovery](https://developers.getacqpath.com/recovery).

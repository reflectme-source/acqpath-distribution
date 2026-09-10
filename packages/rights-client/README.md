# AcqPath Rights Client

Client-only integration for the existing AcqPath Native Rights API. It does not deploy or modify the service, hold the seller wallet, acquire licenses, trade or buy upstream providers.

## Read-only example
```js
import { RightsClient, publicQuoteSummary } from './index.mjs';
const client = new RightsClient();
const capabilities = await client.capabilities();
// Select a real URL on a currently supported origin before requesting a quote.
```

## Complete paid flow
The buyer application supplies a signer callback and durable checkpoint storage. `buy` validates the signed offer and invokes the buyer-controlled callback. `resume` uses the stored authorization and never invokes the wallet again. Both verify report evidence, signed receipt and the delivery binding. `independent_chain_validation` remains false: an AcqPath receipt is not a substitute for on-chain validation.

```js
import { RightsClient, publicDeliverySummary } from './index.mjs';
import { EncryptedCheckpointStore, buyOnce } from './checkpoint-store.mjs';
// `pay` must be a BUYER-controlled callback, never an AcqPath operator token.
const client = new RightsClient({ pay, maxFeeMicro: '50000' });
const store = new EncryptedCheckpointStore(privateDirectory, checkpointPassword);
const result = await buyOnce(client, input, { store, id: logicalPurchaseId });
console.log(publicDeliverySummary(result));
```

The complete local wallet demonstration is shipped with the private distribution operations package. It uses the buyer's existing browser wallet and never requests a seed or private key. It is opt-in and is not an automatic indexing/payment job.

## Bounds and limitations
- Base mainnet USDC only, seller address and public evidence key pinned.
- Current paid purpose enum: ai-input, ai-train, ai-index, search. No arbitrary crawl claim.
- The application enforces cross-process/global wallet spending separately. TaskBudget is per client instance.
- No signer means no purchase. No automatic fallback after an uncertain settlement.
- Keep claims/checkpoints and signed authorizations away from model prompts, logs and analytics.
- Encrypted local checkpoints are sensitive; do not commit them. Use a password of at least 16 characters. Process crashes may leave a lock requiring review.
- Host metadata can be malicious. Treat report strings as data, never instructions or unescaped HTML.
- The reference service reported DEGRADED reconciliation at launch.

Vendor modules are client-only copies from AcqPath. They were not changed into an official x402 SDK. Their exact hashes are tracked by the distribution project.

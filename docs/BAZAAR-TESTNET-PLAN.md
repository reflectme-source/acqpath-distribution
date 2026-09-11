# Base Sepolia validation plan

> Historical Phase 3 review. Its no-core-change status records that phase only. The subsequently authorized additive Phase 3B adapter is implemented; see [current engineering status](BAZAAR-ENGINEERING-STATUS.md). Production and payment boundaries still apply.

State: **BLOCKED**. A paid Sepolia trial is **not recommended yet**: there is no safe deployable Bazaar candidate. Local unpaid tests and catalog reads are complete. Resolve the public discovery/private retrieval architecture first; do not fund or sign to diagnose this structural gap.

## Preconditions for a future approved candidate

1. Review an exact diff that provides an honest public discovery contract without making private claims or reports public. Keep the existing settlement path, report semantics, price tiers and recipient. Reject client-controlled catalog overrides and demonstrate redaction of the full catalog object, not only its URL key.
2. Reproduce the source digest, all existing tests, the new security tests and the raw dependency audit. Run the two Windows-skipped symlink checks on a capable runner and exercise the Cloudflare runtime before approval to release.
3. Separately approve deployment/configuration of an isolated staging candidate. The staging payment fixture uses Base Sepolia `eip155:84532`, test USDC `0x036CbD53842c5426634e7929541eC2318f3dCF7e`, maxTimeoutSeconds 120 and the reviewed 20000/50000 micro-unit tiers. Production PAYMENT_MODE, recipient, prices, Access and routing stay untouched. Use a reviewed staging fixture URL, not a customer URL.
4. If testing CDP Bazaar, confirm the candidate's approved staging facilitator is CDP. Historical x402.org settlement proves only that separate payment/catalog path. Changing a staging facilitator still needs approval; none was changed here.

## Unpaid checks prepared

`review/bazaar-core.mjs` runs against the isolated `.local/phase3/core` source copy. It replaces global fetch with a failure guard and uses test fixtures only. `scripts/bazaar-check.mjs design` compiles Draft 2020-12 schemas and validates the nonprivate examples using pinned Ajv.

For an eventual local 402 capture, `scripts/bazaar-check.mjs challenge` takes two files under `.local`: the challenge and separately reviewed expected terms/resource. It checks x402 version, scheme, amount, network, asset, recipient, timeout, MIME, canonical template and schema. It rejects suspected private catalog data and still reports BLOCKED until the private workflow integration is reviewed. It never signs or submits a payment. The current challenge correctly fails with BAZAAR_EXTENSION_MISSING.

Once a genuinely public, reviewed probe URL exists, the agent can use `scripts/bazaar-check.mjs validate` to call the official nonpayment `/validate` endpoint with only resource and method. Do not submit a customer's quote URL or claim. Require valid=true and accepted simulation, but do not label a validator response as indexing proof. No public candidate exists now, so this step was intentionally not attempted. See the exact API citation in BAZAAR-OFFICIAL-REQUIREMENTS.md.

`scripts/bazaar-check.mjs readback eip155:84532` performs only catalog GETs: one global HTTP sample, filtered inventory and all eight requested brand/capability/intent searches. It records observed terms, schema validity, truncation and returned search method. It does not follow discovered endpoints. Unsupported/error responses are unavailable evidence, never a false absence result.

## Payment gate — disabled

There is no signing, verify-payment or settlement command in the new checker. This historical plan is archived by Phase 5. No owner-funded testnet or mainnet signing or settlement is permitted. If settlement becomes uncertain, resume/reconcile that same intent; never create a replacement payment automatically.

After the approved indexing condition, read the exact public entry and search results, including all extension fields. Require absence of private claims, order IDs, source URLs and decoded signed-offer URL leakage. A positive transaction receipt alone does not pass this gate. Only then consider TESTNET VERIFIED; do not infer MAINNET DEPLOYED or BAZAAR INDEXED on mainnet.

No historical transaction was represented as new metadata evidence, and no new testnet transaction was performed. Production aggregate statistics were not read again in this phase.

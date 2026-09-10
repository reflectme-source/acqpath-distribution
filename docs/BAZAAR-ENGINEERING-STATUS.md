# Bazaar engineering status — 2026-09-10

The additive public HTTP adapter is implemented in the original core on `codex/bazaar-public-rights`, commit `11c420277f53eddf07120795201307a073335320`, PR 6. Both GitHub jobs (`verify`, `secrets`) passed. It has not been deployed to production or published as an active Bazaar resource.

The original Phase 3 documents remain historical analyses of the private quote/claim flow. Their architectural blocker led to the subsequently reviewed Phase 3B public adapter; `metadata/bazaar-public-contract.json` and the `/bazaar-status` page describe that candidate. `metadata/bazaar-design.json` retains the old design with an explicit historical marker. The production OpenAPI snapshot and MCP tools continue to describe the deployed legacy contract.

## Verification

- Local full suite: 440 tests, 438 pass, zero failures, two existing Windows symlink skips. Dedicated adapter: 66 pass. Syntax: 124 modules. SDK declarations pass.
- Actual local workerd with D1, Durable Objects and R2 passes. These are local bindings, not production state or a remote deployment.
- Draft 2020-12 metadata, synthetic input/output and binding examples pass. Generic random-nonce clients remain incompatible: the public request requires a nonce-aware signer and retained private context.
- Gitleaks scans full history and the exact indexed source. One finding is an existing public EIP-3009 event topic, addressed by an exact-value/path exception; no secret finding remains. CI scans history and checkout using a checksum-verified scanner.
- Wrangler 4.131.0, miniflare 5.20260910.0-alpha and sharp 0.35.4 replace the vulnerable build-tool chain. npm audit reports zero vulnerabilities. No runtime npm dependency was added.
- Production profile, operator and revenue configuration hashes remain unchanged. Live mode, recipient, fresh/deep fees, Base network, USDC, facilitator, Access, reconciliation and disabled provider routing remain protected.

## Merge and deployment status

Core CI is green. Production Cloudflare Settings > Builds displays Git repository > Connect. Repository Actions variables, secret names, webhooks and environments are empty. Organization settings cannot be inspected with the current GitHub scope, so merge remains pending proof of the effective deployment flag. An attempted read-only CI assertion was rejected by automatic approval review; a narrowly scoped owner confirmation is pending. No release workflow change was applied.

The separate docs pipeline verifies Windows/Linux, scans Git history, builds an explicit static allowlist, scans and seals that exact artifact, uploads only to `acqpath-distribution`, and reads back both docs hosts. Activation requires a durable Pages-scoped credential restricted to the AcqPath account. It is never configured with a production Worker token. The current OAuth CLI authorization also needs owner completion for AcqPath. npm remains unpublished by owner choice.

## Remaining boundaries

An isolated `acqpath-bazaar-sepolia` Worker is authorized for non-paid checks after account authorization and green verification. It must use a new origin and independent D1/DO/R2, no production routes/state/secrets, and no facilitator settlement credentials. Wallet signing and every settlement remain OFF.

The core contains `docs/BAZAAR-PRODUCTION-DEPLOY-PLAN.md`, an unexecuted plan requiring separate owner approval for the exact code/config/version change. Its preparatory checks distinguish the actual MAINNET LIVE profile from the obsolete generated OFF profile. Production deployment is not authorized by publishing these docs.

Bazaar indexing, mainnet payment validation and external demand remain unverified. External paid reports, repeat payers and received USDC remain UNKNOWN. Test fixtures, local QA and an owner purchase must never be counted as organic revenue.

[CDP endpoint validation](https://docs.cdp.coinbase.com/api-reference/v2/rest-api/x402-facilitator/validate-x402-endpoint) is documented as a non-paid read-only probe; it does not index a resource. [Cloudflare Pages CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/) uses a Pages Edit API credential for direct upload.

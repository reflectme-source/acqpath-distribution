# Bazaar engineering status — 2026-09-10

The additive public HTTP adapter is merged into original core main at 905d8706a0f753bf3ea93dc4072084e6c5b2f3df (PRs 6, 7 and 8). Production remains on its existing version. The separate acqpath-bazaar-sepolia Worker is deployed and passes all unpaid checks. It cannot accept payment submissions.

The Phase 3 documents remain historical analyses of the private quote/claim flow. The reviewed Phase 3B adapter, metadata/bazaar-public-contract.json and /bazaar-status describe the new candidate. The live OpenAPI snapshot and MCP tools still describe the deployed production contract. npm remains unpublished by owner choice.

## Verification

- Core: 446 tests, 444 pass, zero failures, two existing Windows symlink skips; 72 adapter tests; 124 syntax modules. Actual local workerd with isolated D1, Durable Objects and R2 and SDK type checks pass.
- Main CI run 34526927657 passed. Effective deployment flag is false; release run 34526927632 skipped. Production Cloudflare Git integration remains disconnected. The approved ten-line CI assertion proves the effective inherited flag before merge.
- Full indexed source and Git history secret scans pass. The scanner ignores only the exact public EIP-3009 event topic value. A canary test verifies other secrets in the same source file remain detectable; no file-path exclusion is used.
- Patched pinned tooling audit: zero vulnerabilities. No runtime npm dependency added.
- Production live mode, native-only mode, recipient, fresh/deep prices, Base network, USDC asset, facilitator, Access, reconciliation and disabled provider routing remain unchanged. Four protected local configuration hashes match the baseline. Production is still on version b76bb091-bccd-44b9-ba96-8e7ea59b3d3e with 100% traffic.

## Isolated Sepolia

Origin: https://acqpath-bazaar-sepolia.acqpath.workers.dev. Version: 2ac81afe-ac5c-43c5-930c-049a90e6c0b7. Source digest: af21b15c04a56f1e104a736de699652c9b56b4871de7827cf2ac6078a05dbe84.

The candidate has independent D1, Durable Objects and R2, no production routes or state, fresh non-wallet evidence/telemetry keys and no facilitator settlement credentials. A request guard rejects all payment headers before the core, and hides admin, MCP and legacy purchase paths. Temporary probe-format logging was removed.

At 2026-09-10T20:33:12.450Z, all 14 unpaid checks passed: health, readiness, schemas, discovery 402, signed input binding with pinned server public key, identical retry, conflicting-input rejection, zero-charge budget failure, unsupported source, malformed context/JSON, payment-header rejection, admin isolation and legacy isolation. The prepared challenge is 9,680 header bytes; clients/proxies must support that size. Signed server evidence is not a wallet signature.

The live CDP validator returns HTTP 200, valid=true and simulation=accepted. Its POST probe uses an empty JSON object; the core now treats both an empty body and an empty object as non-purchasable discovery. Partial objects, arrays, null, malformed input and wrong content type remain rejected. The validator index field is null. This read-only validation performs no payment and does not index the endpoint.

## Distribution and remaining boundaries

The separate Pages project serves 20 pages plus machine assets, using an explicit 49-file artifact. The reviewed GitHub pipeline tests Windows/Linux, scans history and the sealed artifact, and targets only acqpath-distribution. Automatic deployment is prepared but disabled while the narrowly scoped Pages credential awaits owner authorization. Existing docs publication uses the authorized AcqPath CLI session.

MCP Registry rc.2, Smithery and Glama remain compatible with production and are checked read-only. Bazaar searches do not establish an indexed AcqPath resource. No catalog contains private retry context or payment headers.

The exact production command, locally prepared configuration and dry-run evidence remain private and unexecuted. Original core docs/BAZAAR-PRODUCTION-DEPLOY-PLAN.md describes the hard boundary. Fresh release-evidence review and explicit approval are required before changing production code/traffic; wallet signing and settlement require their own approval.

External paid reports, repeat payers and received USDC are UNKNOWN for this phase. Earlier aggregate snapshots remain historical. QA, fixtures and an owner purchase never establish external demand. Real Bazaar indexing and external paid usage have not been demonstrated, so the commercial rollout is not complete.

[CDP endpoint validation](https://docs.cdp.coinbase.com/api-reference/v2/rest-api/x402-facilitator/validate-x402-endpoint) is documented as read-only and non-indexing. [Cloudflare Pages CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/) uses a Pages Edit credential.

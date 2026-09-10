# PHASE 3 patch review

> Historical Phase 3 review. Its no-core-change status records that phase only. The subsequently authorized additive Phase 3B adapter is implemented; see [current engineering status](BAZAAR-ENGINEERING-STATUS.md). Production and payment boundaries still apply.

Date: 2026-09-10. **B — NO SAFE MINIMAL PATCH — ARCHITECTURAL CHANGE REQUIRED.** Distribution state: **BLOCKED** for Bazaar. No core patch was applied or proposed as deployable. A private quote URL and claim cannot become a reusable public paid resource merely by adding discovery fields. Full analysis is in the other five BAZAAR documents.

## Exact changed-file list

All following paths are relative to the separate acqpath-distribution repository. Core source/configuration changed files: **none**. Source copies and raw evidence under ignored `.local/phase3` are private review artifacts, not publication contents.

1. `.github/workflows/docs-deploy.yml` — new gated Pages-only workflow.
2. `docs/BAZAAR-CURRENT-FLOW.md` — current source/flow and precise integration point.
3. `docs/BAZAAR-OFFICIAL-REQUIREMENTS.md` — dated, pinned first-party research.
4. `docs/BAZAAR-SECURITY-REVIEW.md` — privacy, replay, poisoning and dependency findings.
5. `docs/BAZAAR-TESTNET-PLAN.md` — gated Sepolia procedure and nonpaid checks.
6. `docs/BAZAAR-MAINNET-PLAN.md` — eventual separately approved procedure and QA accounting.
7. `docs/BAZAAR-PATCH-REVIEW.md` — this review and activation boundary.
8. `metadata/bazaar-design.json` — BLOCKED design, separate schemas, synthetic excerpt.
9. `review/bazaar-core.mjs` — eight offline checks of the actual isolated core source.
10. `scripts/bazaar-check.mjs` — offline schema/challenge checks and read-only catalog/search checks.
11. `scripts/docs-artifact.mjs` — static allowlist, SHA256 seal and exact-commit verification.
12. `scripts/docs-readback.mjs` — bounded readback of both existing docs hosts.
13. `tests/bazaar-phase3.test.mjs` — distribution security/automation regressions.
14. `tooling/distribution/package.json` — isolated pinned review/upload tools.
15. `tooling/distribution/package-lock.json` — dependency integrity lock.
16. `MANIFEST.json` — refreshed public-file integrity inventory.

No production Worker file, environment, DB schema, payment code, Access setting, reconciliation code, pricing, provider configuration, existing SDK or npm publication setting changed. The docs website's generated content remains the existing 47-file artifact; the new review documents are not silently added to its build allowlist. No commit, push, release, registry publication or deployment was performed in PHASE 3.

## Baseline and preserved values

| Item | Before = after |
| --- | --- |
| Core HEAD | `45d3bd1530246bd653206196c748b975140691d5` |
| Original Git state | Clean; no staged or unstaged change |
| Source digest | `77cf20d889b818b94439e1040828fa416d6b2a2a8f5d3741c78f9cb569a0b45a` |
| Runtime version | `3.1.0-rc.1` |
| PAYMENT_MODE | `live` |
| PAY_TO | `0xf69DBbd053fb0Fbc78ADfdB1BFe3b0D1F57300ec` |
| RIGHTS_FEE_MICRO / RIGHTS_DEEP_FEE_MICRO | `20000` / `50000` |
| NATIVE_RIGHTS_ONLY / RIGHTS_ENABLED | `true` / `true` |
| Network | `eip155:8453` |
| Asset | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| Scheme / maxTimeoutSeconds | `exact` / `120` |
| FACILITATOR_URL | `https://api.cdp.coinbase.com/platform/v2/x402` |
| APP_ORIGIN / LIVE_APPROVED | `https://api.getacqpath.com` / `true` |
| Provider quotes / paid planning | `false` / `false` in public readback |

The legacy `wrangler.generated.json` is an OFF configuration; it was not mistaken for the live release profile. The reviewed live profile is `wrangler.mainnet-live-r4.json`. Both files and real operator/revenue configuration were compared by SHA256 and left unchanged. Access-related values are not republished in this report. Public `/health`, `/v1/service-info` and `/v1/capabilities` corroborate live mode, fee tiers and disabled provider paths. No authenticated aggregate/admin read was repeated.

Public LIVE source digest is `7b7b830d434bac12bf7b42f7b706757e2ca8dab15349adc367985208f4329671`, reproduced from commit `abe759698646c0fa5bb3ab75fa5e74003273d012`. Only CI differs from local HEAD; payment/runtime source is identical. Full before/after evidence is retained privately in `.local/phase3`.

## Validation evidence

- Full unchanged core verifier: **374 tests, 372 PASS, 0 FAIL, 2 SKIP**, Node 22.19.0, 119 syntax-checked JavaScript modules; actual SQLite and in-memory Durable Object adapter. Skips are the two symlink tests unsupported by this Windows account. No test was removed or weakened.
- Added isolated core review: **8/8 PASS**. Covers five protected settings, both prices, both network profiles, private claims, 402, concrete offer URL, timeout mismatch, canonicalization, metadata poisoning, retries, duplicate-payment protection, expiry, unsupported origins, UNKNOWN and native/admin isolation. Existing full tests cover receipt/signature verification and reconciliation.
- Distribution verifier: final result is recorded in the verification appendix below. Static secret patterns and six vendored SDK hashes are also checked.
- Draft schemas: compile with Ajv 8.20.0 / Draft 2020-12; the quote example and synthetic report/billing excerpt validate. This is not an assertion that a complete Bazaar paid invocation is ready.
- Exact docs artifact: **47 files**, sealed and verified against the existing distribution HEAD as a local rehearsal. No upload occurred. The future workflow binds the artifact to its actual GitHub source SHA.
- Core raw tooling audit: **3 high package entries**, the sharp/miniflare/wrangler advisory chain; zero core runtime npm dependencies. Core dependency versions were not changed.
- Separate distribution tooling audit: **0 vulnerabilities**, pinned Ajv 8.20.0 and Wrangler 4.131.0. No install scripts or Wrangler command executed locally.
- Catalog observations: eight brand/intent searches on each Base network returned HTTP 200 with searchMethod=hybrid and no AcqPath match. Global samples do not prove absence. Targeted inventory completion/truncation is recorded separately by the checker. No seller endpoint or payment operation was invoked.
- Not tested: actual Cloudflare runtime, public candidate 402, facilitator acceptance of new metadata, new testnet/mainnet settlement, end-to-end production deployment of this workflow, or public indexing of a new declaration.

## Separate docs automation, prepared but inactive

Pipeline: Windows/Ubuntu verification → full-history secret scan → existing docs build → artifact scan/seal → immutable artifact transfer → seal verification → isolated dependency audit → separate Pages deployment → public byte/header/link/404 verification on both hosts. All Actions are pinned to exact commit SHAs. The deployed artifact contains only approved static docs and explicitly named downloadable examples. No core repository checkout exists in the workflow.

Fixed target: existing account `449109f33c0c400ea8aef1100c801da6`, project `acqpath-distribution`, branch main. A global concurrency group serializes docs releases. Repository/ref checks and the **unset-by-default `DOCS_AUTODEPLOY_ENABLED` variable** gate deployment. The environment is `distribution-docs`. The upload step alone receives `CLOUDFLARE_PAGES_API_TOKEN`; no operator or wallet secret is requested.

After separate publication/activation approval, the agent will configure an account-scoped **Cloudflare Pages: Edit** token limited to the existing AcqPath account, store it directly as a GitHub environment secret, restrict that environment to main, and set the enabling variable. Do not request Workers, DNS, Access, D1 or R2 permissions. Cloudflare's documented permission is account-scoped, not a guarantee of single-Page-project scope; the fixed target, protected repository/environment and secret boundary provide additional restriction. The owner enters/authorizes credentials directly in Cloudflare/GitHub or a nonlogged secret prompt.

No permission screen was opened and no token created: publication/activation is explicitly disallowed in this phase until separate approval. The workflow is locally reviewable and fails closed with the gate unset. Account setup and the first real deployment/readback remain unverified. This is **prepared automation**, not a claim of active automatic deployment. [Cloudflare direct-upload CI documentation](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/), retrieved 2026-09-10.

## Single next owner decision

Approve **designing a public discovery/validation contract around the existing private quote/report flow**, beyond metadata-only edits, while preserving its payment journal and private retrieval boundary. This approval would authorize a concrete architecture proposal and local tests, not deployment, configuration changes, wallet signing or settlement. Docs publication/automation activation remains a separate later approval.

## Final verification appendix

Distribution verification at 2026-09-10T17:49:03.221Z: **94/94 PASS**, 0 failures, 0 skips; 51 syntax modules and six vendor hashes. YAML parsing and workflow gate checks pass. Original core/configuration comparison at 2026-09-10T17:49:22.871Z: unchanged.

Public docs readback (existing artifact, no deployment):

- developers.getacqpath.com: PUBLIC_DOCS_VERIFIED at 2026-09-10T17:47:24.307Z; 44 public assets, 27 links, headers, analytics normalization and custom 404.
- acqpath-distribution.pages.dev: PUBLIC_DOCS_VERIFIED at 2026-09-10T17:47:28.061Z; 44 public assets, 27 links, headers, analytics normalization and custom 404.

Targeted Bazaar inventory (not a global absence claim):

- eip155:8453, 2026-09-10T17:34:41.351Z: 0 entries returned, partialResults=false, 8 intent queries checked; no AcqPath match.
- eip155:84532, 2026-09-10T17:34:47.243Z: 0 entries returned, partialResults=false, 8 intent queries checked; no AcqPath match.

Raw core TAP, review TAP, distribution TAP, raw dependency audits, catalog reads, before/after hashes and the complete distribution diff are retained in ignored `.local/phase3`. The final public-file secret review is recorded in `.local/prepush-review.json`; it performs no publishing.

# Phase 4 production coverage — 2026-09-11

Production version `61b19442-bd51-46ec-be31-01422a07f877` is LIVE at 100% traffic from merged commit `a7c4ef48faf1fa8849689f2dd90b676ffbe33fd7`, [core PR9](https://github.com/AcqPath/acqpath/pull/9). All 19 unpaid production checks passed. No wallet signature or settlement occurred.

## Real sources and fee

| Resource | Classification | Production outcome |
|---|---|---|
| https://rslstandard.org/ | VALID_RSL_NONSTANDARD_MEDIA_TYPE | LICENSE_REQUIRED; prepared public 402 at 20000 micro-USDC. |
| https://rslcollective.org/ | VALID_RSL_NONSTANDARD_MEDIA_TYPE | LICENSE_REQUIRED; prepared public 402 at 20000 micro-USDC; legacy quote/private claim/unpaid report flow also passes. |
| https://medium.com/ | FETCH_BLOCKED | Resource403 retained in real-source candidate validation; no evasion. |
| https://theguardian.com/ | FETCH_BLOCKED | Redirect outside existing approved declaration boundary; UNKNOWN retained. |
| https://stackoverflow.com/license.xml | INVALID_RSL within supported profile | Real publisher document uses normative MIME but unsupported content/terms structure. Not added to production allowlist. |

The first two resources associate the real RSL Collective royalty declaration through robots.txt. It is served as application/xml. Exact bounded XML/root/namespace/profile validation is required, and report source evidence labels `RSL_XML_COMPATIBILITY` with `nonconforming_media_type=true`. This is not full transport standards conformance. The production decision preview, server-signed request binding and signed offer were verified without requesting paid delivery. Full delivered-report verification remains a later paid check.

The AcqPath fee buys observed-declaration diagnostic evidence. LICENSE_REQUIRED means that a publisher license is still required; paying AcqPath does not acquire it. Fresh fee remains 0.02 USDC; deep fee remains 0.05 USDC.

## Controls and verification

The six-file change is limited to rights discovery, evaluator validation reuse, bounded XML parsing, rights-only fetch handling, regression tests and coverage documentation. Generic XML with invalid or unresolved declarations cannot create a new billable declaration. Normative application/rsl+xml and existing restrictive evaluation remain. RSS remains explicitly unsupported.

At most two metadata redirects are allowed. Each hop consumes existing fetch/quota/deadline limits; only approved HTTPS origins are followed. IP literals, private/special-use targets, downgrades, credentials and query/fragment targets are rejected. Redirect chains are recorded and redirected responses are not cached. Payment/facilitator HTTP behavior is unchanged. AcqPathBot is not disguised as another crawler; public associated licenses may be inspected without bypassing403 or robots restrictions.

- Full core tests: 500 total, 498 PASS, zero FAIL, two existing Windows symlink skips. All existing Bazaar adapter cases and 54 additional coverage cases included.
- Actual local workerd D1/Durable Objects/R2, SDK types and dependency audit PASS; zero dependency vulnerabilities.
- PR CI run34617636127 and merged-main CI run34618021631 PASS, including full secret scans and the effective automatic-deployment-disabled assertion. Automatic core release remained skipped.
- Full tracked index, Git history and actual 187157-byte production bundle scans found no secrets. Bundle SHA256: `472cd226278d5e73121ac441e1b192d594043b6ab02e095ada58acb2d212c99b`. Source SHA256: `a4dd2b4c94e06b3089c378b06e28849f85c78d504a6540cc7ac306e5d56c2d15`.
- Uploaded version readback matched every binding except SOURCE_SHA256 and RELEASE_EVIDENCE_SHA256. Runtime, durable namespace IDs, payment mode/recipient/prices/network/asset/facilitator and provider routing matched the prior version.
- Domains, schedules and non-versioned settings matched before/after deployment. No Access, reconciliation, route or database schema change occurred. Protected local configuration hashes matched.
- Production health/readiness, legacy capabilities/OpenAPI, admin rejection, schemas, empty discovery402, two real prepared402s, pinned server signatures, identical unpaid retry, conflicting-input rejection and legacy quote/claim/report checks PASS.
- CDP read-only validator: HTTP200, valid=true, simulation=accepted. This performs no settlement and proves no indexing.
- Rollback version: `6f17ddad-8461-4b78-b6c3-ea7b77339cc8`.

## Payment boundary and distribution

[CDP discovery](https://docs.cdp.coinbase.com/x402/seller/get-discovered) requires a successful settled call for indexing. The remaining boundary is explicit owner authorization for exactly one 0.02 USDC Base mainnet indexing purchase. It must be classified INTERNAL_INDEXING_QA, never organic revenue. No testnet/mainnet wallet signature or payment occurred in this rollout; delivered report, post-settlement retry/no-second-charge and Bazaar indexed readback remain UNVERIFIED.

Automatic distribution docs deployment is enabled on main and uses the separate Pages project. Public docs and machine status distinguish successful unpaid validation from settlement/indexing. npm remains unpublished. Earlier Phase2/Phase3 notes and Sepolia fixture results are historical and do not prove a Phase4 payment. External paid reports, external payers, repeat payers and received external USDC remain UNKNOWN.

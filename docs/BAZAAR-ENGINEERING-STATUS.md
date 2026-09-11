# Bazaar production status — 2026-09-11

The reviewed additive adapter from core main `905d8706a0f753bf3ea93dc4072084e6c5b2f3df` is LIVE as `6f17ddad-8461-4b78-b6c3-ea7b77339cc8` at 100% traffic. Health, readiness, legacy capabilities/OpenAPI, anonymous admin rejection, MCP initialization/listing, public schemas and discovery-only unpaid 402 pass. CDP returns `valid=true`, `simulation=accepted`. No wallet was signed and no payment occurred.

## Exact indexing blocker

No payable report was prepared from the four checked allowed origin roots. Each returned `available=false`, `NO_VERIFIABLE_DECLARATION`, `UNKNOWN`, and `charge_micro=0`:

| Checked root | Observed cause |
|---|---|
| rslstandard.org | Linked RSL Collective license returned application/xml; approved profile requires application/rsl+xml. |
| rslcollective.org | Same license media type mismatch. |
| medium.com | Resource HTTP 403. |
| theguardian.com | Redirect rejected and resource not fetched under robots policy. |

These results concern the checked URLs, not every URL on those origins. Discovery-only 402 is not a payable challenge. Production prepared binding, paid report, retry after settlement and no-second-charge behavior remain unverified. Do not sign a discovery-only offer or bypass the approved MIME, redirect or source policy. No new feature or source-policy change was introduced.

[CDP discovery documentation](https://docs.cdp.coinbase.com/x402/seller/get-discovered) requires a successful settled call before indexing. Read-only validation does not perform that call or prove indexing. Bazaar indexing is UNVERIFIED; the purchase is blocked before wallet authorization.

## Release evidence

- Fresh verification: 446 tests, 444 passed, zero failures, two existing Windows symlink skips; 124 syntax checks. Actual local workerd with D1, Durable Objects and R2 passed, as did SDK type checking.
- Main CI run 34526927657, attempt 2, passed on the deployed commit. The core automatic deployment flag remains disabled.
- Dependency audit: zero vulnerabilities. Gitleaks scanned the tracked index, all 15 Git commits and the actual 182,255-byte compiled Worker, with no findings.
- Rebuilt Worker SHA-256: `62c1184044136ebdb63679749603764f483712060a7fb1b6aacab570d4247f5f`, identical to the reviewed candidate. Source SHA-256: `af21b15c04a56f1e104a736de699652c9b56b4871de7827cf2ac6078a05dbe84`.
- Fresh private change-release evidence binds results, commit, artifact, remote baseline and rollback. Historical initial-launch attestations were preserved; no unperformed test or payment was relabeled PASS.
- Uploaded version readback matched every previous binding except SOURCE_SHA256 and RELEASE_EVIDENCE_SHA256. Runtime and all five Durable Object namespace IDs matched. Payment mode, recipient, prices, Base network, USDC asset, facilitator, Access, reconciliation and disabled provider routing remain unchanged.
- After activation, domains, schedules and non-versioned settings matched the before snapshot. No route, Access policy or database schema migration was performed. Four protected local configuration files retained their baseline hashes.
- Available rollback: `b76bb091-bccd-44b9-ba96-8e7ea59b3d3e`.

## Distribution and Sepolia

Automatic Pages deployment from distribution main is enabled. The main-only distribution-docs GitHub environment holds the Pages credential; the workflow targets only acqpath-distribution. [The verified push-triggered run](https://github.com/reflectme-source/acqpath-distribution/actions/runs/34532332869) passed Windows/Linux tests, history/artifact scans, deployment and public byte/header/link/404 readback on both docs domains.

Sepolia version `2ac81afe-ac5c-43c5-930c-049a90e6c0b7` passed 14 unpaid checks on September 10, including signed prepared binding and identical retry against an isolated fixture. Those are testnet results, not production payment proof. Sepolia payment submissions remain blocked. npm remains unpublished by owner choice. Existing MCP and legacy HTTP integrations remain compatible.

External paid reports, repeat external payers and received external USDC are UNKNOWN for this launch. Earlier aggregate snapshots are historical. Any future owner-approved indexing purchase must be classified INTERNAL_INDEXING_QA, never organic revenue.

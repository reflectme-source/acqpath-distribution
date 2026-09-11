> Historical pre-release record — superseded for buyer integration. Production `0c3b5794-f428-4e69-879e-29cab293cd1a` (core `9533e49d262d20d5bb3712321fbc66981e477418`) supports tested official TS/Python x402 signers through the AcqPath SIWX adapter. Old blocker/design statements below describe only their dated snapshot; they are not current buyer instructions or authorization for another phase/payment. Use the [current installation, purchase and recovery guide](https://developers.getacqpath.com/examples/OFFICIAL-CLIENTS.md). Generic zero-config clients are not claimed; independent mainnet paid E2E remains UNVERIFIED.

# Bazaar security review

> Historical Phase 3 review. Its no-core-change status records that phase only. The subsequently authorized additive Phase 3B adapter is implemented; see [current engineering status](BAZAAR-ENGINEERING-STATUS.md). Production and payment boundaries still apply.

Date: 2026-09-10. Decision: **BLOCKED**. No runtime patch, production configuration write, deployment, wallet signature or real settlement was performed. Synthetic unit-test evidence keys and payment fixtures are not wallet authorizations.

## Findings

| Area | Evidence and conclusion |
| --- | --- |
| Claim confidentiality | The claim is hashed in the intent and required before 402. It never belongs in Bazaar info, schemas' examples, query strings, logging or public checkpoints. Giving a crawler this claim would cross the caller's retrieval boundary. |
| Quote ID / private paid URL | Each native offer binds a unique report URL. A quote ID alone does not bypass claim authentication, but exposes order correlation and yields an unusable public entry. The review test confirms 401 without claim and 404 for a catalog template. |
| Customer source URL | The diagnostic contains the caller's resource/context. Catalog examples must be synthetic, static and explicitly labeled. The design's public example is illustrative, not a fetched observation or a claim that a declaration exists there. |
| Dynamic route normalization | The current Foundation server copies actual pathParams into discovery info. The facilitator's extraction retains extensions. A routeTemplate is insufficient redaction: a signed JWS offer can be decoded to recover its concrete report URL. Actual CDP public serialization/redaction remains unproven. |
| Catalog poisoning | The current parser accepts unknown buyer extensions; Facilitator forwards them. A local test shows a fabricated Bazaar routeTemplate surviving to the mocked verify body. Bazaar is currently undeclared, so this is a blocker to opt-in, not evidence that the current service has already poisoned a catalog. |
| URL / offer canonicalization | Substituting a catalog template into payment resource.url changes the binding checked by server and SDK. Changing signed offers or treating the template as a real redemption URL would alter existing semantics. |
| Schema injection | Static design schemas are validated offline; external $ref/$id values are rejected. No remote schema fetch or evaluator is used. A future integration must use a server-owned allowlist rather than blindly trusting client metadata. |
| Replay and duplicate payment | Existing parsePayment, durable nonce ownership, payment-identifier ownership, per-intent serialization and stored settlement remain unchanged. The review tests cover repeat redemption and cross-quote replay. |
| Uncertain settlement | Existing SETTLING/UNCONFIRMED journal and reconciliation remain authoritative. No new order, signature or automatic refund is introduced. |
| Arbitrary URL abuse | Public-origin validation, approved-origin coverage, canonical URL restrictions, fetch limits and existing SSRF checks remain. Unsupported origins reject before network work. Metadata adds no new fetching capability. |
| Paid crawl / UNKNOWN | Paid purpose enum excludes crawl. UNKNOWN never grants permission. The existing free XML inspection endpoint may discuss crawl; it is not advertised as a paid Bazaar resource. |
| Admin / Access / provider routing | Only report retrieval was considered. No admin endpoint, disabled provider route or free MCP quote was advertised as paid. Access and operator configuration hashes are unchanged; runtime capability readback keeps provider quote/planning false. |
| Wallet / secrets | No wallet is connected. Core secret directories, operator values and checkpoints were not copied into distribution. Isolated source copies and raw test captures stay in ignored `.local`. Configuration files were compared by hash, with only whitelisted public payment settings recorded. |

Implementation references and pinned links are in BAZAAR-OFFICIAL-REQUIREMENTS.md. Existing source review is in BAZAAR-CURRENT-FLOW.md. These are engineering checks, not an external penetration-test certification.

## Dependencies and delivery boundary

Core runtime npm dependencies: **0**. Core tooling remains TypeScript **5.8.3** and Wrangler **4.129.1**. The raw npm audit reports **3 high-severity package entries**, one advisory chain: sharp → miniflare → wrangler, [GHSA-rgj7-g3m4-5g8c](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c). No audit fix or upgrade was applied. This is not proof of runtime exposure, and the raw audit is not relabeled clean by the existing CI exception.

Separate distribution tooling pins Ajv **8.20.0** and Wrangler **4.131.0** with a committed lockfile candidate; its audit reports **0 vulnerabilities**. Install scripts were disabled. Wrangler was installed but never executed. These tools do not replace or modify core tooling.

The prepared docs workflow has no core checkout, Worker deployment or production credentials. It accepts only a sealed static artifact, rejects Worker/Functions/runtime-config paths, pins Actions to commits, scans secrets before upload and binds all artifact bytes to a source commit. Four explicitly named source examples are downloadable assets, not executed Pages functions. Credentials are exposed only to the Pages upload step after verification. Live account enforcement still requires owner-authorized setup; the workflow is not yet published or active.

## Required design gate

Before any Bazaar opt-in, decide how a public discovery/validation contract can refer to the existing private operation without publishing claims, order IDs or customer URLs. Prove full catalog serialization safety and server-authoritative metadata forwarding with an unchanged payment journal. If that requires an order-creating wrapper, reusable challenge or paid MCP method, approve that behavioral scope separately. No metadata-only patch was applied merely to obtain a green schema result.

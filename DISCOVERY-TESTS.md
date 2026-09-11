> Historical pre-release record — superseded for buyer integration. Production `0c3b5794-f428-4e69-879e-29cab293cd1a` (core `9533e49d262d20d5bb3712321fbc66981e477418`) supports tested official TS/Python x402 signers through the AcqPath SIWX adapter. Old blocker/design statements below describe only their dated snapshot; they are not current buyer instructions or authorization for another phase/payment. Use the [current installation, purchase and recovery guide](https://developers.getacqpath.com/examples/OFFICIAL-CLIENTS.md). Generic zero-config clients are not claimed; independent mainnet paid E2E remains UNVERIFIED.

# Discovery tests — stranger perspective

Test date: 2026-09-10. Searches are finite observations of returned results, not claims about all queries, global rankings or future indexing. Public MCP testing uses initialize, notifications/initialized and tools/list only. No quote tool, payment, wallet or operator secret is used by discovery tests.

| Channel | Brand | Capability | Problem | Synonym | Public readback / callable scope | Status |
|---|---|---|---|---|---|---|
| Official MCP Registry | Exact namespace and current version found | Name-only search cannot search description intent | Same limitation | Same limitation | Exact rc.2 manifest equals reviewed build; active; public MCP handshake/tool schemas verified separately | INDEXED / NAME SEARCHABLE / MCP METADATA CALLABLE |
| Smithery | AcqPath missing from the five suggestions observed during early tests | `RSL rights preflight`: AcqPath first of returned suggestions | `can I use this page for RAG`: no AcqPath in five suggestions | `machine-readable usage restrictions`: no AcqPath in five suggestions | Public listing exists, truthful full description, repo/docs links and three upstream tool schemas. Successful platform metadata scan; no tool calls | PUBLISHED / CAPABILITY SEARCHABLE; other queries not proven |
| Glama | AcqPath returned matching connector | RSL rights: FOUND | RAG question: NOT FOUND in returned links | Usage-restrictions phrase: NOT FOUND in returned links | Existing com.getacqpath/acqpath record, exact endpoint, healthy platform metadata inspection; ownership verified | INDEXED / BRAND SEARCHABLE / MCP METADATA CALLABLE |
| GitHub repository | Exact public repo readback exists | Phase 2 search checks appended after push | Phase 2 search checks appended after push | Phase 2 search checks appended after push | Public source/README/examples and homepage; GitHub is documentation, not paid execution | PUBLISHED; search result evidence separate |
| Public docs and machine assets | Direct URL available | Dedicated purpose pages and intents.json provide context | Direct retrieval available | Search engine indexing is not implied by publishing llms/robots/sitemap | Exact file bytes after approved Cloudflare insertion, security headers, canonical internal paths and 404 checked by verify-docs | See final deployment readback below |
| GitMCP | Repository URL conversion is supported | Documentation search only | Documentation search only | Documentation search only | Metadata-only connection must be verified; does not call or replace AcqPath payments | See independent probe below |
| Bazaar / Agentic Market derivatives | No AcqPath match in bounded queries | Rights/RSL queries no match | Buyer-intent queries no match | No matching result returned | No direct paid listing or paid invocation established | NOT FOUND FOR TESTED QUERIES / CORE BLOCKED |
| Docker | No AcqPath submission yet | N/A | N/A | N/A | Prepared remote metadata; owner approval and then curator review required | READY, NOT PUBLISHED |
| PulseMCP | No new listing claimed | N/A | N/A | N/A | Submission form paused | NOT SUBMITTED |
| Context7 | No listing claimed | N/A | N/A | N/A | Owner sign-in required to add public docs | READY, NOT SUBMITTED |
| skills.sh | No directory indexing claimed | N/A | N/A | N/A | Public SKILL.md validates; repository source availability is separate from install-based ranking | SOURCE PUBLISHED; DIRECTORY INDEXING UNVERIFIED |

## What counts as a pass

A channel accepting metadata is not enough. For owned published surfaces, check identity, endpoint, live version/description and working public links. A tools/list response proves callable protocol metadata, not successful quote creation, payment, evidence delivery or repeat purchase. Healthy is the directory's observed connection state, not an uptime SLA or a legal/service certification.

Official MCP search is case-insensitive substring matching against **server name**, not semantic description search. Intent-rich descriptions help downstream catalogs; renaming namespaces to stuff keywords would fragment identity. [Official API contract](https://github.com/modelcontextprotocol/registry/blob/main/docs/reference/api/official-registry-api.md).

Glama's Directory API currently requires a bearer key. Its public listing and browser search can be checked without adding credentials to CI; do not claim anonymous API access. Third-party catalog data is not bulk mirrored here. [Glama API reference](https://glama.ai/mcp/reference).

Smithery and Glama display actual upstream tools. Their listing still exposes the disabled legacy `acqpath_quote`; public descriptions explicitly warn against using it. Only the core could change the remote tools/list payload, and that was not changed.

## Automated checks

`.github/workflows/visibility.yml` runs daily at **06:23 UTC**, plus manual dispatch, with read-only repository permissions and pinned official Action SHAs. `scripts/discovery-check.mjs` builds the expected static assets, checks production public liveness/readiness/source/evidence-key/MCP metadata, detects price/coverage/purpose/routing drift, checks exact active Registry metadata and brand search, and verifies docs assets, security headers, local links, selected external links and required public channel readbacks.

The job exits nonzero for regressions or unavailable required surfaces, writes a step summary, and uploads diagnostic metadata artifacts for 14 days even on failure. It has no production operator secrets and makes no quote/payment calls. A successful run does not prove that future scheduled runs have already happened; GitHub scheduling/notification policy is controlled by GitHub. Buyer-intent ranking is assessed separately; daily checks do not generate search/usage volume to game rankings.

Regression tests cover changed registry descriptions, inactive lifecycle, price/coverage/routing drift, cross-origin redirects, streamed response limits, unsafe asset paths, duplicate analytics insertion and preservation of unknown scripts. The paid-flow tests use fixtures only. Cloudflare's exact reviewed analytics insertion is the only content normalization allowed; unexpected edge scripts still fail document equality checks.

## Privacy and attribution

No private claim, checkpoint, signed payment payload, seed or private key appears in public configs or reports. Actual quote identifiers and tokens are not included in examples. Capability readbacks expose only the public service contract. Cloudflare browser analytics cannot connect a discovery visit to a payer. Public QA checks and owner visits must not be counted as customers.

A final local secret scan and redacted staged diff scan precede the push. The final acceptance report records the actual GitHub CI and discovery run URLs, deployment ID and independent public file readback.

## Final stranger observations — 2026-09-10

- Glama anonymous public searches at 15:34 UTC: `AcqPath` FOUND (one connector link); `RSL rights` FOUND (22 connector links); `can I use this page for RAG` NOT FOUND among the returned connector links (26); `machine-readable usage restrictions` NOT FOUND among returned links (26). These are bounded response observations, not exact global ranks. The public record independently contains the correct endpoint, current long description, disabled legacy warning and `/from-glama` link. Owner metadata was saved with the RAG Systems category; the public ownership marker is verified.
- Four web searches scoped to `developers.getacqpath.com` returned no results for AcqPath, RSL rights preflight, the RAG problem phrase and machine-readable usage restrictions. This is NOT FOUND FOR TESTED QUERIES, not proof of exclusion from every search engine. Direct public retrieval works.
- GitHub description, homepage `/from-github`, public visibility and 12 factual topics were read back with the GitHub API. Search after the Phase 2 push is recorded separately below.
- GitMCP at `https://gitmcp.io/reflectme-source/acqpath-distribution` responded HTTP 200 to initialize and tools/list at 15:24 UTC; it negotiated MCP 2025-03-26, server GitMCP 1.1.0, and exposed four documentation tools. This confirms public documentation metadata connectivity only, not semantic search quality or paid AcqPath execution. No payment keys or quote claims were supplied.
- Live visual review confirmed the new landing page shows the supported purposes, signed-evidence output, fresh/deep prices, integration CTA and limitations. A stale cached CSS response on the custom domain led to a content-hash query parameter on stylesheet links in the final build. This changes only documentation presentation and avoids reusing a prior cached stylesheet.

Exact 44-file readback and 27-link checks passed on both hosts before the stylesheet URL adjustment. Final deployment and CI evidence follow in docs/ACCEPTANCE.md; byte verification is repeated after the final upload because HTML changed.

## GitHub and GitMCP after the push

At 16:01 UTC, GitHub repository search found AcqPath by name (2 total results) and `RSL rights preflight in:description` (1 result). Exact problem and synonym phrases in README returned 0 results. All searches explicitly selected public repositories, with at most 100 returned results. Description, 12 topics, public visibility and `/from-github` were independently read back.

GitMCP at 16:02 UTC successfully fetched the new 4,073-character root llms reference from the public repository. Its brand, RAG problem and machine-readable restriction queries returned documentation fallback with “No relevant documentation found”; the RSL capability query timed out. Status: DOCUMENTATION FETCH VERIFIED; SEMANTIC INDEX/QUALITY UNVERIFIED. Fallback content containing AcqPath is not a successful semantic search. No further queries were generated to influence ranking.

The first Phase 2 Windows/Ubuntu CI run [34499024566](https://github.com/reflectme-source/acqpath-distribution/actions/runs/34499024566) passed for `8c2223578d0aae2c2e71ce9291aba4d3be33ef92`. The first new daily discovery run reported a failure; its diagnostic and final disposition are recorded in the acceptance evidence, rather than treating artifact upload as a passed check.

## Discovery monitor correction

Run 34499025305 passed production public API/MCP/contract checks, 44 docs assets, 27 links, exact active Registry metadata, GitHub documentation links, Smithery and Glama. Its only failed check was a timed-out official Registry brand search. Registry GETs now allow at most two 25-second attempts for transport timeouts or transient 429/502/503/504 responses; metadata mismatches and unsafe destinations are never retried into success. Exhaustion still fails the workflow.

The first upload-artifact step skipped the hidden `.local` directory and produced no downloadable diagnostic artifact. The corrected workflow explicitly includes hidden files for only its three public-metadata path patterns, and fails when none are found. No broader workspace/private directory is uploaded.

Two factual README FAQ answers were added after the first GitHub search: the RAG problem phrase and machine-readable usage restrictions now lead to the actual purpose/coverage/private-payment limitations. Prior no-match results remain recorded; text changes alone are not proof of reindexing.

Final docs deployment: `43c3c41e-c1f0-47af-83a5-bd3c3b8398d5`, 47 files, ZIP SHA256 `d501f82b957043ad0bfc93d721cc698ad590b2221f168a58e1faaf7344e045d4`. Both hostnames passed 44 asset and 27 link checks at 15:53 UTC, plus the custom 404. Local full discovery passed all 10 checks at 16:10 UTC; Registry reads succeeded on their first attempt. Final GitHub execution and its downloadable diagnostics are recorded in the release verification attachment linked from docs/ACCEPTANCE.md.

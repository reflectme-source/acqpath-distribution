# Wave 1 approval bundle

No external action has been taken. This file is the exact approval package for a future async outreach wave.

| Target | Recommendation | Revised score | Payment compatibility | Insertion point | Patch status | Test status | Incremental cost scenario | Value proposition | Outreach channel | Outreach ready |
|---|---|---:|---|---|---|---|---|---|---|---|
| Agentic Research Marketplace | PUBLISH | 92 | VERIFIED Base mainnet x402 buyer | `src/worker.ts` after paid search returns URL-bearing results and before findings enter synthesis | PATCH_PREPARED | Syntax PASS; full typecheck blocked by upstream unrelated `runIntent.ts` error | Top 2 sources × 3 workers × 2 queries = $0.24; recommend $0.10/session cap | Optional rights-aware mode for selected sources entering model context | GitHub issue/discussion | YES |
| AgentRAG | PUBLISH | 84 | VERIFIED Base mainnet default x402 wallet mode | Before `ask/ingest` source URLs are submitted for ingest/indexing | CONCEPT / example proposal | Not patched; source verified | 5 pages = $0.10 preflight vs $0.025 ingest; recommend opt-in collection policy | Rights checkpoint before source ingest into RAG collection | GitHub discussion/issue | YES |
| Sentinel | PUBLISH | 80 | x402 payment tool verified; best as optional example/tool | `examples/x402-langchain-agent/index.ts` / `SentinelX402Tool` use before URL-bearing paid fetch | CONCEPT / example proposal | Not patched; source verified | 2 URL checks = $0.04 inside example $1 budget | Compliance/audit policy example for research agents | GitHub discussion/issue | YES |
| AgentProcure | HOLD | 61 | Buyer exists but Base Sepolia hard-coded | `agent/executor.ts` before paid endpoint fetch | HOLD | Not patched | Economics blocked by network mismatch | Useful only if maintainer wants Base mainnet support | No outreach in Wave 1 unless asking roadmap | NO |

## Exact external text: Agentic Research Marketplace

Title: Optional rights-aware checkpoint before research findings enter synthesis

We inspected the current research workflow in `src/runIntent.ts`, `src/worker.ts`, and `src/payment.ts`.

The project already has the right payment primitive for this: `src/payment.ts` uses a CDP EVM account and `@x402/fetch` on Base mainnet, and `src/worker.ts` turns URL-bearing search results into findings that later enter synthesis.

A small AcqPath integration can run after a paid search call returns candidate source URLs and before those findings enter model context. The useful pattern is not “pay for every URL.” It is an optional `RIGHTS_AWARE` advisory mode with a source cap and spend cap, for example checking only the top cited sources that will actually enter the final answer.

Current cost scenario: if a run has 3 workers × 2 queries and checks the top 2 source URLs from each query, AcqPath would add 12 × $0.02 = $0.24. That can be much more than the search cost itself, so the prepared patch defaults to opt-in advisory mode and supports caps such as `ACQPATH_MAX_SOURCES_PER_WORKER` and `ACQPATH_MAX_SPEND_USD`.

The result is signed observed machine-readable rights evidence before third-party content enters synthesis. UNKNOWN remains UNKNOWN; it is not legal clearance, copyright clearance, ownership verification, or permission.

I prepared a minimal patch against the current source. It adds a small `src/acqpath.ts` helper and calls it from `runWorker` after search results return. The patch syntax-checks, but the repo currently has an unrelated TypeScript error in `src/runIntent.ts` that blocks a full `tsc --noEmit` pass. If this fits your roadmap, I can open the PR or adjust the policy shape first.

## Exact external text: AgentRAG

Title: Optional AcqPath preflight before source ingest

We inspected the current CLI/client docs and source for AgentRAG. The project already has the core loop AcqPath is designed for: `agentrag ingest --sources ...` and `agentrag ask --sources ...` accept external URLs or crawl roots, and the CLI defaults to Base mainnet via `AGENTRAG_NETWORK=eip155:8453` with x402 wallet-mode payment.

A useful integration would be an optional pre-ingest policy: before a source URL is submitted for ingest/indexing, call AcqPath’s stock x402 Rights Preflight endpoint and retain the signed observed-rights evidence with the ingest result or collection metadata.

Cost matters here. AgentRAG ingest is documented at $0.005/page, while AcqPath fresh preflight is $0.02/source. Checking every page would be too expensive for many collections. The adoption-friendly pattern is opt-in and budget-controlled: check explicit source URLs, first page of a crawl root, or selected high-value collections, with a max AcqPath spend cap.

UNKNOWN remains UNKNOWN; the report is evidence, not legal clearance or permission. If this direction fits AgentRAG, I can prepare a PR around the CLI/client source validation path rather than changing the core service contract.

## Exact external text: Sentinel

Title: AcqPath as an optional Sentinel policy/tool example for research agents

We inspected the Sentinel repo and examples. Sentinel already focuses on policy, audit, and budget control for x402 payments. The most natural AcqPath integration is not a core dependency; it is an optional example/tool for research agents using `SentinelX402Tool`.

In `examples/x402-langchain-agent/index.ts`, the agent is instructed to fetch paid data from x402 endpoints under a budget. AcqPath can be added as a rights-aware preflight step before URL-bearing external content is admitted into the research context: call AcqPath’s stock Base x402 endpoint, retain the signed observed-rights evidence, and let Sentinel policy decide whether UNKNOWN blocks, warns, or simply records evidence.

Cost scenario: checking two selected source URLs adds $0.04 against the example’s $1.00 budget. That is reasonable as an optional compliance/audit policy, but it should not be forced on every fetch.

This does not claim legal clearance, copyright clearance, or guaranteed permission. UNKNOWN remains UNKNOWN. If this fits Sentinel’s examples roadmap, I can open a small example PR rather than propose a core architecture change.

## AgentProcure hold note

AgentProcure is a good conceptual fit, but the current source hard-codes Base Sepolia in `agent/executor.ts` through `ExactEvmScheme` on `eip155:84532`, and the README describes Base Sepolia throughout. AcqPath’s stock endpoint is Base mainnet. Wave 1 should not ask AcqPath to add Sepolia or change payment architecture. Hold until the project has Base mainnet support or asks for it.

# Wave 1 live publication log

published_at: 2026-09-27T12:37:42+02:00
operator: reflectme-source via signed-in GitHub browser session
scope: approved Wave 1 only

No production/core change, Cloudflare change, wallet use, payment, email, PR or extra prospect contact occurred.

| Target | Publication URL | Publication type | Status |
|---|---|---|---|
| Agentic Research Marketplace | https://github.com/rtolpin/Agentic-Research-Marketplace/issues/1 | GitHub issue | PUBLISHED |
| AgentRAG | https://github.com/agentx402-ai/agentrag/issues/21 | GitHub issue, feature request template | PUBLISHED |
| Sentinel | https://github.com/valeo-cash/Sentinel/issues/3 | GitHub issue | PUBLISHED |
| AgentProcure | none | none | HOLD |

## Agentic Research Marketplace

publication_url: https://github.com/rtolpin/Agentic-Research-Marketplace/issues/1
publication_type: GitHub issue
published_at: 2026-09-27T12:37:42+02:00
status: PUBLISHED

exact_message:

~~~md
We inspected the current research workflow in `src/runIntent.ts`, `src/worker.ts`, and `src/payment.ts`.

The project already has the right payment primitive for this: `src/payment.ts` uses a CDP EVM account and `@x402/fetch` on Base mainnet, and `src/worker.ts` turns URL-bearing search results into findings that later enter synthesis.

A small AcqPath integration can run after a paid search call returns candidate source URLs and before those findings enter model context. The useful pattern is not “pay for every URL.” It is an optional `RIGHTS_AWARE` advisory mode with a source cap and spend cap, for example checking only the top cited sources that will actually enter the final answer.

Preferred flow:

```text
search
→ candidate results
→ select sources that will enter synthesis/context
→ AcqPath preflight
→ target policy
→ synthesis
```

Current cost scenario: if a run has 3 workers × 2 queries and checks the top 2 source URLs from each query, AcqPath would add 12 × $0.02 = $0.24. That can be much more than the search cost itself, so the prepared patch defaults to opt-in advisory mode and supports caps such as `ACQPATH_MAX_SOURCES_PER_WORKER` and `ACQPATH_MAX_SPEND_USD`.

The result is signed observed machine-readable rights evidence before third-party content enters synthesis. UNKNOWN remains UNKNOWN; it is not legal clearance, copyright clearance, ownership verification, or permission.

I prepared a minimal patch against the current source. It adds a small `src/acqpath.ts` helper and calls it from `runWorker` after search results return. The patch applies and the modified files syntax-check, but the repo currently has an unrelated TypeScript error in `src/runIntent.ts` around `serviceCategory` that blocks a full `tsc --noEmit` pass. If this fits your roadmap, I can open the PR or adjust the policy shape first.
~~~

## AgentRAG

publication_url: https://github.com/agentx402-ai/agentrag/issues/21
publication_type: GitHub issue using feature request template
published_at: 2026-09-27T12:37:42+02:00
status: PUBLISHED

exact_message:

~~~md
**Problem / motivation**

AgentRAG already has a source-ingest loop where external URLs or crawl roots can enter a paid RAG collection through `agentrag ingest --sources ...` and `agentrag ask --sources ...`. That is the point where a buyer may want machine-readable rights evidence before the content is stored/indexed.

We inspected the current CLI/client docs and source. The CLI defaults to Base mainnet via `AGENTRAG_NETWORK=eip155:8453` with x402 wallet-mode payment, which matches AcqPath’s production stock x402 endpoint.

**Proposed solution**

Add an optional pre-ingest policy: before a source URL is submitted for ingest/indexing, call AcqPath’s stock x402 Rights Preflight endpoint and retain the signed observed-rights evidence with the ingest result or collection metadata.

This should be opt-in and budget-controlled. AgentRAG ingest is documented at $0.005/page, while AcqPath fresh preflight is $0.02/source. Checking every page would be too expensive for many collections. A practical policy would check explicit source URLs, the first page of a crawl root, or selected high-value collections, with a max AcqPath spend cap.

UNKNOWN remains UNKNOWN; the report is evidence, not legal clearance, copyright clearance, ownership verification, or permission.

**Alternatives considered**

- Check every crawled page: rejected because it can dominate AgentRAG ingest cost.
- Treat AcqPath as a hard legal gate: rejected because UNKNOWN must remain UNKNOWN and policy should be caller-controlled.
- Change AgentRAG’s core service contract: not necessary for a first integration; the CLI/client source validation path is enough.

**Additional context**

If this direction fits AgentRAG, I can prepare a PR around the CLI/client source validation path rather than changing the backend service contract.
~~~

## Sentinel

publication_url: https://github.com/valeo-cash/Sentinel/issues/3
publication_type: GitHub issue
published_at: 2026-09-27T12:37:42+02:00
status: PUBLISHED

exact_message:

~~~md
We inspected the Sentinel repo and examples. Sentinel already focuses on policy, audit, and budget control for x402 payments. The most natural AcqPath integration is not a core dependency; it is an optional example/tool for research agents using `SentinelX402Tool`.

In `examples/x402-langchain-agent/index.ts`, the agent is instructed to fetch paid data from x402 endpoints under a budget. AcqPath can be added as a rights-aware preflight step before URL-bearing external content is admitted into the research context: call AcqPath’s stock Base x402 endpoint, retain the signed observed-rights evidence, and let Sentinel policy decide whether UNKNOWN blocks, warns, or simply records evidence.

Cost scenario: checking two selected source URLs adds $0.04 against the example’s $1.00 budget. That is reasonable as an optional compliance/audit policy, but it should not be forced on every fetch.

This does not claim legal clearance, copyright clearance, ownership verification, or guaranteed permission. UNKNOWN remains UNKNOWN. If this fits Sentinel’s examples roadmap, I can open a small example PR rather than propose a core architecture change.
~~~

## Monitoring states

| Target | Current state | Next allowed action |
|---|---|---|
| Agentic Research Marketplace | PUBLISHED | Monitor issue; if maintainer requests PR, prepare target-specific patch and test before PR. |
| AgentRAG | PUBLISHED | Monitor issue; answer routine technical questions; prepare PR only on maintainer signal. |
| Sentinel | PUBLISHED | Monitor issue; answer routine technical questions; prepare example PR only on maintainer signal. |
| AgentProcure | HOLD | No contact in Wave 1. |

Revenue attribution remains unchanged until a real external settlement can be tied to one of these threads by evidence.



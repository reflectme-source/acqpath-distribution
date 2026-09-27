# Target

System.Collections.Hashtable.name

## Verified evidence

Repository: https://github.com/luisvid/x402-agentic-research

Payment evidence: Buyer-agent purchase flow and x402 provider gateway protect /research tiers

External-content workflow: LangGraph/FastAPI research engine runs Tavily/LLM research and returns a research report

## Why it could generate revenue

This target can create repeated AcqPath calls when external URLs enter its research, RAG, crawl or indexing loop. The expected frequency class is **MEDIUM** and score is **77/100**.

## Current workflow

LangGraph/FastAPI research engine runs Tavily/LLM research and returns a research report

## Exact AcqPath insertion point

services/research-engine/src/server.py run_research after source collection and before ResearchResponse is returned; preflight cited/source URLs

## Existing payment capability

Buyer-agent purchase flow and x402 provider gateway protect /research tiers

## Proposed integration

Use the existing paid-fetch/wallet path where compatible and call:

POST https://api.getacqpath.com/v1/rights/preflight/x402

with { resource, purpose: 'ai-input', tier: 'fresh', max_total_micro: '20000' } before the external resource is added to context, index, vector store or synthesis.

## Expected call-frequency class

MEDIUM

## Integration complexity

MEDIUM

## Value proposition for maintainer/company

Add machine-readable rights evidence before external content enters AI/RAG/indexing/training workflows. This gives the agent an auditable signed preflight result and explicit UNKNOWN handling without creating accounts or subscriptions.

## Risks

Payment focus is provider-side research sale; AcqPath may be paid by provider unless buyer-agent is expanded.

## Disqualification conditions

Disqualify if the project cannot use Base mainnet USDC/x402, refuses per-resource preflight cost, has no repeated external URL workflow, or requires AcqPath to claim legal clearance.

## Legitimate contribution/contact route

GitHub issue/discussion first. PR only after maintainer confirms interest.

## Draft outreach

We inspected your public workflow. External resources enter at: services/research-engine/src/server.py run_research after source collection and before ResearchResponse is returned; preflight cited/source URLs. AcqPath can perform a stock x402 Rights Preflight immediately before that point, returning signed observed rights evidence for 0.02 USDC on Base. UNKNOWN remains UNKNOWN; this is not legal advice or copyright clearance. I prepared a minimal integration note for your exact workflow and can open a PR if you want it.

## Patch/PR preparation status

Local integration artifact ready: $(System.Collections.Hashtable.artifact). No external PR opened.

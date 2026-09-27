# Target

System.Collections.Hashtable.name

## Verified evidence

Repository: https://github.com/rtolpin/Agentic-Research-Marketplace

Payment evidence: Base mainnet CDP wallet and @x402/fetch for autonomous x402 searches

External-content workflow: src/orchestrator.ts plans research tasks; src/worker.ts calls each assigned service and parseTavilyResults converts external search results into findings

## Why it could generate revenue

This target can create repeated AcqPath calls when external URLs enter its research, RAG, crawl or indexing loop. The expected frequency class is **HIGH** and score is **94/100**.

## Current workflow

src/orchestrator.ts plans research tasks; src/worker.ts calls each assigned service and parseTavilyResults converts external search results into findings

## Exact AcqPath insertion point

src/worker.ts in runWorker, immediately after each service returns URL-bearing search results and before parseTavilyResults/result findings are appended

## Existing payment capability

Base mainnet CDP wallet and @x402/fetch for autonomous x402 searches

## Proposed integration

Use the existing paid-fetch/wallet path where compatible and call:

POST https://api.getacqpath.com/v1/rights/preflight/x402

with { resource, purpose: 'ai-input', tier: 'fresh', max_total_micro: '20000' } before the external resource is added to context, index, vector store or synthesis.

## Expected call-frequency class

HIGH

## Integration complexity

LOW

## Value proposition for maintainer/company

Add machine-readable rights evidence before external content enters AI/RAG/indexing/training workflows. This gives the agent an auditable signed preflight result and explicit UNKNOWN handling without creating accounts or subscriptions.

## Risks

Must keep report wording as evidence/UNKNOWN, not legal clearance.

## Disqualification conditions

Disqualify if the project cannot use Base mainnet USDC/x402, refuses per-resource preflight cost, has no repeated external URL workflow, or requires AcqPath to claim legal clearance.

## Legitimate contribution/contact route

GitHub issue/discussion first. PR only after maintainer confirms interest.

## Draft outreach

We inspected your public workflow. External resources enter at: src/worker.ts in runWorker, immediately after each service returns URL-bearing search results and before parseTavilyResults/result findings are appended. AcqPath can perform a stock x402 Rights Preflight immediately before that point, returning signed observed rights evidence for 0.02 USDC on Base. UNKNOWN remains UNKNOWN; this is not legal advice or copyright clearance. I prepared a minimal integration note for your exact workflow and can open a PR if you want it.

## Patch/PR preparation status

Local integration artifact ready: $(System.Collections.Hashtable.artifact). No external PR opened.

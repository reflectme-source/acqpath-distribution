# Target

System.Collections.Hashtable.name

## Verified evidence

Repository: https://github.com/forgesworn/402-indexer

Payment evidence: No buyer payment proven; crawler discovers paid APIs

External-content workflow: src/orchestrator.ts processes crawl/GitHub/submit/self sources and publishes Nostr service events

## Why it could generate revenue

This target can create repeated AcqPath calls when external URLs enter its research, RAG, crawl or indexing loop. The expected frequency class is **VERY_HIGH** and score is **70/100**.

## Current workflow

src/orchestrator.ts processes crawl/GitHub/submit/self sources and publishes Nostr service events

## Exact AcqPath insertion point

src/orchestrator.ts before source=crawl URLs are parsed/published; optional rights preflight before indexing third-party endpoints

## Existing payment capability

No buyer payment proven; crawler discovers paid APIs

## Proposed integration

Use the existing paid-fetch/wallet path where compatible and call:

POST https://api.getacqpath.com/v1/rights/preflight/x402

with { resource, purpose: 'ai-input', tier: 'fresh', max_total_micro: '20000' } before the external resource is added to context, index, vector store or synthesis.

## Expected call-frequency class

VERY_HIGH

## Integration complexity

MEDIUM

## Value proposition for maintainer/company

Add machine-readable rights evidence before external content enters AI/RAG/indexing/training workflows. This gives the agent an auditable signed preflight result and explicit UNKNOWN handling without creating accounts or subscriptions.

## Risks

Not a payer today; requires project choosing to pay AcqPath for index hygiene.

## Disqualification conditions

Disqualify if the project cannot use Base mainnet USDC/x402, refuses per-resource preflight cost, has no repeated external URL workflow, or requires AcqPath to claim legal clearance.

## Legitimate contribution/contact route

GitHub issue/discussion first. PR only after maintainer confirms interest.

## Draft outreach

We inspected your public workflow. External resources enter at: src/orchestrator.ts before source=crawl URLs are parsed/published; optional rights preflight before indexing third-party endpoints. AcqPath can perform a stock x402 Rights Preflight immediately before that point, returning signed observed rights evidence for 0.02 USDC on Base. UNKNOWN remains UNKNOWN; this is not legal advice or copyright clearance. I prepared a minimal integration note for your exact workflow and can open a PR if you want it.

## Patch/PR preparation status

Local integration artifact ready: $(System.Collections.Hashtable.artifact). No external PR opened.

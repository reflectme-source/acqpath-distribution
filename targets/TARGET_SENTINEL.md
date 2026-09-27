# Target

System.Collections.Hashtable.name

## Verified evidence

Repository: https://github.com/valeo-cash/Sentinel

Payment evidence: Examples import @x402/fetch and expose SentinelX402Tool for LangChain/Vercel AI agents

External-content workflow: Research/fleet examples route paid API calls through policy-controlled sentinel fetch

## Why it could generate revenue

This target can create repeated AcqPath calls when external URLs enter its research, RAG, crawl or indexing loop. The expected frequency class is **HIGH** and score is **81/100**.

## Current workflow

Research/fleet examples route paid API calls through policy-controlled sentinel fetch

## Exact AcqPath insertion point

examples/x402-langchain-agent/index.ts before sentinel_x402_fetch call; or as a policy preflight inside router strategy for URL-bearing research calls

## Existing payment capability

Examples import @x402/fetch and expose SentinelX402Tool for LangChain/Vercel AI agents

## Proposed integration

Use the existing paid-fetch/wallet path where compatible and call:

POST https://api.getacqpath.com/v1/rights/preflight/x402

with { resource, purpose: 'ai-input', tier: 'fresh', max_total_micro: '20000' } before the external resource is added to context, index, vector store or synthesis.

## Expected call-frequency class

HIGH

## Integration complexity

MEDIUM

## Value proposition for maintainer/company

Add machine-readable rights evidence before external content enters AI/RAG/indexing/training workflows. This gives the agent an auditable signed preflight result and explicit UNKNOWN handling without creating accounts or subscriptions.

## Risks

Best shipped first as example/tool, not Sentinel core requirement.

## Disqualification conditions

Disqualify if the project cannot use Base mainnet USDC/x402, refuses per-resource preflight cost, has no repeated external URL workflow, or requires AcqPath to claim legal clearance.

## Legitimate contribution/contact route

GitHub issue/discussion first. PR only after maintainer confirms interest.

## Draft outreach

We inspected your public workflow. External resources enter at: examples/x402-langchain-agent/index.ts before sentinel_x402_fetch call; or as a policy preflight inside router strategy for URL-bearing research calls. AcqPath can perform a stock x402 Rights Preflight immediately before that point, returning signed observed rights evidence for 0.02 USDC on Base. UNKNOWN remains UNKNOWN; this is not legal advice or copyright clearance. I prepared a minimal integration note for your exact workflow and can open a PR if you want it.

## Patch/PR preparation status

Local integration artifact ready: $(System.Collections.Hashtable.artifact). No external PR opened.

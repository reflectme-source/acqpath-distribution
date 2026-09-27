# Target

System.Collections.Hashtable.name

## Verified evidence

Repository: https://github.com/naividh/agent-procure

Payment evidence: agent/executor.ts uses wrapFetchWithPaymentFromConfig from @x402/fetch for paid API execution

External-content workflow: Discovery scans /api/discover endpoints; rank/budget chooses services; executor pays APIs; synthesizer merges paid source data

## Why it could generate revenue

This target can create repeated AcqPath calls when external URLs enter its research, RAG, crawl or indexing loop. The expected frequency class is **HIGH** and score is **84/100**.

## Current workflow

Discovery scans /api/discover endpoints; rank/budget chooses services; executor pays APIs; synthesizer merges paid source data

## Exact AcqPath insertion point

agent/executor.ts executeCall before paidFetch(url); when the service endpoint or result source URL is external content, run AcqPath stock preflight first

## Existing payment capability

agent/executor.ts uses wrapFetchWithPaymentFromConfig from @x402/fetch for paid API execution

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

Current README says Base Sepolia; needs Base mainnet wallet/facilitator configuration for AcqPath stock route.

## Disqualification conditions

Disqualify if the project cannot use Base mainnet USDC/x402, refuses per-resource preflight cost, has no repeated external URL workflow, or requires AcqPath to claim legal clearance.

## Legitimate contribution/contact route

GitHub issue/discussion first. PR only after maintainer confirms interest.

## Draft outreach

We inspected your public workflow. External resources enter at: agent/executor.ts executeCall before paidFetch(url); when the service endpoint or result source URL is external content, run AcqPath stock preflight first. AcqPath can perform a stock x402 Rights Preflight immediately before that point, returning signed observed rights evidence for 0.02 USDC on Base. UNKNOWN remains UNKNOWN; this is not legal advice or copyright clearance. I prepared a minimal integration note for your exact workflow and can open a PR if you want it.

## Patch/PR preparation status

Local integration artifact ready: $(System.Collections.Hashtable.artifact). No external PR opened.

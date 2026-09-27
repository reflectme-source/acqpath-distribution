# Target

System.Collections.Hashtable.name

## Verified evidence

Repository: https://github.com/kunaldrall29/walras

Payment evidence: docs describe paid_call over stock @x402/fetch path with spend caps

External-content workflow: MCP search_resources returns catalog hits; paid_call pays selected HTTP/MCP resource

## Why it could generate revenue

This target can create repeated AcqPath calls when external URLs enter its research, RAG, crawl or indexing loop. The expected frequency class is **MEDIUM** and score is **73/100**.

## Current workflow

MCP search_resources returns catalog hits; paid_call pays selected HTTP/MCP resource

## Exact AcqPath insertion point

packages/mcp-server paid_call selection path: if query intent is rights/RAG/training, call AcqPath stock preflight as selected resource when available

## Existing payment capability

docs describe paid_call over stock @x402/fetch path with spend caps

## Proposed integration

Use the existing paid-fetch/wallet path where compatible and call:

POST https://api.getacqpath.com/v1/rights/preflight/x402

with { resource, purpose: 'ai-input', tier: 'fresh', max_total_micro: '20000' } before the external resource is added to context, index, vector store or synthesis.

## Expected call-frequency class

MEDIUM

## Integration complexity

LOW

## Value proposition for maintainer/company

Add machine-readable rights evidence before external content enters AI/RAG/indexing/training workflows. This gives the agent an auditable signed preflight result and explicit UNKNOWN handling without creating accounts or subscriptions.

## Risks

Stellar-first; AcqPath absent from Bazaar/CDP catalog today.

## Disqualification conditions

Disqualify if the project cannot use Base mainnet USDC/x402, refuses per-resource preflight cost, has no repeated external URL workflow, or requires AcqPath to claim legal clearance.

## Legitimate contribution/contact route

GitHub issue/discussion first. PR only after maintainer confirms interest.

## Draft outreach

We inspected your public workflow. External resources enter at: packages/mcp-server paid_call selection path: if query intent is rights/RAG/training, call AcqPath stock preflight as selected resource when available. AcqPath can perform a stock x402 Rights Preflight immediately before that point, returning signed observed rights evidence for 0.02 USDC on Base. UNKNOWN remains UNKNOWN; this is not legal advice or copyright clearance. I prepared a minimal integration note for your exact workflow and can open a PR if you want it.

## Patch/PR preparation status

Local integration artifact ready: $(System.Collections.Hashtable.artifact). No external PR opened.

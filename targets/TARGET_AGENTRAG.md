# Target: AgentRAG

STATUS: OUTREACH_READY
RECOMMENDATION: PUBLISH

## Verified evidence

- Repo: https://github.com/agentx402-ai/agentrag
- Current HEAD inspected: `83971ca4702a363b00431bacd6dcde84b71123c9`
- Payment: CLI docs describe wallet-mode x402 payment; client package depends on `@agentx402-ai/core` with x402 EVM support.
- Network: `AGENTRAG_NETWORK` default is `eip155:8453` Base mainnet; `eip155:84532` is optional.
- External content: `agentrag ask --sources` and `agentrag ingest --sources` accept external exact URLs or crawl roots.

## Exact insertion point

Before `client.ingest(parsed.opts)` in `cli/src/commands/ingest.ts`, and before `client.ask(..., opts)` for `ask --sources`, as an optional pre-ingest policy wrapper.

## Economics

AgentRAG ingest is documented as $0.005/page and ask as $0.008 without ingest. AcqPath is $0.02/source. Checking every page could multiply small ingest costs, so recommend opt-in collection policy with source limits.

## Patch status

No direct patch prepared. A direct client patch needs maintainer input on where evidence should live: CLI output, collection metadata, or server-side ingest records.

Status: OUTREACH_READY concept/example.

## Outreach

Use exact text in `WAVE1_APPROVAL.md`.

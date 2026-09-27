# Target: Sentinel

STATUS: OUTREACH_READY
RECOMMENDATION: PUBLISH

## Verified evidence

- Repo: https://github.com/valeo-cash/Sentinel
- Current HEAD inspected: `f103066e8eaca1dd83a45e203865d9fd7f874c4f`
- Payment: package peer-depends on `@x402/fetch`; example imports `SentinelX402Tool` for LangChain research agents.
- External content: `examples/x402-langchain-agent/index.ts` directs a research agent to fetch paid data from x402 endpoints under a $1 budget.

## Exact insertion point

Example/tool layer, not core: `examples/x402-langchain-agent/index.ts`, before `sentinel_x402_fetch` admits URL-bearing content into the research result. A Sentinel policy example can decide ADVISORY vs STRICT behavior.

## Economics

Two selected AcqPath checks cost $0.04 within the example $1 budget. Best pitched as optional compliance/audit policy, not mandatory every-fetch overhead.

## Patch status

No core patch prepared. Recommend a small example PR only if maintainer wants it.

Status: OUTREACH_READY.

## Outreach

Use exact text in `WAVE1_APPROVAL.md`.

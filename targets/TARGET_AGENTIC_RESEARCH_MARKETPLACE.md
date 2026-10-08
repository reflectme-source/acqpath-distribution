# Target: Agentic Research Marketplace

STATUS: PATCH_PREPARED
RECOMMENDATION: PUBLISH

## Verified evidence

- Repo: https://github.com/rtolpin/Agentic-Research-Marketplace
- Current HEAD inspected: `961a91b4e69089bc67268b0f548008a49fbc1b48`
- Payment: `src/payment.ts` imports `wrapFetchWithPayment`, `x402Client`, `@x402/evm`, and uses CDP EVM account signing.
- Network: README and UI state Base mainnet.
- External content: `src/worker.ts` parses Tavily URL-bearing results into `Finding[]`.

## Exact insertion point

`src/worker.ts`, inside `runWorker`: after `const result = await paidCall(...)` returns and before `parseTavilyResults(result.data)` findings are appended for synthesis.

## Economics

Do not check every source by default. Recommended: advisory `RIGHTS_AWARE` mode checking only top selected sources entering synthesis, capped by count and spend.

Scenario: 3 workers × 2 queries × top 2 findings = 12 AcqPath calls = $0.24. This can exceed underlying search cost, so the prepared patch defaults to opt-in and budget-controlled.

## Patch status

Patch: `integrations/wave1/agentic-research-marketplace.patch`

- PATCH_APPLIES: prepared against current paths.
- Syntax/transpile: PASS for modified files.
- Full typecheck: blocked by upstream unrelated `src/runIntent.ts` event type error.
- Status: PATCH_PREPARED, not PATCH_TESTED.

## Outreach

Contact copy is maintained privately by the AcqPath operator.

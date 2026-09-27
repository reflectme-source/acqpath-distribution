# Wave 1 verification

Verification time: 2026-09-27. Scope: public upstream source only; no external messages, PRs, payments, wallets, production changes, Cloudflare changes, or AcqPath core changes.

| Target | Current activity | Payment library | Network | Buyer capability | External content flow | Exact insertion point | Build/test commands | Contribution route | Status |
|---|---|---|---|---|---|---|---|---|---|
| Agentic Research Marketplace | Last commit `961a91b` 2026-06-02; deployed app in README | `@x402/fetch` + `@x402/evm` + CDP SDK | Base mainnet verified in README and UI | VERIFIED: `src/payment.ts` wraps fetch with x402 and CDP EVM signer | `src/runIntent.ts` plans workers; `src/worker.ts` calls search service and parses URL-bearing Tavily results | `src/worker.ts`: after `paidCall()` returns and before `parseTavilyResults()` findings enter synthesis | `npm install`; `npx tsc --noEmit` currently blocked by upstream unrelated `src/runIntent.ts` type error | GitHub issue/discussion/PR | PATCH_PREPARED, syntax checked, not PATCH_TESTED |
| AgentRAG | Last commit `83971ca` 2026-08-22; active release 0.1.8 | `@agentx402-ai/core` with x402 EVM; CLI docs | Base mainnet default `AGENTRAG_NETWORK=eip155:8453`; Sepolia optional | VERIFIED: wallet-mode x402 pays per ask/ingest/extend; local wallet auto-provision | `agentrag ask --sources` and `agentrag ingest --sources` ingest external URLs / crawl roots | Client/CLI source validation before `client.ingest()` or `client.ask()` with sources | Workspace build/typecheck/test available, but patch not applied because proposal is pre-ingest policy wrapper | GitHub issue/discussion first | OUTREACH_READY, concept/example only |
| Sentinel | Last commit `f103066` 2026-03-31; package active | `@x402/fetch` peer; `SentinelX402Tool` examples | x402-compatible; exact Base route not pinned in example | VERIFIED as agent payment audit/tooling, not a specific AcqPath buyer app | Example research agent uses `sentinel_x402_fetch` for paid data; enterprise fleet examples fetch research/search APIs | Example/tool layer, especially `examples/x402-langchain-agent/index.ts`, before `sentinel_x402_fetch` for URL-bearing research calls | Package scripts exist; no core patch prepared because AcqPath should be optional example/tool | GitHub issue/discussion | OUTREACH_READY, example integration only |
| AgentProcure | Last commit `5b09e69` 2026-02-12; hackathon/demo repo | `@x402/fetch` 0.3 + `ExactEvmScheme` | Base Sepolia hard-coded `eip155:84532` | VERIFIED buyer capability, but Sepolia only | Discover services -> rank/budget -> `agent/executor.ts` pays endpoints -> synthesize paid source data | `agent/executor.ts` before `paymentFetch(url)` or after response before synthesis | `npm run build` available; no AcqPath patch prepared because network mismatch blocks AcqPath stock route | GitHub issue only if asking about Base mainnet roadmap | HOLD |

## Template hardening

Removed previous PowerShell hashtable rendering artifacts and stale generated target briefs. Wave 1 target files now separate verified facts from assumptions.

## Patch verification

Agentic Research Marketplace patch:

- PATCH_APPLIES: prepared against current upstream file paths, not applied to upstream.
- Syntax/transpile check: PASS for `src/acqpath.ts`, `src/worker.ts`, `src/types.ts` in temp checkout.
- Build/typecheck: BLOCKED by upstream unrelated error `src/runIntent.ts(61,7): serviceCategory does not exist in event type` before patch acceptance can be called tested.
- npm install in temp checkout completed; npm reported existing target dependency vulnerabilities. Not modified.

Therefore status is PATCH_PREPARED, not PATCH_TESTED.


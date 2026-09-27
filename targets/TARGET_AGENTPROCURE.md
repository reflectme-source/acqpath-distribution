# Target: AgentProcure

STATUS: HOLD
RECOMMENDATION: HOLD

## Verified evidence

- Repo: https://github.com/naividh/agent-procure
- Current HEAD inspected: `5b09e69677cf7166a54a6157715f05ba46913bf2`
- Payment: `agent/executor.ts` imports `wrapFetchWithPaymentFromConfig` and `ExactEvmScheme`.
- Network: `agent/executor.ts` hard-codes `network: "eip155:84532"`; README and UI describe Base Sepolia.
- External content: discovers services, ranks endpoints, pays APIs, synthesizes results.

## Exact insertion point

If network-compatible in the future: `agent/executor.ts`, before `paymentFetch(url)` for each planned call, or after response before synthesis for URL-bearing results.

## Economics

Blocked before economics: AcqPath stock route is Base mainnet. Wave 1 must not add Sepolia to AcqPath or request AcqPath payment architecture changes.

## Patch status

No AcqPath patch prepared. Target-side Base mainnet support would be needed first.

## Outreach

Do not include in Wave 1 publication unless asking only whether Base mainnet support is on their roadmap.

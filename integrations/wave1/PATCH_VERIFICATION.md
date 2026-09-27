# Wave 1 patch verification results

## Agentic Research Marketplace

Patch: `integrations/wave1/agentic-research-marketplace.patch`

- Temporary checkout: `.local/wave1-work/agentic-research-marketplace`
- `npm install`: completed for patch verification only. Existing target repo audit reported 8 vulnerabilities; not modified.
- Modified-file syntax/transpile check: PASS for `src/acqpath.ts`, `src/worker.ts`, `src/types.ts`.
- Full `npx tsc --noEmit`: FAIL due to upstream unrelated error `src/runIntent.ts(61,7): Object literal may only specify known properties, and 'serviceCategory' does not exist...`.
- Status: PATCH_PREPARED, not PATCH_TESTED.

## AgentRAG

No patch applied. Source verification complete. Status: OUTREACH_READY concept/example.

## Sentinel

No patch applied. Source verification complete. Status: OUTREACH_READY example/tool proposal.

## AgentProcure

No patch applied due Base Sepolia mismatch. Status: HOLD.

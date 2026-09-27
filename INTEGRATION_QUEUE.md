# Integration queue

No external repository was modified. Artifacts below are local preparation only.

| Target | Artifact | Status | Owner approval needed before |
|---|---|---|---|
| Agentic Research Marketplace | `integrations/agentic-research-marketplace-acqpath.md` | READY | Opening GitHub issue/PR/discussion |
| AgentProcure | `integrations/agentprocure-acqpath.md` | READY | Opening GitHub issue/PR/discussion |
| AgentRAG | `integrations/agentrag-acqpath.md` | READY | Opening GitHub issue/discussion |
| Sentinel | `integrations/sentinel-acqpath.md` | READY | Opening GitHub issue/PR/discussion |
| x402 Agentic Research | `integrations/x402-agentic-research-acqpath.md` | READY | Opening GitHub issue/PR/discussion |
| Polymarket Agent | `integrations/polymarket-agent-acqpath.md` | READY, BLOCKED BY CHAIN MISMATCH | Asking maintainer about Base support |
| Stellar MCP | `integrations/stellar-mcp-acqpath.md` | READY, BLOCKED BY CHAIN MISMATCH | Asking maintainer about Base support |
| Walras MCP Bazaar | `integrations/walras-acqpath.md` | READY, SECONDARY | Asking maintainer about Base/CDP resource support |
| 402 Indexer | `integrations/402-indexer-acqpath.md` | READY, SECONDARY | Asking whether project will add buyer wallet |
| x402 Indexer | `integrations/x402-indexer-acqpath.md` | READY, SECONDARY | Asking whether project will add buyer wallet |

## Common stock AcqPath call

```ts
async function acqpathRightsPreflight(resource: string, paidFetch: typeof fetch) {
  const res = await paidFetch('https://api.getacqpath.com/v1/rights/preflight/x402', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      resource,
      purpose: 'ai-input',
      tier: 'fresh',
      max_total_micro: '20000'
    })
  });
  if (!res.ok) throw new Error(`AcqPath preflight failed: ${res.status}`);
  return res.json();
}
```

Use only with the target's existing stock x402 paid fetch/wallet. Do not use owner wallet. UNKNOWN remains UNKNOWN; the report is signed observed evidence, not legal clearance.

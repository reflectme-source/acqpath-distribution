# Polymarket Agent AcqPath integration sketch

Repository: https://github.com/elizabaoxyz/polymarket-agent

Insertion point: autonomy-rag.ts in fetchEnrichmentContext/indexNewsArticles path before news/search URLs are indexed into ChromaDB

`	s
// Use the target project's existing paid x402 fetch/wallet where compatible.
export async function acqpathPreflightBeforeIngest(resourceUrl: string, paidFetch: typeof fetch) {
  const response = await paidFetch('https://api.getacqpath.com/v1/rights/preflight/x402', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      resource: resourceUrl,
      purpose: 'ai-input',
      tier: 'fresh',
      max_total_micro: '20000'
    })
  });
  if (!response.ok) throw new Error(AcqPath Rights Preflight failed: );
  const report = await response.json();
  // Do not convert UNKNOWN into permission. Store/report as evidence only.
  return report;
}
`

Maintainer-facing behavior: run this immediately before the external URL enters the workflow. If the report is UNKNOWN, the project can still decide its policy, but the integration must not present UNKNOWN as permission.

Status: local prep only; no external repo modified.

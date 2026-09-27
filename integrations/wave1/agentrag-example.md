# AgentRAG AcqPath pre-ingest example

Status: concept/example only; no upstream patch applied.

```ts
async function acqpathPreflightSource(resource: string, paidFetch: typeof fetch) {
  const res = await paidFetch('https://api.getacqpath.com/v1/rights/preflight/x402', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ resource, purpose: 'ai-input', tier: 'fresh', max_total_micro: '20000' })
  });
  if (!res.ok) return { checked: true, error: `AcqPath ${res.status}` };
  return { checked: true, report: await res.json() };
}
```

Suggested maintainer decision: where to store this evidence — CLI result, collection metadata, or server-side ingest job record.

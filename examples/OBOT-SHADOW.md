# Obot MCP webhook — AcqPath evidence in Observe mode

This is a **repository-local, offline-only, non-billing proof of concept** for the exact
[Obot HTTP webhook filter contract](https://github.com/obot-platform/obot/blob/main/docs/docs/functionality/filters.md).
It is not an Obot plugin accepted by its maintainers and is not a deployed/live integration.

## Customer scenario

A company uses Obot to expose a selected web-ingestion MCP tool to an AI research/RAG pipeline.
The tool call includes the *actual public HTTPS resource* and an *explicit declared purpose*:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "fetch_url",
    "arguments": {
      "url": "https://medium.com/example",
      "purpose": "ai-index"
    }
  }
}
```

The Obot gateway calls a configured HTTP webhook filter selected for that tool:
1. The webhook verifies the **raw-body** `X-Obot-Signature-256` HMAC-SHA256 with a shared secret.
2. Non-target traffic and unsupported URLs are skipped without a rights provider call.
3. A targeted request constructs the existing `rights-evidence.request.v1` via AcqPath Evidence Bridge.
4. The webhook answers **HTTP 200**, so Obot runs the original tool call as before.
5. Independently, a resolver writes an `acqpath.shadow-event.v1` (including the MCP JSON-RPC request ID for correlation) to an NDJSON sidecar. The event uses `rights-evidence.resolution.v1` semantics: `resolved`, `unsupported`, `unavailable`, `invalid`, with semantic `unknown` separate from provider failures.
6. The existing `shadow-report.mjs` and `proof-sprint.mjs` scripts summarize evidence and drift. No Obot or AcqPath policy decision is made by this sidecar.

**Important Obot contract:** HTTP webhooks return **200 to accept**, non-200 to reject.
Unlike an MCP filter-server mutation response, a webhook **cannot add metadata to the
original MCP result simply by returning JSON**. Evidence remains in the separately
correlated audit stream. In Observe mode only the customer/operator can later act on it.

## Run the self-contained synthetic PoC

Using Node.js 24+ in this distribution repository:

```powershell
$env:OBOT_WEBHOOK_SECRET = "replace-with-a-strong-independent-random-shared-secret"
$env:OBOT_TOOL_NAMES = "fetch_url"
$env:OBOT_REVIEWED_ORIGINS = "https://medium.com"
$env:OBOT_AUDIT_FILE = "obot-shadow-events.ndjson"
node examples/obot-shadow-webhook.mjs
```

It listens on **127.0.0.1:8789**, not on a public interface, and **never calls
a live external evidence provider or performs an x402 payment**. The built-in
synthetic resolver returns `unsupported / SYNTHETIC_POC_NO_PAID_PROVIDER`.
The request/response contract and error paths can be exercised offline with:

```bash
node --test tests/obot-shadow-webhook.test.mjs
node scripts/verify.mjs
node examples/shadow-report.mjs obot-shadow-events.ndjson
```

The HTTP receiver requires `Content-Type: application/json` and a signed POST
to `/webhook`, with raw request-body HMAC-SHA256 in header
`X-Obot-Signature-256: sha256=<64 hex characters>`.
No default secret, no unsigned requests. Matching tool names and allowed origin
are **explicit**. Do not enable the webhook for every tool.

## Transition to an actual customer-funded paid flow

The callable adapter must be provided by the customer or an approved integration,
using the existing Evidence Bridge `createAcqPathProvider` and
`normalizeAcqPathPurchaseResult` with independently configured signed-key
verification. Its `resolvePurchase` callback must execute the documented
HTTP/x402 buyer flow (payment authorization, idempotency, recovery) **outside**
Obot policy logic and return the verified purchase result to the bridge.

The AcqPath remote MCP server prepares quotes but **does not deliver paid reports
directly as an MCP tool**. Do not send wallet secrets or payment authorizations
into MCP tool arguments, Obot webhook payloads, audit logs or AI context.

Before any live run, the operator must:
- verify the resource and purpose are in **live reviewed coverage**;
- confirm user-approved customer-funded payment and strict per-buyer spending caps;
- deploy the adapter behind authenticated TLS and an independent trust root;
- implement durable, bounded audit delivery and replay-safe paid operation IDs;
- agree on privacy/retention, retry and freshness policy;
- cap the Proof Sprint: 3 eligible events for plumbing, 25 or 6 hours for
  evaluation, hard stop no later than 50 events or 24 hours;
- validate Obot failure settings, since an invalid webhook signature returns 401
  and Obot **will reject** the tool call. "Observe" promises no rights-policy
  blocking, not immunity from an incorrectly configured webhook.

Current public contracts:
- https://developers.getacqpath.com/partners/evidence-contract
- https://developers.getacqpath.com/partners/proof-sprint
- https://developers.getacqpath.com/partners/gateway

**This proof shows Obot webhook shape, authentication, routing and non-blocking
sidecar observation. It does not assert an Obot deployment, paid usage, vendor
approval, live signed evidence or a completed partner Proof Sprint.**

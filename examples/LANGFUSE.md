# AcqPath x Langfuse: source-rights evidence observations (v1)

A source-only, provider-neutral integration between the existing AcqPath Evidence
Bridge and Langfuse JS/TS SDK v6. It enriches one Langfuse observation with
bounded, structured evidence metadata, without changing Langfuse itself or the
customer's retrieval/crawling implementation.

**Status: local adapter + unit tests. Not an official Langfuse integration,
not a paid end-to-end certification and not published to Langfuse's catalog.**

## Why this is valuable

Normal LLM tracing records the request, source URL, response and timestamps.
It does not itself create an independent signed point-in-time observation of
the source's machine-readable AI/TDM rights declaration. If a declaration
later changes, the old observed state cannot be reconstructed from the current
page or a stored URL alone.

AcqPath produces this missing evidence, and Langfuse stores the safe, small
reference on an observation. The consumer still decides what to ingest or use.

    existing web fetch / retrieval span
      -> customer explicitly chooses purpose (ai-index / ai-input / ai-train / search)
      -> AcqPath Evidence Bridge resolves and verifies a source observation
      -> AcqPath Langfuse adapter writes evidence metadata and optional scores
      -> existing policy engine, indexer and retrieval proceed on their own terms

No Langfuse code changes, new hosted service, proxy, browser extension, or
server-side Langfuse policy plugin is required.

## Files

- langfuse-evidence.mjs: adapter; imports only the existing Evidence Bridge
- langfuse-shadow-demo.mjs: optional real Langfuse telemetry example; no AcqPath purchase
- langfuse-sdk-smoke.mjs: offline real SDK v6 + in-memory OpenTelemetry compatibility test
- tests/langfuse-evidence.test.mjs: synthetic local contract/failure-safety tests

## Langfuse compatibility

Adapter unit tests use synthetic normalized fixtures. An additional SDK v6.0.0
in-memory OpenTelemetry smoke passed with two linked Langfuse spans and no
network/exporter or payments. A real Langfuse Cloud ingestion and score export
still requires a connected Langfuse account.
Current Langfuse JS/TS SDK v6 requires self-hosted Langfuse >= v4.59.0.
Older Langfuse self-hosting installations need a separately tested older SDK
adapter and are not declared supported by this example.

Install dependencies in a SEPARATE consuming Node 22+ application:

    npm install @langfuse/tracing@6 @langfuse/client@6 @langfuse/otel@6 @opentelemetry/sdk-node

For an entirely offline SDK compatibility smoke in a disposable checkout,
add @opentelemetry/api, @opentelemetry/sdk-trace-base and
@opentelemetry/context-async-hooks, then run:

    node examples/langfuse-sdk-smoke.mjs

This uses an in-memory tracer and sends no Langfuse or AcqPath API calls.

Configure LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY and optional LANGFUSE_BASE_URL
using that application's private environment settings, never in source control.

Langfuse's recommended instrumentation pattern:

    import {NodeSDK} from '@opentelemetry/sdk-node';
    import {LangfuseSpanProcessor} from '@langfuse/otel';
    const otel=new NodeSDK({spanProcessors:[new LangfuseSpanProcessor()]});
    otel.start(); // initialize once at app startup, before traced operations

## Shadow demo

Only after Langfuse credentials and the packages above are configured:

    node examples/langfuse-shadow-demo.mjs

The output intentionally says:

    {"mode":"shadow_no_purchase","status":"unavailable",
     "reason":"PAID_BUYER_DISABLED_SHADOW_ONLY"}

This does **not** mean any live AcqPath observation was retrieved. It means the
Langfuse trace shape, parent/child relationship and plumbing can be inspected
without a wallet, a report purchase or an AcqPath API call.

To use it inside an already-instrumented application:

    import {startActiveObservation} from '@langfuse/tracing';
    import {createLangfuseEvidenceAdapter} from './examples/langfuse-evidence.mjs';

    const evidence=createLangfuseEvidenceAdapter({
      startActiveObservation,
      paidBuyerApproved:false, // default: no paid resolver may be called
      maxEvents:25
    });

    await startActiveObservation('public-web-rag-ingestion',async span=>{
      // Your existing web retrieval remains unchanged.
      const result=await existingFetch();
      await evidence.record({resource:result.source_url,purpose:'ai-index'});
      return result;
    });

This example is illustrative. The caller must supply existingFetch and configure
its own Langfuse instrumentation; no such function is bundled.

A Langfuse observation will have controlled metadata fields:
acqpathSchema, acqpathMode, acqpathStatus, acqpathPurpose,
acqpathStatement, acqpathEvidenceVerified, acqpathEvidenceCount,
acqpathEvidenceRef, acqpathObservedAt, acqpathExpiresAt,
acqpathFreshness and acqpathFailureCode.

The adapter never sends the raw URL, body, report, signing material, wallet
authorization or buyer checkpoint as Langfuse observation input/output or
metadata. An evidence digest may still permit correlation across records, so
customers must consider their observability privacy policy.

## Production evidence route (separately authorized)

Do NOT turn on paidBuyerApproved merely to test telemetry.

1. Integrate an operator- or customer-owned secure SIWX/x402 buyer using the
   existing official AcqPath TypeScript examples. It must pin URL/purpose,
   payTo, amount, chain, signer and budgets, and persist private checkpoints.
2. Pass the purchase callback into the existing
   createAcqPathProvider({resolvePurchase}) from the Evidence Bridge.
   The provider performs Ed25519 signature and request-binding verification.
3. Pass createEvidenceResolver({provider}) to the adapter as resolver.
4. Only once the actual buyer has explicitly approved spend, set
   paidBuyerApproved:true with strict maxEvents and maxInFlight limits.
5. Store full signed reports in the customer's secured evidence store, not
   in Langfuse. This adapter logs only verified digest/reference metadata.
6. On ambiguous settlement, resume the SAME checkpoint and authorization.
   Never retry blindly with a new payment or invoke two resolvers for one event.

When real verified evidence is available, Langfuse gets these optional
observation-level Boolean scores:

- acqpath_evidence_verified: 1 only for a resolved, structurally verified,
  upstream signature-verified result. A semantic 'unknown' declaration can
  still be valid evidence; this is NOT a permission or compliance score.
- acqpath_evidence_fresh: 1 if explicit evidence expiry is in the future,
  0 if expired; omitted when expiry is unknown.

Any resolver exception becomes UNAVAILABLE. A malformed, unverified, unbound or
missing-digest result becomes INVALID. Neither state becomes ALLOW.
Langfuse tracing or scoring failures do not change the evidence outcome.
A downstream policy engine decides allow/deny/review independently.

## Scope, safety and operating limits

- Secure Preflight/Gateway supports safety-eligible public HTTPS URLs, beyond
  the four separately reviewed origins. Not all URLs are guaranteed eligible.
- Stock x402 remains limited to the reviewed-origins path.
- Adapter accepts only public HTTPS URL syntax and rejects query strings,
  fragments, credential-bearing, private or IP-literal URLs, unsafe ports.
  Backend still must enforce DNS/TLS/redirect/SSRF protections.
- No automatic source fetching, crawler bypass, license acquisition, legal
  clearance, or inference of the intended use.
- Limits of 25 events and 8 concurrent observations by default apply only to
  THIS process instance. They do not prove global usage controls, throughput,
  durability, SLAs or production capacity.
- This example awaits the optional evidence step after the existing retrieval.
  It does not alter the retrieval result but may add latency. A production
  fire-and-forget pattern needs an independently audited durable queue.
- No raw source content, private traces, signing keys or payment material should
  be included in GitHub Issues, Discussions or public examples.
- No walletless billing, subscriptions, hosted Langfuse auto-attachment or
  "free 25 verified reports" is implied by this example.

## Acceptance

Local contract tests:

    node --test tests/langfuse-evidence.test.mjs

Repository-wide distribution verification:

    node scripts/verify.mjs

A partner-facing Langfuse acceptance run still needs:
- real Langfuse v6 SDK installed in a separate environment;
- actual trace sent and visible in Langfuse Cloud or self-hosted v4.59+;
- safe metadata linked to the intended retrieval span;
- real paid report only after explicit independent-buyer consent;
- receipt signature, report binding and recovery independently verified.

Docs: https://langfuse.com/docs/observability/features/metadata
      https://langfuse.com/docs/evaluation/evaluation-methods/scores-via-sdk
      https://developers.getacqpath.com/partners/evidence-contract
      https://developers.getacqpath.com/partners/proof-sprint

# AcqPath Partner Observe Adapter

A provider-neutral source-rights evidence sidecar for web-fetch, crawler, MCP and RAG workflows. It does not replace the original tool result, enforce a policy, grant content-use rights or bypass x402.

## Current live scope

- Secure Preflight and Gateway: eligible public HTTPS URLs through the signed safety-gated relay.
- The four reviewed origins listed by the API are independently reviewed, not the whole dynamic eligibility set.
- Stock x402 remains fresh-only and reviewed-origins-only.
- UNKNOWN is not permission; no observed RSL declaration does not prove a license.
- Customer-owned Base USDC x402 authorizations are required for actual paid reports. Subscription, invoice, API-key and walletless billing are NOT live.

GET https://api.getacqpath.com/v1/capabilities for the current coverage_mode and dynamic_public_https status.

## Purpose for tools without user intent

A web tool often knows its URL but not the ultimate intended use. The owning partner may explicitly configure a fixed Observe-mode default, for example ai-input. The adapter records purpose_source: configured_default. An explicit caller purpose takes precedence; an explicitly invalid purpose is never silently replaced. This is a configuration assumption, not an inference about the person using the tool.

Supported purposes: ai-input, ai-index, ai-train, search. No paid general crawl authorization.

## Source-only demonstration, without payment

The adapter is local/in-process. It starts no HTTP listener and does not directly call the paid AcqPath API.

    import {createPartnerObserve} from './partner-observe.mjs';

    const auditEvents = [];
    const observer = createPartnerObserve({
      toolNames: ['web_fetch'],
      configuredDefaultPurpose: 'ai-input', // customer-approved default
      paidBuyerApproved: false,             // NO PAYMENT by default
      resolver: {async resolve() {throw Error('Buyer disabled');}},
      audit: {async write(event) {auditEvents.push(event);}},
      maxEvents: 25,
      maxPending: 16
    });

    const existingResult = await observer.call({
      name: 'web_fetch',
      arguments: {url: 'https://example.com/article'},
      execute: async args => ({url:args.url,content:'unchanged original tool result'})
    });

    await observer.whenIdle(); // controlled tests; production needs durable queue
    console.log(existingResult, auditEvents[0]?.purpose_source);

The event has schema acqpath.partner-observe.v1 and a provider-neutral rights-evidence.resolution.v1 record. No-payment mode yields unavailable with code PAID_BUYER_DISABLED_SHADOW_ONLY, never a paid report.

Run tests: node --test tests/partner-observe.test.mjs

## Real, paid and verified evidence

Customer-authorized paid mode requires injecting a separately reviewed resolver configured with the AcqPath Evidence Bridge and an x402 buyer. That buyer must independently pin signing key, asset, recipient, report purpose and exact budget; persist private operation/payment state; verify the signed offer and delivery; and enforce explicit consent and spending limits. Only the customer can set paidBuyerApproved: true. The Observe adapter does not authorize payment or implement a payment gateway.

Read /public-http and /examples/OFFICIAL-CLIENTS.md for the secure SIWX buyer. Retry the same private authorization/checkpoint after an ambiguous settlement; do not sign a replacement automatically.

## Safety and operational boundaries

- Only explicitly allowlisted tool names are observed.
- Local URL checks reject non-HTTPS, credentials, URL queries/fragments, IP literals and private-reserved hostnames. The backend separately enforces DNS/IP/TLS, robots and SSRF controls.
- Observe mode never modifies or blocks existing execution. Evidence does not decide allow/deny.
- In-process default caps: 50 events and 16 pending jobs. These are NOT durable or global account quotas.
- Customer-provided audit storage must protect source URLs and private information.
- Use a supported background primitive or durable queue; unawaited work can be lost if the process exits. whenIdle() suits tests/CLI.
- UNKNOWN, unavailable, unsupported and invalid are distinct; none imply permission.
- Current relay budgets are not 100,000+ monthly throughput certification.

## Privacy and processing

https://getacqpath.com/data-handling.html

Current default report retention: 30 days. Financial journals have a separate lifecycle. Public HTTPS probes reach source servers. Cloudflare and Railway process data; the Railway relay is currently deployed in sfo (United States). AcqPath has NOT made an EU-only or signed DPA commitment.

For webhook/MCP wiring see /partners/gateway, /partners/shadow-mode, and the separate synthetic Obot PoC example in the source repository.

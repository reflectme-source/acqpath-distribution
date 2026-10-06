# AcqPath Evidence Bridge

Provider-neutral boundary between verified source-rights evidence and a consumer-owned policy engine.

```text
AcqPath or another evidence provider
        -> verify + normalize
        -> rights-evidence.resolution.v1
        -> webhook | policy input | extension
        -> consumer-owned allow / deny / warn / review
```

The bridge does not grant a licence, establish ownership, provide legal clearance or make a legal/policy decision.

## Canonical boundary

Evidence statements:

- `declared_permitted`
- `declared_prohibited`
- `license_required`
- `unknown`

Resolution/transport states:

- `resolved`
- `unavailable`
- `unsupported`
- `invalid`

Semantic `unknown` and provider/network `unavailable` are intentionally different.

The bridge never infers intended purpose from a tool name. The caller supplies it explicitly.

## AcqPath provider

`createAcqPathProvider` accepts a buyer-owned `resolvePurchase` callback. That callback should use the existing reviewed `RightsClient` / `buyOnce` flow or an equivalent verified buyer flow. The bridge independently re-verifies the signed Ed25519 application evidence, its signed payload and the resource/purpose binding before normalizing it.

It intentionally does not map `declared_permitted` to a licence, legal clearance, or DSM Article 4 eligibility.

## Webhook profile

Partner-specific work should normally be field mapping only:

```js
const webhook=createWebhookProfile({
  resolver,
  mapping:{
    resourcePath:'arguments.url',
    purposePath:'context.intended_purpose',
    contextPath:'context'
  },
  decide:({resolution})=>({
    decision:resolution.status==='resolved'?'review':'deny'
  })
});
```

The `decide` callback belongs to the consumer/operator. No default authorization policy is shipped.

## Policy-input profile

```js
const input=toPolicyInput(resolution,{evaluatedAt:'2026-10-06T08:00:00Z'});
```

This produces an attested declaration shape with an explicit reproducible clock. A GOPAL-specific serializer should remain a thin layer on top of it after GOPAL's Article 4 contract is reviewed.

## Extension profile

```js
const provider=asEvidenceProvider(resolver);
const result=await provider.resolve(request);
```

ClawMetry, Atmosphere and similar runtimes can depend only on this generic `resolve(request)` boundary and keep verdict logic local.

## Not included

- no backend or production changes;
- no HTTP proxy/service;
- no autonomous payment policy;
- no partner-specific SDK;
- no automatic legal interpretation;
- no inference that no observed reservation means no reservation exists.

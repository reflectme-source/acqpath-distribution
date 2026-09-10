# AcqPath Distribution & Revenue — 1.0.0

A separate distribution workspace for the existing AcqPath **native declared-rights reports** service.
Live documentation: [developers.getacqpath.com](https://developers.getacqpath.com), deployed to a separate Cloudflare Pages project. The [MCP Registry entry](https://registry.modelcontextprotocol.io/v0.1/servers/com.getacqpath%2Facqpath/versions/3.1.0-rc.1) is active and verified. See [deployment setup](docs/CLOUDFLARE-DEPLOYMENT.md) and [acceptance evidence](docs/ACCEPTANCE.md).
Prepared 2026-09-09. This repository is **not the AcqPath backend**, a payment facilitator, a trading agent or a claim that the service already has buyers.

**Owner: start with `START-TUTAJ.md` and give `CODEX-START.txt` to Codex.**

## What is included

Verified-source-derived client SDK with signed-offer/report/receipt validation; durable encrypted buyer checkpoints; one opt-in local buyer-wallet flow; three buyer workflow examples; public API/MCP conformance observations; bounded Bazaar and MCP Registry queries; public integration documentation; MCP DNS-namespace publication; guarded npm publication tooling; optional Smithery publication; separate GitHub CI and Cloudflare Pages deployment; aggregate business reporting.

## Safe preparation

Node 22.16+ (current supported patched Node 24 recommended). No root runtime dependencies. No `npm install` is needed for local verification/build.

```text
node scripts/cli.mjs prepare
```

On Windows, `START.cmd` runs the same preparation. It makes public read-only requests and MCP initialization/tool-listing only. It does not create a quote, execute a payment, mutate Cloudflare, push Git or publish a package.

## Explicit limitations

The reviewed server's native paid flow has no Bazaar extension. Docs and catalog manifests cannot repair this while keeping the core unchanged. An indexing payment must not be created under that assumption. The current MCP endpoint prepares quotes; payment/redemption stays on HTTP x402. Claims and signatures must never enter public tool descriptions, URLs or model prompts.

The last owner deployment reported degraded reconciliation and 500 native quotes / 2,000 metadata fetches per day. A high incoming-value cap does not imply high throughput. This workspace does not change those limits or falsely mark recovery as working.

## Publication states

GitHub, Cloudflare documentation and the MCP Registry entry were published and read back on 2026-09-10. The owner requested that the npm SDK remain unpublished; the build stays private and publication is disabled. GitHub pushes run CI but do not automatically deploy the direct-upload Pages project.

`BUILT_LOCALLY` is not `PUBLISHED`. A matching catalog entry is not verified purchase compatibility or organic revenue. No real purchase was performed. Bazaar remains blocked by the current core contract; optional Smithery and PulseMCP materials are prepared but not submitted.

Read `docs/EXECUTION-PLAN.md`, `docs/SECURITY.md`, `docs/ACCEPTANCE.md` and `release/VERIFICATION.json`.

The private backend remains private. A public GitHub account and publisher namespace can still identify the account operating the public integration package; this package does not promise legal anonymity.

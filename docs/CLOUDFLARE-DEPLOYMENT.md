# Distribution documentation hosting

Target: a new **Cloudflare Pages** project named `acqpath-distribution` in the existing AcqPath account. Preferred URL: `https://developers.getacqpath.com`. The checked-in target is `config/cloudflare-pages.json`; it is deployment metadata, not Worker configuration.

Use direct upload of the reviewed `out/site` build. Source branch: `main`; build command: `node scripts/verify.mjs && node scripts/cli.mjs build`; output: `out/site`. The build exports an explicit public file allowlist and has no runtime dependencies, Functions, Worker bindings or service secrets. GitHub keeps the source, CI and discovery observations. Direct upload does not automatically deploy Git pushes; Codex builds, scans and uploads each documentation release. Cloudflare requires a new Pages project if Git integration is desired later.

Codex creates/configures the Pages project through the official Cloudflare dashboard or Pages API after account authorization. No Wrangler command is needed. The existing GitHub app installations are preserved: the account repository picker did not expose the new personal-account repository. The GitHub Pages workflow from the original package is retained only as an inactive template; it is not the selected deployment target.

Before adding the custom domain, inspect existing records for the exact hostname `developers.getacqpath.com`. Add the domain to this Pages project, then add only its required CNAME if absent. An existing unrelated record must be preserved and reported. Do not change the apex landing, `api.getacqpath.com`, `acqpath-production`, Cloudflare Access or production Worker configuration.

MCP ownership uses a separate additive TXT record at `getacqpath.com`. The Ed25519 publishing key stays in `.private`; it is unrelated to wallets. An existing different MCP proof must not be replaced.

Completion requires an actual successful deployment, public HTTP reads of all six pages and discovery files, correct security headers, a real 404 for an unknown path, and an active custom domain with valid HTTPS. Record the project URL, deployment ID, source commit and public readback in `.local/cloudflare-publication.json` and `docs/ACCEPTANCE.md`. A saved target or queued build does not count as deployed.

Official references: [Pages Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/), [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/), [Pages API](https://developers.cloudflare.com/api/resources/pages/subresources/projects/methods/create/).

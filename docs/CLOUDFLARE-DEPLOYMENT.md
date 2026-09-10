# Distribution documentation hosting

Target: the separate **Cloudflare Pages** project named `acqpath-distribution` in the existing AcqPath account. Published URL: `https://developers.getacqpath.com`. The checked-in target is `config/cloudflare-pages.json`; it is deployment metadata, not Worker configuration.

Use direct upload of the reviewed `out/site` build. Source branch: `main`; build command: `node scripts/verify.mjs && node scripts/cli.mjs build`; output: `out/site`. The build exports an explicit public file allowlist and has no runtime dependencies, Functions, Worker bindings or service secrets. GitHub keeps the source, CI and discovery observations. The reviewed .github/workflows/docs-deploy.yml now handles pushes to main through direct upload. It verifies Windows/Linux, scans full history, builds and scans an explicit static artifact, seals it to the commit, and deploys only that artifact. The project does not require a Cloudflare Git integration.

The project and custom domain are already configured. The automated deployment uses pinned Wrangler 4.131.0 with the owner-authorized Pages Write account token stored as CLOUDFLARE_PAGES_API_TOKEN in GitHub environment distribution-docs. Only main is allowed to use that environment; DOCS_AUTODEPLOY_ENABLED=true activates the reviewed workflow. The token expires September 11, 2027 and must be rotated before that date. The existing GitHub app installations are preserved: the account repository picker did not expose the new personal-account repository. The GitHub Pages workflow from the original package is retained only as an inactive template; it is not the selected deployment target.

Before adding the custom domain, inspect existing records for the exact hostname `developers.getacqpath.com`. Add the domain to this Pages project, then add only its required CNAME if absent. An existing unrelated record must be preserved and reported. Do not change the apex landing, `api.getacqpath.com`, `acqpath-production`, Cloudflare Access or production Worker configuration.

MCP ownership uses a separate additive TXT record at `getacqpath.com`. The Ed25519 publishing key stays in `.private`; it is unrelated to wallets. An existing different MCP proof must not be replaced.

Completion requires an actual successful deployment, public HTTP reads of all 20 pages and the reviewed discovery files, correct security headers, a real 404 for an unknown path, and an active custom domain with valid HTTPS. Record the project URL, deployment ID, source commit and public readback in `.local/cloudflare-publication.json` and `docs/ACCEPTANCE.md`. A saved target or queued build does not count as deployed.

Official references: [Pages Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/), [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/), [Pages API](https://developers.cloudflare.com/api/resources/pages/subresources/projects/methods/create/).

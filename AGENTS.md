# Operating contract for Codex

## Scope

Work exclusively in this `acqpath-distribution` workspace. Never change, reset, check out, clean, commit, push or deploy the original AcqPath backend. Never run `wrangler`, change Worker vars/secrets/Access/routes, change payment recipients, increase limits, enable provider routing, fix readiness flags, or create live settlement traffic as a side effect.

The separate distribution repository may be initialized/published after the user's explicit authorization. Its name must be `acqpath-distribution`. A limited DNS operation may add one MCP TXT ownership proof at getacqpath.com; it may not replace any record or application.

## Workflow

Read START-TUTAJ.md and docs/EXECUTION-PLAN.md. Execute the commands in the terminal, inspect full outputs privately, fix distribution-only issues with regression tests. Do not ask the user to hand-edit JSON or manually run a sequence of terminal commands. Ask only for genuinely missing account identifiers and official authentication/approval. Use interactive terminal sessions for prompts; never capture an invisible secret prompt into a log.

Read-only core comparison: only scripts/source-audit.mjs and its fixed file allowlist; no importing or executing core scripts. Optional aggregate stats read uses two explicit local credentials, requires separate confirmation, is not part of prepare/public CI, and must not print/copy those credentials. Never upload raw core .secrets, config/operator.json, private checkpoints, repo snapshots or logs.

## Evidence and publication

Never fabricate PASS, paid tests, review signatures, customers, organic revenue, uptime, certification, indexing or capacity. `UNAVAILABLE` means unverified network, not absent service. `SUBMITTED` does not mean published. Keep mainnet_tested false unless a real purchase has evidence. Do not mark degraded reconciliation healthy. Do not use own purchases to inflate traction or ranking.

The reviewed native server lacks Bazaar extension metadata. No same-core-change authority exists. Complete compatible independent channels, record the blocker, and ask separately before proposing any core change. Do not create a proxy which charges a second fee or handles seller keys.

MCP quote calls can create reports/costs. Do not blindly invoke tools during scans. Prefer initialize/notifications/tools-list. The legacy acqpath_quote router is disabled; do not advertise it. Paid redeem uses HTTP/x402 and private claims. Keep private claims/checkpoints/signatures out of LLM prompts and public results.

## Tooling

Use installed Node >=22.16 and npm; do not upgrade system Node or alter global PATH automatically. GitHub CLI may be installed from the official source after approval. External Smithery tooling installs in .tools only with a lock and scripts disabled. Official MCP publisher binary must match the release SHA256; do not bypass a missing checksum. Freeze GitHub action tags to exact upstream commit SHA before publishing workflows. No source code is implicitly trusted because it prints PASS.

## Real payment test

Never invoke buyer-demo by default. The optional one-purchase buyer test needs `RUN ONE MAINNET PURCHASE DEMO`, a separate buyer wallet, password for local encrypted checkpoint, `BUY ONE REPORT` in local UI, and explicit wallet signing. Use supported approved input; do not send seller funds or use the seller as payer. Maximum per purchase 50,000 micro-USDC. A failure after signing uses the saved checkpoint only; no new order, signature or auto-refund. This is QA, not evidence of external demand or Bazaar indexing.

## Data publication

Use build's explicit file allowlist. Never copy full core tree. Check git staged diff and package tarball. Follow privacy: no legal name, home address, private email or personal keys in public materials. Public GitHub identity is not anonymity. Registry/domain key is not a wallet key. License of the client remains UNLICENSED/private until explicit owner publication approval.

## Completion

Finish with docs/ACCEPTANCE.md checklist and actual statuses. Provide the user only necessary account actions and a short Polish report: published URL, verified connection, payment result if actually performed, unresolved blocker, next commercial measurement. No promise of sales tomorrow or passive maintenance already running.

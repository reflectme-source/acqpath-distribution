# Sentinel AcqPath example concept

Status: concept/example only; no upstream patch applied.

Add an optional tool/policy example that performs AcqPath Rights Preflight before a research agent admits selected URL-bearing results into context. This belongs beside `examples/x402-langchain-agent`, not as a core dependency.

Policy modes:

- ADVISORY: keep evidence and continue.
- STRICT: maintainer policy can block DENY_DECLARED or UNKNOWN.

UNKNOWN must never be treated as permission.

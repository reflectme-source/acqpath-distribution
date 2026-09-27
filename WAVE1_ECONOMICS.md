# Wave 1 economics

No production usage is invented. These are adoption scenarios for maintainer discussion, not observed usage. AcqPath price remains unchanged: stock fresh Rights Preflight costs 0.02 USDC on Base.

## Cost scenarios

| Target | Current external data cost | Expected AcqPath calls/workflow | AcqPath incremental cost | Cost multiplier / objection | Recommended adoption pattern |
|---|---:|---:|---:|---|---|
| Agentic Research Marketplace | README says paid Tavily path about $0.01/search | Scenario: 3 workers × 2 queries × top 2 cited sources = 12 checks | 12 × $0.02 = $0.24 | Can exceed search cost by ~24× if every source is checked | RIGHTS_AWARE advisory mode; check only top-N sources that enter final synthesis; default cap 2/source worker or $0.10/session |
| AgentRAG | CLI docs: ingest $0.005/page; ask flat $0.008 without ingest | Scenario: 5 source pages before ingest = $0.10 | $0.10 added to $0.025 ingest | 4× for small ingest; less severe for high-value compliance workflows | Optional pre-ingest policy for selected collections; use max source cap and collection-level opt-in |
| Sentinel | No single data cost; budgets/policies manage paid endpoint usage | Scenario: research agent checks 2 URLs before paid fetch = $0.04 | $0.04 under $1 example budget | Low relative to example budget, but not free | Add as optional Sentinel policy/tool example, not core dependency |
| AgentProcure | Mock service prices vary; demo is Base Sepolia | Scenario would be 1 check per paid endpoint | $0.02 per endpoint | Blocked by Sepolia/mainnet mismatch before economics matter | HOLD until target supports Base mainnet exact-EVM buyer path |

## Adoption recommendation

Do not pitch all-source preflight. Pitch selected-source, budget-capped rights-aware mode:

SEARCH / SOURCE DISCOVERY -> candidate sources -> select sources entering context/index -> AcqPath Preflight -> policy decision -> synthesis/ingest.

Default policy should be ADVISORY. STRICT mode can be an opt-in maintainer choice. UNKNOWN remains UNKNOWN and must not be interpreted as permission.

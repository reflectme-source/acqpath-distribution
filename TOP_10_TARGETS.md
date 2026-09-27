# Top 10 AcqPath revenue targets

Selection date: 2026-09-27. Selection rule: expected repeated paid operations × probability of integration ÷ integration friction. Seller-only x402 APIs were deprioritized unless they have a credible path to make repeated AcqPath calls themselves.

| Rank | Target | Score | Frequency | Payment evidence | Content workflow | Integration complexity | Recommended action |
|---:|---|---:|---|---|---|---|---|
| 1 | Agentic Research Marketplace | 94 | HIGH | Base mainnet CDP wallet, `@x402/fetch`, autonomous x402 search payments | Multi-agent research over web/news/local/ecommerce/jobs sources | LOW | Approve issue/PR discussion with prepared patch snippet |
| 2 | AgentProcure | 84 | HIGH | `@x402/fetch` executor with concurrent auto-pay | Discover/rank/budget/pay/synthesize research pipeline | LOW | Propose AcqPath preflight as a new fixed service before paid source calls |
| 3 | AgentRAG | 82 | HIGH | Client docs state x402 payments and spend caps for ask/ingest | RAG source ingestion and retrieval collections | MEDIUM | Open technical discussion; verify Base network before PR |
| 4 | Sentinel | 81 | HIGH | `wrapFetchWithPayment` and Sentinel x402 tools for agents/fleets | LangChain/fleet research examples fetching paid APIs | MEDIUM | Propose AcqPath as compliance preflight example/tool |
| 5 | x402 Agentic Research | 77 | MEDIUM | Buyer agent purchase flow; x402 provider gateway | LangGraph/Tavily research engine and RAGAS evals | MEDIUM | Propose source-rights preflight after Tavily/source collection |
| 6 | Polymarket Agent | 77 | HIGH | x402 Solana plugin with spend caps | NewsAPI/Tavily context and ChromaDB RAG indexing | MEDIUM | Discuss Base route support or adapter before code PR |
| 7 | Stellar MCP | 76 | HIGH | `@x402/fetch + @x402/stellar` automatic 402 payment | MCP scrape/extract/bounded crawl for research agents | MEDIUM | Discuss cross-chain/Base support; not immediately executable |
| 8 | Walras MCP Bazaar | 73 | MEDIUM | MCP `paid_call` with stock `@x402/fetch` path on Stellar | Catalog search + pay selected resources | LOW | Good if AcqPath becomes visible/payable in their catalog path |
| 9 | 402 Indexer | 70 | VERY_HIGH | No buyer payment proven; crawler discovers x402 APIs | Crawler/GitHub scanner indexing paid APIs | MEDIUM | Secondary: rights preflight before indexing URLs if they add buyer wallet |
| 10 | x402 Indexer | 65 | VERY_HIGH | No buyer payment proven; Bazaar indexer, not payer | Crawls/enriches Bazaar resources | MEDIUM | Secondary: metadata rights-check concept; not a payer today |

## #1 target

**Agentic Research Marketplace** is the highest-value target because it already has Base mainnet autonomous payment, a repeated multi-agent research loop, and external URL/search results entering the workflow for every user query. AcqPath fits before each worker converts search/source results into findings. If accepted, every research session could create multiple 0.02 USDC Rights Preflight calls before synthesis.

## Main risks

- Several strong workflows run on Base Sepolia, Solana, or Stellar rather than Base mainnet; these require target-side wallet/network support, not AcqPath product work.
- Some high-volume crawlers/indexers do not prove buyer payment capability; they are valuable channels only if they add a payer wallet or call AcqPath through an existing paid-call router.
- No outreach or external PR should be sent without owner approval.

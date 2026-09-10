# Revenue optimization — unchanged prices, unproven demand

Decision as of 2026-09-10: keep fresh **0.02 USDC (20,000 micro)** and deep **0.05 USDC (50,000 micro)**. The [live capabilities](https://api.getacqpath.com/v1/capabilities) and verified signed quote are authoritative. No price, payment mode, recipient, routing or limit was changed. The baseline records **0 paid reports and 0 USDC received**; independent demand, profit and channel conversion remain unverified.

## What a repeated machine integration could produce

These are arithmetic scenarios, not forecasts. A “report” here means a successful paid report, not a quote, page view or raw fetched URL. USDC amounts are not a guarantee of equivalent fiat proceeds.

| Paid reports | All fresh gross USDC | All deep gross USDC | 80% fresh / 20% deep gross USDC |
|---:|---:|---:|---:|
| 100 | 2 | 5 | 2.60 |
| 1,000 | 20 | 50 | 26 |
| 10,000 | 200 | 500 | 260 |
| 50,000 | 1,000 | 2,500 | 1,300 |

At unchanged prices, 1,000 USDC gross requires 50,000 fresh reports, 20,000 deep reports, or about 38,462 reports at a sustained 80/20 mix. A payer buying 100 reports/month produces 2 / 5 / 2.60 USDC gross respectively. At that mix, 100 such payers produce only 260 USDC/month. Those payer and usage counts do not exist in current evidence.

Price applies per prepared report for a specific URL/purpose/tier. Reusing verified evidence within a buyer's policy and validity constraints may be correct; it must not be inflated into repeated charges. A different downstream purpose can require different evidence. Do not manufacture report demand by refreshing evidence without a real need.

Current coverage is four exact origins. The prior operator reference quoted 500 native quotes and 2,000 metadata fetches per day; these are limits, not demonstrated capacity, and have not been reauthorized or changed. At even 100% conversion of 500 daily quotes for 30 days, 15,000 reports would yield 300 USDC all-fresh, 750 all-deep, or 390 at 80/20. This is a ceiling illustration assuming fresh quota, availability, sufficient supported demand and no repeat/failed work; the actual attainable result is unknown. High incoming-value caps do not imply throughput.

## Costs and break-even

Current Coinbase documentation states the first 1,000 successful facilitator settlements each month are free, then $0.001 each; the facilitator pays gas on the common EIP-3009 path. Verification and discovery queries are not billed as settlements. This is a published tariff, not evidence of AcqPath's invoiced cost, allowance availability or facilitator configuration. [CDP FAQ](https://docs.cdp.coinbase.com/x402/support/faq).

For a modeling assumption of 1 USDC = $1 only, let N be monthly settlements, d the deep fraction, v other variable cost/report in USD and F fixed monthly cost in USD. Gross is N × (0.02 + 0.03d) USDC. Modeled contribution after the published facilitator tariff is N × (0.02 + 0.03d − v) − 0.001 × max(0, N − A) − F USD, where A is the actual unused free allowance (between 0 and 1,000). Actual currency conversion, taxes and invoicing must replace these assumptions before accounting use.

After the allowance, marginal contribution before infrastructure is 0.019 USD fresh or 0.049 USD deep under that parity assumption. With F=$20, v=0 and A=0, approximate break-even is 1,053 fresh or 409 deep reports. With A=1,000 it becomes about 1,000 fresh or 400 deep. At an 80/20 mix and A=0, it is 800 reports. These are deliberately optimistic examples: compute, metadata fetches, storage, failed preparations, support, refunds, reconciliation, FX/offramp and tax costs are unmeasured.

Measure cost per verified delivered report, including failed quote work. Track preparation failures and uncertain settlement cost separately; gross receipt volume is not a margin metric. The deep premium is 0.03 USDC, or 2.5× fresh price. Its value and additional cost are unproven; do not claim superior legal certainty or invent deeper functionality beyond the observed tier contract.

## Experiments only after real evidence

These thresholds are proposed decision rules, not statistical guarantees or permission to deploy.

| Trigger | Proposed experiment | Success guardrail |
|---|---|---|
| First 20 verified external deliveries across at least 3 independent integrations | Review quote-to-delivery failures and integration time; improve docs/recovery first | No blind second payments; support burden and uncertainty decrease |
| At least 100 external paid reports, 10 repeat external payers, and 4 weeks of cost data | Owner-approved fresh/deep price experiment using a separately approved implementation | Net contribution per qualified integration improves without a material rise in failed/abandoned flows |
| At least 1,000 external reports and 5 independent payers each exceeding 100 reports/month for 2 months | Evaluate volume tiers or explicit buyer budgets | Discount must leave measured positive contribution and preserve spend caps; no prepaid/credit feature is claimed today |
| At least 100 external deep reports and 20 matched use-case comparisons | Test deep premium/value communication, then consider a separately approved price change | Demonstrable buyer benefit relative to fresh and measured incremental cost |
| At least 25 repeat independent native payers, 1,000 delivered native reports and documented unsupported paid demand | Evaluate provider routing as a separate business and security design | Positive margin after provider cost, explicit provider rights/terms and reliable settlement/recovery |

Do not count owner QA purchases, forks, directory badges, bot traffic or repeated self-installation toward thresholds. Independent payers require evidence beyond wallet counts; until observability supports it, the trigger is not met. No automated pricing or routing experiment is configured.

## Channel economics and next action

Prioritize agents already able to pay (Bazaar/Agentic Market/Agentic Wallet discovery and x402scan/agentcash) if compatibility is proven. Today that funnel is blocked by the protocol gap. MCP Registry, Smithery, Glama and coding-agent docs are the feasible acquisition layer now; a directory connection still needs an HTTP buyer integration to purchase. Precise RSL intent discovery is more valuable than general crawler traffic outside the service's scope.

The single next action with the highest expected revenue impact is **approve a bounded, claim-safe Bazaar compatibility implementation and non-settling acceptance test**, starting from [the minimal proposal](BAZAAR-COMPATIBILITY.md). This is an expected-impact judgment based on paid-agent channel fit, not a quantified revenue forecast. A generic one-call agent must be able to complete preparation privately before paid delivery; merely adding a tag or making a seller-funded purchase will not solve acquisition. Any eventual real purchase remains a separate approval and is QA, not demand.

**Provider routing should not be the next phase.** Native paid demand, repeat buyers, delivered-report margins and recovery quality have not been demonstrated. Routing would add provider authorization, heterogeneous contracts, reliability and support work before the present funnel is validated. Future take-rate revenue would be third-party paid volume × take rate minus provider/facilitator/operating costs; neither the volume nor a take rate is established. Do not create providers or promise pass-through licenses.

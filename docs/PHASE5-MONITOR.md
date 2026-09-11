# External revenue monitor

Phase 5 disables owner-funded tests and indexing purchases. Do not restart archived buyer helpers or prompt for wallet funding/signatures. Production and protected values remain unchanged.

The hourly local Codex follow-up runs `node scripts/phase5-monitor.mjs --local-aggregates`. Phase 5 authorizes this bounded read-only aggregate projection using existing local credentials. Credentials never enter GitHub, public artifacts, logs, URLs or chat. The public GitHub discovery workflow runs the same monitor without the flag and without credentials. Neither mode creates quotes or payments.

CDP merchant lookup and six unfiltered brand/intent searches check the canonical resource and payment terms. No match means AWAITING FIRST EXTERNAL SETTLEMENT; an unavailable response is not absence. Agentic Market uses the Bazaar source, but source inclusion alone is not UI readback. No fixed indexing SLA is assumed.

Aggregate counts cannot prove payer independence, delivered signatures or no duplicate charges. Positive unattributed activity is a candidate requiring investigation, never a verified milestone. Zero total mainnet paid reports and zero receipts imply zero external paid reports in the observed aggregate scope. UNKNOWN remains null, never zero-filled.

Optional local `.private/external-revenue-evidence.json` holds `events` and `excludedWallets`. Add an event only after independently reviewing its transaction, payer independence, delivered signed report and duplicate-charge evidence. The classifier requires `EXTERNAL_VERIFIED`, all four explicit verification flags, Base mainnet, a valid transaction/payer, and current fee. It deduplicates transaction hashes and excludes owner/QA wallets. Never upload payer IDs or raw reports to public workflows. Absence from an owner-wallet list does not establish independence.

FIRST_EXTERNAL_PAYMENT: inspect settlement, existing delivery and duplicate charge evidence, then refresh Bazaar and business baseline. FIRST_REPEAT_PAYER: verify a second distinct delivered transaction from an already independent payer; analyze purpose without assuming identity. 10_EXTERNAL_PAID_REPORTS: review coverage and price sensitivity. 3_INDEPENDENT_PAYERS: evaluate whether a provider-routing proposal is warranted. No trigger changes prices, enables routing, publishes a demand claim, or makes a payment.

Fresh/deep verified counts derive from approved prices. Complete tier usage and billable-versus-UNKNOWN ratio remain UNKNOWN when the aggregate API lacks those denominators. USDC transfers alone are not paid report delivery. Monitor latency is approximately one hour locally and daily in GitHub, not instant webhook detection. Notifications stay quiet when unchanged.

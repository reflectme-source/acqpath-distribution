# Eventual mainnet procedure

> Historical Phase 3 review. Its no-core-change status records that phase only. The subsequently authorized additive Phase 3B adapter is implemented; see [current engineering status](BAZAAR-ENGINEERING-STATUS.md). Production and payment boundaries still apply.

Current state: **BLOCKED**. This document is a procedure, not authorization to deploy or spend. No mainnet candidate is ready under the permitted metadata-only scope.

1. **PATCH:** after a separately approved architecture decision, review the smallest viable diff against the exact current source. Keep the existing payment journal, recipient, prices, report semantics, Access and provider-routing state. No second payment path or automatic purchase.
2. **FULL TESTS:** reproduce the source digest, run the entire suite plus compatibility/privacy checks, complete Sepolia validation, review the raw dependency audit and the full changed-file list. Resolve the skipped platform checks before considering a release.
3. **OWNER DEPLOYMENT APPROVAL:** present the exact candidate hash and concrete deployment procedure. Only an explicit subsequent approval may permit deployment to acqpath-production. This phase does not modify production configuration or launch the deployment.
4. **DEPLOY CANDIDATE / READBACK:** after that approval, deploy the reviewed candidate and verify public health/source hash, service-info, capabilities and unchanged payment terms. Capture the prior approved code reference. Do not reset production variables or use a launcher that changes PAYMENT_MODE.
5. **UNPAID 402:** on an owner-approved synthetic input, inspect the new public discovery contract and original private quote/redemption flow without a signature. Compare every accepted requirement, schema, receipt/offer binding and private-data boundary. Use the official nonpayment validator only with the approved nonprivate URL. Failure stops the procedure before money moves.
6. **PHASE 5 EXTERNAL ONLY:** no owner-funded indexing payment. Await independent external demand; public readback monitoring never signs or settles.
7. **ONE INDEXING QA PURCHASE:** redeem that existing quote once. Preserve its encrypted private checkpoint. An ambiguous settlement enters the existing reconciliation flow; do not sign again. Never retry by buying another report.
8. **BAZAAR READBACK:** query the catalog and all eight requested searches. Verify the exact canonical endpoint, service metadata, full public extensions, price, USDC asset, recipient, network and schemas. Reject private identifiers even if the listing key is normalized. Record partial/absent/unavailable observations honestly. Claim BAZAAR INDEXED only after a matching public mainnet entry is observed.
9. **SEMANTIC DISCOVERY:** record individual results for AcqPath, RSL, rights preflight, AI usage rights, crawl rights, AI training rights, RAG ingestion rights and machine-readable content rights. Crawl searches must not lead to a claim that paid crawl is supported. Do not automate paid calls to improve ranking.

## Commercial accounting

Classify the controlled transaction **INTERNAL_INDEXING_QA** in the distribution evidence ledger, retaining the existing financial accounting without a core schema change. Exclude it from organic customer count, organic revenue, independent payers and commercial conversions. The bank/on-chain event may remain in gross accounting, with the QA classification made explicit. Never subtract or rewrite the underlying financial journal to hide it.

## Recovery and stopping

Stop on changed terms, missing private-data protections, failed readback, unknown settlement or Access/routing drift. Code rollback, if separately approved, uses the reviewed previous code reference while preserving financial and reconciliation state. This phase does not authorize rollback, payment pausing or configuration changes.

The next approval is an **architecture/design scope approval**, not mainnet deployment or payment. Docs automation can be activated separately after its own publishing/account authorization; it has no authority over this procedure.

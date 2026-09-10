https://developers.getacqpath.com/connect

This is a public hosted MCP endpoint. No OAuth or API credential is required for initialization or tool discovery. Read capabilities first; only explicitly supported origins can be quoted.

Use `acqpath_capabilities` and `acqpath_rights_quote`. The upstream legacy `acqpath_quote` provider-routing tool is disabled. Dynamic tool discovery still lists it; disable that tool in the buyer application.

Quotes can fetch content and consume quota. Reviewers should use initialize, notifications/initialized and tools/list only. The private quote claim must remain in the buyer's private application state, outside model context and gateway logs.

Paid signed reports are retrieved separately using bounded HTTP x402 authorization. Current documented prices are 0.02 USDC fresh and 0.05 USDC deep; the verified signed quote is authoritative. No payment was performed for this submission. UNKNOWN never grants permission, and reports are not licenses or legal clearance.

The linked GitHub repository contains distribution documentation and the client, not backend source. This catalog contribution consists only of metadata; its MIT contribution license does not relicense the hosted service, backend or publishers' content.

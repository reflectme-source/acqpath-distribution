# Official Bazaar requirements

> Historical Phase 3 review. Its no-core-change status records that phase only. The subsequently authorized additive Phase 3B adapter is implemented; see [current engineering status](BAZAAR-ENGINEERING-STATUS.md). Production and payment boundaries still apply.

Retrieved **2026-09-10**. Foundation source pinned to `3c2ddfb922893c91ef8f281b64f8045d1f5e0d75`; CDP documentation is a dated live snapshot. SDK package versions are distinct from protocol versions. Current v2 uses resource + accepts + extensions, not the older v1 outputSchema convention. [x402 v2 specification](https://github.com/x402-foundation/x402/blob/3c2ddfb922893c91ef8f281b64f8045d1f5e0d75/specs/x402-specification-v2.md).

## Wire contract

`PaymentRequired.extensions.bazaar` contains `info` and a Draft 2020-12 `schema` validating that info. HTTP input requires type=http and an appropriate method; body methods additionally use bodyType/body. Query parameters, custom headers and output examples are supported. Output is optional at protocol level. Service name/tags/icon belong on `resource`, not inside accepts. Service name is printable ASCII, maximum 32 characters; at most five tags of 32 characters. Schemas must not reference external files/URLs through $ref or $id. [Pinned extension specification](https://github.com/x402-foundation/x402/blob/3c2ddfb922893c91ef8f281b64f8045d1f5e0d75/specs/extensions/bazaar.md).

The HTTP helper creates input/output schema branches and validates examples as instances of that schema. A quote-body schema cannot honestly describe GET report retrieval. Static input/output documentation is not proof that the operation is callable. [HTTP declaration implementation](https://github.com/x402-foundation/x402/blob/3c2ddfb922893c91ef8f281b64f8045d1f5e0d75/typescript/packages/extensions/src/bazaar/http/resourceService.ts).

MCP discovery uses input.type=mcp, toolName and inputSchema, optionally a transport and argument example. Catalog identity includes both endpoint and tool name. This supports actual paid MCP tools; it does not turn a free quote tool into a paid one. [MCP types](https://github.com/x402-foundation/x402/blob/3c2ddfb922893c91ef8f281b64f8045d1f5e0d75/typescript/packages/extensions/src/bazaar/mcp/types.ts), [MCP payment guide](https://github.com/x402-foundation/x402/blob/3c2ddfb922893c91ef8f281b64f8045d1f5e0d75/docs/guides/mcp-server-with-x402.md).

## Dynamic resources and privacy

Current server enrichment supports colon/bracket route parameters. It creates a routeTemplate and also copies **concrete request path parameters** into info.input.pathParams. Therefore canonicalizing the catalog key does not anonymize examples. This is the critical distinction for AcqPath's random private order IDs. [Server implementation](https://github.com/x402-foundation/x402/blob/3c2ddfb922893c91ef8f281b64f8045d1f5e0d75/typescript/packages/extensions/src/bazaar/server.ts).

Facilitator extraction reads discovery from the buyer's PaymentPayload, validates info against schema, uses origin + valid routeTemplate as the catalog URL, and strips query/fragment for ordinary paths. The extraction result also retains extensions. Template syntax validation is not proof that a buyer-supplied template belongs to the paid route. Actual CDP storage policy is implementation-specific; it was not assumed to redact AcqPath's signed-offer URLs. [Facilitator implementation](https://github.com/x402-foundation/x402/blob/3c2ddfb922893c91ef8f281b64f8045d1f5e0d75/typescript/packages/extensions/src/bazaar/facilitator.ts).

## CDP behavior

CDP's current guide requires reachable HTTPS, a valid Bazaar-bearing 402, and successful eligible settlement for indexing. It documents asynchronous processing outcomes, separate curation/ranking, and removal of routes that stop responding with 402. Description length must stay within 500 characters. Base Sepolia discovery is supported through **CDP**; x402.org has a separate catalog. A successful build, deploy, validation or processing acknowledgement is not our evidence of a public listing. [CDP discovery guide](https://docs.cdp.coinbase.com/x402/seller/get-discovered).

`POST /platform/v2/x402/validate` probes a supplied HTTPS resource with GET or POST and reports preflight/simulation results; it neither pays nor indexes. Its documented body has resource and method, with no private-header or preceding-quote workflow. The guide says no key is required, while generated examples show Authorization; no credential workaround was attempted. A placeholder AcqPath URL would test 404, and a real private URL would disclose an order without supplying the necessary claim. Neither was submitted. [Validate API](https://docs.cdp.coinbase.com/api-reference/v2/rest-api/x402-facilitator/validate-x402-endpoint).

The CDP list API documents type/limit/offset. Its current page says HTTP-only, despite broader MCP support in Foundation documentation; do not assume parity. The prepared checker samples that API and uses supported search filters for targeted inventory. [List API](https://docs.cdp.coinbase.com/api-reference/v2/rest-api/x402-facilitator/list-x402-resources).

Search accepts query, network, payTo and urlSubstring filters, with up to 20 results and partialResults. It reports text/vector/hybrid searchMethod. The checker distinguishes seller-filtered inventory from eight intent queries and records truncation and unavailable responses. No result is automatically called. [Search API](https://docs.cdp.coinbase.com/api-reference/v2/rest-api/x402-facilitator/search-x402-resources).

## AcqPath conclusion

**B — NO SAFE MINIMAL PATCH — ARCHITECTURAL CHANGE REQUIRED**, within the user's metadata-only change constraints and the current CDP discovery flow. This is not a claim that Bazaar forbids every authenticated or multistep API. The current AcqPath operation cannot pass the documented autonomous probe without changing behavior or disclosing private prerequisites. A schema-valid extension alone would be insufficient and potentially unsafe.

The compact design is in `metadata/bazaar-design.json`: truthful service description, tags, supported quote purposes, separate quote/retrieval schemas and a clearly synthetic output excerpt. canonicalPublicResourceUrl remains null. The candidate template is documented as noncallable. No paid invocation example containing a quote ID, claim, signature or customer URL is published.

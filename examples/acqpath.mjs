// src/lib/errors.mjs
var Fault = class extends Error {
  constructor(code, message, status = 400, details = void 0) {
    super(message);
    this.name = "Fault";
    this.code = code;
    this.status = status;
    this.details = details;
  }
};
function requireThat(condition, code, message, status = 400) {
  if (!condition)
    throw new Fault(code, message, status);
}

// src/lib/money.mjs
function micro(value, max = 1e11) {
  requireThat(typeof value === "string" && /^(0|[1-9][0-9]{0,11})$/.test(value), "BAD_MONEY", "Use a non-negative integer string in micro-USDC.");
  const n = BigInt(value);
  requireThat(n <= BigInt(max), "BAD_MONEY", "Amount exceeds limit.");
  return n;
}

// src/lib/validation.mjs
function record(v) {
  requireThat(v !== null && typeof v === "object" && !Array.isArray(v), "BAD_INPUT", "Expected a JSON object.");
  return v;
}
function text(v, key, max = 256) {
  requireThat(typeof v === "string" && v.length > 0 && v.length <= max, "BAD_INPUT", `${key} must be a nonempty string, at most ${max} characters.`);
  return v;
}
function int(v, key, min, max) {
  requireThat(Number.isInteger(v) && v >= min && v <= max, "BAD_INPUT", `${key} must be an integer from ${min} to ${max}.`);
  return v;
}
function oneOf(v, options, key) {
  requireThat(options.includes(v), "BAD_INPUT", `Unsupported ${key}.`);
  return v;
}

// src/security/network.mjs
function publicOrigin(value) {
  let u;
  try {
    u = new URL(value);
  } catch {
    throw new Fault("BAD_URL", "Invalid URL.");
  }
  const h = u.hostname.toLowerCase().replace(/\.$/, "");
  requireThat(u.protocol === "https:" && !u.username && !u.password && !u.hash && (!u.port || u.port === "443"), "URL_REJECTED", "Only HTTPS on port 443 without credentials is allowed.");
  requireThat(!h.includes(":") && !/^\d[\d.]*$/.test(h) && !/^0x/i.test(h) && h.includes(".") && !["localhost", "metadata.google.internal"].includes(h) && ![".local", ".localhost", ".internal", ".test", ".invalid", ".example"].some((s) => h.endsWith(s)), "URL_REJECTED", "A public DNS hostname is required.");
  return u.origin;
}

// src/native/input.mjs
var PURPOSES = ["ai-input", "ai-train", "ai-index", "search"];
var USER_CLASSES = ["commercial", "non-commercial", "education", "government", "personal"];
function rightsInput(b) {
  record(b);
  requireThat(Object.keys(b).every((k) => ["resource", "purpose", "user_class", "geo", "freshness_seconds", "max_total_micro", "tier"].includes(k)), "BAD_INPUT", "Unknown rights input field.");
  text(b.resource, "resource", 2048);
  publicOrigin(b.resource);
  const u = new URL(b.resource);
  requireThat(!u.search && !u.hash && !/%(?:2f|5c|00)/i.test(u.pathname) && !u.hostname.endsWith("."), "BAD_RESOURCE", "Use a public canonical resource URL without query, fragment or encoded path separators.");
  const purpose = oneOf(b.purpose, PURPOSES, "purpose");
  const user_class = oneOf(b.user_class || "commercial", USER_CLASSES, "user_class");
  const geo = b.geo || null;
  requireThat(geo === null || typeof geo === "string" && /^[A-Z]{2}$/.test(geo), "BAD_INPUT", "geo must be a two-letter uppercase jurisdiction or omitted.");
  return {
    resource: u.href,
    purpose,
    user_class,
    geo,
    tier: oneOf(b.tier || "fresh", ["fresh", "deep"], "tier"),
    freshness_seconds: int(b.freshness_seconds ?? 300, "freshness_seconds", 0, 3600),
    max_total_micro: micro(b.max_total_micro).toString()
  };
}

// src/lib/ed25519-jwk.mjs
function parseJwk(input) {
  if (typeof input === "string") {
    if (input.length > 16384) throw new Error("Ed25519 JWK exceeds size limit.");
    return JSON.parse(input);
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Ed25519 JWK must be an object.");
  return input;
}
function base64url32(value, label) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(value)) throw new Error(`Invalid Ed25519 ${label}.`);
  return value;
}
function portableEd25519PublicJwk(input) {
  const jwk = parseJwk(input);
  if (jwk.kty !== "OKP" || jwk.crv !== "Ed25519" || jwk.d !== void 0) throw new Error("Expected a public Ed25519 OKP JWK.");
  return { kty: "OKP", crv: "Ed25519", x: base64url32(jwk.x, "public coordinate") };
}

// src/lib/crypto.mjs
var enc = new TextEncoder();
function canonical(value) {
  if (value === null || typeof value !== "object")
    return JSON.stringify(value);
  if (Array.isArray(value))
    return "[" + value.map(canonical).join(",") + "]";
  return "{" + Object.keys(value).sort().filter((k) => value[k] !== void 0).map((k) => JSON.stringify(k) + ":" + canonical(value[k])).join(",") + "}";
}
function hex(bytes) {
  return [...new Uint8Array(bytes)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
async function sha256(value) {
  return hex(await crypto.subtle.digest("SHA-256", enc.encode(value)));
}
function token(bytes = 32) {
  return hex(crypto.getRandomValues(new Uint8Array(bytes)));
}
function base64JSON(value) {
  return btoa(String.fromCharCode(...enc.encode(JSON.stringify(value))));
}
function decode64JSON(value, limit = 24e3) {
  requireThat(typeof value === "string" && value.length <= limit, "BAD_HEADER", "Payment header exceeds limit.");
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(atob(value), (x) => x.charCodeAt(0))));
  } catch {
    throw new Error("Invalid base64 JSON");
  }
}
async function verifyEvidence(evidence, publicJwk) {
  try {
    if (evidence.algorithm !== "Ed25519" || !/^[a-f0-9]{128}$/.test(evidence.signature))
      return false;
    const key = await crypto.subtle.importKey("jwk", portableEd25519PublicJwk(publicJwk), { name: "Ed25519" }, false, ["verify"]);
    return await crypto.subtle.verify("Ed25519", key, Uint8Array.from(evidence.signature.match(/../g), (x) => parseInt(x, 16)), enc.encode(canonical(evidence.payload)));
  } catch {
    return false;
  }
}

// src/payments/jws.mjs
var enc2 = new TextEncoder();
function fromB64url(s) {
  requireThat(typeof s === "string" && /^[A-Za-z0-9_-]+$/.test(s) && s.length <= 65536, "INVALID_JWS", "Invalid JWS segment.");
  return Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
}
async function verifyJWS(value, jwk, expectedKid) {
  try {
    requireThat(typeof value === "string" && value.length <= 32768, "INVALID_JWS", "Invalid JWS.");
    const parts = value.split(".");
    requireThat(parts.length === 3, "INVALID_JWS", "Invalid compact JWS.");
    const h = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(fromB64url(parts[0])));
    requireThat(h.alg === "EdDSA" && h.kid === expectedKid && !h.crit && !h.jku && !h.jwk, "INVALID_JWS", "Unexpected signing key or algorithm.");
    const key = await crypto.subtle.importKey("jwk", portableEd25519PublicJwk(jwk), { name: "Ed25519" }, false, ["verify"]);
    requireThat(await crypto.subtle.verify("Ed25519", key, fromB64url(parts[2]), enc2.encode(parts[0] + "." + parts[1])), "INVALID_JWS", "Signature rejected.");
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(fromB64url(parts[1])));
  } catch {
    return null;
  }
}
function signingKid(origin) {
  const host = new URL(origin).host.replace(/:/g, "%3A");
  return `did:web:${host}#acqpath-evidence-1`;
}

// src/native/gateway.mjs
var GATE_PATH = "/v1/rights/ingestion-gate";
var DIFF_PATH = "/v1/rights/revalidate";
var GATEWAY_PATHS = [GATE_PATH, DIFF_PATH];
var aliases = { "rag-ingestion": "ai-input", summarization: "ai-input", training: "ai-train", "search-indexing": "search" };
var gatewaySKU = (path) => path === GATE_PATH ? "rights.ingestion-gate.v1" : "rights.revalidate.v1";
function gatewayInput(body, path) {
  requireThat(GATEWAY_PATHS.includes(path) && body && typeof body === "object" && !Array.isArray(body), "BAD_INPUT", "Invalid gateway input.");
  const keys = ["resources", "purpose", "user_class", "geo", "tier", "freshness_seconds", "max_total_micro", ...path === DIFF_PATH ? ["previous"] : []];
  requireThat(Object.keys(body).every((k) => keys.includes(k)), "BAD_INPUT", "Unknown gateway input field.");
  requireThat(Array.isArray(body.resources) && body.resources.length >= 1 && body.resources.length <= 4, "BATCH_LIMIT", "Supply one to four resource URLs.");
  requireThat(body.purpose !== "crawl", "UNSUPPORTED_PURPOSE", "Crawl access is not an RSL usage grant; select the actual content use.");
  for (const key of ["user_class", "tier"]) if (body[key] !== void 0) requireThat(typeof body[key] === "string" && body[key].length > 0, "BAD_INPUT", "Invalid optional field.");
  if (body.geo !== void 0) requireThat(body.geo === null || typeof body.geo === "string" && /^[A-Z]{2}$/.test(body.geo), "BAD_INPUT", "Invalid geo.");
  const normalized = body.resources.map((resource2) => rightsInput({
    resource: resource2,
    purpose: aliases[body.purpose] || body.purpose,
    user_class: body.user_class,
    geo: body.geo,
    tier: body.tier,
    freshness_seconds: body.freshness_seconds,
    max_total_micro: body.max_total_micro
  }));
  const { resource, ...common } = normalized[0];
  const resources = [...new Set(normalized.map((i) => i.resource))].sort();
  if (path === DIFF_PATH) {
    requireThat(resources.length === 1 && body.previous && typeof body.previous === "object" && !Array.isArray(body.previous), "CHECKPOINT_REQUIRED", "Revalidation requires one resource and its signed checkpoint.");
    requireThat(common.freshness_seconds === 0 || body.freshness_seconds === void 0, "FRESHNESS_REQUIRED", "Revalidation always performs conditional source observation; freshness_seconds must be zero.");
    requireThat(new TextEncoder().encode(JSON.stringify(body.previous)).length <= 12e3, "CHECKPOINT_LIMIT", "Checkpoint exceeds limit.");
    return { ...common, freshness_seconds: 0, resources, previous: body.previous };
  }
  return { ...common, resources };
}

// examples/official-clients/acqpath-fetch.mjs
import { createSIWxPayload, encodeSIWxHeader } from "@x402/extensions/sign-in-with-x";
import { x402Client } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { wrapFetchWithPayment } from "@x402/fetch";

// src/api/rights-schema.mjs
var RightsInputSchema = { type: "object", additionalProperties: false, required: ["resource", "purpose", "max_total_micro"], properties: {
  resource: { type: "string", format: "uri", maxLength: 2048, description: "HTTPS resource on an explicitly reviewed origin; no query, fragment, credentials, IP literal, encoded slash or redirect." },
  purpose: { type: "string", enum: ["ai-input", "ai-train", "ai-index", "search"] },
  user_class: { type: "string", enum: ["commercial", "non-commercial", "education", "government", "personal"], default: "commercial" },
  geo: { type: ["string", "null"], pattern: "^[A-Z]{2}$", description: "Caller-supplied geographical context. This is not independently verified location." },
  freshness_seconds: { type: "integer", minimum: 0, maximum: 3600, default: 300 },
  tier: { type: "string", enum: ["fresh", "deep"], default: "fresh" },
  max_total_micro: { type: "string", pattern: "^(0|[1-9][0-9]*)$", description: "Exact integer micro-USDC budget." }
} };

// src/native/public-contract.mjs
var PUBLIC_PATH = "/v1/rights/preflight";
var REQUEST_HEADER = "X-AcqPath-Request";
var BINDING_EXTENSION = "acqpath-request-binding";
var PublicInputSchema = { ...RightsInputSchema, properties: {
  ...RightsInputSchema.properties,
  max_total_micro: { type: "string", pattern: "^(0|[1-9][0-9]{0,10}|100000000000)$", description: "Integer micro-USDC budget, at most 100000000000; fresh 20000, deep 50000 under current configuration." }
} };
var exampleInput = { resource: "https://publisher.example.org/article", purpose: "ai-input", max_total_micro: "20000", tier: "fresh" };
var evidenceSchema = { type: "object", required: ["algorithm", "format", "payload", "signature"], properties: {
  algorithm: { const: "Ed25519" },
  format: { const: "acqpath-evidence-v1" },
  payload: { type: "object" },
  signature: { type: "string", pattern: "^[a-f0-9]{128}$" }
} };
var PublicOutputSchema = { type: "object", required: ["version", "input_sha256", "legal_clearance", "report", "evidence", "payment_settlement", "delivery_proof"], properties: {
  version: { const: "acqpath-public-rights-v1" },
  input_sha256: { type: "string", pattern: "^[a-f0-9]{64}$" },
  legal_clearance: { const: false },
  report: { type: "object", required: ["resource", "purpose", "decision", "declaration_count"], properties: {
    resource: { type: "string", format: "uri" },
    purpose: PublicInputSchema.properties.purpose,
    decision: { enum: ["ALLOW_DECLARED", "DENY_DECLARED", "LICENSE_REQUIRED", "UNKNOWN"] },
    declaration_count: { type: "integer", minimum: 1 }
  } },
  evidence: evidenceSchema,
  delivery_proof: evidenceSchema,
  payment_settlement: { type: "object", required: ["success", "network", "transaction"], properties: { success: { const: true }, network: { enum: ["eip155:8453", "eip155:84532"] }, transaction: { type: "string", pattern: "^0x[a-fA-F0-9]{64}$" } } }
} };
var exampleEvidence = { algorithm: "Ed25519", format: "acqpath-evidence-v1", payload: { illustrative_only: true }, signature: "0".repeat(128) };
var exampleOutput = {
  version: "acqpath-public-rights-v1",
  input_sha256: "0".repeat(64),
  legal_clearance: false,
  report: { resource: exampleInput.resource, purpose: "ai-input", decision: "UNKNOWN", declaration_count: 1 },
  evidence: exampleEvidence,
  delivery_proof: exampleEvidence,
  payment_settlement: { success: true, network: "eip155:84532", transaction: "0x" + "0".repeat(64) }
};
function publicInput(body) {
  for (const key of ["user_class", "tier"]) if (body?.[key] !== void 0)
    requireThat(typeof body[key] === "string" && body[key].length > 0, "BAD_INPUT", "Invalid optional rights field.");
  if (body?.geo !== void 0) requireThat(body.geo === null || typeof body.geo === "string" && /^[A-Z]{2}$/.test(body.geo), "BAD_INPUT", "Invalid geo.");
  return rightsInput(body);
}
var requestHash = (input) => sha256(canonical(input));
var PUBLIC_NONCE_PREFIX = "0x6163717075627631";
var publicIntentId = (key) => sha256("acqpath-public-intent-v1:" + key).then((x) => x.slice(0, 48));
var boundNonce = (env, key, inputHash, path = PUBLIC_PATH) => sha256(canonical({ version: "acqpath-request-v1", resource: env.APP_ORIGIN + path, key, input_sha256: inputHash })).then((x) => PUBLIC_NONCE_PREFIX + x.slice(0, 48));
var GatewayOutputSchema = { type: "object", required: ["version", "input_sha256", "legal_clearance", "report", "evidence", "delivery_proof", "payment_settlement"], properties: {
  ...PublicOutputSchema.properties,
  version: { const: "acqpath-public-gateway-v1" },
  report: { type: "object", required: ["sku", "resources", "profile", "legal_clearance"], properties: {
    sku: { enum: ["rights.ingestion-gate.v1", "rights.revalidate.v1"] },
    resources: { type: "array", minItems: 1, maxItems: 4, items: { type: "object", required: ["resource", "classification", "legal_clearance"], properties: {
      resource: { type: "string", format: "uri" },
      classification: { enum: ["PERMITTED_BY_OBSERVED_DECLARATION", "PROHIBITED_BY_OBSERVED_DECLARATION", "LICENSE_REQUIRED", "NO_MACHINE_READABLE_DECLARATION", "CONFLICT", "UNKNOWN"] },
      legal_clearance: { const: false },
      checkpoint: { type: ["object", "null"] }
    } } },
    profile: { const: "acqpath-observed-policy-v1" },
    legal_clearance: { const: false }
  } }
} };

// src/native/siwx-binding.mjs
import { verifySIWxSignature } from "@x402/extensions/sign-in-with-x";
var SIWX_HEADER = "SIGN-IN-WITH-X";
var PREBIND_HEADER = "X-AcqPath-Payment-Intent";
var SIWX_PROFILE = "acqpath-siwx-payment-v1";
var SIWX_STATEMENT = "Authorize this Rights Preflight order and its exact payment. This is not a license.";
async function authorizationDigest(p) {
  const t = p?.accepted, a = p?.payload?.authorization;
  requireThat(p?.x402Version === 2 && t && a, "BAD_PAYMENT", "Malformed authorization.", 402);
  requireThat([t.asset, t.payTo, a.from, a.to].every((x) => /^0x[a-fA-F0-9]{40}$/.test(x || "")) && /^0x[a-fA-F0-9]{64}$/.test(a.nonce || ""), "BAD_PAYMENT", "Malformed authorization.", 402);
  requireThat([t.amount, a.value, a.validAfter, a.validBefore].every((x) => typeof x === "string" && /^(0|[1-9][0-9]*)$/.test(x)), "BAD_PAYMENT", "Noncanonical authorization integers.", 402);
  return sha256(canonical([
    SIWX_PROFILE,
    2,
    t.scheme,
    t.network,
    t.asset.toLowerCase(),
    t.payTo.toLowerCase(),
    t.amount,
    t.maxTimeoutSeconds,
    t.extra,
    a.from.toLowerCase(),
    a.to.toLowerCase(),
    a.value,
    a.validAfter,
    a.validBefore,
    a.nonce.toLowerCase()
  ]));
}
async function orderSIWXInfo(i, p) {
  requireThat(/^[a-f0-9]{32}$/.test(i.public?.siwx_nonce || ""), "SIWX_NEW_CONTEXT_REQUIRED", "Prepare a new unpaid request to use SIWX.", 402);
  const uri = i.challenge.resource.url;
  return {
    domain: new URL(uri).host,
    uri,
    version: "1",
    nonce: i.public.siwx_nonce,
    issuedAt: new Date(i.created_at).toISOString(),
    expirationTime: new Date(Math.min(i.expires_at, Number(p.payload.authorization.validBefore) * 1e3)).toISOString(),
    statement: new URL(uri).pathname === "/v1/rights/preflight" ? SIWX_STATEMENT : "Authorize this AcqPath rights gateway order and its exact payment. This is not a license.",
    requestId: i.id,
    resources: [
      uri,
      "urn:acqpath:method:POST",
      "urn:acqpath:profile:" + SIWX_PROFILE,
      "urn:acqpath:request-sha256:" + i.public.input_sha256,
      "urn:acqpath:context-sha256:" + i.public.key_hash,
      "urn:acqpath:payment-sha256:" + await authorizationDigest(p)
    ]
  };
}

// examples/public-rights-request.mjs
async function reviewPublicOffer({ challenge, body, key, origin, publicJwk, expected, now = Date.now() }) {
  requireThat(/^[a-f0-9]{64}$/.test(key || ""), "BAD_CONTEXT", "Retain the private request key.");
  const path = expected?.path || PUBLIC_PATH;
  requireThat(path === PUBLIC_PATH || GATEWAY_PATHS.includes(path), "BAD_OPERATION", "Unknown operation.");
  const input = GATEWAY_PATHS.includes(path) ? gatewayInput(body, path) : publicInput(body), hash = await requestHash(input);
  const b = challenge.extensions?.[BINDING_EXTENSION]?.info, a = challenge.accepts?.[0];
  requireThat(challenge.x402Version === 2 && challenge.accepts?.length === 1 && challenge.resource?.url === origin + path && b?.required === true && b.state === "prepared", "OFFER_REJECTED", "A prepared canonical offer is required.");
  requireThat(expected && a.scheme === "exact" && a.network === expected.network && a.asset.toLowerCase() === expected.asset.toLowerCase() && a.payTo.toLowerCase() === expected.payTo.toLowerCase() && a.amount === expected.amount && BigInt(a.amount) <= BigInt(input.max_total_micro), "TERMS_REJECTED", "Payment terms differ from independently approved terms.");
  requireThat(b.input_sha256 === hash && b.resource === challenge.resource.url && b.expires_at > now + 5e3 && b.nonce === await boundNonce({ APP_ORIGIN: origin }, key, hash, path), "BINDING_REJECTED", "Request binding differs or expires too soon.");
  requireThat(await verifyEvidence(b.evidence, publicJwk) && canonical(b.evidence.payload) === canonical({ version: b.version, resource: b.resource, input_sha256: hash, nonce: b.nonce, expires_at: b.expires_at }), "BINDING_SIGNATURE", "Request evidence signature rejected.");
  const offer = await verifyJWS(challenge.extensions?.["offer-receipt"]?.info?.offers?.[0]?.signature, publicJwk, signingKid(origin));
  requireThat(offer && offer.resourceUrl === challenge.resource.url && offer.amount === a.amount && offer.network === a.network && offer.asset === a.asset && offer.payTo === a.payTo && offer.scheme === "exact" && offer.validUntil === Math.floor(b.expires_at / 1e3), "OFFER_SIGNATURE", "Signed offer does not match terms.");
  return { signing_enabled: false, nonce: b.nonce, input_sha256: hash, expires_at: b.expires_at, accepted: structuredClone(a), normalized_input: input };
}

// examples/official-clients/verify-delivery.mjs
var ensure = (ok, code) => {
  if (!ok) throw Error(code);
};
async function verifyPublicDelivery({ result, body, challenge, payment, origin, publicJwk, expected }) {
  const signed = { ...result };
  delete signed.evidence;
  delete signed.payment_settlement;
  delete signed.delivery_proof;
  ensure(await verifyEvidence(result.evidence, publicJwk) && canonical(signed) === canonical(result.evidence.payload), "REPORT_SIGNATURE_INVALID");
  const hash = await sha256(canonical(body)), r = result.report;
  const path = expected.path || "/v1/rights/preflight";
  if (GATEWAY_PATHS.includes(path)) {
    ensure(result.version === "acqpath-public-gateway-v1" && result.input_sha256 === hash && result.legal_clearance === false && r.legal_clearance === false && r.sku === gatewaySKU(path) && canonical(r.resources.map((x) => x.resource)) === canonical(body.resources) && ["purpose", "user_class", "geo", "tier"].every((k) => r[k] === body[k]) && result.billing.fee_type === gatewaySKU(path) && result.billing.amount_micro === expected.amount, "REPORT_INPUT_OR_TERMS_MISMATCH");
    for (const item of r.resources) if (item.checkpoint) ensure(await verifyEvidence(item.checkpoint, publicJwk) && item.checkpoint.payload.resource === item.resource && item.checkpoint.payload.fingerprint === item.policy_fingerprint && item.policy_fingerprint === await sha256(canonical(item.checkpoint.payload.policy)), "CHECKPOINT_SIGNATURE_INVALID");
    if (path !== GATE_PATH) ensure(r.diff.previous_fingerprint === body.previous.payload.fingerprint, "DIFF_BASELINE_MISMATCH");
  } else ensure(result.version === "acqpath-public-rights-v1" && result.input_sha256 === hash && result.legal_clearance === false && r.resource === body.resource && r.purpose === body.purpose && r.user_class === body.user_class && r.geo === body.geo && r.legal_clearance === false && result.billing.fee_type === "rights_preflight_report" && result.billing.amount_micro === expected.amount, "REPORT_INPUT_OR_TERMS_MISMATCH");
  const s = result.payment_settlement, receipt = s?.extensions?.["offer-receipt"]?.info?.receipt;
  ensure(s?.success === true && s.network === expected.network && /^0x[a-f0-9]{64}$/i.test(s.transaction || ""), "SETTLEMENT_INVALID");
  const rp = receipt?.format === "jws" && await verifyJWS(receipt.signature, publicJwk, signingKid(origin));
  ensure(rp && rp.version === 1 && rp.network === expected.network && rp.resourceUrl === challenge.resource.url && rp.transaction === s.transaction && rp.payer.toLowerCase() === payment.payload.authorization.from.toLowerCase() && Number.isSafeInteger(rp.issuedAt) && rp.issuedAt <= Date.now() / 1e3 + 30, "RECEIPT_INVALID");
  ensure(await verifyEvidence(result.delivery_proof, publicJwk), "DELIVERY_SIGNATURE_INVALID");
  const d = result.delivery_proof.payload;
  ensure(d.version === "acqpath-public-delivery-v1" && d.input_sha256 === hash && d.resource_url === challenge.resource.url && d.report_sha256 === await sha256(canonical({ ...signed, evidence: result.evidence })) && d.offer_sha256 === await sha256(canonical(challenge.extensions["offer-receipt"].info.offers[0])) && d.network === expected.network && d.asset.toLowerCase() === expected.asset.toLowerCase() && d.pay_to.toLowerCase() === expected.payTo.toLowerCase() && d.amount_micro === expected.amount && d.transaction === s.transaction, "DELIVERY_BINDING_INVALID");
}

// examples/official-clients/acqpath-fetch.mjs
var ensure2 = (ok, code) => {
  if (!ok) throw Error(code);
};
function createAcqPathFetch({ signer, expected, publicJwk, store, fetch: transport = globalThis.fetch, allowPayment = false }) {
  ensure2(store?.withLock, "DURABLE_PRIVATE_STORE_REQUIRED");
  return async function acqpathFetch(url, init = {}) {
    const { operationId, ...http } = init;
    ensure2(typeof operationId === "string" && operationId.length > 0 && operationId.length <= 128, "LOGICAL_OPERATION_ID_REQUIRED");
    const target = new URL(url), origin = target.origin, path = expected.path || PUBLIC_PATH;
    ensure2(path === PUBLIC_PATH || GATEWAY_PATHS.includes(path), "CANONICAL_POST_REQUIRED");
    ensure2(target.href === origin + path && origin === expected.origin && http.method === "POST", "CANONICAL_POST_REQUIRED");
    const body = GATEWAY_PATHS.includes(path) ? gatewayInput(JSON.parse(http.body), path) : publicInput(JSON.parse(http.body)), bodyText = JSON.stringify(body);
    return store.withLock(operationId, async ({ value: saved, save }) => {
      let state = saved || { version: 1, origin, path, body, key: token(32), status: "NEW" };
      ensure2((state.path || PUBLIC_PATH) === path && state.version === 1 && state.origin === origin && canonical(state.body) === canonical(body), "OPERATION_INPUT_MISMATCH");
      ensure2(!new Headers(http.headers).has("payment-signature") && !new Headers(http.headers).has(SIWX_HEADER) && !new Headers(http.headers).has(PREBIND_HEADER) && !new Headers(http.headers).has(REQUEST_HEADER), "CALLER_PAYMENT_HEADERS_FORBIDDEN");
      const headers = new Headers(http.headers);
      headers.set("content-type", "application/json");
      headers.set(REQUEST_HEADER, state.key);
      const base = { ...http, body: bodyText, headers, redirect: "error" };
      let currentOffer = state.challenge;
      async function send(request) {
        ensure2(request.url === target.href, "TRANSPORT_TARGET_MISMATCH");
        const paymentHeader = request.headers.get("payment-signature");
        if (paymentHeader) {
          ensure2(allowPayment, "PAYMENT_OPT_IN_REQUIRED");
          const p = decode64JSON(paymentHeader);
          ensure2(currentOffer, "PREPARED_OFFER_REQUIRED");
          state = { ...state, paymentHeader, status: "AUTHORIZED" };
          await save(state);
          const retry = request.clone();
          const probe = new Request(request);
          probe.headers.delete("payment-signature");
          probe.headers.set(PREBIND_HEADER, base64JSON({ accepted: p.accepted, authorization: p.payload.authorization }));
          const result = await transport(probe);
          if (result.status !== 402) return result;
          const challenge = decode64JSON(result.headers.get("payment-required"));
          const ext = challenge.extensions?.["sign-in-with-x"];
          ensure2(challenge.error === "SIWX_PAYMENT_BINDING_REQUIRED" && ext, "PAYMENT_REJECTED_NO_NEW_SIGNATURE");
          const binding = currentOffer.extensions["acqpath-request-binding"].info;
          const i = {
            id: await publicIntentId(state.key),
            challenge: currentOffer,
            created_at: Date.parse(ext.info.issuedAt),
            expires_at: binding.expires_at,
            public: { input_sha256: binding.input_sha256, key_hash: await sha256(state.key), siwx_nonce: ext.info.nonce }
          };
          ensure2(/^[a-f0-9]{32}$/.test(ext.info.nonce) && i.created_at <= Date.now() + 5e3 && i.created_at >= Date.now() - 36e5, "SIWX_CHALLENGE_INVALID");
          const info = await orderSIWXInfo(i, p), chain = { chainId: p.accepted.network, type: "eip191", signatureScheme: "eip191" };
          ensure2(canonical(ext.info) === canonical(info) && canonical(ext.supportedChains) === canonical([chain]), "SIWX_CHALLENGE_BINDING_MISMATCH");
          ensure2(Date.parse(info.expirationTime) > Date.now() + 1e3, "SIWX_EXPIRED");
          const proof = await createSIWxPayload({ ...info, ...chain }, signer, target.href);
          ensure2(proof.address.toLowerCase() === p.payload.authorization.from.toLowerCase(), "SIWX_SIGNER_MISMATCH");
          state = { ...state, siwxHeader: encodeSIWxHeader(proof), status: "SUBMITTING" };
          await save(state);
          retry.headers.set(SIWX_HEADER, state.siwxHeader);
          return transport(retry);
        }
        const res = await transport(request);
        if (res.status === 402) {
          currentOffer = decode64JSON(res.headers.get("payment-required"));
          await reviewPublicOffer({ challenge: currentOffer, body, key: state.key, origin, publicJwk, expected });
          state = { ...state, challenge: currentOffer, status: "PREPARED" };
          await save(state);
          ensure2(allowPayment, "PAYMENT_OPT_IN_REQUIRED");
        }
        return res;
      }
      let response;
      if (state.paymentHeader) {
        ensure2(allowPayment, "PAYMENT_OPT_IN_REQUIRED");
        await reviewPublicOffer({ challenge: state.challenge, body, key: state.key, origin, publicJwk, expected, now: 0 });
        const h = new Headers(headers);
        h.set("payment-signature", state.paymentHeader);
        if (state.siwxHeader) h.set(SIWX_HEADER, state.siwxHeader);
        response = state.siwxHeader ? await transport(new Request(url, { ...base, headers: h })) : await send(new Request(url, { ...base, headers: h }));
      } else {
        await save(state);
        const client = new x402Client().register("eip155:*", new ExactEvmScheme(signer));
        response = await wrapFetchWithPayment(send, client)(url, base);
      }
      if (response.status === 200) {
        const result = await response.clone().json();
        if (result.available === false) {
          ensure2(result.charge_micro === "0", "INVALID_UNPAID_RESULT");
          return response;
        }
        await verifyPublicDelivery({ result, body, challenge: state.challenge, payment: decode64JSON(state.paymentHeader), origin, publicJwk, expected });
        state = { ...state, status: "DELIVERED" };
        await save(state);
      }
      return response;
    });
  };
}

// examples/official-clients/private-store.mjs
import { mkdir, open, readFile, rename, unlink } from "node:fs/promises";
import { join, resolve } from "node:path";
function privateFileStore(directory) {
  const root = resolve(directory);
  return { async withLock(id, fn) {
    await mkdir(root, { recursive: true, mode: 448 });
    const file = join(root, await sha256(id) + ".json"), lock = file + ".lock";
    let handle;
    try {
      handle = await open(lock, "wx", 384);
    } catch {
      throw Error("OPERATION_LOCKED_RECOVER_SAVED_STATE");
    }
    try {
      let value;
      try {
        value = JSON.parse(await readFile(file, "utf8"));
      } catch (e) {
        if (e.code !== "ENOENT") throw e;
      }
      return await fn({ value, async save(next) {
        const temp = file + ".tmp", out = await open(temp, "w", 384);
        try {
          await out.writeFile(JSON.stringify(next));
          await out.sync();
        } finally {
          await out.close();
        }
        await rename(temp, file);
        if (process.platform !== "win32") {
          const dir = await open(root, "r");
          try {
            await dir.sync();
          } finally {
            await dir.close();
          }
        }
      } });
    } finally {
      await handle.close();
      await unlink(lock);
    }
  } };
}
export {
  createAcqPathFetch,
  privateFileStore
};

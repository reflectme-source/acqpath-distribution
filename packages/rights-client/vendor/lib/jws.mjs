import { canonical, token } from './crypto.mjs';
import { requireThat } from './errors.mjs';
const enc = new TextEncoder();
export function b64url(bytes) { return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
export function fromB64url(s) { requireThat(typeof s === 'string' && /^[A-Za-z0-9_-]+$/.test(s) && s.length <= 65536, 'INVALID_JWS', 'Invalid JWS segment.'); return Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)); }
export async function signJWS(payload, privateJwk, kid) {
    const header = b64url(enc.encode(canonical({ alg: 'EdDSA', kid, typ: 'JWT' })));
    const body = b64url(enc.encode(canonical(payload)));
    const key = await crypto.subtle.importKey('jwk', typeof privateJwk === 'string' ? JSON.parse(privateJwk) : privateJwk, { name: 'Ed25519' }, false, ['sign']);
    const message = header + '.' + body;
    return message + '.' + b64url(await crypto.subtle.sign('Ed25519', key, enc.encode(message)));
}
export async function verifyJWS(value, jwk, expectedKid) {
    try {
        requireThat(typeof value === 'string' && value.length <= 32768, 'INVALID_JWS', 'Invalid JWS.');
        const parts = value.split('.'); requireThat(parts.length === 3, 'INVALID_JWS', 'Invalid compact JWS.');
        const h = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(fromB64url(parts[0])));
        requireThat(h.alg === 'EdDSA' && h.kid === expectedKid && !h.crit && !h.jku && !h.jwk, 'INVALID_JWS', 'Unexpected signing key or algorithm.');
        const key = await crypto.subtle.importKey('jwk', jwk, { name: 'Ed25519' }, false, ['verify']);
        requireThat(await crypto.subtle.verify('Ed25519', key, fromB64url(parts[2]), enc.encode(parts[0] + '.' + parts[1])), 'INVALID_JWS', 'Signature rejected.');
        return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(fromB64url(parts[1])));
    } catch { return null; }
}
export function signingKid(origin) { const host = new URL(origin).host.replace(/:/g, '%3A'); return `did:web:${host}#acqpath-evidence-1`; }
export function didDocument(env) {
    const kid = signingKid(env.APP_ORIGIN), did = kid.split('#')[0];
    const k = JSON.parse(env.EVIDENCE_PUBLIC_JWK || '{}');
    requireThat(k.kty === 'OKP' && k.crv === 'Ed25519' && typeof k.x === 'string' && !k.d, 'KEY_CONFIG_INVALID', 'Public signing key is invalid.', 503);
    return { '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/jws-2020/v1'], id: did,
        verificationMethod: [{ id: kid, type: 'JsonWebKey2020', controller: did, publicKeyJwk: k }], assertionMethod: [kid] };
}

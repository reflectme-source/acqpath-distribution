import { requireThat } from './errors.mjs';
const enc = new TextEncoder();
export function canonical(value) {
    if (value === null || typeof value !== 'object')
        return JSON.stringify(value);
    if (Array.isArray(value))
        return '[' + value.map(canonical).join(',') + ']';
    return '{' + Object.keys(value).sort().filter(k => value[k] !== undefined).map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
}
export function hex(bytes) { return [...new Uint8Array(bytes)].map(x => x.toString(16).padStart(2, '0')).join(''); }
export async function sha256(value) { return hex(await crypto.subtle.digest('SHA-256', enc.encode(value))); }
export function token(bytes = 32) { return hex(crypto.getRandomValues(new Uint8Array(bytes))); }
export function base64JSON(value) { return btoa(String.fromCharCode(...enc.encode(JSON.stringify(value)))); }
export function decode64JSON(value, limit = 24000) {
    requireThat(typeof value === 'string' && value.length <= limit, 'BAD_HEADER', 'Payment header exceeds limit.');
    try {
        return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(atob(value), x => x.charCodeAt(0))));
    }
    catch {
        throw new Error('Invalid base64 JSON');
    }
}
export async function matchesHash(value, expected) {
    if (typeof value !== 'string' || typeof expected !== 'string' || !/^[a-f0-9]{64}$/.test(expected))
        return false;
    const actual = await sha256(value);
    let mismatch = 0;
    for (let i = 0; i < 64; i++)
        mismatch |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
    return mismatch === 0;
}
export async function hmac(secret, value) {
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    return hex(await crypto.subtle.sign('HMAC', key, enc.encode(value)));
}
// Application evidence is Ed25519 signed. It is NOT an OLP license or the x402 offer-receipt extension.
export async function signEvidence(record, privateJwk) {
    const key = await crypto.subtle.importKey('jwk', JSON.parse(privateJwk), { name: 'Ed25519' }, false, ['sign']);
    const payload = canonical(record);
    const signature = hex(await crypto.subtle.sign('Ed25519', key, enc.encode(payload)));
    return { algorithm: 'Ed25519', format: 'acqpath-evidence-v1', payload: record, signature };
}
export async function verifyEvidence(evidence, publicJwk) {
    try {
        if (evidence.algorithm !== 'Ed25519' || !/^[a-f0-9]{128}$/.test(evidence.signature))
            return false;
        const key = await crypto.subtle.importKey('jwk', publicJwk, { name: 'Ed25519' }, false, ['verify']);
        return await crypto.subtle.verify('Ed25519', key, Uint8Array.from(evidence.signature.match(/../g), x => parseInt(x, 16)), enc.encode(canonical(evidence.payload)));
    }
    catch {
        return false;
    }
}

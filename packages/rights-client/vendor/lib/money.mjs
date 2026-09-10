import { requireThat } from './errors.mjs';
// All money is USDC atomic units (10^-6); no floating-point money arithmetic.
export function micro(value, max = 100000000000) {
    requireThat(typeof value === 'string' && /^(0|[1-9][0-9]{0,11})$/.test(value), 'BAD_MONEY', 'Use a non-negative integer string in micro-USDC.');
    const n = BigInt(value);
    requireThat(n <= BigInt(max), 'BAD_MONEY', 'Amount exceeds limit.');
    return n;
}
export function usd(value) { const n = BigInt(value); return `${n / 1000000n}.${(n % 1000000n).toString().padStart(6, '0')}`; }
export function feeFor(baseline, selected, policy) {
    const saving = baseline > selected ? baseline - selected : 0n;
    // This quote is a fixed planning fee, NOT a claim of realized savings.
    const fraction = saving * BigInt(policy.fee_bps) / 10000n;
    const cap = BigInt(policy.fee_cap_micro);
    const fee = fraction < cap ? fraction : cap;
    return { fee, estimatedSaving: saving, buyerNet: saving - fee };
}

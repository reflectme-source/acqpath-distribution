import { micro } from './money.mjs';
import { requireThat } from './errors.mjs';
// Local SDK budget: synchronous reservation is atomic within one JS instance.
// It is NOT a cross-process wallet authorization or AP2 mandate.
export class TaskBudget {
    constructor(limit) { this.limit = micro(limit); this.spent = 0n; this.pending = new Map(); }
    reserve(id, amount) { requireThat(!this.pending.has(id), 'DUPLICATE_RESERVATION', 'Reservation already exists.'); const n = micro(amount); requireThat(n <= this.available(), 'BUDGET_EXCEEDED', 'Task budget exceeded.'); this.pending.set(id, n); }
    available() { return this.limit - this.spent - [...this.pending.values()].reduce((a, b) => a + b, 0n); }
    commit(id, actual) { requireThat(this.pending.has(id), 'MISSING_RESERVATION', 'Reservation missing.'); const n = micro(actual); requireThat(n <= this.pending.get(id), 'BUDGET_EXCEEDED', 'Actual spend exceeds reservation.'); this.spent += n; this.pending.delete(id); }
    release(id) { this.pending.delete(id); }
    snapshot() { return { limit_micro: this.limit.toString(), spent_micro: this.spent.toString(), available_micro: this.available().toString(), pending: this.pending.size }; }
}

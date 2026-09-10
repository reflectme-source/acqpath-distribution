export class Fault extends Error {
    constructor(code, message, status = 400, details = undefined) {
        super(message);
        this.name = 'Fault';
        this.code = code;
        this.status = status;
        this.details = details;
    }
}
export function requireThat(condition, code, message, status = 400) {
    if (!condition)
        throw new Fault(code, message, status);
}
export function errorJSON(error, requestId) {
    const known = error instanceof Fault;
    return new Response(JSON.stringify({ error: known ? error.code : 'INTERNAL_ERROR',
        message: known ? error.message : 'Request failed. Use request_id when reporting this error.',
        request_id: requestId, ...(known && error.details ? { details: error.details } : {}) }), {
        status: known ? error.status : 500, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
    });
}

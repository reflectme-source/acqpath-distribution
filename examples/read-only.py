"""Read live coverage before a Python ingestion pipeline. No quote or payment.

Full workflow:
1. Call before selected source content enters model input/index/training/search.
2. Use canonical HTTPS resource plus the actual paid purpose and integer budget.
3. Hold UNKNOWN, unsupported, DENY_DECLARED and LICENSE_REQUIRED results.
4. For purchases, use the tested Python/httpx or TypeScript AcqPath SIWX adapter:
   public preflight -> verified offer -> unchanged official signer -> SIWX.
5. That adapter verifies Ed25519 report, receipt and delivery bindings.
6. Persist private state before submission and resume the same operation after ambiguity.
7. Reuse the same logical ID and signed payload; never create a replacement charge.

This example deliberately supplies no Python payment/signature implementation.
This file is only a stdlib capability probe. The supported paid Python integration is
https://developers.getacqpath.com/examples/OFFICIAL-CLIENTS.md.
"""
import json
import urllib.request

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError('Capability redirect rejected')

def read_capabilities():
    request = urllib.request.Request('https://api.getacqpath.com/v1/capabilities', headers={'Accept': 'application/json'})
    with urllib.request.build_opener(NoRedirect()).open(request, timeout=15) as response:
        body = response.read(262145)
    if len(body) > 262144:
        raise ValueError('Capability response too large')
    caps = json.loads(body)
    native = next((s for s in caps.get('native_services', []) if s.get('capability') == 'rights.preflight.v1'), {})
    return {'available': native.get('enabled') is True, 'coverage': native.get('coverage', []), 'fresh_fee_micro': native.get('fresh_fee_micro'), 'deep_fee_micro': native.get('deep_fee_micro'), 'quote_created': False, 'payment_performed': False}

if __name__ == '__main__':
    print(json.dumps(read_capabilities(), indent=2))

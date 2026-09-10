"""Read live coverage before a Python ingestion pipeline. No quote or payment.

Full workflow:
1. Call before selected source content enters model input/index/training/search.
2. Use canonical HTTPS resource plus the actual paid purpose and integer budget.
3. Hold UNKNOWN, unsupported, DENY_DECLARED and LICENSE_REQUIRED results.
4. For purchases, use the reviewed JS buyer adapter in your private application:
   quote -> private claim -> verified signed offer -> bounded buyer authorization.
5. That adapter verifies Ed25519 report, receipt and delivery bindings.
6. Persist its encrypted checkpoint before submission and resume after ambiguity.
7. Reuse the same logical ID and signed payload; never create a replacement charge.

This example deliberately supplies no Python payment/signature implementation.
It is a stdlib capability probe, not a second supported SDK. See README.md and
https://developers.getacqpath.com/http-x402 for the complete integration contract.
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

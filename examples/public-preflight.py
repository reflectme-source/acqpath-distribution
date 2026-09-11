"""Unpaid standard-library HTTP example. No wallet, API key or settlement."""
import base64, json, secrets, urllib.request, urllib.error

def preflight(resource="https://rslstandard.org/", purpose="ai-input"):
    if purpose not in ("ai-input", "ai-index", "ai-train", "search"):
        raise ValueError("Unsupported purpose")
    endpoint = "https://api.getacqpath.com/v1/rights/preflight"
    body = {"resource": resource, "purpose": purpose, "tier": "fresh", "max_total_micro": "20000"}
    request = urllib.request.Request(endpoint, data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "X-AcqPath-Request": secrets.token_hex(32)}, method="POST")
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *args):
            return None
    try:
        response = urllib.request.build_opener(NoRedirect).open(request, timeout=25)
    except urllib.error.HTTPError as error:
        response = error
    if response.code == 200:
        result = json.loads(response.read(524288))
        if result.get("available") is not False or result.get("charge_micro") != "0":
            raise ValueError("Unexpected unpaid response")
        return {"status": "UNAVAILABLE", "reason": result.get("reason"), "charged": "0"}
    if response.code in (401, 403, 418, 429):
        return {"status": "FETCH_BLOCKED", "http": response.code, "charged": "0", "ingestionAuthorized": False}
    if response.code != 402:
        raise ValueError("Unpaid preflight HTTP " + str(response.code))
    header = response.headers.get("Payment-Required", "")
    if len(header) > 64000:
        raise ValueError("Challenge too large")
    challenge = json.loads(base64.b64decode(header, validate=True))
    offer = challenge["accepts"][0]
    if len(challenge["accepts"]) != 1 or challenge["resource"]["url"] != endpoint or offer["amount"] != "20000" or offer["network"] != "eip155:8453" or offer["scheme"] != "exact" or offer["asset"].lower() != "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" or offer["payTo"].lower() != "0xf69dbbd053fb0fbc78adfdb1bfe3b0d1f57300ec":
        raise ValueError("Unexpected terms")
    binding = challenge["extensions"]["acqpath-request-binding"]["info"]
    if binding["state"] != "prepared":
        raise ValueError("Not a purchasable challenge")
    return {"status": "402_PREPARED_NO_PAYMENT", "decision": binding["decision_preview"], "amountMicro": offer["amount"], "signatureVerified": False, "genericX402ClientCompatible": False, "ingestionAuthorized": False}

if __name__ == "__main__":
    print(json.dumps(preflight(), indent=2))

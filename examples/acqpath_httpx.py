"""Official x402/httpx + official SIWX; no custom payment signature or nonce.
Private operation store required. No signing keys are persisted. No automatic
new payment on recovery. This adapter deliberately accepts canonical ASCII URLs.
"""
import base64
import hashlib
import json
import os
import re
import secrets
import time
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

import httpx
from nacl.signing import VerifyKey
from x402 import x402Client
from x402.mechanisms.evm.exact import ExactEvmScheme
from x402.http.clients.httpx import x402AsyncTransport
from x402.extensions.sign_in_with_x.client import create_siwx_payload

PATH = '/v1/rights/preflight'
CONTEXT = 'X-AcqPath-Request'
PREBIND = 'X-AcqPath-Payment-Intent'
SIWX = 'SIGN-IN-WITH-X'
PROFILE = 'acqpath-siwx-payment-v1'
STATEMENT = 'Authorize this Rights Preflight order and its exact payment. This is not a license.'


def need(ok, code):
    if not ok:
        raise ValueError(code)


def canonical(v):
    # Current contract is JSON strings, booleans, null and safe integers only.
    # Fail closed on floats/unsafe integers instead of guessing JS serialization.
    def check(x):
        if isinstance(x, float):
            raise ValueError('UNSUPPORTED_CANONICAL_NUMBER')
        if isinstance(x, int):
            need(abs(x) <= 9007199254740991, 'UNSAFE_JSON_INTEGER')
        if isinstance(x, dict):
            for k, y in x.items():
                need(k.isascii(), 'UNSUPPORTED_CANONICAL_KEY')
                check(y)
        if isinstance(x, list):
            for y in x:
                check(y)
    check(v)
    return json.dumps(v, sort_keys=True, ensure_ascii=False, separators=(',', ':'), allow_nan=False)


def sha(v):
    return hashlib.sha256(v.encode('utf-8')).hexdigest()


def b64(v):
    return base64.b64encode(canonical(v).encode()).decode()


def unb64(v):
    need(isinstance(v, str) and len(v) <= 24000, 'BAD_HEADER')
    return json.loads(base64.b64decode(v, validate=True))


def b64url(v):
    return base64.urlsafe_b64decode(v + '=' * (-len(v) % 4))


def iso(ms):
    return datetime.fromtimestamp(ms / 1000, timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')


def millis(value):
    return int(datetime.fromisoformat(value.replace('Z', '+00:00')).timestamp() * 1000)


def normalize(body):
    need(isinstance(body, dict) and set(body) <= {'resource','purpose','user_class','geo','tier','freshness_seconds','max_total_micro'}, 'BAD_INPUT')
    resource = body['resource']
    u = urlsplit(resource)
    need(resource.isascii() and u.scheme == 'https' and u.hostname and not u.username and not u.password and not u.query and not u.fragment and
         u.netloc == u.hostname and not u.hostname.endswith('.') and u.path.startswith('/') and not re.search(r'%2f|%5c|%00|\\|/\.\.?(/|$)', u.path, re.I), 'CANONICAL_HTTPS_RESOURCE_REQUIRED')
    need(resource == 'https://' + u.hostname + u.path, 'CANONICAL_HTTPS_RESOURCE_REQUIRED')
    purpose = body['purpose']
    user = body.get('user_class', 'commercial')
    tier = body.get('tier', 'fresh')
    geo = body.get('geo')
    fresh = body.get('freshness_seconds', 300)
    amount = body['max_total_micro']
    need(purpose in ['ai-input','ai-train','ai-index','search'] and user in ['commercial','non-commercial','education','government','personal'] and tier in ['fresh','deep'], 'BAD_INPUT')
    need(geo is None or (isinstance(geo, str) and re.fullmatch('[A-Z]{2}', geo)), 'BAD_GEO')
    need(type(fresh) is int and 0 <= fresh <= 3600 and isinstance(amount, str) and re.fullmatch('0|[1-9][0-9]*', amount) and int(amount) <= 100000000000, 'BAD_INPUT')
    return dict(resource=resource, purpose=purpose, user_class=user, geo=geo, tier=tier, freshness_seconds=fresh, max_total_micro=amount)


def payment_digest(p):
    t, a = p['accepted'], p['payload']['authorization']
    need(p['x402Version'] == 2, 'BAD_PAYMENT')
    need(all(re.fullmatch('0x[0-9a-fA-F]{40}', x) for x in [t['asset'], t['payTo'], a['from'], a['to']]), 'BAD_PAYMENT')
    need(re.fullmatch('0x[0-9a-fA-F]{64}', a['nonce']), 'BAD_PAYMENT')
    need(all(isinstance(x, str) and re.fullmatch('0|[1-9][0-9]*', x) for x in [t['amount'],a['value'],a['validAfter'],a['validBefore']]), 'BAD_PAYMENT')
    return sha(canonical([PROFILE,2,t['scheme'],t['network'],t['asset'].lower(),t['payTo'].lower(),t['amount'],t['maxTimeoutSeconds'],t['extra'],a['from'].lower(),a['to'].lower(),a['value'],a['validAfter'],a['validBefore'],a['nonce'].lower()]))


def evidence(e, key):
    need(e['algorithm'] == 'Ed25519' and e['format'] == 'acqpath-evidence-v1', 'EVIDENCE_FORMAT')
    VerifyKey(b64url(key['x'])).verify(canonical(e['payload']).encode(), bytes.fromhex(e['signature']))
    return e['payload']


def jws(value, key, origin):
    h, p, s = value.split('.')
    header = json.loads(b64url(h))
    need(header['alg'] == 'EdDSA' and header['kid'] == 'did:web:' + urlsplit(origin).netloc.replace(':','%3A') + '#acqpath-evidence-1' and not any(header.get(k) for k in ['crit','jku','jwk']), 'JWS_HEADER')
    VerifyKey(b64url(key['x'])).verify((h+'.'+p).encode(), b64url(s))
    return json.loads(b64url(p))


def review_offer(ch, state, expected, key, check_time=True):
    a, b = ch['accepts'][0], ch['extensions']['acqpath-request-binding']['info']
    uri, digest = expected['origin'] + PATH, sha(canonical(state['body']))
    need(ch['x402Version'] == 2 and len(ch['accepts']) == 1 and ch['resource']['url'] == uri and b['required'] is True and b['state'] == 'prepared', 'PREPARED_OFFER_REQUIRED')
    need(a['scheme'] == 'exact' and all(a[k].lower() == expected[k].lower() for k in ['network','asset','payTo']) and a['amount'] == expected['amount'] and int(a['amount']) <= int(state['body']['max_total_micro']), 'PINNED_TERMS_MISMATCH')
    nonce = '0x6163717075627631' + sha(canonical(dict(version='acqpath-request-v1',resource=uri,key=state['key'],input_sha256=digest)))[:48]
    need(b['input_sha256'] == digest and b['resource'] == uri and b['nonce'] == nonce and (not check_time or b['expires_at'] > time.time()*1000+5000), 'OFFER_BINDING_MISMATCH')
    binding = dict(version=b['version'],resource=uri,input_sha256=digest,nonce=nonce,expires_at=b['expires_at'])
    need(evidence(b['evidence'],key) == binding, 'BINDING_SIGNATURE')
    offer = jws(ch['extensions']['offer-receipt']['info']['offers'][0]['signature'],key,expected['origin'])
    need(offer == dict(version=1,resourceUrl=uri,scheme='exact',network=a['network'],asset=a['asset'],payTo=a['payTo'],amount=a['amount'],validUntil=b['expires_at']//1000), 'OFFER_SIGNATURE')


def review_siwx(ext, state, p, expected):
    info, a = ext['info'], p['payload']['authorization']
    uri = expected['origin']+PATH
    issued = millis(info['issuedAt'])
    need(re.fullmatch('[a-f0-9]{32}', info['nonce']) and time.time()*1000-3600000 <= issued <= time.time()*1000+5000, 'SIWX_TIME_NONCE')
    wanted = dict(domain=urlsplit(uri).netloc,uri=uri,version='1',nonce=info['nonce'],issuedAt=iso(issued),
        expirationTime=iso(min(state['challenge']['extensions']['acqpath-request-binding']['info']['expires_at'],int(a['validBefore'])*1000)),
        statement=STATEMENT,requestId=sha('acqpath-public-intent-v1:'+state['key'])[:48],
        resources=[uri,'urn:acqpath:method:POST','urn:acqpath:profile:'+PROFILE,'urn:acqpath:request-sha256:'+sha(canonical(state['body'])),
                   'urn:acqpath:context-sha256:'+sha(state['key']),'urn:acqpath:payment-sha256:'+payment_digest(p)])
    chain = dict(chainId=p['accepted']['network'],type='eip191',signatureScheme='eip191')
    need(info == wanted and ext['supportedChains'] == [chain] and millis(info['expirationTime']) > time.time()*1000+1000, 'SIWX_BINDING_MISMATCH')
    return {**wanted,**chain}


def verify_delivery(result, state, expected, key):
    signed = {k:v for k,v in result.items() if k not in ['evidence','payment_settlement','delivery_proof']}
    need(evidence(result['evidence'],key) == signed, 'REPORT_SIGNATURE')
    body, r, digest = state['body'], result['report'], sha(canonical(state['body']))
    need(result['version'] == 'acqpath-public-rights-v1' and result['input_sha256'] == digest and result['legal_clearance'] is False and r['legal_clearance'] is False and all(r[k] == body[k] for k in ['resource','purpose','user_class','geo']) and result['billing']['fee_type'] == 'rights_preflight_report' and result['billing']['amount_micro'] == expected['amount'], 'REPORT_BINDING')
    s = result['payment_settlement']
    need(s['success'] is True and s['network'] == expected['network'] and re.fullmatch('0x[0-9a-fA-F]{64}', s['transaction']), 'SETTLEMENT_INVALID')
    receipt = s['extensions']['offer-receipt']['info']['receipt']
    need(receipt['format'] == 'jws', 'RECEIPT_FORMAT')
    rp = jws(receipt['signature'],key,expected['origin'])
    p = unb64(state['paymentHeader'])
    need(rp['version'] == 1 and rp['network'] == expected['network'] and rp['resourceUrl'] == expected['origin']+PATH and rp['transaction'] == s['transaction'] and rp['payer'].lower() == p['payload']['authorization']['from'].lower() and type(rp['issuedAt']) is int and rp['issuedAt'] <= time.time()+30, 'RECEIPT_BINDING')
    d = evidence(result['delivery_proof'],key)
    need(d['version'] == 'acqpath-public-delivery-v1' and d['input_sha256'] == digest and d['resource_url'] == expected['origin']+PATH and d['report_sha256'] == sha(canonical({**signed,'evidence':result['evidence']})) and d['offer_sha256'] == sha(canonical(state['challenge']['extensions']['offer-receipt']['info']['offers'][0])) and d['network'] == expected['network'] and d['asset'].lower() == expected['asset'].lower() and d['pay_to'].lower() == expected['payTo'].lower() and d['amount_micro'] == expected['amount'] and d['transaction'] == s['transaction'], 'DELIVERY_BINDING')


class PrivateFileStore:
    """Provision a private Windows ACL or POSIX private directory; locks fail closed."""
    def __init__(self, directory):
        self.root = Path(directory).resolve()
        self.root.mkdir(mode=0o700, parents=True, exist_ok=True)

    @contextmanager
    def lock(self, operation_id):
        file = self.root / (sha(operation_id)+'.json')
        lock = str(file)+'.lock'
        fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
        try:
            value = json.loads(file.read_text('utf-8')) if file.exists() else None
            def save(state):
                temp = str(file)+'.tmp'
                out = os.open(temp, os.O_CREAT | os.O_TRUNC | os.O_WRONLY, 0o600)
                with os.fdopen(out,'w',encoding='utf-8') as f:
                    f.write(canonical(state)); f.flush(); os.fsync(f.fileno())
                os.replace(temp,file)
                if os.name != 'nt':
                    d = os.open(self.root,os.O_RDONLY)
                    try: os.fsync(d)
                    finally: os.close(d)
            yield value, save
        finally:
            os.close(fd)
            os.unlink(lock)


class AcqPathClient:
    def __init__(self, *, signer, expected, public_jwk, store, transport=None, allow_payment=False):
        self.signer, self.expected, self.key, self.store = signer, expected, public_jwk, store
        self.transport = transport or httpx.AsyncHTTPTransport()
        self.allow_payment = allow_payment

    async def post(self, url, *, json: dict, operation_id: str):
        need(url == self.expected['origin']+PATH and 0 < len(operation_id) <= 128, 'CANONICAL_OPERATION_REQUIRED')
        body = normalize(json)
        with self.store.lock(operation_id) as (saved,save):
            state = saved or dict(version=1,origin=self.expected['origin'],body=body,key=secrets.token_hex(32),status='NEW')
            need(state['version'] == 1 and state['origin'] == self.expected['origin'] and state['body'] == body, 'OPERATION_INPUT_MISMATCH')
            headers = {'content-type':'application/json',CONTEXT:state['key']}
            def request(extra=None):
                return httpx.Request('POST',url,headers={**headers,**(extra or {})},content=canonical(body).encode())
            async def send(req):
                payment_header = req.headers.get('payment-signature')
                if not payment_header:
                    res = await self.transport.handle_async_request(req)
                    await res.aread()
                    if res.status_code == 402:
                        ch = unb64(res.headers['payment-required'])
                        review_offer(ch,state,self.expected,self.key)
                        state.update(challenge=ch,status='PREPARED');save(state)
                        need(self.allow_payment,'PAYMENT_OPT_IN_REQUIRED')
                    return res
                need(self.allow_payment and 'challenge' in state,'PAYMENT_OPT_IN_REQUIRED')
                p = unb64(payment_header)
                state.update(paymentHeader=payment_header,status='AUTHORIZED');save(state)
                # Only unsigned fields are sent until the server reserves this nonce.
                res = await self.transport.handle_async_request(request({PREBIND:b64(dict(accepted=p['accepted'],authorization=p['payload']['authorization']))}))
                await res.aread()
                if res.status_code != 402: return res
                challenge = unb64(res.headers['payment-required'])
                need(challenge['error'] == 'SIWX_PAYMENT_BINDING_REQUIRED','NO_NEW_PAYMENT')
                info = review_siwx(challenge['extensions']['sign-in-with-x'],state,p,self.expected)
                proof = await create_siwx_payload(info,self.signer,url)
                need(proof.address.lower() == p['payload']['authorization']['from'].lower(),'SIWX_PAYER')
                state.update(siwxHeader=b64(proof.model_dump(by_alias=True,exclude_none=True)),status='SUBMITTING');save(state)
                return await self.transport.handle_async_request(request({'PAYMENT-SIGNATURE':payment_header,SIWX:state['siwxHeader']}))
            if state.get('paymentHeader'):
                need(self.allow_payment, 'PAYMENT_OPT_IN_REQUIRED')
                review_offer(state['challenge'],state,self.expected,self.key,check_time=False)
                req = request({'PAYMENT-SIGNATURE':state['paymentHeader'],**({SIWX:state['siwxHeader']} if state.get('siwxHeader') else {})})
                res = await self.transport.handle_async_request(req) if state.get('siwxHeader') else await send(req)
            else:
                save(state)
                client = x402Client().register('eip155:*',ExactEvmScheme(signer=self.signer))
                res = await x402AsyncTransport(client,httpx.MockTransport(send)).handle_async_request(request())
            await res.aread()
            if res.status_code == 200:
                result = res.json()
                if result.get('available') is False:
                    need(result['charge_micro'] == '0','UNPAID_RESULT_INVALID')
                else:
                    verify_delivery(result,state,self.expected,self.key)
                    state.update(status='DELIVERED');save(state)
            return res

    async def aclose(self):
        await self.transport.aclose()

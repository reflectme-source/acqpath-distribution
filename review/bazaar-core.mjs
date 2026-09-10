// Owner-authorized PHASE 3 review. Run only against an isolated source copy.
import test from 'node:test';
import assert from 'node:assert/strict';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
const root=resolve('.local/phase3/core');
const moduleAt=p=>import(pathToFileURL(join(root,p)));
const {rightsRuntime,quote,challenge,payment,redeem,input,mockSource,xml}=await moduleAt('tests/support/rights.mjs');
const {parsePayment,Facilitator,challengeFor}=await moduleAt('src/payments/x402.mjs');
const {base64JSON}=await moduleAt('src/lib/crypto.mjs');
// Synthetic WebCrypto evidence keys are created by the test fixture. No wallet exists.
globalThis.fetch=async()=>{throw Error('NETWORK_FORBIDDEN_IN_CORE_REVIEW');};
const fixed={PAYMENT_MODE:'testnet',PAY_TO:'0xf69DBbd053fb0Fbc78ADfdB1BFe3b0D1F57300ec',RIGHTS_FEE_MICRO:'20000',RIGHTS_DEEP_FEE_MICRO:'50000',NATIVE_RIGHTS_ONLY:'true'};
const protectedSnapshot=env=>Object.fromEntries(Object.keys(fixed).map(k=>[k,env[k]]));
async function fixture(fn,extra={}){const r=await rightsRuntime({env:{...fixed,...extra}});try{await fn(r);}finally{r.close();}}

test('Existing quote and unpaid 402 preserve all five explicit protected settings',()=>fixture(async r=>{
 const before=protectedSnapshot(r.env);const q=await (await quote(r)).json();assert.equal(q.available,true);
 const missing=await r.fetch(q.redeem_url);assert.equal(missing.status,401);assert.equal(missing.headers.has('PAYMENT-REQUIRED'),false);
 const wrong=await r.fetch(q.redeem_url,{headers:{'X-AcqPath-Claim':'invalid'}});assert.equal(wrong.status,401);
 const {res,ch}=await challenge(r,q);assert.equal(res.status,402);assert.equal(res.headers.get('cache-control'),'no-store');assert.deepEqual(await res.json(),ch);
 assert.equal(ch.x402Version,2);assert.equal(ch.extensions.bazaar,undefined);
 assert.deepEqual(ch.accepts,[{scheme:'exact',network:'eip155:84532',amount:'20000',asset:'0x036CbD53842c5426634e7929541eC2318f3dCF7e',payTo:fixed.PAY_TO,maxTimeoutSeconds:120,extra:{name:'USDC',version:'2'}}]);
 assert.equal(JSON.stringify(ch).includes(q.claim_token),false);assert.deepEqual(protectedSnapshot(r.env),before);
}));

test('Both tiers preserve exact mainnet terms in a LOCAL fixture',()=>fixture(async r=>{
 for(const [tier,amount] of [['fresh','20000'],['deep','50000']]){
  const q=await (await quote(r,{...input,tier})).json();assert.equal(q.fee_micro,amount);
  const ch=challengeFor({...r.env,PAYMENT_MODE:'live',DEPLOYMENT:'production',LIVE_APPROVED:'true',RELEASE_EVIDENCE_SHA256:'f'.repeat(64),FACILITATOR_URL:'https://api.cdp.coinbase.com/platform/v2/x402'},q.quote_id,q.fee_micro);
  assert.deepEqual(ch.accepts,[{scheme:'exact',network:'eip155:8453',amount,asset:'0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',payTo:fixed.PAY_TO,maxTimeoutSeconds:120,extra:{name:'USD Coin',version:'2'}}]);
 }
 assert.deepEqual(protectedSnapshot(r.env),fixed);
 // No redemption / verify / settlement in this mainnet-labelled fixture.
 assert.equal(r.facilitator.calls,0);
}));

test('A catalog template cannot retrieve a report and no claim can be replaced by metadata',()=>fixture(async r=>{
 const q=await (await quote(r)).json();
 assert.equal((await r.fetch('/v1/rights/reports/:quote_id')).status,404);
 assert.equal((await r.fetch('/v1/rights/reports/'+'0'.repeat(48))).status,404);
 const {ch}=await challenge(r,q);const offer=ch.extensions['offer-receipt'].info.offers[0];
 const decoded=JSON.parse(Buffer.from(offer.signature.split('.')[1],'base64url').toString());
 assert.equal(decoded.resourceUrl,q.redeem_url);
 const payload=payment(ch);payload.resource={...ch.resource,url:r.env.APP_ORIGIN+'/v1/rights/reports/:quote_id'};
 assert.throws(()=>parsePayment(base64JSON(payload),ch),/resource/);
}));

test('Timeout and resource tampering are rejected; the original payment remains usable',()=>fixture(async r=>{
 const q=await (await quote(r)).json();const {ch}=await challenge(r,q);
 const p=payment(ch);p.accepted={...p.accepted,maxTimeoutSeconds:121};assert.throws(()=>parsePayment(base64JSON(p),ch),/maxTimeoutSeconds/);
 assert.equal(parsePayment(base64JSON(payment(ch)),ch).accepted.maxTimeoutSeconds,120);
}));

test('Metadata-only opt-in would pass attacker Bazaar metadata to the facilitator unchanged',()=>fixture(async r=>{
 const q=await (await quote(r)).json();const {ch}=await challenge(r,q);const p=payment(ch);
 p.extensions={bazaar:{routeTemplate:'/api/admin/catalog-poison',info:{input:{type:'http',method:'GET'}},schema:{type:'object'}}};
 const accepted=parsePayment(base64JSON(p),ch);let captured;
 const f=new Facilitator(r.env);f.call=async(_path,body)=>{captured=body;return {isValid:true};};
 await f.verify(accepted,ch.accepts[0]);assert.deepEqual(captured.paymentPayload.extensions,p.extensions);
 // This proves an integration gap; Bazaar is currently undeclared and no catalog was called.
}));

test('Unpaid quote expiry and an old client retry do not create a second settlement',()=>fixture(async r=>{
 const q=await (await quote(r)).json();const {ch}=await challenge(r,q);const p=payment(ch);
 assert.equal((await redeem(r,q,p)).status,200);assert.equal((await redeem(r,q,p)).status,200);assert.equal(r.facilitator.calls,1);
 const q2=await (await quote(r)).json();const st=r.env.INTENTS.states.get(q2.quote_id).storage;const intent=await st.get('intent');intent.expires_at=Date.now()-1;await st.put('intent',intent);
 assert.equal((await redeem(r,q2)).status,410);assert.equal(r.facilitator.calls,1);
 const q3=await (await quote(r)).json();const {ch:ch3}=await challenge(r,q3);assert.equal((await redeem(r,q3,payment(ch3))).status,409);assert.equal(r.facilitator.calls,1);
}));

test('Unsupported origin and paid crawl remain rejected; provider routing and admin stay isolated',()=>fixture(async r=>{
 const before=r.sourceFetch.calls.length;assert.equal((await quote(r,{...input,resource:'https://unsupported.example.org/article'})).status,422);assert.equal(r.sourceFetch.calls.length,before);
 assert.equal((await quote(r,{...input,purpose:'crawl'})).status,400);
 assert.equal((await r.fetch('/v1/quote',{method:'POST',headers:{'content-type':'application/json'},body:'{}'})).status,503);
 const caps=await (await r.fetch('/v1/capabilities')).json();assert.equal(caps.features.quote,false);assert.equal(caps.features.paid_planning,false);
 assert.equal((await r.fetch('/api/admin/stats')).status,401);assert.deepEqual(protectedSnapshot(r.env),fixed);
}));

test('UNKNOWN remains a diagnostic outcome rather than permission',async()=>{
 const r=await rightsRuntime({env:fixed,fetch:mockSource({license:xml('<permits type="usage">unrecognized-purpose</permits>')})});
 try{const q=await (await quote(r)).json();assert.equal(q.available,true);assert.equal(q.decision_preview,'UNKNOWN');assert.equal(q.legal_clearance,false);}finally{r.close();}
});

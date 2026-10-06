import test from 'node:test';
import assert from 'node:assert/strict';
import {makeEvidenceRequest,createEvidenceResolver,createAcqPathProvider,normalizeAcqPathPurchaseResult,mapAcqPathDecision,createWebhookProfile,toPolicyInput,asEvidenceProvider,DEFAULT_ACQPATH_EVIDENCE_KEY} from '../packages/evidence-bridge/index.mjs';
import {EVIDENCE_KEY} from '../packages/rights-client/index.mjs';

const resource='https://example.com/article';
function canonical(value){if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';return '{'+Object.keys(value).sort().filter(key=>value[key]!==undefined).map(key=>JSON.stringify(key)+':'+canonical(value[key])).join(',')+'}';}
function hex(bytes){return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');}
function request(){return makeEvidenceRequest({resource,purpose:'ai-index',context:{tool_name:'fetch_url'}});}

async function signedPurchase(decision='ALLOW_DECLARED',reportOverrides={}){
 const pair=await crypto.subtle.generateKey('Ed25519',true,['sign','verify']);
 const publicJwk=await crypto.subtle.exportKey('jwk',pair.publicKey);
 const signed={
  quote_id:'a'.repeat(48),
  report:{resource,purpose:'ai-index',user_class:'commercial',geo:null,legal_clearance:false,decision,declaration_count:1,observed_at:'2026-10-06T08:00:00Z',...reportOverrides},
  billing:{fee_type:'rights_preflight_report',amount_micro:'20000'}
 };
 const signature=hex(await crypto.subtle.sign('Ed25519',pair.privateKey,new TextEncoder().encode(canonical(signed))));
 return {publicJwk,purchase:{status:'DELIVERED',result:{...signed,evidence:{algorithm:'Ed25519',format:'acqpath-evidence-v1',payload:signed,signature},payment_settlement:{success:true},delivery_proof:{format:'test-only'}}}};
}

test('request requires explicit purpose and never infers it from tool name',()=>{
 assert.throws(()=>makeEvidenceRequest({resource,context:{tool_name:'fetch_url'}}),/PURPOSE_REQUIRED/);
 assert.equal(request().intended_use.purpose,'ai-index');
});

test('AcqPath evidence key stays pinned to the reviewed rights client key',()=>{
 assert.deepEqual(DEFAULT_ACQPATH_EVIDENCE_KEY,EVIDENCE_KEY);
});

test('AcqPath decisions normalize to evidence statements, not authorization verdicts',()=>{
 assert.equal(mapAcqPathDecision('ALLOW_DECLARED'),'declared_permitted');
 assert.equal(mapAcqPathDecision('DENY_DECLARED'),'declared_prohibited');
 assert.equal(mapAcqPathDecision('LICENSE_REQUIRED'),'license_required');
 assert.equal(mapAcqPathDecision('UNKNOWN'),'unknown');
});

test('signed AcqPath delivery is independently verified and normalized',async()=>{
 const f=await signedPurchase('ALLOW_DECLARED');
 const result=await normalizeAcqPathPurchaseResult(request(),f.purchase,{publicEvidenceKey:f.publicJwk});
 assert.equal(result.status,'resolved');
 assert.equal(result.evidence[0].statement,'declared_permitted');
 assert.equal(result.evidence[0].verification.status,'verified');
 assert.match(result.evidence[0].provenance.evidence_ref,/^urn:acqpath:evidence:sha256:[a-f0-9]{64}$/);
 assert.equal('decision' in result,false);
});

test('tampered evidence signature is invalid',async()=>{
 const f=await signedPurchase();
 f.purchase.result.evidence.signature='00'+f.purchase.result.evidence.signature.slice(2);
 const result=await normalizeAcqPathPurchaseResult(request(),f.purchase,{publicEvidenceKey:f.publicJwk});
 assert.equal(result.status,'invalid');
 assert.equal(result.error.code,'INVALID_EVIDENCE_SIGNATURE');
});

test('resource binding mismatch is invalid even with a valid signature',async()=>{
 const f=await signedPurchase('ALLOW_DECLARED',{resource:'https://example.com/other'});
 const result=await normalizeAcqPathPurchaseResult(request(),f.purchase,{publicEvidenceKey:f.publicJwk});
 assert.equal(result.status,'invalid');
 assert.equal(result.error.code,'REPORT_BINDING_MISMATCH');
});

test('signed payload mismatch is rejected even when the original signature is valid',async()=>{
 const f=await signedPurchase('ALLOW_DECLARED');
 f.purchase.result.report={...f.purchase.result.report,decision:'DENY_DECLARED'};
 const result=await normalizeAcqPathPurchaseResult(request(),f.purchase,{publicEvidenceKey:f.publicJwk});
 assert.equal(result.status,'invalid');
 assert.equal(result.error.code,'SIGNED_PAYLOAD_MISMATCH');
});

test('semantic UNKNOWN differs from provider UNAVAILABLE',async()=>{
 const f=await signedPurchase('UNKNOWN');
 const semantic=await normalizeAcqPathPurchaseResult(request(),f.purchase,{publicEvidenceKey:f.publicJwk});
 const down=await normalizeAcqPathPurchaseResult(request(),{status:'UNAVAILABLE',quote:{reason:'source unavailable'}},{publicEvidenceKey:f.publicJwk});
 assert.equal(semantic.status,'resolved');
 assert.equal(semantic.evidence[0].statement,'unknown');
 assert.equal(down.status,'unavailable');
 assert.equal(down.evidence.length,0);
});

test('unsupported purpose is rejected before provider call',async()=>{
 let called=false;
 const provider=createAcqPathProvider({resolvePurchase:async()=>{called=true;return {status:'UNAVAILABLE'};}});
 const result=await provider.resolve(makeEvidenceRequest({resource,purpose:'crawl'}));
 assert.equal(result.status,'unsupported');
 assert.equal(called,false);
});

test('webhook profile changes field mapping but keeps decision ownership local',async()=>{
 const f=await signedPurchase('ALLOW_DECLARED');
 const provider=createAcqPathProvider({publicEvidenceKey:f.publicJwk,resolvePurchase:async()=>f.purchase});
 const resolver=createEvidenceResolver({provider});
 const webhook=createWebhookProfile({resolver,mapping:{resourcePath:'arguments.url',purposePath:'context.intended_purpose',contextPath:'context'},decide:({resolution})=>({decision:'review',reason:resolution.evidence[0].statement})});
 const out=await webhook.handle({arguments:{url:resource},context:{intended_purpose:'ai-index',tool_name:'fetch_url'}});
 assert.equal(out.decision,'review');
 assert.equal(out.reason,'declared_permitted');
});

test('policy-input profile uses an explicit reproducible clock',async()=>{
 const f=await signedPurchase('DENY_DECLARED');
 const resolution=await normalizeAcqPathPurchaseResult(request(),f.purchase,{publicEvidenceKey:f.publicJwk});
 assert.throws(()=>toPolicyInput(resolution,{}),/EVALUATED_AT_REQUIRED/);
 const input=toPolicyInput(resolution,{evaluatedAt:'2026-10-06T09:00:00Z'});
 assert.equal(input.evaluated_at,'2026-10-06T09:00:00Z');
 assert.equal(input.source_rights.statement.value,'declared_prohibited');
 assert.equal(input.source_rights.statement.asserted_at,'2026-10-06T08:00:00Z');
});

test('extension profile exposes the same provider-neutral resolve contract',async()=>{
 const f=await signedPurchase('LICENSE_REQUIRED');
 const provider=createAcqPathProvider({publicEvidenceKey:f.publicJwk,resolvePurchase:async()=>f.purchase});
 const resolver=createEvidenceResolver({provider});
 const extension=asEvidenceProvider(resolver);
 const result=await extension.resolve(request());
 assert.equal(result.evidence[0].statement,'license_required');
});

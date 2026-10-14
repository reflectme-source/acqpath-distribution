import test from 'node:test';
import assert from 'node:assert/strict';
import {createLangfuseEvidenceAdapter} from '../examples/langfuse-evidence.mjs';
import {makeResolution} from '../packages/evidence-bridge/index.mjs';

const resource='https://medium.com/public-article';
const NOW='2026-10-14T12:00:00Z';
const DIGEST='urn:acqpath:evidence:sha256:'+'a'.repeat(64);
const clock=()=>new Date(NOW);

// These are synthetic NORMALIZED fixtures, not forged claims about live receipts.
// The production provider must use createAcqPathProvider for cryptographic verification.
function fixture(request,{
  statement='unknown',expiresAt='2026-10-15T12:00:00Z',
  ref=DIGEST,resourceOverride=null,observedAt='2026-10-14T11:00:00Z',
  verification='verified'
}={}){
  return makeResolution({request,status:'resolved',evidence:[{
    schema:'rights-evidence.v1',
    kind:'source_rights_declaration',
    statement,
    resource:resourceOverride||request.resource,
    intended_use:{purpose:request.intended_use.purpose},
    provenance:{provider:'synthetic-test-only',observed_at:observedAt,
      expires_at:expiresAt,evidence_ref:ref},
    verification:{status:verification,algorithm:'Ed25519'}
  }]});
}
function harness(extra={}){
  const updates=[],scores=[],audits=[],names=[];
  const tracing=async (name,callback)=>{
    names.push(name);
    return callback({update:payload=>updates.push(payload)});
  };
  const scoreClient={score:{activeObservation:score=>scores.push(score)}};
  const adapter=createLangfuseEvidenceAdapter({
    startActiveObservation:tracing,
    scoreClient,now:clock,onAudit:entry=>audits.push(entry),...extra
  });
  return {adapter,updates,scores,audits,names};
}

test('shadow mode cannot call the paid resolver or fabricate an observed report',async()=>{
  let paid=0;
  const {adapter,updates,scores,audits}=harness({
    resolver:{async resolve(){paid++;throw Error('unexpected purchase');}}
  });
  const result=await adapter.record({resource,purpose:'ai-index'});
  assert.equal(paid,0);
  assert.equal(result.status,'unavailable');
  assert.equal(result.error.code,'PAID_BUYER_DISABLED_SHADOW_ONLY');
  assert.equal(updates[0].metadata.acqpathMode,'shadow_no_purchase');
  assert.equal(updates[0].metadata.acqpathEvidenceVerified,false);
  assert.equal(scores.length,0,'Shadow counts must not contaminate real evidence scores');
  assert.equal(audits.length,1);
  assert.equal(adapter.metrics().accepted,1);
  assert.equal(adapter.metrics().pending,0);
});

test('paid resolver output is mapped to bounded evidence metadata and observation scores',async()=>{
  const {adapter,updates,scores,names,audits}=harness({
    paidBuyerApproved:true,resolver:{resolve:async request=>fixture(request,{statement:'declared_prohibited'})}
  });
  const result=await adapter.record({resource,purpose:'ai-index'});
  assert.equal(result.status,'resolved');
  assert.deepEqual(names,['acqpath-rights-observation']);
  const metadata=updates[0].metadata;
  assert.equal(metadata.acqpathStatus,'resolved');
  assert.equal(metadata.acqpathStatement,'declared_prohibited');
  assert.equal(metadata.acqpathEvidenceRef,DIGEST);
  assert.equal(metadata.acqpathFreshness,'fresh');
  assert.equal(metadata.acqpathPurpose,'ai-index');
  assert.deepEqual(scores.map(x=>[x.name,x.value,x.dataType]),[
    ['acqpath_evidence_verified',1,'BOOLEAN'],
    ['acqpath_evidence_fresh',1,'BOOLEAN']
  ]);
  assert.equal(audits[0].schema,'acqpath.langfuse-observe.v1');
  assert.equal(JSON.stringify({updates,audits,scores}).includes(resource),false,
    'Never put raw source URL in telemetry');
  assert.equal('allow' in metadata,false);
});

test('semantic unknown is still verified evidence and never permission',async()=>{
  const {adapter,updates,scores}=harness({
    paidBuyerApproved:true,resolver:{resolve:async r=>fixture(r,{statement:'unknown'})}
  });
  await adapter.record({resource,purpose:'ai-input'});
  assert.equal(updates[0].metadata.acqpathStatement,'unknown');
  assert.equal(updates[0].metadata.acqpathEvidenceVerified,true);
  assert.equal(scores[0].value,1);
  assert.equal('permission' in updates[0].metadata,false);
});

test('expired evidence receives a zero freshness score, without permitting use',async()=>{
  const {adapter,updates,scores}=harness({
    paidBuyerApproved:true,
    resolver:{resolve:async r=>fixture(r,{expiresAt:'2026-10-13T00:00:00Z'})}
  });
  await adapter.record({resource,purpose:'search'});
  assert.equal(updates[0].metadata.acqpathFreshness,'expired');
  assert.equal(scores.find(s=>s.name==='acqpath_evidence_fresh').value,0);
});

test('unknown expiration never becomes a fresh score',async()=>{
  const {adapter,updates,scores}=harness({
    paidBuyerApproved:true,resolver:{resolve:async r=>fixture(r,{expiresAt:null})}
  });
  await adapter.record({resource,purpose:'ai-train'});
  assert.equal(updates[0].metadata.acqpathFreshness,'unknown');
  assert.equal(scores.length,1);
});

test('mismatched or unsigned normalized reports are invalid, not verified',async()=>{
  const cases=[
    {resourceOverride:'https://medium.com/different'},
    {verification:'unverified'},
    {ref:'https://signed.example.com/?token=secret'},
    {observedAt:null}
  ];
  for(const opts of cases){
    const {adapter,updates,scores}=harness({
      paidBuyerApproved:true,resolver:{resolve:async r=>fixture(r,opts)}
    });
    const result=await adapter.record({resource,purpose:'ai-index'});
    assert.equal(result.status,'invalid');
    assert.equal(updates[0].metadata.acqpathEvidenceVerified,false);
    assert.equal(scores[0].value,0);
    assert.equal(JSON.stringify(updates).includes('token=secret'),false);
  }
});

test('resolver errors and malformed data remain unavailable or invalid',async()=>{
  const a=harness({paidBuyerApproved:true,resolver:{resolve:async()=>{throw Error('secret provider error');}}});
  const b=harness({paidBuyerApproved:true,resolver:{resolve:async()=>({oops:1})}});
  const r1=await a.adapter.record({resource,purpose:'ai-index'});
  const r2=await b.adapter.record({resource,purpose:'ai-index'});
  assert.equal(r1.status,'unavailable');
  assert.equal(r2.status,'invalid');
  assert.equal(JSON.stringify(a.updates).includes('secret provider error'),false);
});

test('unsafe, private, credential and query URLs are rejected before paid resolver',async()=>{
  let paid=0;
  const {adapter}=harness({paidBuyerApproved:true,resolver:{resolve:async()=>{paid++;}}});
  const bad=[
    'http://medium.com/story','https://127.0.0.1/story',
    'https://localhost/story','https://internal.local/story',
    'https://169.254.169.254/meta',
    'https://user:password@medium.com/story',
    'https://medium.com/story?access_token=secret',
    'https://medium.com/story#fragment','https://medium.com:444/story',
    'file:///etc/passwd'
  ];
  for(const url of bad)
    await assert.rejects(adapter.record({resource:url,purpose:'ai-input'}),/INVALID_OR_UNSAFE_SOURCE_URL/);
  await assert.rejects(adapter.record({resource,purpose:'crawl'}),/EXPLICIT_SUPPORTED_PURPOSE_REQUIRED/);
  assert.equal(paid,0);
  assert.equal(adapter.metrics().accepted,0);
});

test('bounded local event count prevents further resolver calls',async()=>{
  let calls=0;
  const {adapter}=harness({
    maxEvents:1,paidBuyerApproved:true,
    resolver:{resolve:async r=>{calls++;return fixture(r);}}
  });
  const a=await adapter.record({resource,purpose:'ai-index'});
  const b=await adapter.record({resource,purpose:'ai-index'});
  assert.equal(a.status,'resolved');
  assert.equal(b.status,'unavailable');
  assert.equal(b.error.code,'LOCAL_OBSERVE_CAP_REACHED');
  assert.equal(calls,1);
  assert.equal(adapter.metrics().dropped,1);
});

test('in-flight cap avoids unbounded concurrent paid observations',async()=>{
  let release;
  let calls=0;
  const waiting=new Promise(resolve=>{release=resolve;});
  const {adapter}=harness({
    maxInFlight:1,paidBuyerApproved:true,
    resolver:{resolve:async r=>{calls++;await waiting;return fixture(r);}}
  });
  const first=adapter.record({resource,purpose:'ai-index'});
  const second=await adapter.record({resource,purpose:'ai-index'});
  assert.equal(second.error.code,'LOCAL_OBSERVE_CAP_REACHED');
  release();
  assert.equal((await first).status,'resolved');
  assert.equal(calls,1);
  assert.equal(adapter.metrics().pending,0);
});

test('telemetry, score and audit failure cannot change evidence resolution',async()=>{
  const adapter=createLangfuseEvidenceAdapter({
    startActiveObservation:async(name,cb)=>cb({update(){throw Error('telemetry fail');}}),
    scoreClient:{score:{activeObservation(){throw Error('score fail');}}},
    onAudit:async()=>{throw Error('audit fail');},
    now:clock,paidBuyerApproved:true,
    resolver:{resolve:async r=>fixture(r)}
  });
  const result=await adapter.record({resource,purpose:'ai-index'});
  assert.equal(result.status,'resolved');
});

test('trace initiation failure does not re-buy or lose already-obtained evidence',async()=>{
  let calls=0;
  const adapter=createLangfuseEvidenceAdapter({
    startActiveObservation:async()=>{throw Error('OTEL down');},
    now:clock,paidBuyerApproved:true,
    resolver:{resolve:async r=>{calls++;return fixture(r);}}
  });
  assert.equal((await adapter.record({resource,purpose:'ai-index'})).status,'resolved');
  assert.equal(calls,1);
});

test('configuration requires explicit limits and verified buyer boundary',()=>{
  assert.throws(()=>createLangfuseEvidenceAdapter({}),/LANGFUSE_TRACER_REQUIRED/);
  assert.throws(()=>harness({maxEvents:500}),/BOUNDED_OBSERVE_LIMITS_REQUIRED/);
  assert.throws(()=>harness({paidBuyerApproved:true}),/VERIFIED_PAID_RESOLVER_REQUIRED/);
  assert.throws(()=>harness({scoreClient:{}}),/LANGFUSE_SCORE_CLIENT_INVALID/);
});

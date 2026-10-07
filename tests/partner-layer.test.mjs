import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {makeEvidenceRequest,makeResolution} from '../packages/evidence-bridge/index.mjs';
import {runGatewayShadow} from '../examples/gateway-shadow.mjs';
import {enrichCrawlerResult} from '../examples/crawler-enrichment.mjs';
import {attachRagEvidence} from '../examples/rag-ingestion.mjs';
import {policyInputFromResolution} from '../examples/policy-engine-input.mjs';
import {parseShadowNdjson,summarizeShadowEvents,PROOF_SPRINT} from '../examples/shadow-report.mjs';
import {evaluateProofSprintFile} from '../examples/proof-sprint.mjs';
import {pagePath} from '../scripts/site.mjs';

const resource='https://example.com/article';
function verifiedResolution(purpose='ai-index',statement='declared_permitted'){
  const request=makeEvidenceRequest({resource,purpose,context:{}});
  return makeResolution({
    request,
    status:'resolved',
    evidence:[{
      schema:'rights-evidence.v1',
      kind:'source_rights_declaration',
      statement,
      resource,
      intended_use:{purpose},
      provenance:{provider:'AcqPath',observed_at:'2026-10-07T08:00:00Z',expires_at:null,evidence_ref:'urn:acqpath:evidence:sha256:'+'a'.repeat(64)},
      verification:{status:'verified',algorithm:'Ed25519'},
      provider_details:{decision:'ALLOW_DECLARED',evidence_format:'acqpath-evidence-v1'}
    }],
    error:null
  });
}

test('gateway shadow never replaces the existing result and writes evidence in background',async()=>{
  const writes=[];let pending;
  const resolver={resolve:async()=>verifiedResolution()};
  const result=await runGatewayShadow({
    resource,purpose:'ai-index',resolver,
    existingCall:async()=>({status:'existing-ok'}),
    audit:{write:async event=>writes.push(event)},
    background:p=>{pending=p;}
  });
  assert.deepEqual(result,{status:'existing-ok'});
  await pending;
  assert.equal(writes.length,1);
  assert.equal(writes[0].resolution.status,'resolved');
});

test('crawler enrichment attaches provider-neutral evidence',async()=>{
  const resolver={resolve:async()=>verifiedResolution()};
  const out=await enrichCrawlerResult({result:{url:resource,markdown:'content'},resolver});
  assert.equal(out.markdown,'content');
  assert.equal(out.rightsEvidence.schema,'rights-evidence.resolution.v1');
  assert.equal(out.rightsEvidence.evidence[0].statement,'declared_permitted');
});

test('RAG adapter preserves document and attaches source_rights metadata',async()=>{
  const resolver={resolve:async()=>verifiedResolution()};
  const out=await attachRagEvidence({document:{source_url:resource,content:'doc',metadata:{id:'x'}},resolver});
  assert.equal(out.content,'doc');
  assert.equal(out.metadata.id,'x');
  assert.equal(out.metadata.source_rights.status,'resolved');
});

test('policy adapter keeps decision ownership outside AcqPath',()=>{
  const input=policyInputFromResolution(verifiedResolution('ai-index','license_required'),{evaluatedAt:'2026-10-07T09:00:00Z'});
  assert.equal(input.source_rights.statement.value,'license_required');
  assert.equal('decision' in input,false);
});

test('shadow report exposes evidence gaps and declaration changes',async()=>{
  const text=await readFile(new URL('../examples/shadow-events.ndjson',import.meta.url),'utf8');
  const report=summarizeShadowEvents(parseShadowNdjson(text));
  assert.equal(report.events,4);
  assert.equal(report.unique_resources,3);
  assert.equal(report.verified_evidence_events,3);
  assert.equal(report.evidence_gap_events,1);
  assert.equal(report.statement_changes,1);
  assert.equal(report.statements.license_required,2);
  assert.equal(report.strong_signal_count,3);
  assert.equal(report.commercial_verdict,'GO');
  assert.equal(PROOF_SPRINT.targetEvents,25);
  assert.equal(PROOF_SPRINT.hardCapEvents,50);
  assert.equal((await evaluateProofSprintFile(new URL('../examples/shadow-events.ndjson',import.meta.url))).commercial_verdict,'GO');
});

test('proof sprint decision gates stop long pilots',()=>{
  const permitted=Array.from({length:25},(_,i)=>({at:`2026-10-07T08:${String(i).padStart(2,'0')}:00Z`,resource, purpose:'ai-index',resolution:verifiedResolution()}));
  assert.equal(summarizeShadowEvents(permitted).commercial_verdict,'REVIEW');
  assert.equal(summarizeShadowEvents(permitted.slice(0,10),{runtimeHours:6}).commercial_verdict,'REVIEW');
  const unavailable=n=>Array.from({length:n},(_,i)=>({at:`2026-10-07T08:${String(i%60).padStart(2,'0')}:00Z`,resource,purpose:'ai-index',resolution:{schema:'rights-evidence.resolution.v1',status:'unavailable',request:{schema:'rights-evidence.request.v1',resource,intended_use:{purpose:'ai-index'},context:{}},evidence:[],error:{code:'PROVIDER_UNAVAILABLE'}}}));
  assert.equal(summarizeShadowEvents(unavailable(25)).commercial_verdict,'EXTEND');
  assert.equal(summarizeShadowEvents(unavailable(50)).commercial_verdict,'STOP_OR_FIX');
});

test('partner docs use nested safe paths and contain no rollout-demand copy',async()=>{
  assert.equal(pagePath('partners/integration-kit'),'/partners/integration-kit');
  assert.throws(()=>pagePath('partners/../private'));
  const pages=JSON.parse(await readFile(new URL('../metadata/site-pages.json',import.meta.url),'utf8'));
  for(const slug of ['partners','partners/proof-sprint','partners/shadow-mode','partners/integration-kit','partners/evidence-contract','partners/gateway','partners/crawler','partners/rag','partners/policy-engine']){
    assert.ok(pages.some(p=>p.slug===slug),slug);
  }
  const publicText=JSON.stringify(pages);
  assert.doesNotMatch(publicText,/organic demand|remain NOT CLAIMED|awaiting first external settlement|verified organic revenue|owner wallet/i);
});

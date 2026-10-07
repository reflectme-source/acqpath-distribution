import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const inc=(obj,key)=>{obj[key]=(obj[key]||0)+1;};
export const PROOF_SPRINT=Object.freeze({
  smokeEvents:3,
  minimumDecisionEvents:10,
  targetEvents:25,
  targetHours:6,
  hardCapEvents:50,
  hardCapHours:24
});

function elapsedHours(events){
  const times=events.map(event=>Date.parse(event?.at)).filter(Number.isFinite).sort((a,b)=>a-b);
  if(times.length<2)return 0;
  return Math.max(0,(times.at(-1)-times[0])/3600000);
}

export function summarizeShadowEvents(events,{runtimeHours=0}={}){
  if(!Array.isArray(events))throw Error('EVENTS_ARRAY_REQUIRED');
  if(!Number.isFinite(runtimeHours)||runtimeHours<0)throw Error('INVALID_RUNTIME_HOURS');
  const statuses={},statements={},resources=new Set(),lastStatement=new Map();
  let verifiedEvidenceEvents=0,evidenceGapEvents=0,statementChanges=0,riskStatementEvents=0;

  for(const event of events){
    if(!event||typeof event.resource!=='string'||typeof event.purpose!=='string'||!event.resolution)throw Error('INVALID_SHADOW_EVENT');
    resources.add(event.resource);
    const resolution=event.resolution;
    inc(statuses,String(resolution.status||'invalid'));
    const evidence=Array.isArray(resolution.evidence)?resolution.evidence:[];
    const verified=evidence.find(item=>item?.verification?.status==='verified');
    if(verified){
      verifiedEvidenceEvents++;
      const statement=String(verified.statement||'unknown');
      inc(statements,statement);
      if(['declared_prohibited','license_required','unknown'].includes(statement))riskStatementEvents++;
      const key=event.resource+'|'+event.purpose;
      const previous=lastStatement.get(key);
      if(previous&&previous!==statement)statementChanges++;
      lastStatement.set(key,statement);
    }else evidenceGapEvents++;
  }

  const total=events.length;
  const hours=Math.max(elapsedHours(events),runtimeHours);
  const verifiedRate=total?verifiedEvidenceEvents/total:0;
  const strongSignals=riskStatementEvents+statementChanges;
  let commercialVerdict='COLLECT_MORE';
  let nextAction='Collect at least 3 eligible events to prove the integration path.';

  if(total>=PROOF_SPRINT.smokeEvents){
    commercialVerdict='INTEGRATION_PROVEN';
    nextAction='Continue to the decision gate unless a strong rights signal appears first.';
  }
  if(strongSignals>0){
    commercialVerdict='GO';
    nextAction='A material rights or drift signal was observed. Review the examples and move to paid attach volume if the evidence field is useful to the buyer.';
  }else if(total>=PROOF_SPRINT.minimumDecisionEvents&&(total>=PROOF_SPRINT.targetEvents||hours>=PROOF_SPRINT.targetHours)){
    if(verifiedRate>=0.5){
      commercialVerdict='REVIEW';
      nextAction='Verified evidence is present but no material risk/drift signal appeared. Compare these evidence fields with the buyer\'s existing audit trail; scale if they are additive.';
    }else if(total<PROOF_SPRINT.hardCapEvents&&hours<PROOF_SPRINT.hardCapHours){
      commercialVerdict='EXTEND';
      nextAction='Evidence yield is inconclusive. Extend only to the hard cap of 50 events or 24 hours; do not run a long pilot.';
    }else{
      commercialVerdict='STOP_OR_FIX';
      nextAction='The hard cap was reached without enough verified evidence. Stop the sprint or fix eligibility/integration before spending more.';
    }
  }else if(total>=PROOF_SPRINT.hardCapEvents||hours>=PROOF_SPRINT.hardCapHours){
    commercialVerdict='STOP_OR_FIX';
    nextAction='The hard cap was reached before a useful decision signal. Stop or fix eligibility/integration.';
  }

  return {
    schema:'acqpath.shadow-report.v2',
    proof_sprint:PROOF_SPRINT,
    events:total,
    elapsed_hours:Number(hours.toFixed(2)),
    unique_resources:resources.size,
    verified_evidence_events:verifiedEvidenceEvents,
    verified_evidence_rate:Number(verifiedRate.toFixed(4)),
    evidence_gap_events:evidenceGapEvents,
    risk_statement_events:riskStatementEvents,
    statement_changes:statementChanges,
    strong_signal_count:strongSignals,
    statuses,
    statements,
    commercial_verdict:commercialVerdict,
    next_action:nextAction
  };
}

export function parseShadowNdjson(text){
  return String(text).split(/\r?\n/).filter(line=>line.trim()).map((line,index)=>{
    try{return JSON.parse(line);}catch{throw Error('INVALID_NDJSON_LINE_'+(index+1));}
  });
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const file=process.argv[2];
  if(!file)throw Error('USAGE: node examples/shadow-report.mjs events.ndjson');
  const report=summarizeShadowEvents(parseShadowNdjson(await readFile(file,'utf8')));
  console.log(JSON.stringify(report,null,2));
}

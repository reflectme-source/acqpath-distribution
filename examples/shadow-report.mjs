import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const inc=(obj,key)=>{obj[key]=(obj[key]||0)+1;};

export function summarizeShadowEvents(events){
  if(!Array.isArray(events))throw Error('EVENTS_ARRAY_REQUIRED');
  const statuses={},statements={},resources=new Set(),lastStatement=new Map();
  let verifiedEvidenceEvents=0,evidenceGapEvents=0,statementChanges=0;

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
      const key=event.resource+'|'+event.purpose;
      const previous=lastStatement.get(key);
      if(previous&&previous!==statement)statementChanges++;
      lastStatement.set(key,statement);
    }else{
      evidenceGapEvents++;
    }
  }

  return {
    schema:'acqpath.shadow-report.v1',
    events:events.length,
    unique_resources:resources.size,
    verified_evidence_events:verifiedEvidenceEvents,
    evidence_gap_events:evidenceGapEvents,
    statement_changes:statementChanges,
    statuses,
    statements
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

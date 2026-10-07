import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {parseShadowNdjson,summarizeShadowEvents} from './shadow-report.mjs';

const terminal=new Set(['GO','REVIEW','STOP_OR_FIX']);

export async function evaluateProofSprintFile(file,{runtimeHours=0}={}){
  const text=await readFile(file,'utf8');
  return summarizeShadowEvents(parseShadowNdjson(text),{runtimeHours});
}

export async function watchProofSprint(file,{intervalMs=2000,onProgress=console.log}={}){
  let lastCount=-1;
  const startedAt=Date.now();
  for(;;){
    let report;
    const runtimeHours=(Date.now()-startedAt)/3600000;
    try{report=await evaluateProofSprintFile(file,{runtimeHours});}
    catch(e){
      if(e?.code==='ENOENT'){await new Promise(r=>setTimeout(r,intervalMs));continue;}
      throw e;
    }
    if(report.events!==lastCount){
      lastCount=report.events;
      onProgress(JSON.stringify({
        events:report.events,
        verified:report.verified_evidence_events,
        strong_signals:report.strong_signal_count,
        verdict:report.commercial_verdict
      }));
    }
    if(terminal.has(report.commercial_verdict))return report;
    await new Promise(r=>setTimeout(r,intervalMs));
  }
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const file=process.argv[2];
  if(!file)throw Error('USAGE: node examples/proof-sprint.mjs events.ndjson');
  const report=await watchProofSprint(file);
  console.log(JSON.stringify(report,null,2));
}

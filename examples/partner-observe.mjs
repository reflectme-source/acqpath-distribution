// Generic, source-only example. NO payment logic, API key, wallet or network call.
import {isIP} from 'node:net';
import {makeEvidenceRequest,makeResolution} from '../packages/evidence-bridge/index.mjs';

const purposes=new Set(['ai-input','ai-index','ai-train','search']);
const plain=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
function eligibleUrl(value){
  if(typeof value!=='string'||value.length>2048)return false;
  try{
    const u=new URL(value);
    const host=u.hostname.toLowerCase().replace(/\.$/,'');
    return u.protocol==='https:'&&!u.username&&!u.password&&!u.search&&!u.hash&&
      (!u.port||u.port==='443')&&!value.includes('\\')&&isIP(host)===0&&host.includes('.')&&
      !['localhost','metadata.google.internal'].includes(host)&&
      !['.local','.localhost','.internal','.test','.invalid','.example'].some(x=>host.endsWith(x));
  }catch{return false;}
}
const scrub=resolution=>{
  if(!plain(resolution)||resolution.schema!=='rights-evidence.resolution.v1')throw Error('UNVERIFIED_RESOLVER_CONTRACT');
  if(!['resolved','unavailable','unsupported','invalid'].includes(resolution.status))throw Error('INVALID_PROVIDER_STATUS');
  // A resolver reporting signed evidence must have VERIFIED it before this boundary.
  if(resolution.status==='resolved'&&(!Array.isArray(resolution.evidence)||!resolution.evidence.length||
     !resolution.evidence.every(e=>e?.verification?.status==='verified')))
    throw Error('UNVERIFIED_EVIDENCE');
  return resolution;
};

/*
 * Observe-only sidecar. Partner owns policy and tool execution.
 * paidBuyerApproved is false by default; even when true, the injected resolver
 * must separately enforce payment consent, spending limits and signed verification.
 */
export function createPartnerObserve({
  toolNames, configuredDefaultPurpose=null, resolver, audit, background,
  paidBuyerApproved=false, maxEvents=50, maxPending=16, now=()=>new Date()
}={}){
  if(!Array.isArray(toolNames)||!toolNames.length||toolNames.some(t=>typeof t!=='string'||!t.trim()))
    throw Error('EXPLICIT_TOOL_ALLOWLIST_REQUIRED');
  if(configuredDefaultPurpose!==null&&!purposes.has(configuredDefaultPurpose))throw Error('UNSUPPORTED_DEFAULT_PURPOSE');
  if(!resolver||typeof resolver.resolve!=='function')throw Error('TRUSTED_RESOLVER_REQUIRED');
  if(!audit||typeof audit.write!=='function')throw Error('LOCAL_AUDIT_WRITER_REQUIRED');
  if(background!==undefined&&typeof background!=='function')throw Error('BAD_BACKGROUND_HOOK');
  if(typeof paidBuyerApproved!=='boolean')throw Error('PAID_BUYER_POLICY_REQUIRED');
  if(!Number.isInteger(maxEvents)||maxEvents<1||maxEvents>50||
     !Number.isInteger(maxPending)||maxPending<1||maxPending>64)throw Error('BOUNDED_OBSERVE_QUOTA_REQUIRED');
  const allowed=new Set(toolNames),pending=new Set();
  let accepted=0,ignored=0,dropped=0;

  async function call({name,arguments:args,execute}={}){
    if(typeof execute!=='function')throw Error('EXISTING_EXECUTION_REQUIRED');
    // Existing action remains authoritative and runs exactly once regardless of evidence.
    const original=Promise.resolve().then(()=>execute(args));
    let request=null,purposeSource=null,reason=null;
    if(!allowed.has(name)||!plain(args)){reason='TOOL_NOT_ELIGIBLE';}
    else {
      const resource=args.resource??args.url;
      const explicit=args.purpose??args.intended_use?.purpose;
      const purposeSourceCandidate=explicit===undefined?'configured_default':'explicit';
      const purpose=explicit===undefined?configuredDefaultPurpose:explicit;
      if(!eligibleUrl(resource))reason='UNSAFE_OR_NONPUBLIC_URL';
      else if(!purposes.has(purpose))reason='PURPOSE_NOT_DECLARED';
      else {
        purposeSource=purposeSourceCandidate;
        request=makeEvidenceRequest({resource,purpose,context:{
          adoption_mode:'observe',purpose_source:purposeSource,tool_name:name
        }});
      }
    }

    if(!request){ignored++;}
    else if(accepted>=maxEvents||pending.size>=maxPending){dropped++;reason='SHADOW_CAP_REACHED';}
    else {
      accepted++;
      let job;
      job=Promise.resolve().then(async()=>{
        let resolution;
        if(!paidBuyerApproved){
          resolution=makeResolution({request,status:'unavailable',error:{code:'PAID_BUYER_DISABLED_SHADOW_ONLY'}});
        }else{
          try {resolution=scrub(await resolver.resolve(request));}
          catch {resolution=makeResolution({request,status:'unavailable',error:{code:'RESOLVER_FAILED_OR_UNVERIFIED'}});}
        }
        await audit.write({
          schema:'acqpath.partner-observe.v1',
          at:now().toISOString(),
          tool_name:name,
          resource:request.resource,
          purpose:request.intended_use.purpose,
          purpose_source:purposeSource,
          resolution
        });
      }).catch(()=>{}).finally(()=>pending.delete(job));
      pending.add(job);
      if(background)try{background(job);}catch{/* host background implementation must be reviewed */}
    }
    // Never modify, gate, inspect or attach authorization to the original result.
    return original;
  }
  return Object.freeze({
    call,
    async whenIdle(){while(pending.size)await Promise.allSettled([...pending]);},
    metrics(){return {accepted,ignored,dropped,pending:pending.size,mode:'OBSERVE_ONLY',paidBuyerApproved};}
  });
}

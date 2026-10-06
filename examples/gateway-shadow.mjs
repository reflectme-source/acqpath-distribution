import {makeEvidenceRequest} from '../packages/evidence-bridge/index.mjs';

const iso=()=>new Date().toISOString();

export async function runGatewayShadow({resource,purpose,context={},existingCall,resolver,audit,background}={}){
  if(typeof existingCall!=='function')throw Error('EXISTING_CALL_REQUIRED');
  if(!resolver||typeof resolver.resolve!=='function')throw Error('RESOLVER_REQUIRED');
  if(!audit||typeof audit.write!=='function')throw Error('AUDIT_WRITER_REQUIRED');

  const request=makeEvidenceRequest({resource,purpose,context:{...context,adoption_mode:'observe'}});
  const execution=Promise.resolve().then(existingCall);
  const observation=resolver.resolve(request).then(async resolution=>{
    await audit.write({schema:'acqpath.shadow-event.v1',at:iso(),resource,purpose,resolution});
    return resolution;
  }).catch(async()=>{
    await audit.write({schema:'acqpath.shadow-event.v1',at:iso(),resource,purpose,resolution:{schema:'rights-evidence.resolution.v1',status:'unavailable',request,evidence:[],error:{code:'SHADOW_OBSERVATION_FAILED'}}});
  });

  const result=await execution;
  if(typeof background==='function')background(observation);
  else void observation.catch(()=>{});
  return result;
}

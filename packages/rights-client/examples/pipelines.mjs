import {RightsClient,TaskBudget,publicDeliverySummary} from '../index.mjs';
import {EncryptedCheckpointStore,buyOnce} from '../checkpoint-store.mjs';
// This is BUYER integration code. It is never executed by the seller's distribution publisher.
// `pay` must be the buyer's own explicitly configured signer. Do not pass a seller wallet key.
export function createEvidencePipeline({pay,checkpointDirectory,checkpointPassword,totalBudgetMicro='50000'}){
 if(typeof pay!=='function')throw Error('BUYER_SIGNER_REQUIRED');
 const store=new EncryptedCheckpointStore(checkpointDirectory,checkpointPassword);
 const client=new RightsClient({pay,maxFeeMicro:'50000',budget:new TaskBudget(totalBudgetMicro)});
 return async function preflight({id,resource,purpose='ai-input',tier='fresh',user_class='commercial'}){
  const caps=await client.capabilities();const native=caps.native_services?.find(x=>x.capability==='rights.preflight.v1');
  if(!native?.enabled||!native.coverage?.includes(new URL(resource).origin))return {status:'OUTSIDE_SUPPORTED_SCOPE',legal_clearance:false};
  const result=await buyOnce(client,{resource,purpose,user_class,tier,max_total_micro:tier==='deep'?'50000':'20000'},{store,id});
  // A positive observed declaration is still not a license. Keep ingestion authorization separate.
  return {...publicDeliverySummary(result),ingestion_authorized:false};
 };
}
export async function evidenceBeforeRag(preflight,{id,resource}){return preflight({id,resource,purpose:'ai-index',tier:'fresh'});}
export async function researchSourceEvidence(preflight,{id,resource}){return preflight({id,resource,purpose:'ai-input',tier:'fresh'});}
export async function contentUsageEvidence(preflight,{id,resource}){return preflight({id,resource,purpose:'ai-train',tier:'deep'});}

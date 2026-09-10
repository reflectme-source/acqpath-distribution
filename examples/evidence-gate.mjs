import {RightsClient,TaskBudget,validateInput,publicDeliverySummary} from '../packages/rights-client/index.mjs';
import {EncryptedCheckpointStore,buyOnce} from '../packages/rights-client/checkpoint-store.mjs';

// BUYER application code. Importing this module makes no requests and spends nothing.
// Use one gate per explicitly allocated task budget, not a new gate per URL.
export function createEvidenceGate({pay,checkpointDirectory,checkpointPassword,taskBudgetMicro='50000',fetch:fetcher,client,store}={}){
 const buyer=client||new RightsClient({pay,maxFeeMicro:'50000',budget:new TaskBudget(taskBudgetMicro),fetch:fetcher||globalThis.fetch});
 if(!(buyer instanceof RightsClient))throw Error('REVIEWED_RIGHTS_CLIENT_REQUIRED');
 const checkpoints=store||new EncryptedCheckpointStore(checkpointDirectory,checkpointPassword);
 return async function evidenceGate({id,resource,purpose,tier='fresh',user_class='commercial',geo=null}){
  const input={resource,purpose,user_class,geo,tier,max_total_micro:tier==='deep'?'50000':'20000'};validateInput(input);
  // Existing checkpoints take precedence over coverage changes: recovery must not
  // create a replacement quote or authorization after an ambiguous submission.
  const prior=await checkpoints.load(id);
  if(!prior){
   const caps=await buyer.capabilities(),native=caps.native_services?.find(s=>s.capability==='rights.preflight.v1');
   if(!native?.enabled||!native.payments_enabled||!native.coverage?.includes(new URL(resource).origin))return {status:'OUTSIDE_SUPPORTED_SCOPE',ingestionAuthorized:false,legalClearance:false};
   const liveFee=tier==='deep'?native.deep_fee_micro:native.fresh_fee_micro;
   if(!/^(0|[1-9][0-9]*)$/.test(liveFee||'')||BigInt(liveFee)>BigInt(input.max_total_micro))return {status:'PRICE_REQUIRES_REVIEW',ingestionAuthorized:false,legalClearance:false};
  }
  // buyOnce locks this logical ID and stores a checkpoint before submission.
  // The client verifies offer, report, receipt and delivery binding. It never
  // invokes the wallet when resuming an existing signed checkpoint.
  const result=await buyOnce(buyer,input,{store:checkpoints,id});
  const safe=publicDeliverySummary(result);
  if(result.status!=='DELIVERED')return {...safe,ingestionAuthorized:false,legalClearance:false};
  return {...safe,decision:result.result.report.decision,evidenceObserved:true,ingestionAuthorized:false,legalClearance:false};
 };
}

// All outcomes feed the buyer's own policy. Even ALLOW_DECLARED is evidence,
// not a license or a permission grant. UNKNOWN/DENY/LICENSE_REQUIRED must hold.
export function requiresHold(decision){return decision!=='ALLOW_DECLARED';}

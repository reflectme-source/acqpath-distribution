// Framework-neutral TypeScript use cases. No network request on import.
// Supply a private gate created by evidence-gate.mjs with an approved buyer
// signer, durable checkpoint store and finite per-task budget.
type Purpose = 'ai-input' | 'ai-index' | 'ai-train' | 'search';
type Request = {id:string;resource:string;purpose:Purpose;tier?:'fresh'|'deep'};
type Evidence = {status:string;decision?:string;ingestionAuthorized:false;[key:string]:unknown};
type Gate = (request:Request)=>Promise<Evidence>;

// Each ID belongs to one explicit evidence request. Persist it with your job.
// Do not derive a new ID on retry; the gate resumes the saved authorization.
export const beforeRagIndex = (gate:Gate,id:string,resource:string) => gate({id,resource,purpose:'ai-index'});
export const beforeResearchContext = (gate:Gate,id:string,resource:string) => gate({id,resource,purpose:'ai-input'});
export const beforeTraining = (gate:Gate,id:string,resource:string) => gate({id,resource,purpose:'ai-train',tier:'deep'});
export const beforeSearch = (gate:Gate,id:string,resource:string) => gate({id,resource,purpose:'search'});

export async function afterCrawlerPolicy(gate:Gate,{id,resource,crawlPolicyApproved}:{id:string;resource:string;crawlPolicyApproved:boolean}){
 if(!crawlPolicyApproved)return {status:'CRAWL_POLICY_HOLD',ingestionAuthorized:false};
 // This checks the downstream index purpose, not crawl permission.
 return beforeRagIndex(gate,id,resource);
}

export function ingestionDecision(evidence:Evidence){
 if(evidence.status!=='DELIVERED'||evidence.decision!=='ALLOW_DECLARED')return 'HOLD';
 return 'REQUIRES_APPLICATION_POLICY'; // evidence does not grant a license
}

// The shared JS gate performs the full flow: live coverage -> one quote ->
// signed offer -> bounded buyer authorization -> checkpoint -> paid HTTP GET ->
// verification of report/receipt/delivery binding. UNKNOWN or unsupported holds.
// Any ambiguous payment resumes the same checkpoint, never a new quote/signature.

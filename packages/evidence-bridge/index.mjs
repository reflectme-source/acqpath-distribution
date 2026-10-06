const REQUEST_SCHEMA='rights-evidence.request.v1';
const EVIDENCE_SCHEMA='rights-evidence.v1';
const RESOLUTION_SCHEMA='rights-evidence.resolution.v1';

export const SCHEMAS=Object.freeze({request:REQUEST_SCHEMA,evidence:EVIDENCE_SCHEMA,resolution:RESOLUTION_SCHEMA});
export const DEFAULT_ACQPATH_EVIDENCE_KEY=Object.freeze({kty:'OKP',crv:'Ed25519',x:'PzeeZ8d8Np85ix9ialbrLZz9ebY_Og72dScn1IAft6M',key_ops:Object.freeze(['verify']),ext:true});
export const EVIDENCE_STATEMENTS=Object.freeze(['declared_permitted','declared_prohibited','license_required','unknown']);
export const RESOLUTION_STATUSES=Object.freeze(['resolved','unavailable','unsupported','invalid']);

const ACQPATH_PURPOSES=new Set(['ai-input','ai-train','ai-index','search']);
const ACQPATH_DECISIONS=Object.freeze({
 ALLOW_DECLARED:'declared_permitted',
 DENY_DECLARED:'declared_prohibited',
 LICENSE_REQUIRED:'license_required',
 UNKNOWN:'unknown'
});
const enc=new TextEncoder();

function plain(value){return value!==null&&typeof value==='object'&&!Array.isArray(value);}
function ownKeysOnly(value,allowed,code){for(const key of Object.keys(value))if(!allowed.includes(key))throw Error(code+'_'+key);}
function canonical(value){
 if(value===null||typeof value!=='object')return JSON.stringify(value);
 if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
 return '{'+Object.keys(value).sort().filter(key=>value[key]!==undefined).map(key=>JSON.stringify(key)+':'+canonical(value[key])).join(',')+'}';
}
function hex(bytes){return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');}
async function sha256(value){return hex(await crypto.subtle.digest('SHA-256',enc.encode(value)));}
function firstTimestamp(...values){for(const value of values)if(typeof value==='string'&&!Number.isNaN(Date.parse(value)))return value;return null;}
function clean(value){return Object.fromEntries(Object.entries(value).filter(([,entry])=>entry!==null&&entry!==undefined));}

async function verifySignedEvidence(evidence,publicJwk){
 try{
  if(!plain(evidence)||evidence.algorithm!=='Ed25519'||evidence.format!=='acqpath-evidence-v1'||!/^[a-f0-9]{128}$/.test(evidence.signature||''))return false;
  const key=await crypto.subtle.importKey('jwk',publicJwk,{name:'Ed25519'},false,['verify']);
  const signature=Uint8Array.from(evidence.signature.match(/../g),part=>parseInt(part,16));
  return crypto.subtle.verify('Ed25519',key,signature,enc.encode(canonical(evidence.payload)));
 }catch{return false;}
}

export function validateEvidenceRequest(request){
 if(!plain(request))throw Error('INVALID_EVIDENCE_REQUEST');
 ownKeysOnly(request,['schema','resource','intended_use','context'],'UNKNOWN_REQUEST_FIELD');
 if(request.schema!==REQUEST_SCHEMA)throw Error('UNSUPPORTED_REQUEST_SCHEMA');
 if(typeof request.resource!=='string'||request.resource.length<1||request.resource.length>2048)throw Error('INVALID_RESOURCE');
 let url;try{url=new URL(request.resource);}catch{throw Error('INVALID_RESOURCE');}
 if(url.protocol!=='https:'||url.username||url.password)throw Error('INVALID_RESOURCE');
 if(!plain(request.intended_use))throw Error('INTENDED_USE_REQUIRED');
 ownKeysOnly(request.intended_use,['purpose'],'UNKNOWN_INTENDED_USE_FIELD');
 const purpose=request.intended_use.purpose;
 if(typeof purpose!=='string'||!/^[a-z][a-z0-9-]{1,63}$/.test(purpose))throw Error('PURPOSE_REQUIRED');
 if(request.context!==undefined&&!plain(request.context))throw Error('INVALID_CONTEXT');
 return request;
}

export function makeEvidenceRequest({resource,purpose,context={}}={}){
 return validateEvidenceRequest({schema:REQUEST_SCHEMA,resource,intended_use:{purpose},context});
}

export function validateRightsEvidence(evidence){
 if(!plain(evidence)||evidence.schema!==EVIDENCE_SCHEMA)throw Error('INVALID_RIGHTS_EVIDENCE');
 ownKeysOnly(evidence,['schema','kind','statement','resource','intended_use','provenance','verification','provider_details'],'UNKNOWN_EVIDENCE_FIELD');
 if(evidence.kind!=='source_rights_declaration')throw Error('UNSUPPORTED_EVIDENCE_KIND');
 if(!EVIDENCE_STATEMENTS.includes(evidence.statement))throw Error('INVALID_EVIDENCE_STATEMENT');
 validateEvidenceRequest({schema:REQUEST_SCHEMA,resource:evidence.resource,intended_use:evidence.intended_use,context:{}});
 if(!plain(evidence.provenance))throw Error('INVALID_PROVENANCE');
 ownKeysOnly(evidence.provenance,['provider','observed_at','expires_at','evidence_ref'],'UNKNOWN_PROVENANCE_FIELD');
 if(typeof evidence.provenance.provider!=='string'||!evidence.provenance.provider.trim())throw Error('PROVIDER_REQUIRED');
 for(const [field,code] of [['observed_at','INVALID_OBSERVED_AT'],['expires_at','INVALID_EXPIRES_AT']]){
  const value=evidence.provenance[field];
  if(value!==null&&value!==undefined&&(typeof value!=='string'||Number.isNaN(Date.parse(value))))throw Error(code);
 }
 if(evidence.provenance.evidence_ref!==null&&evidence.provenance.evidence_ref!==undefined&&typeof evidence.provenance.evidence_ref!=='string')throw Error('INVALID_EVIDENCE_REF');
 if(!plain(evidence.verification)||!['verified','unverified','invalid'].includes(evidence.verification.status))throw Error('INVALID_VERIFICATION');
 ownKeysOnly(evidence.verification,['status','algorithm'],'UNKNOWN_VERIFICATION_FIELD');
 return evidence;
}

export function makeResolution({request,status,evidence=[],error=null}={}){
 validateEvidenceRequest(request);
 if(!RESOLUTION_STATUSES.includes(status))throw Error('INVALID_RESOLUTION_STATUS');
 if(!Array.isArray(evidence))throw Error('INVALID_EVIDENCE_LIST');
 for(const item of evidence)validateRightsEvidence(item);
 if(status==='resolved'&&evidence.length===0)throw Error('RESOLVED_WITHOUT_EVIDENCE');
 if(status!=='resolved'&&evidence.length!==0)throw Error('NONRESOLVED_WITH_EVIDENCE');
 if(error!==null&&!plain(error))throw Error('INVALID_RESOLUTION_ERROR');
 return {schema:RESOLUTION_SCHEMA,status,request,evidence,error};
}

export function mapAcqPathDecision(decision){
 const statement=ACQPATH_DECISIONS[decision];
 if(!statement)throw Error('UNKNOWN_ACQPATH_DECISION');
 return statement;
}

function unresolvedStatus(result){
 if(result?.status==='OUTSIDE_SUPPORTED_SCOPE')return 'unsupported';
 if(result?.status==='UNAVAILABLE'&&/(?:unsupported|outside.*scope)/i.test(result?.quote?.reason||result?.reason||''))return 'unsupported';
 return 'unavailable';
}

export async function normalizeAcqPathPurchaseResult(request,purchaseResult,{publicEvidenceKey=DEFAULT_ACQPATH_EVIDENCE_KEY,providerName='AcqPath'}={}){
 validateEvidenceRequest(request);
 if(!plain(purchaseResult))return makeResolution({request,status:'invalid',error:{code:'MALFORMED_PROVIDER_RESULT'}});
 if(purchaseResult.status!=='DELIVERED')return makeResolution({request,status:unresolvedStatus(purchaseResult),error:{code:String(purchaseResult.status||'PROVIDER_UNAVAILABLE')}});
 const body=purchaseResult.result;
 if(!plain(body)||!plain(body.report)||!plain(body.evidence))return makeResolution({request,status:'invalid',error:{code:'MISSING_SIGNED_REPORT'}});
 if(!await verifySignedEvidence(body.evidence,publicEvidenceKey))return makeResolution({request,status:'invalid',error:{code:'INVALID_EVIDENCE_SIGNATURE'}});
 const signedBody={...body};delete signedBody.evidence;delete signedBody.payment_settlement;delete signedBody.delivery_proof;
 if(canonical(signedBody)!==canonical(body.evidence.payload))return makeResolution({request,status:'invalid',error:{code:'SIGNED_PAYLOAD_MISMATCH'}});
 const report=body.report;
 if(report.resource!==request.resource||report.purpose!==request.intended_use.purpose)return makeResolution({request,status:'invalid',error:{code:'REPORT_BINDING_MISMATCH'}});
 if(report.legal_clearance!==false)return makeResolution({request,status:'invalid',error:{code:'LEGAL_CLEARANCE_BOUNDARY_VIOLATION'}});
 let statement;try{statement=mapAcqPathDecision(report.decision);}catch{return makeResolution({request,status:'invalid',error:{code:'UNKNOWN_PROVIDER_DECISION'}});}
 const evidenceHash=await sha256(canonical(body.evidence));
 const payload=body.evidence.payload||{};
 const evidence={
  schema:EVIDENCE_SCHEMA,
  kind:'source_rights_declaration',
  statement,
  resource:report.resource,
  intended_use:{purpose:report.purpose},
  provenance:{
   provider:providerName,
   observed_at:firstTimestamp(report.observed_at,body.observed_at,payload.observed_at,payload.checked_at,payload.created_at),
   expires_at:firstTimestamp(report.evidence_expires_at,body.evidence_expires_at,payload.evidence_expires_at),
   evidence_ref:'urn:acqpath:evidence:sha256:'+evidenceHash
  },
  verification:{status:'verified',algorithm:'Ed25519'},
  provider_details:{decision:report.decision,evidence_format:body.evidence.format}
 };
 validateRightsEvidence(evidence);
 return makeResolution({request,status:'resolved',evidence:[evidence]});
}

export function createAcqPathProvider({resolvePurchase,publicEvidenceKey=DEFAULT_ACQPATH_EVIDENCE_KEY,providerName='AcqPath'}={}){
 if(typeof resolvePurchase!=='function')throw Error('RESOLVE_PURCHASE_REQUIRED');
 return Object.freeze({
  name:'acqpath',
  async resolve(request){
   validateEvidenceRequest(request);
   if(!ACQPATH_PURPOSES.has(request.intended_use.purpose))return makeResolution({request,status:'unsupported',error:{code:'UNSUPPORTED_PURPOSE'}});
   let purchaseResult;
   try{purchaseResult=await resolvePurchase({resource:request.resource,purpose:request.intended_use.purpose,context:request.context});}
   catch{return makeResolution({request,status:'unavailable',error:{code:'PROVIDER_CALL_FAILED'}});}
   return normalizeAcqPathPurchaseResult(request,purchaseResult,{publicEvidenceKey,providerName});
  }
 });
}

export function createEvidenceResolver({provider}={}){
 if(!provider||typeof provider.resolve!=='function')throw Error('EVIDENCE_PROVIDER_REQUIRED');
 return Object.freeze({async resolve(request){validateEvidenceRequest(request);return provider.resolve(request);}});
}

function getPath(value,path){if(!path)return undefined;return String(path).split('.').reduce((current,key)=>current==null?undefined:current[key],value);}

export function requestFromWebhook(body,{resourcePath='resource',purposePath='purpose',contextPath='context'}={}){
 if(!plain(body))throw Error('INVALID_WEBHOOK_BODY');
 return makeEvidenceRequest({resource:getPath(body,resourcePath),purpose:getPath(body,purposePath),context:getPath(body,contextPath)??{}});
}

export function createWebhookProfile({resolver,mapping,decide}={}){
 if(!resolver||typeof resolver.resolve!=='function')throw Error('RESOLVER_REQUIRED');
 if(decide!==undefined&&typeof decide!=='function')throw Error('DECIDE_CALLBACK_INVALID');
 return Object.freeze({
  async handle(body){
   const request=requestFromWebhook(body,mapping);
   const resolution=await resolver.resolve(request);
   if(!decide)return {status:resolution.status,evidence:resolution.evidence,error:resolution.error};
   const outcome=await decide({request,resolution});
   if(!outcome||!['allow','deny','warn','review'].includes(outcome.decision))throw Error('INVALID_POLICY_DECISION');
   return {decision:outcome.decision,reason:outcome.reason??null,status:resolution.status,evidence:resolution.evidence,error:resolution.error};
  }
 });
}

export function toAttestedValue(evidence){
 validateRightsEvidence(evidence);
 return clean({value:evidence.statement,asserted_by:evidence.provenance.provider,asserted_at:evidence.provenance.observed_at,evidence:evidence.provenance.evidence_ref,expires:evidence.provenance.expires_at});
}

export function toPolicyInput(resolution,{evaluatedAt}={}){
 if(typeof evaluatedAt!=='string'||Number.isNaN(Date.parse(evaluatedAt)))throw Error('EVALUATED_AT_REQUIRED');
 if(!plain(resolution)||resolution.schema!==RESOLUTION_SCHEMA)throw Error('RESOLUTION_REQUIRED');
 const first=resolution.status==='resolved'?resolution.evidence[0]:null;
 return {evaluated_at:evaluatedAt,source_rights:{resource:resolution.request.resource,purpose:resolution.request.intended_use.purpose,statement:first?toAttestedValue(first):null,resolution_status:resolution.status,error:resolution.error}};
}

export function asEvidenceProvider(resolver){
 if(!resolver||typeof resolver.resolve!=='function')throw Error('RESOLVER_REQUIRED');
 return Object.freeze({resolve:request=>resolver.resolve(request)});
}

import {rightsQuote,buyRightsPreflight,resumeRightsPreflight} from './vendor/rights.mjs';
import {TaskBudget} from './vendor/lib/budget.mjs';
import {micro} from './vendor/lib/money.mjs';
export {TaskBudget};
export const MAINNET=Object.freeze({origin:'https://api.getacqpath.com',network:'eip155:8453',asset:'0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',payTo:'0xf69DBbd053fb0Fbc78ADfdB1BFe3b0D1F57300ec'});
export const EVIDENCE_KEY=Object.freeze({kty:'OKP',crv:'Ed25519',x:'PzeeZ8d8Np85ix9ialbrLZz9ebY_Og72dScn1IAft6M',key_ops:Object.freeze(['verify']),ext:true});
const purposes=['ai-input','ai-train','ai-index','search'];
export function validateInput(input){
 if(!input||Array.isArray(input)||typeof input!=='object')throw Error('INVALID_INPUT');
 const allowed=['resource','purpose','user_class','geo','freshness_seconds','tier','max_total_micro'];
 if(Object.keys(input).some(k=>!allowed.includes(k)))throw Error('UNKNOWN_INPUT_FIELD');
 const u=new URL(input.resource);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.port||input.resource.length>2048||/%(?:2f|5c)/i.test(input.resource)||u.href!==input.resource)throw Error('INVALID_RESOURCE_URL');
 if(!purposes.includes(input.purpose))throw Error('UNSUPPORTED_PURPOSE');
 if(input.tier!==undefined&&!['fresh','deep'].includes(input.tier))throw Error('INVALID_TIER');
 if(input.user_class!==undefined&&!['commercial','non-commercial','education','government','personal'].includes(input.user_class))throw Error('INVALID_USER_CLASS');
 if(input.geo!==undefined&&input.geo!==null&&!/^[A-Z]{2}$/.test(input.geo))throw Error('INVALID_GEO');
 if(input.freshness_seconds!==undefined&&(!Number.isSafeInteger(input.freshness_seconds)||input.freshness_seconds<0||input.freshness_seconds>3600))throw Error('INVALID_FRESHNESS');
 micro(input.max_total_micro);return input;
}
export class RightsClient{
 constructor({pay,publicEvidenceKey=EVIDENCE_KEY,maxFeeMicro='50000',budget=new TaskBudget(maxFeeMicro),fetch:fetcher=globalThis.fetch,timeoutMs=15000}={}){
  if(typeof fetcher!=='function')throw Error('FETCH_REQUIRED');micro(maxFeeMicro);
  if(!Number.isSafeInteger(timeoutMs)||timeoutMs<100||timeoutMs>60000)throw Error('BAD_TIMEOUT');
  this.base=MAINNET.origin;this.pay=pay;this.key=publicEvidenceKey;this.budget=budget;
  this.servicePaymentPolicy={network:MAINNET.network,asset:MAINNET.asset,payTo:MAINNET.payTo,maxFeeMicro};
  this.fetcher=(url,opts={})=>{const u=new URL(url);if(u.origin!==MAINNET.origin||u.username||u.password||u.hash||u.search)throw Error('ORIGIN_OR_URL_REJECTED');if(!['/v1/capabilities','/.well-known/acqpath-keys.json'].includes(u.pathname)&&u.pathname!=='/v1/rights/quote'&&!/^\/v1\/rights\/reports\/[a-f0-9]{48}$/.test(u.pathname))throw Error('PATH_REJECTED');return fetcher(u.href,{...opts,redirect:'error',signal:opts.signal?AbortSignal.any([opts.signal,AbortSignal.timeout(timeoutMs)]):AbortSignal.timeout(timeoutMs)});};
 }
 async capabilities(){const r=await this.fetcher(this.base+'/v1/capabilities');if(r.status!==200)throw Error('CAPABILITIES_UNAVAILABLE');const reader=r.body?.getReader();if(!reader)throw Error('EMPTY_RESPONSE');let size=0;const chunks=[];for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>262144){await reader.cancel();throw Error('RESPONSE_LIMIT');}chunks.push(value);}const bytes=new Uint8Array(size);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.length;}return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}
 async quote(input){validateInput(input);return rightsQuote(this,input);}
 async buy(input,{onCheckpoint}={}){validateInput(input);if(typeof this.pay!=='function')throw Error('SIGNER_NOT_CONFIGURED_NO_PAYMENT');if(micro(input.max_total_micro)>micro(this.servicePaymentPolicy.maxFeeMicro))throw Error('INPUT_EXCEEDS_LOCAL_CAP');return buyRightsPreflight(this,input,{onCheckpoint});}
 async resume(checkpoint,{onCheckpoint}={}){if(typeof onCheckpoint!=='function')throw Error('CHECKPOINT_REQUIRED');validateInput(checkpoint?.input);return resumeRightsPreflight(this,checkpoint,{onCheckpoint});}
}
export function publicQuoteSummary(q){return {available:q.available===true,reason:q.reason||null,decision:q.decision_preview||q.decision||null,fee_micro:q.fee_micro||q.charge_micro||null,expires_at:q.expires_at||null,legal_clearance:false};}
export function publicDeliverySummary(value){if(value.status!=='DELIVERED')return {status:value.status,quote:publicQuoteSummary(value.quote||{})};return {status:'DELIVERED',charged_micro:value.charged_micro,report:value.result.report,receipt_verified:true,independent_chain_validation:false};}

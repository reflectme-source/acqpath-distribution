import {generateKeyPairSync} from 'node:crypto';
import {MAINNET,RightsClient} from '../../packages/rights-client/index.mjs';
import {signJWS,signingKid} from '../../packages/rights-client/vendor/lib/jws.mjs';
import {signEvidence,canonical,sha256,base64JSON,decode64JSON} from '../../packages/rights-client/vendor/lib/crypto.mjs';
export const buyer='0x'+'1'.repeat(40);
export const input={resource:'https://example.com/article',purpose:'ai-input',user_class:'commercial',tier:'fresh',max_total_micro:'50000'};
export function response(data,status=200,headers={}){return new Response(status===202?null:JSON.stringify(data),{status,headers:{'content-type':'application/json',...headers}});}
export async function fixture(){
 const {privateKey,publicKey}=generateKeyPairSync('ed25519');const priv=privateKey.export({format:'jwk'}),pub=publicKey.export({format:'jwk'});const id='a'.repeat(48),claim='b'.repeat(64),url=MAINNET.origin+'/v1/rights/reports/'+id;
 const q={available:true,mode:'rights_preflight',quote_id:id,claim_token:claim,redeem_url:url,fee_micro:'20000',total_micro:'20000',expires_at:Date.now()+120000,payment:{network:MAINNET.network,asset:MAINNET.asset,payTo:MAINNET.payTo}};
 const accepted={scheme:'exact',network:MAINNET.network,asset:MAINNET.asset,payTo:MAINNET.payTo,amount:q.fee_micro,maxTimeoutSeconds:120,extra:{name:'USD Coin',version:'2'}};
 const offer={format:'jws',acceptIndex:0,signature:await signJWS({version:1,resourceUrl:url,...accepted,validUntil:Math.floor(q.expires_at/1000)},priv,signingKid(MAINNET.origin))};
 const challenge={x402Version:2,resource:{url},accepts:[accepted],extensions:{'offer-receipt':{info:{offers:[offer]}}}};
 let signerCalls=0,quoteCalls=0,submissions=0,checkpointWrites=0;
 let saved;const checkpoints=[];const control={failSubmit:false,unavailable:false,tamper:null};
 const pay=async ctx=>{signerCalls++;return {x402Version:2,resource:ctx.challenge.resource,accepted:ctx.requirements,payload:{signature:'0x'+'2'.repeat(130),authorization:{from:buyer,to:MAINNET.payTo,value:q.fee_micro,validAfter:'0',validBefore:String(Math.floor(Date.now()/1000)+120),nonce:'0x'+'3'.repeat(64)}}};};
 const onCheckpoint=async cp=>{checkpointWrites++;saved=cp;checkpoints.push(structuredClone(cp));};
 async function delivered(payload){
  const signed={quote_id:id,billing:{fee_type:'rights_preflight_report',amount_micro:q.fee_micro},report:{resource:input.resource,purpose:input.purpose,user_class:'commercial',geo:null,legal_clearance:false,decision:'ALLOW_DECLARED'}};
  const evidence=await signEvidence(signed,JSON.stringify(priv));const transaction='0x'+'4'.repeat(64);
  const receipt={format:'jws',signature:await signJWS({version:1,network:MAINNET.network,resourceUrl:url,transaction,payer:payload.payload.authorization.from,issuedAt:Math.floor(Date.now()/1000)},priv,signingKid(MAINNET.origin))};
  const settlement={success:true,network:MAINNET.network,transaction,extensions:{'offer-receipt':{info:{receipt}}}};
  const delivery_proof=await signEvidence({version:'acqpath-delivery-v1',quote_id:id,resource_url:url,report_sha256:await sha256(canonical({...signed,evidence})),offer_sha256:await sha256(canonical(offer)),network:MAINNET.network,asset:MAINNET.asset,pay_to:MAINNET.payTo,amount_micro:q.fee_micro,transaction},JSON.stringify(priv));
  const result={...signed,evidence,payment_settlement:settlement,delivery_proof};if(control.tamper)control.tamper(result);return result;
 }
 const fetcher=async(url,opts={})=>{
  if(url===MAINNET.origin+'/v1/rights/quote'){quoteCalls++;return response(control.unavailable?{available:false,reason:'NO_VERIFIABLE_DECLARATION',charge_micro:'0'}:q);}
  if(url===q.redeem_url){const headers=new Headers(opts.headers);if(headers.get('X-AcqPath-Claim')!==claim)return response({error:'CLAIM_REQUIRED'},401);const payment=headers.get('PAYMENT-SIGNATURE');if(!payment)return response({},402,{'PAYMENT-REQUIRED':base64JSON(challenge)});if(!checkpointWrites)throw Error('CHECKPOINT_WAS_NOT_PERSISTED');submissions++;if(control.failSubmit)throw Error('INJECTED_NETWORK_LOSS');return response(await delivered(decode64JSON(payment)));}
  return response({error:'NOT_FOUND'},404);
 };
 const client=new RightsClient({pay,fetch:fetcher,publicEvidenceKey:pub});
 return {client,fetcher,pay,pub,priv,q,challenge,accepted,control,onCheckpoint,delivered,get saved(){return saved;},get counts(){return {signerCalls,quoteCalls,submissions,checkpointWrites};},checkpoints};
}

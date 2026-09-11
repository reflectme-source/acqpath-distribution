// No dependencies, API key, wallet or payment. Node 22+. Does create one unpaid preparation.
import {randomBytes} from 'node:crypto';
import {pathToFileURL} from 'node:url';
export const endpoint='https://api.getacqpath.com/v1/rights/preflight';
export async function preflight(resource='https://rslstandard.org/',purpose='ai-input',{fetcher=fetch}={}){
 if(!['ai-input','ai-index','ai-train','search'].includes(purpose))throw Error('Unsupported purpose; crawl is not a paid purpose');
 const body={resource,purpose,tier:'fresh',max_total_micro:'20000'},key=randomBytes(32).toString('hex');
 const r=await fetcher(endpoint,{method:'POST',redirect:'error',signal:AbortSignal.timeout(25000),headers:{'content-type':'application/json','X-AcqPath-Request':key},body:JSON.stringify(body)});
 if(r.status===200){const unavailable=await r.json();if(unavailable.available!==false||unavailable.charge_micro!=='0')throw Error('Unexpected unpaid response');return {status:'UNAVAILABLE',reason:unavailable.reason,charged:'0',ingestionAuthorized:false}}
 if(r.status!==402)throw Error('Unpaid preflight HTTP '+r.status);
 const header=r.headers.get('payment-required');if(!header||header.length>64000)throw Error('Invalid challenge');
 const challenge=JSON.parse(Buffer.from(header,'base64')),a=challenge.accepts?.[0],b=challenge.extensions?.['acqpath-request-binding']?.info;
 if(challenge.x402Version!==2||challenge.accepts?.length!==1||challenge.resource?.url!==endpoint||a?.scheme!=='exact'||a.amount!=='20000'||a.network!=='eip155:8453'||a.asset?.toLowerCase()!=='0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'||a.payTo?.toLowerCase()!=='0xf69dbbd053fb0fbc78adfdb1bfe3b0d1f57300ec'||b?.state!=='prepared')throw Error('Unexpected payment terms');
 // This sample deliberately stops before signing. Header decoding is NOT signature verification.
 // For paid use, follow OFFICIAL-CLIENTS.md: unchanged official TS/Python x402 signer
 // plus the AcqPath SIWX adapter. It privately persists the request/payment/SIWX state.
 // Do not replace the official signer nonce; generic zero-config clients are not claimed.
 return {status:'402_PREPARED_NO_PAYMENT',resource,purpose,decision:b.decision_preview,amountMicro:a.amount,network:a.network,asset:a.asset,payTo:a.payTo,signatureVerified:false,genericX402ClientCompatible:false,ingestionAuthorized:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)preflight(process.argv[2],process.argv[3]).then(x=>console.log(JSON.stringify(x,null,2))).catch(e=>{console.error(e.message);process.exitCode=1});

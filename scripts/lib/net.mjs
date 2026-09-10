export async function boundedRequest(url,{method='GET',headers={},body,timeoutMs=12000,maxBytes=1048576,allowedOrigins=[]}={},fetcher=globalThis.fetch){
 const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password||u.hash||!allowedOrigins.includes(u.origin))throw Error('NETWORK_DESTINATION_REJECTED');
 const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),timeoutMs);
 try{
  const r=await fetcher(u.href,{method,headers:{accept:'application/json',...headers},body,redirect:'manual',signal:ctrl.signal});
  if(r.status>=300&&r.status<400)return {status:r.status,redirected:true,data:null,bytes:0};
  if(Number(r.headers.get('content-length')||0)>maxBytes){await r.body?.cancel();throw Error('RESPONSE_TOO_LARGE');}
  let n=0;const chunks=[];const reader=r.body?.getReader();if(reader){for(;;){const part=await reader.read();if(part.done)break;n+=part.value.byteLength;if(n>maxBytes){await reader.cancel();throw Error('RESPONSE_TOO_LARGE');}chunks.push(part.value);}}
  const b=new Uint8Array(n);let i=0;for(const chunk of chunks){b.set(chunk,i);i+=chunk.length;}
  const text=new TextDecoder('utf-8',{fatal:true}).decode(b);let data=null;try{data=JSON.parse(text);}catch{}
  const ct=r.headers.get('content-type')||'';
  return {status:r.status,contentType:ct,data,bytes:n,sessionId:r.headers.get('mcp-session-id'),paymentRequired:r.headers.get('payment-required')};
 }finally{clearTimeout(timer);}
}
export function apiCall(cfg,path,options={},fetcher=globalThis.fetch){if(!path.startsWith('/')||path.startsWith('//')||path.includes('..'))throw Error('BAD_API_PATH');return boundedRequest(cfg.apiOrigin+path,{...options,allowedOrigins:[cfg.apiOrigin],timeoutMs:cfg.limits.requestTimeoutMs,maxBytes:cfg.limits.maxResponseBytes},fetcher);}

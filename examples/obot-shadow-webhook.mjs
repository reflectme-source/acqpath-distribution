import {createServer} from 'node:http';
import {createHmac, timingSafeEqual} from 'node:crypto';
import {appendFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {makeEvidenceRequest, makeResolution} from '../packages/evidence-bridge/index.mjs';

const json=(response,status,body)=>{
 response.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});
 response.end(JSON.stringify(body));
};
const record=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);

export function validObotSignature(body,header,secret) {
 if(typeof header!=='string'||!/^sha256=[a-f\d]{64}$/i.test(header))return false;
 const expected=createHmac('sha256',secret).update(body).digest();
 const supplied=Buffer.from(header.slice(7),'hex');
 return supplied.length===expected.length&&timingSafeEqual(supplied,expected);
}

// A sidecar observer: Obot alone decides whether a tool call proceeds.
// A 200 webhook response does not inject evidence into an MCP result.
export function createObotShadowServer({
 secret, toolNames=['fetch_url'], reviewedOrigins=['https://medium.com'],
 resolver, audit, maxBodyBytes=65536, maxPending=64, maxProofEvents=50, maxProofHours=24
}={}) {
 if(typeof secret!=='string'||Buffer.byteLength(secret)<24)throw Error('STRONG_WEBHOOK_SECRET_REQUIRED');
 if(!resolver||typeof resolver.resolve!=='function')throw Error('RESOLVER_REQUIRED');
 if(!audit||typeof audit.write!=='function')throw Error('AUDIT_REQUIRED');
 const names=new Set(toolNames);
 if(!names.size||[...names].some(n=>typeof n!=='string'||!n.trim()))throw Error('EXPLICIT_TOOL_NAMES_REQUIRED');
 const origins=new Set(reviewedOrigins.map(o=>{
  const u=new URL(o);
  if(u.protocol!=='https:'||u.username||u.password||u.pathname!=='/'||u.search||u.hash)throw Error('UNSAFE_REVIEWED_ORIGIN');
  return u.origin;
 }));
 const pending=new Set();
 const startedAt=Date.now();
 let accepted=0,ignored=0,dropped=0;

 function queueObservation(request,toolName,requestId) {
  if(pending.size>=maxPending||accepted>=maxProofEvents||Date.now()-startedAt>=maxProofHours*3600000){dropped++;return false;}
  let job;
  job=Promise.resolve().then(()=>resolver.resolve(request)).catch(()=>makeResolution({
    request,status:'unavailable',error:{code:'SHADOW_RESOLVER_FAILED'}
  })).then(resolution=>audit.write({
    schema:'acqpath.shadow-event.v1',
    at:new Date().toISOString(),
    resource:request.resource,
    purpose:request.intended_use.purpose,
    tool:toolName,
    mcp_request_id:requestId??null,
    resolution
  })).catch(()=>{}).finally(()=>pending.delete(job));
  pending.add(job);
  accepted++;
  return true;
 }

 const server=createServer(async(req,res)=>{
  if(req.method==='GET'&&req.url==='/healthz')return json(res,200,{status:'ready',mode:'synthetic-observe'});
  if(req.method!=='POST'||req.url!=='/webhook')return json(res,404,{error:'NOT_FOUND'});
  if(!String(req.headers['content-type']||'').toLowerCase().startsWith('application/json'))
   return json(res,415,{error:'JSON_REQUIRED'});
  let size=0,body;
  try{
   const chunks=[];
   for await(const chunk of req){
    size+=chunk.length;
    if(size>maxBodyBytes)return json(res,413,{error:'REQUEST_TOO_LARGE'});
    chunks.push(chunk);
   }
   body=Buffer.concat(chunks);
  }catch{return json(res,400,{error:'BAD_REQUEST'});}
  if(!validObotSignature(body,req.headers['x-obot-signature-256'],secret))
   return json(res,401,{error:'INVALID_OBOT_SIGNATURE'});
  let message;
  try{message=JSON.parse(body.toString('utf8'));}
  catch{return json(res,400,{error:'INVALID_JSON'});}
  if(!record(message)||message.jsonrpc!=='2.0')
   return json(res,400,{error:'INVALID_JSON_RPC'});
  if(message.method!=='tools/call'||!names.has(message.params?.name)){
   ignored++;return json(res,200,{status:'accepted',mode:'observe',observed:false});
  }
  const args=message.params?.arguments;
  const resource=record(args)?(args.resource??args.url):null;
  const purpose=record(args)?(args.purpose??args.intended_use?.purpose):null;
  let request,origin;
  try{
   request=makeEvidenceRequest({resource,purpose,context:{adoption_mode:'observe',integration:'obot-webhook'}});
   origin=new URL(request.resource).origin;
  }catch{
   ignored++;return json(res,200,{status:'accepted',mode:'observe',observed:false,reason:'NOT_ELIGIBLE'});
  }
  if(!origins.has(origin)){
   ignored++;return json(res,200,{status:'accepted',mode:'observe',observed:false,reason:'OUTSIDE_REVIEWED_ORIGINS'});
  }
  // Never block the original MCP tool call because evidence could not be resolved.
  const queued=queueObservation(request,message.params.name,message.id);
  return json(res,200,{status:'accepted',mode:'observe',observed:queued,reason:queued?undefined:'QUEUE_FULL'});
 });
 server.whenIdle=async()=>{while(pending.size)await Promise.allSettled([...pending]);};
 server.metrics=()=>({accepted,ignored,dropped,pending:pending.size});
 return server;
}

export function fileAudit(path) {
 return {write:event=>appendFile(path,JSON.stringify(event)+'\n',{encoding:'utf8',flag:'a'})};
}

export function syntheticUnresolvedProvider() {
 return {async resolve(request){
  return makeResolution({request,status:'unsupported',error:{code:'SYNTHETIC_POC_NO_PAID_PROVIDER'}});
 }};
}

// Running this file directly is an offline-only HTTP webhook fixture.
// Live AcqPath paid acquisition requires separately configured settlement and verification.
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const secret=process.env.OBOT_WEBHOOK_SECRET;
 const toolNames=String(process.env.OBOT_TOOL_NAMES||'fetch_url').split(',').map(s=>s.trim()).filter(Boolean);
 const reviewedOrigins=String(process.env.OBOT_REVIEWED_ORIGINS||'https://medium.com').split(',').map(s=>s.trim()).filter(Boolean);
 const server=createObotShadowServer({
  secret,toolNames,reviewedOrigins,
  resolver:syntheticUnresolvedProvider(),
  audit:fileAudit(process.env.OBOT_AUDIT_FILE||'obot-shadow-events.ndjson')
 });
 const port=Number(process.env.PORT||8789);
 server.listen(port,'127.0.0.1',()=>console.log(JSON.stringify({state:'OBOT_SYNTHETIC_OBSERVER_READY',port,mode:'observe',externalProvider:false})));
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {once} from 'node:events';
import {createObotShadowServer,validObotSignature,syntheticUnresolvedProvider} from '../examples/obot-shadow-webhook.mjs';
import {makeResolution} from '../packages/evidence-bridge/index.mjs';

const secret='local-synthetic-test-secret-change-this';
const toolCall=(url='https://medium.com/example',purpose='ai-index',name='fetch_url')=>({
 jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{url,purpose}}
});
const auth=body=>'sha256='+createHmac('sha256',secret).update(body).digest('hex');
async function withServer(options,fn){
 const events=[];
 const server=createObotShadowServer({
  secret,toolNames:['fetch_url'],reviewedOrigins:['https://medium.com'],
  resolver:syntheticUnresolvedProvider(),audit:{write:async e=>events.push(e)},...options
 });
 server.listen(0,'127.0.0.1');
 await once(server,'listening');
 const base='http://127.0.0.1:'+server.address().port;
 const send=(message,override={})=>{
  const body=typeof message==='string'?message:JSON.stringify(message);
  return fetch(base+'/webhook',{method:'POST',headers:{'content-type':'application/json','x-obot-signature-256':auth(body),...override},body});
 };
 try{await fn({server,events,send,base});}
 finally{await server.whenIdle();await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
}

test('real Obot signature is checked over raw request bytes with HMAC and rejects modifications',()=>{
 const bytes=Buffer.from(JSON.stringify(toolCall()));
 assert.equal(validObotSignature(bytes,auth(bytes),secret),true);
 assert.equal(validObotSignature(Buffer.from(bytes+' '),auth(bytes),secret),false);
 assert.equal(validObotSignature(bytes,'sha256=not-hex',secret),false);
});

test('authenticated targeted tools/call returns HTTP 200 and records a shadow evidence event',async()=>{
 await withServer({},async({send,events,server})=>{
  const response=await send(toolCall());
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{status:'accepted',mode:'observe',observed:true});
  await server.whenIdle();
  assert.equal(events.length,1);
  assert.equal(events[0].schema,'acqpath.shadow-event.v1');
  assert.equal(events[0].resource,'https://medium.com/example');
  assert.equal(events[0].mcp_request_id,1);
  assert.equal(events[0].resolution.schema,'rights-evidence.resolution.v1');
  assert.equal(events[0].resolution.status,'unsupported');
  assert.equal(server.metrics().accepted,1);
 });
});

test('other MCP methods and other tool names are accepted unchanged without charging',async()=>{
 await withServer({},async({send,server,events})=>{
  const other={jsonrpc:'2.0',id:2,method:'tools/list',params:{}};
  const a=await send(other),b=await send(toolCall('https://medium.com/article','ai-index','other_tool'));
  assert.equal(a.status,200);assert.equal(b.status,200);
  await server.whenIdle();
  assert.equal(events.length,0);
  assert.equal(server.metrics().ignored,2);
 });
});

test('outside reviewed origin and invalid URL/purpose do not invoke provider',async()=>{
 let called=0;
 await withServer({resolver:{async resolve(r){called++;return makeResolution({request:r,status:'unsupported'});}}},async({send,server,events})=>{
  for(const msg of [
   toolCall('https://example.org/article'),
   toolCall('http://medium.com/article'),
   toolCall('https://medium.com.evil.test/article'),
   toolCall('https://medium.com/article','not permitted purpose')
  ]) assert.equal((await send(msg)).status,200);
  await server.whenIdle();
  assert.equal(events.length,0);assert.equal(called,0);
 });
});

test('provider failure is logged as unavailable but tool call still receives HTTP 200',async()=>{
 await withServer({resolver:{resolve:async()=>{throw Error('network error');}}},async({send,server,events})=>{
  const r=await send(toolCall());
  assert.equal(r.status,200);
  await server.whenIdle();
  assert.equal(events[0].resolution.status,'unavailable');
  assert.equal(events[0].resolution.error.code,'SHADOW_RESOLVER_FAILED');
 });
});

test('invalid signatures reject before any event is observed',async()=>{
 await withServer({},async({send,server,events})=>{
  const r=await send(toolCall(),{'x-obot-signature-256':'sha256='+'0'.repeat(64)});
  assert.equal(r.status,401);
  await server.whenIdle();assert.equal(events.length,0);
 });
});

test('bounded queue fails open while retaining dropped event metrics',async()=>{
 let started=()=>{},release=()=>{};
 const startedPromise=new Promise(resolve=>started=resolve);
 const locked=new Promise(resolve=>release=resolve);
 await withServer({maxPending:1,resolver:{async resolve(req){started();await locked;return makeResolution({request:req,status:'unsupported'});}}},async({send,server,events})=>{
  const one=await send(toolCall());
  assert.equal(one.status,200);
  await startedPromise;
  const two=await send(toolCall('https://medium.com/other'));
  assert.equal(two.status,200);
  assert.equal((await two.json()).reason,'QUEUE_FULL');
  release();await server.whenIdle();
  assert.equal(events.length,1);
  assert.equal(server.metrics().dropped,1);
 });
});

test('wrong method and path do not masquerade as a webhook',async()=>{
 await withServer({},async({base})=>{
  const r=await fetch(base+'/invalid',{method:'POST'});
  assert.equal(r.status,404);
  const h=await fetch(base+'/healthz');
  assert.equal(h.status,200);
 });
});

test('small configured body limit rejects oversized payload without provider activity',async()=>{
 await withServer({maxBodyBytes:32},async({send,events})=>{
  const r=await send(toolCall());
  assert.equal(r.status,413);assert.equal(events.length,0);
 });
});

test('50-event cap can be configured lower for offline proof and never blocks tool execution',async()=>{
 await withServer({maxProofEvents:2},async({send,server,events})=>{
  for(const u of ['a','b','c']){
   const response=await send(toolCall('https://medium.com/'+u));
   assert.equal(response.status,200);
  }
  await server.whenIdle();
  assert.equal(events.length,2);
  assert.equal(server.metrics().dropped,1);
 });
});

test('weak or missing shared secret refuses startup',()=>{
 assert.throws(()=>createObotShadowServer({secret:'bad',resolver:syntheticUnresolvedProvider(),audit:{write:()=>{}}}),/STRONG_WEBHOOK_SECRET_REQUIRED/);
});

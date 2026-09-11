import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {randomBytes,timingSafeEqual} from 'node:crypto';
import {RightsClient,publicDeliverySummary,MAINNET,validateInput} from '../packages/rights-client/index.mjs';
import {EncryptedCheckpointStore,buyOnce} from '../packages/rights-client/checkpoint-store.mjs';
import {typedAuthorization} from '../packages/rights-client/browser-signer.mjs';
import {ROOT,safeCode,load} from './lib/io.mjs';
import {confirm,hidden} from './lib/prompts.mjs';
export function localAllowed(req,host,origin,token){const got=req.headers['x-acq-local'];return req.headers.host===host&&req.headers.origin===origin&&req.headers['content-type']==='application/json'&&typeof got==='string'&&Buffer.byteLength(got)===Buffer.byteLength(token)&&timingSafeEqual(Buffer.from(got),Buffer.from(token));}
async function body(req){let n=0,parts=[];for await(const b of req){n+=b.length;if(n>16384)throw Error('BODY_TOO_LARGE');parts.push(b);}return JSON.parse(Buffer.concat(parts).toString('utf8'));}
export async function startBuyerDemo(root=ROOT){
 throw Error('OWNER_FUNDED_PURCHASE_DISABLED_PHASE5');
 await confirm('RUN ONE MAINNET PURCHASE DEMO');
 console.log('Not an indexing action. Bazaar metadata is absent in the reviewed server. Maximum 0.05 USDC; use a separate BUYER wallet, never the seller wallet.');
 const password=process.env.ACQ_CHECKPOINT_PASSWORD||await hidden('Local encrypted-checkpoint password (at least 16 characters; remember it for resume)');
 const store=new EncryptedCheckpointStore(join(root,'.private/buyer-checkpoints'),password),id='owner-review-1';
 const token=randomBytes(24).toString('hex');let origin='',host='',pending=null,busy=false,state={status:'IDLE'},buyer=null,timer;
 const client=new RightsClient({maxFeeMicro:'50000',pay:ctx=>new Promise((yes,no)=>{
  let auth;try{auth=typedAuthorization(ctx,buyer);}catch(e){no(e);return;}
  const pid=randomBytes(16).toString('hex');
  pending={id:pid,typedData:auth.typedData,from:buyer,amount_micro:auth.message.value,to:auth.message.to,resolve:signature=>{clearTimeout(timer);pending=null;yes({x402Version:2,resource:ctx.challenge.resource,accepted:ctx.requirements,payload:{signature,authorization:auth.message}});},reject:no};
  state={status:'AWAITING_SIGNATURE'};timer=setTimeout(()=>{const p=pending;pending=null;p?.reject(Error('SIGNATURE_TIMEOUT'));},90000);
 })});
 function send(res,status,obj){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(obj));}
 async function execute(data,resume=false){
  if(busy)throw Error('PURCHASE_ALREADY_RUNNING');busy=true;state={status:resume?'RESUMING':'PREPARING'};
  try{let result;if(resume){const cp=await store.load(id);if(!cp||cp.kind)throw Error('NO_RESUMABLE_CHECKPOINT_REVIEW_REQUIRED');result=await store.withLock(id,()=>client.resume(cp,{onCheckpoint:c=>store.save(id,c)}));}
   else{if(data.confirmation!=='BUY ONE REPORT')throw Error('EXPLICIT_PURCHASE_CONFIRMATION_REQUIRED');if(await store.load(id))throw Error('EXISTING_PURCHASE_RESUME_ONLY');buyer=data.from;const input={resource:data.resource,purpose:data.purpose,tier:data.tier||'fresh',max_total_micro:data.tier==='deep'?'50000':'20000'};validateInput(input);result=await buyOnce(client,input,{store,id});}
   state={status:result.status,result:publicDeliverySummary(result),selfTest:true,organicRevenue:false};
  }catch(e){state={status:'STOPPED',code:/^[A-Z0-9_]{1,100}$/.test(e.message||'')?e.message:safeCode(e),instruction:'Keep checkpoint. Do not create another signature or purchase after ambiguity.'};}
  finally{busy=false;if(pending){pending.reject(Error('PURCHASE_STOPPED'));pending=null;}clearTimeout(timer);}
 }
 const server=createServer(async(req,res)=>{
  try{
   if(req.headers.host!==host){send(res,403,{error:'HOST_REJECTED'});return;}
   const path=new URL(req.url,origin).pathname;
   if(req.method==='GET'&&(path==='/'||path==='/app.js')){
    const file=path==='/'?'index.html':'app.js';let text=await readFile(join(root,'buyer-demo',file),'utf8');if(file==='index.html')text=text.replace('__LOCAL_TOKEN__',token);
    res.writeHead(200,{'content-type':file==='index.html'?'text/html; charset=utf-8':'text/javascript; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','x-frame-options':'DENY','referrer-policy':'no-referrer','content-security-policy':"default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"});res.end(text);return;
   }
   if(req.method!=='POST'||!localAllowed(req,host,origin,token)){send(res,403,{error:'LOCAL_AUTH_REQUIRED'});return;}
   const data=await body(req);
   if(path==='/api/state'){send(res,200,{...state,busy,pending:pending?{id:pending.id,typedData:pending.typedData,from:pending.from,amount_micro:pending.amount_micro,to:pending.to}:null});return;}
   if(path==='/api/signature'){if(!pending||data.id!==pending.id||!/^0x[a-f0-9]{130}$/i.test(data.signature||''))throw Error('INVALID_OR_STALE_SIGNATURE');pending.resolve(data.signature);send(res,200,{accepted:true});return;}
   if(path==='/api/buy'||path==='/api/resume'){if(busy)throw Error('PURCHASE_ALREADY_RUNNING');execute(data,path==='/api/resume');send(res,202,{started:true});return;}
   send(res,404,{error:'NOT_FOUND'});
  }catch(e){send(res,400,{error:/^[A-Z0-9_]{1,100}$/.test(e.message||'')?e.message:'REQUEST_REJECTED'});}
 });
 await new Promise((yes,no)=>{server.once('error',no);server.listen(0,'127.0.0.1',yes);});host='127.0.0.1:'+server.address().port;origin='http://'+host;
 console.log('Open locally in browser with Rabby: '+origin+'/');console.log('Ctrl+C stops this local helper. No payment occurs until explicit button + wallet signature.');
 process.once('SIGINT',()=>{pending?.reject(Error('OWNER_STOPPED'));clearTimeout(timer);server.close();});
 return server;
}

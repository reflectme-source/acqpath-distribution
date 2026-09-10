import {boundedRequest} from './lib/net.mjs';
import {settings,load,writeLocal,ROOT,safeCode} from './lib/io.mjs';
import {join} from 'node:path';
const CDP='https://api.cdp.coinbase.com';const REG='https://registry.modelcontextprotocol.io';
export function ownResource(item,cfg){try{const url=new URL(item.resource);return url.origin===cfg.apiOrigin&&(item.accepts||[]).some(a=>a.network===cfg.payment.network&&String(a.asset).toLowerCase()===cfg.payment.asset.toLowerCase()&&String(a.payTo).toLowerCase()===cfg.payment.payTo.toLowerCase());}catch{return false;}}
export function classifySearch(response,cfg){
 if(response.status===401||response.status===403)return {state:'AUTH_REQUIRED',matches:[],http:response.status};
 if(response.status!==200||!Array.isArray(response.data?.resources))return {state:'UNAVAILABLE',matches:[],http:response.status};
 const matches=response.data.resources.filter(x=>ownResource(x,cfg)).map(x=>({resource:x.resource,description:x.description||null,quality:x.quality||null}));
 return {state:matches.length?'FOUND':response.data.partialResults===true?'NO_MATCH_IN_PARTIAL_RESULTS':'NO_MATCH_FOR_QUERY',http:response.status,matches,partial:response.data.partialResults===true};
}
export async function checkCatalogs(cfg,{queries,fetcher=globalThis.fetch,bearer}={}){
 const results=[];const intents=(queries||['AcqPath','RSL usage rights evidence','AI input rights preflight']).slice(0,cfg.limits.catalogQueriesPerRun-1);
 const requests=[{label:'merchant-and-domain',params:{payTo:cfg.payment.payTo,urlSubstring:new URL(cfg.apiOrigin).host,network:cfg.payment.network,limit:'20'}},...intents.map(q=>({label:q,params:{query:q,network:cfg.payment.network,limit:'20'}}))];
 for(const req of requests){try{const u=CDP+'/platform/v2/x402/discovery/search?'+new URLSearchParams(req.params);const res=await boundedRequest(u,{allowedOrigins:[CDP],headers:bearer?{Authorization:'Bearer '+bearer}:{},timeoutMs:cfg.limits.requestTimeoutMs},fetcher);results.push({query:req.label,...classifySearch(res,cfg)});if(res.status===429)break;}catch(e){results.push({query:req.label,state:'UNAVAILABLE',error:safeCode(e),matches:[]});}}
 let registry={state:'UNAVAILABLE',matches:[]};
 try{const list=await boundedRequest(REG+'/v0.1/servers?'+new URLSearchParams({search:cfg.mcp.name,limit:'100'}),{allowedOrigins:[REG],timeoutMs:cfg.limits.requestTimeoutMs},fetcher);
  if(list.status===200&&Array.isArray(list.data?.servers)){const hits=list.data.servers.filter(x=>{const s=x.server||x;return s.name===cfg.mcp.name&&s.version===cfg.mcp.version&&s.remotes?.some(r=>r.url===cfg.mcp.url);});registry={state:hits.length?'FOUND':list.data.metadata?.nextCursor?'NO_MATCH_IN_PARTIAL_RESULTS':'NO_MATCH_FOR_QUERY',http:200,matches:hits.map(x=>({name:(x.server||x).name,version:(x.server||x).version})),partial:!!list.data.metadata?.nextCursor};}else registry={state:[401,403].includes(list.status)?'AUTH_REQUIRED':'UNAVAILABLE',http:list.status,matches:[]};
 }catch(e){registry={state:'UNAVAILABLE',error:safeCode(e),matches:[]};}
 return {schema:'acqpath.catalog-audit.v1',at:new Date().toISOString(),bazaarSearches:results,mcpRegistry:registry,noPaymentPerformed:true,listingNotInferredFromSearchFailure:true,
 notes:['FOUND means a matching listing, not verified paid execution.','Empty searches are query-specific, not proof of universal absence.','Agentic Market derives its listings from Bazaar; validate its UI independently.']};
}
export async function catalogsCommand(root=ROOT){const cfg=await settings(root),intents=await load(join(root,'metadata/buyer-intents.json'));const r=await checkCatalogs(cfg,{queries:intents.queries,bearer:process.env.ACQ_DISTRIBUTION_CDP_BEARER});await writeLocal('.local/catalog-audit.json',r,root);console.log(JSON.stringify(r,null,2));return r;}

import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {isDeepStrictEqual} from 'node:util';
import {appendFile} from 'node:fs/promises';
import {ROOT,settings,load,writeLocal,safeCode} from './lib/io.mjs';
import {publicAudit} from './audit.mjs';
import {boundedRequest} from './lib/net.mjs';
import {verifyDocs,fetchPublicFile} from './verify-docs.mjs';
import {build} from './build.mjs';

export function contractDrift(observed,contract) {
 const service=contract.capabilities.native_services.find(x=>x.capability==='rights.preflight.v1');
 return !isDeepStrictEqual([...observed.coverage].sort(),[...service.coverage].sort())||observed.freshFeeMicro!==service.fresh_fee_micro||observed.deepFeeMicro!==service.deep_fee_micro||!isDeepStrictEqual([...observed.paidPurposes].sort(),['ai-input','ai-train','ai-index','search'].sort())||observed.providerRouting!==false;
}
export function registryMatches(data,expected) {
 return isDeepStrictEqual(data?.server,expected)&&data?._meta?.['io.modelcontextprotocol.registry/official']?.status==='active';
}
// Only idempotent public registry GETs may retry; metadata mismatches never do.
export async function readRegistry(url,fetcher=globalThis.fetch) {
 const origin='https://registry.modelcontextprotocol.io';
 for(let attempt=1;attempt<=2;attempt++) {
  try {
   const r=await boundedRequest(url,{allowedOrigins:[origin],timeoutMs:25000},fetcher);
   if(attempt===1&&[429,502,503,504].includes(r.status))continue;
   return {...r,attempts:attempt};
  }catch(e){
   const transient=['AbortError','TimeoutError','TypeError'].includes(e.name);
   if(attempt===1&&transient)continue;
   if(['AbortError','TimeoutError'].includes(e.name))throw Object.assign(new Error('Registry read timed out'),{code:'REGISTRY_TIMEOUT'});
   throw e;
  }
 }
}
export async function discoveryCheck(root=ROOT,{fetcher=globalThis.fetch}={}) {
 const cfg=await settings(root),contract=await load(join(root,'metadata/public-contract.json')),expected=await load(join(root,'out/registry/server.json'));
 const checks=[];
 async function check(name,fn) {try{const detail=await fn();checks.push({name,...detail,pass:detail.pass===true});}catch(e){checks.push({name,pass:false,error:safeCode(e)});}}
 await check('public_api_mcp_and_contract',async()=>{const r=await publicAudit(cfg,{fetcher});await writeLocal('.local/public-audit.json',r,root);return {pass:r.status==='PASS'&&!contractDrift(r.observed,contract),audit:r.status,contractDrift:contractDrift(r.observed,contract),noToolInvoked:true};});
 await check('documentation_assets_headers_links',async()=>{const r=await verifyDocs(cfg.publication.docsUrl,root,{fetcher,quiet:true});return {pass:r.state==='PUBLIC_DOCS_VERIFIED',state:r.state,files:r.checks.length,links:r.linkChecks.length};});
 const registry='https://registry.modelcontextprotocol.io';
 await check('official_registry_exact_active_metadata',async()=>{const url=registry+'/v0.1/servers/'+encodeURIComponent(cfg.mcp.name)+'/versions/'+cfg.mcp.version;const r=await readRegistry(url,fetcher);return {pass:r.status===200&&registryMatches(r.data,expected),http:r.status,attempts:r.attempts,url};});
 await check('official_registry_brand_search',async()=>{const url=registry+'/v0.1/servers?search=AcqPath&limit=100';const r=await readRegistry(url,fetcher);return {pass:r.status===200&&r.data?.servers?.some(s=>s.server?.name===cfg.mcp.name&&s.server?.version===cfg.mcp.version),http:r.status,attempts:r.attempts,search:'server-name substring only; semantic discovery tested separately'};});
 const pages=await load(join(root,'metadata/site-pages.json'));
 const external=[...new Set(pages.flatMap(p=>p.sections.flatMap(s=>(s.links||[]).map(l=>l.href))).filter(h=>h.startsWith('https:')))];
 for(const url of external)await check('documentation_external_link',async()=>{const r=await fetchPublicFile(url,{fetcher,allowedOrigins:['https://github.com','https://docs.cdp.coinbase.com','https://acqpath-bazaar-sepolia.acqpath.workers.dev',cfg.apiOrigin],maxBytes:2097152});return {pass:r.http===200,http:r.http,url};});
 for(const record of await load(join(root,'metadata/channel-readbacks.json'))) {
  if(!record.required)continue;
  await check(record.name,async()=>{const r=await fetchPublicFile(record.url,{fetcher,maxBytes:2097152});const body=r.data.toString('utf8');return {pass:r.http===200&&record.requiredText.every(t=>body.includes(t)),http:r.http,url:record.url,scope:'Public metadata readback only; no paid-flow claim'};});
 }
 const report={schema:'acqpath.daily-discovery.v1',at:new Date().toISOString(),state:checks.every(c=>c.pass)?'PASS':'REGRESSION_OR_UNAVAILABLE',checks,noPaymentPerformed:true,noQuoteCreated:true,noAdminCredentialUsed:true};
 await writeLocal('.local/discovery-check.json',report,root);
 const summary='## AcqPath public discovery: '+report.state+'\n\n'+checks.map(c=>'- '+(c.pass?'PASS':'FAIL')+' '+c.name+(c.url?' — '+c.url:'')).join('\n')+'\n\nNo quotes, payments, operator secrets or ranking traffic. Failures include unavailable services and require investigation, not automatic core changes.\n';
 if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,summary);
 console.log(JSON.stringify(report,null,2));return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
 try{await build();if((await discoveryCheck()).state!=='PASS')process.exitCode=2;}catch(e){console.error('DISCOVERY_STOPPED',safeCode(e));process.exitCode=2;}
}

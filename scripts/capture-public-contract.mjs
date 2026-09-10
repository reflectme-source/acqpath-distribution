import {join} from 'node:path';
import {ROOT,settings,writeLocal,exists,load} from './lib/io.mjs';
import {apiCall,boundedRequest} from './lib/net.mjs';
import {github} from './lib/github.mjs';

// A dated, read-only baseline. Never creates quotes or invokes tools.
export async function captureContract(root=ROOT){
 const cfg=await settings(root),directory='.local/phase2-baseline';
 if(await exists(join(root,directory,'baseline.json')))throw Error('BASELINE_ALREADY_CAPTURED_NO_OVERWRITE');
 const at=new Date().toISOString(),responses={};
 for(const [name,path] of Object.entries({capabilities:'/v1/capabilities',openapi:'/openapi.json',serviceInfo:'/v1/service-info'})){
  const r=await apiCall(cfg,path);if(r.status!==200)throw Error('PUBLIC_CONTRACT_UNAVAILABLE');
  responses[name]=r.data;await writeLocal(directory+'/'+name+'.json',r.data,root);
 }
 const headers={'content-type':'application/json',accept:'application/json, text/event-stream'};
 const init=await apiCall(cfg,'/mcp',{method:'POST',headers,body:JSON.stringify({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:cfg.mcp.protocolVersion,capabilities:{},clientInfo:{name:'acqpath-distribution-baseline',version:cfg.version}}})});
 if(init.status!==200||init.data?.result?.protocolVersion!==cfg.mcp.protocolVersion)throw Error('MCP_BASELINE_INITIALIZE_FAILED');
 headers['MCP-Protocol-Version']=cfg.mcp.protocolVersion;if(init.sessionId)headers['Mcp-Session-Id']=init.sessionId;
 await apiCall(cfg,'/mcp',{method:'POST',headers,body:JSON.stringify({jsonrpc:'2.0',method:'notifications/initialized'})});
 const tools=await apiCall(cfg,'/mcp',{method:'POST',headers,body:JSON.stringify({jsonrpc:'2.0',id:2,method:'tools/list'})});
 if(tools.status!==200||!Array.isArray(tools.data?.result?.tools))throw Error('MCP_BASELINE_LIST_FAILED');
 await writeLocal(directory+'/mcp.json',{serverInfo:init.data.result.serverInfo,tools:tools.data.result.tools},root);
 const repo=cfg.publication.githubOwner+'/'+cfg.publication.repo,gh={};
 for(const [name,path]of Object.entries({repository:'repos/'+repo,views:'repos/'+repo+'/traffic/views',clones:'repos/'+repo+'/traffic/clones'})){
  const r=await github(['api',path],{root});if(r.code!==0){gh[name]={state:'UNAVAILABLE'};continue;}
  const d=JSON.parse(r.stdout);gh[name]=name==='repository'?{description:d.description,homepage:d.homepage,topics:d.topics,stars:d.stargazers_count,forks:d.forks_count,createdAt:d.created_at,defaultBranch:d.default_branch}:{count:d.count,uniques:d.uniques,period:name==='views'?d.views:d.clones};
 }
 await writeLocal(directory+'/github.json',gh,root);
 const r=await boundedRequest('https://registry.modelcontextprotocol.io/v0.1/servers/'+encodeURIComponent(cfg.mcp.name)+'/versions/'+encodeURIComponent(cfg.mcp.version),{allowedOrigins:['https://registry.modelcontextprotocol.io'],timeoutMs:30000});
 await writeLocal(directory+'/registry.json',{http:r.status,record:r.data},root);
 const baseline={at,phase:'BEFORE_PHASE_2_OPTIMIZATION',github:gh,registry:{http:r.status,name:cfg.mcp.name,version:cfg.mcp.version},publicApi:await load(join(root,'.local/public-audit.json')),catalogs:await load(join(root,'.local/catalog-audit.json')),documentationVisits:{state:'UNKNOWN',reason:'Pages Web Analytics disabled; Functions metrics report no data and do not measure static page visits.'},integrationActions:null,productionQuotes:null,paidReports:null,externalPayers:null,repeatExternalPayers:null,revenueMicro:null,knownCostsMicro:null,paymentAttribution:null,noQuotesCreated:true,noPayments:true};
 await writeLocal(directory+'/baseline.json',baseline,root);console.log(JSON.stringify({at,state:'BASELINE_CAPTURED',githubViews:gh.views?.count,githubClones:gh.clones?.count,revenue:'UNKNOWN'}));return baseline;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/capture-public-contract.mjs'))captureContract().catch(e=>{console.error(e.message);process.exitCode=1;});

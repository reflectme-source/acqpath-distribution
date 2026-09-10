import {apiCall} from './lib/net.mjs';
import {settings,writeLocal,ROOT,safeCode} from './lib/io.mjs';
export async function publicAudit(cfg,{fetcher=globalThis.fetch}={}){
 const observations={},checks=[],at=new Date().toISOString();
 for(const [name,path]of Object.entries({health:'/health',ready:'/readyz',capabilities:'/v1/capabilities',serviceInfo:'/v1/service-info',keys:'/.well-known/acqpath-keys.json',openapi:'/openapi.json',manifest:'/.well-known/acqpath.json'})){
  try{observations[name]=await apiCall(cfg,path,{},fetcher);}catch(e){observations[name]={status:null,error:safeCode(e),data:null};}
 }
 const add=(name,pass,detail)=>checks.push({name,pass:pass===true,detail});
 const h=observations.health,c=observations.capabilities;
 add('public_health',h.status===200&&h.data?.status==='ok','Public liveness only, not payment validation.');
 add('public_ready',observations.ready.status===200&&observations.ready.data?.status==='ready','Runtime readiness only; not an executed payment.');
 add('expected_source',h.data?.source_sha256===cfg.expectedSourceSha256,'Mismatch stops publication; never auto-approve a new source.');
 add('production_live',h.data?.payments==='live'&&c.data?.payment_mode==='live'&&c.data?.deployment==='production','Configured mode, not an executed purchase.');
 const native=c.data?.native_services?.find(x=>x.capability==='rights.preflight.v1');
 add('rights_enabled',native?.enabled===true&&native?.payments_enabled===true,'Native rights only.');
 add('coverage_disclosed',Array.isArray(native?.coverage)&&native.coverage.length>0,'An allowlisted domain does not guarantee a declaration for every URL.');
 add('openapi_available',observations.openapi.status===200&&!!observations.openapi.data?.paths?.['/v1/rights/quote'],'Prepared quote -> HTTP paid report.');
 const keyList=observations.keys.data?.keys;
 add('evidence_key_matches_pin',Array.isArray(keyList)&&keyList.some(k=>{const v=k.publicKeyJwk||k.jwk||k;return v.kty==='OKP'&&v.crv==='Ed25519'&&v.x===cfg.publicEvidenceKey.x;}),'Do not replace the pin with whatever key the endpoint returns.');
 const mcpHeaders={'content-type':'application/json',accept:'application/json, text/event-stream'};
 try{
  const init=await apiCall(cfg,'/mcp',{method:'POST',headers:mcpHeaders,body:JSON.stringify({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:cfg.mcp.protocolVersion,capabilities:{},clientInfo:{name:'acqpath-distribution-audit',version:cfg.version}}})},fetcher);
  observations.mcpInitialize={status:init.status,data:init.data};
  const pv=init.data?.result?.protocolVersion;
  if(init.status===200&&pv===cfg.mcp.protocolVersion){
   const hdr={...mcpHeaders,'MCP-Protocol-Version':pv};if(init.sessionId)hdr['Mcp-Session-Id']=init.sessionId;
   const note=await apiCall(cfg,'/mcp',{method:'POST',headers:hdr,body:JSON.stringify({jsonrpc:'2.0',method:'notifications/initialized'})},fetcher);
   const tools=await apiCall(cfg,'/mcp',{method:'POST',headers:hdr,body:JSON.stringify({jsonrpc:'2.0',id:2,method:'tools/list'})},fetcher);
   observations.mcpTools={status:tools.status,data:tools.data};
   add('mcp_initialization',note.status===202&&tools.status===200&&Array.isArray(tools.data?.result?.tools),'Stateless Streamable HTTP JSON profile. No tool invocation.');
  }else add('mcp_initialization',false,'MCP handshake did not return the supported protocol/profile.');
 }catch(e){observations.mcpInitialize={status:null,error:safeCode(e)};add('mcp_initialization',false,'MCP handshake unavailable.');}
 const purpose=observations.openapi.data?.components?.schemas?.RightsInput?.properties?.purpose?.enum||[];
 const tools=observations.mcpTools?.data?.result?.tools||[];
 const transport=checks.find(x=>x.name==='mcp_initialization')?.pass===true;
 const pass=checks.every(x=>x.pass);
 return {schema:'acqpath.public-audit.v1',at,status:pass?'PASS':'BLOCKED_OR_UNVERIFIED',apiOrigin:cfg.apiOrigin,expectedSourceSha256:cfg.expectedSourceSha256,checks,
 observed:{sourceSha256:h.data?.source_sha256||null,paymentMode:h.data?.payments||null,coverage:native?.coverage||[],freshFeeMicro:native?.fresh_fee_micro||null,deepFeeMicro:native?.deep_fee_micro||null,paidPurposes:purpose,mcpTools:tools.map(t=>({name:t.name,description:t.description})),mcpTransportChecked:transport,providerRouting:c.data?.features?.quote===true},
 networkSummary:Object.fromEntries(Object.entries(observations).map(([k,v])=>[k,{http:v.status,error:v.error||null}])),
 noPaymentPerformed:true,noQuoteCreated:true,noAdminCredentialUsed:true,independentChainValidation:false,
 limitations:['Only public read-only interfaces and MCP handshake/listing were tested.','Configured LIVE is not proof of a completed payment or workload capacity.','No change to core, RPCs, Access, rates, prices, deployment or wallet.']};
}
export async function auditCommand(root=ROOT){const cfg=await settings(root);console.log('Checking public API and MCP metadata with bounded timeouts; no quotes or payments...');const r=await publicAudit(cfg);await writeLocal('.local/public-audit.json',r,root);console.log(JSON.stringify(r,null,2));return r;}

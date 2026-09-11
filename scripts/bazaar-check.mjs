// Non-paid checks only. No wallet, signing, verify-payment or settlement implementation.
import {readFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {ROOT,load,writeLocal,inside,sha256} from './lib/io.mjs';
import {fetchPublicFile} from './verify-docs.mjs';
export const SEARCHES=['AcqPath','RSL','rights preflight','AI usage rights','crawl rights','AI training rights','RAG ingestion rights','machine-readable content rights'];
export const CDP='https://api.cdp.coinbase.com/platform/v2/x402';
export const PAY_TO='0xf69DBbd053fb0Fbc78ADfdB1BFe3b0D1F57300ec';
export function rejectExternalRefs(value){
 if(!value||typeof value!=='object')return;
 for(const [k,v] of Object.entries(value)){if(['$ref','$id'].includes(k)&&(typeof v!=='string'||!v.startsWith('#')))throw Error('EXTERNAL_SCHEMA_REFERENCE');rejectExternalRefs(v);}
}
export async function schemaValidator(){const {default:Ajv}=await import('../tooling/distribution/node_modules/ajv/dist/2020.js');return new Ajv({strict:false,allErrors:true,validateFormats:false});}
export async function validateDesign(root=ROOT){
 const d=await load(join(root,'metadata/bazaar-design.json'));const ajv=await schemaValidator();
 if(d.status!=='BLOCKED'||d.canonicalPublicResourceUrl!==null||d.appliedToCore!==false)throw Error('UNPROVEN_DISCOVERY_CLAIM');
 for(const schema of [d.quotePrerequisite.inputSchema,d.paidOperation.inputSchema,d.paidOperation.outputSchema]){rejectExternalRefs(schema);ajv.compile(schema);}
 if(!ajv.compile(d.quotePrerequisite.inputSchema)(d.quotePrerequisite.example))throw Error('INVALID_QUOTE_EXAMPLE');
 for(const key of ['report','billing'])if(!ajv.compile(d.paidOperation.outputSchema.properties[key])(d.paidOperation.representativeOutputExcerpt[key]))throw Error('INVALID_OUTPUT_EXCERPT');
 return {state:'BLOCKED',schemaSyntax:'PASS',quoteExample:'PASS',outputExcerpt:'PASS',paidInvocationExample:'OMITTED_PRIVATE_PREREQUISITE',deployableBazaarExtension:false};
}
export async function validatePublicContract(root=ROOT){
 const d=await load(join(root,'metadata/bazaar-public-contract.json'));const ajv=await schemaValidator();
 if(d.schema!=='acqpath.bazaar-public-contract.v1'||d.architecture!=='A_ADDITIVE_HTTP_ADAPTER'||d.appliedToCore!==true||d.indexing!=='UNVERIFIED'||d.settlementPerformed!==false||d.walletSigningPerformed!==false)throw Error('UNPROVEN_DISCOVERY_CLAIM');
 const p=d.productionValidation;
 if(d.productionDeployed!==true||d.productionEndpointActive!==true||d.status!=='PRODUCTION_UNPAID_VERIFIED_PAYMENT_AUTHORIZATION_REQUIRED'||!p||p.version!=='61b19442-bd51-46ec-be31-01422a07f877'||p.sourceSha256!==d.coreSourceSha256||p.health!=='PASS'||p.legacyCompatibility!=='PASS'||p.unpaidDiscovery!=='PASS'||p.cdpValidator?.valid!==true||p.cdpValidator?.simulationAccepted!==true||p.preparedPurchase!=='VERIFIED_NON_UNKNOWN_402')throw Error('UNPROVEN_PRODUCTION_CLAIM');
 if(d.method!=='POST'||d.resource.url!=='https://api.getacqpath.com/v1/rights/preflight'||d.clientRequirements.genericRandomNonceClientCompatible!==false||d.clientRequirements.privateContextInCatalog!==false)throw Error('UNREVIEWED_PUBLIC_CONTRACT');
 for(const schema of [d.inputSchema,d.outputSchema,d.bazaar.schema]){rejectExternalRefs(schema);ajv.compile(schema);}
 if(!ajv.compile(d.bazaar.schema)(d.bazaar.info))throw Error('INVALID_PUBLIC_BAZAAR_EXAMPLE');
 const catalog=JSON.stringify(d.bazaar.info);if(/x-acqpath-claim|payment-signature|authorization|cookie|\/api\/admin/i.test(catalog))throw Error('PRIVATE_CATALOG_DATA');
 return {status:d.status,schemas:'PASS',examples:'SYNTHETIC_SCHEMA_VALID',productionDeployed:true,preparedPurchase:p.preparedPurchase,indexing:'UNVERIFIED',noPaymentPerformed:true};
}
export async function checkChallenge(ch,expected){
 const a=ch?.accepts?.[0];if(ch?.x402Version!==2||ch.accepts?.length!==1||!a)throw Error('BAD_402');
 for(const key of ['scheme','network','amount','asset','payTo','maxTimeoutSeconds'])if(a[key]!==expected[key])throw Error('PAYMENT_TERMS_CHANGED_'+key);
 if(JSON.stringify(a.extra)!==JSON.stringify(expected.extra))throw Error('PAYMENT_TERMS_CHANGED_EXTRA');
 if(ch.resource?.url!==expected.resource||ch.resource.mimeType!=='application/json')throw Error('RESOURCE_CHANGED');
 const ext=ch.extensions?.bazaar;if(!ext)throw Error('BAZAAR_EXTENSION_MISSING');
 rejectExternalRefs(ext.schema);const ajv=await schemaValidator();if(!ajv.compile(ext.schema)(ext.info))throw Error('BAZAAR_SCHEMA_INVALID');
 if(ext.info?.input?.type!=='http'||ext.info.input.method!=='GET')throw Error('UNREVIEWED_PAID_OPERATION');
 if(ext.routeTemplate!=='/v1/rights/reports/:quote_id')throw Error('UNREVIEWED_CANONICAL_TEMPLATE');
 const privateHeaders=Object.keys(ext.info?.input?.headers||{}).some(k=>/claim|authorization|cookie|signature/i.test(k));
 const serialized=JSON.stringify(ext);if(privateHeaders||/\/api\/admin/i.test(serialized)||/[a-f0-9]{48,}/i.test(serialized))throw Error('POTENTIALLY_PRIVATE_CATALOG_DATA');
 // Schema validity alone never proves the private prerequisite or catalog safety.
 return {schema:'PASS',terms:'PASS',state:'BLOCKED',reason:'Private quote prerequisite and full catalog redaction still require a reviewed integration.'};
}
export async function validatePublicCandidate(design,{fetcher=globalThis.fetch}={}){
 if(!['READY FOR TESTNET','TESTNET VERIFIED','READY FOR MAINNET'].includes(design.status)||!design.canonicalPublicResourceUrl)throw Error('BLOCKED_NO_PUBLIC_RESOURCE');
 const u=new URL(design.canonicalPublicResourceUrl);
 if(!['https://acqpath-bazaar-sepolia.acqpath.workers.dev','https://api.getacqpath.com'].includes(u.origin)||u.username||u.password||u.search||u.hash||u.pathname!=='/v1/rights/preflight')throw Error('NONPUBLIC_PROBE_REFUSED');
 if(design.deploymentVerified!==true)throw Error('PUBLIC_DEPLOYMENT_UNVERIFIED');
 const r=await fetcher(CDP+'/validate',{method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),headers:{'content-type':'application/json'},body:JSON.stringify({resource:u.href,method:'POST'})});
 // Do not retain echoed challenge or index details, which may contain private fields.
 if(Number(r.headers.get('content-length')||0)>2097152){await r.body?.cancel();throw Error('VALIDATOR_RESPONSE_TOO_LARGE');}
 const reader=r.body.getReader();let size=0;const chunks=[];for(;;){const p=await reader.read();if(p.done)break;size+=p.value.length;if(size>2097152){await reader.cancel();throw Error('VALIDATOR_RESPONSE_TOO_LARGE');}chunks.push(p.value);}
 const body=JSON.parse(Buffer.concat(chunks));return {http:r.status,valid:body.valid===true,simulationAccepted:body.simulation?.outcome==='accepted',noPaymentPerformed:true,indexingProven:false};
}
export function summarizeResources(body,network,{validateSchema}={}){
 const rows=body?.items??body?.resources;if(!Array.isArray(rows))throw Error('BAD_DISCOVERY_RESPONSE');
 const matched=[];let unsafeResourceCount=0;
 for(const r of rows){const raw=typeof r.resource==='string'?r.resource:r.resource?.url;let u;try{u=new URL(raw);}catch{continue;}
  if(u.origin!=='https://api.getacqpath.com')continue;
  if(u.username||u.password||u.search||u.hash||!['/v1/rights/reports/:quote_id','/v1/rights/preflight'].includes(u.pathname)){unsafeResourceCount++;continue;}
  const terms=Array.isArray(r.accepts)?r.accepts:[];const a=terms.find(x=>x.network===network);const ext=r.extensions?.bazaar;
  let schemaValid=null;try{if(validateSchema&&ext?.schema){rejectExternalRefs(ext.schema);schemaValid=validateSchema(ext.schema,ext.info);}}catch{schemaValid=false;}
  matched.push({endpoint:u.href,descriptionSha256:typeof r.description==='string'?sha256(r.description):null,network:a?.network||null,amount:a?.amount||null,asset:a?.asset||null,payTo:a?.payTo||null,termsMatch:!!a&&a.scheme==='exact'&&a.maxTimeoutSeconds===120&&['20000','50000'].includes(a.amount)&&a.payTo?.toLowerCase()===PAY_TO.toLowerCase()&&a.asset?.toLowerCase()===(network==='eip155:8453'?'0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913':'0x036CbD53842c5426634e7929541eC2318f3dCF7e').toLowerCase(),hasSchema:!!ext?.schema,schemaValid,hasInput:!!ext?.info?.input,hasOutput:!!ext?.info?.output,callable:u.pathname==='/v1/rights/preflight'?'NOT_CALLED_PUBLIC_CANDIDATE':'NOT_CALLED_PRIVATE_PREREQUISITE'});
 }
 return {matched,unsafeResourceCount,returned:rows.length,partialResults:body.partialResults===true,searchMethod:body.searchMethod||null,pagination:body.pagination||null};
}
export async function discoveryReadback(network='eip155:8453',{fetcher=globalThis.fetch,root=ROOT,validateSchema}={}){
 if(!['eip155:8453','eip155:84532'].includes(network))throw Error('UNREVIEWED_NETWORK');
 const checks=[];if(!validateSchema){const ajv=await schemaValidator();validateSchema=(schema,info)=>ajv.compile(schema)(info);}
 async function get(path,params){const u=new URL(CDP+path);for(const [k,v] of Object.entries(params))u.searchParams.set(k,String(v));
  const r=await fetchPublicFile(u.href,{fetcher,allowedOrigins:['https://api.cdp.coinbase.com'],maxBytes:2097152});if(r.http!==200)return {http:r.http,observable:false};return {http:200,observable:true,...summarizeResources(JSON.parse(r.data),network,{validateSchema})};
 }
 // CDP's list API documents only type/limit/offset, unlike the Foundation's generic API.
 // Use supported search filters without a text query for the targeted inventory.
 let complete=false;
 try{checks.push({kind:'list-sample',scope:'First 100 global HTTP resources; cannot prove absence',...await get('/discovery/resources',{type:'http',limit:100,offset:0})});}catch{checks.push({kind:'list-sample',observable:false,error:'DISCOVERY_UNAVAILABLE'});}
 try{const x=await get('/discovery/search',{network,payTo:PAY_TO,urlSubstring:'api.getacqpath.com',limit:20});checks.push({kind:'inventory',...x});complete=x.observable&&!x.partialResults;}catch{checks.push({kind:'inventory',observable:false,error:'DISCOVERY_UNAVAILABLE'});}
 for(const query of SEARCHES)try{checks.push({kind:'search',query,...await get('/discovery/search',{query,network,payTo:PAY_TO,urlSubstring:'api.getacqpath.com',limit:20})});}catch{checks.push({kind:'search',query,observable:false,error:'DISCOVERY_UNAVAILABLE'});}
 const result={at:new Date().toISOString(),state:'BLOCKED',network,inventoryComplete:complete,checks,noPaymentPerformed:true,noSellerEndpointCalled:true,semanticGuarantee:false};
 await writeLocal('.local/bazaar-readback-'+network.split(':')[1]+'.json',result,root);return result;
}
async function main(){const command=process.argv[2]||'design';let result;
 if(command==='design')result=await validateDesign();
 else if(command==='public-design')result=await validatePublicContract();
 else if(command==='validate')result=await validatePublicCandidate(await load(join(ROOT,'metadata/bazaar-design.json')));
 else if(command==='readback')result=await discoveryReadback(process.argv[3]);
 else if(command==='challenge'){
  const paths=process.argv.slice(3).map(p=>resolve(p));if(paths.length!==2||paths.some(p=>!inside(join(ROOT,'.local'),p)))throw Error('PRIVATE_LOCAL_CAPTURE_REQUIRED');
  result=await checkChallenge(JSON.parse(await readFile(paths[0],'utf8')),JSON.parse(await readFile(paths[1],'utf8')));
 }else throw Error('ONLY_NON_PAID_CHECKS_SUPPORTED');
 console.log(JSON.stringify(result,null,2));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(e=>{console.error(/^[A-Z0-9_]+$/.test(e.message)?e.message:'BAZAAR_CHECK_FAILED');process.exitCode=1;});

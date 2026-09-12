import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {ROOT,settings} from './lib/io.mjs';
import {metricSummary} from './metrics.mjs';
export const QUERIES=['AcqPath','RSL rights','AI usage rights','crawl rights','RAG ingestion rights','AI training rights','batch content rights check','did this website AI policy change'];
const endpoints=['https://api.getacqpath.com/v1/rights/preflight','https://api.getacqpath.com/v1/rights/ingestion-gate','https://api.getacqpath.com/v1/rights/revalidate','https://api.getacqpath.com/v1/rights/preflight/x402'];
const CDP='https://api.cdp.coinbase.com/platform/v2/x402',endpoint='https://api.getacqpath.com/v1/rights/preflight';
export function validSkuPayment(e){
 const sku=e.sku||'rights.preflight.v1';
 if(sku==='rights.preflight.stock.fresh.v1')return e.amountMicro==='20000'&&e.tier==='fresh'&&e.operationBindingVerified===true;
 if(sku==='rights.preflight.v1')return ['20000','50000'].includes(e.amountMicro);
 if(e.operationBindingVerified!==true||!['fresh','deep'].includes(e.tier))return false;
 if(sku==='rights.revalidate.v1')return e.amountMicro===(e.tier==='deep'?'60000':'30000');
 if(sku!=='rights.ingestion-gate.v1'||!Number.isInteger(e.uniqueResourceCount)||e.uniqueResourceCount<1||e.uniqueResourceCount>4)return false;
 return e.amountMicro===String((e.tier==='deep'?60000:40000)+e.uniqueResourceCount*(e.tier==='deep'?40000:20000));
}
export function externalBaseline(aggregate,events=[],excluded=[]){
 const deny=new Set(excluded.map(x=>x.toLowerCase())),seen=new Set(),accepted=[],marketplace=[];
 for(const e of events){
  if(e.network!=='eip155:8453'||e.settlementVerified!==true||e.reportDeliveryVerified!==true||e.noDuplicateChargeVerified!==true||!/^0x[a-f0-9]{64}$/i.test(e.transaction||'')||!/^0x[a-f0-9]{40}$/i.test(e.payer||'')||deny.has(e.payer.toLowerCase())||!validSkuPayment(e)||seen.has(e.transaction.toLowerCase()))continue;
  const organic=e.classification==='EXTERNAL_VERIFIED'&&e.independenceVerified===true&&!events.some(other=>other.transaction?.toLowerCase()===e.transaction.toLowerCase()&&other.classification==='MARKETPLACE_VERIFICATION_SETTLEMENT');
  if(!organic&&e.classification!=='MARKETPLACE_VERIFICATION_SETTLEMENT')continue;
  seen.add(e.transaction.toLowerCase());(organic?accepted:marketplace).push(e);
 }
 const counts=new Map();for(const e of accepted)counts.set(e.payer.toLowerCase(),(counts.get(e.payer.toLowerCase())||0)+1);
 const zero=aggregate?.mainnetPaidReports===0&&aggregate?.mainnetReceivedMicro==='0'&&accepted.length===0&&marketplace.length===0;
 const revenue=accepted.reduce((n,e)=>n+BigInt(e.amountMicro),0n),perSku={};
 for(const sku of ['rights.preflight.v1','rights.ingestion-gate.v1','rights.revalidate.v1','rights.preflight.stock.fresh.v1']){const rows=accepted.filter(e=>(e.sku||'rights.preflight.v1')===sku);perSku[sku]={operations:rows.length,revenueMicro:rows.reduce((n,e)=>n+BigInt(e.amountMicro),0n).toString()};}
 const repeats=[...counts.values()].filter(n=>n>1);
 return {externalPaidReports:zero?0:null,repeatExternalPayers:zero?0:null,externalRevenueMicro:zero?'0':null,verifiedExternalPaidReports:accepted.length,verifiedIndependentPayers:counts.size,verifiedRepeatPayers:repeats.length,verifiedExternalRevenueMicro:revenue.toString(),coverage:zero?'ZERO_MAINNET_AGGREGATE':'PARTIAL_OR_UNKNOWN',freshVerified:accepted.filter(e=>(e.sku||'rights.preflight.v1')==='rights.preflight.v1'&&e.amountMicro==='20000').length,deepVerified:accepted.filter(e=>(e.sku||'rights.preflight.v1')==='rights.preflight.v1'&&e.amountMicro==='50000').length,billableUnknownRatio:null,perSku,marketplaceVerification:{operations:marketplace.length,revenueMicro:marketplace.reduce((n,e)=>n+BigInt(e.amountMicro),0n).toString(),organic:false},revenuePerActivePayerMicro:counts.size?Number(revenue)/counts.size:null,operationsPerRepeatPayer:repeats.length?repeats.reduce((a,b)=>a+b,0)/repeats.length:null,triggers:{FIRST_EXTERNAL_PAYMENT:accepted.length>0,FIRST_REPEAT_PAYER:repeats.length>0,'10_EXTERNAL_PAID_REPORTS':accepted.length>=10,'3_INDEPENDENT_PAYERS':counts.size>=3,'100_EXTERNAL_PAID_REPORTS':accepted.length>=100}};
}
async function json(url,options={}){const r=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(20000),...options});const reader=r.body.getReader();let n=0,parts=[];for(;;){const p=await reader.read();if(p.done)break;n+=p.value.length;if(n>2097152){await reader.cancel();throw Error('RESPONSE_LIMIT')}parts.push(p.value)}return {http:r.status,body:JSON.parse(Buffer.concat(parts))};}
export async function monitor({localAggregates=false}={}){
 const cfg=await settings(),checks=[];let aggregate=null;
 const probe=async(name,url)=>{try{const r=await json(url);const rows=r.body.resources||r.body.items||[];const matched=rows.filter(x=>endpoints.includes(typeof x.resource==='string'?x.resource:x.resource?.url)).map(x=>({resource:typeof x.resource==='string'?x.resource:x.resource?.url,terms:x.accepts,hasSchema:!!x.extensions?.bazaar?.schema}));checks.push({name,http:r.http,matched,partial:r.body.partialResults===true});}catch{checks.push({name,http:null,unavailable:true,matched:[]})}};
 try{const h=await json(cfg.apiOrigin+'/health');checks.push({name:'health',http:h.http,pass:h.http===200&&h.body.source_sha256===cfg.expectedSourceSha256&&h.body.payments==='live'})}catch{checks.push({name:'health',pass:false})}
 await probe('merchant',CDP+'/discovery/merchant?'+new URLSearchParams({payTo:cfg.payment.payTo,limit:'20',offset:'0'}));
 await probe('merchant_filtered_search',CDP+'/discovery/search?'+new URLSearchParams({payTo:cfg.payment.payTo,network:cfg.payment.network,urlSubstring:'api.getacqpath.com',limit:'20'}));
 for(const query of QUERIES)await probe(query,CDP+'/discovery/search?'+new URLSearchParams({query,network:cfg.payment.network,limit:'20'}));
 if(localAggregates){
  try{const core='C:/Users/shyxz/Documents/GitHub/AcqPath/PROD/acqpath';const token=(await readFile(join(core,'.secrets/production-operator-token.txt'),'utf8')).trim(),access=JSON.parse(await readFile(join(core,'.secrets/production-v31.json'),'utf8'));if(!token||!access.ACCESS_CLIENT_ID||!access.ACCESS_CLIENT_SECRET)throw Error('MISSING');const r=await json(cfg.apiOrigin+'/api/admin/rights/stats',{headers:{Authorization:'Bearer '+token,'CF-Access-Client-Id':access.ACCESS_CLIENT_ID,'CF-Access-Client-Secret':access.ACCESS_CLIENT_SECRET}});if(r.http!==200)throw Error('FAILED');aggregate=metricSummary(r.body);checks.push({name:'local_aggregate_read',pass:true});}catch{checks.push({name:'local_aggregate_read',pass:false,error:'UNAVAILABLE_NO_CREDENTIALS_EXPOSED'})}
 }
 let evidence={events:[],excludedWallets:[cfg.payment.payTo]};if(localAggregates)try{evidence=JSON.parse(await readFile(join(ROOT,'.private/external-revenue-evidence.json'),'utf8'))}catch{}
 const baseline=externalBaseline(aggregate,evidence.events,[cfg.payment.payTo,...(evidence.excludedWallets||[])]);
 const validTerms=x=>x.terms?.some(a=>a.network===cfg.payment.network&&a.payTo?.toLowerCase()===cfg.payment.payTo.toLowerCase()&&a.asset?.toLowerCase()===cfg.payment.asset.toLowerCase()&&({[endpoints[0]]:['20000','50000'],[endpoints[1]]:['60000','80000','100000','120000','140000','180000','220000'],[endpoints[2]]:['30000','60000'],[endpoints[3]]:['20000']}[x.resource]||[]).includes(a.amount));
 const bazaarBySKU=Object.fromEntries(endpoints.map(url=>[url,checks.some(c=>c.matched?.some(x=>x.resource===url&&validTerms(x)))?'LISTED_READBACK':'AWAITING FIRST EXTERNAL SETTLEMENT']));
 const found=checks.some(c=>c.matched?.some(validTerms));
 const report={at:new Date().toISOString(),checks,aggregate,baseline,bazaarBySKU,bazaar:found?'LISTED_READBACK':'AWAITING FIRST EXTERNAL SETTLEMENT',agenticMarket:found?'BAZAAR_SOURCE_LISTED_UI_READBACK_REQUIRED':'AWAITING FIRST EXTERNAL SETTLEMENT',externalSettlementProven:baseline.verifiedExternalPaidReports>0,noPaymentPerformed:true,noQuoteCreated:true};
 await mkdir(join(ROOT,'.local/phase5'),{recursive:true});const file=join(ROOT,'.local/phase5/monitor.json');let old;try{old=JSON.parse(await readFile(file))}catch{}
 report.meaningfulChange=!!old&&(old.bazaar!==report.bazaar||JSON.stringify(old.aggregate)!==JSON.stringify(aggregate)||JSON.stringify(old.baseline)!==JSON.stringify(baseline));
 // Ignore timestamp-only aggregate refreshes when evaluating change.
 if(old?.aggregate&&aggregate){const {at:a,...before}=old.aggregate,{at:b,...after}=aggregate;report.meaningfulChange=old.bazaar!==report.bazaar||JSON.stringify(before)!==JSON.stringify(after)||JSON.stringify(old.baseline)!==JSON.stringify(baseline)}
 await writeFile(file,JSON.stringify(report,null,2));console.log(JSON.stringify({at:report.at,bazaar:report.bazaar,baseline,aggregateAvailable:!!aggregate,checks:checks.map(c=>({name:c.name,http:c.http,pass:c.pass,matches:c.matched?.length})),noPaymentPerformed:true}));return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)monitor({localAggregates:process.argv.includes('--local-aggregates')}).catch(()=>{console.error('MONITOR_UNAVAILABLE');process.exitCode=1});

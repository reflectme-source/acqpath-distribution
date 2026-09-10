import {join} from 'node:path';
import {settings,load,writeLocal,ROOT,noSymlinks} from './lib/io.mjs';
import {apiCall} from './lib/net.mjs';
import {confirm} from './lib/prompts.mjs';
const count=n=>{if(!Number.isSafeInteger(n)||n<0)throw Error('INVALID_METRIC_COUNT');return n;};
const money=s=>{if(typeof s!=='string'||!/^(0|[1-9][0-9]*)$/.test(s)||s.length>30)throw Error('INVALID_METRIC_MONEY');return BigInt(s);};
export function metricSummary(s){
 if(!Array.isArray(s.payments)||!Array.isArray(s.repeats))throw Error('INVALID_NATIVE_STATS');const rows=s.payments.filter(x=>x.network==='eip155:8453');let received=0n,paid=0,payers=0,repeats=0;
 for(const r of rows){received+=money(r.received_micro);paid+=count(r.paid_reports);payers+=count(r.payer_identifiers);}
 for(const r of s.repeats.filter(x=>x.network==='eip155:8453'))repeats+=count(r.repeat_payer_identifiers);
 return {schema:'acqpath.business-summary.v1',at:new Date().toISOString(),availableQuotesRecorded:count(s.quotes),metadataFetches:count(s.metadata_fetches),mainnetPaidReports:paid,mainnetReceivedMicro:received.toString(),mainnetWalletIdentifiers:payers,repeatWalletIdentifiers:repeats,
 organicCustomers:null,organicRevenueMicro:null,netProfitMicro:null,costStatus:s.cost_status||'NOT_IMPORTED',externalPayersVerified:false,
 interpretation:['Available-quote records do not include every rejected or unavailable input.','Wallet identifiers are not verified independent customers.','Aggregates alone cannot exclude self-purchases or identify acquisition channel.','Revenue is not profit; settlement receipt is not independent chain verification.']};
}
export async function importMetrics(file,root=ROOT){const r=metricSummary(await load(file));await writeLocal('.local/business-summary.json',r,root);console.log(JSON.stringify(r,null,2));return r;}
export async function collectMetrics(core,root=ROOT){
 // Optional, explicit local read only. Never invoked by public CI, prepare, audit or catalog tasks.
 await confirm('READ PRODUCTION AGGREGATES');const cfg=await settings(root);const tokenPath=join(core,'.secrets/production-operator-token.txt'),accessPath=join(core,'.secrets/production-v31.json');await noSymlinks(tokenPath);await noSymlinks(accessPath);
 const {readFile}=await import('node:fs/promises');const token=(await readFile(tokenPath,'utf8')).trim();const access=await load(accessPath);
 if(!token||!access.ACCESS_CLIENT_ID||!access.ACCESS_CLIENT_SECRET)throw Error('LOCAL_READONLY_STATS_CREDENTIAL_MISSING');
 const result=await apiCall(cfg,'/api/admin/rights/stats',{headers:{Authorization:'Bearer '+token,'CF-Access-Client-Id':access.ACCESS_CLIENT_ID,'CF-Access-Client-Secret':access.ACCESS_CLIENT_SECRET}});
 if(result.status!==200)throw Error('STATS_READ_FAILED_HTTP_'+result.status);
 const safe=metricSummary(result.data);await writeLocal('.local/business-summary.json',safe,root);console.log(JSON.stringify(safe,null,2));return safe;
}

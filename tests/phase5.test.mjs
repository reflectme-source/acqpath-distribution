import test from 'node:test';import assert from 'node:assert/strict';
import {externalBaseline} from '../scripts/phase5-monitor.mjs';
import {startBuyerDemo} from '../scripts/buyer-demo.mjs';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

test('current public buyer guidance keeps SIWX support distinct from unclaimed clients',async()=>{
 const pages=JSON.parse(await readFile(new URL('../metadata/site-pages.json',import.meta.url)));
 for(const slug of ['public-http','quickstart','http-x402','connect','recovery','bazaar-status']){
  const page=JSON.stringify(pages.find(p=>p.slug===slug));
  for(const text of ['TypeScript','Python','AcqPath SIWX adapter','zero-config','Payments MCP','UNVERIFIED'])assert.ok(page.includes(text),slug+' missing '+text);
 }
 for(const file of ['README.md','examples/README.md','examples/public-preflight.mjs','examples/read-only.py','docs/PHASE5-BUYER-JOURNEY.md','metadata/site-pages.json']){
  const text=await readFile(new URL('../'+file,import.meta.url),'utf8');
  assert.doesNotMatch(text,/use the binding nonce|Required custom nonce incompatible|Generic random-nonce payment wrappers are incompatible|generic paid client example remains blocked/i,file);
 }
 const guide=await readFile(new URL('../examples/OFFICIAL-CLIENTS.md',import.meta.url),'utf8');
 for(const text of ['npm install','pip install','2.25.0','2.22.0','0.28.1','2.2.0','deliveryVerified','not application-level encrypted','operation ID','0.02 USDC','0.05 USDC'])assert.ok(guide.includes(text),text);
});

test('documentation hotfix preserves the reviewed paid adapter source hashes',async()=>{
 const provenance=JSON.parse(await readFile(new URL('../metadata/official-client-provenance.json',import.meta.url)));
 assert.equal(provenance.productionVersion,'0c3b5794-f428-4e69-879e-29cab293cd1a');
 for(const file of provenance.files){const bytes=await readFile(new URL('../'+file.file,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256,file.file);}
});
test('owner purchase is disabled before any prompt or wallet operation',async()=>{await assert.rejects(startBuyerDemo(),/OWNER_FUNDED_PURCHASE_DISABLED_PHASE5/)});
test('unknown aggregates never manufacture zero external revenue',()=>{assert.equal(externalBaseline(null).externalRevenueMicro,null);assert.equal(externalBaseline({mainnetPaidReports:0,mainnetReceivedMicro:'0'}).externalRevenueMicro,'0')});
test('demand milestones exclude internal, unverified, other networks and duplicate transactions',()=>{const good={network:'eip155:8453',classification:'EXTERNAL_VERIFIED',independenceVerified:true,settlementVerified:true,reportDeliveryVerified:true,noDuplicateChargeVerified:true,transaction:'0x'+'1'.repeat(64),payer:'0x'+'2'.repeat(40),amountMicro:'20000'};const result=externalBaseline(null,[good,good,{...good,transaction:'0x'+'3'.repeat(64),classification:'INTERNAL_INDEXING_QA'},{...good,network:'eip155:84532'},{...good,independenceVerified:false}]);assert.equal(result.verifiedExternalPaidReports,1);assert.equal(result.triggers.FIRST_EXTERNAL_PAYMENT,true);assert.equal(result.triggers.FIRST_REPEAT_PAYER,false);assert.equal(result.externalPaidReports,null);assert.equal(externalBaseline(null,[good],[good.payer]).verifiedExternalPaidReports,0)});

test('public unpaid sample rejects price drift and never submits payment',async()=>{
 const {preflight}=await import('../examples/public-preflight.mjs');let calls=0;
 const fetcher=async(url,options)=>{calls++;assert.equal(url,'https://api.getacqpath.com/v1/rights/preflight');assert.equal(options.headers['PAYMENT-SIGNATURE'],undefined);return new Response('',{status:402,headers:{'payment-required':Buffer.from(JSON.stringify({x402Version:2,resource:{url},accepts:[{scheme:'exact',amount:'20001',network:'eip155:8453'}]})).toString('base64')}})};
 await assert.rejects(preflight('https://rslstandard.org/','ai-input',{fetcher}),/Unexpected payment terms/);assert.equal(calls,1);
});
test('public sample holds unsupported input without pretending delivery',async()=>{const {preflight}=await import('../examples/public-preflight.mjs');let calls=0;await assert.rejects(preflight('https://rslstandard.org/','crawl',{fetcher:()=>{calls++}}));assert.equal(calls,0);const result=await preflight('https://example.org/','ai-input',{fetcher:async()=>Response.json({available:false,charge_micro:'0',reason:'NO_EVIDENCE'})});assert.equal(result.ingestionAuthorized,false);assert.equal(result.charged,'0')});

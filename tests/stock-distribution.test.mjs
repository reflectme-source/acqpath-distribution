import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {externalBaseline,validSkuPayment} from '../scripts/phase5-monitor.mjs';
test('stock marketplace verification is never organic revenue, and stock accepts only bound fresh 20000 evidence',()=>{
 const e={sku:'rights.preflight.stock.fresh.v1',tier:'fresh',amountMicro:'20000',operationBindingVerified:true,network:'eip155:8453',settlementVerified:true,reportDeliveryVerified:true,noDuplicateChargeVerified:true,transaction:'0x'+'1'.repeat(64),payer:'0x'+'2'.repeat(40),classification:'MARKETPLACE_VERIFICATION_SETTLEMENT',independenceVerified:true};
 assert.equal(validSkuPayment(e),true);for(const patch of [{amountMicro:'50000'},{tier:'deep'},{operationBindingVerified:false}])assert.equal(validSkuPayment({...e,...patch}),false);
 const r=externalBaseline(null,[e,e,{...e,classification:'EXTERNAL_VERIFIED'}]);assert.equal(r.marketplaceVerification.operations,1);assert.equal(r.marketplaceVerification.revenueMicro,'20000');assert.equal(r.verifiedExternalPaidReports,0);assert.equal(r.verifiedExternalRevenueMicro,'0');
});
test('dual-mode pages state separate stock scope and residual risk without altering SIWX adapter',async()=>{
 const pages=JSON.parse(await readFile(new URL('../metadata/site-pages.json',import.meta.url)));
 for(const slug of ['stock-x402','index','quickstart','public-http','connect','recovery','bazaar-status']){const p=JSON.stringify(pages.find(p=>p.slug===slug));for(const word of ['/v1/rights/preflight/x402','0.02','SIWX','UNVERIFIED'])assert.ok(p.includes(word),slug+' '+word);}
 const guide=await readFile(new URL('../examples/STOCK-X402.md',import.meta.url),'utf8');for(const word of ['2.25.0','2.22.0','20000','eip155:8453','before presentation','same saved body','does not','PAYMENT-SIGNATURE'])assert.ok(guide.includes(word),word);
 const api=JSON.parse(await readFile(new URL('../metadata/openapi.public.json',import.meta.url)));assert.equal(api.paths['/v1/rights/preflight/x402'].post['x-payment-info'].client.siwxRequired,false);assert.equal(api.paths['/v1/rights/preflight'].post['x-payment-info'].client.adapterRequired,true);
});

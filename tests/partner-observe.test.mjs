import test from 'node:test';
import assert from 'node:assert/strict';
import {createPartnerObserve} from '../examples/partner-observe.mjs';
import {makeResolution} from '../packages/evidence-bridge/index.mjs';
const args={url:'https://example.com/article'};
const setup=(extra={})=>{
  const events=[],calls=[];
  const adapter=createPartnerObserve({
    toolNames:['web_fetch'],configuredDefaultPurpose:'ai-input',
    resolver:{async resolve(request){calls.push(request);return makeResolution({request,status:'unavailable',error:{code:'OFFLINE_FIXTURE'}});}},
    audit:{async write(event){events.push(event);}},
    ...extra
  });
  return {adapter,events,calls};
};
test('shadow call preserves original action and explicitly labels configured purpose',async()=>{
 const {adapter,events,calls}=setup();
 let count=0;
 const original={status:'existing-ok',body:'not touched'};
 const actual=await adapter.call({name:'web_fetch',arguments:args,execute:async p=>{count++;assert.equal(p.url,args.url);return original;}});
 assert.equal(actual,original);
 assert.equal(count,1);
 await adapter.whenIdle();
 assert.equal(calls.length,0,'No paid buyer invoked by default');
 assert.equal(events.length,1);
 assert.equal(events[0].purpose,'ai-input');
 assert.equal(events[0].purpose_source,'configured_default');
 assert.equal(events[0].resolution.status,'unavailable');
 assert.equal(events[0].resolution.error.code,'PAID_BUYER_DISABLED_SHADOW_ONLY');
 assert.equal('decision' in events[0],false);
});
test('paid callback is only invoked after explicit operator opt-in',async()=>{
 const {adapter,events,calls}=setup({paidBuyerApproved:true});
 await adapter.call({name:'web_fetch',arguments:{...args,purpose:'ai-index'},execute:()=>42});
 await adapter.whenIdle();
 assert.equal(calls.length,1);
 assert.equal(calls[0].intended_use.purpose,'ai-index');
 assert.equal(events[0].purpose_source,'explicit');
 assert.equal(events[0].resolution.error.code,'OFFLINE_FIXTURE');
});
test('malformed explicit purpose is not substituted by the configured default',async()=>{
 const {adapter,events}=setup({paidBuyerApproved:true});
 const r=await adapter.call({name:'web_fetch',arguments:{...args,purpose:'crawl'},execute:()=>({ok:true})});
 await adapter.whenIdle();
 assert.deepEqual(r,{ok:true});
 assert.equal(events.length,0);
 assert.equal(adapter.metrics().ignored,1);
});
test('unsafe/private/credential/query URLs are excluded without blocking the tool',async()=>{
 const {adapter,events}=setup({paidBuyerApproved:true});
 const bad=['http://example.com/','https://127.0.0.1/','https://169.254.169.254/','https://localhost/','https://host.local/','https://example.com/a?token=x','https://bob:secret@example.com/'];
 let executed=0;
 for(const url of bad){await adapter.call({name:'web_fetch',arguments:{url},execute:()=>{executed++;return 'ok';}});}
 await adapter.whenIdle();
 assert.equal(executed,bad.length);
 assert.equal(events.length,0);
 assert.equal(adapter.metrics().ignored,bad.length);
});
test('tool allowlist and max event cap never modify the original operation',async()=>{
 const {adapter,events,calls}=setup({maxEvents:1,paidBuyerApproved:true});
 const a=await adapter.call({name:'other',arguments:args,execute:()=>1});
 const b=await adapter.call({name:'web_fetch',arguments:args,execute:()=>2});
 const c=await adapter.call({name:'web_fetch',arguments:args,execute:()=>3});
 await adapter.whenIdle();
 assert.deepEqual([a,b,c],[1,2,3]);
 assert.equal(events.length,1);
 assert.equal(calls.length,1);
 assert.deepEqual(adapter.metrics(),{accepted:1,ignored:1,dropped:1,pending:0,mode:'OBSERVE_ONLY',paidBuyerApproved:true});
});
test('provider failure is unavailable evidence and never authorization',async()=>{
 const {adapter,events}=setup({paidBuyerApproved:true,resolver:{async resolve(){throw Error('network failed');}}});
 assert.equal(await adapter.call({name:'web_fetch',arguments:args,execute:()=>55}),55);
 await adapter.whenIdle();
 assert.equal(events[0].resolution.status,'unavailable');
 assert.equal(events[0].resolution.error.code,'RESOLVER_FAILED_OR_UNVERIFIED');
 assert.equal('allow' in events[0],false);
});
test('configuration rejects default purpose or unbounded budget',()=>{
 assert.throws(()=>setup({configuredDefaultPurpose:'crawl'}),/UNSUPPORTED_DEFAULT_PURPOSE/);
 assert.throws(()=>setup({maxEvents:500}),/BOUNDED_OBSERVE_QUOTA_REQUIRED/);
 assert.throws(()=>createPartnerObserve({configuredDefaultPurpose:'ai-input'}),/EXPLICIT_TOOL_ALLOWLIST_REQUIRED/);
});

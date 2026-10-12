import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderPage} from '../scripts/site.mjs';

const load=async p=>JSON.parse(await readFile(new URL('../'+p,import.meta.url),'utf8'));
const pages=await load('metadata/site-pages.json');
const home=pages.find(x=>x.slug==='index');
const cfg=await load('config/distribution.json');
const contract=await load('metadata/public-contract.json');

test('developer homepage sells missing evidence before stock x402 and prices',()=>{
 assert.match(home.title,/source URL is not a source-rights record/);
 const names=home.sections.map(s=>s.title);
 assert.deepEqual(names.slice(0,4),[
  'The URL is not the source-rights record',
  'Why the missing evidence matters',
  'Illustrative example: before and after',
  'Add the evidence layer; keep policy control'
 ]);
 assert.ok(names.indexOf('Rights Gateway: select the paid operation')>4);
 const html=renderPage(home,pages,cfg,contract);
 assert.ok(html.includes('Missing source-rights context'));
 assert.ok(html.includes('Evidence for your own policy'));
 assert.ok(html.includes('Illustrative only'));
 assert.ok(!html.includes('Fresh report</span>'));
 assert.ok(html.includes('href="/quickstart"'));
});

test('partner pages lead with audit value while preserving existing technical contract',()=>{
 const partners=pages.find(p=>p.slug==='partners');
 const kit=pages.find(p=>p.slug==='partners/integration-kit');
 assert.match(partners.sections[0].title,/later review/i);
 assert.match(kit.sections[0].title,/after integration/i);
 assert.ok(kit.sections.some(s=>s.title==='Architecture'));
 assert.ok(kit.sections.some(s=>s.title==='Production limits you should design around'));
 const quickstart=pages.find(p=>p.slug==='quickstart');
 assert.ok(quickstart.sections.some(s=>s.title==='Rights Gateway: select the paid operation'));
});

test('use cases preserve evidence boundaries and avoid fictional purchase promises',()=>{
 const slugs=['ai-input','rag-ingestion','training','indexing-search','partners/gateway','partners/crawler','partners/rag','partners/policy-engine','recovery'];
 for(const slug of slugs){
  const page=pages.find(p=>p.slug===slug);
  assert.equal(page.sections[0].title,'Why this evidence matters',slug);
  assert.match(page.sections[0].paragraphs.join(' '),/not a licence or legal clearance/i,slug);
 }
 const all=JSON.stringify(pages);
 assert.doesNotMatch(all,/free trial for everyone|guaranteed licensing clearance|unlimited crawl permission/i);
 assert.match(all,/Stock x402 remains reviewed-origins-only/);
});

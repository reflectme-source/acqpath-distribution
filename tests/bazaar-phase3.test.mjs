import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {artifactPath,docsArtifact,DOCS_TARGET} from '../scripts/docs-artifact.mjs';
import {rejectExternalRefs,summarizeResources,discoveryReadback,validatePublicCandidate,SEARCHES,PAY_TO} from '../scripts/bazaar-check.mjs';
test('Docs artifact rejects executable paths, traversal and hidden credentials',()=>{
 for(const p of ['_worker.js','_routes.json','functions/a.html','../x.html','.private/key.json','a//b.html','a.js','examples/unreviewed.py','functions/acqpath.mjs','acqpath.mjs'])assert.throws(()=>artifactPath(p));
 for(const p of ['index.html','_headers','.nojekyll','.well-known/acqpath-distribution.json','examples/read-only.mjs','examples/acqpath.mjs','examples/acqpath_httpx.py','examples/official-node.mjs','examples/official-python.py','skills/acqpath/SKILL.md'])assert.equal(artifactPath(p),p);
 assert.deepEqual(DOCS_TARGET,{account:'449109f33c0c400ea8aef1100c801da6',project:'acqpath-distribution',branch:'main'});
});
test('Docs artifact binds every byte and the exact source commit',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'acqpath-docs-artifact-'));
 try{await mkdir(join(dir,'out/site'),{recursive:true});await writeFile(join(dir,'out/site/index.html'),'<h1>AcqPath</h1>');await writeFile(join(dir,'out/site/_headers'),'/*\n  X-Frame-Options: DENY');
  await docsArtifact('seal','a'.repeat(40),dir);await docsArtifact('verify','a'.repeat(40),dir);
  await assert.rejects(()=>docsArtifact('verify','b'.repeat(40),dir),/MISMATCH/);
  await writeFile(join(dir,'out/site/index.html'),'<script>changed</script>');await assert.rejects(()=>docsArtifact('verify','a'.repeat(40),dir),/MISMATCH/);
  await mkdir(join(dir,'out/site/.wrangler'));await writeFile(join(dir,'out/site/.wrangler/cache.json'),'{}');await assert.rejects(()=>docsArtifact('seal','a'.repeat(40),dir),/UNSAFE_DOCS_PATH/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('Bazaar schemas cannot load external network or filesystem references',()=>{
 for(const uri of ['https://evil.example.org/schema','file:///etc/passwd','other.json'])assert.throws(()=>rejectExternalRefs({properties:{nested:{$ref:uri}}}),/EXTERNAL_SCHEMA_REFERENCE/);
 rejectExternalRefs({$ref:'#/definitions/example'});
});
test('Readback with a private quote URL is flagged without recording the identifier',()=>{
 const q='a'.repeat(48);const r=summarizeResources({resources:[{resource:'https://api.getacqpath.com/v1/rights/reports/'+q}]},'eip155:8453');
 assert.equal(r.unsafeResourceCount,1);assert.equal(JSON.stringify(r).includes(q),false);assert.deepEqual(r.matched,[]);
});
test('Catalog match requires exact origin and records payment mismatch without calling seller',()=>{
 const r=summarizeResources({resources:[{resource:'https://api.getacqpath.com.evil.org/v1/rights/reports/:quote_id'},{resource:'https://api.getacqpath.com/v1/rights/reports/:quote_id',accepts:[{network:'eip155:8453',scheme:'exact',amount:'99999',payTo:PAY_TO}]}]},'eip155:8453');
 assert.equal(r.matched.length,1);assert.equal(r.matched[0].termsMatch,false);assert.equal(r.matched[0].callable,'NOT_CALLED_PRIVATE_PREREQUISITE');assert.equal(SEARCHES.length,8);
});
test('Phase 3 design stays blocked and keeps paid purpose coverage truthful',async()=>{
 const d=JSON.parse(await readFile(new URL('../metadata/bazaar-design.json',import.meta.url)));
 assert.equal(d.status,'BLOCKED');assert.equal(d.appliedToCore,false);assert.equal(d.canonicalPublicResourceUrl,null);assert.equal(d.paidOperation.example,null);
 assert.deepEqual(d.quotePrerequisite.inputSchema.properties.purpose.enum,['ai-input','ai-train','ai-index','search']);
 assert.ok(d.service.description.length<=500);assert.ok(d.service.serviceName.length<=32);assert.ok(d.service.tags.length<=5);
});
test('Discovery checks use documented filters and never call a seller or paid endpoint',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'acqpath-bazaar-readback-'));const requests=[];
 try{const result=await discoveryReadback('eip155:84532',{root:dir,validateSchema:()=>true,fetcher:async(url,options)=>{const u=new URL(url);requests.push(u);assert.equal(u.origin,'https://api.cdp.coinbase.com');assert.equal(options.method,undefined);assert.equal(options.headers,undefined);assert.ok(['/platform/v2/x402/discovery/resources','/platform/v2/x402/discovery/search'].includes(u.pathname));return Response.json(u.pathname.endsWith('/resources')?{items:[],pagination:{total:0}}:{resources:[],partialResults:false,searchMethod:'hybrid'});}});
  assert.equal(requests.length,10);assert.equal(requests[0].searchParams.has('payTo'),false);assert.equal(requests[1].searchParams.get('network'),'eip155:84532');assert.equal(result.inventoryComplete,true);assert.equal(result.noSellerEndpointCalled,true);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('Docs deploy gate never targets the core Worker and all Actions are commit pinned',async()=>{
 const text=await readFile(new URL('../.github/workflows/docs-deploy.yml',import.meta.url),'utf8');
 assert.ok(text.includes("vars.DOCS_AUTODEPLOY_ENABLED == 'true'"));assert.ok(text.includes('environment: distribution-docs'));
 assert.ok(text.includes('--project-name=acqpath-distribution'));assert.ok(!text.includes('acqpath-production'));assert.ok(!text.includes('wrangler deploy'));
 for(const line of text.split('\n').filter(x=>x.includes('uses:')))assert.match(line,/uses: [\w/-]+@[a-f0-9]{40}$/);
});
test('Public validation remains disabled until a reviewed nonprivate candidate exists',async()=>{
 let calls=0;const fetcher=async()=>{calls++;throw Error('NETWORK_NOT_EXPECTED');};
 await assert.rejects(()=>validatePublicCandidate({status:'BLOCKED',canonicalPublicResourceUrl:null},{fetcher}),/BLOCKED_NO_PUBLIC_RESOURCE/);
 for(const url of ['https://api.getacqpath.com/v1/rights/reports/'+'a'.repeat(48),'https://api.getacqpath.com/api/admin/test','https://api.getacqpath.com/v1/rights/reports/:quote_id','https://attacker.example.org/report'])await assert.rejects(()=>validatePublicCandidate({status:'READY FOR TESTNET',canonicalPublicResourceUrl:url},{fetcher}),/NONPUBLIC_PROBE_REFUSED/);
 assert.equal(calls,0);
});

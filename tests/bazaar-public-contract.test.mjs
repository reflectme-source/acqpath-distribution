import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validatePublicCandidate,summarizeResources,PAY_TO} from '../scripts/bazaar-check.mjs';

test('Prepared production offers never claim wallet payment or indexing',async()=>{
 const d=JSON.parse(await readFile(new URL('../metadata/bazaar-public-contract.json',import.meta.url)));
 assert.equal(d.appliedToCore,true);assert.equal(d.productionDeployed,true);assert.equal(d.productionEndpointActive,true);
 assert.equal(d.productionValidation.preparedPurchase,'VERIFIED_NON_UNKNOWN_402');assert.equal(d.productionValidation.cdpValidator.valid,true);
 assert.equal(d.indexing,'UNVERIFIED');assert.equal(d.walletSigningPerformed,false);assert.equal(d.settlementPerformed,false);
 assert.equal(d.resource.url,'https://api.getacqpath.com/v1/rights/preflight');assert.equal(d.method,'POST');
 assert.equal(d.clientRequirements.genericRandomNonceClientCompatible,false);assert.equal(d.clientRequirements.privateContextInCatalog,false);
 assert.equal(d.bazaar.info.input.method,'POST');assert.equal(d.examplesAreSynthetic,true);
 assert.equal(d.liveIntegration.mcpPaidDelivery,false);assert.equal(d.liveIntegration.npmPublished,false);
});

test('Nonpaid validation requires deployment evidence and the exact approved public operation',async()=>{
 let calls=0;const fetcher=async()=>{calls++;throw Error('NO_NETWORK_EXPECTED');};
 const base={status:'READY FOR TESTNET',deploymentVerified:true};
 for(const url of ['https://api.getacqpath.com/readyz','https://api.getacqpath.com/v1/rights/quote','https://api.getacqpath.com/v1/rights/preflight?private=x','https://api-staging.getacqpath.com/v1/rights/preflight'])await assert.rejects(()=>validatePublicCandidate({...base,canonicalPublicResourceUrl:url},{fetcher}),/NONPUBLIC_PROBE_REFUSED/);
 await assert.rejects(()=>validatePublicCandidate({...base,deploymentVerified:false,canonicalPublicResourceUrl:'https://acqpath-bazaar-sepolia.acqpath.workers.dev/v1/rights/preflight'},{fetcher}),/PUBLIC_DEPLOYMENT_UNVERIFIED/);
 assert.equal(calls,0);
});

test('Validator sends POST contract metadata to CDP without payment or private headers',async()=>{
 const resource='https://acqpath-bazaar-sepolia.acqpath.workers.dev/v1/rights/preflight';let calls=0;
 const result=await validatePublicCandidate({status:'READY FOR TESTNET',deploymentVerified:true,canonicalPublicResourceUrl:resource},{fetcher:async(url,options)=>{
  calls++;assert.equal(url,'https://api.cdp.coinbase.com/platform/v2/x402/validate');assert.equal(options.method,'POST');
  assert.deepEqual(JSON.parse(options.body),{resource,method:'POST'});assert.deepEqual(options.headers,{'content-type':'application/json'});
  return Response.json({valid:true,simulation:{outcome:'accepted'}});
 }});
 assert.equal(calls,1);assert.equal(result.noPaymentPerformed,true);assert.equal(result.indexingProven,false);
});

test('Discovery recognizes a future stable public resource without calling it',()=>{
 const result=summarizeResources({resources:[{resource:'https://api.getacqpath.com/v1/rights/preflight',accepts:[{network:'eip155:8453',scheme:'exact',amount:'20000',payTo:PAY_TO,maxTimeoutSeconds:120,asset:'0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'}]}]},'eip155:8453');
 assert.equal(result.matched.length,1);assert.equal(result.unsafeResourceCount,0);assert.equal(result.matched[0].termsMatch,true);
});

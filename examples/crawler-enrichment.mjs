import {makeEvidenceRequest} from '../packages/evidence-bridge/index.mjs';

export async function enrichCrawlerResult({result,purpose='ai-index',resolver,context={}}={}){
  if(!result||typeof result.url!=='string')throw Error('CRAWLER_RESULT_URL_REQUIRED');
  if(!resolver||typeof resolver.resolve!=='function')throw Error('RESOLVER_REQUIRED');
  const request=makeEvidenceRequest({resource:result.url,purpose,context:{...context,integration:'crawler'}});
  const rightsEvidence=await resolver.resolve(request);
  return {...result,rightsEvidence};
}

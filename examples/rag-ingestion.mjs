import {makeEvidenceRequest} from '../packages/evidence-bridge/index.mjs';

export async function attachRagEvidence({document,resolver,purpose='ai-index',context={}}={}){
  if(!document||typeof document.source_url!=='string')throw Error('SOURCE_URL_REQUIRED');
  if(!resolver||typeof resolver.resolve!=='function')throw Error('RESOLVER_REQUIRED');
  const request=makeEvidenceRequest({resource:document.source_url,purpose,context:{...context,integration:'rag-ingestion'}});
  const sourceRights=await resolver.resolve(request);
  return {...document,metadata:{...(document.metadata||{}),source_rights:sourceRights}};
}

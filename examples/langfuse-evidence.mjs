// Source-only integration. No SDK credentials, settlement or network operations here.
import {isIP} from 'node:net';
import {
  makeEvidenceRequest, makeResolution, validateRightsEvidence
} from '../packages/evidence-bridge/index.mjs';

const PURPOSES=new Set(['ai-input','ai-index','ai-train','search']);
const STATUSES=new Set(['resolved','unavailable','unsupported','invalid']);
const DIGEST_REF=/^urn:acqpath:evidence:sha256:[a-f0-9]{64}$/;
const UNSAFE_SUFFIXES=['.localhost','.local','.internal','.test','.invalid','.example','.onion'];
const plain=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);

function assertPublicHttps(resource){
  if(typeof resource!=='string'||!resource||resource.length>2048||resource.includes('\\'))
    throw Error('INVALID_OR_UNSAFE_SOURCE_URL');
  let url;
  try{url=new URL(resource);}catch{throw Error('INVALID_OR_UNSAFE_SOURCE_URL');}
  const host=url.hostname.toLowerCase().replace(/\.$/,'');
  if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||
      (url.port&&url.port!=='443')||!host.includes('.')||isIP(host)!==0||
      host==='metadata.google.internal'||host==='localhost'||
      UNSAFE_SUFFIXES.some(suffix=>host.endsWith(suffix)))
    throw Error('INVALID_OR_UNSAFE_SOURCE_URL');
  // Backend must still perform its own DNS, redirect, IP and TLS checks.
}

function contractOrInvalid(request,result){
  const invalid=code=>makeResolution({request,status:'invalid',error:{code}});
  if(!plain(result)||result.schema!=='rights-evidence.resolution.v1'||
      !STATUSES.has(result.status)||!plain(result.request)||
      result.request.resource!==request.resource||
      result.request.intended_use?.purpose!==request.intended_use.purpose||
      !Array.isArray(result.evidence))
    return invalid('UNVERIFIED_RESOLUTION_CONTRACT');
  if(result.status==='resolved'){
    if(!result.evidence.length)return invalid('EMPTY_RESOLVED_EVIDENCE');
    for(const evidence of result.evidence){
      try{validateRightsEvidence(evidence);}catch{return invalid('INVALID_EVIDENCE_SHAPE');}
      if(evidence.resource!==request.resource||
         evidence.intended_use?.purpose!==request.intended_use.purpose)
        return invalid('EVIDENCE_REQUEST_BINDING_MISMATCH');
      // Verification MUST be performed by the upstream Evidence Bridge provider.
      if(evidence.verification?.status!=='verified')
        return invalid('UNVERIFIED_EVIDENCE');
      if(!DIGEST_REF.test(evidence.provenance?.evidence_ref||'')||
         !evidence.provenance?.observed_at)
        return invalid('INCOMPLETE_ATTESTATION_PROVENANCE');
    }
  }else if(result.evidence.length){
    return invalid('UNRESOLVED_WITH_EVIDENCE');
  }
  return result;
}

function summarize(request,resolution,mode,at){
  const evidence=resolution.status==='resolved'?resolution.evidence:[];
  const statements=[...new Set(evidence.map(item=>item.statement))];
  const expiration=evidence.length&&evidence.every(item=>item.provenance.expires_at)
    ?(evidence.every(item=>Date.parse(item.provenance.expires_at)>at.getTime())?'fresh':'expired')
    :'unknown';
  return {
    acqpathSchema:'rights-evidence.resolution.v1',
    acqpathMode:mode,
    acqpathStatus:resolution.status,
    acqpathPurpose:request.intended_use.purpose,
    acqpathStatement:statements.length===1?statements[0]:(statements.length?'multiple':'none'),
    acqpathEvidenceVerified:evidence.length>0,
    acqpathEvidenceCount:evidence.length,
    acqpathEvidenceRef:evidence.length===1?evidence[0].provenance.evidence_ref:null,
    acqpathObservedAt:evidence.length===1?evidence[0].provenance.observed_at:null,
    acqpathExpiresAt:evidence.length===1?evidence[0].provenance.expires_at:null,
    acqpathFreshness:expiration,
    acqpathFailureCode:resolution.status==='resolved'?null:String(resolution.error?.code||'NO_EVIDENCE')
  };
}

function safeScore(scoreClient,metadata){
  if(!scoreClient||metadata.acqpathMode!=='paid_authorized')return;
  try{
    scoreClient.score.activeObservation({
      name:'acqpath_evidence_verified',
      value:metadata.acqpathEvidenceVerified?1:0,
      dataType:'BOOLEAN'
    });
    if(metadata.acqpathFreshness!=='unknown')
      scoreClient.score.activeObservation({
        name:'acqpath_evidence_fresh',
        value:metadata.acqpathFreshness==='fresh'?1:0,
        dataType:'BOOLEAN'
      });
  }catch{/* Observability failure does not change a source-use decision. */}
}

/**
 * Records externally VERIFIED evidence inside an existing Langfuse trace, or
 * creates a root observation if called without an active trace. No paid call
 * occurs unless BOTH paidBuyerApproved and a separately authorized resolver
 * are provided. Neither a score nor a declaration grants content-use rights.
 */
export function createLangfuseEvidenceAdapter({
  startActiveObservation, resolver=null, scoreClient=null,
  paidBuyerApproved=false, maxEvents=25, maxInFlight=8,
  now=()=>new Date(), onAudit=null
}={}){
  if(typeof startActiveObservation!=='function')throw Error('LANGFUSE_TRACER_REQUIRED');
  if(typeof paidBuyerApproved!=='boolean')throw Error('EXPLICIT_PAID_BUYER_POLICY_REQUIRED');
  if(paidBuyerApproved&&typeof resolver?.resolve!=='function')
    throw Error('VERIFIED_PAID_RESOLVER_REQUIRED');
  if(scoreClient!==null&&typeof scoreClient?.score?.activeObservation!=='function')
    throw Error('LANGFUSE_SCORE_CLIENT_INVALID');
  if(onAudit!==null&&typeof onAudit!=='function')throw Error('AUDIT_CALLBACK_INVALID');
  if(typeof now!=='function'||!Number.isInteger(maxEvents)||maxEvents<1||maxEvents>50||
     !Number.isInteger(maxInFlight)||maxInFlight<1||maxInFlight>16)
    throw Error('BOUNDED_OBSERVE_LIMITS_REQUIRED');

  let accepted=0,pending=0,dropped=0;
  async function record({resource,purpose}={}){
    assertPublicHttps(resource);
    if(!PURPOSES.has(purpose))throw Error('EXPLICIT_SUPPORTED_PURPOSE_REQUIRED');
    const request=makeEvidenceRequest({
      resource,purpose,context:{integration:'langfuse',adoption_mode:'observe'}
    });
    if(accepted>=maxEvents||pending>=maxInFlight){
      dropped++;
      return makeResolution({
        request,status:'unavailable',error:{code:'LOCAL_OBSERVE_CAP_REACHED'}
      });
    }
    accepted++;
    pending++;
    const mode=paidBuyerApproved?'paid_authorized':'shadow_no_purchase';
    let resolution=null;
    const resolve=async()=>{
      if(resolution)return resolution;
      if(!paidBuyerApproved)
        return resolution=makeResolution({
          request,status:'unavailable',error:{code:'PAID_BUYER_DISABLED_SHADOW_ONLY'}
        });
      try{
        resolution=contractOrInvalid(request,await resolver.resolve(request));
      }catch{
        resolution=makeResolution({
          request,status:'unavailable',error:{code:'RESOLVER_FAILED'}
        });
      }
      return resolution;
    };
    const observe=async span=>{
      const result=await resolve();
      const at=now();
      const timestamp=at instanceof Date&&!Number.isNaN(at.getTime())?at:new Date(0);
      const metadata=summarize(request,result,mode,timestamp);
      try{span?.update?.({metadata});}catch{/* Never break ingestion for telemetry. */}
      safeScore(scoreClient,metadata);
      if(onAudit)try{
        await onAudit({schema:'acqpath.langfuse-observe.v1',at:timestamp.toISOString(),metadata});
      }catch{/* Audit callback health must be monitored by its owning application. */}
      return result;
    };
    try{
      return await startActiveObservation('acqpath-rights-observation',observe);
    }catch{
      // If tracing fails before its callback executes, evidence resolution
      // remains available. If it fails after, never run a paid resolver twice.
      return resolution||await resolve();
    }finally{pending--;}
  }
  return Object.freeze({
    record,
    metrics:()=>Object.freeze({accepted,pending,dropped,mode:paidBuyerApproved?'paid_authorized':'shadow_no_purchase'})
  });
}

import { requireThat, Fault } from './lib/errors.mjs';
import { canonical, sha256, token, base64JSON, decode64JSON, verifyEvidence } from './lib/crypto.mjs';
import { verifyJWS, signingKid } from './lib/jws.mjs';
import { micro } from './lib/money.mjs';
async function read(response) {
    const reader=response.body?.getReader(); requireThat(reader,'BAD_RESPONSE','Empty response.',502);
    let size=0; const chunks=[];
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>262144){await reader.cancel();throw new Fault('RESPONSE_LIMIT','Response exceeds 256 KiB.',502);}chunks.push(value);}
    const bytes=new Uint8Array(size);let n=0;for(const c of chunks){bytes.set(c,n);n+=c.length;}
    let body;try{body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{throw new Fault('BAD_RESPONSE','Invalid response JSON.',502);}
    requireThat(response.status===200,body.error||'HTTP_FAILURE',body.message||'Request failed.',response.status);
    return body;
}
function validateQuote(client,q,input){
    requireThat(q.available===true && q.mode==='rights_preflight' && /^[a-f0-9]{48}$/.test(q.quote_id||'') && /^[a-f0-9]{64}$/.test(q.claim_token||''),'BAD_QUOTE','Invalid rights quote.');
    requireThat(q.redeem_url===client.base+'/v1/rights/reports/'+q.quote_id,'BAD_QUOTE','Quote changes resource or origin.');
    requireThat(q.fee_micro===q.total_micro && micro(q.total_micro)<=micro(input.max_total_micro),'BUDGET_EXCEEDED','Rights fee exceeds requested budget.');
    const p=client.servicePaymentPolicy;
    requireThat(p && q.payment?.network===p.network && q.payment.asset?.toLowerCase()===p.asset?.toLowerCase() && q.payment.payTo?.toLowerCase()===p.payTo?.toLowerCase() && micro(q.fee_micro)<=micro(p.maxFeeMicro),'SERVICE_PAYMENT_POLICY','Pin network, asset, recipient and maximum fee locally.');
}
async function offer(client,q,ch,checkTime=true){
    requireThat(ch.x402Version===2 && ch.resource?.url===q.redeem_url && ch.accepts?.length===1,'BAD_OFFER','Unexpected challenge.');
    const a=ch.accepts[0];
    const domains = { 'eip155:84532': {name:'USDC',asset:'0x036cbd53842c5426634e7929541ec2318f3dcf7e'}, 'eip155:8453': {name:'USD Coin',asset:'0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'} };
    const domain = domains[a.network];
    requireThat(a.scheme==='exact' && a.amount===q.fee_micro && a.network===q.payment.network && a.asset?.toLowerCase()===q.payment.asset.toLowerCase() && a.payTo?.toLowerCase()===q.payment.payTo.toLowerCase() && domain && a.asset?.toLowerCase()===domain.asset && a.extra?.name===domain.name && a.extra.version==='2' && Number.isSafeInteger(a.maxTimeoutSeconds) && a.maxTimeoutSeconds>0 && a.maxTimeoutSeconds<=300,'BAD_OFFER','Challenge differs from pinned quote.');
    const o=ch.extensions?.['offer-receipt']?.info?.offers?.[0];
    requireThat(o?.format==='jws' && o.acceptIndex===0 && !o.payload,'BAD_OFFER','Signed JWS offer required.');
    const v=await verifyJWS(o.signature,client.key,signingKid(client.base));
    requireThat(v && v.version===1 && v.resourceUrl===q.redeem_url && v.scheme===a.scheme && v.network===a.network && v.asset===a.asset && v.payTo===a.payTo && v.amount===a.amount && v.validUntil===Math.floor(q.expires_at/1000),'BAD_OFFER','Offer signature or exact terms rejected.');
    if(checkTime)requireThat(v.validUntil>Math.floor(Date.now()/1000),'QUOTE_EXPIRED','Offer expired before signing.');
    return o;
}
async function verifyDelivery(client,checkpoint,result){
    const {quote:q,input,challenge:ch,payload}=checkpoint;
    await offer(client,q,ch,false);
    requireThat(await verifyEvidence(result.evidence,client.key),'BAD_EVIDENCE','Report signature rejected.');
    const signed={...result};delete signed.evidence;delete signed.payment_settlement;delete signed.delivery_proof;
    requireThat(canonical(signed)===canonical(result.evidence.payload) && signed.quote_id===q.quote_id && signed.billing?.fee_type==='rights_preflight_report' && signed.billing.amount_micro===q.fee_micro,'BAD_EVIDENCE','Report differs from signed quote.');
    requireThat(result.report?.resource===input.resource && result.report.purpose===input.purpose && result.report.user_class===(input.user_class||'commercial') && result.report.geo===(input.geo||null) && result.report.legal_clearance===false,'REPORT_MISMATCH','Report describes another resource or context.');
    const settlement=result.payment_settlement;
    requireThat(settlement?.success===true && settlement.network===q.payment.network && /^0x[a-f0-9]{64}$/i.test(settlement.transaction||''),'BAD_SETTLEMENT','A successful settlement receipt is required.');
    const r=settlement.extensions?.['offer-receipt']?.info?.receipt;
    const receipt=r?.format==='jws' && await verifyJWS(r.signature,client.key,signingKid(client.base));
    requireThat(receipt && receipt.version===1 && receipt.network===q.payment.network && receipt.resourceUrl===q.redeem_url && receipt.transaction===settlement.transaction && receipt.payer?.toLowerCase()===payload.payload.authorization.from.toLowerCase() && Number.isSafeInteger(receipt.issuedAt) && receipt.issuedAt<=Math.floor(Date.now()/1000)+30,'BAD_RECEIPT','Settlement receipt does not match this purchase.');
    requireThat(await verifyEvidence(result.delivery_proof,client.key),'BAD_DELIVERY_PROOF','Delivery proof signature rejected.');
    const d=result.delivery_proof.payload;
    requireThat(d.version==='acqpath-delivery-v1' && d.quote_id===q.quote_id && d.resource_url===q.redeem_url && d.report_sha256===await sha256(canonical({...signed,evidence:result.evidence})) && d.offer_sha256===await sha256(canonical(ch.extensions['offer-receipt'].info.offers[0])) && d.network===q.payment.network && d.asset.toLowerCase()===q.payment.asset.toLowerCase() && d.pay_to.toLowerCase()===q.payment.payTo.toLowerCase() && d.amount_micro===q.fee_micro && d.transaction===settlement.transaction,'BAD_DELIVERY_PROOF','Offer/report/amount/transaction binding rejected.');
    return result;
}
export async function rightsQuote(client,input){
    return read(await client.fetcher(client.base+'/v1/rights/quote',{method:'POST',redirect:'error',headers:{'content-type':'application/json'},body:JSON.stringify(input)}));
}
export async function buyRightsPreflight(client,input,{onCheckpoint}={}){
    requireThat(typeof onCheckpoint==='function','CHECKPOINT_REQUIRED','Provide a durable onCheckpoint callback before signing; never log its contents.');
    const q=await rightsQuote(client,input);if(!q.available)return {status:'UNAVAILABLE',quote:q};
    validateQuote(client,q,input);
    const id=token(16);client.budget.reserve(id,q.total_micro);
    let submitted=false;
    try{
        const response=await client.fetcher(q.redeem_url,{headers:{'X-AcqPath-Claim':q.claim_token},redirect:'error'});
        requireThat(response.status===402,'BAD_GATE','Expected an unpaid 402 response.');
        const ch=decode64JSON(response.headers.get('PAYMENT-REQUIRED'));await offer(client,q,ch);
        requireThat(typeof client.pay==='function','SIGNER_REQUIRED','A local x402 signer is required.');
        const payload=await client.pay({challenge:ch,requirements:ch.accepts[0],url:q.redeem_url,maxAmountMicro:q.fee_micro});
        requireThat(payload?.x402Version===2 && canonical(payload.accepted)===canonical(ch.accepts[0]) && payload.payload?.authorization,'SIGNER_MISMATCH','Signer changed payment terms.');
        payload.extensions={...payload.extensions,'payment-identifier':{info:{id:token(16)}}};
        const checkpoint={format:'acqpath-rights-checkpoint-v1',base:client.base,input,quote:q,challenge:ch,payload,reservation_id:id,completed:false};
        await onCheckpoint(structuredClone(checkpoint));
        submitted=true;return await resumeRightsPreflight(client,checkpoint,{onCheckpoint});
    }catch(e){if(!submitted)client.budget.release(id);e.quote_id=q.quote_id;e.reservation_id=id;throw e;}
}
export async function resumeRightsPreflight(client,c,{onCheckpoint}={}){
    requireThat(c?.format==='acqpath-rights-checkpoint-v1' && c.base===client.base && /^[a-f0-9]{32}$/.test(c.reservation_id||''),'BAD_CHECKPOINT','Wrong checkpoint origin or format.');
    validateQuote(client,c.quote,c.input);await offer(client,c.quote,c.challenge,false);
    requireThat(canonical(c.payload.accepted)===canonical(c.challenge.accepts[0]),'BAD_CHECKPOINT','Checkpoint payment terms differ.');
    const completed=client.rightsCompleted?.has(c.reservation_id);
    if(!completed && !client.budget.pending.has(c.reservation_id))client.budget.reserve(c.reservation_id,c.quote.total_micro);
    // Reuse the exact stored authorization. Never invoke the wallet on a retry.
    const response=await client.fetcher(c.quote.redeem_url,{redirect:'error',headers:{'X-AcqPath-Claim':c.quote.claim_token,'PAYMENT-SIGNATURE':base64JSON(c.payload)}});
    const body=await read(response),result=await verifyDelivery(client,c,body);
    if(!completed){client.budget.commit(c.reservation_id,c.quote.fee_micro);client.rightsCompleted??=new Set();client.rightsCompleted.add(c.reservation_id);}
    if(onCheckpoint)await onCheckpoint({...c,completed:true});
    return {status:'DELIVERED',result,quote_id:c.quote.quote_id,charged_micro:c.quote.fee_micro,independent_chain_validation:false};
}

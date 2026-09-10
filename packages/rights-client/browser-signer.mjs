import {MAINNET} from './index.mjs';
const address=/^0x[a-f0-9]{40}$/i;
export function typedAuthorization(ctx,from,{now=Math.floor(Date.now()/1000),nonce}={}){
 const a=ctx.requirements,c=ctx.challenge;
 if(!address.test(from||'')||from.toLowerCase()===MAINNET.payTo.toLowerCase())throw Error('USE_SEPARATE_BUYER_WALLET');
 if(a?.network!==MAINNET.network||a.scheme!=='exact'||a.asset?.toLowerCase()!==MAINNET.asset.toLowerCase()||a.payTo?.toLowerCase()!==MAINNET.payTo.toLowerCase()||a.extra?.name!=='USD Coin'||a.extra?.version!=='2')throw Error('UNTRUSTED_PAYMENT_REQUIREMENTS');
 if(typeof a.amount!=='string'||!/^[1-9][0-9]{0,4}$/.test(a.amount)||BigInt(a.amount)>50000n||BigInt(a.amount)>BigInt(ctx.maxAmountMicro))throw Error('MAX_SINGLE_PAYMENT_005_USDC');
 if(!Number.isSafeInteger(a.maxTimeoutSeconds)||a.maxTimeoutSeconds<1||a.maxTimeoutSeconds>300)throw Error('INVALID_PAYMENT_TIMEOUT');
 if(c?.resource?.url!==ctx.url||!ctx.url.startsWith(MAINNET.origin+'/v1/rights/reports/')||!/^https:\/\/api\.getacqpath\.com\/v1\/rights\/reports\/[a-f0-9]{48}$/.test(ctx.url))throw Error('INVALID_PAYMENT_RESOURCE');
 const n=nonce||'0x'+Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
 if(!/^0x[a-f0-9]{64}$/i.test(n))throw Error('INVALID_NONCE');
 const message={from,to:MAINNET.payTo,value:a.amount,validAfter:String(now-30),validBefore:String(now+Math.min(120,a.maxTimeoutSeconds)),nonce:n};
 return {message,typedData:{domain:{name:'USD Coin',version:'2',chainId:8453,verifyingContract:MAINNET.asset},primaryType:'TransferWithAuthorization',types:{EIP712Domain:[{name:'name',type:'string'},{name:'version',type:'string'},{name:'chainId',type:'uint256'},{name:'verifyingContract',type:'address'}],TransferWithAuthorization:[{name:'from',type:'address'},{name:'to',type:'address'},{name:'value',type:'uint256'},{name:'validAfter',type:'uint256'},{name:'validBefore',type:'uint256'},{name:'nonce',type:'bytes32'}]},message}};
}
export function createBrowserSigner(provider,{approve}={}){
 if(!provider?.request||typeof approve!=='function')throw Error('PROVIDER_AND_APPROVAL_REQUIRED');
 return async ctx=>{
  const chain=await provider.request({method:'eth_chainId'});if(BigInt(chain)!==8453n)throw Error('SELECT_BASE_MAINNET_IN_WALLET');
  const accounts=await provider.request({method:'eth_requestAccounts'});const from=accounts?.[0];const auth=typedAuthorization(ctx,from);
  if(await approve({from,to:auth.message.to,amount_micro:auth.message.value,network:MAINNET.network,asset:MAINNET.asset,validBefore:auth.message.validBefore})!==true)throw Error('PAYMENT_NOT_APPROVED');
  const sig=await provider.request({method:'eth_signTypedData_v4',params:[from,JSON.stringify(auth.typedData)]});
  if(!/^0x[a-f0-9]{130}$/i.test(sig||''))throw Error('EOA_SIGNATURE_REQUIRED');
  return {x402Version:2,resource:ctx.challenge.resource,accepted:ctx.requirements,payload:{signature:sig,authorization:auth.message}};
 };
}

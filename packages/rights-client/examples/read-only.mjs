import {RightsClient,publicQuoteSummary} from '../index.mjs';
const client=new RightsClient();
try{
 const caps=await client.capabilities();
 const native=caps.native_services?.find(x=>x.capability==='rights.preflight.v1');
 console.log(JSON.stringify({payment_mode:caps.payment_mode,coverage:native?.coverage||[],fresh_fee_micro:native?.fresh_fee_micro,deep_fee_micro:native?.deep_fee_micro},null,2));
 const resource=process.argv[2];
 if(resource){
  if(!native?.coverage?.includes(new URL(resource).origin))throw Error('URL_NOT_IN_CURRENT_APPROVED_COVERAGE');
  const quote=await client.quote({resource,purpose:'ai-input',tier:'fresh',max_total_micro:'20000'});
  // Sensitive claim data is intentionally not printed. This quote-only example makes no purchase.
  console.log(JSON.stringify(publicQuoteSummary(quote),null,2));
 }
}catch(e){console.error('Request failed:',e.code||e.message);process.exitCode=1;}

import {pathToFileURL} from 'node:url';
import {RightsClient} from '../packages/rights-client/index.mjs';
export async function readCapabilities(){
 const caps=await new RightsClient().capabilities();
 const rights=caps.native_services?.find(s=>s.capability==='rights.preflight.v1');
 return {available:rights?.enabled===true,coverage:rights?.coverage||[],freshFeeMicro:rights?.fresh_fee_micro,deepFeeMicro:rights?.deep_fee_micro,quoteCreated:false,paymentPerformed:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await readCapabilities(),null,2));

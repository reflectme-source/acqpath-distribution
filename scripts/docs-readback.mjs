import {setTimeout} from 'node:timers/promises';
import {verifyDocs} from './verify-docs.mjs';
const origins=['https://developers.getacqpath.com','https://acqpath-distribution.pages.dev'];
let failed=false;
for(const origin of origins){let report;for(let n=0;n<3;n++){report=await verifyDocs(origin,undefined,{quiet:true});if(report.state==='PUBLIC_DOCS_VERIFIED')break;if(n<2)await setTimeout(20000);}console.log(JSON.stringify({origin,state:report.state,files:report.checks.length,links:report.linkChecks.length}));if(report.state!=='PUBLIC_DOCS_VERIFIED')failed=true;}
if(failed)process.exitCode=1;

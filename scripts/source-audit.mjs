import {readFile,realpath} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {load,sha256,ROOT,noSymlinks,inside,writeLocal} from './lib/io.mjs';
// Only this fixed set of source files is read. No secrets, no process.env, no imports/execution from core.
export async function inspectCore(core,root=ROOT){
 const target=await realpath(resolve(core));await noSymlinks(target);
 if(inside(target,root)||inside(root,target))throw Error('WORKSPACE_MUST_BE_SEPARATE_FROM_CORE');
 const baseline=await load(join(root,'metadata/reference-files.json'));const files=[];const text={};
 for(const entry of baseline.files){const path=join(target,entry.path);await noSymlinks(path);const bytes=await readFile(path);if(bytes.length>2097152)throw Error('SOURCE_FILE_TOO_LARGE');const normalized=bytes.toString('utf8').replace(/\r\n/g,'\n');const hash=sha256(normalized);files.push({path:entry.path,sha256:hash,matchesReviewedFile:hash===entry.sha256});text[entry.path]=normalized;}
 const allMatch=files.every(x=>x.matchesReviewedFile);
 const relevant=['src/payments/extensions.mjs','src/native/service.mjs','src/payments/x402.mjs'];
 const mentionsBazaar=relevant.some(p=>/\bbazaar\b/i.test(text[p]));
 return {schema:'acqpath.readonly-source-audit.v1',at:new Date().toISOString(),status:allMatch?'SELECTED_FILES_MATCH':'SOURCE_DRIFT_REVIEW_REQUIRED',files,
 bazaar:{status:mentionsBazaar?'MANUAL_PATH_REVIEW_NEEDED':'NOT_FOUND_IN_REVIEWED_PAYMENT_PATH',noAutomaticIndexingPayment:true},
 mcpPaidDelivery:'HTTP_X402_OUTSIDE_NATIVE_MCP',scope:'Selected files only, not a fresh full-core audit or proof of remote deployed bytes.',coreFilesChanged:false,secretsRead:false};
}
export async function sourceAuditCommand(core,root=ROOT){const report=await inspectCore(core,root);await writeLocal('.local/source-audit.json',report,root);console.log(JSON.stringify(report,null,2));return report;}

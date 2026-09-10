import {settings,load,exists,writeLocal,ROOT} from './lib/io.mjs';
import {join} from 'node:path';
export async function status(root=ROOT){
 const cfg=await settings(root);const records={};for(const [name,file]of Object.entries({publicAudit:'public-audit.json',sourceAudit:'source-audit.json',catalogAudit:'catalog-audit.json',github:'github-publication.json',docs:'cloudflare-publication.json',dns:'dns-publication.json',registrySubmission:'registry-publication.json',npm:'npm-publication.json',smithery:'smithery-publication.json',business:'business-summary.json'})){records[name]=await exists(join(root,'.local',file))?await load(join(root,'.local',file)):null;}
 const r={schema:'acqpath.distribution.status.v1',at:new Date().toISOString(),publicAudit:records.publicAudit?.status||'NOT_RUN',referenceSource:records.sourceAudit?.status||'NOT_COMPARED',
 channels:{github:records.github?.state||'NOT_READ_BACK',docs:records.docs?.state||'NOT_READ_BACK',bazaar:records.catalogAudit?.bazaarSearches?.some(x=>x.state==='FOUND')?'FOUND_REQUIRES_PAID_FLOW_VALIDATION':'UNVERIFIED_OR_NOT_FOUND_IN_QUERIES',mcpRegistry:records.catalogAudit?.mcpRegistry?.state||'UNVERIFIED',npm:records.npm?.state||'NOT_PUBLISHED',smithery:records.smithery?.state||'NOT_PUBLISHED',pulseMcp:'CURATED_SUBMISSION_NOT_AUTOMATED'},
 noCoreChanges:true,noAutomaticPayments:true,organicRevenueMicro:records.business?.organicRevenueMicro??null,
 blockers:['Reference payment path lacks Bazaar metadata; do not create an indexing payment under the no-core-change scope.','Registry presence is not customer demand.','Last owner log reports degraded reconciliation and low quote/fetch caps.'],
 next:'Read the actual publication states. Do not equate local verification, submission, or configured LIVE with paid customer success.'};
 await writeLocal('.local/status.json',r,root);console.log(JSON.stringify(r,null,2));return r;
}

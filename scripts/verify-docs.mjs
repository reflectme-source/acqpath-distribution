import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {ROOT,load,settings,sha256,writeLocal,safeCode} from './lib/io.mjs';

export async function verifyDocs(base, root=ROOT) {
 const cfg=await settings(root);
 base=base||cfg.publication.docsUrl;
 const origin=new URL(base).origin;
 if(!['https://developers.getacqpath.com','https://acqpath-distribution.pages.dev'].includes(origin)||base.replace(/\/$/,'')!==origin)throw Error('UNEXPECTED_DOCS_ORIGIN');
 const pages=await load(join(root,'metadata/site-pages.json'));
 const paths=[...pages.map(p=>p.slug+'.html'),'style.css','SKILL.md','llms.txt','mcp-registry.json','robots.txt','sitemap.xml'];
 async function get(path) {
  let url=origin+'/'+path;
  for(let n=0;n<4;n++) {
   const r=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(15000)});
   if([301,302,307,308].includes(r.status)) {
    await r.body?.cancel();const next=new URL(r.headers.get('location'),url);
    if(next.origin!==origin)throw Error('CROSS_ORIGIN_DOCS_REDIRECT');url=next.href;continue;
   }
   const data=Buffer.from(await r.arrayBuffer());
   if(data.length>1048576)throw Error('DOCS_RESPONSE_TOO_LARGE');
   return {http:r.status,url,data,headers:r.headers};
  }
  throw Error('DOCS_REDIRECT_LIMIT');
 }
 const checks=[];
 for(const path of paths) {
  try {
   const r=await get(path),expected=await readFile(join(root,'out/site',path));
   checks.push({path,url:r.url,http:r.http,hashMatches:sha256(r.data)===sha256(expected),securityHeaders:r.headers.get('x-content-type-options')==='nosniff'&&r.headers.get('x-frame-options')==='DENY'&&r.headers.get('content-security-policy')?.includes("default-src 'none'"),pass:r.http===200&&sha256(r.data)===sha256(expected)});
  }catch(e){checks.push({path,pass:false,error:safeCode(e)});}
 }
 let missing;
 try{const r=await get('distribution-verification-missing-page');missing={http:r.http,customPageMatches:sha256(r.data)===sha256(await readFile(join(root,'out/site/404.html')))};}catch(e){missing={error:safeCode(e)};}
 const result={at:new Date().toISOString(),origin,state:checks.every(x=>x.pass&&x.securityHeaders)&&missing.http===404&&missing.customPageMatches?'PUBLIC_DOCS_VERIFIED':'DOCS_UNVERIFIED',checks,missingPage:missing,noPaymentPerformed:true};
 await writeLocal('.local/docs-verification-'+new URL(origin).hostname+'.json',result,root);
 console.log(JSON.stringify(result,null,2));return result;
}

import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {ROOT,load,settings,sha256,writeLocal,safeCode} from './lib/io.mjs';

// Exact reviewed edge insertion only. Unknown scripts or content changes fail.
export function normalizeAnalytics(bytes,approvedSnippet) {
 const text=bytes.toString('utf8');
 if(!approvedSnippet)return {bytes,beacon:false};
 const occurrences=text.split(approvedSnippet).length-1;
 if(occurrences>1)throw Error('DUPLICATE_ANALYTICS_SNIPPET');
 return {bytes:Buffer.from(occurrences===1?text.replace(approvedSnippet,''):text),beacon:occurrences===1};
}
export function publicAssetPath(path) {
 if(!/^[a-zA-Z0-9_.\/-]+$/.test(path)||path.startsWith('/')||path.split('/').some(p=>p==='..'||p===''))throw Error('UNSAFE_PUBLIC_ASSET_PATH');
 return path;
}
export async function fetchPublicFile(url,{fetcher=globalThis.fetch,allowedOrigins=[new URL(url).origin],maxBytes=1048576}={}) {
 for(let n=0;n<4;n++) {
  const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password||!allowedOrigins.includes(u.origin))throw Error('UNEXPECTED_PUBLIC_ORIGIN');
  const r=await fetcher(u.href,{redirect:'manual',signal:AbortSignal.timeout(15000)});
  if([301,302,303,307,308].includes(r.status)) {await r.body?.cancel();const location=r.headers.get('location');if(!location)throw Error('REDIRECT_WITHOUT_LOCATION');url=new URL(location,url).href;continue;}
  const chunks=[];let length=0;const reader=r.body?.getReader();
  if(Number(r.headers.get('content-length')||0)>maxBytes){await r.body?.cancel();throw Error('PUBLIC_RESPONSE_TOO_LARGE');}
  if(reader)for(;;){const p=await reader.read();if(p.done)break;length+=p.value.length;if(length>maxBytes){await reader.cancel();throw Error('PUBLIC_RESPONSE_TOO_LARGE');}chunks.push(p.value);}
  return {http:r.status,url:u.href,data:Buffer.concat(chunks),headers:r.headers};
 }
 throw Error('PUBLIC_REDIRECT_LIMIT');
}
export function localLinks(html,origin) {
 return [...new Set([...html.matchAll(/(?:href|src)="([^"<>]+)"/g)].map(m=>m[1].replaceAll('&amp;','&')).filter(x=>x.startsWith('/')&&!x.startsWith('//')).map(x=>new URL(x,origin).pathname))];
}
export function securityHeadersMatch(headers,isHtml) {
 const csp=headers.get('content-security-policy')||'';
 const base=headers.get('x-content-type-options')==='nosniff'&&headers.get('x-frame-options')==='DENY'&&csp.includes("default-src 'none'")&&csp.includes("frame-ancestors 'none'");
 // Unchanged text assets may retain a stricter cached CSP. They need no script permission.
 return base&&(!isHtml||(csp.includes('script-src https://static.cloudflareinsights.com')&&csp.includes("connect-src 'self'")));
}
export async function verifyDocs(base,root=ROOT,{fetcher=globalThis.fetch,quiet=false}={}) {
 const cfg=await settings(root);base=base||cfg.publication.docsUrl;const origin=new URL(base).origin;
 if(!['https://developers.getacqpath.com','https://acqpath-distribution.pages.dev'].includes(origin)||base.replace(/\/$/,'')!==origin)throw Error('UNEXPECTED_DOCS_ORIGIN');
 const pages=await load(join(root,'metadata/site-pages.json')),assets=await load(join(root,'out/site/discovery-assets.json'));
 const analytics=await load(join(root,'config/docs-analytics.json'));
 const paths=[...new Set([...pages.map(p=>p.slug+'.html'),'style.css','mcp-registry.json','robots.txt','sitemap.xml','discovery-assets.json',...assets.files])].map(publicAssetPath);
 const checks=[],links=new Set(),resolved=new Map();
 for(const path of paths) {
  try {
   const r=await fetchPublicFile(origin+'/'+path,{fetcher}),expected=await readFile(join(root,'out/site',path));
   const normalized=path.endsWith('.html')?normalizeAnalytics(r.data,analytics.approvedEdgeSnippet):{bytes:r.data,beacon:false};
   const hashMatches=sha256(normalized.bytes)===sha256(expected);
   const securityHeaders=securityHeadersMatch(r.headers,path.endsWith('.html'));
   const analyticsMatches=!path.endsWith('.html')||!analytics.requireBeacon||normalized.beacon;
   const pass=r.http===200&&hashMatches&&securityHeaders&&analyticsMatches;
   checks.push({path,url:r.url,http:r.http,hashMatches,securityHeaders,analyticsMatches,beacon:normalized.beacon,pass});resolved.set(new URL(r.url).pathname,r.http);
   if(path.endsWith('.html'))for(const link of localLinks(expected.toString('utf8'),origin))links.add(link);
  }catch(e){checks.push({path,pass:false,error:safeCode(e)});}
 }
 const linkChecks=[];
 for(const path of links)try{const http=resolved.has(path)?resolved.get(path):(await fetchPublicFile(origin+path,{fetcher})).http;linkChecks.push({path,http,pass:http===200});}catch(e){linkChecks.push({path,pass:false,error:safeCode(e)});}
 let missing;
 try{const r=await fetchPublicFile(origin+'/distribution-verification-missing-page',{fetcher});const n=normalizeAnalytics(r.data,analytics.approvedEdgeSnippet);missing={http:r.http,customPageMatches:sha256(n.bytes)===sha256(await readFile(join(root,'out/site/404.html')))};}catch(e){missing={error:safeCode(e)};}
 const result={at:new Date().toISOString(),origin,state:checks.every(x=>x.pass)&&linkChecks.every(x=>x.pass)&&missing.http===404&&missing.customPageMatches?'PUBLIC_DOCS_VERIFIED':'DOCS_UNVERIFIED',checks,linkChecks,missingPage:missing,noPaymentPerformed:true};
 await writeLocal('.local/docs-verification-'+new URL(origin).hostname+'.json',result,root);
 if(!quiet)console.log(JSON.stringify(result,null,2));return result;
}

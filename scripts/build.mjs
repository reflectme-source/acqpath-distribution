import {readFile,copyFile,mkdir,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {settings,load,writeLocal,ROOT,walk,noSymlinks,sha256} from './lib/io.mjs';
import {validateManifest} from './manifest.mjs';
import {renderPage,pagePath} from './site.mjs';
import {discoveryAssets} from './discovery-assets.mjs';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function build(root=ROOT){
 const cfg=await settings(root);const output=join(root,'out/site');await noSymlinks(output);await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
 // Never copy an arbitrary directory into the public site.
 const pages=await load(join(root,'metadata/site-pages.json'));
 if(new Set(pages.map(p=>p.slug)).size!==pages.length)throw Error('DUPLICATE_PAGE_SLUG');
 for(const p of pages)pagePath(p.slug);
 const contract=await load(join(root,'metadata/public-contract.json'));
 const styleVersion=sha256(await readFile(join(root,'site/style.css'))).slice(0,16);
 for(const p of pages)await writeLocal('out/site/'+p.slug+'.html',renderPage(p,pages,cfg,contract,styleVersion),root);
 await copyFile(join(root,'site/style.css'),join(output,'style.css'));
 await copyFile(join(root,'site/_headers'),join(output,'_headers'));
 await writeLocal('out/site/404.html','<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | AcqPath</title><link rel="stylesheet" href="/style.css?v='+styleVersion+'"></head><body><main><h1>Page not found</h1><p><a href="/">Open the AcqPath developer documentation</a>.</p></main></body></html>',root);
 await discoveryAssets(cfg,pages,root);
 const server=await load(join(root,'metadata/server.json'));server.name=cfg.mcp.name;server.version=cfg.mcp.version;server.remotes=[{type:'streamable-http',url:cfg.mcp.url}];
 validateManifest(server);await writeLocal('out/registry/server.json',server,root);await writeLocal('out/site/mcp-registry.json',server,root);
 await writeLocal('out/site/.nojekyll','',root);
 const base=cfg.publication.docsUrl;
 if(base){await writeLocal('out/site/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.filter(p=>!p.canonical).map(p=>'<url><loc>'+escape(base.replace(/\/$/,'')+pagePath(p.slug))+'</loc></url>').join('')+'</urlset>',root);}
 await writeLocal('out/site/robots.txt','User-agent: *\nAllow: /\n'+(base?'Sitemap: '+base.replace(/\/$/,'')+'/sitemap.xml\n':''),root);
 const candidate={status:'NOT_APPLIED_REQUIRES_CORE_APPROVAL',scope:'Design specification only. This file does not make a service discoverable.',resource:{description:'Timestamped signed report of observed RSL declarations for a supported URL and AI usage purpose. Not a license or legal clearance.',serviceName:'AcqPath Rights Preflight',tags:['rsl','ai-rights','rights-evidence','preflight','licensing']},input:{quoteMethod:'POST',quotePath:'/v1/rights/quote',paidMethod:'GET',paidPathTemplate:'/v1/rights/reports/:id',requiresPrivateClaimHeader:true},requirements:['Server must advertise and forward a valid Bazaar extension through CDP settlement.','A catalog entry must explain the quote-before-report workflow without exposing claim tokens.','An end-to-end buyer integration must be demonstrated before claiming direct Bazaar paid-tool support.','Only after the above may an explicitly approved purchase be used for indexing.']};
 await writeLocal('out/owner/bazaar-integration-decision.json',candidate,root);
 const pkgSrc=join(root,'packages/rights-client'),pkgOut=join(root,'out/rights-client');await noSymlinks(pkgOut);await rm(pkgOut,{recursive:true,force:true});await mkdir(pkgOut,{recursive:true});
 const allowed=new Set(['index.mjs','index.d.ts','checkpoint-store.mjs','checkpoint-store.d.ts','browser-signer.mjs','browser-signer.d.ts','README.md','LICENSE','examples/read-only.mjs','examples/pipelines.mjs']);
 const vendor=await load(join(root,'metadata/vendor-provenance.json'));
 const files=[...allowed,...vendor.files.map(f=>'vendor/'+f.originalPath.replace('packages/sdk/',''))];
 for(const f of files){const src=join(pkgSrc,f),dest=join(pkgOut,f);await noSymlinks(src);await noSymlinks(dest);await mkdir(join(dest,'..'),{recursive:true});await copyFile(src,dest);}
 const pkg=await load(join(pkgSrc,'package.json'));pkg.name=cfg.publication.npmName;pkg.private=!(cfg.publication.npmLicenseApproved&&cfg.publication.npmPublicationEnabled===true);pkg.license=cfg.publication.npmLicenseApproved?'MIT':'UNLICENSED';
 if(cfg.publication.githubOwner)pkg.repository={type:'git',url:`https://github.com/${cfg.publication.githubOwner}/${cfg.publication.repo}.git`,directory:'packages/rights-client'};
 await writeLocal('out/rights-client/package.json',pkg,root);
 return {status:'BUILT_LOCALLY',sitePages:pages.length,coreChanged:false,published:false};
}

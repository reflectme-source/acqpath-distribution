import {readFile,writeFile,mkdir,copyFile,chmod} from 'node:fs/promises';
import {join,dirname,resolve} from 'node:path';
import {generateKeyPairSync} from 'node:crypto';
import {resolveTxt} from 'node:dns/promises';
import {load,settings,writeLocal,ROOT,workspace,exists,noSymlinks,sha256,walk} from './lib/io.mjs';
import {boundedRequest} from './lib/net.mjs';
import {confirm,prompt,hidden} from './lib/prompts.mjs';
import {run,npm} from './lib/process.mjs';
import {build} from './build.mjs';
const GH='https://api.github.com', CF='https://api.cloudflare.com';
export async function recentAudit(root){const cfg=await settings(root),r=await load(join(root,'.local/public-audit.json'));const age=Date.now()-Date.parse(r.at);if(r.status!=='PASS'||r.expectedSourceSha256!==cfg.expectedSourceSha256||!Number.isFinite(age)||age<0||age>3600000)throw Error('FRESH_PUBLIC_AUDIT_REQUIRED_BEFORE_PUBLICATION');return cfg;}
export async function configure(root=ROOT){
 const cfg=await settings(root);
 const owner=await prompt('GitHub: nazwa konta/organizacji dla OSOBNEGO repo (bez tokena): ');
 if(!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(owner))throw Error('INVALID_GITHUB_OWNER');
 cfg.publication.githubOwner=owner;cfg.publication.docsUrl='https://developers.getacqpath.com';
 const name=await prompt('Nazwa pakietu npm [@getacqpath/rights-client] — Enter zostawia propozycję: ');
 if(name){if(!/^@[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/.test(name))throw Error('INVALID_NPM_NAME');cfg.publication.npmName=name;}
 const smithery=await prompt('Smithery namespace/server (opcjonalne, np. acqpath/rights-preflight): ');
 if(smithery){if(!/^[a-z0-9][a-z0-9_-]*\/[a-z0-9][a-z0-9_-]*$/.test(smithery))throw Error('INVALID_SMITHERY_NAME');cfg.publication.smitheryName=smithery;}
 await writeLocal('config/distribution.json',cfg,root);await build(root);console.log('CONFIGURED_DISTRIBUTION_ONLY');
}
export async function prepareDns(root=ROOT){
 const cfg=await settings(root);const f=join(root,'.private/registry-key.pem');await noSymlinks(f);await mkdir(dirname(f),{recursive:true,mode:0o700});
 let privateKey;
 if(await exists(f)){const {createPrivateKey}=await import('node:crypto');privateKey=createPrivateKey(await readFile(f));}
 else{privateKey=generateKeyPairSync('ed25519').privateKey;await writeFile(f,privateKey.export({type:'pkcs8',format:'pem'}),{flag:'wx',mode:0o600});}
 const {createPublicKey}=await import('node:crypto');const pub=createPublicKey(privateKey).export({format:'jwk'});const content='v=MCPv1; k=ed25519; p='+Buffer.from(pub.x,'base64url').toString('base64');
 const record={type:'TXT',name:cfg.dns.domain,content,ttl:300,purpose:'MCP Registry ownership proof ONLY; not a wallet or API credential'};
 await writeLocal('out/owner/mcp-dns-record.json',record,root);console.log(JSON.stringify(record,null,2));return record;
}
export async function applyDns(root=ROOT){
 const cfg=await settings(root);const record=await prepareDns(root);await confirm('ADD MCP DNS RECORD');
 const token=await hidden('Cloudflare token: tylko Zone Read + DNS Edit dla getacqpath.com (lokalnie)');
 async function cf(path,opts={}){const r=await boundedRequest(CF+'/client/v4'+path,{...opts,headers:{Authorization:'Bearer '+token,'content-type':'application/json'},allowedOrigins:[CF]},globalThis.fetch);if(r.status!==200||r.data?.success!==true)throw Error('CLOUDFLARE_DNS_REQUEST_FAILED_HTTP_'+r.status);return r.data.result;}
 const zone=await cf('/zones/'+cfg.dns.zoneId);if(zone.name!==cfg.dns.domain||zone.account?.id!==cfg.dns.accountId)throw Error('DNS_ZONE_ACCOUNT_MISMATCH');
 const prior=await cf('/zones/'+cfg.dns.zoneId+'/dns_records?'+new URLSearchParams({type:'TXT',name:cfg.dns.domain,per_page:'100'}));
 const proof=prior.filter(x=>x.content.startsWith('v=MCPv1;'));
 if(proof.some(x=>x.content!==record.content))throw Error('EXISTING_MCP_DNS_PROOF_DIFFERS_NO_OVERWRITE');
 if(!proof.length)await cf('/zones/'+cfg.dns.zoneId+'/dns_records',{method:'POST',body:JSON.stringify({type:'TXT',name:record.name,content:record.content,ttl:300})});
 const text=(await resolveTxt(cfg.dns.domain)).map(x=>x.join(''));const visible=text.includes(record.content);
 await writeLocal('.local/dns-publication.json',{at:new Date().toISOString(),state:visible?'DNS_PROOF_VISIBLE':'DNS_PROPAGATION_PENDING',coreChanged:false},root);
 console.log(visible?'DNS_PROOF_VISIBLE':'DNS_PROPAGATION_PENDING — record added; rerun verification later, do not replace other TXT records.');
}
async function resolveAction(repo,tag){
 const response=await boundedRequest(`${GH}/repos/${repo}/git/ref/tags/${tag}`,{allowedOrigins:[GH],headers:{'User-Agent':'AcqPathDistribution/1.0'}},globalThis.fetch);
 if(response.status!==200)throw Error('ACTION_TAG_RESOLUTION_FAILED');let object=response.data?.object;
 if(object?.type==='tag'){const r=await boundedRequest(`${GH}/repos/${repo}/git/tags/${object.sha}`,{allowedOrigins:[GH],headers:{'User-Agent':'AcqPathDistribution/1.0'}},globalThis.fetch);object=r.data?.object;}
 if(object?.type!=='commit'||! /^[a-f0-9]{40}$/.test(object.sha))throw Error('UNEXPECTED_ACTION_REF');return object.sha;
}
export async function freezeActions(root=ROOT){
 const names={'CHECKOUT':['actions/checkout','v5'],'SETUP_NODE':['actions/setup-node','v5'],'UPLOAD':['actions/upload-artifact','v4'],'CONFIGURE_PAGES':['actions/configure-pages','v5'],'UPLOAD_PAGES':['actions/upload-pages-artifact','v3'],'DEPLOY_PAGES':['actions/deploy-pages','v4']};
 const lock={at:new Date().toISOString(),actions:{}};
 for(const[k,[repo,tag]]of Object.entries(names))lock.actions[k]={repo,tag,sha:await resolveAction(repo,tag)};
 for(const file of ['ci.yml','visibility.yml','npm-publish.yml']){let text=await readFile(join(root,'workflow-templates',file),'utf8');for(const[k,v]of Object.entries(lock.actions))text=text.replaceAll('{{'+k+'}}',v.repo+'@'+v.sha);if(/\{\{[A-Z_]+\}\}/.test(text))throw Error('UNRESOLVED_ACTION_PIN');await writeLocal('.github/workflows/'+file,text,root);}
 await writeLocal('config/actions.lock.json',lock,root);console.log('ACTION_REFS_LOCKED_TO_COMMITS');
}
export async function installPublisher(root=ROOT){
 const platform={win32:'windows',linux:'linux',darwin:'darwin'}[process.platform],arch={x64:'amd64',arm64:'arm64'}[process.arch];if(!platform||!arch)throw Error('UNSUPPORTED_PUBLISHER_PLATFORM');
 const r=await boundedRequest(GH+'/repos/modelcontextprotocol/registry/releases/latest',{allowedOrigins:[GH],headers:{'User-Agent':'AcqPathDistribution/1.0'}},globalThis.fetch);
 if(r.status!==200||!Array.isArray(r.data?.assets))throw Error('PUBLISHER_RELEASE_UNAVAILABLE');
 const asset=r.data.assets.find(x=>x.name===`mcp-publisher_${platform}_${arch}.tar.gz`);
 if(!asset||!/^sha256:[a-f0-9]{64}$/.test(asset.digest||''))throw Error('PUBLISHER_CHECKSUM_UNAVAILABLE_NO_UNVERIFIED_INSTALL');
 await confirm('INSTALL VERIFIED MCP PUBLISHER');
 // Restricted redirects: official GitHub release -> official release-assets CDN only.
 let url=asset.browser_download_url,bytes;
 for(let i=0;i<4;i++){const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password||!['github.com','release-assets.githubusercontent.com','objects.githubusercontent.com'].includes(u.hostname))throw Error('PUBLISHER_DOWNLOAD_HOST_REJECTED');const response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(30000)});if(response.status>=300&&response.status<400){url=new URL(response.headers.get('location'),url).href;continue;}if(response.status!==200)throw Error('PUBLISHER_DOWNLOAD_FAILED');const chunks=[];let size=0;for await(const chunk of response.body){size+=chunk.length;if(size>64*1024*1024)throw Error('PUBLISHER_ARCHIVE_TOO_LARGE');chunks.push(chunk);}bytes=Buffer.concat(chunks);break;}
 if(!bytes||sha256(bytes)!==asset.digest.slice(7))throw Error('PUBLISHER_DIGEST_MISMATCH');
 const tools=join(root,'.tools');await noSymlinks(tools);await mkdir(tools,{recursive:true,mode:0o700});const archive=join(tools,'mcp-publisher.tar.gz');await writeFile(archive,bytes,{mode:0o600});
 const file='mcp-publisher'+(process.platform==='win32'?'.exe':'');const list=await run('tar',['-tzf',archive],{cwd:tools});if(list.code!==0||!list.stdout.split(/\r?\n/).includes(file))throw Error('PUBLISHER_ARCHIVE_LAYOUT_UNEXPECTED');
 const unpack=await run('tar',['-xzf',archive,file],{cwd:tools});if(unpack.code!==0)throw Error('PUBLISHER_EXTRACTION_FAILED');await noSymlinks(join(tools,file));await chmod(join(tools,file),0o700);
 await writeLocal('.tools/publisher.lock.json',{tag:r.data.tag_name,archiveSha256:asset.digest.slice(7),binarySha256:sha256(await readFile(join(tools,file))),file},root);console.log('MCP_PUBLISHER_INSTALLED_LOCAL_ONLY');
}
export async function publishRegistry(root=ROOT){
 const cfg=await recentAudit(root);await confirm('PUBLISH ACQPATH MCP METADATA');
 const dns=await load(join(root,'out/owner/mcp-dns-record.json'));if(!(await resolveTxt(cfg.dns.domain)).some(x=>x.join('')===dns.content))throw Error('DNS_PROOF_NOT_VISIBLE');
 const lock=await load(join(root,'.tools/publisher.lock.json')),tool=join(root,'.tools',lock.file);await noSymlinks(tool);if(sha256(await readFile(tool))!==lock.binarySha256)throw Error('PUBLISHER_BINARY_CHANGED');
 const dir=join(root,'.private/registry-publish');await noSymlinks(dir);await mkdir(dir,{recursive:true,mode:0o700});await copyFile(join(root,'out/registry/server.json'),join(dir,'server.json'));
 const {createPrivateKey}=await import('node:crypto');const privateKey=createPrivateKey(await readFile(join(root,'.private/registry-key.pem'))).export({format:'jwk'});const hex=Buffer.from(privateKey.d,'base64url').toString('hex');
 // The official CLI accepts a private-key argument. Do not print command lines, stdout or stderr; this is a domain-publication key, never a wallet key.
 const auth=await run(tool,['login','dns','--domain',cfg.dns.domain,'--private-key',hex],{cwd:dir});if(auth.code!==0)throw Error('REGISTRY_AUTH_FAILED_OUTPUT_WITHHELD');
 const pub=await run(tool,['publish'],{cwd:dir});if(pub.code!==0)throw Error('REGISTRY_PUBLISH_FAILED_OUTPUT_WITHHELD');
 await writeLocal('.local/registry-publication.json',{at:new Date().toISOString(),state:'SUBMITTED_NEEDS_READBACK',name:cfg.mcp.name,version:cfg.mcp.version},root);console.log('REGISTRY_SUBMITTED — run catalogs for exact readback; no claim of listing until FOUND.');
}
export async function publishNpm(root=ROOT){
 if((await settings(root)).publication.npmPublicationEnabled!==true)throw Error('NPM_PUBLICATION_DISABLED_BY_OWNER');
 await recentAudit(root);const cfg=await settings(root);await confirm('PUBLISH CLIENT PACKAGE UNDER MIT');cfg.publication.npmLicenseApproved=true;await writeLocal('config/distribution.json',cfg,root);await build(root);
 const dir=join(root,'out/rights-client');const auth=await npm(['whoami'],{cwd:dir});if(auth.code!==0)throw Error('NPM_LOGIN_REQUIRED_OWNER_AUTHENTICATES_LOCALLY');
 const dry=await npm(['pack','--dry-run','--json','--ignore-scripts'],{cwd:dir});if(dry.code!==0)throw Error('NPM_PACKAGE_CHECK_FAILED');
 const p=JSON.parse(dry.stdout)[0];if(!p?.files?.length||p.files.some(x=>/\.private|\.secrets|operator-token|config\/operator|\.env$/.test(x.path)))throw Error('UNSAFE_NPM_TARBALL');
 const publish=await npm(['publish','--access','public','--ignore-scripts'],{cwd:dir,inherit:true,timeoutMs:180000});if(publish.code!==0)throw Error('NPM_PUBLICATION_FAILED');
 const check=await npm(['view',cfg.publication.npmName+'@1.0.0','version','--json'],{cwd:dir});if(check.code!==0||JSON.parse(check.stdout)!=='1.0.0')throw Error('NPM_READBACK_NOT_CONFIRMED');
 await writeLocal('.local/npm-publication.json',{at:new Date().toISOString(),state:'PUBLISHED_AND_READ_BACK',name:cfg.publication.npmName,version:'1.0.0'},root);console.log('NPM_PUBLISHED_AND_READ_BACK');
}
export async function publishSmithery(root=ROOT){
 const cfg=await recentAudit(root);if(!cfg.publication.smitheryName)throw Error('CONFIGURE_SMITHERY_NAMESPACE_FIRST');await confirm('PUBLISH SMITHERY QUOTE TOOL');
 // Existing official CLI only. No npx latest execution or secrets shared with the core API.
 const {smithery}=await import('./tools.mjs');const p=await smithery(['mcp','publish',cfg.mcp.url,'-n',cfg.publication.smitheryName],root,{inherit:true,timeoutMs:180000});if(p.code!==0)throw Error('SMITHERY_CLI_FAILED_OR_LOGIN_REQUIRED');
 await writeLocal('.local/smithery-publication.json',{at:new Date().toISOString(),state:'SUBMITTED_NEEDS_READBACK',name:cfg.publication.smitheryName,paidMcpCompatible:false},root);console.log('SMITHERY_SUBMITTED — verify tools and the published description in the provider UI.');
}

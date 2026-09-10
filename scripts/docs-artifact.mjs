import {readFile} from 'node:fs/promises';
import {join,relative} from 'node:path';
import {pathToFileURL} from 'node:url';
import {ROOT,walk,noSymlinks,sha256,writeLocal,load,exists} from './lib/io.mjs';
import {secretFindings} from './verify.mjs';
export const DOCS_TARGET={account:'449109f33c0c400ea8aef1100c801da6',project:'acqpath-distribution',branch:'main'};
export function artifactPath(path){
 const reviewedHidden=['.nojekyll','.well-known/acqpath-distribution.json'].includes(path);
 if(!/^[a-zA-Z0-9_.\/-]+$/.test(path)||path.startsWith('/')||path.split('/').some(x=>!x||x==='..'||(x.startsWith('.')&&!reviewedHidden)))throw Error('UNSAFE_DOCS_PATH');
 const sourceDownload=['examples/evidence-gate.mjs','examples/read-only.mjs','examples/read-only.py','examples/workflows.ts'].includes(path);
 if(/(?:^|\/)(?:_worker\.js|_routes\.json|functions)(?:\/|$)/i.test(path)||!(/\.(?:html|css|json|md|txt|xml|svg)$/.test(path)||['_headers','.nojekyll'].includes(path)||sourceDownload))throw Error('NON_STATIC_DOCS_FILE');
 return path;
}
export async function inventory(root=ROOT){
 for(const p of ['functions','wrangler.json','wrangler.jsonc','wrangler.toml'])if(await exists(join(root,'out',p)))throw Error('DOCS_RUNTIME_CONFIG_FORBIDDEN');
 const site=join(root,'out/site');await noSymlinks(site);const files=[];
 // No ignored-directory filter: unexpected files must fail, not silently disappear.
 for(const file of await walk(site,new Set())){const path=artifactPath(relative(site,file).replaceAll('\\','/'));const bytes=await readFile(file);if(secretFindings(path,bytes.toString('utf8')).length)throw Error('DOCS_SECRET_DETECTED');files.push({path,bytes:bytes.length,sha256:sha256(bytes)});}
 if(!files.some(f=>f.path==='index.html')||!files.some(f=>f.path==='_headers')||files.length>500)throw Error('INVALID_DOCS_ARTIFACT');return files;
}
export async function docsArtifact(mode,commit,root=ROOT){
 if(!/^[a-f0-9]{40}$/.test(commit||''))throw Error('COMMIT_REQUIRED');
 const manifest={schema:'acqpath.docs-artifact.v1',commit,target:DOCS_TARGET,files:await inventory(root)};
 if(mode==='seal')await writeLocal('out/docs-manifest.json',manifest,root);
 else if(mode==='verify'){const sealed=await load(join(root,'out/docs-manifest.json'));if(JSON.stringify(sealed)!==JSON.stringify(manifest))throw Error('DOCS_ARTIFACT_MISMATCH');}
 else throw Error('UNKNOWN_ARTIFACT_OPERATION');
 return {status:'PASS',commit,files:manifest.files.length,manifestSha256:sha256(JSON.stringify(manifest))};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)docsArtifact(process.argv[2],process.env.GITHUB_SHA||process.argv[3]).then(x=>console.log(JSON.stringify(x))).catch(e=>{console.error(e.message);process.exitCode=1;});

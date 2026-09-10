import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join,relative} from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {workspace,walk,ROOT,load,sha256,writeLocal} from './lib/io.mjs';
export function secretFindings(name,text){
 const found=[];
 if(/(?:^|\/)(?:\.secrets|\.private|node_modules)(?:\/|$)|(?:\.pem|\.p12|\.pfx|\.key)$|operator-token\.txt$/i.test(name))found.push('FORBIDDEN_FILE');
 const patterns=[['PEM_PRIVATE',/-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/],['GITHUB_TOKEN',/\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b/],['NPM_TOKEN',/\bnpm_[A-Za-z0-9]{30,}\b/],['JWT_VALUE',/\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/],['PRIVATE_JWK_VALUE',/"d"\s*:\s*"[A-Za-z0-9_-]{40,}"/]];
 for(const[k,re]of patterns)if(re.test(text))found.push(k);
 return found;
}
export async function verify(root=ROOT){
 await workspace(root);const all=await walk(root);const modules=all.filter(x=>/\.(?:mjs|js)$/.test(x));
 const env={...process.env};for(const key of Object.keys(env))if(/TOKEN|SECRET|PASSWORD|PRIVATE.?KEY|CREDENTIAL/i.test(key))delete env[key];
 const checks=[];for(const f of modules){const r=spawnSync(process.execPath,['--check',f],{cwd:root,encoding:'utf8',env,timeout:15000});if(r.error||r.status!==0)throw Error('SYNTAX_FAILED_'+relative(root,f).replace(/[^a-zA-Z0-9]/g,'_'));}
 checks.push({name:'javascript_syntax',status:'PASS',modules:modules.length});
 const findings=[];for(const f of all){if(f.endsWith('.png')||f.endsWith('.zip'))continue;const text=await readFile(f,'utf8');for(const code of secretFindings(relative(root,f).replaceAll('\\','/'),text))findings.push({file:relative(root,f),code});}
 if(findings.length){await writeLocal('.local/secret-scan.json',{status:'FAIL',findings},root);throw Error('SECRET_SCAN_FAILED');}
 checks.push({name:'static_secret_patterns',status:'PASS',scope:'Selected token/PEM/JWT/JWK patterns; not a guarantee of every possible secret.'});
 const vendor=await load(join(root,'metadata/vendor-provenance.json'));
 for(const f of vendor.files){const path=join(root,'packages/rights-client/vendor',f.originalPath.replace('packages/sdk/',''));if(sha256(await readFile(path))!==f.sha256)throw Error('VENDOR_INTEGRITY_MISMATCH');}
 checks.push({name:'vendor_file_integrity',status:'PASS',files:vendor.files.length});
 const files=all.filter(x=>x.endsWith('.test.mjs'));
 if(files.length===0)throw Error('NO_TEST_FILES');
 // Node 24 defaults to the spec reporter even when piped; the summary parser requires TAP.
 const r=spawnSync(process.execPath,['--test','--test-reporter=tap','--test-concurrency=1',...files],{cwd:root,encoding:'utf8',env,maxBuffer:16*1024*1024,timeout:120000});
 await mkdir(join(root,'.local'),{recursive:true});await writeFile(join(root,'.local/tests.tap'),(r.stdout||'')+(r.stderr||''),{mode:0o600});
 const count=k=>Number((r.stdout||'').match(new RegExp('^# '+k+' (\\d+)','m'))?.[1]||0);
 const report={schema:'acqpath.distribution.verification.v1',at:new Date().toISOString(),node:process.version,status:!r.error&&r.status===0&&count('fail')===0&&count('pass')>0?'PASS':'FAIL',tests:count('tests'),pass:count('pass'),fail:count('fail'),skipped:count('skipped'),checks,environment:process.platform,networkUsed:false,walletUsed:false,coreChanged:false,externalPublicationTested:false,notTested:['Real Windows interactive publishing','Production payment settlement','Registry moderation or ranking','Real customer demand','Cloudflare/DNS/account mutations']};
 await writeLocal('.local/verification.json',report,root);
 console.log(JSON.stringify(report,null,2));if(report.status!=='PASS'){console.log((r.stdout||'').slice(-16000));throw Error('REGRESSION_TESTS_FAILED');}return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)verify().catch(e=>{console.error('VERIFY STOPPED:',e.message);process.exitCode=1;});

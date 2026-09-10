import {join,resolve} from 'node:path';
import {mkdir} from 'node:fs/promises';
import {ROOT,load,writeLocal,noSymlinks,inside} from './lib/io.mjs';
import {confirm} from './lib/prompts.mjs';
import {npm,run} from './lib/process.mjs';
export async function installSmithery(root=ROOT){
 const dir=join(root,'.tools/smithery');await noSymlinks(dir);await mkdir(dir,{recursive:true});
 const existing=await npm(['view','smithery','version','--json']);if(existing.code!==0)throw Error('SMITHERY_VERSION_UNAVAILABLE');const version=JSON.parse(existing.stdout);if(!/^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(version))throw Error('SMITHERY_VERSION_REJECTED');
 console.log('Official npm package smithery, exact version: '+version);await confirm('INSTALL PINNED SMITHERY CLI');
 await writeLocal('.tools/smithery/package.json',{name:'acqpath-smithery-tooling',private:true,version:'1.0.0',dependencies:{smithery:version}},root);
 const lock=await npm(['install','--package-lock-only','--ignore-scripts','--no-fund','--no-audit'],{cwd:dir});if(lock.code!==0)throw Error('SMITHERY_LOCK_FAILED');
 const install=await npm(['ci','--ignore-scripts','--no-fund','--no-audit'],{cwd:dir,timeoutMs:180000});if(install.code!==0)throw Error('SMITHERY_INSTALL_FAILED');
 const audit=await npm(['audit','--omit=dev','--audit-level=high','--json'],{cwd:dir});let a;try{a=JSON.parse(audit.stdout);}catch{}if(audit.code!==0||!a?.metadata?.vulnerabilities)throw Error('SMITHERY_ADVISORY_REVIEW_REQUIRED');
 await writeLocal('.tools/smithery/version.json',{version,at:new Date().toISOString(),advisoryCheck:'PASS_AT_INSTALL_TIME',scriptsExecuted:false},root);console.log('SMITHERY_INSTALLED_WORKSPACE_ONLY');
}
export async function smithery(args,root=ROOT,opts={}){
 const dir=join(root,'.tools/smithery/node_modules/smithery');await noSymlinks(dir);let pkg;try{pkg=await load(join(dir,'package.json'));}catch{throw Error('RUN_SMITHERY_INSTALL_FIRST');}
 const locked=await load(join(root,'.tools/smithery/version.json'));if(pkg.version!==locked.version||pkg.name!=='smithery')throw Error('SMITHERY_VERSION_MISMATCH');const bin=typeof pkg.bin==='string'?pkg.bin:pkg.bin?.smithery;if(typeof bin!=='string')throw Error('SMITHERY_BIN_LAYOUT_UNEXPECTED');const script=resolve(dir,bin);if(!inside(dir,script))throw Error('SMITHERY_BIN_OUTSIDE_PACKAGE');await noSymlinks(script);return run(process.execPath,[script,...args],{cwd:root,...opts});
}
export async function loginSmithery(root=ROOT){await confirm('LOGIN TO SMITHERY');const r=await smithery(['auth','login'],root,{inherit:true,timeoutMs:180000});if(r.code!==0)throw Error('SMITHERY_LOGIN_NOT_COMPLETED');}

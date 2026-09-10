import {readFile,writeFile,mkdir,rename,lstat,realpath,readdir} from 'node:fs/promises';
import {resolve,dirname,join,relative,isAbsolute} from 'node:path';
import {createHash,randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';
export const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
export const sha256=b=>createHash('sha256').update(b).digest('hex');
export async function load(path){return JSON.parse(await readFile(path,'utf8'));}
export async function exists(path){try{await lstat(path);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}
export function inside(root,p){const rel=relative(resolve(root),resolve(p));return rel===''||(!rel.startsWith('..'+(process.platform==='win32'?'\\':'/'))&&rel!=='..'&&!isAbsolute(rel));}
export async function noSymlinks(path){let p=resolve(path);for(;;){try{if((await lstat(p)).isSymbolicLink())throw Error('SYMLINK_PATH_REJECTED');}catch(e){if(e.code!=='ENOENT')throw e;}const up=dirname(p);if(up===p)break;p=up;}}
export async function workspace(root=ROOT){await noSymlinks(root);if((await readFile(join(root,'.acqpath-distribution-root'),'utf8')).trim()!=='acqpath-distribution-v1')throw Error('WRONG_WORKSPACE');let p=resolve(root);for(;;){if(await exists(join(p,'src/worker.mjs'))&&await exists(join(p,'config/operator.json')))throw Error('DISTRIBUTION_MUST_BE_OUTSIDE_CORE_REPO');const up=dirname(p);if(up===p)break;p=up;}return realpath(root);}
export async function writeLocal(path,value,root=ROOT){const abs=resolve(root,path);if(!inside(root,abs))throw Error('WRITE_OUTSIDE_WORKSPACE');await noSymlinks(abs);await mkdir(dirname(abs),{recursive:true,mode:0o700});const tmp=abs+'.tmp-'+randomBytes(6).toString('hex');await writeFile(tmp,typeof value==='string'?value:JSON.stringify(value,null,2)+'\n',{mode:0o600,flag:'wx'});await rename(tmp,abs);}
export function safeCode(e){const v=e?.code||e?.cause?.code||e?.name||'ERROR';return /^[A-Za-z0-9_:-]{1,80}$/.test(String(v))?String(v):'ERROR';}
export function redact(value){if(Array.isArray(value))return value.map(redact);if(value&&typeof value==='object'){const out={};for(const[k,v]of Object.entries(value)){out[k]=/claim|signature|authorization|secret|private|password|cookie|token/i.test(k)?'[REDACTED]':redact(v);}return out;}if(typeof value==='string')return value.replace(/Bearer\s+\S+/gi,'Bearer [REDACTED]').replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,'[JWT REDACTED]');return value;}
export async function walk(root,skip=new Set(['.git','.private','.local','.tools','out','node_modules'])){const result=[];async function scan(dir){for(const e of await readdir(dir,{withFileTypes:true})){if(skip.has(e.name))continue;const p=join(dir,e.name);if(e.isSymbolicLink())throw Error('SYMLINK_IN_PACKAGE');if(e.isDirectory())await scan(p);else if(e.isFile())result.push(p);}}await scan(root);return result.sort();}
export async function settings(root=ROOT){return load(join(root,'config/distribution.json'));}

import {readFile,copyFile,mkdir,mkdtemp} from 'node:fs/promises';
import {join,relative,dirname} from 'node:path';
import {workspace,ROOT,walk,writeLocal,sha256,load,noSymlinks} from './lib/io.mjs';
import {allowedTracked} from './git-publish.mjs';
import {run,npm} from './lib/process.mjs';

await workspace();
await mkdir(join(ROOT,'.local'),{recursive:true});
const directory=await mkdtemp(join(ROOT,'.local/public-review-'));
const files=[];
for(const file of await walk(ROOT)) {
 const path=relative(ROOT,file).replaceAll('\\','/');
 if(!allowedTracked(path))throw Error('UNSAFE_PUBLIC_SOURCE_PATH');
 const bytes=await readFile(file);
 files.push({path,bytes:bytes.length,sha256:sha256(bytes)});
 const target=join(directory,path);
 await mkdir(dirname(target),{recursive:true});await copyFile(file,target);
}
const lock=await load(join(ROOT,'.tools/gitleaks.lock.json'));
const binary=join(ROOT,'.tools/gitleaks/gitleaks.exe');await noSymlinks(binary);
if(lock.repository!=='gitleaks/gitleaks'||sha256(await readFile(binary))!==lock.binarySha256)throw Error('SECRET_SCANNER_INTEGRITY_MISMATCH');
const scan=await run(binary,['dir',directory,'--redact=100','--no-banner','--no-color','--ignore-gitleaks-allow','--max-archive-depth','2','--report-format','json','--report-path',join(ROOT,'.local/gitleaks-public-review.json')]);
if(scan.code!==0)throw Error('PUBLIC_SECRET_REVIEW_FAILED_READ_REDACTED_REPORT');
const pack=await npm(['pack','--dry-run','--json','--ignore-scripts'],{cwd:join(ROOT,'out/rights-client')});
if(pack.code!==0)throw Error('PACKAGE_REVIEW_FAILED');
const packageReview=JSON.parse(pack.stdout)[0];
if(packageReview.files.some(f=>!allowedTracked(f.path)))throw Error('PACKAGE_CONTAINS_PRIVATE_PATH');
const report={at:new Date().toISOString(),state:'REVIEWED_BEFORE_STAGING',files,secretScan:{tool:'gitleaks',version:lock.version,findings:0},packageReview,publication:false};
await writeLocal('.local/prepush-review.json',report);
console.log(JSON.stringify({state:report.state,files:files.length,secretFindings:0,packageFiles:packageReview.files.length},null,2));

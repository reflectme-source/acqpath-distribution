import {workspace,ROOT,safeCode,writeLocal} from './lib/io.mjs';
import {run} from './lib/process.mjs';
import {build} from './build.mjs';
import {auditCommand} from './audit.mjs';
import {catalogsCommand} from './catalogs.mjs';
import {status} from './status.mjs';
import {sourceAuditCommand} from './source-audit.mjs';
import {configure,prepareDns,applyDns,freezeActions,installPublisher,publishRegistry,publishNpm,publishSmithery} from './publish.mjs';
import {publishGit,enablePages} from './git-publish.mjs';
import {importMetrics,collectMetrics} from './metrics.mjs';
async function main(){
 await workspace();const [command,...args]=process.argv.slice(2);
 switch(command){
  case 'prepare':{
   const check=await run(process.execPath,['scripts/verify.mjs'],{cwd:ROOT,inherit:true});if(check.code!==0)throw Error('LOCAL_VERIFY_FAILED');
   console.log(JSON.stringify(await build(),null,2));const core=args[0];if(core)await sourceAuditCommand(core);
   const audit=await auditCommand();await catalogsCommand();await status();
   console.log(audit.status==='PASS'?'LOCAL_PACKAGE_READY_PUBLIC_PROBE_PASS_NOT_PUBLISHED':'LOCAL_PACKAGE_READY_REMOTE_UNVERIFIED_NOT_PUBLISHED');break;}
  case 'build':console.log(JSON.stringify(await build(),null,2));break;
  case 'audit':if((await auditCommand()).status!=='PASS')process.exitCode=2;break;
  case 'catalogs':await catalogsCommand();break;
  case 'status':await status();break;
  case 'source-audit':if(!args[0])throw Error('CORE_PATH_REQUIRED_READONLY');await sourceAuditCommand(args[0]);break;
  case 'configure':await configure();break;
  case 'freeze-actions':await freezeActions();break;
  case 'dns-prepare':await prepareDns();break;
  case 'dns-apply':await applyDns();break;
  case 'publisher-install':await installPublisher();break;
  case 'publish-registry':await publishRegistry();break;
  case 'publish-npm':await publishNpm();break;
  case 'smithery-install':{const {installSmithery}=await import('./tools.mjs');await installSmithery();break;}
  case 'smithery-login':{const {loginSmithery}=await import('./tools.mjs');await loginSmithery();break;}
  case 'publish-smithery':await publishSmithery();break;
  case 'publish-github':await publishGit();break;
  case 'publish-pages':await enablePages();break;
  case 'metrics-import':if(!args[0])throw Error('STATS_FILE_REQUIRED');await importMetrics(args[0]);break;
  case 'metrics-read':if(!args[0])throw Error('CORE_PATH_REQUIRED_READONLY');await collectMetrics(args[0]);break;
  case 'buyer-demo':{const {startBuyerDemo}=await import('./buyer-demo.mjs');await startBuyerDemo();break;}
  default:console.log('Commands: prepare [read-only-core-path] | audit | catalogs | build | status | source-audit path | configure | freeze-actions | dns-prepare | dns-apply | publisher-install | publish-registry | publish-npm | smithery-install | smithery-login | publish-smithery | publish-github | publish-pages | metrics-import file | metrics-read core-path | buyer-demo');
 }
}
main().catch(e=>{const message=/^[A-Z0-9_ :.-]{1,180}$/.test(e.message||'')?e.message:safeCode(e);console.error('DISTRIBUTION_STOPPED:',message);process.exitCode=1;});

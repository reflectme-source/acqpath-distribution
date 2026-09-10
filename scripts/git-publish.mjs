import {join} from 'node:path';
import {readFile} from 'node:fs/promises';
import {settings,workspace,exists,ROOT,walk} from './lib/io.mjs';
import {confirm} from './lib/prompts.mjs';
import {run} from './lib/process.mjs';
import {github} from './lib/github.mjs';
import {recentAudit} from './publish.mjs';
export function allowedTracked(path){return !/(?:^|\/)(?:\.npmrc|\.yarnrc\.yml|\.pypirc|\.git-credentials)$/.test(path)&&!/^config\/(?:operator|revenue|production|staging)\.json$/.test(path)&&!/(?:^|\/)(?:\.private|\.local|\.tools|\.wrangler|out|node_modules)(?:\/|$)/.test(path)&&!/(?:^|\/)\.env(?:\.|$)/.test(path)&&!/(?:\.pem|\.key|\.p12|\.pfx|\.enc|\.log|\.zip|\.tgz|\.tar\.gz)$/i.test(path)&&!/(?:operator-token|admin-token|staging-v31|production-v31)/i.test(path);}
export async function publishGit(root=ROOT){
 await workspace(root);const cfg=await recentAudit(root);const owner=cfg.publication.githubOwner;if(!owner)throw Error('CONFIGURE_OWNER_FIRST');const full=owner+'/'+cfg.publication.repo;
 if(cfg.publication.repo!=='acqpath-distribution')throw Error('ONLY_SEPARATE_DISTRIBUTION_REPO_ALLOWED');
 if(!await exists(join(root,'config/actions.lock.json')))throw Error('FREEZE_ACTIONS_BEFORE_GIT_PUBLICATION');
 const auth=await github(['auth','status'],{root});if(auth.code!==0)throw Error('GITHUB_CLI_LOGIN_REQUIRED');
 await confirm('PUBLISH SEPARATE DISTRIBUTION REPO');
 if(!await exists(join(root,'.git'))){const init=await run('git',['init','-b','main'],{cwd:root});if(init.code!==0)throw Error('GIT_INIT_FAILED');}
 const top=await run('git',['rev-parse','--show-toplevel'],{cwd:root});if(top.code!==0||top.stdout.trim().replace(/\\/g,'/')!==root.replace(/\\/g,'/'))throw Error('WRONG_GIT_ROOT');
 const user=await github(['api','user'],{root});let identity;try{identity=JSON.parse(user.stdout);}catch{}if(user.code!==0||!Number.isSafeInteger(identity?.id)||! /^[A-Za-z0-9-]+$/.test(identity?.login||''))throw Error('GITHUB_AUTHOR_VERIFICATION_FAILED');
 const email=identity.id+'+'+identity.login+'@users.noreply.github.com';for(const [key,value]of [['user.name','AcqPath'],['user.email',email]]){const rc=await run('git',['config','--local',key,value],{cwd:root});if(rc.code!==0)throw Error('GIT_LOCAL_AUTHOR_SETUP_FAILED');}
 const remote=await run('git',['remote','get-url','origin'],{cwd:root});
 if(remote.code===0){const url=remote.stdout.trim();if(![`https://github.com/${full}.git`,`https://github.com/${full}`,`git@github.com:${full}.git`].includes(url))throw Error('EXISTING_REMOTE_MISMATCH');}
 const publicFiles=(await walk(root)).map(p=>p.slice(root.length+1).replace(/\\/g,'/')).filter(x=>allowedTracked(x));
 if(publicFiles.length<10||publicFiles.length>300)throw Error('UNEXPECTED_PUBLIC_FILE_COUNT');
 const verify=await run(process.execPath,['scripts/verify.mjs'],{cwd:root,inherit:true});if(verify.code!==0)throw Error('LOCAL_VERIFICATION_FAILED');
 const stage=await run('git',['add','--',...publicFiles],{cwd:root});if(stage.code!==0)throw Error('GIT_STAGE_FAILED');
 const tracked=await run('git',['ls-files','-z'],{cwd:root});if(tracked.code!==0||tracked.stdout.split('\0').filter(Boolean).some(p=>!allowedTracked(p)))throw Error('PRIVATE_FILE_TRACKED_REFUSE_PUSH');
 const diff=await run('git',['diff','--cached','--quiet'],{cwd:root});if(diff.code===1){const commit=await run('git',['commit','-m','release: AcqPath distribution and client integrations'],{cwd:root});if(commit.code!==0)throw Error('GIT_COMMIT_FAILED_CONFIGURE_AUTHOR_LOCALLY');}else if(diff.code!==0)throw Error('GIT_DIFF_FAILED');
 if(remote.code!==0){const create=await github(['repo','create',full,'--public','--source',root,'--remote','origin','--description','AcqPath declared-rights reports: integration documentation and client SDK'],{root,inherit:true});if(create.code!==0)throw Error('REPO_CREATE_FAILED_DO_NOT_TARGET_CORE');}
 const push=await run('git',['push','-u','origin','main'],{cwd:root,inherit:true});if(push.code!==0)throw Error('DISTRIBUTION_PUSH_FAILED');console.log('DISTRIBUTION_REPO_PUSHED — core repository untouched.');
}
export async function enablePages(root=ROOT){const cfg=await settings(root);if(!cfg.publication.githubOwner)throw Error('CONFIGURE_OWNER_FIRST');await confirm('ENABLE DISTRIBUTION DOCS PAGES');const full=cfg.publication.githubOwner+'/acqpath-distribution';
 const check=await run('gh',['api','repos/'+full+'/pages'],{cwd:root});
 if(check.code!==0){if(!/HTTP 404/.test(check.stderr))throw Error('PAGES_STATUS_UNAVAILABLE');const create=await run('gh',['api','--method','POST','repos/'+full+'/pages','-f','build_type=workflow'],{cwd:root});if(create.code!==0)throw Error('PAGES_SETUP_FAILED');}
 const dispatch=await run('gh',['workflow','run','pages.yml','--repo',full,'--ref','main'],{cwd:root});if(dispatch.code!==0)throw Error('PAGES_DISPATCH_FAILED');console.log('DOCS_WORKFLOW_DISPATCHED — wait for actual Actions result; not a deployment of AcqPath API.');}

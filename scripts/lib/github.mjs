import {join} from 'node:path';
import {readFile} from 'node:fs/promises';
import {ROOT,exists,load,noSymlinks,sha256} from './io.mjs';
import {run} from './process.mjs';

// A workspace installation does not change global PATH or production Git settings.
export async function github(args, {root=ROOT, ...options}={}) {
 const lockPath=join(root,'.tools/gh.lock.json');
 let executable='gh';
 if(await exists(lockPath)) {
  const lock=await load(lockPath);
  executable=join(root,'.tools/gh/bin/gh.exe');
  await noSymlinks(executable);
  if(lock.repository!=='cli/cli'||sha256(await readFile(executable))!==lock.binarySha256)throw Error('GITHUB_CLI_INTEGRITY_MISMATCH');
 }
 const env={...process.env,...options.env};
 if(await exists(join(root,'.private/gh')))env.GH_CONFIG_DIR=join(root,'.private/gh');
 return run(executable,args,{cwd:root,...options,env});
}

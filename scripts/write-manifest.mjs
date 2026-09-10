import {readFile} from 'node:fs/promises';
import {relative} from 'node:path';
import {ROOT,walk,writeLocal,sha256,workspace} from './lib/io.mjs';
import {allowedTracked} from './git-publish.mjs';
await workspace();
const files=[];
for(const file of await walk(ROOT)) {
 const path=relative(ROOT,file).replaceAll('\\','/');
 if(path==='MANIFEST.json')continue;
 if(!allowedTracked(path))throw Error('UNSAFE_MANIFEST_PATH');
 const bytes=Buffer.from((await readFile(file,'utf8')).replaceAll('\r\n','\n'));
 files.push({path,sha256:sha256(bytes),bytes:bytes.length});
}
await writeLocal('MANIFEST.json',{schema:'acqpath.distribution.integrity.v2',normalization:'UTF-8 text; CRLF normalized to LF',scope:'Public source files only; excludes this manifest and ignored/private/build directories',files});
console.log('Public manifest files:',files.length);

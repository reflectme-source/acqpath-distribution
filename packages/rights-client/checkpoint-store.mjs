import {readFile,writeFile,mkdir,rename,lstat,rmdir,unlink} from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import {randomBytes,scryptSync,createCipheriv,createDecipheriv} from 'node:crypto';
async function noLinks(p){for(let dir=resolve(p);;dir=dirname(dir)){try{if((await lstat(dir)).isSymbolicLink())throw Error('CHECKPOINT_SYMLINK_REJECTED');}catch(e){if(e.code!=='ENOENT')throw e;}if(dirname(dir)===dir)break;}}
export class EncryptedCheckpointStore{
 constructor(directory,password){if(typeof password!=='string'||password.length<16)throw Error('CHECKPOINT_PASSWORD_MIN_16_CHARS');this.directory=resolve(directory);this.password=password;}
 path(id){if(!/^[a-zA-Z0-9_-]{1,64}$/.test(id))throw Error('BAD_CHECKPOINT_ID');return join(this.directory,id+'.json.enc');}
 async load(id){const file=this.path(id);await noLinks(file);let bytes;try{if((await lstat(file)).size>1048576)throw Error('CHECKPOINT_TOO_LARGE');bytes=await readFile(file,'utf8');}catch(e){if(e.code==='ENOENT')return null;throw e;}let envelope;try{envelope=JSON.parse(bytes);if(envelope.v!==1)throw Error();const salt=Buffer.from(envelope.salt,'hex'),iv=Buffer.from(envelope.iv,'hex'),tag=Buffer.from(envelope.tag,'hex');if(salt.length!==16||iv.length!==12||tag.length!==16)throw Error();const key=scryptSync(this.password,salt,32);const decipher=createDecipheriv('aes-256-gcm',key,iv);decipher.setAAD(Buffer.from('acqpath-checkpoint-v1:'+id));decipher.setAuthTag(tag);const data=Buffer.concat([decipher.update(Buffer.from(envelope.body,'base64')),decipher.final()]);key.fill(0);return JSON.parse(data.toString('utf8'));}catch{throw Error('CHECKPOINT_DECRYPTION_FAILED');}}
 async save(id,value){const file=this.path(id);await noLinks(file);await mkdir(this.directory,{recursive:true,mode:0o700});const data=Buffer.from(JSON.stringify(value));if(data.length>524288)throw Error('CHECKPOINT_TOO_LARGE');const salt=randomBytes(16),iv=randomBytes(12),key=scryptSync(this.password,salt,32);const cipher=createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(Buffer.from('acqpath-checkpoint-v1:'+id));const ciphertext=Buffer.concat([cipher.update(data),cipher.final()]);key.fill(0);data.fill(0);const tmp=file+'.tmp-'+randomBytes(8).toString('hex');await writeFile(tmp,JSON.stringify({v:1,salt:salt.toString('hex'),iv:iv.toString('hex'),tag:cipher.getAuthTag().toString('hex'),body:ciphertext.toString('base64')})+'\n',{mode:0o600,flag:'wx'});try{await rename(tmp,file);}catch(e){await unlink(tmp).catch(()=>{});throw e;}}
 async withLock(id,fn){const file=this.path(id),lock=file+'.lock';await noLinks(file);await mkdir(this.directory,{recursive:true,mode:0o700});try{await mkdir(lock,{mode:0o700});}catch(e){if(e.code==='EEXIST')throw Error('PURCHASE_LOCKED_DO_NOT_AUTO_DELETE');throw e;}try{return await fn();}finally{await rmdir(lock);}}
}
// One logical id = one purchase. A restart cannot silently create a replacement order.
export async function buyOnce(client,input,{store,id}){
 return store.withLock(id,async()=>{
  const old=await store.load(id);
  if(old){if(old.kind==='unavailable'){if(JSON.stringify(old.input)!==JSON.stringify(input))throw Error('REQUEST_ID_REUSED_FOR_DIFFERENT_INPUT');return old.result;}if(old.kind==='starting')throw Error('INTERRUPTED_BEFORE_CHECKPOINT_REVIEW_REQUIRED');if(JSON.stringify(old.input)!==JSON.stringify(input))throw Error('REQUEST_ID_REUSED_FOR_DIFFERENT_INPUT');return client.resume(old,{onCheckpoint:c=>store.save(id,c)});}
  await store.save(id,{kind:'starting',input,at:new Date().toISOString()});
  const result=await client.buy(input,{onCheckpoint:c=>store.save(id,c)});
  if(result.status==='UNAVAILABLE')await store.save(id,{kind:'unavailable',input,result});
  return result;
 });
}

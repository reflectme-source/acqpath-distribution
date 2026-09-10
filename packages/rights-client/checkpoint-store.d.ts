import type {RightsClient,RightsInput,PurchaseResult} from './index.js';
export declare class EncryptedCheckpointStore {constructor(directory:string,password:string);load(id:string):Promise<any|null>;save(id:string,value:any):Promise<void>;withLock<T>(id:string,fn:()=>Promise<T>):Promise<T>;}
export declare function buyOnce(client:RightsClient,input:RightsInput,options:{store:EncryptedCheckpointStore;id:string}):Promise<PurchaseResult>;

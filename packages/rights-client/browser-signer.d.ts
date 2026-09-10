import type {PaymentContext} from './index.js';
export declare function typedAuthorization(ctx:PaymentContext,from:string,options?:{now?:number;nonce?:string}):{message:any;typedData:any};
export declare function createBrowserSigner(provider:{request(args:{method:string;params?:unknown[]}):Promise<any>},options:{approve:(summary:Record<string,string>)=>Promise<boolean>}):(ctx:PaymentContext)=>Promise<any>;

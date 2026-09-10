export type Purpose = 'ai-input'|'ai-train'|'ai-index'|'search';
export interface RightsInput {resource:string;purpose:Purpose;user_class?:'commercial'|'non-commercial'|'education'|'government'|'personal';geo?:string|null;freshness_seconds?:number;tier?:'fresh'|'deep';max_total_micro:string;}
export interface Quote {available:boolean;reason?:string;quote_id?:string;claim_token?:string;fee_micro?:string;redeem_url?:string;[key:string]:unknown;}
export interface PaymentContext {challenge:any;requirements:any;url:string;maxAmountMicro:string;}
export interface PurchaseResult {status:'DELIVERED'|'UNAVAILABLE';result?:any;quote?:Quote;charged_micro?:string;quote_id?:string;independent_chain_validation?:false;}
export declare const MAINNET:{origin:string;network:string;asset:string;payTo:string};
export declare const EVIDENCE_KEY:JsonWebKey;
export declare class TaskBudget {constructor(limit:string);reserve(id:string,amount:string):void;commit(id:string,actual:string):void;release(id:string):void;available():bigint;snapshot():{limit_micro:string;spent_micro:string;available_micro:string;pending:number};}
export declare class RightsClient {constructor(options?:{pay?:(context:PaymentContext)=>Promise<any>;publicEvidenceKey?:JsonWebKey;maxFeeMicro?:string;budget?:TaskBudget;fetch?:typeof fetch;timeoutMs?:number});quote(input:RightsInput):Promise<Quote>;capabilities():Promise<any>;buy(input:RightsInput,options:{onCheckpoint:(checkpoint:any)=>Promise<void>}):Promise<PurchaseResult>;resume(checkpoint:any,options:{onCheckpoint:(checkpoint:any)=>Promise<void>}):Promise<PurchaseResult>;}
export declare function validateInput(input:RightsInput):RightsInput;
export declare function publicQuoteSummary(q:Quote):Record<string,unknown>;
export declare function publicDeliverySummary(value:PurchaseResult):Record<string,unknown>;

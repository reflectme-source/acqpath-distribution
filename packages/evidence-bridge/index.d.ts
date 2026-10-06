export type EvidenceStatement='declared_permitted'|'declared_prohibited'|'license_required'|'unknown';
export type ResolutionStatus='resolved'|'unavailable'|'unsupported'|'invalid';
export interface EvidenceRequestV1{schema:'rights-evidence.request.v1';resource:string;intended_use:{purpose:string};context:Record<string,unknown>;}
export interface RightsEvidenceV1{schema:'rights-evidence.v1';kind:'source_rights_declaration';statement:EvidenceStatement;resource:string;intended_use:{purpose:string};provenance:{provider:string;observed_at:string|null;expires_at:string|null;evidence_ref:string|null};verification:{status:'verified'|'unverified'|'invalid';algorithm?:string};provider_details?:Record<string,unknown>;}
export interface EvidenceResolutionV1{schema:'rights-evidence.resolution.v1';status:ResolutionStatus;request:EvidenceRequestV1;evidence:RightsEvidenceV1[];error:Record<string,unknown>|null;}
export declare const SCHEMAS:Readonly<{request:string;evidence:string;resolution:string}>;
export declare const DEFAULT_ACQPATH_EVIDENCE_KEY:JsonWebKey;
export declare const EVIDENCE_STATEMENTS:readonly EvidenceStatement[];
export declare const RESOLUTION_STATUSES:readonly ResolutionStatus[];
export declare function validateEvidenceRequest(request:EvidenceRequestV1):EvidenceRequestV1;
export declare function makeEvidenceRequest(input:{resource:string;purpose:string;context?:Record<string,unknown>}):EvidenceRequestV1;
export declare function validateRightsEvidence(evidence:RightsEvidenceV1):RightsEvidenceV1;
export declare function makeResolution(input:{request:EvidenceRequestV1;status:ResolutionStatus;evidence?:RightsEvidenceV1[];error?:Record<string,unknown>|null}):EvidenceResolutionV1;
export declare function mapAcqPathDecision(decision:string):EvidenceStatement;
export declare function normalizeAcqPathPurchaseResult(request:EvidenceRequestV1,purchaseResult:unknown,options?:{publicEvidenceKey?:JsonWebKey;providerName?:string}):Promise<EvidenceResolutionV1>;
export declare function createAcqPathProvider(input:{resolvePurchase(input:{resource:string;purpose:string;context:Record<string,unknown>}):Promise<unknown>;publicEvidenceKey?:JsonWebKey;providerName?:string}):{name:string;resolve(request:EvidenceRequestV1):Promise<EvidenceResolutionV1>};
export declare function createEvidenceResolver(input:{provider:{resolve(request:EvidenceRequestV1):Promise<EvidenceResolutionV1>}}):{resolve(request:EvidenceRequestV1):Promise<EvidenceResolutionV1>};
export declare function requestFromWebhook(body:Record<string,unknown>,mapping?:{resourcePath?:string;purposePath?:string;contextPath?:string}):EvidenceRequestV1;
export declare function createWebhookProfile(input:{resolver:{resolve(request:EvidenceRequestV1):Promise<EvidenceResolutionV1>};mapping?:{resourcePath?:string;purposePath?:string;contextPath?:string};decide?:(input:{request:EvidenceRequestV1;resolution:EvidenceResolutionV1})=>Promise<{decision:'allow'|'deny'|'warn'|'review';reason?:string}>|{decision:'allow'|'deny'|'warn'|'review';reason?:string}}):{handle(body:Record<string,unknown>):Promise<Record<string,unknown>>};
export declare function toAttestedValue(evidence:RightsEvidenceV1):Record<string,unknown>;
export declare function toPolicyInput(resolution:EvidenceResolutionV1,options:{evaluatedAt:string}):Record<string,unknown>;
export declare function asEvidenceProvider(resolver:{resolve(request:EvidenceRequestV1):Promise<EvidenceResolutionV1>}):{resolve(request:EvidenceRequestV1):Promise<EvidenceResolutionV1>};

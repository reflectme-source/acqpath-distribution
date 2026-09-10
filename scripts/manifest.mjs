// Restricted manifest profile validated from the current official Registry schema.
export function validateManifest(s){
 if(s?.$schema!=='https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json')throw Error('REGISTRY_SCHEMA_REVIEW_REQUIRED');
 if(typeof s.name!=='string'||s.name.length>200||! /^[a-zA-Z0-9.-]+\/[a-zA-Z0-9._-]+$/.test(s.name))throw Error('INVALID_REGISTRY_NAME');
 for(const k of ['description','title'])if(typeof s[k]!=='string'||s[k].length<1||s[k].length>100)throw Error('REGISTRY_DESCRIPTION_OR_TITLE_LIMIT');
 if(typeof s.version!=='string'||!/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(s.version))throw Error('EXACT_REGISTRY_VERSION_REQUIRED');
 if(!Array.isArray(s.remotes)||s.remotes.length!==1||s.remotes[0].type!=='streamable-http'||s.remotes[0].url!=='https://api.getacqpath.com/mcp')throw Error('UNEXPECTED_REGISTRY_REMOTE');
 if(s.remotes[0].headers||s.remotes[0].variables||s.packages)throw Error('THIS_PROFILE_HAS_NO_AUTH_HEADERS_OR_PACKAGES');return s;
}

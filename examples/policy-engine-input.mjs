import {toPolicyInput} from '../packages/evidence-bridge/index.mjs';

export function policyInputFromResolution(resolution,{evaluatedAt=new Date().toISOString()}={}){
  return toPolicyInput(resolution,{evaluatedAt});
}

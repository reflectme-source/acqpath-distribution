import {execFileSync} from 'node:child_process';
const forbidden = [
  /^ACQPATH_PROSPECTS\.csv$/i,
  /^TOP_10_TARGETS\.md$/i,
  /^WAVE1_(?:ECONOMICS|APPROVAL|VERIFICATION)\.md$/i,
  /^(?:APPROVAL_QUEUE|INTEGRATION_QUEUE)\.md$/i,
];
const paths=execFileSync('git',['ls-files','--cached','--full-name'],{encoding:'utf8'}).trim().split(/\r?\n/);
const leaking=paths.filter(p=>forbidden.some(rule=>rule.test(p)));
if(leaking.length){
  console.error('PUBLIC_INTERNAL_FILES_BLOCKED:',leaking.join(', '));
  process.exit(1);
}
console.log('PUBLIC_SURFACE_OK:',paths.length,'tracked paths checked');

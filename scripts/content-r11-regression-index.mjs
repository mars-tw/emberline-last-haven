import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const dir='docs/content/r15/regression/r11',sha=b=>createHash('sha256').update(b).digest('hex');
export const records=[];
for(const folder of ['art-r5-store','art-r5-comparison','deep-r1']){
 for(const name of await readdir(`${dir}/regression/${folder}`)){
  if(!name.endsWith('.png'))continue;
  const path=`${dir}/regression/${folder}/${name}`,bytes=await readFile(path);
  const row={path,sha256:sha(bytes),dimensions:[bytes.readUInt32BE(16),bytes.readUInt32BE(20)],sourceKind:'direct headless product capture',writer:folder==='deep-r1'?'scripts/deep-verify.mjs':'scripts/art-r5-store.mjs'};
  if(folder==='art-r5-comparison'){
   const match=name.match(/^(phone|tablet|desktop)-(before|after)\.png$/);assert.ok(match);
   row.original=`docs/art/compare/r5-${match[2]}/${match[1]}-common-progress.png`;
   assert.equal(sha(await readFile(row.original)),row.sha256);
   row.sourceKind=match[2]==='before'?'byte-identical historical reference copy':'byte-identical current-build verification copy';row.writer='scripts/art-r4-verify.py';
  }
  records.push(row);
 }
}
assert.equal(records.length,12);
await writeFile(`${dir}/regression-output-manifest.json`,JSON.stringify({status:'VERIFIED',indexSha256:sha(await readFile('dist/index.html')),count:12,captures:records,note:'Existing CI assertions unchanged. Six direct captures (including intentional asset-failure UI), six labelled comparison copies; excluded from review-set.'},null,2));
console.log('VERIFIED 12 current-round regression outputs; old write-only PNG paths no longer regenerated');

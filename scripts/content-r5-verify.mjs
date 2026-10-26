import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const dir='docs/content/r15/regression/r5',sha=b=>createHash('sha256').update(b).digest('hex');
const r=JSON.parse(await readFile(`${dir}/receipt.json`)),before=JSON.parse(await readFile(`${dir}/before/receipt.json`)),art=JSON.parse(await readFile('docs/art/compare/r5-after/captures.json'));
assert.equal(r.status,'VERIFIED');assert.equal(r.indexSha256,sha(await readFile('dist/index.html')));assert.equal(art.indexSha256,r.indexSha256);
const evidence=[];for(const view of ['phone','tablet','desktop']){
 const name=`${view}-defense-active.png`;
 for(const [phase,c] of [['before',before.captures.find(c=>c.path.endsWith('/'+name))],['after',art.records.find(c=>c.path.endsWith('/'+name))]]){
  assert.ok(c);const bytes=await readFile(c.path);assert.equal(sha(bytes),c.sha256);const path=`docs/content/r15/regression/evidence/content-r5/${phase}/${name}`;await mkdir(`docs/content/r15/regression/evidence/content-r5/${phase}`,{recursive:true});await copyFile(c.path,path);evidence.push({phase,path,original:c.path,sha256:c.sha256,dimensions:[bytes.readUInt32BE(16),bytes.readUInt32BE(20)]});
 }
}
await writeFile('docs/content/r15/regression/evidence/content-r5/receipt.json',JSON.stringify({status:'VERIFIED',beforeSourceCommit:before.sourceCommit,indexSha256:r.indexSha256,captures:evidence},null,2));
await writeFile(`${dir}/SCREENSHOT_INDEX.md`,['# R5 原尺寸截圖索引','','| 原檔 | 尺寸 | 來源 | SHA-256 |','|---|---|---|---|',...r.captures.map(c=>`| [${c.path}](../../../${c.path}) | ${c.dimensions.join('×')} | ${c.source} | ${c.sha256} |`),''].join('\n'));
await writeFile(`${dir}/gates.json`,JSON.stringify({status:'VERIFIED',version:r.version,indexSha256:r.indexSha256,automatedChecks:r.checks.length,originalCaptures:r.captures.length,reviewSet:15,acceptance:[{item:1,status:'VERIFIED'},{item:2,status:'VERIFIED'},{item:3,status:'VERIFIED'},{item:4,status:'VERIFIED'},{item:5,automated:'VERIFIED',fiveSecondHumanTest:'BLOCKED'}],generatedImages:1,runtimeIllustrations:2,museRescore:{status:'BLOCKED',score:null,target:8},physicalDevices:0,humanParticipants:0},null,2));
console.log('VERIFIED R5 original index, three-view before/after evidence, explicit human-test boundary');

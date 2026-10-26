import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';

const json=async path=>JSON.parse(await readFile(path,'utf8'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const pkg=await json('package.json');
const [campaign,storage,plan,baseline,supplement,receipt,manifest,manual]=await Promise.all([
 readFile('src/campaign.ts','utf8'),readFile('src/storage.ts','utf8'),
 readFile('docs/OPTIM_PLAN_CONTENT_R17.md','utf8'),json('docs/content/r17/baseline.json'),
 json('docs/content/r17/baseline-supplement.json'),
 json('docs/content/r17/receipt.json'),json('docs/content/r17/review-set-manifest.json'),
 json('docs/content/r17/manual-review.json')
]);
assert.equal(pkg.version,'0.17.0');
assert.match(campaign,/VERSION='0\.17\.0'/);
assert.ok(storage.includes("'0.16.0'"),'R16 saves must remain importable');
assert.equal(baseline.status,'FROZEN');
assert.equal(supplement.status,'FROZEN_SUPPLEMENT');
assert.equal(supplement.head,baseline.head);
assert.equal(supplement.sourceInputs.length,18);
assert.match(plan,/CONTENT_R17|第十七輪/);
assert.equal(receipt.status,'VERIFIED');
assert.equal(receipt.version,'0.17.0');
assert.equal(receipt.indexSha256,sha(await readFile('dist/index.html')),'R17 receipt must bind the current build');
assert.deepEqual(receipt.errors,[]);
assert.deepEqual(receipt.externalRequests,[]);
assert.equal(receipt.checks.length,39);
assert.ok(receipt.checks.every(x=>x.status==='VERIFIED'));
assert.equal(receipt.captures.length,66);
assert.equal(new Set(receipt.captures.map(x=>x.path)).size,66);
for(const item of receipt.captures){
 assert.ok(item.path.startsWith('docs/content/r17/')&&!item.path.includes('..'),item.path);
 const bytes=await readFile(item.path);
 assert.equal(sha(bytes),item.sha256,item.path);
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',item.path);
 assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],item.dimensions,item.path);
}
assert.equal(manifest.status,'VERIFIED');
assert.equal(manifest.count,15);
assert.equal(manifest.screenshots.length,15);
assert.equal(new Set(manifest.screenshots.map(x=>x.path)).size,15);
assert.deepEqual(manifest.distribution,{flank:5,relay:5,crew:5});
assert.equal(manual.status,'VERIFIED');
assert.equal(manual.reviewer,'local visual self-review');
assert.equal(manual.records.length,15);
assert.equal(manual.supplemental.length,5);
assert.ok(manual.limits.some(x=>x.includes('independent')));
for(const item of manifest.screenshots){
 const bytes=await readFile(item.path);
 assert.equal(sha(bytes),item.sha256,item.path);
 const selected=manual.records.find(x=>x.path===item.path);
 assert.ok(selected,item.path);
 assert.equal(selected.inspection,'VERIFIED',item.path);
 assert.equal(selected.sha256,item.sha256,item.path);
 assert.deepEqual(selected.size,[1290,2796],item.path);
 assert.deepEqual(item.dimensions,[1290,2796],item.path);
 assert.equal(bytes.readUInt32BE(16),1290,item.path);
 assert.equal(bytes.readUInt32BE(20),2796,item.path);
}
const expectedSupplemental=new Map([
 ['docs/content/r17/phone-flank-east-646.png',[646,1400]],
 ['docs/content/r17/phone-repair-receipt-320x568.png',[320,568]],
 ['docs/content/r17/phone-repair-receipt-430x932.png',[430,932]],
 ['docs/content/r17/phone-repair-receipt-844x390.png',[844,390]],
 ['docs/content/r17/phone-repair-receipt-1366x600.png',[1366,600]]
]);
assert.deepEqual([...manual.supplemental.map(x=>x.path)].sort(),[...expectedSupplemental.keys()].sort());
for(const item of manual.supplemental){
 const bytes=await readFile(item.path);
 assert.equal(item.inspection,'VERIFIED',item.path);
 assert.match(item.sha256,/^[a-f0-9]{64}$/,item.path);
 assert.equal(sha(bytes),item.sha256,item.path);
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',item.path);
 assert.deepEqual(item.size,expectedSupplemental.get(item.path),item.path);
 assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],item.size,item.path);
}
console.log('VERIFIED R17 version/migration chain, browser receipt, 15 original captures and all 5 supplemental image hashes/dimensions.');

// Complete the unchanged R2 post-processing after its real gameplay receipt was written.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const dir='docs/content/r15/regression/r2',sha=b=>createHash('sha256').update(b).digest('hex');
const r=JSON.parse(await readFile(`${dir}/receipt.json`,'utf8')),before=JSON.parse(await readFile(`${dir}/before/receipt.json`,'utf8'));
assert.equal(r.status,'VERIFIED');assert.equal(r.indexSha256,sha(await readFile('dist/index.html')));assert.equal(r.version,JSON.parse(await readFile('package.json')).version);assert.deepEqual(r.errors,[]);assert.deepEqual(r.externalRequests,[]);
for(const c of [...r.captures,...before.captures]){const bytes=await readFile(c.path);assert.equal(sha(bytes),c.sha256);assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],c.dimensions);}
const units=JSON.parse(await readFile('docs/evidence/unit-tests.json','utf8'));assert.equal(units.numPassedTests,298);assert.equal(units.numFailedTests,0);
const rows=[...before.captures.map(c=>({...c,source:`pre-R2 Git ${before.sourceCommit}`})),...r.captures];
await writeFile(`${dir}/SCREENSHOT_INDEX.md`,['# R2 原尺寸截圖索引','','VERIFIED：正常操作、明確邊界fixture、實際測試收據與修改前Git對照分開標示。','','| 原尺寸路徑 | 像素尺寸 | 來源 | SHA-256 |','|---|---|---|---|',...rows.map(c=>`| [${c.path}](../../../${c.path}) | ${c.dimensions.join(' × ')} | ${c.source} | ${c.sha256} |`),''].join('\n'));
await writeFile('docs/content/r15/regression/r14/attempts/r2-index-recovery.json',JSON.stringify({status:'VERIFIED',indexSha256:r.indexSha256,reason:'R2 wrote its VERIFIED gameplay receipt, then its final screenshot index read failed because the migrated before JSON was missing. Recovered historical JSON from exact Git bytes, preserved original files, verified every current and before screenshot hash, and reran the index stage only.',browserChecks:r.checks.length,captures:r.captures.length,completedAt:new Date().toISOString()},null,2));
console.log(`VERIFIED R2 recovery: ${r.checks.length} real gameplay/browser checks and ${r.captures.length} current screenshots; complete index and historical hashes`);

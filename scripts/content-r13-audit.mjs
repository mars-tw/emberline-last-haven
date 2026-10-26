import {readFile,writeFile,readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const read=async p=>JSON.parse((await readFile(p,'utf8')).replace(/^\uFEFF/,'')),sha=b=>createHash('sha256').update(b).digest('hex');
const r=await read('docs/content/r15/regression/r13/receipt.json'),review=await read('docs/content/r15/regression/r13/review-set-manifest.json'),pkg=await read('package.json');
assert.equal(r.status,'VERIFIED');assert.equal(r.version,pkg.version);assert.equal(r.indexSha256,sha(await readFile('dist/index.html')));assert.equal(r.headless,true);assert.deepEqual(r.errors,[]);assert.deepEqual(r.externalRequests,[]);
assert.equal(review.count,15);assert.deepEqual(review.distribution,{flank:5,relay:5,crew:5});assert.equal((await readdir('docs/content/r15/regression/r13/review-set')).length,15);
for(const row of [...r.captures,...review.screenshots]){const b=await readFile(row.path);assert.equal(sha(b),row.sha256);assert.deepEqual([b.readUInt32BE(16),b.readUInt32BE(20)],row.dimensions);}
for(const row of review.screenshots){assert.deepEqual(row.dimensions,[1290,2796]);assert.equal(sha(await readFile(row.original)),row.sha256);}
for(const [kind,dims] of [['phone',[1290,2796]],['tablet',[2064,2752]]]){const b=await readFile(`docs/store/screenshots/${kind}-18-content-r13.png`);assert.deepEqual([b.readUInt32BE(16),b.readUInt32BE(20)],dims);}
const get=name=>r.captures.find(c=>c.path.endsWith(`/phone-${name}.png`));
const sequence=['selected','impact','blocked'].map(phase=>get(`crew-roof-${phase}`));assert.equal(new Set(sequence.map(c=>c.sha256)).size,3);assert.deepEqual(sequence.map(c=>c.telemetry.nightPresentation.phase),['selected','impact','blocked']);assert.deepEqual(sequence.map(c=>c.state.crew.shield),[0,0,0]); // persisted transaction; selected UI intentionally shows before1.
assert.match(sequence[0].ui,/擋擊盾格 ■ 1／1/);for(const c of sequence.slice(1))assert.match(c.ui,/0／1/);assert.equal(sequence[2].state.level,1);assert.doesNotMatch(sequence[2].ui,/護具\s+1/);
assert.match(get('crew-swap-preview').ui,/7.75 秒/);assert.match(get('crew-swap-preview').ui,/目前疲勞：老席 3・熹 0・安 2/);assert.equal(get('relay-rescue-cap').state.nightRepair.extra,1);
const art=await read('docs/art/ASSET_MANIFEST_CONTENT_R13.json');assert.equal(art.generatedImages,0);assert.equal(art.tool,null);
const gates=await read('docs/evidence/repository-gates.json');Object.assign(gates,{r13EvidenceCaptures:r.captures.length,r13ReviewSet:15,r13BrowserChecks:r.checks.length,storeScreenshots:(await readdir('docs/store/screenshots')).filter(p=>p.endsWith('.png')).length});await writeFile('docs/evidence/repository-gates.json',JSON.stringify(gates,null,2));
const store=await read('docs/store/asset-manifest.json');store.newGeneration={status:'VERIFIED',actualTool:null,usedModelSlug:null,generatedAssets:0,generationCalls:0,sourceManifest:'docs/art/ASSET_MANIFEST_CONTENT_R13.json'};store.missing=['Physical phone/iPad validation','Human playtest','Muse R13 independent rescore','Exclusive clean-host shipping performance'];await writeFile('docs/store/asset-manifest.json',JSON.stringify(store,null,2));
console.log(`VERIFIED R13 audit: ${r.checks.length} browser checks, ${r.captures.length} image hashes, 15 originals, store dimensions and same-wave numeric consistency`);

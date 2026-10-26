import {readFile,readdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=b=>createHash('sha256').update(b).digest('hex');
const r=await read('docs/content/r15/regression/r14/receipt.json'),m=await read('docs/content/r15/regression/r14/review-set-manifest.json'),pkg=await read('package.json');
assert.equal(r.status,'VERIFIED');assert.equal(r.version,pkg.version);assert.equal(r.indexSha256,sha(await readFile('dist/index.html')));assert.equal(r.headless,true);assert.equal(r.muteAudio,true);assert.deepEqual(r.errors,[]);assert.deepEqual(r.externalRequests,[]);
assert.equal(m.count,15);assert.deepEqual(m.distribution,{flank:5,relay:5,crew:5});assert.equal((await readdir('docs/content/r15/regression/r14/review-set')).length,15);
for(const row of [...r.captures,...m.screenshots]){const b=await readFile(row.path);assert.equal(sha(b),row.sha256);assert.deepEqual([b.readUInt32BE(16),b.readUInt32BE(20)],row.dimensions);}
for(const row of m.screenshots){assert.deepEqual(row.dimensions,[1290,2796]);assert.equal(sha(await readFile(row.original)),row.sha256);}
const get=n=>r.captures.find(c=>c.path.endsWith(`/phone-${n}.png`));
assert.equal(get('flank-east-preview').telemetry.previewArrows.length,4);assert.deepEqual(get('flank-east-cancelled').telemetry.previewArrows,[]);assert.equal(get('flank-east-cancelled').state.supplies,get('flank-east-preview').state.supplies);
for(const c of r.captures)assert.ok(c.telemetry.labels.every(l=>!/^\d+$/.test(l.text)),'no enemy number badge');
for(const n of ['crew-swap-preview','crew-reloaded'])assert.doesNotMatch(get(n).ui,/×/);
assert.match(get('crew-formula-details').ui,/基礎秒數/);assert.match(get('crew-formula-details').ui,/×/);
const seq=['selected','impact','blocked'].map(n=>get('crew-roof-'+n));assert.equal(new Set(seq.map(c=>c.sha256)).size,3);assert.deepEqual(seq.map(c=>c.telemetry.nightPresentation.phase),['selected','impact','blocked']);
assert.deepEqual(seq.map(c=>[c.state.hull,c.state.supplies]),[[87,29],[87,29],[87,29]]);assert.match(seq[1].ui,/熹擋下，盾格 1→0/);
for(const n of ['relay-rescue-99-sealed','relay-rescue-next']){assert.match(get(n).ui,/林叔[\s\S]*阿禾/);assert.equal(get(n).state.people,5);}
for(const [kind,dims] of [['phone',[1290,2796]],['tablet',[2064,2752]]]){const b=await readFile(`docs/store/screenshots/${kind}-19-content-r14.png`);assert.deepEqual([b.readUInt32BE(16),b.readUInt32BE(20)],dims);}
const art=await read('docs/art/ASSET_MANIFEST_CONTENT_R14.json'),prompts=await read('docs/art/PROMPTS_CONTENT_R14.json');assert.equal(art.generatedImages,3);assert.equal(art.tool,'image_gen__imagegen');assert.equal(prompts.stylePrefix,(await read('docs/art/PROMPTS_R5.json')).stylePrefix);
for(const a of art.assets){assert.equal(a.hasAlpha,true);assert.equal(sha(await readFile(a.source)),a.sourceSha256);assert.equal(sha(await readFile(a.path)),a.sha256);}
const store=await read('docs/store/asset-manifest.json');store.newGeneration={status:'VERIFIED',actualTool:art.tool,usedModelSlug:null,generatedAssets:3,generationCalls:3,sourceManifest:'docs/art/ASSET_MANIFEST_CONTENT_R14.json'};store.assets=store.assets.filter(a=>!art.assets.some(n=>n.path===a.path));store.assets.push(...art.assets);store.missing=['Physical phone/iPad validation','Human playtest','Muse R14 independent rescore','Exclusive clean-host shipping performance'];await writeFile('docs/store/asset-manifest.json',JSON.stringify(store,null,2));
const gates=await read('docs/evidence/repository-gates.json');Object.assign(gates,{r14EvidenceCaptures:r.captures.length,r14ReviewSet:15,r14BrowserChecks:r.checks.length,r14GeneratedAssets:art.assets.length});await writeFile('docs/evidence/repository-gates.json',JSON.stringify(gates,null,2));
console.log(`VERIFIED R14: ${r.checks.length} browser checks, 15 native review originals, 3 generated assets, state/scene identity and store sizes`);

let launches=0;for(const name of (await readdir('scripts')).filter(n=>n.endsWith('.mjs'))){const source=await readFile('scripts/'+name,'utf8');for(const call of source.matchAll(/launch\(\{([^}]+)\}\)/g)){assert.match(call[1],/headless:true/,name);assert.match(call[1],/--mute-audio/,name);launches++;}}assert.ok(launches>0);console.log(`VERIFIED ${launches} headless muted browser launch sites`);

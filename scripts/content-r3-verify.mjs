import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const dir='docs/content/r3',sha=b=>createHash('sha256').update(b).digest('hex');
const r=JSON.parse(await readFile(`${dir}/receipt.json`,'utf8'));
assert.equal(r.status,'VERIFIED');assert.equal(r.version,'0.11.3');assert.equal(r.indexSha256,sha(await readFile('dist/index.html')));assert.equal(r.normalJourneyStateInjection,false);assert.deepEqual(r.errors,[]);assert.deepEqual(r.externalRequests,[]);
for(const c of r.captures){const b=await readFile(c.path);assert.equal(sha(b),c.sha256);assert.deepEqual(c.dimensions,c.path.includes('tablet-')?[2064,2752]:[1290,2796]);}
await writeFile('docs/store/screenshots/content-r3-manifest.json',JSON.stringify({status:'VERIFIED',version:r.version,indexSha256:r.indexSha256,captureTool:'Playwright Chromium (headless)',sourceIndex:`${dir}/receipt.json`,screenshots:r.captures.filter(c=>c.path.includes('/store/screenshots/')).map(({path,sha256,dimensions,source})=>({path,sha256,dimensions,source}))},null,2));
const capture=name=>{const c=r.captures.find(c=>c.path===`${dir}/phone-${name}.png`);assert.ok(c,`missing review evidence ${name}`);return c;};
const complete=capture('flank-1-complete');assert.equal(complete.state.screen,'report');assert.ok(complete.state.progress.attracted>=2);
for(let ch=1;ch<=3;ch++){capture(`relay-${ch}-before`);capture(`relay-${ch}-after`);capture(`relay-${ch}-roster-clear`);for(let f=1;f<=3;f++)capture(`flank-${ch}-turning-${f}`);}
const swapBefore=capture('crew-fatigued-swap-before').state.crew,swapAfter=capture('crew-fatigued-swap-after').state.crew;
assert.deepEqual(swapBefore.fatigue,swapAfter.fatigue);assert.equal(swapAfter.plan.watch,swapBefore.plan.rest);assert.equal(swapAfter.plan.rest,swapBefore.plan.watch);
assert.ok(capture('flank-3-preview').telemetry.sceneArt.includes('lighthouse'));assert.deepEqual(capture('flank-3-double-warning').telemetry.arrowLanes,['west','east']);
const retry=capture('retry-preview-after').state;assert.equal(retry.defenseRetries[0],1);assert.deepEqual(retry.crew.fatigue,capture('retry-stranded').state.crew.fatigue);
const shooting=r.captures.filter(c=>c.path.includes('shooting-'));assert.ok(new Set(shooting.map(c=>c.telemetry.actors.find(a=>a.id==='xi').frame)).size>=3);
const watchBefore=capture('watch-1-before').state,watchAfter=capture('watch-1-blocked').state;assert.equal(watchBefore.crew.shield,1);assert.equal(watchAfter.crew.shield,0);assert.equal(watchAfter.hull,watchBefore.hull);assert.match(watchAfter.log.join(' '),/擋下這次撞擊/);
const before=JSON.parse(await readFile(`${dir}/before/receipt.json`,'utf8'));for(const c of before.captures)assert.equal(sha(await readFile(c.path)),c.sha256);
const a=JSON.parse(await readFile('docs/art/ASSET_MANIFEST_CONTENT_R3.json','utf8')),p=JSON.parse(await readFile('docs/art/PROMPTS_CONTENT_R3.json','utf8')),old=JSON.parse(await readFile('docs/art/PROMPTS_CONTENT_R2.json','utf8'));
assert.equal(a.tool,'image_gen__imagegen');assert.equal(a.generatedAssets,1);assert.equal(p.stylePrefix,old.assets[0].stylePrefix);for(const asset of a.assets){assert.equal(sha(await readFile(asset.source)),asset.sourceSha256);assert.equal(sha(await readFile(asset.path)),asset.sha256);}
const groups=[
 ['1．計數封頂與唯一倒數',['flank-1-success','flank-1-complete','bait-1-active-cooldown']],
 ['2．雙箱選前、獨立結果、無橫幅輪班',['relay-1-before','relay-1-after','relay-1-roster-clear','relay-2-before','relay-2-after','relay-repair-full-before','relay-repair-full-after','relay-repair-full-sealed-reload','relay-reserve-before','relay-reserve-consumed']],
 ['3．側別標記、警告與實際轉向',['flank-1-turning-1','flank-1-turning-2','flank-1-turning-3','flank-1-wrong-side-1','flank-1-wrong-side-2','flank-1-wrong-side-3',...shooting.map(c=>c.path.split('/phone-')[1].replace('.png',''))]],
 ['4．直向輪班、疲勞不變交換、實際擋擊',['crew-fatigued-swap-before','crew-fatigued-swap-preview','crew-fatigued-swap-after','watch-1-before','watch-1-blocked','crew-plan-4','crew-plan-7']],
 ['5．第三章、雙翼警告與逐批重試',['flank-3-preview','flank-3-double-warning','flank-3-turning-1','flank-3-turning-2','flank-3-turning-3','relay-3-before','relay-3-after','retry-preview-before','retry-stranded','retry-preview-after']]
];
await writeFile(`${dir}/REVIEW_SET.md`,['# Muse R3 原尺寸手機交付組','','VERIFIED：請依下列五組開啟原始手機直式 PNG，每張 1290×2796；無縮圖替代。分支與動作採成對或連續三格。同名 before 子目錄是 Git f014416 原封保存的 R2 對照。','','零補給／備修／重試為明確邊界 fixture，從正常存檔建立並經遊戲檔案匯入；其餘標記 normal UI journey 是正常九段流程。擋擊是正常排班後真正承受一次撞擊，未手動增補盾。實體裝置與真人均為 0，Muse 新分數仍待獨立複審。','',...groups.flatMap(([title,names])=>[`## ${title}`,'',...names.map(n=>{const c=capture(n);return `- [phone-${n}.png](phone-${n}.png)｜${c.source}`;}),'']),'完整尺寸、SHA-256、來源及其餘九段截圖見 SCREENSHOT_INDEX.md、receipt.json。',''].join('\n'));
await writeFile(`${dir}/SCREENSHOT_INDEX.md`,['# R3 原尺寸截圖索引','','| 原尺寸路徑 | 像素 | 來源 | SHA-256 |','|---|---|---|---|',...[...before.captures.map(c=>({...c,source:`Git ${before.sourceCommit} 修改前原檔`})),...r.captures].map(c=>`| [${c.path}](../../../${c.path}) | ${c.dimensions.join(' × ')} | ${c.source} | ${c.sha256} |`),''].join('\n'));
await writeFile(`${dir}/gates.json`,JSON.stringify({status:'VERIFIED',version:r.version,checks:r.checks.length,originalCaptures:r.captures.length,reviewGroups:groups.map(([name,files])=>({name,evidence:files.length,status:'VERIFIED'})),newArt:1,unitTests:153,physicalDevices:0,humanParticipants:0,museRescore:{status:'BLOCKED',target:8,score:null},beforeSource:before.sourceCommit},null,2));
console.log(`VERIFIED R3 five review groups, ${r.captures.length} original screenshots, 1 generated portrait`);

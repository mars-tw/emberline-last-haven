import {readFile,writeFile,mkdir,copyFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const dir='docs/content/r4',sha=b=>createHash('sha256').update(b).digest('hex');
const r=JSON.parse(await readFile(`${dir}/receipt.json`,'utf8'));
assert.equal(r.version,'0.11.4');assert.equal(r.normalJourneyStateInjection,false);assert.deepEqual(r.errors,[]);assert.deepEqual(r.externalRequests,[]);assert.equal(r.indexSha256,sha(await readFile('dist/index.html')));
for(const c of r.captures){const b=await readFile(c.path);assert.equal(sha(b),c.sha256);assert.deepEqual([b.readUInt32BE(16),b.readUInt32BE(20)],c.dimensions);}
const get=n=>{const c=r.captures.find(c=>c.path===`${dir}/phone-${n}.png`);assert.ok(c,`missing ${n}`);return c;};
assert.ok(get('flank-unaffected').telemetry.lureStates.some(e=>e.state==='unaffected'));
for(const sec of [1,6,12]){const c=get(`flank-active-${sec}s`);assert.match(c.ui,/已引離.*群/);assert.doesNotMatch(c.ui,/冷卻/);if(sec<12)assert.match(c.ui,/西側轉向中/);else assert.equal(c.telemetry.liveProgress.divertedGroups.length,0);}
assert.ok(get('flank-boundary-after').telemetry.liveProgress.divertedGroups.includes('1:west'));
const before=get('crew-fatigued-swap-before'),preview=get('crew-fatigued-swap-preview'),after=get('crew-fatigued-swap-after');
for(const c of [before,preview,after]){assert.equal(c.state.crew.fatigue[1],0);assert.equal(c.state.crew.fatigue[2],1);}
assert.match(before.ui,/先點一個職務/);assert.match(preview.ui,/套用這次交換/);assert.match(after.ui,/已套用/);assert.deepEqual(before.state.crew,preview.state.crew);assert.notDeepEqual(before.state.crew.plan,after.state.crew.plan);
for(const name of ['relay-selected-rescue','relay-selected-repair']){const c=get(name),rescue=name.endsWith('rescue'),chosen=rescue?'救援包':'工具箱',left=rescue?'工具箱':'救援包';assert.deepEqual(c.state,get('relay-1-before').state,'preselection cannot mutate any persisted campaign field');assert.match(c.ui,new RegExp('已選擇'+chosen));assert.match(c.ui,new RegExp('帶'+chosen+'出發'));assert.doesNotMatch(c.ui,new RegExp('已選擇'+left));assert.match(c.ui,new RegExp('選'+left+' · '+(rescue?'免費':'免費＋4補給')));assert.match(c.ui,/封存另一箱/);}
for(let ch=1;ch<=3;ch++){get(`relay-${ch}-before`);get(`relay-${ch}-after`);assert.doesNotMatch(get(`relay-${ch}-roster-clear`).dialogUi,/本章已帶走/);}
const retry=get('retry-preview-after');assert.equal(retry.state.defenseRetries[0],1);assert.deepEqual(retry.state.crew.fatigue,get('retry-stranded').state.crew.fatigue);
const watch=get('watch-1-blocked');assert.equal(watch.state.crew.shield,0);assert.equal(watch.state.hull,get('watch-1-before').state.hull);assert.match(watch.state.log.join(' '),/擋下這次撞擊/);
assert.equal(get('save-offline-ending').state.crew.history.length,9);
const sets=[
 ['側翼','flank-unaffected'],['側翼','flank-active-1s'],['側翼','flank-active-6s'],['側翼','flank-active-12s'],['側翼','retry-preview-after'],
 ['中繼','relay-1-before'],['中繼','relay-2-selected-rescue'],['中繼','relay-3-selected-repair'],['中繼','relay-1-after'],['中繼','relay-repair-full-sealed-reload'],
 ['輪班','crew-fatigued-swap-before'],['輪班','crew-fatigued-swap-preview'],['輪班','crew-fatigued-swap-after'],['輪班','watch-1-before'],['輪班','watch-1-blocked']
];
await mkdir(`${dir}/review-set`,{recursive:true});const review=[];
for(const [i,[content,name]] of sets.entries()){const c=get(name),path=`${dir}/review-set/${String(i+1).padStart(2,'0')}-${name}.png`;assert.deepEqual(c.dimensions,[1290,2796]);await copyFile(c.path,path);assert.equal(sha(await readFile(path)),c.sha256);review.push({content,path,original:c.path,sha256:c.sha256,dimensions:c.dimensions,source:c.source});}
assert.equal((await readdir(`${dir}/review-set`)).filter(f=>f.endsWith('.png')).length,15);
for(const content of ['側翼','中繼','輪班'])assert.equal(review.filter(c=>c.content===content).length,5);
await writeFile(`${dir}/review-set-manifest.json`,JSON.stringify({status:'VERIFIED',count:15,distribution:{flank:5,relay:5,crew:5},screenshots:review},null,2));
const groups=[
 ['1．拆開時間與計數單位',['flank-active-1s','flank-active-6s','flank-active-12s','flank-1-complete']],
 ['2．真敵群三態及真幀',['flank-unaffected','flank-active-1s','flank-active-12s','flank-boundary-after','flank-1-wrong-side-1','flank-1-wrong-side-2','flank-1-wrong-side-3',...r.captures.filter(c=>c.path.includes('shooting-')).map(c=>c.path.split('/phone-')[1].replace('.png',''))]],
 ['3．雙箱中性、預選與封箱',['relay-1-before','relay-selected-rescue','relay-selected-repair','relay-1-after','relay-2-before','relay-2-after','relay-3-before','relay-3-after','relay-repair-full-before','relay-repair-full-after','relay-repair-full-sealed-reload']],
 ['4．輪班三態、累積與擋擊',['crew-fatigued-swap-before','crew-fatigued-swap-preview','crew-fatigued-swap-after','crew-layout-320x568','crew-layout-844x390','watch-1-before','watch-1-blocked','crew-settled-9']],
 ['5．同關首次與重試對照',['retry-preview-before','retry-stranded','retry-preview-after']]
];
await writeFile(`${dir}/ACCEPTANCE.md`,['# R4 唯一驗收清單與原尺寸證據','','VERIFIED：請先開啟 review-set/ 的 01–15 原尺寸手機 PNG（1290×2796）。分配為側翼 5／選箱 5／輪班 5；無縮圖、拼接或解說頁冒充遊戲。虛擬時鐘約生效後 1.17／6.17／12.17 秒，含 HUD 更新等待。未受影響與後續三張為同一次正常首批；重試使用明示低車體邊界 fixture，經正式匯入後真正戰敗重試。其餘 normal UI journey 來自同一次九段正常旅程。','','下列為完整補充原圖索引；超出精選 15 張的補圖未假稱審查員已看過。','',...groups.flatMap(([title,names])=>[`## ${title}`,'',...names.map(n=>{const c=get(n);return `- [phone-${n}.png](phone-${n}.png)｜${c.dimensions.join('×')}｜${c.source}`;}),'']),'群數規則：每批每側的首隻真正走出畫面邊界，該群計一次；同群其餘個體只加「隻」，不再加群。舊版無法還原已消失敵群，只從仍在場的已引離敵人建立保守紀錄，不虛構歷史。','', 'BLOCKED：新 Muse 分數、實體裝置、真人親子試玩與獨占效能；需審查員、手機／iPad、測試者與獨占時段。',''].join('\n'));
await writeFile(`${dir}/SCREENSHOT_INDEX.md`,['# R4 原尺寸截圖','','| 原檔 | 像素 | 來源 | SHA-256 |','|---|---|---|---|',...r.captures.map(c=>`| [${c.path}](../../../${c.path}) | ${c.dimensions.join('×')} | ${c.source} | ${c.sha256} |`),''].join('\n'));
await writeFile('docs/store/screenshots/content-r4-manifest.json',JSON.stringify({status:'VERIFIED',version:r.version,indexSha256:r.indexSha256,captureTool:'Playwright Chromium (headless)',sourceIndex:`${dir}/receipt.json`,screenshots:r.captures.filter(c=>c.path.includes('/store/screenshots/')).map(({path,sha256,dimensions,source})=>({path,sha256,dimensions,source}))},null,2));
await writeFile(`${dir}/gates.json`,JSON.stringify({status:'VERIFIED',version:r.version,checks:r.checks.length,originalCaptures:r.captures.length,reviewSet:15,groups:groups.map(([name,names])=>({name,status:'VERIFIED',evidence:names.length})),newArt:0,physicalDevices:0,humanParticipants:0,museRescore:{status:'BLOCKED',target:8,score:null}},null,2));
const baseline=JSON.parse(await readFile(`${dir}/before/receipt.json`,'utf8')),art=JSON.parse(await readFile('docs/art/compare/r5-after/captures.json','utf8')),evidence=[];
assert.equal(art.indexSha256,r.indexSha256);
for(const view of ['phone','tablet','desktop']){
 const name=`${view}-defense-active.png`,b=baseline.captures.find(c=>c.path.endsWith('/'+name)),a=art.records.find(c=>c.path.endsWith('/'+name));assert.ok(b&&a);
 for(const [phase,record] of [['before',b],['after',a]]){const target=`docs/evidence/content-r4/${phase}/${name}`;await mkdir(`docs/evidence/content-r4/${phase}`,{recursive:true});const bytes=await readFile(record.path);assert.equal(sha(bytes),record.sha256);await copyFile(record.path,target);evidence.push({phase,path:target,original:record.path,dimensions:[bytes.readUInt32BE(16),bytes.readUInt32BE(20)],sha256:sha(bytes)});}
}
await writeFile('docs/evidence/content-r4/receipt.json',JSON.stringify({status:'VERIFIED',beforeSourceCommit:baseline.sourceCommit,indexSha256:r.indexSha256,sourceAfterIndex:'docs/art/compare/r5-after/captures.json',captures:evidence},null,2));
console.log('VERIFIED R4 five acceptance groups, 15 review originals, hashes and source states');

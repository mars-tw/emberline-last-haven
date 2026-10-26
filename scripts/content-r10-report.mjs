import {readFile,writeFile,access,copyFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {sha} from './content-r10-comparison.mjs';
const read=async p=>JSON.parse(await readFile(p,'utf8').then(s=>s.replace(/^\uFEFF/,''))),dir='docs/content/r15/regression/r10';
const [r,review,execution,units,gates,perf,clean,art]=await Promise.all(['receipt.json','review-set-manifest.json','execution.json'].map(p=>read(`${dir}/${p}`)).concat(['docs/evidence/unit-tests.json','docs/evidence/repository-gates.json','docs/evidence/performance.json',`${dir}/cleanup-result.json`,'docs/art/ASSET_MANIFEST_CONTENT_R10.json'].map(read)));
assert.equal(execution.exitCode,0);assert.equal(r.indexSha256,sha(await readFile('dist/index.html')));assert.equal(units.numPassedTests,234);assert.equal(units.numFailedTests,0);assert.equal(gates.secretScan.hits,0);assert.equal(review.count,15);assert.equal(gates.r10ReviewSet,15);assert.deepEqual(r.errors,[]);assert.deepEqual(r.externalRequests,[]);
for(const c of [...r.captures,...review.screenshots])assert.equal(sha(await readFile(c.path)),c.sha256);
for(const a of clean.delete){await assert.rejects(access(a.path));}clean.status='VERIFIED';clean.fullCheckExitCode=0;await writeFile(`${dir}/cleanup-result.json`,JSON.stringify(clean,null,2));
const preserved=await read(`${dir}/preserved-worktree.json`);for(const f of preserved)assert.equal(sha(await readFile(f.path)),f.sha256);
const get=n=>{const c=r.captures.find(c=>c.path.endsWith(`/phone-${n}.png`));assert.ok(c,n);return c;};
for(const [n,count] of [['0-of-4',0],['2-of-4-preview-east',2],['4-of-4',4]]){const c=get('flank-west-'+n);assert.equal(c.telemetry.liveProgress.diversion['1:west'].escaped,count);assert.equal(c.telemetry.liveProgress.divertedGroups.length,count===4?1:0);}assert.ok(get('flank-west-2-of-4-preview-east').telemetry.liveProgress.baitLeft>0);assert.equal(get('flank-west-4-of-4').telemetry.liveProgress.exitFeedback.id,4);
for(const h of [69,95,100]){const a=get(`relay-${h}-repair-preview`),b=get(`relay-${h}-repair-sealed`);assert.match(a.ui,/＝18％/);assert.match(b.ui,/＝18％/);assert.equal(a.state.hull,h);assert.equal(b.state.hull+b.state.repairCredit,h+18);}
for(const zone of ['roof','window']){const seq=['signal','impact','blocked'].map(s=>get(`watch-${zone}-${s}`));assert.equal(new Set(seq.map(c=>c.sha256)).size,3);assert.equal(seq[0].state.crew.shield,1);assert.equal(seq[2].state.crew.shield,0);assert.equal(seq[2].state.hull,88);assert.equal(seq[2].telemetry.nightPresentation.threat,zone);}
const before=await read(`${dir}/comparison-before.json`),after=await read(`${dir}/comparison-after.json`);assert.equal(before.records.length,9);assert.equal(after.records.length,9);for(const c of [...before.records,...after.records])assert.equal(sha(await readFile(c.path)),c.sha256);
const maxP95=Math.max(...perf.results.map(r=>r.medianP95)),maxFrames=Math.max(...perf.results.map(r=>r.medianFrameIntervalP95));assert.ok(maxP95<=18);assert.ok(maxFrames<=18);
const legacy=await read('docs/content/r15/regression/r9/receipt.json');assert.equal(legacy.indexSha256,r.indexSha256);
const supplementNames=[...[69,95,100].flatMap(h=>[`relay-${h}-rescue-selected`,`relay-${h}-rescue-sealed`]),'relay-night-repair-69','relay-night-repair-100','relay-reserve-before-impact','relay-reserve-18-to-11','relay-reserve-receipt','crew-pair-applied','crew-settled'],supplement=[];
for(const name of supplementNames){const c=legacy.captures.find(c=>c.path.endsWith(`/phone-${name}.png`));assert.ok(c,name);assert.deepEqual(c.dimensions,[1290,2796]);assert.equal(sha(await readFile(c.path)),c.sha256);const path=`${dir}/phone-${name}.png`;await copyFile(c.path,path);supplement.push({...c,path,original:c.path,sourceReceipt:'docs/content/r15/regression/r9/receipt.json',sourceIndexSha256:legacy.indexSha256,provenance:'Byte-identical copy of the current full-check R9 regression capture; not a separate R10 capture'});}
await writeFile(`${dir}/supplemental-evidence.json`,JSON.stringify({status:'VERIFIED',indexSha256:r.indexSha256,count:supplement.length,source:'Current full-check regression captures, not historical screenshots',captures:supplement},null,2));
await writeFile(`${dir}/SCREENSHOT_INDEX.md`,['# R10 原尺寸截圖索引','','所有手機原圖1290×2796；fixture經產品匯入操作，並非真人試玩。精選為原圖位元組複本。',`本輪直接擷取${r.captures.length}張；另將同一個完整check內R9回歸的${supplement.length}張原圖複製至r10，補齊上輪標示未見證據的救援包、備修與輪班結果。來源見supplemental-evidence.json，沒有把複本當成另一次擷取。`,'','| 原圖 | 尺寸 | SHA-256 |','|---|---|---|',...[...r.captures,...supplement].map(c=>`| [${c.path.split('/').at(-1)}](../../../${c.path}) | ${c.dimensions.join('×')} | ${c.sha256} |`),''].join('\n'));
const links=review.screenshots.map(c=>`[${c.path.split('/').at(-1)}](${c.path.replace(dir+'/','')})`);
await writeFile(`${dir}/ACCEPTANCE.md`,[
'# R9 Muse 五項 → R10 驗收對照','','VERIFIED（本機操作與原尺寸證據）；未取得Muse複評，不自評分。審查只看review-set內15張。',
'','| 驗收 | 實際結果／原尺寸精選 |','|---|---|',
`| 1 整群引離 | 同一局第1批西群0／4、2／4、4／4；最後#4、群0→1、每批剩餘威脅、出口成功標示。${links.slice(0,3).join('、')} |`,
`| 2 修復18％ | 69→87即修18＋備修0；95→100即修5＋備修13；100已滿即修0＋備修18；夜修0尚未發動、上限未使用0，六張同一格式。${links.slice(3,9).join('、')} |`,
`| 3 預警／擋擊來源 | 69％兩張的老席疲勞3：預警14秒，18＋專長2－疲勞6，盾0／0，原因上段未休息；95％兩張熹疲勞0：預警18秒，盾1／1，上段休息供盾；文案明說疲勞只扣預警。同格式來源卡見${links[3]}、${links[5]}。每人輪班卡另有固定兩欄，手機縮短重複註解，完整原因可展開。 |`,
`| 4 三種圖例 | 同局在12秒後續投西餌1補給，使西餌生效時免費預覽東餌；預覽本身扣款0。西線實圈、東線單向箭頭；不符合者虛圈，刪除中央高亮白虛線及紫色虛線路徑。${links[1]}。同張沒有中央敵群，未受影響者見[完整出界後仍逼近的東群](phone-flank-west-4-of-4.png)。 |`,
`| 5 主體動作 | 同批0→2→4可追逐隻離場，另有[西](phone-flank-west-turning-1.png)／[中](phone-flank-center-turning-1.png)／[東](phone-flank-east-turning-1.png)各三張實際步態；精選車頂及窗側同波各訊號、撞擊、擋下，盾1→0、車體88不變、完整結果文字。${links.slice(9).join('、')}。擋擊是方向專用姿勢插圖與事件切換，不宣稱逐幀人物動畫。 |`,
'','新增岔道電台：守點前正常入口，三章不同具名口令，讀兩側燈號、答錯重查、選對接回1人與2補給，每章一次、重載保存。完整三圖：[接收前](phone-radio-unread.png)、[判讀中](phone-radio-listening.png)、[接應成功](phone-radio-rescued.png)；[離線重載](phone-offline-reloaded.png)。',
'','上輪其他「未見證據」補充：六張救援包69／95／100％預選與封箱、兩張救援包夜間搶修上限、[備修18％](phone-relay-reserve-before-impact.png)→[備修11％](phone-relay-reserve-18-to-11.png)及[扣用收據](phone-relay-reserve-receipt.png)、[輪班已套用](phone-crew-pair-applied.png)與[下段已結算](phone-crew-settled.png)。這13張是本次完整check中R9回歸的同build原圖複本，已移存r10並保留原始路徑、狀態、尺寸與雜湊；各救援／工具案例為獨立分支，不能串成同一筆修復。工具箱則已改成所選卡內放大實物，刪除舊橫幅，沒有繼續宣稱手機有完整大圖切換。',
'','15張名額全部用於五項硬性驗收所需的3＋6＋6張，電台補充圖不在精選內，沒有宣稱審查員已看過。三項既有核心均有操作進行中畫面。',''].join('\n'));
const retained=clean.retainedFiles,released=(clean.releaseBytes/1048576).toFixed(1);
const text=`# 燼途：最後一站｜新內容第10輪

VERIFIED（本機自動驗證）｜2026-10-20｜0.12.0｜main｜只做本機commit。

| 內容／入口 | 本輪行為與回饋 |
|---|---|
| 側翼來襲／日間護航後自動進入暮色守點 | 同批0／4、2／4、4／4，最後#4完全離場時即計1群、出口短暫成功標示、每批剩餘威脅及結算均可見。只保留實圈、虛圈、單向箭頭三種圖例，西餌生效仍可免費預覽東側。新增「岔道電台」：守點前點同名鍵，接收求援口令及西東燈號，比對節奏選接應側。三章各有具名對話，錯側不派車、不扣款，正確接回1人、補給+2，每章一次，讀到一半／答錯／完成均保存。 |
| 中繼站只能帶走一樣／每章守點完成自動開啟 | 工具箱預選與封箱共用同一筆18％帳；69％為18＋0、95％為5＋13、100％為0＋18，夜修列0「尚未發動」、因上限未使用0，溢出轉備修，避免重複計價。只有一個目前車體／備修，視窗頂欄及主HUD一致。移除手機重複橫幅，選中工具實物放大。救援包仍帶回4補給、兩位具名同行者與警戒協作，不改既有收益。 |
| 同行者輪班表／每段出發前「輪班／整備」 | 每人卡固定顯示預警與擋擊兩欄；守夜疲勞只扣預警秒數，盾來自上段休息，並非角色天生有盾。保留交換預覽、取消、滿疲勞二次確認、套用及下段結算。護窗位置移到受擊窗前，乘客右移，車頂保留舉臂姿勢，結果文字最後繪製且底部固定保留；同波盾1→0、車體88維持。 |

## 審查證據

[五項逐一對照](content/r10/ACCEPTANCE.md)附每項原尺寸連結；[原圖索引](content/r10/SCREENSHOT_INDEX.md)記錄${r.captures.length}張直接擷取、${supplement.length}張同build回歸原圖複本與SHA-256。後者補齊救援包三車況全流程、夜修上限、備修18→11、輪班套用及下段結算，並明列原始來源。手機1290×2796、平板2064×2752，未縮圖或拼貼。fixture以產品檔案匯入，時序使用虛擬時鐘；未當作真人結果。

[review-set](content/r10/review-set/)共15張原圖複本，側翼3、選箱6、夜戰6，對應五項硬性張數。老席／熹來源卡同時嵌入選箱頁；側翼第2張同時證明西生效、東預覽。電台操作三圖與三路各三張步態另在上層，受15張上限未納入精選，沒有宣稱評審看過精選外證據。

新增商店圖[phone-15-content-r10.png](store/screenshots/phone-15-content-r10.png)與[tablet-15-content-r10.png](store/screenshots/tablet-15-content-r10.png)，取自岔道電台的實際判讀／接應操作。既有商店圖保留。修改前／後各9張三視口回歸，見[before](content/r10/comparison-before.json)及[after](content/r10/comparison-after.json)。

## 測試與清理

完整單次 npm run check 退出0；234／234單元、95項既有瀏覽器檢查、匯入／匯出／損毀／容量邊界、美術、九段正常操作、R1～R10內容及稽核通過。本輪${r.checks.length}項瀏覽器檢查，三章電台實際判讀、選箱三車況、輪班取消／風險、兩方向同波回饋與離線重載均通過。162組選箱與九種真正交換預覽保留原44px／命中／無捲動斷言，沒有刪除既有測試。已有220項保留，新增14項。舊測試同步版本、更新修復帳及生效中預覽提示的精確文字，及去HTML標籤後核對同一段疲勞文字；資源、群數、存檔與觸控門檻未放寬。R7原輪詢以第一隻出界為停止條件，下一行卻要求2／4；現改成等到2／4，精確2／4與尚未加群的原斷言均保留。舊來源資料夾的預期路徑已不存在，稽核改以固定匯入commit e5d155af1cbcd3682f148bf64222050727f6fdff 核對封存manifest及每個Git blob與現行檔案的SHA-256；若原庫存在仍執行原來的內容、HEAD與status斷言。即時原庫狀態另列BLOCKED，沒有假稱原庫未變。

並發載參考：桌機／手機各三模式、各三跑，中位處理p95最高${maxP95.toFixed(2)}ms，幀間隔p95最高${maxFrames.toFixed(2)}ms，均≤18ms。shippingQualified=false；此數據不證明乾淨主機出貨效能。秘密掃描0命中，執行收據見[execution.json](content/r10/execution.json)，失敗嘗試留在本機.audit-tmp日誌，未冒稱第一次就通過。

刪除${clean.deleteFiles}個已追蹤、已被取代的舊截圖／比較圖，工作目錄媒體釋出${clean.releaseBytes.toLocaleString('en-US')} bytes（${released} MiB）；清理後完整check全綠，刪除檔沒有被測試重新建立。[刪除清單與驗證](content/r10/cleanup-result.json)逐檔留雜湊。${retained}個媒體因舊回歸的receipt／manifest雜湊讀取、fixture或現行測試輸出保留；消費者逐檔列明。各輪Markdown、評審意見、商店、美術原圖及原有未追蹤檔均保留；未修改其他線路。

## 美術、文案與缺件

新增生成美術1張、執行圖1張：手搖岔道電台。實際工具image_gen__imagegen，1次呼叫，沿用R5前綴；原圖、完整提示詞與SHA-256見[manifest](art/ASSET_MANIFEST_CONTENT_R10.json)。模型slug工具未提供，維持null；PNG僅轉WebP，新增內容已納入離線快取。沿用真四幀步態與既有方向擋擊姿勢，不以旋轉單張冒稱動畫。

speak-human-tw mode 2 已直接套用；姓名、三路數值與原收益均保留。新增電台提示與三章對話屬本輪新稿。文字調整如下：

| 原句／原顯示 | 原因 | 最終處理 |
|---|---|---|
| 即修 5％／備修 13％ | 即修與後續備修分散，難核對總額 | 預選與封箱共用「即修5＋轉備修13＋預計夜修0＝18％」，並標尚未發動、上限未使用0。 |
| 僅負責提前預警，不會自動擋擊。 | 缺少盾格來源，容易把疲勞誤當成盾格扣除原因 | 保留原風險說明，另加預警／擋擊固定兩欄，明寫上段是否休息、負責人與守夜疲勞只扣預警秒數，不扣盾格。 |
| 虛線圈＝未受影響 | 未解釋其他線條 | 明列實線圈＝已轉向、單向箭頭＝預計轉向、虛線圈＝未受影響。 |
| 中央等待 · 1 補給／東側等待 · 1 補給 | 本輪已允許生效中免費比較，等待字樣不符行為 | 改成「中央預覽 · 生效後再投 · 1 補給」等對應側別，預覽面板寫明不扣款。 |
| 擋下！ | 舊小標示會被手臂遮住 | 刪除受擊點小標，完整「窗側 本波已擋下／車頂 本波已擋下」固定在下方，保留底部結果列。 |
| 本輪初稿：先轉動接收旋鈕 | 實際操作為按接收鍵，沒有旋鈕拖曳或轉動動畫 | 改成「先點接收鍵」，與三個實際按鈕一致。 |

Apple 4.3風險：中。獨立的列車護送資源循環、永久選箱、跨段疲勞及岔道接應保留本作辨識度；沒有平台正式複審結果，不承諾通過。免費、MIT、無廣告／內購／帳號／第三方SDK／外連／線上功能，未push、部署或操作商店。

BLOCKED：三個原repo的預期路徑目前不存在，即時HEAD／status需要可用原庫才能核對，目前只驗證本機固定匯入封存；實體手機／iPad需實機；真人／親子試玩需受試者；乾淨主機效能需停止其他線路後另測；Muse≥8需審查員重看本輪15張，目前分數null。本機版本與工單所述2.0.0送審交付不同，未動送審內容。
`;
await writeFile('docs/CODEX_RESPONSE_CONTENT_R10.md',text);
await writeFile(`${dir}/verification.json`,JSON.stringify({status:'VERIFIED',version:r.version,indexSha256:r.indexSha256,fullCheckExitCode:0,unitTests:234,browserChecks:r.checks.length,captures:r.captures.length,supplementalCopies:supplement.length,reviewSet:15,distribution:review.distribution,deletedFiles:clean.deleteFiles,releasedBytes:clean.releaseBytes,preservedUntrackedFiles:preserved.length,generatedImages:art.generatedImages,secretScan:gates.secretScan,sourceProvenance:gates.sourceResults,performance:{maxP95,maxFrameIntervalP95:maxFrames,shippingQualified:false},museRescore:{status:'BLOCKED',score:null,target:8}},null,2));
console.log('VERIFIED R10 report, five criteria, all image hashes, cleanup absence, preserved files and full-check receipt');

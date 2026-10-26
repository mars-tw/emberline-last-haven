import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const read=async p=>JSON.parse((await readFile(p,'utf8')).replace(/^\uFEFF/,'')),dir='docs/content/r16';
const r=await read(`${dir}/receipt.json`),e=await read(`${dir}/execution-final.json`),m=await read(`${dir}/review-set-manifest.json`),v=await read(`${dir}/visual-review.json`),u=await read('docs/evidence/unit-tests.json'),p=await read('docs/evidence/performance.json'),old=await read(`${dir}/old-evidence-cleanup.json`),temp=await read(`${dir}/temp-cleanup.json`),exported=await read(`${dir}/export-cleanup.json`),scan=await read(`${dir}/secret-scan.json`);
assert.equal(e.exitCode,0);assert.equal(e.singleInvocation,true);assert.equal(r.status,'VERIFIED');assert.equal(v.status,'VERIFIED');assert.equal(v.images.length,15);assert.equal(scan.hits,0);assert.equal(u.numFailedTests,0);
const preview=await read(`${dir}/preview-stop.json`);assert.equal(preview.status,'VERIFIED');assert.equal(preview.remainingOwnedProcesses,0);
for(const im of v.images)assert.equal(createHash('sha256').update(await readFile(im.path)).digest('hex'),im.sha256);
const processing=Math.max(...p.results.map(r=>r.medianP95)),frames=Math.max(...p.results.map(r=>r.medianFrameIntervalP95));
const tempFiles=temp.deleteFiles+exported.deleteFiles,tempBytes=temp.releaseBytes+exported.releaseBytes;
const rows=v.images.map(im=>`| [${im.path.split('/').at(-1)}](content/r16/review-set/${im.path.split('/').at(-1)}) | VERIFIED：${im.inspection} |`).join('\n');
const report=`# 燼途：最後一站・新內容 R16

VERIFIED｜0.16.0｜只修正既有三項內容，沒有新增玩法或互動元素。R15 Muse 檔不存在；依本線明定的 Claude R15 五項驗收，兼補 GPT 指出的同範圍文字與缺證。本機 commit，沒有 push、部署、上傳、送審、派工、對外傳訊或讀取憑證。

| 內容／正常入口 | 本輪修正、操作與完成回饋 |
|---|---|
| 側翼來襲／暮色守點的西中東誘餌鍵 | 每隻東群目標各有自己的虛線，平行錯開、各自連出口箭頭。未引離者依來源通道排布，中央九隻集中中央，西／東標籤下移至專用帶。預覽與取消免費、確認扣1補給；逐隻出界、全群才入帳，之後仍須完成守點。成功文字改指向「東群已離場」，不把中央九隻仍在誤稱區域清空。 |
| 中繼站只能帶一樣／每章守點結算「中繼站」 | 維持單箱與封存規則，95／99％選前比較、工具備修13→7、救援一般搶修後+2／+1／+0均有操作與存檔驗證。待生效文字改「車體N％，預估+M％」，實得只用於結算。第二章帶救援包後，林叔持扳手搶修、阿禾提燈守窗的身影實際出現在車內，與分工頭像同一來源；不取代主守夜、不增加盾。 |
| 同行者輪班表／出發前「輪班／整備」及登車守夜 | 疲勞增加用斜線、減少用空心虛框，標題明寫圖例；安2→0的預估條沒有任何填滿格。交換可取消，套用重開仍保留。沒有出發盾格時，兩個付費選項寫「判對免車損」，免費選項寫「沒有盾・車損N％」；真消耗盾後才顯示「盾已用完」。保留老席低手戒備、受損護頭、真擋擊才舉板的三狀態。 |

本輪五項驗收與原尺寸證據：

| Claude R15 五項 | 本輪證據與結果 |
|---|---|
| 1 盾0文案 | [精選09](content/r16/review-set/09-relay-rescue-branch-zero-shield.png)：出發盾0、可擋0，三鍵均沒有保留盾／留盾／已用完；[13→14→15](content/r16/review-set/13-crew-rested-laoxi-branch-selected.png)同波真擋擊後才顯示已用完。新增單元與實際DOM三鍵斷言。 |
| 2 敵人與分路 | [精選02](content/r16/review-set/02-flank-east-2-of-4.png)、[03](content/r16/review-set/03-flank-east-4-of-4.png)：同一場中央九隻在中央，西／東標籤沒有紅圈敵人；三鍵目標隻數與實際活體目標逐一相符。保留不透明身體、實線紅圈、驚嘆號及原標記不遮人物斷言。 |
| 3 疲勞符號 | [精選11](content/r16/review-set/11-crew-xi-swap-branch-preview.png)：熹0→1有1格斜線，安2→0有2個透明虛框，結束預估0格填滿；實際CSS核對虛線邊框、透明底、沒有背景圖。[12](content/r16/review-set/12-crew-xi-swap-branch-reloaded.png)補套用後重開保留。 |
| 4 四條個別出口線 | [精選01](content/r16/review-set/01-flank-east-preview.png)：四隻各自起點、四條錯開虛線，各自接東側出口箭頭；攔截實際Canvas stroke，核對4條不同折點、虛線與完整終點，沒有只憑遙測欄位宣稱。取消不扣款與零目標不執行另有實際操作圖。 |
| 5 兩名救援者入車 | [精選09](content/r16/review-set/09-relay-rescue-branch-zero-shield.png)、[10](content/r16/review-set/10-relay-rescue-branch-repair-cap.png)：可見林叔搶修與阿禾守窗，老席、安仍完整。頭像由同一圖集各裁64px，筆觸與光源同源。另實測320×568、844×390、1032×1376、1366×600四人不重疊與完整身影；短視口將既有資訊移到插圖外，旋轉時立即重排。64px辨識為本線開圖自查，沒有真人辨識率。 |

精選15張，每項5張，全部1290×2796手機直式原尺寸、位元組複本，含每項進行中畫面。01～05取同一場守點連續流程；06～08為工具箱95％分支與99％選前比較；09～10為救援包3→5人分支；11～12是疲勞3／0／2的交換與重開；13～15另為老席已休息、疲勞0的同波連續擋擊。不同分支並未冒充同一連續旅程。精選採正式匯入介面載入歷史JSON檢查點，再以真按鍵及虛擬時鐘操作；98／100％搶修邊界有明示fixture，完整新遊戲主線另由既有Chromium／WebKit回歸實玩。沒有注入假敵人或事後疊圖。

[精選資料夾](content/r16/review-set/)｜[原尺寸、SHA-256與來源](content/r16/review-set-manifest.json)｜[操作收據](content/r16/receipt.json)。以下每張均已實際開圖檢視，為本線自查，沒有稱為獨立審查：

| 原尺寸精選 | 逐張檢視結果 |
|---|---|
${rows}

GPT R15「未見證據」補件：[零目標](content/r16/phone-flank-zero-target.png)、[完整守點](content/r16/phone-flank-completed.png)、[重載群帳](content/r16/phone-flank-reloaded.png)、[95％比較](content/r16/phone-relay-95-before-choice.png)、[99％比較](content/r16/phone-relay-99-rescue-comparison.png)、[取消交換](content/r16/phone-crew-preview-cancelled.png)、[套用重開](content/r16/phone-crew-reloaded.png)、[熹守夜](content/r16/phone-crew-duty-1.png)、[安守夜](content/r16/phone-crew-duty-2.png)、[98％一般搶修再+2](content/r16/phone-relay-general-98-cap.png)、[100％一般搶修再+0](content/r16/phone-relay-general-100-cap.png)。倒數、盾來源、回復待命、二選一鎖定與取消不入帳均有斷言；沒有把同一模型自查稱為Muse複審或跨模型審查。

新增商店原尺寸圖：[手機1290×2796](store/screenshots/phone-21-content-r16.png)、[平板2064×2752](store/screenshots/tablet-21-content-r16.png)，展示救援兩人已在車內與沒有盾的實際操作選項。所有既有商店圖保留。

VERIFIED：舊媒體與自產暫存清理後，完整單次npm run check退出0。完整日誌僅正規化行尾空白與LF換行，文字、BOM與退出碼保留，前後SHA-256記於退出碼收據。[完整輸出](content/r16/check-final-output.txt)、[退出碼與建置雜湊](content/r16/execution-final.json)。單元${u.numPassedTests}項（原287＋新增11），R16實際瀏覽器${r.checks.length}項、${r.captures.length}張原圖、15張精選。既有Chromium／WebKit、離線、匯入匯出、完整九段旅程、美術、效能、深度操作、R1～R15與audit均執行。保留6144組輪班公式、36站景、324封箱、864輪班、108風險、15標記情境及44px控制／文字不裁切／不捲動／真姿勢與命中斷言。舊斷言只更新版本、精確新文案與同源頭像路徑，精確單元總數由287提高為298；R15精選尺寸、原圖雜湊與分配斷言改讀本輪15張。沒有刪除測試或放寬門檻。

並發載量測VERIFIED：桌機與手機三模式各三跑中位，處理p95最高${processing.toFixed(2)}ms、幀間隔p95最高${frames.toFixed(2)}ms，均≤18ms。[原始數據](evidence/performance.json)的shippingQualified=false；共用Windows主機、無頭視口模擬，不能當作乾淨機況或實體裝置出貨量測。

新增美術：1張1536×1024透明原圖、2張執行圖（雙人身影圖集及兩個64px頭像的同源裁切）。實際工具image_gen__imagegen，一次呼叫；保留alpha、清理微弱邊緣、等比轉無損WebP。亮度、飽和、近黑、低飽和、來源SHA-256與離線位元組一致均通過。[manifest](art/ASSET_MANIFEST_CONTENT_R16.json)、[完整實際提示詞](art/PROMPT_CONTENT_R16.txt)、[美術門檻](art/ART_GATES_CONTENT_R16.json)。BLOCKED：工具未揭露實際模型slug，requestedModelSlug為gpt-image-2、actualModelSlug為null；沒有冒稱已確認。身影為角色姿態插畫，沒有宣稱逐格動畫。

清理VERIFIED：刪除已取代舊審查精選${old.deleteFiles}檔，實際移除${old.releaseBytes.toLocaleString('en-US')} bytes；另有${old.retainedFiles}個既有回歸媒體路徑依讀取／雜湊合約原位保留，可再生畫面由完整測試更新；逐檔原因見[收據](content/r16/old-evidence-cleanup.json)。未刪既有未追蹤檔、Markdown評審／報告、來源美術或商店圖。自產暫存、版面診斷、臨時helper、生成原圖重複副本、中間驗證日誌與匯出副本共清除${tempFiles}檔、${tempBytes.toLocaleString('en-US')} bytes，見[暫存清理收據](content/r16/temp-cleanup.json)及[實際匯出回讀後刪除](content/r16/export-cleanup.json)。以上為指定路徑的檔案大小總和，包含本輪生成快取；不代表整個工作區或Git歷史等量縮小。本輪新增交付與回歸再生檔另計。保留的本輪原圖均由audit讀取與核對，不留下只供中途比較的截圖或備份。

秘密掃描VERIFIED：${scan.filesScanned}個專案文字檔、零命中。所有瀏覽器啟動點均headless加--mute-audio；音訊只查設定與原生AudioContext狀態，沒有喇叭試聽、系統提示音、朗讀或通知。使用一個preview；結束後關閉本線瀏覽器與preview。

繁中文案依speak-human-tw mode2直接修正：

| 原句 | 原因 | 改成什麼 |
|---|---|---|
| 盾0仍「判對留盾／保留盾」 | 承諾不存在的資源 | 盾0時「判對免車損」。 |
| 盾0開局「盾已用完」 | 沒有盾不代表用過盾 | 「沒有盾・車損N％」，真消耗後才寫用完。 |
| 「實色目前／斜線變化」 | 同一符號混用增加與恢復 | 「斜線＝將增加、虛框＝將減少」。 |
| 「東側已清空」 | 中央敵人仍在，容易誤認區域安全 | 「東群已離場・餌剩N秒」。 |
| 待生效修復「實得+1％」 | 尚未結算 | 「車體99％，預估+1％」。 |

Apple 4.3風險：中，為本線依[Apple官方4.3規範](https://developer.apple.com/app-store/review/guidelines/#spam)的推估。列車護送、整群引離、單箱跨段資源與同行者疲勞具有連續因果；仍須完整商店呈現與正式審核判定。本輪沒有加入廣告、內購、付費、帳號、外部連結、第三方SDK或線上功能，仍可離線遊玩；MIT與免費不代表自動豁免4.3風險。

BLOCKED：原三庫預期Git路徑仍不可用，僅核對既有固定匯入的manifest與逐檔blob SHA-256，不宣稱即時原庫狀態已驗證；要補驗需原庫位置與唯讀存取，未重建或改寫其他repo。實體手機／iPad需硬體與實機操作者；真人／親子試玩需受試者；乾淨機況效能需獨占主機；Muse≥8需審查員複審，score=null；指定產圖模型slug需工具提供可核驗來源。本輪未送審、未上傳、未推送，以上沒有以模擬或自查冒充完成。
`;
await writeFile('docs/CODEX_RESPONSE_CONTENT_R16.md',report);
console.log('VERIFIED R16 report written from final checks, exact cleanup receipts and fifteen inspected originals');

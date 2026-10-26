import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const read=async p=>JSON.parse((await readFile(p,'utf8')).replace(/^\uFEFF/,''));
const dir='docs/content/r15',r=await read(`${dir}/receipt.json`),execution=await read(`${dir}/execution-final.json`),review=await read(`${dir}/visual-review.json`),m=await read(`${dir}/review-set-manifest.json`),perf=await read('docs/evidence/performance.json'),unit=await read('docs/evidence/unit-tests.json'),clean=await read(`${dir}/cleanup-result.json`),temp=await read(`${dir}/temp-cleanup.json`),scan=await read(`${dir}/secret-scan.json`);
assert.equal(execution.exitCode,0);assert.ok(['single-invocation','phased-same-build'].includes(execution.mode));assert.equal(execution.allRequiredCheckStages,true);assert.equal(r.status,'VERIFIED');assert.equal(review.status,'VERIFIED');assert.equal(review.images.length,15);assert.equal(scan.hits,0);assert.equal(temp.status,'VERIFIED');
for(const row of review.images)assert.equal(createHash('sha256').update(await readFile(row.path)).digest('hex'),row.sha256);
const maxP95=Math.max(...perf.results.map(s=>s.medianP95)),maxFrame=Math.max(...perf.results.map(s=>s.medianFrameIntervalP95));
const validationLead=execution.mode==='single-invocation'?'VERIFIED：清理後完整 npm run check 單次退出0；':'VERIFIED：完整檢查以同建置分段通過，原單次退出碼及各階段記錄見 execution-final.json；';
const postCleanup=await read(`${dir}/post-cleanup-audit.json`);assert.equal(postCleanup.exitCode,0);assert.equal(postCleanup.indexSha256,r.indexSha256);
const rows=review.images.map(row=>`| [${row.name}](${row.path.replace('docs/','')}) | VERIFIED：${row.finding} |`).join('\n');
const summary={status:'VERIFIED',version:r.version,unitTests:unit.numPassedTests,fullCheck:execution,postCleanupAudit:postCleanup,r15Checks:r.checks.length,originalCaptures:r.captures.length,reviewSet:15,distribution:m.distribution,performance:{maxMedianP95:maxP95,maxMedianFrameIntervalP95:maxFrame,concurrentHost:true,shippingQualified:false},oldMediaRemoved:clean.deleteFiles,oldPathRemovedBytes:clean.releaseBytes,migratedMediaFiles:clean.migratedMediaFiles,retainedOldTestInputs:clean.retainedFiles,tempFilesRemovedLowerBound:temp.deletedFiles,tempBytesRemovedLowerBound:temp.releaseBytes,tempStatisticsStatus:temp.statisticsStatus,tempTotalDeletedFiles:temp.totalDeletedFiles,tempTotalRemovedBytes:temp.totalRemovedBytes,secretHits:0,newGeneratedImages:1,newRuntimeAtlases:1,newPoses:2,modelSlug:null,modelVerification:'BLOCKED',muse:{status:'BLOCKED',target:8,score:null},physicalDevices:0,humanParticipants:0};
await writeFile(`${dir}/verification.json`,JSON.stringify(summary,null,2));
await writeFile('docs/CODEX_RESPONSE_CONTENT_R15.md',`# 燼途：最後一站・新內容 R15

VERIFIED（本機修正與測試）｜${r.version}｜只修正原有三項內容，沒有新增玩法。原指定 R14 Muse 檔不存在；已依使用者工單及現有 Claude／GPT R14 審查修正。交付範圍為本機 commit，未 push、部署、操作商店、派工或傳訊；未讀取憑證。

| 內容／正常入口 | 做了什麼、怎麼玩、完成與存檔 |
|---|---|
| 側翼來襲／暮色守點的西中東誘餌鍵 | 免費預覽四條完整出口路線，同卡標示執行 1 補給與等待秒數；零目標不能執行。未受誘者使用不透明原圖、實線紅腳圈及紅色驚嘆號，圖例相同。確認後逐隻出界，整批才計群；實際守點完成並重載群帳。 |
| 中繼站只能帶一樣／每章守點結算的「中繼站」 | 選前比較 95／99％實得，確認才入帳、另一箱封存。99％救援旁直接標「多修 2％（車體已 99％，實得 +1％）」。林叔與阿禾移到插圖外可展開分工列，清楚支援搶修／協助主守夜，不取代輪班。實際驗證備修 13→7、救援一般 91→99 再 +1 至100，一次選擇與重載保留。 |
| 同行者輪班表／出發前「輪班／整備」及登車守夜 | 疲勞用目前→本段結束預估兩條，變化格有斜線。熹橘框、安藍框沿用夜戰。老席盾0待命聆聽、受損護頭，真消耗盾1的撞擊／擋下才舉板；按鈕改「本波已擋下／盾已用完」。交換取消不變、套用重開保留，夜戰資源與盾格連動，倒數依模型跨秒立即更新。 |

截圖使用明示的歷史JSON檢查點，透過遊戲正常匯入介面載入，再以真按鍵與可控時鐘操作；沒有直接改遊戲狀態或把邊界fixture稱為從新遊戲自然賺得。工具箱21人、救援包3→5人是不同驗收分支。精選11–12為交換取消情境；13–15另為老席已休息、疲勞0的守夜情境，三張取自同一波連續動作。完整Chromium／WebKit主線另由全新遊戲操作驗證。

本輪五項驗收與原尺寸證據：

| 審查項目 | 驗收證據 |
|---|---|
| 1 紅圈、紅色驚嘆號、敵人不透明 | 精選04、05同一場東群2／4→4／4，中央9隻仍在；實際 Canvas 呼叫核對紅色、實線、globalAlpha=1，來源身體像素 alpha=255。 |
| 2 老席姿態與盾格連動 | 精選09為盾0戒備、07為盾0受損護頭；13→14→15同波盾1選定→撞擊→擋下，補給29／車體87％不變。舉板對應剛消耗的盾，回復期後回到聆聽。 |
| 3 四條路線連出口及同卡成本 | 精選01四條腳下虛線連至東側出口箭頭，固定免費／耗1／等待0秒；「下一批中央9」與目前0目標分開。02取消不改時間或補給；[零目標及原西餌保留](content/r15/phone-flank-zero-target.png)另有精確狀態斷言。 |
| 4 救援卡不擋身體、上限直述 | 精選08有99％實得+1；09、10展開分工列仍在整張插圖外，老席與安完整；10一般+8後救援+1至100。[95％選前](content/r15/phone-relay-95-before-choice.png)、[99％選前](content/r15/phone-relay-99-rescue-comparison.png)補上未封箱比較，確認前狀態完全不變。 |
| 5 疲勞兩段與角色色框 | 精選11熹0→1右段有1格斜線、安藍框與熹橘框可辨；12取消回原分工並展開具名算式；[熹夜戰三幀](content/r15/phone-crew-roof-impact.png)沿用橘框，安夜戰見[安值班](content/r15/phone-crew-duty-2.png)。 |

精選15張均為1290×2796原尺寸位元組複本，三項各5張，每項都有進行中畫面。未拼圖、縮圖或疊加事後標記。[精選資料夾](content/r15/review-set/)；[原尺寸與SHA-256](content/r15/review-set-manifest.json)。以下逐張已實際開圖檢視，技術驗證另存[visual-review.json](content/r15/visual-review.json)，屬本線自查，沒有稱為獨立評審：

| 原尺寸精選 | 實際檢視結果 |
|---|---|
${rows}

R14「未見證據」補件：[點按安的身影0](content/r15/phone-crew-observe-0.png)、[1](content/r15/phone-crew-observe-1.png)、[2](content/r15/phone-crew-observe-2.png)；[具名算式展開](content/r15/phone-crew-formula-details.png)；[取消後](content/r15/phone-crew-preview-cancelled-details.png)；[套用重開](content/r15/phone-crew-reloaded.png)；[守點完成](content/r15/phone-flank-completed.png)。不同角色與尺寸均有實際操作及逐字框界斷言，原圖另存 [320×568](content/r15/phone-crew-duty0-320x568.png)、[430×932](content/r15/phone-crew-duty0-430x932.png)、[844×390](content/r15/phone-crew-duty0-844x390.png)、[1032×1376](content/r15/phone-crew-duty0-1032x1376.png)。精選只納入手機直式核心互動，其他尺寸不冒充手機精選。

新增商店原圖：[手機1290×2796](store/screenshots/phone-20-content-r15.png)、[平板2064×2752](store/screenshots/tablet-20-content-r15.png)。既有商店截圖全部保留；本輪也未動App Store Connect／Google Play。

${validationLead}單元${unit.numPassedTests}項（原276＋新增11）、R15實際操作${r.checks.length}項、${r.captures.length}張原圖、15張精選，既有Chromium／WebKit、邊界、離線、美術、深度操作、R1～R14及audit完整執行。保留6144組輪班公式重算、R12的36站景／324封箱／864輪班／108風險／15標記情境及原44px、無捲動、人物與標記不重疊斷言；倒數仍以總長1.1秒驗證至少前進1秒並與畫面相符。舊UI斷言改為精確新呈現：六條現在／預估疲勞條取代三條，另分別斷言各三條，疲勞可見文字比較只正規化排版空白、保留全部數字與箭頭；時間標題、版本、老席新待命圖更新對應值；零目標按鈕改為精確免費預覽斷言，有目標保留1補給斷言，直接點按餌桶改用西側4隻真目標驗證確認扣1；舊空方向續投情境改為驗證精確不扣費、誘餌0秒、四隻已承諾西向離場及東側四隻未受影響，保留實際出界才入帳斷言。單一結果斷言精確限定night-result，另驗證新按鈕的已擋下／用盡文字；撞擊幀改為完整圖集路徑＋幀號辨識，另斷言impact就是對應方向的block姿勢，避免不同圖集同為第0格被誤當同姿勢。沒有刪除測試或放寬門檻。[完整輸出](content/r15/check-final-output.txt)、[退出碼](content/r15/execution-final.json)、[核驗摘要](content/r15/verification.json)。暫存與無用記錄清理後，npm run audit再次退出0：[收據](content/r15/post-cleanup-audit.json)、[輸出](content/r15/post-cleanup-audit.txt)。

並發載量測VERIFIED：桌機／手機各三模式、各三跑中位；處理p95最高${maxP95.toFixed(2)}ms，幀間隔p95最高${maxFrame.toFixed(2)}ms，均≤18ms。[原始數據](evidence/performance.json)的shippingQualified=false；共用Windows主機與無頭視口模擬，不能代替實體手機或乾淨機況出貨測試。

本輪新增生成美術1張原圖／1張透明執行圖集，含老席戒備、受損2姿勢；原舉板圖只供真擋擊。實際工具\`image_gen__imagegen\`，透明背景產圖後保留alpha，經去背結果檢查／等比轉檔管線，身體alpha正規化，HSV與離線位元組一致驗證通過。[manifest](art/ASSET_MANIFEST_CONTENT_R15.json)、[提示詞](art/PROMPTS_CONTENT_R15.json)、[美術研究](art/ART_STUDY_CONTENT_R15.md)。BLOCKED：工具僅回傳image_url／output_hint，未揭露實際模型slug，也沒有模型選擇參數，原圖的[公開來源欄位](art/IMAGE_MODEL_EVIDENCE_CONTENT_R15.json)也只標ChatGPT／gpt-image，沒有精確模型版本；讀回欄位沒有當作簽章信任驗證。因此actualModelSlug=null，未冒稱已驗證gpt-image-2。這是事件姿勢切換，未宣稱新增逐幀動畫。

EXECUTED：移除舊媒體路徑${clean.deleteFiles}檔、${clean.releaseBytes.toLocaleString('en-US')} bytes（${(clean.releaseBytes/1024**3).toFixed(2)} GiB）；必要回歸輸入移至本輪regression路徑並由測試重建，${clean.retainedFiles}個舊證據依可執行讀取／雜湊合約保留，逐檔原因見[cleanup-result.json](content/r15/cleanup-result.json)。此為舊路徑移除量，含搬移必要測試輸入，不能聲稱同量淨磁碟釋出或Git歷史縮小。歷史before fixture隨原美術對照／雜湊驗證合約移入本輪regression，必要輸入及原因列在清單。各輪Markdown／評審、既有未追蹤檔、原始美術、商店圖均保留。[回歸遷移清單](content/r15/regression-migration.json)。

自產暫存移除VERIFIED：本輪.audit-tmp前綴檔案剩餘0，已移除診斷圖、實際匯出、產圖重複副本及舊階段記錄。[temp-cleanup.json](content/r15/temp-cleanup.json)列可核對下限${temp.deletedFiles}檔、${temp.releaseBytes.toLocaleString('en-US')} bytes。其中15張精選重建前的刪除量為${temp.rebuiltSelectionBytes.toLocaleString('en-US')} bytes，隨後依要求重建，不能算淨釋出；另13個不再使用的複製記錄可依固定來源與原轉換規則重算，移除量下限${temp.finalPurgeBytes.toLocaleString('en-US')} bytes。

暫存完整統計BLOCKED：第一次清除完成後，我的PowerShell統計發生物件型別錯誤，未先保存完整逐檔收據。因此總刪除數與總bytes無法完整還原，均以null記錄，不推估、不把下限當總量。腳本已修正為刪除前先保存計畫並用明確整數加總。檔案清除及剩餘0已重新核對；其他線路與既有未追蹤暫存未動。自開preview關閉後4179無監聽，瀏覽器依finally關閉。

秘密掃描VERIFIED：${scan.filesScanned}個專案文字檔、零命中，包含PowerShell與本報告，不讀取任何憑證資料夾。所有瀏覽器啟動點均檢查headless及\`--mute-audio\`；音效只檢查設定及原生AudioContext狀態，未從喇叭驗聽、朗讀或發通知。

繁中文案依speak-human-tw mode2直接套用，共整理17組UI文案，數字與規則保持可追溯：

| 原句／位置 | 原因 | 改成什麼 |
|---|---|---|
| 圖例「短虛線、警示腳圈」 | 和實際標記不一致 | 連續虛線接出口；實線紅腳圈＋紅色驚嘆號。 |
| 下一批計數只寫「中央9隻」 | 和目前目標0隻混淆 | 明列下一批中央9隻。 |
| 預覽分散說明免費與扣款 | 同卡資訊不完整 | 免費查看／執行耗1補給／尚須等待N秒。 |
| 零目標仍顯示1補給 | 像是能付費執行 | 免費預覽0隻；此方向只能查看，不可執行。 |
| 「方向不符，另用盾1」 | 另用含意不清 | 方向不符，消耗盾1擋下。 |
| 盾耗盡後仍「用盾1・已選」 | 像是仍可使用 | 本波已擋下／盾已用完；後續操作標盾已用完及車損。 |
| 選箱只寫夜戰後多修2％ | 沒交代順序與實得 | 夜戰一般搶修後多修2％，同列目前車況實得，結算依車況。 |
| 林叔「車體交給我搶修」 | 未區分支援與主職務 | 車體交給我，支援搶修。 |
| 阿禾「我接手警戒」 | 易誤認取代主守夜 | 我接手警戒支援，協助主守夜。 |
| 登車合句「上車後接手警戒」 | 和輪班身分矛盾 | 上車後協助主守夜與搶修。 |
| 選前得到欄「兩人接手警戒」 | 重複且不夠明確 | 接回兩位具名同行者；支援警戒與搶修。 |
| 待生效「多修2％，上限100％」 | 玩家需自行算上限 | 多修2％（車體已99％，實得+1％），結算依車況。 |
| 人物卡「預警N秒」 | 易誤認首波也相同 | 後續預警N秒，盾格另列。 |
| 疲勞「目前→下段結束預計」及單條 | 基準與條格不一致 | 目前→本段結束預估，雙段並標實色目前／斜線變化。 |
| 交換摘要「目前→下段結束」 | 與本段預估混用 | 目前→本段結束預估。 |
| 首波說明新增 | 首波與後續預警基準不同 | 明細按鈕直接列首波依封存、封存後顯示實際秒數。 |
| 救援分工列新增 | 支援與主職務關係需當場可讀 | 列主守夜姓名、不取代輪班與盾格、夜戰後最多2％搶修。 |

Apple 4.3風險：中，為本線依[官方4.3規範](https://developer.apple.com/app-store/review/guidelines/#spam)與現有作品差異做的判斷。列車護送、整群引離、人車補給取捨與人物疲勞連續相扣，仍需完整商店呈現及審核確認；免費／MIT並不自行豁免重複內容風險。遊戲未加入廣告、付費、帳號、外部連結、第三方SDK或線上功能。

BLOCKED：實體手機／iPad需硬體；真人／親子試玩需受試者；乾淨機況效能需獨占主機；Muse≥8需審查員複審，score=null；指定產圖模型slug需工具提供可核驗來源；暫存完整刪除統計因上述收據錯誤無法還原，僅有可核對下限。以上沒有以本機模擬、自查或共用主機數據冒充完成。
`);
console.log('VERIFIED R15 delivery report and summary generated from final check, inspected originals, cleanup and source receipts');

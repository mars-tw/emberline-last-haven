import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir='docs/content/r15/regression/r9',v=JSON.parse(await readFile(`${dir}/verification.json`,'utf8'));assert.equal(v.status,'VERIFIED');assert.equal(v.allStagesPassed,true);assert.ok(v.fullCheckExitCode===0||v.continuationExitCode===0);
const scope=v.fullCheckExitCode===0?'完整單次 npm run check 退出0':'同一建置各階段通過，續驗退出0（完整命令曾退出1）';
const report=`# 燼途：最後一站｜新內容第9輪

VERIFIED（本機自動驗證）｜2026-10-19｜0.11.4｜main｜只做本機提交。

| 內容 | 做了什麼、怎麼玩、入口 |
|---|---|
| 側翼來襲 | 日間護航後進入暮色守點。三個路線鍵直接顯示影響幾隻、剩幾隻威脅及1補給；第一次點先預覽，第二次同路確認才扣款。取消免費、生效中禁止重投。ID跟在個體正上方，刪除跨場連線；路徑相遇時先調整本體。仍以真步態四幀轉向，逐隻出界、全組出界才加群；沒有宣稱主角新增投擲動畫。 |
| 中繼站只能帶走一樣 | 每章守點完成自動開啟，結果也有同名入口。救援包改為免費帶回4補給、兩位具名同行者及警戒協作火力+1，夜戰後多出的最多2％搶修單獨結算；工具箱仍免費即修／轉存備修共18％。卡片直接寫適合缺補給或車況不佳的理由。選工具箱時大圖同步，正式出發才入帳並永久封存另一箱。 |
| 同行者輪班表 | 每段出發前點「輪班／整備」，封箱後點「安排下一段輪班」。一次只交換兩人，虛線旁有圖例；預覽須套用或取消後才能開始下一次交換。卡片保留職務、疲勞、效果，舊任者比較與公式收進來源說明。滿疲勞紅框用單一前後數字及「僅預警、不自動擋擊」說明。同一波夜戰分訊號、撞擊、已擋下，車頂與窗側使用各自姿勢及高亮；回饋期間鎖住按鈕與場景點擊，避免未見新訊號就處理下一波。 |

## 驗收與原圖

R8 Muse五項及本線路六項修正逐項對照[ACCEPTANCE.md](content/r9/ACCEPTANCE.md)。完整原圖見[SCREENSHOT_INDEX.md](content/r9/SCREENSHOT_INDEX.md)，每張保留原尺寸、狀態來源與SHA-256；沒有把fixture稱為一般旅程。

三路各有預覽／實投、連續三幀、2／4部分出界、全組離場；69／95／100％兩箱各有預選與封箱；工具箱大圖、備修18→11、救援搶修95→97與100→100均有原圖。同局交換用預覽→風險確認→已套用三張，章節、補給、人數、車體相同，疲勞不重置；另有下段結算圖。車頂、窗側各有同一波三張不同雜湊，盾格1→0、車體88→88，下一波不帶舊高亮。

[review-set/](content/r9/review-set/)是15張1290×2796手機直式原圖複本，側翼5、選箱4、輪班／夜戰6；三項均含操作進行中。精選重點為同局交換三張與窗側三張，車頂三張、三路全部連續幀及其餘邊界保留在上層逐項連結。受15張上限限制，未宣稱審查員已看過精選外的補充圖。

新增商店圖[phone-14-content-r9.png](store/screenshots/phone-14-content-r9.png)（1290×2796）與[tablet-14-content-r9.png](store/screenshots/tablet-14-content-r9.png)（2064×2752），取自實際守夜擋擊；未刪既有商店圖。三視口共9組修改前／後原圖在docs/content/r15/regression/evidence/content-r9-before與content-r9-after，來源與雜湊見[comparison.json](content/r9/comparison.json)。

## 兩箱平衡

[relay-balance.xlsx](content/r9/relay-balance.xlsx)保留公式與可調假設，已驗證改參數會重算並還原。以既有「4補給可換最多15％升級維修」為條件換算，69％車體時救援17、工具18（差5.6％），95／100％時15對18（差16.7％）。警戒協作與額外人數未計價。此換算需要護具未滿級、後續有足夠維修缺口且願意升級；不代表勝率或所有局面等價，沒有假造真人平衡結論。遊戲原始收益與實際入帳另由六個分支核對。

## 自動驗證

${scope}：220／220單元、95項既有瀏覽器檢查、匯入／匯出／容量邊界、美術、深度操作、R1～R9內容及稽核通過。R9有${v.browserChecks}項瀏覽器檢查、${v.originalCaptures}張原尺寸擷取及15張精選；執行錯誤與外部請求皆0。WebKit停止本機HTTP服務及連線後重載仍保留完整進度；正常按鈕操作的完整九段旅程亦已實玩。

既有205項單元測試保留，新增15項。舊經濟預期改為本輪實際4補給、警戒協作；舊腳下固定範圍改成更嚴格的自身頭頂距離、ID與遮擋檢查；下一波操作會等待本波1.5秒回饋清除。沒有刪測試、放寬44px觸控、原有美術、群數或效能門檻。

桌機／手機各三模式、三跑中位數，同步處理p95最高${v.performance.maxMedianP95.toFixed(2)}ms，幀間隔p95最高${v.performance.maxMedianFrameIntervalP95.toFixed(2)}ms，≤18ms。這是並發載參考值，shippingQualified=false，不能當成乾淨主機出貨證明。秘密掃描0命中；版本與存檔遷移通過。原始完整檢查輸出與嘗試紀錄見[execution.json](content/r9/execution.json)。

先前的舊回歸等待、版面邊界失敗及主動中止均保留原始日誌。${v.fullCheckExitCode===0?'最終建置重新從頭跑完完整命令，退出0。':'最後採同一建置續驗，未宣稱單次完整命令退出0。'}另有162組未選／救援／工具、三種車體、兩種人數及九視口版面檢查，44px與不捲動斷言全數通過。

## 美術與繁中文案

新增4張執行美術：老席／熹／安三張同筆觸頭像、熹車頂擋擊姿勢。採用2張原圖，共4次image_gen__imagegen呼叫（含兩次保留的頭像修色），實際模型slug未提供，保持null。沿用R5提示詞前綴，三張頭像通過原有HSV亮度／飽和度門檻，飽和度差0.106；真透明車頂圖、來源雜湊與離線相同位元組均核對。見[ASSET_MANIFEST_CONTENT_R9.json](art/ASSET_MANIFEST_CONTENT_R9.json)及[PROMPT_CONTENT_R9_FULL.txt](art/PROMPT_CONTENT_R9_FULL.txt)。人物擋擊為兩張方向各異的真姿勢插圖及事件階段回饋，未冒稱新逐幀人物動畫。

套用speak-human-tw mode 2：原「預覽西側・1補給」缺決策數字，改成影響隻數、剩餘威脅與消耗；原「每波14秒／預警少6秒」容易重扣，改為「20→14秒（疲勞−6）」；原換班可連點累積不同交換，改為一次兩人、先套用或取消。老席／熹／安、疲勞單位「格」與同一救援包實物保持一致。

## 未完成與風險

Apple4.3風險：中（本機判斷）。本作仍有來源作品骨架，三項取捨已共同服務同一趟護送，尚未提交Apple。依[Apple官方4.3](https://developer.apple.com/app-store/review/guidelines/#spam)對重複Bundle ID及難以區別體驗的要求評估，這不是審核通過證明。

BLOCKED：Muse≥8需審查員實際看精選；實體手機／iPad需裝置；真人／親子試玩需參與者；乾淨機況效能需獨占時段。未做真人五秒人物辨認或原生Excel操作；表格只宣稱本機公式引擎與匯出驗證。模型slug工具沒有提供，未猜測填值。

只在本repo／main工作；保留${v.preservedUntrackedFiles}個他人既有未追蹤檔並逐檔雜湊驗證，不提交這些檔。所有遊戲瀏覽器無頭且循序關閉，只開一個背景Vite preview；既有離線測試短暫使用獨立本機HTTP服務。未push、部署、操作商店、對外傳訊或派工，未讀秘密目錄或寫金鑰。既有回歸輸出以本版重跑更新，歷史原檔可由父提交查驗。
`;
await writeFile('docs/CODEX_RESPONSE_CONTENT_R9.md',report);
const acceptance=await readFile(`${dir}/ACCEPTANCE.md`,'utf8');await writeFile(`${dir}/ACCEPTANCE.md`,acceptance.replace('EXECUTED｜以下是已實作與單獨操作驗證的內容；完整品質閘門與正式原圖雜湊以 verification.json 為準。','VERIFIED｜五項主驗收、完整品質閘門與原圖雜湊已讀回核對，詳見 verification.json。'));
const plan=(await readFile('docs/OPTIM_PLAN_CONTENT_R9.md','utf8')).replace(/\n完成讀回：[^\n]*/g,'');await writeFile('docs/OPTIM_PLAN_CONTENT_R9.md',plan.replace(/^(?:PREPARED|EXECUTED)｜/m,'VERIFIED｜').replace('精選15張三項各5張','精選15張（側翼5／選箱4／輪班與夜戰6）')+'\n完成讀回：全部品質閘門已通過（實際執行模式見verification.json與execution.json）；主驗收、原尺寸圖片、15張精選、商店圖、美術來源與他人檔案保全見docs/CODEX_RESPONSE_CONTENT_R9.md及docs/content/r15/regression/r9/verification.json。外部／真人項目仍列BLOCKED。\n');
console.log('VERIFIED R9 final Traditional Chinese report and plan readback');

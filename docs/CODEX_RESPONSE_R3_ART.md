# 燼途：最後一站，R3 美術結果

2026-10-16｜0.4.0｜main｜僅本機 commit。美術接線 **EXECUTED**；完整 `npm run check`、素材與畫面閘門 **VERIFIED**，收據見 [VALIDATION_R3.json](art/VALIDATION_R3.json)。新版獨立評分與真人辨識率 **BLOCKED**，不宣稱已達 8 分。

## 唯一驗收清單：Muse 第二輪後的五項

| Muse 原項目 | 本輪結果與驗收 | 改後原尺寸證據 |
| --- | --- | --- |
| 1．紙卡安全區 | **VERIFIED**。新薄焦邊紙紋、標題降一階、取消 line clamp。全取樣最小左右邊距 6.85%，360 寬五圖文字邊界完整；護航內文改為轉向、攀車與甩尾。 | [360 出發](art/compare/r3-after/narrow-departure.png)、[360 護航](art/compare/r3-after/narrow-convoy.png)、[360 投餌](art/compare/r3-after/narrow-bait.png)、[360 戰後](art/compare/r3-after/narrow-common-progress.png)、[360 夜車](art/compare/r3-after/narrow-night.png) |
| 2．主角定版及比例 | 側臉、棕髮、圍巾、肖像以 R2 夜車熹為正本；車頂改成半身俯視四真幀。390 寬長邊／車寬為 0.314，低於 1/3，同時角色寬高 >=40px。安保留臉與四姿態，外套改霧鋼藍。這些實作 **VERIFIED**；真人 >=80% 盲測 **BLOCKED**，故本項不能宣稱全部驗收。 | [390 出發](art/compare/r3-after/phone-departure.png)、[390 車頂](art/compare/r3-after/phone-convoy.png)、[390 夜車兩人](art/compare/r3-after/phone-night.png)、[原尺寸 64px 盲測圖](art/BLIND_64_R3.png) |
| 3．屍群去貼紙化 | **VERIFIED（取樣範圍）**。兩圖集重繪厚塗布料與明暗，地面柔投影；藍色飽和平均為 R2 的 67.2%，約降 32.8%。不同腿部、前伸、蹲伏與受擊姿態，49 張畫面同圖集／同格最多 2 隻；守點顯示層拉開相鄰身體。沒有改敵數、AI、命中時序或實際戰鬥座標。 | [390 守點中](art/compare/r3-after/phone-defense-active.png)、[390 戰後屍群](art/compare/r3-after/phone-common-progress.png)、[平板戰後](art/compare/r3-after/tablet-common-progress.png)、[全真幀 64px](art/THUMBNAILS_64_R3.png) |
| 4．準備與戰後場景差分 | **VERIFIED**。準備使用完整站場，28 秒後及戰後使用實際重繪差分：破沙包、倒塌燈架、關閉站門、地面拖痕、減弱燈光；戰後餌站停止發光。 | [準備](art/compare/r3-after/phone-bait.png)、[戰後](art/compare/r3-after/phone-common-progress.png)、[平板準備](art/compare/r3-after/tablet-bait.png)、[平板戰後](art/compare/r3-after/tablet-common-progress.png) |
| 5．燈塔及主次按鈕 | **VERIFIED**。進度列固定淡琥珀燈塔光束，五個主要畫面皆出現；字標保留燈塔。夜車已顯示的接觸訊號對應唯一車票橘主鍵，免費承受為次鍵。 | [出發光束](art/compare/r3-after/narrow-departure.png)、[守點光束](art/compare/r3-after/narrow-bait.png)、[夜車橘鍵](art/compare/r3-after/narrow-night.png) |

驗收數據與逐圖紀錄：[ART_GATES_R3.json](art/ART_GATES_R3.json)。同姿態上限涵蓋這 49 張一般操作截圖，沒有以取樣冒稱任意極端存檔的保證。真人盲測方法與缺件見 [BLIND_TEST_R3.md](art/BLIND_TEST_R3.md)。

## 最大視覺改變

紙卡終於有安靜的文字區，焦邊只留在外緣；燈塔、車票與行車手記貫穿全程。熹的側臉與車頂比例收斂到同一身份，安用原臉及藍外套建立區別。屍群改為厚塗明暗並分散，站場戰後有看得見的破損與熄燈。

延續 R1／R2 冷灰公路與暖燈方向，沒有新增系統或新畫面。手機「按住左右轉向／點甩尾／自動射擊」是 R1 已完成的行為，本輪保留並重驗，不重複計為新成果。

## 素材、模型、授權與包體

**10 項新生成資產、24 個 runtime 檔**：熹四身份圖及車頂四格、安四姿態、疾行者及踉蹌者各16格、戰後站場、救援車、紙紋、資源圖示、Logo、App 圖示。新真幀合計 40 格（敵人32＋熹4＋安4），另保留 R2 據點全身射擊幀。攻擊命中 .20／.32秒、受擊 .24秒、死亡 .65秒與原資源規則保留。

實際工具為 **image_gen__imagegen**。要求 gpt-image-2，工具未回傳實際 slug，`actualModelSlug=null`；未讀秘密目錄、未寫金鑰，也沒有使用 CLI/API 備援。共同風格前綴與完整提示詞：[PROMPTS_R3.json](art/PROMPTS_R3.json)，並已納入 [PROMPTS.json](art/PROMPTS.json) 的 round3。

[ASSET_MANIFEST_R3.json](art/ASSET_MANIFEST_R3.json) 保存原圖、opaque 檢視版、原生 alpha 遮罩、RGBA、校色方法、切圖位置、尺寸／格式／hash。修掉鄰格碎片，透明區 RGB 歸零；背景 WebP，角色／圖示真 RGBA PNG，沒有以假透明底交件。圖示的灰髮人物未採用，同行圖示只裁入遊戲實際存在的熹。App 1024 提案在 [app-store-r3-1024.png](art/proposals/app-store-r3-1024.png)，192／512 icon 與字標已接入。

新圖依本專案 MIT 範圍散布，[CREDITS.md](../CREDITS.md) 保留所有既有 MIT／CC BY 4.0／CC0 來源。新增 runtime **約 3.56 MB**，public 總量約 **16.08 MB**；母版／遮罩／比較圖不隨遊戲下載。保留歷史素材與授權，沒有刪舊檔壓低數字。沿用 R2 背景與道具，不把它們重複算成新生成資產。

角色可見像素雙閘：亮度 0.362–0.471、近黑 7.3%–19.1%、飽和 0.378–0.623、低飽和 1.2%–8.6%，均在既有門檻內。64px 原尺寸圖已視覺檢視，有頭部、臉與不同肢體姿態；像素差只證明幀不同，不替代真人辨識與動作美感評分。

## 前後對照與測試

`docs/art/compare/r3-before/`、`r3-after/` 各49張：320×568、360×800、390×844、1032×1376、844×390、1366×600、1920×1080；出發／護航／投餌／守點中／戰後／夜車／行車簿。一般控制輸入、無存檔注入；captures.json 保存進度、圖片 hash、build hash。切換視口會有少量正常經過時間，不當作像素級確定性測試。

[五主要畫面前後表](art/compare/R3_PHONE_PAIRS.webp) 使用原390×844像素；三視口原尺寸證據另存 `docs/evidence/art-r3/`。初審：[ART_REVIEW_R3.md](art/ART_REVIEW_R3.md)；方向：[ART_DIRECTION.md](art/ART_DIRECTION.md)；技法來源與應用：[ART_STUDY_R3.md](art/ART_STUDY_R3.md)。

完整命令 **`npm run check`：VERIFIED，exit 0**，測試輸出 [check-r3.txt](evidence/check-r3.txt)。86 個單元、灰燼三組原測試、暴風來源八組規則、95 個 Chromium／WebKit 瀏覽器案例、5 個匯入／匯出／容量邊界案例、建置／離線／R1–R3 素材閘門與 repository audit 全綠。增加3個角色比例／擁擠顯示測試，原83個單元與所有原回歸斷言保留；版本門檻改為0.4.0、數量門檻提高至86，沒有刪測試或放寬斷言。

11 個既有 RWD 視口與操作狀態通過 >=44px 命中、無溢出、關閉／返回可達及手機無鍵盤說明。10 張商店圖已由一般操作重新擷取到 `docs/store/screenshots/`，手機1290×2796、平板2064×2752；[manifest](store/screenshots/manifest.json) 保存尺寸、hash 與相同 build 識別。是無頭 Web 裝置模擬，不冒稱實機或原生商店 build。秘密掃描零命中，73 份沿用來源 hash 與三個原 repo 狀態未變，`git diff --check` 通過。

首輪 WebKit 測到「真點擊後甩落數必須增加」失敗，原始輸出保留 `docs/evidence/check-r3-initial-failure.txt`。原測試只 install 虛擬時鐘，操作等待期間仍會前進，存在狀態讀取與點擊的競態；改為 install 後 pauseAt，時間只由既有 runFor 明確推進。所有原斷言、真滑鼠輸入及95案例保留，沒有以跳過末段、放寬條件或只改預期值處理。

效能為共享主機、背景 Chromium、桌機／手機各三跑中位：工作 p95 **0.5／0.4ms**，RAF 幀間隔 p95 **16.7／16.8ms**，均 <=18ms。原始三跑見 [performance.json](evidence/performance.json)。僅作並發載參考，`shippingQualified=false`，不冒稱實體手機、晚期壓力或乾淨機況出貨證明。各瀏覽器均在 finally 關閉，已核對本輪預覽 process 並停止，4179 埠不再監聽。

## 風險與缺件

**Apple 4.3 風險：高。** 本輪已加強專屬視覺識別，但既有退件與同帳號產品差異仍待正式審查；本機美術不能代替 Apple 裁決。沒有 push、部署、商店操作、對他人發訊息或透過其他服務派工。

**BLOCKED**：真人64px >=80%辨識盲測、新版 Muse 獨立 >=8分、實體 iPhone／iPad／Android、IPA／AAB 與乾淨機況效能。本次交付具體圖像與證據，不虛報五項全部驗收。兩份原有未追蹤 Muse 報告保留原狀，未納入本輪 staging。

繁中文案 mode 2 摘要：原護航內文仍講搬補給，與當下玩法不符，改為轉向、攀車集中與甩尾；原守點／夜車長句占滿小卡，保留人數、補給與規則，改為短而完整的當下敘事；原損壞說明重複兩次「車隊」，縮成搶修與保留紀錄。沒有更動費用、冷卻、傷害、關卡目標或故事結果。

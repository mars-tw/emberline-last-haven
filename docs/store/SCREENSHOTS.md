# 實際畫面清單｜PREPARED，驗證以 manifest 為準

全由正式本機建置、headless Chromium、一般遊戲按鈕擷取，沒有合成文字、宣傳重畫或未實作功能。手機視口 430×932／DPR 3 產出 **1290×2796**；iPad 級視口 1032×1376／DPR 2 產出 **2064×2752**。它們是網頁裝置尺寸畫面，不能冒稱已簽章原生包的實體截圖。

| 畫面 | 手機 | 平板 | 證明 |
|---|---|---|---|
| 北上任務開場 | phone-01-departure.png | tablet-01-departure.png | 統一人物、目標與主線入口 |
| 車隊護航 | phone-02-convoy.png | tablet-02-convoy.png | 左右操舵、共用 HUD、甩尾入口 |
| 三落點守點 | phone-03-bait.png | tablet-03-bait.png | 同行人員延續、投餌成本與中繼站 |
| 共用進度結算 | phone-04-common-progress.png | tablet-04-common-progress.png | 回收補給、整備護具、前往列車 |
| 列車守夜 | phone-05-night.png | tablet-05-night.png | A-07 真幀、可見訊號與共用反制成本 |

檔案位於 `screenshots/`，逐檔 SHA-256、像素尺寸及輸出大小在 `screenshots/manifest.json`。擷取時資料來自真實操作；不是主動注入完成狀態。測試使用虛擬時鐘加快自然時間，這不等於真人遊玩時間證據。

本 repo 從空目錄開始，沒有可比較的整合前遊戲，不捏造 before 畫面。來源遊戲已有各自 STORE／MOBILE 的 before／after，精確來源 commit 保存在 source-manifest。

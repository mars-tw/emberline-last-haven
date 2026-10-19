# 燼途：新內容第三輪

2026-10-19｜0.9.0｜main｜VERIFIED：完整 `npm run check` 退出碼 0，五組驗收與 87 張原尺寸截圖通過核對。只做本機提交，沒有推送、部署或商店操作。新 Muse 分數與實機／真人測試仍為 BLOCKED。

| 三項內容 | 做了什麼、怎麼玩與入口 |
|---|---|
| 側翼來襲 | 每章「暮色守點」自動進偵察圖。先看三側波次，再投對側誘餌；西側琥珀、中路海霧青、東側淡紫灰的按鈕、實線路徑、腳環及頭頂側字一一對應，來襲改霧白虛線。誘開目標封頂顯示 2/2，達標與成功畫面都有回饋；實際超額誘開仍計入原獎勵。提示列只留一個下一批倒數。失敗重試的偵察圖逐批標示「與上次相同／↻ 有變動」，比較的是實際上一趟，不重新擲存檔。 |
| 中繼站只能帶走一樣 | 守點結束自動進獨立雙箱畫面，也可從結果「中繼站：只能帶一樣」重開。兩箱各有「立即得到／下一段影響／放棄代價」，未選出發反灰並寫原因。帶走一箱後先看獨立封箱結果，點「安排下一段輪班」才進輪班；收據不再混進輪班表。結果場景保留已帶走物資及封箱文字，重載也能看見。救援包花 3 補給、接回兩位具名同行者；工具箱免費提供合計 18％修復或備用，滿血仍有備修，受損才消耗。 |
| 同行者輪班表 | 首次出發與每段結果的「輪班／整備」進入。三人直向列顯示頭像、專長、當前職務及 0–3 格疲勞。點自製開車／守夜／休息鈕，先預覽具名雙向交換，再按「套用交換」立即保存；疲勞跟著人走。手機 430 寬專長與說明同為 13px，320 短直式採三張窄列，短橫式改左右布局，控制維持至少 44px。九段疲勞、剛休息者擋一次、失敗不洗疲勞均沿用真正規則。 |

## Muse 五項驗收與交付圖

唯一清單為 `docs/content/CONTENT_REVIEW_R2_MUSE.md` 第四節五項。本輪交付請直接開啟 [R3 手機交付組](content/r3/REVIEW_SET.md)，每張都是未縮放的 1290×2796 PNG；[完整索引](content/r3/SCREENSHOT_INDEX.md) 與 `receipt.json` 保留尺寸、SHA-256、狀態及實際渲染 telemetry。不是用聯絡表或測試結果頁代替玩法圖。

以下省略的路徑前綴均為 `docs/content/r3/`。

| 唯一驗收項 | 原尺寸手機直式截圖 |
|---|---|
| 1．誘開封頂與唯一倒數 | `phone-flank-1-success.png`、`phone-flank-1-complete.png`、`phone-bait-1-active-cooldown.png`。成功畫面有 2/2 已達標；戰鬥提示只有一個剩餘秒數。 |
| 2．真正獨立雙箱 | `phone-relay-1-before.png` 同時呈現兩箱六項比較與灰色出發；`phone-relay-1-after.png` 是封箱結果；`phone-relay-1-roster-clear.png` 的輪班沒有收據。第二、三章也各有 before／after／roster-clear。 |
| 3．被引群與警告可對應 | `phone-flank-1-turning-1.png`、`turning-2.png`、`turning-3.png`；`phone-flank-3-double-warning.png` 同框可見霧白警告及海霧青中央誘餌。各章都有 0.94 秒內的三格轉向。錯側持續行走為 `phone-flank-1-wrong-side-1.png` 至 `-3.png`。 |
| 4．直向輪班與交換 | `phone-crew-fatigued-swap-before.png`、`phone-crew-fatigued-swap-preview.png`、`phone-crew-fatigued-swap-after.png`：熹與安互換守夜／休息，非全零疲勞保持不變。`phone-crew-plan-1.png` 至 `-8.png` 及 `phone-crew-settled-1.png` 至 `-9.png` 顯示跨段累積。 |
| 5．第三章與重試比較 | `phone-flank-3-preview.png`、`phone-flank-3-double-warning.png`；`phone-retry-preview-before.png`、`phone-retry-stranded.png`、`phone-retry-preview-after.png`。重試第一批沒有變動標記，後兩批都有標記。 |

## 補齊半成品與未見證據

- 角色真射擊姿態：`phone-flank-1-shooting-1.png`、`-2.png`、`-3.png`，同一次實際交戰的三個不同 atlas frame；原有命中／蓄力／回復測試保留。敵群顯示排布讓出頭標與完整頭部空間，不修改模擬、傷害與敵人數量。
- 真正一次擋擊：`phone-watch-1-before.png`／`phone-watch-1-blocked.png`。正常九段路線先讓安休息、再安排安守夜，真實承受撞擊後車體不降，擋擊 1→0，畫面留具名回饋。不是先改存檔補盾。
- 零補給、滿血備修與重載封箱：`phone-relay-repair-full-before.png`／`after.png`／`sealed-reload.png`；實際零件消耗：`phone-relay-reserve-before.png`／`phone-relay-reserve-consumed.png`。這些是明確邊界 fixture，從正常存檔衍生並經遊戲正式檔案匯入，不冒充自然遇到的情境。
- 舊存檔嚴格相容：新增保留 0.8.0 原欄位，仍接受 0.5.0／0.6.0／0.7.0；缺損 0.8.0 新欄位照樣拒絕。未知版與錯誤匯入不改現有旅程。
- 修改前證據：`docs/content/r3/before/` 六張 PNG 直接取自 Git `f014416`，另附來源與雜湊，不用重拍的新版回歸圖假充修改前。

## 測試、美術與商店圖

VERIFIED：完整 `npm run check` 退出碼 **0**。單元 **141/141**（既有 125＋R3 新增 16），既有 R86、規則、經濟及來源規則均通過；瀏覽器回歸 **95 項**、匯入／匯出邊界 **5 項**、美術／真幀／控制尺寸與深度操作全綠，執行錯誤與遊戲外部請求均為 **0**。內容回歸 R1 **54 項**、R2 **24 項／75 張圖**、R3 **24 項／87 張圖**均通過；含正常九段、三次選箱、離線重載、跨段疲勞與 WebKit。五組 Muse 驗收的確定性證據檢查亦全綠。

桌機 1366×600、手機 390×844，各玩法三跑中位：同步模擬／渲染 p95 最高 **0.6ms**，幀間隔 p95 最高 **16.8ms**，均低於 18ms。這是並發載參考值；`shippingQualified=false`，不能替代實體裝置或乾淨機況量測。秘密掃描含 UTF-16 測試 log，**零命中**；沒有讀取秘密目錄。三個原作 repo 的 HEAD 與工作狀態保持原樣，73 份保留來源雜湊相符。

原始執行輸出：`docs/content/r3/check.log`；收尾讀回：`docs/content/r3/verification.json`；三視口修改前後原檔及來源：`docs/evidence/content-r3/receipt.json`。R3 全部 PNG、商店圖與美術原檔都已逐一核對 SHA-256。新增商店圖的獨立索引為 `docs/store/screenshots/content-r3-manifest.json`，現有商店圖共 16 張。

既有 R1／R2 瀏覽器腳本只將原生下拉改成實際職務按鈕與套用操作；原有救援姓名／封箱收據斷言改讀獨立結果函式。沒有刪測試、降低命中尺寸、放寬斷言或省略測試。R3 另對五組證據、真擋擊、非零疲勞交換與三張真射擊 frame 做確定性驗證。

新增生成美術 **1 張**：席安頭像。實際工具 `image_gen__imagegen`，未回傳模型 slug；母圖實際 1254×1254，執行 WebP 256×256，新增 24,930 bytes。熹與安沿用既有圖。原圖、提示詞、相同 R5 風格前綴、雜湊見 `docs/art/masters/content-r3/shian-portrait.png`、`PROMPTS_CONTENT_R3.json`、`ASSET_MANIFEST_CONTENT_R3.json`。沒有把線、疲勞格或文字牌計為新美術。

新增商店圖 `docs/store/screenshots/phone-08-content-r3.png`（1290×2796）、`tablet-08-content-r3.png`（2064×2752），展示真實選箱前畫面。平板從未改動的正常流程存檔經產品匯入取證。既有商店截圖保留；回歸腳本照原用途更新其當前版本證據，原 R2 修改前六張另有 Git 原檔。

繁中文案 mode 2 已直接套用：

| 原句 | 原因 | 改成什麼 |
|---|---|---|
| 下一批 X 秒｜14 秒東側 N 隻 | 兩個秒數會誤導。 | 下一批 X 秒・東側 N 隻。 |
| 誘開 3/2 | 目標顯示溢出。 | 誘開 2/2 已達標，實際獎勵計數保留。 |
| 選到已任職的人，兩人自動交換 | 玩家看不到交換前的結果。 | 先點職務看交換，再套用即保存；顯示兩個姓名與新職務。 |
| 免費修 0％，餘下 18％存為備用 | 原意正確但選箱層級不清。 | 分成固定三項比較，零修復與 18％備用都保留。 |

## 未完成與風險

**Apple 4.3 風險：中。** 本輪將本作的誘敵空間判斷、每章單箱取捨與固定同行者跨九段疲勞做得更明確，未增加通用任務或技能樹。三段原作玩法仍可辨識，這是差異化判斷，不代表 Apple 審核結果。

**BLOCKED**：新 Muse 複審是否達 8 分尚未發生；需獨立審查員開啟本輪手機交付組評分。實體手機／iPad、真人新手與親子試玩、乾淨機況效能需老闆提供裝置、測試者與獨占量測時段。無頭 Chromium／WebKit 與視口模擬不替代上述項目。沒有缺用占位圖，也沒有假造真人、實機或審查分數。

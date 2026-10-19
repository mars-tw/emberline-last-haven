# R1 美術重做結果

2026-10-16｜燼途：最後一站｜web 0.2.0｜main｜只做本機 commit。

美術接入 EXECUTED；完整本機驗證與證據讀回 VERIFIED，見 [VALIDATION_R1.json](art/VALIDATION_R1.json)。未推送、部署、操作商店或向他人發訊息；無外部派工，無秘密目錄讀取，瀏覽器全程 headless。

## 視覺改動

1. 深藍綠米色票卡改成鏽紅金屬救援儀表：專屬 Logo、橙色撤離導線、硬邊按鍵、裝備圖示、任務夾與同材質行車簿。
2. 護航與守點使用同風格廢土場景和救援車；中繼站有圍欄、裝車台、站體、屍群入口與實際誘餌機，保留三個真落點與規則。
3. 夜車由溫馨像素臥室改成鏽蝕撤離車廂與 A-07 四真姿態，和公路／據點同套風格前綴。手機說明改成按住轉向、點擊甩尾；桌機與平板保留完整任務資訊，矮螢幕不裁切人物小卡。

## 新素材與模型

共 **12 項生成資產**，包含四張場景、熹三視圖、A-07 四姿態、誘餌擴音機、面板紋理、四圖示 atlas、Logo、App icon 提案、救援車／拖車 sheet。衍生 runtime 檔案數、尺寸、位元組與 hash 見 [ASSET_MANIFEST.json](art/ASSET_MANIFEST.json)。1024 App icon 提案在 docs，不進離線包。

實際工具 **image_gen__imagegen**；要求模型 gpt-image-2，工具沒有回傳 slug，actualModelSlug=null，不能證明實際模型 slug。未以其他模型冒充。所有 prompt 使用同一風格前綴，完整記於 [PROMPTS.json](art/PROMPTS.json)。

原始母版、opaque 檢視版、遮罩、真 RGBA、不可見 RGB 清理與 runtime 導出皆有 hash。沿用素材及 MIT／CC BY 4.0／CC0 署名完整保留在 CREDITS.md 與 store asset manifest；原來源二進位不覆寫。新背景 WebP，透明角色、圖示與物件 PNG。

## 前後對照與檢視

先審文件：[ART_REVIEW_R1.md](art/ART_REVIEW_R1.md)、[ART_DIRECTION.md](art/ART_DIRECTION.md)、[開源技法研究](art/ART_STUDY_R1.md)。執行期間新增的 [ART_REVIEW_MUSE.md](art/ART_REVIEW_MUSE.md) 已在收尾完整納入；[逐項對照](art/MUSE_RECONCILIATION_R1.md) 區分採納、不同方案與缺件。此為舊圖審查輸入，沒有冒稱新版已獲獨立覆核。

同腳本、同視口、一般 UI 操作、無狀態注入：`docs/art/compare/before/` 與 `after/`，各 25 張：手機390×844、平板1032×1376、桌機1366×768、橫向844×390、寬螢幕1920×1080；每種包含封面、護航、投餌、夜車、行車簿。captures.json 保存當時進度；前後會因真實操作耗時有小幅遊戲時間差，不拿它當像素級確定性回歸。

商店實載截圖重新輸出 10 張到 `docs/store/screenshots/`，手機1290×2796、平板2064×2752，雜湊與建置識別見 manifest。這是 Web 裝置模擬截圖，沒有冒稱原生實機。

品質閘門所需的三視口守點前後圖另存 `docs/evidence/art-r1/`（手機、平板、橫向，各 before／after），與 compare 原 PNG 相同，沒有重畫或合成。測試瀏覽器與本輪4179預覽服務已關閉。

64px 原尺寸縮圖：[THUMBNAILS_64.png](art/THUMBNAILS_64.png)。熹臉／圍巾、A-07 無線電／手勢、誘餌燈、裝備與 App 車燈可辨；熹背面有頭部與背包，側面非正面複製。A-07 四格頭、眼、手臂與手掌確實不同，未用單圖位移／縮放／旋轉假幀。亮度以 HSV V、飽和以 HSV S，僅計 alpha>200 可見像素；近黑 V<0.15、低飽和 S<0.20。精確數據與四角透明／RGBA／hash／相鄰姿態 alpha 差見 [ART_GATES.json](art/ART_GATES.json)。

## 測試與包體

最終 `npm run check` 已以 exit code 0 完成：79 單元測試／5 檔、灰燼三組原測試、暴風八組來源規則、95 瀏覽器案例、5 匯入／匯出／quota 案例、正式建置、離線、素材與秘密掃描全通過。11 視口及八狀態保留 ≥44px、中心可點、無溢出斷言；新增可見圖片必須載入與手機不得顯示鍵盤提示。沒有刪除或放寬既有斷言。原73份來源副本 hash、三來源 repo HEAD／狀態仍相同。

並發參考效能：桌機1366×600三跑中位工作 p95 **0.30ms**、RAF間隔 p95 **16.70ms**；手機390×844為 **0.20ms／16.80ms**，均 ≤18ms。只代表本機 headless 早期敵人場景，`shippingQualified=false`；不當成乾淨機況、晚期壓力或真手機出貨證明。

圖片新增 **3,115,774 bytes（3.12 MB）**，20個 runtime 檔；public 總量由4,909,166變成8,025,025 bytes。四張背景與面板用 WebP，透明圖按實際尺寸導出。新增包體合理性：以約3MB換掉四大場景、主要載具、人物與整套介面；原畫、opaque／mask／RGBA母版、前後對照及商店圖不隨遊戲下載。完整數據見 ART_GATES.json 與最終 VALIDATION_R1.json。

## 八面向與界線

美術、按鈕、選單、人物、場景、技能回饋、角色色彩與真幀均納入本輪。規則、碰撞、資源成本、傷害命中幀不改。原敵人 walk／attack／hurt／death 和砲手攻擊真幀保留；A-07 使用新姿態，傷害結算仍由原引擎掌管。

Apple 4.3 風險：**高**。新的金屬介面、專屬場景與人物已降低模板外觀相似；帳號既有退件、三章共用場景、原生／真人證據與提交主體問題仍未由本機美術輪解決，不能宣稱 Apple 已接受。

未完成／限制：BLOCKED：實體 iPhone／iPad／Android、原生 IPA／AAB、真人測試與乾淨機況出貨效能均未驗。未重製兩種敵人及砲手的全動作圖集，小尺寸舊真幀與新插畫仍有混合媒材；攀附專用圖集、各章獨立背景與 A-07 全身三視圖列後續缺件。工具模型 slug 不可取得。沒有新版獨立終審；MUSE建議的真人盲測、純色連通區／舞台占比、16px全文字最低字級與新敵人／視差VFX等未完成，詳見對照表。這些不以通過本機測試取代。

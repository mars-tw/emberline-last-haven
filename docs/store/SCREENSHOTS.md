# 實際商店畫面清單｜R4 0.5.0

無頭 Chromium、正式本機建置、一般按鈕與自然模擬時間擷取。手機430×932／DPR3 → **1290×2796**；iPad級1032×1376／DPR2 → **2064×2752**。沒有合成商店文字、注入存檔或添加假敵人；這是網頁尺寸模擬，不冒稱實體原生包。

| 畫面 | 檔名（phone／tablet各一） | R4可見證據 |
|---|---|---|
| 北上出發 | 01-departure.png | 定版熹、瘦紙卡、燈塔光束與車票橘鈕 |
| 車隊護航 | 02-convoy.png | >=3名自然攀車者，車側與車尾、真啃咬命中幀、40px車頂熹與甩尾入口 |
| 投餌待命 | 03-bait.png | 同一雙塔中繼站、貨物分區、亮燈、完整沙包與裝車台 |
| 守點結算 | 04-common-progress.png | 同站地標、戰後拖痕、熄燈、8隻可數敵人、定版橘衣熹 |
| 夜車 | 05-night.png | 橘衣短棕髮熹在前景，安保留乘客身份，屋頂／冷窗對應反應及主橘鍵 |

檔案在 screenshots/。manifest.json 保存十張完整尺寸／雜湊／建置識別，docs/evidence/art-r4/store-captures.json 保存當時普通操作狀態與唯讀渲染幀。scripts/art-r4-store.mjs 納入既有 browser 回歸，等真實三名攀車者及60ms命中窗口再拍；遊戲傷害、敵數、冷卻不變。

R4改前／改後49對保存在 ../art/compare/r4-before/ 與 r4-after/；各視口原像素比較見 R4_PHONE_PAIRS.webp。129px寬整組列表縮圖見 ../art/STORE_THUMBNAILS_R4.png。新獨立Muse評分、真人64px80%辨識與實體商店包驗證仍缺件。

新內容 R4（0.10.0）新增並保留既有圖：`screenshots/phone-09-content-r4.png` 為同一正常首批投餌後約 6 秒的真實轉向畫面（1290×2796）；`screenshots/tablet-09-content-r4.png` 為正常旅程存檔經正式匯入後實際點選救援包的預選畫面（2064×2752）。來源、建置識別、原尺寸與 SHA-256 見 `screenshots/content-r4-manifest.json`；完整操作狀態見 `../content/r4/receipt.json`。兩張都由無頭 Chromium 擷取，沒有拼貼或注入敵人。
# 新內容第 5 輪補圖（0.11.0）

新增 `screenshots/phone-10-content-r5.png`（1290×2796）及 `screenshots/tablet-10-content-r5.png`（2064×2752），展示第二章實際預選救援包、兩種實物圖示及跨章單箱取捨。來自正常九段旅程的未改值存檔，經正式匯入後實際點選，未添加假角色或 UI。原尺寸、SHA-256 與來源見 `screenshots/content-r5-manifest.json`。所有既有商店圖保留。

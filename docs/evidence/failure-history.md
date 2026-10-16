# 本輪發現與修正

這些是診斷紀錄，不是最終通過證據。

1. `npm install --offline` 回覆 ENOTCACHED。改用一般 npm 安裝明確版本，只取得開發依賴，未送出專案內容或派工。
2. 首次建置缺夜行引擎依賴的 `spec/reboot-v2/mission-catalog.json`，首次灰燼測試缺 `src/version.js`。補上原封不動的唯讀快照，沒有改斷言；原始回歸通過。
3. 早期未買護具，以及後續低車體仍持續等待雙攀附的路徑，都曾失去動力。維持存活／甩落的斷言，改用正常護具與低車體先清車的操作；遊戲加入結算明示的同行者維修，前方敵人也真正進入火線。不加無敵、不移除車體耗盡，不以測試專用通關路徑放行。
4. 第二輪九段完成後，離線新分頁空白。診斷見歷史 browser-failure-chromium.txt：waitForFunction 逾時。離線 probe 實際看到 cache 已有所有 JS／CSS，但 fetch 仍失敗。原因是 Vite 預覽的 Vary: Origin 與 precache 請求標頭不同；SW 限同來源靜態資源的 cache match 加 ignoreVary，正常斷網新頁恢復。完整 E2E 仍保留，未放寬離線斷言。
5. 幀雜湊檢查發現兩組 walk 原 atlas 第 4 格等於第 2 格。runtime 改輪播 0、1、2 三個互異真姿勢，保留原圖不動；active frame 全異斷言仍保留。attack／hurt／death 仍完整播放原始幀。這不是新攀車專用動畫，也不冒稱完成三視圖或整體美術色彩閘。
6. 虛擬時鐘重開後的 Playwright locator stable 等待曾卡住動態甩尾按鈕。改以按鈕實際 bounding box 中心做真 pointer 點擊，仍斷言甩落數必須增加；沒有 force click、DOM click 或狀態注入。
7. Windows WebKit 的 `context.setOffline(true)` 讓已控制且完整快取的新頁／重載回覆 `WebKit encountered an internal error`。另用獨立 loopback HTTP server 完整載入後關閉伺服器及所有 sockets，新分頁可由 SW 快取啟動。正式 WebKit 離線案例改用真實伺服器停止，原保存／重開斷言保留；不是略過離線檢查或當成 iPhone 實機證據。
8. 交付前檢查補上行車封面暫停：關閉行車簿的處理必須尊重 resume overlay，避免返回封面後在背後走時。整合測試新增返回後兩秒進度全等、手動繼續後再玩。
9. 無射擊目標時的倒數原可持續變成負值，造成新存檔驗證拒收。冷卻固定下限零，新增三秒護航後保存／冷讀精確相等的回歸。列車預警歸零時也補上真正自動承受與換波，避免零秒軟鎖；單測驗證三波一次性結算，瀏覽器另驗證自然到期扣血與換波。

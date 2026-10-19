# 燼途：新內容第一輪

2026-10-18｜PREPARED｜main｜0.6.0 → 0.7.0。只做本機 commit。

收尾狀態：VERIFIED，三項已接入正常流程，完整 `npm run check` 通過。實際側翼規則與新提示集中於 `src/journey.ts`；受保護的 `src/origins/baitLayout.ts` 保留原始內容與 SHA-256。交付與缺件見 `CODEX_RESPONSE_CONTENT_R1.md`。

已讀共用提案的燼途段、Muse 第二節、game-optimization-round、ART_DIRECTION、R5 報告與深度試玩。repo 沒有 AGENTS.md／CLAUDE.md，遵循本次工作單與共用核心。五份既有未追蹤 Muse 評分檔保留。

| 內容 | 設計與入口 | 驗收 | 預計檔案 |
|---|---|---|---|
| 側翼來襲 | 三章守點各有三批西／東／夾擊時序；進場即公開整份偵察，交戰顯示下一批倒數。西餌只截西線、東餌只截東線、中央只接中央縱隊；錯側敵人直奔裝車區。每批方向與數量可觀察，不換血量充數。 | 三份時序不同；相同敵人對三餌產生不同路徑；正確側餌可誘開兩隻並完成；中央不能通吃；零補給可直接守點；重載不重刷已出現批次。 | src/campaign.ts、src/origins/baitLayout.ts、src/main.ts、src/render.ts、tests/content-r1.test.ts |
| 中繼站只能帶走一樣 | 每章守點結果自動出示一次物資二選一：救援包花 3 補給多帶 2 人，或工具箱免費修車 18％。兩箱只能拿一箱；補給不夠仍有免費出路；出發前必須選完。 | 三章各一次；不可重領或兩者兼拿；數值立即回饋並帶入下一段；選前／選後均可重載；離線有效。 | src/campaign.ts、src/storage.ts、src/main.ts、tests/content-r1.test.ts |
| 同行者輪班表 | 首次出發與每段結果的「輪班／整備」入口，列出三名核心角色疲勞 0–3 與下一段安排。三個職位各一人，交換職位避免重複；出發鈕確認該表。開車／守夜疲勞 +1、休息 -2，影響下一段：疲勞司機甩尾冷卻加長；疲勞守夜者縮短預警；休息充足守夜者可擋一次撞擊。 | 九次出發都有安排摘要；同人不能兩職；完成才結算疲勞一次，失敗重試不洗疲勞／護盾；實際預警／冷卻／擋擊有差；排班、疲勞、效果與結算收據可存取；0.5／0.6 舊檔嚴格遷移。 | src/campaign.ts、src/storage.ts、src/feedback.ts、src/main.ts、src/style.css、tests/content-r1.test.ts |

新增一張整備桌場景，用 image_gen__imagegen、R5 原風格前綴，保存原圖、WebP、提示詞、雜湊與真實工具名。介面沿用灰燼海岸、焦邊紙卡與橘色車票；不加方塊替身、SDK、帳號、付費、連線功能。

驗證：保留既有測試斷言；必要的流程前置改為真實選物資。新增單元與無頭操作九段，驗證側餌、三次二選一、交換輪班及重載／離線。手機直橫、窄螢幕與 iPad 檢查 >=44px、無遮擋、無鍵盤說明。所有瀏覽器 headless，用完關閉，單一 4179 preview。

執行 npm run check；更新精確版本與新增測試數量守門。p95 <=18ms 並發載僅供參考，失敗照實回報。新增原尺寸畫面 docs/content/r1/，商店 phone-06-content-r1.png（1290×2796）、tablet-06-content-r1.png（2064×2752），不刪既有圖。秘密掃描零命中；最後寫 CODEX_RESPONSE_CONTENT_R1.md，逐項報告狀態、玩法、測試與 Apple 4.3 風險及缺件。

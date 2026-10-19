# R2 美術執行計畫

2026-10-16｜燼途：最後一站｜main｜起點 a8342f1／第一輪基線。計畫 PREPARED → 實作 EXECUTED；最終 VERIFIED 證據見 docs/art/VALIDATION_R2.json。

已讀共用核心、token-efficient-ai-dispatch、game-optimization-round、imagegen、frontend-design、playwright、speak-human-tw，以及 R1 方向／報告、MUSE 原審與 6.4 分複審。工作單禁止外部派工，本輪由本執行線完成，不呼叫 DevSpace 或其他對話。不讀秘密目錄。repo 無本地 AGENTS.md／CLAUDE.md／AUDIT_full.md；沿用使用者提供的 AGENTS 指令。現有未追蹤 ART_RESCORE_MUSE.md 為輸入，保留原狀、不代為提交。

1. **美術／先審**：固定 R1 建置，headless 擷取五視口五場景到 compare/r2-before；逐圖審查。R2 延續灰燼公路手繪，壓低全橙色統治、補冷灰空間、移除場內重複標誌。
2. **人物／外觀**：熹維持棕短髮、鏽橙外套、琥珀圍巾；正側背、砲手真姿勢與兩敵種全動作重新生成。64px contact sheet、頭部、輪廓、亮度 0.30–0.75、近黑 <35%、飽和 >=0.32、低飽和 <20% 閘門。不得宣稱未做的真人盲測。
3. **地圖**：出發改實際出城場景；三種不重複公路段與至少四種路邊殘骸；完整中繼站＋實體誘餌罐；夜車同筆觸、同材質與上左主光。前三分鐘新圖必實載。
4. **按鈕／選單**：焦邊行車手記、車票缺口主鍵、固定角落淡燈塔光；保留 >=44px、所有控制可見可點、關閉與返回。11 視口／八狀態回歸不放寬。
5. **技能／動作**：既有 impact 結算不改，walk 腿部交替、attack 預備／命中／收勢、hurt／death 真幀。誘餌暖光回饋、獎勵補間、夜車視覺熱區。減動態仍保留姿勢。
6. **包體／授權**：WebP 背景、適當尺寸 PNG cutout；原圖／opaque／mask／RGBA／runtime hash 與 prompt 入 manifest；沿用來源與授權不刪。App icon 及 Logo 提案實際生成並記錄工具，slug 不可查就明說。
7. **證據**：同一 capture 腳本 r2-after、三視口 evidence、10 張商店尺寸 1290×2796／2064×2752；記錄實載狀態與 build hash。
8. **測試／交付**：版本 0.3.0；既有 npm run check 全跑、秘密零命中、diff check；桌機／手機 p95 三跑中位 <=18ms，並發數據只作參考。只 git add 明確路徑、繁中本機 commit，不 push／部署／商店操作。

最終逐條回應 MUSE 五建議，回報已做、未做及證據；不把自評冒充獨立 8 分驗收。

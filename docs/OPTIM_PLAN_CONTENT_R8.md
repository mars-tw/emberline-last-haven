# 燼途：最後一站｜新內容第8輪修正計畫

VERIFIED（本機修正與自動驗證；範圍外／外部項目見報告）｜2026-10-19｜main｜0.11.2 → 0.11.3。

本輪依三份 R7 審查與本線路最後指定的七項嚴重問題，只修既有三項內容。不增加章節箱種、人物、成長系統或新的結算鏈頁；Muse 五項中超出本線路範圍者逐項說明，不能宣稱全數完成。

| 原內容／入口 | 修正設計 | 驗收與證據 | 檔案 |
|---|---|---|---|
| 側翼來襲／暮色守點 | 同一 ID 固定展示槽，不依 y 排序換位；每個在場個體必有帶批次／側別的序號，受餌實心、未受餌虛線；序號無空位也不得隱藏。操作旁提供當前影響對象、數量、消耗、期限及未受影響威脅。 | 西／中／東投餌及部分出界；連續三幀 ID、人物位置對應穩定；存活＋出界與總數核對。實際操作完成、到期重載及整群結算測試。 | src/render.ts、src/art-layout.ts、src/main.ts、src/journey.ts、tests/content-r8.test.ts、scripts/content-r8.mjs |
| 中繼站只能帶走一樣／守點完成 | 損失欄只列人物不登車、少得修復或備修；刪除維持／仍生效與重複同行 +2。選箱、封存、帶走及摘要使用同一 R5 救援包圖；結果總數集中，修正文案「修復至」。 | 69／95／100％、兩種選擇；預覽與正式扣款、封存、重載一致；損失欄明確禁止詞與重複句斷言；四張69／100結果原圖。 | src/dispatch-view.ts、src/feedback.ts、src/render.ts、src/style.css、tests/content-r7.test.ts、tests/content-r8.test.ts |
| 同行者輪班表／每段出發前輪班／整備 | 席安顯示名改老席（穩定人物索引不變），避免與安混淆；目前職務另標，預覽新職務唯一選取；疲勞分目前與下段結束預計，單位統一格；明寫疲勞跟人、不因交換重置。滿疲勞工作顯示實際代價與確認；既有擋擊插圖對準窗側。 | 六種分工、預覽／套用不改疲勞、完成才結算一次及重載；風險取消不改分工；夜戰連續訊號／擋擊／回饋圖。 | src/journey.ts、src/dispatch-view.ts、src/main.ts、src/render.ts、src/style.css、tests、scripts/content-r8.mjs |

驗證：完整 npm run check、R8 實際操作測試、既有 RWD／觸控≥44px／手機無鍵盤提示、秘密掃描零命中、版本一致、三跑效能中位 p95≤18ms（共用主機僅供參考）。只啟動一個背景 preview；瀏覽器順序使用並關閉。既有測試如涉及修正前錯誤文案，改為同等或更強的語意斷言，保留測試項目。

截圖：docs/content/r8/phone-<內容>-<狀態>.png，1290×2796；review-set 15 張、每項5張並含進行中。完整原圖另提供三側部分出界及69／95／100雙箱。商店新增 phone-13-content-r8.png（1290×2796）、tablet-13-content-r8.png（2064×2752），不刪既有。沿用生成實物與人物美術，新增美術預計0；資訊標記不計美術。

保全：本輪前既有未追蹤檔建立雜湊基線，不修改、不刪除、不提交。只修改本 repo／main，明確路徑 git add，本機繁中 commit；禁止 push、部署、商店操作、外部派工、秘密目錄讀取。實體裝置、真人試玩、乾淨主機效能、Muse≥8複審標 BLOCKED，寫明需要條件。

完成讀回：見`docs/CODEX_RESPONSE_CONTENT_R8.md`、`docs/content/r8/verification.json`；全部檢查階段同建置續驗通過；原命令退出1與續驗退出0均保留，七項嚴重問題逐項對照`ACCEPTANCE.md`。Muse章節新箱種與新結算頁依本線路限制未實作，並未標為完成。三視口修改前／後原圖另存`docs/evidence/content-r8-before/`與`content-r8-after/`，來源與雜湊見`docs/content/r8/comparison.json`。

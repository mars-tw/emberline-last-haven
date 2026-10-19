# 燼途：新內容第二輪

2026-10-19｜0.8.0｜main｜VERIFIED：本機實作與可執行驗證完成，完整 `npm run check` 退出碼0。真人、實體裝置與Muse複審仍為BLOCKED。只做本機 commit。

| 三項內容 | 怎麼玩、入口與實際效果 |
|---|---|
| 側翼來襲 | 每章進入「暮色守點」直接看到真場景偵察圖。三側各有第幾批、秒數、數量與入口箭頭；下一批來敵時對應線亮箭頭，雙翼同時亮。投餌後立即出現實際目標路徑、受引敵人的腳環與頭頂標記。按鈕分為可投、該側生效、其他側共用冷卻、補給不足；生效與冷卻同為12秒。守點全程顯示誘開 x／2。第二章霜藍冷庫、第三章潮濕砂地與燈塔，各用新生成母圖；同章預覽／交戰／結果不換底圖。失敗重試後，第一批不變，後兩批時刻±2秒、數量最多±1，存檔不重新擲波次。 |
| 中繼站只能帶走一樣 | 每章守點結束自動開啟獨立雙箱畫面，之後才進輪班；關閉後可由結果的「中繼站：只能帶一樣」重開。兩箱並列立即收益、下一段影響、放棄代價。救援包花3補給接回兩位具名同行者，立即顯示守衛火力變化與登車回話；工具箱免費提供合計18％即修／備用，滿血時存18％備用零件，受損才自動消耗。零補給仍能選工具箱；未選不能走，選後封箱，重載不能換領。 |
| 同行者輪班表 | 首次出發及每段結果點「輪班／整備」。席安守夜多2秒預警、熹開車甩尾快0.5秒、安休息回復3級；專長固定，沒有技能樹。每人疲勞與專長直接顯示，效果寫明人名、實際甩尾秒數、後續波次預警與擋擊。調整即保存，選到已任職者自動交換；視窗關閉改為「返回結果」，唯一確認是原出發鈕。疲勞跨九段結算，剛休息的人守夜可擋一次，失敗重試不補回已用擋擊，也不洗疲勞。 |

## Muse 五項驗收與原尺寸證據

全部遊戲證據由無頭瀏覽器實際操作截取，手機直式主要為430×932 CSS、DPR3，即1290×2796原尺寸，沒有縮放交付。截圖雜湊、尺寸、遊戲狀態與資料來源記於 `docs/content/r2/receipt.json`。`normal` 為正常九段流程；`boundary fixture` 是從正常存檔製作邊界情境，再走產品既有檔案匯入，不能當成自然遊玩證據。

逐張原尺寸路徑、尺寸、來源與SHA-256見 `docs/content/r2/SCREENSHOT_INDEX.md`。R1原始對照另從修改前Git HEAD原封不動取回：`docs/content/r2/before/phone-flank-preview.png`、`docs/content/r2/before/phone-relay-roster.png`；來源commit與雜湊見同目錄 `receipt.json`，不以重拍的R1回歸圖冒充修改前畫面。

| 唯一驗收項 | 本機實作與原尺寸手機截圖 | 尚需外部驗證 |
|---|---|---|
| 1．偵察圖 | 真場景與三側波次：`docs/content/r2/phone-flank-1-preview.png`、`phone-flank-2-preview.png`、`phone-flank-3-preview.png`。末章雙翼：`phone-flank-3-double-warning.png`。選餌路徑：各章 `phone-flank-<1/2/3>-turning-1.png`。中間不再是空白黑Rect。 | BLOCKED：10位新玩家5秒辨讀，至少8位說出首批方向與到達時刻。需要未玩過的真人。無真人辨讀通過率可報。 |
| 2．投餌回饋 | 各章 `phone-flank-<1/2/3>-turning-1.png`、`turning-2.png`、`turning-3.png`，同一實際敵群在投餌後0.94秒內三格；腳環／標記依真實匹配線生成。可投看預覽；生效與冷卻：`phone-bait-1-active-cooldown.png`；補給不足：`phone-bait-empty.png`。常駐進度／成功：`phone-flank-1-success.png`、`phone-flank-2-success.png`、`phone-flank-3-success.png`。 | BLOCKED：實體手機錄影，以及不讀教學的灰鍵原因理解測試。無頭截圖只證明程式實際路徑與視覺，不替代實機手感。 |
| 3．獨立選箱 | 三章成對：`phone-relay-1-before.png`／`after.png`、`phone-relay-2-before.png`／`after.png`、`phone-relay-3-before.png`／`after.png`。滿血非零收益：`phone-relay-repair-full-before.png`／`after.png`；最多18％：`phone-relay-repair18-before.png`／`after.png`；重載封箱：`phone-relay-repair-full-sealed-reload.png`。後三組是明確邊界fixture。 | BLOCKED：10人中至少8人能說出選箱理由與放棄代價。需要真人取捨研究。 |
| 4．角色專長與單次確認 | `phone-crew-initial.png`、`phone-crew-swap.png`、`phone-crew-plan-1.png`。九次結算：`phone-crew-settled-1.png`至`phone-crew-settled-9.png`；畫面有不同疲勞與行車歷史。擋擊前後：`phone-watch-1-before.png`／`phone-watch-1-blocked.png`。失敗重試：`phone-retry-stranded.png`／`phone-retry-preview-after.png`，後者為明確fixture。 | BLOCKED：遮名專長辨識與隨機排班預測，10人至少8人答對。需要真人；不能把固定程式斷言稱作人類理解。 |
| 5．章節差異與可讀性 | 三章偵察圖及同章交戰三格；冷庫冰霜、斷橋、燈塔、砂地與繫纜柱是場景物件差異。整備桌依章節換冷暖與取景，見三章選箱成對圖。重試前後波次：`phone-retry-preview-before.png`／`phone-retry-preview-after.png`，第一批相同、後兩批改變。 | BLOCKED：10位真人用手機跑完三章，至少8人記住一人名字與疲勞；遮地名分辨章節；實體iPhone或iPad全流程。需要測試者、裝置與可安裝／瀏覽環境，不能用WebKit替代。 |

表內省略前綴的所有 `phone-*.png` 均位於 `docs/content/r2/`，不是縮圖或聯絡表。另有 `phone-flank-fallback-before.png`／`phone-flank-fallback-complete.png`，證明有足夠守衛與護具時，零補給、不投餌仍走到60秒撤離；沒有宣稱所有低火力路線都能活到保底。

## 補齊上一輪「未見證據」

- 選前無法走、選後不能重領、零補給可免費選、修前修後：上述選箱圖與邊界fixture收據；每種都有實際按鈕或存檔斷言。
- 交換職位：`phone-crew-initial.png`／`phone-crew-swap.png`，守夜換成已任休息的安，熹移至休息；不是修改狀態後擺拍。
- 一次擋擊：守夜前後成對圖顯示守夜姓名、車體、擋擊餘額與當下回饋；真實反制產生撞擊。
- 錯側繼續前進：`phone-flank-1-wrong-side-1.png`、`phone-flank-1-wrong-side-2.png`、`phone-flank-1-wrong-side-3.png`；西餌仍在生效，第二批東線沒有誘餌標記，繼續往裝車區走。
- 備用零件實際消耗：`phone-relay-reserve-before.png`／`phone-relay-reserve-consumed.png`；具名守夜者沒有可用擋擊，真實撞擊後車體不降、零件餘額減少。這是明確邊界fixture，與正常路線擋擊分開驗證。
- 舊存檔與錯誤匯入：`phone-save-r1-migrated.png`、`phone-save-import-rejected.png`。0.7.0保留舊輪班與已領箱，不倒補零件；0.5.0／0.6.0遷移回歸仍保留，未知版本與缺損新欄位拒絕。
- 測試執行：`phone-test-results.png`是實際Vitest JSON與瀏覽器斷言的唯讀閱讀頁，明確標示不是遊戲畫面；原始JSON與完整執行輸出另附，沒有製作假的終端成功畫面。
- 實體手機效能、觸控手感、真人理解仍為BLOCKED，未以截圖假冒完成。

## 美術、商店圖及文案

新增生成美術 **2張**，1024×1536：`docs/art/masters/content-r2/coldstore.png`、`lighthouse.png`；執行WebP在 `public/art/content-r2/`。實際工具 `image_gen__imagegen`，未回傳模型slug。完整提示詞前綴與R5一致，原圖、執行圖、尺寸、bytes、SHA-256見 `ASSET_MANIFEST_CONTENT_R2.json`、`PROMPTS_CONTENT_R2.json`。路線箭頭與資訊牌是遊戲即時資訊，沒有計為新生成美術；整備桌沿用R1，沒有冒稱新人物肖像。

新增商店圖 `docs/store/screenshots/phone-07-content-r2.png`（1290×2796）與 `tablet-07-content-r2.png`（2064×2752）。平板由未修改的正常選箱存檔，經官方檔案選擇器還原拍攝。既有商店圖保留；既有回歸腳本按新流程處理自動選箱，未刪測試或放寬斷言。

既有共用過站助手在負擔得起時帶救援包，保留原本「真實撞擊扣血」的原斷言；工具箱的新備用維修效果另由R2單元與成對截圖驗證。既有美術攝影會先關閉已自動顯示的選箱視窗，再拍原來的戰後場景；進場順序與選箱鎖仍由新舊內容測試驗證。

繁中文案mode 2直接套用，數值、真實人名與既有授權保留：

| 原句 | 原因 | 改成什麼 |
|---|---|---|
| 三側同時顯示「10秒」 | 無法知道哪側生效、哪側不可用。 | 該側「生效n秒」、其餘「冷卻n秒」，無補給「補給不足」，可用「可投・1」。 |
| 「免費修車+0％」 | 滿血時唯一名額沒有收益。 | 「免費修0％，餘下18％存為備用」，選後保存並在受損時實際消耗。 |
| 「下一段：甩尾冷卻…；每波預警−0秒…」 | 未歸因角色，且無變化資訊混亂。 | 逐人顯示開車冷卻、守夜實際後續波預警、休息回復；列明疲勞與固定專長。 |
| 「確認安排」 | 與出發確認重複。 | 「返回結果」，調整即保存，只由原出發鈕確認。 |
| 「同行+2」 | 看不出接回的是誰。 | 顯示兩位同行者姓名、登車回話、守衛火力與不可再領的封箱收據。 |

## Apple 4.3、未完成與風險

**Apple 4.3風險：中。** 本輪強化同一車隊跨九段的空間判斷、單箱取捨、固定人物疲勞與章節場景，沒有每日任務、抽卡或技能樹。三段原作移植仍可辨，主角與敵人沿用既有美術；此為產品差異化風險判斷，沒有取得Apple裁決。沒有加入廣告、付費、第三方SDK、帳號、線上功能或遊戲內外部連結。

BLOCKED：Muse R2獨立複審尚未執行，不能宣稱已達8分；真人與實體裝置驗收如上，參與者0位、實體裝置0台。沒有原生簽章包、實機出貨效能或觸控手感證明。並發主機p95僅供參考。強火力可能讓投餌與資源取捨偏寬鬆，低火力完全不投餌也可能在60秒前失守；沒有用調高血量充數或保證全組合無損通關。

沒有push、部署、商店後台操作、傳訊、外部派工；沒有讀取憑證資料夾、寫入金鑰、刪除既有未追蹤檔或修改他人未提交的檔案。初始未追蹤Muse報告原樣保留、不納入本輪提交。

## 最終驗證收據

- VERIFIED：完整 `npm run check` 退出碼0。125項Vitest（原109項＋R2新增16項）、原作規則／經濟／移植測試、95項瀏覽器案例、5項匯入匯出與儲存失敗案例、深度控制回歸、54項R1內容檢查、24項R2操作檢查通過。既有測試未刪除、原斷言未放寬。
- VERIFIED：Chromium正常九段通關、九次疲勞結算、三次不可重領選箱、實際擋擊、重載與離線續玩；WebKit既有完整首章及本輪選箱／儲存回讀通過。320×568、390×844、844×390、1032×1376、1376×1032、1366×600、1280×640新控制皆可見、可命中且至少44px，保留既有11視口矩陣。
- VERIFIED：75張本輪原尺寸截圖（含兩張新商店圖及測試產物閱讀頁），另保留2張R1修改前原圖。三章選箱前後、投餌1秒內三格、雙翼警告、錯側前進、擋擊、18％修復、滿血備用消耗、重試疲勞與舊檔／錯誤匯入均有具名檔案。每秒存檔與同幀渲染座標分開記錄，沒有用過期存檔座標冒充畫面。
- VERIFIED：49張既有美術視口、角色透明度／亮度／飽和度、真姿勢幀、命中與來源保護閘門通過；73個受保護來源檔及三個來源repo HEAD／工作目錄未變。14張商店圖保留。秘密掃描零命中。
- VERIFIED：六組桌機／手機、各三跑中位的同步工作p95最高約0.5ms，幀間隔p95最高約16.8ms，均≤18ms。並發Windows主機無頭量測只供參考，`shippingQualified=false`，不當作實機出貨認證。
- 中途問題已修正並保留紀錄：WebKit原生Escape關閉需等待一個虛擬UI幀，原關閉／不誤開行車簿斷言保留；三格位移測試改讀同幀唯讀渲染座標，避免一秒內讀到同一份存檔；誘餌標記改跟隨避開重疊後的實際繪製位置。最後整輪已重建、重跑並通過。

完整執行輸出：`docs/content/r2/check-output.txt`；已解決的中途測試紀錄：`resolved-check-attempts.txt`；總收據及雜湊：`VALIDATION.json`；逐張原尺寸連結：`SCREENSHOT_INDEX.md`。後三檔同在 `docs/content/r2/`。`receipt.json`明列每張圖是正常遊玩、邊界fixture或測試閱讀頁，真人與實體裝置皆為0，未取得新的Muse評分。

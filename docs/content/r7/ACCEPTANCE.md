# R7 唯一驗收清單與原尺寸證據

VERIFIED（本機自動與原圖讀回；真人／外部項目BLOCKED）｜審查入口只有 `review-set/`：15 張 1290×2796 原尺寸手機直式 PNG，側翼、選箱、輪班各 5 張；不縮圖、不拼接、不用說明頁代替互動。逐張來源、雜湊及同畫面即時狀態見 `receipt.json` 與 `review-set-manifest.json`。

| Muse 五件事 | 精選原尺寸圖 | 補充原尺寸圖與驗收 |
|---|---|---|
| 1．封箱對象分開 | `review-set/07-relay-69-rescue-sealed.png`、`08-relay-69-repair-sealed.png`、`10-relay-100-repair-sealed.png` | 上框圖示＋留站封存名稱，下方已帶走另一箱；69％工具箱結果明寫沒有備用維修。補充 `phone-relay-95-repair-selected.png`／`sealed.png` 驗95→100＋13。真人5秒判讀 BLOCKED。 |
| 2．逐隻出界進度 | `review-set/03-flank-partial-exit.png` | 西群2／4、群數0／2；接 `phone-flank-full-exit.png` 全數4／4、群數1／2，再接 `phone-flank-exits-persisted.png` 個體已移除，帳目仍保留。 |
| 3．敵人及轉向標示 | `review-set/01-flank-turning-1.png`、`02-flank-turning-2.png` | 連續兩格實際走路幀；四名敵人的頭身可數，小序號與腳環不壓任何角色或地標，沒有交叉長導線。`phone-flank-expired-reloaded.png` 是餌效到期後正式重載，離場不重置。 |
| 4．輪班效果前值來源 | `review-set/11-crew-preview.png`、`12-crew-applied.png`、`13-crew-settled.png` | 每張人物卡直接顯示職務、本段後疲勞、實際效果；熹的預覽寫原安14秒→熹18秒，結算依席安2→3、熹0→1、安2→0對帳，無擋擊時明寫0次。公式另可展開。 |
| 5．救援／滿血／中東分支 | `review-set/06-relay-69-rescue-selected.png`、`07-relay-69-rescue-sealed.png`、`09-relay-100-repair-selected.png`、`10-relay-100-repair-sealed.png`、`04-flank-center-active.png`、`05-flank-east-active.png` | 救援包補給−3、林叔／阿禾加入、同行+2，火力維持8，與失去欄一致；滿血工具箱18％備修確實入帳；中央與東側是真投餌、實際來敵。滿血預選的「轉存備修18％」只出現一次。 |

## 同範圍嚴重問題對照

| 問題 | 原尺寸證據 |
|---|---|
| 同物同時被封存與帶走 | 精選07／08／10，三張結果均不同箱。 |
| 救援包火力不變卻稱增援 | 精選06：得到／失去皆為兩名同行者與火力維持8，不再承諾守衛增援。 |
| 0％仍說自動補 | 精選08：沒有備用維修；`phone-relay-reserve-before.png`／`consumed.png` 實際以18→11扣用7％。 |
| 已出界但計數不動 | 精選03：西群2／4同步更新；補充全數出界才加1群。 |
| 離場標示疊左邊、遮身體地標 | 精選01／02／03：群狀態留戰報，小序號只留在場內腳邊。 |
| 單字／括號斷行 | 精選01～05提示改成不可拆短語，沒有孤立「響」；護具按鈕不拆括號，九視口檢查。 |
| 三頭像畫風不一致 | 精選11～13：安的新成人墨線水粉頭像與席安／熹並列。來源與HSV閘門見 `../../art/ASSET_MANIFEST_CONTENT_R7.json`。 |
| 擋擊與新訊號混讀 | 精選14／15：本波波次獨立，上一波結果標明擋擊1→0；`phone-watch-next-wave.png` 顯示1.5秒護窗回饋消退後的新波。 |

兩條分支永久封箱重載不可重選、三項正常九段完成、離線重開、六種職務排列、非法進度拒收及新舊存檔均以測試收據驗證，不把測試數量當作圖片評分。69／95／100車體及21同行、護具0為正常checkpoint衍生的具名邊界fixture，透過遊戲匯入操作；中／東投餌為未改動的正常守點checkpoint於實際波次重播。精選14／15與11～13來自同一正常旅程。

BLOCKED：Muse複審≥8尚待審查員；真人5秒判讀、親子試玩需測試者，手機／iPad實體測試需裝置，獨占效能需乾淨時段。內建繪圖工具未公開實際模型slug，不能把指定gpt-image-2當作實際回傳證明。上述皆未假造。

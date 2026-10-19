# R6 唯一驗收清單與原尺寸證據

VERIFIED（自動部分；真人項目BLOCKED）｜0.11.1｜以 `../CONTENT_REVIEW_R5_MUSE.md` 的五件事為準，並核對 GPT、Claude 審查。178項單元、R6 36項瀏覽器檢查、26張原圖與15張精選均已驗證；結果見 `receipt.json`、`execution.json` 及 `verification.json`。

審查只需開啟 `review-set/` 的15張1290×2796原尺寸PNG，側翼／選箱／輪班各5張。檔名01至15排序，來源與SHA-256見 `review-set-manifest.json`。側翼01–05是同一場連續遊玩；輪班11–15是同一組人的預覽、套用、本段結算與實戰擋擊。

| Muse 驗收 | 實作與原尺寸圖（本目錄下） | 驗收界線 |
|---|---|---|
| 1．四隻頭標完整不重疊 | `phone-flank-12s.png`、`phone-flank-boundary.png`。頭標有連線、10單位內縮及避讓，敵人沿邊垂直分流，沒有改物理位置或計分時機。 | 自動逐框核對四個頭標都在界內且矩形不相交；真人五秒答「西側已引離1群」仍為BLOCKED。 |
| 2．數字進度、單一下一批倒數 | `phone-flank-1s.png`、`phone-flank-6s.png`、`phone-flank-12s.png`。可直接讀到百分比、剩餘秒數、下一批方位／數量。 | 同一時間線；底部為唯一次批倒數，三鍵保留方位及「1補給」。 |
| 3．未選三鍵同底色、夜戰訊號可辨 | `phone-watch-before.png`、`phone-watch-blocked.png`。窗側／車頂文字旁有線圖輔助；實際擋擊才使用熹護窗插圖。 | 自動讀回三鍵同底色、擋擊1→0及車體不降；真人五秒判訊號仍為BLOCKED。 |
| 4．二／三章工具帳目與滿血轉存 | `phone-relay-2-69-selected.png`→`phone-relay-2-69-sealed.png`；`phone-relay-3-95-selected.png`→`phone-relay-3-95-sealed.png`；`phone-relay-3-100-selected.png`。 | 明確標記69／95／100車體邊界fixture，基於正常旅程存檔，以產品匯入功能載入。69→87即修18；95→100即修5／備修13；滿血轉存18，沒有100→100。預選不扣款，確認後結果及重載永久鎖定。 |
| 5．具名本段後疲勞 | `phone-crew-preview.png`→`phone-crew-applied.png`→`phone-crew-settled.png`。 | 三人預告逐人對上本段真結算。席安／熹工作+1，安休息−3且最低0，疲勞最高3；來源、滿3建議休息及擋擊本段期限寫在效果旁。 |

## 三份審查的未見證據與補件

| 項目 | 原尺寸圖或可追溯結果 |
|---|---|
| 真四幀走路 | 精選02／03：`phone-flank-6s.png`→`phone-flank-6s-next-frame.png`，同一可見敵人確實切換atlas frame。另有`phone-flank-walk-frame-1.png`／`-2.png`／`-3.png`離場連續圖；實際時間以telemetry為準，不以位移冒稱動畫。 |
| 到期後不拉回、重載繼續離場 | `phone-flank-12s.png`→`phone-flank-expired-reloaded.png`→`phone-flank-boundary.png`→`phone-flank-all-exited.png`，同一批實際離場。 |
| 非法離場存檔拒收 | `phone-flank-invalid-save-rejected.png`，產品匯入頁顯示格式不符；原存檔不變。 |
| 東側虛線圈圖例 | `phone-flank-east-entering.png`，底部寫「虛線圈＝未受餌影響」。 |
| 交換不改疲勞、預覽不寫檔、套用重載一致 | 11–13三圖及`receipt.json`內同一存檔／UI／即時telemetry；新增單元與瀏覽器assert。截圖本身不冒稱能證明所有儲存行為。 |
| 滿3實際疲勞與懲罰 | `phone-crew-settled.png`的人名疲勞與下一段效果來源；單元測試覆蓋0–3格及實際settle。 |
| 二／三章替代分支 | 選箱及封箱四圖，永久選擇與重載assert；正常旅程另完整完成9段，不把邊界fixture冒稱自然數值。 |

完整原尺寸補充圖留在本目錄，不塞入15張精選。原尺寸手機／平板商店新圖為 `../../store/screenshots/phone-11-content-r6.png`、`../../store/screenshots/tablet-11-content-r6.png`，尺寸1290×2796／2064×2752；未刪除舊圖。

BLOCKED：實體手機／iPad、真人／親子試玩、五秒讀圖測試、乾淨獨占效能與Muse複審≥8分，需裝置、測試者、獨占時段及審查員實際驗收。沒有自行填入評分。

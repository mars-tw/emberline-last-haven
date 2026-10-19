# R8 嚴重問題與原尺寸證據對照

本線路最後指示「只修以下嚴重問題，不要新增內容」優先於共用工單中的擴充提案。所有 VERIFIED 項目須同時有 receipt.json／verification.json；以下路徑為重現腳本的固定產物，實際執行與雜湊以該兩檔為準。

| 指定問題 | 修正及驗收 | 原尺寸手機截圖（1290×2796） |
|---|---|---|
| 1．損失欄語意矛盾、同行重複 | relayLoss 僅列不登車的人、少得的修復與備修；69／95／100兩箱均檢查「維持／仍生效／不變／同行 +2」不得進入此欄。選擇前不扣款，出發才扣且永久鎖定，重新匯入／重載不重領。 | phone-relay-69-rescue-selected.png、phone-relay-100-rescue-selected.png、phone-relay-69-repair-selected.png、phone-relay-100-repair-selected.png；精選06／09，四種封箱結果見下一列。 |
| 2．側翼序號缺號、帳目不符 | 顯示全部在場存活個體的固定 ID；標記找不到近身空位時遍歷空位，不能直接省略。西菱形／中央方形／東三角形，受餌實線、未受影響虛線。逐群驗「在場 ID 數＋已出界＝總數」，2／4時剛好兩隻仍可指出。 | phone-flank-west-partial-1.png、phone-flank-center-partial-1.png、phone-flank-east-partial-1.png；精選03（西群部分出界），04／05（中、東群四隻完整ID）；其餘部分出界見完整原圖。 |
| 3．連續幀個體序號互換 | 展示槽由出生時固定序位計算，不以隨時改變的 y 排序或存活鄰居排名重排；離場只更新該個體橫向位置。三張連續圖保留相同 ID 與同一列。 | phone-flank-west-turning-1.png～3.png、phone-flank-west-partial-1.png～3.png；精選01／02連續幀及03同場部分出界；三張相鄰轉向幀另有完整原圖。 |
| 4．救援包兩種圖示 | 預覽大圖、選箱卡、留站封存與已帶走均使用 /art/content-r5/rescue.webp；移除整備桌中看似提籃的救援包圖。背景結果「修復至」改「目前車體」，不暗示救援選擇修車。 | phone-relay-69-rescue-selected.png、phone-relay-69-rescue-sealed.png、phone-relay-69-repair-sealed.png、phone-relay-100-rescue-sealed.png、phone-relay-100-repair-sealed.png；精選06～10。 |
| 5．席安／安混淆 | 顯示名統一老席／熹／安，人物索引、疲勞、存檔身份不變；輪班、故事、夜戰及新寫入行車紀錄共用同一命名來源。 | phone-crew-preview.png、phone-crew-applied.png、phone-crew-settled.png、phone-watch-signal.png；精選11／13。 |
| 6．疲勞不變與預告矛盾 | 改「疲勞跟著人走，不因交換重置」；目前→下段結束預計放同一張卡，全部使用「格」。休息主效果列實際可回復量；套用不改疲勞，完成段落才結算且不重算。 | phone-crew-preview.png、phone-crew-applied.png、phone-crew-settled.png；精選11。 |
| 7．投餌理由與輪班預覽 | 先預覽受影響隻數、出口、1補給／12秒及留下的威脅，暫停時間確保預期與投放首幀一致；換路／取消不扣款，生效中不能重投。輪班主選取使用預覽的新職務，卡片顯示目前→新職務，六種排列保存重載。 | phone-flank-west-preview.png、phone-flank-center-preview.png、phone-flank-east-preview.png及各側first-frame.png；phone-crew-roles-012.png～210.png；精選11及01～05遊玩中畫面。 |

額外修正既有演出：滿疲勞換任工作有紅框代價與風險確認，取消不改分工；夜戰固定守夜者頭像、擋擊盾格、車體，真擋擊時沿訊號方向亮窗／車頂。訊號→撞擊→擋下三幀為 phone-watch-signal.png、phone-watch-impact.png、phone-watch-blocked.png，精選13～15；phone-crew-risk-confirm.png為精選12；回饋到期另存phone-watch-feedback-expired.png。既有插圖只稱擋擊姿勢，不宣稱新增逐幀角色動畫。備修18→11見phone-relay-reserve-18-to-11.png。

## Muse 五項建議的範圍邊界

1．個體與批次辨識：已實作固定ID、側別形狀及在場／出界對帳；沒有新增出口門美術，不能把路徑箭頭說成發光門。

2．先預覽再確認：沿用三路既有操作；三側預覽與投放首幀另有完整原圖。15張精選優先保留本線路指定的三幀追蹤與兩側部分出界，沒有把附錄中的圖冒充審查員已看。

3．可見守夜成果：既有頭像／擋擊插圖／訊號線加上方向光與盾格；滿疲勞改任時有風險確認。不宣稱三人都新增擋擊動畫，也未重新生成三張頭像。

4．選箱去重：刪除每箱的整串封箱總數，改一條選中箱結算列；修正損失欄、圖示及69／95／100結果。BLOCKED：三章新箱種屬新增內容，依本線路限制未加入；仍使用既有每章不同的具名救援乘客與原工具箱。

5．新的本段結算鏈頁：BLOCKED，本線路明確禁止新增內容，未建立新頁／新存檔帳本。既有行車簿與逐群出界帳目保留。需要另行將新增結算頁納入範圍，不能稱本輪已完成此建議。

精選01／02為同場連續走路幀、03為同場2／4出界，04／05直接呈現修正前缺號的中央四隻與東側四隻；各側三張相鄰轉向與部分出界圖仍完整保存在附錄。

精選集只有15張手機原尺寸圖，三項各5張，檔名01～15；所有精選均為直接複製，非拼圖、縮圖或後製圖。完整截圖、狀態、時鐘、尺寸與雜湊見receipt.json、review-set-manifest.json、SCREENSHOT_INDEX.md。邊界情境經正常匯入介面載入，沒有把fixture稱為正常九段旅程。

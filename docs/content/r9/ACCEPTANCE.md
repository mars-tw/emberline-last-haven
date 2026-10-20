# R9 驗收對照

VERIFIED｜五項主驗收、完整品質閘門與原圖雜湊已讀回核對，詳見 verification.json。Muse 實際複審尚未執行，沒有自填分數。

| R8 Muse 唯一主清單 | 實作與驗收 | 手機直式原尺寸截圖 |
|---|---|---|
| 1．守夜三段、方向一致 | 同一波先顯示訊號，再顯示撞擊，之後顯示已擋下。三圖雜湊各異，盾格1→0、車體88→88；窗側與車頂各使用對應高亮及姿勢，效果結束才回到下一波提示。 | [窗側訊號](phone-watch-window-signal.png)、[撞擊](phone-watch-window-impact.png)、[擋下](phone-watch-window-blocked.png)；[車頂訊號](phone-watch-roof-signal.png)、[撞擊](phone-watch-roof-impact.png)、[擋下](phone-watch-roof-blocked.png)。 |
| 2．預覽數字就在按鈕 | 三路鍵直接列影響隻數、其他存活威脅與1補給。預覽暫停，確認後ID完全相同、只扣一次；取消不扣款，生效中禁止重投。 | [西預覽](phone-flank-west-preview.png)、[西投放首幀](phone-flank-west-first-frame.png)；[中預覽](phone-flank-center-preview.png)、[中首幀](phone-flank-center-first-frame.png)；[東預覽](phone-flank-east-preview.png)、[東首幀](phone-flank-east-first-frame.png)；[雙路同場](phone-flank-dual-preview.png)。 |
| 3．序號跟隨個體 | 每個在場個體一個ID，標記固定在自身正上方，與頭部距離≤13世界單位；不再畫跨場連線。路徑相遇時先調整本體位置；四號齊全、相鄰標記互不覆蓋。 | 西連續[1](phone-flank-west-turning-1.png)／[2](phone-flank-west-turning-2.png)；中連續[1](phone-flank-center-turning-1.png)／[2](phone-flank-center-turning-2.png)；東連續[1](phone-flank-east-turning-1.png)／[2](phone-flank-east-turning-2.png)。另各有第3幀。精選第05張另以[西群2／4時預覽東群](phone-flank-west-partial-preview.png)同時呈現兩隻剩餘個體與新一批4隻的按鈕預覽。 |
| 4．工具箱大圖、救援實際搶修 | 工具箱預選同步換實物大圖。夜戰結算將一般搶修與救援多出的最多2％分開，69％案例一般搶修至95％後另加2％至97％；100％明列上限、本次+0％。 | [工具箱大圖](phone-relay-69-repair-selected.png)、[救援搶修95→97](phone-relay-night-repair-69.png)、[滿車體+0](phone-relay-night-repair-100.png)。 |
| 5．兩人互換、同局套用 | 選一次職務只交換兩人；預覽期間須先套用或取消，不能累積成未說明的三人輪調。虛線旁明寫意義。三張同局圖的章節、補給、同行、車體相同；套用只改那兩個職務，疲勞不重置；下一段結束才按預告結算一次。 | 同局[預覽](phone-crew-pair-preview.png)→[風險確認](phone-crew-risk-confirm.png)→[已套用](phone-crew-pair-applied.png)；[下段疲勞已結算](phone-crew-settled.png)。 |

本線路六項修正：序號正上方見第3項；兩箱重新平衡見下表；獨立擋下與方向一致見第1項；風險框只列「預警20→14秒／可擋0→0次」，並說明仍負責預警，見第5項紅框；預覽數量與交換語意見第2、5項。

| 兩箱／R7回歸 | 原尺寸證據與規則 |
|---|---|
| 69／95／100％兩種分支 | 每個車體值均有 `phone-relay-<車體>-rescue-selected.png`、`-rescue-sealed.png`、`-repair-selected.png`、`-repair-sealed.png`，實際預覽與入帳逐欄驗證。救援免費帶回4補給、2人與警戒協作+1；工具保留即修／備修總共18％。 |
| 兩箱情境優勢與平衡 | 卡片分別寫缺補給／準備反制、車體受損／預留備修。[試算表](relay-balance.xlsx)保留公式與可改假設；依現有4補給換最多15％修復的條件換算，差距5.6～16.7％。未將此換算當成勝率或所有局面的等價。 |
| 部分出界不偷算整群 | [西2／4](phone-flank-west-partial.png)、[中2／4](phone-flank-center-partial.png)、[東2／4](phone-flank-east-partial.png)，同時核對剩餘2隻；[西全數](phone-flank-west-full-exit.png)、[中全數](phone-flank-center-full-exit.png)、[東全數](phone-flank-east-full-exit.png)才加群。重載保留帳目。 |
| 救援包圖示及放棄後果 | 選箱、帶走、封存均用同一R5實物圖。損失欄不寫維持、仍生效、不變，不再把車體69％說成救援修復成果。 |
| 備修實際扣用 | [抵傷前18](phone-relay-reserve-before-impact.png)→[抵傷後11](phone-relay-reserve-18-to-11.png)，另有[行車簿實際扣用7％](phone-relay-reserve-receipt.png)。 |
| 人名、疲勞、排列保存 | 老席／熹／安，疲勞單位固定格；六種排列各有`phone-crew-roles-<排列>.png`與重載核對。同局確認取消不改分工，套用後再完成一段的圖列於第5項。 |
| 離線重開 | [伺服器停止後重載](phone-save-offline-reloaded.png)，WebKit實測保留完整進度。完整九段另由既有正常按鈕操作回歸驗證。 |

`review-set/`只放15張原尺寸手機PNG，沒有拼接、改尺寸或另造展示場景。精選分配側翼5、選箱4、輪班／夜戰6，完整原圖與各項兩幀／三幀證明仍保留在本層並逐項列路徑。受15張上限限制，精選不重複收入所有邊界與兩方向各三幀；不能把精選未呈現的補充證據當作審查員已看過。

BLOCKED：Muse≥8需要審查員實際看精選；實體手機／iPad與真人／親子試玩需裝置、參與者；乾淨機況效能需獨占時段。生成工具未提供模型slug，保持null，不以工具名冒充模型名。

# 燼途：最後一站

**Emberline: Last Haven · 0.11.3**

新內容 R8 修正：暮色守點先預覽再投餌，個體序號與離場帳目對應；中繼站只列真正放棄的物資與人物，救援包使用同一圖示；老席、熹、安的輪班卡直接列目前→預計職務與疲勞。完整本機證據見 `docs/CODEX_RESPONSE_CONTENT_R8.md`，15張手機原尺寸精選為 `docs/content/r8/review-set/`。

白天開卡車接走倖存者，暮色時用補給作誘餌守住中繼站，夜裡登上列車，分辨冷窗與車頂的接觸。帶著同一隊人、同一份補給，一路前往北方燈塔。

本作整合三個開源網頁遊戲：[灰燼護航](https://github.com/mars-tw/ashes-convoy)、[暴風啟示錄](https://github.com/mars-tw/storm-apocalypse)、[夜行列車：守夜協定](https://github.com/mars-tw/night-train-watch-protocol)。原作 repo 保留為歷史紀錄；程式與授權快照保存在 `vendor/`，後續更新集中於 [Emberline: Last Haven](https://github.com/mars-tw/emberline-last-haven)。這個 repo 可獨立建置，不需要相鄰來源資料夾。原始專案的精確 commit 與逐檔 SHA-256 見 [source-manifest.json](docs/evidence/source-manifest.json)。

三章、九個連續段落以同一份存檔接續，沒有三款遊戲的個別選單。保留灰燼的攀車甩尾、暴風的三落點誘餌、夜行的觀察與交接判讀；沒有把原作所有內容都搬入。移植範圍與缺件見 [整合設計](docs/MERGE_DESIGN.md) 和 [執行報告](docs/CODEX_RESPONSE_MERGE.md)。

第二輪美術加入冷灰海岸、三段循環公路、完整中繼站與夜車、熹的統一三視圖／砲手四幀、兩敵種 32 幀、實體誘餌、焦邊手記和缺口車票按鍵。12 項新生成資產，手機主要單位可見尺寸至少 40px。[R2 報告](docs/CODEX_RESPONSE_R2_ART.md)、[方向與色盤](docs/art/ART_DIRECTION.md)、[前後對照](docs/art/compare/) 與 [素材及工具證據](docs/art/ASSET_MANIFEST_R2.json) 均在 repo。保留 [R1 報告](docs/CODEX_RESPONSE_R1_ART.md) 作歷史紀錄。

## 本機執行

需要 Node.js 22.12 以上；本輪使用 Node 24.15.0。

```powershell
npm ci
npm run dev
```

正式版與完整檢查：

```powershell
npm run build
npm run preview
# 另一個終端執行；所有瀏覽器皆 headless
npm test
npm run test:e2e
npm run test:perf
npm run audit
```

測試需已安裝 Playwright Chromium 與 WebKit。缺少時可執行 `npx playwright install chromium webkit`。R1 的 `npm run test:art`／`npm run check` 另需 Python 3、Pillow、NumPy，安裝方式為 `python -m pip install -r requirements-art.txt`。預覽預設只綁本機 `127.0.0.1:4179`。`npm run check` 需預覽服務先啟動。建置後產生完整離線清單；首次連線載入並等素材與快取完成後，可以離線新開頁面續玩。不是免安裝的 iOS 原生簽章包。

## 操作與進度

- 護航：方向鍵／A、D 或左右按鈕操舵，自動射擊。等敵人攀車後，用空白鍵或「甩尾清車」；左右急甩也能觸發。基礎冷卻 5.5 秒，疲勞司機最多增加 2.25 秒。
- 守點：三批來敵時序事前公開。先點一路預覽影響隻數、出口與留下的威脅，再點同路確認花 1 補給；換路或取消不扣款。西餌慢拖西線、東餌快引東線、中央只接中央縱隊，效力12秒。同行人數增加守衛火力。補給不足仍可直接守點。
- 守夜：先看安的呼吸與冷窗，再封存判讀。每波看訊號，選關百葉或切扣具；花 2 補給。免費伏低承受會損失車體。
- 中繼站：每章守點完成後自動打開雙箱抉擇；可從結果的「中繼站：只能帶一樣」重開。救援包花 3 補給接回兩位具名同行者，火力按每滿3人計算，夜戰後搶修能力多2％（車體上限100％）；工具箱免費修車最多 18％，剩餘額度存成受損時自動使用的備用零件。選箱可比較，確認出發後才扣款、封存另一箱，不能重領。
- 輪班：首次出發與各段結果點「輪班／整備」。三位核心同行者各任開車、守夜、休息；點職務先預覽交換，再按套用才保存，疲勞不因交換重置。老席守夜多 2 秒預警，熹開車甩尾快 0.5 秒，安休息最多回復 3 格；其他人最多回復 2 格。完成本段後工作者疲勞 +1（0–3），疲勞司機每格慢 0.75 秒，守夜每格少 2 秒預警；剛休息的人排守夜可擋一次撞擊。疲勞滿格改任工作時須確認風險。
- 行車簿：全程共用暫停、音效、減少動態、匯出與匯入。切背景會暫停，回來手動繼續。車體耗盡需要搶修重試，不會憑空通關。

存檔使用 `emberline.campaign.v1` 與同名 `.backup`，每秒及重要操作保存。完整旅程可匯出 JSON 並在行車簿還原。可主動匯入三個原作的原始 JSON，一次性換算少量補給，原始檔會封存在新存檔中；不會改寫原作 storage keys。瀏覽器不能越過其他網域／App sandbox 自動讀取舊檔，舊 App 若無匯出入口需由後續原生遷移流程補上。

## 開源與素材

這是免費、非營利的開源作品，沒有廣告、IAP、追蹤、帳號或遠端資料上傳。希望任何人都能在此基礎上做出自己的遊戲。程式採 [MIT](LICENSE)；MIT 也允許後續使用者商業利用，不另加非商用限制。夜行列車圖像採 CC BY 4.0，其他素材依 [CREDITS.md](CREDITS.md) 的逐項來源與授權，不能把第三方素材一律改稱 MIT。

目前為本機修正版，商店資料尚未送出或部署。實機、真人 beta、Muse複審與Apple審核仍待補齊；本輪沿用既有美術與動作。

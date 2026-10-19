# R5 五項驗收與精選原圖

VERIFIED：本機自動驗收、原尺寸及來源雜湊已核對；第 5 項真人五秒答題仍為 BLOCKED。審查僅需開啟 `review-set/` 的 01–15 張原尺寸 1290×2796 PNG，來源與 SHA-256 見 `review-set-manifest.json`。側翼 6、選箱 4、輪班 5，三項都有操作進行中的狀態。沒有拼接、縮圖或假敵人。

| R4 唯一驗收項 | 本輪原尺寸截圖（皆在本目錄） | 確認方法 |
|---|---|---|
| 1．側翼兩張狀態牌分開 | `phone-flank-active-1s.png`、`phone-flank-active-6s.png`、`phone-flank-active-12s.png` | 同一次守點；西側左方、東側右方，倒數遞減；含 HUD 更新等待約 0.18 秒。 |
| 2．東側進場／西側走出邊界 | `phone-flank-active-12s.png`、`phone-flank-east-entering.png`、`phone-flank-boundary-crossed.png` | 同一時間線；西餌續投中，四隻東側霧白虛線腳環前進，西側走出外界後群數 0→1。世界座標、角色位置與跨界時間保留在 receipt。 |
| 3．選箱圖示與數字一致 | `phone-relay-2-selected-rescue.png`、`phone-relay-2-sealed.png`、`phone-relay-3-selected-repair.png`、`phone-relay-3-sealed.png` | 繃帶／扳手實物圖；第二章救援包預覽、同行人數、補給、火力與結果逐項核對；第三章工具箱封存並重載。 |
| 4．真效果預覽與同人擋擊 | `phone-crew-rested-before.png`、`phone-crew-rested-preview.png`、`phone-crew-rested-applied.png`、`phone-watch-xi-before.png`、`phone-watch-xi-blocked.png` | 熹剛完成休息，交換預覽顯示新預警、擋擊與安的回復值；兩人目標框都有標示。套用數字一致，再由同一位熹擋下真撞擊 1→0，車體不降。 |
| 5．重試偵察按時間 | `phone-retry-damaged-convoy.png`、`phone-retry-stranded.png`、`phone-retry-chronological.png` | 從未改值的正常起始 checkpoint 透過正式檔案匯入，額外出發、延後甩尾留下受損車體，再實際放棄投餌造成戰敗與重試。0／16／32 秒批次依序排列，後兩批舊→新值及底部條一致；直接守點說明後果。 |

BLOCKED：真人 5 秒辨識驗收、真人親子試玩、實體手機／iPad、Muse >=8 分與乾淨獨占機況效能。需第一次玩的測試者、家長／兒童、裝置、獨立審查員及獨占量測時段。自動測試可核對卡片數字、排序及操作，不能替代真人答題結果。

修改前證據 `before/` 直接自本輪起始 commit `d6c02b16cd6f89b854894cba192fe7ea8761ec23` 取出，非新版重拍。原始來源與雜湊見該處 receipt。

# 燼途：最後一站 R4 美術回覆

2026-10-18｜0.5.0｜main｜本機交付；最終驗證收據待回填。美術接線 EXECUTED，未取得新獨立>=8分。

## Muse 最新五項逐項結果

唯一清單：ART_RESCORE3_MUSE.md 第四節；已對照 ART_RESCORE2_MUSE.md。沒有用其他新功能替代未完成條件。

| 項目 | 執行與驗收狀態 | 改後原尺寸截圖 |
|---|---|---|
| 1．同一中繼站、中景密度 | EXECUTED。以圖4戰後母圖重繪待命差分，共享雙塔站門、右側鐵道、左建築、下方裝車台與兩翼沙包；新增貨物區、線纜、地面分區與亮燈。三餌站坐標不變。自審可認同地點；獨立遮字指認與「無資訊地面<=40%」可靠量測仍 BLOCKED，未假報通過。 | [手機待命](store/screenshots/phone-03-bait.png)、[手機戰後](store/screenshots/phone-04-common-progress.png)、[iPad待命](store/screenshots/tablet-03-bait.png)、[iPad戰後](store/screenshots/tablet-04-common-progress.png) |
| 2．主角定版回灌五圖 | EXECUTED。先依R3圖4臉型／棕髮生成正側背及表情設定表，再依設定表生成守點全身射擊與夜車姿態。出發、車頂、待命、守點、夜車同為橘衣短棕髮熹；夜車前景實際出場，安保留乘客身份，不靠通訊頭像補身份。390寬可見寬高>=40px、車頂/車寬<=1/3；真人64px辨識>=80% BLOCKED。 | [出發](store/screenshots/phone-01-departure.png)、[車頂](store/screenshots/phone-02-convoy.png)、[守點](store/screenshots/phone-04-common-progress.png)、[夜車](store/screenshots/phone-05-night.png)、[iPad夜車](store/screenshots/tablet-05-night.png) |
| 3．敵人與泥地分離 | EXECUTED。R3真幀作中間調、冷灰衣料及1px深輪廓後製，保留地面投影與土色系；沒有回到高飽和藍。360寬可數8隻，明度差與同姿態上限由ART_GATES_R4.json記錄。 | [360戰後](art/compare/r4-after/narrow-common-progress.png)、[手機原尺寸](store/screenshots/phone-04-common-progress.png)、[iPad原尺寸](store/screenshots/tablet-04-common-progress.png) |
| 4．護航攀車可讀性 | EXECUTED。車體視覺長度縮15%，真攀附槽映射到車側與車尾，使用抓握／蓄力／啃咬／回復四真幀，車頂有射向實際目標或待命方向的導線。兩種商店尺寸均等>=3名自然攀車者且真frame2命中時再拍。無文字玩法指認只有本線自審，無外部受試紀錄。 | [手機三攀車命中](store/screenshots/phone-02-convoy.png)、[iPad三攀車命中](store/screenshots/tablet-02-convoy.png)、[甩飛瞬間](evidence/art-r4/phone-fling.png) |
| 5．燈塔光束、瘦紙卡 | EXECUTED。不透明琥珀光束固定從燈塔指向當前階段，隨視口算實際長度；手機紙卡118→94px（-20.34%，窄／矮90px），保留>=6%字區。五圖均有光束及車票橘鈕；原尺寸與129px列表縮圖有證據。 | [出發](store/screenshots/phone-01-departure.png)、[護航](store/screenshots/phone-02-convoy.png)、[待命](store/screenshots/phone-03-bait.png)、[戰後](store/screenshots/phone-04-common-progress.png)、[夜車](store/screenshots/phone-05-night.png)、[列表縮圖](art/STORE_THUMBNAILS_R4.png) |

## 三個最大視覺改變

同一中繼站終於有待命與戰後的連續地標，貨物區與燈光補回中景。熹以同一設定表回灌三段，夜車前景有橘衣主角，護航則看得清車側／車尾的三名攀附者。UI收斂為明亮的燈塔指向光束、薄焦邊行車紙和車票橘鍵，把手機版面還給場景。

另外在橫式／矮視窗檢視發現車隊人物上緣被裁，已改短場景的車隊顯示縮放，390直式40px規則不變。手機原本已是觸控說明，保留並重驗，不把已修項目重算本輪成果。

## 新素材、模型與包體

9項新生成資產、26個runtime檔：熹身份設定表／車頂四幀、夜車四姿態、守點四射擊幀、攀車者四幀、中繼站待命、紙紋、四圖示、Logo、App提案。另有R3兩敵種8張曝光／外輪廓衍生圖，不重算新生成數量。新真幀16格，原有敵人walk／attack／hurt／death及其傷害時序保留。

實際工具 image_gen__imagegen；要求gpt-image-2，但沒有實際slug回傳，actualModelSlug=null。未使用金鑰、CLI/API備援或外部派工。共同前綴與完整prompt在[PROMPTS_R4.json](art/PROMPTS_R4.json)，並納入PROMPTS.json round4。[ASSET_MANIFEST_R4.json](art/ASSET_MANIFEST_R4.json)保存原圖、參考圖hash、alpha／遮罩／RGBA、校色及切格方法、runtime格式尺寸hash。背景WebP、透明人物PNG；平板紙紋分段平鋪；1024 App提案在docs，192／512已接入本機manifest。角色三視圖位於[character-sheets](art/character-sheets/README_R4.md)。

所有MIT／CC BY 4.0／CC0舊授權保留；新圖署名與MIT散布範圍已加CREDITS.md。新增runtime約3.87MB，沒有刪舊素材壓低數字。母版與比較證據不進遊戲下載；public總量與精確bytes以ART_GATES_R4.json為準。

## 前後對照與驗證

初審[ART_REVIEW_R4.md](art/ART_REVIEW_R4.md)、計畫[OPTIM_PLAN_R4.md](OPTIM_PLAN_R4.md)、方向[ART_DIRECTION.md](art/ART_DIRECTION.md)。改前／後各49張：320×568、360×800、390×844、1032×1376、844×390、1366×600、1920×1080，含出發／護航／待命／守點中／戰後／夜車／行車簿。原像素[五畫面對照](art/compare/R4_PHONE_PAIRS.webp)，三視口證據在docs/evidence/art-r4/。一般按鈕操作、無存檔注入，captures.json保存每張狀態與建置hash；切視口有正常經過時間，不冒稱像素確定性測試。

完整npm run check最終結果待回填。既有單元／來源／瀏覽器／離線／RWD／邊界與美術閘門保留；未刪測試或放寬斷言，增加R4資產與動作商店擷取閘門。效能為共用Windows主機背景量測，只供參考，shippingQualified=false；不冒稱實體裝置或乾淨機況出貨證明。

擷取過程的測試時鐘、持久狀態與60ms窗口修正記錄見[CAPTURE_NOTES.md](evidence/art-r4/CAPTURE_NOTES.md)。沒有透過更改傷害、減敵、注入campaign或跳過斷言解決。

## 風險與未完成

Apple 4.3風險：**高**。本機美術已有明確角色／燈塔／紙卡／車票識別，既有同帳號退件及整體產品差異仍待正式審查。本輪沒有push、部署、商店操作、對外訊息或其他服務派工。

BLOCKED：新獨立Muse>=8分、真人64px>=80%、獨立遮字同站場與無資訊地面<=40%驗收、實體iPhone／iPad／Android、IPA／AAB及乾淨機況效能。詳見[BLIND_TEST_R4.md](art/BLIND_TEST_R4.md)。上述缺件不能用自審分數替代，因此沒有宣稱五項全部驗收或已達8分。

繁中文案mode2：本輪沒有改故事、數值或玩法文案；保留原觸控說明。報告以具體場景、路徑及狀態詞整理，沒有新增未驗證承諾。原有三份未追蹤Muse複審保留原狀、不納入本輪staging。

# 燼途：送審前深度優化 R1／美術 R5

2026-10-18｜0.6.0｜main｜本機交付。本機實作與所有可執行閘門VERIFIED；新獨立9分尚未取得。

## Muse第四輪五項落地

| 要求 | 實際修改與證據 | 重拍原尺寸商店截圖 |
|---|---|---|
| 1．光束與頂欄 | 光束在字下，節點文字有深底，頁碼獨立留槽、禁止換行；擷取器檢查實際命中層與完整頁碼。 | `docs/store/screenshots/phone-01-departure.png`、`phone-02-convoy.png`、`phone-03-bait.png`、`phone-04-common-progress.png`、`phone-05-night.png`；同名tablet系列。 |
| 2．同站17:40差分 | 每個視口的三狀態用同一母圖：直式R4暖灰、橫式新同站全景，永久地標完全相同。三餌桶固定世界坐標，戰損物件後疊。守點準備／交戰／結果固定同一舞台幾何，避免footer改高造成裁切漂移；標籤留專用帶。 | `docs/store/screenshots/phone-03-bait.png`、`phone-04-common-progress.png`、`tablet-03-bait.png`、`tablet-04-common-progress.png`。另有`docs/art/compare/R5_STATION_FLICKER.webp`實際畫面交替。 |
| 3．敵人對比與比例 | 原真幀曝光＋1px冷灰邊光、地面投影；實際母圖中間區與兩敵種明度差>=0.10。車體視覺寬度加12%，攀附者統一atlas與名義70px顯示盒，保留手機40px可見下限、碰撞與0.20秒命中。 | `docs/store/screenshots/phone-02-convoy.png`、`phone-04-common-progress.png`、`tablet-02-convoy.png`、`tablet-04-common-progress.png`；360寬`docs/art/compare/r5-after/narrow-common-progress.png`。 |
| 4．車頂威脅 | 新直幅與橫幅夜車同一套鋼板／布料筆觸；凹陷抓痕頂板、斜吊燈、縫隙落塵，遮字仍有上方威脅錨點。短寬視口採較近人物構圖。 | `docs/store/screenshots/phone-05-night.png`、`tablet-05-night.png`；橫向`docs/art/compare/r5-after/landscape-night.png`。 |
| 5．熹定版與瘦紙卡 | 同一成人設定表輸出出發／守點／夜車的正側背與姿態，安縮小降對比；保留符合身份的砲手真幀。手機紙卡94→75px（-20.21%），窄／矮90→72px（-20%），文字完整。 | `docs/store/screenshots/phone-01-departure.png`、`phone-05-night.png`、`tablet-01-departure.png`、`tablet-05-night.png`；`docs/art/BLIND_64_R5.png`。 |

以上客觀接線／幾何／格式已VERIFIED；遮字指認、角色盲測仍是執行者自審，不能代替真人80%或新獨立9分。

## 新美術、風格與來源

9項新生成：直幅夜車、橫幅夜車、橫幅中繼站、熹身份與夜車四真姿態表、四物件atlas、薄焦邊紙、四資源圖示、標題Logo、App圖示提案。共33個新增runtime檔（含保留來源的衍生導出），新增public資產4,623,608 bytes。actual tool為`image_gen__imagegen`，未回傳模型slug，`actualModelSlug=null`；未宣稱特定gpt-image型號。

原始圖與alpha／mask／opaque／RGBA在`docs/art/masters/r5/`，提示詞與共同前綴在`PROMPTS_R5.json`、`PROMPTS.json` round5，hash／尺寸／格式／衍生方法在`ASSET_MANIFEST_R5.json`。透明圖保留原生alpha並清除不可見RGB；背景WebP、人物／物件RGBA PNG；App runtime作256色量化，1024提案留原色。所有MIT／CC BY 4.0／CC0舊授權保留於CREDITS，沒有拿程序方塊或emoji充數。

方向：灰燼海岸、鏽橙成人熹、燈塔光束、焦邊行車紙、缺口車票與鋼板按鍵。與使用者提供的其他六款定位及Muse審查比對，未修改其他repo。色盤、字級、材質、人物與鏡頭規則見`docs/art/ART_DIRECTION.md`。

## 玩法與手感

改前無頭實際601.54秒遊玩，未加速、未注入存檔，571.6秒抵達結局。已寫`docs/PLAYTEST_DEEP_R1.md`，修三項留存問題：準備／冷卻／逾時倒數清楚；救援與補給成長常駐可見；按住操舵不因log重建節點而中斷，餌桶可直接點選且共用消耗／冷卻。仍保留中央餌偏強、夜車提示較直接的設計限制，沒有假報留存提升。

另外修正背景暫停仍可點footer，以及結果畫面離開視窗後可能隱藏暫停的邊界。小畫面無法容納44px物件熱區時使用底部大按鈕；物件熱區不互相覆蓋。統一按下態與既有可關閉短音，保留減少動態。0.5.0完整驗證後遷移至0.6.0，未知版本及損壞資料仍拒絕，保留原始存檔。

繁中文案mode2：準備時「40秒」改「選落點後開始」，避免假倒數；逾時「0秒」改「加程N秒／撤離N秒」，說明真實退場上限；餌鍵禁用改倒數，說明何時能再投；長段報告改成救援／火力／反制／補給短摘要，完整敘事留行車簿；夜車與結局文字縮短並保留人數、補給與因果。

## 包體與完整驗證

精簡前本輪Web目錄24,503,824 bytes／162檔；最後建置打包本輪美術組與畫面沿用素材，舊圖與母版保留repo。最終未壓縮Web目錄 6.66 MB（6,663,693 bytes）／52檔，較本輪精簡前縮小72.81%。此為Web產物，沒有IPA／AAB。

VERIFIED：`npm run check` rc=0；92項Vitest（原86項保留，新增6項）、95項Chromium/WebKit正常輸入／RWD／離線、5項匯出入／quota、R1～R5美術閘門、6項深度操作／載入故障、三次首次載入、秘密掃描0命中、來源不變與diff檢查。49張改後視口畫面與10張原尺寸商店圖，七視口的中繼站三狀態canvas矩形逐項完全一致。

三玩法×兩視口×三次共18次效能量測：同步工作p95最大0.60 ms，畫面間隔p95最大16.80 ms，均<=18ms。守點／夜車以未改動的正常操作存檔走一般匯入介面還原，來源與hash在performance.json及performance-scenarios/，未直接寫localStorage或改引擎。

| 玩法／視口 | 同步工作p95中位 | 畫面間隔p95中位 |
|---|---:|---:|
| convoy／1366×600 | 0.60 ms | 16.70 ms |
| defense／1366×600 | 0.40 ms | 16.80 ms |
| train／1366×600 | 0.30 ms | 16.80 ms |
| convoy／390×844 | 0.30 ms | 16.80 ms |
| defense／390×844 | 0.40 ms | 16.70 ms |
| train／390×844 | 0.20 ms | 16.80 ms |

首次素材就緒三跑中位 187.48 ms；離線快取就緒中位 189.53 ms。完整收據：`docs/evidence/deep-r1-after/receipt.json`、`performance.json`、`browser.json`、`repository-gates.json`；最終指令全文在`docs/evidence/art-r5/check-final.txt`。

首次載入是同機localhost冷browser context量測；p95也是共享Windows主機，僅供參考，`shippingQualified=false`。不能當成實體iPhone／iPad或乾淨機況出貨證明。

前後對照：`docs/art/compare/r5-before/`、`r5-after/`各49張、`R5_PHONE_PAIRS.webp`原像素五畫面對照。商店十圖1290×2796與2064×2752，manifest逐張hash與建置hash；沒有生成假商店圖。流程修正紀錄見`docs/evidence/art-r5/CAPTURE_NOTES.md`。

## Apple 4.3與未完成

Apple 4.3風險：**高**。專屬畫面已有明確區隔，但既有同帳號退件與整體產品差異仍需正式審查；美術不能保證審查結果。

BLOCKED：新獨立9分、真人64px辨識率>=80%、外部遮字指認、實體手機／iPad與原生IPA／AAB、乾淨機況效能。未透過外部服務派工，未push、部署、碰商店或傳訊。初始四份未追蹤Muse複審檔保留原狀。本輪只做本機commit；commit識別以交付訊息為準。

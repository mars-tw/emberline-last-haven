# 來源與素材署名

本作程式：MIT，Copyright (c) 2026 Emberline: Last Haven contributors。

| 來源 | 使用內容 | 授權與署名 |
|---|---|---|
| 灰燼護航／ashes-convoy，mars-tw | `src/origins/convoy.js` 的原封不動規則片段、latch config、`vendor/ashes/` 規則與測試 | MIT，Copyright (c) 2026 mars-tw；保留 `vendor/ashes/LICENSE` |
| 暴風啟示錄，mars-tw | 三落點誘餌 `src/origins/baitLayout.ts`、來源規則與測試快照 | MIT，Copyright (c) 2026 mars-tw；保留 `vendor/storm/LICENSE` |
| 夜行列車：守夜協定 contributors | `vendor/train/src/game/` 引擎、觀察／判讀、原測試與任務表 | MIT，Copyright (c) 2026 Night Train Watch Protocol contributors；保留 `vendor/train/LICENSE` |
| 灰燼護航專案生成圖像 | `public/art/` 的公路、雪地、車輛、熹與 runner／shambler walk／attack／hurt／death | 專案原始 MIT 授權範圍，署名 mars-tw。完整原來源說明保存在 `vendor/ashes/CREDITS.md`；早期圖像精確生成模型未保存，不補造 slug |
| 夜行列車：守夜協定 contributors | `public/art/train/carriages/sleep.webp`、`a07-clips/listen.webp`、`startle.webp` | **CC BY 4.0**（https://creativecommons.org/licenses/by/4.0/），署名「夜行列車：守夜協定 contributors」。授權聲明保存在 `vendor/train/SOURCE_README.md`；整合時僅在 Canvas 依共用版面呈現與疊加色調，沒有改寫原檔 |
| Kenney Vleugels／Kenney，Top-Down Tanks／Remastered | `public/art/env/kenney_road_debris.png`，作據點障礙物 | CC0 1.0，https://kenney.nl/assets/top-down-tanks-remastered；灰燼既有裁切、縮放與 atlas 衍生，未改原始檔 |

既有 `oga_` 檔名在灰燼 R71 已改用專案生成圖像，不能把目前內容誤標成 OpenGameArt 原圖。A-07 為既有真幀圖集，manifest 的 `sourceModelIdentifier` 是 null；沒有新聲稱 gpt-image-2。北方燈塔 SVG 圖示為本輪本機手繪向量，MIT；介面與音效由本輪程式產生，音效使用 Web Audio triangle oscillator，無第三方錄音或遠端服務。字型使用裝置已安裝的 Microsoft JhengHei／PingFang TC／DFKai-SB／BiauKai／系統 monospace，不散布字型檔。

沿用的灰燼 R79 氣氛圖原來源已記錄 `gpt-image-2`；原 manifest 保存在 `vendor/ashes/start-art-manifest.json`。上述原圖與 CC BY 素材保留原檔與署名，R1 不覆寫既有來源。實際複製檔案、SHA-256 與本機來源 HEAD 見 `docs/evidence/source-manifest.json`；完整素材清單見 `docs/store/asset-manifest.json`。

## R1 專屬新美術（2026-10-16）

12 項原創生成美術：燈塔撤離封面、廢墟公路、中繼站、夜間撤離車廂、熹三視圖、A-07 四姿態、誘餌擴音機、鏽紅金屬面板、四裝備圖示 atlas、燼途 Logo、App 圖示提案、俯視救援車與拖車 sheet。署名「Emberline: Last Haven contributors / OpenAI image_gen」，以本專案 MIT 範圍散布；未使用第三方生成圖像或借用開源研究的圖像。實際工具為 `image_gen__imagegen`，工具回傳沒有模型 slug；雖要求 `gpt-image-2`，不能確認實際 slug，因此記為 null，沒有補造模型證明。

原始生成檔、opaque 檢視母版、alpha mask、清除不可見 RGB 的 RGBA 與 runtime 導出 hash 見 `docs/art/ASSET_MANIFEST.json`；全提示詞見 `docs/art/PROMPTS.json`。透明圖保留工具真 alpha，背景採 WebP，角色／道具／Logo 為 RGBA PNG。App 1024 提案放 docs，不隨遊戲快取。R1 新圖不宣稱完成攀車專用攻擊 atlas，沿用敵人與砲手的既有真幀。

開發工具：Vite（MIT）、TypeScript（Apache-2.0）、Vitest（MIT）、Playwright（Apache-2.0），精確版本由 package-lock.json 鎖定，不隨遊戲 runtime 下載。來源公開遠端未在本輪連線核對，不杜撰專案 URL；本地來源與 commit 足以定位本輪快照。

## R2 專屬新美術（2026-10-16）

12 項新生成資產：冷灰海岸出發場景、連續三段公路、海岸中繼站、冷窗夜車、熹三視圖／肖像／四幀砲手 atlas、踉蹌者 16 幀 atlas、疾行者 16 幀 atlas、八件殘骸／誘餌道具 atlas、四裝備圖示 atlas、焦邊行車紙面、燼途燈塔 Logo、App 圖示提案。衍生 35 個 runtime 檔。熹固定棕短髮、鏽橙外套與琥珀圍巾；A-07 與救援車沿用 R1，身份分開。

署名「Emberline: Last Haven contributors / OpenAI image_gen」，以本專案 MIT 範圍散布。實際工具 **image_gen__imagegen**；工具沒有提供 model slug，actualModelSlug=null，無法確認為特定 API 型號。未讀取或寫入 API key，未借用其他遊戲新素材。

提示詞與共同前綴見 `docs/art/PROMPTS.json` 的 round2 以及 `PROMPTS_R2.json`；原圖／opaque 檢視版／mask／RGBA／校色母版／runtime 雜湊見 `ASSET_MANIFEST_R2.json`。保留原生 alpha，清除不可見 RGB，切格時移除鄰格零散碎片；敵人只做保留 hue 的曝光／飽和校準，不改肢體幾何。公路循環以 144px 首尾疊合處理，背景導出 WebP；角色與道具為真正 RGBA PNG。1024px App 提案在 docs，不隨遊戲快取。所有 R1 與更早素材及其授權保留。

# R3 美術更新（2026-10-16）

本輪 10 項新生成資產由本專案使用 OpenAI `image_gen__imagegen` 製作：熹身份／砲手 atlas、安四姿態外套識別修訂、兩種敵人各 16 格 atlas、站場戰後差分、救援車、薄焦邊紙紋、資源圖示、標題字標、App 圖示提案。衍生檔與母版見 `docs/art/ASSET_MANIFEST_R3.json`，提示詞見 `PROMPTS_R3.json`。

要求模型為 gpt-image-2；工具未提供實際 slug，因此 `actualModelSlug=null`。生成原圖、原生 alpha、opaque 檢視版、遮罩、RGBA 與導出雜湊均保留。背景 WebP；角色與圖示為真 RGBA PNG。新圖依本專案 MIT 範圍散布；原有 R1／R2 及第三方來源署名與授權完整保留。未使用第三方新圖或複製研究網站素材。

## R4 美術更新（2026-10-18）

9 項新生成資產：依 R3 正臉定版的熹正／側／背／表情及車頂四幀設定表、同身份夜車四姿態、守點全身四射擊幀、攀車者四幀、同一中繼站待命差分、焦邊紙紋、四個資源圖示、燈塔字標、App 圖示提案。另將 R3 兩敵種八張真幀圖集作曝光、冷灰補色與1px外輪廓後製；此八檔不重算新生成素材。共26個 runtime 檔。

署名「Emberline: Last Haven contributors / OpenAI image_gen」，以本專案 MIT 範圍散布。實際工具 **image_gen__imagegen**；要求 gpt-image-2，但工具未回傳實際模型 slug，故 `actualModelSlug=null`。沒有使用 CLI/API 備援、金鑰或其他遊戲的新素材。

共同前綴、完整提示詞與參考角色見 `docs/art/PROMPTS_R4.json` 及 `PROMPTS.json` round4；原圖、alpha／opaque／mask／RGBA、切格與曝光方法、runtime尺寸格式及SHA-256見 `ASSET_MANIFEST_R4.json`。設定表另存 `docs/art/character-sheets/`。保留原生 alpha；清理鄰格碎片、不可見RGB及邊緣；背景與紙紋WebP，人物／圖示RGBA PNG。App 1024提案在docs，192／512接入本機網頁manifest。所有舊圖與第三方MIT／CC BY 4.0／CC0署名維持完整。

## R5 送審前深度優化（2026-10-18）

9項新生成資產：帶凹陷頂板與斜燈的直幅／橫幅兩張夜車背景、同站橫幅中繼站、成人熹身份／正側背／肖像及四夜車姿態表、四件中繼站物件、焦邊任務紙、四資源圖示、燈塔標題Logo、App圖示提案。另有保留真姿勢的R4敵人冷灰邊光／曝光導出、原砲手／射擊幀與R2出發背景重編碼；衍生不算新生成數量。

實際工具 image_gen__imagegen，工具未公開實際模型slug，actualModelSlug=null。署名「Emberline: Last Haven contributors / OpenAI image_gen」，以本專案MIT範圍散布。原圖、原生alpha、opaque檢視母版、mask、清除不可見RGB的RGBA及runtime雜湊見 docs/art/ASSET_MANIFEST_R5.json；共同前綴與完整提示詞見 PROMPTS_R5.json、PROMPTS.json round5。背景WebP，透明角色RGBA PNG，App小圖採256色RGB量化再RGBA封裝（alpha全255），1024提案留原色。所有舊素材與MIT／CC BY 4.0／CC0授權保留。

## 新內容第一輪（2026-10-18）

整備桌插圖 1 張，實際工具 `image_gen__imagegen`，未公開模型 slug（`actualModelSlug=null`）。署名 Emberline: Last Haven contributors / OpenAI image_gen，以本專案 MIT 範圍散布。原圖 `docs/art/masters/content-r1/relay-table.png`，執行圖 `public/art/content-r1/relay-table.webp`；原始提示詞、R5 共用風格前綴與尺寸／SHA-256 見 `docs/art/PROMPTS_CONTENT_R1.json`、`docs/art/ASSET_MANIFEST_CONTENT_R1.json`。只作 Lanczos 縮圖與 WebP 編碼。所有既有授權與署名保留。
# 新內容第二輪（0.8.0）

冷庫與燈塔補給站場景由 `image_gen__imagegen` 生成，沿用既有墨線水粉提示詞前綴；工具未回傳模型 slug。PNG 原圖與 WebP 執行素材的尺寸、雜湊及完整提示詞保留於 `docs/art/ASSET_MANIFEST_CONTENT_R2.json`、`docs/art/PROMPTS_CONTENT_R2.json`。作為本專案美術隨 MIT 專案提供，不改動既有來源署名與授權。

# 新內容第三輪（0.9.0）

席安輪班肖像：本專案原創生成美術，工具 `image_gen__imagegen`，未回傳模型 slug，MIT。原圖與縮圖雜湊、尺寸及完整提示詞見 `docs/art/ASSET_MANIFEST_CONTENT_R3.json` 與 `PROMPTS_CONTENT_R3.json`。熹、安及整備桌沿用既有署名。動態側別線與疲勞格為遊戲資訊，沒有計為生成美術。

## 新內容第五輪（0.11.0）

救援包與工具箱實物插圖：工具 `image_gen__imagegen` 實際生成一張雙物件圖集，裁切為兩個執行圖示，未回傳模型 slug，MIT。完整提示詞、原圖與 lossless WebP 雜湊見 `docs/art/PROMPTS_CONTENT_R5.json`、`ASSET_MANIFEST_CONTENT_R5.json`。參考 Wesnoth 官方繪畫教學的色盤與材質方法，未複製其圖像。其餘素材與署名保留。

## 新內容第六輪（0.11.1）

熹護窗擋擊插圖：OpenAI image_gen__imagegen，依本作既有角色與墨線水粉前綴生成一張，保留alpha並轉lossless WebP。模型slug未公開。原圖、提示詞、雜湊見docs/art/ASSET_MANIFEST_CONTENT_R6.json。專案貢獻者以MIT授權整合；資訊頭標、進度與訊號小圖為程式繪製介面，未冒充生成美術。

Content R7: An ink-and-gouache crew portrait generated with OpenAI image_gen__imagegen (two calls, one integrated portrait). Actual model slug not exposed. Source, full prompts and hashes: docs/art/ASSET_MANIFEST_CONTENT_R7.json and PROMPT_CONTENT_R7_FULL.txt. Project-owned generated artwork under MIT.

Content R9: one unified three-person portrait atlas and one Xi roof-bracing cutout, created with image_gen__imagegen (four calls including two retained tonal-correction drafts; four integrated WebP images). Actual model slug was not exposed. MIT project artwork. Sources, full prompts, actual HSV measurements and hashes: docs/art/ASSET_MANIFEST_CONTENT_R9.json, ART_GATES_CONTENT_R9.json and PROMPT_CONTENT_R9_FULL.txt. Window bracing and enemy motion continue to use the credited earlier atlases; two bracing stills are not claimed as a newly generated animation.

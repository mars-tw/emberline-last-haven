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

沿用的灰燼 R79 氣氛圖原來源已記錄 `gpt-image-2`，本輪沒有新產圖。原 manifest 保存在 `vendor/ashes/start-art-manifest.json`。新圖服務送出被本次工作單禁止，因此新守點原畫、攀車專用圖集與新角色三視圖列缺件，不以其他來源冒用。實際複製檔案、SHA-256 與本機來源 HEAD 見 `docs/evidence/source-manifest.json`；素材清單見 `docs/store/asset-manifest.json`。

開發工具：Vite（MIT）、TypeScript（Apache-2.0）、Vitest（MIT）、Playwright（Apache-2.0），精確版本由 package-lock.json 鎖定，不隨遊戲 runtime 下載。來源公開遠端未在本輪連線核對，不杜撰專案 URL；本地來源與 commit 足以定位本輪快照。

# R5 實物圖示研究與應用

2026-10-19。參考開源 Wesnoth 的官方 [Choosing your palette](https://wiki.wesnoth.org/Choosing_your_palette) 與 [Portrait Tutorial](https://wiki.wesnoth.org/Portrait_Tutorial)：沿用作品既有色盤，以材質的多階明暗與冷暖陰影區分物件；墨線與繪畫陰影保留外形重量。沒有複製第三方圖像，也沒有把本作改成像素風。

本作應用：同一張生成圖分出繃帶救援包、扳手工具箱；帆布與白繃帶對應軟質救援，鋼箱與開口扳手對應硬質修理。固定墨線水粉、灰藍／鏽橙／琥珀色盤、左上冷光與暖邊光。卡片與封箱結果使用同一實物圖，在較小視口仍保留明確剪影；沒有方塊、emoji 或扁平貼紙。

工具為 `image_gen__imagegen`；回傳未提供模型 slug，manifest 以 null 明記，未假稱已驗證 gpt-image-2。原圖與雜湊、半圖裁切及 lossless WebP 尺寸見 `ASSET_MANIFEST_CONTENT_R5.json`。

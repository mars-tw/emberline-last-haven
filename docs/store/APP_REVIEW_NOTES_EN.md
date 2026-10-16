# Review notes draft｜PREPARED

These notes describe local web version 0.1.0. No new signed iOS binary has been produced or submitted. Replace build-specific information only after actual device verification. The developer must supply ownership, tester feedback and final privacy declarations; placeholders below are not assertions.

## Product and review route

**English:** Emberline: Last Haven combines Ashes Convoy, Storm Apocalypse and Night Train: Watch Protocol into one evacuation campaign. It has three chapters and nine sequential segments. There is one campaign entry, one spendable supply resource and one durable campaign save. Survivors rescued during truck escort increase outpost defense power and become train passengers. Outpost supplies pay for night counters; night damage and repairs carry into the next chapter. The previous games are not separate selectable apps inside this build.

**中文：** 本作把灰燼、暴風與夜行列車整合為三章九段的撤離主線，共用入口、補給與進度。救援人員影響守點與列車，守點補給支付夜間反制，夜間損傷延續到翌日；沒有三個原作選單。

**English:** On a fresh install, tap **「接下北上任務」**. Steer using the left/right controls. Let enemies attach, then tap **「甩尾清車」** to fling them off. Escort normally reaches the outpost after 48 seconds if at least two enemies were flung; a slower 78-second arrival has reduced rescue results. Vehicle loss requires a repair retry. At the result, **「整備護具 · 4 補給」** upgrades the same equipment across modes. Tap **「繼續：暮色守點」**, choose a bait position and defend. At the next result, continue to the train. Observe **「觀察安的呼吸」** and **「觀察冷窗」**, read the evidence, then seal a window or roof prediction. Use **「關百葉」** for glass knocks and **「切扣具」** for roof dragging. There are three contacts. The free brace option loses hull. These are normal features available to every player, not reviewer-only shortcuts.

**中文：** 新安裝按北上任務，左右操舵、讓敵人攀車後甩尾。正常完成護航後可整備共用護具，再接守點與列車。列車先取得兩份觀察、封存判讀，再按玻璃敲擊／車頂拖曳選反制；免費承受會損失車體。所有功能對每位玩家相同。

**English:** Open **「行車簿 / 暫停」** for pause, shared settings, export and optional legacy JSON import. Reopening an active journey displays **「繼續旅程」** before time resumes. No login, payment, advertising or user-data upload is implemented. Offline play requires the first complete asset cache. These statements have been checked in headless web browsers; physical iPhone/iPad and the final native wrapper still require verification.

**中文：** 行車簿提供統一暫停、設定、匯出與舊 JSON 匯入。重開需手動繼續。沒有登入、付費、廣告或資料上傳。首次完成快取後可離線。本輪證據限無頭網頁，不能當成最終原生實機證據。

## Responses to the previous nine questions

1. **Purpose:** Carry one group of survivors to a northern lighthouse through continuous vehicle escort, bait defense and signal-based train watch. This is a gameplay description, not a claim that every component is unprecedented. **中：** 目標是把同一隊人送到燈塔，透過跨段落後果串接三種操作。
2. **Audience:** Players interested in resource survival, rescue and suspense. This is not a Kids Category traffic-learning title. Final age-rating answers remain to be completed. **中：** 以生存救援與懸疑玩家為主，正式分級待填。
3. **Need addressed:** A connected evacuation journey in which rescued people and supplies have visible effects in the next kind of encounter. No global uniqueness or unmet-market claim is made. **中：** 具體體驗是救援、補給與下一段危機的連動，不宣稱全球唯一。
4. **Beta feedback:** **BLOCKED — real TestFlight participants, feedback, dates and resulting improvements must be supplied by the owner. Automated Chromium/WebKit tests are not human beta feedback.** **中：** 真人 beta 尚缺，不可把自動化當受測者回饋。
5. **Account lineup:** This is one independent campaign consolidated from three prior games. A six-product comparison is provided in DIFFERENTIATION.md. Other games' current binaries have not been audited here. **中：** 已附整合後六作比較，未假稱驗證其最新版。
6. **Consolidation:** The overlapping survival games have been combined in code, UI, save and economy. Disposition of the old store listings remains the account owner's decision. **中：** 已實作整合，舊紀錄如何處理仍須帳號擁有者決定。
7. **Shared first-party code/assets:** Exact convoy rules and art from Ashes; bait layout and rule fixtures from Storm; observation/handover engine, A-07 animation and carriage art from Night Train. Source commits, hashes and licenses are retained. There is no copied native wrapper in this repo; future packaging must disclose any shared custom native code separately. **中：** 明列來源，不把自製共用橋接冒稱標準框架。
8. **Third parties:** Vite/TypeScript build tools, Playwright/Vitest tests, device system fonts and Kenney CC0 debris art; Night Train images require CC BY 4.0 attribution. No advertising/analytics SDK is present in this web repo. The final native dependency inventory is still pending. **中：** 列出工具與圖像授權，原生 SDK 清單待包裝後重查。
9. **Content provider / client relationship:** **BLOCKED — the submitting legal entity, content ownership and any client/partner relationship must be truthfully confirmed by the account owner. MIT reuse is not proof of the submitter's identity or an answer to 4.2.6.** **中：** 送審主體及關係證明仍缺，不能由 MIT 授權代替。

No store action is authorized or performed by this work. Consolidation does not itself establish acceptance under Guideline 4.3 or 4.2.6.

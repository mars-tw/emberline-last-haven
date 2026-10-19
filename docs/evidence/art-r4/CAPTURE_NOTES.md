# R4 擷取方法修正紀錄

EXECUTED：首次改後擷取在 clock.pauseAt(new Date()) 得到「Cannot fast-forward to the past」；改用固定 install 時刻及較晚一分鐘的 pauseAt。這只固定無頭測試時鐘，不改遊戲進度。

EXECUTED：首次商店動作驗證從 localStorage 每秒快照判斷60ms啃咬窗口，得到 assert.ok(i<50)。改用既有 emberlineTelemetry 的唯讀 actors.frame 等待真命中幀；保留三名真攀附者、左右及車尾槽、frame===2全部斷言，沒有注入state或放寬條件。

EXECUTED：新生成四格射擊圖的鄰格槍火碎片在檢視時被發現；以alpha連通區、主體鄰域與透明邊緣清理移除遠離主體的鄰格碎片。不是替換為程序化人物或用整圖晃動補幀；實際四個姿態與alpha差另有閘門。

VERIFIED 狀態只以最終check-r4.txt、ART_GATES_R4.json及store-captures.json為準。以上初次失敗未當作通過，也未回溯改寫既有測試斷言。

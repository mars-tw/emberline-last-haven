const CONVOY_LATCH = {
  enemyIds: ["shambler", "runner"],
  // 攀附槽：side=-1 左側、1 右側；anchor=vehicle 車身、trailer 熹的拖車。
  slots: [
    { side: -1, anchor: "vehicle", dx: 16, dy: -2 },
    { side: 1, anchor: "vehicle", dx: 16, dy: -2 },
    { side: -1, anchor: "trailer", dx: 14, dy: 0 },
    { side: 1, anchor: "trailer", dx: 14, dy: 0 }
  ],
  trailerOffsetY: 42,
  biteInterval: 0.85,
  // 沒甩掉的屍體撐這麼久會自己被路面顛下車（新手保底，不給甩飛獎勵）。
  maxLatchSeconds: 8,
  biteTiming: { anticipation: 0.2, active: 0.06, recovery: 0.28 },
  biteDamage: 7,
  // 攀附啃咬穿透平板護甲的比例：重裝車也會掉血，但仍比裸車耐咬。
  armorPierce: 0.8,
  slowPerLatched: 0.08,
  shake: { tau: 0.55, minTravel: 15, cooldown: 0.3 },
  fling: { speed: 230, lift: -40, ttl: 0.42, bowlingRadius: 11, bowlingDamage: 28, knockback: 9 },
  multiFling: { minCount: 2, partsPerExtra: 1, hitStopSeconds: 0.12, hitStopScale: 0.25 },
  drift: { cooldown: 5.5, dashDistance: 36, ramRadius: 30, ramDamage: 26, knockback: 12 },
  // 路邊伏擊：讓開局 60 秒內必定遇到攀車屍並學會甩尾；之後每波中段一次，數量隨波次成長。
  ambushes: [
    { wave: 1, at: 11, count: 2, enemyId: "runner", title: "路邊竄出", body: "奔屍撲向車隊" },
    { wave: 1, at: 23, count: 4, enemyId: "runner", title: "屍群包抄", body: "兩側同時撲車" },
    { wave: 2, at: 12, count: 4, enemyId: "shambler", title: "廢車堆裡有東西", body: "遊蕩屍爬向拖車" },
    { wave: 2, at: 24, count: 5, enemyId: "runner", title: "屍群包抄", body: "甩尾把牠們撞回去" }
  ],
  lateAmbush: { fromWave: 3, at: 15, baseCount: 3, perWave: 0.5, maxCount: 7, enemyId: "runner", title: "屍群包抄", body: "兩側同時撲車" },
  // 伏擊屍從路邊廢車竄出：生在車頭斜前方、以撲擊速度橫衝過來，約 1 秒內貼車。
  ambushSpawnAheadY: 34,
  ambushLungeSpeed: 120
};
export default {CONVOY_LATCH};

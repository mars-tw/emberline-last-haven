// MIT: mars-tw, ashes-convoy R86. Exact subset; see source-manifest.json.
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function finiteNumber(value, fallback, options) {
  const opts = options || {};
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  const min = Number.isFinite(opts.min) ? opts.min : -Infinity;
  const max = Number.isFinite(opts.max) ? opts.max : Infinity;
  const cleaned = clamp(number, min, max);
  return opts.integer ? Math.floor(cleaned) : cleaned;
}

function latchConfig(config) {
  return (config && config.CONVOY_LATCH) || null;
}

function isLatchableEnemy(enemy, config) {
  const cfg = latchConfig(config);
  if (!cfg || !enemy || enemy.boss || enemy.dead || enemy.latched || enemy.flung || enemy.noLatch) return false;
  return Array.isArray(cfg.enemyIds) && cfg.enemyIds.indexOf(enemy.enemyId) >= 0;
}

// 回傳第一個空的攀附槽索引；滿了回 -1（滿槽時沿用舊的接觸自爆行為）。
function pickLatchSlot(occupiedSlots, config) {
  const cfg = latchConfig(config);
  if (!cfg || !Array.isArray(cfg.slots)) return -1;
  const taken = new Set((occupiedSlots || []).filter((slot) => Number.isInteger(slot)));
  for (let i = 0; i < cfg.slots.length; i += 1) {
    if (!taken.has(i)) return i;
  }
  return -1;
}

// 攀附啃咬：只承受部分平板護甲，最少 1 點。
function resolveLatchBiteDamage(rawDamage, armor, damageTakenMul, config) {
  const cfg = latchConfig(config) || {};
  const raw = finiteNumber(rawDamage, 0, { min: 0 });
  const pierce = finiteNumber(cfg.armorPierce, 0, { min: 0, max: 1 });
  const effectiveArmor = finiteNumber(armor, 0, { min: 0 }) * (1 - pierce);
  const mul = finiteNumber(damageTakenMul, 1, { min: 0.45, max: 1.5 });
  return Math.max(1, Math.round(raw * mul - effectiveArmor));
}

// 甩動偵測：左右位移各自以指數衰減累積；同一時間窗內左右都超過門檻才算「甩」。
// 只往單一方向開過去不會觸發，必須真的左右急甩。
function updateShakeTracker(tracker, dx, dt, config) {
  const cfg = (latchConfig(config) || {}).shake || {};
  const tau = finiteNumber(cfg.tau, 0.55, { min: 0.05, max: 5 });
  const minTravel = finiteNumber(cfg.minTravel, 15, { min: 1 });
  const cooldown = finiteNumber(cfg.cooldown, 0.3, { min: 0 });
  const prev = tracker && typeof tracker === "object" ? tracker : {};
  const step = finiteNumber(dt, 0, { min: 0, max: 1 });
  const decay = Math.exp(-step / tau);
  const move = finiteNumber(dx, 0);
  const next = {
    left: finiteNumber(prev.left, 0, { min: 0 }) * decay + (move < 0 ? -move : 0),
    right: finiteNumber(prev.right, 0, { min: 0 }) * decay + (move > 0 ? move : 0),
    cooldownLeft: Math.max(0, finiteNumber(prev.cooldownLeft, 0) - step)
  };
  const triggered = next.cooldownLeft <= 0 && next.left >= minTravel && next.right >= minTravel;
  if (triggered) {
    next.left = 0;
    next.right = 0;
    next.cooldownLeft = cooldown;
  }
  return { tracker: next, triggered };
}

// 一次甩飛多隻的額外零件：2 隻起每多 1 隻 +partsPerExtra。
function resolveMultiFlingParts(count, config) {
  const cfg = (latchConfig(config) || {}).multiFling || {};
  const n = finiteNumber(count, 0, { min: 0, integer: true });
  const minCount = finiteNumber(cfg.minCount, 2, { min: 1, integer: true });
  if (n < minCount) return 0;
  return (n - minCount + 1) * finiteNumber(cfg.partsPerExtra, 1, { min: 0, integer: true });
}

// 該波的路邊伏擊排程（依觸發秒數排序）。
function ambushesForWave(wave, config) {
  const cfg = latchConfig(config);
  const w = finiteNumber(wave, 1, { min: 1, integer: true });
  if (!cfg) return [];
  const fixed = (cfg.ambushes || []).filter((item) => item && item.wave === w).map((item) => Object.assign({}, item));
  const late = cfg.lateAmbush;
  if (!fixed.length && late && w >= late.fromWave) {
    const count = Math.min(
      finiteNumber(late.maxCount, 7, { min: 1, integer: true }),
      Math.floor(finiteNumber(late.baseCount, 3, { min: 1 }) + (w - late.fromWave) * finiteNumber(late.perWave, 0.5, { min: 0 }))
    );
    fixed.push({ wave: w, at: late.at, count, enemyId: late.enemyId, title: late.title, body: late.body });
  }
  return fixed.sort((a, b) => a.at - b.at);
}

function driftReady(time, readyAt) {
  return finiteNumber(time, 0) >= finiteNumber(readyAt, 0);
}


export {isLatchableEnemy,pickLatchSlot,resolveLatchBiteDamage,updateShakeTracker,resolveMultiFlingParts,driftReady};

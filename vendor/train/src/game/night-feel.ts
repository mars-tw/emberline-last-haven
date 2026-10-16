// R8「好玩」回饋層：今晚預告、守夜評等、帳本人話。全部是純函式，只讀 RunState。
import {
  DAY4_BRANCH_DEFINITIONS,
  STORY_ROUTE_RUNTIME_POLICIES,
  THREATS,
} from "./content";
import { createRng } from "./rng";
import type { LedgerEntry, RunState, ThreatDefinition } from "./types";

export type NightGrade = "S" | "A" | "B" | "C" | "D";

export interface TonightPreview {
  threatId: string;
  name: string;
  anchorLabel: string;
  counterHint: string;
}

export interface NightReport {
  grade: NightGrade;
  score: number;
  verdict: string;
  hullLoss: number;
  healthLoss: number;
  incidents: number;
  countered: number;
}

const ANCHOR_LABELS: Record<ThreatDefinition["anchor"], string> = {
  "left-window": "左側窗戶",
  "right-window": "右側窗戶",
  door: "車廂門",
  roof: "車頂",
};

const COUNTER_NAMES: Record<string, string> = {
  "close-shutter": "關閉百葉",
  "shock-window": "窗框電擊",
  "emergency-boost": "緊急加速",
  "roof-release": "切離攀附扣具",
  decoy: "誘餌廣播",
  "brace-impact": "承受撞擊",
  "drag-cutter": "割除藤蔓",
  "match-echo": "比對回聲",
  "trace-leaves": "循落葉找根源",
  "trace-meter": "讀取根部電表",
  "lurker-inspection": "巡查潛伏者",
  "manual-seal": "手動封艙",
  "thermal-routing": "熱力分流",
  "manual-scrape": "手動刮冰",
  "cycle-routing": "循環分流",
  "manual-drain": "手動排放",
};

const COUNTER_HINTS: Record<string, string> = {
  T002: "留電反制：關百葉 8、電擊 12。",
  T003: "留燃料 4 加速，或零件 1 切扣具。",
  T004: "顧好種植槽，備好割具。",
  T005: "記住訊號的顏色、形狀與節拍。",
  T006: "看落葉與電表找根源。",
  T008: "先判斷牠躲哪一區再巡查。",
  T009: "替熱力分流留電。",
  T013: "替循環分流留電，備好排放。",
};

/**
 * 與 RunService.createNightContact 相同的威脅選擇規則（只回傳 id）。
 * totalWaves 在選路前未知；只有白霜線第 4 夜依賴它，那一夜回傳 null。
 */
export function nightThreatIdFor(
  run: RunState,
  wave: number,
  totalWaves: number | null,
): string | null {
  const greenFinale =
    run.routeId === "R03" &&
    run.day === 7 &&
    run.story.greenTide?.finaleStage === "contact";
  if (greenFinale) return wave === 1 ? "T013" : "T008";
  const frostFinale =
    run.routeId === "R02" &&
    run.day === 7 &&
    run.story.whiteFrost?.finaleStage === "blizzard";
  if (frostFinale) return "T009";
  if (run.routeId === "R02" && run.day === 4) {
    if (totalWaves === null) return null;
    if (wave === totalWaves) return "T009";
  }
  if (
    run.routeId === "R01" &&
    run.day === 7 &&
    wave === 3 &&
    run.story.flags.day4Route
  ) {
    return DAY4_BRANCH_DEFINITIONS[run.story.flags.day4Route].day7WaveThree
      .threatId;
  }
  const standardIds: readonly string[] =
    STORY_ROUTE_RUNTIME_POLICIES[run.routeId].standardThreatIds;
  const standard = THREATS.filter((threat) => standardIds.includes(threat.id));
  if (!standard.length) return null;
  const offset = Math.floor(
    createRng(run.seed, "threat-order")() * standard.length,
  );
  return (
    standard[(offset + run.day + wave - 2) % standard.length] ?? standard[0]!
  ).id;
}

/** 整備階段可安全揭露的「今晚第一個接觸」。 */
export function previewTonightThreat(run: RunState): TonightPreview | null {
  if (run.ended || run.phase === "night") return null;
  const threatId = nightThreatIdFor(run, 1, null);
  const threat = THREATS.find((item) => item.id === threatId);
  if (!threat) return null;
  return {
    threatId: threat.id,
    name: threat.name,
    anchorLabel: ANCHOR_LABELS[threat.anchor],
    counterHint: COUNTER_HINTS[threat.id] ?? "觀察線索，再選擇反制。",
  };
}

/**
 * 黎明時預告明晚的第一個接觸。終局夜（第 7 夜）的威脅受當天故事階段影響，
 * 先不預告，避免顯示與實際不同的內容。
 */
export function previewNextNightThreat(run: RunState): TonightPreview | null {
  if (run.ended || run.day + 1 >= 7) return null;
  const threatId = nightThreatIdFor({ ...run, day: run.day + 1 }, 1, null);
  const threat = THREATS.find((item) => item.id === threatId);
  if (!threat) return null;
  return {
    threatId: threat.id,
    name: threat.name,
    anchorLabel: ANCHOR_LABELS[threat.anchor],
    counterHint: COUNTER_HINTS[threat.id] ?? "觀察線索，再選擇反制。",
  };
}

function isNightSource(source: string): boolean {
  return source.startsWith("threat.") || source.startsWith("counter.");
}

const INCIDENT_PATTERN = /\.(breach|timeout|second-miss|repeated-miss)(\.|$)/;

/** 取得最近一夜（beginNight 之後、黎明結算之前）的帳本。 */
export function lastNightEntries(run: RunState): LedgerEntry[] {
  const start = run.nightStartLedgerIndex;
  if (typeof start !== "number" || start < 0 || start > run.ledger.length)
    return [];
  const entries = run.ledger.slice(start);
  const dawn = entries.findIndex((entry) => entry.source.startsWith("aftermath."));
  return (dawn >= 0 ? entries.slice(0, dawn) : entries).filter((entry) =>
    isNightSource(entry.source),
  );
}

export function gradeNightEntries(entries: readonly LedgerEntry[]): NightReport {
  let hullLoss = 0;
  let healthLoss = 0;
  let incidents = 0;
  let countered = 0;
  let previousSource = "";
  for (const entry of entries) {
    if (entry.key === "hull" && entry.delta < 0) hullLoss -= entry.delta;
    if (entry.key === "health" && entry.delta < 0) healthLoss -= entry.delta;
    // 同一事故會連寫多筆（車體／壓力／睡眠），連續同來源只算一次。
    if (entry.source !== previousSource) {
      if (INCIDENT_PATTERN.test(entry.source)) incidents += 1;
      else if (entry.source.startsWith("counter.")) countered += 1;
    }
    previousSource = entry.source;
  }
  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(100 - hullLoss - healthLoss * 1.5 - incidents * 12),
    ),
  );
  const grade: NightGrade =
    score >= 95 && incidents === 0
      ? "S"
      : score >= 80
        ? "A"
        : score >= 60
          ? "B"
          : score >= 40
            ? "C"
            : "D";
  const verdict = {
    S: "完美守夜：沒有任何東西碰到她。",
    A: "幾乎無傷，A-07 睡得很沉。",
    B: "撐過來了，但車廂留下了痕跡。",
    C: "差點失守，明晚要更早準備。",
    D: "列車還在走，可是她聽見了一切。",
  }[grade];
  return { grade, score, verdict, hullLoss, healthLoss, incidents, countered };
}

export function gradeLastNight(run: RunState): NightReport | null {
  if (typeof run.nightStartLedgerIndex !== "number") return null;
  return gradeNightEntries(lastNightEntries(run));
}

export const GRADE_ORDER: readonly NightGrade[] = ["D", "C", "B", "A", "S"];

export function betterGrade(
  left: NightGrade | undefined,
  right: NightGrade,
): NightGrade {
  if (!left) return right;
  return GRADE_ORDER.indexOf(right) > GRADE_ORDER.indexOf(left) ? right : left;
}

const SOURCE_PREFIX_LABELS: Array<[RegExp, string]> = [
  [/^aftermath\.ration\./, "黎明配餐"],
  [/^aftermath\.meal/, "晚餐"],
  [/^aftermath\.water/, "飲水"],
  [/^aftermath\.night-complete/, "平安抵達黎明"],
  [/^aftermath\.shortage/, "物資短缺"],
  [/^aftermath\./, "黎明結算"],
  [/^night\.power-grid/, "守夜配電"],
  [/^night\.heating/, "守夜暖氣"],
  [/^night\./, "守夜"],
  [/^prep\.comfort/, "安撫 A-07"],
  [/^prep\.medicine/, "使用藥品"],
  [/^prep\.repair/, "整修車體"],
  [/^prep\./, "整備"],
  [/^kitchen\.hot-meal/, "煮熱食"],
  [/^kitchen\./, "廚房"],
  [/^workshop\.scrap/, "工坊回收零件"],
  [/^workshop\./, "工坊"],
  [/^crop\.|^greenhouse\./, "溫室"],
  [/^route\.emergency/, "緊急改道"],
  [/^route\./, "路線"],
  [/^story\./, "故事選擇"],
  [/^event\./, "途中事件"],
  [/^module\.|^facility\.|^build\./, "設施"],
  [/^expedition\./, "停站探索"],
  [/^tech\./, "協定研究"],
];

const INCIDENT_LABELS: Record<string, string> = {
  breach: "造成破口",
  timeout: "沒來得及反制",
  "second-miss": "第二次誤判",
  "repeated-miss": "反覆誤判",
  "manual-seal": "手動封艙",
  "manual-scrape": "手動刮冰",
};

/** 把帳本來源代碼（如 `counter.emergency-boost`）轉成玩家看得懂的短句。 */
export function humanizeLedgerSource(source: string): string {
  const counter = /^counter\.([a-z-]+)/.exec(source);
  if (counter) return `反制・${COUNTER_NAMES[counter[1]!] ?? "緊急操作"}`;
  const threat = /^threat\.(T\d+)\.([a-z-]+)/.exec(source);
  if (threat) {
    const name = THREATS.find((item) => item.id === threat[1])?.name ?? "夜間威脅";
    return `${name}・${INCIDENT_LABELS[threat[2]!] ?? "接觸"}`;
  }
  for (const [pattern, label] of SOURCE_PREFIX_LABELS)
    if (pattern.test(source)) return label;
  return "列車紀錄";
}

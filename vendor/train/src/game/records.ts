// R8 個人紀錄：只放「再玩一局」用的成績，獨立於 v6 存檔 envelope。
// 讀寫失敗（私密模式、配額）一律安靜退回預設值，不影響遊戲流程。
import { betterGrade, type NightGrade } from "./night-feel";
import type { StoryRouteId } from "./types";

export const RECORDS_KEY = "ntwp.v2.records";

export interface PlayerRecords {
  version: 1;
  bestGrade?: NightGrade;
  farthestNight: number;
  nightsSurvived: number;
  journeysCompleted: number;
  routesCompleted: Partial<Record<StoryRouteId, number>>;
  /** 已計入的 `${runId}:${day}`／`${runId}:end`，避免重新整理後重複計分（保留最近 40 筆）。 */
  counted: string[];
}

export interface RecordUpdate {
  records: PlayerRecords;
  newBestGrade: boolean;
  newFarthest: boolean;
}

export function createRecords(): PlayerRecords {
  return {
    version: 1,
    farthestNight: 0,
    nightsSurvived: 0,
    journeysCompleted: 0,
    routesCompleted: {},
    counted: [],
  };
}

const GRADES: readonly NightGrade[] = ["S", "A", "B", "C", "D"];

function count(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 0;
}

export function parseRecords(raw: string | null): PlayerRecords {
  if (!raw) return createRecords();
  try {
    const value = JSON.parse(raw) as Partial<PlayerRecords>;
    if (!value || value.version !== 1) return createRecords();
    const routes: PlayerRecords["routesCompleted"] = {};
    for (const routeId of ["R01", "R02", "R03"] as const) {
      const amount = count(value.routesCompleted?.[routeId]);
      if (amount) routes[routeId] = amount;
    }
    return {
      version: 1,
      bestGrade: GRADES.includes(value.bestGrade as NightGrade)
        ? (value.bestGrade as NightGrade)
        : undefined,
      farthestNight: Math.min(7, count(value.farthestNight)),
      nightsSurvived: count(value.nightsSurvived),
      journeysCompleted: count(value.journeysCompleted),
      routesCompleted: routes,
      counted: Array.isArray(value.counted)
        ? value.counted.filter((item): item is string => typeof item === "string").slice(-40)
        : [],
    };
  } catch {
    return createRecords();
  }
}

export function recordNight(
  records: PlayerRecords,
  runId: string,
  day: number,
  grade: NightGrade | null,
): RecordUpdate {
  const key = `${runId}:${day}`;
  if (records.counted.includes(key))
    return { records, newBestGrade: false, newFarthest: false };
  const bestGrade = grade ? betterGrade(records.bestGrade, grade) : records.bestGrade;
  const next: PlayerRecords = {
    ...records,
    bestGrade,
    farthestNight: Math.max(records.farthestNight, day),
    nightsSurvived: records.nightsSurvived + 1,
    counted: [...records.counted, key].slice(-40),
  };
  return {
    records: next,
    newBestGrade: Boolean(grade) && bestGrade !== records.bestGrade,
    newFarthest: day > records.farthestNight,
  };
}

export function recordJourney(
  records: PlayerRecords,
  runId: string,
  routeId: StoryRouteId,
  completed: boolean,
  day = 0,
): PlayerRecords {
  const key = `${runId}:end`;
  if (!completed || records.counted.includes(key)) return records;
  return {
    ...records,
    farthestNight: Math.min(7, Math.max(records.farthestNight, day)),
    journeysCompleted: records.journeysCompleted + 1,
    routesCompleted: {
      ...records.routesCompleted,
      [routeId]: (records.routesCompleted[routeId] ?? 0) + 1,
    },
    counted: [...records.counted, key].slice(-40),
  };
}

export function loadRecords(storage: Pick<Storage, "getItem"> | undefined = globalThis.localStorage): PlayerRecords {
  try {
    return parseRecords(storage?.getItem(RECORDS_KEY) ?? null);
  } catch {
    return createRecords();
  }
}

export function saveRecords(
  records: PlayerRecords,
  storage: Pick<Storage, "setItem"> | undefined = globalThis.localStorage,
): boolean {
  try {
    storage?.setItem(RECORDS_KEY, JSON.stringify(records));
    return Boolean(storage);
  } catch {
    return false;
  }
}

export function recordsSummary(records: PlayerRecords): string | null {
  if (!records.nightsSurvived) return null;
  const parts = [`最遠第 ${records.farthestNight} 夜`];
  if (records.bestGrade) parts.push(`最佳評等 ${records.bestGrade}`);
  if (records.journeysCompleted) parts.push(`完成旅程 ${records.journeysCompleted} 次`);
  return parts.join("・");
}

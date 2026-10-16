import { createRng } from "./rng";
import type { ResourceState, RunState } from "./types";

export type WatchChoiceId = "prepare" | "risk";
export interface WatchChoice {
  id: WatchChoiceId;
  label: string;
  detail: string;
  costs: Partial<ResourceState>;
  reward: Partial<ResourceState>;
  warning: number;
  energySurcharge: number;
  breachDamage: number;
}
export interface NightWatch {
  id: string;
  title: string;
  body: string;
  memory: string;
  choices: readonly WatchChoice[];
}

// All artwork remains the accepted threat-family animation. These are encounter
// conditions, not new creatures represented by placeholder art.
export const NIGHT_WATCHES: readonly NightWatch[] = [
  { id: "rain", title: "冰雨電弧", body: "冷雨沿著窗框流進接點。A-07 用毛毯裹住手，替你指向一閃一閃的電表。", memory: "她把毛毯的一角留在電表旁，提醒你哪裡漏過電。", choices: [
    { id: "prepare", label: "包覆接點", detail: "零件 −1；每波預警 +6 秒。無破口：資料 +1。", costs: { parts: -1 }, reward: { data: 1 }, warning: 6, energySurcharge: 0, breachDamage: 0 },
    { id: "risk", label: "帶電採樣", detail: "電量 −2；每次耗電反制多用 2 電。無破口：資料 +3。", costs: { energy: -2 }, reward: { data: 3 }, warning: 0, energySurcharge: 2, breachDamage: 0 },
  ] },
  { id: "cargo", title: "貨架鬆脫", body: "車頂扣具拖著一只舊貨箱。每次晃動，箱內都傳出金屬碰撞聲。拆下來能修車，失手卻會撞破窗框。", memory: "回收的束帶上刻著舊乘客的名字；她把名字抄進日誌。", choices: [
    { id: "prepare", label: "減速固定", detail: "燃料 −1；一般撞擊傷害 −4。無破口：零件 +1。", costs: { fuel: -1 }, reward: { parts: 1 }, warning: 0, energySurcharge: 0, breachDamage: -4 },
    { id: "risk", label: "守住貨箱", detail: "一般撞擊傷害 +4。無破口：零件 +3。", costs: {}, reward: { parts: 3 }, warning: 0, energySurcharge: 0, breachDamage: 4 },
  ] },
  { id: "echo", title: "隧道回聲", body: "隧道把敲擊聲送回另一側。她跟著節拍輕敲床沿，問你能不能把真正的聲音留給她。", memory: "她學會辨認你的提示音；下一次回聲響起時，她沒有躲進毛毯。", choices: [
    { id: "prepare", label: "校正感測器", detail: "電量 −2；每波預警 +8 秒。無破口：資料 +1。", costs: { energy: -2 }, reward: { data: 1 }, warning: 8, energySurcharge: 0, breachDamage: 0 },
    { id: "risk", label: "追錄回聲", detail: "每波預警 −4 秒，至少保留 8 秒。無破口：資料 +3。", costs: {}, reward: { data: 3 }, warning: -4, energySurcharge: 0, breachDamage: 0 },
  ] },
];

export function tonightWatch(run: RunState): NightWatch | null {
  // Finale scripts retain their own contact rules and rewards.
  if (run.routeId !== "R01" || run.day < 1 || run.day > 6 || run.ended) return null;
  const offset = Math.floor(createRng(run.seed, "night-watch")() * NIGHT_WATCHES.length);
  return NIGHT_WATCHES[(offset + run.day - 1) % NIGHT_WATCHES.length]!;
}

export function selectedNightWatch(run: RunState): { watch: NightWatch; choice: WatchChoice } | null {
  const watch = tonightWatch(run);
  if (!watch) return null;
  const choice = watch.choices.find(item => run.flags.includes(`watch:D${run.day}:${watch.id}:${item.id}`));
  return choice ? { watch, choice } : null;
}

export function watchChoiceAvailable(run: RunState, choice: WatchChoice): boolean {
  return Object.entries(choice.costs).every(([key, delta]) => run.resources[key as keyof ResourceState] + (delta ?? 0) >= 0);
}

export function collectedWatches(run: RunState): NightWatch[] {
  return NIGHT_WATCHES.filter(watch => run.flags.includes(`watch:collected:${watch.id}`));
}

export function nightWatchResult(run: RunState): string {
  const selected = selectedNightWatch(run);
  if (!selected || !run.flags.includes(`watch:settled:D${run.day}`)) return "";
  return run.flags.includes(`watch:won:D${run.day}`)
    ? `${selected.watch.title}・無破口完成，物資已入帳。${selected.watch.memory}`
    : `${selected.watch.title}・本夜未能無破口完成，沒有領取支線獎勵。明晚可再接巡夜。`;
}

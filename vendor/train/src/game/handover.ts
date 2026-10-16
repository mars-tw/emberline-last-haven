import { nightThreatIdFor } from "./night-feel";
import type { RunState } from "./types";

export type HandoverChoice = "window" | "roof";
export const HANDOVER_CHOICES = [
  { id: "window", label: "窗側敲擊", detail: "先辨認玻璃上的節拍，再決定是否關百葉。" },
  { id: "roof", label: "車頂攀附", detail: "先辨認頭頂的拖曳聲，再決定是否切離扣具。" },
] as const;

export function handoverAvailable(run: RunState): boolean {
  return run.routeId === "R01" && run.day >= 1 && run.day <= 6 && !run.ended;
}

export function handoverReady(run: RunState): boolean {
  return ["passenger-breathing", "window-silhouette"].every(id =>
    run.voyage?.inspectedIds.includes(`D${run.day}:${id}`) === true);
}

export function selectedHandover(run: RunState): HandoverChoice | undefined {
  return HANDOVER_CHOICES.find(choice => run.flags.includes(`handover:D${run.day}:${choice.id}`))?.id;
}

export function handoverEvidence(run: RunState): string {
  if (!handoverReady(run)) return "先查看 A-07 的呼吸與臥室冷窗，取得兩份觀察。";
  return nightThreatIdFor(run, 1, null) === "T002"
    ? "車內：A-07 呼吸平穩。窗外：敲擊緊貼玻璃，兩下之間有停頓。"
    : "車內：A-07 呼吸平穩。窗外：影子貼在上緣，拖曳聲從頭頂傳來。";
}

/** Commit once, after actual inspections. Selection and cancellation are free. */
export function commitHandover(run: RunState, value: string): boolean {
  if (!handoverAvailable(run) || !handoverReady(run) || run.phase !== "prep" || run.activeEventId || selectedHandover(run)) return false;
  if (value !== "window" && value !== "roof") return false;
  run.flags.push(`handover:D${run.day}:${value}`);
  run.lastMessage = "交接判讀已封存。首波出現時核對：判對預警加 6 秒；判錯減 3 秒，至少保留 8 秒。";
  return true;
}

/** Only beginNight's first contact receives the modifier, never later waves. */
export function applyHandover(run: RunState): void {
  const chosen = selectedHandover(run);
  const contact = run.activeContact;
  const receipt = `handover:checked:D${run.day}`;
  if (!handoverAvailable(run) || !chosen || !contact || contact.wave !== 1 || run.flags.includes(receipt)) return;
  const actual = contact.definitionId === "T002" ? "window" : contact.definitionId === "T003" ? "roof" : undefined;
  if (!actual) return;
  const matched = chosen === actual;
  contact.secondsLeft = Math.max(8, contact.secondsLeft + (matched ? 6 : -3));
  run.flags.push(receipt, `handover:${matched ? "matched" : "missed"}:D${run.day}`);
}

export function handoverResult(run: RunState): string {
  if (!run.flags.includes(`handover:checked:D${run.day}`)) return "";
  return run.flags.includes(`handover:matched:D${run.day}`)
    ? "交接核對：判讀吻合，首波預警已加 6 秒。你把車內呼吸與窗外訊號分開了。"
    : "交接核對：判讀不符，首波預警減 3 秒（至少 8 秒）。下次留意聲音來自玻璃還是車頂。";
}

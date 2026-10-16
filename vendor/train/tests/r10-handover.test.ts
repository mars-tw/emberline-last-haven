import { describe, expect, it } from "vitest";
import { applyHandover, commitHandover, handoverEvidence, handoverReady, handoverResult, selectedHandover } from "../src/game/handover";
import { createAppState, createRun } from "../src/game/model";
import { nightThreatIdFor } from "../src/game/night-feel";
import { parseRun } from "../src/game/save";
import { RunService } from "../src/game/services";
import { deriveOnboardingCue } from "../src/ui/onboarding";

const service = new RunService();
function ready(seed = "handover-test") {
  const run = createRun(seed);
  service.inspectObject(run, "passenger-breathing");
  service.inspectObject(run, "window-silhouette");
  run.selectedRouteNodeId = "RN01";
  return run;
}

describe("R10 evidence-based handover", () => {
  it("requires both real inspections and never spends AP or resources", () => {
    const run = createRun("guard");
    const before = { resources: { ...run.resources }, ap: run.actionPoints };
    expect(commitHandover(run, "window")).toBe(false);
    service.inspectObject(run, "window-silhouette");
    expect(handoverReady(run)).toBe(false);
    expect(commitHandover(run, "window")).toBe(false);
    service.inspectObject(run, "passenger-breathing");
    expect(commitHandover(run, "invalid")).toBe(false);
    expect(commitHandover(run, "window")).toBe(true);
    expect({ resources: run.resources, ap: run.actionPoints }).toEqual(before);
  });
  it("seals exactly once, survives save/reload, and needs fresh observations tomorrow", () => {
    const run = ready();
    expect(commitHandover(run, "roof")).toBe(true);
    const restored = parseRun(JSON.stringify(run))!;
    expect(selectedHandover(restored)).toBe("roof");
    expect(commitHandover(restored, "window")).toBe(false);
    expect(restored.flags.filter(flag => flag.startsWith("handover:D1:"))).toEqual(["handover:D1:roof"]);
    restored.day = 2;
    expect(selectedHandover(restored)).toBeUndefined();
    expect(commitHandover(restored, "window")).toBe(false);
  });
  for (const seed of ["signal-a", "signal-b", "signal-c", "signal-d"]) for (const matched of [true, false]) {
    it(`${seed}/${matched}: changes actual first-wave warning and applies once`, () => {
      const run = ready(seed), baseline = ready(seed);
      const correct = nightThreatIdFor(run, 1, null) === "T002" ? "window" : "roof";
      expect(handoverEvidence(run)).toContain(correct === "window" ? "玻璃" : "頭頂");
      expect(commitHandover(run, matched ? correct : correct === "window" ? "roof" : "window")).toBe(true);
      service.beginNight(baseline); service.beginNight(run);
      expect(run.activeContact!.secondsLeft).toBe(baseline.activeContact!.secondsLeft + (matched ? 6 : -3));
      const seconds = run.activeContact!.secondsLeft;
      applyHandover(run); service.beginNight(run);
      expect(run.activeContact!.secondsLeft).toBe(seconds);
      expect(handoverResult(run)).toContain(matched ? "判讀吻合" : "判讀不符");
      expect(run.resources).toEqual(baseline.resources);
      expect(commitHandover(run, "window")).toBe(false);
    });
  }
  it("protects later waves, unsupported routes, finale and old saves", () => {
    const run = ready(); commitHandover(run, "window"); service.beginNight(run);
    run.activeContact!.wave = 2; run.activeContact!.secondsLeft = 11;
    run.flags = run.flags.filter(flag => !flag.startsWith("handover:checked:"));
    applyHandover(run); expect(run.activeContact!.secondsLeft).toBe(11);
    for (const route of ["R02", "R03"] as const) expect(commitHandover(createRun("other", route), "roof")).toBe(false);
    const final = ready(); final.day = 7; expect(commitHandover(final, "roof")).toBe(false);
    const ended = ready(); ended.ended = true; expect(commitHandover(ended, "roof")).toBe(false);
    const event = ready(); event.activeEventId = "EV001"; expect(commitHandover(event, "roof")).toBe(false);
    const old = ready(); service.beginNight(old); expect(handoverResult(old)).toBe("");
    expect(old.flags.some(flag => flag.startsWith("handover:"))).toBe(false);
  });
  it("keeps at least eight seconds even on a wrong handover", () => {
    const run = ready(); commitHandover(run, "window"); service.beginNight(run);
    run.flags = run.flags.filter(flag => !flag.startsWith("handover:checked:"));
    run.activeContact!.definitionId = "T003"; run.activeContact!.secondsLeft = 9;
    applyHandover(run); expect(run.activeContact!.secondsLeft).toBe(8);
  });
  it("puts the signature before farming only for the optional first shift", () => {
    const state = createAppState(); state.run = ready(); state.activeCarriageId = "sleep";
    state.run.flags.push("handover:first-shift");
    expect(deriveOnboardingCue(state)?.action).toBe("open-watch");
    commitHandover(state.run, "window"); service.chooseNightWatch(state.run, "prepare");
    expect(deriveOnboardingCue(state)?.action).toBe("route");
    state.run.flags = state.run.flags.filter(flag => flag !== "handover:first-shift");
    expect(deriveOnboardingCue(state)?.action).not.toBe("route");
  });
});

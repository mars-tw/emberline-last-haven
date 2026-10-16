import { describe, expect, it } from "vitest";
import { createRun } from "../src/game/model";
import { collectedWatches, NIGHT_WATCHES, nightWatchResult, selectedNightWatch, tonightWatch } from "../src/game/night-watch";
import { parseRun } from "../src/game/save";
import { getEffectiveCounterCosts, RunService } from "../src/game/services";
import type { RunState } from "../src/game/types";

function encounter(id: string, day = 1): RunState {
  for (let index = 0; index < 40; index++) {
    const run = createRun(`watch-test-${index}`);
    run.day = day;
    run.selectedRouteNodeId = "RN01";
    if (tonightWatch(run)?.id === id) return run;
  }
  throw new Error(`Missing encounter ${id}`);
}
function clearNight(service: RunService, run: RunState): void {
  service.beginNight(run);
  for (let index = 0; index < 12 && run.phase === "night"; index++) {
    const action = run.activeContact?.definitionId === "T002" ? "close-shutter" : "roof-release";
    expect(service.counterThreat(run, action)).toBe(true);
  }
  expect(run.phase).not.toBe("night");
}

describe("R9 reachable nightly encounters", () => {
  it("offers all three in each three-night block of R01 for every seed", () => {
    for (let seed = 0; seed < 12; seed++) {
      const run = createRun(`rotation-${seed}`, "R01");
      for (const start of [1, 4]) {
        const ids = [start, start + 1, start + 2].map(day => { run.day = day; return tonightWatch(run)!.id; });
        expect(new Set(ids).size).toBe(3);
      }
      run.day = 7;
      expect(tonightWatch(run)).toBeNull();
    }
  });
  it("leaves frost and green routes on their dedicated puzzle rules", () => {
    for (const route of ["R02", "R03"] as const) for (let day = 1; day <= 7; day++) {
      const run = createRun("dedicated", route); run.day = day;
      expect(tonightWatch(run)).toBeNull();
      expect(new RunService().chooseNightWatch(run, "risk")).toBe(false);
    }
  });
  it("opening/reading a proposal is pure and deterministic", () => {
    const run = createRun("pure");
    const before = JSON.stringify(run);
    expect(tonightWatch(run)).toEqual(tonightWatch(run));
    expect(selectedNightWatch(run)).toBeNull();
    expect(JSON.stringify(run)).toBe(before);
  });

  for (const watch of NIGHT_WATCHES) for (const option of watch.choices) {
    it(`${watch.id}/${option.id} pays exactly once, changes the real night, awards once and survives reload`, () => {
      const service = new RunService();
      const run = encounter(watch.id);
      const resources = { ...run.resources };
      expect(service.chooseNightWatch(run, option.id)).toBe(true);
      for (const key of Object.keys(resources) as Array<keyof typeof resources>) {
        expect(run.resources[key]).toBe(resources[key] + (option.costs[key] ?? 0));
      }
      const afterChoice = { ...run.resources };
      expect(service.chooseNightWatch(run, option.id)).toBe(false);
      expect(run.resources).toEqual(afterChoice);
      const restored = parseRun(JSON.stringify(run))!;
      expect(selectedNightWatch(restored)?.choice.id).toBe(option.id);
      clearNight(service, restored);
      expect(restored.flags).toContain("watch:won:D1");
      expect(collectedWatches(restored).map(item => item.id)).toContain(watch.id);
      expect(nightWatchResult(restored)).toContain(watch.memory);
      const rewards = restored.ledger.filter(item => item.source === `aftermath.watch.${watch.id}`);
      expect(rewards.length).toBe(Object.keys(option.reward).length);
      for (const reward of rewards) expect(reward.delta).toBe(option.reward[reward.key as keyof typeof option.reward]);
      service.finishNight(restored);
      expect(restored.ledger.filter(item => item.source.startsWith("aftermath.watch."))).toEqual(rewards);
      expect(service.chooseNightWatch(restored, option.id)).toBe(false);
      expect(collectedWatches(parseRun(JSON.stringify(restored))!)).toHaveLength(1);
    });
  }

  it("preparation checks the entire cost before changing anything", () => {
    const run = encounter("rain");
    run.resources.parts = 0;
    const before = JSON.stringify(run);
    expect(new RunService().chooseNightWatch(run, "prepare")).toBe(false);
    expect(JSON.stringify(run)).toBe(before);
  });
  it("rejects invalid, story, travel, ended and finale proposals without writes", () => {
    for (const mutate of [
      (run: RunState) => { run.phase = "travel"; },
      (run: RunState) => { run.activeEventId = "EV041"; },
      (run: RunState) => { run.ended = true; },
      (run: RunState) => { run.day = 7; },
    ]) {
      const run = createRun("guards"); mutate(run);
      const before = JSON.stringify(run);
      expect(new RunService().chooseNightWatch(run, "risk")).toBe(false);
      expect(JSON.stringify(run)).toBe(before);
    }
    expect(new RunService().chooseNightWatch(createRun(), "made-up")).toBe(false);
  });
  it("rain surcharge is previewed, paid and cannot overdraw an insufficient battery", () => {
    const service = new RunService();
    const run = encounter("rain");
    service.chooseNightWatch(run, "risk");
    service.beginNight(run);
    run.activeContact!.definitionId = "T002";
    expect(getEffectiveCounterCosts(run, "close-shutter").energy).toBe(-10);
    run.resources.energy = 9;
    expect(service.counterThreat(run, "close-shutter")).toBe(false);
    expect(run.resources.energy).toBe(9);
    run.resources.energy = 10;
    expect(service.counterThreat(run, "close-shutter")).toBe(true);
    expect(run.resources.energy).toBe(0);
  });
  for (const [id, choice, seconds] of [["rain", "prepare", 6], ["echo", "prepare", 8], ["echo", "risk", -4]] as const) {
    it(`${id}/${choice} changes each contact warning by ${seconds} seconds`, () => {
      const service = new RunService();
      const run = encounter(id);
      const base = structuredClone(run);
      service.chooseNightWatch(run, choice);
      service.beginNight(base); service.beginNight(run);
      expect(run.activeContact!.secondsLeft).toBe(base.activeContact!.secondsLeft + seconds);
    });
  }
  for (const [choice, damage] of [["prepare", -4], ["risk", 4]] as const) {
    it(`cargo/${choice} changes actual breach damage by ${damage}, then denies clean reward`, () => {
      const service = new RunService();
      const run = encounter("cargo");
      const base = structuredClone(run);
      service.chooseNightWatch(run, choice);
      service.beginNight(base); service.beginNight(run);
      service.counterThreat(base, "brace-impact"); service.counterThreat(run, "brace-impact");
      expect(base.environment.hull - run.environment.hull).toBe(damage);
      expect(run.flags).not.toContain("watch:won:D1");
      expect(collectedWatches(run)).toHaveLength(0);
      expect(nightWatchResult(run)).toContain("沒有領取");
    });
  }
  it("skipping the side encounter preserves existing costs, warnings and rewards", () => {
    const run = encounter("rain");
    const service = new RunService();
    expect(getEffectiveCounterCosts(run, "close-shutter").energy).toBe(-8);
    clearNight(service, run);
    expect(run.flags.some(flag => flag.startsWith("watch:"))).toBe(false);
    expect(nightWatchResult(run)).toBe("");
  });
  it("a previous night's effect expires and three successful nights collect three memories", () => {
    const service = new RunService();
    const run = createRun("three-memories");
    run.selectedRouteNodeId = "RN01";
    for (let day = 1; day <= 3; day++) {
      run.day = day; run.phase = "prep"; run.activeEventId = undefined;
      run.resources.energy = 100; run.resources.parts = 12; run.resources.fuel = 100;
      expect(selectedNightWatch(run)).toBeNull();
      expect(service.chooseNightWatch(run, "prepare")).toBe(true);
      clearNight(service, run);
    }
    expect(collectedWatches(run)).toHaveLength(3);
    run.day = 4; run.phase = "prep";
    expect(selectedNightWatch(run)).toBeNull();
    expect(getEffectiveCounterCosts(run, "close-shutter").energy).toBe(-8);
  });
  it("finishing without resolving all contacts cannot claim an objective", () => {
    const run = encounter("rain"); const service = new RunService();
    service.chooseNightWatch(run, "risk"); service.beginNight(run); service.finishNight(run);
    expect(run.flags).not.toContain("watch:won:D1");
    expect(collectedWatches(run)).toHaveLength(0);
  });
});

import test from "node:test";
import assert from "node:assert/strict";
import { ANIMAL_DETAILS } from "../src/behaviors/animalDetails.js";
import {
  resolveParameterValue,
  resolveRuleControls,
  formatParameterValue,
  getParameterProgress,
} from "../src/utils/bookControls.js";

test("book data has unique IDs and valid parameter definitions", () => {
  for (const animal of Object.values(ANIMAL_DETAILS)) {
    const ruleIds = new Set();
    for (const rule of animal.rules) {
      assert.ok(rule.id && !ruleIds.has(rule.id));
      ruleIds.add(rule.id);
      const ids = new Set();
      for (const behavior of rule.behaviors) {
        assert.ok(behavior.id && !ids.has(behavior.id));
        ids.add(behavior.id);
        if (!behavior.parameter) continue;
        const p = behavior.parameter;
        assert.ok(p.label);
        assert.ok([p.min, p.max, p.step, p.defaultValue, p.decimals].every(Number.isFinite));
        assert.ok(p.min < p.max && p.step > 0);
        assert.equal(resolveParameterValue(p, p.defaultValue), p.defaultValue);
      }
    }
  }
});

test("controls use stable IDs and physical values independent of titles and order", () => {
  const rule = ANIMAL_DETAILS.starling.rules[0];
  const defaults = resolveRuleControls(rule);
  assert.equal(defaults.flight_speed, 9.5);
  const reordered = { ...rule, behaviors: [...rule.behaviors].reverse()
    .map((behavior) => ({ ...behavior, name: "Renamed" })) };
  const changed = resolveRuleControls(reordered, { flight_speed: 11.2, unknown: 99 });
  assert.deepEqual(changed, { ...defaults, flight_speed: 11.2 });
});

test("invalid values fall back, values clamp and snap to the declared step", () => {
  const p = ANIMAL_DETAILS.starling.rules[0].behaviors[2].parameter;
  for (const value of [undefined, null, "", "bad", Infinity]) {
    assert.equal(resolveParameterValue(p, value), p.defaultValue);
  }
  assert.equal(resolveParameterValue(p, -1), p.min);
  assert.equal(resolveParameterValue(p, 1), p.max);
  assert.equal(resolveParameterValue(p, "0.0764"), 0.076);
  assert.equal(formatParameterValue(0.076, p), "0.076 초");
  assert.equal(getParameterProgress(p.min, p), 0);
  assert.equal(getParameterProgress(p.max, p), 100);
});

test("text-only and empty pages create no synthetic controls", () => {
  assert.deepEqual(resolveRuleControls(undefined), {});
  assert.deepEqual(resolveRuleControls({ behaviors: [{ id: "text", name: "Text" }] }), {});
});

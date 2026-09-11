import test from "node:test";
import assert from "node:assert/strict";
import { createAntTrailField, depositAntTrail, sampleAntTrail, decayAntTrail, antTrailTurn, antTrailAlpha } from "../src/components/bookPreviews/antTrailField.js";
import { createAntExploration, advanceAntExploration } from "../src/components/bookPreviews/antExplorationModel.js";

test("trail deposit is local and field decay halves concentration smoothly", () => {
  const field = createAntTrailField(48, 48);
  depositAntTrail(field, 16, 16, 1);
  assert.equal(sampleAntTrail(field, 16, 16), 1);
  assert.equal(sampleAntTrail(field, 30, 30), 0);
  decayAntTrail(field, 8, 8);
  assert.equal(sampleAntTrail(field, 16, 16), 0.5);
  assert.ok(antTrailAlpha(0.5) < antTrailAlpha(1));
  assert.equal(antTrailAlpha(0), 0);
  assert.ok(antTrailAlpha(0.001) <= 1);
});
test("left and right sensors turn toward the same field used for rendering", () => {
  const field = createAntTrailField(48, 48);
  depositAntTrail(field, 20.8, 20.8, 2);
  assert.ok(antTrailTurn(field, 20, 20, 0, 100) > 0);
  assert.equal(antTrailTurn(field, 20, 20, 0, 0), 0);
  assert.equal(antTrailTurn(field, 5, 5, 0, 100), 0);
});
test("zero deposition stops replenishment without clearing existing traces", () => {
  const model = createAntExploration();
  const controls = { deposit_strength: 100, trail_following: 60, trail_half_life: 8 };
  for (let i = 0; i < 600; i++) advanceAntExploration(model, controls, 1 / 60);
  const sum = () => model.field.values.reduce((a, b) => a + b, 0);
  const before = sum();
  assert.ok(before > 0);
  controls.deposit_strength = 0;
  advanceAntExploration(model, controls, 1 / 60);
  assert.ok(sum() > before * 0.99);
  for (let i = 0; i < 740; i++) advanceAntExploration(model, controls, 1 / 60);
  assert.ok(sum() < before * 0.51 && sum() > before * 0.48);
});
test("maximum trail response stays finite and inside the display", () => {
  for (const aspect of [0.6, 1.5, 3]) {
    const model = createAntExploration(aspect);
    for (let i = 0; i < 4800; i++) {
      advanceAntExploration(model, { deposit_strength: 100, trail_following: 100, trail_half_life: 20, participation: 100, walk_speed: 8 }, 1 / 60);
      for (const a of model.agents) {
        assert.ok(Number.isFinite(a.x + a.y));
        assert.ok(a.x > 0 && a.x < model.width && a.y > 0 && a.y < model.height);
      }
    }
  }
});

import { BOOK_MOVEMENT_SCALE } from "../src/components/bookPreviews/bookMotion.js";
import test from "node:test";
import assert from "node:assert/strict";
import { createSwimmingModel, stepSwimmingModel, advanceSwimmingModel, swimSeparation,
  SWIM_STEP } from "../src/components/bookPreviews/sardineSwimmingModel.js";
const defaults = { swim_speed: 0.9, turn_rate: 160, spacing_strength: 50 };
test("swimming speed, turn limit and page bounds hold at all corners", () => {
  for (const aspect of [0.55, 1, 2]) for (const speed of [0.5, 1.6])
    for (const rate of [100, 220]) for (const strength of [0, 100]) {
      const model = createSwimmingModel(aspect);
      for (let i = 0; i < 2400; i++) {
        stepSwimmingModel(model, { swim_speed: speed, turn_rate: rate, spacing_strength: strength });
        model.agents.forEach((a, index) => {
          const old = model.previous[index];
          assert.ok(Math.abs(Math.hypot(a.x - old.x, a.y - old.y) - speed * BOOK_MOVEMENT_SCALE * SWIM_STEP) < 1e-10);
          assert.ok(Math.abs(a.heading - old.heading) <= rate * Math.PI / 180 * SWIM_STEP + 1e-10);
          assert.ok(a.x > 0.2 && a.x < model.width - 0.2 && a.y > 0.2 && a.y < model.height - 0.2);
        });
      }
    }
});
test("spacing is a local weighted response and handles overlapping positions", () => {
  const a = { id: 0, x: 1, y: 1 }, b = { id: 1, x: 1.2, y: 1 };
  assert.deepEqual(swimSeparation(a, [a, b], 0), { x: 0, y: 0 });
  assert.ok(swimSeparation(a, [a, b], 100).x < swimSeparation(a, [a, b], 50).x);
  assert.equal(swimSeparation(a, [a, { ...b, x: 2 }], 100).x, 0);
  assert.ok(Number.isFinite(swimSeparation(a, [a, { ...b, x: 1 }], 100).x));
});
test("render frequency does not change swimming trajectories", () => {
  const a = createSwimmingModel(1), b = createSwimmingModel(1);
  for (let i = 0; i < 300; i++) advanceSwimmingModel(a, defaults, 1 / 30);
  for (let i = 0; i < 1200; i++) advanceSwimmingModel(b, defaults, 1 / 120);
  assert.deepEqual(a.agents, b.agents);
});

import test from "node:test";
import assert from "node:assert/strict";
import { createAntMill, advanceAntMill, antMillSteering } from "../src/components/bookPreviews/antMillModel.js";
import { createAntTrailField } from "../src/components/bookPreviews/antTrailField.js";
const run = (m, c, seconds, hz = 60) => {
  for (let i = 0; i < seconds * hz; i++) advanceAntMill(m, c, 1 / hz);
  return m;
};
test("mill steering reads local signal rather than a fixed rotation or center", () => {
  const model = createAntMill();
  const a = model.agents[0];
  assert.ok(antMillSteering(model.field, a) > 0);
  assert.equal(antMillSteering(createAntTrailField(model.width, model.height), a), 0);
});
test("reinforcement and decay affect the retained field independently", () => {
  const sum = m => m.field.values.reduce((a, b) => a + b, 0);
  const short = run(createAntMill(), { loop_half_life: 4, loop_reinforcement: 0 }, 10);
  const long = run(createAntMill(), { loop_half_life: 20, loop_reinforcement: 0 }, 10);
  const reinforced = run(createAntMill(), { loop_half_life: 4, loop_reinforcement: 100 }, 10);
  assert.ok(sum(long) > sum(short) * 2);
  assert.ok(sum(reinforced) > sum(short));
});
test("a new trail changes paths without instantly changing positions", () => {
  const model = createAntMill(), before = model.agents.map(a => ({ ...a }));
  advanceAntMill(model, { external_signal: 100 }, 1 / 60);
  model.agents.forEach((a, i) => assert.ok(Math.hypot(a.x - before[i].x, a.y - before[i].y) < 0.05));
  const isolated = run(createAntMill(), {}, 35);
  const connected = run(createAntMill(), { external_signal: 100 }, 35);
  assert.ok(connected.agents.some((a, i) => Math.hypot(a.x - isolated.agents[i].x, a.y - isolated.agents[i].y) > 2));
  run(isolated, {}, 25);
  run(connected, { external_signal: 100 }, 25);
  const beyondLoop = m => m.agents.filter(a => a.x > m.width * 0.45 + 12).length;
  assert.ok(beyondLoop(connected) > beyondLoop(isolated));
});
test("preset loop can persist without per-agent radius correction", () => {
  const model = run(createAntMill(), {}, 20);
  const meanError = model.agents.reduce((sum, a) => sum + Math.abs(Math.hypot(a.x - model.width * 0.45, a.y - model.height / 2) - 9), 0) / model.agents.length;
  assert.ok(meanError < 3, `mean radius error ${meanError}`);
});
test("mill fixed steps are render-independent and all extremes stay bounded", () => {
  assert.deepEqual(run(createAntMill(), {}, 3, 30).agents, run(createAntMill(), {}, 3, 120).agents);
  for (const aspect of [0.6, 1.5, 3]) for (const value of [0, 100]) {
    const model = createAntMill(aspect);
    for (let i = 0; i < 3600; i++) {
      advanceAntMill(model, { external_signal: value, loop_reinforcement: value, loop_half_life: value ? 20 : 4 }, 1 / 60);
      for (const a of model.agents) {
        assert.ok(Number.isFinite(a.x + a.y));
        assert.ok(a.x > 1 && a.y > 1 && a.x < model.width - 1 && a.y < model.height - 1);
      }
    }
  }
});

import test from "node:test";
import assert from "node:assert/strict";
import { createAntExploration, advanceAntExploration } from "../src/components/bookPreviews/antExplorationModel.js";

const run = (model, controls, seconds, hz = 60) => {
  for (let i = 0; i < seconds * hz; i++) advanceAntExploration(model, controls, 1 / hz);
  return model;
};
test("ant fixed steps are independent of rendering frequency", () => {
  const a = run(createAntExploration(), {}, 10, 30), b = run(createAntExploration(), {}, 10, 120);
  assert.deepEqual(a.agents, b.agents);
});
test("participation changes progressively, without teleporting agents", () => {
  const model = run(createAntExploration(), { participation: 100 }, 15);
  const before = model.agents.map(a => ({ x: a.x, y: a.y }));
  advanceAntExploration(model, { participation: 20 }, 1 / 60);
  model.agents.forEach((a, i) => assert.ok(Math.hypot(a.x - before[i].x, a.y - before[i].y) < 0.1));
  run(model, { participation: 20 }, 100);
  assert.ok(model.agents.filter(a => a.state !== "reserve").length <= 8);
  assert.equal(model.agents.length, 36);
});
test("speed and exploration controls have distinct effects", () => {
  const slow = run(createAntExploration(), { walk_speed: 2, exploration: 0 }, 6);
  const fast = run(createAntExploration(), { walk_speed: 8, exploration: 0 }, 6);
  const varied = run(createAntExploration(), { walk_speed: 2, exploration: 100 }, 6);
  assert.ok(fast.agents[0].distance > slow.agents[0].distance * 1.5);
  assert.notEqual(varied.agents[0].heading, slow.agents[0].heading);
});
test("ant extremes remain bounded without wrapping or discontinuous heading", () => {
  for (const aspect of [0.6, 1.5, 3]) {
    const model = createAntExploration(aspect);
    for (let i = 0; i < 7200; i++) {
      const before = model.agents.map(a => a.heading);
      advanceAntExploration(model, { participation: 100, walk_speed: 8, exploration: 100 }, 1 / 60);
      model.agents.forEach((a, j) => {
        assert.ok(Number.isFinite(a.x + a.y + a.heading));
        assert.ok(a.x > 1 && a.x < model.width - 1 && a.y > 1 && a.y < model.height - 1);
        assert.ok(Math.abs(a.heading - before[j]) < 0.05);
      });
    }
  }
});

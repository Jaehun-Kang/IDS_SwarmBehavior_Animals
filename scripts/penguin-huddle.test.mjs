import test from "node:test";
import assert from "node:assert/strict";
import { createPenguinHuddle, advancePenguinHuddle, penguinWindExposure } from "../src/components/bookPreviews/penguinHuddleModel.js";
function run(controls, fps = 60, seconds = 30, aspect = 1.5) {
  const model = createPenguinHuddle(aspect);
  for (let i = 0; i < fps * seconds; i++) advancePenguinHuddle(model, controls, 1 / fps);
  return model;
}
function nearest(model) {
  return model.agents.reduce((sum, a) => sum + Math.min(...model.agents.filter(b => b.id !== a.id)
    .map(b => Math.hypot(b.x - a.x, b.y - a.y))), 0) / model.agents.length;
}
test("range controls local joining without a global center target", () => {
  const isolated = run({ neighbor_range: 2 });
  const joined = run({ neighbor_range: 6 });
  assert.ok(nearest(joined) < nearest(isolated) * 0.85);
  assert.ok(isolated.agents.every(a => a.distance === 0));
});
test("spacing changes realized separation", () => {
  assert.ok(nearest(run({ body_spacing: 1.1 })) < nearest(run({ body_spacing: 2.4 })) * 0.8);
});
test("wind shadow reverses with wind and stays within zero and one", () => {
  const agents = [{ id: 0, x: 0, y: 0 }, { id: 1, x: 1.2, y: 0 }];
  assert.ok(penguinWindExposure(agents[1], agents, 0) < 0.3);
  assert.equal(penguinWindExposure(agents[1], agents, Math.PI), 1);
  assert.equal(penguinWindExposure(agents[0], agents, 0), 1);
});
test("fixed-step results agree across frame rates", () => {
  const a = run({}, 30, 10), b = run({}, 120, 10);
  a.agents.forEach((p, i) => assert.ok(Math.hypot(p.x - b.agents[i].x, p.y - b.agents[i].y) < 1e-8));
});
test("long runs retain finite positions, interior bounds and physical spacing", () => {
  for (const aspect of [0.6, 2.5]) {
    const m = run({ neighbor_range: 6, body_spacing: 1.1 }, 30, 120, aspect);
    for (const a of m.agents) {
      assert.ok(Number.isFinite(a.x + a.y));
      assert.ok(a.x > 1 && a.x < m.width - 1 && a.y > 1 && a.y < m.height - 1);
      for (const b of m.agents) if (a.id !== b.id) assert.ok(Math.hypot(a.x - b.x, a.y - b.y) > 0.8);
    }
  }
});

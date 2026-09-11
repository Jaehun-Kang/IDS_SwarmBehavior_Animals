import test from "node:test";
import assert from "node:assert/strict";
import { createAntTraffic, advanceAntTraffic, antTrafficResponse } from "../src/components/bookPreviews/antTrafficModel.js";

const run = (model, controls, seconds, hz = 60) => {
  for (let i = 0; i < seconds * hz; i++) advanceAntTraffic(model, controls, 1 / hz);
  return model;
};
test("traffic yields locally and asymmetry only modifies encounter response", () => {
  const model = createAntTraffic();
  const a = { id: 0, x: 30, y: 24, heading: 0, returning: false };
  const near = { id: 1, x: 31, y: 24.2 }, far = { id: 2, x: 50, y: 28 };
  const weak = antTrafficResponse(a, [near], model, { yield_difference: 0 });
  const strong = antTrafficResponse(a, [near], model, { yield_difference: 100 });
  assert.ok(Math.abs(strong.turn) > Math.abs(weak.turn));
  assert.ok(strong.turnRate > weak.turnRate);
  assert.deepEqual(antTrafficResponse(a, [], model, {}), antTrafficResponse(a, [far], model, {}));
  const free = antTrafficResponse(a, [], model, { congestion_slowdown: 100 });
  assert.ok(antTrafficResponse(a, [near], model, { congestion_slowdown: 100 }).speed < free.speed);
});
test("food contact changes carrying state but never snaps heading or position", () => {
  const model = createAntTraffic();
  const a = model.agents[1];
  Object.assign(a, { x: model.food.x - 2, y: model.food.y, heading: 0, returning: false });
  const before = { ...a };
  advanceAntTraffic(model, { food_success: 100 }, 1 / 60);
  assert.ok(a.returning && a.carrying);
  assert.ok(Math.abs(a.heading - before.heading) < 0.1);
  assert.ok(Math.hypot(a.x - before.x, a.y - before.y) < 0.1);
  Object.assign(a, { x: model.home.x + 2, y: model.home.y, heading: Math.PI });
  advanceAntTraffic(model, { food_success: 100 }, 1 / 60);
  assert.equal(a.carrying, false);
  assert.equal(model.delivered, 1);
});
test("food success affects delivered loads without inventing a speed boost", () => {
  const empty = run(createAntTraffic(), { food_success: 0 }, 100);
  const laden = run(createAntTraffic(), { food_success: 100 }, 100);
  assert.equal(empty.delivered, 0);
  assert.ok(laden.delivered > 0);
  empty.agents.forEach((a, i) => assert.equal(a.distance, laden.agents[i].distance));
});
test("traffic is independent of render rate and iteration order", () => {
  const a = run(createAntTraffic(), {}, 5, 30);
  const b = run(createAntTraffic(), {}, 5, 120);
  assert.deepEqual(a.agents, b.agents);
  const reversed = createAntTraffic();
  reversed.agents.reverse();
  run(reversed, {}, 5, 60);
  reversed.agents.reverse();
  a.agents.forEach((agent, i) => assert.ok(Math.hypot(agent.x - reversed.agents[i].x, agent.y - reversed.agents[i].y) < 1e-8));
});
test("traffic extreme controls stay in bounds with continuous turning", () => {
  for (const aspect of [0.6, 1.5, 3]) for (const value of [0, 100]) {
    const model = createAntTraffic(aspect);
    for (let i = 0; i < 3600; i++) {
      const headings = model.agents.map(a => a.heading);
      advanceAntTraffic(model, { yield_difference: value, food_success: value, congestion_slowdown: value }, 1 / 60);
      model.agents.forEach((a, j) => {
        assert.ok(Number.isFinite(a.x + a.y + a.speed));
        assert.ok(a.x > 1 && a.x < model.width - 1 && a.y > 1 && a.y < model.height - 1);
        assert.ok(Math.abs(a.heading - headings[j]) < 0.13);
      });
    }
  }
});

test("default local interactions separate returning center flow from outbound margins", () => {
  const model = createAntTraffic(), sums = [0, 0], counts = [0, 0], sides = [0, 0];
  for (let i = 0; i < 18000; i++) {
    advanceAntTraffic(model, {}, 1 / 60);
    if (i <= 3600 || i % 30 !== 0) continue;
    for (const a of model.agents) {
      if (a.x <= model.width * 0.35 || a.x >= model.width * 0.65) continue;
      const group = a.returning ? 0 : 1;
      sums[group] += Math.abs(a.y - model.height / 2); counts[group]++;
      if (!a.returning) sides[a.y < model.height / 2 ? 0 : 1]++;
    }
  }
  assert.ok(counts.every(n => n > 100));
  assert.ok(sums[1] / counts[1] > sums[0] / counts[0] * 1.3);
  assert.ok(sides.every(n => n > counts[1] * 0.2));
});

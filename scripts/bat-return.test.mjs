import test from "node:test";
import assert from "node:assert/strict";
import { createBatReturn, advanceBatReturn } from "../src/components/bookPreviews/batReturnModel.js";
const run = (m, c, seconds, pointer = null, hz = 60) => {
  for (let i = 0; i < seconds * hz; i++) advanceBatReturn(m, c, 1 / hz, pointer);
  return m;
};
test("return starts outside and completes by entering rather than fading", () => {
  const m = createBatReturn();
  assert.ok(m.agents.every(a => a.x > m.width));
  run(m, {}, 60);
  assert.ok(m.returned >= 12);
  assert.equal(m.agents.length, 12);
});
test("approach speed changes arrival time", () => {
  const slow = run(createBatReturn(), { entry_speed: 1 }, 60);
  const fast = run(createBatReturn(), { entry_speed: 6 }, 60);
  assert.ok(fast.returned > slow.returned);
});
test("pointer avoidance is local, optional and recovers after removal", () => {
  const a = run(createBatReturn(), {}, 8), b = run(createBatReturn(), {}, 8);
  const pointer = { x: a.agents[0].x / a.width, y: a.agents[0].y / a.height + 0.04 };
  run(a, { threat_response: 0 }, 2, pointer);
  run(b, { threat_response: 100 }, 2, pointer);
  assert.ok(Math.hypot(a.agents[0].x - b.agents[0].x, a.agents[0].y - b.agents[0].y) > 0.1);
  run(b, {}, 80);
  assert.ok(b.returned >= 12);
});
test("return integration is frame independent and bounded under local threats", () => {
  assert.deepEqual(run(createBatReturn(), {}, 3, null, 30), run(createBatReturn(), {}, 3, null, 120));
  for (const aspect of [0.6, 1.5, 3]) {
    const m = createBatReturn(aspect);
    run(m, { threat_response: 100, entry_speed: 6 }, 60, { x: 0.3, y: 0.45 });
    for (const a of m.agents) {
      assert.ok(Number.isFinite(a.x + a.y + a.heading));
      assert.ok(a.y > 0 && a.y < m.height);
    }
  }
});
test("blocking the entrance does not send bats through the cave wall", () => {
  const m = createBatReturn();
  for (let i = 0; i < 12000; i++) {
    advanceBatReturn(m, { threat_response: 100 }, 1 / 60, { x: 0, y: 0.5 });
    for (const a of m.agents) if (a.x < 1.5) assert.ok(Math.abs(a.y - m.height / 2) < 3.5);
  }
});

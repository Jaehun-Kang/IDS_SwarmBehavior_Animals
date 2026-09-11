import test from "node:test";
import assert from "node:assert/strict";
import { createBatFlight, advanceBatFlight, batEchoVisible } from "../src/components/bookPreviews/batFlightModel.js";
const run = (m, c, seconds, hz = 60) => {
  for (let i = 0; i < seconds * hz; i++) advanceBatFlight(m, c, 1 / hz);
  return m;
};
test("bat flight is independent of render frequency", () => {
  assert.deepEqual(run(createBatFlight(), {}, 4, 30), run(createBatFlight(), {}, 4, 120));
});
test("speed changes travel continuously without resetting flight", () => {
  const slow = run(createBatFlight(), { flight_speed: 4 }, 20);
  const fast = run(createBatFlight(), { flight_speed: 12 }, 20);
  assert.ok(fast.agents[0].distance > slow.agents[0].distance * 2);
  const a = fast.agents[0], before = { ...a };
  advanceBatFlight(fast, { flight_speed: 4 }, 1 / 60);
  assert.ok(Math.hypot(a.x - before.x, a.y - before.y) < 0.2);
});
test("echo sensing is local and forward, and masking reduces availability", () => {
  const a = { id: 0, x: 0, y: 0, heading: 0 };
  assert.equal(batEchoVisible(a, { id: 1, x: -2, y: 0 }, 0, 1), false);
  assert.equal(batEchoVisible(a, { id: 1, x: 9, y: 0 }, 0, 1), false);
  const other = { id: 1, x: 2, y: 0 };
  let masked = 0;
  for (let i = 0; i < 100; i++) {
    assert.equal(batEchoVisible(a, other, 0, i), true);
    masked += batEchoVisible(a, other, 100, i);
  }
  assert.ok(masked < 20);
});
test("light affects local avoidance without changing emission rate", () => {
  const dark = run(createBatFlight(), { light_level: 0 }, 8);
  const bright = run(createBatFlight(), { light_level: 100 }, 8);
  assert.equal(dark.agents[0].calls, bright.agents[0].calls);
  assert.ok(dark.agents.some((a, i) => Math.hypot(a.x - bright.agents[i].x, a.y - bright.agents[i].y) > 0.01));
});
test("pulse origins stay fixed and sensory history stays bounded", () => {
  const model = run(createBatFlight(), {}, 2);
  const a = model.agents[0], pulse = a.pulses.at(-1), origin = { ...pulse };
  run(model, {}, 0.2);
  assert.deepEqual(pulse, origin);
  run(model, {}, 10);
  for (const agent of model.agents) {
    assert.ok(agent.pulses.length <= 3);
    assert.ok(agent.echoes.length <= 11);
  }
});
test("extreme controls remain finite and inside the canvas", () => {
  for (const aspect of [0.6, 1.5, 3]) for (const v of [0, 100]) {
    const m = createBatFlight(aspect);
    for (let i = 0; i < 7200; i++) {
      advanceBatFlight(m, { flight_speed: v ? 12 : 4, light_level: v, sound_masking: v }, 1 / 60);
      for (const a of m.agents) {
        assert.ok(Number.isFinite(a.x + a.y + a.heading));
        assert.ok(a.x > 1 && a.y > 1 && a.x < m.width - 1 && a.y < m.height - 1);
      }
    }
  }
});

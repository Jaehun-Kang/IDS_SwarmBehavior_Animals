import test from "node:test";
import assert from "node:assert/strict";
import { createSwimmingModel, stepSwimmingModel, swimLightResponse } from "../src/components/bookPreviews/sardineSwimmingModel.js";
test("light adapts continuously with individual differences and adjustable response time", () => {
  const fast = createSwimmingModel(1), slow = createSwimmingModel(1);
  stepSwimmingModel(fast, { light_level: 0, adaptation_time: 1 });
  stepSwimmingModel(slow, { light_level: 0, adaptation_time: 5 });
  assert.ok(fast.agents.every(a => a.light > 0.9 && a.light < 1));
  assert.ok(fast.agents[0].light < slow.agents[0].light);
  assert.notEqual(fast.agents[0].light, fast.agents[1].light);
});
test("night retention changes attraction, not speed or visual alignment", () => {
  const dark = swimLightResponse({ light: 0 }, { light_level: 0, night_cohesion: 0 });
  const retained = swimLightResponse({ light: 0 }, { light_level: 0, night_cohesion: 100 });
  const bright = swimLightResponse({ light: 1 }, { light_level: 100 });
  assert.equal(dark.controls.cohesion_strength, 0);
  assert.equal(retained.controls.cohesion_strength, 50);
  assert.equal(dark.controls.alignment_strength, retained.controls.alignment_strength);
  assert.ok(bright.controls.alignment_strength > dark.controls.alignment_strength);
  assert.ok(bright.controls.neighbor_radius > dark.controls.neighbor_radius);
  const ordinary = {};
  assert.equal(swimLightResponse({ light: 1 }, ordinary).controls, ordinary);
});
test("repeated light reversals preserve positions and camera margins", () => {
  for (const aspect of [0.55, 1, 2]) for (const retention of [0, 100]) {
    const model = createSwimmingModel(aspect);
    for (let i = 0; i < 3000; i++) {
      stepSwimmingModel(model, { light_level: Math.floor(i / 600) % 2 * 100,
        night_cohesion: retention, adaptation_time: 1 });
      model.agents.forEach((a, index) => {
        assert.ok(a.light >= 0 && a.light <= 1);
        assert.ok(a.x > 0.2 && a.y > 0.2 && a.x < model.width - 0.2 && a.y < model.height - 0.2);
        const old = model.previous[index];
        assert.ok(Math.abs(Math.hypot(a.x - old.x, a.y - old.y) - 0.9 / 120) < 1e-10);
      });
    }
  }
});

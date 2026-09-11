import test from "node:test";
import assert from "node:assert/strict";
import { createSwimmingModel, stepSwimmingModel, swimThreatResponse } from "../src/components/bookPreviews/sardineSwimmingModel.js";
const controls = { threat_strength: 100, threat_cohesion: 50, recovery_time: 2 };
test("only nearby fish detect a threat and overlapping targets remain finite", () => {
  const a = { x: 1, y: 1, heading: 0, fear: 0 };
  assert.equal(swimThreatResponse({ ...a }, controls, { x: 4, y: 4 }).x, 0);
  assert.ok(swimThreatResponse({ ...a }, controls, { x: 0, y: 1 }).x > 0);
  const response = swimThreatResponse({ ...a }, controls, a);
  assert.ok(Number.isFinite(response.x + response.y));
});
test("recovery relaxes gradually and local attraction has an independent control", () => {
  const a = { x: 1, y: 1, heading: 0, fear: 1 };
  const fast = { ...a }, slow = { ...a };
  swimThreatResponse(fast, { ...controls, recovery_time: 1 }, null);
  swimThreatResponse(slow, { ...controls, recovery_time: 5 }, null);
  assert.ok(fast.fear > 0 && fast.fear < slow.fear && slow.fear < 1);
  const low = swimThreatResponse({ ...a }, { ...controls, threat_cohesion: 0 }, a);
  const high = swimThreatResponse({ ...a }, { ...controls, threat_cohesion: 100 }, a);
  assert.equal(low.x, high.x);
  assert.equal(low.y, high.y);
  assert.equal(low.controls.alignment_strength, high.controls.alignment_strength);
  assert.ok(high.controls.cohesion_strength > low.controls.cohesion_strength);
});
test("moving threats and edge targets never teleport, reflect or expel fish", () => {
  for (const aspect of [0.55, 1, 2]) for (const attraction of [0, 100]) {
    const model = createSwimmingModel(aspect);
    for (let i = 0; i < 2400; i++) {
      const predator = i < 1800 ? { x: model.width * (0.5 + Math.sin(i / 180) * 0.49),
        y: model.height * (0.5 + Math.cos(i / 180) * 0.49) } : null;
      stepSwimmingModel(model, { ...controls, threat_cohesion: attraction }, predator);
      model.agents.forEach((a, index) => {
        const old = model.previous[index];
        assert.ok(Math.abs(Math.hypot(a.x - old.x, a.y - old.y) - 0.9 / 120) < 1e-10);
        assert.ok(Math.abs(a.heading - old.heading) <= 160 * Math.PI / 180 / 120 + 1e-10);
        assert.ok(a.x > 0.2 && a.y > 0.2 && a.x < model.width - 0.2 && a.y < model.height - 0.2);
      });
    }
  }
});

import test from "node:test";
import assert from "node:assert/strict";
import { createSwimmingModel, stepSwimmingModel, swimSocialForces } from "../src/components/bookPreviews/sardineSwimmingModel.js";
import { SARDINE_DETAILS } from "../src/behaviors/details/sardine.js";

test("neighbour controls are independent and shape has no invented control", () => {
  const group = SARDINE_DETAILS.rules[1];
  assert.deepEqual(group.behaviors.filter(b => b.parameter).map(b => b.id),
    ["neighbor_radius", "alignment_strength", "cohesion_strength"]);
  assert.equal(group.behaviors[3].parameter, undefined);
  const agents = [{ id: 0, x: 0, y: 0, heading: 0 }, { id: 1, x: 0, y: 1, heading: 1 },
    { id: 2, x: 2, y: 0, heading: 2 }];
  const base = swimSocialForces(agents[0], agents, {});
  const align = swimSocialForces(agents[0], agents, { alignment_strength: 100 });
  const cohere = swimSocialForces(agents[0], agents, { cohesion_strength: 100 });
  assert.deepEqual(base.neighbourIds, [1]);
  assert.deepEqual(swimSocialForces(agents[0], agents, { neighbor_radius: 2.4 }).neighbourIds, [1, 2]);
  assert.deepEqual(swimSocialForces(agents[0], agents, { neighbor_radius: 0.6 }).neighbourIds, []);
  assert.deepEqual(base.cohesion, align.cohesion);
  assert.deepEqual(base.alignment, cohere.alignment);
  assert.equal(align.alignment.y, base.alignment.y * 2);
  assert.equal(cohere.cohesion.y, base.cohesion.y * 2);
});
test("all neighbour control extremes remain in the page without changing speed", () => {
  for (const aspect of [0.55, 1, 2]) for (const radius of [0.6, 2.4])
    for (const alignment of [0, 100]) for (const cohesion of [0, 100]) {
      const model = createSwimmingModel(aspect);
      for (let i = 0; i < 2400; i++) {
        stepSwimmingModel(model, { neighbor_radius: radius, alignment_strength: alignment, cohesion_strength: cohesion });
        model.agents.forEach((a, index) => {
          assert.ok(a.x > 0.2 && a.y > 0.2 && a.x < model.width - 0.2 && a.y < model.height - 0.2);
          const old = model.previous[index];
          assert.ok(Math.abs(Math.hypot(a.x - old.x, a.y - old.y) - 0.9 / 120) < 1e-10);
        });
      }
    }
});
test("every neighbour control changes the trajectory", () => {
  const run = controls => {
    const model = createSwimmingModel(1);
    for (let i = 0; i < 800; i++) stepSwimmingModel(model, controls);
    return model.agents;
  };
  const base = run({});
  for (const control of [{ neighbor_radius: 0.6 }, { alignment_strength: 0 }, { cohesion_strength: 0 }]) {
    assert.notDeepEqual(base, run(control));
  }
});

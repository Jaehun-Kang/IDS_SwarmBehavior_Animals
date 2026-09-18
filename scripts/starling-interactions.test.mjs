import { BOOK_MOVEMENT_SCALE } from "../src/components/bookPreviews/bookMotion.js";
import test from "node:test";
import assert from "node:assert/strict";
import { interactionForces, createInteractionModel, stepInteractionModel, interactionEngine } from "../src/components/bookPreviews/starlingInteractionModel.js";
import { STARLING_DETAILS } from "../src/behaviors/details/starling.js";
import { resolveRuleControls } from "../src/utils/bookControls.js";

const group = STARLING_DETAILS.rules[1];
const defaults = resolveRuleControls(group);
const agent = { id: 0, x: 5, y: 5, heading: 0 };
const neighbors = [agent, { id: 1, x: 5, y: 5.2, heading: 1 }, { id: 2, x: 5.3, y: 5, heading: -1 }];

test("four explicit controls have independent force components", () => {
  assert.equal(group.behaviors.length, 4);
  assert.equal(new Set(group.behaviors.map(b => b.parameter.label)).size, 4);
  const before = interactionForces(agent, neighbors, defaults);
  for (const [control, component] of [["alignment_strength", "alignment"], ["cohesion_strength", "cohesion"], ["avoidance_priority", "avoidance"]]) {
    const after = interactionForces(agent, neighbors, { ...defaults, [control]: 0 });
    assert.notDeepEqual(after[component], before[component]);
    for (const other of ["alignment", "cohesion", "avoidance"].filter(key => key !== component)) assert.deepEqual(after[other], before[other]);
  }
});

test("nearest-neighbor avoidance ignores the second neighbor and remains finite at overlap", () => {
  const forces = interactionForces(agent, neighbors, defaults);
  assert.equal(forces.avoidance.x, 0);
  assert.ok(forces.avoidance.y < 0);
  const overlap = interactionForces(agent, [agent, { ...agent, id: 1 }], defaults);
  assert.ok(Number.isFinite(overlap.avoidance.x));
});

test("only selected neighbors influence local alignment and attraction", () => {
  const controls = { ...defaults, neighbor_count: 1 };
  const a = interactionForces(agent, neighbors, controls);
  const b = interactionForces(agent, [...neighbors, { id: 9, x: 999, y: 999, heading: 3 }], controls);
  assert.deepEqual(a, b);
  assert.deepEqual(a.neighborIds, [1]);
});

test("synchronous snapshots make the result independent of iteration order", () => {
  const a = createInteractionModel(), b = createInteractionModel();
  b.agents.reverse();
  stepInteractionModel(a, defaults);
  stepInteractionModel(b, defaults);
  assert.deepEqual(a.agents, b.agents.reverse());
});

test("render rates produce the same trajectory and every control changes it", () => {
  const a = createInteractionModel(), b = createInteractionModel();
  for (let i = 0; i < 300; i++) interactionEngine.advance(a, defaults, 1 / 30);
  for (let i = 0; i < 1200; i++) interactionEngine.advance(b, defaults, 1 / 120);
  assert.deepEqual(a.agents, b.agents);
  for (const key of Object.keys(defaults)) {
    const changed = createInteractionModel();
    for (let i = 0; i < 300; i++) interactionEngine.advance(changed, { ...defaults, [key]: key === "neighbor_count" ? 3 : 100 }, 1 / 30);
    assert.notDeepEqual(changed.agents, a.agents, key);
  }
});

test("all control corners stay finite and in frame without changing flight speed", () => {
  for (const aspect of [0.55, 1, 2]) {
    for (let mask = 0; mask < 16; mask++) {
      const controls = Object.fromEntries(group.behaviors.map((b, i) => [b.id, mask & (1 << i) ? b.parameter.max : b.parameter.min]));
      const model = createInteractionModel(aspect);
      for (let step = 0; step < 1200; step++) {
        stepInteractionModel(model, controls);
        for (let i = 0; i < model.agents.length; i++) {
          const a = model.agents[i], b = model.previous[i];
          assert.ok(Number.isFinite(a.heading));
          assert.ok(a.x > 0.3 && a.x < model.width - 0.3 && a.y > 0.3 && a.y < model.height - 0.3, `${aspect}/${mask}`);
          assert.ok(Math.abs(Math.hypot(a.x - b.x, a.y - b.y) - 9.5 * BOOK_MOVEMENT_SCALE / 120) < 1e-8);
        }
      }
    }
  }
});

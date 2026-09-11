import test from "node:test";
import assert from "node:assert/strict";
import { createFlightModel, stepFlightModel, advanceFlightModel,
  sampleFlightHistory, lateralNeighborWeight, spacingRepulsion, getFlightRenderPose,
} from "../src/components/bookPreviews/starlingFlightModel.js";
import { STARLING_DETAILS } from "../src/behaviors/details/starling.js";
import { resolveRuleControls } from "../src/utils/bookControls.js";

const controls = resolveRuleControls(STARLING_DETAILS.rules[0]);

test("speed controls travelled distance without altering turn radius or other parameters", () => {
  const distance = (speed) => {
    const model = createFlightModel();
    const before = { ...model.agents[0] };
    stepFlightModel(model, { ...controls, flight_speed: speed });
    return Math.hypot(model.agents[0].x - before.x, model.agents[0].y - before.y);
  };
  assert.ok(Math.abs(distance(12) / distance(7) - 12 / 7) < 1e-9);
});

test("minimum spacing changes the repulsion threshold", () => {
  const agent = { id: 0, x: 0, y: 0 };
  const neighbors = [{ id: 1, x: 0.45, y: 0 }];
  assert.equal(spacingRepulsion(agent, neighbors, 0.3).x, 0);
  assert.ok(spacingRepulsion(agent, neighbors, 0.6).x < 0);
});

test("reaction delay samples the earlier neighbor state and interpolates heading across pi", () => {
  const history = [
    { time: 0, agents: [{ id: 0, x: 0, y: 0, heading: Math.PI - 0.1 }] },
    { time: 0.1, agents: [{ id: 0, x: 1, y: 0, heading: -Math.PI + 0.1 }] },
  ];
  const sample = sampleFlightHistory(history, 0.05)[0];
  assert.equal(sample.x, 0.5);
  assert.ok(Math.abs(sample.heading - Math.PI) < 1e-9);
  assert.equal(sampleFlightHistory(history, -1)[0].x, 0);
});

test("lateral control weights side neighbors independently of distance", () => {
  assert.equal(lateralNeighborWeight(0, 0, 1, 0), 1);
  assert.equal(lateralNeighborWeight(0, 1, 0, 100), 1);
  assert.equal(lateralNeighborWeight(0, 0, 1, 100), 3);
});

test("30Hz and 120Hz rendering produce the same fixed-step trajectory", () => {
  const a = createFlightModel(), b = createFlightModel();
  for (let i = 0; i < 300; i += 1) advanceFlightModel(a, controls, 1 / 30);
  for (let i = 0; i < 1200; i += 1) advanceFlightModel(b, controls, 1 / 120);
  assert.deepEqual(a.agents, b.agents);
});

test("slow playback renders a new interpolated pose each frame without changing physics", () => {
  const model = createFlightModel();
  advanceFlightModel(model, controls, 0.1);
  let previous = getFlightRenderPose(model, 0);
  let changes = 0;
  for (let frame = 0; frame < 120; frame += 1) {
    advanceFlightModel(model, controls, 1 / 120);
    const state = JSON.stringify(model.agents);
    const pose = getFlightRenderPose(model, 0);
    assert.equal(JSON.stringify(model.agents), state);
    if (pose.x !== previous.x || pose.y !== previous.y) changes++;
    previous = pose;
  }
  assert.equal(changes, 120);
});

test("extreme controls remain finite and inside portrait and landscape pages", () => {
  for (const aspect of [0.55, 1, 2]) {
    const model = createFlightModel(aspect);
    const extreme = { flight_speed: 12, minimum_spacing: 0.6, reaction_time: 0.12, lateral_influence: 100 };
    for (let i = 0; i < 7200; i += 1) {
      stepFlightModel(model, extreme);
      for (const agent of model.agents) {
        assert.ok(Number.isFinite(agent.heading));
        assert.ok(agent.x > 0.5 && agent.x < model.width - 0.5);
        assert.ok(agent.y > 0.5 && agent.y < model.height - 0.5);
      }
    }
    assert.ok(model.history.length < 30);
  }
});

import test from "node:test";
import assert from "node:assert/strict";
import { createTurnModel, stepTurnModel, turnEngine, turnPose, turnViewport,
  TURN_SPEED, TURN_STEP_S } from "../src/components/bookPreviews/starlingTurnModel.js";
import { STARLING_DETAILS } from "../src/behaviors/details/starling.js";

const defaults = { turn_radius: 15, bank_angle: 23, turn_wave_speed: 30 };
test("turn page separates three controls from the agitation explanation", () => {
  const group = STARLING_DETAILS.rules[2];
  assert.equal(group.previewId, "starling_turns");
  assert.deepEqual(group.behaviors.filter(b => b.parameter).map(b => b.id), Object.keys(defaults));
  assert.equal(group.behaviors[3].parameter, undefined);
});
test("turns propagate locally instead of changing all headings at once", () => {
  const model = createTurnModel(1);
  for (let i = 0; i < 62; i++) stepTurnModel(model, defaults);
  assert.ok(model.agents.some(a => a.heading > 0));
  assert.ok(model.agents.some(a => a.heading === 0));
  for (let i = 0; i < 90; i++) stepTurnModel(model, defaults);
  assert.ok(model.agents.every(a => a.heading > 0));
  assert.ok(new Set(model.agents.map(a => a.start)).size > 2);
});
test("constant speed, finite poses and camera margins hold at all control extremes", () => {
  for (const aspect of [0.55, 1, 2]) for (const radius of [5, 30]) {
    const model = createTurnModel(aspect);
    const controls = { ...defaults, turn_radius: radius, bank_angle: 60, turn_wave_speed: 20 };
    for (let i = 0; i < 2400; i++) {
      const before = model.agents.map(a => ({ ...a }));
      stepTurnModel(model, controls);
      const view = turnViewport(model);
      model.agents.forEach((a, index) => {
        assert.ok(Math.abs(Math.hypot(a.x - before[index].x, a.y - before[index].y) - TURN_SPEED * TURN_STEP_S) < 1e-10);
        assert.ok(Math.abs(a.heading - before[index].heading) <= TURN_SPEED / radius * TURN_STEP_S + 1e-10);
        const pose = turnPose(model, index);
        assert.ok(Number.isFinite(pose.x + pose.y + pose.heading + pose.bank));
        assert.ok(pose.x > view.x + 0.2 && pose.x < view.x + view.width - 0.2);
        assert.ok(pose.y > view.y + 0.2 && pose.y < view.y + view.width / aspect - 0.2);
      });
    }
  }
});
test("radius and signal speed affect separate quantities, banking affects projection only", () => {
  const models = [defaults, { ...defaults, turn_radius: 5 },
    { ...defaults, turn_wave_speed: 40 }, { ...defaults, bank_angle: 60 }].map(controls => {
    const model = createTurnModel(1);
    for (let i = 0; i < 180; i++) stepTurnModel(model, controls);
    return model;
  });
  assert.ok(models[1].agents[5].heading > models[0].agents[5].heading);
  assert.ok(models[2].agents[0].start < models[0].agents[0].start);
  models[0].agents.forEach((a, i) => {
    assert.equal(a.x, models[3].agents[i].x);
    assert.equal(a.y, models[3].agents[i].y);
  });
  assert.ok(models[3].agents[5].bank > models[0].agents[5].bank);
});
test("fixed stepping and immutable local reads are independent of frame and array order", () => {
  const a = createTurnModel(1), b = createTurnModel(1);
  for (let i = 0; i < 300; i++) turnEngine.advance(a, defaults, 1 / 30);
  for (let i = 0; i < 1200; i++) turnEngine.advance(b, defaults, 1 / 120);
  assert.deepEqual(a.agents, b.agents);
  const c = createTurnModel(1), d = createTurnModel(1);
  d.agents.reverse();
  for (let i = 0; i < 150; i++) { stepTurnModel(c, defaults); stepTurnModel(d, defaults); }
  assert.deepEqual(c.agents, d.agents.sort((x, y) => x.id - y.id));
});

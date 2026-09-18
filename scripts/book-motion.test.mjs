import test from "node:test";
import assert from "node:assert/strict";
import { BOOK_MOVEMENT_SCALE } from "../src/components/bookPreviews/bookMotion.js";
import { createFlightModel, stepFlightModel, FLIGHT_STEP_S } from "../src/components/bookPreviews/starlingFlightModel.js";
import { createFireflyIndividual, advanceFireflyIndividual } from "../src/components/bookPreviews/fireflyIndividualModel.js";
import { createSheepMovement, advanceSheepMovement } from "../src/components/bookPreviews/sheepMovementModel.js";

test("movement gain increases displacement, not simulation time", () => {
  const m = createFlightModel();
  const before = { ...m.agents[0] };
  stepFlightModel(m, { flight_speed: 9.5, reaction_time: 0.076, minimum_spacing: 0.39, lateral_influence: 50 });
  assert.equal(BOOK_MOVEMENT_SCALE, 1.15);
  assert.equal(m.time, FLIGHT_STEP_S);
  assert.ok(Math.abs(Math.hypot(m.agents[0].x - before.x, m.agents[0].y - before.y)
    - 9.5 * 1.15 * FLIGHT_STEP_S) < 1e-10);
});

test("moving fireflies retain the same flash and waiting clocks as stationary ones", () => {
  const moving = createFireflyIndividual(1.5), resting = createFireflyIndividual(1.5);
  for (let i = 0; i < 1800; i++) {
    advanceFireflyIndividual(moving, { flying_ratio: 100 }, 1 / 60);
    advanceFireflyIndividual(resting, { flying_ratio: 0 }, 1 / 60);
    for (let j = 0; j < moving.agents.length; j++) {
      for (const key of ["light", "wait", "elapsed", "bursts", "interval"]) {
        assert.equal(moving.agents[j][key], resting.agents[j][key]);
      }
    }
  }
  assert.ok(Math.abs(moving.time - 30) < 1e-8);
});

test("faster movement does not shorten sheep pause duration", () => {
  const m = createSheepMovement();
  const before = { ...m.agents[0] };
  for (let i = 0; i < 240; i++) advanceSheepMovement(m, { pause_duration: 5 }, 1 / 60);
  assert.equal(m.agents[0].state, 0);
  assert.equal(m.agents[0].x, before.x);
  assert.equal(m.agents[0].y, before.y);
  assert.ok(Math.abs(m.agents[0].stateAge - 4) < 1e-8);
});

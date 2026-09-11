import test from "node:test";
import assert from "node:assert/strict";
import { createPausedFrameGate } from "../src/utils/pausedFrameGate.js";
import { advanceFixedStep, interpolatePose } from "../src/utils/bookAnimation.js";

test("paused frame gate redraws on input changes and resume only", () => {
  const gate = createPausedFrameGate();
  const image = {}, controls = {};
  assert.equal(gate(true, 800, 600, 1, controls, null), true);
  assert.equal(gate(true, 800, 600, 1, controls, null), false);
  assert.equal(gate(true, 800, 600, 1, controls, image), true);
  assert.equal(gate(true, 800, 600, 1, controls, image), false);
  assert.equal(gate(true, 900, 600, 1, controls, image), true);
  assert.equal(gate(true, 900, 600, 2, controls, image), true);
  const changed = {};
  assert.equal(gate(true, 900, 600, 2, changed, image), true);
  assert.equal(gate(true, 900, 600, 2, changed, image), false);
  gate.invalidate();
  assert.equal(gate(true, 900, 600, 2, changed, image), true);
  assert.equal(gate(false, 900, 600, 2, changed, image), true);
  assert.equal(gate(false, 900, 600, 2, changed, image), true);
  assert.equal(gate(true, 900, 600, 2, changed, image), true);
  assert.equal(gate(true, 900, 600, 2, changed, image), false);
});

test("book clock bounds catch-up and ignores negative elapsed time", () => {
  const clock = { remainder: 0 };
  let updates = 0;
  const step = () => { updates++; };
  advanceFixedStep(clock, -1, 1 / 60, 1, step);
  assert.equal(updates, 0);
  advanceFixedStep(clock, 60, 1 / 60, 1, step);
  assert.equal(updates, 6);
});

test("shared pose interpolation turns over the shortest angle", () => {
  const before = { x: 0, y: 2, heading: Math.PI - 0.1 };
  const after = { x: 2, y: 4, heading: -Math.PI + 0.1 };
  const output = {};
  assert.equal(interpolatePose(before, after, 0.5, output), output);
  assert.equal(output.x, 1);
  assert.equal(output.y, 3);
  assert.ok(Math.abs(output.heading - Math.PI) < 1e-9);
});

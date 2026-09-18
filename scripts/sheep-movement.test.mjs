import { BOOK_MOVEMENT_SCALE } from "../src/components/bookPreviews/bookMotion.js";
import test from 'node:test';
import assert from 'node:assert/strict';
import { createSheepMovement, advanceSheepMovement } from '../src/components/bookPreviews/sheepMovementModel.js';
const run = (controls = {}, hz = 60, seconds = 60, aspect = 1.5) => {
  const m = createSheepMovement(aspect);
  for (let i = 0; i < hz * seconds; i++) advanceSheepMovement(m, controls, 1 / hz);
  return m;
};
test('sheep fixed stepping is independent of frame frequency', () => {
  const a = run({}, 30), b = run({}, 120);
  a.agents.forEach((s, i) => assert.ok(Math.hypot(s.x - b.agents[i].x, s.y - b.agents[i].y) < 1e-8));
});
test('walk speed, run speed and pause duration independently change distance', () => {
  const sum = m => m.agents.reduce((s, a) => s + a.distance, 0);
  assert.ok(sum(run({walk_speed: 0.3})) > sum(run({walk_speed: 0.05})));
  assert.ok(sum(run({run_speed: 2})) > sum(run({run_speed: 0.5})));
  assert.ok(sum(run({pause_duration: 0})) > sum(run({pause_duration: 12})));
});
test('sheep stay within sprite margins without jumps at control extremes', () => {
  for (const aspect of [0.5, 1, 2]) {
    const m = createSheepMovement(aspect);
    for (let t = 0; t < 7200; t++) {
      const previous = m.agents.map(a => ({x:a.x,y:a.y}));
      advanceSheepMovement(m, {pause_duration: 0, walk_speed: 0.3, run_speed: 2}, 1/60);
      m.agents.forEach((a,i) => {
        assert.ok(Number.isFinite(a.heading));
        assert.ok(a.x > 1 && a.x < m.width-1 && a.y > 1 && a.y < m.height-1);
        assert.ok(Math.hypot(a.x-previous[i].x,a.y-previous[i].y) < 0.04*BOOK_MOVEMENT_SCALE);
      });
    }
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHomeAnimationClock, HOME_REFERENCE_HZ } from '../src/utils/homeAnimationClock.js';

for (const hz of [30, 50, 60, 90, 120, 144, 165, 240]) {
  test(`${hz}Hz rendering preserves the measured desktop movement rate`, () => {
    const clock = createHomeAnimationClock();
    let ticks = 0;
    for (let frame = 0; frame <= hz * 10; frame++) {
      const alpha = clock.advance(frame * 1000 / hz, () => ticks++);
      assert(alpha >= 0 && alpha < 1);
    }
    assert.equal(ticks, HOME_REFERENCE_HZ * 10);
  });
}

test('variable refresh follows elapsed time rather than number of frames', () => {
  const clock = createHomeAnimationClock();
  let now = 0, ticks = 0, frame = 0;
  clock.advance(now, () => ticks++);
  while (now < 10000) {
    now = Math.min(10000, now + [1000/120,1000/60,1000/48,1000/144][frame++ % 4]);
    clock.advance(now, () => ticks++);
  }
  assert.equal(ticks, HOME_REFERENCE_HZ * 10);
});

test('visibility reset and long stalls do not replay missed movement', () => {
  const clock = createHomeAnimationClock();
  let ticks = 0;
  const step = () => ticks++;
  clock.advance(0, step);
  clock.advance(100, step);
  assert.equal(ticks, 5);
  clock.reset();
  clock.advance(5000, step);
  assert.equal(ticks, 5);
  clock.advance(5020, step);
  assert.equal(ticks, 6);
  clock.advance(10000, step);
  assert.equal(ticks, 6);
  clock.advance(10020, step);
  assert.equal(ticks, 7);
});

test('bad timestamps recover and catch-up work remains bounded', () => {
  const clock = createHomeAnimationClock();
  let ticks = 0;
  const step = () => ticks++;
  clock.advance(0, step);
  clock.advance(200, step);
  assert.equal(ticks, 5);
  clock.advance(NaN, step);
  clock.advance(500, step);
  clock.advance(520, step);
  assert.equal(ticks, 6);
  clock.advance(100, step);
  assert.equal(ticks, 6);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createSimulationFrameScheduler, SIMULATION_STEP_SECONDS } from '../src/utils/simulationFrameScheduler.js';

function harness() {
  let id = 0;
  let hidden = false;
  const callbacks = new Map();
  const clock = createSimulationFrameScheduler({
    requestFrame(callback) { callbacks.set(++id, callback); return id; },
    cancelFrame(id) { callbacks.delete(id); },
    isHidden: () => hidden,
  });
  return {
    clock,
    frame(time) {
      const queued = [...callbacks.values()];
      callbacks.clear();
      for (const callback of queued) callback(time);
      assert(callbacks.size <= 1, 'only one native frame is queued');
    },
    hide(value) { hidden = value; },
    get pending() { return callbacks.size; },
  };
}

for (const hz of [15, 30, 48, 50, 60, 90, 120, 144, 165, 240]) {
  test(`${hz}Hz runs the same fixed steps and preserves seconds-based speed`, () => {
    const h = harness();
    let count = 0, distance = 0;
    const step = (time, dt) => {
      assert.equal(dt, 1 / 60);
      assert(Math.abs(time - count * 1000 / 60) < 1e-6);
      count++;
      distance += 120 * dt;
      h.clock.request(step);
    };
    h.clock.request(step);
    for (let frame = 0; frame <= hz * 10; frame++) h.frame(frame * 1000 / hz);
    assert.equal(count, 601); // Initial visible frame, then 600 elapsed ticks.
    assert.equal(distance, 1202);
  });
}

test('variable refresh preserves frame-based random draws and damping', () => {
  function run(intervals) {
    const h = harness();
    let random = 42, velocity = 0, position = 0, time = 0, frame = 0;
    const step = (_, dt) => {
      random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
      velocity = velocity * 0.97 + random / 2 ** 32;
      position += velocity * dt;
      h.clock.request(step);
    };
    h.clock.request(step);
    h.frame(time);
    while (time < 10000) {
      time = Math.min(10000, time + intervals[frame++ % intervals.length]);
      h.frame(time);
    }
    return { random, velocity, position };
  }
  assert.deepEqual(run([1000 / 60]), run([1000 / 120, 1000 / 144, 1000 / 30, 1000 / 48]));
});

test('control-effect restarts do not create ticks at the display refresh rate', () => {
  const h = harness();
  let ticks = 0, token;
  const step = () => { ticks++; token = h.clock.request(step); };
  token = h.clock.request(step);
  for (let frame = 0; frame <= 1440; frame++) {
    h.clock.cancel(token);
    token = h.clock.request(step);
    h.frame(frame * 1000 / 144);
  }
  assert.equal(ticks, 601);
  h.clock.cancel(token);
  assert.equal(h.pending, 0);
  h.frame(20000);
  assert.equal(ticks, 601);
});

test('paused frames consume time without a catch-up burst on resume', () => {
  const h = harness();
  let paused = false, updates = 0;
  const step = () => { if (!paused) updates++; h.clock.request(step); };
  h.clock.request(step);
  h.frame(0);
  paused = true;
  for (let i = 1; i <= 120; i++) h.frame(i * 1000 / 60);
  paused = false;
  h.frame(121 * 1000 / 60);
  assert.equal(updates, 2);
});

test('hidden tabs, long stalls and invalid timestamps do not replay missed movement', () => {
  const h = harness();
  let updates = 0;
  const step = (_, dt) => { updates++; assert.equal(dt, SIMULATION_STEP_SECONDS); h.clock.request(step); };
  h.clock.request(step);
  h.frame(0);
  h.hide(true);
  h.frame(2000);
  assert.equal(updates, 1);
  h.hide(false);
  h.frame(10000);
  assert.equal(updates, 2);
  h.frame(50000);
  assert.equal(updates, 3);
  h.frame(NaN);
  h.frame(51000);
  assert.equal(updates, 4);
});

test('all eleven main loops use the scheduler; ant retains its 0.02s model step', () => {
  const directory = new URL('../src/behaviors/swarm/', import.meta.url);
  const files = readdirSync(directory).filter(name => /^\d\d_.*\.jsx$/.test(name));
  assert.equal(files.length, 11);
  for (const file of files) {
    const source = readFileSync(new URL(file, directory), 'utf8');
    assert.match(source, /createSimulationFrameScheduler/);
    assert.match(source, /simulationFrames\.request/);
    assert.match(source, /simulationFrames\.cancel/);
    assert.doesNotMatch(source, /window\.requestAnimationFrame|lastTimeRef|lastTimestamp/);
    if (!file.startsWith('01') && !file.startsWith('02')) {
      assert.match(source, /React\.useState\(createSimulationFrameScheduler\)/);
    }
  }
  assert.match(readFileSync(new URL('04_Ant.jsx', directory), 'utf8'), /SIMULATION_STEP_S = 0\.02;/);
});

import test from "node:test";
import assert from "node:assert/strict";
import { Effect } from "../src/utils/ParticleEffect.js";

function fixture(repulsion = false) {
  const draws = [];
  const effect = new Effect({ fillRect: (...args) => draws.push(args) }, 1000, 1000);
  effect.morphToTargets([{ x: 600, y: 400, color: "black" }]);
  const particle = effect.particles[0];
  Object.assign(particle, { x: 500, y: 420, vx: 2, vy: -1, friction: 0.5 });
  effect.mouse = { x: 620, y: 400, radius: 300, force: 5 };
  effect.setMouseRepulsionEnabled(repulsion);
  return { effect, particle, draws };
}

function legacyUpdate(p, effect) {
  p.x += (p.originX - p.x) * p.ease;
  p.y += (p.originY - p.y) * p.ease;
  if (effect.mouseRepulsionEnabled) {
    const dx = p.x - effect.mouse.x, dy = p.y - effect.mouse.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0 && distance < effect.mouse.radius) {
      const force = (effect.mouse.radius - distance) / effect.mouse.radius;
      p.vx += dx / distance * force * effect.mouse.force;
      p.vy += dy / distance * force * effect.mouse.force;
    }
  }
  p.x += p.vx; p.y += p.vy;
  p.vx *= p.friction; p.vy *= p.friction;
  p.opacity += (p.targetOpacity - p.opacity) * 0.12;
  if (p.x < 0 || p.x > effect.canvasWidth) p.vx *= -1;
  if (p.y < 0 || p.y > effect.canvasHeight) p.vy *= -1;
  p.x = Math.max(0, Math.min(effect.canvasWidth, p.x));
  p.y = Math.max(0, Math.min(effect.canvasHeight, p.y));
}

test("60Hz preserves the original update including mouse force and fading", () => {
  for (const repulsion of [false, true]) {
    const { effect, particle } = fixture(repulsion);
    particle.targetOpacity = 0.25;
    const legacy = { ...particle };
    for (let i = 0; i < 120; i++) {
      effect.update(1 / 60);
      legacyUpdate(legacy, effect);
      for (const key of ["x", "y", "vx", "vy", "opacity"])
        assert(Math.abs(particle[key] - legacy[key]) < 1e-10, key);
    }
  }
});

for (const repulsion of [false, true]) {
  test(`30/120Hz elapsed-time trajectories stay close to 60Hz (mouse=${repulsion})`, () => {
    const run = hz => {
      const { effect, particle } = fixture(repulsion);
      for (let i = 0; i < hz; i++) effect.update(1 / hz);
      return particle;
    };
    const baseline = run(60);
    for (const hz of [30, 120]) {
      const actual = run(hz);
      assert(Math.hypot(actual.x - baseline.x, actual.y - baseline.y) < (repulsion ? 5 : 1e-9));
      assert(Math.hypot(actual.vx - baseline.vx, actual.vy - baseline.vy) < (repulsion ? 0.5 : 1e-9));
    }
  });
}

test("one elapsed-time update per RAF; no accumulation, catch-up or interpolation", () => {
  const { effect, particle, draws } = fixture();
  const updates = [];
  const update = effect.update.bind(effect);
  effect.update = dt => { updates.push(dt); update(dt); };
  for (const now of [0, 8, 20, 120]) {
    effect.advance(now);
    effect.render();
    assert.equal(draws.at(-1)[0], particle.x);
    assert.equal(draws.at(-1)[1], particle.y);
  }
  assert.deepEqual(updates, [0.008, 0.012, 0.1]);
  assert.equal(draws.length, 4);
  assert.equal("accumulator" in effect, false);
});

test("zero dt is identity and hidden/idle/long gaps discard elapsed time", () => {
  const { effect, particle } = fixture(true);
  const before = { ...particle };
  effect.update(0);
  effect.update(NaN);
  effect.update(-1);
  assert.deepEqual({ ...particle }, before);
  effect.advance(0);
  effect.advance(20);
  const current = { ...particle };
  effect.advance(2000);
  assert.deepEqual({ ...particle }, current);
  effect.resetTiming();
  effect.advance(10000);
  effect.advance(10000);
  effect.advance(NaN);
  effect.advance(11000);
  assert.deepEqual({ ...particle }, current);
  effect.particles = [];
  effect.advance(12000);
  effect.particles = [particle];
  effect.advance(13000);
  assert.deepEqual({ ...particle }, current);
});

test("coincident mouse stays finite and morphing/hover/readiness still work", () => {
  const { effect, particle } = fixture(true);
  particle.x = particle.originX; particle.y = particle.originY;
  particle.vx = particle.vy = 0;
  effect.mouse.x = particle.x; effect.mouse.y = particle.y;
  effect.update(1 / 120);
  for (const key of ["x", "y", "vx", "vy"]) assert(Number.isFinite(particle[key]));
  assert.equal(effect.isTextReadyForSubtitle(), true);
  effect.setMouseRepulsionEnabled(false);
  effect.morphToTargets([{ x: 800, y: 700, color: "red" }]);
  assert.equal(effect.particles[0], particle);
  assert.equal(effect.isTextReadyForSubtitle(), false);
  for (let i = 0; i < 120; i++) effect.update(1 / 30);
  assert.equal(effect.isTextSettled(), true);
});

import test from "node:test";
import assert from "node:assert/strict";
import { createStarlingShape, advanceStarlingShape, starlingShapePoint } from "../src/components/bookPreviews/starlingShapeModel.js";
const run = (controls, hz = 60) => {
  const m = createStarlingShape();
  for (let i = 0; i < hz * 5; i++) advanceStarlingShape(m, controls, 1 / hz);
  return m;
};
test("shape diagram is frame independent and approaches settings continuously", () => {
  const slow = run({}, 30), fast = run({}, 120);
  assert.ok(Math.abs(slow.remainder - fast.remainder) < 1e-12);
  assert.deepEqual({ ...slow, remainder: 0 }, { ...fast, remainder: 0 });
  const m = createStarlingShape();
  advanceStarlingShape(m, { flock_shape: 8, view_angle: 90 }, 1 / 60);
  assert.ok(m.ratio > 5.6 && m.ratio < 5.8);
  assert.ok(m.angle > 30 && m.angle < 35);
});
test("thickness control changes only the vertical dimension", () => {
  const thin = run({ flock_shape: 8 }), thick = run({ flock_shape: 3 });
  let thinY = 0, thickY = 0;
  thin.seeds.forEach((_, i) => {
    const a = starlingShapePoint(thin, i), b = starlingShapePoint(thick, i);
    assert.equal(a.x, b.x); assert.equal(a.z, b.z);
    thinY += a.y ** 2; thickY += b.y ** 2;
  });
  assert.ok(thickY > thinY * 5);
});
test("edge density redistributes volume samples without adding birds or using opacity", () => {
  const low = run({ density_difference: 0 }), high = run({ density_difference: 100 });
  const radial = m => m.seeds.reduce((sum, _, i) => {
    const p = starlingShapePoint(m, i);
    return sum + Math.hypot(p.x / 9, p.y * m.ratio / 9, p.z / 4.5);
  }, 0);
  assert.equal(low.seeds.length, high.seeds.length);
  assert.ok(radial(high) > radial(low) * 1.1);
});
test("camera angle never changes the volume, and all extreme positions stay finite", () => {
  const side = run({ view_angle: 0 }), top = run({ view_angle: 90 });
  side.seeds.forEach((_, i) => assert.deepEqual(starlingShapePoint(side, i), starlingShapePoint(top, i)));
  for (const ratio of [3, 8]) for (const density of [0, 100]) {
    const m = run({ flock_shape: ratio, density_difference: density });
    m.seeds.forEach((_, i) => {
      const p = starlingShapePoint(m, i);
      assert.ok(Number.isFinite(p.x + p.y + p.z));
      assert.ok(Math.abs(p.x) < 9.2 && Math.abs(p.y) < 3.1 && Math.abs(p.z) < 4.7);
    });
  }
});

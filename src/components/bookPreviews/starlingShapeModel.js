import { advanceFixedStep } from "../../utils/bookAnimation.js";
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const hash = n => { const v = Math.sin(n * 127.1 + 17.3) * 43758.5453; return v - Math.floor(v); };
export function createStarlingShape() {
  const seeds = Array.from({ length: 240 }, (_, id) => {
    const vertical = 1 - 2 * (id + 0.5) / 240;
    const angle = id * Math.PI * (3 - Math.sqrt(5));
    const horizontal = Math.sqrt(1 - vertical * vertical);
    return { x: horizontal * Math.cos(angle), y: vertical, z: horizontal * Math.sin(angle),
      volume: 0.015 + hash(id + 1) * 0.97, phase: hash(id + 501) * Math.PI * 2 };
  });
  return { seeds, time: 0, remainder: 0, ratio: 5.6, density: 50, angle: 30 };
}
export function advanceStarlingShape(model, controls, elapsed) {
  advanceFixedStep(model, elapsed, 1 / 120, 1, () => {
    model.time += 1 / 120;
    const blend = 1 - Math.exp(-4 / 120);
    model.ratio += (clamp(controls.flock_shape ?? 5.6, 3, 8) - model.ratio) * blend;
    model.density += (clamp(controls.density_difference ?? 50, 0, 100) - model.density) * blend;
    model.angle += (clamp(controls.view_angle ?? 30, 0, 90) - model.angle) * blend;
  });
}
// Synthetic volume samples illustrate structure; they are not measured tracks or emergent flocking.
export function starlingShapePoint(model, index, out = {}) {
  const seed = model.seeds[index];
  const radius = seed.volume ** (1 / (3 + model.density / 20));
  const phase = model.time * 0.45 + seed.phase;
  out.x = seed.x * radius * 9 + Math.sin(phase) * 0.12;
  out.y = seed.y * radius * 9 / model.ratio + Math.cos(phase * 0.83) * 0.05;
  out.z = seed.z * radius * 4.5 + Math.sin(phase * 0.91) * 0.1;
  return out;
}

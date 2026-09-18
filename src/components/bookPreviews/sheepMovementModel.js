import { BOOK_MOVEMENT_SCALE } from "./bookMotion.js";
import { advanceFixedStep, interpolatePose } from "../../utils/bookAnimation.js";
const STEP = 1 / 120;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export function createSheepMovement(aspect = 1.5) {
  const width = 12 * Math.max(1, aspect), height = 12 / Math.min(1, aspect);
  const agents = Array.from({ length: 4 }, (_, id) => {
    const phase = id * Math.PI / 2;
    const x = width / 2 + Math.cos(phase) * width * 0.32;
    const y = height * (0.2 + id * 0.2) + Math.sin(phase) * height * 0.04;
    const heading = Math.atan2(Math.cos(phase) * height * 0.04, -Math.sin(phase) * width * 0.32);
    return { id, x, y, heading, phase, speed: 0, distance: 0, state: id % 3, stateAge: id * 0.37,
      previous: { x, y, heading } };
  });
  return { width, height, agents, time: 0, remainder: 0 };
}
export function advanceSheepMovement(m, controls, elapsed) {
  advanceFixedStep(m, elapsed, STEP, 1, () => {
    m.time += STEP;
    for (const a of m.agents) {
      Object.assign(a.previous, { x: a.x, y: a.y, heading: a.heading });
      a.stateAge += STEP;
      // A staggered demonstration schedule, not a fitted social transition model.
      const duration = a.state === 0 ? clamp(controls.pause_duration ?? 5, 0, 12) : a.state === 1 ? 8 : 3;
      if (a.stateAge >= duration) { a.state = (a.state + 1) % 3; a.stateAge = 0; }
      const target = a.state === 0 ? 0 : a.state === 1
        ? clamp(controls.walk_speed ?? 0.15, 0.05, 0.3) : clamp(controls.run_speed ?? 1.5, 0.5, 2);
      const change = clamp(target * BOOK_MOVEMENT_SCALE - a.speed, -2 * STEP, 2 * STEP);
      a.speed += change;
      const rx = m.width * 0.32, ry = m.height * 0.04;
      a.phase += a.speed * STEP / Math.hypot(rx * Math.sin(a.phase), ry * Math.cos(a.phase));
      a.x = m.width / 2 + Math.cos(a.phase) * rx;
      a.y = m.height * (0.2 + a.id * 0.2) + Math.sin(a.phase) * ry;
      a.heading = Math.atan2(Math.cos(a.phase) * ry, -Math.sin(a.phase) * rx);
      a.distance += a.speed * STEP;
    }
  });
}
export function sheepMovementPose(m, index, result = {}) {
  return interpolatePose(m.agents[index].previous, m.agents[index], m.remainder / STEP, result);
}

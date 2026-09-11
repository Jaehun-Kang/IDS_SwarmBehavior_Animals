import { advanceFixedStep, interpolatePose } from "../../utils/bookAnimation.js";
const STEP = 1 / 60;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export function createPenguinHuddle(aspect) {
  const width = 20 * Math.max(1, aspect), height = width / aspect;
  const agents = Array.from({ length: 24 }, (_, id) => ({
    id, x: width / 2 + (id % 6 - 2.5) * 2.3,
    y: height / 2 + (Math.floor(id / 6) - 1.5) * 2.3,
    heading: id * 2.399, speed: 0, distance: 0,
  }));
  return { width, height, agents, previous: agents.map(a => ({ ...a })), time: 0, remainder: 0 };
}
// A geometric wind-shadow diagram, not a fluid or heat-transfer calculation.
export function penguinWindExposure(point, agents, angle) {
  const dx = Math.cos(angle), dy = Math.sin(angle);
  let shelter = 0;
  for (const b of agents) {
    if (b.id === point.id) continue;
    const x = point.x - b.x, y = point.y - b.y;
    const along = x * dx + y * dy;
    const across = Math.abs(x * dy - y * dx);
    if (along > 0 && along < 5 && across < 0.65) {
      shelter += (1 - across / 0.65) * (1 - along / 5);
    }
  }
  return Math.exp(-shelter * 2);
}
function step(model, controls) {
  const reach = clamp(controls.neighbor_range ?? 4, 2, 6);
  const spacing = clamp(controls.body_spacing ?? 1.4, 1.1, 2.4);
  model.previous = model.agents.map(a => ({ ...a }));
  for (const a of model.agents) {
    const neighbors = model.previous.filter(b => b.id !== a.id)
      .map(b => ({ b, d: Math.hypot(b.x - a.x, b.y - a.y) }))
      .filter(n => n.d < Math.max(reach, spacing)).sort((a, b) => a.d - b.d).slice(0, 6);
    let fx = 0, fy = 0;
    for (const { b, d } of neighbors) {
      const force = d < spacing ? (d - spacing) * 2 : (d - spacing) * 0.3;
      fx += (b.x - a.x) / Math.max(d, 0.01) * force;
      fy += (b.y - a.y) / Math.max(d, 0.01) * force;
    }
    fx += Math.max(0, 2 - a.x) - Math.max(0, a.x - model.width + 2);
    fy += Math.max(0, 2 - a.y) - Math.max(0, a.y - model.height + 2);
    const strength = Math.hypot(fx, fy);
    const desired = strength > 0.015 ? Math.atan2(fy, fx) : a.heading;
    const turn = Math.atan2(Math.sin(desired - a.heading), Math.cos(desired - a.heading));
    a.heading += clamp(turn, -STEP * 1.6, STEP * 1.6);
    const speed = strength > 0.015 ? Math.min(0.8, strength) * Math.max(0, Math.cos(turn)) : 0;
    a.speed += (speed - a.speed) * (1 - Math.exp(-STEP * 5));
    a.x += Math.cos(a.heading) * a.speed * STEP;
    a.y += Math.sin(a.heading) * a.speed * STEP;
    a.distance += a.speed * STEP;
  }
  model.time += STEP;
}
export function advancePenguinHuddle(model, controls, elapsed) {
  advanceFixedStep(model, elapsed, STEP, 1, () => step(model, controls));
}
export function penguinHuddlePose(model, index, result = {}) {
  return interpolatePose(model.previous[index], model.agents[index], model.remainder / STEP, result);
}

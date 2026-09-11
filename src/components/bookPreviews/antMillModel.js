import { advanceFixedStep, interpolatePose } from "../../utils/bookAnimation.js";
import { createAntTrailField, sampleAntTrail, depositAntTrail, decayAntTrail } from "./antTrailField.js";
const STEP = 1 / 120;
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

export function createAntMill(aspect = 1.5) {
  const width = 48 * Math.max(1, aspect), height = 48 / Math.min(1, aspect);
  const cx = width * 0.45, cy = height * 0.5, radius = 9;
  const field = createAntTrailField(width, height);
  // Preset an existing loop to compare maintenance, not spontaneous mill formation.
  for (let y = 0; y < field.rows; y++) for (let x = 0; x < field.cols; x++) {
    const d = Math.hypot(x * field.cell - cx, y * field.cell - cy) - radius;
    field.values[y * field.cols + x] = 0.6 * Math.exp(-d * d / 0.6);
  }
  const agents = Array.from({ length: 28 }, (_, id) => {
    const angle = id / 28 * Math.PI * 2;
    const x = cx + Math.cos(angle) * radius, y = cy + Math.sin(angle) * radius;
    const heading = angle + Math.PI / 2;
    return { id, x, y, heading, previous: { x, y, heading }, speed: 3, distance: 0 };
  });
  return { width, height, field, agents, time: 0, remainder: 0, fieldClock: 0,
    showTrail: true, external: { x: cx, y: cy - radius, end: width * 0.85 } };
}

export function antMillSteering(field, agent) {
  const sense = angle => Math.atan(sampleAntTrail(field,
    agent.x + Math.cos(angle) * 1.5, agent.y + Math.sin(angle) * 1.5) * 3);
  return (sense(agent.heading + 0.5) - sense(agent.heading - 0.5)) * 5;
}

function update(model, controls) {
  model.time += STEP;
  model.fieldClock += STEP;
  if (model.fieldClock + 1e-10 >= 0.05) {
    decayAntTrail(model.field, model.fieldClock, controls.loop_half_life ?? 10);
    const amount = clamp((controls.external_signal ?? 0) / 100, 0, 1) * model.fieldClock * 3;
    for (let x = model.external.x; x <= model.external.end; x += model.field.cell)
      depositAntTrail(model.field, x, model.external.y, amount);
    model.fieldClock = 0;
  }
  const snapshot = model.agents.map(a => ({ id: a.id, x: a.x, y: a.y }));
  for (const a of model.agents) {
    Object.assign(a.previous, { x: a.x, y: a.y, heading: a.heading });
    let turn = antMillSteering(model.field, a);
    turn += Math.sin(model.time * 0.7 + a.id * 2.4) * 0.05;
    let pressure = 0;
    for (const other of snapshot) {
      if (a.id === other.id) continue;
      const dx = other.x - a.x, dy = other.y - a.y, d = Math.hypot(dx, dy);
      if (d < 1.2 && dx * Math.cos(a.heading) + dy * Math.sin(a.heading) > 0) {
        const side = Math.cos(a.heading) * dy - Math.sin(a.heading) * dx;
        turn -= Math.sign(side || (a.id < other.id ? 1 : -1)) * (1 - d / 1.2);
        pressure += 1 - d / 1.2;
      }
    }
    const edge = Math.min(a.x, model.width - a.x, a.y, model.height - a.y);
    if (edge < 10) {
      const desired = Math.atan2(model.height / 2 - a.y, model.width / 2 - a.x);
      const delta = Math.atan2(Math.sin(desired - a.heading), Math.cos(desired - a.heading));
      turn = turn * Math.max(0, edge / 10) + delta * (1 - Math.max(0, edge) / 10) * 4;
    }
    a.heading += clamp(turn, -3, 3) * STEP;
    const speed = 3 / (1 + pressure * 4);
    a.speed += (speed - a.speed) * (1 - Math.exp(-STEP * 8));
    a.x += Math.cos(a.heading) * a.speed * STEP;
    a.y += Math.sin(a.heading) * a.speed * STEP;
    a.distance += a.speed * STEP;
  }
  // Deposit after every sensor has read the old field, avoiding array-order bias.
  for (const a of model.agents) depositAntTrail(model.field, a.x, a.y,
    a.speed * STEP * clamp((controls.loop_reinforcement ?? 70) / 100, 0, 1) * 0.6);
}
export function advanceAntMill(model, controls, elapsed) {
  advanceFixedStep(model, elapsed, STEP, 0.65, () => update(model, controls));
}
export function antMillPose(model, index, result = {}) {
  return interpolatePose(model.agents[index].previous, model.agents[index], model.remainder / STEP, result);
}

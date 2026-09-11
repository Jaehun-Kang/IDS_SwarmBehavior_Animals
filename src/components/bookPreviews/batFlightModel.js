import { advanceFixedStep, interpolatePose } from "../../utils/bookAnimation.js";
const STEP = 1 / 120;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const hash = x => { const n = Math.sin(x * 127.1 + 31.7) * 43758.5453; return n - Math.floor(n); };
const angleDelta = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

export function createBatFlight(aspect = 1.5) {
  const width = 40 * Math.max(1, aspect), height = 40 / Math.min(1, aspect);
  const agents = Array.from({ length: 12 }, (_, id) => {
    const angle = Math.floor(id / 2) / 6 * Math.PI * 2 + id % 2 * 0.16;
    const x = width / 2 + Math.cos(angle) * width * 0.25;
    const y = height / 2 + Math.sin(angle) * height * 0.25;
    const heading = Math.atan2(Math.cos(angle) * height, -Math.sin(angle) * width);
    return { id, x, y, heading, speed: 9, previous: { x, y, heading },
      callClock: id / 12 * 0.2, calls: 0, heard: 0, echoes: [], pulses: [], distance: 0 };
  });
  return { width, height, agents, time: 0, remainder: 0 };
}

// Percentage controls compare sensory availability, not lux or measured detection rates.
export function batEchoVisible(agent, other, masking, callIndex) {
  const dx = other.x - agent.x, dy = other.y - agent.y, d = Math.hypot(dx, dy);
  if (d > 8 || d < 0.001 || Math.abs(angleDelta(agent.heading, Math.atan2(dy, dx))) > 1.25) return false;
  return hash(agent.id * 503 + other.id * 37 + callIndex * 71) >= clamp(masking / 100, 0, 1) * 0.95;
}

function update(model, controls) {
  model.time += STEP;
  const snapshot = model.agents.map(({ id, x, y }) => ({ id, x, y }));
  const light = clamp((controls.light_level ?? 30) / 100, 0, 1);
  for (const a of model.agents) {
    Object.assign(a.previous, { x: a.x, y: a.y, heading: a.heading });
    a.pulses = a.pulses.filter(p => model.time - p.time < 0.4);
    a.echoes = a.echoes.filter(p => model.time - p.time < 0.4);
    a.callClock += STEP;
    if (a.callClock >= 0.2) {
      a.callClock -= 0.2; a.calls++;
      const echoes = snapshot.filter(other => other.id !== a.id && batEchoVisible(a, other, controls.sound_masking ?? 30, a.calls));
      a.echoes = echoes.map(other => ({ ...other, time: model.time }));
      a.heard += echoes.length;
      a.pulses.push({ x: a.x, y: a.y, heading: a.heading, time: model.time });
    }
    const rx = (a.x - model.width / 2) / (model.width * 0.25);
    const ry = (a.y - model.height / 2) / (model.height * 0.25);
    const error = Math.hypot(rx, ry) - 1;
    // An interior exhibition route keeps the sensory comparison visible, not a cave-exit model.
    let dx = -ry * model.width / model.height - rx * error * 2;
    let dy = rx - ry * error * 2;
    const avoidance = (other, strength) => {
      const ox = a.x - other.x, oy = a.y - other.y, d = Math.hypot(ox, oy);
      if (d > 0.001 && d < 3) { dx += ox / d * (1 - d / 3) * strength; dy += oy / d * (1 - d / 3) * strength; }
    };
    for (const other of snapshot) if (other.id !== a.id) avoidance(other, light * 2);
    for (const other of a.echoes) avoidance(other, 2 * Math.exp(-(model.time - other.time) / 0.25));
    const edge = Math.min(a.x, model.width - a.x, a.y, model.height - a.y);
    if (edge < 9) {
      dx += (model.width / 2 - a.x) * (9 - edge) * 0.2;
      dy += (model.height / 2 - a.y) * (9 - edge) * 0.2;
    }
    a.speed += (clamp(controls.flight_speed ?? 9, 4, 12) - a.speed) * (1 - Math.exp(-STEP * 3));
    const maxTurn = 19.62 / a.speed;
    a.heading += clamp(angleDelta(a.heading, Math.atan2(dy, dx)), -maxTurn * STEP, maxTurn * STEP);
    a.x += Math.cos(a.heading) * a.speed * STEP;
    a.y += Math.sin(a.heading) * a.speed * STEP;
    a.distance += a.speed * STEP;
  }
}
export function advanceBatFlight(model, controls, elapsed) {
  advanceFixedStep(model, elapsed, STEP, 0.25, () => update(model, controls));
}
export function batFlightPose(model, index, result = {}) {
  return interpolatePose(model.agents[index].previous, model.agents[index], model.remainder / STEP, result);
}

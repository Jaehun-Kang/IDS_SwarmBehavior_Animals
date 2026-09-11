import { advanceFixedStep, interpolatePose } from "../../utils/bookAnimation.js";
import { createAntTrailField } from "./antTrailField.js";

const STEP = 1 / 120;
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const hash = x => { const n = Math.sin(x * 127.1 + 31.7) * 43758.5453; return n - Math.floor(n); };
const turnTo = (from, to) => Math.atan2(Math.sin(to - from), Math.cos(to - from));

export function createAntTraffic(aspect = 1.5) {
  const width = 48 * Math.max(1, aspect), height = 48 / Math.min(1, aspect);
  const home = { x: width * 0.2, y: height / 2 }, food = { x: width * 0.8, y: height / 2 };
  const agents = Array.from({ length: 40 }, (_, id) => {
    const x = home.x + 3 + hash(id + 7) * (food.x - home.x - 6);
    const y = height / 2 + (hash(id + 17) - 0.5) * 8;
    const returning = id % 2 === 0, heading = returning ? Math.PI : 0;
    return { id, x, y, heading, returning, carrying: false, speed: 3,
      previous: { x, y, heading }, trips: 0, distance: 0 };
  });
  const field = createAntTrailField(width, height);
  // A shared, established trail profile, not separate target lanes for each role.
  for (let row = 0; row < field.rows; row++) {
    for (let col = 0; col < field.cols; col++) {
      const x = col * field.cell, y = row * field.cell;
      const ends = clamp((x - home.x + 3) / 3, 0, 1) * clamp((food.x + 3 - x) / 3, 0, 1);
      field.values[row * field.cols + col] = Math.exp(-Math.pow((y - height / 2) / 3, 2)) * 0.15 * ends;
    }
  }
  return { width, height, home, food, agents, field, time: 0, remainder: 0, delivered: 0, traffic: true };
}

export function antTrafficResponse(agent, neighbors, model, controls) {
  const goal = agent.returning ? model.home : model.food;
  const gx = goal.x - agent.x, gy = goal.y - agent.y, length = Math.hypot(gx, gy) || 1;
  let dx = gx / length, dy = gy / length;
  const asymmetry = clamp((controls.yield_difference ?? 60) / 100, 0, 1);
  const responsiveness = agent.returning ? 1 : 1 + asymmetry * 2;
  let pressure = 0, interacting = false;
  for (const other of neighbors) {
    if (other.id === agent.id) continue;
    const ox = other.x - agent.x, oy = other.y - agent.y, d = Math.hypot(ox, oy);
    const forward = ox * Math.cos(agent.heading) + oy * Math.sin(agent.heading);
    if (d < 2.6 && forward > -0.25) {
      const weight = 1 - d / 2.6;
      pressure += weight;
      interacting = true;
      // Resolve head-on symmetry locally, not by assigning a left/right traffic lane.
      const side = Math.abs(oy) < 0.05 ? (hash(agent.id + other.id) < 0.5 ? -1 : 1) : -Math.sign(oy);
      dy += side * weight * responsiveness * 1.5;
      if (d > 0.01 && d < 1) { dx -= ox / d * (1 - d); dy -= oy / d * (1 - d); }
    }
  }
  dy += clamp((model.height / 2 - agent.y) / 8, -1, 1) * 0.4;
  const edge = Math.min(agent.x, model.width - agent.x, agent.y, model.height - agent.y);
  if (edge < 10) {
    const x = model.width / 2 - agent.x, y = model.height / 2 - agent.y, d = Math.hypot(x, y) || 1;
    dx += x / d * (10 - edge); dy += y / d * (10 - edge);
  }
  const targetHeading = Math.atan2(dy, dx);
  const turn = turnTo(agent.heading, targetHeading);
  const slowdown = clamp((controls.congestion_slowdown ?? 65) / 100, 0, 1);
  return { turn, turnRate: interacting ? 2.4 * responsiveness : 2.4,
    speed: 5 * Math.max(0.12, Math.cos(turn)) / (1 + pressure * slowdown * 5), pressure };
}

function update(model, controls) {
  model.time += STEP;
  const snapshot = model.agents.map(a => ({ ...a }));
  for (const a of model.agents) {
    Object.assign(a.previous, { x: a.x, y: a.y, heading: a.heading });
    const goal = a.returning ? model.home : model.food;
    if (Math.hypot(a.x - goal.x, a.y - goal.y) < 3) {
      if (a.returning) {
        if (a.carrying) model.delivered++;
        a.carrying = false;
        a.trips++;
      } else {
        a.carrying = hash(a.id + a.trips * 71) < clamp((controls.food_success ?? 60) / 100, 0, 1);
      }
      a.returning = !a.returning;
    }
    const response = antTrafficResponse(a, snapshot, model, controls);
    a.heading += clamp(response.turn, -response.turnRate * STEP, response.turnRate * STEP);
    a.speed += (response.speed - a.speed) * (1 - Math.exp(-STEP * 8));
    a.x += Math.cos(a.heading) * a.speed * STEP;
    a.y += Math.sin(a.heading) * a.speed * STEP;
    a.distance += a.speed * STEP;
  }
}
export function advanceAntTraffic(model, controls, elapsed) {
  advanceFixedStep(model, elapsed, STEP, 0.65, () => update(model, controls));
}
export function antTrafficPose(model, index, result = {}) {
  return interpolatePose(model.agents[index].previous, model.agents[index], model.remainder / STEP, result);
}

import { advanceFixedStep, interpolatePose } from "../../utils/bookAnimation.js";
import { createAntTrailField, depositAntTrail, decayAntTrail, antTrailTurn } from "./antTrailField.js";

const STEP = 1 / 120;
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const hash = (x) => { const n = Math.sin(x * 127.1 + 31.7) * 43758.5453; return n - Math.floor(n); };
const angleDelta = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
const unit = (x, y) => { const d = Math.hypot(x, y) || 1; return { x: x / d, y: y / d }; };

// A small excursion display, not a colony census or a food-triggered recruitment model.
export function createAntExploration(aspect = 1.5) {
  const width = 48 * Math.max(1, aspect), height = 48 / Math.min(1, aspect);
  const home = { x: width * 0.22, y: height * 0.5 };
  const agents = Array.from({ length: 36 }, (_, id) => {
    const angle = (hash(id + 12) - 0.5) * 1.8;
    const x = home.x + (id < 8 ? 2 + id * 0.8 : (hash(id + 20) - 0.5) * 6);
    const y = home.y + (hash(id + 41) - 0.5) * 9;
    return { id, x, y, heading: angle, previous: { x, y, heading: angle },
      state: id < 8 ? "outbound" : "reserve", trip: 0, target: null, speed: 0, distance: 0 };
  });
  return { width, height, home, agents, time: 0, remainder: 0, releaseClock: 0,
    field: createAntTrailField(width, height), fieldClock: 0 };
}

function setTarget(model, agent) {
  const h = hash(agent.id + agent.trip * 73);
  agent.target = { x: model.width * (0.58 + h * 0.18),
    y: model.height * (0.25 + hash(agent.id + 99 + agent.trip * 47) * 0.5) };
}

function update(model, controls) {
  model.time += STEP;
  const trails = controls.deposit_strength !== undefined;
  if (trails) {
    model.fieldClock += STEP;
    if (model.fieldClock + 1e-10 >= 0.05) {
      decayAntTrail(model.field, model.fieldClock, controls.trail_half_life ?? 8);
      model.fieldClock = 0;
    }
  }
  model.releaseClock = Math.min(0.3, model.releaseClock + STEP);
  const desired = Math.round(model.agents.length * clamp((controls.participation ?? 60) / 100, 0.2, 1));
  const active = model.agents.filter(a => a.state !== "reserve");
  if (active.length < desired && model.releaseClock >= 0.3) {
    const next = model.agents.find(a => a.state === "reserve");
    next.state = "outbound";
    next.target = null;
    model.releaseClock = 0;
  }
  // Reducing participation recalls ants; it never deletes or teleports them.
  for (let i = desired; i < active.length; i++) active[i].state = "returning";
  const speed = clamp(controls.walk_speed ?? 5, 2, 8);
  const exploration = clamp((controls.exploration ?? 35) / 100, 0, 1);
  const snapshot = model.agents.map(a => ({ x: a.x, y: a.y, state: a.state }));
  for (const a of model.agents) {
    Object.assign(a.previous, { x: a.x, y: a.y, heading: a.heading });
    if (a.state === "reserve") { a.speed = 0; continue; }
    if (!a.target) setTarget(model, a);
    const destination = a.state === "returning" ? model.home : a.target;
    const distance = Math.hypot(destination.x - a.x, destination.y - a.y);
    if (distance < (a.state === "returning" ? 3.5 : 3)) {
      if (a.state === "returning") { a.state = "reserve"; a.trip++; a.target = null; a.speed = 0; continue; }
      a.state = "returning";
    }
    const goal = a.state === "returning" ? model.home : a.target;
    const direction = unit(goal.x - a.x, goal.y - a.y);
    const wander = exploration * (Math.sin(model.time * 0.9 + a.id * 2.4) + Math.sin(model.time * 0.37 + a.id)) * 0.65;
    let dx = direction.x * Math.cos(wander) - direction.y * Math.sin(wander);
    let dy = direction.x * Math.sin(wander) + direction.y * Math.cos(wander);
    let crowd = 0;
    for (let i = 0; i < snapshot.length; i++) {
      if (i === a.id || snapshot[i].state === "reserve") continue;
      const ox = a.x - snapshot[i].x, oy = a.y - snapshot[i].y, d = Math.hypot(ox, oy);
      if (d > 0 && d < 1.2) { dx += ox / d * (1 - d / 1.2); dy += oy / d * (1 - d / 1.2); crowd++; }
    }
    const edge = Math.min(a.x, model.width - a.x, a.y, model.height - a.y);
    if (edge < 12) {
      const inward = unit(model.width / 2 - a.x, model.height / 2 - a.y);
      const weight = 4 * (1 - Math.max(0, edge) / 12);
      dx += inward.x * weight; dy += inward.y * weight;
    }
    const chemicalTurn = trails ? antTrailTurn(model.field, a.x, a.y, a.heading, controls.trail_following ?? 60) : 0;
    const turn = angleDelta(a.heading, Math.atan2(dy, dx)) + chemicalTurn;
    a.heading += clamp(turn, -2.4 * STEP, 2.4 * STEP);
    const desiredSpeed = speed * Math.max(0.15, Math.cos(turn)) / (1 + crowd * 0.3);
    a.speed += (desiredSpeed - a.speed) * (1 - Math.exp(-STEP * 7));
    const travel = a.speed * STEP;
    a.x += Math.cos(a.heading) * travel; a.y += Math.sin(a.heading) * travel;
    a.distance += travel;
    if (trails) depositAntTrail(model.field, a.x, a.y, travel * clamp(controls.deposit_strength / 100, 0, 1) * 0.6);
  }
}

export function advanceAntExploration(model, controls, elapsed) {
  advanceFixedStep(model, elapsed, STEP, 0.65, () => update(model, controls));
}
export function antExplorationPose(model, index, result = {}) {
  return interpolatePose(model.agents[index].previous, model.agents[index], model.remainder / STEP, result);
}

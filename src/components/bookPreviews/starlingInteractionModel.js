import { advanceFixedStep, interpolatePose } from "../../utils/bookAnimation.js";

const STEP = 1 / 120;
const SPEED = 9.5;
const SPACING = 0.55;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const delta = (from, to) => Math.atan2(Math.sin(to - from), Math.cos(to - from));
const snapshot = (agents) => agents.map((agent) => ({ ...agent }));

export function createInteractionModel(aspect = 1, count = 24) {
  const width = 10 * Math.max(1, aspect);
  const height = 10 * Math.max(1, 1 / aspect);
  const agents = Array.from({ length: count }, (_, id) => ({
    id,
    x: width / 2 + (id % 6 - 2.5) * 0.7,
    y: height / 2 + (Math.floor(id / 6) - 1.5) * 0.7,
    heading: Math.sin(id * 1.7) * 0.45,
  }));
  return { width, height, agents, previous: snapshot(agents), time: 0, remainder: 0 };
}

export function interactionForces(agent, agents, controls) {
  const neighbors = agents.filter((other) => other.id !== agent.id)
    .map((other) => ({ other, distance: Math.hypot(other.x - agent.x, other.y - agent.y) }))
    .sort((a, b) => a.distance - b.distance || a.other.id - b.other.id)
    .slice(0, clamp(Math.round(controls.neighbor_count), 1, Math.max(1, agents.length - 1)));
  const alignment = { x: 0, y: 0 }, cohesion = { x: 0, y: 0 }, avoidance = { x: 0, y: 0 };
  for (const { other } of neighbors) {
    alignment.x += Math.cos(other.heading) - Math.cos(agent.heading);
    alignment.y += Math.sin(other.heading) - Math.sin(agent.heading);
    cohesion.x += other.x - agent.x;
    cohesion.y += other.y - agent.y;
  }
  const n = neighbors.length || 1;
  const alignWeight = controls.alignment_strength / 100 * 1.6;
  const cohesionWeight = controls.cohesion_strength / 100 * 0.7;
  alignment.x *= alignWeight / n;
  alignment.y *= alignWeight / n;
  cohesion.x *= cohesionWeight / n;
  cohesion.y *= cohesionWeight / n;
  // Single-neighbor avoidance is a model choice, not a measured attention limit.
  const nearest = neighbors[0];
  if (nearest && nearest.distance < SPACING) {
    const strength = (1 - nearest.distance / SPACING) * controls.avoidance_priority / 100 * 6;
    const dx = agent.x - nearest.other.x, dy = agent.y - nearest.other.y;
    avoidance.x = (nearest.distance > 1e-8 ? dx / nearest.distance : agent.id < nearest.other.id ? -1 : 1) * strength;
    avoidance.y = (nearest.distance > 1e-8 ? dy / nearest.distance : 0) * strength;
  }
  return { alignment, cohesion, avoidance, neighborIds: neighbors.map(({ other }) => other.id) };
}

export function stepInteractionModel(model, controls, dt = STEP) {
  model.previous = snapshot(model.agents);
  for (const agent of model.agents) {
    const forces = interactionForces(agent, model.previous, controls);
    const drift = Math.sin(model.time * 0.7 + agent.id * 1.7) * 0.15;
    let x = Math.cos(agent.heading + drift), y = Math.sin(agent.heading + drift);
    for (const force of [forces.alignment, forces.cohesion, forces.avoidance]) {
      x += force.x;
      y += force.y;
    }
    // Only the page boundary supplies a nonlocal constraint; there is no flock-center attraction.
    const edge = Math.min(agent.x, model.width - agent.x, agent.y, model.height - agent.y);
    const pressure = clamp((3 - edge) / 1.4, 0, 1);
    const dx = model.width / 2 - agent.x, dy = model.height / 2 - agent.y;
    const length = Math.hypot(dx, dy) || 1;
    x = x * (1 - pressure) + dx / length * pressure * 3;
    y = y * (1 - pressure) + dy / length * pressure * 3;
    const turn = SPEED / 0.8 * dt;
    if (Math.hypot(x, y) > 1e-8) agent.heading += clamp(delta(agent.heading, Math.atan2(y, x)), -turn, turn);
    agent.x += Math.cos(agent.heading) * SPEED * dt;
    agent.y += Math.sin(agent.heading) * SPEED * dt;
  }
  model.time += dt;
}

export const interactionEngine = {
  step: STEP,
  create: createInteractionModel,
  advance(model, controls, elapsed) {
    advanceFixedStep(model, elapsed, STEP, 0.2, () => stepInteractionModel(model, controls));
  },
  pose(model, index, result) {
    return interpolatePose(model.previous[index], model.agents[index], model.remainder / STEP, result);
  },
};

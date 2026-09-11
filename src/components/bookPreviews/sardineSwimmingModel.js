import { advanceFixedStep, interpolatePose } from "../../utils/bookAnimation.js";

export const SWIM_STEP = 1 / 120;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
export function createSwimmingModel(aspect) {
  const width = 8 * Math.max(1, aspect), height = 8 * Math.max(1, 1 / aspect);
  const agents = Array.from({ length: 24 }, (_, id) => ({
    id, x: width / 2 + (id % 6 - 2.5) * 0.5 + Math.sin(id * 1.7) * 0.07,
    y: height / 2 + (Math.floor(id / 6) - 1.5) * 0.5,
    heading: Math.sin(id * 2) * 0.3, light: 1, fear: 0,
  }));
  return { agents, previous: agents.map(a => ({ ...a })), width, height, time: 0, remainder: 0 };
}

export function swimSeparation(agent, agents, strength) {
  let x = 0, y = 0;
  for (const other of agents) {
    if (agent.id === other.id) continue;
    const dx = agent.x - other.x, dy = agent.y - other.y;
    const distance = Math.hypot(dx, dy);
    if (distance >= 0.65) continue;
    const weight = (1 - distance / 0.65) * strength / 100 * 3;
    x += (distance > 1e-8 ? dx / distance : agent.id > other.id ? 1 : -1) * weight;
    y += (distance > 1e-8 ? dy / distance : 0) * weight;
  }
  return { x, y };
}

export function swimSocialForces(agent, agents, controls) {
  const radius = clamp(controls.neighbor_radius ?? 1.6, 0.6, 2.4);
  const alignmentWeight = clamp(controls.alignment_strength ?? 50, 0, 100) * 0.008;
  const cohesionWeight = clamp(controls.cohesion_strength ?? 50, 0, 100) * 0.006;
  const neighbours = agents.filter(other => other.id !== agent.id &&
    Math.hypot(other.x - agent.x, other.y - agent.y) < radius);
  const alignment = { x: 0, y: 0 }, cohesion = { x: 0, y: 0 };
  for (const other of neighbours) {
    alignment.x += Math.cos(other.heading) * alignmentWeight / neighbours.length;
    alignment.y += Math.sin(other.heading) * alignmentWeight / neighbours.length;
    cohesion.x += (other.x - agent.x) * cohesionWeight / neighbours.length;
    cohesion.y += (other.y - agent.y) * cohesionWeight / neighbours.length;
  }
  return { alignment, cohesion, neighbourIds: neighbours.map(a => a.id) };
}

export function swimLightResponse(agent, controls) {
  if (controls.light_level === undefined) return { controls, wander: 0.12 };
  const visual = agent.light;
  const retention = clamp(controls.night_cohesion ?? 20, 0, 100) / 100;
  return {
    controls: { ...controls,
      neighbor_radius: 0.6 + visual,
      alignment_strength: 50 * (0.05 + 0.95 * visual),
      cohesion_strength: 50 * (retention + (1 - retention) * visual),
    },
    wander: 0.12 + (1 - visual) * 0.9,
  };
}

export function swimThreatResponse(agent, controls, predator) {
  if (controls.threat_strength === undefined) return { controls, x: 0, y: 0 };
  const dx = predator ? agent.x - predator.x : 0;
  const dy = predator ? agent.y - predator.y : 0;
  const distance = Math.hypot(dx, dy);
  const target = predator ? clamp(1 - distance / 2.4, 0, 1) *
    clamp(controls.threat_strength, 0, 100) / 100 : 0;
  const tau = target > agent.fear ? 0.12 : clamp(controls.recovery_time ?? 2, 1, 5);
  agent.fear += (target - agent.fear) * (1 - Math.exp(-SWIM_STEP / tau));
  const force = predator && distance < 2.4 ? agent.fear * 4 : 0;
  return {
    controls: { ...controls,
      alignment_strength: 50 * (1 - 0.65 * agent.fear),
      cohesion_strength: 50 + clamp(controls.threat_cohesion ?? 50, 0, 100) * 0.5 * agent.fear,
    },
    x: force === 0 ? 0 : distance > 1e-8 ? dx / distance * force : Math.cos(agent.heading + Math.PI / 2) * force,
    y: force === 0 ? 0 : distance > 1e-8 ? dy / distance * force : Math.sin(agent.heading + Math.PI / 2) * force,
  };
}

export function stepSwimmingModel(model, controls, predator = null) {
  const snapshot = model.agents.map(a => ({ ...a }));
  model.previous = snapshot;
  const speed = clamp(controls.swim_speed ?? 0.9, 0.5, 1.6);
  const maxTurn = clamp(controls.turn_rate ?? 160, 100, 220) * Math.PI / 180 * SWIM_STEP;
  for (let index = 0; index < model.agents.length; index += 1) {
    const agent = model.agents[index], old = snapshot[index];
    if (controls.light_level !== undefined) {
      const targetLight = clamp(controls.light_level, 0, 100) / 100;
      // Individual response spread and short transition times are exhibition settings.
      const tau = clamp(controls.adaptation_time ?? 2, 1, 5) * (0.8 + (old.id % 7) / 15);
      agent.light += (targetLight - agent.light) * (1 - Math.exp(-SWIM_STEP / tau));
    }
    const response = swimLightResponse(agent, controls);
    const threat = swimThreatResponse(agent, response.controls, predator);
    const separation = swimSeparation(old, snapshot, clamp(controls.spacing_strength ?? 50, 0, 100));
    let x = Math.cos(old.heading) + separation.x;
    let y = Math.sin(old.heading) + separation.y + Math.sin(model.time * 0.7 + old.id) * response.wander;
    if (controls.light_level !== undefined) {
      const wander = Math.sin(model.time * 0.7 + old.id) * response.wander;
      x -= Math.sin(old.heading) * wander;
      y += (Math.cos(old.heading) - 1) * wander;
    }
    const { alignment, cohesion } = swimSocialForces(old, snapshot, threat.controls);
    x += alignment.x + cohesion.x + threat.x;
    y += alignment.y + cohesion.y + threat.y;
    // Page containment is separate from the adjustable local interaction.
    const edge = Math.min(old.x, model.width - old.x, old.y, model.height - old.y);
    const pressure = clamp((2.8 - edge) / 1.2, 0, 1);
    const dx = model.width / 2 - old.x, dy = model.height / 2 - old.y;
    const distance = Math.hypot(dx, dy) || 1;
    x = x * (1 - pressure) + dx / distance * pressure * 3;
    y = y * (1 - pressure) + dy / distance * pressure * 3;
    const target = Math.atan2(y, x);
    const difference = Math.atan2(Math.sin(target - old.heading), Math.cos(target - old.heading));
    agent.heading += clamp(difference, -maxTurn, maxTurn);
    agent.x += Math.cos(agent.heading) * speed * SWIM_STEP;
    agent.y += Math.sin(agent.heading) * speed * SWIM_STEP;
  }
  model.time += SWIM_STEP;
}

export function advanceSwimmingModel(model, controls, elapsed, predator = null) {
  advanceFixedStep(model, elapsed, SWIM_STEP, 0.35, () => stepSwimmingModel(model, controls, predator));
}
export function swimmingPose(model, index, result = {}) {
  return interpolatePose(model.previous[index], model.agents[index], model.remainder / SWIM_STEP, result);
}

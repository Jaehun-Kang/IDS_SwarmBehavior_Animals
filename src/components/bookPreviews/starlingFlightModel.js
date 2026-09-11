import { advanceFixedStep, interpolatePose } from "../../utils/bookAnimation.js";

export const FLIGHT_STEP_S = 1 / 120;
export const FLIGHT_PLAYBACK_RATE = 0.2;
const HISTORY_SECONDS = 0.2;
const TURN_RADIUS_M = 0.8;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const normalize = (x, y) => {
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length };
};
const angleDelta = (from, to) => Math.atan2(Math.sin(to - from), Math.cos(to - from));
const snapshot = (agents) => agents.map(({ id, x, y, heading }) => ({ id, x, y, heading }));

export function createFlightModel(aspect = 1, count = 24) {
  const width = 10 * Math.max(1, aspect);
  const height = 10 * Math.max(1, 1 / aspect);
  const agents = Array.from({ length: count }, (_, id) => {
    const column = id % 6;
    const row = Math.floor(id / 6);
    return {
      id,
      x: width * 0.5 + (column - 2.5) * 0.7,
      y: height * 0.35 + (row - 1.5) * 0.7,
      heading: 0.12 * Math.sin(id * 1.7),
    };
  });
  return { width, height, time: 0, remainder: 0, agents,
    history: [{ time: 0, agents: snapshot(agents) }] };
}

export function sampleFlightHistory(history, targetTime) {
  for (let i = history.length - 1; i > 0; i -= 1) {
    if (history[i].time <= targetTime) return history[i].agents;
    if (history[i - 1].time <= targetTime) {
      const before = history[i - 1];
      const after = history[i];
      const ratio = (targetTime - before.time) / (after.time - before.time);
      return before.agents.map((agent, index) => ({
        ...agent,
        x: agent.x + (after.agents[index].x - agent.x) * ratio,
        y: agent.y + (after.agents[index].y - agent.y) * ratio,
        heading: agent.heading + angleDelta(agent.heading, after.agents[index].heading) * ratio,
      }));
    }
  }
  return history[0].agents;
}

export function lateralNeighborWeight(heading, dx, dy, influence) {
  const relative = Math.atan2(dy, dx) - heading;
  return 1 + Math.abs(Math.sin(relative)) * influence / 100 * 2;
}

export function spacingRepulsion(agent, neighbors, minimumSpacing) {
  const force = { x: 0, y: 0 };
  for (const other of neighbors) {
    const dx = agent.x - other.x;
    const dy = agent.y - other.y;
    const distance = Math.hypot(dx, dy);
    if (distance >= minimumSpacing) continue;
    // Stable opposite directions also separate two exactly overlapping agents.
    const away = distance > 1e-8 ? normalize(dx, dy) :
      { x: agent.id < other.id ? -1 : 1, y: 0 };
    const strength = (1 - distance / minimumSpacing) * 5;
    force.x += away.x * strength;
    force.y += away.y * strength;
  }
  return force;
}

export function stepFlightModel(model, controls, dt = FLIGHT_STEP_S) {
  const sensed = sampleFlightHistory(model.history, model.time - controls.reaction_time);
  const current = snapshot(model.agents);
  for (const agent of model.agents) {
    const neighbors = sensed.filter((other) => other.id !== agent.id)
      .map((other) => ({ other, distance: Math.hypot(other.x - agent.x, other.y - agent.y) }))
      .sort((a, b) => a.distance - b.distance).slice(0, 7);
    let ax = 0, ay = 0, cx = 0, cy = 0, total = 0;
    for (const { other } of neighbors) {
      const weight = lateralNeighborWeight(agent.heading,
        other.x - agent.x, other.y - agent.y, controls.lateral_influence);
      ax += Math.cos(other.heading) * weight;
      ay += Math.sin(other.heading) * weight;
      cx += (other.x - agent.x) * weight;
      cy += (other.y - agent.y) * weight;
      total += weight;
    }
    const separation = spacingRepulsion(agent,
      current.filter((other) => other.id !== agent.id), controls.minimum_spacing);
    const rx = (agent.x - model.width / 2) / (model.width * 0.34);
    const ry = (agent.y - model.height / 2) / (model.height * 0.34);
    const radialError = Math.hypot(rx, ry) - 1;
    // An interior circulation field keeps this bounded book demonstration in view.
    const route = normalize(-ry - rx * radialError * 2, rx - ry * radialError * 2);
    let dx = route.x * 0.65 + ax / (total || 1) + cx / (total || 1) * 0.14 + separation.x;
    let dy = route.y * 0.65 + ay / (total || 1) + cy / (total || 1) * 0.14 + separation.y;
    const edgeDistance = Math.min(agent.x, model.width - agent.x, agent.y, model.height - agent.y);
    const pressure = clamp((2 - edgeDistance) / 1.5, 0, 1);
    const inward = normalize(model.width / 2 - agent.x, model.height / 2 - agent.y);
    dx = dx * (1 - pressure) + inward.x * pressure * 3;
    dy = dy * (1 - pressure) + inward.y * pressure * 3;
    const turn = controls.flight_speed / TURN_RADIUS_M * dt;
    agent.heading += clamp(angleDelta(agent.heading, Math.atan2(dy, dx)), -turn, turn);
    agent.x += Math.cos(agent.heading) * controls.flight_speed * dt;
    agent.y += Math.sin(agent.heading) * controls.flight_speed * dt;
  }
  model.time += dt;
  model.history.push({ time: model.time, agents: snapshot(model.agents) });
  while (model.history.length > 2 && model.history[1].time < model.time - HISTORY_SECONDS) {
    model.history.shift();
  }
}

export function advanceFlightModel(model, controls, elapsedSeconds) {
  advanceFixedStep(model, elapsedSeconds, FLIGHT_STEP_S, FLIGHT_PLAYBACK_RATE,
    () => stepFlightModel(model, controls));
}

export function getFlightRenderPose(model, index, result = {}) {
  const current = model.agents[index];
  const previous = model.history.at(-2)?.agents[index] ?? current;
  const alpha = clamp(model.remainder / FLIGHT_STEP_S, 0, 1);
  return interpolatePose(previous, current, alpha, result);
}

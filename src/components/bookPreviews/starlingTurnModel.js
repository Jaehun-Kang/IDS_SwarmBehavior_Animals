import { BOOK_MOVEMENT_SCALE } from "./bookMotion.js";
import { advanceFixedStep, interpolatePose } from "../../utils/bookAnimation.js";

export const TURN_STEP_S = 1 / 120;
export const TURN_SPEED = 9.5 * BOOK_MOVEMENT_SCALE;
const ANGLE = Math.PI / 2;
const copy = (agent) => ({ ...agent });

export function createTurnModel(aspect, count = 24) {
  const agents = Array.from({ length: count }, (_, id) => ({
    id, x: (id % 6) * 0.8 + Math.sin(id * 1.7) * 0.14,
    y: Math.floor(id / 6) * 0.8 + Math.cos(id * 2.3) * 0.14,
    heading: 0, bank: 0, start: Infinity, turned: ANGLE,
  }));
  return { agents, previous: agents.map(copy), aspect, time: 0, remainder: 0,
    nextEvent: 0.25, event: 0, direction: 1 };
}

function beginTurn(model) {
  model.event += 1;
  model.direction = model.event % 2 ? 1 : -1;
  const heading = model.agents[0].heading;
  const projection = (a) => a.x * Math.cos(heading) + a.y * Math.sin(heading);
  const first = [...model.agents].sort((a, b) =>
    projection(b) - projection(a) || a.id - b.id)[0];
  for (const agent of model.agents) {
    agent.start = agent === first ? model.time : Infinity;
    agent.turned = 0;
  }
  model.nextEvent = Infinity;
}

export function stepTurnModel(model, controls) {
  if (model.time >= model.nextEvent) beginTurn(model);
  const dt = TURN_STEP_S;
  const previous = model.agents.map(copy);
  model.previous = previous;
  const radius = Math.max(5, Math.min(30, controls.turn_radius ?? 15));
  const signalSpeed = Math.max(20, Math.min(40, controls.turn_wave_speed ?? 30));
  const bankLimit = Math.max(0, Math.min(60, controls.bank_angle ?? 23)) * Math.PI / 180;
  for (let index = 0; index < model.agents.length; index += 1) {
    const agent = model.agents[index];
    const old = previous[index];
    if (!Number.isFinite(old.start)) {
      // A local neighbour can relay an event only after receiving it itself.
      const neighbours = previous.filter((other) => other.id !== old.id)
        .map((other) => ({ other, distance: Math.hypot(other.x - old.x, other.y - old.y) }))
        .sort((a, b) => a.distance - b.distance || a.other.id - b.other.id).slice(0, 6);
      for (const { other, distance } of neighbours) {
        if (other.start <= model.time) {
          agent.start = Math.min(agent.start, model.time + distance / signalSpeed);
        }
      }
    }
    const activeDt = Math.max(0, Math.min(dt, model.time + dt - agent.start));
    const turn = Math.min(ANGLE - agent.turned, TURN_SPEED / radius * activeDt);
    agent.turned += turn;
    // Midpoint integration preserves speed without rotating positions around a flock centre.
    const midHeading = agent.heading + model.direction * turn / 2;
    agent.x += Math.cos(midHeading) * TURN_SPEED * dt;
    agent.y += Math.sin(midHeading) * TURN_SPEED * dt;
    agent.heading += model.direction * turn;
    const desiredBank = bankLimit * Math.sin(agent.turned / ANGLE * Math.PI);
    agent.bank += (desiredBank - agent.bank) * (1 - Math.exp(-dt * 10));
  }
  model.time += dt;
  if (model.nextEvent === Infinity && model.agents.every((a) => a.turned >= ANGLE - 1e-10)) {
    model.nextEvent = model.time + 0.65;
  }
}

export function turnPose(model, index, result = {}) {
  const alpha = model.remainder / TURN_STEP_S;
  interpolatePose(model.previous[index], model.agents[index], alpha, result);
  result.bank = model.previous[index].bank +
    (model.agents[index].bank - model.previous[index].bank) * alpha;
  return result;
}

export function turnViewport(model) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const pose = {};
  for (let index = 0; index < model.agents.length; index += 1) {
    turnPose(model, index, pose);
    minX = Math.min(minX, pose.x); maxX = Math.max(maxX, pose.x);
    minY = Math.min(minY, pose.y); maxY = Math.max(maxY, pose.y);
  }
  // A following camera frames the demonstration; it never pushes agents into an orbit.
  const width = Math.max(10, 10 * model.aspect, maxX - minX + 4,
    (maxY - minY + 4) * model.aspect);
  return { x: (minX + maxX - width) / 2,
    y: (minY + maxY - width / model.aspect) / 2, width };
}

export const turnEngine = {
  create: createTurnModel,
  step: TURN_STEP_S,
  pose: turnPose,
  viewport: turnViewport,
  advance(model, controls, elapsed) {
    advanceFixedStep(model, elapsed, TURN_STEP_S, 0.2, () => stepTurnModel(model, controls));
  },
};

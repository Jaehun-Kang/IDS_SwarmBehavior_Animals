import { BOOK_MOVEMENT_SCALE } from "./bookMotion.js";
import { advanceFixedStep, interpolatePose } from "../../utils/bookAnimation.js";
export const FLIGHT_STEP = 1 / 120;
const clamp = (v, low, high) => Math.max(low, Math.min(high, v));
export function createLocustFlight(aspect) {
  const agents = Array.from({ length: 16 }, (_, id) => ({ id,
    x: (id % 4 - 1.5) * 2.2 + Math.sin(id * 1.7) * 0.65,
    y: (Math.floor(id / 4) - 1.5) * 2.2 + Math.cos(id * 2.3) * 0.65,
    heading: Math.PI + Math.sin(id) * 0.1, activity: 0,
    vx: 0, vy: 0, trail: [],
  }));
  return { aspect, agents, previous: agents.map(a => ({ ...a })), remainder: 0, time: 0, ticks: 0 };
}
export function locustFlightVelocity(agent, controls) {
  const wind = clamp(controls.wind_speed ?? 2, 0, 6);
  const angle = (controls.wind_direction ?? 0) * Math.PI / 180;
  return {
    x: agent.activity * (Math.cos(agent.heading) * 4 + Math.cos(angle) * wind),
    y: agent.activity * (Math.sin(agent.heading) * 4 + Math.sin(angle) * wind),
  };
}
export function stepLocustFlight(model, controls) {
  model.previous = model.agents.map(a => ({ ...a }));
  // Temperature response and the upwind comparison are exhibition assumptions.
  const targetActivity = clamp(((controls.temperature ?? 30) - 20) / 10, 0, 1);
  const wind = clamp(controls.wind_speed ?? 2, 0, 6);
  const targetHeading = (controls.wind_direction ?? 0) * Math.PI / 180 + Math.PI;
  for (const a of model.agents) {
    a.activity += (targetActivity - a.activity) * (1 - Math.exp(-FLIGHT_STEP / (0.7 + a.id * 0.04)));
    if (wind > 0.01) {
      const desired = targetHeading + Math.sin(model.time * 0.7 + a.id) * 0.12;
      const delta = Math.atan2(Math.sin(desired - a.heading), Math.cos(desired - a.heading));
      a.heading += clamp(delta, -1.2 * FLIGHT_STEP, 1.2 * FLIGHT_STEP) * a.activity;
    }
    const velocity = locustFlightVelocity(a, controls);
    a.vx = velocity.x * BOOK_MOVEMENT_SCALE; a.vy = velocity.y * BOOK_MOVEMENT_SCALE;
    a.x += a.vx * FLIGHT_STEP; a.y += a.vy * FLIGHT_STEP;
    if (model.ticks % 6 === 0) {
      a.trail.push({ x: a.x, y: a.y });
      if (a.trail.length > 16) a.trail.shift();
    }
  }
  model.time += FLIGHT_STEP; model.ticks++;
}
export function advanceLocustFlight(model, controls, elapsed) {
  advanceFixedStep(model, elapsed, FLIGHT_STEP, 0.5, () => stepLocustFlight(model, controls));
}
export function locustFlightPose(model, index, result = {}) {
  const alpha = model.remainder / FLIGHT_STEP, a = model.agents[index], old = model.previous[index];
  interpolatePose(old, a, alpha, result);
  result.activity = old.activity + (a.activity - old.activity) * alpha;
  return result;
}
export function locustFlightViewport(model) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const pose = {};
  for (let i = 0; i < model.agents.length; i++) {
    locustFlightPose(model, i, pose);
    minX = Math.min(minX, pose.x); maxX = Math.max(maxX, pose.x);
    minY = Math.min(minY, pose.y); maxY = Math.max(maxY, pose.y);
  }
  const width = Math.max(18, 18 * model.aspect, maxX-minX+8, (maxY-minY+8)*model.aspect);
  return { width, x: (minX+maxX-width)/2, y: (minY+maxY-width/model.aspect)/2 };
}

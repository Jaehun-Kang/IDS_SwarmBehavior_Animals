import { BOOK_MOVEMENT_SCALE } from "./bookMotion.js";
import { advanceFixedStep, interpolatePose } from "../../utils/bookAnimation.js";

export const LOCUST_STEP = 1 / 120;
const clamp = (v, low, high) => Math.max(low, Math.min(high, v));
const hash = (id, cycle) => {
  const value = Math.sin(id * 127.1 + cycle * 311.7 + 19) * 43758.5453;
  return value - Math.floor(value);
};
export function createLocustGroundModel(aspect) {
  const width = 40 * Math.max(1, aspect), height = 40 * Math.max(1, 1 / aspect);
  const agents = Array.from({ length: 12 }, (_, id) => ({
    id, x: width * (0.3 + (id % 4) * 0.12),
    y: height * (0.35 + Math.floor(id / 4) * 0.15), z: 0,
    heading: hash(id, 0) * Math.PI * 2, targetHeading: 0,
    state: "walk", remaining: 0.3 + hash(id, 1) * 3,
    cycle: 0, hopTime: 0, hopLength: 4, responseCooldown: 0, feedingCooldown: 0, satiety: 0,
  }));
  return { width, height, agents, previous: agents.map(a => ({ ...a })), remainder: 0, time: 0 };
}
function enter(agent, state, duration) {
  agent.state = state;
  agent.remaining = duration;
}
export function locustSocialForce(agent, agents, controls) {
  const separation = { x: 0, y: 0 }, alignment = { x: 0, y: 0 }, attraction = { x: 0, y: 0 };
  const neighbours = [];
  for (const other of agents) {
    if (other.id === agent.id) continue;
    const dx = other.x - agent.x, dy = other.y - agent.y, distance = Math.hypot(dx, dy);
    if (distance >= 12) continue;
    neighbours.push(other.id);
    if (distance < 3) {
      const weight = (1 - distance / 3) * clamp(controls.separation_strength ?? 60, 0, 100) / 100 * 3;
      separation.x -= (distance > 1e-8 ? dx / distance : agent.id < other.id ? 1 : -1) * weight;
      separation.y -= (distance > 1e-8 ? dy / distance : 0) * weight;
    } else if (distance < 8) {
      if (other.state === "walk" || other.state === "hop") {
        alignment.x += Math.cos(other.heading);
        alignment.y += Math.sin(other.heading);
      }
    } else {
      attraction.x += dx / distance;
      attraction.y += dy / distance;
    }
  }
  const count = Math.max(1, neighbours.length);
  const alignWeight = clamp(controls.alignment_strength ?? 60, 0, 100) / 100 * 2 / count;
  const attractWeight = clamp(controls.attraction_strength ?? 30, 0, 100) / 100 / count;
  alignment.x *= alignWeight; alignment.y *= alignWeight;
  attraction.x *= attractWeight; attraction.y *= attractWeight;
  return { separation, alignment, attraction, neighbourIds: neighbours };
}
export function locustFoodTargets(model) {
  return [{ x: model.width * 0.4, y: model.height * 0.48 },
    { x: model.width * 0.65, y: model.height * 0.62 }];
}
export function locustStimulus(agent, agents, controls, predator, foods) {
  const hunger = clamp(controls.hunger ?? 0, 0, 100) / 100 * (1 - agent.satiety);
  let x = 0, y = 0, rear = false;
  for (const other of agents) {
    if (other.id === agent.id) continue;
    const dx = other.x-agent.x, dy = other.y-agent.y, distance = Math.hypot(dx,dy);
    if (distance < 1e-8 || distance > 8) continue;
    const forward = (dx*Math.cos(agent.heading)+dy*Math.sin(agent.heading))/distance;
    if (forward > 0.5) { x += dx/distance*hunger; y += dy/distance*hunger; }
    if (forward < -0.5 && distance < 4 && hunger > 0.2) rear = true;
  }
  const threat = predator && Math.hypot(agent.x-predator.x,agent.y-predator.y) <
    clamp(controls.escape_strength ?? 6,2,10);
  const food = foods.find(p => Math.hypot(p.x-agent.x,p.y-agent.y)<4);
  return { x, y, rear, threat: Boolean(threat), food };
}
export function stepLocustGround(model, controls, predator = null) {
  model.previous = model.agents.map(a => ({ ...a }));
  const speed = clamp(controls.walk_speed ?? 1.1, 0.5, 3) * BOOK_MOVEMENT_SCALE;
  const pause = clamp(controls.pause_duration ?? 1.5, 0.5, 4);
  const foodMode = controls.hunger !== undefined;
  const foods = foodMode ? locustFoodTargets(model) : [];
  for (const a of model.agents) {
    let stimulus;
    if (foodMode) {
      a.responseCooldown = Math.max(0,a.responseCooldown-LOCUST_STEP);
      a.feedingCooldown = Math.max(0,a.feedingCooldown-LOCUST_STEP);
      a.satiety = Math.max(0,a.satiety-LOCUST_STEP*0.025);
      stimulus = locustStimulus(a,model.previous,controls,predator,foods);
      if (a.state !== "hop" && a.state !== "land" && a.responseCooldown === 0 && (stimulus.threat || stimulus.rear)) {
        a.targetHeading = stimulus.threat ? Math.atan2(a.y-predator.y,a.x-predator.x) : a.heading;
        const delta = Math.atan2(Math.sin(a.targetHeading-a.heading),Math.cos(a.targetHeading-a.heading));
        enter(a,"prepare",Math.max(0.3,Math.abs(delta)/1.8));
        a.responseCooldown = 3;
      } else if (a.state === "walk" && !stimulus.threat && !stimulus.rear && stimulus.food &&
          a.feedingCooldown === 0 && (controls.feeding_duration ?? 2)>0) {
        enter(a,"feeding",clamp(controls.feeding_duration ?? 2,0,5));
        a.feedingCooldown = 8;
      }
      if (a.state === "feeding") a.satiety = Math.min(1,a.satiety+LOCUST_STEP*0.3);
    }
    a.remaining -= LOCUST_STEP;
    if (a.remaining <= 1e-9) {
      if (a.state === "walk") {
        a.cycle++;
        enter(a, "pause", pause * (0.7 + hash(a.id, a.cycle) * 0.6));
        a.targetHeading = a.heading + (hash(a.id + 20, a.cycle) - 0.5) * pause;
      } else if (a.state === "pause") {
        enter(a, "prepare", 0.3);
      } else if (a.state === "prepare") {
        // Choose direction before launch; airborne motion never redirects at page edges.
        const length = clamp(controls.hop_distance ?? 4, 2, 8);
        const endX = a.x + Math.cos(a.heading) * length;
        const endY = a.y + Math.sin(a.heading) * length;
        if (endX < 5 || endX > model.width - 5 || endY < 5 || endY > model.height - 5) {
          a.targetHeading = Math.atan2(model.height / 2 - a.y, model.width / 2 - a.x);
          enter(a, "prepare", 0.1);
        } else {
          a.hopLength = length;
          a.hopTime = 0;
          enter(a, "hop", 0.6);
        }
      } else if (a.state === "hop") {
        a.z = 0;
        enter(a, "land", 0.18);
      } else {
        enter(a, "walk", 1.5 + hash(a.id + 40, a.cycle) * 3);
      }
    }
    if (a.state === "hop") {
      const dt = Math.min(LOCUST_STEP, 0.6 - a.hopTime);
      a.x += Math.cos(a.heading) * a.hopLength / 0.6 * dt;
      a.y += Math.sin(a.heading) * a.hopLength / 0.6 * dt;
      a.hopTime += dt;
      const t = a.hopTime / 0.6;
      a.z = 4 * 2 * t * (1 - t);
    } else if (a.state !== "land" && a.state !== "feeding") {
      const edge = Math.min(a.x, model.width - a.x, a.y, model.height - a.y);
      let desired = a.state === "walk"
        ? edge < 12 ? Math.atan2(model.height / 2 - a.y, model.width / 2 - a.x)
          : a.heading + Math.sin(model.time * 0.5 + a.id) * 0.08
        : a.targetHeading;
      if (controls.alignment_strength !== undefined && edge >= 12 && a.state === "walk") {
        const { separation, alignment, attraction } = locustSocialForce(a, model.previous, controls);
        desired = Math.atan2(Math.sin(desired) + separation.y + alignment.y + attraction.y,
          Math.cos(desired) + separation.x + alignment.x + attraction.x);
      }
      if (foodMode && edge >= 12 && a.state === "walk") {
        desired = Math.atan2(Math.sin(desired)+stimulus.y,Math.cos(desired)+stimulus.x);
      }
      const delta = Math.atan2(Math.sin(desired - a.heading), Math.cos(desired - a.heading));
      a.heading += clamp(delta, -1.8 * LOCUST_STEP, 1.8 * LOCUST_STEP);
      if (a.state === "walk") {
        a.x += Math.cos(a.heading) * speed * LOCUST_STEP;
        a.y += Math.sin(a.heading) * speed * LOCUST_STEP;
      }
    }
  }
  model.time += LOCUST_STEP;
}
export function advanceLocustGround(model, controls, elapsed, predator = null) {
  advanceFixedStep(model, elapsed, LOCUST_STEP, 1, () => stepLocustGround(model, controls,predator));
}
export function locustGroundPose(model, index, result = {}) {
  const a = model.agents[index], old = model.previous[index];
  const alpha = model.remainder / LOCUST_STEP;
  interpolatePose(old, a, alpha, result);
  result.z = old.z + (a.z - old.z) * alpha;
  result.state = a.state;
  return result;
}

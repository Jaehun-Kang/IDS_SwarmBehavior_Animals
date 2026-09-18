import { BOOK_MOVEMENT_SCALE } from "./bookMotion.js";
import { advanceFixedStep, interpolatePose } from "../../utils/bookAnimation.js";
const STEP = 1 / 60;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export function createPenguinHuddle(aspect) {
  const width = 20 * Math.max(1, aspect), height = width / aspect;
  const agents = Array.from({ length: 24 }, (_, id) => ({
    id, x: width / 2 + (id % 6 - 2.5) * 2.3,
    y: height / 2 + (Math.floor(id / 6) - 1.5) * 2.3,
    heading: id * 2.399, speed: 0, distance: 0,
  }));
  return { width, height, agents, previous: agents.map(a => ({ ...a })), time: 0, remainder: 0 };
}
export function createPenguinCooling(aspect) {
  const model = createPenguinHuddle(aspect);
  model.cooling = true;
  for (const a of model.agents) {
    a.x=model.width/2+(a.x-model.width/2)*0.65;
    a.y=model.height/2+(a.y-model.height/2)*0.65;
    a.warmth=0.2+(a.id%7)*0.04; a.loose=false; a.transitions=0;
  }
  model.previous=model.agents.map(a=>({...a}));
  return model;
}
// A geometric wind-shadow diagram, not a fluid or heat-transfer calculation.
export function penguinWindExposure(point, agents, angle) {
  const dx = Math.cos(angle), dy = Math.sin(angle);
  let shelter = 0;
  for (const b of agents) {
    if (b.id === point.id) continue;
    const x = point.x - b.x, y = point.y - b.y;
    const along = x * dx + y * dy;
    const across = Math.abs(x * dy - y * dx);
    if (along > 0 && along < 5 && across < 0.65) {
      shelter += (1 - across / 0.65) * (1 - along / 5);
    }
  }
  return Math.exp(-shelter * 2);
}
function step(model, controls) {
  const reach = model.cooling ? 7 : clamp(controls.neighbor_range ?? 4, 2, 6);
  model.previous = model.agents.map(a => ({ ...a }));
  for (const a of model.agents) {
    if (model.cooling) {
      // Dimensionless exhibition cycle; neither skin nor core temperature.
      const nearby=model.previous.filter(b=>b.id!==a.id && Math.hypot(b.x-a.x,b.y-a.y)<2.5).length;
      const change=a.loose ? -0.12*clamp(controls.cooling_rate??1,0.5,3)
        : clamp(controls.heat_gain??60,20,100)/100*(0.06+Math.min(1,nearby/4)*0.12);
      a.warmth=clamp(a.warmth+change*STEP,0,1);
      const upper=0.75+(a.id%5)*0.02;
      if ((!a.loose && a.warmth>upper) || (a.loose && a.warmth<0.25)) {
        a.loose=!a.loose; a.transitions++;
      }
    }
    const spacing=model.cooling ? (a.loose ? clamp(controls.loose_spacing??2.8,2,3.5) : 1.3)
      : clamp(controls.body_spacing ?? 1.4, 1.1, 2.4);
    const neighbors = model.previous.filter(b => b.id !== a.id)
      .map(b => ({ b, d: Math.hypot(b.x - a.x, b.y - a.y) }))
      .filter(n => n.d < Math.max(reach, spacing)).sort((a, b) => a.d - b.d).slice(0, 6);
    let fx = 0, fy = 0;
    for (const { b, d } of neighbors) {
      const force = d < spacing ? (d - spacing) * 2 : (d - spacing) * 0.3;
      fx += (b.x - a.x) / Math.max(d, 0.01) * force;
      fy += (b.y - a.y) / Math.max(d, 0.01) * force;
    }
    const margin=model.cooling ? 5 : 2;
    const boundaryWeight=model.cooling ? 3 : 1;
    fx += (Math.max(0, margin - a.x) - Math.max(0, a.x - model.width + margin))*boundaryWeight;
    fy += (Math.max(0, margin - a.y) - Math.max(0, a.y - model.height + margin))*boundaryWeight;
    const strength = Math.hypot(fx, fy);
    const desired = strength > 0.015 ? Math.atan2(fy, fx) : a.heading;
    const turn = Math.atan2(Math.sin(desired - a.heading), Math.cos(desired - a.heading));
    a.heading += clamp(turn, -STEP * 1.6, STEP * 1.6);
    const speed = strength > 0.015 ? BOOK_MOVEMENT_SCALE * Math.min(0.8, strength) * Math.max(0, Math.cos(turn)) : 0;
    a.speed += (speed - a.speed) * (1 - Math.exp(-STEP * 5));
    a.x += Math.cos(a.heading) * a.speed * STEP;
    a.y += Math.sin(a.heading) * a.speed * STEP;
    a.distance += a.speed * STEP;
  }
  model.time += STEP;
}
export function advancePenguinHuddle(model, controls, elapsed) {
  advanceFixedStep(model, elapsed, STEP, 1, () => step(model, controls));
}
export function penguinHuddlePose(model, index, result = {}) {
  return interpolatePose(model.previous[index], model.agents[index], model.remainder / STEP, result);
}

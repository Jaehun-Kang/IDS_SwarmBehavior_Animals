import { advanceFixedStep, interpolatePose } from "../../utils/bookAnimation.js";
const STEP = 1 / 60;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export function penguinColdResponse(controls, id) {
  // Richter's colony fit supplies a trend, not an individual body temperature.
  // Fixed radiation 20 W/m2 and humidity 40%; individual offsets are illustrative.
  const apparent = clamp(controls.air_temperature ?? -20, -40, -5)
    - 2.857 * clamp(controls.wind_speed ?? 8, 0, 20) + 0.288 * 20 - 0.473 * 40;
  const variation = clamp(controls.response_variation ?? 60, 0, 100) / 100;
  const offset = Math.sin(id * 2.399) * variation * 22;
  return 1 / (1 + Math.exp((apparent + 48.167 + offset) / 18.65));
}
export function createPenguinCold(aspect) {
  const width = 24 * Math.max(1, aspect), height = width / aspect;
  const agents = Array.from({ length: 24 }, (_, id) => ({
    id, x: width / 2 + (id % 6 - 2.5) * 2.6,
    y: height / 2 + (Math.floor(id / 6) - 1.5) * 2.6,
    heading: id * 2.399, speed: 0, distance: 0, cold: 0.5,
  }));
  return { width, height, agents, previous: agents.map(a => ({ ...a })), time: 0, remainder: 0 };
}
function step(model, controls) {
  model.previous = model.agents.map(a => ({ ...a }));
  for (const a of model.agents) {
    a.cold += (penguinColdResponse(controls, a.id) - a.cold) * (1 - Math.exp(-STEP / 2));
    const neighbors = model.previous.filter(b => b.id !== a.id)
      .map(b => ({ b, d: Math.hypot(b.x-a.x, b.y-a.y) }))
      .filter(n => n.d < 7).sort((a,b) => a.d-b.d).slice(0,4);
    let fx = Math.cos(a.id * 2.399 + Math.sin(model.time * 0.3)) * 0.1;
    let fy = Math.sin(a.id * 2.399 + Math.sin(model.time * 0.3)) * 0.1;
    const spacing = 1.05 + (1-a.cold) * 3;
    for (const {b,d} of neighbors) {
      const force = clamp((d-spacing) * 0.55, -1, 1);
      fx += (b.x-a.x) / Math.max(d,0.01) * force;
      fy += (b.y-a.y) / Math.max(d,0.01) * force;
    }
    fx += Math.max(0,3-a.x) - Math.max(0,a.x-model.width+3);
    fy += Math.max(0,3-a.y) - Math.max(0,a.y-model.height+3);
    const turn = Math.atan2(Math.sin(Math.atan2(fy,fx)-a.heading),Math.cos(Math.atan2(fy,fx)-a.heading));
    a.heading += clamp(turn,-STEP*1.8,STEP*1.8);
    const speed = Math.min(0.9,Math.hypot(fx,fy)) * Math.max(0,Math.cos(turn));
    a.speed += (speed-a.speed)*(1-Math.exp(-STEP*4));
    a.x += Math.cos(a.heading)*a.speed*STEP;
    a.y += Math.sin(a.heading)*a.speed*STEP;
    a.distance += a.speed*STEP;
  }
  model.time += STEP;
}
export function advancePenguinCold(model, controls, elapsed) {
  advanceFixedStep(model,elapsed,STEP,1,()=>step(model,controls));
}
export function penguinColdPose(model,index,result={}) {
  return interpolatePose(model.previous[index],model.agents[index],model.remainder/STEP,result);
}

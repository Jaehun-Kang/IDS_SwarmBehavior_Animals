import { advanceFixedStep, interpolatePose } from "../../utils/bookAnimation.js";
const STEP = 1 / 60;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export function createPenguinWave(aspect) {
  const width = 16 * Math.max(1, aspect), height = width / aspect;
  const agents = Array.from({ length: 24 }, (_, id) => ({
    id, x: width / 2 + (id % 6 - 2.5) * 1.4 + (Math.floor(id / 6) % 2) * 0.7,
    y: height / 2 + (Math.floor(id / 6) - 1.5) * 1.4 * Math.sqrt(3) / 2,
    heading: 0, speed: 0, distance: 0, progress: 0, started: false,
  }));
  const neighbors = agents.map(a => agents.filter(b => b.id !== a.id && Math.hypot(b.x-a.x,b.y-a.y) < 1.5).map(b => b.id));
  return { width, height, agents, neighbors, previous: agents.map(a=>({...a})), time: 0,
    remainder: 0, active: false, rest: 0, cycle: 0, cameraX: 0 };
}
function step(model, controls) {
  model.previous = model.agents.map(a => ({ ...a }));
  if (!model.active) {
    model.rest += STEP;
    if (model.rest >= (model.cycle ? clamp(controls.pause_duration ?? 5, 2, 12) : 0.5)) {
      model.active = true; model.rest = 0;
      // Relative displacement is enlarged equally for steps and reaction thresholds.
      model.stride = clamp(controls.step_length ?? 7, 5, 10) / 34 * 1.4 * 2;
      model.threshold = clamp(controls.reaction_gap ?? 2, 1, 4) / 34 * 1.4 * 2;
      for (const a of model.agents) { a.startX=a.x; a.progress=0; a.started=false; }
      model.agents[(model.cycle * 7 + 8) % model.agents.length].started = true;
      model.cycle++;
    }
  }
  if (model.active) {
    const displacements = model.agents.map(a => a.x - a.startX);
    for (const a of model.agents) {
      if (!a.started && model.neighbors[a.id].some(id => displacements[id] >= model.threshold)) a.started=true;
      if (!a.started || a.progress >= 1) { a.speed=0; continue; }
      const previousX=a.x;
      a.progress=Math.min(1,a.progress+STEP/1.2);
      const t=a.progress;
      a.x=a.startX+model.stride*t*t*(3-2*t);
      a.speed=(a.x-previousX)/STEP; a.distance+=a.x-previousX;
    }
    if (model.agents.every(a=>a.progress>=1)) {
      model.active=false;
      for (const a of model.agents) a.speed=0;
    }
  }
  model.time+=STEP;
}
export function advancePenguinWave(model, controls, elapsed) {
  advanceFixedStep(model,elapsed,STEP,1,()=>step(model,controls));
}
export function penguinWavePose(model,index,result={}) {
  interpolatePose(model.previous[index],model.agents[index],model.remainder/STEP,result);
  const alpha=model.remainder/STEP;
  const shift=model.agents.reduce((sum,a,i)=>sum+model.previous[i].distance+(a.distance-model.previous[i].distance)*alpha,0)/model.agents.length;
  result.x-=shift;
  return result;
}

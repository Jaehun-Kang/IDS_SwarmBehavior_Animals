import { advanceFixedStep, interpolatePose } from "../../utils/bookAnimation.js";
const STEP = 1 / 120, TAU = Math.PI * 2;
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const random = (id, tick) => {
  let v = Math.imul(id + 1, 374761393) ^ Math.imul(tick + 1, 668265263);
  v = Math.imul(v ^ (v >>> 13), 1274126177);
  return ((v ^ (v >>> 16)) >>> 0) / 4294967296;
};
export function sheepNeighborRates(a, neighbors, controls) {
  let aheadMoving = 0, behindStopped = 0;
  for (const b of neighbors) {
    const ahead = (b.x - a.x) * Math.cos(a.heading) + (b.y - a.y) * Math.sin(a.heading) > 0;
    if (ahead && b.moving) aheadMoving++;
    if (!ahead && !b.moving) behindStopped++;
  }
  return {
    start: 0.06 + clamp(controls.start_influence ?? 60, 0, 100) / 100 * aheadMoving * 0.45,
    stop: 0.04 + clamp(controls.stop_influence ?? 60, 0, 100) / 100 * behindStopped * 0.35,
  };
}
export function createSheepNeighbors(aspect = 1.5) {
  const width = 24 * Math.max(1, aspect), height = 24 / Math.min(1, aspect);
  const rx = width * 0.32, ry = height * 0.32;
  const agents = Array.from({ length: 12 }, (_, id) => {
    const phase = id * TAU / 12;
    const x = width / 2 + Math.cos(phase) * rx, y = height / 2 + Math.sin(phase) * ry;
    const heading = Math.atan2(Math.cos(phase) * ry, -Math.sin(phase) * rx);
    return { id, phase, x, y, heading, moving: id % 4 === 0, speed: 0, distance: 0,
      previous: { x, y, heading } };
  });
  return { width, height, rx, ry, agents, tick: 0, time: 0, remainder: 0, starts: 0, stops: 0 };
}
export function advanceSheepNeighbors(m, controls, elapsed) {
  advanceFixedStep(m, elapsed, STEP, 1, () => {
    m.tick++; m.time += STEP;
    const snapshot = m.agents.map(a => ({ ...a }));
    for (const a of m.agents) {
      Object.assign(a.previous, { x: a.x, y: a.y, heading: a.heading });
      const old = snapshot.find(b => b.id === a.id);
      const neighbors = snapshot.filter(b => b.id !== a.id && Math.hypot(b.x-a.x,b.y-a.y) < 9);
      const rates = sheepNeighborRates(old, neighbors, controls);
      if (random(a.id, m.tick) < 1 - Math.exp(-(old.moving ? rates.stop : rates.start) * STEP)) {
        a.moving = !old.moving;
        if (a.moving) m.starts++; else m.stops++;
      }
      // A closed display route isolates stop/go coupling from leader selection.
      const front = snapshot.filter(b => b.id !== a.id).map(b => ({
        agent: b, phaseGap: (b.phase - a.phase + TAU) % TAU,
      })).sort((a,b) => a.phaseGap-b.phaseGap)[0];
      const gap = Math.hypot(front.agent.x-a.x,front.agent.y-a.y);
      const spacing = clamp(controls.personal_space ?? 1.5, 1, 3);
      const target = a.moving ? 1.2 * clamp((gap - spacing) / 1.5, 0, 1) : 0;
      a.speed += clamp(target-a.speed,-2*STEP,2*STEP);
      a.phase = (a.phase + a.speed * STEP / Math.hypot(m.rx*Math.sin(a.phase),m.ry*Math.cos(a.phase))) % TAU;
      a.x = m.width/2 + Math.cos(a.phase)*m.rx;
      a.y = m.height/2 + Math.sin(a.phase)*m.ry;
      a.heading = Math.atan2(Math.cos(a.phase)*m.ry,-Math.sin(a.phase)*m.rx);
      a.distance += a.speed*STEP;
    }
  });
}
export function sheepNeighborPose(m, index, result = {}) {
  return interpolatePose(m.agents[index].previous,m.agents[index],m.remainder/STEP,result);
}

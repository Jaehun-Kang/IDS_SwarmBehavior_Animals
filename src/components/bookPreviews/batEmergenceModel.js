import { BOOK_MOVEMENT_SCALE } from "./bookMotion.js";
import { advanceFixedStep, interpolatePose } from "../../utils/bookAnimation.js";
import { delayedBatHeading } from "./batNeighborModel.js";
const STEP = 1 / 120;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const hash = n => { const v = Math.sin(n * 127.1 + 4.7) * 43758.5453; return v - Math.floor(v); };
export function createBatEmergence(aspect = 1.5) {
  return { width: 40 * Math.max(1, aspect), height: 40 / Math.min(1, aspect),
    time: 0, remainder: 0, agents: [], nextId: 0, release: 0.95, emitted: 0, exited: 0, opening: 7 };
}
export function createBatNeighbors(aspect = 1.5) {
  return { ...createBatEmergence(aspect), neighborMode: true };
}
// A prescribed boundary flux, not a model of waiting, crowd pressure or real emergence rates.
export function batEmergenceRate(controls) {
  return (clamp(controls.emergence_activity ?? 60, 0, 100) / 100) *
    clamp(controls.exit_width ?? 7, 3, 12) * 0.7;
}
function update(model, controls) {
  model.time += STEP;
  model.opening += (clamp(controls.exit_width ?? 7, 3, 12) - model.opening) * (1 - Math.exp(-STEP * 3));
  model.release += batEmergenceRate(controls) * STEP;
  while (model.release >= 1 && model.agents.length < 96) {
    model.release--;
    const id = model.nextId++, heading = 0, x = -3;
    const y = model.height / 2 + (hash(id + 1) - 0.5) * Math.max(0.5, model.opening - 2);
    model.agents.push({ id, x, y, heading, previous: { x, y, heading }, spreadBias: hash(id + 401) * 2 - 1,
      ...(model.neighborMode ? { history: [{ time: model.time, heading }] } : {}) });
    model.emitted++;
  }
  model.release = Math.min(model.release, 1);
  const snapshot = model.agents.map(a => ({ id: a.id, x: a.x, y: a.y, heading: a.heading, history: a.history }));
  for (const a of model.agents) {
    Object.assign(a.previous, { x: a.x, y: a.y, heading: a.heading });
    const progress = clamp((a.x - 3) / 15, 0, 1);
    const spread = clamp(controls.stream_spread ?? 30, 0, 100) / 100;
    let desired = a.spreadBias * spread * 0.65 * progress;
    if (model.neighborMode) {
      const heading = delayedBatHeading(a, snapshot, model.time);
      if (heading !== null) {
        const weight = clamp(controls.forward_following ?? 60, 0, 100) / 100;
        desired += Math.atan2(Math.sin(heading - desired), Math.cos(heading - desired)) * weight;
      }
    }
    // Only nearby bodies influence separation; no global centerline pulls the stream together.
    if (a.x > 3) for (const other of snapshot) {
      const dx = other.x - a.x, dy = a.y - other.y, d = Math.hypot(dx, dy);
      const radius = model.neighborMode ? 4.5 : 2;
      if (other.id !== a.id && dx > 0 && dx < radius && d < radius) {
        const avoidance = model.neighborMode ? clamp(controls.near_avoidance ?? 50, 0, 100) / 50 : 1;
        desired += (dy < 0 ? -1 : 1) * (1 - d / radius) * 0.25 * avoidance;
      }
    }
    desired *= progress;
    desired += clamp((8 - a.y) / 8, 0, 1) * 1.4;
    desired -= clamp((a.y - model.height + 8) / 8, 0, 1) * 1.4;
    a.heading += clamp(desired - a.heading, -1.2 * STEP, 1.2 * STEP);
    a.x += Math.cos(a.heading) * 9 * BOOK_MOVEMENT_SCALE * STEP;
    a.y += Math.sin(a.heading) * 9 * BOOK_MOVEMENT_SCALE * STEP;
  }
  if (model.neighborMode) for (const a of model.agents) {
    if (model.time - a.history.at(-1).time >= 1 / 30) {
      a.history.push({ time: model.time, heading: a.heading });
      while (a.history.length > 1 && model.time - a.history[1].time > 1.5) a.history.shift();
    }
  }
  const before = model.agents.length;
  model.agents = model.agents.filter(a => a.x < model.width + 3);
  model.exited += before - model.agents.length;
}
export function advanceBatEmergence(model, controls, elapsed) {
  advanceFixedStep(model, elapsed, STEP, 0.25, () => update(model, controls));
}
export function batEmergencePose(model, index, result = {}) {
  return interpolatePose(model.agents[index].previous, model.agents[index], model.remainder / STEP, result);
}

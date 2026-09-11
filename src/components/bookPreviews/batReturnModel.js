import { advanceFixedStep, interpolatePose } from "../../utils/bookAnimation.js";
const STEP = 1 / 120;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const angleDelta = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
const spawn = (m, id, offset = 0) => {
  const x = m.width + 3 + offset, y = m.height * (0.25 + ((id * 0.61803398875) % 1) * 0.5);
  const heading = Math.atan2(m.height / 2 - y, -3 - x);
  return { id, x, y, heading, speed: 9, entered: false, previous: { x, y, heading } };
};
export function createBatReturn(aspect = 1.5) {
  const m = { width: 40 * Math.max(1, aspect), height: 40 / Math.min(1, aspect), time: 0, remainder: 0, agents: [], nextId: 12, returned: 0, opening: 7, returnMode: true };
  m.agents = Array.from({ length: 12 }, (_, i) => spawn(m, i, i * 3));
  return m;
}
export function advanceBatReturn(m, controls, elapsed, pointer = null) {
  advanceFixedStep(m, elapsed, STEP, 0.35, () => {
    m.time += STEP;
    for (const a of m.agents) {
      Object.assign(a.previous, { x: a.x, y: a.y, heading: a.heading });
      const targetY = m.height / 2 + Math.sin(a.id * 2.4) * 0.5;
      const distance = Math.hypot(a.x + 3, a.y - targetY);
      let dx = (-3 - a.x) / Math.max(1, distance), dy = (targetY - a.y) / Math.max(1, distance);
      let threat = 0;
      if (pointer) {
        const ox = a.x - pointer.x * m.width, oy = a.y - pointer.y * m.height, d = Math.hypot(ox, oy);
        threat = Math.max(0, 1 - d / 8) * clamp(controls.threat_response ?? 60, 0, 100) / 100;
        dx += ox / Math.max(d, 0.1) * threat * 3;
        dy += oy / Math.max(d, 0.1) * threat * 3;
      }
      if (a.x < m.width - 2) a.entered = true;
      if (a.entered && a.x > m.width - 8) dx -= Math.max(0, a.x - m.width + 8) * 0.3;
      dy += Math.max(0, 6 - a.y) * 0.3 - Math.max(0, a.y - m.height + 6) * 0.3;
      const targetSpeed = clamp(controls.entry_speed ?? 3, 1, 6) +
        (9 - clamp(controls.entry_speed ?? 3, 1, 6)) * clamp(distance / 20, 0, 1);
      a.speed += (targetSpeed - a.speed) * (1 - Math.exp(-STEP * 2));
      a.heading += clamp(angleDelta(a.heading, Math.atan2(dy, dx)), -1.8 * STEP, 1.8 * STEP);
      a.x += Math.cos(a.heading) * a.speed * STEP;
      a.y += Math.sin(a.heading) * a.speed * STEP;
    }
    m.agents = m.agents.map(a => {
      if (a.x >= -3) return a;
      m.returned++;
      return spawn(m, m.nextId++);
    });
  });
}
export function batReturnPose(m, index, result = {}) {
  return interpolatePose(m.agents[index].previous, m.agents[index], m.remainder / STEP, result);
}

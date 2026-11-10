import { resolvePopulationExitDirection } from "./populationExit.js";

// Guide across the boundary only; ordinary behavior takes over on entry.
export function createPopulationTransition({ speed = 36, margin = 24, project = a => a } = {}) {
  let initialized = false;
  let nextId = 1;
  let width = 1;
  let height = 1;
  const entering = new Map();
  const leaving = new Map();
  const inside = p => p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height;
  const edge = p => [
    { x: -1, y: 0, distance: p.x },
    { x: 1, y: 0, distance: width - p.x },
    { x: 0, y: -1, distance: p.y },
    { x: 0, y: 1, distance: height - p.y },
  ].reduce((a, b) => a.distance < b.distance ? a : b);
  const route = (agent, direction) => ({
    x: agent.x, y: agent.y, dx: direction.x, dy: direction.y, elapsed: 0,
  });
  return {
    sync(agents, count, w, h, create) {
      width = w;
      height = h;
      if (!initialized) {
        nextId = Math.max(0, ...agents.map(a => Number(a.id) || 0)) + 1;
        while (agents.length < count) agents.push(create(nextId++));
        initialized = true;
        return agents;
      }
      while (agents.length > count) {
        const agent = agents.pop();
        entering.delete(agent);
        leaving.set(agent, route(agent, resolvePopulationExitDirection(project(agent), width, height)));
      }
      while (agents.length < count) {
        const returning = leaving.keys().next().value;
        const agent = returning || create(nextId++);
        leaving.delete(agent);
        const p = project(agent);
        const outward = edge(p);
        if (!returning) {
          agent.x += outward.x < 0 ? -margin - p.x : outward.x > 0 ? width + margin - p.x : 0;
          agent.y += outward.y < 0 ? -margin - p.y : outward.y > 0 ? height + margin - p.y : 0;
        }
        if (!returning || !inside(p)) entering.set(agent, route(agent, { x: -outward.x, y: -outward.y }));
        agents.push(agent);
      }
      return agents;
    },
    advance(dt, prepare) {
      if (!Number.isFinite(dt) || dt <= 0) return;
      for (const records of [entering, leaving]) {
        for (const [agent, path] of records) {
          path.elapsed += dt;
          agent.heading = Math.atan2(path.dy, path.dx);
          const override = prepare?.(agent, dt, path);
          const velocity = override ?? (typeof speed === 'function' ? speed(agent) : speed);
          const stepSpeed = Number.isFinite(velocity) ? Math.max(0, velocity) : 0;
          agent.vx = path.dx * stepSpeed;
          agent.vy = path.dy * stepSpeed;
          path.x += agent.vx * dt;
          path.y += agent.vy * dt;
          agent.x = path.x;
          agent.y = path.y;
          agent.spritePosition = { x: agent.x, y: agent.y };
          agent.spriteVelocity = { x: agent.vx, y: agent.vy };
          const p = project(agent);
          if (records === entering ? inside(p) :
            p.x < -margin || p.x > width + margin || p.y < -margin || p.y > height + margin) records.delete(agent);
        }
      }
    },
    renderAgents(agents) { return leaving.size ? [...agents, ...leaving.keys()] : agents; },
    forEachLeaving(callback) { leaving.forEach((_path, agent) => callback(agent)); },
    isEntering(agent) { return entering.has(agent); },
  };
}

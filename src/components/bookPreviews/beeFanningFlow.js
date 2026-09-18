import { advanceFixedStep } from "../../utils/bookAnimation.js";

export function createBeeFanningFlow(width, height) {
  return { width, height, markers: [], emissions: new Map(), remainder: 0 };
}

// Display-only packets keep travelling after their source stops fanning.
export function advanceBeeFanningFlow(flow, agents, scale, elapsed) {
  const speed = flow.width / 5;
  advanceFixedStep(flow, elapsed, 1 / 60, 1, () => {
    for (const point of flow.markers) {
      point.x -= speed / 60;
      point.age += 1 / 60;
    }
    flow.markers = flow.markers.filter(point => point.x > -32 && point.age < 6);
    for (const agent of agents) {
      if (!agent.fanning) continue;
      const timer = (flow.emissions.get(agent.id) ?? (agent.id % 3) * 0.18) - 1 / 60;
      if (timer <= 0) {
        flow.markers.push({ x: agent.x * scale, y: agent.y * scale, length: 1, age: 0 });
        flow.emissions.set(agent.id, timer + 0.55);
      } else flow.emissions.set(agent.id, timer);
    }
  });
  return speed;
}

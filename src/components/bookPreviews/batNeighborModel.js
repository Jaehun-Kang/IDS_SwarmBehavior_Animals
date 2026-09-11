export function delayedBatHeading(agent, neighbors, time) {
  const candidates = neighbors.filter(other => {
    const dx = other.x - agent.x, dy = other.y - agent.y;
    const angle = Math.atan2(dy, dx) - agent.heading;
    return other.id !== agent.id && Math.hypot(dx, dy) < 12 && Math.cos(angle) > 0.5;
  }).sort((a, b) => Math.hypot(a.x - agent.x, a.y - agent.y) - Math.hypot(b.x - agent.x, b.y - agent.y) || a.id - b.id).slice(0, 3);
  if (!candidates.length) return null;
  let x = 0, y = 0;
  for (const other of candidates) {
    const distance = Math.hypot(other.x - agent.x, other.y - agent.y);
    const target = time - distance / 9;
    const history = other.history ?? [];
    let heading = history[0]?.heading ?? other.heading;
    for (let i = 0; i < history.length; i++) {
      if (history[i].time > target) break;
      heading = history[i].heading;
    }
    const weight = 1 / Math.max(distance, 0.5);
    x += Math.cos(heading) * weight; y += Math.sin(heading) * weight;
  }
  return Math.atan2(y, x);
}

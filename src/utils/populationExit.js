// Pick once on departure: an outward heading with individual angular variation.
export function resolvePopulationExitDirection(point, width, height) {
  const x = point.x - width * 0.5;
  const y = point.y - height * 0.5;
  const angle = Math.hypot(x, y) < 1
    ? Math.random() * Math.PI * 2
    : Math.atan2(y, x) + (Math.random() - 0.5) * Math.PI / 3;
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

export function resolvePopulationExitTarget(point, width, height, margin) {
  const direction = resolvePopulationExitDirection(point, width, height);
  const tx = Math.abs(direction.x) < 1e-9 ? Infinity :
    ((direction.x > 0 ? width + margin : -margin) - point.x) / direction.x;
  const ty = Math.abs(direction.y) < 1e-9 ? Infinity :
    ((direction.y > 0 ? height + margin : -margin) - point.y) / direction.y;
  const distance = Math.max(margin, Math.min(tx, ty));
  return { x: point.x + direction.x * distance, y: point.y + direction.y * distance };
}

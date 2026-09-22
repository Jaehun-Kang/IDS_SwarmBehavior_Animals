export const advancePenguinArrival = (position, target, speed, dt, slowRadius) => {
  const dx = target.x - position.x;
  const dy = target.y - position.y;
  const distance = Math.hypot(dx, dy);
  const approachSpeed = speed * Math.min(1, distance / Math.max(slowRadius, 1));
  const advance = Math.min(distance, approachSpeed * Math.max(0, dt));
  const ratio = distance > 0 ? advance / distance : 0;
  return { x: position.x + dx * ratio, y: position.y + dy * ratio, speed: approachSpeed };
};

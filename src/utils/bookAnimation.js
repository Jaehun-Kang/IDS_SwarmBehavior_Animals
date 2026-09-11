export function advanceFixedStep(clock, elapsedSeconds, stepSeconds, playbackRate, update) {
  clock.remainder += Math.max(0, Math.min(elapsedSeconds, 0.1)) * playbackRate;
  while (clock.remainder + 1e-10 >= stepSeconds) {
    update();
    clock.remainder = Math.max(0, clock.remainder - stepSeconds);
  }
}

export function interpolatePose(previous, current, alpha, result = {}) {
  const amount = Math.max(0, Math.min(alpha, 1));
  result.x = previous.x + (current.x - previous.x) * amount;
  result.y = previous.y + (current.y - previous.y) * amount;
  const turn = Math.atan2(Math.sin(current.heading - previous.heading),
    Math.cos(current.heading - previous.heading));
  result.heading = previous.heading + turn * amount;
  return result;
}

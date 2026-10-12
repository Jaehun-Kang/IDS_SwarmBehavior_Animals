// Existing desktop home measured about 50 updates/s at 3440 x 1305.
// This is a movement reference, not a rendering frame-rate limit.
export const HOME_REFERENCE_HZ = 50;
const STEP_MS = 1000 / HOME_REFERENCE_HZ;
const MAX_ELAPSED_MS = 100;
const SUSPEND_GAP_MS = 250;

export const createHomeAnimationClock = () => {
  let previous = null;
  let accumulator = 0;
  const reset = () => {
    previous = null;
    accumulator = 0;
  };
  return {
    reset,
    advance(now, step) {
      if (!Number.isFinite(now)) {
        reset();
        return 0;
      }
      if (previous === null) {
        previous = now;
        return 0;
      }
      const elapsed = now - previous;
      previous = now;
      if (elapsed < 0 || elapsed > SUSPEND_GAP_MS) {
        accumulator = 0;
        return 0;
      }
      accumulator += Math.min(elapsed, MAX_ELAPSED_MS);
      while (accumulator + 1e-7 >= STEP_MS) {
        step();
        accumulator = Math.max(0, accumulator - STEP_MS);
      }
      return accumulator / STEP_MS;
    },
  };
};

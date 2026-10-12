export const SIMULATION_STEP_SECONDS = 1 / 60;
const STEP_MS = 1000 * SIMULATION_STEP_SECONDS;
const SUSPEND_GAP_MS = 250;
const EPSILON_MS = 1e-6;

// Keep the legacy update/draw ordering, but run it on simulation ticks rather
// than display refreshes. Callbacks requeue themselves just like RAF callbacks.
export function createSimulationFrameScheduler({
  requestFrame = (callback) => window.requestAnimationFrame(callback),
  cancelFrame = (id) => window.cancelAnimationFrame(id),
  isHidden = () => document.hidden,
} = {}) {
  let raf = null;
  let pending = null;
  let nextId = 0;
  let previous = null;
  let accumulator = 0;
  let origin = 0;
  let tick = 0;
  let ticking = false;

  const schedule = () => {
    if (pending && raf === null && !ticking) raf = requestFrame(onFrame);
  };

  const onFrame = (timestamp) => {
    raf = null;
    if (!pending) return;
    if (!Number.isFinite(timestamp) || isHidden()) {
      previous = null;
      accumulator = 0;
      schedule();
      return;
    }

    const elapsed = previous === null ? 0 : timestamp - previous;
    const restarting = previous === null || elapsed < 0 || elapsed > SUSPEND_GAP_MS;
    previous = timestamp;
    if (restarting) {
      origin = timestamp;
      tick = 0;
    }
    // A suspended tab does not replay its missed movements on return.
    accumulator = restarting ? STEP_MS : accumulator + elapsed;
    ticking = true;
    try {
      while (pending && accumulator + EPSILON_MS >= STEP_MS) {
        accumulator = Math.max(0, accumulator - STEP_MS);
        const { callback } = pending;
        pending = null;
        callback(origin + tick++ * STEP_MS, SIMULATION_STEP_SECONDS);
      }
    } finally {
      ticking = false;
      schedule();
    }
  };

  return {
    request(callback) {
      if (pending) throw new Error("Only one simulation frame may be pending");
      const id = ++nextId;
      pending = { id, callback };
      schedule();
      return id;
    },
    cancel(id) {
      if (pending?.id !== id) return;
      pending = null;
      if (raf !== null) cancelFrame(raf);
      raf = null;
      // Effect restarts (for example a slider update) must not add extra ticks.
    },
  };
}

export const SIMULATION_STEP_SECONDS = 1 / 60;
const SUSPEND_GAP_MS = 250;

// One update and one render per browser frame. Never replay missed frames.
export function createSimulationFrameScheduler({
  stepSeconds = SIMULATION_STEP_SECONDS,
  requestFrame = (callback) => window.requestAnimationFrame(callback),
  cancelFrame = (id) => window.cancelAnimationFrame(id),
  isHidden = () => document.hidden,
} = {}) {
  let raf = null;
  let pending = null;
  let nextId = 0;
  let previous = null;
  let ticking = false;
  let wasPaused = false;

  const schedule = () => {
    if (pending && raf === null && !ticking) raf = requestFrame(onFrame);
  };

  const onFrame = (timestamp) => {
    raf = null;
    if (!pending) return;
    if (!Number.isFinite(timestamp) || isHidden()) {
      previous = null;
      schedule();
      return;
    }
    const elapsed = previous === null ? null : timestamp - previous;
    previous = timestamp;
    const dt = wasPaused || elapsed === null || elapsed < 0 || elapsed > SUSPEND_GAP_MS
      ? stepSeconds
      : elapsed * 0.001;
    let advanced = false;
    const frame = {
      dt,
      advance(update, paused = false) {
        if (advanced) throw new Error("Advance the model only once per display frame");
        advanced = true;
        wasPaused = paused;
        if (!paused && dt > 0) update(dt, timestamp * 0.001);
      },
      draw(_agents, render) { return render(); },
    };
    ticking = true;
    try {
      const { callback } = pending;
      pending = null;
      callback(timestamp, frame);
    } finally {
      if (!advanced) wasPaused = true;
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
    },
  };
}

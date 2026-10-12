const HOLD_MS = 5000;
const CORNER_SIZE = 32;

// This controller runs in Electron's main process, not the simulation renderer.
function createExitHold({ confirm, setTimer = setTimeout, clearTimer = clearTimeout }) {
  let timer = null;
  let gesture = false;
  let disposed = false;
  const cancel = () => {
    if (timer !== null) clearTimer(timer);
    timer = null;
  };
  const reset = () => { cancel(); gesture = false; };
  return {
    reset,
    dispose() { reset(); disposed = true; },
    input(event, height) {
      if (disposed) return false;
      const inside = event.x >= 0 && event.x < CORNER_SIZE &&
        event.y >= height - CORNER_SIZE && event.y < height;
      if (event.type === "mouseDown" && event.button === "left") {
        reset();
        if (!inside) return false;
        gesture = true;
        timer = setTimer(() => { timer = null; confirm(); }, HOLD_MS);
        return true;
      }
      if (!gesture) return false;
      if (event.type === "mouseUp" && event.button === "left") reset();
      else if (event.type === "mouseLeave" || !inside) cancel();
      // Consume the rest of this press even after leaving the corner.
      return true;
    },
  };
}

module.exports = { createExitHold, HOLD_MS, CORNER_SIZE };

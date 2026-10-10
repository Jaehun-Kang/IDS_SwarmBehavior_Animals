// Shared lifecycle for book previews. Physics and interpolation stay in the renderer.
export function createBookCanvasLoop(canvas, { onResize, onFrame, onInvalidate }) {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("book-canvas-context-unavailable");
  let width = 0, height = 0, frameId = 0, previous = null;
  let disposed = false, ready = false, visible = true;
  const requestFrame = () => {
    if (!disposed && ready && !document.hidden && !frameId && width > 0 && height > 0) {
      frameId = requestAnimationFrame(render);
    }
  };
  const invalidate = () => {
    if (disposed) return;
    onInvalidate?.();
    requestFrame();
  };
  function render(timestamp) {
    frameId = 0;
    if (disposed || document.hidden) return;
    const elapsedSeconds = previous === null || !visible ? 0 :
      Math.max(0, Math.min((timestamp - previous) / 1000, 0.1));
    previous = visible ? timestamp : null;
    const ratio = window.devicePixelRatio || 1;
    const pixelWidth = Math.round(width * ratio), pixelHeight = Math.round(height * ratio);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      onInvalidate?.();
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    // Only an explicit false means idle; a skipped draw may still have running timers.
    const keepRunning = onFrame({ context, width, height, elapsedSeconds, timestamp }) !== false;
    canvas.dataset.bookFrameReady = "true";
    if (visible && keepRunning) requestFrame();
    else previous = null;
  }
  const resize = new ResizeObserver(([entry]) => {
    const nextWidth = Math.round(entry.contentRect.width);
    const nextHeight = Math.round(entry.contentRect.height);
    if (nextWidth <= 0 || nextHeight <= 0) {
      cancelAnimationFrame(frameId);
      frameId = 0;
      previous = null;
      width = height = 0;
      return;
    }
    if (nextWidth !== width || nextHeight !== height) {
      width = nextWidth;
      height = nextHeight;
      delete canvas.dataset.bookFrameReady;
      previous = null;
      onResize?.({ width, height });
      invalidate();
    }
  });
  resize.observe(canvas.parentElement);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    previous = null;
    cancelAnimationFrame(frameId);
    frameId = 0;
    // A single static render also supplies offscreen page-turn snapshots.
    invalidate();
  });
  intersection.observe(canvas);
  const visibility = () => {
    previous = null;
    cancelAnimationFrame(frameId);
    frameId = 0;
    invalidate();
  };
  document.addEventListener("visibilitychange", visibility);
  // Also refresh an idle canvas after zoom/DPR changes or pointer interaction.
  window.addEventListener("resize", invalidate);
  const pointerEvents = ["pointermove", "pointerdown", "pointerup", "pointerleave"];
  pointerEvents.forEach(type => canvas.addEventListener(type, invalidate));
  return {
    start() { ready = true; invalidate(); },
    invalidate,
    dispose() {
      disposed = true;
      cancelAnimationFrame(frameId);
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("resize", invalidate);
      pointerEvents.forEach(type => canvas.removeEventListener(type, invalidate));
    },
  };
}

// Shared lifecycle for book previews. Physics and interpolation stay in the renderer.
export function createBookCanvasLoop(canvas, { onResize, onFrame }) {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("book-canvas-context-unavailable");
  let width = 0, height = 0, frameId = 0, previous = null;
  let disposed = false, ready = false, visible = true;
  const requestFrame = () => {
    if (!disposed && ready && !document.hidden && !frameId && width > 0 && height > 0) {
      frameId = requestAnimationFrame(render);
    }
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
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    onFrame({ context, width, height, elapsedSeconds, timestamp });
    if (visible) requestFrame();
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
      previous = null;
      onResize?.({ width, height });
      requestFrame();
    }
  });
  resize.observe(canvas.parentElement);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    previous = null;
    cancelAnimationFrame(frameId);
    frameId = 0;
    // A single static render also supplies offscreen page-turn snapshots.
    requestFrame();
  });
  intersection.observe(canvas);
  const visibility = () => {
    previous = null;
    cancelAnimationFrame(frameId);
    frameId = 0;
    requestFrame();
  };
  document.addEventListener("visibilitychange", visibility);
  return {
    start() { ready = true; requestFrame(); },
    invalidate: requestFrame,
    dispose() {
      disposed = true;
      cancelAnimationFrame(frameId);
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    },
  };
}

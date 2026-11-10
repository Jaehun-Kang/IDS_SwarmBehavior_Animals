// Client coordinates are CSS pixels, independent of display pixel density.
export function createPointerTapGesture(threshold = 8) {
  let pending = null;
  const move = (event) => {
    if (pending?.id === event.pointerId &&
        Math.hypot(event.clientX - pending.x, event.clientY - pending.y) > threshold) {
      pending.dragged = true;
    }
  };
  return {
    defer(event) {
      if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return false;
      if (event.isPrimary !== false && event.button === 0) {
        pending = { id: event.pointerId, x: event.clientX, y: event.clientY, dragged: false };
      }
      return true;
    },
    move,
    finish(event) {
      if (!pending || pending.id !== event.pointerId) return false;
      move(event);
      const tapped = !pending.dragged;
      pending = null;
      return tapped;
    },
    cancel() { pending = null; },
  };
}

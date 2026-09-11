// A paused canvas needs another frame only when an input or render resource changes.
export function createPausedFrameGate() {
  let previous = null;
  const shouldRender = (paused, ...dependencies) => {
    if (!paused) {
      previous = null;
      return true;
    }
    if (previous && dependencies.length === previous.length &&
      dependencies.every((value, index) => Object.is(value, previous[index]))) return false;
    previous = dependencies;
    return true;
  };
  shouldRender.invalidate = () => { previous = null; };
  return shouldRender;
}

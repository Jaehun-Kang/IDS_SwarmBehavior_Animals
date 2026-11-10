// Signed screen-edge inset. Desktop values stay unchanged; mobile edges move outside.
export function responsiveBoundaryInset(width, height, inset, axis = "x", hard = false) {
  const limit = axis === "x" ? width * 0.25 : Math.min(width * 0.25, height * 0.4);
  const zone = Math.max(1, Math.min(320, limit));
  if (zone === 320) return inset;
  return Math.min(inset, Math.max(1, limit)) - (320 - zone) * (hard ? 1 : 0.5);
}

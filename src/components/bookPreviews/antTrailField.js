const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
export function createAntTrailField(width, height) {
  const cell = 0.8, cols = Math.ceil(width / cell) + 1, rows = Math.ceil(height / cell) + 1;
  return { cell, cols, rows, values: new Float32Array(cols * rows), revision: 0 };
}
function corners(field, x, y, visit) {
  const gx = clamp(x / field.cell, 0, field.cols - 1), gy = clamp(y / field.cell, 0, field.rows - 1);
  const ix = Math.min(Math.floor(gx), field.cols - 2), iy = Math.min(Math.floor(gy), field.rows - 2);
  const fx = gx - ix, fy = gy - iy;
  visit(iy * field.cols + ix, (1 - fx) * (1 - fy));
  visit(iy * field.cols + ix + 1, fx * (1 - fy));
  visit((iy + 1) * field.cols + ix, (1 - fx) * fy);
  visit((iy + 1) * field.cols + ix + 1, fx * fy);
}
export function depositAntTrail(field, x, y, amount) {
  corners(field, x, y, (i, weight) => { field.values[i] = Math.min(3, field.values[i] + amount * weight); });
}
export function sampleAntTrail(field, x, y) {
  let value = 0;
  corners(field, x, y, (i, weight) => { value += field.values[i] * weight; });
  return value;
}
export function decayAntTrail(field, elapsed, halfLife) {
  const fade = Math.pow(0.5, elapsed / Math.max(0.1, halfLife));
  for (let i = 0; i < field.values.length; i++) field.values[i] *= fade;
  field.revision++;
}
// Same scalar field as the image; receptor saturation limits steep gradients.
export function antTrailTurn(field, x, y, heading, sensitivity) {
  const sense = angle => sampleAntTrail(field, x + Math.cos(angle) * 1.1, y + Math.sin(angle) * 1.1);
  const left = Math.atan(sense(heading - Math.PI / 4) * 4);
  const right = Math.atan(sense(heading + Math.PI / 4) * 4);
  return (right - left) * clamp(sensitivity / 100, 0, 1) * 2;
}
export const antTrailAlpha = concentration => Math.round(180 * (1 - Math.exp(-Math.max(0, concentration) * 2)));

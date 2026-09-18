// Display-only marker: its size never changes the model's sensing radius.
export function drawThreatMarker(ctx, x, y, width, height) {
  if (![x, y, width, height].every(Number.isFinite) || width <= 0 || height <= 0) return;
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#b02e36";
  ctx.beginPath();
  ctx.moveTo(x, y - 12);
  ctx.lineTo(x + 12, y + 10);
  ctx.lineTo(x - 12, y + 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

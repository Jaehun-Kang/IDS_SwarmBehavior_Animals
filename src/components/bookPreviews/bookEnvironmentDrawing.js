const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const hash = n => { const v = Math.sin(n * 127.1 + 19.3) * 43758.5453; return v - Math.floor(v); };

// Stratified seeds keep screen-space density even without a visible row pattern.
export function createFlowMarkers(width, height, spacing = 48) {
  const cols = Math.max(1, Math.ceil(width / spacing));
  const rows = Math.max(1, Math.ceil(height / spacing));
  return { width, height, markers: Array.from({ length: cols * rows }, (_, i) => ({
    x: (i % cols + 0.2 + hash(i + 1) * 0.6) * width / cols,
    y: (Math.floor(i / cols) + 0.2 + hash(i + 701) * 0.6) * height / rows,
    length: 0.8 + hash(i + 1301) * 0.4,
  })) };
}

export function advanceFlowMarkers(field, angle, speed, elapsed) {
  if (![angle, speed, elapsed].every(Number.isFinite) || speed <= 0) return;
  const distance = speed * clamp(elapsed, 0, 0.1);
  const dx = Math.cos(angle) * distance, dy = Math.sin(angle) * distance;
  for (const point of field.markers) {
    point.x = ((point.x + dx) % field.width + field.width) % field.width;
    point.y = ((point.y + dy) % field.height + field.height) % field.height;
  }
}

export function drawFlowMarkers(ctx, field, angle, speed, exposure = () => 1) {
  if (![angle, speed].every(Number.isFinite) || speed <= 0) return;
  const dx = Math.cos(angle), dy = Math.sin(angle);
  const length = clamp(10 + speed * 0.22, 12, 27);
  ctx.save();
  ctx.strokeStyle = "#527c8b";
  ctx.lineWidth = 1.15;
  ctx.lineCap = "round";
  for (const point of field.markers) {
    const edge = clamp(Math.min(point.x, point.y, field.width - point.x, field.height - point.y) / 14, 0, 1);
    const alpha = edge * clamp(exposure(point), 0, 1);
    // Brighter heads show direction without arrowheads or a dense vector grid.
    for (let j = 0; j < 3; j++) {
      const tail = length * point.length * (1 - j / 3);
      const head = length * point.length * (1 - (j + 1) / 3);
      ctx.globalAlpha = alpha * (0.12 + j * 0.15);
      ctx.beginPath();
      ctx.moveTo(point.x - dx * tail, point.y - dy * tail);
      ctx.lineTo(point.x - dx * head, point.y - dy * head);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function drawGrassMark(ctx, x, y, size = 9) {
  ctx.save();
  ctx.strokeStyle = "#54714e";
  ctx.lineWidth = 1.3;
  ctx.lineCap = "square";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.5, y + size * 0.25);
  ctx.lineTo(x + size * 0.5, y + size * 0.25);
  ctx.moveTo(x, y + size * 0.25);
  ctx.lineTo(x, y - size * 0.6);
  ctx.moveTo(x - size * 0.28, y + size * 0.25);
  ctx.lineTo(x - size * 0.48, y - size * 0.27);
  ctx.moveTo(x + size * 0.28, y + size * 0.25);
  ctx.lineTo(x + size * 0.48, y - size * 0.27);
  ctx.stroke();
  ctx.restore();
}

export function drawKrillFoodPatch(ctx, x, y, radius, amount) {
  if (![x, y, radius, amount].every(Number.isFinite) || radius <= 0 || amount <= 0) return;
  const alpha = 0.34 * clamp(amount, 0, 1);
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  // Main simulation food color; opacity follows this preview's sampled 1-r^2 field.
  for (const r of [0, 0.25, 0.5, 0.75, 1]) {
    gradient.addColorStop(r, `rgba(99, 185, 124, ${alpha * (1 - r * r)})`);
  }
  ctx.save();
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

const layers = new WeakMap();

function createGlowLayer(source, kind) {
  const margin = 24;
  const mask = document.createElement("canvas");
  mask.width = source.width;
  mask.height = source.height;
  const mc = mask.getContext("2d", { willReadFrequently: kind === "krill" });
  mc.drawImage(source, 0, 0);
  if (kind === "krill") {
    // Same photophore selection as the main krill simulation.
    const image = mc.getImageData(0, 0, mask.width, mask.height);
    const p = image.data;
    for (let i = 0; i < p.length; i += 4) {
      if (!(p[i + 3] > 0 && p[i] > 180 && p[i + 1] > 160 && p[i + 2] < 100)) p[i + 3] = 0;
    }
    mc.putImageData(image, 0, 0);
    mc.globalCompositeOperation = "source-in";
    mc.fillStyle = "#009fac";
    mc.fillRect(0, 0, mask.width, mask.height);
  }
  const canvas = document.createElement("canvas");
  canvas.width = source.width + margin * 2;
  canvas.height = source.height + margin * 2;
  const ctx = canvas.getContext("2d");
  ctx.shadowColor = kind === "krill" ? "rgba(0,159,172,0.8)" : "rgba(139,157,12,0.8)";
  ctx.shadowBlur = 18;
  ctx.drawImage(mask, margin, margin);
  if (kind !== "krill") {
    // Main firefly halo construction, recolored for white paper.
    ctx.globalCompositeOperation = "destination-out";
    ctx.drawImage(mask, margin, margin);
  }
  return { canvas, margin };
}

export function drawBookSpriteGlow(ctx, source, x, y, width, height, intensity, kind = "firefly") {
  if (!source || ![x, y, width, height, intensity].every(Number.isFinite) ||
      width <= 0 || height <= 0 || intensity <= 0) return;
  let variants = layers.get(source);
  if (!variants) { variants = new Map(); layers.set(source, variants); }
  if (!variants.has(kind)) variants.set(kind, createGlowLayer(source, kind));
  const { canvas, margin } = variants.get(kind);
  const sx = width / source.width, sy = height / source.height;
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = Math.min(1, intensity);
  ctx.drawImage(canvas, x - margin * sx, y - margin * sy, canvas.width * sx, canvas.height * sy);
  ctx.restore();
}

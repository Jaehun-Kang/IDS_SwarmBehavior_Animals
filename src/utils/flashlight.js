const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const rgba = ([red, green, blue], alpha) =>
  `rgba(${red}, ${green}, ${blue}, ${alpha})`;

export const FLASHLIGHT_PRESET = {
  radiusPx: 264,
  hotspotRatio: 0.18,
  falloffRatio: 0.68,
  bloomRadiusPx: 336,
  bloomAlpha: 0.102,
  dustAlpha: 0.122,
  directionalAlpha: 0.052,
  directionalLengthScale: 1.36,
  directionalWidthScale: 0.78,
  sourceOffsetYPx: 110,
  colors: {
    bloomCore: [255, 246, 226],
    bloomMid: [255, 238, 212],
    bloomEdge: [255, 226, 188],
    bloomFade: [255, 226, 188],
    dustCore: [250, 235, 205],
    dustMid: [246, 226, 190],
    dustEdge: [238, 214, 176],
    dustFade: [238, 214, 176],
    directionalCore: [250, 229, 202],
    directionalMid: [242, 218, 188],
    directionalEdge: [232, 205, 170],
  },
};

export const resolveFlashlightIntensity = (
  x,
  y,
  pointerState,
  {
    radiusPx = FLASHLIGHT_PRESET.radiusPx,
    hotspotRatio = FLASHLIGHT_PRESET.hotspotRatio,
    falloffRatio = FLASHLIGHT_PRESET.falloffRatio,
  } = {},
) => {
  if (!pointerState?.active || !Number.isFinite(radiusPx) || radiusPx <= 0) {
    return 0;
  }

  const dx = x - pointerState.x;
  const dy = y - pointerState.y;
  const normalizedDistance = Math.hypot(dx, dy) / radiusPx;

  if (normalizedDistance >= 1) {
    return 0;
  }

  if (normalizedDistance <= hotspotRatio) {
    return 1;
  }

  const t = clamp(
    (normalizedDistance - hotspotRatio) /
      Math.max(falloffRatio - hotspotRatio, 1e-6),
    0,
    1,
  );
  const eased = 1 - t * t * (3 - 2 * t);
  return normalizedDistance <= falloffRatio
    ? eased
    : eased *
        (1 -
          (normalizedDistance - falloffRatio) /
            Math.max(1 - falloffRatio, 1e-6));
};

export const drawFlashlightOverlay = (
  ctx,
  pointerState,
  {
    width,
    height,
    radiusPx = FLASHLIGHT_PRESET.radiusPx,
    bloomRadiusPx = FLASHLIGHT_PRESET.bloomRadiusPx,
    bloomAlpha = FLASHLIGHT_PRESET.bloomAlpha,
    dustAlpha = FLASHLIGHT_PRESET.dustAlpha,
    directionalAlpha = FLASHLIGHT_PRESET.directionalAlpha,
    directionalLengthScale = FLASHLIGHT_PRESET.directionalLengthScale,
    directionalWidthScale = FLASHLIGHT_PRESET.directionalWidthScale,
    sourceOffsetYPx = FLASHLIGHT_PRESET.sourceOffsetYPx,
    colors = FLASHLIGHT_PRESET.colors,
  } = {},
) => {
  if (
    !pointerState?.active ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    !Number.isFinite(radiusPx) ||
    radiusPx <= 0
  ) {
    return;
  }

  const sourceX = width * 0.5;
  const sourceY = height + sourceOffsetYPx;
  const driftX = clamp((pointerState.x - width * 0.5) * 0.07, -28, 28);
  const driftY = clamp((pointerState.y - height * 0.5) * 0.05, -24, 24);
  const beamAngle = Math.atan2(
    pointerState.y - sourceY,
    pointerState.x - sourceX,
  );

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.82;

  const atmosphere = ctx.createRadialGradient(
    pointerState.x + driftX * 0.45,
    pointerState.y + driftY * 0.35,
    radiusPx * 0.14,
    pointerState.x + driftX,
    pointerState.y + driftY,
    bloomRadiusPx,
  );
  atmosphere.addColorStop(0, rgba(colors.bloomCore, bloomAlpha));
  atmosphere.addColorStop(0.24, rgba(colors.bloomMid, 0.02));
  atmosphere.addColorStop(0.68, rgba(colors.bloomEdge, 0.048));
  atmosphere.addColorStop(1, rgba(colors.bloomFade, 0));
  ctx.fillStyle = atmosphere;
  ctx.beginPath();
  ctx.arc(
    pointerState.x + driftX,
    pointerState.y + driftY,
    bloomRadiusPx,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  const spill = ctx.createRadialGradient(
    pointerState.x + driftX * 0.15,
    pointerState.y + driftY * 0.12,
    radiusPx * 0.18,
    pointerState.x + driftX * 0.35,
    pointerState.y + driftY * 0.28,
    radiusPx,
  );
  spill.addColorStop(0, rgba(colors.dustCore, dustAlpha));
  spill.addColorStop(0.2, rgba(colors.dustMid, 0.018));
  spill.addColorStop(0.5, rgba(colors.dustEdge, 0.009));
  spill.addColorStop(0.78, rgba(colors.dustFade, 0.003));
  spill.addColorStop(1, rgba(colors.dustFade, 0));
  ctx.fillStyle = spill;
  ctx.beginPath();
  ctx.arc(
    pointerState.x + driftX * 0.25,
    pointerState.y + driftY * 0.2,
    radiusPx,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.save();
  ctx.translate(pointerState.x + driftX * 0.4, pointerState.y + driftY * 0.3);
  ctx.rotate(beamAngle);
  ctx.scale(directionalLengthScale, directionalWidthScale);

  const directionalDust = ctx.createRadialGradient(
    radiusPx * 0.08,
    0,
    radiusPx * 0.06,
    radiusPx * 0.18,
    0,
    radiusPx,
  );
  directionalDust.addColorStop(
    0,
    rgba(colors.directionalCore, directionalAlpha),
  );
  directionalDust.addColorStop(0.36, rgba(colors.directionalMid, 0.01));
  directionalDust.addColorStop(0.78, rgba(colors.directionalEdge, 0.003));
  directionalDust.addColorStop(1, rgba(colors.dustFade, 0));
  ctx.fillStyle = directionalDust;
  ctx.beginPath();
  ctx.arc(radiusPx * 0.18, 0, radiusPx * 0.76, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
};

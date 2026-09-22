export const getFlowerBlossomPosition = (flower, timeS = 0) => {
  const sway = Math.sin(timeS * 2.4 + (flower.swayPhase ?? 0)) * 0.8;
  return { x: flower.x + sway, y: flower.y };
};

const PETAL_OFFSET = 5;
const PETAL_RADIUS = 3.4;
export const FLOWER_HEAD_RADIUS = PETAL_OFFSET + PETAL_RADIUS;

export const renderFlowerHead = (ctx, blossomX, blossomY, timeS = 0) => {
  ctx.fillStyle = "rgba(247, 199, 66, 0.96)";
  for (let petalIndex = 0; petalIndex < 6; petalIndex += 1) {
    const angle = (petalIndex / 6) * Math.PI * 2 + timeS * 0.2;
    ctx.beginPath();
    ctx.arc(blossomX + Math.cos(angle) * PETAL_OFFSET, blossomY + Math.sin(angle) * PETAL_OFFSET,
      PETAL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(164, 80, 122, 0.92)";
  ctx.beginPath();
  ctx.arc(blossomX, blossomY, 3.3, 0, Math.PI * 2);
  ctx.fill();
};

export const renderFlower = (ctx, flower, timeS) => {
  const { x: blossomX, y: blossomY } = getFlowerBlossomPosition(flower, timeS);
  ctx.strokeStyle = "rgba(68, 126, 66, 0.68)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(blossomX, blossomY + 7);
  ctx.lineTo(flower.x, flower.y + 20);
  ctx.stroke();
  renderFlowerHead(ctx, blossomX, blossomY, timeS);
};

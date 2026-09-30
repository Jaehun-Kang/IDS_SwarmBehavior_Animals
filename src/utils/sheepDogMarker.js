export const drawDogMarker = (ctx, x, y) => {
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fill();
};

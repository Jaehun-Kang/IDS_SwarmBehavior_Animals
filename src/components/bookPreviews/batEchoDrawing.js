// Slowed display timing only; it does not change sensory or flight calculations.
export function drawBatEchoes(ctx, pulses, time, scale) {
  const speed = 40;
  ctx.save();
  ctx.lineWidth = 1.1;
  ctx.lineCap = "round";
  for (const pulse of pulses) {
    const age = time - pulse.time;
    if (age < 0 || age >= 0.4) continue;
    if (age < 0.2) {
      ctx.strokeStyle = "#247f8a";
      ctx.globalAlpha = 0.65 * Math.sin(Math.PI * age / 0.2);
      ctx.beginPath();
      ctx.arc(pulse.x * scale, pulse.y * scale, age * speed * scale,
        pulse.heading - 1.25, pulse.heading + 1.25);
      ctx.stroke();
    }
    for (const target of pulse.targets ?? []) {
      const distance = Math.hypot(target.x - pulse.x, target.y - pulse.y);
      const travel = distance / speed;
      const returnAge = age - travel;
      if (travel <= 0 || returnAge <= 0 || returnAge >= travel) continue;
      const heading = Math.atan2(pulse.y - target.y, pulse.x - target.x);
      ctx.strokeStyle = "#916322";
      ctx.globalAlpha = 0.8 * Math.sin(Math.PI * returnAge / travel);
      ctx.beginPath();
      ctx.arc(target.x * scale, target.y * scale, returnAge * speed * scale,
        heading - 0.22, heading + 0.22);
      ctx.stroke();
    }
  }
  ctx.restore();
}

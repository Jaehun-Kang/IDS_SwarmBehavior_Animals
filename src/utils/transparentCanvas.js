export const applyTransparentCanvasStyle = (canvas) => {
  if (!canvas) {
    return;
  }

  canvas.style.background = "transparent";
};

export const clearTransparentCanvas2d = (ctx, width, height) => {
  ctx.clearRect(0, 0, width, height);
};

export const clearTransparentWebgl = (gl) => {
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
};

export const clearTransparentP5 = (p5) => {
  p5.clear();
};
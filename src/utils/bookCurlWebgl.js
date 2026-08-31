const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
varying vec2 v_texCoord;

void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  v_texCoord.y = 1.0 - v_texCoord.y;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER_SOURCE = `
precision highp float;

uniform sampler2D u_fromPage;
uniform sampler2D u_toPage;
uniform vec2 u_resolution;
uniform float u_curlPos;
uniform float u_time;
uniform float u_direction;
uniform float u_coverMode;

varying vec2 v_texCoord;

const float PI = 3.14159265;

float smoothClamp(float value, float edge0, float edge1) {
  return smoothstep(edge0, edge1, clamp(value, edge0, edge1));
}

void main() {
  vec2 spreadUv = v_texCoord;
  vec2 turnUv = u_direction > 0.0
    ? spreadUv
    : vec2(1.0 - spreadUv.x, spreadUv.y);

  float cosAngle = clamp(u_curlPos * 2.0 - 1.0, -0.985, 1.0);
  float turnAmount = 1.0 - u_curlPos;
  float absCos = abs(cosAngle);
  vec2 baseUv = u_direction > 0.0
    ? turnUv
    : vec2(1.0 - turnUv.x, turnUv.y);
  vec4 fromColor = texture2D(u_fromPage, baseUv);
  vec4 toColor = texture2D(u_toPage, baseUv);
  bool isCoverTurn = u_coverMode > 0.5;
  bool isClosingCover = u_coverMode > 1.5;
  vec4 color;

  if (isClosingCover) {
    color = spreadUv.x < 0.5
      ? vec4(0.0, 0.0, 0.0, 0.0)
      : texture2D(u_fromPage, spreadUv);
  } else if (isCoverTurn) {
    color = spreadUv.x < 0.5
      ? vec4(0.0, 0.0, 0.0, 0.0)
      : texture2D(u_toPage, spreadUv);
  } else {
    color = turnUv.x < 0.5 ? fromColor : toColor;
  }

  float movingEdge = 0.5 + cosAngle * 0.5;
  float settleFade = 1.0 - smoothstep(0.82, 0.98, turnAmount);
  float shadowProgress = smoothstep(0.06, 0.78, turnAmount) * settleFade;
  float castShadow = 1.0 - smoothstep(0.0, 0.038, abs(turnUv.x - movingEdge));
  float fixedSideShadowRamp = mix(
    smoothstep(0.48, 0.9, turnAmount),
    1.0,
    step(0.5, turnUv.x)
  );
  color.rgb *= 1.0 - castShadow * 0.065 * shadowProgress * fixedSideShadowRamp;

  float safeSign = cosAngle < 0.0 ? -1.0 : 1.0;
  float safeCos = safeSign * max(absCos, 0.0001);
  float pageLocal = (turnUv.x - 0.5) / (0.5 * safeCos);

  if (pageLocal >= 0.0 && pageLocal <= 1.0) {
    float sheetMask = 1.0;
    vec2 pageUv;

    if (safeCos >= 0.0) {
      pageUv = u_direction > 0.0
        ? vec2(0.5 + pageLocal * 0.5, turnUv.y)
        : vec2(0.5 - pageLocal * 0.5, turnUv.y);
      vec4 sheetColor = texture2D(u_fromPage, pageUv);
      color = mix(color, sheetColor, sheetMask * sheetColor.a);
    } else {
      pageUv = u_direction > 0.0
        ? vec2(0.5 - pageLocal * 0.5, turnUv.y)
        : vec2(0.5 + pageLocal * 0.5, turnUv.y);
      vec4 backColor = texture2D(u_toPage, pageUv);
      float diffuse = mix(1.0, 0.62 + 0.38 * absCos, settleFade);
      float edgeHighlight = smoothstep(0.74, 1.0, pageLocal) * 0.045 * settleFade;
      backColor.rgb *= diffuse;
      backColor.rgb += edgeHighlight;
      color = mix(color, backColor, sheetMask * backColor.a);
    }
  }

  if (absCos <= 0.025) {
    float spineGlow = 1.0 - smoothstep(0.0, 0.018, abs(turnUv.x - 0.5));
    color.rgb += spineGlow * 0.08 * shadowProgress;
  }

  gl_FragColor = color;
}`;

const compileShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message || "Unable to compile book curl shader");
  }

  return shader;
};

const createProgram = (gl) => {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
  const fragmentShader = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    FRAGMENT_SHADER_SOURCE,
  );
  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(message || "Unable to link book curl program");
  }

  return program;
};

const createTexture = (gl, source) => {
  const texture = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    source,
  );

  return texture;
};

const updateTexture = (gl, texture, source) => {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    source,
  );
};

export const renderBookCurlTransition = ({
  canvas,
  fromImage,
  toImage,
  width,
  height,
  direction,
  durationMs,
  beforeRender,
  onComplete,
  coverMode = 0,
}) => {
  const renderer = createBookCurlRenderer({
    canvas,
    fromImage,
    toImage,
    width,
    height,
    direction,
    coverMode,
  });

  if (!renderer) {
    return null;
  }

  let frameId = 0;
  let startTime = 0;
  let disposed = false;

  const draw = (now) => {
    if (disposed) {
      return;
    }

    if (!startTime) {
      startTime = now;
    }

    const progress = Math.min(1, (now - startTime) / durationMs);
    const eased = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    const curlPos = 1 - eased * 0.995;

    beforeRender?.(renderer);
    renderer.render(curlPos, now);

    if (progress < 1) {
      frameId = window.requestAnimationFrame(draw);
      return;
    }

    onComplete?.();
    dispose();
  };

  const dispose = () => {
    if (disposed) {
      return;
    }

    disposed = true;
    window.cancelAnimationFrame(frameId);
    renderer.dispose();
  };

  draw(performance.now());

  return dispose;
};

export const createBookCurlRenderer = ({
  canvas,
  fromImage,
  toImage,
  width,
  height,
  direction,
  coverMode = 0,
}) => {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
  });

  if (!gl) {
    return null;
  }

  const program = createProgram(gl);
  const buffer = gl.createBuffer();
  const fromTexture = createTexture(gl, fromImage);
  const toTexture = createTexture(gl, toImage);
  const aPosition = gl.getAttribLocation(program, "a_position");
  const uniforms = {
    fromPage: gl.getUniformLocation(program, "u_fromPage"),
    toPage: gl.getUniformLocation(program, "u_toPage"),
    resolution: gl.getUniformLocation(program, "u_resolution"),
    curlPos: gl.getUniformLocation(program, "u_curlPos"),
    time: gl.getUniformLocation(program, "u_time"),
    direction: gl.getUniformLocation(program, "u_direction"),
    coverMode: gl.getUniformLocation(program, "u_coverMode"),
  };
  let disposed = false;

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );

  const render = (curlPos, now = performance.now()) => {
    if (disposed) {
      return;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fromTexture);
    gl.uniform1i(uniforms.fromPage, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, toTexture);
    gl.uniform1i(uniforms.toPage, 1);

    gl.uniform2f(uniforms.resolution, width, height);
    gl.uniform1f(uniforms.curlPos, curlPos);
    gl.uniform1f(uniforms.time, now * 0.001);
    gl.uniform1f(uniforms.direction, direction >= 0 ? 1 : -1);
    gl.uniform1f(uniforms.coverMode, coverMode);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const updateTextures = ({ fromImage: nextFromImage, toImage: nextToImage }) => {
    if (disposed) {
      return;
    }

    if (nextFromImage) {
      updateTexture(gl, fromTexture, nextFromImage);
    }

    if (nextToImage) {
      updateTexture(gl, toTexture, nextToImage);
    }
  };

  const dispose = () => {
    if (disposed) {
      return;
    }

    disposed = true;
    gl.deleteTexture(fromTexture);
    gl.deleteTexture(toTexture);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
  };

  render(1);

  return {
    render,
    updateTextures,
    dispose,
  };
};

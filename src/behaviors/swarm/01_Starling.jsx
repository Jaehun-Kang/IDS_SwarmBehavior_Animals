import React from "react";
import starlingSpriteSheetUrl from "../../assets/starling_1.svg";

const PARAMS = {
  BOID_COUNT: 1850,
  IS_PREDATOR_ACTIVE: true,
  NEIGHBOR_COUNT: 7,
  METERS_TO_PIXELS: 42,
  DISTANCE_SCALE: 0.72,
  get HARD_CORE() {
    return 0.39 * this.METERS_TO_PIXELS * this.DISTANCE_SCALE;
  },
  TARGET_SPEED_MIN_MULTIPLIER: 2.8,
  TARGET_SPEED_MAX_MULTIPLIER: 5.1,
  get TARGET_SPEED_MIN() {
    return this.TARGET_SPEED_MIN_MULTIPLIER * this.METERS_TO_PIXELS;
  },
  get TARGET_SPEED_MAX() {
    return this.TARGET_SPEED_MAX_MULTIPLIER * this.METERS_TO_PIXELS;
  },
  REACTION_MEAN: 0.076,
  REACTION_STD: 0.01,
  get SIGNAL_SPEED() {
    return 22 * this.METERS_TO_PIXELS;
  },
  get TURN_RADIUS() {
    return 4.2 * this.METERS_TO_PIXELS * this.DISTANCE_SCALE;
  },
  MAX_HISTORY_AGE: 0.24,
  MAX_DT: 0.033,
  PREDATOR_SCREEN_DETECTION_RADIUS_PX: 180,
  PREDATOR_SCREEN_IMPACT_RADIUS_PX: 26,
  PREDATOR_ESCAPE_BOOST: 1.55,
  PREDATOR_TURN_BOOST: 2.2,
  PREDATOR_SPEED_BOOST: 1.14,
  SCREEN_MARGIN: 0,
  EDGE_AVOID_ZONE: 320,
  VISIBLE_DEPTH_MIN: -245,
  VISIBLE_DEPTH_MAX: 260,
  TOPOLOGY_CELL_SIZE: 70,
  MAX_GRID_SEARCH_RADIUS: 6,
  EDGE_LOOKAHEAD_TIME: 0.65,
  REFERENCE_LOCK_DURATION: 3,
  VERTICAL_BRANCH_THRESHOLD: 0.95,
  SPRITE_FRAME_COUNT: 6,
  SPRITE_FLAP_RATE_MIN: 5.4,
  SPRITE_FLAP_RATE_MAX: 8.6,
  PROJECT_X_FROM_X: 0.9,
  PROJECT_X_FROM_Z: 0.28,
  PROJECT_Y_FROM_Y: 1,
  PROJECT_Y_FROM_Z: 0.1,
  PROJECT_PERSPECTIVE_BASE: 0.92,
  PROJECT_PERSPECTIVE_OFFSET: 240,
  PROJECT_PERSPECTIVE_DIVISOR: 1400,
};

const CONTROL_FIELDS = [
  {
    key: "BOID_COUNT",
    label: "개체 수",
    min: 300,
    max: 2600,
    step: 50,
    formatValue: (value) => `${value}`,
  },
  {
    key: "IS_PREDATOR_ACTIVE",
    label: "포식자 반응",
    type: "toggle",
    formatValue: (value) => (value ? "켜짐" : "꺼짐"),
  },
  {
    key: "NEIGHBOR_COUNT",
    label: "최근접 이웃 수",
    min: 3,
    max: 12,
    step: 1,
    formatValue: (value) => `${value}`,
  },
  {
    key: "DISTANCE_SCALE",
    label: "거리 스케일",
    min: 0.35,
    max: 1.2,
    step: 0.01,
    formatValue: (value) => value.toFixed(2),
  },
  {
    key: "TARGET_SPEED_MIN_MULTIPLIER",
    label: "최저 속도",
    min: 0.8,
    max: 5,
    step: 0.1,
    formatValue: (value) => `${value.toFixed(1)} m/s`,
  },
  {
    key: "TARGET_SPEED_MAX_MULTIPLIER",
    label: "최고 속도",
    min: 1.2,
    max: 8,
    step: 0.1,
    formatValue: (value) => `${value.toFixed(1)} m/s`,
  },
  {
    key: "REACTION_MEAN",
    label: "반응 지연",
    min: 0.03,
    max: 0.16,
    step: 0.001,
    formatValue: (value) => `${value.toFixed(3)} s`,
  },
  {
    key: "REFERENCE_LOCK_DURATION",
    label: "참조 고정 시간",
    min: 0.5,
    max: 6,
    step: 0.1,
    formatValue: (value) => `${value.toFixed(1)} s`,
  },
];

const DEFAULT_CONTROL_STATE = {
  BOID_COUNT: PARAMS.BOID_COUNT,
  IS_PREDATOR_ACTIVE: PARAMS.IS_PREDATOR_ACTIVE,
  NEIGHBOR_COUNT: PARAMS.NEIGHBOR_COUNT,
  DISTANCE_SCALE: PARAMS.DISTANCE_SCALE,
  TARGET_SPEED_MIN_MULTIPLIER: PARAMS.TARGET_SPEED_MIN_MULTIPLIER,
  TARGET_SPEED_MAX_MULTIPLIER: PARAMS.TARGET_SPEED_MAX_MULTIPLIER,
  REACTION_MEAN: PARAMS.REACTION_MEAN,
  REFERENCE_LOCK_DURATION: PARAMS.REFERENCE_LOCK_DURATION,
};

const sanitizeControlState = (rawControls = DEFAULT_CONTROL_STATE) => {
  const nextControls = {
    ...DEFAULT_CONTROL_STATE,
    ...rawControls,
  };

  nextControls.TARGET_SPEED_MAX_MULTIPLIER = Math.max(
    nextControls.TARGET_SPEED_MAX_MULTIPLIER,
    nextControls.TARGET_SPEED_MIN_MULTIPLIER,
  );
  nextControls.TARGET_SPEED_MIN_MULTIPLIER = Math.min(
    nextControls.TARGET_SPEED_MIN_MULTIPLIER,
    nextControls.TARGET_SPEED_MAX_MULTIPLIER,
  );
  nextControls.IS_PREDATOR_ACTIVE = Boolean(nextControls.IS_PREDATOR_ACTIVE);

  return nextControls;
};

const STARLING_UI = {
  controlFields: CONTROL_FIELDS,
  defaultControlState: DEFAULT_CONTROL_STATE,
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (start, end, amount) => start + (end - start) * amount;
const length3D = (vector) => Math.hypot(vector.x, vector.y, vector.z);

const normalize3D = (vector, fallback = { x: 1, y: 0, z: 0 }) => {
  const magnitude = length3D(vector);
  if (magnitude < 1e-6) {
    return { ...fallback };
  }

  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
    z: vector.z / magnitude,
  };
};

const add3D = (left, right) => ({
  x: left.x + right.x,
  y: left.y + right.y,
  z: left.z + right.z,
});

const subtract3D = (left, right) => ({
  x: left.x - right.x,
  y: left.y - right.y,
  z: left.z - right.z,
});

const scale3D = (vector, scale) => ({
  x: vector.x * scale,
  y: vector.y * scale,
  z: vector.z * scale,
});

const dot3D = (left, right) =>
  left.x * right.x + left.y * right.y + left.z * right.z;

const cross3D = (left, right) => ({
  x: left.y * right.z - left.z * right.y,
  y: left.z * right.x - left.x * right.z,
  z: left.x * right.y - left.y * right.x,
});

const rotateTowards = (current, target, maxAngle) => {
  const from = normalize3D(current);
  const to = normalize3D(target, from);
  const cosine = clamp(dot3D(from, to), -1, 1);
  const angle = Math.acos(cosine);

  if (angle < 1e-5) {
    return to;
  }

  const ratio = Math.min(1, maxAngle / angle);
  return normalize3D({
    x: lerp(from.x, to.x, ratio),
    y: lerp(from.y, to.y, ratio),
    z: lerp(from.z, to.z, ratio),
  });
};

const randomBetween = (min, max) => min + Math.random() * (max - min);

const randomNormal = (mean, stdDev) => {
  const u = 1 - Math.random();
  const v = Math.random();
  const gaussian = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + gaussian * stdDev;
};

const sampleShellPoint = (center, dimensions) => {
  const theta = randomBetween(0, Math.PI * 2);
  const phi = Math.acos(randomBetween(-1, 1));
  const radialBias = 0.3 + Math.pow(Math.random(), 0.45) * 0.7;

  return {
    x: center.x + Math.sin(phi) * Math.cos(theta) * dimensions.x * radialBias,
    y: center.y + Math.cos(phi) * dimensions.y * radialBias,
    z: center.z + Math.sin(phi) * Math.sin(theta) * dimensions.z * radialBias,
  };
};

const getProjectedPoint = (position, width, height) => {
  const cameraX =
    position.x * PARAMS.PROJECT_X_FROM_X + position.z * PARAMS.PROJECT_X_FROM_Z;
  const cameraY =
    position.y * PARAMS.PROJECT_Y_FROM_Y + position.z * PARAMS.PROJECT_Y_FROM_Z;
  const perspective =
    PARAMS.PROJECT_PERSPECTIVE_BASE +
    (position.z + PARAMS.PROJECT_PERSPECTIVE_OFFSET) /
      PARAMS.PROJECT_PERSPECTIVE_DIVISOR;

  return {
    x: width * 0.5 + cameraX * perspective,
    y: height * 0.5 + cameraY * perspective,
    scale: perspective,
  };
};

const projectBoid = (boid, width, height) => {
  return getProjectedPoint(boid.position, width, height);
};

const getWorldPointOnPointerRay = (screenX, screenY, depth, width, height) => {
  const perspective =
    PARAMS.PROJECT_PERSPECTIVE_BASE +
    (depth + PARAMS.PROJECT_PERSPECTIVE_OFFSET) /
      PARAMS.PROJECT_PERSPECTIVE_DIVISOR;
  const cameraX = (screenX - width * 0.5) / Math.max(perspective, 1e-6);
  const cameraY = (screenY - height * 0.5) / Math.max(perspective, 1e-6);

  return {
    x: (cameraX - depth * PARAMS.PROJECT_X_FROM_Z) / PARAMS.PROJECT_X_FROM_X,
    y: (cameraY - depth * PARAMS.PROJECT_Y_FROM_Z) / PARAMS.PROJECT_Y_FROM_Y,
    z: depth,
  };
};

const getClosestPointOnSegment3D = (point, start, end) => {
  const segment = subtract3D(end, start);
  const segmentLengthSquared = dot3D(segment, segment);

  if (segmentLengthSquared < 1e-6) {
    return { ...start };
  }

  const t = clamp(
    dot3D(subtract3D(point, start), segment) / segmentLengthSquared,
    0,
    1,
  );

  return add3D(start, scale3D(segment, t));
};

const getPredatorInfluence = (boid, width, height, pointer) => {
  if (!PARAMS.IS_PREDATOR_ACTIVE || !pointer?.active) {
    return {
      evasionIntensity: 0,
      escape: { x: 0, y: 0, z: 0 },
    };
  }

  const rayStart = getWorldPointOnPointerRay(
    pointer.x,
    pointer.y,
    PARAMS.VISIBLE_DEPTH_MIN,
    width,
    height,
  );
  const rayEnd = getWorldPointOnPointerRay(
    pointer.x,
    pointer.y,
    PARAMS.VISIBLE_DEPTH_MAX,
    width,
    height,
  );
  const closestPoint = getClosestPointOnSegment3D(
    boid.position,
    rayStart,
    rayEnd,
  );
  const rayOffset = subtract3D(boid.position, closestPoint);
  const distance = length3D(rayOffset);
  const projected = getProjectedPoint(boid.position, width, height);
  const worldDetectionRadius =
    PARAMS.PREDATOR_SCREEN_DETECTION_RADIUS_PX /
    Math.max(projected.scale, 1e-6);
  const worldImpactRadius =
    PARAMS.PREDATOR_SCREEN_IMPACT_RADIUS_PX / Math.max(projected.scale, 1e-6);

  if (distance >= worldDetectionRadius) {
    return {
      evasionIntensity: 0,
      escape: { x: 0, y: 0, z: 0 },
    };
  }

  const evasionIntensity =
    1 -
    clamp(
      (distance - worldImpactRadius) /
        Math.max(worldDetectionRadius - worldImpactRadius, 1e-6),
      0,
      1,
    );
  const away = normalize3D(rayOffset, boid.direction);

  return {
    evasionIntensity,
    escape: normalize3D(
      {
        x: away.x,
        y: away.y * 0.82,
        z: away.z,
      },
      boid.direction,
    ),
  };
};

const getVisibleAvoidance = (boid, width, height) => {
  const futureX =
    boid.position.x +
    boid.direction.x * boid.speed * PARAMS.EDGE_LOOKAHEAD_TIME;
  const futureY =
    boid.position.y +
    boid.direction.y * boid.speed * PARAMS.EDGE_LOOKAHEAD_TIME;
  const futureZ =
    boid.position.z +
    boid.direction.z * boid.speed * PARAMS.EDGE_LOOKAHEAD_TIME;
  const projectedPerspective =
    PARAMS.PROJECT_PERSPECTIVE_BASE +
    (boid.position.z + PARAMS.PROJECT_PERSPECTIVE_OFFSET) /
      PARAMS.PROJECT_PERSPECTIVE_DIVISOR;
  const predictedPerspective =
    PARAMS.PROJECT_PERSPECTIVE_BASE +
    (futureZ + PARAMS.PROJECT_PERSPECTIVE_OFFSET) /
      PARAMS.PROJECT_PERSPECTIVE_DIVISOR;
  const projectedX =
    width * 0.5 +
    (boid.position.x * PARAMS.PROJECT_X_FROM_X +
      boid.position.z * PARAMS.PROJECT_X_FROM_Z) *
      projectedPerspective;
  const projectedY =
    height * 0.5 +
    (boid.position.y * PARAMS.PROJECT_Y_FROM_Y +
      boid.position.z * PARAMS.PROJECT_Y_FROM_Z) *
      projectedPerspective;
  const predictedX =
    width * 0.5 +
    (futureX * PARAMS.PROJECT_X_FROM_X + futureZ * PARAMS.PROJECT_X_FROM_Z) *
      predictedPerspective;
  const predictedY =
    height * 0.5 +
    (futureY * PARAMS.PROJECT_Y_FROM_Y + futureZ * PARAMS.PROJECT_Y_FROM_Z) *
      predictedPerspective;
  const leftPush = Math.max(
    clamp(
      (PARAMS.SCREEN_MARGIN + PARAMS.EDGE_AVOID_ZONE - projectedX) /
        PARAMS.EDGE_AVOID_ZONE,
      0,
      1,
    ),
    clamp(
      (PARAMS.SCREEN_MARGIN + PARAMS.EDGE_AVOID_ZONE - predictedX) /
        PARAMS.EDGE_AVOID_ZONE,
      0,
      1,
    ),
  );
  const rightPush = Math.max(
    clamp(
      (projectedX - (width - PARAMS.SCREEN_MARGIN - PARAMS.EDGE_AVOID_ZONE)) /
        PARAMS.EDGE_AVOID_ZONE,
      0,
      1,
    ),
    clamp(
      (predictedX - (width - PARAMS.SCREEN_MARGIN - PARAMS.EDGE_AVOID_ZONE)) /
        PARAMS.EDGE_AVOID_ZONE,
      0,
      1,
    ),
  );
  const topPush = Math.max(
    clamp(
      (PARAMS.SCREEN_MARGIN + PARAMS.EDGE_AVOID_ZONE - projectedY) /
        PARAMS.EDGE_AVOID_ZONE,
      0,
      1,
    ),
    clamp(
      (PARAMS.SCREEN_MARGIN + PARAMS.EDGE_AVOID_ZONE - predictedY) /
        PARAMS.EDGE_AVOID_ZONE,
      0,
      1,
    ),
  );
  const bottomPush = Math.max(
    clamp(
      (projectedY - (height - PARAMS.SCREEN_MARGIN - PARAMS.EDGE_AVOID_ZONE)) /
        PARAMS.EDGE_AVOID_ZONE,
      0,
      1,
    ),
    clamp(
      (predictedY - (height - PARAMS.SCREEN_MARGIN - PARAMS.EDGE_AVOID_ZONE)) /
        PARAMS.EDGE_AVOID_ZONE,
      0,
      1,
    ),
  );
  const depthPushNear = clamp(
    (PARAMS.VISIBLE_DEPTH_MIN - boid.position.z) / 120,
    0,
    1,
  );
  const depthPushFar = clamp(
    (boid.position.z - PARAMS.VISIBLE_DEPTH_MAX) / 120,
    0,
    1,
  );
  const depthPushFutureNear = clamp(
    (PARAMS.VISIBLE_DEPTH_MIN - futureZ) / 120,
    0,
    1,
  );
  const depthPushFutureFar = clamp(
    (futureZ - PARAMS.VISIBLE_DEPTH_MAX) / 120,
    0,
    1,
  );

  return {
    x: (leftPush * leftPush - rightPush * rightPush) * 2.75,
    y: (topPush * topPush - bottomPush * bottomPush) * 2.2,
    z:
      Math.max(depthPushNear, depthPushFutureNear) * 1.35 -
      Math.max(depthPushFar, depthPushFutureFar) * 1.35,
    bankBias: (leftPush * leftPush - rightPush * rightPush) * 0.8,
    pressure: Math.max(
      leftPush,
      rightPush,
      topPush,
      bottomPush,
      depthPushNear,
      depthPushFar,
      depthPushFutureNear,
      depthPushFutureFar,
    ),
  };
};

const keepBoidVisible = (
  boid,
  width,
  height,
  margin = PARAMS.SCREEN_MARGIN,
) => {
  boid.position.z = clamp(
    boid.position.z,
    PARAMS.VISIBLE_DEPTH_MIN,
    PARAMS.VISIBLE_DEPTH_MAX,
  );

  const perspective = 0.92 + (boid.position.z + 240) / 1400;
  const minCameraX = (margin - width * 0.5) / perspective;
  const maxCameraX = (width - margin - width * 0.5) / perspective;
  const minCameraY = (margin - height * 0.5) / perspective;
  const maxCameraY = (height - margin - height * 0.5) / perspective;

  const clampedCameraX = clamp(
    boid.position.x * 0.9 + boid.position.z * 0.28,
    minCameraX,
    maxCameraX,
  );
  const clampedCameraY = clamp(
    boid.position.y + boid.position.z * 0.1,
    minCameraY,
    maxCameraY,
  );

  boid.position.x = (clampedCameraX - boid.position.z * 0.28) / 0.9;
  boid.position.y = clampedCameraY - boid.position.z * 0.1;
};

const STARLING_VERTEX_SHADER = `
attribute vec2 aPosition;
attribute float aSize;
attribute float aAngle;
attribute float aBank;
attribute float aGlow;
attribute float aFrame;
attribute vec4 aColor;

uniform vec2 uResolution;
uniform float uPixelRatio;

varying vec4 vColor;
varying float vAngle;
varying float vBank;
varying float vGlow;
varying float vFrame;

void main() {
  vec2 clip = vec2(
    (aPosition.x / uResolution.x) * 2.0 - 1.0,
    1.0 - (aPosition.y / uResolution.y) * 2.0
  );

  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = aSize * uPixelRatio;
  vColor = aColor;
  vAngle = aAngle;
  vBank = aBank;
  vGlow = aGlow;
  vFrame = aFrame;
}
`;

const STARLING_FRAGMENT_SHADER = `
precision mediump float;

varying vec4 vColor;
varying float vAngle;
varying float vBank;
varying float vGlow;
varying float vFrame;

uniform sampler2D uSpriteSheet;

mat2 rotate2d(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  vec2 rotated = rotate2d(vAngle) * uv;
  vec2 spriteUv = vec2((rotated.x + 1.0) * 0.5, 1.0 - (rotated.y + 1.0) * 0.5);

  if (
    spriteUv.x < 0.0 ||
    spriteUv.x > 1.0 ||
    spriteUv.y < 0.0 ||
    spriteUv.y > 1.0
  ) {
    discard;
  }

  float frameIndex = floor(vFrame + 0.5);
  vec2 atlasUv = vec2((spriteUv.x + frameIndex) / 6.0, spriteUv.y);
  vec4 sprite = texture2D(uSpriteSheet, atlasUv);
  float glow = (1.0 - smoothstep(0.16, 0.82, length(uv))) * vGlow;
  float alpha = max(sprite.a * vColor.a, glow * 0.28);

  if (alpha < 0.02) {
    discard;
  }

  vec3 spriteColor = pow(max(sprite.rgb, vec3(0.0)), vec3(0.92)) * 1.08;
  vec3 glowColor = mix(spriteColor, vec3(0.88, 0.43, 0.29), 0.38);
  vec3 color = clamp(spriteColor + glowColor * glow * 0.18, 0.0, 1.0);
  gl_FragColor = vec4(color, alpha);
}
`;

const loadTexture = (gl, sourceUrl) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const rasterCanvas = document.createElement("canvas");
      rasterCanvas.width = image.naturalWidth || image.width;
      rasterCanvas.height = image.naturalHeight || image.height;

      const rasterContext = rasterCanvas.getContext("2d");
      if (!rasterContext) {
        reject(new Error("texture-rasterize-failed"));
        return;
      }

      rasterContext.clearRect(0, 0, rasterCanvas.width, rasterCanvas.height);
      rasterContext.drawImage(
        image,
        0,
        0,
        rasterCanvas.width,
        rasterCanvas.height,
      );

      const texture = gl.createTexture();
      if (!texture) {
        reject(new Error("texture-create-failed"));
        return;
      }

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        rasterCanvas,
      );
      gl.bindTexture(gl.TEXTURE_2D, null);
      resolve(texture);
    };

    image.onerror = () => reject(new Error("texture-load-failed"));
    image.src = sourceUrl;
  });

const createShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
};

const createProgram = (gl, vertexSource, fragmentSource) => {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  if (!vertexShader || !fragmentShader) {
    if (vertexShader) {
      gl.deleteShader(vertexShader);
    }
    if (fragmentShader) {
      gl.deleteShader(fragmentShader);
    }
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  return program;
};

const initializeRenderer = (gl) => {
  const program = createProgram(
    gl,
    STARLING_VERTEX_SHADER,
    STARLING_FRAGMENT_SHADER,
  );
  if (!program) {
    return null;
  }

  return {
    program,
    attributes: {
      position: gl.getAttribLocation(program, "aPosition"),
      size: gl.getAttribLocation(program, "aSize"),
      angle: gl.getAttribLocation(program, "aAngle"),
      bank: gl.getAttribLocation(program, "aBank"),
      glow: gl.getAttribLocation(program, "aGlow"),
      frame: gl.getAttribLocation(program, "aFrame"),
      color: gl.getAttribLocation(program, "aColor"),
    },
    uniforms: {
      resolution: gl.getUniformLocation(program, "uResolution"),
      pixelRatio: gl.getUniformLocation(program, "uPixelRatio"),
      spriteSheet: gl.getUniformLocation(program, "uSpriteSheet"),
    },
    buffers: {
      position: gl.createBuffer(),
      size: gl.createBuffer(),
      angle: gl.createBuffer(),
      bank: gl.createBuffer(),
      glow: gl.createBuffer(),
      frame: gl.createBuffer(),
      color: gl.createBuffer(),
    },
    textures: {
      spriteSheet: null,
    },
    renderOrder: Array.from({ length: PARAMS.BOID_COUNT }, (_, index) => index),
    arrays: {
      positions: new Float32Array(PARAMS.BOID_COUNT * 2),
      sizes: new Float32Array(PARAMS.BOID_COUNT),
      angles: new Float32Array(PARAMS.BOID_COUNT),
      banks: new Float32Array(PARAMS.BOID_COUNT),
      glows: new Float32Array(PARAMS.BOID_COUNT),
      frames: new Float32Array(PARAMS.BOID_COUNT),
      colors: new Float32Array(PARAMS.BOID_COUNT * 4),
    },
  };
};

const bindFloatAttribute = (gl, buffer, location, size, values) => {
  if (!buffer || location < 0) {
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, values, gl.STREAM_DRAW);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
};

const destroyRenderer = (gl, renderer) => {
  if (!renderer) {
    return;
  }

  Object.values(renderer.buffers).forEach((buffer) => {
    if (buffer) {
      gl.deleteBuffer(buffer);
    }
  });

  if (renderer.program) {
    gl.deleteProgram(renderer.program);
  }

  if (renderer.textures) {
    Object.values(renderer.textures).forEach((texture) => {
      if (texture) {
        gl.deleteTexture(texture);
      }
    });
  }
};

const drawBoidsWithWebGL = (gl, renderer, width, height, pixelRatio, boids) => {
  const { renderOrder, arrays } = renderer;
  const { positions, sizes, angles, banks, glows, frames, colors } = arrays;

  if (!renderer.textures.spriteSheet) {
    return;
  }

  renderOrder.sort(
    (left, right) => boids[left].position.z - boids[right].position.z,
  );

  renderOrder.forEach((boidIndex, index) => {
    const boid = boids[boidIndex];
    const projected = projectBoid(boid, width, height);
    const headingX =
      boid.direction.x * PARAMS.PROJECT_X_FROM_X +
      boid.direction.z * PARAMS.PROJECT_X_FROM_Z;
    const headingY =
      boid.direction.y * PARAMS.PROJECT_Y_FROM_Y +
      boid.direction.z * PARAMS.PROJECT_Y_FROM_Z;
    const agitationGlow = boid.agitation ? boid.agitation.amplitude * 0.22 : 0;
    const base = index * 2;
    const colorBase = index * 4;

    positions[base] = projected.x;
    positions[base + 1] = projected.y;
    sizes[index] = 8.6 * projected.scale + Math.abs(boid.bank) * 1.05;
    angles[index] = Math.atan2(headingY, headingX);
    banks[index] = boid.bank;
    glows[index] = agitationGlow;
    frames[index] = boid.spriteFrame;
    colors[colorBase] = (56 + agitationGlow * 208) / 255;
    colors[colorBase + 1] = (69 + agitationGlow * 108) / 255;
    colors[colorBase + 2] = (89 + agitationGlow * 28) / 255;
    colors[colorBase + 3] = 0.94;
  });

  gl.viewport(
    0,
    0,
    Math.round(width * pixelRatio),
    Math.round(height * pixelRatio),
  );
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(renderer.program);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.uniform2f(renderer.uniforms.resolution, width, height);
  gl.uniform1f(renderer.uniforms.pixelRatio, pixelRatio);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, renderer.textures.spriteSheet);
  gl.uniform1i(renderer.uniforms.spriteSheet, 0);

  bindFloatAttribute(
    gl,
    renderer.buffers.position,
    renderer.attributes.position,
    2,
    positions,
  );
  bindFloatAttribute(
    gl,
    renderer.buffers.size,
    renderer.attributes.size,
    1,
    sizes,
  );
  bindFloatAttribute(
    gl,
    renderer.buffers.angle,
    renderer.attributes.angle,
    1,
    angles,
  );
  bindFloatAttribute(
    gl,
    renderer.buffers.bank,
    renderer.attributes.bank,
    1,
    banks,
  );
  bindFloatAttribute(
    gl,
    renderer.buffers.glow,
    renderer.attributes.glow,
    1,
    glows,
  );
  bindFloatAttribute(
    gl,
    renderer.buffers.frame,
    renderer.attributes.frame,
    1,
    frames,
  );
  bindFloatAttribute(
    gl,
    renderer.buffers.color,
    renderer.attributes.color,
    4,
    colors,
  );

  gl.drawArrays(gl.POINTS, 0, boids.length);
};

const getGridCell = (position) => ({
  x: Math.floor(position.x / PARAMS.TOPOLOGY_CELL_SIZE),
  y: Math.floor(position.y / PARAMS.TOPOLOGY_CELL_SIZE),
  z: Math.floor(position.z / PARAMS.TOPOLOGY_CELL_SIZE),
});

const getGridKey = (cellX, cellY, cellZ) => `${cellX}|${cellY}|${cellZ}`;

const buildSpatialGrid = (states) => {
  const grid = new Map();

  states.forEach((state, index) => {
    const cell = getGridCell(state.position);
    const key = getGridKey(cell.x, cell.y, cell.z);
    const bucket = grid.get(key);

    if (bucket) {
      bucket.push(index);
      return;
    }

    grid.set(key, [index]);
  });

  return grid;
};

const appendGridShell = (grid, origin, radius, target) => {
  for (let x = origin.x - radius; x <= origin.x + radius; x += 1) {
    for (let y = origin.y - radius; y <= origin.y + radius; y += 1) {
      for (let z = origin.z - radius; z <= origin.z + radius; z += 1) {
        if (
          radius !== 0 &&
          Math.max(
            Math.abs(x - origin.x),
            Math.abs(y - origin.y),
            Math.abs(z - origin.z),
          ) !== radius
        ) {
          continue;
        }

        const bucket = grid.get(getGridKey(x, y, z));
        if (bucket) {
          target.push(...bucket);
        }
      }
    }
  }
};

const getOutsideCubeDistance = (position, origin, radius) => {
  const minX = (origin.x - radius) * PARAMS.TOPOLOGY_CELL_SIZE;
  const maxX = (origin.x + radius + 1) * PARAMS.TOPOLOGY_CELL_SIZE;
  const minY = (origin.y - radius) * PARAMS.TOPOLOGY_CELL_SIZE;
  const maxY = (origin.y + radius + 1) * PARAMS.TOPOLOGY_CELL_SIZE;
  const minZ = (origin.z - radius) * PARAMS.TOPOLOGY_CELL_SIZE;
  const maxZ = (origin.z + radius + 1) * PARAMS.TOPOLOGY_CELL_SIZE;

  return Math.min(
    position.x - minX,
    maxX - position.x,
    position.y - minY,
    maxY - position.y,
    position.z - minZ,
    maxZ - position.z,
  );
};

const insertNearestNeighbor = (nearestStates, candidateState) => {
  let insertIndex = nearestStates.length;

  while (
    insertIndex > 0 &&
    nearestStates[insertIndex - 1].distance > candidateState.distance
  ) {
    insertIndex -= 1;
  }

  if (insertIndex >= PARAMS.NEIGHBOR_COUNT) {
    return;
  }

  nearestStates.splice(insertIndex, 0, candidateState);

  if (nearestStates.length > PARAMS.NEIGHBOR_COUNT) {
    nearestStates.pop();
  }
};

const collectNeighborStates = (boidIndex, boid, delayedStates, spatialGrid) => {
  const origin = getGridCell(boid.position);
  const nearestStates = [];
  let candidateCount = 0;

  for (let radius = 0; radius <= PARAMS.MAX_GRID_SEARCH_RADIUS; radius += 1) {
    const shellCandidateIndices = [];
    appendGridShell(spatialGrid, origin, radius, shellCandidateIndices);

    shellCandidateIndices.forEach((candidateIndex) => {
      if (candidateIndex === boidIndex) {
        return;
      }

      const state = delayedStates[candidateIndex];
      const offset = subtract3D(state.position, boid.position);
      candidateCount += 1;
      insertNearestNeighbor(nearestStates, {
        boid: candidateIndex,
        state,
        offset,
        distance: length3D(offset),
      });
    });

    if (candidateCount < PARAMS.NEIGHBOR_COUNT) {
      continue;
    }

    if (
      nearestStates[PARAMS.NEIGHBOR_COUNT - 1].distance <=
      getOutsideCubeDistance(boid.position, origin, radius)
    ) {
      return nearestStates;
    }
  }

  const fallbackNearestStates = [];

  delayedStates.forEach((state, candidateIndex) => {
    if (candidateIndex === boidIndex) {
      return;
    }

    const offset = subtract3D(state.position, boid.position);
    insertNearestNeighbor(fallbackNearestStates, {
      boid: candidateIndex,
      state,
      offset,
      distance: length3D(offset),
    });
  });

  return fallbackNearestStates;
};

const createBoid = (id, center, dimensions) => {
  const position = sampleShellPoint(center, dimensions);
  const horizontalAngle = randomBetween(-Math.PI, Math.PI);
  const heading = normalize3D({
    x: Math.cos(horizontalAngle),
    y: randomBetween(-0.08, 0.08),
    z: Math.sin(horizontalAngle),
  });

  return {
    id,
    position,
    direction: heading,
    speedRatio: Math.random(),
    speed: randomBetween(PARAMS.TARGET_SPEED_MIN, PARAMS.TARGET_SPEED_MAX),
    reactionJitter: randomNormal(0, PARAMS.REACTION_STD),
    reactionDelay: clamp(
      randomNormal(PARAMS.REACTION_MEAN, PARAMS.REACTION_STD),
      0.05,
      0.11,
    ),
    bank: 0,
    history: [],
    turnSignal: null,
    agitation: null,
    lastWaveTime: -Infinity,
    referenceLock: null,
    spriteBranch: "starling_fly1",
    spriteBranchLock: false,
    spriteVariant: Math.random(),
    spriteClockOffset: Math.random(),
    spriteFlapRate: randomBetween(
      PARAMS.SPRITE_FLAP_RATE_MIN,
      PARAMS.SPRITE_FLAP_RATE_MAX,
    ),
    spriteFrame: Math.floor(Math.random() * PARAMS.SPRITE_FRAME_COUNT),
  };
};

const getReferencedNeighbor = (
  boidIndex,
  boid,
  neighbors,
  delayedStates,
  now,
) => {
  if (boid.referenceLock && boid.referenceLock.expiresAt > now) {
    const lockedIndex = boid.referenceLock.boidIndex;

    if (lockedIndex !== boidIndex && delayedStates[lockedIndex]) {
      const state = delayedStates[lockedIndex];
      const offset = subtract3D(state.position, boid.position);

      return {
        boid: lockedIndex,
        state,
        offset,
        distance: length3D(offset),
      };
    }
  }

  const nextReference = neighbors[0] || null;

  boid.referenceLock = nextReference
    ? {
        boidIndex: nextReference.boid,
        expiresAt: now + PARAMS.REFERENCE_LOCK_DURATION,
      }
    : null;

  return nextReference;
};

const updateSpriteBranch = (boid) => {
  const verticalRatio = Math.abs(boid.direction.y);
  const isNearVertical = verticalRatio > PARAMS.VERTICAL_BRANCH_THRESHOLD;

  if (boid.direction.y < 0) {
    boid.spriteBranch = isNearVertical ? "starling_fly4" : "starling_fly1";
    boid.spriteBranchLock = false;
    return;
  }

  if (isNearVertical) {
    boid.spriteBranch = "starling_fly5";
    boid.spriteBranchLock = false;
    return;
  }

  if (!boid.spriteBranchLock) {
    boid.spriteVariant = Math.random();
    boid.spriteBranch =
      boid.spriteVariant > 0.5 ? "starling_fly2" : "starling_fly3";
    boid.spriteBranchLock = true;
  }
};

const updateSpriteFrame = (boid, now) => {
  const flapCycle = (now * boid.spriteFlapRate + boid.spriteClockOffset) % 1;

  switch (boid.spriteBranch) {
    case "starling_fly1":
      boid.spriteFrame = Math.floor(flapCycle * 3);
      break;
    case "starling_fly2":
      boid.spriteFrame = 2;
      break;
    case "starling_fly3":
      boid.spriteFrame = 3;
      break;
    case "starling_fly4":
      boid.spriteFrame = 4 + Math.floor(flapCycle * 2);
      break;
    case "starling_fly5":
      boid.spriteFrame = 4;
      break;
    default:
      boid.spriteFrame = Math.floor(flapCycle * PARAMS.SPRITE_FRAME_COUNT);
      break;
  }
};

const getDelayedState = (boid, now) => {
  const targetTime = now - boid.reactionDelay;

  for (let index = boid.history.length - 1; index >= 0; index -= 1) {
    const snapshot = boid.history[index];
    if (snapshot.time <= targetTime) {
      return snapshot;
    }
  }

  return {
    position: boid.position,
    direction: boid.direction,
    speed: boid.speed,
    agitation: boid.agitation,
    turnSignal: boid.turnSignal,
  };
};

const visionWeight = (boidDirection, offset) => {
  const direction = normalize3D(offset);
  const lateralFactor = Math.sqrt(
    Math.max(0, 1 - Math.pow(dot3D(direction, boidDirection), 2)),
  );
  return 0.45 + lateralFactor * 0.9;
};

const spawnTurnSignal = (boids, center, now) => {
  const edgeSign = Math.random() > 0.5 ? 1 : -1;
  const turnDirection = Math.random() > 0.5 ? 1 : -1;
  const initiators = [...boids]
    .sort((left, right) => {
      const leftScore =
        left.position.z * edgeSign - Math.abs(left.position.x - center.x) * 0.2;
      const rightScore =
        right.position.z * edgeSign -
        Math.abs(right.position.x - center.x) * 0.2;
      return rightScore - leftScore;
    })
    .slice(0, 6);

  initiators.forEach((boid) => {
    boid.turnSignal = {
      sign: turnDirection,
      startedAt: now,
      strength: 1,
    };
  });
};

export function App({ controls, onGpuErrorChange, isPaused } = {}) {
  const canvasRef = React.useRef(null);
  const pointerRef = React.useRef({
    x: 0,
    y: 0,
    active: false,
  });
  const resolvedControls = React.useMemo(
    () => sanitizeControlState(controls),
    [controls],
  );

  React.useEffect(() => {
    Object.assign(PARAMS, resolvedControls);
  }, [resolvedControls]);

  React.useEffect(() => {
    onGpuErrorChange?.("");

    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const gl =
      canvas.getContext("webgl", { alpha: true, antialias: true }) ||
      canvas.getContext("experimental-webgl", { alpha: true, antialias: true });
    if (!gl) {
      onGpuErrorChange?.("WebGL을 사용할 수 없는 환경입니다.");
      return undefined;
    }

    const renderer = initializeRenderer(gl);
    if (!renderer) {
      onGpuErrorChange?.("GPU 렌더러 초기화에 실패했습니다.");
      return undefined;
    }

    let animationFrame = 0;
    let lastTimestamp = 0;
    let nextTurnTime = 0;
    let isDisposed = false;
    const flockCenter = { x: 0, y: 0, z: 0 };
    const flockDimensions = { x: 152, y: 54, z: 302 };
    const boids = Array.from({ length: PARAMS.BOID_COUNT }, (_, index) =>
      createBoid(index, flockCenter, flockDimensions),
    );

    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const handlePointerMove = (event) => {
      pointerRef.current = {
        ...pointerRef.current,
        x: event.clientX,
        y: event.clientY,
        active: true,
      };
    };

    const handlePointerLeave = () => {
      pointerRef.current = {
        ...pointerRef.current,
        active: false,
      };
    };

    const step = (timestamp) => {
      const now = timestamp * 0.001;
      const dt = clamp(
        lastTimestamp ? now - lastTimestamp : 0.016,
        0.008,
        PARAMS.MAX_DT,
      );
      lastTimestamp = now;

      if (!nextTurnTime) {
        nextTurnTime = now + randomBetween(3.4, 5.6);
      }

      if (now >= nextTurnTime) {
        spawnTurnSignal(boids, flockCenter, now);
        nextTurnTime = now + randomBetween(4.5, 7.5);
      }

      const centerOfMass = boids.reduce(
        (sum, boid) => add3D(sum, boid.position),
        { x: 0, y: 0, z: 0 },
      );
      flockCenter.x = centerOfMass.x / boids.length;
      flockCenter.y = centerOfMass.y / boids.length;
      flockCenter.z = centerOfMass.z / boids.length;

      boids.forEach((boid) => {
        boid.speed = lerp(
          PARAMS.TARGET_SPEED_MIN,
          PARAMS.TARGET_SPEED_MAX,
          boid.speedRatio,
        );
        boid.reactionDelay = clamp(
          PARAMS.REACTION_MEAN + boid.reactionJitter,
          0.05,
          0.11,
        );
      });

      const delayedStates = boids.map((boid) => getDelayedState(boid, now));
      const spatialGrid = buildSpatialGrid(delayedStates);

      boids.forEach((boid, boidIndex) => {
        const neighbors = collectNeighborStates(
          boidIndex,
          boid,
          delayedStates,
          spatialGrid,
        );
        const referencedNeighbor = getReferencedNeighbor(
          boidIndex,
          boid,
          neighbors,
          delayedStates,
          now,
        );

        if (referencedNeighbor) {
          const propagationDelay =
            referencedNeighbor.distance / PARAMS.SIGNAL_SPEED;
          const sourceWave = referencedNeighbor.state.agitation;

          if (
            sourceWave &&
            sourceWave.startedAt <= now - propagationDelay &&
            now - boid.lastWaveTime > 0.12
          ) {
            boid.agitation = {
              amplitude: sourceWave.amplitude * randomBetween(0.99, 0.9975),
              direction: sourceWave.direction * -1,
              startedAt: now,
              phase: sourceWave.phase + Math.PI * 0.5,
              hops: sourceWave.hops + 1,
            };
            boid.lastWaveTime = now;
          }
        }

        const alignmentSum = { x: 0, y: 0, z: 0 };
        const cohesionSum = { x: 0, y: 0, z: 0 };
        let totalWeight = 0;

        neighbors.forEach((neighbor) => {
          const weight = visionWeight(boid.direction, neighbor.offset);
          totalWeight += weight;
          alignmentSum.x += neighbor.state.direction.x * weight;
          alignmentSum.y += neighbor.state.direction.y * weight;
          alignmentSum.z += neighbor.state.direction.z * weight;
          cohesionSum.x += neighbor.state.position.x * weight;
          cohesionSum.y += neighbor.state.position.y * weight;
          cohesionSum.z += neighbor.state.position.z * weight;

          if (
            neighbor.state.turnSignal &&
            !boid.turnSignal &&
            neighbor.state.turnSignal.startedAt <=
              now - neighbor.distance / PARAMS.SIGNAL_SPEED
          ) {
            boid.turnSignal = {
              sign: neighbor.state.turnSignal.sign,
              startedAt: now,
              strength: neighbor.state.turnSignal.strength * 0.997,
            };
          }
        });

        const alignmentDirection = totalWeight
          ? normalize3D(scale3D(alignmentSum, 1 / totalWeight), boid.direction)
          : boid.direction;
        const cohesionTarget = totalWeight
          ? scale3D(cohesionSum, 1 / totalWeight)
          : boid.position;
        const cohesionDirection = normalize3D(
          subtract3D(cohesionTarget, boid.position),
          boid.direction,
        );
        const predatorInfluence = getPredatorInfluence(
          boid,
          window.innerWidth,
          window.innerHeight,
          pointerRef.current,
        );
        boid.speed *= lerp(
          1,
          PARAMS.PREDATOR_SPEED_BOOST,
          predatorInfluence.evasionIntensity,
        );

        let desiredDirection = normalize3D({
          x:
            boid.direction.x * 0.52 +
            alignmentDirection.x * 0.28 +
            cohesionDirection.x * 0.2,
          y:
            boid.direction.y * 0.52 +
            alignmentDirection.y * 0.24 +
            cohesionDirection.y * 0.16,
          z:
            boid.direction.z * 0.52 +
            alignmentDirection.z * 0.28 +
            cohesionDirection.z * 0.2,
        });

        if (predatorInfluence.evasionIntensity > 0) {
          desiredDirection = normalize3D(
            {
              x:
                desiredDirection.x +
                predatorInfluence.escape.x *
                  predatorInfluence.evasionIntensity *
                  PARAMS.PREDATOR_ESCAPE_BOOST,
              y:
                desiredDirection.y +
                predatorInfluence.escape.y *
                  predatorInfluence.evasionIntensity *
                  PARAMS.PREDATOR_ESCAPE_BOOST *
                  0.82,
              z:
                desiredDirection.z +
                predatorInfluence.escape.z *
                  predatorInfluence.evasionIntensity *
                  PARAMS.PREDATOR_ESCAPE_BOOST,
            },
            boid.direction,
          );
        }

        if (referencedNeighbor) {
          const awayFromNearest = normalize3D(
            scale3D(referencedNeighbor.offset, -1),
            boid.direction,
          );
          const separationStrength = clamp(
            (PARAMS.HARD_CORE * 1.3 - referencedNeighbor.distance) /
              (PARAMS.HARD_CORE * 1.3),
            0,
            1,
          );

          desiredDirection = normalize3D({
            x:
              desiredDirection.x + awayFromNearest.x * separationStrength * 1.1,
            y:
              desiredDirection.y + awayFromNearest.y * separationStrength * 0.9,
            z:
              desiredDirection.z + awayFromNearest.z * separationStrength * 1.1,
          });
        }

        const toCenter = subtract3D(flockCenter, boid.position);
        const normalizedShell = {
          x: (boid.position.x - flockCenter.x) / flockDimensions.x,
          y: (boid.position.y - flockCenter.y) / flockDimensions.y,
          z: (boid.position.z - flockCenter.z) / flockDimensions.z,
        };
        const radialDistance = length3D(normalizedShell);
        const shellBias =
          radialDistance < 0.46 ? -0.22 : radialDistance > 1.04 ? 0.36 : 0;
        const shellDirection = normalize3D(
          scale3D(toCenter, shellBias > 0 ? 1 : -1),
          boid.direction,
        );

        desiredDirection = normalize3D({
          x: desiredDirection.x + shellDirection.x * Math.abs(shellBias),
          y: desiredDirection.y + shellDirection.y * Math.abs(shellBias) * 0.45,
          z: desiredDirection.z + shellDirection.z * Math.abs(shellBias),
        });

        let turnInfluence = 0;
        if (boid.turnSignal && now - boid.turnSignal.startedAt < 1.8) {
          const lateral = normalize3D(
            { x: -boid.direction.z, y: 0, z: boid.direction.x },
            { x: 0, y: 0, z: 1 },
          );
          turnInfluence = boid.turnSignal.sign * boid.turnSignal.strength;
          desiredDirection = normalize3D({
            x: desiredDirection.x + lateral.x * turnInfluence * 0.55,
            y: desiredDirection.y,
            z: desiredDirection.z + lateral.z * turnInfluence * 0.55,
          });
        }

        if (boid.agitation && now - boid.agitation.startedAt < 1.35) {
          const lateral = normalize3D(
            cross3D(boid.direction, { x: 0, y: 1, z: 0 }),
            { x: 1, y: 0, z: 0 },
          );
          const zigzag =
            Math.sin(
              (now - boid.agitation.startedAt) * 24 + boid.agitation.phase,
            ) * boid.agitation.amplitude;

          desiredDirection = normalize3D({
            x:
              desiredDirection.x +
              lateral.x * zigzag * 0.42 * boid.agitation.direction,
            y: desiredDirection.y - Math.abs(zigzag) * 0.12,
            z:
              desiredDirection.z +
              lateral.z * zigzag * 0.42 * boid.agitation.direction,
          });
          turnInfluence += zigzag * 0.35;
        }

        const visibleAvoidance = getVisibleAvoidance(
          boid,
          window.innerWidth,
          window.innerHeight,
        );
        desiredDirection = normalize3D({
          x: desiredDirection.x + visibleAvoidance.x,
          y: desiredDirection.y + visibleAvoidance.y,
          z: desiredDirection.z + visibleAvoidance.z,
        });
        turnInfluence += visibleAvoidance.bankBias;

        desiredDirection.y +=
          clamp((flockCenter.y - boid.position.y) / flockDimensions.y, -1, 1) *
          0.08;
        desiredDirection = normalize3D(desiredDirection, boid.direction);

        const edgeTurnBoost = 1 + visibleAvoidance.pressure * 2.6;
        const maxTurnAngle =
          (boid.speed / PARAMS.TURN_RADIUS) *
          dt *
          edgeTurnBoost *
          (1 + predatorInfluence.evasionIntensity * PARAMS.PREDATOR_TURN_BOOST);
        boid.direction = rotateTowards(
          boid.direction,
          desiredDirection,
          maxTurnAngle,
        );
        boid.bank = lerp(boid.bank, clamp(turnInfluence * 0.9, -1.1, 1.1), 0.1);
        boid.position = add3D(
          boid.position,
          scale3D(
            {
              x: boid.direction.x,
              y: boid.direction.y + Math.abs(boid.bank) * 0.045,
              z: boid.direction.z,
            },
            boid.speed * dt,
          ),
        );
        keepBoidVisible(boid, window.innerWidth, window.innerHeight);

        boid.history.push({
          time: now,
          position: { ...boid.position },
          direction: { ...boid.direction },
          speed: boid.speed,
          agitation: boid.agitation ? { ...boid.agitation } : null,
          turnSignal: boid.turnSignal ? { ...boid.turnSignal } : null,
        });

        while (
          boid.history.length > 2 &&
          now - boid.history[0].time > PARAMS.MAX_HISTORY_AGE
        ) {
          boid.history.shift();
        }

        if (boid.turnSignal && now - boid.turnSignal.startedAt >= 1.8) {
          boid.turnSignal = null;
        }

        if (boid.agitation && now - boid.agitation.startedAt >= 1.35) {
          boid.agitation = null;
        }

        updateSpriteBranch(boid);
        updateSpriteFrame(boid, now);
      });

      drawBoidsWithWebGL(
        gl,
        renderer,
        window.innerWidth,
        window.innerHeight,
        window.devicePixelRatio || 1,
        boids,
      );

      if (!isPaused) {
        animationFrame = window.requestAnimationFrame(step);
      }
    };

    loadTexture(gl, starlingSpriteSheetUrl)
      .then((spriteSheetTexture) => {
        if (isDisposed) {
          gl.deleteTexture(spriteSheetTexture);
          return;
        }

        renderer.textures.spriteSheet = spriteSheetTexture;
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerleave", handlePointerLeave);
        animationFrame = window.requestAnimationFrame(step);
      })
      .catch(() => {
        if (!isDisposed) {
          onGpuErrorChange?.("스타링 스프라이트시트를 불러오지 못했습니다.");
        }
      });

    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      destroyRenderer(gl, renderer);
      onGpuErrorChange?.("");
    };
  }, [onGpuErrorChange, resolvedControls.BOID_COUNT, isPaused]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "transparent",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          cursor: "crosshair",
        }}
      />
    </div>
  );
}

App.ui = STARLING_UI;
App.sanitizeControlState = sanitizeControlState;

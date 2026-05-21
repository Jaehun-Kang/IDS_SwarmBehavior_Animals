import React from "react";
import sardineSpriteSheetUrl from "../../assets/sardine_1.svg";

const SARDINE_BODY_LENGTH_M = 0.4;
const SARDINE_BODY_LENGTH_PX = 19;
const SARDINE_BODY_HEIGHT_M = 0.052;
const SARDINE_BODY_THICKNESS_M = 0.024;
const bodyLengthsToPx = (bodyLengths) => bodyLengths * SARDINE_BODY_LENGTH_PX;
const pxToBodyLengths = (pixels) => pixels / SARDINE_BODY_LENGTH_PX;
const metersToPx = (meters) =>
  (meters / SARDINE_BODY_LENGTH_M) * SARDINE_BODY_LENGTH_PX;
const pxPerSecondToMetersPerSecond = (pixelsPerSecond) =>
  (pixelsPerSecond / SARDINE_BODY_LENGTH_PX) * SARDINE_BODY_LENGTH_M;

const PARAMS = {
  BOID_COUNT: 960,
  WORLD_WIDTH: bodyLengthsToPx(72.63),
  WORLD_HEIGHT: bodyLengthsToPx(37.89),
  WORLD_DEPTH: bodyLengthsToPx(35.79),
  BODY_LENGTH_M: SARDINE_BODY_LENGTH_M,
  BODY_LENGTH_PX: SARDINE_BODY_LENGTH_PX,
  BODY_HEIGHT_M: SARDINE_BODY_HEIGHT_M,
  BODY_THICKNESS_M: SARDINE_BODY_THICKNESS_M,
  PIXELS_PER_METER: SARDINE_BODY_LENGTH_PX / SARDINE_BODY_LENGTH_M,
  BASE_SPEED: bodyLengthsToPx(5.9),
  MAX_SPEED: bodyLengthsToPx(8.84),
  BURST_SPEED: bodyLengthsToPx(12),
  RANDOM_MODE_MULTIPLIER_MIN: 2,
  MAX_TURN_RATE: 2.8,
  DRAG: 0.984,
  NEIGHBOR_RADIUS: bodyLengthsToPx(6.21),
  SEPARATION_RADIUS: bodyLengthsToPx(1.9),
  DENSITY_BASE: 29.5,
  DENSITY_ALERT: 233,
  DENSITY_NIGHT_DANGER: 16.5,
  GLOBAL_PREDATOR_AWARENESS: 0.78,
  ALERT_SPACING_SCALE: 0.5,
  ALERT_COHESION_BOOST: 3.1,
  ALERT_INTERACTION_MIN: 2.2,
  ALERT_INTERACTION_MAX: 4.8,
  ALERT_ALIGNMENT_RELEASE: 0.18,
  ALERT_REFERENCE_RELEASE: 0.12,
  ALERT_RANDOM_BOOST: 2.8,
  ACTIVE_ALIGNMENT_BOOST: 2.6,
  ACTIVE_REFERENCE_BOOST: 1.9,
  ACTIVE_STATE_DURATION: 0.42,
  ALERT_STATE_DURATION: 1.8,
  PREDATOR_SCREEN_DETECTION_RADIUS_PX: 200,
  PREDATOR_SCREEN_IMPACT_RADIUS_PX: 15,
  SMALL_GROUP_NEIGHBOR_COUNT: 6,
  STABLE_GROUP_NEIGHBOR_COUNT: 18,
  ISOLATION_SPEED_GAIN: bodyLengthsToPx(2.21),
  PREDATOR_SPEED_GAIN: bodyLengthsToPx(1.79),
  LEADER_RATIO: 0.025,
  LARGE_TURN_THRESHOLD: 0.2,
  LARGE_TURN_MAX: 1.2,
  CASCADE_RADIUS: bodyLengthsToPx(9.26),
  CASCADE_DELAY_BASE: 0.026,
  RANDOM_MODE_MULTIPLIER: 3.2,
  RANDOM_MODE_NOISE: 0.52,
  STEERING_NEIGHBOR_COUNT: 12,
  DAY_STEERING_NEIGHBOR_COUNT: 7,
  DAY_REFERENCE_LOCK_DURATION: 1.4,
  DAY_REFERENCE_ALIGNMENT: 1.36,
  DAY_REFERENCE_PULL: 1.08,
  FRONT_VISION_MIN_COS: -0.42,
  FRONT_VISION_MAX_COS: 0.88,
  NIGHT_LATERAL_LINE_WEIGHT: 0.42,
  ACTIVE_LEADER_PULL: 1.18,
  OCCUPANCY_LENGTH_SCALE: 1.08,
  OCCUPANCY_HEIGHT_SCALE: 3.4,
  OCCUPANCY_THICKNESS_SCALE: 5.4,
  DAY_DENSITY_MULTIPLIER: 1.18,
  NIGHT_DENSITY_MULTIPLIER: 0.62,
  DAY_DEPTH_ANCHOR: 0.23,
  NIGHT_DEPTH_ANCHOR: 0.84,
  DAY_COHESION: 1.2,
  NIGHT_COHESION: 1,
  DAY_ALIGNMENT: 0.72,
  NIGHT_ALIGNMENT: 0.34,
  DAY_PACKING_PULL: 0.42,
  DAY_STREAM_VERTICAL_PULL: 0.34,
  PREDATOR_DAY_REJOIN_PULL: 1.62,
  PREDATOR_CROWD_PULL: 3.1,
  PREDATOR_LOCAL_HOLD_PULL: 2.6,
  PREDATOR_ESCAPE_BOOST: 2.4,
  PREDATOR_HARD_AVOID_TURN_BOOST: 3.2,
  PREDATOR_RECOVERY_PULL: 1.2,
  PREDATOR_RECOVERY_DECAY: 0.88,
  LEADER_CROWD_PULL: 0.72,
  PREDATOR_DAY_COHESION_BOOST: 2.4,
  PREDATOR_NIGHT_DISPERSION_BOOST: 1.85,
  TURN_SEPARATION_DAMPING: 0.54,
  TURN_SPEED_PRESERVATION: 0.96,
  SCREEN_MARGIN: 0,
  EDGE_AVOID_ZONE: bodyLengthsToPx(11.6),
  EDGE_PREAVOID_DISTANCE: bodyLengthsToPx(6.8),
  EDGE_PREAVOID_LOOKAHEAD: 0.9,
  EDGE_HARD_MARGIN: bodyLengthsToPx(1.1),
  EDGE_SPEED_DAMPING: 0.12,
  EDGE_CLAMP_REDIRECT: 28,
  EDGE_RETURN_GRACE: bodyLengthsToPx(22),
  INTRA_EVENT_INTERVAL: 125,
  INTER_EVENT_INTERVAL: 300,
  EVENT_JITTER: 0.24,
  SUBGROUP_COUNT: 4,
  SPRITE_FRAME_COUNT: 3,
  SPRITE_RATE_MIN: 4.2,
  SPRITE_RATE_MAX: 7.6,
  PROJECT_X_FROM_X: 0.96,
  PROJECT_X_FROM_Z: 0.24,
  PROJECT_Y_FROM_Y: 0.86,
  PROJECT_Y_FROM_Z: -0.17,
  PROJECT_PERSPECTIVE_BASE: 0.86,
  PROJECT_PERSPECTIVE_DIVISOR: 1320,
  PROJECT_PERSPECTIVE_OFFSET: 220,
  MAX_DT: 0.033,
  GRID_CELL_SIZE: bodyLengthsToPx(5.05),
  MAX_GRID_RADIUS: 3,
};

const CONTROL_FIELDS = [
  {
    key: "BOID_COUNT",
    label: "개체 수",
    min: 240,
    max: 1800,
    step: 20,
    formatValue: (value) => `${value}`,
  },
  {
    key: "IS_DAYTIME",
    label: "낮/밤 전환",
    type: "toggle",
    formatValue: (value) => (value ? "낮" : "밤"),
  },
  {
    key: "IS_PREDATOR_ACTIVE",
    label: "포식자 반응",
    type: "toggle",
    formatValue: (value) => (value ? "켜짐" : "꺼짐"),
  },
  {
    key: "BASE_SPEED",
    label: "기본 유영 속도",
    min: bodyLengthsToPx(3.79),
    max: bodyLengthsToPx(8.42),
    step: 2,
    formatValue: (value) =>
      `${pxPerSecondToMetersPerSecond(value).toFixed(2)} m/s`,
  },
  {
    key: "NEIGHBOR_RADIUS",
    label: "이웃 인식 반경",
    min: bodyLengthsToPx(3.5),
    max: bodyLengthsToPx(10.5),
    step: 2,
    formatValue: (value) => `${pxToBodyLengths(value).toFixed(1)} 몸길이`,
  },
  {
    key: "MIN_SPACING",
    label: "최소 간격",
    min: 0.5,
    max: 2.5,
    step: 0.05,
    formatValue: (value) => value.toFixed(2),
  },
];

const DEFAULT_CONTROL_STATE = {
  BOID_COUNT: PARAMS.BOID_COUNT,
  BASE_SPEED: PARAMS.BASE_SPEED,
  NEIGHBOR_RADIUS: PARAMS.NEIGHBOR_RADIUS,
  MIN_SPACING: PARAMS.DAY_COHESION,
  RANDOM_MODE_MULTIPLIER: PARAMS.RANDOM_MODE_MULTIPLIER,
  DAY_COHESION: PARAMS.DAY_COHESION,
  NIGHT_COHESION: PARAMS.NIGHT_COHESION,
  IS_DAYTIME: true,
  IS_PREDATOR_ACTIVE: true,
  EVENT_RATE_SCALE: 1,
};

const SARDINE_UI = {
  controlFields: CONTROL_FIELDS,
  defaultControlState: DEFAULT_CONTROL_STATE,
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (start, end, amount) => start + (end - start) * amount;
const smoothstep = (min, max, value) => {
  const t = clamp((value - min) / (max - min), 0, 1);
  return t * t * (3 - 2 * t);
};
const length2D = (vector) => Math.hypot(vector.x, vector.y);
const length3D = (vector) => Math.hypot(vector.x, vector.y, vector.z);

const normalize2D = (vector, fallback = { x: 1, y: 0 }) => {
  const magnitude = length2D(vector);
  if (magnitude < 1e-6) {
    return { ...fallback };
  }

  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
  };
};

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

const angleBetween3D = (left, right) => {
  const normalizedLeft = normalize3D(left);
  const normalizedRight = normalize3D(right, normalizedLeft);
  return Math.acos(clamp(dot3D(normalizedLeft, normalizedRight), -1, 1));
};

const randomBetween = (min, max) => min + Math.random() * (max - min);

const randomNormal = (mean, stdDev) => {
  const u = Math.max(Number.EPSILON, Math.random());
  const v = Math.max(Number.EPSILON, Math.random());
  const gaussian = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + gaussian * stdDev;
};

const densityToSpacingPx = (density) =>
  Math.cbrt(1 / Math.max(density, 1e-6)) * PARAMS.PIXELS_PER_METER;

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

const sanitizeControlState = (rawControls = DEFAULT_CONTROL_STATE) => {
  const nextControls = {
    ...DEFAULT_CONTROL_STATE,
    ...rawControls,
  };

  nextControls.BOID_COUNT = Math.round(nextControls.BOID_COUNT);
  nextControls.BASE_SPEED = clamp(
    nextControls.BASE_SPEED,
    bodyLengthsToPx(3.79),
    bodyLengthsToPx(8.42),
  );
  nextControls.NEIGHBOR_RADIUS = clamp(
    nextControls.NEIGHBOR_RADIUS,
    bodyLengthsToPx(3.5),
    bodyLengthsToPx(10.5),
  );
  nextControls.MIN_SPACING = clamp(nextControls.MIN_SPACING, 0.5, 2.5);
  nextControls.RANDOM_MODE_MULTIPLIER = clamp(
    nextControls.RANDOM_MODE_MULTIPLIER,
    2,
    5,
  );
  nextControls.DAY_COHESION = clamp(nextControls.DAY_COHESION, 0.5, 2.5);
  nextControls.NIGHT_COHESION = clamp(nextControls.NIGHT_COHESION, 0.2, 2);
  nextControls.IS_DAYTIME = Boolean(nextControls.IS_DAYTIME);
  nextControls.IS_PREDATOR_ACTIVE = Boolean(nextControls.IS_PREDATOR_ACTIVE);
  nextControls.EVENT_RATE_SCALE = clamp(
    nextControls.EVENT_RATE_SCALE,
    0.4,
    2.4,
  );

  return nextControls;
};

const SARDINE_VERTEX_SHADER = `
attribute vec2 aPosition;
attribute float aSize;
attribute float aAngle;
attribute float aFrame;
attribute float aFlipX;
attribute vec4 aColor;

uniform vec2 uResolution;
uniform float uPixelRatio;

varying vec4 vColor;
varying float vAngle;
varying float vFrame;
varying float vFlipX;

void main() {
  vec2 clip = vec2(
    (aPosition.x / uResolution.x) * 2.0 - 1.0,
    1.0 - (aPosition.y / uResolution.y) * 2.0
  );

  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = aSize * uPixelRatio;
  vColor = aColor;
  vAngle = aAngle;
  vFrame = aFrame;
  vFlipX = aFlipX;
}
`;

const SARDINE_FRAGMENT_SHADER = `
precision mediump float;

varying vec4 vColor;
varying float vAngle;
varying float vFrame;
varying float vFlipX;

uniform sampler2D uSpriteSheet;

mat2 rotate2d(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  vec2 rotated = rotate2d(vAngle) * uv;
  rotated.x *= vFlipX;

  if (abs(rotated.y) > 1.0 / 3.0) {
    discard;
  }

  vec2 spriteUv = vec2(
    (rotated.x + 1.0) * 0.5,
    (rotated.y * 3.0 + 1.0) * 0.5
  );

  if (
    spriteUv.x < 0.0 || spriteUv.x > 1.0 ||
    spriteUv.y < 0.0 || spriteUv.y > 1.0
  ) {
    discard;
  }

  float frameIndex = floor(vFrame + 0.5);
  vec2 atlasUv = vec2((spriteUv.x + frameIndex) / 3.0, spriteUv.y);
  vec4 sprite = texture2D(uSpriteSheet, atlasUv);
  float alpha = sprite.a * vColor.a;

  if (alpha < 0.02) {
    discard;
  }

  vec3 spriteColor = pow(max(sprite.rgb, vec3(0.0)), vec3(0.92)) * 1.08;
  gl_FragColor = vec4(spriteColor, alpha);
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

const bindFloatAttribute = (gl, buffer, location, size, values) => {
  if (!buffer || location < 0) {
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, values, gl.STREAM_DRAW);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
};

const createRenderer = (gl, maxBoids) => {
  const program = createProgram(
    gl,
    SARDINE_VERTEX_SHADER,
    SARDINE_FRAGMENT_SHADER,
  );
  if (!program) {
    return null;
  }

  return {
    program,
    maxBoids,
    attributes: {
      position: gl.getAttribLocation(program, "aPosition"),
      size: gl.getAttribLocation(program, "aSize"),
      angle: gl.getAttribLocation(program, "aAngle"),
      frame: gl.getAttribLocation(program, "aFrame"),
      flipX: gl.getAttribLocation(program, "aFlipX"),
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
      frame: gl.createBuffer(),
      flipX: gl.createBuffer(),
      color: gl.createBuffer(),
    },
    texture: null,
    renderOrder: Array.from({ length: maxBoids }, (_, index) => index),
    arrays: {
      positions: new Float32Array(maxBoids * 2),
      sizes: new Float32Array(maxBoids),
      angles: new Float32Array(maxBoids),
      frames: new Float32Array(maxBoids),
      flipsX: new Float32Array(maxBoids),
      colors: new Float32Array(maxBoids * 4),
    },
  };
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

  if (renderer.texture) {
    gl.deleteTexture(renderer.texture);
  }

  if (renderer.program) {
    gl.deleteProgram(renderer.program);
  }
};

const getProjectedPoint = (position, width, height) => {
  const perspective =
    PARAMS.PROJECT_PERSPECTIVE_BASE +
    (position.z + PARAMS.PROJECT_PERSPECTIVE_OFFSET) /
      PARAMS.PROJECT_PERSPECTIVE_DIVISOR;

  return {
    x:
      width * 0.5 +
      (position.x * PARAMS.PROJECT_X_FROM_X +
        position.z * PARAMS.PROJECT_X_FROM_Z) *
        perspective,
    y:
      height * 0.5 +
      (position.y * PARAMS.PROJECT_Y_FROM_Y +
        position.z * PARAMS.PROJECT_Y_FROM_Z) *
        perspective,
    scale: perspective,
  };
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

const getVisibleDepthMin = () =>
  -PARAMS.WORLD_DEPTH * 0.5 + PARAMS.EDGE_HARD_MARGIN;

const getVisibleDepthMax = () =>
  PARAMS.WORLD_DEPTH * 0.5 - PARAMS.EDGE_HARD_MARGIN;

const getVisibleAvoidance = (boid, width, height) => {
  const lookaheadSeconds =
    PARAMS.EDGE_PREAVOID_LOOKAHEAD +
    PARAMS.EDGE_PREAVOID_DISTANCE / Math.max(length3D(boid.velocity), 1);
  const future = add3D(boid.position, scale3D(boid.velocity, lookaheadSeconds));
  const projected = getProjectedPoint(boid.position, width, height);
  const predicted = getProjectedPoint(future, width, height);

  const leftPush = Math.max(
    clamp(
      (PARAMS.SCREEN_MARGIN + PARAMS.EDGE_AVOID_ZONE - projected.x) /
        PARAMS.EDGE_AVOID_ZONE,
      0,
      1,
    ),
    clamp(
      (PARAMS.SCREEN_MARGIN + PARAMS.EDGE_AVOID_ZONE - predicted.x) /
        PARAMS.EDGE_AVOID_ZONE,
      0,
      1,
    ),
  );
  const rightPush = Math.max(
    clamp(
      (projected.x - (width - PARAMS.SCREEN_MARGIN - PARAMS.EDGE_AVOID_ZONE)) /
        PARAMS.EDGE_AVOID_ZONE,
      0,
      1,
    ),
    clamp(
      (predicted.x - (width - PARAMS.SCREEN_MARGIN - PARAMS.EDGE_AVOID_ZONE)) /
        PARAMS.EDGE_AVOID_ZONE,
      0,
      1,
    ),
  );
  const topPush = Math.max(
    clamp(
      (PARAMS.SCREEN_MARGIN + PARAMS.EDGE_AVOID_ZONE - projected.y) /
        PARAMS.EDGE_AVOID_ZONE,
      0,
      1,
    ),
    clamp(
      (PARAMS.SCREEN_MARGIN + PARAMS.EDGE_AVOID_ZONE - predicted.y) /
        PARAMS.EDGE_AVOID_ZONE,
      0,
      1,
    ),
  );
  const bottomPush = Math.max(
    clamp(
      (projected.y - (height - PARAMS.SCREEN_MARGIN - PARAMS.EDGE_AVOID_ZONE)) /
        PARAMS.EDGE_AVOID_ZONE,
      0,
      1,
    ),
    clamp(
      (predicted.y - (height - PARAMS.SCREEN_MARGIN - PARAMS.EDGE_AVOID_ZONE)) /
        PARAMS.EDGE_AVOID_ZONE,
      0,
      1,
    ),
  );
  const depthMin = getVisibleDepthMin();
  const depthMax = getVisibleDepthMax();
  const nearPush = Math.max(
    clamp((depthMin - boid.position.z) / 120, 0, 1),
    clamp((depthMin - future.z) / 120, 0, 1),
  );
  const farPush = Math.max(
    clamp((boid.position.z - depthMax) / 120, 0, 1),
    clamp((future.z - depthMax) / 120, 0, 1),
  );
  const softenedLeftPush = smoothstep(0.22, 1, leftPush);
  const softenedRightPush = smoothstep(0.22, 1, rightPush);
  const softenedTopPush = smoothstep(0.22, 1, topPush);
  const softenedBottomPush = smoothstep(0.22, 1, bottomPush);
  const softenedNearPush = smoothstep(0.18, 1, nearPush);
  const softenedFarPush = smoothstep(0.18, 1, farPush);

  return {
    force: {
      x:
        (softenedLeftPush * softenedLeftPush -
          softenedRightPush * softenedRightPush) *
        2.25,
      y:
        (softenedTopPush * softenedTopPush -
          softenedBottomPush * softenedBottomPush) *
        1.95,
      z: softenedNearPush * 1.35 - softenedFarPush * 1.35,
    },
    pressure: Math.max(
      softenedLeftPush,
      softenedRightPush,
      softenedTopPush,
      softenedBottomPush,
      softenedNearPush,
      softenedFarPush,
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
    getVisibleDepthMin(),
    getVisibleDepthMax(),
  );

  const perspective =
    PARAMS.PROJECT_PERSPECTIVE_BASE +
    (boid.position.z + PARAMS.PROJECT_PERSPECTIVE_OFFSET) /
      PARAMS.PROJECT_PERSPECTIVE_DIVISOR;
  const minCameraX = (margin - width * 0.5) / perspective;
  const maxCameraX = (width - margin - width * 0.5) / perspective;
  const minCameraY = (margin - height * 0.5) / perspective;
  const maxCameraY = (height - margin - height * 0.5) / perspective;

  const clampedCameraX = clamp(
    boid.position.x * PARAMS.PROJECT_X_FROM_X +
      boid.position.z * PARAMS.PROJECT_X_FROM_Z,
    minCameraX,
    maxCameraX,
  );
  const clampedCameraY = clamp(
    boid.position.y * PARAMS.PROJECT_Y_FROM_Y +
      boid.position.z * PARAMS.PROJECT_Y_FROM_Z,
    minCameraY,
    maxCameraY,
  );

  boid.position.x =
    (clampedCameraX - boid.position.z * PARAMS.PROJECT_X_FROM_Z) /
    PARAMS.PROJECT_X_FROM_X;
  boid.position.y =
    (clampedCameraY - boid.position.z * PARAMS.PROJECT_Y_FROM_Z) /
    PARAMS.PROJECT_Y_FROM_Y;
};

const getGridCell = (position) => ({
  x: Math.floor(position.x / PARAMS.GRID_CELL_SIZE),
  y: Math.floor(position.y / PARAMS.GRID_CELL_SIZE),
  z: Math.floor(position.z / PARAMS.GRID_CELL_SIZE),
});

const getGridKey = (cellX, cellY, cellZ) => `${cellX}|${cellY}|${cellZ}`;

const buildSpatialGrid = (boids) => {
  const grid = new Map();

  boids.forEach((boid, index) => {
    const cell = getGridCell(boid.position);
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
  const minX = (origin.x - radius) * PARAMS.GRID_CELL_SIZE;
  const maxX = (origin.x + radius + 1) * PARAMS.GRID_CELL_SIZE;
  const minY = (origin.y - radius) * PARAMS.GRID_CELL_SIZE;
  const maxY = (origin.y + radius + 1) * PARAMS.GRID_CELL_SIZE;
  const minZ = (origin.z - radius) * PARAMS.GRID_CELL_SIZE;
  const maxZ = (origin.z + radius + 1) * PARAMS.GRID_CELL_SIZE;

  return Math.min(
    position.x - minX,
    maxX - position.x,
    position.y - minY,
    maxY - position.y,
    position.z - minZ,
    maxZ - position.z,
  );
};

const insertNearestNeighbor = (
  nearestNeighbors,
  candidateState,
  steeringNeighborCount,
) => {
  let insertIndex = nearestNeighbors.length;

  while (
    insertIndex > 0 &&
    nearestNeighbors[insertIndex - 1].distance > candidateState.distance
  ) {
    insertIndex -= 1;
  }

  if (insertIndex >= steeringNeighborCount) {
    return;
  }

  nearestNeighbors.splice(insertIndex, 0, candidateState);

  if (nearestNeighbors.length > steeringNeighborCount) {
    nearestNeighbors.pop();
  }
};

const collectNeighbors = (
  boidIndex,
  boids,
  grid,
  steeringNeighborCount = PARAMS.STEERING_NEIGHBOR_COUNT,
) => {
  const boid = boids[boidIndex];
  const origin = getGridCell(boid.position);
  const steeringNeighbors = [];
  let densityNeighborCount = 0;
  let densityDistanceSum = 0;
  let closeNeighborCount = 0;

  for (let radius = 0; radius <= PARAMS.MAX_GRID_RADIUS; radius += 1) {
    const shellCandidateIndices = [];
    appendGridShell(grid, origin, radius, shellCandidateIndices);

    shellCandidateIndices.forEach((candidateIndex) => {
      if (candidateIndex === boidIndex) {
        return;
      }

      const candidate = boids[candidateIndex];
      const offset = subtract3D(candidate.position, boid.position);
      const distance = length3D(offset);

      if (distance > PARAMS.NEIGHBOR_RADIUS) {
        return;
      }

      densityNeighborCount += 1;
      densityDistanceSum += distance;

      if (distance < PARAMS.NEIGHBOR_RADIUS * 0.7) {
        closeNeighborCount += 1;
      }

      insertNearestNeighbor(
        steeringNeighbors,
        {
          index: candidateIndex,
          boid: candidate,
          offset,
          distance,
        },
        steeringNeighborCount,
      );
    });

    if (steeringNeighbors.length < steeringNeighborCount) {
      continue;
    }

    if (
      steeringNeighbors[steeringNeighborCount - 1].distance <=
      getOutsideCubeDistance(boid.position, origin, radius)
    ) {
      break;
    }
  }

  return {
    steeringNeighbors,
    densityNeighborCount,
    densityDistanceSum,
    closeNeighborCount,
  };
};

const drawBoids = (gl, renderer, width, height, pixelRatio, boids) => {
  if (!renderer.texture) {
    return;
  }

  const activeCount = boids.length;
  const renderOrder = renderer.renderOrder.slice(0, activeCount);
  renderOrder.sort(
    (left, right) => boids[left].position.z - boids[right].position.z,
  );

  const { positions, sizes, angles, frames, flipsX, colors } = renderer.arrays;

  renderOrder.forEach((boidIndex, index) => {
    const boid = boids[boidIndex];
    const projected = getProjectedPoint(boid.position, width, height);
    const base = index * 2;
    const colorBase = index * 4;

    positions[base] = projected.x;
    positions[base + 1] = projected.y;
    sizes[index] = projected.scale * (24 + boid.poseScale * 6.2);
    angles[index] = boid.renderAngle;
    frames[index] = boid.spriteFrame;
    flipsX[index] = boid.renderFlipX;
    colors[colorBase] = 1;
    colors[colorBase + 1] = 1;
    colors[colorBase + 2] = 1;
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
  gl.bindTexture(gl.TEXTURE_2D, renderer.texture);
  gl.uniform1i(renderer.uniforms.spriteSheet, 0);

  bindFloatAttribute(
    gl,
    renderer.buffers.position,
    renderer.attributes.position,
    2,
    positions.subarray(0, activeCount * 2),
  );
  bindFloatAttribute(
    gl,
    renderer.buffers.size,
    renderer.attributes.size,
    1,
    sizes.subarray(0, activeCount),
  );
  bindFloatAttribute(
    gl,
    renderer.buffers.angle,
    renderer.attributes.angle,
    1,
    angles.subarray(0, activeCount),
  );
  bindFloatAttribute(
    gl,
    renderer.buffers.frame,
    renderer.attributes.frame,
    1,
    frames.subarray(0, activeCount),
  );
  bindFloatAttribute(
    gl,
    renderer.buffers.flipX,
    renderer.attributes.flipX,
    1,
    flipsX.subarray(0, activeCount),
  );
  bindFloatAttribute(
    gl,
    renderer.buffers.color,
    renderer.attributes.color,
    4,
    colors.subarray(0, activeCount * 4),
  );

  gl.drawArrays(gl.POINTS, 0, activeCount);
};

const getDayNightPhase = (daylight) => {
  return {
    daylight,
    night: 1 - daylight,
  };
};

const getSardinePose = (boid, width, height) => {
  const projectedCurrent = getProjectedPoint(boid.position, width, height);
  const projectedFallbackNext = getProjectedPoint(
    add3D(boid.position, scale3D(boid.velocity, PARAMS.MAX_DT)),
    width,
    height,
  );
  const screenDelta = boid.previousScreenPosition
    ? {
        x: projectedCurrent.x - boid.previousScreenPosition.x,
        y: projectedCurrent.y - boid.previousScreenPosition.y,
      }
    : {
        x: projectedFallbackNext.x - projectedCurrent.x,
        y: projectedFallbackNext.y - projectedCurrent.y,
      };
  const resolvedScreenDelta =
    length2D(screenDelta) > 1e-3
      ? screenDelta
      : {
          x: projectedFallbackNext.x - projectedCurrent.x,
          y: projectedFallbackNext.y - projectedCurrent.y,
        };
  const screenVelocity = normalize2D(resolvedScreenDelta, { x: 1, y: 0 });
  const rawAngle = Math.atan2(screenVelocity.y, screenVelocity.x);
  const absCos = Math.abs(Math.cos(rawAngle));
  const absSin = Math.abs(Math.sin(rawAngle));

  if (absCos >= absSin) {
    let angle = rawAngle;
    let flipX = 1;

    if (Math.abs(angle) > Math.PI * 0.5) {
      flipX = -1;
      angle = angle > 0 ? angle - Math.PI : angle + Math.PI;
    }

    return {
      frame: 0,
      angle,
      flipX,
      screenPosition: projectedCurrent,
    };
  }

  return {
    frame: screenVelocity.y > 0 ? 1 : 2,
    angle: 0,
    flipX: 1,
    screenPosition: projectedCurrent,
  };
};

const scheduleNextEvent = (now, interval, rateScale) =>
  now +
  (interval / rateScale) *
    randomBetween(1 - PARAMS.EVENT_JITTER, 1 + PARAMS.EVENT_JITTER);

const createBoid = (id, world, leaderCutoff) => {
  const position = {
    x: randomBetween(-world.width * 0.26, world.width * 0.26),
    y: randomBetween(-world.height * 0.18, world.height * 0.18),
    z: randomBetween(-world.depth * 0.18, world.depth * 0.18),
  };
  const heading = normalize3D({
    x: randomBetween(-1, 1),
    y: randomBetween(-0.18, 0.18),
    z: randomBetween(-1, 1),
  });

  return {
    id,
    position,
    velocity: scale3D(
      heading,
      lerp(PARAMS.BASE_SPEED * 0.82, PARAMS.MAX_SPEED, Math.random()),
    ),
    direction: heading,
    previousDirection: heading,
    recentTurnAngle: 0,
    cruiseBias: randomBetween(0.86, 1.18),
    turnRateBias: randomBetween(0.78, 1.24),
    swayPhase: Math.random() * Math.PI * 2,
    swayRate: randomBetween(0.8, 1.4),
    randomBias: randomBetween(0.8, 1.25),
    spacingBias: randomNormal(0, 0.18),
    reactionOffset: randomBetween(0.85, 1.15),
    spriteClockOffset: Math.random(),
    spriteRate: randomBetween(PARAMS.SPRITE_RATE_MIN, PARAMS.SPRITE_RATE_MAX),
    spriteFrame: Math.floor(Math.random() * PARAMS.SPRITE_FRAME_COUNT),
    renderAngle: 0,
    renderFlipX: 1,
    previousScreenPosition: null,
    referenceLock: null,
    state: "normal",
    stateExpiresAt: 0,
    activeSignal: 0,
    evasionRecovery: 0,
    flash: Math.random() * 0.12,
    poseScale: Math.random(),
    isLeader: id < leaderCutoff,
    subgroup: id % PARAMS.SUBGROUP_COUNT,
    targetSubgroup: id % PARAMS.SUBGROUP_COUNT,
    nextMorphAt: scheduleNextEvent(0, PARAMS.INTRA_EVENT_INTERVAL, 1),
    nextGroupShiftAt: scheduleNextEvent(0, PARAMS.INTER_EVENT_INTERVAL, 1),
    turnIntent: null,
  };
};

const getReferenceNeighbor = (boidIndex, boid, neighbors, boids, now, env) => {
  const lockDuration = PARAMS.DAY_REFERENCE_LOCK_DURATION * env.daylight;

  if (lockDuration > 0 && boid.referenceLock?.expiresAt > now) {
    const lockedIndex = boid.referenceLock.boidIndex;

    if (lockedIndex !== boidIndex && boids[lockedIndex]) {
      const lockedBoid = boids[lockedIndex];
      const offset = subtract3D(lockedBoid.position, boid.position);
      const distance = length3D(offset);

      if (distance <= PARAMS.NEIGHBOR_RADIUS * 1.15) {
        return {
          index: lockedIndex,
          boid: lockedBoid,
          offset,
          distance,
        };
      }
    }
  }

  const nextReference = neighbors[0] || null;
  boid.referenceLock = nextReference
    ? {
        boidIndex: nextReference.index,
        expiresAt: now + lockDuration,
      }
    : null;

  return nextReference;
};

const maybeTriggerLeaderTurn = (boid, env, now, predatorEnabled) => {
  if (!boid.isLeader) {
    return;
  }

  const bias =
    (env.night > 0.45 ? 0.008 : 0.0052) * (predatorEnabled ? 0.16 : 1);
  if (Math.random() > bias) {
    return;
  }

  const lateral = normalize3D(
    {
      x: -boid.direction.z,
      y: randomBetween(-0.18, 0.18),
      z: boid.direction.x,
    },
    { x: 1, y: 0, z: 0 },
  );
  const turnAmount = randomBetween(
    PARAMS.LARGE_TURN_THRESHOLD,
    PARAMS.LARGE_TURN_MAX,
  );
  const turnSign = Math.random() > 0.5 ? 1 : -1;

  boid.turnIntent = {
    direction: normalize3D(
      {
        x: boid.direction.x + lateral.x * turnAmount * turnSign,
        y: boid.direction.y + lateral.y * turnAmount * 0.4,
        z: boid.direction.z + lateral.z * turnAmount * turnSign,
      },
      boid.direction,
    ),
    strength: turnAmount,
    startedAt: now,
    propagated: false,
  };
};

const propagateTurnCascade = (boid, neighbors, now) => {
  if (!boid.turnIntent || boid.turnIntent.propagated) {
    return;
  }

  boid.turnIntent.propagated = true;

  neighbors.forEach(({ boid: neighbor, distance }) => {
    if (distance > PARAMS.CASCADE_RADIUS) {
      return;
    }

    if (neighbor.turnIntent && now - neighbor.turnIntent.startedAt < 0.42) {
      return;
    }

    const signalDelay =
      PARAMS.CASCADE_DELAY_BASE + distance / (PARAMS.BURST_SPEED * 4.6);
    neighbor.turnIntent = {
      direction: boid.turnIntent.direction,
      strength: boid.turnIntent.strength * randomBetween(0.88, 0.98),
      startedAt: now + signalDelay,
      propagated: false,
    };
  });
};

const getSubgroupAnchor = (subgroup, env, world) => {
  const spread = lerp(world.width * 0.003, world.width * 0.22, env.night);
  const depthSpread = lerp(world.depth * 0.0025, world.depth * 0.18, env.night);
  const layerY = lerp(
    -world.height * (0.5 - PARAMS.DAY_DEPTH_ANCHOR),
    0,
    env.night,
  );
  const subgroupAngles = [0.2, 1.8, 3.45, 5.0];
  const angle = subgroupAngles[subgroup % subgroupAngles.length];

  return {
    x: Math.cos(angle) * spread,
    y: layerY + Math.sin(angle * 1.5) * lerp(24, 54, env.night),
    z: Math.sin(angle) * depthSpread,
  };
};

const getSchoolShapeAnchor = (subgroup, env, world, shapeMode) => {
  const anchor = getSubgroupAnchor(subgroup, env, world);

  if (env.daylight > 0.6) {
    return {
      x: anchor.x * 0.02,
      y: anchor.y * 0.18,
      z: anchor.z * 0.02,
    };
  }

  if (shapeMode === 1) {
    return {
      x: anchor.x * 1.22,
      y: anchor.y * 0.94,
      z: anchor.z * 0.76,
    };
  }

  if (shapeMode === 2) {
    const phase = (subgroup / PARAMS.SUBGROUP_COUNT) * Math.PI * 2;
    const crescentBias = clamp(Math.cos(phase - 0.6), -0.82, 1);

    return {
      x: anchor.x * 0.42 + crescentBias * world.width * 0.14,
      y: anchor.y,
      z: anchor.z * (0.34 + (crescentBias + 1) * 0.28),
    };
  }

  return {
    x: anchor.x * 0.84,
    y: anchor.y,
    z: anchor.z * 0.84,
  };
};

const getPredatorInfluence = (
  boid,
  width,
  height,
  pointer,
  predatorEnabled,
) => {
  if (!predatorEnabled) {
    return {
      intensity: 0,
      evasionIntensity: 0,
      separationScale: 1,
      cohesionBoost: 1,
      escape: { x: 0, y: 0, z: 0 },
    };
  }

  if (!pointer?.active) {
    return {
      intensity: PARAMS.GLOBAL_PREDATOR_AWARENESS,
      evasionIntensity: 0,
      separationScale: 1,
      cohesionBoost: lerp(
        1,
        PARAMS.ALERT_COHESION_BOOST,
        PARAMS.GLOBAL_PREDATOR_AWARENESS,
      ),
      escape: { x: 0, y: 0, z: 0 },
    };
  }

  const rayStart = getWorldPointOnPointerRay(
    pointer.x,
    pointer.y,
    getVisibleDepthMin(),
    width,
    height,
  );
  const rayEnd = getWorldPointOnPointerRay(
    pointer.x,
    pointer.y,
    getVisibleDepthMax(),
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
      intensity: PARAMS.GLOBAL_PREDATOR_AWARENESS,
      evasionIntensity: 0,
      separationScale: 1,
      cohesionBoost: lerp(
        1,
        PARAMS.ALERT_COHESION_BOOST,
        PARAMS.GLOBAL_PREDATOR_AWARENESS,
      ),
      escape: { x: 0, y: 0, z: 0 },
    };
  }

  const localIntensity =
    1 - smoothstep(worldImpactRadius, worldDetectionRadius, distance);
  const intensity = Math.max(PARAMS.GLOBAL_PREDATOR_AWARENESS, localIntensity);
  const away = normalize3D(rayOffset, boid.direction);

  return {
    intensity,
    evasionIntensity: localIntensity,
    separationScale: lerp(1, PARAMS.ALERT_SPACING_SCALE, localIntensity),
    cohesionBoost: lerp(1, PARAMS.ALERT_COHESION_BOOST, intensity),
    escape: normalize3D(
      {
        x: away.x,
        y: away.y * 0.86,
        z: away.z,
      },
      boid.direction,
    ),
  };
};

const getTargetDensity = (env, predatorDayState, predatorNightState, now) => {
  const daytimePhase = 0.5 + 0.5 * Math.sin(now * 0.018 - Math.PI * 0.5);
  const typicalDayDensity =
    PARAMS.DENSITY_BASE *
    lerp(1, PARAMS.DAY_DENSITY_MULTIPLIER, daytimePhase * env.daylight);
  const dayCompression = smoothstep(0.04, 0.82, predatorDayState);
  const compressedDayDensity = lerp(
    typicalDayDensity,
    PARAMS.DENSITY_ALERT,
    dayCompression,
  );
  const nightBaselineDensity =
    PARAMS.DENSITY_BASE * PARAMS.NIGHT_DENSITY_MULTIPLIER;
  const dispersedNightDensity = lerp(
    nightBaselineDensity,
    PARAMS.DENSITY_NIGHT_DANGER,
    clamp(predatorNightState, 0, 1),
  );

  return lerp(dispersedNightDensity, compressedDayDensity, env.daylight);
};

const resolveBoidState = (boid, neighbors, predatorInfluence, now, env) => {
  const alerted = predatorInfluence.intensity > 0.16;
  const locallyActive =
    boid.recentTurnAngle >= PARAMS.LARGE_TURN_THRESHOLD &&
    boid.recentTurnAngle <= PARAMS.LARGE_TURN_MAX * 1.08;
  const neighborActiveSignal = neighbors.reduce(
    (maxSignal, neighbor) =>
      Math.max(maxSignal, neighbor.boid.activeSignal || 0),
    0,
  );
  const contagiousActive =
    neighborActiveSignal > 0.12 && Math.random() < neighborActiveSignal * 0.72;

  if (locallyActive || contagiousActive) {
    boid.state = "active";
    boid.stateExpiresAt = now + PARAMS.ACTIVE_STATE_DURATION;
    boid.activeSignal = Math.max(
      boid.activeSignal,
      clamp(
        boid.recentTurnAngle / Math.max(PARAMS.LARGE_TURN_MAX, 1e-6),
        0.32,
        1,
      ),
    );
  } else if (alerted) {
    if (boid.state !== "active") {
      boid.state = "alert";
      boid.stateExpiresAt = Math.max(
        boid.stateExpiresAt,
        now + PARAMS.ALERT_STATE_DURATION * lerp(0.72, 1, env.daylight),
      );
    }
    boid.activeSignal = lerp(
      boid.activeSignal,
      predatorInfluence.intensity * 0.18,
      0.18,
    );
  } else if (boid.stateExpiresAt <= now) {
    boid.state = "normal";
    boid.activeSignal = lerp(boid.activeSignal, 0, 0.18);
  } else {
    boid.activeSignal = lerp(
      boid.activeSignal,
      boid.state === "active" ? 0.24 : 0.08,
      0.08,
    );
  }

  if (boid.state === "active" && boid.stateExpiresAt <= now) {
    boid.state = alerted ? "alert" : "normal";
  }

  return {
    isAlert: boid.state === "alert" || boid.state === "active",
    isActive: boid.state === "active",
    activeNeighborSignal: neighborActiveSignal,
  };
};

const getDensityCompression = (targetDensity) =>
  clamp(
    (targetDensity - PARAMS.DENSITY_BASE) /
      Math.max(PARAMS.DENSITY_ALERT - PARAMS.DENSITY_BASE, 1e-6),
    0,
    1,
  );

const maybeTriggerNeighborCascade = (boid, neighbors, now) => {
  if (boid.turnIntent && now - boid.turnIntent.startedAt < 0.36) {
    return;
  }

  for (const { boid: neighbor, distance } of neighbors) {
    if (distance > PARAMS.CASCADE_RADIUS) {
      continue;
    }

    if (
      neighbor.recentTurnAngle < PARAMS.LARGE_TURN_THRESHOLD ||
      neighbor.recentTurnAngle > PARAMS.LARGE_TURN_MAX
    ) {
      continue;
    }

    const signalDelay =
      PARAMS.CASCADE_DELAY_BASE + distance / (PARAMS.BURST_SPEED * 4.6);
    boid.turnIntent = {
      direction: neighbor.direction,
      strength: neighbor.recentTurnAngle,
      startedAt: now + signalDelay,
      propagated: false,
    };
    return;
  }
};

const updateSpriteFrame = (boid, width, height) => {
  const pose = getSardinePose(boid, width, height);

  boid.renderAngle = pose.angle;
  boid.renderFlipX = pose.flipX;

  boid.spriteFrame = pose.frame;
  boid.previousScreenPosition = pose.screenPosition;
};

const rebuildBoids = (count, world) => {
  const leaderCutoff = Math.max(1, Math.round(count * PARAMS.LEADER_RATIO));
  return Array.from({ length: count }, (_, index) =>
    createBoid(index, world, leaderCutoff),
  );
};

export function App({ controls, onGpuErrorChange, isPaused } = {}) {
  const canvasRef = React.useRef(null);
  const pointerRef = React.useRef({ active: false, x: 0, y: 0 });
  const resolvedControls = React.useMemo(
    () => sanitizeControlState(controls),
    [controls],
  );
  const controlsRef = React.useRef(resolvedControls);

  React.useEffect(() => {
    controlsRef.current = resolvedControls;
    Object.assign(PARAMS, {
      BOID_COUNT: resolvedControls.BOID_COUNT,
      BASE_SPEED: resolvedControls.BASE_SPEED,
      NEIGHBOR_RADIUS: resolvedControls.NEIGHBOR_RADIUS,
      RANDOM_MODE_MULTIPLIER: resolvedControls.RANDOM_MODE_MULTIPLIER,
      NIGHT_COHESION: resolvedControls.NIGHT_COHESION,
    });
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

    const renderer = createRenderer(gl, 1800);
    if (!renderer) {
      onGpuErrorChange?.("정어리 GPU 렌더러 초기화에 실패했습니다.");
      return undefined;
    }

    let animationFrame = 0;
    let lastTimestamp = 0;
    let disposed = false;
    let daylightState = controlsRef.current.IS_DAYTIME ? 1 : 0;
    let schoolShapeMode = 0;
    let nextSchoolShapeAt = scheduleNextEvent(
      0,
      PARAMS.INTRA_EVENT_INTERVAL,
      1,
    );
    const world = {
      width: PARAMS.WORLD_WIDTH,
      height: PARAMS.WORLD_HEIGHT,
      depth: PARAMS.WORLD_DEPTH,
    };
    const boids = rebuildBoids(resolvedControls.BOID_COUNT, world);

    const handlePointerMove = (event) => {
      pointerRef.current = {
        active: true,
        x: event.clientX,
        y: event.clientY,
      };
    };

    const clearPointer = () => {
      pointerRef.current = {
        ...pointerRef.current,
        active: false,
      };
    };

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

    const step = (timestamp) => {
      const now = timestamp * 0.001;
      const dt = clamp(
        lastTimestamp ? now - lastTimestamp : 0.016,
        0.008,
        PARAMS.MAX_DT,
      );
      lastTimestamp = now;
      const liveControls = controlsRef.current;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      daylightState = lerp(
        daylightState,
        liveControls.IS_DAYTIME ? 1 : 0,
        0.04,
      );
      const env = getDayNightPhase(daylightState);
      const rateScale = liveControls.EVENT_RATE_SCALE;

      if (liveControls.IS_PREDATOR_ACTIVE) {
        schoolShapeMode = 0;
      } else if (env.night > 0.35 && now >= nextSchoolShapeAt) {
        schoolShapeMode =
          (schoolShapeMode + 1 + Math.floor(Math.random() * 2)) % 3;
        nextSchoolShapeAt = scheduleNextEvent(
          now,
          PARAMS.INTRA_EVENT_INTERVAL,
          rateScale,
        );
      } else if (env.daylight > 0.65) {
        schoolShapeMode = 0;
      }

      const grid = buildSpatialGrid(boids);
      const center = boids.reduce((sum, boid) => add3D(sum, boid.position), {
        x: 0,
        y: 0,
        z: 0,
      });
      const aggregateVelocity = boids.reduce(
        (sum, boid) => add3D(sum, boid.velocity),
        { x: 0, y: 0, z: 0 },
      );
      center.x /= boids.length;
      center.y /= boids.length;
      center.z /= boids.length;
      const globalDirection = normalize3D(aggregateVelocity, {
        x: 1,
        y: 0,
        z: 0,
      });
      const activeLeaderAggregate = boids.reduce(
        (sum, candidate) => {
          if (!candidate.isLeader) {
            return sum;
          }

          const signal =
            candidate.state === "active"
              ? Math.max(candidate.activeSignal, 0.6)
              : candidate.turnIntent
                ? clamp(
                    candidate.turnIntent.strength /
                      Math.max(PARAMS.LARGE_TURN_MAX, 1e-6),
                    0,
                    1,
                  )
                : 0;

          if (signal <= 0.08) {
            return sum;
          }

          const sourceDirection = candidate.turnIntent
            ? candidate.turnIntent.direction
            : candidate.direction;

          return {
            x: sum.x + sourceDirection.x * signal,
            y: sum.y + sourceDirection.y * signal,
            z: sum.z + sourceDirection.z * signal,
            signal: sum.signal + signal,
          };
        },
        { x: 0, y: 0, z: 0, signal: 0 },
      );
      const activeLeaderDirection =
        activeLeaderAggregate.signal > 0
          ? normalize3D(activeLeaderAggregate, globalDirection)
          : globalDirection;
      const activeLeaderSignal = clamp(
        activeLeaderAggregate.signal /
          Math.max(Math.ceil(boids.length * PARAMS.LEADER_RATIO), 1),
        0,
        1,
      );

      boids.forEach((boid, boidIndex) => {
        if (now >= boid.nextMorphAt) {
          boid.poseScale = randomBetween(0, 1);
          boid.flash = randomBetween(0.08, 0.24);
          boid.nextMorphAt = scheduleNextEvent(
            now,
            PARAMS.INTRA_EVENT_INTERVAL,
            rateScale,
          );
        } else {
          boid.flash = lerp(boid.flash, env.daylight * 0.16, 0.03);
        }

        if (Math.random() < 0.004 * dt * 60 * lerp(0.08, 1, env.night)) {
          boid.subgroup = boid.targetSubgroup;
        }

        maybeTriggerLeaderTurn(boid, env, now, liveControls.IS_PREDATOR_ACTIVE);

        const steeringNeighborCount = Math.round(
          lerp(
            PARAMS.STEERING_NEIGHBOR_COUNT,
            PARAMS.DAY_STEERING_NEIGHBOR_COUNT,
            env.daylight,
          ),
        );
        const neighborData = collectNeighbors(
          boidIndex,
          boids,
          grid,
          steeringNeighborCount,
        );
        const neighbors = neighborData.steeringNeighbors;
        const referenceNeighbor = getReferenceNeighbor(
          boidIndex,
          boid,
          neighbors,
          boids,
          now,
          env,
        );
        const previousDirection = boid.direction;
        propagateTurnCascade(boid, neighbors, now);
        const predatorInfluence = getPredatorInfluence(
          boid,
          viewportWidth,
          viewportHeight,
          pointerRef.current,
          liveControls.IS_PREDATOR_ACTIVE,
        );
        maybeTriggerNeighborCascade(boid, neighbors, now);
        const boidState = resolveBoidState(
          boid,
          neighbors,
          predatorInfluence,
          now,
          env,
        );
        const hydrodynamicMultiplier = boidState.isAlert
          ? lerp(
              PARAMS.ALERT_INTERACTION_MIN,
              PARAMS.ALERT_INTERACTION_MAX,
              clamp(
                Math.max(
                  predatorInfluence.intensity,
                  boidState.activeNeighborSignal,
                  boidState.isActive ? 1 : 0,
                ),
                0,
                1,
              ),
            )
          : predatorInfluence.evasionIntensity > 0
            ? lerp(
                PARAMS.RANDOM_MODE_MULTIPLIER_MIN,
                liveControls.RANDOM_MODE_MULTIPLIER,
                predatorInfluence.evasionIntensity,
              )
            : 1;
        const predatorAwarenessBlend = smoothstep(
          0.08,
          0.72,
          predatorInfluence.intensity,
        );
        const predatorDayState = predatorAwarenessBlend * env.daylight;
        const predatorLocalEvasionState = predatorInfluence.evasionIntensity;
        if (predatorLocalEvasionState > boid.evasionRecovery) {
          boid.evasionRecovery = lerp(
            boid.evasionRecovery,
            predatorLocalEvasionState,
            0.24,
          );
        } else {
          boid.evasionRecovery = Math.max(
            0,
            boid.evasionRecovery - dt * PARAMS.PREDATOR_RECOVERY_DECAY,
          );
        }
        const postEvasionRecoveryState =
          smoothstep(0.04, 0.32, boid.evasionRecovery) *
          (1 - smoothstep(0.06, 0.28, predatorLocalEvasionState));
        const predatorScatterState = predatorLocalEvasionState;
        const targetDensityBase = getTargetDensity(
          env,
          predatorDayState,
          predatorScatterState,
          now,
        );
        const dayCohesionStrength = PARAMS.DAY_COHESION;
        const minimumSpacingStrength = liveControls.MIN_SPACING;
        const nightDispersionStrength = liveControls.NIGHT_COHESION;
        const dayCohesionBlend = clamp((dayCohesionStrength - 0.5) / 2, 0, 1);
        const minimumSpacingBlend = clamp(
          (minimumSpacingStrength - 0.5) / 2,
          0,
          1,
        );
        const predatorDayDensityScale = lerp(1.95, 0.42, dayCohesionBlend);
        const targetDensity =
          targetDensityBase *
          lerp(1, predatorDayDensityScale, predatorDayState);
        const densityCompression = getDensityCompression(targetDensity);
        const predatorDayCompression = predatorDayState;
        const predatorNightDispersion = predatorScatterState;
        const dayCompressionBlend = smoothstep(
          0.08,
          0.72,
          predatorDayCompression,
        );
        const nightDispersionBlend = smoothstep(
          0.08,
          0.72,
          predatorNightDispersion,
        );
        const nightDispersionBlendControl = clamp(
          (nightDispersionStrength - 0.2) / 1.8,
          0,
          1,
        );
        const daytimeSchoolingState =
          env.daylight * lerp(1.65, 0.42, dayCohesionBlend);
        const daytimeSchoolingBlend = clamp(daytimeSchoolingState, 0, 1);
        const nighttimeFreeRoamState =
          env.night * lerp(0.68, 1, nightDispersionBlendControl);
        const daytimeWanderSuppression = lerp(1, 0.04, daytimeSchoolingBlend);
        const daySpacingDistanceScale = lerp(0.64, 1.24, minimumSpacingBlend);
        const predatorDaySpacingScale = lerp(0.46, 1.34, minimumSpacingBlend);
        const predatorDayHoldScale = lerp(1.56, 0.34, dayCohesionBlend);
        const predatorDayGatherScale = lerp(2.8, 0.12, dayCohesionBlend);
        const gaussianSpacingScale =
          predatorLocalEvasionState > 0
            ? clamp(
                1 + boid.spacingBias * predatorLocalEvasionState,
                0.58,
                1.48,
              )
            : 1;
        const physicalSpacingTarget = densityToSpacingPx(targetDensity);
        const desiredNeighborDistance = clamp(
          physicalSpacingTarget *
            gaussianSpacingScale *
            lerp(1, 1.34, nighttimeFreeRoamState) *
            lerp(1, 1.14, predatorNightDispersion) *
            lerp(1, 0.88, dayCompressionBlend) *
            lerp(1, predatorDaySpacingScale, predatorDayState) *
            lerp(1.08, daySpacingDistanceScale, env.daylight),
          bodyLengthsToPx(0.34),
          PARAMS.NEIGHBOR_RADIUS * 0.72,
        );
        const localSeparationRadius = clamp(
          desiredNeighborDistance *
            predatorInfluence.separationScale *
            lerp(0.94, 0.52, env.daylight) *
            lerp(1, 0.82, densityCompression) *
            lerp(
              1,
              PARAMS.PREDATOR_NIGHT_DISPERSION_BOOST,
              predatorNightDispersion,
            ),
          bodyLengthsToPx(0.26),
          PARAMS.SEPARATION_RADIUS,
        );

        const separation = { x: 0, y: 0, z: 0 };
        const alignment = { x: 0, y: 0, z: 0 };
        const cohesion = { x: 0, y: 0, z: 0 };
        const crowdMass = { x: 0, y: 0, z: 0 };
        let totalWeight = 0;
        let crowdMassWeight = 0;
        const crowdCount = neighborData.closeNeighborCount;
        const forwardAxis = normalize3D(boid.direction, { x: 1, y: 0, z: 0 });
        const provisionalUp =
          Math.abs(forwardAxis.y) > 0.92
            ? { x: 1, y: 0, z: 0 }
            : { x: 0, y: 1, z: 0 };
        const lateralAxis = normalize3D(cross3D(provisionalUp, forwardAxis), {
          x: 0,
          y: 0,
          z: 1,
        });
        const verticalAxis = normalize3D(cross3D(forwardAxis, lateralAxis), {
          x: 0,
          y: 1,
          z: 0,
        });
        const denseSchoolSpacingState =
          env.daylight *
          smoothstep(8, PARAMS.STABLE_GROUP_NEIGHBOR_COUNT, crowdCount);
        const personalSpaceRadius = clamp(
          desiredNeighborDistance * lerp(0.58, 0.76, denseSchoolSpacingState),
          bodyLengthsToPx(0.24),
          desiredNeighborDistance,
        );
        const preferredLongitudinalSpacing = Math.max(
          desiredNeighborDistance * 1.1,
          bodyLengthsToPx(0.42),
        );
        const preferredLateralSpacing = Math.max(
          preferredLongitudinalSpacing * (0.12 / 1.1),
          metersToPx(PARAMS.BODY_THICKNESS_M) * 2.2,
        );
        const preferredVerticalSpacing = Math.max(
          preferredLongitudinalSpacing * lerp(0.22, 0.1, env.night),
          metersToPx(PARAMS.BODY_HEIGHT_M) * lerp(1.8, 1.2, env.night),
        );
        const occupancyHalfLength =
          metersToPx(PARAMS.BODY_LENGTH_M) *
          lerp(PARAMS.OCCUPANCY_LENGTH_SCALE, 1.22, denseSchoolSpacingState);
        const occupancyHalfHeight =
          metersToPx(PARAMS.BODY_HEIGHT_M) *
          lerp(PARAMS.OCCUPANCY_HEIGHT_SCALE, 2.8, denseSchoolSpacingState);
        const occupancyHalfThickness =
          metersToPx(PARAMS.BODY_THICKNESS_M) *
          lerp(PARAMS.OCCUPANCY_THICKNESS_SCALE, 3.7, denseSchoolSpacingState);

        neighbors.forEach(({ boid: neighbor, offset, distance }) => {
          const offsetDirection = normalize3D(offset, boid.direction);
          const forwardDot = dot3D(forwardAxis, offsetDirection);
          const forwardOffset = dot3D(offset, forwardAxis);
          const lateralOffset = dot3D(offset, lateralAxis);
          const verticalOffset = dot3D(offset, verticalAxis);
          const visualWeight = smoothstep(
            PARAMS.FRONT_VISION_MIN_COS,
            PARAMS.FRONT_VISION_MAX_COS,
            forwardDot,
          );
          const rearSensitivity = lerp(
            0.12,
            PARAMS.NIGHT_LATERAL_LINE_WEIGHT,
            env.night,
          );
          const sensoryWeight = lerp(rearSensitivity, 1.28, visualWeight);
          const anisotropicDistance = Math.hypot(
            forwardOffset / Math.max(preferredLongitudinalSpacing, 1e-6),
            lateralOffset / Math.max(preferredLateralSpacing, 1e-6),
            verticalOffset / Math.max(preferredVerticalSpacing, 1e-6),
          );
          const spatialWeight =
            1 - clamp((anisotropicDistance - 0.12) / 1.88, 0, 1);
          const weight =
            (1 - clamp(distance / PARAMS.NEIGHBOR_RADIUS, 0, 1)) *
            sensoryWeight *
            spatialWeight;
          const crowdWeight = weight * weight;
          totalWeight += weight;
          crowdMassWeight += crowdWeight;
          alignment.x += neighbor.direction.x * weight;
          alignment.y += neighbor.direction.y * weight;
          alignment.z += neighbor.direction.z * weight;
          cohesion.x += neighbor.position.x * weight;
          cohesion.y += neighbor.position.y * weight;
          cohesion.z += neighbor.position.z * weight;
          crowdMass.x += neighbor.position.x * crowdWeight;
          crowdMass.y += neighbor.position.y * crowdWeight;
          crowdMass.z += neighbor.position.z * crowdWeight;
          const occupancyDistance = Math.hypot(
            forwardOffset / Math.max(occupancyHalfLength, 1e-6),
            lateralOffset / Math.max(occupancyHalfThickness, 1e-6),
            verticalOffset / Math.max(occupancyHalfHeight, 1e-6),
          );

          if (occupancyDistance < 1) {
            const occupancyRepel =
              (1 - occupancyDistance) * lerp(1.4, 2.8, denseSchoolSpacingState);
            const occupancyGradient = normalize3D(
              {
                x:
                  forwardAxis.x *
                    (forwardOffset /
                      Math.max(
                        occupancyHalfLength * occupancyHalfLength,
                        1e-6,
                      )) +
                  lateralAxis.x *
                    (lateralOffset /
                      Math.max(
                        occupancyHalfThickness * occupancyHalfThickness,
                        1e-6,
                      )) +
                  verticalAxis.x *
                    (verticalOffset /
                      Math.max(
                        occupancyHalfHeight * occupancyHalfHeight,
                        1e-6,
                      )),
                y:
                  forwardAxis.y *
                    (forwardOffset /
                      Math.max(
                        occupancyHalfLength * occupancyHalfLength,
                        1e-6,
                      )) +
                  lateralAxis.y *
                    (lateralOffset /
                      Math.max(
                        occupancyHalfThickness * occupancyHalfThickness,
                        1e-6,
                      )) +
                  verticalAxis.y *
                    (verticalOffset /
                      Math.max(
                        occupancyHalfHeight * occupancyHalfHeight,
                        1e-6,
                      )),
                z:
                  forwardAxis.z *
                    (forwardOffset /
                      Math.max(
                        occupancyHalfLength * occupancyHalfLength,
                        1e-6,
                      )) +
                  lateralAxis.z *
                    (lateralOffset /
                      Math.max(
                        occupancyHalfThickness * occupancyHalfThickness,
                        1e-6,
                      )) +
                  verticalAxis.z *
                    (verticalOffset /
                      Math.max(
                        occupancyHalfHeight * occupancyHalfHeight,
                        1e-6,
                      )),
              },
              offset,
            );
            separation.x -= occupancyGradient.x * occupancyRepel;
            separation.y -= occupancyGradient.y * occupancyRepel;
            separation.z -= occupancyGradient.z * occupancyRepel;
          }

          if (distance < localSeparationRadius) {
            const repel =
              (1 - distance / Math.max(localSeparationRadius, 1)) *
              hydrodynamicMultiplier *
              lerp(0.18, 1, env.night);
            separation.x -= (offset.x / Math.max(distance, 1)) * repel;
            separation.y -= (offset.y / Math.max(distance, 1)) * repel * 0.72;
            separation.z -= (offset.z / Math.max(distance, 1)) * repel;
          }

          if (distance < personalSpaceRadius) {
            const personalSpaceRepel =
              (1 - distance / Math.max(personalSpaceRadius, 1)) *
              lerp(0.42, 0.88, denseSchoolSpacingState) *
              lerp(1, 0.82, predatorDayState) *
              lerp(1, 2.1, denseSchoolSpacingState);
            separation.x -=
              (offset.x / Math.max(distance, 1)) * personalSpaceRepel;
            separation.y -=
              (offset.y / Math.max(distance, 1)) * personalSpaceRepel * 0.68;
            separation.z -=
              (offset.z / Math.max(distance, 1)) * personalSpaceRepel;
          }
        });

        const alignmentDir = totalWeight
          ? normalize3D(scale3D(alignment, 1 / totalWeight), boid.direction)
          : boid.direction;
        const cohesionCenter = totalWeight
          ? scale3D(cohesion, 1 / totalWeight)
          : center;
        const cohesionDir = normalize3D(
          subtract3D(cohesionCenter, boid.position),
          boid.direction,
        );
        const crowdMassCenter = crowdMassWeight
          ? scale3D(crowdMass, 1 / crowdMassWeight)
          : cohesionCenter;
        const schoolCenterDir = normalize3D(
          subtract3D(center, boid.position),
          cohesionDir,
        );
        const subgroupAnchor = getSchoolShapeAnchor(
          boid.subgroup,
          env,
          world,
          schoolShapeMode,
        );
        const subgroupDir = normalize3D(
          subtract3D(subgroupAnchor, boid.position),
          boid.direction,
        );
        const averageNeighborDistance = neighborData.densityNeighborCount
          ? neighborData.densityDistanceSum / neighborData.densityNeighborCount
          : PARAMS.NEIGHBOR_RADIUS;
        const crowdMassDir = normalize3D(
          subtract3D(crowdMassCenter, boid.position),
          cohesionDir,
        );
        const localCrowdOffset = length3D(
          subtract3D(crowdMassCenter, boid.position),
        );
        const referenceDir = referenceNeighbor
          ? normalize3D(referenceNeighbor.boid.direction, alignmentDir)
          : alignmentDir;
        const referenceCohesionDir = referenceNeighbor
          ? normalize3D(referenceNeighbor.offset, cohesionDir)
          : cohesionDir;
        const densityError = clamp(
          (averageNeighborDistance - desiredNeighborDistance) /
            Math.max(desiredNeighborDistance, 1),
          -1,
          1,
        );
        const underCompressionState = clamp(densityError, 0, 1);
        const overCompressionState = clamp(
          (desiredNeighborDistance - averageNeighborDistance) /
            Math.max(desiredNeighborDistance, 1),
          0,
          1,
        );
        const lineCollapseRisk =
          env.daylight *
          smoothstep(0.12, 0.58, overCompressionState) *
          smoothstep(8, PARAMS.STABLE_GROUP_NEIGHBOR_COUNT, crowdCount);

        if (
          predatorDayState > 0.08 &&
          boid.subgroup !== boid.targetSubgroup &&
          Math.random() < 0.036 * dt * 60 * predatorDayState
        ) {
          boid.subgroup = boid.targetSubgroup;
        }

        const randomMode =
          predatorScatterState > 0
            ? hydrodynamicMultiplier *
              lerp(0.34, 1.04, predatorScatterState) *
              boid.randomBias *
              lerp(0.42, 1.18, env.night)
            : smoothstep(10, 18, crowdCount) *
              boid.randomBias *
              lerp(0.004, 1.44, nighttimeFreeRoamState) *
              daytimeWanderSuppression;
        const randomVector = normalize3D(
          {
            x: randomNormal(0, 1),
            y: randomNormal(0, 0.42),
            z: randomNormal(0, 1),
          },
          boid.direction,
        );
        const sway = Math.sin(now * boid.swayRate + boid.swayPhase);
        const nightVerticalTarget =
          Math.sin(now * 0.38 + boid.swayPhase) * world.height * 0.12 +
          Math.sin(now * 0.71 + boid.swayPhase * 0.47) * world.height * 0.06;
        const verticalTarget = lerp(
          -world.height * (0.5 - PARAMS.DAY_DEPTH_ANCHOR),
          nightVerticalTarget,
          env.night,
        );
        const verticalForce = clamp(
          (verticalTarget - boid.position.y) / (world.height * 0.35),
          -1,
          1,
        );
        const edgeAvoidance = getVisibleAvoidance(
          boid,
          viewportWidth,
          viewportHeight,
        );
        const randomPatternBlend = smoothstep(0.18, 0.76, predatorScatterState);
        const dayCohesionWeight = lerp(2.4, 4.4, 1 - dayCohesionBlend);
        const nightCohesionWeight = 0;
        const dayPackingControl = lerp(2.3, 4.8, 1 - dayCohesionBlend);
        const nightDispersionControlBoost = lerp(
          0.7,
          2.4,
          nightDispersionBlendControl,
        );
        const packingNeed =
          env.daylight *
          smoothstep(0.06, 0.72, underCompressionState) *
          lerp(1, 0.12, lineCollapseRisk);
        const largeSchoolState = smoothstep(
          PARAMS.SMALL_GROUP_NEIGHBOR_COUNT + 2,
          PARAMS.STABLE_GROUP_NEIGHBOR_COUNT,
          crowdCount,
        );
        const joinNeed =
          env.daylight *
          (1 - largeSchoolState) *
          lerp(0.62, 0.18, dayCohesionBlend) *
          lerp(1, 0.28, predatorScatterState);
        const activeAlignmentBoost = boidState.isActive
          ? PARAMS.ACTIVE_ALIGNMENT_BOOST
          : boidState.isAlert
            ? lerp(
                1,
                PARAMS.ACTIVE_ALIGNMENT_BOOST * 0.58,
                boidState.activeNeighborSignal,
              )
            : 1;
        const alertPatternState =
          boidState.isAlert && !boidState.isActive
            ? clamp(
                Math.max(predatorInfluence.intensity, predatorScatterState),
                0,
                1,
              )
            : 0;
        const predatorEscapeBoost = lerp(
          1,
          PARAMS.PREDATOR_ESCAPE_BOOST,
          predatorLocalEvasionState,
        );
        const stateRandomMode =
          randomMode * lerp(1, PARAMS.ALERT_RANDOM_BOOST, alertPatternState);
        const alertAlignmentRelease = lerp(
          1,
          PARAMS.ALERT_ALIGNMENT_RELEASE,
          alertPatternState,
        );
        const alertReferenceRelease = lerp(
          1,
          PARAMS.ALERT_REFERENCE_RELEASE,
          alertPatternState,
        );
        const topologicalLeaderInfluence = clamp(
          Math.max(boidState.activeNeighborSignal, activeLeaderSignal * 0.82),
          0,
          1,
        );
        const activeLeaderPull =
          env.daylight *
          PARAMS.ACTIVE_LEADER_PULL *
          topologicalLeaderInfluence *
          lerp(0.84, 1.18, env.daylight);
        const antiCollapseReferenceScale = lerp(1, 0.16, lineCollapseRisk);
        const referenceAlignmentPull =
          env.daylight *
          PARAMS.DAY_REFERENCE_ALIGNMENT *
          lerp(0.78, 1.28, daytimeSchoolingBlend) *
          lerp(1, 1.18, predatorDayState) *
          lerp(
            1,
            PARAMS.ACTIVE_REFERENCE_BOOST,
            boidState.isActive ? 1 : boidState.activeNeighborSignal,
          ) *
          antiCollapseReferenceScale *
          alertReferenceRelease;
        const referenceJoinPull =
          env.daylight *
          PARAMS.DAY_REFERENCE_PULL *
          lerp(0.68, 1.18, daytimeSchoolingBlend) *
          lerp(1.12, 0.74, largeSchoolState) *
          lerp(1, 1.16, predatorDayState) *
          antiCollapseReferenceScale *
          alertReferenceRelease;
        const alertAlignmentScale =
          lerp(1, 0.82, predatorDayState) *
          lerp(1, 0.34, predatorScatterState) *
          lerp(1, 0.42, randomPatternBlend) *
          lerp(1.06, 0.22, nighttimeFreeRoamState);
        const alertCohesionBoost =
          predatorInfluence.cohesionBoost *
          lerp(1, PARAMS.PREDATOR_DAY_COHESION_BOOST, dayCompressionBlend) *
          predatorDayHoldScale *
          lerp(1, 0.02, nighttimeFreeRoamState);
        const subgroupInfluence = 0;
        const crowdPullBoost =
          predatorDayState *
          lerp(2.2, PARAMS.PREDATOR_CROWD_PULL * 1.18, randomPatternBlend) *
          predatorDayHoldScale *
          predatorDayGatherScale *
          lerp(1.8, 0.02, nighttimeFreeRoamState) *
          lerp(0.92, 2.1, env.daylight);
        const baselineDayCrowdPull =
          env.daylight *
          lerp(0.72, 2.2, daytimeSchoolingBlend) *
          lerp(0.16, 1, packingNeed) *
          lerp(1, 0.18, nighttimeFreeRoamState);
        const daytimeJoinPull =
          joinNeed *
          lerp(0.24, 0.72, daytimeSchoolingBlend) *
          lerp(1, 1.24, dayCompressionBlend) *
          packingNeed;
        const predatorSchoolHold =
          predatorDayState *
          largeSchoolState *
          lerp(1.4, 4.2, daytimeSchoolingBlend) *
          predatorDayHoldScale *
          predatorDayGatherScale *
          lerp(1, 1.7, dayCompressionBlend);
        const predatorLocalHoldState =
          predatorDayState *
          smoothstep(
            desiredNeighborDistance * 1.2,
            desiredNeighborDistance * 3.8,
            localCrowdOffset,
          ) *
          lerp(0.68, 1.04, dayCompressionBlend) *
          lerp(1, 0.72, randomPatternBlend) *
          lerp(1, 1.16, postEvasionRecoveryState);
        const predatorLocalHoldPull =
          predatorLocalHoldState *
            predatorDayGatherScale *
            PARAMS.PREDATOR_LOCAL_HOLD_PULL +
          postEvasionRecoveryState *
            smoothstep(
              desiredNeighborDistance * 1.05,
              desiredNeighborDistance * 2.8,
              localCrowdOffset,
            ) *
            predatorDayGatherScale *
            PARAMS.PREDATOR_RECOVERY_PULL;
        const dayPackingPull =
          env.daylight *
          PARAMS.DAY_PACKING_PULL *
          lerp(1.8, 3.2, densityCompression) *
          (1 - nighttimeFreeRoamState) *
          lerp(2.2, 5.2, daytimeSchoolingBlend) *
          predatorDayHoldScale *
          lerp(1, 3.8, predatorDayState) *
          dayPackingControl *
          packingNeed;
        const predatorDayRejoinPull =
          predatorDayCompression *
          PARAMS.PREDATOR_DAY_REJOIN_PULL *
          predatorDayGatherScale *
          lerp(
            1.15,
            2.8,
            1 -
              smoothstep(
                PARAMS.SMALL_GROUP_NEIGHBOR_COUNT,
                PARAMS.STABLE_GROUP_NEIGHBOR_COUNT,
                crowdCount,
              ),
          );
        const leaderCrowdPull = boid.isLeader
          ? predatorDayState *
            PARAMS.LEADER_CROWD_PULL *
            lerp(1.65, 0.16, nightDispersionBlend)
          : 0;
        const turnDemand = boid.turnIntent
          ? boid.turnIntent.strength
          : angleBetween3D(
              boid.direction,
              normalize3D(add3D(cohesionDir, crowdMassDir), boid.direction),
            );
        const turnBlend = smoothstep(0.16, 0.9, turnDemand);
        const turnSeparationScale = lerp(
          1,
          PARAMS.TURN_SEPARATION_DAMPING,
          turnBlend,
        );
        const predatorSchoolHoldBlend =
          predatorSchoolHold / Math.max(predatorSchoolHold + 1, 1);
        const crowdMassPull =
          baselineDayCrowdPull +
          daytimeJoinPull * 0.62 +
          predatorSchoolHold +
          predatorLocalHoldPull +
          crowdPullBoost +
          leaderCrowdPull;
        const simplifiedCrowdMassPull =
          baselineDayCrowdPull +
          daytimeJoinPull +
          predatorSchoolHold +
          predatorLocalHoldPull;

        // Heading: align with neighbors, follow cascades, and under risk compress back toward the local crowd.

        let desired = normalize3D(
          {
            x:
              boid.direction.x * 0.42 +
              alignmentDir.x *
                env.daylight *
                lerp(
                  PARAMS.NIGHT_ALIGNMENT,
                  PARAMS.DAY_ALIGNMENT,
                  env.daylight,
                ) *
                alertAlignmentScale *
                activeAlignmentBoost *
                alertAlignmentRelease +
              activeLeaderDirection.x * activeLeaderPull +
              cohesionDir.x *
                lerp(nightCohesionWeight, dayCohesionWeight, env.daylight) *
                alertCohesionBoost *
                lerp(1, 0.58, randomPatternBlend) *
                (1 + densityCompression * 0.85) +
              cohesionDir.x *
                dayPackingPull *
                lerp(0.6, 1.9, dayCohesionBlend) +
              schoolCenterDir.x * daytimeJoinPull +
              schoolCenterDir.x * predatorDayRejoinPull +
              crowdMassDir.x * crowdMassPull +
              subgroupDir.x * subgroupInfluence +
              separation.x *
                (0.22 + densityCompression * 0.36) *
                turnSeparationScale *
                lerp(1, 0.8, predatorSchoolHoldBlend) -
              separation.x *
                nighttimeFreeRoamState *
                0.58 *
                nightDispersionControlBoost +
              cohesionDir.x * densityError * 0.34 * env.daylight +
              randomVector.x *
                stateRandomMode *
                PARAMS.RANDOM_MODE_NOISE *
                lerp(0.12, 0.54, randomPatternBlend) *
                lerp(0.74, 1.92, nightDispersionBlend) *
                nightDispersionControlBoost +
              predatorInfluence.escape.x *
                predatorInfluence.evasionIntensity *
                predatorEscapeBoost *
                lerp(0.62, 0.32, randomPatternBlend) *
                lerp(0.92, 1.46, nightDispersionBlend) *
                nightDispersionControlBoost,
            y:
              boid.direction.y * 0.38 +
              alignmentDir.y *
                env.daylight *
                lerp(0.2, 0.34, env.daylight) *
                alertAlignmentScale *
                activeAlignmentBoost *
                alertAlignmentRelease +
              activeLeaderDirection.y * activeLeaderPull * 0.22 +
              cohesionDir.y *
                lerp(
                  0.12 * nightCohesionWeight,
                  0.22 * dayCohesionWeight,
                  env.daylight,
                ) *
                alertCohesionBoost *
                lerp(1, 0.62, randomPatternBlend) *
                (1 + densityCompression * 0.85) +
              cohesionDir.y *
                dayPackingPull *
                lerp(0.1, 0.38, dayCohesionBlend) +
              schoolCenterDir.y * daytimeJoinPull * 0.18 +
              schoolCenterDir.y * predatorDayRejoinPull * 0.22 +
              crowdMassDir.y * crowdMassPull * 0.92 +
              verticalForce * lerp(0.24, 0.52, env.night) +
              Math.sin(now * 0.9 + boid.swayPhase) *
                lerp(0.0006, 0.15, env.night) +
              separation.y *
                (0.2 + densityCompression * 0.24) *
                turnSeparationScale *
                lerp(1, 0.82, predatorSchoolHoldBlend) -
              separation.y *
                nighttimeFreeRoamState *
                0.4 *
                nightDispersionControlBoost +
              cohesionDir.y * densityError * 0.22 * env.daylight +
              randomVector.y *
                stateRandomMode *
                PARAMS.RANDOM_MODE_NOISE *
                lerp(0.08, 0.38, randomPatternBlend) *
                lerp(0.72, 1.68, nightDispersionBlend) *
                nightDispersionControlBoost +
              predatorInfluence.escape.y *
                predatorInfluence.evasionIntensity *
                predatorEscapeBoost *
                lerp(0.52, 0.24, randomPatternBlend) *
                lerp(0.9, 1.32, nightDispersionBlend) *
                nightDispersionControlBoost,
            z:
              boid.direction.z * 0.42 +
              alignmentDir.z *
                env.daylight *
                lerp(
                  PARAMS.NIGHT_ALIGNMENT,
                  PARAMS.DAY_ALIGNMENT,
                  env.daylight,
                ) *
                alertAlignmentScale *
                activeAlignmentBoost *
                alertAlignmentRelease +
              activeLeaderDirection.z * activeLeaderPull +
              cohesionDir.z *
                lerp(nightCohesionWeight, dayCohesionWeight, env.daylight) *
                alertCohesionBoost *
                lerp(1, 0.58, randomPatternBlend) *
                (1 + densityCompression * 0.85) +
              cohesionDir.z *
                dayPackingPull *
                lerp(0.6, 1.9, dayCohesionBlend) +
              schoolCenterDir.z * daytimeJoinPull +
              schoolCenterDir.z * predatorDayRejoinPull +
              crowdMassDir.z * crowdMassPull +
              subgroupDir.z * subgroupInfluence +
              separation.z *
                (0.22 + densityCompression * 0.36) *
                turnSeparationScale *
                lerp(1, 0.8, predatorSchoolHoldBlend) -
              separation.z *
                nighttimeFreeRoamState *
                0.58 *
                nightDispersionControlBoost +
              cohesionDir.z * densityError * 0.34 * env.daylight +
              randomVector.z *
                stateRandomMode *
                PARAMS.RANDOM_MODE_NOISE *
                lerp(0.12, 0.54, randomPatternBlend) *
                lerp(0.74, 1.92, nightDispersionBlend) *
                nightDispersionControlBoost +
              predatorInfluence.escape.z *
                predatorInfluence.evasionIntensity *
                predatorEscapeBoost *
                lerp(0.58, 0.3, randomPatternBlend) *
                lerp(0.92, 1.46, nightDispersionBlend) *
                nightDispersionControlBoost,
          },
          boid.direction,
        );

        const daytimeSimplificationBlend =
          env.daylight *
          lerp(0.64, 0.94, daytimeSchoolingBlend) *
          lerp(0.28, 1, packingNeed) *
          lerp(1, 0.72, predatorLocalEvasionState) *
          lerp(1, 0.66, lineCollapseRisk);
        const simplifiedDayDesired = normalize3D(
          {
            x:
              boid.direction.x * 0.24 +
              alignmentDir.x *
                0.34 *
                alertAlignmentScale *
                activeAlignmentBoost *
                alertAlignmentRelease +
              activeLeaderDirection.x * activeLeaderPull +
              referenceDir.x * referenceAlignmentPull +
              referenceCohesionDir.x * referenceJoinPull +
              crowdMassDir.x *
                (simplifiedCrowdMassPull + crowdPullBoost * 0.4) +
              separation.x *
                (0.28 + densityCompression * 0.44) *
                turnSeparationScale +
              cohesionDir.x * densityError * 0.18,
            y:
              boid.direction.y * 0.22 +
              alignmentDir.y *
                0.14 *
                alertAlignmentScale *
                activeAlignmentBoost *
                alertAlignmentRelease +
              activeLeaderDirection.y * activeLeaderPull * 0.18 +
              referenceDir.y * referenceAlignmentPull * 0.18 +
              referenceCohesionDir.y * referenceJoinPull * 0.14 +
              crowdMassDir.y *
                (simplifiedCrowdMassPull + crowdPullBoost * 0.28) *
                0.36 +
              separation.y *
                (0.22 + densityCompression * 0.28) *
                turnSeparationScale +
              verticalForce * 0.16 +
              cohesionDir.y * densityError * 0.1,
            z:
              boid.direction.z * 0.24 +
              alignmentDir.z *
                0.34 *
                alertAlignmentScale *
                activeAlignmentBoost *
                alertAlignmentRelease +
              activeLeaderDirection.z * activeLeaderPull +
              referenceDir.z * referenceAlignmentPull +
              referenceCohesionDir.z * referenceJoinPull +
              crowdMassDir.z *
                (simplifiedCrowdMassPull + crowdPullBoost * 0.4) +
              separation.z *
                (0.28 + densityCompression * 0.44) *
                turnSeparationScale +
              cohesionDir.z * densityError * 0.18,
          },
          desired,
        );
        desired = normalize3D(
          {
            x: lerp(
              desired.x,
              simplifiedDayDesired.x,
              daytimeSimplificationBlend,
            ),
            y: lerp(
              desired.y,
              simplifiedDayDesired.y,
              daytimeSimplificationBlend,
            ),
            z: lerp(
              desired.z,
              simplifiedDayDesired.z,
              daytimeSimplificationBlend,
            ),
          },
          desired,
        );

        const hardAvoidState = smoothstep(
          0.22,
          0.72,
          predatorLocalEvasionState,
        );
        if (hardAvoidState > 0) {
          desired = normalize3D(
            {
              x: lerp(
                desired.x,
                predatorInfluence.escape.x,
                hardAvoidState * 0.82,
              ),
              y: lerp(
                desired.y,
                predatorInfluence.escape.y,
                hardAvoidState * 0.82,
              ),
              z: lerp(
                desired.z,
                predatorInfluence.escape.z,
                hardAvoidState * 0.82,
              ),
            },
            predatorInfluence.escape,
          );
        }

        desired = normalize3D(add3D(desired, edgeAvoidance.force), desired);

        if (boid.turnIntent && now >= boid.turnIntent.startedAt) {
          const intentAge = now - boid.turnIntent.startedAt;
          const intentStrength =
            clamp(1 - intentAge / 0.9, 0, 1) * boid.turnIntent.strength;
          desired = normalize3D(
            {
              x: desired.x + boid.turnIntent.direction.x * intentStrength,
              y:
                desired.y + boid.turnIntent.direction.y * intentStrength * 0.38,
              z: desired.z + boid.turnIntent.direction.z * intentStrength,
            },
            desired,
          );
          boid.flash = Math.max(boid.flash, 0.32 * intentStrength);

          if (intentAge > 0.9) {
            boid.turnIntent = null;
          }
        }

        // Speed: sustained cruise in body-length units, faster when isolated, and burst during avalanche turns.
        const isolationFactor =
          1 -
          smoothstep(
            PARAMS.SMALL_GROUP_NEIGHBOR_COUNT,
            PARAMS.STABLE_GROUP_NEIGHBOR_COUNT,
            crowdCount,
          );
        const speedCap = lerp(
          PARAMS.MAX_SPEED,
          PARAMS.BURST_SPEED,
          clamp(
            isolationFactor * 0.82 + predatorInfluence.evasionIntensity * 0.44,
            0,
            1,
          ),
        );
        const targetSpeed = clamp(
          liveControls.BASE_SPEED * boid.cruiseBias +
            isolationFactor *
              PARAMS.ISOLATION_SPEED_GAIN *
              lerp(1, 0.42, predatorSchoolHoldBlend) +
            predatorInfluence.evasionIntensity * PARAMS.PREDATOR_SPEED_GAIN +
            env.night * 6,
          liveControls.BASE_SPEED * 0.82,
          speedCap,
        );
        const leaderCruiseFloor =
          boid.isLeader && env.daylight > 0.5
            ? Math.min(
                speedCap,
                Math.max(
                  liveControls.BASE_SPEED * boid.cruiseBias * 0.96,
                  length3D(boid.velocity) * 0.94,
                ),
              )
            : 0;
        const edgeSpeedScale = lerp(
          1,
          1 - PARAMS.EDGE_SPEED_DAMPING,
          edgeAvoidance.pressure,
        );
        const burstBoost = boid.turnIntent ? boid.turnIntent.strength * 34 : 0;
        const speedTarget = clamp(
          Math.max(
            targetSpeed * edgeSpeedScale + burstBoost,
            leaderCruiseFloor,
            length3D(boid.velocity) *
              lerp(0.84, PARAMS.TURN_SPEED_PRESERVATION, turnBlend),
          ),
          liveControls.BASE_SPEED * 0.82,
          speedCap,
        );
        const maxTurnAngle =
          PARAMS.MAX_TURN_RATE *
          boid.turnRateBias *
          dt *
          (1 +
            edgeAvoidance.pressure * 5.2 +
            predatorInfluence.evasionIntensity * 1.4 +
            hardAvoidState * PARAMS.PREDATOR_HARD_AVOID_TURN_BOOST);
        boid.direction = rotateTowards(boid.direction, desired, maxTurnAngle);

        const desiredVelocity = scale3D(boid.direction, speedTarget);
        boid.velocity.x = lerp(
          boid.velocity.x,
          desiredVelocity.x,
          lerp(0.14, 0.22, turnBlend) * boid.reactionOffset,
        );
        boid.velocity.y = lerp(
          boid.velocity.y,
          desiredVelocity.y,
          lerp(0.12, 0.18, turnBlend) * boid.reactionOffset,
        );
        boid.velocity.z = lerp(
          boid.velocity.z,
          desiredVelocity.z,
          lerp(0.14, 0.22, turnBlend) * boid.reactionOffset,
        );
        if (hardAvoidState > 0) {
          const towardPredatorSpeed = dot3D(
            boid.velocity,
            scale3D(predatorInfluence.escape, -1),
          );

          if (towardPredatorSpeed > 0) {
            boid.velocity = add3D(
              boid.velocity,
              scale3D(
                predatorInfluence.escape,
                towardPredatorSpeed * hardAvoidState,
              ),
            );
          }
        }
        if (predatorLocalHoldState > 0.01) {
          const outwardDir = normalize3D(
            subtract3D(boid.position, crowdMassCenter),
            scale3D(crowdMassDir, -1),
          );
          const outwardSpeed = dot3D(boid.velocity, outwardDir);
          const outwardContainmentState = Math.max(
            predatorLocalHoldState,
            postEvasionRecoveryState * 0.82,
          );
          const allowedOutwardSpeed =
            liveControls.BASE_SPEED *
            lerp(0.18, 0.62, predatorLocalEvasionState) *
            lerp(0.34, 0.12, outwardContainmentState);

          if (outwardSpeed > allowedOutwardSpeed) {
            const dampedOutwardSpeed =
              (outwardSpeed - allowedOutwardSpeed) *
              lerp(0.42, 0.78, outwardContainmentState);
            boid.velocity = add3D(
              boid.velocity,
              scale3D(outwardDir, -dampedOutwardSpeed),
            );
          }
        }
        boid.velocity = scale3D(boid.velocity, PARAMS.DRAG);

        const nextSpeed = length3D(boid.velocity);
        if (nextSpeed < liveControls.BASE_SPEED * 0.6) {
          boid.velocity = scale3D(
            normalize3D(boid.velocity, boid.direction),
            liveControls.BASE_SPEED * 0.6,
          );
        }

        if (length3D(boid.velocity) > PARAMS.BURST_SPEED) {
          boid.velocity = scale3D(
            normalize3D(boid.velocity, boid.direction),
            PARAMS.BURST_SPEED,
          );
        }

        const nextPosition = add3D(boid.position, scale3D(boid.velocity, dt));
        boid.position = nextPosition;
        const projectedAfterMove = getProjectedPoint(
          boid.position,
          viewportWidth,
          viewportHeight,
        );
        const emergencyOverflow =
          projectedAfterMove.x < -PARAMS.EDGE_RETURN_GRACE ||
          projectedAfterMove.x > viewportWidth + PARAMS.EDGE_RETURN_GRACE ||
          projectedAfterMove.y < -PARAMS.EDGE_RETURN_GRACE ||
          projectedAfterMove.y > viewportHeight + PARAMS.EDGE_RETURN_GRACE ||
          boid.position.z < getVisibleDepthMin() - PARAMS.EDGE_RETURN_GRACE ||
          boid.position.z > getVisibleDepthMax() + PARAMS.EDGE_RETURN_GRACE;

        if (emergencyOverflow) {
          keepBoidVisible(boid, viewportWidth, viewportHeight);

          const clampCorrection = subtract3D(boid.position, nextPosition);
          if (length3D(clampCorrection) > 1e-3) {
            const preservedSpeed = length3D(boid.velocity);
            boid.velocity = scale3D(
              normalize3D(
                add3D(
                  boid.velocity,
                  scale3D(clampCorrection, PARAMS.EDGE_CLAMP_REDIRECT),
                ),
                boid.direction,
              ),
              preservedSpeed,
            );
          }
        }

        boid.direction = normalize3D(boid.velocity, boid.direction);
        boid.recentTurnAngle = angleBetween3D(
          previousDirection,
          boid.direction,
        );
        boid.previousDirection = boid.direction;
        boid.poseScale = lerp(
          boid.poseScale,
          0.35 + Math.abs(sway) * 0.65,
          0.08,
        );
        updateSpriteFrame(boid, viewportWidth, viewportHeight);
      });

      drawBoids(
        gl,
        renderer,
        viewportWidth,
        viewportHeight,
        window.devicePixelRatio || 1,
        boids,
      );

      if (!isPaused) {
        animationFrame = window.requestAnimationFrame(step);
      }
    };

    loadTexture(gl, sardineSpriteSheetUrl)
      .then((texture) => {
        if (disposed) {
          gl.deleteTexture(texture);
          return;
        }

        renderer.texture = texture;
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerleave", clearPointer);
        window.addEventListener("blur", clearPointer);
        animationFrame = window.requestAnimationFrame(step);
      })
      .catch(() => {
        if (!disposed) {
          onGpuErrorChange?.("정어리 스프라이트시트를 불러오지 못했습니다.");
        }
      });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", clearPointer);
      window.removeEventListener("blur", clearPointer);
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
        background:
          "radial-gradient(circle at 50% 18%, rgba(150, 204, 228, 0.12), rgba(13, 26, 38, 0.02) 42%, rgba(5, 10, 18, 0) 72%)",
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

App.ui = SARDINE_UI;
App.sanitizeControlState = sanitizeControlState;

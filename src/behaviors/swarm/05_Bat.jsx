import React from "react";
import { getThemeBackgroundRgb } from "../../utils/theme";

const BOID_COUNT = 1000;
const NEIGHBOR_COUNT = 7;
const METERS_TO_PIXELS = 42;
const HARD_CORE = 0.39 * METERS_TO_PIXELS;
const TARGET_SPEED_MIN = 4.2 * METERS_TO_PIXELS;
const TARGET_SPEED_MAX = 7.2 * METERS_TO_PIXELS;
const REACTION_MEAN = 0.076;
const REACTION_STD = 0.01;
const SIGNAL_SPEED = 30 * METERS_TO_PIXELS;
const TURN_RADIUS = 4.2 * METERS_TO_PIXELS;
const MAX_HISTORY_AGE = 0.24;
const MAX_DT = 0.033;
const SCREEN_MARGIN = 64;
const EDGE_AVOID_ZONE = 240;
const VISIBLE_DEPTH_MIN = -340;
const VISIBLE_DEPTH_MAX = 360;
const TOPOLOGY_CELL_SIZE = 96;
const MAX_GRID_SEARCH_RADIUS = 6;

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

const projectBoid = (boid, width, height) => {
  const cameraX = boid.position.x * 0.9 + boid.position.z * 0.28;
  const cameraY = boid.position.y + boid.position.z * 0.1;
  const perspective = 0.92 + (boid.position.z + 240) / 1400;

  return {
    x: width * 0.5 + cameraX * perspective,
    y: height * 0.5 + cameraY * perspective,
    scale: perspective,
  };
};

const getVisibleAvoidance = (boid, width, height) => {
  const projected = projectBoid(boid, width, height);
  const leftPush = clamp(
    (SCREEN_MARGIN + EDGE_AVOID_ZONE - projected.x) / EDGE_AVOID_ZONE,
    0,
    1,
  );
  const rightPush = clamp(
    (projected.x - (width - SCREEN_MARGIN - EDGE_AVOID_ZONE)) / EDGE_AVOID_ZONE,
    0,
    1,
  );
  const topPush = clamp(
    (SCREEN_MARGIN + EDGE_AVOID_ZONE - projected.y) / EDGE_AVOID_ZONE,
    0,
    1,
  );
  const bottomPush = clamp(
    (projected.y - (height - SCREEN_MARGIN - EDGE_AVOID_ZONE)) /
      EDGE_AVOID_ZONE,
    0,
    1,
  );
  const depthPushNear = clamp(
    (VISIBLE_DEPTH_MIN - boid.position.z) / 120,
    0,
    1,
  );
  const depthPushFar = clamp((boid.position.z - VISIBLE_DEPTH_MAX) / 120, 0, 1);

  return {
    x: (leftPush - rightPush) * 2.15,
    y: (topPush - bottomPush) * 1.7,
    z: depthPushNear * 1.1 - depthPushFar * 1.1,
    bankBias: (leftPush - rightPush) * 0.6,
  };
};

const keepBoidVisible = (boid, width, height, margin = SCREEN_MARGIN) => {
  boid.position.z = clamp(
    boid.position.z,
    VISIBLE_DEPTH_MIN,
    VISIBLE_DEPTH_MAX,
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

const BAT_VERTEX_SHADER = `
attribute vec2 aPosition;
attribute float aSize;
attribute float aAngle;
attribute float aBank;
attribute float aGlow;
attribute vec4 aColor;

uniform vec2 uResolution;
uniform float uPixelRatio;

varying vec4 vColor;
varying float vAngle;
varying float vBank;
varying float vGlow;

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
}
`;

const BAT_FRAGMENT_SHADER = `
precision mediump float;

varying vec4 vColor;
varying float vAngle;
varying float vBank;
varying float vGlow;

mat2 rotate2d(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  vec2 rotated = rotate2d(vAngle) * uv;
  float bankStretch = 1.0 + abs(vBank) * 0.32;
  float wingShape = abs(rotated.y) + max(0.0, rotated.x + 0.12) * (1.02 + bankStretch * 0.28);
  float bodyShape = abs(rotated.y) * 1.45 + abs(rotated.x - 0.02) * 0.72;
  float tailShape = abs(rotated.y) * 1.18 + max(0.0, -rotated.x - 0.18) * 1.85;
  float beakShape = abs(rotated.y) * 2.2 + abs(rotated.x - 0.48) * 1.4;

  float wings = 1.0 - smoothstep(0.32, 0.42, wingShape);
  float body = 1.0 - smoothstep(0.22, 0.3, bodyShape);
  float tail = 1.0 - smoothstep(0.16, 0.22, tailShape);
  float beak = 1.0 - smoothstep(0.09, 0.13, beakShape);
  float bird = max(wings * 0.98, max(body, max(tail * 0.8, beak * 0.78)));
  float edge = smoothstep(0.46, 0.2, abs(rotated.y) + abs(rotated.x) * 0.38);
  float glow = (1.0 - smoothstep(0.16, 0.82, length(uv))) * vGlow;
  float alpha = max(bird * vColor.a * edge, glow * 0.42);

  if (alpha < 0.02) {
    discard;
  }

  vec3 shadowTone = vec3(0.16, 0.19, 0.24);
  vec3 glowColor = mix(vColor.rgb, vec3(0.88, 0.43, 0.29), 0.58);
  vec3 color = mix(shadowTone, vColor.rgb, clamp(bird + 0.12, 0.0, 1.0));
  color += glowColor * glow * 0.34;
  gl_FragColor = vec4(color, alpha);
}
`;

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
  const program = createProgram(gl, BAT_VERTEX_SHADER, BAT_FRAGMENT_SHADER);
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
      color: gl.getAttribLocation(program, "aColor"),
    },
    uniforms: {
      resolution: gl.getUniformLocation(program, "uResolution"),
      pixelRatio: gl.getUniformLocation(program, "uPixelRatio"),
    },
    buffers: {
      position: gl.createBuffer(),
      size: gl.createBuffer(),
      angle: gl.createBuffer(),
      bank: gl.createBuffer(),
      glow: gl.createBuffer(),
      color: gl.createBuffer(),
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
};

const drawBoidsWithWebGL = (gl, renderer, width, height, pixelRatio, boids) => {
  const renderBoids = [...boids].sort(
    (left, right) => left.position.z - right.position.z,
  );
  const positions = new Float32Array(renderBoids.length * 2);
  const sizes = new Float32Array(renderBoids.length);
  const angles = new Float32Array(renderBoids.length);
  const banks = new Float32Array(renderBoids.length);
  const glows = new Float32Array(renderBoids.length);
  const colors = new Float32Array(renderBoids.length * 4);

  renderBoids.forEach((boid, index) => {
    const projected = projectBoid(boid, width, height);
    const headingX = boid.direction.x * 0.9 + boid.direction.z * 0.28;
    const headingY = boid.direction.y + boid.direction.z * 0.1;
    const agitationGlow = boid.agitation ? boid.agitation.amplitude * 0.22 : 0;
    const base = index * 2;
    const colorBase = index * 4;

    positions[base] = projected.x;
    positions[base + 1] = projected.y;
    sizes[index] = 11.5 * projected.scale + Math.abs(boid.bank) * 1.5;
    angles[index] = Math.atan2(headingY, headingX);
    banks[index] = boid.bank;
    glows[index] = agitationGlow;
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
  const [backgroundRed, backgroundGreen, backgroundBlue] =
    getThemeBackgroundRgb();
  gl.clearColor(
    backgroundRed / 255,
    backgroundGreen / 255,
    backgroundBlue / 255,
    1,
  );
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(renderer.program);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.uniform2f(renderer.uniforms.resolution, width, height);
  gl.uniform1f(renderer.uniforms.pixelRatio, pixelRatio);

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
    renderer.buffers.color,
    renderer.attributes.color,
    4,
    colors,
  );

  gl.drawArrays(gl.POINTS, 0, renderBoids.length);
};

const getGridCell = (position) => ({
  x: Math.floor(position.x / TOPOLOGY_CELL_SIZE),
  y: Math.floor(position.y / TOPOLOGY_CELL_SIZE),
  z: Math.floor(position.z / TOPOLOGY_CELL_SIZE),
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
  const minX = (origin.x - radius) * TOPOLOGY_CELL_SIZE;
  const maxX = (origin.x + radius + 1) * TOPOLOGY_CELL_SIZE;
  const minY = (origin.y - radius) * TOPOLOGY_CELL_SIZE;
  const maxY = (origin.y + radius + 1) * TOPOLOGY_CELL_SIZE;
  const minZ = (origin.z - radius) * TOPOLOGY_CELL_SIZE;
  const maxZ = (origin.z + radius + 1) * TOPOLOGY_CELL_SIZE;

  return Math.min(
    position.x - minX,
    maxX - position.x,
    position.y - minY,
    maxY - position.y,
    position.z - minZ,
    maxZ - position.z,
  );
};

const collectNeighborStates = (boidIndex, boid, delayedStates, spatialGrid) => {
  const origin = getGridCell(boid.position);
  const candidateIndices = [];

  for (let radius = 0; radius <= MAX_GRID_SEARCH_RADIUS; radius += 1) {
    appendGridShell(spatialGrid, origin, radius, candidateIndices);

    const neighborStates = candidateIndices
      .filter((candidateIndex) => candidateIndex !== boidIndex)
      .map((candidateIndex) => {
        const state = delayedStates[candidateIndex];
        const offset = subtract3D(state.position, boid.position);

        return {
          boid: candidateIndex,
          state,
          offset,
          distance: length3D(offset),
        };
      })
      .sort((left, right) => left.distance - right.distance);

    if (neighborStates.length < NEIGHBOR_COUNT) {
      continue;
    }

    if (
      neighborStates[NEIGHBOR_COUNT - 1].distance <=
      getOutsideCubeDistance(boid.position, origin, radius)
    ) {
      return neighborStates.slice(0, NEIGHBOR_COUNT);
    }
  }

  return delayedStates
    .map((state, candidateIndex) => {
      if (candidateIndex === boidIndex) {
        return null;
      }

      const offset = subtract3D(state.position, boid.position);
      return {
        boid: candidateIndex,
        state,
        offset,
        distance: length3D(offset),
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.distance - right.distance)
    .slice(0, NEIGHBOR_COUNT);
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
    speed: randomBetween(TARGET_SPEED_MIN, TARGET_SPEED_MAX),
    reactionDelay: clamp(randomNormal(REACTION_MEAN, REACTION_STD), 0.05, 0.11),
    bank: 0,
    history: [],
    turnSignal: null,
    agitation: null,
    lastWaveTime: -Infinity,
  };
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

const triggerAgitation = (boids, width, height, pointer, now) => {
  const initiators = [...boids]
    .map((boid) => {
      const screen = projectBoid(boid, width, height);
      const dx = screen.x - pointer.x;
      const dy = screen.y - pointer.y;

      return {
        boid,
        score:
          Math.hypot(dx, dy) +
          Math.abs(boid.position.z) * 0.12 -
          Math.abs(boid.position.x) * 0.1,
      };
    })
    .sort((left, right) => left.score - right.score)
    .slice(0, 4);

  initiators.forEach(({ boid }, index) => {
    boid.agitation = {
      amplitude: 0.95 - index * 0.12,
      direction: index % 2 === 0 ? 1 : -1,
      startedAt: now,
      phase: Math.random() * Math.PI * 2,
      hops: 0,
    };
    boid.lastWaveTime = now;
  });
};

export function App() {
  const title = "Bat swarm";
  const detailLines = [
    "nearest 7 neighbors • closest-1 avoidance • delayed reaction",
    "edge-initiated turning • equal-radius steering • agitation wave",
    "move the cursor near the swarm edge to trigger an avoidance wave",
  ];
  const canvasRef = React.useRef(null);
  const pointerRef = React.useRef({
    x: 0,
    y: 0,
    active: false,
    lastTrigger: 0,
  });
  const [gpuError, setGpuError] = React.useState("");

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const gl =
      canvas.getContext("webgl", { alpha: true, antialias: true }) ||
      canvas.getContext("experimental-webgl", { alpha: true, antialias: true });
    if (!gl) {
      setGpuError("WebGL을 사용할 수 없는 환경입니다.");
      return undefined;
    }

    const renderer = initializeRenderer(gl);
    if (!renderer) {
      setGpuError("GPU 렌더러 초기화에 실패했습니다.");
      return undefined;
    }

    setGpuError("");

    let animationFrame = 0;
    let lastTimestamp = 0;
    let nextTurnTime = 0;
    const flockCenter = { x: 0, y: 0, z: 0 };
    const flockDimensions = { x: 210, y: 75, z: 420 };
    const boids = Array.from({ length: BOID_COUNT }, (_, index) =>
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

    resizeCanvas();

    const step = (timestamp) => {
      const now = timestamp * 0.001;
      const dt = clamp(
        lastTimestamp ? now - lastTimestamp : 0.016,
        0.008,
        MAX_DT,
      );
      lastTimestamp = now;

      if (!nextTurnTime) {
        nextTurnTime = now + randomBetween(3.4, 5.6);
      }

      if (now >= nextTurnTime) {
        spawnTurnSignal(boids, flockCenter, now);
        nextTurnTime = now + randomBetween(4.5, 7.5);
      }

      if (
        pointerRef.current.active &&
        now - pointerRef.current.lastTrigger > 1.2
      ) {
        const closestEdge = Math.min(
          ...boids.map((boid) => {
            const screen = projectBoid(
              boid,
              window.innerWidth,
              window.innerHeight,
            );
            return Math.hypot(
              screen.x - pointerRef.current.x,
              screen.y - pointerRef.current.y,
            );
          }),
        );

        if (closestEdge < 120) {
          triggerAgitation(
            boids,
            window.innerWidth,
            window.innerHeight,
            pointerRef.current,
            now,
          );
          pointerRef.current = {
            ...pointerRef.current,
            lastTrigger: now,
          };
        }
      }

      const centerOfMass = boids.reduce(
        (sum, boid) => add3D(sum, boid.position),
        { x: 0, y: 0, z: 0 },
      );

      flockCenter.x = centerOfMass.x / boids.length;
      flockCenter.y = centerOfMass.y / boids.length;
      flockCenter.z = centerOfMass.z / boids.length;

      const delayedStates = boids.map((boid) => getDelayedState(boid, now));
      const spatialGrid = buildSpatialGrid(delayedStates);

      boids.forEach((boid, boidIndex) => {
        const neighbors = collectNeighborStates(
          boidIndex,
          boid,
          delayedStates,
          spatialGrid,
        );
        const nearest = neighbors[0];

        if (nearest) {
          const propagationDelay = nearest.distance / SIGNAL_SPEED;
          const sourceWave = nearest.state.agitation;

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
              now - neighbor.distance / SIGNAL_SPEED
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

        if (nearest) {
          const awayFromNearest = normalize3D(
            scale3D(nearest.offset, -1),
            boid.direction,
          );
          const separationStrength = clamp(
            (HARD_CORE * 1.3 - nearest.distance) / (HARD_CORE * 1.3),
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

        const maxTurnAngle = (boid.speed / TURN_RADIUS) * dt;
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
              y: boid.direction.y - Math.abs(boid.bank) * 0.045,
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
          now - boid.history[0].time > MAX_HISTORY_AGE
        ) {
          boid.history.shift();
        }

        if (boid.turnSignal && now - boid.turnSignal.startedAt >= 1.8) {
          boid.turnSignal = null;
        }

        if (boid.agitation && now - boid.agitation.startedAt >= 1.35) {
          boid.agitation = null;
        }
      });

      drawBoidsWithWebGL(
        gl,
        renderer,
        window.innerWidth,
        window.innerHeight,
        window.devicePixelRatio || 1,
        boids,
      );

      animationFrame = window.requestAnimationFrame(step);
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);
    animationFrame = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      destroyRenderer(gl, renderer);
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "var(--theme-bg-hex)",
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
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "64%",
          width: "500px",
          height: "136px",
          transform: "translateX(-50%)",
          borderRadius: "50%",
          background: "var(--theme-surface-tint)",
          pointerEvents: "none",
          filter: "blur(1px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "0 auto auto 0",
          top: "24px",
          left: "24px",
          padding: "18px 20px",
          borderRadius: "18px",
          border: "1px solid var(--theme-border)",
          background: "var(--theme-panel)",
          boxShadow: "var(--theme-shadow)",
          backdropFilter: "blur(18px)",
          color: "var(--theme-text-muted)",
          fontFamily: "Georgia, serif",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <div style={{ fontSize: "15px", fontWeight: 600 }}>{title}</div>
        {detailLines.map((line, index) => (
          <div
            key={line}
            style={{
              fontSize: "13px",
              marginTop: index === 0 ? "10px" : "4px",
            }}
          >
            {line}
          </div>
        ))}
        {gpuError ? (
          <div
            style={{
              fontSize: "13px",
              marginTop: "12px",
              color: "var(--theme-accent-strong)",
            }}
          >
            {gpuError}
          </div>
        ) : null}
      </div>
    </div>
  );
}

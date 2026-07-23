import React from "react";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { resolveAtlasFrameSize } from "../../utils/spriteAtlas";
import { resolveCanvasAtlasSprite } from "../../utils/spritePose";
import {
  applyTransparentCanvasStyle,
  clearTransparentCanvas2d,
} from "../../utils/transparentCanvas";

// 기본 상태
const ATLAS = HOME_SPRITE_ATLASES.krill;

const DIRECT_FINDING_PARAMS = {
  OPTIMAL_SPEED_PX_S: 45,
  MAX_SPEED_PX_S: 120,
  MIN_SEPARATION_PX: 42,
  PERCEPTION_RADIUS_PX: 150,
  HIGH_FOOD_SPEED_PX_S: 15,
  LOW_FOOD_SPEED_PX_S: 45,
  HIGH_FOOD_TURN_RATE_RAD_S: Math.PI * (30 / 180),
  LOW_FOOD_TURN_RATE_RAD_S: Math.PI * (5 / 180),
  DAY_DEPTH_RATIO: 0.26,
  NIGHT_DEPTH_RATIO: 0.62,
  CREPUSCULAR_COHESION_MULTIPLIER: 3,
};

const INFERRED_PARAMS = {
  TOPOLOGICAL_NEIGHBOR_COUNT: 6,
  SINKING_SPEED_PX_S: 1.5,
  PARACHUTE_EXIT_FULLNESS: 0.3,
  PARACHUTE_ENTRY_FULLNESS: 1,
  STOMACH_DIGESTION_PER_S: 0.075,
  STOMACH_FEED_RATE_PER_S: 0.22,
  PARACHUTE_DIGESTION_MULTIPLIER: 1.85,
  PARACHUTE_FEED_MULTIPLIER: 0.08,
  FEEDING_FOOD_THRESHOLD: 0.34,
  DVM_STEER_WEIGHT: 0.72,
  SEPARATION_WEIGHT: 2.8,
  ALIGNMENT_WEIGHT: 1.1,
  COHESION_WEIGHT: 1.45,
  NIGHT_COHESION_MULTIPLIER: 0.82,
  CREPUSCULAR_SEPARATION_MULTIPLIER: 0.72,
  BOUNDARY_RETURN_WEIGHT: 0.9,
  OFFSCREEN_ALLOWANCE_PX: 120,
  SCREEN_REENTRY_START_RATIO: 0.88,
  SCREEN_REENTRY_FORCE: 1.65,
  SCREEN_REENTRY_TANGENTIAL_FORCE: 0.16,
  SWIM_RESPONSE_PER_S: 2.8,
  JITTER_BLEND_PER_S: 2.2,
  FOOD_PATCH_DRIFT_PX_S: 6,
  CREPUSCULAR_WINDOW_HOURS: 1.15,
  SUNRISE_HOUR: 5,
  SUNSET_HOUR: 19,
  CIRCADIAN_HOURS_PER_REAL_SECOND: 1.7,
  FOOD_PATCH_RADIUS_PX: 110,
  FOOD_BACKGROUND_WEIGHT: 0.18,
};

const PARAMS = {
  DEFAULT_COUNT: 480,
  DEFAULT_START_HOUR: 11,
  DEFAULT_FOOD_ABUNDANCE: 68,
  DEFAULT_DENSITY_SURGE: 100,
  DEFAULT_NIGHT_COHESION: 82,
  MIN_COUNT: 180,
  MAX_COUNT: 900,
  BODY_LENGTH_MIN_PX: 9,
  BODY_LENGTH_MAX_PX: 18,
  BODY_RENDER_SCALE: 2.1,
  WORLD_MARGIN_PX: 28,
  FOOD_PATCH_COUNT: 4,
  FOOD_PATCH_WOBBLE_SCALE: 0.35,
  RENDER_FOOD_ALPHA: 0.075,
  RENDER_FOOD_COLOR: "99, 185, 124",
  TIME_STEP_MAX: 0.05,
  ...DIRECT_FINDING_PARAMS,
  ...INFERRED_PARAMS,
};

const CONTROL_FIELDS = [
  {
    key: "COUNT",
    label: "개체 수",
    min: PARAMS.MIN_COUNT,
    max: PARAMS.MAX_COUNT,
    step: 1,
    formatValue: (value) => `${Math.round(value)} 마리`,
  },
  {
    key: "START_HOUR",
    label: "시작 시각",
    min: 0,
    max: 23,
    step: 1,
    formatValue: (value) => `${Math.round(value)}시`,
  },
  {
    key: "FOOD_ABUNDANCE",
    label: "플랑크톤 농도",
    min: 0,
    max: 100,
    step: 1,
    formatValue: (value) => `${Math.round(value)} %`,
  },
  {
    key: "DENSITY_SURGE",
    label: "박명기 응집 증폭",
    min: 50,
    max: 180,
    step: 1,
    formatValue: (value) => `${Math.round(value)} %`,
  },
  {
    key: "NIGHT_COHESION",
    label: "야간 응집 유지율",
    min: 40,
    max: 120,
    step: 1,
    formatValue: (value) => `${Math.round(value)} %`,
  },
];

const DEFAULT_CONTROL_STATE = {
  COUNT: PARAMS.DEFAULT_COUNT,
  START_HOUR: PARAMS.DEFAULT_START_HOUR,
  FOOD_ABUNDANCE: PARAMS.DEFAULT_FOOD_ABUNDANCE,
  DENSITY_SURGE: PARAMS.DEFAULT_DENSITY_SURGE,
  NIGHT_COHESION: PARAMS.DEFAULT_NIGHT_COHESION,
};

// 공통 계산
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (start, end, amount) => start + (end - start) * amount;
const inverseLerp = (value, start, end) => {
  if (Math.abs(end - start) < 1e-6) {
    return 0;
  }
  return clamp((value - start) / (end - start), 0, 1);
};
const randomBetween = (min, max) => min + Math.random() * (max - min);
const magnitude = (x, y) => Math.hypot(x, y);

const normalize2D = (x, y, fallback = { x: 1, y: 0 }) => {
  const length = magnitude(x, y);
  if (length < 1e-6) {
    return { ...fallback };
  }
  return { x: x / length, y: y / length };
};

const limitVector = (x, y, maxLength) => {
  const length = magnitude(x, y);
  if (length <= maxLength || length < 1e-6) {
    return { x, y };
  }
  const scale = maxLength / length;
  return { x: x * scale, y: y * scale };
};

const wrapAngle = (angle) => {
  let next = angle;
  while (next > Math.PI) {
    next -= Math.PI * 2;
  }
  while (next < -Math.PI) {
    next += Math.PI * 2;
  }
  return next;
};

const rotateToward = (current, target, maxDelta) => {
  const delta = wrapAngle(target - current);
  if (Math.abs(delta) <= maxDelta) {
    return target;
  }
  return current + Math.sign(delta) * maxDelta;
};

const angleToVector = (angle) => ({ x: Math.cos(angle), y: Math.sin(angle) });

const exponentialBlend = (ratePerSecond, dt) =>
  1 - Math.exp(-ratePerSecond * dt);

const shortestCircularDistance = (left, right, modulus) => {
  const diff = Math.abs(left - right) % modulus;
  return Math.min(diff, modulus - diff);
};

// 캔버스 동기화
const syncCanvasSize = (canvas, ctx) => {
  const width = canvas.clientWidth || window.innerWidth;
  const height = canvas.clientHeight || window.innerHeight;
  const pixelRatio = window.devicePixelRatio || 1;
  const nextWidth = Math.max(1, Math.round(width * pixelRatio));
  const nextHeight = Math.max(1, Math.round(height * pixelRatio));

  if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
    canvas.width = nextWidth;
    canvas.height = nextHeight;
  }

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  return { width, height };
};

const resolveBehaviorConfig = (controls = DEFAULT_CONTROL_STATE) => ({
  count: clamp(
    Math.round(Number(controls.COUNT) || PARAMS.DEFAULT_COUNT),
    PARAMS.MIN_COUNT,
    PARAMS.MAX_COUNT,
  ),
  startHour: clamp(
    Number(controls.START_HOUR) || PARAMS.DEFAULT_START_HOUR,
    0,
    23,
  ),
  foodAbundance:
    clamp(
      Number(controls.FOOD_ABUNDANCE) || PARAMS.DEFAULT_FOOD_ABUNDANCE,
      0,
      100,
    ) / 100,
  densitySurgeMultiplier:
    (PARAMS.CREPUSCULAR_COHESION_MULTIPLIER *
      clamp(
        Number(controls.DENSITY_SURGE) || PARAMS.DEFAULT_DENSITY_SURGE,
        50,
        180,
      )) /
    100,
  nightCohesionMultiplier:
    clamp(
      Number(controls.NIGHT_COHESION) || PARAMS.DEFAULT_NIGHT_COHESION,
      40,
      120,
    ) / 100,
  countDensityRatio: inverseLerp(
    clamp(
      Math.round(Number(controls.COUNT) || PARAMS.DEFAULT_COUNT),
      PARAMS.MIN_COUNT,
      PARAMS.MAX_COUNT,
    ),
    PARAMS.MIN_COUNT,
    PARAMS.MAX_COUNT,
  ),
});

const createFoodField = (width, height) => {
  const centerX = width * 0.5;
  const centerY = height * 0.48;

  return Array.from({ length: PARAMS.FOOD_PATCH_COUNT }, (_, index) => {
    const angle = (index / PARAMS.FOOD_PATCH_COUNT) * Math.PI * 2;
    const orbit = Math.min(width, height) * randomBetween(0.16, 0.29);
    return {
      anchorX: centerX + Math.cos(angle) * orbit,
      anchorY: centerY + Math.sin(angle) * orbit * 0.7,
      orbitX: randomBetween(30, 65),
      orbitY: randomBetween(18, 46),
      phase: randomBetween(-Math.PI, Math.PI),
      radius: randomBetween(
        PARAMS.FOOD_PATCH_RADIUS_PX * 0.72,
        PARAMS.FOOD_PATCH_RADIUS_PX * 1.18,
      ),
      intensity: randomBetween(0.72, 1.1),
    };
  });
};

const sampleFood = (foodField, x, y, elapsedS, config) => {
  const background =
    PARAMS.FOOD_BACKGROUND_WEIGHT +
    (Math.sin(x * 0.009 + elapsedS * 0.22) * 0.5 + 0.5) * 0.12 +
    (Math.cos(y * 0.008 - elapsedS * 0.18) * 0.5 + 0.5) * 0.08;

  let food = background;

  foodField.forEach((patch, index) => {
    const wobble = elapsedS * PARAMS.FOOD_PATCH_DRIFT_PX_S * 0.1 + patch.phase;
    const patchX = patch.anchorX + Math.cos(wobble + index) * patch.orbitX;
    const patchY =
      patch.anchorY + Math.sin(wobble * 0.87 + index) * patch.orbitY;
    const dx = x - patchX;
    const dy = y - patchY;
    const radius =
      patch.radius *
      (1 + Math.sin(wobble * 0.5) * PARAMS.FOOD_PATCH_WOBBLE_SCALE * 0.12);
    const distanceSq = dx * dx + dy * dy;
    const gaussian = Math.exp(-distanceSq / (2 * radius * radius));
    food += gaussian * patch.intensity * 0.7;
  });

  return clamp(food * lerp(0.25, 1.25, config.foodAbundance), 0, 1);
};

const resolveTimeFlags = (hour) => {
  const dawnDistance = shortestCircularDistance(hour, PARAMS.SUNRISE_HOUR, 24);
  const duskDistance = shortestCircularDistance(hour, PARAMS.SUNSET_HOUR, 24);
  const isDawn = dawnDistance <= PARAMS.CREPUSCULAR_WINDOW_HOURS;
  const isDusk = duskDistance <= PARAMS.CREPUSCULAR_WINDOW_HOURS;
  const isCrepuscular = isDawn || isDusk;
  const isDay = hour >= PARAMS.SUNRISE_HOUR && hour < PARAMS.SUNSET_HOUR;

  return {
    isDay,
    isNight: !isDay,
    isDawn,
    isDusk,
    isCrepuscular,
  };
};

const resolveTargetDepthY = (height, timeFlags) => {
  const ratio = timeFlags.isDay
    ? PARAMS.DAY_DEPTH_RATIO
    : PARAMS.NIGHT_DEPTH_RATIO;
  return height * ratio;
};

// 에이전트 생성
const createAgent = (index, width, height, config) => {
  const heading = randomBetween(-Math.PI, Math.PI);
  const speed = randomBetween(
    PARAMS.OPTIMAL_SPEED_PX_S * 0.75,
    PARAMS.OPTIMAL_SPEED_PX_S * 1.05,
  );
  const direction = angleToVector(heading);
  const timeFlags = resolveTimeFlags(config.startHour);
  const targetDepth = resolveTargetDepthY(height, timeFlags);
  const spawnRadiusX = lerp(
    width * 0.34,
    width * 0.16,
    config.countDensityRatio,
  );
  const spawnRadiusY = lerp(
    height * 0.14,
    height * 0.06,
    config.countDensityRatio,
  );
  const spawnAngle = randomBetween(-Math.PI, Math.PI);
  const spawnRadius = Math.sqrt(Math.random());
  const bodyLength = randomBetween(
    PARAMS.BODY_LENGTH_MIN_PX,
    PARAMS.BODY_LENGTH_MAX_PX,
  );
  const renderWidth = bodyLength * PARAMS.BODY_RENDER_SCALE;
  const renderHeight =
    renderWidth *
    ((ATLAS.imageSize?.height || 75) /
      Math.max((ATLAS.imageSize?.width || 290) * 0.5, 1));

  return {
    id: index,
    x: clamp(
      width * 0.5 + Math.cos(spawnAngle) * spawnRadiusX * spawnRadius,
      0,
      width,
    ),
    y: clamp(
      targetDepth + Math.sin(spawnAngle) * spawnRadiusY * spawnRadius,
      0,
      height,
    ),
    vx: direction.x * speed,
    vy: direction.y * speed,
    ax: 0,
    ay: 0,
    heading,
    targetHeading: heading,
    currentSpeed: speed,
    targetSpeed: speed,
    turnNoise: randomBetween(-0.2, 0.2),
    stomachFullness: randomBetween(0.08, 0.55),
    isParachuting: false,
    isReturning: false,
    bodyLength,
    renderWidth,
    renderHeight,
    spriteProfile: "simulation",
    spriteSpace: "2d",
    spriteState: undefined,
    spriteVelocity: { x: direction.x * speed, y: direction.y * speed },
    spritePosition: null,
    previousScreenPosition: null,
    stageOffset: randomBetween(0, 1000),
    time: randomBetween(0, 1000),
  };
};

const createAgents = (count, width, height, config) =>
  Array.from({ length: count }, (_, index) =>
    createAgent(index, width, height, config),
  );

const ensureAgents = (agentsRef, config, width, height) => {
  if (agentsRef.current.length < config.count) {
    const nextAgents = [...agentsRef.current];
    const startIndex = nextAgents.length;
    for (let index = startIndex; index < config.count; index += 1) {
      nextAgents.push(createAgent(index, width, height, config));
    }
    agentsRef.current = nextAgents;
  } else if (agentsRef.current.length > config.count) {
    agentsRef.current = agentsRef.current.slice(0, config.count);
  }

  const minX = -PARAMS.OFFSCREEN_ALLOWANCE_PX;
  const maxX = width + PARAMS.OFFSCREEN_ALLOWANCE_PX;
  const minY = -PARAMS.OFFSCREEN_ALLOWANCE_PX;
  const maxY = height + PARAMS.OFFSCREEN_ALLOWANCE_PX;

  agentsRef.current.forEach((agent) => {
    agent.x = clamp(agent.x, minX, maxX);
    agent.y = clamp(agent.y, minY, maxY);
  });
};

const resolveTopologicalNeighbors = (neighbors) =>
  neighbors
    .slice()
    .sort((left, right) => left.distance - right.distance)
    .slice(0, PARAMS.TOPOLOGICAL_NEIGHBOR_COUNT);

const calculateSeparation = (neighbors, separationDistance) => {
  let forceX = 0;
  let forceY = 0;

  neighbors.forEach((neighbor) => {
    if (neighbor.distance <= 1e-6 || neighbor.distance > separationDistance) {
      return;
    }

    const closeness = 1 - neighbor.distance / separationDistance;
    const weight = (Math.exp(closeness * 2.2) - 1) * PARAMS.SEPARATION_WEIGHT;
    forceX -= (neighbor.dx / neighbor.distance) * weight;
    forceY -= (neighbor.dy / neighbor.distance) * weight;
  });

  return { x: forceX, y: forceY };
};

const calculateAlignment = (neighbors, agent) => {
  if (neighbors.length === 0) {
    return { x: 0, y: 0 };
  }

  let dirX = 0;
  let dirY = 0;

  neighbors.forEach((neighbor) => {
    const direction = normalize2D(neighbor.agent.vx, neighbor.agent.vy);
    dirX += direction.x;
    dirY += direction.y;
  });

  const averageDir = normalize2D(dirX, dirY, angleToVector(agent.heading));
  const currentDir = normalize2D(
    agent.vx,
    agent.vy,
    angleToVector(agent.heading),
  );

  return {
    x:
      (averageDir.x - currentDir.x) *
      PARAMS.ALIGNMENT_WEIGHT *
      PARAMS.OPTIMAL_SPEED_PX_S,
    y:
      (averageDir.y - currentDir.y) *
      PARAMS.ALIGNMENT_WEIGHT *
      PARAMS.OPTIMAL_SPEED_PX_S,
  };
};

const calculateDensityGradientCohesion = (neighbors, separationDistance) => {
  if (neighbors.length === 0) {
    return { x: 0, y: 0 };
  }

  let forceX = 0;
  let forceY = 0;
  const preferredDistance = separationDistance * 1.55;

  neighbors.forEach((neighbor) => {
    const directionX = neighbor.dx / neighbor.distance;
    const directionY = neighbor.dy / neighbor.distance;
    let shellWeight = 0;

    if (neighbor.distance < preferredDistance) {
      const proximity = 1 - neighbor.distance / preferredDistance;
      shellWeight = -proximity * 0.75;
    } else {
      const outerProgress = inverseLerp(
        neighbor.distance,
        preferredDistance,
        PARAMS.PERCEPTION_RADIUS_PX,
      );
      shellWeight = Math.sin((1 - outerProgress) * Math.PI * 0.9) * 0.95;
    }

    const radialWeight = 1 - neighbor.distance / PARAMS.PERCEPTION_RADIUS_PX;
    forceX += directionX * shellWeight * radialWeight;
    forceY += directionY * shellWeight * radialWeight;
  });

  return {
    x: forceX * PARAMS.COHESION_WEIGHT * PARAMS.OPTIMAL_SPEED_PX_S,
    y: forceY * PARAMS.COHESION_WEIGHT * PARAMS.OPTIMAL_SPEED_PX_S,
  };
};

const calculateDvmForce = (agent, targetDepthY, height) => {
  const normalizedOffset = (targetDepthY - agent.y) / Math.max(height, 1);
  return {
    x: 0,
    y: normalizedOffset * PARAMS.MAX_SPEED_PX_S * PARAMS.DVM_STEER_WEIGHT,
  };
};

const calculateBoundaryForce = (agent, width, height) => {
  let forceX = 0;
  let forceY = 0;

  if (agent.x < PARAMS.WORLD_MARGIN_PX) {
    forceX += 1 - agent.x / PARAMS.WORLD_MARGIN_PX;
  } else if (agent.x > width - PARAMS.WORLD_MARGIN_PX) {
    forceX -= 1 - (width - agent.x) / PARAMS.WORLD_MARGIN_PX;
  }

  if (agent.y < PARAMS.WORLD_MARGIN_PX) {
    forceY += 1 - agent.y / PARAMS.WORLD_MARGIN_PX;
  } else if (agent.y > height - PARAMS.WORLD_MARGIN_PX) {
    forceY -= 1 - (height - agent.y) / PARAMS.WORLD_MARGIN_PX;
  }

  return {
    x: forceX * PARAMS.BOUNDARY_RETURN_WEIGHT * PARAMS.OPTIMAL_SPEED_PX_S,
    y: forceY * PARAMS.BOUNDARY_RETURN_WEIGHT * PARAMS.OPTIMAL_SPEED_PX_S,
  };
};

const calculateScreenReentryForce = (agent, width, height) => {
  const minX = 0;
  const maxX = width;
  const minY = 0;
  const maxY = height;
  const insetX = width * (1 - PARAMS.SCREEN_REENTRY_START_RATIO) * 0.5;
  const insetY = height * (1 - PARAMS.SCREEN_REENTRY_START_RATIO) * 0.5;
  const safeMinX = minX + insetX;
  const safeMaxX = maxX - insetX;
  const safeMinY = minY + insetY;
  const safeMaxY = maxY - insetY;
  const outsideX = agent.x < minX || agent.x > maxX;
  const outsideY = agent.y < minY || agent.y > maxY;
  const nearEdgeX = agent.x < safeMinX || agent.x > safeMaxX;
  const nearEdgeY = agent.y < safeMinY || agent.y > safeMaxY;

  if (!outsideX && !outsideY && !nearEdgeX && !nearEdgeY) {
    return { x: 0, y: 0, active: false };
  }

  const targetX = clamp(agent.x, safeMinX, safeMaxX);
  const targetY = clamp(agent.y, safeMinY, safeMaxY);
  const toInterior = normalize2D(targetX - agent.x, targetY - agent.y, {
    x: 0,
    y: 1,
  });
  const tangent = { x: -toInterior.y, y: toInterior.x };
  const tangentSign = agent.id % 2 === 0 ? 1 : -1;
  const outsideDistance = Math.hypot(targetX - agent.x, targetY - agent.y);
  const edgeDepth = Math.max(
    safeMinX - agent.x,
    agent.x - safeMaxX,
    safeMinY - agent.y,
    agent.y - safeMaxY,
    0,
  );
  const outsideRatio = clamp(
    Math.max(edgeDepth, outsideDistance) /
      Math.max(PARAMS.OFFSCREEN_ALLOWANCE_PX + Math.max(insetX, insetY), 1),
    0.18,
    1,
  );

  return {
    x:
      toInterior.x *
        PARAMS.MAX_SPEED_PX_S *
        PARAMS.SCREEN_REENTRY_FORCE *
        outsideRatio +
      tangent.x *
        PARAMS.OPTIMAL_SPEED_PX_S *
        PARAMS.SCREEN_REENTRY_TANGENTIAL_FORCE *
        tangentSign,
    y:
      toInterior.y *
        PARAMS.MAX_SPEED_PX_S *
        PARAMS.SCREEN_REENTRY_FORCE *
        outsideRatio +
      tangent.y *
        PARAMS.OPTIMAL_SPEED_PX_S *
        PARAMS.SCREEN_REENTRY_TANGENTIAL_FORCE *
        tangentSign,
    active: true,
  };
};

const updateStomach = (agent, food, dt) => {
  const effectiveFood = Math.max(0, food - PARAMS.FEEDING_FOOD_THRESHOLD);
  const digestion =
    PARAMS.STOMACH_DIGESTION_PER_S *
    (agent.isParachuting ? PARAMS.PARACHUTE_DIGESTION_MULTIPLIER : 1) *
    dt;
  const feeding =
    effectiveFood *
    PARAMS.STOMACH_FEED_RATE_PER_S *
    (agent.isParachuting ? PARAMS.PARACHUTE_FEED_MULTIPLIER : 1) *
    dt;
  agent.stomachFullness = clamp(
    agent.stomachFullness + feeding - digestion,
    0,
    1.05,
  );
};

const updateParachutingState = (agent) => {
  if (agent.stomachFullness >= PARAMS.PARACHUTE_ENTRY_FULLNESS) {
    agent.isParachuting = true;
  } else if (agent.stomachFullness < PARAMS.PARACHUTE_EXIT_FULLNESS) {
    agent.isParachuting = false;
  }
};

const gatherNeighbors = (agents, agentIndex) => {
  const agent = agents[agentIndex];
  const neighbors = [];

  for (let index = 0; index < agents.length; index += 1) {
    if (index === agentIndex) {
      continue;
    }

    const other = agents[index];
    const dx = other.x - agent.x;
    const dy = other.y - agent.y;
    const distance = magnitude(dx, dy);

    if (distance <= PARAMS.PERCEPTION_RADIUS_PX) {
      neighbors.push({ agent: other, dx, dy, distance });
    }
  }

  return neighbors;
};

const advanceAgent = (agent, index, agents, context) => {
  const { dt, width, height, elapsedS, simHour, foodField, config } = context;
  const timeFlags = resolveTimeFlags(simHour);
  const food = sampleFood(foodField, agent.x, agent.y, elapsedS, config);
  updateStomach(agent, food, dt);
  updateParachutingState(agent);

  const targetDepthY = resolveTargetDepthY(height, timeFlags);
  const reentry = calculateScreenReentryForce(agent, width, height);
  agent.isReturning = reentry.active;
  const densitySeparationScale = lerp(1, 0.68, config.countDensityRatio);
  const densityCohesionScale = lerp(1, 1.95, config.countDensityRatio);
  const separationDistance =
    PARAMS.MIN_SEPARATION_PX *
    densitySeparationScale *
    (timeFlags.isCrepuscular ? PARAMS.CREPUSCULAR_SEPARATION_MULTIPLIER : 1);
  const cohesionMultiplier =
    densityCohesionScale *
    (timeFlags.isNight ? config.nightCohesionMultiplier : 1) *
    (timeFlags.isCrepuscular ? config.densitySurgeMultiplier : 1);
  const neighbors = gatherNeighbors(agents, index);
  const topologicalNeighbors = resolveTopologicalNeighbors(neighbors);

  agent.ax = 0;
  agent.ay = 0;

  if (agent.isParachuting) {
    agent.targetSpeed = 0;
    const sinkBlend = exponentialBlend(PARAMS.SWIM_RESPONSE_PER_S * 0.85, dt);
    agent.ax = lerp(agent.ax, -agent.vx, sinkBlend);
    agent.ay = lerp(agent.ay, PARAMS.SINKING_SPEED_PX_S - agent.vy, sinkBlend);
    const driftHeading = Math.sin(agent.time * 0.7 + agent.id * 0.43) * 0.22;
    const driftVelocityX =
      Math.cos(agent.heading + driftHeading) * PARAMS.SINKING_SPEED_PX_S * 0.24;
    agent.vx = lerp(agent.vx, driftVelocityX, sinkBlend * 0.7);
    agent.vy = lerp(agent.vy, PARAMS.SINKING_SPEED_PX_S, sinkBlend);
    agent.heading = rotateToward(
      agent.heading,
      Math.PI * 0.5,
      PARAMS.HIGH_FOOD_TURN_RATE_RAD_S * dt,
    );
  } else {
    const targetSpeed = lerp(
      PARAMS.LOW_FOOD_SPEED_PX_S,
      PARAMS.HIGH_FOOD_SPEED_PX_S,
      food,
    );
    const maxTurnRate = lerp(
      PARAMS.LOW_FOOD_TURN_RATE_RAD_S,
      PARAMS.HIGH_FOOD_TURN_RATE_RAD_S,
      food,
    );
    const currentDirection = normalize2D(
      agent.vx,
      agent.vy,
      angleToVector(agent.heading),
    );
    const separation = calculateSeparation(neighbors, separationDistance);
    const alignment = calculateAlignment(topologicalNeighbors, agent);
    const cohesion = calculateDensityGradientCohesion(
      neighbors,
      separationDistance,
    );
    const dvm = calculateDvmForce(agent, targetDepthY, height);
    const boundary = calculateBoundaryForce(agent, width, height);

    const jitterBlend = exponentialBlend(PARAMS.JITTER_BLEND_PER_S, dt);
    const jitterTarget = randomBetween(-1, 1) * food;
    agent.turnNoise = lerp(agent.turnNoise, jitterTarget, jitterBlend);

    const desiredVelocity = limitVector(
      currentDirection.x * targetSpeed +
        separation.x +
        alignment.x +
        cohesion.x * cohesionMultiplier +
        dvm.x +
        boundary.x +
        reentry.x,
      currentDirection.y * targetSpeed +
        separation.y +
        alignment.y +
        cohesion.y * cohesionMultiplier +
        dvm.y +
        boundary.y +
        reentry.y,
      PARAMS.MAX_SPEED_PX_S,
    );
    agent.ax = desiredVelocity.x - agent.vx;
    agent.ay = desiredVelocity.y - agent.vy;

    const desiredHeading =
      Math.atan2(desiredVelocity.y, desiredVelocity.x) +
      agent.turnNoise * maxTurnRate * 0.45;
    agent.targetHeading = desiredHeading;
    agent.heading = rotateToward(
      agent.heading,
      desiredHeading,
      maxTurnRate * dt,
    );

    const desiredSpeed = clamp(
      magnitude(desiredVelocity.x, desiredVelocity.y),
      PARAMS.HIGH_FOOD_SPEED_PX_S * 0.45,
      PARAMS.MAX_SPEED_PX_S,
    );
    const speedBlend = exponentialBlend(PARAMS.SWIM_RESPONSE_PER_S, dt);
    agent.currentSpeed = lerp(
      Math.max(
        magnitude(agent.vx, agent.vy),
        PARAMS.HIGH_FOOD_SPEED_PX_S * 0.25,
      ),
      desiredSpeed,
      speedBlend,
    );
    agent.targetSpeed = targetSpeed;
    agent.vx = Math.cos(agent.heading) * agent.currentSpeed;
    agent.vy = Math.sin(agent.heading) * agent.currentSpeed;
  }

  agent.currentSpeed = magnitude(agent.vx, agent.vy);

  agent.x += agent.vx * dt;
  agent.y += agent.vy * dt;
  agent.x = clamp(
    agent.x,
    -PARAMS.OFFSCREEN_ALLOWANCE_PX,
    width + PARAMS.OFFSCREEN_ALLOWANCE_PX,
  );
  agent.y = clamp(
    agent.y,
    -PARAMS.OFFSCREEN_ALLOWANCE_PX,
    height + PARAMS.OFFSCREEN_ALLOWANCE_PX,
  );
  agent.time += dt;
  agent.spriteVelocity = { x: agent.vx, y: agent.vy };
  agent.spritePosition = { x: agent.x, y: agent.y };
  agent.spriteState = agent.isParachuting
    ? { mode: "parachuting" }
    : {
        mode: agent.isReturning
          ? "returning"
          : timeFlags.isCrepuscular
            ? "condensed"
            : "swimming",
      };
};

const drawFoodField = (ctx, foodField, elapsedS) => {
  foodField.forEach((patch, index) => {
    const wobble = elapsedS * PARAMS.FOOD_PATCH_DRIFT_PX_S * 0.1 + patch.phase;
    const patchX = patch.anchorX + Math.cos(wobble + index) * patch.orbitX;
    const patchY =
      patch.anchorY + Math.sin(wobble * 0.87 + index) * patch.orbitY;
    const radius = patch.radius;

    const gradient = ctx.createRadialGradient(
      patchX,
      patchY,
      0,
      patchX,
      patchY,
      radius,
    );
    gradient.addColorStop(
      0,
      `rgba(${PARAMS.RENDER_FOOD_COLOR}, ${PARAMS.RENDER_FOOD_ALPHA})`,
    );
    gradient.addColorStop(1, `rgba(${PARAMS.RENDER_FOOD_COLOR}, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(patchX, patchY, radius, 0, Math.PI * 2);
    ctx.fill();
  });
};

// 플레이스홀더 앱
export function App({ controls, onGpuErrorChange, isPaused = false }) {
  const canvasRef = React.useRef(null);
  const imageRef = React.useRef(null);
  const rasterCanvasRef = React.useRef(null);
  const animationFrameRef = React.useRef(0);
  const agentsRef = React.useRef([]);
  const foodFieldRef = React.useRef([]);
  const frameSizeRef = React.useRef(
    resolveAtlasFrameSize(ATLAS, { width: 64, height: 64 }),
  );
  const lastTimeRef = React.useRef(0);
  const elapsedTimeRef = React.useRef(0);
  const behaviorConfig = React.useMemo(
    () => resolveBehaviorConfig(controls || DEFAULT_CONTROL_STATE),
    [controls],
  );

  React.useEffect(() => {
    onGpuErrorChange?.("");
  }, [onGpuErrorChange]);

  // 이미지 로드
  React.useEffect(() => {
    const image = new Image();
    image.decoding = "async";
    image.src = ATLAS.src;

    const handleLoad = () => {
      imageRef.current = image;
      const imageSize = {
        width: ATLAS.imageSize?.width || image.naturalWidth || 64,
        height: ATLAS.imageSize?.height || image.naturalHeight || 64,
      };
      frameSizeRef.current = resolveAtlasFrameSize(ATLAS, imageSize);

      const rasterCanvas = document.createElement("canvas");
      rasterCanvas.width = imageSize.width;
      rasterCanvas.height = imageSize.height;
      const rasterContext = rasterCanvas.getContext("2d");
      if (rasterContext) {
        rasterContext.clearRect(0, 0, rasterCanvas.width, rasterCanvas.height);
        rasterContext.drawImage(
          image,
          0,
          0,
          rasterCanvas.width,
          rasterCanvas.height,
        );
        rasterCanvasRef.current = rasterCanvas;
      } else {
        rasterCanvasRef.current = null;
      }
    };

    image.addEventListener("load", handleLoad);
    if (image.complete) {
      handleLoad();
    }

    return () => {
      image.removeEventListener("load", handleLoad);
      rasterCanvasRef.current = null;
    };
  }, []);

  // 프레임 루프
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    applyTransparentCanvasStyle(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return undefined;
    }

    const resetSimulation = (width, height) => {
      agentsRef.current = createAgents(
        behaviorConfig.count,
        width,
        height,
        behaviorConfig,
      );
      foodFieldRef.current = createFoodField(width, height);
      elapsedTimeRef.current = 0;
      lastTimeRef.current = 0;
    };

    const render = (timestamp) => {
      const now = timestamp * 0.001;
      const dt = lastTimeRef.current
        ? Math.min(now - lastTimeRef.current, PARAMS.TIME_STEP_MAX)
        : 0.016;
      lastTimeRef.current = now;

      const size = syncCanvasSize(canvas, ctx);

      if (agentsRef.current.length === 0 || foodFieldRef.current.length === 0) {
        resetSimulation(size.width, size.height);
      }

      ensureAgents(agentsRef, behaviorConfig, size.width, size.height);

      clearTransparentCanvas2d(ctx, size.width, size.height);
      drawFoodField(ctx, foodFieldRef.current, elapsedTimeRef.current);

      if (!isPaused) {
        elapsedTimeRef.current += dt;
        const simHour =
          (behaviorConfig.startHour +
            elapsedTimeRef.current * PARAMS.CIRCADIAN_HOURS_PER_REAL_SECOND) %
          24;
        const context = {
          dt,
          width: size.width,
          height: size.height,
          elapsedS: elapsedTimeRef.current,
          simHour,
          foodField: foodFieldRef.current,
          config: behaviorConfig,
        };

        agentsRef.current.forEach((agent, index) => {
          advanceAgent(agent, index, agentsRef.current, context);
        });
      }

      const image = rasterCanvasRef.current || imageRef.current;
      const frameSize = frameSizeRef.current;

      if (image) {
        agentsRef.current.forEach((agent, index) => {
          const sprite = resolveCanvasAtlasSprite(ATLAS, {
            space: agent.spriteSpace || "2d",
            position: agent.spritePosition || { x: agent.x, y: agent.y },
            velocity: agent.spriteVelocity || { x: agent.vx, y: agent.vy },
            previousScreenPosition: agent.previousScreenPosition,
            maxDt: dt,
            width: size.width,
            height: size.height,
            state: agent.spriteState,
            profile: agent.spriteProfile || "simulation",
            timestampMs: now * 1000,
            animationOffsetMs: agent.stageOffset,
          });

          const bobAmplitude = agent.isParachuting ? 1.25 : 3.4;
          const bobRate = agent.isParachuting ? 0.8 : 2.1;
          const bobOffset =
            Math.sin(now * bobRate + index * 0.55) * bobAmplitude;
          const drawWidth = agent.renderWidth;
          const drawHeight = agent.renderHeight;
          agent.previousScreenPosition = sprite.pose.screenPosition;

          ctx.save();
          ctx.translate(agent.x, agent.y + bobOffset);
          ctx.rotate(sprite.rotation);
          ctx.scale(sprite.flipX, 1);
          ctx.drawImage(
            image,
            sprite.frame.x * frameSize.width,
            sprite.frame.y * frameSize.height,
            frameSize.width,
            frameSize.height,
            -drawWidth * 0.5,
            -drawHeight * 0.5,
            drawWidth,
            drawHeight,
          );
          ctx.restore();
        });
      }

      animationFrameRef.current = window.requestAnimationFrame(render);
    };

    animationFrameRef.current = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
    };
  }, [behaviorConfig, isPaused]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

// UI 메타
App.ui = {
  controlFields: CONTROL_FIELDS,
  defaultControlState: DEFAULT_CONTROL_STATE,
};

// 상태 정리
App.sanitizeControlState = (rawControls = DEFAULT_CONTROL_STATE) => ({
  COUNT: clamp(
    Math.round(Number(rawControls.COUNT) || DEFAULT_CONTROL_STATE.COUNT),
    PARAMS.MIN_COUNT,
    PARAMS.MAX_COUNT,
  ),
  START_HOUR: clamp(
    Number(rawControls.START_HOUR) || DEFAULT_CONTROL_STATE.START_HOUR,
    0,
    23,
  ),
  FOOD_ABUNDANCE: clamp(
    Number(rawControls.FOOD_ABUNDANCE) || DEFAULT_CONTROL_STATE.FOOD_ABUNDANCE,
    0,
    100,
  ),
  DENSITY_SURGE: clamp(
    Number(rawControls.DENSITY_SURGE) || DEFAULT_CONTROL_STATE.DENSITY_SURGE,
    50,
    180,
  ),
  NIGHT_COHESION: clamp(
    Number(rawControls.NIGHT_COHESION) || DEFAULT_CONTROL_STATE.NIGHT_COHESION,
    40,
    120,
  ),
});

import React from "react";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { resolveAtlasFrameSize } from "../../utils/spriteAtlas";
import { resolveCanvasAtlasSprite } from "../../utils/spritePose";
import {
  applyTransparentCanvasStyle,
  clearTransparentCanvas2d,
} from "../../utils/transparentCanvas";

const ATLAS = HOME_SPRITE_ATLASES.firefly;

const PARAMS = {
  DEFAULT_COUNT: 140,
  DEFAULT_TIME_SCALE: 1,
  DEFAULT_COUPLING_BETA: 0.22,
  DEFAULT_VISION_RADIUS_M: 8,
  DEFAULT_INTERACTION_MODE: "predator",
  DEFAULT_INTERACTIONS_ENABLED: true,
  DEFAULT_SHOW_PHASE_DEBUG: false,
  SPRITE_SCALE: 0.145,
  FEMALE_RATIO: 0.08,
  FEMALE_RESPONSE_DELAY_S: 2,
  FEMALE_RESPONSE_FLASH_COUNT_MIN: 1,
  FEMALE_RESPONSE_FLASH_COUNT_MAX: 2,
  FEMALE_RESPONSE_FLASH_INTERVAL_S: 0.53,
  FEMALE_PERCH_DRIFT_MULTIPLIER: 1.75,
  PERCHED_RATIO: 0.78,
  METERS_TO_PIXELS: 82,
  WORLD_CELL_SIZE_PX: 120,
  TIME_STEP_MAX: 0.05,
  SCREEN_RETURN_MARGIN_PX: 20,
  SCREEN_RETURN_TARGET_INSET_PX: 84,
  SCREEN_RETURN_FORCE_MPS: 0.045,
  SCREEN_RETURN_MAX_FORCE_MPS: 0.42,
  PERCHED_SCREEN_RETURN_BLEND: 0.18,
  ALTITUDE_PROJECT_SCALE_PX: 42,
  DEPTH_PROJECT_X: 0.1,
  DEPTH_PROJECT_Y: 0.05,
  DEPTH_MIN: -220,
  DEPTH_MAX: 220,
  MIN_RELATIVE_ALTITUDE_M: 0.1,
  TARGET_ALTITUDE_M: 1,
  MAX_RELATIVE_ALTITUDE_M: 1.6,
  ALTITUDE_FLOOR_REPULSION: 4.8,
  ALTITUDE_CEILING_PULL: 1.25,
  ALTITUDE_SETTLE: 0.55,
  DESCENT_GLIDE_MULTIPLIER: 1.65,
  ASCENT_LIFT_DAMPING: 0.62,
  DESCENT_DRIFT_MPS: 0.055,
  WANDER_SPEED_MPS: 0.15,
  EARLY_BURST_SPEED_MIN_MPS: 0.31,
  EARLY_BURST_SPEED_MAX_MPS: 0.51,
  LATE_BURST_SPEED_MIN_MPS: 0.19,
  LATE_BURST_SPEED_MAX_MPS: 0.28,
  MAX_SPEED_MPS: 0.51,
  WANDER_TURN_RATE_RAD_S: 1.25,
  BURST_TURN_RATE_RAD_S: 0.38,
  HOVER_TURN_RATE_MULTIPLIER: 2.3,
  CRUISE_TURN_RATE_MULTIPLIER: 0.9,
  STEERING_RESPONSE_PER_S: 4.8,
  PERCH_RETURN_BLEND_PER_S: 3.6,
  PERCH_REACQUIRE_DELAY_MIN_S: 1.6,
  PERCH_REACQUIRE_DELAY_MAX_S: 4.2,
  PERCH_CAPTURE_RADIUS_PX: 18,
  PERCH_SURFACE_DRIFT_PX: 3.5,
  PERCH_ALTITUDE_MIN_M: 0.82,
  PERCH_ALTITUDE_MAX_M: 1.18,
  PERCH_ANCHOR_OFFSET_PX: 10,
  PATROL_BURST_DURATION_MULTIPLIER: 1.22,
  PATROL_FLASH_QUOTA_BONUS: 1,
  FLASH_INTERVAL_S: 0.53,
  FLASH_ON_DURATION_S: 0.13,
  BURST_DURATION_MIN_S: 2,
  BURST_DURATION_MAX_S: 3,
  BURST_FLASH_COUNT_MIN: 4,
  BURST_FLASH_COUNT_MAX: 8,
  INTERNAL_VOLTAGE_THRESHOLD: 1,
  INTRINSIC_TB_MIN_S: 5.6,
  INTRINSIC_TB_MAX_S: 160,
  INTRINSIC_TB_LOG_SIGMA: 0.9,
  TB_MEAN_S: 12,
  CRITICAL_DENSITY_COUNT: 15,
  SEPARATION_DISTANCE_M: 0.1,
  SEPARATION_FORCE_MPS2: 1.9,
  THREAT_RADIUS_PX: 170,
  THREAT_DURATION_S: 1.6,
  THREAT_FLICKER_MIN_HZ: 3,
  THREAT_FLICKER_MAX_HZ: 10,
  THREAT_TURN_RATE_RAD_S: 7.4,
  THREAT_SPEED_BOOST_MPS: 0.42,
  THREAT_MAX_SPEED_MPS: 0.78,
  THREAT_EVASION_WEIGHT_MPS: 0.36,
  THREAT_RANDOM_TURN_RAD: 1.3,
  LIGHT_THREAT_RADIUS_PX: 148,
  LIGHT_THREAT_DURATION_S: 1.15,
  LIGHT_THREAT_FLICKER_MIN_HZ: 6,
  LIGHT_THREAT_FLICKER_MAX_HZ: 14,
  LIGHT_THREAT_TURN_RATE_RAD_S: 5.2,
  LIGHT_THREAT_SPEED_BOOST_MPS: 0.18,
  LIGHT_THREAT_MAX_SPEED_MPS: 0.54,
  LIGHT_THREAT_EVASION_WEIGHT_MPS: 0.18,
  LIGHT_THREAT_RANDOM_TURN_RAD: 0.52,
  FLASHLIGHT_PULSE_INTERVAL_S: 0.53,
  FLASHLIGHT_PULSE_STRENGTH: 20,
  PERTURBATION_RADIUS_PX: 96,
  PERTURBATION_TTL_S: 0.18,
  PERTURBATION_COUPLING_EQUIVALENT: 20,
  PHASE_RING_RADIUS_PX: 8,
  PHASE_RING_LINE_WIDTH_PX: 1.2,
  PHASE_RING_ALPHA: 0.75,
  FLASHLIGHT_RADIUS_PX: 176,
  FLASHLIGHT_HOTSPOT_RATIO: 0.16,
  FLASHLIGHT_FALLOFF_RATIO: 0.62,
  FLASHLIGHT_BLOOM_RADIUS_PX: 268,
  FLASHLIGHT_BLOOM_ALPHA: 0.036,
  FLASHLIGHT_DUST_ALPHA: 0.032,
  FLASHLIGHT_DIRECTIONAL_ALPHA: 0.022,
  FLASHLIGHT_DIRECTIONAL_LENGTH_SCALE: 1.36,
  FLASHLIGHT_DIRECTIONAL_WIDTH_SCALE: 0.78,
  FLASHLIGHT_SOURCE_OFFSET_Y_PX: 110,
  FLASHLIGHT_BODY_REVEAL_ALPHA: 0.92,
  AMBIENT_BODY_ALPHA: 0.28,
  GLOW_SPILLOVER_RADIUS_PX: 74,
  GLOW_SPILLOVER_ALPHA: 0.2,
  OBSTACLE_COUNT: 8,
  OBSTACLE_RADIUS_MIN_PX: 24,
  OBSTACLE_RADIUS_MAX_PX: 64,
  OBSTACLE_BAND_TOP: 0.52,
  OBSTACLE_BAND_BOTTOM: 0.88,
  OBSTACLE_ALPHA: 0,
};

const CONTROL_FIELDS = [
  {
    key: "COUNT",
    label: "개체 수",
    min: 20,
    max: 180,
    step: 5,
    formatValue: (value) => `${Math.round(value)} 마리`,
  },
  {
    key: "COUPLING_BETA",
    label: "동기화 결합 강도",
    min: 0.1,
    max: 0.4,
    step: 0.01,
    formatValue: (value) => value.toFixed(2),
  },
  {
    key: "VISION_RADIUS_M",
    label: "시야 반경",
    min: 1,
    max: 10,
    step: 0.25,
    formatValue: (value) => `${value.toFixed(1)} m`,
  },
  {
    key: "INTERACTION_MODE",
    label: "마우스 위협",
    type: "binary-toggle",
    onValue: "light_threat",
    offValue: "predator",
    formatValue: (value) => {
      if (value === "predator") return "포식자";
      if (value === "light_threat") return "광원위협";
      return "포식자";
    },
  },
  {
    key: "INTERACTIONS_ENABLED",
    label: "시각적 상호작용",
    type: "toggle",
    formatValue: (value) => (value ? "ON" : "OFF"),
  },
  {
    key: "SHOW_PHASE_DEBUG",
    label: "위상 링 보기",
    type: "toggle",
    formatValue: (value) => (value ? "ON" : "OFF"),
  },
];

const DEFAULT_CONTROL_STATE = {
  COUNT: PARAMS.DEFAULT_COUNT,
  TIME_SCALE: PARAMS.DEFAULT_TIME_SCALE,
  COUPLING_BETA: PARAMS.DEFAULT_COUPLING_BETA,
  VISION_RADIUS_M: PARAMS.DEFAULT_VISION_RADIUS_M,
  INTERACTION_MODE: PARAMS.DEFAULT_INTERACTION_MODE,
  INTERACTIONS_ENABLED: PARAMS.DEFAULT_INTERACTIONS_ENABLED,
  SHOW_PHASE_DEBUG: PARAMS.DEFAULT_SHOW_PHASE_DEBUG,
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (start, end, amount) => start + (end - start) * amount;
const randomBetween = (min, max) => min + Math.random() * (max - min);

const addVector = (left, right) => ({
  x: left.x + right.x,
  y: left.y + right.y,
  z: left.z + right.z,
});

const scaleVector = (vector, amount) => ({
  x: vector.x * amount,
  y: vector.y * amount,
  z: vector.z * amount,
});

const resolveThreatProfile = (threatMode) => {
  if (threatMode === "light_threat") {
    return {
      radiusPx: PARAMS.LIGHT_THREAT_RADIUS_PX,
      durationS: PARAMS.LIGHT_THREAT_DURATION_S,
      flickerMinHz: PARAMS.LIGHT_THREAT_FLICKER_MIN_HZ,
      flickerMaxHz: PARAMS.LIGHT_THREAT_FLICKER_MAX_HZ,
      turnRateRadS: PARAMS.LIGHT_THREAT_TURN_RATE_RAD_S,
      speedBoostMps: PARAMS.LIGHT_THREAT_SPEED_BOOST_MPS,
      maxSpeedMps: PARAMS.LIGHT_THREAT_MAX_SPEED_MPS,
      evasionWeightMps: PARAMS.LIGHT_THREAT_EVASION_WEIGHT_MPS,
      randomTurnRad: PARAMS.LIGHT_THREAT_RANDOM_TURN_RAD,
    };
  }

  return {
    radiusPx: PARAMS.THREAT_RADIUS_PX,
    durationS: PARAMS.THREAT_DURATION_S,
    flickerMinHz: PARAMS.THREAT_FLICKER_MIN_HZ,
    flickerMaxHz: PARAMS.THREAT_FLICKER_MAX_HZ,
    turnRateRadS: PARAMS.THREAT_TURN_RATE_RAD_S,
    speedBoostMps: PARAMS.THREAT_SPEED_BOOST_MPS,
    maxSpeedMps: PARAMS.THREAT_MAX_SPEED_MPS,
    evasionWeightMps: PARAMS.THREAT_EVASION_WEIGHT_MPS,
    randomTurnRad: PARAMS.THREAT_RANDOM_TURN_RAD,
  };
};

const length3D = (vector) =>
  Math.hypot(vector.x, vector.y, Number.isFinite(vector.z) ? vector.z : 0);

const normalize3D = (vector, fallback = { x: 1, y: 0, z: 0 }) => {
  const magnitude = length3D(vector);
  if (magnitude < 1e-6) {
    return { ...fallback };
  }

  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
    z: (vector.z || 0) / magnitude,
  };
};

const rotate2D = (vector, angle) => {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return {
    x: vector.x * cosine - vector.y * sine,
    y: vector.x * sine + vector.y * cosine,
  };
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

const randomNormal = (mean, stdDev) => {
  const u = 1 - Math.random();
  const v = Math.random();
  const gaussian = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + gaussian * stdDev;
};

const metersToPixels = (meters) => meters * PARAMS.METERS_TO_PIXELS;

const sampleIntrinsicTb = () => {
  const logMean =
    Math.log(PARAMS.TB_MEAN_S) -
    0.5 * PARAMS.INTRINSIC_TB_LOG_SIGMA * PARAMS.INTRINSIC_TB_LOG_SIGMA;
  const sampled = Math.exp(
    randomNormal(logMean, PARAMS.INTRINSIC_TB_LOG_SIGMA),
  );
  return clamp(sampled, PARAMS.INTRINSIC_TB_MIN_S, PARAMS.INTRINSIC_TB_MAX_S);
};

const projectPoint = (position) => ({
  x: position.x + position.depth * PARAMS.DEPTH_PROJECT_X,
  y:
    position.y +
    position.depth * PARAMS.DEPTH_PROJECT_Y -
    position.z * PARAMS.ALTITUDE_PROJECT_SCALE_PX,
  scale: clamp(
    0.84 + position.depth * 0.00035 - position.z * 0.045,
    0.72,
    1.18,
  ),
});

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

const createObstacleField = (width, height) => {
  const obstacles = [];
  const columns = Math.max(4, Math.ceil(Math.sqrt(PARAMS.OBSTACLE_COUNT)));
  const rows = Math.max(2, Math.ceil(PARAMS.OBSTACLE_COUNT / columns));

  for (let index = 0; index < PARAMS.OBSTACLE_COUNT; index += 1) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const xBand = (column + 0.5) / columns;
    const yBand = (row + 0.5) / rows;
    obstacles.push({
      x: width * xBand + randomBetween(-width * 0.07, width * 0.07),
      y:
        height *
          lerp(PARAMS.OBSTACLE_BAND_TOP, PARAMS.OBSTACLE_BAND_BOTTOM, yBand) +
        randomBetween(-height * 0.035, height * 0.035),
      radius: randomBetween(
        PARAMS.OBSTACLE_RADIUS_MIN_PX,
        PARAMS.OBSTACLE_RADIUS_MAX_PX,
      ),
    });
  }

  return obstacles;
};

const drawObstacles = (ctx, obstacles) => {
  if (PARAMS.OBSTACLE_ALPHA <= 0) {
    return;
  }

  ctx.save();
  ctx.fillStyle = `rgba(72, 112, 60, ${PARAMS.OBSTACLE_ALPHA})`;
  obstacles.forEach((obstacle) => {
    ctx.beginPath();
    ctx.ellipse(
      obstacle.x,
      obstacle.y,
      obstacle.radius,
      obstacle.radius * 1.35,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  });
  ctx.restore();
};

const createPerchAnchor = (obstacles, width, height) => {
  if (!obstacles.length) {
    return {
      x: randomBetween(width * 0.12, width * 0.88),
      y: randomBetween(height * 0.2, height * 0.84),
      z: randomBetween(
        PARAMS.PERCH_ALTITUDE_MIN_M,
        PARAMS.PERCH_ALTITUDE_MAX_M,
      ),
      depth: randomBetween(PARAMS.DEPTH_MIN * 0.35, PARAMS.DEPTH_MAX * 0.35),
      obstacleIndex: -1,
    };
  }

  const obstacleIndex = Math.floor(randomBetween(0, obstacles.length));
  const obstacle = obstacles[obstacleIndex];
  const angle = randomBetween(-Math.PI, Math.PI);
  const radius =
    obstacle.radius +
    randomBetween(
      -PARAMS.PERCH_ANCHOR_OFFSET_PX,
      PARAMS.PERCH_ANCHOR_OFFSET_PX,
    );

  return {
    x: obstacle.x + Math.cos(angle) * radius,
    y: obstacle.y + Math.sin(angle) * radius * 0.78,
    z: randomBetween(PARAMS.PERCH_ALTITUDE_MIN_M, PARAMS.PERCH_ALTITUDE_MAX_M),
    depth: randomBetween(PARAMS.DEPTH_MIN * 0.35, PARAMS.DEPTH_MAX * 0.35),
    obstacleIndex,
  };
};

const pointSegmentDistanceSquared = (point, start, end) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared < 1e-6) {
    const px = point.x - start.x;
    const py = point.y - start.y;
    return px * px + py * py;
  }

  const t = clamp(
    ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared,
    0,
    1,
  );
  const projectedX = start.x + dx * t;
  const projectedY = start.y + dy * t;
  const px = point.x - projectedX;
  const py = point.y - projectedY;
  return px * px + py * py;
};

const hasLineOfSight = (agent, other, obstacles) => {
  const start = { x: agent.x, y: agent.y };
  const end = { x: other.x, y: other.y };
  return !obstacles.some((obstacle) => {
    const radius = obstacle.radius * 0.9;
    return (
      pointSegmentDistanceSquared(obstacle, start, end) <= radius * radius &&
      Math.min(start.y, end.y) <= obstacle.y + radius &&
      Math.max(start.y, end.y) >= obstacle.y - radius
    );
  });
};

const createSpatialGrid = (agents) => {
  const grid = new Map();
  const cellSize = PARAMS.WORLD_CELL_SIZE_PX;

  agents.forEach((agent, index) => {
    const cellX = Math.floor(agent.x / cellSize);
    const cellY = Math.floor(agent.y / cellSize);
    const key = `${cellX}:${cellY}`;
    const bucket = grid.get(key);
    if (bucket) {
      bucket.push(index);
    } else {
      grid.set(key, [index]);
    }
  });

  return grid;
};

const gatherNeighborIndices = (agent, grid, agents, radiusPx) => {
  const cellSize = PARAMS.WORLD_CELL_SIZE_PX;
  const cellX = Math.floor(agent.x / cellSize);
  const cellY = Math.floor(agent.y / cellSize);
  const range = Math.max(1, Math.ceil(radiusPx / cellSize));
  const neighbors = [];

  for (let offsetY = -range; offsetY <= range; offsetY += 1) {
    for (let offsetX = -range; offsetX <= range; offsetX += 1) {
      const bucket = grid.get(`${cellX + offsetX}:${cellY + offsetY}`);
      if (!bucket) {
        continue;
      }

      bucket.forEach((index) => {
        const other = agents[index];
        if (!other || other.id === agent.id) {
          return;
        }

        const dx = other.x - agent.x;
        const dy = other.y - agent.y;
        if (dx * dx + dy * dy <= radiusPx * radiusPx) {
          neighbors.push(index);
        }
      });
    }
  }

  return neighbors;
};

const startBurst = (agent) => {
  const durationMultiplier = agent.isPerched
    ? 1
    : PARAMS.PATROL_BURST_DURATION_MULTIPLIER;
  const duration =
    randomBetween(PARAMS.BURST_DURATION_MIN_S, PARAMS.BURST_DURATION_MAX_S) *
    durationMultiplier;
  agent.isFlashing = true;
  agent.internalVoltage = 0;
  agent.burstDuration = duration;
  agent.burstElapsed = 0;
  agent.burstPhase = -duration * 0.5;
  agent.flashCounter = 1;
  agent.flashQuota = Math.max(
    PARAMS.BURST_FLASH_COUNT_MIN,
    Math.min(
      PARAMS.BURST_FLASH_COUNT_MAX,
      Math.round(duration / PARAMS.FLASH_INTERVAL_S) +
        1 +
        (agent.isPerched ? 0 : PARAMS.PATROL_FLASH_QUOTA_BONUS),
    ),
  );
  agent.flashIntervalAccumulator = 0;
  agent.glowTimer = PARAMS.FLASH_ON_DURATION_S;
  agent.isGlowActive = true;
};

const stopBurst = (agent) => {
  agent.isFlashing = false;
  agent.isGlowActive = false;
  agent.burstDuration = 0;
  agent.burstElapsed = 0;
  agent.burstPhase = 0;
  agent.flashIntervalAccumulator = 0;
  agent.glowTimer = 0;
  agent.flashCounter = 0;
  agent.flashQuota = 0;
  agent.intrinsicTb = sampleIntrinsicTb();
};

const startFemaleResponseFlash = (agent) => {
  agent.isFlashing = true;
  agent.isGlowActive = true;
  agent.burstDuration =
    PARAMS.FLASH_ON_DURATION_S +
    PARAMS.FEMALE_RESPONSE_FLASH_INTERVAL_S *
      Math.max(PARAMS.FEMALE_RESPONSE_FLASH_COUNT_MAX - 1, 0);
  agent.burstElapsed = 0;
  agent.burstPhase = 0;
  agent.flashCounter = 1;
  agent.flashQuota = Math.round(
    randomBetween(
      PARAMS.FEMALE_RESPONSE_FLASH_COUNT_MIN,
      PARAMS.FEMALE_RESPONSE_FLASH_COUNT_MAX + 1,
    ) - 0.5,
  );
  agent.flashIntervalAccumulator = 0;
  agent.glowTimer = PARAMS.FLASH_ON_DURATION_S;
  agent.femaleSawMaleFlash = false;
  agent.femaleResponseArmed = false;
  agent.femaleResponseTimer = 0;
};

const updateFemaleResponse = (agent, dt) => {
  if (agent.threatTimer > 0) {
    agent.isGlowActive = false;
    agent.isFlashing = false;
    agent.femaleSawMaleFlash = false;
    agent.femaleResponseArmed = false;
    agent.femaleResponseTimer = 0;
    agent.flashIntervalAccumulator = 0;
    agent.glowTimer = 0;
    return;
  }

  if (agent.isFlashing) {
    agent.burstElapsed += dt;
    agent.flashIntervalAccumulator += dt;
    agent.glowTimer = Math.max(0, agent.glowTimer - dt);
    agent.isGlowActive = agent.glowTimer > 0;

    while (
      agent.flashIntervalAccumulator >= PARAMS.FEMALE_RESPONSE_FLASH_INTERVAL_S &&
      agent.flashCounter < agent.flashQuota
    ) {
      agent.flashIntervalAccumulator -= PARAMS.FEMALE_RESPONSE_FLASH_INTERVAL_S;
      agent.flashCounter += 1;
      agent.glowTimer = PARAMS.FLASH_ON_DURATION_S;
      agent.isGlowActive = true;
    }

    if (agent.flashCounter >= agent.flashQuota && agent.glowTimer <= 0) {
      stopBurst(agent);
      agent.femaleSawMaleFlash = false;
      agent.femaleResponseArmed = false;
      agent.femaleResponseTimer = 0;
    }
    return;
  }

  if (agent.visibleFlashingNeighbors > 0) {
    agent.femaleSawMaleFlash = true;
    agent.femaleResponseArmed = false;
    agent.femaleResponseTimer = 0;
    agent.isGlowActive = false;
    return;
  }

  if (agent.femaleSawMaleFlash) {
    agent.femaleSawMaleFlash = false;
    agent.femaleResponseArmed = true;
    agent.femaleResponseTimer = 0;
  }

  if (agent.femaleResponseArmed) {
    agent.femaleResponseTimer += dt;
    if (agent.femaleResponseTimer >= PARAMS.FEMALE_RESPONSE_DELAY_S) {
      startFemaleResponseFlash(agent);
      return;
    }
  }

  agent.isGlowActive = false;
};

const updateThreatState = (agent, pointerState, interactionMode, dt) => {
  if (agent.isFemale) {
    const threatProfile = resolveThreatProfile(interactionMode);

    if (pointerState.active) {
      const dx = agent.x - pointerState.x;
      const dy = agent.y - pointerState.y;
      if (dx * dx + dy * dy <= threatProfile.radiusPx * threatProfile.radiusPx) {
        agent.threatTimer = threatProfile.durationS;
        agent.activeThreatMode = interactionMode;
      }
    }

    if (agent.threatTimer > 0) {
      agent.threatTimer = Math.max(0, agent.threatTimer - dt);
    }
    if (agent.threatTimer <= 0) {
      agent.flickerFrequencyHz = 0;
      agent.flickerTimer = 0;
      agent.threatEscapeVector = null;
      agent.activeThreatMode = null;
    }
    return;
  }

  if (interactionMode !== "predator") {
    if (agent.threatTimer > 0) {
      agent.threatTimer = Math.max(0, agent.threatTimer - dt);
    }

    if (agent.threatTimer <= 0) {
      agent.flickerFrequencyHz = 0;
      agent.flickerTimer = 0;
      agent.threatEscapeVector = null;
      agent.activeThreatMode = null;
    }

    return;
  }

  const threatProfile = resolveThreatProfile(interactionMode);
  const previousThreatMode = agent.activeThreatMode;

  if (pointerState.active) {
    const dx = agent.x - pointerState.x;
    const dy = agent.y - pointerState.y;
    if (dx * dx + dy * dy <= threatProfile.radiusPx * threatProfile.radiusPx) {
      agent.threatTimer = threatProfile.durationS;
      agent.activeThreatMode = interactionMode;
      if (agent.isPerched) {
        agent.isPerched = false;
        agent.perchReturnTimer = randomBetween(
          PARAMS.PERCH_REACQUIRE_DELAY_MIN_S,
          PARAMS.PERCH_REACQUIRE_DELAY_MAX_S,
        );
      }
      const escapeDistance = Math.hypot(dx, dy) || 1;
      agent.threatEscapeVector = {
        x: dx / escapeDistance,
        y: dy / escapeDistance,
      };
      if (
        agent.flickerFrequencyHz <= 0 ||
        previousThreatMode !== interactionMode
      ) {
        agent.flickerFrequencyHz = randomBetween(
          threatProfile.flickerMinHz,
          threatProfile.flickerMaxHz,
        );
      }
    }
  }

  if (agent.threatTimer > 0) {
    agent.threatTimer = Math.max(0, agent.threatTimer - dt);
  }

  if (agent.threatTimer <= 0) {
    agent.flickerFrequencyHz = 0;
    agent.flickerTimer = 0;
    agent.threatEscapeVector = null;
    agent.activeThreatMode = null;
  }
};

const updateIntegrateAndFire = (
  agent,
  agents,
  neighborIndices,
  obstacles,
  beta,
  dt,
  interactionsEnabled,
) => {
  let visibleFlashingNeighbors = 0;
  let nearestVisibleGlowDistancePx = Number.POSITIVE_INFINITY;

  neighborIndices.forEach((index) => {
    const other = agents[index];
    if (!other || !other.isGlowActive || other.isFemale) {
      return;
    }

    if (hasLineOfSight(agent, other, obstacles)) {
      visibleFlashingNeighbors += 1;
      const distancePx = Math.hypot(other.x - agent.x, other.y - agent.y);
      nearestVisibleGlowDistancePx = Math.min(
        nearestVisibleGlowDistancePx,
        distancePx,
      );
    }
  });

  agent.visibleFlashingNeighbors = visibleFlashingNeighbors;
  agent.nearestVisibleGlowDistancePx = nearestVisibleGlowDistancePx;

  if (agent.isFemale) {
    updateFemaleResponse(agent, dt);
    return;
  }

  if (agent.threatTimer > 0) {
    agent.flickerTimer += dt * agent.flickerFrequencyHz;
    if (agent.flickerTimer >= 1) {
      agent.flickerTimer -= Math.floor(agent.flickerTimer);
    }
    agent.isGlowActive = agent.flickerTimer < 0.42;
    agent.isFlashing = false;
    return;
  }

  if (!agent.isFlashing) {
    agent.internalVoltage += dt / agent.intrinsicTb;
    if (interactionsEnabled && visibleFlashingNeighbors > 0) {
      agent.internalVoltage += visibleFlashingNeighbors * beta * dt;
    }
    if (agent.internalVoltage >= PARAMS.INTERNAL_VOLTAGE_THRESHOLD) {
      startBurst(agent);
      return;
    }
    agent.isGlowActive = false;
    return;
  }

  agent.burstElapsed += dt;
  agent.burstPhase = agent.burstElapsed - agent.burstDuration * 0.5;
  agent.flashIntervalAccumulator += dt;
  agent.glowTimer = Math.max(0, agent.glowTimer - dt);
  agent.isGlowActive = agent.glowTimer > 0;

  while (
    agent.flashIntervalAccumulator >= PARAMS.FLASH_INTERVAL_S &&
    agent.flashCounter < agent.flashQuota &&
    agent.burstElapsed < agent.burstDuration
  ) {
    agent.flashIntervalAccumulator -= PARAMS.FLASH_INTERVAL_S;
    agent.flashCounter += 1;
    agent.glowTimer = PARAMS.FLASH_ON_DURATION_S;
    agent.isGlowActive = true;
  }

  if (agent.burstElapsed >= agent.burstDuration) {
    stopBurst(agent);
  }
};

const updateHeading = (agent, dt) => {
  if (agent.isPerched && agent.threatTimer <= 0) {
    return;
  }

  agent.wanderClock += dt;
  const wanderSignal =
    Math.sin(agent.wanderClock * agent.wanderRate + agent.wanderOffset) * 0.8 +
    Math.sin(
      agent.wanderClock * (agent.wanderRate * 0.47) + agent.wanderOffset * 1.9,
    ) *
      0.35;

  const threatProfile = resolveThreatProfile(agent.activeThreatMode);
  const turnRate =
    agent.threatTimer > 0
      ? threatProfile.turnRateRadS
      : agent.isFlashing
        ? PARAMS.BURST_TURN_RATE_RAD_S
        : PARAMS.WANDER_TURN_RATE_RAD_S;
  const speedRatio = clamp(
    resolveTargetSpeedMps(agent) / Math.max(PARAMS.MAX_SPEED_MPS, 1e-6),
    0,
    1,
  );
  const dynamicTurnRate =
    turnRate *
    lerp(
      PARAMS.HOVER_TURN_RATE_MULTIPLIER,
      PARAMS.CRUISE_TURN_RATE_MULTIPLIER,
      speedRatio,
    );

  const threatTurnJitter =
    agent.threatTimer > 0
      ? randomBetween(-threatProfile.randomTurnRad, threatProfile.randomTurnRad)
      : 0;

  agent.heading = wrapAngle(
    agent.heading +
      wanderSignal * dynamicTurnRate * dt * 0.35 +
      threatTurnJitter * dt,
  );
};

const resolveTargetSpeedMps = (agent) => {
  if (agent.threatTimer > 0) {
    const threatProfile = resolveThreatProfile(agent.activeThreatMode);
    return clamp(
      PARAMS.LATE_BURST_SPEED_MAX_MPS + threatProfile.speedBoostMps,
      0,
      threatProfile.maxSpeedMps,
    );
  }

  if (agent.isPerched) {
    return 0;
  }

  if (!agent.isFlashing) {
    return PARAMS.WANDER_SPEED_MPS;
  }

  if (agent.burstPhase < 0) {
    return lerp(
      PARAMS.EARLY_BURST_SPEED_MIN_MPS,
      PARAMS.EARLY_BURST_SPEED_MAX_MPS,
      agent.speedBias,
    );
  }

  return lerp(
    PARAMS.LATE_BURST_SPEED_MIN_MPS,
    PARAMS.LATE_BURST_SPEED_MAX_MPS,
    agent.speedBias,
  );
};

const applySeparation = (agent, agents, neighborIndices, dt) => {
  const separationDistancePx = metersToPixels(PARAMS.SEPARATION_DISTANCE_M);
  const separationDistanceSquared = separationDistancePx * separationDistancePx;
  let force = { x: 0, y: 0, z: 0 };

  neighborIndices.forEach((index) => {
    const other = agents[index];
    if (!other) {
      return;
    }

    const dx = agent.x - other.x;
    const dy = agent.y - other.y;
    const distanceSquared = dx * dx + dy * dy;
    if (
      distanceSquared <= 1e-6 ||
      distanceSquared > separationDistanceSquared
    ) {
      return;
    }

    const distance = Math.sqrt(distanceSquared);
    const strength = 1 - distance / separationDistancePx;
    force = addVector(force, {
      x: (dx / distance) * PARAMS.SEPARATION_FORCE_MPS2 * strength * dt,
      y: (dy / distance) * PARAMS.SEPARATION_FORCE_MPS2 * strength * dt,
      z: 0,
    });
  });

  return force;
};

const applyThreatEvasion = (agent) => {
  if (agent.threatTimer <= 0) {
    return { x: 0, y: 0, z: 0 };
  }

  const threatProfile = resolveThreatProfile(agent.activeThreatMode);

  const baseEscape = agent.threatEscapeVector || {
    x: Math.cos(agent.heading),
    y: Math.sin(agent.heading),
  };
  const randomizedEscape = rotate2D(
    baseEscape,
    randomBetween(-threatProfile.randomTurnRad, threatProfile.randomTurnRad),
  );
  const normalizedEscape = normalize3D(
    { x: randomizedEscape.x, y: randomizedEscape.y, z: 0 },
    { x: Math.cos(agent.heading), y: Math.sin(agent.heading), z: 0 },
  );

  return scaleVector(
    normalizedEscape,
    metersToPixels(threatProfile.evasionWeightMps),
  );
};

const applyPerchReturn = (agent) => {
  if (!agent.prefersPerch || agent.isPerched || !agent.perchAnchor) {
    return { x: 0, y: 0, z: 0 };
  }

  if (agent.threatTimer > 0) {
    return { x: 0, y: 0, z: 0 };
  }

  if (agent.perchReturnTimer > 0) {
    return { x: 0, y: 0, z: 0 };
  }

  const dx = agent.perchAnchor.x - agent.x;
  const dy = agent.perchAnchor.y - agent.y;
  const distance = Math.hypot(dx, dy) || 1;
  const captureRadius = PARAMS.PERCH_CAPTURE_RADIUS_PX;

  if (
    distance <= captureRadius &&
    Math.hypot(agent.vx, agent.vy) < metersToPixels(0.08)
  ) {
    agent.isPerched = true;
    agent.vx = 0;
    agent.vy = 0;
    agent.vz = 0;
    return { x: 0, y: 0, z: 0 };
  }

  const returnSpeed = metersToPixels(0.12 + (agent.isFlashing ? 0.06 : 0));
  return {
    x: (dx / distance) * returnSpeed,
    y: (dy / distance) * returnSpeed,
    z: 0,
  };
};

const applyAltitudeRule = (agent, dt) => {
  if (agent.isPerched && agent.perchAnchor && agent.threatTimer <= 0) {
    return (
      (agent.perchAnchor.z - agent.z) * PARAMS.PERCH_RETURN_BLEND_PER_S * dt
    );
  }

  let verticalVelocity = agent.vz;

  if (agent.z < PARAMS.MIN_RELATIVE_ALTITUDE_M) {
    const ratio = 1 - agent.z / PARAMS.MIN_RELATIVE_ALTITUDE_M;
    verticalVelocity +=
      Math.exp(clamp(ratio, 0, 1.8)) * PARAMS.ALTITUDE_FLOOR_REPULSION * dt;
  } else if (agent.z > PARAMS.MAX_RELATIVE_ALTITUDE_M) {
    const ratio =
      (agent.z - PARAMS.MAX_RELATIVE_ALTITUDE_M) /
      Math.max(PARAMS.MAX_RELATIVE_ALTITUDE_M - PARAMS.TARGET_ALTITUDE_M, 0.25);
    verticalVelocity -= ratio * PARAMS.ALTITUDE_CEILING_PULL * dt;
  } else {
    verticalVelocity +=
      (PARAMS.TARGET_ALTITUDE_M - agent.z) * PARAMS.ALTITUDE_SETTLE * dt;
  }

  verticalVelocity -= PARAMS.DESCENT_DRIFT_MPS * dt;

  if (verticalVelocity < 0) {
    verticalVelocity *= PARAMS.DESCENT_GLIDE_MULTIPLIER;
  } else {
    verticalVelocity *= PARAMS.ASCENT_LIFT_DAMPING;
  }

  return verticalVelocity;
};

const updatePerchedAgent = (agent, dt) => {
  if (!agent.perchAnchor) {
    return;
  }

  agent.perchPhase += dt;
  const driftScale = agent.isFemale ? PARAMS.FEMALE_PERCH_DRIFT_MULTIPLIER : 1;
  const swayX =
    Math.cos(agent.perchPhase * 0.9 + agent.wanderOffset) *
    PARAMS.PERCH_SURFACE_DRIFT_PX *
    driftScale;
  const swayY =
    Math.sin(agent.perchPhase * 0.8 + agent.wanderOffset) *
    PARAMS.PERCH_SURFACE_DRIFT_PX *
    0.6 *
    driftScale;
  const blend = clamp(dt * PARAMS.PERCH_RETURN_BLEND_PER_S, 0, 1);
  agent.x = lerp(agent.x, agent.perchAnchor.x + swayX, blend);
  agent.y = lerp(agent.y, agent.perchAnchor.y + swayY, blend);
  agent.z = lerp(agent.z, agent.perchAnchor.z, blend);
  agent.depth = lerp(agent.depth, agent.perchAnchor.depth, blend * 0.5);
  agent.vx = lerp(agent.vx, 0, blend);
  agent.vy = lerp(agent.vy, 0, blend);
  agent.vz = lerp(agent.vz, 0, blend);
};

const applyScreenReturn = (agent, width, height) => {
  const margin = PARAMS.SCREEN_RETURN_MARGIN_PX;
  const targetInset = PARAMS.SCREEN_RETURN_TARGET_INSET_PX;
  const isBeyondOuterBounds =
    agent.x < -margin ||
    agent.x > width + margin ||
    agent.y < -margin ||
    agent.y > height + margin;
  const isInsideReturnTarget =
    agent.x >= targetInset &&
    agent.x <= width - targetInset &&
    agent.y >= targetInset &&
    agent.y <= height - targetInset;

  if (isBeyondOuterBounds) {
    agent.screenReturnActive = true;
  } else if (agent.screenReturnActive && isInsideReturnTarget) {
    agent.screenReturnActive = false;
  }

  if (!agent.screenReturnActive) {
    return { x: 0, y: 0, z: 0 };
  }

  let overflowX = 0;
  let overflowY = 0;
  let targetX = agent.x;
  let targetY = agent.y;

  if (agent.x < -margin) {
    overflowX = -margin - agent.x;
  } else if (agent.x > width + margin) {
    overflowX = width + margin - agent.x;
  }

  if (agent.y < -margin) {
    overflowY = -margin - agent.y;
  } else if (agent.y > height + margin) {
    overflowY = height + margin - agent.y;
  }

  if (agent.x < targetInset) {
    targetX = targetInset;
  } else if (agent.x > width - targetInset) {
    targetX = width - targetInset;
  }

  if (agent.y < targetInset) {
    targetY = targetInset;
  } else if (agent.y > height - targetInset) {
    targetY = height - targetInset;
  }
  const direction = normalize3D(
    { x: targetX - agent.x, y: targetY - agent.y, z: 0 },
    { x: Math.cos(agent.heading), y: Math.sin(agent.heading), z: 0 },
  );
  const overflow = Math.max(
    Math.hypot(overflowX, overflowY),
    Math.hypot(targetX - agent.x, targetY - agent.y) * 0.35,
  );
  const forceMps = clamp(
    metersToPixels(PARAMS.SCREEN_RETURN_FORCE_MPS) + overflow * 0.0024,
    0,
    metersToPixels(PARAMS.SCREEN_RETURN_MAX_FORCE_MPS),
  );

  return scaleVector(direction, forceMps);
};

const applyPerchedScreenReturn = (agent, width, height, dt) => {
  const returnForce = applyScreenReturn(agent, width, height);
  if (Math.abs(returnForce.x) < 1e-6 && Math.abs(returnForce.y) < 1e-6) {
    return;
  }

  const offsetX = returnForce.x * dt * PARAMS.PERCHED_SCREEN_RETURN_BLEND;
  const offsetY = returnForce.y * dt * PARAMS.PERCHED_SCREEN_RETURN_BLEND;

  agent.x += offsetX * 0.35;
  agent.y += offsetY * 0.35;

  if (agent.perchAnchor) {
    agent.perchAnchor.x += offsetX;
    agent.perchAnchor.y += offsetY;
  }
};

const applyArtificialPerturbation = (agent, perturbationPulse) => {
  if (
    !perturbationPulse.active ||
    agent.lastPerturbationId === perturbationPulse.id
  ) {
    return;
  }

  const dx = agent.x - perturbationPulse.x;
  const dy = agent.y - perturbationPulse.y;
  if (
    dx * dx + dy * dy >
    PARAMS.PERTURBATION_RADIUS_PX * PARAMS.PERTURBATION_RADIUS_PX
  ) {
    return;
  }

  agent.lastPerturbationId = perturbationPulse.id;

  if (agent.isFemale) {
    agent.threatTimer = Math.max(agent.threatTimer, PARAMS.PERTURBATION_TTL_S);
    agent.activeThreatMode = "light_threat";
    agent.isGlowActive = false;
    agent.isFlashing = false;
    agent.femaleSawMaleFlash = false;
    agent.femaleResponseArmed = false;
    agent.femaleResponseTimer = 0;
    agent.flashIntervalAccumulator = 0;
    agent.glowTimer = 0;
    return;
  }

  agent.internalVoltage = clamp(
    agent.internalVoltage + perturbationPulse.strength,
    0,
    PARAMS.INTERNAL_VOLTAGE_THRESHOLD,
  );
  if (!agent.isFlashing && agent.threatTimer <= 0) {
    startBurst(agent);
  }
};

const drawPhaseRing = (ctx, agent, projected) => {
  const progress = agent.isFlashing
    ? clamp(
        agent.flashIntervalAccumulator /
          Math.max(PARAMS.FLASH_INTERVAL_S, 1e-6),
        0,
        1,
      )
    : clamp(agent.internalVoltage, 0, 1);
  const ringRadius = PARAMS.PHASE_RING_RADIUS_PX * projected.scale;
  const ringLineWidth = agent.isGlowActive
    ? PARAMS.PHASE_RING_LINE_WIDTH_PX * 2
    : PARAMS.PHASE_RING_LINE_WIDTH_PX;

  ctx.save();
  ctx.translate(projected.x, projected.y - ringRadius * 1.7);
  ctx.strokeStyle = `rgba(255, 255, 255, ${PARAMS.PHASE_RING_ALPHA * 0.2})`;
  ctx.lineWidth = ringLineWidth;
  ctx.beginPath();
  ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = agent.isGlowActive
    ? `rgba(255, 239, 126, ${PARAMS.PHASE_RING_ALPHA})`
    : `rgba(150, 164, 188, ${PARAMS.PHASE_RING_ALPHA * 0.48})`;
  ctx.beginPath();
  ctx.arc(
    0,
    0,
    ringRadius,
    -Math.PI * 0.5,
    -Math.PI * 0.5 + Math.PI * 2 * progress,
  );
  ctx.stroke();
  ctx.restore();
};

const resolveFlashlightIntensity = (x, y, pointerState) => {
  if (!pointerState.active) {
    return 0;
  }

  const dx = x - pointerState.x;
  const dy = y - pointerState.y;
  const distance = Math.hypot(dx, dy);
  const normalizedDistance = distance / PARAMS.FLASHLIGHT_RADIUS_PX;

  if (normalizedDistance >= 1) {
    return 0;
  }

  const hotspot = PARAMS.FLASHLIGHT_HOTSPOT_RATIO;
  const falloff = PARAMS.FLASHLIGHT_FALLOFF_RATIO;

  if (normalizedDistance <= hotspot) {
    return 1;
  }

  const t = clamp(
    (normalizedDistance - hotspot) / Math.max(falloff - hotspot, 1e-6),
    0,
    1,
  );
  const eased = 1 - t * t * (3 - 2 * t);
  return normalizedDistance <= falloff
    ? eased
    : eased *
        (1 - (normalizedDistance - falloff) / Math.max(1 - falloff, 1e-6));
};

const drawFlashlightOverlay = (ctx, pointerState, width, height) => {
  if (!pointerState.active) {
    return;
  }

  const radius = PARAMS.FLASHLIGHT_RADIUS_PX;
  const bloomRadius = PARAMS.FLASHLIGHT_BLOOM_RADIUS_PX;
  const sourceX = width * 0.5;
  const sourceY = height + PARAMS.FLASHLIGHT_SOURCE_OFFSET_Y_PX;
  const driftX = Math.min(
    28,
    Math.max(-28, (pointerState.x - width * 0.5) * 0.07),
  );
  const driftY = Math.min(
    24,
    Math.max(-24, (pointerState.y - height * 0.5) * 0.05),
  );
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
    radius * 0.14,
    pointerState.x + driftX,
    pointerState.y + driftY,
    bloomRadius,
  );
  atmosphere.addColorStop(
    0,
    `rgba(255, 247, 226, ${PARAMS.FLASHLIGHT_BLOOM_ALPHA})`,
  );
  atmosphere.addColorStop(0.24, "rgba(218, 212, 171, 0.02)");
  atmosphere.addColorStop(0.68, "rgba(112, 118, 84, 0.008)");
  atmosphere.addColorStop(1, "rgba(20, 24, 16, 0)");
  ctx.fillStyle = atmosphere;
  ctx.beginPath();
  ctx.arc(
    pointerState.x + driftX,
    pointerState.y + driftY,
    bloomRadius,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  const spill = ctx.createRadialGradient(
    pointerState.x + driftX * 0.15,
    pointerState.y + driftY * 0.12,
    radius * 0.18,
    pointerState.x + driftX * 0.35,
    pointerState.y + driftY * 0.28,
    radius,
  );
  spill.addColorStop(0, `rgba(238, 232, 194, ${PARAMS.FLASHLIGHT_DUST_ALPHA})`);
  spill.addColorStop(0.2, "rgba(201, 196, 154, 0.018)");
  spill.addColorStop(0.5, "rgba(138, 144, 104, 0.009)");
  spill.addColorStop(0.78, "rgba(82, 88, 63, 0.003)");
  spill.addColorStop(1, "rgba(24, 28, 18, 0)");
  ctx.fillStyle = spill;
  ctx.beginPath();
  ctx.arc(
    pointerState.x + driftX * 0.25,
    pointerState.y + driftY * 0.2,
    radius,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.save();
  ctx.translate(pointerState.x + driftX * 0.4, pointerState.y + driftY * 0.3);
  ctx.rotate(beamAngle);
  ctx.scale(
    PARAMS.FLASHLIGHT_DIRECTIONAL_LENGTH_SCALE,
    PARAMS.FLASHLIGHT_DIRECTIONAL_WIDTH_SCALE,
  );

  const directionalDust = ctx.createRadialGradient(
    radius * 0.08,
    0,
    radius * 0.06,
    radius * 0.18,
    0,
    radius,
  );
  directionalDust.addColorStop(
    0,
    `rgba(224, 217, 181, ${PARAMS.FLASHLIGHT_DIRECTIONAL_ALPHA})`,
  );
  directionalDust.addColorStop(0.36, "rgba(162, 162, 125, 0.01)");
  directionalDust.addColorStop(0.78, "rgba(88, 96, 68, 0.003)");
  directionalDust.addColorStop(1, "rgba(24, 28, 18, 0)");
  ctx.fillStyle = directionalDust;
  ctx.beginPath();
  ctx.arc(radius * 0.18, 0, radius * 0.76, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
};

const resolveGlowSpillIntensity = (agent) => {
  if (
    agent.isGlowActive ||
    !Number.isFinite(agent.nearestVisibleGlowDistancePx)
  ) {
    return 0;
  }

  const normalizedDistance = clamp(
    agent.nearestVisibleGlowDistancePx / PARAMS.GLOW_SPILLOVER_RADIUS_PX,
    0,
    1,
  );
  const proximity = 1 - normalizedDistance;
  const neighborhoodBoost = clamp(agent.visibleFlashingNeighbors / 3, 0, 1);
  return proximity * proximity * (0.55 + neighborhoodBoost * 0.45);
};

const createAgent = (id, width, height, obstacles) => {
  const heading = randomBetween(-Math.PI, Math.PI);
  const isFemale = Math.random() < PARAMS.FEMALE_RATIO;
  const speedBias = Math.random();
  const prefersPerch = isFemale || Math.random() < PARAMS.PERCHED_RATIO;
  const perchAnchor = createPerchAnchor(obstacles, width, height);
  const initialSpeed = metersToPixels(
    lerp(PARAMS.LATE_BURST_SPEED_MIN_MPS, PARAMS.WANDER_SPEED_MPS, speedBias),
  );
  const initialX = prefersPerch
    ? perchAnchor.x +
      randomBetween(
        -PARAMS.PERCH_SURFACE_DRIFT_PX,
        PARAMS.PERCH_SURFACE_DRIFT_PX,
      )
    : perchAnchor.x + randomBetween(-70, 70);
  const initialY = prefersPerch
    ? perchAnchor.y +
      randomBetween(
        -PARAMS.PERCH_SURFACE_DRIFT_PX,
        PARAMS.PERCH_SURFACE_DRIFT_PX,
      )
    : perchAnchor.y + randomBetween(-48, 48);

  return {
    id,
    isFemale,
    x: initialX,
    y: initialY,
    depth: prefersPerch
      ? perchAnchor.depth
      : randomBetween(PARAMS.DEPTH_MIN * 0.65, PARAMS.DEPTH_MAX * 0.65),
    z: prefersPerch ? perchAnchor.z : randomBetween(0.35, 1.35),
    vx: prefersPerch ? 0 : Math.cos(heading) * initialSpeed,
    vy: prefersPerch ? 0 : Math.sin(heading) * initialSpeed,
    vz: prefersPerch ? 0 : randomBetween(-0.05, 0.05),
    heading,
    speedBias,
    wanderClock: randomBetween(0, 8),
    wanderRate: randomBetween(0.75, 1.35),
    wanderOffset: randomBetween(0, Math.PI * 2),
    prefersPerch,
    isPerched: prefersPerch,
    perchAnchor,
    perchPhase: randomBetween(0, Math.PI * 2),
    perchReturnTimer: 0,
    internalVoltage: isFemale ? 0 : Math.random() * 0.85,
    intrinsicTb: sampleIntrinsicTb(),
    isFlashing: false,
    isGlowActive: false,
    burstDuration: 0,
    burstElapsed: 0,
    burstPhase: 0,
    flashCounter: 0,
    flashQuota: 0,
    flashIntervalAccumulator: 0,
    glowTimer: 0,
    visibleFlashingNeighbors: 0,
    nearestVisibleGlowDistancePx: Number.POSITIVE_INFINITY,
    threatTimer: 0,
    flickerFrequencyHz: 0,
    flickerTimer: 0,
    threatEscapeVector: null,
    activeThreatMode: null,
    screenReturnActive: false,
    femaleSawMaleFlash: false,
    femaleResponseArmed: false,
    femaleResponseTimer: 0,
    lastPerturbationId: 0,
    stageOffset: randomBetween(0, 1000),
    previousScreenPosition: null,
    spriteProfile: "simulation",
    spriteSpace: "3d",
    spriteState: { glow: false },
  };
};

const createAgents = (count, width, height, obstacles) =>
  Array.from({ length: count }, (_, index) =>
    createAgent(index + 1, width, height, obstacles),
  );

const syncAgentCount = (agents, targetCount, width, height, obstacles) => {
  if (agents.length === targetCount) {
    return agents;
  }

  if (agents.length > targetCount) {
    return agents.slice(0, targetCount);
  }

  const nextAgents = [...agents];
  for (let index = agents.length; index < targetCount; index += 1) {
    nextAgents.push(createAgent(index + 1, width, height, obstacles));
  }
  return nextAgents;
};

const sanitizeControlState = (rawControls = DEFAULT_CONTROL_STATE) => {
  const nextControls = {
    ...DEFAULT_CONTROL_STATE,
    ...(rawControls ?? {}),
  };

  nextControls.COUNT = clamp(
    Math.round(nextControls.COUNT),
    CONTROL_FIELDS[0].min,
    CONTROL_FIELDS[0].max,
  );
  nextControls.TIME_SCALE = clamp(
    nextControls.TIME_SCALE,
    PARAMS.DEFAULT_TIME_SCALE,
    PARAMS.DEFAULT_TIME_SCALE,
  );
  nextControls.COUPLING_BETA = clamp(
    nextControls.COUPLING_BETA,
    CONTROL_FIELDS[1].min,
    CONTROL_FIELDS[1].max,
  );
  nextControls.VISION_RADIUS_M = clamp(
    nextControls.VISION_RADIUS_M,
    CONTROL_FIELDS[2].min,
    CONTROL_FIELDS[2].max,
  );
  nextControls.INTERACTION_MODE = ["predator", "light_threat"].includes(
    nextControls.INTERACTION_MODE,
  )
    ? nextControls.INTERACTION_MODE
    : DEFAULT_CONTROL_STATE.INTERACTION_MODE;
  nextControls.INTERACTIONS_ENABLED = Boolean(
    nextControls.INTERACTIONS_ENABLED,
  );
  nextControls.SHOW_PHASE_DEBUG = Boolean(nextControls.SHOW_PHASE_DEBUG);

  return nextControls;
};

export function App({ controls, onGpuErrorChange, isPaused = false }) {
  const canvasRef = React.useRef(null);
  const imageRef = React.useRef(null);
  const rasterCanvasRef = React.useRef(null);
  const animationFrameRef = React.useRef(0);
  const agentsRef = React.useRef([]);
  const obstaclesRef = React.useRef([]);
  const pointerThreatRef = React.useRef({
    x: 0,
    y: 0,
    active: false,
    angle: -Math.PI * 0.35,
  });
  const flashlightToggleRef = React.useRef(false);
  const flashlightPulseClockRef = React.useRef(
    PARAMS.FLASHLIGHT_PULSE_INTERVAL_S,
  );
  const perturbationPulseRef = React.useRef({
    x: 0,
    y: 0,
    ttl: 0,
    active: false,
    id: 0,
    dragging: false,
  });
  const frameSizeRef = React.useRef(
    resolveAtlasFrameSize(ATLAS, { width: 64, height: 64 }),
  );
  const lastTimeRef = React.useRef(0);

  const sanitizedControls = React.useMemo(
    () => sanitizeControlState(controls),
    [controls],
  );

  React.useEffect(() => {
    onGpuErrorChange?.("");
  }, [onGpuErrorChange]);

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

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    flashlightToggleRef.current =
      sanitizedControls.INTERACTION_MODE === "light_threat";
    flashlightPulseClockRef.current = PARAMS.FLASHLIGHT_PULSE_INTERVAL_S;
    pointerThreatRef.current = {
      ...pointerThreatRef.current,
      active: sanitizedControls.INTERACTION_MODE === "light_threat",
    };

    const emitPerturbation = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      perturbationPulseRef.current = {
        ...perturbationPulseRef.current,
        x: clientX - rect.left,
        y: clientY - rect.top,
        ttl: PARAMS.PERTURBATION_TTL_S,
        active: true,
        id: perturbationPulseRef.current.id + 1,
        strength: PARAMS.PERTURBATION_COUPLING_EQUIVALENT,
      };
    };

    const handlePointerMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const nextX = event.clientX - rect.left;
      const nextY = event.clientY - rect.top;
      const previousX = pointerThreatRef.current.x;
      const previousY = pointerThreatRef.current.y;
      const deltaX = nextX - previousX;
      const deltaY = nextY - previousY;
      const nextAngle =
        Math.hypot(deltaX, deltaY) > 1.5
          ? Math.atan2(deltaY, deltaX)
          : pointerThreatRef.current.angle;

      if (sanitizedControls.INTERACTION_MODE === "light_threat") {
        pointerThreatRef.current = {
          x: nextX,
          y: nextY,
          active: flashlightToggleRef.current,
          angle: nextAngle,
        };
      } else {
        pointerThreatRef.current = {
          x: nextX,
          y: nextY,
          active: true,
          angle: nextAngle,
        };
      }

      if (perturbationPulseRef.current.dragging) {
        emitPerturbation(event.clientX, event.clientY);
      }
    };

    const handlePointerDown = (event) => {
      if (sanitizedControls.INTERACTION_MODE === "light_threat") {
        const rect = canvas.getBoundingClientRect();
        flashlightToggleRef.current = !flashlightToggleRef.current;
        pointerThreatRef.current = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          active: flashlightToggleRef.current,
          angle: pointerThreatRef.current.angle,
        };
        if (flashlightToggleRef.current) {
          flashlightPulseClockRef.current = PARAMS.FLASHLIGHT_PULSE_INTERVAL_S;
        }
        perturbationPulseRef.current.dragging = false;
        return;
      }

      perturbationPulseRef.current.dragging = true;
      if (sanitizedControls.INTERACTIONS_ENABLED) {
        emitPerturbation(event.clientX, event.clientY);
      }
    };

    const handlePointerUp = () => {
      perturbationPulseRef.current.dragging = false;
    };

    const handlePointerLeave = () => {
      pointerThreatRef.current.active = false;
      perturbationPulseRef.current.dragging = false;
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [
    sanitizedControls.INTERACTIONS_ENABLED,
    sanitizedControls.INTERACTION_MODE,
  ]);

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

    const ensureScene = (width, height) => {
      if (obstaclesRef.current.length === 0) {
        obstaclesRef.current = createObstacleField(width, height);
      }

      if (agentsRef.current.length === 0) {
        agentsRef.current = createAgents(
          sanitizedControls.COUNT,
          width,
          height,
          obstaclesRef.current,
        );
      } else {
        agentsRef.current = syncAgentCount(
          agentsRef.current,
          sanitizedControls.COUNT,
          width,
          height,
          obstaclesRef.current,
        );
      }

      agentsRef.current.forEach((agent) => {
        agent.z = clamp(agent.z, 0.02, PARAMS.MAX_RELATIVE_ALTITUDE_M + 0.3);
      });
    };

    const render = (timestamp) => {
      const now = timestamp * 0.001;
      const baseDt = lastTimeRef.current
        ? Math.min(now - lastTimeRef.current, PARAMS.TIME_STEP_MAX)
        : 0.016;
      lastTimeRef.current = now;
      const dt = baseDt * PARAMS.DEFAULT_TIME_SCALE;

      const size = syncCanvasSize(canvas, ctx);
      ensureScene(size.width, size.height);
      clearTransparentCanvas2d(ctx, size.width, size.height);
      drawObstacles(ctx, obstaclesRef.current);

      if (perturbationPulseRef.current.ttl > 0) {
        perturbationPulseRef.current.ttl = Math.max(
          0,
          perturbationPulseRef.current.ttl - dt,
        );
        perturbationPulseRef.current.active =
          perturbationPulseRef.current.ttl > 0;
      } else {
        perturbationPulseRef.current.active = false;
      }

      if (!isPaused) {
        const agents = agentsRef.current;
        const grid = createSpatialGrid(agents);
        const radiusPx = metersToPixels(sanitizedControls.VISION_RADIUS_M);

        agents.forEach((agent) => {
          const neighborIndices = gatherNeighborIndices(
            agent,
            grid,
            agents,
            radiusPx,
          );

          updateThreatState(
            agent,
            pointerThreatRef.current,
            sanitizedControls.INTERACTION_MODE,
            dt,
          );

          applyArtificialPerturbation(agent, perturbationPulseRef.current);

          updateIntegrateAndFire(
            agent,
            agents,
            neighborIndices,
            obstaclesRef.current,
            sanitizedControls.COUPLING_BETA,
            dt,
            sanitizedControls.INTERACTIONS_ENABLED,
          );

          const targetSpeedMps = resolveTargetSpeedMps(agent);
          updateHeading(agent, dt);

          if (agent.perchReturnTimer > 0 && agent.threatTimer <= 0) {
            agent.perchReturnTimer = Math.max(0, agent.perchReturnTimer - dt);
          }

          if (agent.isPerched && agent.threatTimer <= 0) {
            updatePerchedAgent(agent, dt);
            applyPerchedScreenReturn(agent, size.width, size.height, dt);
            agent.spriteState = { glow: agent.isGlowActive };
            return;
          }

          const forward = rotate2D({ x: 1, y: 0 }, agent.heading);
          const targetSpeedPx = metersToPixels(targetSpeedMps);
          const desiredVelocity = {
            x: forward.x * targetSpeedPx,
            y: forward.y * targetSpeedPx,
            z: 0,
          };
          const separation = applySeparation(
            agent,
            agents,
            neighborIndices,
            dt,
          );
          const threatEvasion = applyThreatEvasion(agent);
          const perchReturn = applyPerchReturn(agent);
          const screenReturn = applyScreenReturn(
            agent,
            size.width,
            size.height,
          );
          const desiredWithForces = addVector(
            addVector(
              addVector(addVector(desiredVelocity, separation), threatEvasion),
              perchReturn,
            ),
            screenReturn,
          );
          const velocityBlend = clamp(
            dt * PARAMS.STEERING_RESPONSE_PER_S,
            0,
            1,
          );
          const nextVelocity = {
            x: lerp(agent.vx, desiredWithForces.x, velocityBlend),
            y: lerp(agent.vy, desiredWithForces.y, velocityBlend),
            z: applyAltitudeRule(agent, dt),
          };
          const limitedVelocity = scaleVector(
            normalize3D(nextVelocity, {
              x: Math.cos(agent.heading),
              y: Math.sin(agent.heading),
              z: 0,
            }),
            Math.min(
              length3D(nextVelocity),
              metersToPixels(
                agent.threatTimer > 0
                  ? PARAMS.THREAT_MAX_SPEED_MPS
                  : PARAMS.MAX_SPEED_MPS,
              ),
            ),
          );

          agent.vx = limitedVelocity.x;
          agent.vy = limitedVelocity.y;
          agent.vz = clamp(limitedVelocity.z, -0.65, 0.65);
          agent.x += agent.vx * dt;
          agent.y += agent.vy * dt;
          agent.z = clamp(
            agent.z + agent.vz * dt,
            0.02,
            PARAMS.MAX_RELATIVE_ALTITUDE_M + 0.24,
          );
          agent.depth = clamp(
            agent.depth +
              Math.sin(agent.wanderClock * 0.7 + agent.wanderOffset) * 8 * dt,
            PARAMS.DEPTH_MIN - 4,
            PARAMS.DEPTH_MAX + 4,
          );
          agent.spriteState = { glow: agent.isGlowActive };
        });
      }

      const image = rasterCanvasRef.current || imageRef.current;
      const frameSize = frameSizeRef.current;
      const isLightThreatActive =
        sanitizedControls.INTERACTION_MODE === "light_threat" &&
        pointerThreatRef.current.active;

      if (isLightThreatActive) {
        flashlightPulseClockRef.current += dt;
        if (
          sanitizedControls.INTERACTIONS_ENABLED &&
          flashlightPulseClockRef.current >= PARAMS.FLASHLIGHT_PULSE_INTERVAL_S
        ) {
          flashlightPulseClockRef.current -= PARAMS.FLASHLIGHT_PULSE_INTERVAL_S;
          perturbationPulseRef.current = {
            ...perturbationPulseRef.current,
            x: pointerThreatRef.current.x,
            y: pointerThreatRef.current.y,
            ttl: PARAMS.PERTURBATION_TTL_S,
            active: true,
            id: perturbationPulseRef.current.id + 1,
            strength: PARAMS.FLASHLIGHT_PULSE_STRENGTH,
          };
        }
      } else {
        flashlightPulseClockRef.current = PARAMS.FLASHLIGHT_PULSE_INTERVAL_S;
      }

      if (isLightThreatActive) {
        drawFlashlightOverlay(
          ctx,
          pointerThreatRef.current,
          size.width,
          size.height,
        );
      }

      if (image) {
        const sortedAgents = [...agentsRef.current].sort(
          (left, right) => left.depth - right.depth,
        );

        sortedAgents.forEach((agent) => {
          const worldPosition = {
            x: agent.x,
            y: agent.y,
            z: agent.z,
            depth: agent.depth,
          };
          const sprite = resolveCanvasAtlasSprite(ATLAS, {
            space: agent.spriteSpace || "3d",
            position: worldPosition,
            velocity: { x: agent.vx, y: agent.vy, z: agent.vz },
            previousScreenPosition: agent.previousScreenPosition,
            maxDt: dt,
            width: size.width,
            height: size.height,
            projectPoint,
            state: agent.spriteState,
            profile: agent.spriteProfile || "simulation",
            timestampMs: now * 1000,
            animationOffsetMs: agent.stageOffset,
          });
          const projected = projectPoint(worldPosition);
          const bobOffset = agent.isGlowActive
            ? Math.sin(now * 12 + agent.stageOffset * 0.01) * 1.8
            : Math.sin(now * 2 + agent.stageOffset * 0.01) * 0.8;
          const renderScale = projected.scale;
          const drawWidth = frameSize.width * PARAMS.SPRITE_SCALE;
          const drawHeight = frameSize.height * PARAMS.SPRITE_SCALE;
          const flashlightIntensity = isLightThreatActive
            ? resolveFlashlightIntensity(
                projected.x,
                projected.y + bobOffset,
                pointerThreatRef.current,
              )
            : 0;
          const glowSpillIntensity = resolveGlowSpillIntensity(agent);
          const bodyRevealIntensity = Math.max(
            flashlightIntensity,
            glowSpillIntensity * PARAMS.GLOW_SPILLOVER_ALPHA,
          );

          agent.previousScreenPosition = sprite.pose.screenPosition;

          ctx.save();
          ctx.translate(projected.x, projected.y + bobOffset);
          ctx.rotate(sprite.rotation);
          ctx.scale(sprite.flipX * renderScale, renderScale);
          if (agent.isGlowActive) {
            ctx.globalAlpha = lerp(
              0.9,
              1,
              Math.max(flashlightIntensity, glowSpillIntensity * 0.3),
            );
            ctx.filter = `brightness(${100 + flashlightIntensity * 12}%) saturate(${100 + flashlightIntensity * 18}%)`;
          } else {
            ctx.globalAlpha = lerp(
              PARAMS.AMBIENT_BODY_ALPHA,
              PARAMS.FLASHLIGHT_BODY_REVEAL_ALPHA,
              bodyRevealIntensity,
            );
            ctx.filter = `brightness(${56 + bodyRevealIntensity * 72}%) saturate(${28 + bodyRevealIntensity * 82}%) contrast(${88 + bodyRevealIntensity * 16}%)`;
          }
          if (agent.isGlowActive) {
            ctx.shadowColor = "rgba(255, 240, 120, 0.55)";
            ctx.shadowBlur = 18;
          }
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

          if (sanitizedControls.SHOW_PHASE_DEBUG) {
            drawPhaseRing(ctx, agent, projected);
          }
        });
      }

      animationFrameRef.current = window.requestAnimationFrame(render);
    };

    animationFrameRef.current = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPaused, sanitizedControls]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

App.ui = {
  controlFields: CONTROL_FIELDS,
  defaultControlState: DEFAULT_CONTROL_STATE,
};

App.sanitizeControlState = sanitizeControlState;

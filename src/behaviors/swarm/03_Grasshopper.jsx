import React from "react";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { resolveAtlasFrameSize } from "../../utils/spriteAtlas";
import { resolveCanvasAtlasSprite } from "../../utils/spritePose";
import {
  applyTransparentCanvasStyle,
  clearTransparentCanvas2d,
} from "../../utils/transparentCanvas";

const ATLAS = HOME_SPRITE_ATLASES.grasshopper;

const PARAMS = {
  DEFAULT_COUNT: 1480,
  DEFAULT_ATTRACTION_WEIGHT: 0.01,
  DEFAULT_ADULT_FLIGHT_MODE: false,
  DEFAULT_HUNGER_MODE: false,
  DEFAULT_TEMPERATURE_C: 31,
  DEFAULT_WIND_SPEED_MPS: 2.5,
  PIXELS_PER_CM: 15,
  BEHAVIOR_TIME_SCALE: 1,
  REFERENCE_BODY_LENGTH_CM: 6.5,
  BODY_SCALE: 0.42,
  SPRITE_SCALE: 0.16,
  get BODY_LENGTH_CM() {
    return this.REFERENCE_BODY_LENGTH_CM * this.BODY_SCALE;
  },
  get BASE_SPEED_BODY_LENGTHS_S() {
    return (1.11 * 4) / this.REFERENCE_BODY_LENGTH_CM;
  },
  get HOP_SPEED_BONUS_BODY_LENGTHS_S() {
    return 40 / this.REFERENCE_BODY_LENGTH_CM;
  },
  REFERENCE_HOPPER_REPULSION_DISTANCE_CM: 3.5,
  REFERENCE_HOPPER_JUMP_ESCAPE_DISTANCE_CM: 3,
  get HOPPER_REPULSION_RADIUS_BODY_LENGTHS() {
    return (
      this.REFERENCE_HOPPER_REPULSION_DISTANCE_CM /
      this.REFERENCE_BODY_LENGTH_CM
    );
  },
  get HOPPER_JUMP_ESCAPE_RADIUS_BODY_LENGTHS() {
    return (
      this.REFERENCE_HOPPER_JUMP_ESCAPE_DISTANCE_CM /
      this.REFERENCE_BODY_LENGTH_CM
    );
  },
  FLIGHT_VISUAL_SEPARATION_RADIUS_SPRITE_WIDTHS: 1.35,
  get ALIGNMENT_RADIUS_BODY_LENGTHS() {
    return 13.5 / this.REFERENCE_BODY_LENGTH_CM;
  },
  get PERCEPTION_RADIUS_BODY_LENGTHS() {
    return 30 / this.REFERENCE_BODY_LENGTH_CM;
  },
  BASE_HOP_PROBABILITY: 0.01,
  GROUND_TEMPERATURE_ACTIVITY_MIN_C: 18,
  GROUND_TEMPERATURE_FULL_ACTIVITY_C: 28,
  GROUND_COLD_SPEED_MIN: 0.28,
  GROUND_COLD_WAKE_SUPPRESSION: 0.82,
  GROUND_COLD_HOP_COOLDOWN_MAX_MULTIPLIER: 2.8,
  ACTIVITY_DURATION_S: 45,
  MIN_PAUSE_DURATION_S: 15,
  ACTIVITY_DURATION_VARIANCE: 0.42,
  MIN_PAUSE_DURATION_VARIANCE: 0.55,
  MAX_PAUSED_FRACTION: 0.62,
  CROWD_WAKE_PROBABILITY_PER_SIM_SECOND: 0.42,
  RESUME_PROBABILITY_PER_SIM_SECOND: 0.25,
  SHORT_PAUSE_REORIENTATION_S: 6,
  LONG_PAUSE_REORIENTATION_S: 100,
  INERTIA_WEIGHT: 0.6,
  NOISE_STRENGTH: 0.05,
  REPULSION_WEIGHT: 1,
  ALIGNMENT_WEIGHT: 1.5,
  OCCLUSION_THRESHOLD: 25,
  MAX_TURN_RATE_RAD_PER_SIM_SECOND: Math.PI * 1.8,
  get GRID_CELL_SIZE_BODY_LENGTHS() {
    return this.PERCEPTION_RADIUS_BODY_LENGTHS;
  },
  EDGE_AVOIDANCE_ZONE_BODY_LENGTHS: 4.5,
  EDGE_AVOIDANCE_WEIGHT: 1.15,
  GROUND_RETURN_MARGIN_BODY_LENGTHS: 4.5,
  GROUND_RETURN_EDGE_WEIGHT: 1.7,
  GROUND_EDGE_FORCE_PRIORITY_THRESHOLD: 0.12,
  REAR_THREAT_DOT_THRESHOLD: 0.25,
  REAR_THREAT_MARCH_PROBABILITY: 0.65,
  REAR_THREAT_BOOST_WINDOW_S: 2.5,
  REAR_THREAT_RESUME_ACTIVITY_S: 180,
  CANNIBALISM_FRONT_DOT_THRESHOLD: 0.35,
  CANNIBALISM_PURSUIT_WEIGHT: 0.9,
  CANNIBALISM_REAR_ESCAPE_WEIGHT: 1.8,
  MID_PAUSE_RANDOM_BLEND: 0.3,
  HOP_VISUAL_DURATION_REAL_S: 0.25,
  LANDING_PAUSE_REAL_S: 0.025,
  HOP_COOLDOWN_REAL_S: 0.35,
  POST_FLIGHT_LANDING_PAUSE_MAX_REAL_S: 0.18,
  POST_FLIGHT_HOP_COOLDOWN_MIN_REAL_S: 0.25,
  POST_FLIGHT_HOP_COOLDOWN_MAX_REAL_S: 1.15,
  REST_BOB_BODY_LENGTHS: 0,
  MARCH_BOB_BODY_LENGTHS: 0,
  BOB_RATE: 5.5,
  FLIGHT_SPEED_CM_S: 400,
  FLIGHT_TEMPERATURE_MIN_C: 21,
  FLIGHT_TEMPERATURE_MAX_C: 43,
  FLIGHT_TEMPERATURE_READY_RANGE_C: 7,
  FLIGHT_HEAT_STRESS_START_C: 38,
  FLIGHT_COOL_SPEED_MIN: 0.62,
  FLIGHT_COOL_ALIGNMENT_MIN: 0.68,
  FLIGHT_HEAT_ATTRACTION_REDUCTION: 0.32,
  FLIGHT_HEAT_NOISE_STRENGTH: 0.11,
  FLIGHT_WIND_MAX_UPWIND_MPS: 4,
  FLIGHT_WIND_MAX_ACTIVITY_MPS: 6,
  FLIGHT_VISUAL_SPEED_SCALE: 0.28,
  WIND_DIRECTION_BASE_RAD: 0.12,
  WIND_DIRECTION_DRIFT_RAD: Math.PI * 0.18,
  WIND_DIRECTION_DRIFT_RATE: 0.045,
  FLIGHT_UPWIND_WEIGHT: 0.28,
  FLIGHT_DOWNWIND_WEIGHT: 0.12,
  FLIGHT_WIND_DRIFT_SPEED_RATIO: 0.42,
  FLIGHT_PERCEPTION_RADIUS_BODY_LENGTHS: 8.5,
  FLIGHT_ALIGNMENT_RADIUS_BODY_LENGTHS: 5.2,
  FLIGHT_REPULSION_WEIGHT: 0.9,
  FLIGHT_ALIGNMENT_WEIGHT: 1.65,
  FLIGHT_ATTRACTION_WEIGHT: 0.68,
  FLIGHT_SIDE_NEIGHBOR_WEIGHT: 1.25,
  FLIGHT_REAR_NEIGHBOR_WEIGHT: 0.35,
  FLIGHT_LATERAL_SPREAD_WEIGHT: 0.22,
  FLIGHT_SPEED_SYNC_WEIGHT: 0.32,
  FLIGHT_CLUSTER_SPEED_REDUCTION: 0.1,
  FLIGHT_EDGE_AVOIDANCE_WEIGHT: 7.5,
  FLIGHT_EDGE_WIND_WEIGHT_WHILE_AVOIDING: 0.08,
  FLIGHT_RETURN_MARGIN_BODY_LENGTHS: 8,
  INITIAL_BAND_CENTER_X_RATIO: 0.34,
  INITIAL_BAND_WIDTH_RATIO: 0.26,
  INITIAL_BAND_HEIGHT_RATIO: 0.72,
  INITIAL_HEADING_SPREAD_RAD: 0.38,
  INITIAL_MARCHING_RATIO: 0.88,
};

const CONTROL_FIELDS = [
  {
    key: "COUNT",
    label: "개체 수",
    min: 120,
    max: 1800,
    step: 20,
    formatValue: (value) => `${Math.round(value)} 마리`,
  },
  {
    key: "ATTRACTION_WEIGHT",
    label: "원거리 유인 가중치",
    min: 0,
    max: 0.05,
    step: 0.001,
    formatValue: (value) => value.toFixed(3),
  },
  {
    key: "ADULT_FLIGHT_MODE",
    label: "성충 비행 환경 규칙",
    type: "toggle",
    formatValue: (value) => (value ? "ON" : "OFF"),
  },
  {
    key: "HUNGER_MODE",
    label: "허기 동족포식 압력",
    type: "toggle",
    formatValue: (value) => (value ? "ON" : "OFF"),
  },
  {
    key: "TEMPERATURE_C",
    label: "기온",
    min: 10,
    max: 45,
    step: 1,
    formatValue: (value) => `${Math.round(value)} °C`,
  },
  {
    key: "WIND_SPEED_MPS",
    label: "풍속",
    min: 0,
    max: 10,
    step: 0.1,
    animatedValue: true,
    formatValue: (value, _controls, timeS = 0) => {
      const windDirection = getNaturalWindDirection(timeS);
      const windAngle = Math.atan2(windDirection.y, windDirection.x);

      return (
        <>
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              transform: `rotate(${windAngle}rad)`,
              transformOrigin: "50% 50%",
              transition: "transform 650ms ease",
            }}
          >
            →
          </span>{" "}
          {Number(value).toFixed(1)} m/s
        </>
      );
    },
  },
];

const DEFAULT_CONTROL_STATE = {
  COUNT: PARAMS.DEFAULT_COUNT,
  ATTRACTION_WEIGHT: PARAMS.DEFAULT_ATTRACTION_WEIGHT,
  ADULT_FLIGHT_MODE: PARAMS.DEFAULT_ADULT_FLIGHT_MODE,
  HUNGER_MODE: PARAMS.DEFAULT_HUNGER_MODE,
  TEMPERATURE_C: PARAMS.DEFAULT_TEMPERATURE_C,
  WIND_SPEED_MPS: PARAMS.DEFAULT_WIND_SPEED_MPS,
};

const AGENT_STATES = {
  MARCHING: "MARCHING",
  PAUSED: "PAUSED",
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const randomBetween = (min, max) => min + Math.random() * (max - min);

const wrapAngle = (angle) => {
  let nextAngle = angle;
  while (nextAngle <= -Math.PI) {
    nextAngle += Math.PI * 2;
  }
  while (nextAngle > Math.PI) {
    nextAngle -= Math.PI * 2;
  }
  return nextAngle;
};

const normalize2D = (x, y, fallback = { x: 1, y: 0 }) => {
  const magnitude = Math.hypot(x, y);
  if (magnitude < 1e-6) {
    return { ...fallback };
  }

  return {
    x: x / magnitude,
    y: y / magnitude,
  };
};

const scale2D = (vector, scale) => ({
  x: vector.x * scale,
  y: vector.y * scale,
});

const add2D = (left, right) => ({
  x: left.x + right.x,
  y: left.y + right.y,
});

const mixDirections = (primary, secondary, secondaryWeight) => {
  const primaryWeight = clamp(1 - secondaryWeight, 0, 1);
  return normalize2D(
    primary.x * primaryWeight + secondary.x * secondaryWeight,
    primary.y * primaryWeight + secondary.y * secondaryWeight,
    primary,
  );
};

const rotateTowardAngle = (currentAngle, targetAngle, maxDelta) => {
  const delta = wrapAngle(targetAngle - currentAngle);
  if (Math.abs(delta) <= maxDelta) {
    return targetAngle;
  }

  return currentAngle + Math.sign(delta) * maxDelta;
};

const vectorFromAngle = (angle) => ({
  x: Math.cos(angle),
  y: Math.sin(angle),
});

const getNaturalWindDirection = (timeS) => {
  const windAngle =
    PARAMS.WIND_DIRECTION_BASE_RAD +
    Math.sin(timeS * PARAMS.WIND_DIRECTION_DRIFT_RATE) *
      PARAMS.WIND_DIRECTION_DRIFT_RAD +
    Math.sin(timeS * PARAMS.WIND_DIRECTION_DRIFT_RATE * 0.37 + 1.7) *
      PARAMS.WIND_DIRECTION_DRIFT_RAD *
      0.45;

  return vectorFromAngle(windAngle);
};

const cmToPx = (valueCm) => valueCm * PARAMS.PIXELS_PER_CM;
const bodyLengthsToPx = (valueBodyLengths) =>
  valueBodyLengths * cmToPx(PARAMS.BODY_LENGTH_CM);

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

const buildGrid = (agents, cellSizePx) => {
  const grid = new Map();

  agents.forEach((agent, index) => {
    const cellX = Math.floor(agent.x / cellSizePx);
    const cellY = Math.floor(agent.y / cellSizePx);
    const key = `${cellX},${cellY}`;
    const bucket = grid.get(key);
    if (bucket) {
      bucket.push(index);
    } else {
      grid.set(key, [index]);
    }
  });

  return grid;
};

const collectNeighbors = (agents, grid, agentIndex, radiusPx, cellSizePx) => {
  const neighbors = [];
  const agent = agents[agentIndex];
  const reach = Math.ceil(radiusPx / cellSizePx);
  const centerX = Math.floor(agent.x / cellSizePx);
  const centerY = Math.floor(agent.y / cellSizePx);
  const radiusSq = radiusPx * radiusPx;

  for (let offsetY = -reach; offsetY <= reach; offsetY += 1) {
    for (let offsetX = -reach; offsetX <= reach; offsetX += 1) {
      const bucket = grid.get(`${centerX + offsetX},${centerY + offsetY}`);
      if (!bucket) {
        continue;
      }

      bucket.forEach((neighborIndex) => {
        if (neighborIndex === agentIndex) {
          return;
        }

        const neighbor = agents[neighborIndex];
        const dx = neighbor.x - agent.x;
        const dy = neighbor.y - agent.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > radiusSq || distSq < 1e-6) {
          return;
        }

        neighbors.push({ neighbor, dx, dy, distSq });
      });
    }
  }

  return neighbors;
};

const getEdgeAvoidanceForce = (
  agent,
  width,
  height,
  halfWidth,
  halfHeight,
  avoidZonePx,
) => {
  const minX = halfWidth;
  const maxX = width - halfWidth;
  const minY = halfHeight;
  const maxY = height - halfHeight;
  const force = { x: 0, y: 0 };

  if (agent.x - minX < avoidZonePx) {
    force.x += 1 - clamp((agent.x - minX) / avoidZonePx, 0, 1);
  } else if (maxX - agent.x < avoidZonePx) {
    force.x -= 1 - clamp((maxX - agent.x) / avoidZonePx, 0, 1);
  }

  if (agent.y - minY < avoidZonePx) {
    force.y += 1 - clamp((agent.y - minY) / avoidZonePx, 0, 1);
  } else if (maxY - agent.y < avoidZonePx) {
    force.y -= 1 - clamp((maxY - agent.y) / avoidZonePx, 0, 1);
  }

  return force;
};

const getReturnBandForce = (agent, width, height, marginPx) => {
  const force = { x: 0, y: 0 };

  if (agent.x < 0) {
    force.x += clamp(-agent.x / marginPx, 0, 1);
  } else if (agent.x > width) {
    force.x -= clamp((agent.x - width) / marginPx, 0, 1);
  }

  if (agent.y < 0) {
    force.y += clamp(-agent.y / marginPx, 0, 1);
  } else if (agent.y > height) {
    force.y -= clamp((agent.y - height) / marginPx, 0, 1);
  }

  return force;
};

const createAgent = (width, height) => {
  const heading = randomBetween(
    -PARAMS.INITIAL_HEADING_SPREAD_RAD,
    PARAMS.INITIAL_HEADING_SPREAD_RAD,
  );
  const isMoving = Math.random() < PARAMS.INITIAL_MARCHING_RATIO;
  const bandCenterX = width * PARAMS.INITIAL_BAND_CENTER_X_RATIO;
  const bandWidth = width * PARAMS.INITIAL_BAND_WIDTH_RATIO;
  const bandHeight = height * PARAMS.INITIAL_BAND_HEIGHT_RATIO;
  const activityDurationS =
    PARAMS.ACTIVITY_DURATION_S *
    randomBetween(
      1 - PARAMS.ACTIVITY_DURATION_VARIANCE,
      1 + PARAMS.ACTIVITY_DURATION_VARIANCE,
    );
  const minPauseDurationS =
    PARAMS.MIN_PAUSE_DURATION_S *
    randomBetween(
      1 - PARAMS.MIN_PAUSE_DURATION_VARIANCE,
      1 + PARAMS.MIN_PAUSE_DURATION_VARIANCE,
    );

  return {
    x: clamp(
      bandCenterX + randomBetween(-bandWidth * 0.5, bandWidth * 0.5),
      0,
      width,
    ),
    y: clamp(
      height * 0.5 + randomBetween(-bandHeight * 0.5, bandHeight * 0.5),
      0,
      height,
    ),
    vx: Math.cos(heading),
    vy: Math.sin(heading),
    heading,
    state: isMoving ? AGENT_STATES.MARCHING : AGENT_STATES.PAUSED,
    activityTimer: isMoving ? randomBetween(0, activityDurationS * 0.65) : 0,
    pauseTimer: isMoving
      ? randomBetween(0, PARAMS.SHORT_PAUSE_REORIENTATION_S)
      : randomBetween(0, minPauseDurationS * 0.75),
    activityDurationS,
    minPauseDurationS,
    isCrowded: false,
    stageOffset: randomBetween(0, 1000),
    previousScreenPosition: null,
    spriteProfile: "simulation",
    spriteSpace: "2d",
    spriteState: undefined,
    hopVisualTimer: randomBetween(0, PARAMS.HOP_VISUAL_DURATION_REAL_S),
    landingPauseTimer: 0,
    hopCooldownTimer: randomBetween(0, PARAMS.HOP_COOLDOWN_REAL_S),
    flightTakeoffTimer: 0,
    flightSpeedFactor: randomBetween(0.88, 1.12),
    flightSpeedSync: 1,
    isFlying: false,
    rearThreatTimer: 0,
  };
};

const sanitizeControlState = (rawControls = DEFAULT_CONTROL_STATE) => ({
  ...DEFAULT_CONTROL_STATE,
  ...(rawControls ?? {}),
  COUNT: clamp(
    Math.round(rawControls?.COUNT ?? DEFAULT_CONTROL_STATE.COUNT),
    CONTROL_FIELDS[0].min,
    CONTROL_FIELDS[0].max,
  ),
  ATTRACTION_WEIGHT: clamp(
    Number(
      rawControls?.ATTRACTION_WEIGHT ?? DEFAULT_CONTROL_STATE.ATTRACTION_WEIGHT,
    ),
    0,
    0.05,
  ),
  ADULT_FLIGHT_MODE: Boolean(
    rawControls?.ADULT_FLIGHT_MODE ?? DEFAULT_CONTROL_STATE.ADULT_FLIGHT_MODE,
  ),
  HUNGER_MODE: Boolean(
    rawControls?.HUNGER_MODE ?? DEFAULT_CONTROL_STATE.HUNGER_MODE,
  ),
  TEMPERATURE_C: clamp(
    Number(rawControls?.TEMPERATURE_C ?? DEFAULT_CONTROL_STATE.TEMPERATURE_C),
    10,
    45,
  ),
  WIND_SPEED_MPS: clamp(
    Number(rawControls?.WIND_SPEED_MPS ?? DEFAULT_CONTROL_STATE.WIND_SPEED_MPS),
    0,
    10,
  ),
});

const resizeAgents = (agents, count, width, height) => {
  if (agents.length > count) {
    agents.length = count;
  }

  while (agents.length < count) {
    agents.push(createAgent(width, height));
  }
};

const resumeFromPause = (agent, pauseTimer) => {
  if (pauseTimer <= PARAMS.SHORT_PAUSE_REORIENTATION_S) {
    return;
  }

  const currentDirection = vectorFromAngle(agent.heading);
  const randomDirection = vectorFromAngle(randomBetween(-Math.PI, Math.PI));

  if (pauseTimer >= PARAMS.LONG_PAUSE_REORIENTATION_S) {
    agent.heading = Math.atan2(randomDirection.y, randomDirection.x);
    return;
  }

  const mixedDirection = mixDirections(
    currentDirection,
    randomDirection,
    PARAMS.MID_PAUSE_RANDOM_BLEND,
  );
  agent.heading = Math.atan2(mixedDirection.y, mixedDirection.x);
};

const updateGrasshopperAgents = (
  agents,
  controls,
  width,
  height,
  dt,
  now,
  frameSize,
) => {
  const timerDt = dt * PARAMS.BEHAVIOR_TIME_SCALE;
  const movementDt = dt;
  const bodyLengthPx = cmToPx(PARAMS.BODY_LENGTH_CM);
  const hopperRepulsionRadiusPx =
    bodyLengthPx * PARAMS.HOPPER_REPULSION_RADIUS_BODY_LENGTHS;
  const hopperJumpEscapeRadiusPx =
    bodyLengthPx * PARAMS.HOPPER_JUMP_ESCAPE_RADIUS_BODY_LENGTHS;
  const alignmentRadiusPx = bodyLengthPx * PARAMS.ALIGNMENT_RADIUS_BODY_LENGTHS;
  const flightAlignmentRadiusPx =
    bodyLengthPx * PARAMS.FLIGHT_ALIGNMENT_RADIUS_BODY_LENGTHS;
  const perceptionRadiusPx =
    bodyLengthPx * PARAMS.PERCEPTION_RADIUS_BODY_LENGTHS;
  const flightPerceptionRadiusPx =
    bodyLengthPx * PARAMS.FLIGHT_PERCEPTION_RADIUS_BODY_LENGTHS;
  const gridCellSizePx = bodyLengthPx * PARAMS.GRID_CELL_SIZE_BODY_LENGTHS;
  const groundReturnMarginPx =
    bodyLengthPx * PARAMS.GROUND_RETURN_MARGIN_BODY_LENGTHS;
  const flightReturnMarginPx =
    bodyLengthPx * PARAMS.FLIGHT_RETURN_MARGIN_BODY_LENGTHS;
  const baseSpeedPx = bodyLengthPx * PARAMS.BASE_SPEED_BODY_LENGTHS_S;
  const hopSpeedBonusPx = bodyLengthPx * PARAMS.HOP_SPEED_BONUS_BODY_LENGTHS_S;
  const flightSpeedPx =
    bodyLengthPx *
    (PARAMS.FLIGHT_SPEED_CM_S / PARAMS.REFERENCE_BODY_LENGTH_CM) *
    PARAMS.FLIGHT_VISUAL_SPEED_SCALE;
  const edgeAvoidanceZonePx =
    bodyLengthPx * PARAMS.EDGE_AVOIDANCE_ZONE_BODY_LENGTHS;
  const halfWidth = frameSize.width * PARAMS.SPRITE_SCALE * 0.5;
  const halfHeight = frameSize.height * PARAMS.SPRITE_SCALE * 0.5;
  const flightVisualSeparationRadiusPx =
    Math.max(frameSize.width, frameSize.height) *
    PARAMS.SPRITE_SCALE *
    PARAMS.FLIGHT_VISUAL_SEPARATION_RADIUS_SPRITE_WIDTHS;
  const grid = buildGrid(agents, gridCellSizePx);
  const pausedFraction = agents.length
    ? agents.reduce(
        (count, agent) => count + (agent.state === AGENT_STATES.PAUSED ? 1 : 0),
        0,
      ) / agents.length
    : 0;
  void now;

  agents.forEach((agent, index) => {
    const headingVector = vectorFromAngle(agent.heading);
    let flightWindDriftVelocity = { x: 0, y: 0 };
    let headingNoiseStrength = PARAMS.NOISE_STRENGTH;
    let mustJumpFromContact = false;
    const canFly =
      controls.ADULT_FLIGHT_MODE &&
      controls.TEMPERATURE_C >= PARAMS.FLIGHT_TEMPERATURE_MIN_C &&
      controls.TEMPERATURE_C <= PARAMS.FLIGHT_TEMPERATURE_MAX_C &&
      controls.WIND_SPEED_MPS <= PARAMS.FLIGHT_WIND_MAX_ACTIVITY_MPS;
    const flightTemperatureReadiness = clamp(
      (controls.TEMPERATURE_C - PARAMS.FLIGHT_TEMPERATURE_MIN_C) /
        PARAMS.FLIGHT_TEMPERATURE_READY_RANGE_C,
      0,
      1,
    );
    const flightHeatStress = clamp(
      (controls.TEMPERATURE_C - PARAMS.FLIGHT_HEAT_STRESS_START_C) /
        (PARAMS.FLIGHT_TEMPERATURE_MAX_C - PARAMS.FLIGHT_HEAT_STRESS_START_C),
      0,
      1,
    );
    const flightTemperatureSpeedScale =
      PARAMS.FLIGHT_COOL_SPEED_MIN +
      flightTemperatureReadiness * (1 - PARAMS.FLIGHT_COOL_SPEED_MIN);
    const flightTemperatureAlignmentScale =
      PARAMS.FLIGHT_COOL_ALIGNMENT_MIN +
      flightTemperatureReadiness * (1 - PARAMS.FLIGHT_COOL_ALIGNMENT_MIN);
    const flightTemperatureAttractionScale =
      1 - flightHeatStress * PARAMS.FLIGHT_HEAT_ATTRACTION_REDUCTION;
    const groundTemperatureActivity = clamp(
      (controls.TEMPERATURE_C - PARAMS.GROUND_TEMPERATURE_ACTIVITY_MIN_C) /
        (PARAMS.GROUND_TEMPERATURE_FULL_ACTIVITY_C -
          PARAMS.GROUND_TEMPERATURE_ACTIVITY_MIN_C),
      0,
      1,
    );
    const groundTemperatureSpeedScale =
      PARAMS.GROUND_COLD_SPEED_MIN +
      groundTemperatureActivity * (1 - PARAMS.GROUND_COLD_SPEED_MIN);
    const groundTemperatureWakeScale =
      1 - (1 - groundTemperatureActivity) * PARAMS.GROUND_COLD_WAKE_SUPPRESSION;
    const groundHopCooldownScale =
      1 +
      (1 - groundTemperatureActivity) *
        (PARAMS.GROUND_COLD_HOP_COOLDOWN_MAX_MULTIPLIER - 1);

    const updateHeadingFromTarget = (targetVector) => {
      const normalizedTarget =
        Math.hypot(targetVector.x, targetVector.y) > 1e-6
          ? normalize2D(targetVector.x, targetVector.y, headingVector)
          : headingVector;
      const targetHeading =
        Math.atan2(normalizedTarget.y, normalizedTarget.x) +
        randomBetween(-headingNoiseStrength, headingNoiseStrength);
      const inertiaMixedHeading =
        agent.heading +
        wrapAngle(targetHeading - agent.heading) * (1 - PARAMS.INERTIA_WEIGHT);
      const maxTurn = PARAMS.MAX_TURN_RATE_RAD_PER_SIM_SECOND * movementDt;
      agent.heading = rotateTowardAngle(
        agent.heading,
        inertiaMixedHeading,
        maxTurn,
      );
    };

    if (canFly) {
      if (!agent.isFlying) {
        agent.flightTakeoffTimer = PARAMS.HOP_VISUAL_DURATION_REAL_S;
        agent.previousScreenPosition = null;
      }
      agent.isFlying = true;
      agent.state = AGENT_STATES.MARCHING;
      agent.pauseTimer = 0;
      headingNoiseStrength =
        PARAMS.NOISE_STRENGTH +
        flightHeatStress * PARAMS.FLIGHT_HEAT_NOISE_STRENGTH;

      const neighbors = collectNeighbors(
        agents,
        grid,
        index,
        flightPerceptionRadiusPx,
        gridCellSizePx,
      );
      let forceRepulsion = { x: 0, y: 0 };
      let forceAlignment = { x: 0, y: 0 };
      let forceAttraction = { x: 0, y: 0 };
      let forceLateralSpread = { x: 0, y: 0 };
      let alignmentWeightSum = 0;
      let attractionWeightSum = 0;
      let lateralSpreadWeightSum = 0;
      let flightSpeedRatioSum = 0;
      let flightSpeedRatioWeight = 0;

      neighbors.forEach(({ neighbor, dx, dy, distSq }) => {
        const dist = Math.sqrt(distSq);
        const towardNeighbor = normalize2D(dx, dy, headingVector);
        const frontDot =
          towardNeighbor.x * headingVector.x +
          towardNeighbor.y * headingVector.y;
        const sideBias = 1 - Math.abs(frontDot);
        const lateralAxis = { x: -headingVector.y, y: headingVector.x };
        const sideOffset = dx * lateralAxis.x + dy * lateralAxis.y;
        const interactionWeight = Math.max(
          frontDot >= -0.15 ? 1 : PARAMS.FLIGHT_REAR_NEIGHBOR_WEIGHT,
          sideBias * PARAMS.FLIGHT_SIDE_NEIGHBOR_WEIGHT,
        );

        if (dist <= flightVisualSeparationRadiusPx) {
          forceRepulsion = add2D(
            forceRepulsion,
            scale2D(normalize2D(-dx, -dy, headingVector), interactionWeight),
          );
          return;
        }

        if (dist <= flightAlignmentRadiusPx) {
          forceAlignment = add2D(
            forceAlignment,
            scale2D(
              normalize2D(neighbor.vx, neighbor.vy, headingVector),
              interactionWeight,
            ),
          );
          alignmentWeightSum += interactionWeight;
          const neighborSpeed = Math.hypot(neighbor.vx, neighbor.vy);
          if (neighborSpeed > 1e-6) {
            flightSpeedRatioSum +=
              (neighborSpeed / flightSpeedPx) * interactionWeight;
            flightSpeedRatioWeight += interactionWeight;
          }
        }

        if (Math.abs(frontDot) > 0.55 && dist <= perceptionRadiusPx) {
          const sideDirection =
            Math.abs(sideOffset) > 1e-3
              ? Math.sign(-sideOffset)
              : Math.sin(agent.stageOffset + dist) >= 0
                ? 1
                : -1;
          forceLateralSpread = add2D(
            forceLateralSpread,
            scale2D(lateralAxis, sideDirection * interactionWeight),
          );
          lateralSpreadWeightSum += interactionWeight;
        }

        forceAttraction = add2D(
          forceAttraction,
          scale2D(towardNeighbor, interactionWeight),
        );
        attractionWeightSum += interactionWeight;
      });
      if (alignmentWeightSum > 0) {
        forceAlignment = scale2D(forceAlignment, 1 / alignmentWeightSum);
      }
      if (attractionWeightSum > 0) {
        forceAttraction = scale2D(forceAttraction, 1 / attractionWeightSum);
      }
      if (lateralSpreadWeightSum > 0) {
        forceLateralSpread = scale2D(
          forceLateralSpread,
          1 / lateralSpreadWeightSum,
        );
      }
      const neighborFlightSpeedRatio =
        flightSpeedRatioWeight > 0
          ? flightSpeedRatioSum / flightSpeedRatioWeight
          : 1;
      agent.flightSpeedSync = clamp(
        1 + (neighborFlightSpeedRatio - 1) * PARAMS.FLIGHT_SPEED_SYNC_WEIGHT,
        1 - PARAMS.FLIGHT_CLUSTER_SPEED_REDUCTION,
        1 + PARAMS.FLIGHT_CLUSTER_SPEED_REDUCTION,
      );

      const baseWindDirection = getNaturalWindDirection(now);
      const canFlyUpwind =
        controls.TEMPERATURE_C <= PARAMS.FLIGHT_TEMPERATURE_MAX_C &&
        controls.WIND_SPEED_MPS <= PARAMS.FLIGHT_WIND_MAX_UPWIND_MPS;
      const windStrength = clamp(
        controls.WIND_SPEED_MPS / PARAMS.FLIGHT_WIND_MAX_ACTIVITY_MPS,
        0,
        1,
      );
      const windVector = canFlyUpwind
        ? scale2D(
            baseWindDirection,
            -windStrength * PARAMS.FLIGHT_UPWIND_WEIGHT,
          )
        : scale2D(
            baseWindDirection,
            windStrength * PARAMS.FLIGHT_DOWNWIND_WEIGHT,
          );
      const edgeForce = getReturnBandForce(
        agent,
        width,
        height,
        flightReturnMarginPx,
      );
      const edgeForceMagnitude = Math.hypot(edgeForce.x, edgeForce.y);
      const isAvoidingFlightEdge = edgeForceMagnitude > 1e-6;
      const windDriftScale = isAvoidingFlightEdge
        ? PARAMS.FLIGHT_EDGE_WIND_WEIGHT_WHILE_AVOIDING
        : PARAMS.FLIGHT_WIND_DRIFT_SPEED_RATIO;
      flightWindDriftVelocity = scale2D(
        baseWindDirection,
        flightSpeedPx *
          flightTemperatureSpeedScale *
          windStrength *
          windDriftScale,
      );
      let flightTarget;

      if (isAvoidingFlightEdge) {
        flightTarget = add2D(
          scale2D(edgeForce, PARAMS.FLIGHT_EDGE_AVOIDANCE_WEIGHT),
          scale2D(windVector, PARAMS.FLIGHT_EDGE_WIND_WEIGHT_WHILE_AVOIDING),
        );
      } else {
        flightTarget = add2D(
          scale2D(forceRepulsion, PARAMS.FLIGHT_REPULSION_WEIGHT),
          scale2D(
            forceAlignment,
            PARAMS.FLIGHT_ALIGNMENT_WEIGHT * flightTemperatureAlignmentScale,
          ),
        );
        flightTarget = add2D(
          flightTarget,
          scale2D(
            forceAttraction,
            PARAMS.FLIGHT_ATTRACTION_WEIGHT * flightTemperatureAttractionScale,
          ),
        );
        flightTarget = add2D(
          flightTarget,
          scale2D(forceLateralSpread, PARAMS.FLIGHT_LATERAL_SPREAD_WEIGHT),
        );
        flightTarget = add2D(flightTarget, windVector);
      }

      updateHeadingFromTarget(flightTarget);
    } else {
      const wasFlying = agent.isFlying;
      agent.isFlying = false;
      agent.flightTakeoffTimer = 0;

      if (wasFlying) {
        agent.hopVisualTimer = 0;
        agent.landingPauseTimer = randomBetween(
          0,
          PARAMS.POST_FLIGHT_LANDING_PAUSE_MAX_REAL_S,
        );
        agent.hopCooldownTimer = Math.max(
          agent.hopCooldownTimer,
          randomBetween(
            PARAMS.POST_FLIGHT_HOP_COOLDOWN_MIN_REAL_S,
            PARAMS.POST_FLIGHT_HOP_COOLDOWN_MAX_REAL_S,
          ) * groundHopCooldownScale,
        );
        agent.previousScreenPosition = null;
      }

      if (agent.state === AGENT_STATES.PAUSED) {
        const neighbors = collectNeighbors(
          agents,
          grid,
          index,
          perceptionRadiusPx,
          gridCellSizePx,
        );
        let forceRepulsion = { x: 0, y: 0 };
        let forceAlignment = { x: 0, y: 0 };
        let forceAttraction = { x: 0, y: 0 };
        let forceCannibalism = { x: 0, y: 0 };
        let neighborsInAlignmentZone = 0;
        let rearThreatDetected = false;
        let contactEscapeDetected = false;
        let crowded = false;

        neighbors.forEach(({ neighbor, dx, dy, distSq }) => {
          const dist = Math.sqrt(distSq);
          const towardNeighbor = normalize2D(dx, dy, headingVector);
          const neighborDirection = normalize2D(neighbor.vx, neighbor.vy, {
            x: 0,
            y: 0,
          });
          const towardAgent = normalize2D(-dx, -dy, headingVector);
          const rearPositionDot =
            towardNeighbor.x * -headingVector.x +
            towardNeighbor.y * -headingVector.y;
          const rearApproachDot =
            neighborDirection.x * towardAgent.x +
            neighborDirection.y * towardAgent.y;

          if (controls.HUNGER_MODE) {
            if (
              rearPositionDot >= PARAMS.REAR_THREAT_DOT_THRESHOLD &&
              rearApproachDot >= PARAMS.REAR_THREAT_DOT_THRESHOLD
            ) {
              rearThreatDetected = true;
              forceCannibalism = add2D(
                forceCannibalism,
                scale2D(towardAgent, PARAMS.CANNIBALISM_REAR_ESCAPE_WEIGHT),
              );
            }

            const frontDot =
              towardNeighbor.x * headingVector.x +
              towardNeighbor.y * headingVector.y;
            if (
              frontDot >= PARAMS.CANNIBALISM_FRONT_DOT_THRESHOLD &&
              dist > hopperRepulsionRadiusPx
            ) {
              forceCannibalism = add2D(
                forceCannibalism,
                scale2D(towardNeighbor, PARAMS.CANNIBALISM_PURSUIT_WEIGHT),
              );
            }
          }

          if (dist <= hopperRepulsionRadiusPx) {
            const away = normalize2D(-dx, -dy, headingVector);
            crowded = true;
            contactEscapeDetected = true;
            forceRepulsion = add2D(forceRepulsion, away);

            if (dist <= hopperJumpEscapeRadiusPx) {
              mustJumpFromContact = true;
            }

            if (
              rearPositionDot >= PARAMS.REAR_THREAT_DOT_THRESHOLD &&
              rearApproachDot >= PARAMS.REAR_THREAT_DOT_THRESHOLD
            ) {
              rearThreatDetected = true;
            }
            return;
          }

          if (dist <= alignmentRadiusPx) {
            const aligned = normalize2D(
              neighbor.vx,
              neighbor.vy,
              headingVector,
            );
            forceAlignment = add2D(forceAlignment, aligned);
            neighborsInAlignmentZone += 1;
            return;
          }

          const attraction = normalize2D(dx, dy, headingVector);
          forceAttraction = add2D(forceAttraction, attraction);
        });

        agent.isCrowded = crowded;
        agent.pauseTimer += timerDt;
        agent.vx = 0;
        agent.vy = 0;

        let targetVector = add2D(
          scale2D(forceRepulsion, PARAMS.REPULSION_WEIGHT),
          scale2D(forceAlignment, PARAMS.ALIGNMENT_WEIGHT),
        );
        targetVector = add2D(
          targetVector,
          scale2D(
            forceAttraction,
            neighborsInAlignmentZone >= PARAMS.OCCLUSION_THRESHOLD
              ? 0
              : controls.ATTRACTION_WEIGHT,
          ),
        );
        targetVector = add2D(targetVector, forceCannibalism);
        targetVector = add2D(
          targetVector,
          scale2D(
            getEdgeAvoidanceForce(
              agent,
              width,
              height,
              halfWidth,
              halfHeight,
              edgeAvoidanceZonePx,
            ),
            PARAMS.EDGE_AVOIDANCE_WEIGHT,
          ),
        );

        const forcedByRearThreat =
          rearThreatDetected &&
          Math.random() < PARAMS.REAR_THREAT_MARCH_PROBABILITY;
        const resumeChance =
          1 -
          Math.pow(
            1 -
              PARAMS.RESUME_PROBABILITY_PER_SIM_SECOND *
                groundTemperatureWakeScale,
            Math.max(timerDt, 0),
          );
        const crowdWakeChance =
          1 -
          Math.pow(
            1 -
              PARAMS.CROWD_WAKE_PROBABILITY_PER_SIM_SECOND *
                groundTemperatureWakeScale,
            Math.max(timerDt, 0),
          );
        const minPauseDurationS =
          agent.minPauseDurationS ?? PARAMS.MIN_PAUSE_DURATION_S;
        const shouldResume =
          contactEscapeDetected ||
          forcedByRearThreat ||
          (agent.pauseTimer >= minPauseDurationS &&
            Math.random() < resumeChance) ||
          (pausedFraction > PARAMS.MAX_PAUSED_FRACTION &&
            agent.pauseTimer >= minPauseDurationS * 0.35 &&
            Math.random() < crowdWakeChance);

        if (!shouldResume) {
          agent.spriteState = {
            isJumping: false,
            isFlying: false,
            isTakingOff: false,
            jumpProgress: 0,
            directionX: headingVector.x,
            directionY: headingVector.y,
          };
          return;
        }

        const pauseTimer = agent.pauseTimer;
        agent.state = AGENT_STATES.MARCHING;
        agent.activityTimer = forcedByRearThreat
          ? PARAMS.REAR_THREAT_RESUME_ACTIVITY_S
          : randomBetween(
              0,
              (agent.activityDurationS ?? PARAMS.ACTIVITY_DURATION_S) * 0.18,
            );
        agent.pauseTimer = 0;
        resumeFromPause(agent, pauseTimer);
        updateHeadingFromTarget(targetVector);

        if (mustJumpFromContact || forcedByRearThreat) {
          agent.rearThreatTimer = PARAMS.REAR_THREAT_BOOST_WINDOW_S;
          agent.hopVisualTimer = PARAMS.HOP_VISUAL_DURATION_REAL_S;
        }
      }

      if (agent.state === AGENT_STATES.MARCHING) {
        agent.activityTimer += timerDt;
        if (
          agent.activityTimer >=
          (agent.activityDurationS ?? PARAMS.ACTIVITY_DURATION_S)
        ) {
          agent.state = AGENT_STATES.PAUSED;
          agent.activityTimer = 0;
          agent.vx = 0;
          agent.vy = 0;
          return;
        }
      }

      if (agent.rearThreatTimer > 0) {
        agent.rearThreatTimer = Math.max(0, agent.rearThreatTimer - timerDt);
      }

      const repulsionNeighbors = collectNeighbors(
        agents,
        grid,
        index,
        hopperRepulsionRadiusPx,
        gridCellSizePx,
      );
      agent.isCrowded = repulsionNeighbors.length > 0;
      let contactEscapeDirection = { x: 0, y: 0 };
      let cannibalismDirection = { x: 0, y: 0 };
      repulsionNeighbors.forEach(({ dx, dy, distSq }) => {
        const dist = Math.sqrt(distSq);
        const away = normalize2D(-dx, -dy, headingVector);
        contactEscapeDirection = add2D(contactEscapeDirection, away);

        if (dist <= hopperJumpEscapeRadiusPx) {
          mustJumpFromContact = true;
        }
      });

      if (controls.HUNGER_MODE) {
        const cannibalismNeighbors = collectNeighbors(
          agents,
          grid,
          index,
          perceptionRadiusPx,
          gridCellSizePx,
        );

        cannibalismNeighbors.forEach(({ neighbor, dx, dy, distSq }) => {
          const dist = Math.sqrt(distSq);
          const towardNeighbor = normalize2D(dx, dy, headingVector);
          const neighborDirection = normalize2D(neighbor.vx, neighbor.vy, {
            x: 0,
            y: 0,
          });
          const towardAgent = normalize2D(-dx, -dy, headingVector);
          const rearPositionDot =
            towardNeighbor.x * -headingVector.x +
            towardNeighbor.y * -headingVector.y;
          const rearApproachDot =
            neighborDirection.x * towardAgent.x +
            neighborDirection.y * towardAgent.y;

          if (
            rearPositionDot >= PARAMS.REAR_THREAT_DOT_THRESHOLD &&
            rearApproachDot >= PARAMS.REAR_THREAT_DOT_THRESHOLD
          ) {
            cannibalismDirection = add2D(
              cannibalismDirection,
              scale2D(towardAgent, PARAMS.CANNIBALISM_REAR_ESCAPE_WEIGHT),
            );
            agent.rearThreatTimer = PARAMS.REAR_THREAT_BOOST_WINDOW_S;
          }

          const frontDot =
            towardNeighbor.x * headingVector.x +
            towardNeighbor.y * headingVector.y;
          if (
            frontDot >= PARAMS.CANNIBALISM_FRONT_DOT_THRESHOLD &&
            dist > hopperRepulsionRadiusPx
          ) {
            cannibalismDirection = add2D(
              cannibalismDirection,
              scale2D(towardNeighbor, PARAMS.CANNIBALISM_PURSUIT_WEIGHT),
            );
          }
        });
      }

      const headingNoise = randomBetween(
        -PARAMS.NOISE_STRENGTH,
        PARAMS.NOISE_STRENGTH,
      );
      const groundReturnForce = getReturnBandForce(
        agent,
        width,
        height,
        groundReturnMarginPx,
      );
      const isAvoidingGroundEdge =
        Math.hypot(groundReturnForce.x, groundReturnForce.y) >
        PARAMS.GROUND_EDGE_FORCE_PRIORITY_THRESHOLD;
      const hasContactEscape =
        Math.hypot(contactEscapeDirection.x, contactEscapeDirection.y) > 1e-6;
      const targetDirection = isAvoidingGroundEdge
        ? add2D(
            scale2D(groundReturnForce, PARAMS.GROUND_RETURN_EDGE_WEIGHT),
            hasContactEscape
              ? scale2D(contactEscapeDirection, PARAMS.REPULSION_WEIGHT)
              : { x: 0, y: 0 },
          )
        : hasContactEscape
          ? add2D(
              scale2D(contactEscapeDirection, PARAMS.REPULSION_WEIGHT),
              add2D(
                cannibalismDirection,
                scale2D(groundReturnForce, PARAMS.GROUND_RETURN_EDGE_WEIGHT),
              ),
            )
          : add2D(
              add2D(
                vectorFromAngle(agent.heading + headingNoise),
                cannibalismDirection,
              ),
              scale2D(groundReturnForce, PARAMS.GROUND_RETURN_EDGE_WEIGHT),
            );
      const targetHeading = Math.atan2(targetDirection.y, targetDirection.x);
      const maxTurn = PARAMS.MAX_TURN_RATE_RAD_PER_SIM_SECOND * movementDt;
      agent.heading = rotateTowardAngle(agent.heading, targetHeading, maxTurn);
    }

    const hopProbabilityBase = canFly
      ? 0
      : agent.isCrowded
        ? 0
        : PARAMS.BASE_HOP_PROBABILITY;
    const hopProbability =
      1 -
      Math.pow(1 - clamp(hopProbabilityBase, 0, 0.95), Math.max(movementDt, 0));
    const canStartGroundHop =
      !canFly &&
      agent.hopVisualTimer <= 0 &&
      agent.landingPauseTimer <= 0 &&
      agent.hopCooldownTimer <= 0;
    if (canStartGroundHop && Math.random() < hopProbability) {
      agent.hopVisualTimer = PARAMS.HOP_VISUAL_DURATION_REAL_S;
    }

    if (canStartGroundHop && mustJumpFromContact) {
      agent.hopVisualTimer = PARAMS.HOP_VISUAL_DURATION_REAL_S;
    }

    let speedPxPerSimSecond = canFly
      ? flightSpeedPx *
        flightTemperatureSpeedScale *
        agent.flightSpeedFactor *
        agent.flightSpeedSync
      : baseSpeedPx * groundTemperatureSpeedScale;
    const isLandingPaused = !canFly && agent.landingPauseTimer > 0;
    if (isLandingPaused) {
      speedPxPerSimSecond = 0;
    } else if (!canFly && agent.hopVisualTimer > 0) {
      speedPxPerSimSecond += hopSpeedBonusPx;
    }

    const direction = vectorFromAngle(agent.heading);
    agent.vx = direction.x * speedPxPerSimSecond + flightWindDriftVelocity.x;
    agent.vy = direction.y * speedPxPerSimSecond + flightWindDriftVelocity.y;
    agent.x += agent.vx * movementDt;
    agent.y += agent.vy * movementDt;
    let startedLandingPause = false;
    if (agent.hopVisualTimer > 0) {
      const wasHopping = agent.hopVisualTimer > 0;
      agent.hopVisualTimer = Math.max(0, agent.hopVisualTimer - dt);
      if (wasHopping && agent.hopVisualTimer === 0 && !canFly) {
        agent.landingPauseTimer = PARAMS.LANDING_PAUSE_REAL_S;
        agent.hopCooldownTimer =
          PARAMS.HOP_COOLDOWN_REAL_S * groundHopCooldownScale;
        startedLandingPause = true;
      }
    }

    if (agent.landingPauseTimer > 0 && !startedLandingPause) {
      agent.landingPauseTimer = Math.max(0, agent.landingPauseTimer - dt);
    }

    if (agent.hopCooldownTimer > 0) {
      agent.hopCooldownTimer = Math.max(0, agent.hopCooldownTimer - dt);
    }

    if (agent.flightTakeoffTimer > 0) {
      agent.flightTakeoffTimer = Math.max(0, agent.flightTakeoffTimer - dt);
    }

    agent.spriteState = {
      isJumping: !canFly && agent.hopVisualTimer > 0,
      isFlying: canFly,
      isTakingOff: canFly && agent.flightTakeoffTimer > 0,
      jumpProgress:
        canFly && agent.flightTakeoffTimer > 0
          ? 1 - agent.flightTakeoffTimer / PARAMS.HOP_VISUAL_DURATION_REAL_S
          : 1 - agent.hopVisualTimer / PARAMS.HOP_VISUAL_DURATION_REAL_S,
      directionX: direction.x,
      directionY: direction.y,
    };
    agent.spriteVelocity = { x: agent.vx, y: agent.vy };
    agent.spritePosition = { x: agent.x, y: agent.y };
  });
};

export function App({ controls, onGpuErrorChange, isPaused = false }) {
  const canvasRef = React.useRef(null);
  const imageRef = React.useRef(null);
  const rasterCanvasRef = React.useRef(null);
  const animationFrameRef = React.useRef(0);
  const agentsRef = React.useRef([]);
  const frameSizeRef = React.useRef(
    resolveAtlasFrameSize(ATLAS, { width: 64, height: 64 }),
  );
  const lastTimeRef = React.useRef(0);

  const resolvedControls = React.useMemo(
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

    applyTransparentCanvasStyle(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return undefined;
    }

    const render = (timestamp) => {
      const now = timestamp * 0.001;
      const dt = lastTimeRef.current
        ? Math.min(now - lastTimeRef.current, 0.05)
        : 0.016;
      lastTimeRef.current = now;

      const size = syncCanvasSize(canvas, ctx);
      const frameSize = frameSizeRef.current;
      resizeAgents(
        agentsRef.current,
        resolvedControls.COUNT,
        size.width,
        size.height,
      );

      if (!isPaused) {
        updateGrasshopperAgents(
          agentsRef.current,
          resolvedControls,
          size.width,
          size.height,
          dt,
          now,
          frameSize,
        );
      }

      clearTransparentCanvas2d(ctx, size.width, size.height);

      const image = rasterCanvasRef.current || imageRef.current;
      if (!image) {
        animationFrameRef.current = window.requestAnimationFrame(render);
        return;
      }

      agentsRef.current.forEach((agent, index) => {
        const renderPosition = { x: agent.x, y: agent.y };
        const sprite = resolveCanvasAtlasSprite(ATLAS, {
          space: agent.spriteSpace || "2d",
          position: renderPosition,
          velocity: agent.spriteVelocity || { x: agent.vx, y: agent.vy },
          previousScreenPosition: agent.previousScreenPosition,
          maxDt: dt,
          width: size.width,
          height: size.height,
          projectPoint: agent.projectPoint,
          state: {
            isJumping: Boolean(agent.spriteState?.isJumping),
            isFlying: Boolean(agent.spriteState?.isFlying),
            isTakingOff: Boolean(agent.spriteState?.isTakingOff),
            jumpProgress: clamp(agent.spriteState?.jumpProgress ?? 0, 0, 1),
            directionX:
              agent.spriteState?.directionX ?? Math.cos(agent.heading),
            directionY:
              agent.spriteState?.directionY ?? Math.sin(agent.heading),
          },
          profile: agent.spriteProfile || "simulation",
          timestampMs: now * 1000,
          animationOffsetMs: agent.stageOffset,
        });

        const bobAmplitude =
          agent.state === AGENT_STATES.MARCHING
            ? bodyLengthsToPx(PARAMS.MARCH_BOB_BODY_LENGTHS)
            : bodyLengthsToPx(PARAMS.REST_BOB_BODY_LENGTHS);
        const bobOffset =
          Math.sin(now * PARAMS.BOB_RATE + index * 0.7) * bobAmplitude;
        const drawWidth = frameSize.width * PARAMS.SPRITE_SCALE;
        const drawHeight = frameSize.height * PARAMS.SPRITE_SCALE;
        agent.previousScreenPosition = sprite.pose.screenPosition;

        ctx.save();
        ctx.translate(renderPosition.x, renderPosition.y + bobOffset);
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

      animationFrameRef.current = window.requestAnimationFrame(render);
    };

    animationFrameRef.current = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPaused, resolvedControls]);

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

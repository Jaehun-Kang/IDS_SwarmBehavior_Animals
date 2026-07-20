import React from "react";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { resolveAtlasFrameSize } from "../../utils/spriteAtlas";
import { resolveCanvasAtlasSprite } from "../../utils/spritePose";
import {
  applyTransparentCanvasStyle,
  clearTransparentCanvas2d,
} from "../../utils/transparentCanvas";

const ATLAS = HOME_SPRITE_ATLASES.bat;

const PARAMS = {
  DEFAULT_COUNT: 180,
  DEFAULT_IS_EMERGING: true,
  DEFAULT_LIGHT_INTENSITY_LUX: 1.4,
  DEFAULT_ACOUSTIC_GAIN: 1,
  DEFAULT_EXIT_PULL: 0.52,
  DEFAULT_RECOVERY_ACCEL_MPS2: 5,
  METERS_TO_PIXELS: 54,
  SPRITE_SCALE: 0.18,
  BASE_SPEED_MPS: 9,
  SPEED_MIN_MPS: 4,
  SPEED_MAX_MPS: 15,
  WALL_MIN_SPEED_MPS: 1,
  WINGBEAT_FREQUENCY_HZ: 10.3,
  WINGBEAT_SPEED_OSCILLATION_MPS: 0.32,
  MAX_LATERAL_ACCEL_MPS2: 19.62,
  HALF_WINGSPAN_M: 0.13,
  BAT_LENGTH_M: 0.09,
  ALIGN_RADIUS_M: 3,
  ACOUSTIC_RADIUS_M: 2,
  MAX_NEIGHBOR_QUERY_RADIUS_M: 4,
  FRONT_HALF_ANGLE_RAD: Math.PI / 4,
  ACOUSTIC_HALF_ANGLE_RAD: Math.PI / 2,
  TARGET_DISTANCE_MIN_M: 0.47,
  TARGET_DISTANCE_MAX_M: 0.9,
  CRITICAL_DISTANCE_M: 0.13,
  LIGHT_LOW_LUX: 1.4,
  LIGHT_HIGH_LUX: 350,
  RECOVERY_DURATION_S: 1.5,
  MIN_ALIGNMENT_DELAY_S: 0.08,
  MAX_ALIGNMENT_DELAY_S: 0.5,
  HISTORY_INTERVAL_S: 0.03,
  HISTORY_WINDOW_S: 0.48,
  HEIGHT_MIN_M: 1.2,
  HEIGHT_MAX_M: 4.8,
  HEIGHT_OSCILLATION_M: 0.45,
  HEIGHT_OSCILLATION_HZ: 0.19,
  OFFSCREEN_RESPAWN_MARGIN_M: 2.4,
  ENTRANCE_RADIUS_M: 3.2,
  ENTRANCE_JITTER_M: 1.35,
  INITIAL_HEADING_JITTER_RAD: 0.28,
  EMERGENCE_TRANSITION_DISTANCE_M: 2.8,
  RETURN_CAPTURE_RADIUS_M: 3.2,
  RETURN_DELAY_MIN_S: 1.2,
  RETURN_DELAY_MAX_S: 5.6,
  ENTERING_DURATION_S: 0.22,
  EXITING_DURATION_S: 0.26,
  EMERGENCE_RELEASE_WINDOW_S: 2.6,
  OUTSIDE_ROAM_MIN_S: 6,
  OUTSIDE_ROAM_MAX_S: 12,
  POST_EMERGENCE_COHESION_S: 3.8,
  POST_EMERGENCE_FORWARD_WEIGHT: 0.52,
  POST_EMERGENCE_ALIGNMENT_MULTIPLIER: 1.45,
  POST_EMERGENCE_CENTER_BOOST: 0.22,
  POST_EMERGENCE_ORBIT_DAMPING: 0.12,
  POST_EMERGENCE_WANDER_DAMPING: 0.06,
  BASE_FORWARD_BLEND: 0.26,
  BASE_SPEED_RESPONSE: 3.4,
  ACOUSTIC_STEER_WEIGHT: 1.55,
  ALIGNMENT_WEIGHT: 1.35,
  PLUME_PULL_START_M: 1.4,
  PLUME_HALF_WIDTH_M: 3.2,
  PLUME_PULL_WEIGHT: 0.52,
  OUTSIDE_CENTER_PULL_WEIGHT: 0.32,
  OUTSIDE_ORBIT_WEIGHT: 0.22,
  OUTSIDE_WANDER_WEIGHT: 0.18,
  BOUNDARY_MARGIN_M: 1.8,
  BOUNDARY_PULL_WEIGHT: 0.7,
  TRANSIT_ALIGNMENT_MULTIPLIER: 1.2,
  OUTSIDE_ALIGNMENT_MULTIPLIER: 0.72,
  TRANSIT_SPEED_BONUS_MPS: 0.65,
  RETURN_SPEED_DAMPING: 0.9,
  LOW_LIGHT_ATTRACTION_WEIGHT: 1,
  BRIGHT_LIGHT_REPULSION_WEIGHT: 1.25,
  PROXIMITY_BRAKE_WEIGHT: 0.38,
  EVASION_DURATION_S: 0.18,
  EVASION_BRAKE_RATIO: 0.72,
  EVASION_LATERAL_WEIGHT: 1.4,
  VISUAL_BOB_PX: 2.6,
};

const CONTROL_FIELDS = [
  {
    key: "IS_EMERGING",
    label: "동굴 이동 방향",
    type: "toggle",
    formatValue: (value) => (value ? "나오기" : "들어가기"),
  },
  {
    key: "COUNT",
    label: "개체 수",
    min: 40,
    max: 320,
    step: 4,
    formatValue: (value) => `${Math.round(value)} 마리`,
  },
  {
    key: "LIGHT_INTENSITY_LUX",
    label: "출구 조도",
    min: 0,
    max: 400,
    step: 0.1,
    formatValue: (value) => `${Number(value).toFixed(1)} lx`,
  },
  {
    key: "ACOUSTIC_GAIN",
    label: "음향 회피 민감도",
    min: 0,
    max: 2,
    step: 0.05,
    formatValue: (value) => value.toFixed(2),
  },
  {
    key: "EXIT_PULL",
    label: "통로 유인 강도",
    min: 0,
    max: 1,
    step: 0.02,
    formatValue: (value) => value.toFixed(2),
  },
  {
    key: "RECOVERY_ACCEL_MPS2",
    label: "전환 가속",
    min: 2,
    max: 8,
    step: 0.1,
    formatValue: (value) => `${value.toFixed(1)} m/s²`,
  },
];

const DEFAULT_CONTROL_STATE = {
  COUNT: PARAMS.DEFAULT_COUNT,
  IS_EMERGING: PARAMS.DEFAULT_IS_EMERGING,
  LIGHT_INTENSITY_LUX: PARAMS.DEFAULT_LIGHT_INTENSITY_LUX,
  ACOUSTIC_GAIN: PARAMS.DEFAULT_ACOUSTIC_GAIN,
  EXIT_PULL: PARAMS.DEFAULT_EXIT_PULL,
  RECOVERY_ACCEL_MPS2: PARAMS.DEFAULT_RECOVERY_ACCEL_MPS2,
};

const BAT_PHASES = {
  EMERGING: "emerging",
  OUTSIDE: "outside",
  LOITERING: "loitering",
  RETURNING: "returning",
  EXITING: "exiting",
  ENTERING: "entering",
  INSIDE: "inside",
};

const ENTRANCE_ZONE_HEIGHT_RATIO = 1;
const ENTRANCE_ZONE_ROTATION_RAD = 0;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (start, end, amount) => start + (end - start) * amount;
const randomBetween = (min, max) => min + Math.random() * (max - min);
const metersToPx = (meters) => meters * PARAMS.METERS_TO_PIXELS;
const pxToMeters = (pixels) => pixels / PARAMS.METERS_TO_PIXELS;

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

const shortestAngleDelta = (from, to) => wrapAngle(to - from);

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

const angleToVector = (angle) => ({
  x: Math.cos(angle),
  y: Math.sin(angle),
});

const projectPointOnLine = (point, origin, direction) => {
  const t =
    (point.x - origin.x) * direction.x + (point.y - origin.y) * direction.y;

  return {
    x: origin.x + direction.x * t,
    y: origin.y + direction.y * t,
    t,
  };
};

const getEnvironment = (width, height) => {
  const entrance = { x: width * 0.5, y: height * 0.9 };
  const skyCenter = { x: width * 0.5, y: height * 0.4 };
  const exit = { x: width * 0.5, y: height * 0.68 };
  const light = { x: width * 0.84, y: height * 0.12 };
  return {
    entrance,
    skyCenter,
    exit,
    light,
    tangent: normalize2D(skyCenter.x - entrance.x, skyCenter.y - entrance.y),
  };
};

const getEntranceZone = (environment) => {
  const radiusX = metersToPx(PARAMS.RETURN_CAPTURE_RADIUS_M);
  return {
    centerX: environment.entrance.x,
    centerY: environment.entrance.y,
    radiusX,
    radiusY: radiusX * ENTRANCE_ZONE_HEIGHT_RATIO,
    rotation: ENTRANCE_ZONE_ROTATION_RAD,
  };
};

const isInsideEntranceZone = (point, environment) => {
  const zone = getEntranceZone(environment);
  const translatedX = point.x - zone.centerX;
  const translatedY = point.y - zone.centerY;
  const cosRotation = Math.cos(zone.rotation);
  const sinRotation = Math.sin(zone.rotation);
  const localX = translatedX * cosRotation + translatedY * sinRotation;
  const localY = -translatedX * sinRotation + translatedY * cosRotation;

  return (
    (localX * localX) / Math.max(zone.radiusX * zone.radiusX, 1) +
      (localY * localY) / Math.max(zone.radiusY * zone.radiusY, 1) <=
    1
  );
};

const drawEntranceOpening = (ctx, entranceZone) => {
  const { centerX, centerY, radiusX, radiusY } = entranceZone;
  const openingRadius = Math.min(radiusX, radiusY) * 0.92;

  ctx.save();

  ctx.fillStyle = "rgba(10, 12, 18, 0.72)";
  ctx.beginPath();
  ctx.arc(centerX, centerY, openingRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

const sampleInboundSpawn = (width, height) => {
  const offscreenMarginPx = metersToPx(PARAMS.OFFSCREEN_RESPAWN_MARGIN_M);
  const edge = Math.floor(Math.random() * 3);

  if (edge === 0) {
    return {
      x: width + randomBetween(0, offscreenMarginPx),
      y: randomBetween(height * 0.08, height * 0.72),
    };
  }

  if (edge === 1) {
    return {
      x: randomBetween(width * 0.28, width * 0.92),
      y: -randomBetween(0, offscreenMarginPx),
    };
  }

  return {
    x: randomBetween(width * 0.24, width * 0.88),
    y: height + randomBetween(0, offscreenMarginPx * 0.45),
  };
};

const sampleOutsideRoamDuration = () =>
  randomBetween(PARAMS.OUTSIDE_ROAM_MIN_S, PARAMS.OUTSIDE_ROAM_MAX_S);

const getPostEmergenceCohesionRatio = (agent, controls) => {
  if (!controls.IS_EMERGING || agent.phase !== BAT_PHASES.OUTSIDE) {
    return 0;
  }

  return clamp(
    agent.phaseTimerS / Math.max(PARAMS.POST_EMERGENCE_COHESION_S, 1e-6),
    0,
    1,
  );
};

const getOutsideTransitSteer = (agent, environment, width, height) => {
  const forward = environment.tangent;
  const toSkyCenter = normalize2D(
    environment.skyCenter.x - agent.x,
    environment.skyCenter.y - agent.y,
    environment.tangent,
  );
  const corridorContainment = getPlumeContainmentSteer(
    agent,
    environment.entrance,
    environment.tangent,
    0.82,
  );
  const offscreenReturn = getOffscreenReturnSteer(agent, width, height);

  return {
    x:
      forward.x * PARAMS.POST_EMERGENCE_FORWARD_WEIGHT +
      toSkyCenter.x * PARAMS.POST_EMERGENCE_CENTER_BOOST +
      corridorContainment.x +
      offscreenReturn.x,
    y:
      forward.y * PARAMS.POST_EMERGENCE_FORWARD_WEIGHT +
      toSkyCenter.y * PARAMS.POST_EMERGENCE_CENTER_BOOST +
      corridorContainment.y +
      offscreenReturn.y,
  };
};

const getPlumeContainmentSteer = (
  agent,
  origin,
  direction,
  weightMultiplier = 1,
) => {
  const projection = projectPointOnLine(agent, origin, direction);
  const offsetX = agent.x - projection.x;
  const offsetY = agent.y - projection.y;
  const lateralDistance = Math.hypot(offsetX, offsetY);
  const startPullPx = metersToPx(PARAMS.PLUME_PULL_START_M);
  const halfWidthPx = metersToPx(PARAMS.PLUME_HALF_WIDTH_M);

  if (lateralDistance <= startPullPx || lateralDistance < 1e-4) {
    return { x: 0, y: 0 };
  }

  const pullStrength =
    clamp(
      (lateralDistance - startPullPx) / Math.max(halfWidthPx - startPullPx, 1),
      0,
      1,
    ) *
    PARAMS.PLUME_PULL_WEIGHT *
    weightMultiplier;

  return {
    x: (-offsetX / lateralDistance) * pullStrength,
    y: (-offsetY / lateralDistance) * pullStrength,
  };
};

const getOffscreenReturnSteer = (agent, width, height) => {
  const marginPx = metersToPx(PARAMS.BOUNDARY_MARGIN_M);
  const targetX = clamp(agent.x, width * 0.12, width * 0.88);
  const targetY = clamp(agent.y, height * 0.12, height * 0.88);
  const overshootX =
    agent.x < 0 ? -agent.x : agent.x > width ? agent.x - width : 0;
  const overshootY =
    agent.y < 0 ? -agent.y : agent.y > height ? agent.y - height : 0;
  let steerX = 0;
  let steerY = 0;

  if (overshootX > 0) {
    const pullX = clamp(overshootX / Math.max(marginPx, 1), 0, 1);
    steerX =
      normalize2D(targetX - agent.x, 0, { x: 0, y: 0 }).x *
      pullX *
      PARAMS.BOUNDARY_PULL_WEIGHT;
  }

  if (overshootY > 0) {
    const pullY = clamp(overshootY / Math.max(marginPx, 1), 0, 1);
    steerY =
      normalize2D(0, targetY - agent.y, { x: 0, y: 0 }).y *
      pullY *
      PARAMS.BOUNDARY_PULL_WEIGHT;
  }

  return { x: steerX, y: steerY };
};

const getOutsideRoamSteer = (agent, environment, width, height, timeS) => {
  const postEmergenceRatio = getPostEmergenceCohesionRatio(agent, {
    IS_EMERGING: agent.isEmergingMode,
  });
  const toCenter = normalize2D(
    environment.skyCenter.x - agent.x,
    environment.skyCenter.y - agent.y,
    environment.tangent,
  );
  const orbit = {
    x: -toCenter.y * agent.orbitDirection,
    y: toCenter.x * agent.orbitDirection,
  };
  const wander = {
    x: Math.cos(agent.wanderPhase + timeS * 0.58),
    y: Math.sin(agent.wanderPhase + timeS * 0.52),
  };
  const offscreenReturn = getOffscreenReturnSteer(agent, width, height);
  const centerWeight =
    PARAMS.OUTSIDE_CENTER_PULL_WEIGHT +
    PARAMS.POST_EMERGENCE_CENTER_BOOST * postEmergenceRatio;
  const orbitWeight =
    PARAMS.OUTSIDE_ORBIT_WEIGHT *
    lerp(1, PARAMS.POST_EMERGENCE_ORBIT_DAMPING, postEmergenceRatio);
  const wanderWeight =
    PARAMS.OUTSIDE_WANDER_WEIGHT *
    lerp(1, PARAMS.POST_EMERGENCE_WANDER_DAMPING, postEmergenceRatio);

  return {
    x:
      toCenter.x * centerWeight +
      orbit.x * orbitWeight +
      wander.x * wanderWeight +
      offscreenReturn.x,
    y:
      toCenter.y * centerWeight +
      orbit.y * orbitWeight +
      wander.y * wanderWeight +
      offscreenReturn.y,
  };
};

const syncAgentMode = (agent, controls, environment) => {
  if (agent.isEmergingMode === controls.IS_EMERGING) {
    return;
  }

  agent.isEmergingMode = controls.IS_EMERGING;

  if (controls.IS_EMERGING) {
    if (agent.phase === BAT_PHASES.INSIDE) {
      agent.phaseTimerS = randomBetween(0, PARAMS.EMERGENCE_RELEASE_WINDOW_S);
      return;
    }

    if (
      agent.phase === BAT_PHASES.RETURNING ||
      agent.phase === BAT_PHASES.LOITERING ||
      agent.phase === BAT_PHASES.ENTERING
    ) {
      agent.phase = BAT_PHASES.OUTSIDE;
      agent.phaseTimerS = sampleOutsideRoamDuration();
      agent.outsideRoamDurationS = agent.phaseTimerS;
    }
    return;
  }

  const isInsideEntrance = isInsideEntranceZone(agent, environment);

  if (
    agent.phase === BAT_PHASES.OUTSIDE ||
    agent.phase === BAT_PHASES.EMERGING ||
    agent.phase === BAT_PHASES.EXITING
  ) {
    agent.phase = BAT_PHASES.LOITERING;
    agent.phaseTimerS = sampleOutsideRoamDuration();
  } else if (!isInsideEntrance && agent.phase !== BAT_PHASES.LOITERING) {
    agent.phase = BAT_PHASES.RETURNING;
    agent.phaseTimerS = 0;
  }
};

const targetSpeedFromHeight = (flightHeightM) => {
  const heightRatio = clamp(
    (flightHeightM - PARAMS.HEIGHT_MIN_M) /
      (PARAMS.HEIGHT_MAX_M - PARAMS.HEIGHT_MIN_M),
    0,
    1,
  );

  return lerp(8.01, 9.61, heightRatio);
};

const sanitizeControlState = (rawControls = DEFAULT_CONTROL_STATE) => {
  const next = {
    ...DEFAULT_CONTROL_STATE,
    ...(rawControls ?? {}),
  };

  next.COUNT = Math.round(clamp(next.COUNT, 40, 320));
  next.IS_EMERGING = Boolean(next.IS_EMERGING);
  next.LIGHT_INTENSITY_LUX = clamp(next.LIGHT_INTENSITY_LUX, 0, 400);
  next.ACOUSTIC_GAIN = clamp(next.ACOUSTIC_GAIN, 0, 2);
  next.EXIT_PULL = clamp(next.EXIT_PULL, 0, 1);
  next.RECOVERY_ACCEL_MPS2 = clamp(next.RECOVERY_ACCEL_MPS2, 2, 8);

  return next;
};

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

const pushHeadingHistory = (agent, timeS) => {
  const lastSample = agent.headingHistory[agent.headingHistory.length - 1];
  if (lastSample && timeS - lastSample.timeS < PARAMS.HISTORY_INTERVAL_S) {
    lastSample.heading = agent.heading;
    return;
  }

  agent.headingHistory.push({ timeS, heading: agent.heading });

  while (
    agent.headingHistory.length > 0 &&
    timeS - agent.headingHistory[0].timeS > PARAMS.HISTORY_WINDOW_S
  ) {
    agent.headingHistory.shift();
  }
};

const sampleHeadingHistory = (agent, targetTimeS) => {
  if (agent.headingHistory.length === 0) {
    return agent.heading;
  }

  for (let index = agent.headingHistory.length - 1; index >= 0; index -= 1) {
    if (agent.headingHistory[index].timeS <= targetTimeS) {
      return agent.headingHistory[index].heading;
    }
  }

  return agent.headingHistory[0].heading;
};

const buildSpatialGrid = (agents, cellSizePx) => {
  const grid = new Map();

  agents.forEach((agent, index) => {
    const cellX = Math.floor(agent.x / cellSizePx);
    const cellY = Math.floor(agent.y / cellSizePx);
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

const getNeighborIndices = (agent, grid, cellSizePx, radiusPx) => {
  const cellX = Math.floor(agent.x / cellSizePx);
  const cellY = Math.floor(agent.y / cellSizePx);
  const searchRadius = Math.ceil(radiusPx / cellSizePx);
  const indices = [];

  for (let offsetY = -searchRadius; offsetY <= searchRadius; offsetY += 1) {
    for (let offsetX = -searchRadius; offsetX <= searchRadius; offsetX += 1) {
      const bucket = grid.get(`${cellX + offsetX}:${cellY + offsetY}`);
      if (bucket) {
        indices.push(...bucket);
      }
    }
  }

  return indices;
};

const resetAgentAtEntrance = (
  agent,
  width,
  height,
  timeS,
  isEmerging = true,
) => {
  const environment = getEnvironment(width, height);
  const jitterRadiusPx = metersToPx(PARAMS.ENTRANCE_JITTER_M);
  const spawnAngle = randomBetween(-Math.PI * 0.48, Math.PI * 0.14);
  const spawnRadius = Math.sqrt(Math.random()) * jitterRadiusPx;
  const flightHeightBaseM = randomBetween(
    PARAMS.HEIGHT_MIN_M,
    PARAMS.HEIGHT_MAX_M,
  );
  let heading;
  let positionX;
  let positionY;

  if (isEmerging) {
    positionX = environment.entrance.x + Math.cos(spawnAngle) * spawnRadius;
    positionY = environment.entrance.y + Math.sin(spawnAngle) * spawnRadius;
    heading =
      Math.atan2(
        environment.skyCenter.y - environment.entrance.y,
        environment.skyCenter.x - environment.entrance.x,
      ) +
      randomBetween(
        -PARAMS.INITIAL_HEADING_JITTER_RAD,
        PARAMS.INITIAL_HEADING_JITTER_RAD,
      );
    agent.phase = BAT_PHASES.EMERGING;
    agent.phaseTimerS = sampleOutsideRoamDuration();
    agent.outsideRoamDurationS = agent.phaseTimerS;
  } else {
    const inboundSpawn = sampleInboundSpawn(width, height);
    positionX = inboundSpawn.x;
    positionY = inboundSpawn.y;
    heading =
      Math.atan2(
        environment.entrance.y - positionY,
        environment.entrance.x - positionX,
      ) + randomBetween(-0.45, 0.45);
    agent.phase = BAT_PHASES.RETURNING;
    agent.phaseTimerS = 0;
    agent.outsideRoamDurationS = sampleOutsideRoamDuration();
  }

  const speedMps =
    targetSpeedFromHeight(flightHeightBaseM) * randomBetween(0.94, 1.06);
  const direction = angleToVector(heading);

  agent.x = positionX;
  agent.y = positionY;
  agent.heading = heading;
  agent.speedMps = clamp(speedMps, PARAMS.SPEED_MIN_MPS, PARAMS.SPEED_MAX_MPS);
  agent.vx = direction.x * metersToPx(agent.speedMps);
  agent.vy = direction.y * metersToPx(agent.speedMps);
  agent.flightHeightBaseM = flightHeightBaseM;
  agent.flightHeightM = flightHeightBaseM;
  agent.heightPhase = randomBetween(0, Math.PI * 2);
  agent.wingbeatTimer = randomBetween(0, 1);
  agent.collisionCooldownS = 0;
  agent.evasionTimerS = 0;
  agent.leftEarLevel = 0;
  agent.rightEarLevel = 0;
  agent.protestCallActive = false;
  agent.spritePosition = { x: agent.x, y: agent.y };
  agent.spriteVelocity = { x: agent.vx, y: agent.vy };
  agent.previousScreenPosition = null;
  agent.headingHistory = [{ timeS, heading: agent.heading }];
  agent.stageOffset = randomBetween(0, 1000);
  agent.spriteProfile = "simulation";
  agent.spriteSpace = "2d";
  agent.isEmergingMode = isEmerging;
  agent.orbitDirection = Math.random() > 0.5 ? 1 : -1;
  agent.wanderPhase = randomBetween(0, Math.PI * 2);
  agent.dynamicFrontalAngle = PARAMS.FRONT_HALF_ANGLE_RAD;
};

const setAgentInside = (agent, width, height, releaseDelayS = 0) => {
  const environment = getEnvironment(width, height);

  agent.x = environment.entrance.x - metersToPx(PARAMS.ENTRANCE_RADIUS_M) * 0.3;
  agent.y =
    environment.entrance.y + metersToPx(PARAMS.ENTRANCE_RADIUS_M) * 0.18;
  agent.vx = 0;
  agent.vy = 0;
  agent.speedMps = 0;
  agent.phase = BAT_PHASES.INSIDE;
  agent.phaseTimerS = releaseDelayS;
  agent.spritePosition = { x: agent.x, y: agent.y };
  agent.spriteVelocity = { x: 0, y: 0 };
  agent.previousScreenPosition = null;
};

const createExitPlan = (agent, width, height) => {
  const environment = getEnvironment(width, height);
  const spawnAngle = randomBetween(-Math.PI * 0.48, Math.PI * 0.14);
  const spawnRadius =
    Math.sqrt(Math.random()) * metersToPx(PARAMS.ENTRANCE_JITTER_M);
  const targetX = environment.entrance.x + Math.cos(spawnAngle) * spawnRadius;
  const targetY = environment.entrance.y + Math.sin(spawnAngle) * spawnRadius;
  const heading =
    Math.atan2(
      environment.skyCenter.y - environment.entrance.y,
      environment.skyCenter.x - environment.entrance.x,
    ) +
    randomBetween(
      -PARAMS.INITIAL_HEADING_JITTER_RAD,
      PARAMS.INITIAL_HEADING_JITTER_RAD,
    );

  return {
    heading,
    speedMps: Math.max(PARAMS.SPEED_MIN_MPS * 0.45, 0.6),
    phase: BAT_PHASES.EXITING,
    phaseTimerS: PARAMS.EXITING_DURATION_S,
    exitTargetX: targetX,
    exitTargetY: targetY,
  };
};

const createAgent = (width, height, timeS = 0, isEmerging = true) => {
  const agent = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    exitTargetX: 0,
    exitTargetY: 0,
    heading: 0,
    speedMps: PARAMS.BASE_SPEED_MPS,
    flightHeightBaseM: PARAMS.HEIGHT_MIN_M,
    flightHeightM: PARAMS.HEIGHT_MIN_M,
    heightPhase: 0,
    wingbeatTimer: 0,
    collisionCooldownS: 0,
    evasionTimerS: 0,
    leftEarLevel: 0,
    rightEarLevel: 0,
    protestCallActive: false,
    stageOffset: randomBetween(0, 1000),
    previousScreenPosition: null,
    spriteProfile: "simulation",
    spriteSpace: "2d",
    spriteState: undefined,
    spritePosition: undefined,
    spriteVelocity: undefined,
    headingHistory: [],
    phase: BAT_PHASES.EMERGING,
    phaseTimerS: 0,
    outsideRoamDurationS: PARAMS.OUTSIDE_ROAM_MAX_S,
    isEmergingMode: isEmerging,
    orbitDirection: 1,
    wanderPhase: 0,
    dynamicFrontalAngle: PARAMS.FRONT_HALF_ANGLE_RAD,
  };

  resetAgentAtEntrance(agent, width, height, timeS, isEmerging);
  return agent;
};

const resizeAgents = (
  agents,
  targetCount,
  width,
  height,
  timeS,
  isEmerging,
) => {
  const isInitialFill = agents.length === 0;

  while (agents.length < targetCount) {
    const agent = createAgent(width, height, timeS, isEmerging);
    if (!isEmerging) {
      setAgentInside(agent, width, height);
    } else if (isInitialFill) {
      setAgentInside(
        agent,
        width,
        height,
        randomBetween(0, PARAMS.EMERGENCE_RELEASE_WINDOW_S),
      );
    }
    agents.push(agent);
  }

  if (agents.length > targetCount) {
    agents.length = targetCount;
  }
};

const updateBatAgents = (agents, controls, width, height, dt, timeS) => {
  const environment = getEnvironment(width, height);
  const acousticRadiusPx = metersToPx(PARAMS.ACOUSTIC_RADIUS_M);
  const alignmentRadiusPx = metersToPx(PARAMS.ALIGN_RADIUS_M);
  const criticalDistancePx = metersToPx(PARAMS.CRITICAL_DISTANCE_M);
  const emergenceTransitionPx = metersToPx(
    PARAMS.EMERGENCE_TRANSITION_DISTANCE_M,
  );
  const targetDistanceMinPx = metersToPx(PARAMS.TARGET_DISTANCE_MIN_M);
  const cellSizePx = metersToPx(PARAMS.MAX_NEIGHBOR_QUERY_RADIUS_M);

  agents.forEach((agent) => {
    syncAgentMode(agent, controls, environment);
  });

  const grid = buildSpatialGrid(agents, cellSizePx);
  const plans = new Array(agents.length);

  agents.forEach((agent, index) => {
    if (agent.phase === BAT_PHASES.INSIDE) {
      if (controls.IS_EMERGING) {
        const remainingS = Math.max(0, agent.phaseTimerS - dt);

        if (remainingS <= 1e-4) {
          const exitPlan = createExitPlan(agent, width, height);
          plans[index] = {
            x: agent.x,
            y: agent.y,
            heading: exitPlan.heading,
            speedMps: exitPlan.speedMps,
            vx: 0,
            vy: 0,
            leftEarLevel: 0,
            rightEarLevel: 0,
            collisionCooldownS: 0,
            evasionTimerS: 0,
            protestCallActive: false,
            flightHeightM: agent.flightHeightM,
            phase: exitPlan.phase,
            phaseTimerS: exitPlan.phaseTimerS,
            outsideRoamDurationS: agent.outsideRoamDurationS,
            dynamicFrontalAngle: agent.dynamicFrontalAngle,
            exitTargetX: exitPlan.exitTargetX,
            exitTargetY: exitPlan.exitTargetY,
          };
        } else {
          plans[index] = {
            x:
              environment.entrance.x -
              metersToPx(PARAMS.ENTRANCE_RADIUS_M) * 0.3,
            y:
              environment.entrance.y +
              metersToPx(PARAMS.ENTRANCE_RADIUS_M) * 0.18,
            heading: agent.heading,
            speedMps: 0,
            vx: 0,
            vy: 0,
            leftEarLevel: 0,
            rightEarLevel: 0,
            collisionCooldownS: 0,
            evasionTimerS: 0,
            protestCallActive: false,
            flightHeightM: agent.flightHeightM,
            phase: BAT_PHASES.INSIDE,
            phaseTimerS: remainingS,
            outsideRoamDurationS: agent.outsideRoamDurationS,
            dynamicFrontalAngle: agent.dynamicFrontalAngle,
          };
        }
      } else {
        plans[index] = {
          x:
            environment.entrance.x - metersToPx(PARAMS.ENTRANCE_RADIUS_M) * 0.3,
          y:
            environment.entrance.y +
            metersToPx(PARAMS.ENTRANCE_RADIUS_M) * 0.18,
          heading: agent.heading,
          speedMps: 0,
          vx: 0,
          vy: 0,
          leftEarLevel: 0,
          rightEarLevel: 0,
          collisionCooldownS: 0,
          evasionTimerS: 0,
          protestCallActive: false,
          flightHeightM: agent.flightHeightM,
          phase: BAT_PHASES.INSIDE,
          phaseTimerS: 0,
          outsideRoamDurationS: agent.outsideRoamDurationS,
          dynamicFrontalAngle: agent.dynamicFrontalAngle,
        };
      }
      return;
    }

    if (agent.phase === BAT_PHASES.EXITING) {
      const remainingS = Math.max(0, agent.phaseTimerS - dt);
      const exitProgress =
        1 - remainingS / Math.max(PARAMS.EXITING_DURATION_S, 1e-6);
      const nextX = lerp(agent.x, agent.exitTargetX, clamp(dt * 9.5, 0, 1));
      const nextY = lerp(agent.y, agent.exitTargetY, clamp(dt * 9.5, 0, 1));
      const nextPhase =
        remainingS <= 1e-4 ? BAT_PHASES.EMERGING : BAT_PHASES.EXITING;
      const nextSpeedMps = lerp(
        Math.max(agent.speedMps, PARAMS.SPEED_MIN_MPS * 0.45),
        targetSpeedFromHeight(agent.flightHeightM),
        exitProgress,
      );
      const nextDirection = angleToVector(agent.heading);

      plans[index] = {
        x: nextX,
        y: nextY,
        heading: agent.heading,
        speedMps: nextSpeedMps,
        vx: nextDirection.x * metersToPx(nextSpeedMps),
        vy: nextDirection.y * metersToPx(nextSpeedMps),
        leftEarLevel: 0,
        rightEarLevel: 0,
        collisionCooldownS: 0,
        evasionTimerS: 0,
        protestCallActive: false,
        flightHeightM: agent.flightHeightM,
        phase: nextPhase,
        phaseTimerS:
          nextPhase === BAT_PHASES.EMERGING
            ? sampleOutsideRoamDuration()
            : remainingS,
        outsideRoamDurationS: agent.outsideRoamDurationS,
        dynamicFrontalAngle: agent.dynamicFrontalAngle,
        exitTargetX: agent.exitTargetX,
        exitTargetY: agent.exitTargetY,
      };
      return;
    }

    if (agent.phase === BAT_PHASES.ENTERING) {
      const remainingS = Math.max(0, agent.phaseTimerS - dt);
      const enterProgress =
        1 - remainingS / Math.max(PARAMS.ENTERING_DURATION_S, 1e-6);
      const targetX = environment.entrance.x;
      const targetY = environment.entrance.y;
      const nextX = lerp(agent.x, targetX, clamp(dt * 10.5, 0, 1));
      const nextY = lerp(agent.y, targetY, clamp(dt * 10.5, 0, 1));
      const nextPhase =
        remainingS <= 1e-4 ? BAT_PHASES.INSIDE : BAT_PHASES.ENTERING;

      plans[index] = {
        x: nextX,
        y: nextY,
        heading: agent.heading,
        speedMps: lerp(agent.speedMps, 0, enterProgress),
        vx: targetX - agent.x,
        vy: targetY - agent.y,
        leftEarLevel: 0,
        rightEarLevel: 0,
        collisionCooldownS: 0,
        evasionTimerS: 0,
        protestCallActive: false,
        flightHeightM: agent.flightHeightM,
        phase: nextPhase,
        phaseTimerS: remainingS,
        outsideRoamDurationS: agent.outsideRoamDurationS,
        dynamicFrontalAngle: agent.dynamicFrontalAngle,
      };
      return;
    }

    const direction = angleToVector(agent.heading);
    const right = { x: -direction.y, y: direction.x };
    const candidates = getNeighborIndices(
      agent,
      grid,
      cellSizePx,
      metersToPx(PARAMS.MAX_NEIGHBOR_QUERY_RADIUS_M),
    );

    let leftEarLevel = 0;
    let rightEarLevel = 0;
    let closestThreat = null;
    let closestThreatDistancePx = Number.POSITIVE_INFINITY;
    let nearestFrontDistancePx = Number.POSITIVE_INFINITY;
    const frontalNeighbors = [];
    let acousticSteerX = 0;
    let acousticSteerY = 0;
    let visualSteerX = 0;
    let visualSteerY = 0;
    let separationX = 0;
    let separationY = 0;
    let separationWeightSum = 0;
    const densityRatio = clamp((candidates.length - 5) / 25, 0, 1);
    const dynamicFrontalAngle = lerp(
      PARAMS.FRONT_HALF_ANGLE_RAD,
      Math.PI / 10,
      densityRatio,
    );
    agent.dynamicFrontalAngle = dynamicFrontalAngle;

    candidates.forEach((otherIndex) => {
      if (otherIndex === index) {
        return;
      }

      const other = agents[otherIndex];
      const offsetX = other.x - agent.x;
      const offsetY = other.y - agent.y;
      const distancePx = Math.hypot(offsetX, offsetY);

      if (
        distancePx < 1e-4 ||
        distancePx > metersToPx(PARAMS.MAX_NEIGHBOR_QUERY_RADIUS_M)
      ) {
        return;
      }

      const relativeAngle = wrapAngle(
        Math.atan2(offsetY, offsetX) - agent.heading,
      );

      if (
        distancePx <= acousticRadiusPx &&
        Math.abs(relativeAngle) <= PARAMS.ACOUSTIC_HALF_ANGLE_RAD
      ) {
        const contribution = 1 / Math.max(pxToMeters(distancePx), 0.05) ** 2;
        if (relativeAngle < 0) {
          leftEarLevel += contribution;
        } else {
          rightEarLevel += contribution;
        }
      }

      if (
        distancePx <= alignmentRadiusPx &&
        Math.abs(relativeAngle) <= dynamicFrontalAngle
      ) {
        frontalNeighbors.push({ other, distancePx });
        nearestFrontDistancePx = Math.min(nearestFrontDistancePx, distancePx);
      }

      if (distancePx < closestThreatDistancePx) {
        closestThreatDistancePx = distancePx;
        closestThreat = {
          x: offsetX / distancePx,
          y: offsetY / distancePx,
        };
      }

      if (distancePx < targetDistanceMinPx) {
        const proximityWeight =
          1 - clamp(distancePx / Math.max(targetDistanceMinPx, 1), 0, 1);
        separationX -= (offsetX / distancePx) * proximityWeight;
        separationY -= (offsetY / distancePx) * proximityWeight;
        separationWeightSum += proximityWeight;
      }
    });

    let phase = agent.phase;
    let phaseTimerS = Math.max(0, agent.phaseTimerS - dt);
    let outsideRoamDurationS = agent.outsideRoamDurationS;
    const projectionAlongPlume = projectPointOnLine(
      agent,
      environment.entrance,
      environment.tangent,
    );
    const distanceToEntrancePx = Math.hypot(
      agent.x - environment.entrance.x,
      agent.y - environment.entrance.y,
    );

    if (controls.IS_EMERGING) {
      if (
        phase === BAT_PHASES.EMERGING &&
        projectionAlongPlume.t >= emergenceTransitionPx
      ) {
        phase = BAT_PHASES.OUTSIDE;
        outsideRoamDurationS = sampleOutsideRoamDuration();
        phaseTimerS = outsideRoamDurationS;
      }
    } else if (phase === BAT_PHASES.LOITERING && phaseTimerS <= 0) {
      phase = BAT_PHASES.RETURNING;
    }

    frontalNeighbors.sort(
      (leftItem, rightItem) => leftItem.distancePx - rightItem.distancePx,
    );
    const alignmentNeighborCount = Math.max(
      1,
      Math.round(lerp(3, 1, densityRatio)),
    );
    const alignmentSample = frontalNeighbors.slice(0, alignmentNeighborCount);

    let desiredX = direction.x;
    let desiredY = direction.y;
    const offscreenReturnSteer = getOffscreenReturnSteer(agent, width, height);
    const acousticLevelSum = leftEarLevel + rightEarLevel;
    const ild = rightEarLevel - leftEarLevel;

    if (acousticLevelSum > 1e-4) {
      const turnStrength =
        clamp(Math.abs(ild) / acousticLevelSum, 0, 1) *
        controls.ACOUSTIC_GAIN *
        PARAMS.ACOUSTIC_STEER_WEIGHT;
      const turnDirection = ild > 0 ? -1 : 1;
      acousticSteerX += right.x * turnDirection * turnStrength;
      acousticSteerY += right.y * turnDirection * turnStrength;
    }

    if (separationWeightSum > 1e-4) {
      const separationScale =
        (1 + controls.ACOUSTIC_GAIN) *
        (phase === BAT_PHASES.LOITERING ? 1.1 : 1.45);
      acousticSteerX += (separationX / separationWeightSum) * separationScale;
      acousticSteerY += (separationY / separationWeightSum) * separationScale;
    }

    if (alignmentSample.length > 0) {
      let alignmentX = 0;
      let alignmentY = 0;
      let weightSum = 0;

      alignmentSample.forEach(({ other, distancePx }) => {
        const distanceDelayS = clamp(
          pxToMeters(distancePx) /
            Math.max(agent.speedMps, PARAMS.WALL_MIN_SPEED_MPS),
          PARAMS.MIN_ALIGNMENT_DELAY_S,
          PARAMS.MAX_ALIGNMENT_DELAY_S,
        );
        const delayedHeading = sampleHeadingHistory(
          other,
          timeS - distanceDelayS,
        );
        const delayedDirection = angleToVector(delayedHeading);
        const weight = 1 / Math.max(distancePx, 1);

        alignmentX += delayedDirection.x * weight;
        alignmentY += delayedDirection.y * weight;
        weightSum += weight;
      });

      if (weightSum > 0) {
        const postEmergenceRatio = getPostEmergenceCohesionRatio(
          { phase, phaseTimerS, isEmergingMode: controls.IS_EMERGING },
          controls,
        );
        const alignmentWeightMultiplier =
          phase === BAT_PHASES.OUTSIDE
            ? lerp(
                PARAMS.OUTSIDE_ALIGNMENT_MULTIPLIER,
                PARAMS.POST_EMERGENCE_ALIGNMENT_MULTIPLIER,
                postEmergenceRatio,
              )
            : phase === BAT_PHASES.LOITERING
              ? PARAMS.OUTSIDE_ALIGNMENT_MULTIPLIER
              : PARAMS.TRANSIT_ALIGNMENT_MULTIPLIER;
        desiredX +=
          (alignmentX / weightSum) *
          PARAMS.ALIGNMENT_WEIGHT *
          alignmentWeightMultiplier;
        desiredY +=
          (alignmentY / weightSum) *
          PARAMS.ALIGNMENT_WEIGHT *
          alignmentWeightMultiplier;
      }
    }

    if (controls.IS_EMERGING && phase === BAT_PHASES.EMERGING) {
      desiredX += environment.tangent.x * (PARAMS.BASE_FORWARD_BLEND * 1.3);
      desiredY += environment.tangent.y * (PARAMS.BASE_FORWARD_BLEND * 1.3);
      const plumeContainment = getPlumeContainmentSteer(
        agent,
        environment.entrance,
        environment.tangent,
        1.18,
      );
      desiredX += plumeContainment.x;
      desiredY += plumeContainment.y;
    } else if (phase === BAT_PHASES.OUTSIDE) {
      const outsideTransit = getOutsideTransitSteer(
        agent,
        environment,
        width,
        height,
      );
      desiredX += outsideTransit.x;
      desiredY += outsideTransit.y;
    } else if (!controls.IS_EMERGING && phase === BAT_PHASES.RETURNING) {
      const toEntrance = normalize2D(
        environment.entrance.x - agent.x,
        environment.entrance.y - agent.y,
        { x: -environment.tangent.x, y: -environment.tangent.y },
      );
      desiredX += toEntrance.x * (controls.EXIT_PULL * 1.5);
      desiredY += toEntrance.y * (controls.EXIT_PULL * 1.5);
      const funnelContainment = getPlumeContainmentSteer(
        agent,
        environment.entrance,
        environment.tangent,
        1.35,
      );
      desiredX += funnelContainment.x;
      desiredY += funnelContainment.y;
    } else if (phase === BAT_PHASES.LOITERING) {
      const outsideRoam = getOutsideRoamSteer(
        agent,
        environment,
        width,
        height,
        timeS,
      );
      desiredX += outsideRoam.x;
      desiredY += outsideRoam.y;
    }

    desiredX += offscreenReturnSteer.x;
    desiredY += offscreenReturnSteer.y;

    const lightVector = normalize2D(
      environment.light.x - agent.x,
      environment.light.y - agent.y,
      environment.tangent,
    );
    const lightLux = controls.LIGHT_INTENSITY_LUX;

    if (controls.IS_EMERGING && lightLux <= PARAMS.LIGHT_LOW_LUX) {
      const attractionRatio =
        1 - lightLux / Math.max(PARAMS.LIGHT_LOW_LUX, 1e-6);
      visualSteerX +=
        lightVector.x *
        controls.EXIT_PULL *
        attractionRatio *
        PARAMS.LOW_LIGHT_ATTRACTION_WEIGHT;
      visualSteerY +=
        lightVector.y *
        controls.EXIT_PULL *
        attractionRatio *
        PARAMS.LOW_LIGHT_ATTRACTION_WEIGHT;
    } else if (!controls.IS_EMERGING && lightLux >= PARAMS.LIGHT_HIGH_LUX) {
      const repulsionRatio = clamp(
        (lightLux - PARAMS.LIGHT_HIGH_LUX) / 50,
        0,
        1,
      );
      visualSteerX +=
        -lightVector.x * repulsionRatio * PARAMS.BRIGHT_LIGHT_REPULSION_WEIGHT;
      visualSteerY +=
        -lightVector.y * repulsionRatio * PARAMS.BRIGHT_LIGHT_REPULSION_WEIGHT;
    }

    let evasionTimerS = Math.max(0, agent.evasionTimerS - dt);
    let protestCallActive = false;

    if (closestThreat && closestThreatDistancePx < criticalDistancePx) {
      evasionTimerS = PARAMS.EVASION_DURATION_S;
      protestCallActive = true;
    }

    if (evasionTimerS > 0 && closestThreat) {
      acousticSteerX -= closestThreat.x;
      acousticSteerY -= closestThreat.y;
      acousticSteerX += right.x * PARAMS.EVASION_LATERAL_WEIGHT;
      acousticSteerY += right.y * PARAMS.EVASION_LATERAL_WEIGHT;
    }

    const acousticMagnitude = Math.hypot(acousticSteerX, acousticSteerY);
    const visualMagnitude = Math.hypot(visualSteerX, visualSteerY);
    const acousticOverrideActive =
      acousticMagnitude > 1e-4 &&
      (closestThreatDistancePx <= targetDistanceMinPx ||
        acousticMagnitude > visualMagnitude * 1.15);
    const visualPriorityScale = acousticOverrideActive
      ? 0
      : acousticMagnitude > visualMagnitude && acousticMagnitude > 1e-4
        ? 0.1
        : 1;

    desiredX += acousticSteerX + visualSteerX * visualPriorityScale;
    desiredY += acousticSteerY + visualSteerY * visualPriorityScale;

    const desiredDirection = normalize2D(desiredX, desiredY, direction);
    const targetHeading = Math.atan2(desiredDirection.y, desiredDirection.x);
    const currentSpeedMps = Math.max(agent.speedMps, PARAMS.WALL_MIN_SPEED_MPS);
    const maxTurnRate = PARAMS.MAX_LATERAL_ACCEL_MPS2 / currentSpeedMps;
    const headingDelta = clamp(
      shortestAngleDelta(agent.heading, targetHeading),
      -maxTurnRate * dt,
      maxTurnRate * dt,
    );
    const nextHeading = wrapAngle(agent.heading + headingDelta);

    const flightHeightM = clamp(
      agent.flightHeightBaseM +
        Math.sin(
          (timeS + agent.heightPhase) *
            PARAMS.HEIGHT_OSCILLATION_HZ *
            Math.PI *
            2,
        ) *
          PARAMS.HEIGHT_OSCILLATION_M,
      PARAMS.HEIGHT_MIN_M,
      PARAMS.HEIGHT_MAX_M,
    );
    const targetBaseSpeedMps = targetSpeedFromHeight(flightHeightM);
    agent.wingbeatTimer += dt;
    const wingbeatOffsetMps =
      Math.sin(
        agent.wingbeatTimer * PARAMS.WINGBEAT_FREQUENCY_HZ * Math.PI * 2,
      ) * PARAMS.WINGBEAT_SPEED_OSCILLATION_MPS;

    let targetSpeedMps = targetBaseSpeedMps + wingbeatOffsetMps;

    if (phase !== BAT_PHASES.LOITERING) {
      targetSpeedMps += PARAMS.TRANSIT_SPEED_BONUS_MPS;
    }

    if (!controls.IS_EMERGING && phase === BAT_PHASES.RETURNING) {
      const entranceSlowdown = clamp(
        distanceToEntrancePx / metersToPx(3.5),
        0.55,
        1,
      );
      targetSpeedMps *= lerp(PARAMS.RETURN_SPEED_DAMPING, 1, entranceSlowdown);
    }

    if (Number.isFinite(nearestFrontDistancePx)) {
      const nearestFrontDistanceM = pxToMeters(nearestFrontDistancePx);
      if (nearestFrontDistanceM < PARAMS.TARGET_DISTANCE_MAX_M) {
        const brakeRatio =
          1 -
          clamp(
            (nearestFrontDistanceM - PARAMS.CRITICAL_DISTANCE_M) /
              (PARAMS.TARGET_DISTANCE_MAX_M - PARAMS.CRITICAL_DISTANCE_M),
            0,
            1,
          );
        targetSpeedMps *=
          1 - brakeRatio * (PARAMS.PROXIMITY_BRAKE_WEIGHT * 0.45);
      }
    }

    targetSpeedMps = clamp(
      targetSpeedMps,
      PARAMS.SPEED_MIN_MPS,
      PARAMS.SPEED_MAX_MPS,
    );

    let nextSpeedMps;
    const collisionCooldownS = 0;
    const speedResponseBoost =
      phase === BAT_PHASES.LOITERING ? 0 : controls.RECOVERY_ACCEL_MPS2 * 0.12;
    nextSpeedMps = lerp(
      agent.speedMps,
      targetSpeedMps,
      clamp(dt * (PARAMS.BASE_SPEED_RESPONSE + speedResponseBoost), 0, 1),
    );

    if (evasionTimerS > 0) {
      nextSpeedMps = Math.max(
        targetBaseSpeedMps * 0.72,
        nextSpeedMps * Math.max(PARAMS.EVASION_BRAKE_RATIO, 0.88),
      );
    }

    nextSpeedMps = clamp(
      nextSpeedMps,
      PARAMS.WALL_MIN_SPEED_MPS,
      PARAMS.SPEED_MAX_MPS,
    );
    const nextDirection = angleToVector(nextHeading);
    let nextX = agent.x + nextDirection.x * metersToPx(nextSpeedMps) * dt;
    let nextY = agent.y + nextDirection.y * metersToPx(nextSpeedMps) * dt;

    if (!controls.IS_EMERGING && phase === BAT_PHASES.RETURNING) {
      if (isInsideEntranceZone({ x: nextX, y: nextY }, environment)) {
        phase = BAT_PHASES.ENTERING;
        phaseTimerS = PARAMS.ENTERING_DURATION_S;
      }
    }

    plans[index] = {
      x: nextX,
      y: nextY,
      heading: nextHeading,
      speedMps: nextSpeedMps,
      vx: nextDirection.x * metersToPx(nextSpeedMps),
      vy: nextDirection.y * metersToPx(nextSpeedMps),
      leftEarLevel,
      rightEarLevel,
      collisionCooldownS,
      evasionTimerS,
      protestCallActive,
      flightHeightM,
      phase,
      phaseTimerS,
      outsideRoamDurationS,
      dynamicFrontalAngle,
    };
  });

  agents.forEach((agent, index) => {
    const plan = plans[index];
    if (!plan) {
      return;
    }

    agent.x = plan.x;
    agent.y = plan.y;
    agent.heading = plan.heading;
    agent.speedMps = plan.speedMps;
    agent.vx = plan.vx;
    agent.vy = plan.vy;
    agent.leftEarLevel = plan.leftEarLevel;
    agent.rightEarLevel = plan.rightEarLevel;
    agent.collisionCooldownS = plan.collisionCooldownS;
    agent.evasionTimerS = plan.evasionTimerS;
    agent.protestCallActive = plan.protestCallActive;
    agent.flightHeightM = plan.flightHeightM;
    agent.phase = plan.phase;
    agent.phaseTimerS = plan.phaseTimerS;
    agent.outsideRoamDurationS = plan.outsideRoamDurationS;
    agent.isEmergingMode = controls.IS_EMERGING;
    agent.dynamicFrontalAngle = plan.dynamicFrontalAngle;
    if (Object.prototype.hasOwnProperty.call(plan, "exitTargetX")) {
      agent.exitTargetX = plan.exitTargetX;
      agent.exitTargetY = plan.exitTargetY;
    }
    agent.spriteVelocity = { x: agent.vx, y: agent.vy };
    agent.spritePosition = { x: agent.x, y: agent.y };
    pushHeadingHistory(agent, timeS);
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
        now,
        resolvedControls.IS_EMERGING,
      );

      if (!isPaused) {
        updateBatAgents(
          agentsRef.current,
          resolvedControls,
          size.width,
          size.height,
          dt,
          now,
        );
      }

      clearTransparentCanvas2d(ctx, size.width, size.height);

      const environment = getEnvironment(size.width, size.height);
      const entranceZone = getEntranceZone(environment);

      drawEntranceOpening(ctx, entranceZone);

      const image = rasterCanvasRef.current || imageRef.current;
      if (!image) {
        animationFrameRef.current = window.requestAnimationFrame(render);
        return;
      }

      agentsRef.current.forEach((agent, index) => {
        if (agent.phase === BAT_PHASES.INSIDE) {
          return;
        }

        const sprite = resolveCanvasAtlasSprite(ATLAS, {
          space: agent.spriteSpace || "2d",
          position: agent.spritePosition || { x: agent.x, y: agent.y },
          velocity: agent.spriteVelocity || { x: agent.vx, y: agent.vy },
          previousScreenPosition: agent.previousScreenPosition,
          maxDt: dt,
          width: size.width,
          height: size.height,
          projectPoint: agent.projectPoint,
          state: agent.spriteState,
          profile: agent.spriteProfile || "simulation",
          timestampMs: now * 1000,
          animationOffsetMs: agent.stageOffset,
        });

        const altitudeRatio = clamp(
          (agent.flightHeightM - PARAMS.HEIGHT_MIN_M) /
            (PARAMS.HEIGHT_MAX_M - PARAMS.HEIGHT_MIN_M),
          0,
          1,
        );
        const enteringProgress =
          agent.phase === BAT_PHASES.ENTERING
            ? clamp(
                1 -
                  agent.phaseTimerS /
                    Math.max(PARAMS.ENTERING_DURATION_S, 1e-6),
                0,
                1,
              )
            : 0;
        const exitingProgress =
          agent.phase === BAT_PHASES.EXITING
            ? clamp(
                1 -
                  agent.phaseTimerS / Math.max(PARAMS.EXITING_DURATION_S, 1e-6),
                0,
                1,
              )
            : 0;
        const enteringScaleFactor =
          agent.phase === BAT_PHASES.ENTERING
            ? lerp(1, 0.42, enteringProgress)
            : 1;
        const exitingScaleFactor =
          agent.phase === BAT_PHASES.EXITING
            ? lerp(0.42, 1, exitingProgress)
            : 1;
        const drawScale =
          PARAMS.SPRITE_SCALE *
          lerp(0.9, 1.08, altitudeRatio) *
          enteringScaleFactor *
          exitingScaleFactor;
        const drawWidth = frameSize.width * drawScale;
        const drawHeight = frameSize.height * drawScale;
        const flattenScaleY = agent.protestCallActive
          ? PARAMS.EVASION_BRAKE_RATIO
          : 1;
        const bobOffset =
          Math.sin(now * PARAMS.WINGBEAT_FREQUENCY_HZ + index * 0.7) *
          PARAMS.VISUAL_BOB_PX;

        agent.previousScreenPosition = sprite.pose.screenPosition;

        const enteringAlphaFactor =
          agent.phase === BAT_PHASES.ENTERING
            ? lerp(1, 0.18, enteringProgress)
            : 1;
        const exitingAlphaFactor =
          agent.phase === BAT_PHASES.EXITING
            ? lerp(0.18, 1, exitingProgress)
            : 1;
        ctx.save();
        ctx.globalAlpha =
          lerp(0.78, 1, altitudeRatio) *
          enteringAlphaFactor *
          exitingAlphaFactor;
        ctx.translate(agent.x, agent.y + bobOffset);
        ctx.rotate(sprite.rotation);
        ctx.scale(sprite.flipX, flattenScaleY);
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

import React from "react";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import {
  createAtlasFrameCanvases,
  drawAtlasFrame,
  loadTexturedAtlasCanvas,
  resolveAtlasGrid,
  resolveAtlasFrameSize,
} from "../../utils/spriteAtlas";
import { resolveCanvasAtlasSprite } from "../../utils/spritePose";
import {
  applyTransparentCanvasStyle,
  clearTransparentCanvas2d,
} from "../../utils/transparentCanvas";
import {
  drawFlashlightOverlay,
  FLASHLIGHT_PRESET,
  resolveFlashlightIntensity as resolveSharedFlashlightIntensity,
} from "../../utils/flashlight";

const ATLAS = HOME_SPRITE_ATLASES.bat;

const PARAMS = {
  DEFAULT_COUNT: 180,
  DEFAULT_IS_EMERGING: true,
  DEFAULT_LIGHT_INTENSITY_LUX: 1.4,
  DEFAULT_ACOUSTIC_GAIN: 1,
  DEFAULT_EXIT_PULL: 0.52,
  DEFAULT_RECOVERY_ACCEL_MPS2: 5,
  DEFAULT_INTERACTION_MODE: "predator",
  DEFAULT_SHOW_ULTRASOUND: true,
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
  FRONT_HALF_ANGLE_RAD: Math.PI / 4,
  ACOUSTIC_HALF_ANGLE_RAD: Math.PI / 2,
  TARGET_DISTANCE_MIN_M: 0.47,
  TARGET_DISTANCE_MAX_M: 0.9,
  LIGHT_LOW_LUX: 1.4,
  LIGHT_HIGH_LUX: 350,
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
  RETURN_DELAY_MIN_S: 1.2,
  RETURN_DELAY_MAX_S: 5.6,
  ENTERING_DURATION_S: 0.22,
  POPULATION_RETIRE_ENTERING_DURATION_S: 0.52,
  EXITING_DURATION_S: 0.26,
  EMERGENCE_RELEASE_WINDOW_S: 2.6,
  POPULATION_GROWTH_PROTECTION_S: 2.4,
  OUTSIDE_ROAM_MIN_S: 6,
  OUTSIDE_ROAM_MAX_S: 12,
  RETURN_LOITER_RADIUS_INNER_M: 8,
  RETURN_LOITER_RADIUS_OUTER_M: 15,
  RETURN_LOITER_ORBIT_WEIGHT: 1.25,
  RETURN_LOITER_RADIAL_WEIGHT: 0.92,
  RETURN_LOITER_WANDER_WEIGHT: 0.12,
  POST_EMERGENCE_COHESION_S: 3.8,
  POST_EMERGENCE_FORWARD_WEIGHT: 0.52,
  POST_EMERGENCE_ALIGNMENT_MULTIPLIER: 1.45,
  PREDATOR_ALIGNMENT_MULTIPLIER: 1.9,
  PREDATOR_COHESION_WEIGHT: 1.65,
  FLASHLIGHT_REPULSION_MULTIPLIER: 3.2,
  POST_EMERGENCE_CENTER_BOOST: 0.22,
  POST_EMERGENCE_ORBIT_DAMPING: 0.12,
  POST_EMERGENCE_WANDER_DAMPING: 0.06,
  BASE_FORWARD_BLEND: 0.26,
  BASE_SPEED_RESPONSE: 3.4,
  ACOUSTIC_STEER_WEIGHT: 1.55,
  ENTRANCE_ACOUSTIC_RADIUS_M: 6.2,
  ENTRANCE_CENTERLINE_WIDTH_M: 1.15,
  ENTRANCE_ACOUSTIC_STEER_WEIGHT: 1.28,
  ENTRANCE_FLOW_ALIGNMENT_WEIGHT: 0.74,
  RETURN_CONGESTION_RADIUS_M: 5.4,
  RETURN_CONGESTION_BRAKE_WEIGHT: 0.42,
  BRIGHT_LIGHT_CIRCLE_BACK_RADIUS_M: 4.8,
  BRIGHT_LIGHT_CIRCLE_BACK_MIN_S: 1.1,
  BRIGHT_LIGHT_CIRCLE_BACK_MAX_S: 2.4,
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
  FLASHLIGHT_STEER_WEIGHT: 1.45,
  FLASHLIGHT_BRAKE_RATIO: 0.9,
  PREDATOR_RADIUS_M: 5.2,
  PREDATOR_CORE_RADIUS_M: 1.4,
  PREDATOR_STEER_WEIGHT: 2.15,
  PREDATOR_BRAKE_RATIO: 0.78,
  POINTER_EVASION_DURATION_S: 0.32,
  ULTRASOUND_MAX_RINGS: 34,
  ULTRASOUND_RING_INTERVAL_S: 0.42,
  ULTRASOUND_RING_SPEED_MPS: 7.2,
  ULTRASOUND_RING_WIDTH_M: 0.025,
};

const CONTROL_FIELDS = [
  {
    key: "INTERACTION_MODE",
    label: "마우스 상호작용",
    type: "binary-toggle",
    onValue: "flashlight",
    offValue: "predator",
    formatValue: (value) => (value === "flashlight" ? "손전등" : "포식자"),
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
    label: "하늘 밝기",
    min: 0,
    max: 400,
    step: 0.1,
    formatValue: (value) => `${Number(value).toFixed(1)} lx`,
  },
  {
    key: "IS_EMERGING",
    label: "동굴 이동 방향",
    type: "toggle",
    formatValue: (value) => (value ? "나오기" : "들어가기"),
  },
  {
    key: "SHOW_ULTRASOUND",
    label: "초음파 표시",
    type: "toggle",
    formatValue: (value) => (value ? "ON" : "OFF"),
  },
];

const DEFAULT_CONTROL_STATE = {
  COUNT: PARAMS.DEFAULT_COUNT,
  IS_EMERGING: PARAMS.DEFAULT_IS_EMERGING,
  LIGHT_INTENSITY_LUX: PARAMS.DEFAULT_LIGHT_INTENSITY_LUX,
  ACOUSTIC_GAIN: PARAMS.DEFAULT_ACOUSTIC_GAIN,
  EXIT_PULL: PARAMS.DEFAULT_EXIT_PULL,
  RECOVERY_ACCEL_MPS2: PARAMS.DEFAULT_RECOVERY_ACCEL_MPS2,
  INTERACTION_MODE: PARAMS.DEFAULT_INTERACTION_MODE,
  SHOW_ULTRASOUND: PARAMS.DEFAULT_SHOW_ULTRASOUND,
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
const getControlField = (key) =>
  CONTROL_FIELDS.find((field) => field.key === key);
const lerp = (start, end, amount) => start + (end - start) * amount;
const randomBetween = (min, max) => min + Math.random() * (max - min);
const metersToPx = (meters) => meters * PARAMS.METERS_TO_PIXELS;
const pxToMeters = (pixels) => pixels / PARAMS.METERS_TO_PIXELS;
const getNeighborQueryRadiusM = () =>
  Math.max(PARAMS.ALIGN_RADIUS_M, PARAMS.ACOUSTIC_RADIUS_M) * 1.35;
const smoothstep = (edge0, edge1, value) => {
  const t = clamp((value - edge0) / Math.max(edge1 - edge0, 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};

const resolveFlashlightIntensity = (x, y, pointerState) => {
  return resolveSharedFlashlightIntensity(x, y, pointerState, FLASHLIGHT_PRESET);
};

const resolveSkyLightRatio = (lightLux) =>
  Math.sqrt(clamp(Number(lightLux) / PARAMS.LIGHT_HIGH_LUX, 0, 1));

const createTintedAtlasCanvas = (source, width, height, fillStyle, alpha) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return source;
  }

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);
  ctx.globalCompositeOperation = "source-atop";
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fillStyle;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  return canvas;
};

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
  const entrance = { x: width * 0.12, y: height * 0.82 };
  const skyCenter = { x: width * 0.58, y: height * 0.34 };
  const exit = { x: width * 0.28, y: height * 0.62 };
  const light = { x: width * 0.72, y: height * 0.18 };
  return {
    entrance,
    skyCenter,
    exit,
    light,
    tangent: normalize2D(skyCenter.x - entrance.x, skyCenter.y - entrance.y),
  };
};

const getEntranceZone = (environment) => {
  const radiusX = metersToPx(PARAMS.ENTRANCE_RADIUS_M);
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

const resolvePointerInteraction = (agent, pointerState, controls) => {
  if (!pointerState?.active) {
    return {
      steerX: 0,
      steerY: 0,
      intensity: 0,
      brakeRatio: 1,
      pulse: false,
    };
  }

  const dx = agent.x - pointerState.x;
  const dy = agent.y - pointerState.y;
  const distancePx = Math.hypot(dx, dy);
  const fallback = angleToVector(agent.heading + Math.PI);
  const away = normalize2D(dx, dy, fallback);
  const mode =
    controls.INTERACTION_MODE === "predator" ? "predator" : "flashlight";
  const radiusPx =
    mode === "predator"
      ? metersToPx(PARAMS.PREDATOR_RADIUS_M)
      : FLASHLIGHT_PRESET.radiusPx;

  if (distancePx >= radiusPx) {
    return {
      steerX: 0,
      steerY: 0,
      intensity: 0,
      brakeRatio: 1,
      pulse: false,
    };
  }

  const proximity = 1 - distancePx / Math.max(radiusPx, 1);
  const intensity =
    mode === "predator"
      ? smoothstep(0, 1, proximity) * (pointerState.down ? 1 : 0.62)
      : resolveFlashlightIntensity(agent.x, agent.y, pointerState);
  const coreRatio =
    mode === "predator"
      ? 1 -
        clamp(
          distancePx / Math.max(metersToPx(PARAMS.PREDATOR_CORE_RADIUS_M), 1),
          0,
          1,
        )
      : 0;
  const lateral = {
    x: -away.y * (pointerState.turnSide || 1),
    y: away.x * (pointerState.turnSide || 1),
  };
  const steerWeight =
    mode === "predator"
      ? PARAMS.PREDATOR_STEER_WEIGHT
      : PARAMS.FLASHLIGHT_STEER_WEIGHT;
  const lateralWeight = mode === "predator" ? 0.42 + coreRatio * 0.42 : 0.16;

  return {
    steerX: (away.x + lateral.x * lateralWeight) * intensity * steerWeight,
    steerY: (away.y + lateral.y * lateralWeight) * intensity * steerWeight,
    intensity,
    brakeRatio: lerp(
      1,
      mode === "predator"
        ? PARAMS.PREDATOR_BRAKE_RATIO
        : PARAMS.FLASHLIGHT_BRAKE_RATIO,
      intensity,
    ),
    pulse: intensity > 0.18,
  };
};

const drawPointerInteraction = (ctx, pointerState, controls, width, height) => {
  if (controls.INTERACTION_MODE !== "flashlight") {
    return;
  }

  drawFlashlightOverlay(ctx, pointerState, {
    width,
    height,
    ...FLASHLIGHT_PRESET,
  });
};

const drawUltrasoundRings = (ctx, agents, controls, timeS) => {
  if (!controls.SHOW_ULTRASOUND) {
    return;
  }

  const skyLightRatio = resolveSkyLightRatio(controls.LIGHT_INTENSITY_LUX);
  const ringColor = {
    r: Math.round(lerp(170, 44, skyLightRatio)),
    g: Math.round(lerp(210, 82, skyLightRatio)),
    b: Math.round(lerp(235, 98, skyLightRatio)),
  };
  let drawn = 0;
  const maxRings = PARAMS.ULTRASOUND_MAX_RINGS;
  const ringSpeedPx = metersToPx(PARAMS.ULTRASOUND_RING_SPEED_MPS);
  const ringWidthPx = Math.max(1, metersToPx(PARAMS.ULTRASOUND_RING_WIDTH_M));

  ctx.save();
  ctx.lineWidth = ringWidthPx;
  agents.forEach((agent, index) => {
    if (
      drawn >= maxRings ||
      agent.phase === BAT_PHASES.INSIDE ||
      (!agent.protestCallActive && agent.evasionTimerS <= 0)
    ) {
      return;
    }

    if (index % 2 !== 0 && !agent.protestCallActive) {
      return;
    }

    const pulsePhase =
      ((timeS + agent.stageOffset * 0.001) % PARAMS.ULTRASOUND_RING_INTERVAL_S) /
      PARAMS.ULTRASOUND_RING_INTERVAL_S;
    const radius = pulsePhase * ringSpeedPx * PARAMS.ULTRASOUND_RING_INTERVAL_S;
    const alpha = (1 - pulsePhase) * (agent.protestCallActive ? 0.28 : 0.16);

    ctx.strokeStyle = `rgba(${ringColor.r}, ${ringColor.g}, ${ringColor.b}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(agent.x, agent.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    drawn += 1;
  });
  ctx.restore();
};

const drawEntranceOpening = (ctx, entranceZone) => {
  const { centerX, centerY, radiusX, radiusY } = entranceZone;
  const openingRadius = Math.min(radiusX, radiusY) * 0.68;

  ctx.save();

  ctx.fillStyle = "rgba(35, 40, 45, 0.86)";
  ctx.beginPath();
  ctx.arc(centerX, centerY, openingRadius * 1.14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(2, 3, 6, 0.96)";
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

const sampleReturnLoiterDuration = () =>
  randomBetween(PARAMS.RETURN_DELAY_MIN_S, PARAMS.RETURN_DELAY_MAX_S);

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
  const leftBound = marginPx;
  const rightBound = width - marginPx;
  const topBound = marginPx;
  const bottomBound = height - marginPx;
  let steerX = 0;
  let steerY = 0;

  if (agent.x < leftBound) {
    steerX +=
      clamp((leftBound - agent.x) / Math.max(marginPx, 1), 0, 1) *
      PARAMS.BOUNDARY_PULL_WEIGHT;
  } else if (agent.x > rightBound) {
    steerX -=
      clamp((agent.x - rightBound) / Math.max(marginPx, 1), 0, 1) *
      PARAMS.BOUNDARY_PULL_WEIGHT;
  }

  if (agent.y < topBound) {
    steerY +=
      clamp((topBound - agent.y) / Math.max(marginPx, 1), 0, 1) *
      PARAMS.BOUNDARY_PULL_WEIGHT;
  } else if (agent.y > bottomBound) {
    steerY -=
      clamp((agent.y - bottomBound) / Math.max(marginPx, 1), 0, 1) *
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

const getReturnLoiterSteer = (agent, environment, width, height, timeS) => {
  const offsetX = agent.x - environment.entrance.x;
  const offsetY = agent.y - environment.entrance.y;
  const distancePx = Math.hypot(offsetX, offsetY);
  const radialOut =
    distancePx > 1e-4
      ? { x: offsetX / distancePx, y: offsetY / distancePx }
      : { x: environment.tangent.x, y: environment.tangent.y };
  const orbit = {
    x: -radialOut.y * agent.orbitDirection,
    y: radialOut.x * agent.orbitDirection,
  };
  const innerPx = metersToPx(PARAMS.RETURN_LOITER_RADIUS_INNER_M);
  const outerPx = metersToPx(PARAMS.RETURN_LOITER_RADIUS_OUTER_M);
  const targetRadiusPx = lerp(
    innerPx,
    outerPx,
    0.5 + Math.sin(agent.wanderPhase) * 0.22,
  );
  const radialError =
    (targetRadiusPx - distancePx) / Math.max(outerPx - innerPx, 1);
  const radial = {
    x: radialOut.x * clamp(radialError, -1, 1),
    y: radialOut.y * clamp(radialError, -1, 1),
  };
  const wander = {
    x: Math.cos(agent.wanderPhase + timeS * 0.43),
    y: Math.sin(agent.wanderPhase + timeS * 0.39),
  };
  const offscreenReturn = getOffscreenReturnSteer(agent, width, height);

  return {
    x:
      orbit.x * PARAMS.RETURN_LOITER_ORBIT_WEIGHT +
      radial.x * PARAMS.RETURN_LOITER_RADIAL_WEIGHT +
      wander.x * PARAMS.RETURN_LOITER_WANDER_WEIGHT +
      offscreenReturn.x,
    y:
      orbit.y * PARAMS.RETURN_LOITER_ORBIT_WEIGHT +
      radial.y * PARAMS.RETURN_LOITER_RADIAL_WEIGHT +
      wander.y * PARAMS.RETURN_LOITER_WANDER_WEIGHT +
      offscreenReturn.y,
  };
};

const getEntranceAcousticSteer = (agent, environment, phase, controls) => {
  const distanceToEntrancePx = Math.hypot(
    agent.x - environment.entrance.x,
    agent.y - environment.entrance.y,
  );
  const influenceRadiusPx = metersToPx(PARAMS.ENTRANCE_ACOUSTIC_RADIUS_M);

  if (distanceToEntrancePx >= influenceRadiusPx) {
    return { x: 0, y: 0, congestionRatio: 0 };
  }

  const influence = 1 - distanceToEntrancePx / Math.max(influenceRadiusPx, 1);
  const projection = projectPointOnLine(
    agent,
    environment.entrance,
    environment.tangent,
  );
  const offsetX = agent.x - projection.x;
  const offsetY = agent.y - projection.y;
  const lateralDistancePx = Math.hypot(offsetX, offsetY);
  const centerlineWidthPx = metersToPx(PARAMS.ENTRANCE_CENTERLINE_WIDTH_M);
  const centerlineOverflow = clamp(
    (lateralDistancePx - centerlineWidthPx) /
      Math.max(centerlineWidthPx * 1.4, 1),
    0,
    1,
  );
  const isReturning =
    phase === BAT_PHASES.RETURNING || phase === BAT_PHASES.ENTERING;
  const flowDirection = isReturning
    ? { x: -environment.tangent.x, y: -environment.tangent.y }
    : environment.tangent;
  let steerX =
    flowDirection.x *
    PARAMS.ENTRANCE_FLOW_ALIGNMENT_WEIGHT *
    influence *
    controls.ACOUSTIC_GAIN;
  let steerY =
    flowDirection.y *
    PARAMS.ENTRANCE_FLOW_ALIGNMENT_WEIGHT *
    influence *
    controls.ACOUSTIC_GAIN;

  if (lateralDistancePx > 1e-4 && centerlineOverflow > 0) {
    const wallEchoWeight =
      centerlineOverflow *
      influence *
      PARAMS.ENTRANCE_ACOUSTIC_STEER_WEIGHT *
      controls.ACOUSTIC_GAIN;
    steerX += (-offsetX / lateralDistancePx) * wallEchoWeight;
    steerY += (-offsetY / lateralDistancePx) * wallEchoWeight;
  }

  const congestionRadiusPx = metersToPx(PARAMS.RETURN_CONGESTION_RADIUS_M);
  const congestionRatio =
    isReturning && distanceToEntrancePx < congestionRadiusPx
      ? 1 - distanceToEntrancePx / Math.max(congestionRadiusPx, 1)
      : 0;

  return { x: steerX, y: steerY, congestionRatio };
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
    agent.phaseTimerS = sampleReturnLoiterDuration();
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

  next.COUNT = Math.round(
    clamp(next.COUNT, getControlField("COUNT")?.min, getControlField("COUNT")?.max),
  );
  next.IS_EMERGING = Boolean(next.IS_EMERGING);
  next.LIGHT_INTENSITY_LUX = clamp(
    next.LIGHT_INTENSITY_LUX,
    getControlField("LIGHT_INTENSITY_LUX")?.min,
    getControlField("LIGHT_INTENSITY_LUX")?.max,
  );
  next.ACOUSTIC_GAIN = clamp(next.ACOUSTIC_GAIN, 0, 2);
  next.EXIT_PULL = clamp(next.EXIT_PULL, 0, 1);
  next.RECOVERY_ACCEL_MPS2 = clamp(next.RECOVERY_ACCEL_MPS2, 2, 8);
  next.INTERACTION_MODE = ["predator", "flashlight"].includes(
    next.INTERACTION_MODE,
  )
    ? next.INTERACTION_MODE
    : PARAMS.DEFAULT_INTERACTION_MODE;
  next.SHOW_ULTRASOUND = Boolean(next.SHOW_ULTRASOUND);

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
    populationProtectedUntilS: 0,
  };

  resetAgentAtEntrance(agent, width, height, timeS, isEmerging);
  return agent;
};

const activeAgentCount = (agents) =>
  agents.reduce(
    (count, agent) => (agent.populationRetiring ? count : count + 1),
    0,
  );

const sendAgentToEntranceForRemoval = (agent) => {
  agent.populationRetiring = true;
  agent.populationRetireDurationS = PARAMS.POPULATION_RETIRE_ENTERING_DURATION_S;
  agent.isEmergingMode = false;

  if (agent.phase === BAT_PHASES.INSIDE) {
    agent.phaseTimerS = 0;
  } else if (
    agent.phase === BAT_PHASES.OUTSIDE ||
    agent.phase === BAT_PHASES.EMERGING ||
    agent.phase === BAT_PHASES.EXITING
  ) {
    agent.phase = BAT_PHASES.LOITERING;
    agent.phaseTimerS = sampleReturnLoiterDuration();
    agent.outsideRoamDurationS = agent.phaseTimerS;
  } else if (agent.phase !== BAT_PHASES.LOITERING) {
    agent.phase = BAT_PHASES.RETURNING;
    agent.phaseTimerS = 0;
  }

  agent.speedMps = Math.max(agent.speedMps, PARAMS.SPEED_MIN_MPS);
  agent.collisionCooldownS = 0;
  agent.evasionTimerS = 0;
  agent.protestCallActive = false;
  agent.previousScreenPosition = null;
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

  for (let index = agents.length - 1; index >= 0; index -= 1) {
    const agent = agents[index];
    if (
      agent.populationRetiring &&
      agent.phase === BAT_PHASES.INSIDE &&
      activeAgentCount(agents) >= targetCount
    ) {
      agents.splice(index, 1);
    }
  }

  while (activeAgentCount(agents) < targetCount) {
    const agent = createAgent(width, height, timeS, isEmerging);
    agent.populationProtectedUntilS =
      timeS + PARAMS.POPULATION_GROWTH_PROTECTION_S;
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

  if (activeAgentCount(agents) > targetCount) {
    const excess = activeAgentCount(agents) - targetCount;
    const environment = getEnvironment(width, height);
    agents
      .filter((agent) => !agent.populationRetiring)
      .sort(
        (left, right) => {
          const phasePriority = (agent) => {
            if (agent.populationProtectedUntilS > timeS) {
              return 4;
            }
            if (agent.phase === BAT_PHASES.OUTSIDE) {
              return 0;
            }
            if (agent.phase === BAT_PHASES.LOITERING) {
              return 1;
            }
            if (agent.phase === BAT_PHASES.EMERGING) {
              return 2;
            }
            if (agent.phase === BAT_PHASES.EXITING) {
              return 3;
            }
            return 5;
          };
          const priorityDelta = phasePriority(left) - phasePriority(right);
          if (priorityDelta !== 0) {
            return priorityDelta;
          }

          return (
            Math.hypot(
              right.x - environment.entrance.x,
              right.y - environment.entrance.y,
            ) -
            Math.hypot(
              left.x - environment.entrance.x,
              left.y - environment.entrance.y,
            )
          );
        },
      )
      .slice(0, excess)
      .forEach((agent) => sendAgentToEntranceForRemoval(agent));
  }
};

const updateBatAgents = (
  agents,
  controls,
  width,
  height,
  dt,
  timeS,
  pointerState,
) => {
  const environment = getEnvironment(width, height);
  const acousticRadiusPx = metersToPx(PARAMS.ACOUSTIC_RADIUS_M);
  const alignmentRadiusPx = metersToPx(PARAMS.ALIGN_RADIUS_M);
  const criticalDistancePx = metersToPx(PARAMS.HALF_WINGSPAN_M);
  const emergenceTransitionPx = metersToPx(
    PARAMS.EMERGENCE_TRANSITION_DISTANCE_M,
  );
  const targetDistanceMinPx = metersToPx(PARAMS.TARGET_DISTANCE_MIN_M);
  const neighborQueryRadiusPx = metersToPx(getNeighborQueryRadiusM());
  const cellSizePx = neighborQueryRadiusPx;

  agents.forEach((agent) => {
    if (agent.populationRetiring) {
      return;
    }
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
      const enterDurationS = agent.populationRetiring
        ? (agent.populationRetireDurationS ?? PARAMS.ENTERING_DURATION_S)
        : PARAMS.ENTERING_DURATION_S;
      const remainingS = Math.max(0, agent.phaseTimerS - dt);
      const enterProgress =
        1 - remainingS / Math.max(enterDurationS, 1e-6);
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

    const movementControls = agent.populationRetiring
      ? { ...controls, IS_EMERGING: false }
      : controls;
    const direction = angleToVector(agent.heading);
    const right = { x: -direction.y, y: direction.x };
    const candidates = getNeighborIndices(
      agent,
      grid,
      cellSizePx,
      neighborQueryRadiusPx,
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
    let neighborCenterX = 0;
    let neighborCenterY = 0;
    let neighborCenterWeight = 0;
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
        distancePx > neighborQueryRadiusPx
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

      if (distancePx <= alignmentRadiusPx * 1.45) {
        const cohesionWeight = 1 / Math.max(distancePx, 1);
        neighborCenterX += other.x * cohesionWeight;
        neighborCenterY += other.y * cohesionWeight;
        neighborCenterWeight += cohesionWeight;
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
    const lightLux = controls.LIGHT_INTENSITY_LUX;

    if (movementControls.IS_EMERGING) {
      if (
        phase === BAT_PHASES.EMERGING &&
        lightLux >= PARAMS.LIGHT_HIGH_LUX &&
        distanceToEntrancePx <
          metersToPx(PARAMS.BRIGHT_LIGHT_CIRCLE_BACK_RADIUS_M)
      ) {
        phase = BAT_PHASES.LOITERING;
        phaseTimerS = randomBetween(
          PARAMS.BRIGHT_LIGHT_CIRCLE_BACK_MIN_S,
          PARAMS.BRIGHT_LIGHT_CIRCLE_BACK_MAX_S,
        );
        outsideRoamDurationS = phaseTimerS;
      } else if (
        phase === BAT_PHASES.LOITERING &&
        phaseTimerS <= 0
      ) {
        phase = BAT_PHASES.EMERGING;
      } else if (
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
    const entranceAcousticSteer = getEntranceAcousticSteer(
      agent,
      environment,
      phase,
      movementControls,
    );
    const pointerInteraction = resolvePointerInteraction(
      agent,
      pointerState,
      controls,
    );
    const isPredatorInteraction =
      controls.INTERACTION_MODE === "predator" && pointerInteraction.intensity > 0;
    const isFlashlightInteraction =
      controls.INTERACTION_MODE !== "predator" && pointerInteraction.intensity > 0;

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
          {
            phase,
            phaseTimerS,
            isEmergingMode: movementControls.IS_EMERGING,
          },
          movementControls,
        );
        const alignmentWeightMultiplier =
          (phase === BAT_PHASES.OUTSIDE
            ? lerp(
                PARAMS.OUTSIDE_ALIGNMENT_MULTIPLIER,
                PARAMS.POST_EMERGENCE_ALIGNMENT_MULTIPLIER,
                postEmergenceRatio,
              )
            : phase === BAT_PHASES.LOITERING
              ? PARAMS.OUTSIDE_ALIGNMENT_MULTIPLIER
              : PARAMS.TRANSIT_ALIGNMENT_MULTIPLIER) *
          (isPredatorInteraction
            ? lerp(
                1,
                PARAMS.PREDATOR_ALIGNMENT_MULTIPLIER,
                pointerInteraction.intensity,
              )
            : 1);
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

    if (movementControls.IS_EMERGING && phase === BAT_PHASES.EMERGING) {
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
      const outsideRoam = getOutsideRoamSteer(
        agent,
        environment,
        width,
        height,
        timeS,
      );
      desiredX += outsideRoam.x;
      desiredY += outsideRoam.y;
    } else if (!movementControls.IS_EMERGING && phase === BAT_PHASES.RETURNING) {
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
      const loiterSteer = movementControls.IS_EMERGING
        ? getOutsideRoamSteer(agent, environment, width, height, timeS)
        : getReturnLoiterSteer(agent, environment, width, height, timeS);
      desiredX += loiterSteer.x;
      desiredY += loiterSteer.y;
    }

    desiredX += offscreenReturnSteer.x;
    desiredY += offscreenReturnSteer.y;
    desiredX += entranceAcousticSteer.x;
    desiredY += entranceAcousticSteer.y;

    const lightVector = normalize2D(
      environment.light.x - agent.x,
      environment.light.y - agent.y,
      environment.tangent,
    );

    if (movementControls.IS_EMERGING && lightLux <= PARAMS.LIGHT_LOW_LUX) {
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
    } else if (
      !movementControls.IS_EMERGING &&
      lightLux >= PARAMS.LIGHT_HIGH_LUX
    ) {
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

    const pointerSteerScale = isFlashlightInteraction
      ? PARAMS.FLASHLIGHT_REPULSION_MULTIPLIER
      : 1;
    visualSteerX += pointerInteraction.steerX * pointerSteerScale;
    visualSteerY += pointerInteraction.steerY * pointerSteerScale;

    if (isPredatorInteraction && neighborCenterWeight > 0) {
      const centerX = neighborCenterX / neighborCenterWeight;
      const centerY = neighborCenterY / neighborCenterWeight;
      const toLocalGroup = normalize2D(centerX - agent.x, centerY - agent.y, {
        x: 0,
        y: 0,
      });
      visualSteerX +=
        toLocalGroup.x *
        PARAMS.PREDATOR_COHESION_WEIGHT *
        pointerInteraction.intensity;
      visualSteerY +=
        toLocalGroup.y *
        PARAMS.PREDATOR_COHESION_WEIGHT *
        pointerInteraction.intensity;
    }

    let evasionTimerS = Math.max(0, agent.evasionTimerS - dt);
    let protestCallActive = false;

    if (closestThreat && closestThreatDistancePx < criticalDistancePx) {
      evasionTimerS = PARAMS.EVASION_DURATION_S;
      protestCallActive = true;
    }

    if (pointerInteraction.pulse) {
      evasionTimerS = Math.max(
        evasionTimerS,
        PARAMS.POINTER_EVASION_DURATION_S * pointerInteraction.intensity,
      );
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

    if (!movementControls.IS_EMERGING && phase === BAT_PHASES.RETURNING) {
      const entranceSlowdown = clamp(
        distanceToEntrancePx / metersToPx(3.5),
        0.55,
        1,
      );
      targetSpeedMps *= lerp(PARAMS.RETURN_SPEED_DAMPING, 1, entranceSlowdown);
      targetSpeedMps *=
        1 -
        entranceAcousticSteer.congestionRatio *
          PARAMS.RETURN_CONGESTION_BRAKE_WEIGHT;
    }

    if (Number.isFinite(nearestFrontDistancePx)) {
      const nearestFrontDistanceM = pxToMeters(nearestFrontDistancePx);
      if (nearestFrontDistanceM < PARAMS.TARGET_DISTANCE_MAX_M) {
        const brakeRatio =
          1 -
          clamp(
            (nearestFrontDistanceM - PARAMS.HALF_WINGSPAN_M) /
              (PARAMS.TARGET_DISTANCE_MAX_M - PARAMS.HALF_WINGSPAN_M),
            0,
            1,
          );
        targetSpeedMps *=
          1 -
          brakeRatio *
            PARAMS.PROXIMITY_BRAKE_WEIGHT *
            lerp(0.45, 0.82, entranceAcousticSteer.congestionRatio);
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

    if (pointerInteraction.intensity > 0) {
      nextSpeedMps *= pointerInteraction.brakeRatio;
    }

    nextSpeedMps = clamp(
      nextSpeedMps,
      PARAMS.WALL_MIN_SPEED_MPS,
      PARAMS.SPEED_MAX_MPS,
    );
    const nextDirection = angleToVector(nextHeading);
    let nextX = agent.x + nextDirection.x * metersToPx(nextSpeedMps) * dt;
    let nextY = agent.y + nextDirection.y * metersToPx(nextSpeedMps) * dt;

    if (!movementControls.IS_EMERGING && phase === BAT_PHASES.RETURNING) {
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
    agent.isEmergingMode = agent.populationRetiring
      ? false
      : controls.IS_EMERGING;
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
  const atlasVariantsRef = React.useRef(null);
  const frameCanvasesRef = React.useRef(null);
  const animationFrameRef = React.useRef(0);
  const agentsRef = React.useRef([]);
  const flashlightToggleRef = React.useRef(false);
  const pointerRef = React.useRef({
    active: false,
    down: false,
    x: 0,
    y: 0,
    timeS: -Infinity,
    turnSide: 1,
  });
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
    let cancelled = false;

    loadTexturedAtlasCanvas(ATLAS).then(
      ({ image, frameSize, frameCanvases, canvas }) => {
      if (cancelled) {
        return;
      }

      const atlasSource = canvas || image;
      const atlasWidth = canvas?.width || image.naturalWidth || image.width;
      const atlasHeight = canvas?.height || image.naturalHeight || image.height;
      const grid = resolveAtlasGrid(ATLAS, {
        width: atlasWidth,
        height: atlasHeight,
      });
      const dimCanvas = createTintedAtlasCanvas(
        atlasSource,
        atlasWidth,
        atlasHeight,
        "rgb(12, 13, 14)",
        0.58,
      );

      imageRef.current = image;
      frameSizeRef.current = frameSize;
      rasterCanvasRef.current = canvas;
      frameCanvasesRef.current = frameCanvases;
      atlasVariantsRef.current = {
        dim: dimCanvas,
        dimFrames: createAtlasFrameCanvases(dimCanvas, frameSize, grid),
      };
      },
    );

    return () => {
      cancelled = true;
      rasterCanvasRef.current = null;
      frameCanvasesRef.current = null;
      atlasVariantsRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const getInteractionMode = () =>
      resolvedControls.INTERACTION_MODE === "predator"
        ? "predator"
        : "flashlight";

    flashlightToggleRef.current = getInteractionMode() === "flashlight";
    pointerRef.current = {
      ...pointerRef.current,
      active:
        getInteractionMode() === "flashlight"
          ? flashlightToggleRef.current && pointerRef.current.active
          : pointerRef.current.active,
      down: false,
    };

    const updatePointer = (event, down = pointerRef.current.down) => {
      const rect = canvas.getBoundingClientRect();
      const nextX = event.clientX - rect.left;
      const nextY = event.clientY - rect.top;
      const previous = pointerRef.current;
      const movementX = nextX - previous.x;
      const movementY = nextY - previous.y;
      const turnSide =
        Math.abs(movementX) + Math.abs(movementY) > 0.8
          ? Math.sign(movementX || -movementY) || 1
          : previous.turnSide || 1;
      const mode = getInteractionMode();

      pointerRef.current = {
        active:
          mode === "flashlight" ? flashlightToggleRef.current : true,
        down,
        x: nextX,
        y: nextY,
        timeS: window.performance.now() * 0.001,
        turnSide,
      };
    };

    const handlePointerEnter = (event) => updatePointer(event, false);
    const handlePointerMove = (event) =>
      updatePointer(event, pointerRef.current.down);
    const handlePointerDown = (event) => {
      const mode = getInteractionMode();
      if (mode === "flashlight") {
        flashlightToggleRef.current = !flashlightToggleRef.current;
        updatePointer(event, false);
        return;
      }

      updatePointer(event, true);
    };
    const handlePointerUp = (event) => {
      updatePointer(event, false);
    };
    const handlePointerLeave = () => {
      pointerRef.current = {
        ...pointerRef.current,
        active: false,
        down: false,
        timeS: -Infinity,
      };
    };

    canvas.addEventListener("pointerenter", handlePointerEnter);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerLeave);
    canvas.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      canvas.removeEventListener("pointerenter", handlePointerEnter);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerLeave);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [resolvedControls.INTERACTION_MODE]);

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
          pointerRef.current,
        );
      }

      clearTransparentCanvas2d(ctx, size.width, size.height);

      const environment = getEnvironment(size.width, size.height);
      const entranceZone = getEntranceZone(environment);

      drawEntranceOpening(ctx, entranceZone);
      drawPointerInteraction(
        ctx,
        pointerRef.current,
        resolvedControls,
        size.width,
        size.height,
      );
      drawUltrasoundRings(ctx, agentsRef.current, resolvedControls, now);

      const image = rasterCanvasRef.current || imageRef.current;
      if (!image) {
        animationFrameRef.current = window.requestAnimationFrame(render);
        return;
      }

      const atlasVariants = atlasVariantsRef.current;
        const dimImage = atlasVariants?.dim ?? image;
      const skyLightRatio = resolveSkyLightRatio(
        resolvedControls.LIGHT_INTENSITY_LUX,
      );
      const isFlashlightInteraction =
        resolvedControls.INTERACTION_MODE === "flashlight";

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
                    Math.max(
                      agent.populationRetiring
                        ? (agent.populationRetireDurationS ??
                            PARAMS.ENTERING_DURATION_S)
                        : PARAMS.ENTERING_DURATION_S,
                      1e-6,
                    ),
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
        const flashlightIntensity = isFlashlightInteraction
          ? resolveFlashlightIntensity(
              agent.x,
              agent.y + bobOffset,
              pointerRef.current,
            )
          : 0;
        const ambientReveal = lerp(0.04, 0.42, skyLightRatio);
        const bodyRevealIntensity = clamp(
          ambientReveal + flashlightIntensity * 0.9,
          0,
          1,
        );

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
        const phaseAlpha =
          lerp(0.78, 1, altitudeRatio) *
          enteringAlphaFactor *
          exitingAlphaFactor;
        ctx.translate(agent.x, agent.y + bobOffset);
        ctx.rotate(sprite.rotation);
        ctx.scale(sprite.flipX, flattenScaleY);
        ctx.globalAlpha = phaseAlpha * lerp(0.72, 0.92, skyLightRatio);
        drawAtlasFrame(ctx, {
          image: dimImage,
          frameCanvases: atlasVariants?.dimFrames,
          frame: sprite.frame,
          frameSize,
          dx: -drawWidth * 0.5,
          dy: -drawHeight * 0.5,
          dWidth: drawWidth,
          dHeight: drawHeight,
        });
        if (bodyRevealIntensity > 0.01) {
          ctx.globalAlpha =
            phaseAlpha * lerp(0.08, 1, bodyRevealIntensity);
          drawAtlasFrame(ctx, {
            image,
            frameCanvases: frameCanvasesRef.current,
            frame: sprite.frame,
            frameSize,
            dx: -drawWidth * 0.5,
            dy: -drawHeight * 0.5,
            dWidth: drawWidth,
            dHeight: drawHeight,
          });
        }
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
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        cursor: "default",
      }}
    />
  );
}

App.ui = {
  controlFields: CONTROL_FIELDS,
  defaultControlState: DEFAULT_CONTROL_STATE,
};

App.sanitizeControlState = sanitizeControlState;

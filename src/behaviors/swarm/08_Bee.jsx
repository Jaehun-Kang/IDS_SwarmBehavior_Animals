import React from "react";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { resolveAtlasFrameSize } from "../../utils/spriteAtlas";
import {
  applyTransparentCanvasStyle,
  clearTransparentCanvas2d,
} from "../../utils/transparentCanvas";

const ATLAS = HOME_SPRITE_ATLASES.bee;

const PARAMS = {
  DEFAULT_COUNT: 220,
  DEFAULT_TEMPERATURE_C: 30,
  DEFAULT_IS_THREAT_ACTIVE: false,
  DEFAULT_SUN_AZIMUTH_DEG: 165,
  DEFAULT_TARGET_DISTANCE_M: 900,
  DEFAULT_SCOUT_RATIO: 0.1,
  PIXELS_PER_CM: 10,
  SPRITE_SCALE: 0.2,
  BEHAVIOR_TIME_SCALE: 1,
  BODY_LENGTH_CM: 1.2,
  ANCHOR_SPACING_CM: 0.82,
  REPULSION_RADIUS_CM: 1.08,
  INTERACTION_RADIUS_CM: 4.8,
  SHIMMER_RADIUS_CM: 2.6,
  SURFACE_CRAWL_SPEED_CM_S: 3.8,
  DANCER_SPEED_CM_S: 3.2,
  DEFENDER_SPEED_CM_S: 120,
  MAX_SPEED_CM_S: 180,
  MAX_STEER_CM_S2: 2500,
  REPULSION_WEIGHT: 1.3,
  ANCHOR_PULL_WEIGHT: 0.9,
  WANDER_WEIGHT: 0.02,
  DANCE_ATTEND_WEIGHT: 0.58,
  SURFACE_WANDER_TRIGGER_PER_S: 0.055,
  WORKER_REBALANCE_TRIGGER_PER_S: 0.12,
  WORKER_REBALANCE_RADIUS_CM: 8.5,
  WORKER_SLOT_SWAP_TRIGGER_PER_S: 0.16,
  WORKER_SLOT_SWAP_RADIUS_CM: 7.2,
  WORKER_SLOT_SWAP_CLUSTER_RADIUS_CM: 4.6,
  WORKER_SLOT_SWAP_MIN_SCORE_GAIN: 1.2,
  LOCAL_SLOT_CAPTURE_PER_S: 0.62,
  LAYOUT_DRIFT_TRIGGER_PER_S: 0.12,
  LOCAL_SLOT_SENSE_RADIUS_CM: 3.8,
  INITIAL_SURFACE_HOLD_MIN_S: 1.1,
  INITIAL_SURFACE_HOLD_MAX_S: 2,
  SURFACE_WANDER_SPEED_FACTOR: 0.3,
  SURFACE_WANDER_MIN_S: 0.8,
  SURFACE_WANDER_MAX_S: 1.8,
  SURFACE_WANDER_RADIUS_CM: 3.6,
  SURFACE_ARRIVE_RADIUS_CM: 0.32,
  SETTLING_SPEED_CM_S: 2.2,
  SETTLING_ARRIVE_RADIUS_CM: 0.08,
  SHAKING_BOOST_MULTIPLIER: 1.8,
  SHAKING_ACTIVITY_BOOST: 0.48,
  SHAKING_RADIUS_CM: 2.8,
  SHAKING_FREQUENCY_HZ: 16,
  SHAKING_DURATION_MIN_S: 1,
  SHAKING_DURATION_MAX_S: 2,
  SHAKING_INTERVAL_MIN_S: 2.1,
  SHAKING_INTERVAL_MAX_S: 4.8,
  SURFACE_SIGNALING_MIN_S: 1.2,
  SURFACE_SIGNALING_MAX_S: 2.2,
  SURFACE_SIGNALING_MOVE_TRIGGER_PER_S: 3.2,
  ANCHOR_EASE_S: 0.18,
  SHIMMER_ACTIVE_S: 0.2,
  SHIMMER_REFRACTORY_S: 0.8,
  SHIMMER_RESPONSE_PROBABILITY: 0.7,
  SHIMMER_SALTATORIC_PROBABILITY_PER_S: 0.38,
  SHIMMER_RELAY_WINDOW_S: 0.088,
  SHIMMER_RELAY_IGNORE_PROBABILITY: 0.18,
  SHIMMER_LOCAL_TRIGGER_RADIUS_CM: 7.2,
  LOCAL_DEFENSE_COMMIT_PER_S: 5.4,
  ABDOMEN_SHAKE_RATE_HZ: 9,
  ABDOMEN_SHAKE_ROTATION_RAD: 0.14,
  HEAT_BALL_SENSE_RADIUS_CM: 7.2,
  HEAT_BALL_ATTACH_RADIUS_CM: 2.5,
  HEAT_BALL_TRIGGER_RADIUS_CM: 2.6,
  HEAT_BALL_RING_GAP_CM: 0.3,
  HEAT_BALL_SUPPORT_MIN_ATTACHED: 6,
  HEAT_BALL_SUPPORT_MAX_ATTACHED: 18,
  HEAT_BALL_SUPPORT_RATIO: 0.14,
  HEAT_BALL_PULL_WEIGHT: 2.1,
  HEAT_BALL_SHELL_WEIGHT: 1.4,
  HEAT_BALL_TANGENTIAL_WEIGHT: 0.12,
  HEAT_BALL_SPEED_DAMPING: 0.9,
  HORNET_ATTACHMENT_MIN_CM: 0.4,
  HORNET_ATTACHMENT_MAX_CM: 1.05,
  HORNET_WINGBEAT_HZ: 28,
  HORNET_WING_GLOW_PX: 7,
  HORNET_HEAT_JITTER_PX: 2.2,
  SHAKE_OFF_THRESHOLD_PX: 300,
  SHAKE_OFF_TURN_MIN_SPEED_PX: 90,
  SHAKE_OFF_TURN_SHARPNESS_THRESHOLD: 0.3,
  SHAKE_OFF_REVERSAL_MIN_SCORE: 0.24,
  SHAKE_OFF_TARGET_RATIO: 0.8,
  SHAKE_OFF_EVENT_COOLDOWN_S: 0.08,
  SHAKE_OFF_THROW_SPEED_CM_S: 168,
  SHAKE_OFF_THROW_SPEED_MIN_SCALE: 0.42,
  SHAKE_OFF_THROW_SPEED_MAX_SCALE: 0.96,
  SHAKE_OFF_LOCAL_RATE_PER_S: 26,
  SHAKE_OFF_REFERENCE_ATTACHED_COUNT: 10,
  SHAKE_OFF_BURST_MIN_RATIO: 0.86,
  SHAKE_OFF_BURST_MAX_RATIO: 0.98,
  THROWN_OFF_S: 0.72,
  THROWN_OFF_GRAVITY_CM_S2: 78,
  THROWN_OFF_RECOVERY_S: 0.16,
  THROWN_OFF_RECOVERY_LIFT_CM_S2: 54,
  THROWN_OFF_REENGAGE_RADIUS_CM: 18,
  THROWN_OFF_REENGAGE_ATTACH_DELAY_S: 0.24,
  THROWN_OFF_REENGAGE_RING_BUFFER_CM: 4.8,
  THROWN_OFF_REENGAGE_PULL_WEIGHT: 0.018,
  THROWN_OFF_REENGAGE_SPEED_SCALE: 0.58,
  THROWN_OFF_REENGAGE_ORBIT_RATE_RAD_S: 2.8,
  THROWN_OFF_RETURN_FATIGUE_S: 1.4,
  THROWN_OFF_RETURN_SPEED_SCALE: 0.3,
  THROWN_OFF_RETURN_STEER_SCALE: 0.1,
  THROWN_OFF_RETURN_WANDER_SCALE: 0.72,
  THROWN_OFF_RETURN_SINK_CM_S2: 24,
  THROWN_OFF_RETURN_ARRIVAL_RADIUS_CM: 5.6,
  THROWN_OFF_RETURN_MIN_SPEED_SCALE: 0.2,
  THROWN_OFF_RETURN_WINGBEAT_MULTIPLIER: 2.5,
  THROWN_OFF_TAIL_SPREAD_CM: 7.4,
  THROWN_OFF_TAIL_JITTER_CM: 0.7,
  THROWN_OFF_TAIL_DEPTH_CM: 3.4,
  THROWN_OFF_TAIL_LANES: 11,
  THROWN_OFF_TAIL_LAYER_GAP_CM: 0.65,
  THROWN_OFF_TAIL_LAYER_COUNT: 7,
  THROWN_OFF_TAIL_APPROACH_RISE_CM: 4.6,
  THROWN_OFF_NO_LAND_MIN_S: 0.12,
  THROWN_OFF_NO_LAND_MAX_S: 0.3,
  THROWN_OFF_LAND_MAX_SPEED_CM_S: 26,
  TAKEOFF_WINGBEAT_HZ: 306,
  TAKEOFF_REQUIRED_WINGBEATS: 15,
  FORAGE_PAUSE_MIN_S: 1.2,
  FORAGE_PAUSE_MAX_S: 2.8,
  INITIAL_SCOUT_FORAGE_MIN_S: 2.8,
  INITIAL_SCOUT_FORAGE_MAX_S: 5.2,
  SCOUT_REST_MIN_S: 3.5,
  SCOUT_REST_MAX_S: 7.5,
  PREDATOR_VISUAL_THRESHOLD_DEG: 7.7,
  PREDATOR_VISUAL_RANGE_CM: 22,
  PREDATOR_RADIUS_CM: 2.1,
  WAGGLE_100M_S: 0.4713,
  WAGGLE_3400M_S: 7.2196,
  DANCE_RETURN_S: 1.05,
  DANCE_LOOP_RADIUS_CM: 2.2,
  DANCE_ROUNDS_MIN: 4,
  DANCE_ROUNDS_MAX: 8,
  SCOUT_FORAGE_MIN_S: 9,
  SCOUT_FORAGE_MAX_S: 18,
  EDGE_MARGIN_CM: 4,
  GRID_CELL_CM: 5,
  VISUAL_BOB_PX: 0.9,
  CURTAIN_RADIUS_RATIO: 0.072,
  CURTAIN_COUNT_RADIUS_SCALE: 1.25,
  CURTAIN_MAX_RADIUS_SCALE: 1.85,
  CURTAIN_COMFORT_RATIO: 0.84,
  SPRITE_ROTATION_BLEND: 0.16,
  MAX_TURN_RATE_RAD_S: 4.6,
  ANCHORED_ROTATION_RAD: -Math.PI / 2,
  ANCHORED_MICRO_TURN_RAD: 0.05,
  GROOMING_TRIGGER_PER_S: 0.018,
  GROOMING_MIN_S: 0.2,
  GROOMING_MAX_S: 0.5,
  PROTEAN_FREQUENCY_HZ: 12,
  PROTEAN_AMPLITUDE: 0.95,
  FLIGHT_CRUISE_RATIO: 0.15,
  FLIGHT_VELOCITY_TRACK_PER_S: 1.2,
  FLIGHT_DAMPING_PER_S: 0.22,
  CURTAIN_PULL_WEIGHT: 0.9,
  FANNING_TEMPERATURE_ON_C: 35,
  FANNING_TEMPERATURE_OFF_C: 33,
  FANNING_TRIGGER_PER_S: 0.72,
  FANNING_RELEASE_PER_S: 1.2,
  FANNING_ENTRANCE_RADIUS_CM: 9.5,
  RETURN_ARRIVAL_RADIUS_CM: 14.5,
  RETURN_MIN_SPEED_SCALE: 0.2,
  HIVE_SETTLING_START_RADIUS_CM: 4.2,
  HIVE_SETTLING_SPEED_CM_S: 1.18,
  HIVE_SETTLING_LOADED_SPEED_CM_S: 0.92,
  FLOWER_MAX_COUNT: 28,
  FLOWER_PATCH_MIN_COUNT: 5,
  FLOWER_PATCH_MAX_COUNT: 11,
  FLOWER_PATCH_RADIUS_CM: 3.4,
  FLOWER_REACH_RADIUS_CM: 3.1,
  FLOWER_PERCH_OFFSET_CM: 0.82,
  FLOWER_HEAD_OFFSET_CM: 0.56,
  FLOWER_LANDING_SPEED_CM_S: 13.5,
  FLOWER_APPROACH_RADIUS_CM: 2.4,
  FLOWER_APPROACH_LOCK_RADIUS_CM: 1.2,
  FLOWER_COLLECTION_SETTLE_RADIUS_CM: 0.16,
  FLOWER_MAX_BEES_PER_FLOWER: 1,
  FLOWER_COLLECTION_DAMPING: 0.58,
  FLOWER_SCENT_RADIUS_CM: 24,
  FLOWER_SCENT_RETARGET_RADIUS_CM: 34,
  SCOUT_FLOWER_TARGET_BLEND_PER_S: 2.4,
  WORKER_FLOWER_TARGET_BLEND_PER_S: 2.8,
  SCOUT_FLOWER_APPROACH_SPEED_SCALE: 0.74,
  WORKER_FLOWER_APPROACH_SPEED_SCALE: 0.68,
  FLOWER_RETRY_ESCAPE_SPEED_SCALE: 0.82,
  FLOWER_RETARGET_ESCAPE_SPEED_SCALE: 0.74,
  FLOWER_RETURN_ESCAPE_SPEED_SCALE: 0.84,
  SHARED_FORAGE_MEMORY_S: 18,
  SHARED_FORAGE_RECRUITS_MIN: 6,
  SHARED_FORAGE_RECRUITS_MAX: 14,
  WORKER_FORAGE_COMMIT_PER_S: 0.9,
  WORKER_POST_FORAGE_REST_MIN_S: 0.45,
  WORKER_POST_FORAGE_REST_MAX_S: 1.05,
  FLOWER_DRAG_STEP_PX: 36,
  POLLEN_LOADED_SPEED_SCALE: 0.82,
  POLLEN_LOADED_RETURN_ARRIVAL_RADIUS_CM: 16.2,
  POLLEN_LANDING_SWAY_MULTIPLIER: 1.9,
  CULLING_FALL_GRAVITY_CM_S2: 112,
  CULLING_DRIFT_CM_S: 7.5,
  SCOUT_EXPLORE_MIN_RADIUS_CM: 28,
  SCOUT_EXPLORE_MAX_RADIUS_CM: 82,
  SCOUT_EXPLORE_TURN_STEP_RAD: 0.3,
};

const CONTROL_FIELDS = [
  {
    key: "COUNT",
    label: "개체 수",
    min: 60,
    max: 520,
    step: 10,
    formatValue: (value) => `${Math.round(value)} 마리`,
  },
  {
    key: "TEMPERATURE_C",
    label: "기온",
    min: 5,
    max: 42,
    step: 1,
    formatValue: (value) => `${Math.round(value)} °C`,
  },
  {
    key: "IS_THREAT_ACTIVE",
    label: "말벌 위협",
    type: "toggle",
    formatValue: (value) => (value ? "ON - 마우스가 말벌" : "OFF"),
  },
  {
    key: "SUN_AZIMUTH_DEG",
    label: "태양 방위각",
    min: 0,
    max: 360,
    step: 1,
    formatValue: (value) => `${Math.round(value)}°`,
  },
  {
    key: "TARGET_DISTANCE_M",
    label: "먹이 거리",
    min: 100,
    max: 3400,
    step: 100,
    formatValue: (value) => `${Math.round(value)} m`,
  },
];

const DEFAULT_CONTROL_STATE = {
  COUNT: PARAMS.DEFAULT_COUNT,
  TEMPERATURE_C: PARAMS.DEFAULT_TEMPERATURE_C,
  IS_THREAT_ACTIVE: PARAMS.DEFAULT_IS_THREAT_ACTIVE,
  SUN_AZIMUTH_DEG: PARAMS.DEFAULT_SUN_AZIMUTH_DEG,
  TARGET_DISTANCE_M: PARAMS.DEFAULT_TARGET_DISTANCE_M,
};

const ROLES = {
  WORKER: "WORKER",
  SCOUT: "SCOUT",
  DEFENDER: "DEFENDER",
};

const ACTIVITY_STATES = {
  IDLE: "IDLE",
  WANDERING: "WANDERING",
  SIGNALING: "SIGNALING",
  SETTLING: "SETTLING",
  TAKEOFF: "TAKEOFF",
  THROWN_OFF: "THROWN_OFF",
  FORAGING: "FORAGING",
  RETURNING: "RETURNING",
  DANCING: "DANCING",
  FANNING: "FANNING",
  DEFENDING: "DEFENDING",
  HEAT_BALLING: "HEAT_BALLING",
  CULLING: "CULLING",
};

const SHIMMER_STATES = {
  IDLE: "IDLE",
  ACTIVE: "ACTIVE",
  REFRACTORY: "REFRACTORY",
};

const THREAT_TYPES = {
  NONE: 0,
  VESPA_VELUTINA: 1,
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (start, end, amount) => start + (end - start) * amount;
const randomBetween = (min, max) => min + Math.random() * (max - min);
const cmToPx = (cm) => cm * PARAMS.PIXELS_PER_CM;
const speedCmToPx = (cmPerSecond) => cmToPx(cmPerSecond);
const getTakeoffDelayS = () =>
  PARAMS.TAKEOFF_REQUIRED_WINGBEATS / PARAMS.TAKEOFF_WINGBEAT_HZ;

const shortestAngleDelta = (from, to) => {
  let delta = to - from;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
};

const advanceAngle = (current, target, maxStep) => {
  const delta = shortestAngleDelta(current, target);
  return current + clamp(delta, -maxStep, maxStep);
};

const getThreatType = (controls = DEFAULT_CONTROL_STATE) =>
  controls?.IS_THREAT_ACTIVE ? THREAT_TYPES.VESPA_VELUTINA : THREAT_TYPES.NONE;

const getFanningHeatFactor = (temperatureC) =>
  clamp(
    (temperatureC - PARAMS.FANNING_TEMPERATURE_ON_C) /
      Math.max(1, 42 - PARAMS.FANNING_TEMPERATURE_ON_C),
    0,
    1,
  );

const getCurtainCountScale = (count) => {
  const normalizedCount = Math.max(1, count || PARAMS.DEFAULT_COUNT);
  const areaScale = Math.sqrt(normalizedCount / PARAMS.DEFAULT_COUNT);
  return clamp(
    1 + (areaScale - 1) * PARAMS.CURTAIN_COUNT_RADIUS_SCALE,
    1,
    PARAMS.CURTAIN_MAX_RADIUS_SCALE,
  );
};

const getTemperaturePackingProfile = (temperatureC) => {
  const cold = clamp((30 - temperatureC) / 15, 0, 1);
  const hot = clamp((temperatureC - 30) / 12, 0, 1);
  return {
    curtainScale: 1 - cold * 0.08 + hot * 0.1,
    spacingScale: 1 - cold * 0.12 + hot * 0.08,
  };
};

const getCurtainRadiusAtAngle = (env, angle) => {
  const ripple =
    1 +
    Math.sin(angle * 3 + 0.4) * 0.08 +
    Math.sin(angle * 5 - 1.1) * 0.05 +
    Math.sin(angle * 2 + 2.2) * 0.04;
  return env.curtain.radius * ripple;
};

const normalize = (x, y, fallback = { x: 1, y: 0 }) => {
  const magnitude = Math.hypot(x, y);
  if (magnitude < 1e-6) {
    return { ...fallback };
  }
  return { x: x / magnitude, y: y / magnitude };
};

const limitVector = (x, y, maxLength) => {
  const magnitude = Math.hypot(x, y);
  if (magnitude <= maxLength || magnitude < 1e-6) {
    return { x, y };
  }
  const scale = maxLength / magnitude;
  return { x: x * scale, y: y * scale };
};

const getEnvironment = (
  width,
  height,
  timeS,
  pointer,
  controls,
  flowers = [],
) => {
  const packing = getTemperaturePackingProfile(
    controls?.TEMPERATURE_C ?? DEFAULT_CONTROL_STATE.TEMPERATURE_C,
  );
  const curtainCountScale = getCurtainCountScale(
    controls?.COUNT ?? DEFAULT_CONTROL_STATE.COUNT,
  );
  const nest = { x: width * 0.5, y: height * 0.5 };
  const entrance = { x: width * 0.5, y: height * 0.455 };
  const forageTarget = { x: width * 0.66, y: height * -0.1 };
  const pointerPredator =
    getThreatType(controls) !== THREAT_TYPES.NONE && pointer?.hasPointer
      ? pointer
      : null;
  const pointerAge = pointerPredator
    ? Math.max(0, timeS - (pointerPredator.timeS || 0))
    : 1;
  const pointerSpeed =
    pointerPredator && pointerAge < 0.16 ? pointerPredator.speedPx || 0 : 0;
  const predator = {
    x: pointerPredator ? pointerPredator.x : -9999,
    y: pointerPredator ? pointerPredator.y : -9999,
    radius: cmToPx(PARAMS.PREDATOR_RADIUS_CM),
    vx: pointerPredator && pointerAge < 0.16 ? pointerPredator.vx || 0 : 0,
    vy: pointerPredator && pointerAge < 0.16 ? pointerPredator.vy || 0 : 0,
    speedPx: pointerSpeed,
    accelPx:
      pointerPredator && pointerAge < 0.16 ? pointerPredator.accelPx || 0 : 0,
    turnSharpness:
      pointerPredator && pointerAge < 0.16
        ? pointerPredator.turnSharpness || 0
        : 0,
    reversalScore:
      pointerPredator && pointerAge < 0.16
        ? pointerPredator.reversalScore || 0
        : 0,
    shakeEventId:
      pointerPredator && pointerAge < 0.16
        ? pointerPredator.shakeEventId || 0
        : 0,
    pointerState: pointerPredator,
  };

  const curtain = {
    x: nest.x,
    y: nest.y,
    radius:
      Math.min(width, height) *
      PARAMS.CURTAIN_RADIUS_RATIO *
      packing.curtainScale *
      curtainCountScale,
  };

  return {
    width,
    height,
    timeS,
    controls,
    nest,
    entrance,
    forageTarget,
    flowers,
    predator,
    curtain,
  };
};

const chooseFlowerTarget = (agent, env) => {
  if (!env.flowers?.length) {
    return null;
  }

  const timeS = env.timeS || 0;
  const scentRadius = cmToPx(PARAMS.FLOWER_SCENT_RADIUS_CM);
  const scentedFlowers = env.flowers.filter(
    (flower) =>
      Math.hypot(agent.x - flower.x, agent.y - flower.y) <= scentRadius,
  );
  const candidateFlowers = scentedFlowers.length ? scentedFlowers : env.flowers;
  const availableFlowers = candidateFlowers.filter((flower) =>
    hasFlowerCapacity(flower, env, agent, timeS),
  );
  if (!availableFlowers.length) {
    return null;
  }

  const rankedFlowers = availableFlowers
    .map((flower) => {
      const blossom = getFlowerBlossomPosition(flower, timeS);
      return {
        flower,
        score:
          Math.hypot(agent.x - blossom.x, agent.y - blossom.y) +
          Math.hypot(agent.targetX - blossom.x, agent.targetY - blossom.y) *
            0.25 +
          Math.random() * cmToPx(3),
      };
    })
    .sort((left, right) => left.score - right.score);

  return rankedFlowers[0]?.flower || null;
};

const findScentTrackedFlower = (agent, env) => {
  if (!env.flowers?.length) {
    return null;
  }

  const timeS = env.timeS || 0;
  if (agent.targetFlowerId) {
    const targetFlower = env.flowers.find(
      (flower) => flower.id === agent.targetFlowerId,
    );
    if (targetFlower && hasFlowerCapacity(targetFlower, env, agent, timeS)) {
      return targetFlower;
    }
  }
  const scentRadius = cmToPx(PARAMS.FLOWER_SCENT_RETARGET_RADIUS_CM);
  const heading = normalize(agent.vx, agent.vy, {
    x: agent.targetX - agent.x,
    y: agent.targetY - agent.y,
  });
  const rankedFlowers = env.flowers
    .filter(
      (flower) =>
        Math.hypot(agent.x - flower.x, agent.y - flower.y) <= scentRadius &&
        hasFlowerCapacity(flower, env, agent, timeS),
    )
    .map((flower) => {
      const blossom = getFlowerBlossomPosition(flower, timeS);
      const dx = blossom.x - agent.x;
      const dy = blossom.y - agent.y;
      const distance = Math.hypot(dx, dy);
      const direction = normalize(dx, dy, heading);
      const alignment = heading.x * direction.x + heading.y * direction.y;
      return {
        flower,
        score: distance - alignment * cmToPx(5.5),
      };
    })
    .sort((left, right) => left.score - right.score);

  return rankedFlowers[0]?.flower || null;
};

const chooseExplorationTarget = (agent, env) => {
  const previousTarget =
    agent.scoutExploreTargetX != null && agent.scoutExploreTargetY != null
      ? {
          x: agent.scoutExploreTargetX,
          y: agent.scoutExploreTargetY,
        }
      : {
          x: env.width * randomBetween(0.18, 0.82),
          y: env.height * randomBetween(0.12, 0.84),
        };
  const angleToPreviousTarget = Math.atan2(
    previousTarget.y - agent.y,
    previousTarget.x - agent.x,
  );
  const outwardAngle =
    (Number.isFinite(angleToPreviousTarget)
      ? angleToPreviousTarget
      : agent.scoutExploreAngle || -Math.PI / 2) +
    randomBetween(
      -PARAMS.SCOUT_EXPLORE_TURN_STEP_RAD,
      PARAMS.SCOUT_EXPLORE_TURN_STEP_RAD,
    );
  agent.scoutExploreAngle = outwardAngle;
  const distance = cmToPx(
    randomBetween(
      PARAMS.SCOUT_EXPLORE_MIN_RADIUS_CM,
      PARAMS.SCOUT_EXPLORE_MAX_RADIUS_CM,
    ),
  );
  const targetX = clamp(
    agent.x + Math.cos(outwardAngle) * distance,
    cmToPx(PARAMS.EDGE_MARGIN_CM),
    env.width - cmToPx(PARAMS.EDGE_MARGIN_CM),
  );
  const targetY = clamp(
    agent.y + Math.sin(outwardAngle) * distance,
    cmToPx(PARAMS.EDGE_MARGIN_CM),
    env.height - cmToPx(PARAMS.EDGE_MARGIN_CM),
  );
  agent.scoutExploreTargetX = targetX;
  agent.scoutExploreTargetY = targetY;

  return {
    x: targetX,
    y: targetY,
  };
};

const chooseScoutTarget = (agent, env) => {
  const flowerTarget = chooseFlowerTarget(agent, env);
  if (flowerTarget) {
    return {
      x:
        getFlowerBlossomPosition(flowerTarget, env.timeS || 0).x +
        randomBetween(-cmToPx(4), cmToPx(4)),
      y:
        getFlowerBlossomPosition(flowerTarget, env.timeS || 0).y +
        randomBetween(-cmToPx(4), cmToPx(4)),
      flower: flowerTarget,
    };
  }

  const explorationTarget = chooseExplorationTarget(agent, env);

  return {
    x: explorationTarget.x,
    y: explorationTarget.y,
    flower: null,
  };
};

const findReachedFlower = (agent, env, timeS = 0) => {
  if (!env.flowers?.length) {
    return null;
  }

  const reachRadius = cmToPx(PARAMS.FLOWER_REACH_RADIUS_CM);
  if (agent.targetFlowerId) {
    const targetFlower = env.flowers.find(
      (flower) => flower.id === agent.targetFlowerId,
    );
    if (targetFlower) {
      const blossom = getFlowerBlossomPosition(targetFlower, timeS);
      if (
        Math.hypot(agent.x - blossom.x, agent.y - blossom.y) <= reachRadius &&
        hasFlowerCapacity(targetFlower, env, agent, timeS)
      ) {
        return targetFlower;
      }
    }
  }
  const candidates = env.flowers
    .filter((flower) => {
      const blossom = getFlowerBlossomPosition(flower, timeS);
      return (
        Math.hypot(agent.x - blossom.x, agent.y - blossom.y) <= reachRadius &&
        hasFlowerCapacity(flower, env, agent, timeS)
      );
    })
    .sort((left, right) => {
      const leftBlossom = getFlowerBlossomPosition(left, timeS);
      const rightBlossom = getFlowerBlossomPosition(right, timeS);
      return (
        Math.hypot(agent.x - leftBlossom.x, agent.y - leftBlossom.y) -
        Math.hypot(agent.x - rightBlossom.x, agent.y - rightBlossom.y)
      );
    });

  return candidates[0] || null;
};

const getFlowerCollectorCount = (flower, env, agent = null, timeS = 0) => {
  if (!env.agents?.length) {
    return 0;
  }

  const collectionRadius = cmToPx(PARAMS.FLOWER_REACH_RADIUS_CM * 1.2);
  const claimRadius = cmToPx(PARAMS.FLOWER_REACH_RADIUS_CM * 2.4);
  const blossom = getFlowerBlossomPosition(flower, timeS);
  return env.agents.filter((other) => {
    if (other === agent || other.activityState === ACTIVITY_STATES.CULLING) {
      return false;
    }
    if (other.activityState !== ACTIVITY_STATES.FORAGING) {
      return false;
    }
    if (other.collectingFlowerId === flower.id) {
      return true;
    }
    if (
      Math.hypot(other.x - blossom.x, other.y - blossom.y) <= collectionRadius
    ) {
      return true;
    }
    return (
      Math.hypot(other.targetX - blossom.x, other.targetY - blossom.y) <=
      claimRadius
    );
  }).length;
};

const hasFlowerCapacity = (flower, env, agent = null, timeS = 0) =>
  getFlowerCollectorCount(flower, env, agent, timeS) <
  PARAMS.FLOWER_MAX_BEES_PER_FLOWER;

const setFlowerTarget = (agent, flower, timeS = 0, jitterPx = 0) => {
  const blossom = getFlowerBlossomPosition(flower, timeS);
  agent.targetFlowerId = flower.id;
  agent.targetX = blossom.x + randomBetween(-jitterPx, jitterPx);
  agent.targetY = blossom.y + randomBetween(-jitterPx, jitterPx);
};

const clearFlowerTarget = (agent) => {
  agent.targetFlowerId = null;
};

const getTargetFlower = (agent, env) => {
  if (!agent.targetFlowerId || !env.flowers?.length) {
    return null;
  }

  return (
    env.flowers.find((flower) => flower.id === agent.targetFlowerId) || null
  );
};

const clearFlowerCollectionState = (agent) => {
  agent.collectingFlowerId = null;
  agent.collectingFlowerX = null;
  agent.collectingFlowerY = null;
  agent.collectingFacingAngle = null;
};

const getTrackedFlower = (agent, env) => {
  if (!agent.collectingFlowerId || !env.flowers?.length) {
    return null;
  }

  const flower = env.flowers.find(
    (candidate) => candidate.id === agent.collectingFlowerId,
  );
  if (!flower) {
    clearFlowerCollectionState(agent);
    return null;
  }

  return flower;
};

const settleAgentOnFlower = (agent, flower, dt, timeS = 0) => {
  const blossom = getFlowerBlossomPosition(flower, timeS);
  const facingAngle = Math.atan2(blossom.y - agent.y, blossom.x - agent.x);
  const bodyOffset = cmToPx(
    Math.max(PARAMS.FLOWER_HEAD_OFFSET_CM, PARAMS.FLOWER_PERCH_OFFSET_CM),
  );
  const bodyCenterX = blossom.x - Math.cos(facingAngle) * bodyOffset;
  const bodyCenterY = blossom.y - Math.sin(facingAngle) * bodyOffset;
  const dx = bodyCenterX - agent.x;
  const dy = bodyCenterY - agent.y;
  const distance = Math.hypot(dx, dy);
  const maxStep = speedCmToPx(PARAMS.FLOWER_LANDING_SPEED_CM_S) * dt;
  const step = Math.min(distance, maxStep);
  const direction =
    distance > 1e-4 ? { x: dx / distance, y: dy / distance } : { x: 0, y: 0 };
  agent.collectingFlowerId = flower.id;
  agent.collectingFlowerX = blossom.x;
  agent.collectingFlowerY = blossom.y;
  agent.collectingFacingAngle = facingAngle;
  if (distance <= cmToPx(PARAMS.FLOWER_COLLECTION_SETTLE_RADIUS_CM * 1.5)) {
    agent.x = bodyCenterX;
    agent.y = bodyCenterY;
    agent.displayRotation = facingAngle;
    agent.vx = 0;
    agent.vy = 0;
  } else {
    agent.x += direction.x * step;
    agent.y += direction.y * step;
    agent.displayRotation = advanceAngle(
      agent.displayRotation || facingAngle,
      facingAngle,
      PARAMS.MAX_TURN_RATE_RAD_S * dt * 2.1,
    );
    agent.vx = direction.x * (step / Math.max(dt, 1e-4)) * 0.55;
    agent.vy = direction.y * (step / Math.max(dt, 1e-4)) * 0.55;
  }
  return distance;
};

const refreshSharedForageMemory = (sharedForage, x, y) => {
  if (!sharedForage) {
    return;
  }

  sharedForage.active = true;
  sharedForage.x = x;
  sharedForage.y = y;
  sharedForage.timer = PARAMS.SHARED_FORAGE_MEMORY_S;
  sharedForage.recruitsRemaining = Math.max(
    sharedForage.recruitsRemaining || 0,
    Math.round(
      randomBetween(
        PARAMS.SHARED_FORAGE_RECRUITS_MIN,
        PARAMS.SHARED_FORAGE_RECRUITS_MAX,
      ),
    ),
  );
};

const updateSharedForageMemory = (sharedForage, dt) => {
  if (!sharedForage?.active) {
    return;
  }

  sharedForage.timer = Math.max(0, (sharedForage.timer || 0) - dt);
  if (sharedForage.timer > 0 && (sharedForage.recruitsRemaining || 0) > 0) {
    return;
  }

  sharedForage.active = false;
  sharedForage.recruitsRemaining = 0;
};

const createFlowerPatch = (x, y) => {
  const patchCount = Math.round(
    randomBetween(PARAMS.FLOWER_PATCH_MIN_COUNT, PARAMS.FLOWER_PATCH_MAX_COUNT),
  );
  const patchRadius = cmToPx(PARAMS.FLOWER_PATCH_RADIUS_CM);
  const minSpacing = 9;
  const flowers = [];

  for (let index = 0; index < patchCount; index += 1) {
    let placedFlower = null;

    for (let attempt = 0; attempt < 18; attempt += 1) {
      const angle =
        (index / patchCount) * Math.PI * 2 + randomBetween(-0.32, 0.32);
      const radius = randomBetween(patchRadius * 0.16, patchRadius);
      const candidate = {
        id: `${Date.now()}-${index}-${Math.random()}`,
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        swayPhase: index * 0.9 + Math.random() * 0.6,
      };
      const overlaps = flowers.some(
        (flower) =>
          Math.hypot(flower.x - candidate.x, flower.y - candidate.y) <
          minSpacing,
      );

      if (!overlaps) {
        placedFlower = candidate;
        break;
      }
    }

    if (!placedFlower) {
      const fallbackAngle = (index / patchCount) * Math.PI * 2;
      placedFlower = {
        id: `${Date.now()}-${index}-${Math.random()}`,
        x: x + Math.cos(fallbackAngle) * patchRadius * 0.72,
        y: y + Math.sin(fallbackAngle) * patchRadius * 0.72,
        swayPhase: index * 0.9 + Math.random() * 0.6,
      };
    }

    flowers.push(placedFlower);
  }

  return flowers;
};

const getFlowerBlossomPosition = (flower, timeS = 0) => {
  const sway = Math.sin(timeS * 2.4 + (flower.swayPhase ?? 0)) * 0.8;
  return {
    x: flower.x + sway,
    y: flower.y,
  };
};

const renderFlower = (ctx, flower, timeS) => {
  const { x: blossomX, y: blossomY } = getFlowerBlossomPosition(flower, timeS);
  const stemBaseX = flower.x;
  const stemBaseY = flower.y + 20;
  ctx.strokeStyle = "rgba(68, 126, 66, 0.68)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(blossomX, blossomY + 7);
  ctx.lineTo(stemBaseX, stemBaseY);
  ctx.stroke();

  ctx.fillStyle = "rgba(247, 199, 66, 0.96)";
  for (let petalIndex = 0; petalIndex < 6; petalIndex += 1) {
    const angle = (petalIndex / 6) * Math.PI * 2 + timeS * 0.2;
    ctx.beginPath();
    ctx.arc(
      blossomX + Math.cos(angle) * 5,
      blossomY + Math.sin(angle) * 5,
      3.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.fillStyle = "rgba(164, 80, 122, 0.92)";
  ctx.beginPath();
  ctx.arc(blossomX, blossomY, 3.3, 0, Math.PI * 2);
  ctx.fill();
};

const pointInsideCurtain = (env, x, y, ratio = 1) => {
  const dx = x - env.curtain.x;
  const dy = y - env.curtain.y;
  const angle = Math.atan2(dy, dx);
  const localRadius = getCurtainRadiusAtAngle(env, angle) * ratio;
  return dx * dx + dy * dy <= localRadius * localRadius;
};

const projectPointInsideCurtain = (env, x, y, ratio = 0.96) => {
  const dx = x - env.curtain.x;
  const dy = y - env.curtain.y;
  const angle = Math.atan2(dy, dx);
  const localRadius = getCurtainRadiusAtAngle(env, angle) * ratio;
  const distance = Math.hypot(dx, dy);

  if (distance <= localRadius || distance <= 1e-4) {
    return { x, y };
  }

  const scale = localRadius / distance;
  return {
    x: env.curtain.x + dx * scale,
    y: env.curtain.y + dy * scale,
  };
};

const projectPointOntoCurtainSurface = (env, x, y, ratio = 0.95) => {
  const dx = x - env.curtain.x;
  const dy = y - env.curtain.y;
  const angle = Math.atan2(dy, dx);
  const localRadius = getCurtainRadiusAtAngle(env, angle) * ratio;
  const direction = normalize(dx, dy, { x: 0, y: -1 });
  return {
    x: env.curtain.x + direction.x * localRadius,
    y: env.curtain.y + direction.y * localRadius,
  };
};

const getCurtainSurfaceGap = (env, x, y, ratio = 0.96) => {
  const dx = x - env.curtain.x;
  const dy = y - env.curtain.y;
  const angle = Math.atan2(dy, dx);
  const localRadius = getCurtainRadiusAtAngle(env, angle) * ratio;
  return Math.hypot(dx, dy) - localRadius;
};

const buildAnchorSlots = (env, count, temperatureC) => {
  const packing = getTemperaturePackingProfile(temperatureC);
  let spacing = cmToPx(PARAMS.ANCHOR_SPACING_CM) * packing.spacingScale;
  let slots = [];

  for (let attempt = 0; attempt < 10 && slots.length < count; attempt += 1) {
    slots = [];
    const rowStep = spacing * 0.8660254;
    const radius = env.curtain.radius;

    for (
      let row = -Math.ceil(radius / rowStep);
      row <= Math.ceil(radius / rowStep);
      row += 1
    ) {
      const offsetY = row * rowStep;
      const y = env.curtain.y + offsetY;
      const xOffset = row % 2 === 0 ? 0 : spacing * 0.5;
      const normalizedY = Math.abs(offsetY) / Math.max(rowStep, radius);
      const widthScale = clamp(1 - normalizedY * normalizedY * 0.78, 0.22, 1);
      const rowHalfWidth = radius * widthScale;
      let column = 0;
      for (
        let x = env.curtain.x - rowHalfWidth;
        x <= env.curtain.x + rowHalfWidth;
        x += spacing
      ) {
        const px = x + xOffset;
        const py = y;
        if (!pointInsideCurtain(env, px, py, 0.92)) {
          column += 1;
          continue;
        }
        slots.push({ id: `${row}:${column}`, x: px, y: py });
        column += 1;
      }
    }

    spacing *= 0.92;
  }

  return slots;
};

const takeClosestSlots = (available, count, target, scoreFn = null) => {
  const ranked = available
    .map((slot, index) => ({
      slot,
      index,
      score:
        (scoreFn ? scoreFn(slot) : 0) +
        Math.hypot(slot.x - target.x, slot.y - target.y),
    }))
    .sort((a, b) => a.score - b.score);

  const chosen = ranked.slice(0, count);
  const chosenIndexes = new Set(chosen.map((entry) => entry.index));

  return {
    slots: chosen.map((entry) => entry.slot),
    remaining: available.filter((_, index) => !chosenIndexes.has(index)),
  };
};

const buildAnchorLayout = (
  width,
  height,
  count,
  controls = DEFAULT_CONTROL_STATE,
) => {
  const env = getEnvironment(width, height, 0, null, controls);
  const scoutBandY = env.curtain.y - env.curtain.radius * 0.18;
  const scoutLimit = Math.max(
    4,
    Math.round(count * PARAMS.DEFAULT_SCOUT_RATIO),
  );
  const defenderLimit = Math.max(8, Math.round(count * 0.16));
  const slots = buildAnchorSlots(env, count + 24, controls.TEMPERATURE_C);

  const scoutSelection = takeClosestSlots(
    slots,
    scoutLimit,
    { x: env.curtain.x, y: scoutBandY },
    (slot) =>
      Math.max(0, slot.y - env.curtain.y) * 1.35 +
      Math.abs(slot.y - scoutBandY) * 0.55 +
      Math.abs(slot.x - env.curtain.x) * 0.06,
  );
  const defenderSelection = takeClosestSlots(
    scoutSelection.remaining,
    defenderLimit,
    env.entrance,
    (slot) =>
      Math.abs(slot.x - env.entrance.x) * 0.35 +
      Math.max(0, slot.y - env.entrance.y) * 2.4,
  );
  const workerSlots = defenderSelection.remaining.sort((left, right) => {
    if (left.y !== right.y) {
      return left.y - right.y;
    }
    return left.x - right.x;
  });

  return {
    scoutLimit,
    defenderLimit,
    allSlots: slots,
    scoutSlots: scoutSelection.slots,
    defenderSlots: defenderSelection.slots,
    workerSlots,
  };
};

const applyLayoutToExistingAgents = (agents, layout) => {
  const roleSlotCounts = {
    [ROLES.SCOUT]: 0,
    [ROLES.DEFENDER]: 0,
    [ROLES.WORKER]: 0,
  };

  agents.forEach((agent) => {
    const role = agent.role;
    const slotIndex = roleSlotCounts[role];
    roleSlotCounts[role] += 1;

    const nextSlot =
      role === ROLES.SCOUT
        ? layout.scoutSlots[slotIndex % layout.scoutSlots.length]
        : role === ROLES.DEFENDER
          ? layout.defenderSlots[slotIndex % layout.defenderSlots.length]
          : layout.workerSlots[slotIndex % layout.workerSlots.length];

    if (!nextSlot) {
      return;
    }

    agent.desiredHomeSlotId = nextSlot.id;
    agent.desiredAnchorX = nextSlot.x;
    agent.desiredAnchorY = nextSlot.y;

    if (role === ROLES.SCOUT) {
      agent.homeSlotId = nextSlot.id;
      agent.anchorX = nextSlot.x;
      agent.anchorY = nextSlot.y;
      agent.danceOriginX = nextSlot.x;
      agent.danceOriginY = nextSlot.y;
      if (agent.isAnchored) {
        agent.x = nextSlot.x;
        agent.y = nextSlot.y;
      }
      return;
    }

    if (agent.isAnchored && agent.activityState === ACTIVITY_STATES.IDLE) {
      return;
    }

    agent.homeSlotId = nextSlot.id;
    agent.anchorX = nextSlot.x;
    agent.anchorY = nextSlot.y;
  });
};

const getWaggleRunSeconds = (targetDistanceM) => {
  const ratio = clamp((targetDistanceM - 100) / (3400 - 100), 0, 1);
  return lerp(PARAMS.WAGGLE_100M_S, PARAMS.WAGGLE_3400M_S, ratio);
};

const getWaggleAngle = (sunAzimuthDeg) => {
  const targetBearingDeg = 55;
  const correctedDeg = targetBearingDeg - sunAzimuthDeg;
  return ((correctedDeg - 90) * Math.PI) / 180;
};

const createAgent = (width, height, index, count, layout, options = {}) => {
  const inferredRole =
    index < layout.scoutLimit
      ? ROLES.SCOUT
      : index < layout.scoutLimit + layout.defenderLimit
        ? ROLES.DEFENDER
        : ROLES.WORKER;
  const role = options.role || inferredRole;

  const inferredSlotIndex =
    role === ROLES.SCOUT
      ? index
      : role === ROLES.DEFENDER
        ? index - layout.scoutLimit
        : index - layout.scoutLimit - layout.defenderLimit;
  const slotIndex = options.roleSlotIndex ?? inferredSlotIndex;

  const anchorSlot =
    role === ROLES.SCOUT
      ? layout.scoutSlots[slotIndex % layout.scoutSlots.length]
      : role === ROLES.DEFENDER
        ? layout.defenderSlots[slotIndex % layout.defenderSlots.length]
        : layout.workerSlots[slotIndex % layout.workerSlots.length];
  const scoutRoostCount = Math.max(
    1,
    Math.round(layout.workerSlots.length * 0.18),
  );
  const scoutRoostStart = Math.max(
    0,
    Math.floor(layout.workerSlots.length * 0.18),
  );
  const scoutRoostBand = layout.workerSlots.slice(
    scoutRoostStart,
    scoutRoostStart + scoutRoostCount,
  );
  const scoutRoostSlot =
    role === ROLES.SCOUT
      ? scoutRoostBand[slotIndex % scoutRoostBand.length] || anchorSlot
      : anchorSlot;
  const spawnSlot = role === ROLES.SCOUT ? scoutRoostSlot : anchorSlot;
  const spawnFromNest = options.spawnFromNest === true;
  const nestX = width * 0.5 + randomBetween(-cmToPx(0.85), cmToPx(0.85));
  const nestY = height * 0.5 + randomBetween(-cmToPx(0.85), cmToPx(0.85));

  const baseSpeed = speedCmToPx(
    role === ROLES.DEFENDER
      ? PARAMS.DEFENDER_SPEED_CM_S
      : role === ROLES.SCOUT
        ? PARAMS.SURFACE_CRAWL_SPEED_CM_S * 1.2
        : PARAMS.SURFACE_CRAWL_SPEED_CM_S,
  );
  return {
    id: `${Date.now()}-${index}-${Math.random()}`,
    x: spawnFromNest ? nestX : spawnSlot.x,
    y: spawnFromNest ? nestY : spawnSlot.y,
    homeSlotId: spawnSlot.id,
    desiredHomeSlotId: spawnSlot.id,
    currentSlotId: spawnFromNest ? null : spawnSlot.id,
    anchorX: spawnSlot.x,
    anchorY: spawnSlot.y,
    desiredAnchorX: spawnSlot.x,
    desiredAnchorY: spawnSlot.y,
    launchSlotId: role === ROLES.SCOUT ? anchorSlot.id : spawnSlot.id,
    launchX: role === ROLES.SCOUT ? anchorSlot.x : spawnSlot.x,
    launchY: role === ROLES.SCOUT ? anchorSlot.y : spawnSlot.y,
    scoutLaunchPending: false,
    danceOriginX: anchorSlot.x,
    danceOriginY: anchorSlot.y,
    vx: 0,
    vy: 0,
    ax: 0,
    ay: 0,
    role,
    activityState: spawnFromNest
      ? ACTIVITY_STATES.WANDERING
      : ACTIVITY_STATES.IDLE,
    shimmerState: SHIMMER_STATES.IDLE,
    shimmerTimer: 0,
    recentShimmerTimer: 0,
    activityLevel: role === ROLES.SCOUT ? 0.72 : randomBetween(0.18, 0.42),
    baseSpeed,
    targetX: anchorSlot.x,
    targetY: anchorSlot.y,
    phaseTimer: randomBetween(
      role === ROLES.SCOUT
        ? PARAMS.INITIAL_SCOUT_FORAGE_MIN_S
        : PARAMS.SCOUT_FORAGE_MIN_S,
      role === ROLES.SCOUT
        ? PARAMS.INITIAL_SCOUT_FORAGE_MAX_S
        : PARAMS.SCOUT_FORAGE_MAX_S,
    ),
    danceTimer: 0,
    danceRoundsLeft: Math.round(
      randomBetween(PARAMS.DANCE_ROUNDS_MIN, PARAMS.DANCE_ROUNDS_MAX),
    ),
    shakeTimer: 0,
    shakeCooldown: randomBetween(
      PARAMS.SHAKING_INTERVAL_MIN_S,
      PARAMS.SHAKING_INTERVAL_MAX_S,
    ),
    abdomenShakeOffset: randomBetween(0, Math.PI * 2),
    stageOffset: randomBetween(0, 1000),
    scoutExploreAngle:
      role === ROLES.SCOUT
        ? -Math.PI / 2 + randomBetween(-Math.PI * 0.5, Math.PI * 0.5)
        : 0,
    scoutExploreTargetX: null,
    scoutExploreTargetY: null,
    wanderAngle: randomBetween(-Math.PI, Math.PI),
    displayRotation:
      role === ROLES.SCOUT
        ? PARAMS.ANCHORED_ROTATION_RAD
        : PARAMS.ANCHORED_ROTATION_RAD,
    previousScreenPosition: null,
    spriteProfile: "simulation",
    spriteSpace: "2d",
    spriteState: undefined,
    isAnchored: !spawnFromNest,
    isAnchoredOnHornet: false,
    hornetAnchorAngle: randomBetween(0, Math.PI * 2),
    hornetAnchorRadius: cmToPx(
      randomBetween(
        PARAMS.HORNET_ATTACHMENT_MIN_CM,
        PARAMS.HORNET_ATTACHMENT_MAX_CM,
      ),
    ),
    thrownOffTimer: 0,
    thrownOffNoLandTimer: 0,
    returningFromThrowOff: false,
    throwOffRecoveryTimer: 0,
    throwOffRecoveryDuration: 0,
    reengageAttachDelayTimer: 0,
    reengageOrbitDirection: 1,
    tailDecoy: false,
    tailTargetX: null,
    tailTargetY: null,
    startupSurfaceHoldTimer:
      role === ROLES.WORKER
        ? randomBetween(
            PARAMS.INITIAL_SURFACE_HOLD_MIN_S,
            PARAMS.INITIAL_SURFACE_HOLD_MAX_S,
          )
        : 0,
    takeoffTimer: 0,
    scoutRestTimer: 0,
    anchorEaseTimer: 0,
    takeoffNextState: ACTIVITY_STATES.IDLE,
    foragePauseTimer: 0,
    foragePauseStarted: false,
    targetFlowerId: null,
    collectingFlowerId: null,
    collectingFlowerX: null,
    collectingFlowerY: null,
    collectingFacingAngle: null,
    forageMemoryX: null,
    forageMemoryY: null,
    hasForageMemory: false,
    pollenLoaded: false,
    shouldRemove: false,
    recruitedByDance: false,
    workerPostForageRestTimer: 0,
    workerResumeForagePending: false,
    heatBallTimer: 0,
    surfaceTargetX: spawnSlot.x,
    surfaceTargetY: spawnSlot.y,
    surfaceTargetSlotId: anchorSlot.id,
    surfaceWanderTimer: 0,
    settlingTargetX: anchorSlot.x,
    settlingTargetY: anchorSlot.y,
    settlingSlotId: anchorSlot.id,
    nextSurfaceState: ACTIVITY_STATES.IDLE,
    groomingTimer: 0,
    microTurnPhase: randomBetween(0, Math.PI * 2),
    surfaceSignalTimer: 0,
    heatBalling: false,
  };
};

const getAgentReservedSlotId = (agent) => {
  if (agent.activityState === ACTIVITY_STATES.WANDERING) {
    return agent.surfaceTargetSlotId ?? null;
  }

  if (agent.activityState === ACTIVITY_STATES.SETTLING) {
    return agent.settlingSlotId ?? null;
  }

  return agent.currentSlotId ?? null;
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

const buildSpatialGrid = (agents) => {
  const cellSize = cmToPx(PARAMS.GRID_CELL_CM);
  const grid = new Map();

  agents.forEach((agent) => {
    const cellX = Math.floor(agent.x / cellSize);
    const cellY = Math.floor(agent.y / cellSize);
    const key = `${cellX},${cellY}`;
    if (!grid.has(key)) {
      grid.set(key, []);
    }
    grid.get(key).push(agent);
    agent.cellX = cellX;
    agent.cellY = cellY;
  });

  return { grid, cellSize };
};

const collectNeighbors = (agent, spatial) => {
  const neighbors = [];
  for (let y = agent.cellY - 1; y <= agent.cellY + 1; y += 1) {
    for (let x = agent.cellX - 1; x <= agent.cellX + 1; x += 1) {
      const bucket = spatial.grid.get(`${x},${y}`);
      if (!bucket) {
        continue;
      }
      bucket.forEach((other) => {
        if (other === agent) {
          return;
        }
        const dx = other.x - agent.x;
        const dy = other.y - agent.y;
        const distance = Math.hypot(dx, dy);
        if (distance <= cmToPx(PARAMS.INTERACTION_RADIUS_CM)) {
          neighbors.push({ other, dx, dy, distance });
        }
      });
    }
  }
  return neighbors;
};

const updateShimmerState = (agent, dt) => {
  agent.recentShimmerTimer = Math.max(0, (agent.recentShimmerTimer || 0) - dt);
  if (agent.shimmerState === SHIMMER_STATES.IDLE) {
    return;
  }

  agent.shimmerTimer -= dt;
  if (agent.shimmerTimer > 0) {
    return;
  }

  if (agent.shimmerState === SHIMMER_STATES.ACTIVE) {
    agent.shimmerState = SHIMMER_STATES.REFRACTORY;
    agent.shimmerTimer = PARAMS.SHIMMER_REFRACTORY_S;
  } else {
    agent.shimmerState = SHIMMER_STATES.IDLE;
    agent.shimmerTimer = 0;
  }
};

const canSeePredator = (agent, predator) => {
  const distance = Math.hypot(predator.x - agent.x, predator.y - agent.y);
  if (distance < 1) {
    return true;
  }
  if (distance > cmToPx(PARAMS.PREDATOR_VISUAL_RANGE_CM)) {
    return false;
  }
  const visualAngleDeg =
    (2 * Math.atan(predator.radius / distance) * 180) / Math.PI;
  return visualAngleDeg >= PARAMS.PREDATOR_VISUAL_THRESHOLD_DEG;
};

const triggerShimmer = (agent, responseProbability = 1) => {
  if (Math.random() > responseProbability) {
    return;
  }
  if (agent.shimmerState !== SHIMMER_STATES.IDLE) {
    return;
  }
  agent.shimmerState = SHIMMER_STATES.ACTIVE;
  agent.shimmerTimer = PARAMS.SHIMMER_ACTIVE_S;
  agent.recentShimmerTimer = PARAMS.SHIMMER_RELAY_WINDOW_S;
  agent.activityLevel = Math.max(agent.activityLevel, 0.78);
};

const shouldShakeOffAttachedBee = (agent, env) => {
  if (!agent.isAnchoredOnHornet) {
    return false;
  }

  return env.predator.shakeOffSelectedAgentIds?.has(agent.id) || false;
};

const maybeSelectForcedShakeOffAgent = (attachedAgents, env) => {
  env.predator.shakeOffBurstRatio = 0;
  env.predator.shakeOffSelectedAgentIds = null;
  if (!attachedAgents.length) {
    return null;
  }

  const predatorSpeed = env.predator.speedPx || 0;
  const turnSharpness = env.predator.turnSharpness || 0;
  const reversalScore = env.predator.reversalScore || 0;
  const shakeEventId = env.predator.shakeEventId || 0;
  const directionalShake =
    predatorSpeed >= PARAMS.SHAKE_OFF_TURN_MIN_SPEED_PX &&
    turnSharpness >= PARAMS.SHAKE_OFF_TURN_SHARPNESS_THRESHOLD &&
    reversalScore >= PARAMS.SHAKE_OFF_REVERSAL_MIN_SCORE;
  if (!directionalShake || shakeEventId <= 0) {
    return null;
  }

  if (env.predator.pointerState?.processedShakeEventId === shakeEventId) {
    return null;
  }

  const targetCount = Math.max(
    1,
    Math.min(
      attachedAgents.length,
      Math.round(attachedAgents.length * PARAMS.SHAKE_OFF_TARGET_RATIO),
    ),
  );
  const shuffledAgents = [...attachedAgents];
  for (let index = shuffledAgents.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledAgents[index], shuffledAgents[swapIndex]] = [
      shuffledAgents[swapIndex],
      shuffledAgents[index],
    ];
  }
  const selectedAgents = shuffledAgents.slice(0, targetCount);

  env.predator.shakeOffSelectedAgentIds = new Set(
    selectedAgents.map((agent) => agent.id),
  );
  env.predator.shakeOffBurstRatio =
    targetCount / Math.max(attachedAgents.length, 1);
  if (env.predator.pointerState) {
    env.predator.pointerState.processedShakeEventId = shakeEventId;
  }
  return env.predator.shakeOffSelectedAgentIds;
};

const snapToAnchor = (agent) => {
  agent.isAnchored = true;
  agent.isAnchoredOnHornet = false;
  agent.anchorEaseTimer = Math.max(
    agent.anchorEaseTimer || 0,
    PARAMS.ANCHOR_EASE_S,
  );
  agent.vx *= 0.28;
  agent.vy *= 0.28;
  agent.ax = 0;
  agent.ay = 0;
  agent.surfaceTargetX = agent.anchorX;
  agent.surfaceTargetY = agent.anchorY;
  agent.currentSlotId = agent.tailDecoy ? null : agent.homeSlotId;
  agent.surfaceWanderTimer = 0;
  agent.settlingTargetX = agent.anchorX;
  agent.settlingTargetY = agent.anchorY;
  agent.surfaceTargetSlotId = agent.tailDecoy ? null : agent.homeSlotId;
  agent.settlingSlotId = agent.tailDecoy ? null : agent.homeSlotId;
  agent.heatBalling = false;
  agent.heatBallTimer = 0;
  agent.returningFromThrowOff = false;
  agent.throwOffRecoveryTimer = 0;
  agent.throwOffRecoveryDuration = 0;
  agent.settlingSpeedCmS = PARAMS.SETTLING_SPEED_CM_S;
  agent.nextSurfaceState = ACTIVITY_STATES.IDLE;
};

const moveAgentToward = (
  agent,
  targetX,
  targetY,
  dt,
  maxSpeedCmS,
  settleEpsilonCm = 0.04,
) => {
  const dx = targetX - agent.x;
  const dy = targetY - agent.y;
  const distance = Math.hypot(dx, dy);
  const settleEpsilonPx = cmToPx(settleEpsilonCm);

  if (distance <= settleEpsilonPx) {
    agent.x = targetX;
    agent.y = targetY;
    agent.vx = 0;
    agent.vy = 0;
    return 0;
  }

  const maxStep = Math.max(speedCmToPx(maxSpeedCmS) * dt, 1e-4);
  const step = Math.min(distance, maxStep);
  const directionX = dx / Math.max(distance, 1e-4);
  const directionY = dy / Math.max(distance, 1e-4);
  agent.x += directionX * step;
  agent.y += directionY * step;
  agent.vx = directionX * (step / Math.max(dt, 1e-4));
  agent.vy = directionY * (step / Math.max(dt, 1e-4));
  return Math.max(0, distance - step);
};

const hasExplicitSlotTarget = (target) =>
  Object.prototype.hasOwnProperty.call(target || {}, "slotId");

const shouldReengageHornet = (agent, env) => {
  if (
    getThreatType(env.controls || DEFAULT_CONTROL_STATE) === THREAT_TYPES.NONE
  ) {
    return false;
  }

  return (
    Math.hypot(agent.x - env.predator.x, agent.y - env.predator.y) <=
    cmToPx(PARAMS.THROWN_OFF_REENGAGE_RADIUS_CM)
  );
};
const startDance = (agent) => {
  agent.activityState = ACTIVITY_STATES.DANCING;
  agent.danceTimer = 0;
  agent.danceOriginX = agent.anchorX;
  agent.danceOriginY = agent.anchorY;
  agent.danceRoundsLeft = Math.round(
    randomBetween(PARAMS.DANCE_ROUNDS_MIN, PARAMS.DANCE_ROUNDS_MAX),
  );
};

const startSurfaceSignaling = (agent) => {
  agent.activityState = ACTIVITY_STATES.SIGNALING;
  agent.surfaceSignalTimer = randomBetween(
    PARAMS.SURFACE_SIGNALING_MIN_S,
    PARAMS.SURFACE_SIGNALING_MAX_S,
  );
  agent.shakeTimer = 0;
  agent.shakeCooldown = randomBetween(0.08, 0.24);
};

const beginTakeoff = (agent, nextState, target = null) => {
  clearFlowerCollectionState(agent);
  if (agent.role === ROLES.DEFENDER) {
    snapToAnchor(agent);
    agent.activityState = ACTIVITY_STATES.DEFENDING;
    return;
  }
  agent.isAnchored = true;
  agent.isAnchoredOnHornet = false;
  agent.returningFromThrowOff = false;
  agent.throwOffRecoveryTimer = 0;
  agent.activityState = ACTIVITY_STATES.TAKEOFF;
  agent.takeoffNextState = nextState;
  agent.takeoffTimer = getTakeoffDelayS();
  if (agent.role === ROLES.SCOUT && nextState === ACTIVITY_STATES.FORAGING) {
    agent.phaseTimer = randomBetween(
      PARAMS.SCOUT_FORAGE_MIN_S,
      PARAMS.SCOUT_FORAGE_MAX_S,
    );
  }
  agent.vx = 0;
  agent.vy = 0;
  if (target) {
    agent.targetX = target.x;
    agent.targetY = target.y;
  }
};

const launchToHeatBall = (agent, options = {}) => {
  const { attachDelayS = 0, predatorX = null, predatorY = null } = options;
  agent.isAnchored = false;
  agent.isAnchoredOnHornet = false;
  agent.returningFromThrowOff = false;
  agent.throwOffRecoveryTimer = 0;
  agent.throwOffRecoveryDuration = 0;
  agent.currentSlotId = null;
  agent.activityState = ACTIVITY_STATES.HEAT_BALLING;
  agent.heatBalling = true;
  agent.heatBallTimer = 0;
  agent.reengageAttachDelayTimer = Math.max(0, attachDelayS);
  if (attachDelayS > 0 && predatorX != null && predatorY != null) {
    agent.hornetAnchorAngle = Math.atan2(
      agent.y - predatorY,
      agent.x - predatorX,
    );
  }
  agent.reengageOrbitDirection =
    Math.sin(agent.stageOffset * 0.013) >= 0 ? 1 : -1;
  agent.shimmerState = SHIMMER_STATES.IDLE;
  agent.shimmerTimer = 0;
};

const canAgentLaunchToHeatBall = (agent, env) => {
  if (agent.role === ROLES.DEFENDER) {
    return true;
  }

  if (agent.activityState !== ACTIVITY_STATES.DEFENDING) {
    return false;
  }

  const colonyCount = Math.max(
    1,
    Math.round(env.controls?.COUNT ?? DEFAULT_CONTROL_STATE.COUNT),
  );
  const attachedCount = env.predator.attachedHornetCount || 0;
  const targetAttachedCount = clamp(
    Math.round(colonyCount * PARAMS.HEAT_BALL_SUPPORT_RATIO),
    PARAMS.HEAT_BALL_SUPPORT_MIN_ATTACHED,
    PARAMS.HEAT_BALL_SUPPORT_MAX_ATTACHED,
  );

  return attachedCount < targetAttachedCount;
};

const steerToward = (agent, target, weight) => {
  const dx = target.x - agent.x;
  const dy = target.y - agent.y;
  const direction = normalize(dx, dy, { x: 0, y: -1 });
  agent.ax += direction.x * weight;
  agent.ay += direction.y * weight;
};

const applyCurtainPullForce = (
  agent,
  env,
  weight = PARAMS.CURTAIN_PULL_WEIGHT,
) => {
  if (!env?.curtain) {
    return;
  }

  const dx = env.curtain.x - agent.x;
  const dy = env.curtain.y - agent.y;
  const angle = Math.atan2(-dy, -dx);
  const localRadius = getCurtainRadiusAtAngle(env, angle);
  const distance = Math.hypot(dx, dy);

  if (distance <= localRadius) {
    return;
  }

  const overshootRatio = clamp(
    (distance - localRadius) / Math.max(localRadius, 1),
    0,
    1.2,
  );
  const direction = normalize(dx, dy, { x: 0, y: -1 });
  agent.ax += direction.x * PARAMS.MAX_STEER_CM_S2 * overshootRatio * weight;
  agent.ay += direction.y * PARAMS.MAX_STEER_CM_S2 * overshootRatio * weight;
};

const applyFreeFlight = (
  agent,
  target,
  neighbors,
  dt,
  speedScale = 1,
  options = {},
) => {
  agent.ax = 0;
  agent.ay = 0;
  const repulsionRadius = cmToPx(PARAMS.REPULSION_RADIUS_CM);
  const {
    protean = false,
    timeS = 0,
    proteanAmplitude = PARAMS.PROTEAN_AMPLITUDE,
    proteanFrequencyHz = PARAMS.PROTEAN_FREQUENCY_HZ,
    repulsionWeightScale = 1,
    repelAnchored = true,
    repelAirborne = true,
    steerScale = 1,
    wanderScale = 1,
    liftY = 0,
    dampingPerS = PARAMS.FLIGHT_DAMPING_PER_S,
    velocityTrackPerS = PARAMS.FLIGHT_VELOCITY_TRACK_PER_S,
    arrivalRadiusCm = 0,
    minArrivalSpeedScale = 1,
    cruiseRatio = PARAMS.FLIGHT_CRUISE_RATIO,
    curtainEnv = null,
    curtainPullWeight = PARAMS.CURTAIN_PULL_WEIGHT,
  } = options;
  const distanceToTarget = Math.hypot(target.x - agent.x, target.y - agent.y);
  const arrivalBlend =
    arrivalRadiusCm > 0
      ? clamp(distanceToTarget / cmToPx(arrivalRadiusCm), 0, 1)
      : 1;
  const arrivalSpeedScale = lerp(minArrivalSpeedScale, 1, arrivalBlend);

  neighbors.forEach(({ other, dx, dy, distance }) => {
    if (distance <= 0.001 || distance > repulsionRadius) {
      return;
    }
    if (!repelAnchored && other?.isAnchored) {
      return;
    }
    if (!repelAirborne && !other?.isAnchored && !other?.isAnchoredOnHornet) {
      return;
    }
    const proximity = 1 - distance / repulsionRadius;
    const strength =
      PARAMS.REPULSION_WEIGHT * repulsionWeightScale * (1 + proximity * 2.2);
    agent.ax -= (dx / distance) * PARAMS.MAX_STEER_CM_S2 * strength;
    agent.ay -= (dy / distance) * PARAMS.MAX_STEER_CM_S2 * strength;
  });

  steerToward(
    agent,
    target,
    PARAMS.MAX_STEER_CM_S2 * speedScale * steerScale * arrivalSpeedScale,
  );
  if (curtainEnv) {
    applyCurtainPullForce(agent, curtainEnv, curtainPullWeight);
  }
  if (protean) {
    const direction = normalize(agent.vx, agent.vy, {
      x: target.x - agent.x,
      y: target.y - agent.y,
    });
    const perpendicular = { x: -direction.y, y: direction.x };
    const zigZag = Math.sin(
      timeS * proteanFrequencyHz * Math.PI * 2 + agent.stageOffset,
    );
    agent.ax +=
      perpendicular.x * PARAMS.MAX_STEER_CM_S2 * proteanAmplitude * zigZag;
    agent.ay +=
      perpendicular.y * PARAMS.MAX_STEER_CM_S2 * proteanAmplitude * zigZag;
  }
  agent.wanderAngle += randomBetween(-1, 1) * dt * 0.45;
  agent.ax +=
    Math.cos(agent.wanderAngle) *
    PARAMS.WANDER_WEIGHT *
    PARAMS.MAX_STEER_CM_S2 *
    wanderScale;
  agent.ay +=
    Math.sin(agent.wanderAngle) *
    PARAMS.WANDER_WEIGHT *
    PARAMS.MAX_STEER_CM_S2 *
    wanderScale;

  agent.ay += liftY;

  const acceleration = limitVector(
    agent.ax,
    agent.ay,
    speedCmToPx(PARAMS.MAX_STEER_CM_S2),
  );
  agent.vx += acceleration.x * dt;
  agent.vy += acceleration.y * dt;
  const desiredDirection = normalize(target.x - agent.x, target.y - agent.y, {
    x: agent.vx,
    y: agent.vy,
  });
  const desiredSpeed = speedCmToPx(
    PARAMS.MAX_SPEED_CM_S * speedScale * arrivalSpeedScale * cruiseRatio,
  );
  const desiredVelocity = {
    x: desiredDirection.x * desiredSpeed,
    y: desiredDirection.y * desiredSpeed,
  };
  const trackBlend = clamp(velocityTrackPerS * dt, 0, 1);
  agent.vx = lerp(agent.vx, desiredVelocity.x, trackBlend);
  agent.vy = lerp(agent.vy, desiredVelocity.y, trackBlend);
  const damping = Math.max(0, 1 - dampingPerS * dt);
  agent.vx *= damping;
  agent.vy *= damping;
  let speedLimit = speedCmToPx(
    PARAMS.MAX_SPEED_CM_S * speedScale * arrivalSpeedScale,
  );
  if (
    !protean &&
    arrivalRadiusCm > 0 &&
    distanceToTarget < cmToPx(arrivalRadiusCm)
  ) {
    const brakeFactor = Math.max(
      0.1,
      distanceToTarget / Math.max(cmToPx(arrivalRadiusCm), 1e-4),
    );
    speedLimit *= brakeFactor;
    agent.vx *= 0.85;
    agent.vy *= 0.85;
    agent.ax *= 1.5;
    agent.ay *= 1.5;
  }
  const limitedVelocity = limitVector(agent.vx, agent.vy, speedLimit);
  agent.vx = limitedVelocity.x;
  agent.vy = limitedVelocity.y;
  agent.x += agent.vx * dt;
  agent.y += agent.vy * dt;
};

const attachToHornet = (agent, env) => {
  const anchorX =
    env.predator.x +
    Math.cos(agent.hornetAnchorAngle) * agent.hornetAnchorRadius;
  const anchorY =
    env.predator.y +
    Math.sin(agent.hornetAnchorAngle) * agent.hornetAnchorRadius;
  agent.isAnchored = false;
  agent.isAnchoredOnHornet = true;
  agent.activityState = ACTIVITY_STATES.HEAT_BALLING;
  agent.heatBalling = true;
  const snapBlend =
    Math.hypot(agent.x - anchorX, agent.y - anchorY) <= cmToPx(0.24)
      ? 0.62
      : 0.28;
  agent.x = lerp(agent.x, anchorX, snapBlend);
  agent.y = lerp(agent.y, anchorY, snapBlend);
  agent.vx *= 0.18;
  agent.vy *= 0.18;
};

const throwOffHornetBee = (agent, env) => {
  const predatorDirection = normalize(env.predator.vx, env.predator.vy, {
    x: Math.cos(agent.hornetAnchorAngle),
    y: Math.sin(agent.hornetAnchorAngle),
  });
  const radial = normalize(
    agent.x - env.predator.x,
    agent.y - env.predator.y,
    predatorDirection,
  );
  const tangent = {
    x: -radial.y,
    y: radial.x,
  };
  agent.isAnchored = false;
  agent.isAnchoredOnHornet = false;
  agent.activityState = ACTIVITY_STATES.THROWN_OFF;
  agent.thrownOffTimer = PARAMS.THROWN_OFF_S;
  agent.takeoffTimer = 0;
  agent.tailDecoy = false;
  agent.tailTargetX = null;
  agent.tailTargetY = null;
  agent.throwOffRecoveryDuration = PARAMS.THROWN_OFF_RETURN_FATIGUE_S;
  const predatorSpeed = env.predator.speedPx || 0;
  const throwSpeedScale = clamp(
    predatorSpeed / Math.max(PARAMS.SHAKE_OFF_TURN_MIN_SPEED_PX, 1e-4),
    PARAMS.SHAKE_OFF_THROW_SPEED_MIN_SCALE,
    PARAMS.SHAKE_OFF_THROW_SPEED_MAX_SCALE,
  );
  const throwSpeed = speedCmToPx(
    PARAMS.SHAKE_OFF_THROW_SPEED_CM_S * throwSpeedScale,
  );
  agent.thrownOffNoLandTimer = lerp(
    PARAMS.THROWN_OFF_NO_LAND_MIN_S,
    PARAMS.THROWN_OFF_NO_LAND_MAX_S,
    clamp(
      (throwSpeedScale - PARAMS.SHAKE_OFF_THROW_SPEED_MIN_SCALE) /
        Math.max(
          PARAMS.SHAKE_OFF_THROW_SPEED_MAX_SCALE -
            PARAMS.SHAKE_OFF_THROW_SPEED_MIN_SCALE,
          1e-4,
        ),
      0,
      1,
    ),
  );
  const lateralBias =
    radial.x * predatorDirection.y - radial.y * predatorDirection.x;
  const tangentSign = Math.sign(lateralBias) || (Math.random() < 0.5 ? -1 : 1);
  const backwardWeight = randomBetween(0.88, 1.16);
  const tangentWeight = randomBetween(0.18, 0.54) * tangentSign;
  const radialWeight = randomBetween(0.04, 0.2);
  agent.vx =
    (-predatorDirection.x * backwardWeight +
      tangent.x * tangentWeight +
      radial.x * radialWeight) *
    throwSpeed;
  agent.vy =
    (-predatorDirection.y * backwardWeight +
      tangent.y * tangentWeight +
      radial.y * radialWeight) *
    throwSpeed;
  agent.heatBalling = false;
  agent.heatBallTimer = 0;
};

const moveAlongSurface = (
  agent,
  target,
  dt,
  speedCmS = PARAMS.SURFACE_CRAWL_SPEED_CM_S,
) => {
  const dx = target.x - agent.x;
  const dy = target.y - agent.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 1e-4) {
    agent.vx = 0;
    agent.vy = 0;
    return distance;
  }

  const boost = lerp(
    1,
    PARAMS.SHAKING_BOOST_MULTIPLIER,
    clamp((agent.activityLevel - 0.3) / 0.7, 0, 1),
  );
  const step = Math.min(distance, speedCmToPx(speedCmS * boost) * dt);
  const direction = { x: dx / distance, y: dy / distance };
  agent.x += direction.x * step;
  agent.y += direction.y * step;
  agent.vx = direction.x * (step / Math.max(dt, 1e-4));
  agent.vy = direction.y * (step / Math.max(dt, 1e-4));
  const crawlRotation = Math.atan2(direction.y, direction.x);
  agent.displayRotation = advanceAngle(
    agent.displayRotation || PARAMS.ANCHORED_ROTATION_RAD,
    crawlRotation,
    PARAMS.MAX_TURN_RATE_RAD_S * dt,
  );
  return distance - step;
};

const beginSurfaceMove = (agent, target, nextState = ACTIVITY_STATES.IDLE) => {
  agent.isAnchored = false;
  agent.returningFromThrowOff = false;
  agent.throwOffRecoveryTimer = 0;
  agent.activityState = ACTIVITY_STATES.WANDERING;
  agent.currentSlotId = null;
  agent.surfaceTargetX = target.x;
  agent.surfaceTargetY = target.y;
  agent.surfaceTargetSlotId = hasExplicitSlotTarget(target)
    ? target.slotId
    : agent.surfaceTargetSlotId;
  agent.surfaceWanderTimer = randomBetween(
    PARAMS.SURFACE_WANDER_MIN_S,
    PARAMS.SURFACE_WANDER_MAX_S,
  );
  agent.nextSurfaceState = nextState;
};

const landOnCurtainAndWalkHome = (agent, env, dt) => {
  const landingPoint = projectPointOntoCurtainSurface(env, agent.x, agent.y);
  moveAgentToward(
    agent,
    landingPoint.x,
    landingPoint.y,
    dt,
    PARAMS.SURFACE_CRAWL_SPEED_CM_S,
    0.02,
  );
  agent.ax = 0;
  agent.ay = 0;
  beginSurfaceMove(
    agent,
    {
      slotId: agent.homeSlotId,
      x: agent.anchorX,
      y: agent.anchorY,
    },
    ACTIVITY_STATES.IDLE,
  );
};

const beginSettling = (
  agent,
  target,
  nextState = ACTIVITY_STATES.IDLE,
  settlingSpeedCmS = PARAMS.SETTLING_SPEED_CM_S,
) => {
  agent.isAnchored = false;
  agent.returningFromThrowOff = false;
  agent.throwOffRecoveryTimer = 0;
  agent.activityState = ACTIVITY_STATES.SETTLING;
  agent.currentSlotId = null;
  agent.settlingTargetX = target.x;
  agent.settlingTargetY = target.y;
  agent.settlingSlotId = hasExplicitSlotTarget(target)
    ? target.slotId
    : agent.homeSlotId;
  agent.settlingSpeedCmS = settlingSpeedCmS;
  agent.nextSurfaceState = nextState;
};

const prepareSurfaceTarget = (env, target) => {
  if (!env?.curtain) {
    return target;
  }

  const projected = projectPointInsideCurtain(env, target.x, target.y);
  return {
    ...target,
    x: projected.x,
    y: projected.y,
  };
};

const keepAgentInsideCurtain = (
  agent,
  env,
  ratio = 0.96,
  dt = 1 / 60,
  maxSpeedCmS = PARAMS.SURFACE_CRAWL_SPEED_CM_S,
) => {
  if (!env?.curtain || pointInsideCurtain(env, agent.x, agent.y, ratio)) {
    return;
  }

  const projected = projectPointInsideCurtain(env, agent.x, agent.y, ratio);
  moveAgentToward(agent, projected.x, projected.y, dt, maxSpeedCmS, 0.02);
  agent.ax = 0;
  agent.ay = 0;
};

const updateTakeoff = (agent, dt) => {
  agent.takeoffTimer -= dt;
  agent.vx = 0;
  agent.vy = 0;
  agent.ax = 0;
  agent.ay = 0;
  if (agent.takeoffTimer > 0) {
    return;
  }

  agent.isAnchored = false;
  agent.activityState = agent.takeoffNextState || ACTIVITY_STATES.FORAGING;
  agent.takeoffNextState = ACTIVITY_STATES.IDLE;
};

const findNearbyVacantSlot = (
  agent,
  slots,
  occupiedSlotIds,
  maxDistanceCm,
  scoreFn = null,
) => {
  if (!slots?.length) {
    return null;
  }

  const maxDistance = cmToPx(maxDistanceCm);
  const candidates = slots
    .filter((slot) => {
      if (slot.id === agent.currentSlotId) {
        return false;
      }
      if (occupiedSlotIds.has(slot.id)) {
        return false;
      }
      return Math.hypot(slot.x - agent.x, slot.y - agent.y) <= maxDistance;
    })
    .map((slot) => ({
      slot,
      score:
        Math.hypot(slot.x - agent.x, slot.y - agent.y) +
        (scoreFn ? scoreFn(slot) : 0),
    }))
    .sort((left, right) => left.score - right.score);

  return candidates[0]?.slot || null;
};

const scoreWorkerClusterSlot = (slot, env, slotAgentMap = new Map()) => {
  if (!slot || !env.layout?.workerSlots?.length) {
    return -Infinity;
  }

  const clusterRadius = cmToPx(PARAMS.WORKER_SLOT_SWAP_CLUSTER_RADIUS_CM);
  let nearbyWorkerCount = 0;
  env.layout.workerSlots.forEach((candidate) => {
    if (!slotAgentMap.get(candidate.id)) {
      return;
    }
    if (
      Math.hypot(candidate.x - slot.x, candidate.y - slot.y) <= clusterRadius
    ) {
      nearbyWorkerCount += 1;
    }
  });

  return (
    nearbyWorkerCount * 2.4 -
    Math.abs(slot.x - env.curtain.x) * 0.05 -
    Math.max(0, slot.y - env.curtain.y) * 0.02
  );
};

const trySwapWorkerTowardCluster = (
  agent,
  env,
  occupiedSlotIds,
  slotAgentMap,
) => {
  if (
    agent.role !== ROLES.WORKER ||
    !agent.isAnchored ||
    agent.activityState !== ACTIVITY_STATES.IDLE ||
    !agent.currentSlotId ||
    !env.layout?.workerSlots?.length
  ) {
    return false;
  }

  const currentSlot = env.layout.workerSlots.find(
    (slot) => slot.id === agent.currentSlotId,
  );
  if (!currentSlot) {
    return false;
  }

  const swapRadius = cmToPx(PARAMS.WORKER_SLOT_SWAP_RADIUS_CM);
  const currentScore = scoreWorkerClusterSlot(currentSlot, env, slotAgentMap);
  let bestCandidate = null;
  let bestScore = currentScore + PARAMS.WORKER_SLOT_SWAP_MIN_SCORE_GAIN;

  env.layout.workerSlots.forEach((slot) => {
    if (slot.id === currentSlot.id) {
      return;
    }
    if (
      Math.hypot(slot.x - currentSlot.x, slot.y - currentSlot.y) > swapRadius
    ) {
      return;
    }

    const otherAgent = slotAgentMap.get(slot.id);
    if (
      !otherAgent ||
      otherAgent.id === agent.id ||
      otherAgent.role !== ROLES.WORKER ||
      !otherAgent.isAnchored ||
      otherAgent.activityState !== ACTIVITY_STATES.IDLE ||
      otherAgent.startupSurfaceHoldTimer > 0 ||
      otherAgent.workerResumeForagePending ||
      otherAgent.workerPostForageRestTimer > 0
    ) {
      return;
    }

    const candidateScore = scoreWorkerClusterSlot(slot, env, slotAgentMap);
    if (candidateScore <= bestScore) {
      return;
    }

    bestScore = candidateScore;
    bestCandidate = { slot, otherAgent };
  });

  if (!bestCandidate) {
    return false;
  }

  const source = {
    slotId: currentSlot.id,
    x: currentSlot.x,
    y: currentSlot.y,
  };
  const target = {
    slotId: bestCandidate.slot.id,
    x: bestCandidate.slot.x,
    y: bestCandidate.slot.y,
  };
  const otherAgent = bestCandidate.otherAgent;

  agent.homeSlotId = target.slotId;
  agent.desiredHomeSlotId = target.slotId;
  agent.desiredAnchorX = target.x;
  agent.desiredAnchorY = target.y;

  otherAgent.homeSlotId = source.slotId;
  otherAgent.desiredHomeSlotId = source.slotId;
  otherAgent.desiredAnchorX = source.x;
  otherAgent.desiredAnchorY = source.y;

  beginSurfaceMove(agent, target, ACTIVITY_STATES.IDLE);
  beginSurfaceMove(otherAgent, source, ACTIVITY_STATES.IDLE);

  // Reserve the swapped registrations immediately so nearby workers do not claim them.
  agent.currentSlotId = target.slotId;
  otherAgent.currentSlotId = source.slotId;
  occupiedSlotIds.add(source.slotId);
  occupiedSlotIds.add(target.slotId);
  slotAgentMap.set(source.slotId, otherAgent);
  slotAgentMap.set(target.slotId, agent);
  return true;
};

const chooseSurfaceTarget = (agent, env, occupiedSlotIds, toward = null) => {
  if (!env.layout?.allSlots?.length) {
    return {
      slotId: agent.currentSlotId || agent.homeSlotId,
      x: agent.anchorX,
      y: agent.anchorY,
    };
  }

  const targetX = toward?.x ?? agent.anchorX;
  const targetY = toward?.y ?? agent.anchorY;
  const candidates = env.layout.allSlots
    .filter((slot) => {
      if (slot.id === agent.currentSlotId || slot.id === agent.homeSlotId) {
        return true;
      }
      if (occupiedSlotIds.has(slot.id)) {
        return false;
      }
      return (
        Math.hypot(slot.x - agent.anchorX, slot.y - agent.anchorY) <=
        cmToPx(PARAMS.SURFACE_WANDER_RADIUS_CM)
      );
    })
    .sort((left, right) => {
      const leftScore = Math.hypot(left.x - targetX, left.y - targetY);
      const rightScore = Math.hypot(right.x - targetX, right.y - targetY);
      return leftScore - rightScore;
    });

  const nextSlot = candidates[0];
  if (!nextSlot) {
    return {
      slotId: agent.currentSlotId,
      x: agent.anchorX,
      y: agent.anchorY,
    };
  }

  return {
    slotId: nextSlot.id,
    x: nextSlot.x,
    y: nextSlot.y,
  };
};

const updateSurfaceWandering = (
  agent,
  neighbors,
  env,
  target,
  dt,
  occupiedSlotIds,
) => {
  clearFlowerCollectionState(agent);
  agent.isAnchored = false;
  keepAgentInsideCurtain(agent, env, 0.97, dt, PARAMS.SURFACE_CRAWL_SPEED_CM_S);
  agent.surfaceWanderTimer -= dt;
  const safeTarget = prepareSurfaceTarget(env, target);

  if (
    agent.role === ROLES.WORKER &&
    getThreatType(env.controls || DEFAULT_CONTROL_STATE) !== THREAT_TYPES.NONE
  ) {
    const localDefenderSlot = findNearbyVacantSlot(
      agent,
      env.layout?.defenderSlots,
      occupiedSlotIds,
      PARAMS.LOCAL_SLOT_SENSE_RADIUS_CM,
      (slot) => Math.max(0, slot.y - env.entrance.y) * 0.8,
    );

    if (
      localDefenderSlot &&
      Math.random() < PARAMS.LOCAL_SLOT_CAPTURE_PER_S * dt
    ) {
      occupiedSlotIds.delete(agent.currentSlotId);
      occupiedSlotIds.add(localDefenderSlot.id);
      beginSettling(
        agent,
        {
          slotId: localDefenderSlot.id,
          x: localDefenderSlot.x,
          y: localDefenderSlot.y,
        },
        ACTIVITY_STATES.IDLE,
      );
      return;
    }
  }

  const remainingDistance = moveAlongSurface(agent, safeTarget, dt);

  const arrived = remainingDistance < cmToPx(PARAMS.SURFACE_ARRIVE_RADIUS_CM);
  if (!arrived && agent.surfaceWanderTimer <= 0) {
    agent.surfaceWanderTimer = randomBetween(0.18, 0.42);
    return;
  }

  if (arrived) {
    beginSettling(
      agent,
      safeTarget,
      agent.nextSurfaceState || ACTIVITY_STATES.IDLE,
    );
  }
};

const updateSettling = (agent, env, dt) => {
  clearFlowerCollectionState(agent);
  keepAgentInsideCurtain(
    agent,
    env,
    0.97,
    dt,
    agent.settlingSpeedCmS || PARAMS.SETTLING_SPEED_CM_S,
  );
  const remainingDistance = moveAlongSurface(
    agent,
    {
      x: agent.settlingTargetX,
      y: agent.settlingTargetY,
    },
    dt,
    agent.settlingSpeedCmS || PARAMS.SETTLING_SPEED_CM_S,
  );

  if (remainingDistance >= cmToPx(PARAMS.SETTLING_ARRIVE_RADIUS_CM)) {
    return;
  }

  agent.anchorX = agent.settlingTargetX;
  agent.anchorY = agent.settlingTargetY;
  if (agent.settlingSlotId !== null && agent.settlingSlotId !== undefined) {
    agent.homeSlotId = agent.settlingSlotId;
  }
  agent.desiredAnchorX = agent.anchorX;
  agent.desiredAnchorY = agent.anchorY;
  agent.desiredHomeSlotId = agent.homeSlotId;
  agent.currentSlotId =
    agent.settlingSlotId !== null && agent.settlingSlotId !== undefined
      ? agent.settlingSlotId
      : null;
  const nextState = agent.nextSurfaceState || ACTIVITY_STATES.IDLE;
  snapToAnchor(agent);
  agent.activityState = nextState;
  if (agent.role === ROLES.SCOUT && agent.scoutLaunchPending) {
    agent.scoutLaunchPending = false;
    beginTakeoff(agent, ACTIVITY_STATES.FORAGING, {
      x: agent.targetX,
      y: agent.targetY,
    });
    agent.foragePauseTimer = 0;
    agent.foragePauseStarted = false;
    return;
  }
  if (nextState === ACTIVITY_STATES.SIGNALING) {
    startSurfaceSignaling(agent);
    return;
  }
  if (nextState === ACTIVITY_STATES.DANCING) {
    startDance(agent);
  }
};

const updateAnchoredIdle = (
  agent,
  neighbors,
  env,
  dt,
  occupiedSlotIds,
  slotAgentMap = new Map(),
) => {
  clearFlowerCollectionState(agent);
  const temperatureC =
    env.controls?.TEMPERATURE_C ?? DEFAULT_CONTROL_STATE.TEMPERATURE_C;
  const threatActive =
    getThreatType(env.controls || DEFAULT_CONTROL_STATE) !== THREAT_TYPES.NONE;
  agent.microTurnPhase += dt * randomBetween(0.6, 1.1);
  const outwardRotation = Math.atan2(
    agent.anchorY - env.curtain.y,
    agent.anchorX - env.curtain.x,
  );
  const anchoredRotationTarget =
    agent.activityState === ACTIVITY_STATES.FANNING
      ? outwardRotation
      : PARAMS.ANCHORED_ROTATION_RAD +
        Math.sin(agent.microTurnPhase + agent.stageOffset * 0.01) *
          PARAMS.ANCHORED_MICRO_TURN_RAD;
  const anchorRemainingDistance = Math.hypot(
    agent.x - agent.anchorX,
    agent.y - agent.anchorY,
  );
  if (
    (agent.anchorEaseTimer || 0) > 0 ||
    anchorRemainingDistance > cmToPx(0.02)
  ) {
    agent.anchorEaseTimer = Math.max(0, agent.anchorEaseTimer - dt);
    moveAgentToward(
      agent,
      agent.anchorX,
      agent.anchorY,
      dt,
      agent.settlingSpeedCmS || PARAMS.SETTLING_SPEED_CM_S,
      0.02,
    );
    agent.displayRotation = advanceAngle(
      agent.displayRotation || anchoredRotationTarget,
      anchoredRotationTarget,
      PARAMS.MAX_TURN_RATE_RAD_S * dt * 1.2,
    );
  } else {
    agent.x = agent.anchorX;
    agent.y = agent.anchorY;
    agent.vx = 0;
    agent.vy = 0;
    agent.displayRotation = anchoredRotationTarget;
  }

  if (agent.groomingTimer > 0) {
    agent.groomingTimer -= dt;
  } else if (Math.random() < PARAMS.GROOMING_TRIGGER_PER_S * dt) {
    agent.groomingTimer = randomBetween(
      PARAMS.GROOMING_MIN_S,
      PARAMS.GROOMING_MAX_S,
    );
  }

  const dancer = neighbors.find(
    ({ other, distance }) =>
      other.activityState === ACTIVITY_STATES.DANCING && distance <= cmToPx(5),
  );

  if (
    agent.role === ROLES.SCOUT &&
    agent.activityState === ACTIVITY_STATES.SIGNALING
  ) {
    agent.surfaceSignalTimer = Math.max(0, agent.surfaceSignalTimer - dt);
    agent.activityLevel = Math.max(agent.activityLevel, 0.82);
    if (agent.surfaceSignalTimer <= 0) {
      startDance(agent);
      return;
    }
    if (Math.random() < PARAMS.SURFACE_SIGNALING_MOVE_TRIGGER_PER_S * dt) {
      const signalTarget = chooseSurfaceTarget(
        agent,
        env,
        occupiedSlotIds,
        env.entrance,
      );
      if (signalTarget.slotId && signalTarget.slotId !== agent.currentSlotId) {
        occupiedSlotIds.delete(agent.currentSlotId);
        occupiedSlotIds.add(signalTarget.slotId);
        beginSurfaceMove(agent, signalTarget, ACTIVITY_STATES.SIGNALING);
        return;
      }
    }
    return;
  }

  if (agent.role === ROLES.WORKER) {
    const distanceToEntrance = Math.hypot(
      agent.anchorX - env.entrance.x,
      agent.anchorY - env.entrance.y,
    );
    const fanningCandidate =
      distanceToEntrance <= cmToPx(PARAMS.FANNING_ENTRANCE_RADIUS_CM) &&
      !agent.pollenLoaded &&
      !dancer;

    if (agent.activityState === ACTIVITY_STATES.FANNING) {
      agent.activityLevel = Math.max(agent.activityLevel, 0.68);
      if (
        threatActive ||
        temperatureC <= PARAMS.FANNING_TEMPERATURE_OFF_C ||
        !fanningCandidate ||
        Math.random() < PARAMS.FANNING_RELEASE_PER_S * dt * 0.12
      ) {
        agent.activityState = ACTIVITY_STATES.IDLE;
      } else {
        return;
      }
    }

    if (
      agent.activityState === ACTIVITY_STATES.IDLE &&
      !threatActive &&
      temperatureC >= PARAMS.FANNING_TEMPERATURE_ON_C &&
      fanningCandidate &&
      Math.random() <
        PARAMS.FANNING_TRIGGER_PER_S *
          (0.35 + getFanningHeatFactor(temperatureC) * 0.65) *
          dt
    ) {
      agent.activityState = ACTIVITY_STATES.FANNING;
      agent.activityLevel = Math.max(agent.activityLevel, 0.68);
      return;
    }
  }

  if (agent.role === ROLES.WORKER && agent.startupSurfaceHoldTimer > 0) {
    agent.startupSurfaceHoldTimer = Math.max(
      0,
      agent.startupSurfaceHoldTimer - dt,
    );
    return;
  }

  if (agent.role === ROLES.WORKER && agent.workerResumeForagePending) {
    if (agent.workerPostForageRestTimer > 0) {
      agent.workerPostForageRestTimer = Math.max(
        0,
        agent.workerPostForageRestTimer - dt,
      );
      return;
    }

    let didScheduleForage = false;
    if (agent.forageMemoryX != null && agent.forageMemoryY != null) {
      agent.targetX = agent.forageMemoryX;
      agent.targetY = agent.forageMemoryY;
      clearFlowerTarget(agent);
      didScheduleForage = true;
    } else {
      const nextFlowerTarget = chooseFlowerTarget(agent, env);
      if (nextFlowerTarget) {
        setFlowerTarget(agent, nextFlowerTarget, env.timeS);
        didScheduleForage = true;
      }
    }

    if (didScheduleForage) {
      agent.workerResumeForagePending = false;
      agent.recruitedByDance = false;
      agent.foragePauseTimer = 0;
      agent.foragePauseStarted = false;
      beginTakeoff(agent, ACTIVITY_STATES.FORAGING, {
        x: agent.targetX,
        y: agent.targetY,
      });
      return;
    }

    agent.workerResumeForagePending = false;
  }

  if (
    agent.role === ROLES.WORKER &&
    env.sharedForage?.active &&
    (env.sharedForage.recruitsRemaining || 0) > 0 &&
    Math.random() < PARAMS.WORKER_FORAGE_COMMIT_PER_S * dt
  ) {
    env.sharedForage.recruitsRemaining = Math.max(
      0,
      (env.sharedForage.recruitsRemaining || 0) - 1,
    );
    agent.recruitedByDance = true;
    agent.targetX = env.sharedForage.x;
    agent.targetY = env.sharedForage.y;
    agent.forageMemoryX = env.sharedForage.x;
    agent.forageMemoryY = env.sharedForage.y;
    agent.foragePauseTimer = 0;
    agent.foragePauseStarted = false;
    clearFlowerTarget(agent);
    beginTakeoff(agent, ACTIVITY_STATES.FORAGING, {
      x: agent.targetX,
      y: agent.targetY,
    });
    return;
  }

  if (
    agent.role === ROLES.WORKER &&
    !dancer &&
    Math.random() < PARAMS.WORKER_SLOT_SWAP_TRIGGER_PER_S * dt &&
    trySwapWorkerTowardCluster(agent, env, occupiedSlotIds, slotAgentMap)
  ) {
    return;
  }

  if (
    agent.role === ROLES.WORKER &&
    agent.anchorY > env.curtain.y + env.curtain.radius * 0.12 &&
    !dancer &&
    Math.random() < PARAMS.WORKER_REBALANCE_TRIGGER_PER_S * dt
  ) {
    const rebalanceSlot = findNearbyVacantSlot(
      agent,
      env.layout?.allSlots,
      occupiedSlotIds,
      PARAMS.WORKER_REBALANCE_RADIUS_CM,
      (slot) =>
        Math.max(0, slot.y - env.curtain.y) * 1.35 +
        Math.abs(slot.x - env.curtain.x) * 0.25,
    );

    if (rebalanceSlot) {
      occupiedSlotIds.delete(agent.currentSlotId);
      occupiedSlotIds.add(rebalanceSlot.id);
      beginSurfaceMove(
        agent,
        {
          slotId: rebalanceSlot.id,
          x: rebalanceSlot.x,
          y: rebalanceSlot.y,
        },
        ACTIVITY_STATES.IDLE,
      );
      return;
    }
  }

  if (
    agent.role === ROLES.WORKER &&
    agent.desiredHomeSlotId &&
    agent.desiredHomeSlotId !== agent.homeSlotId &&
    Math.hypot(agent.x - agent.desiredAnchorX, agent.y - agent.desiredAnchorY) >
      cmToPx(0.35) &&
    !occupiedSlotIds.has(agent.desiredHomeSlotId) &&
    Math.random() < PARAMS.LAYOUT_DRIFT_TRIGGER_PER_S * dt
  ) {
    occupiedSlotIds.delete(agent.currentSlotId);
    occupiedSlotIds.add(agent.desiredHomeSlotId);
    beginSurfaceMove(
      agent,
      {
        slotId: agent.desiredHomeSlotId,
        x: agent.desiredAnchorX,
        y: agent.desiredAnchorY,
      },
      ACTIVITY_STATES.IDLE,
    );
    return;
  }

  if (
    agent.role === ROLES.WORKER &&
    getThreatType(env.controls || DEFAULT_CONTROL_STATE) !== THREAT_TYPES.NONE
  ) {
    const localDefenderSlot = findNearbyVacantSlot(
      agent,
      env.layout?.defenderSlots,
      occupiedSlotIds,
      PARAMS.LOCAL_SLOT_SENSE_RADIUS_CM,
      (slot) => Math.max(0, slot.y - env.entrance.y) * 0.8,
    );

    if (
      localDefenderSlot &&
      Math.random() < PARAMS.LOCAL_SLOT_CAPTURE_PER_S * dt
    ) {
      occupiedSlotIds.delete(agent.currentSlotId);
      occupiedSlotIds.add(localDefenderSlot.id);
      beginSurfaceMove(
        agent,
        {
          slotId: localDefenderSlot.id,
          x: localDefenderSlot.x,
          y: localDefenderSlot.y,
        },
        ACTIVITY_STATES.IDLE,
      );
      return;
    }
  }

  if (
    agent.role === ROLES.WORKER &&
    Math.random() < PARAMS.SURFACE_WANDER_TRIGGER_PER_S * dt
  ) {
    const surfaceTarget = chooseSurfaceTarget(
      agent,
      env,
      occupiedSlotIds,
      agent.activityLevel >= 0.62 ? env.entrance : null,
    );
    beginSurfaceMove(agent, surfaceTarget, ACTIVITY_STATES.IDLE);
  }
};

const updateScoutState = (agent, neighbors, env, controls, dt) => {
  if (agent.role !== ROLES.SCOUT) {
    return;
  }

  if (getThreatType(controls) !== THREAT_TYPES.NONE) {
    if (agent.activityState !== ACTIVITY_STATES.DANCING) {
      agent.phaseTimer = randomBetween(
        PARAMS.SCOUT_FORAGE_MIN_S,
        PARAMS.SCOUT_FORAGE_MAX_S,
      );
      agent.foragePauseTimer = 0;
      agent.foragePauseStarted = false;
      clearFlowerTarget(agent);
      if (agent.isAnchored) {
        agent.activityState = ACTIVITY_STATES.IDLE;
      } else {
        agent.activityState = ACTIVITY_STATES.RETURNING;
        agent.targetX = agent.anchorX;
        agent.targetY = agent.anchorY;
      }
    }
    return;
  }

  if (agent.isAnchored && agent.activityState === ACTIVITY_STATES.IDLE) {
    if (agent.scoutRestTimer > 0) {
      agent.scoutRestTimer = Math.max(0, agent.scoutRestTimer - dt);
      return;
    }
    agent.phaseTimer -= dt;
    if (agent.phaseTimer <= 0) {
      const scoutTarget = chooseScoutTarget(agent, env);
      agent.targetX = scoutTarget.x;
      agent.targetY = scoutTarget.y;
      if (scoutTarget.flower) {
        agent.targetFlowerId = scoutTarget.flower.id;
      } else {
        clearFlowerTarget(agent);
      }
      if (!scoutTarget.flower) {
        agent.hasForageMemory = false;
        agent.forageMemoryX = null;
        agent.forageMemoryY = null;
      }
      if (
        agent.homeSlotId !== agent.launchSlotId ||
        Math.hypot(agent.x - agent.launchX, agent.y - agent.launchY) >
          cmToPx(0.2)
      ) {
        agent.scoutLaunchPending = true;
        beginSurfaceMove(
          agent,
          {
            slotId: agent.launchSlotId,
            x: agent.launchX,
            y: agent.launchY,
          },
          ACTIVITY_STATES.IDLE,
        );
      } else {
        beginTakeoff(agent, ACTIVITY_STATES.FORAGING, {
          x: agent.targetX,
          y: agent.targetY,
        });
        agent.foragePauseTimer = 0;
        agent.foragePauseStarted = false;
      }
    }
    return;
  }

  if (agent.activityState === ACTIVITY_STATES.DANCING) {
    return;
  }

  if (agent.activityState === ACTIVITY_STATES.SIGNALING) {
    return;
  }

  agent.isAnchored = false;
  if (agent.activityState === ACTIVITY_STATES.FORAGING) {
    const hadTrackedFlower = agent.collectingFlowerId != null;
    const trackedFlower = getTrackedFlower(agent, env);
    const targetFlower = getTargetFlower(agent, env);
    if (
      targetFlower &&
      !hasFlowerCapacity(targetFlower, env, agent, env.timeS) &&
      agent.collectingFlowerId !== targetFlower.id
    ) {
      clearFlowerTarget(agent);
      const alternateFlower = chooseFlowerTarget(agent, env);
      if (alternateFlower) {
        setFlowerTarget(agent, alternateFlower, env.timeS);
      } else {
        const explorationTarget = chooseExplorationTarget(agent, env);
        agent.targetX = explorationTarget.x;
        agent.targetY = explorationTarget.y;
      }
    }
    const scentedFlower = findScentTrackedFlower(agent, env);
    if (scentedFlower) {
      const blossom = getFlowerBlossomPosition(scentedFlower, env.timeS);
      agent.targetX = lerp(
        agent.targetX,
        blossom.x,
        clamp(PARAMS.SCOUT_FLOWER_TARGET_BLEND_PER_S * dt, 0, 1),
      );
      agent.targetY = lerp(
        agent.targetY,
        blossom.y,
        clamp(PARAMS.SCOUT_FLOWER_TARGET_BLEND_PER_S * dt, 0, 1),
      );
    }
    const reachedFlower =
      trackedFlower || findReachedFlower(agent, env, env.timeS);
    if (reachedFlower) {
      const blossom = getFlowerBlossomPosition(reachedFlower, env.timeS);
      agent.targetFlowerId = reachedFlower.id;
      agent.targetX = blossom.x;
      agent.targetY = blossom.y;
      agent.forageMemoryX = reachedFlower.x;
      agent.forageMemoryY = reachedFlower.y;
      agent.hasForageMemory = true;
      agent.pollenLoaded = true;
    }
    if (!reachedFlower && hadTrackedFlower && trackedFlower == null) {
      const replacementTarget = chooseFlowerTarget(agent, env);
      if (replacementTarget) {
        setFlowerTarget(agent, replacementTarget, env.timeS);
      }
    }
    if (!reachedFlower) {
      applyFreeFlight(
        agent,
        { x: agent.targetX, y: agent.targetY },
        neighbors,
        dt,
        PARAMS.SCOUT_FLOWER_APPROACH_SPEED_SCALE,
      );
    }
    const distanceToForage = Math.hypot(
      agent.x - agent.targetX,
      agent.y - agent.targetY,
    );
    if (
      !reachedFlower &&
      distanceToForage <= cmToPx(PARAMS.FLOWER_APPROACH_RADIUS_CM)
    ) {
      clearFlowerCollectionState(agent);
      clearFlowerTarget(agent);
      const explorationTarget = chooseExplorationTarget(agent, env);
      agent.targetX = explorationTarget.x;
      agent.targetY = explorationTarget.y;
      applyFreeFlight(
        agent,
        { x: agent.targetX, y: agent.targetY },
        neighbors,
        dt,
        PARAMS.FLOWER_RETRY_ESCAPE_SPEED_SCALE,
      );
      return;
    }
    if (reachedFlower) {
      let landingDistance = Infinity;
      if (reachedFlower) {
        landingDistance = settleAgentOnFlower(
          agent,
          reachedFlower,
          dt,
          env.timeS,
        );
      }
      agent.vx *= PARAMS.FLOWER_COLLECTION_DAMPING;
      agent.vy *= PARAMS.FLOWER_COLLECTION_DAMPING;
      if (
        reachedFlower &&
        landingDistance <= cmToPx(PARAMS.FLOWER_COLLECTION_SETTLE_RADIUS_CM)
      ) {
        if (!agent.foragePauseStarted) {
          agent.foragePauseTimer = randomBetween(
            PARAMS.FORAGE_PAUSE_MIN_S,
            PARAMS.FORAGE_PAUSE_MAX_S,
          );
          agent.foragePauseStarted = true;
        } else {
          agent.foragePauseTimer -= dt;
        }
      }
    }
    if (
      distanceToForage <= cmToPx(PARAMS.FLOWER_APPROACH_RADIUS_CM) &&
      agent.foragePauseStarted &&
      agent.foragePauseTimer <= 0
    ) {
      clearFlowerCollectionState(agent);
      agent.phaseTimer = randomBetween(
        PARAMS.SCOUT_FORAGE_MIN_S,
        PARAMS.SCOUT_FORAGE_MAX_S,
      );
      agent.foragePauseTimer = 0;
      agent.foragePauseStarted = false;
      clearFlowerTarget(agent);
      agent.activityState = ACTIVITY_STATES.RETURNING;
      agent.targetX = env.entrance.x;
      agent.targetY = env.entrance.y;
    }
  } else {
    agent.phaseTimer -= dt;
  }

  if (
    agent.phaseTimer <= 0 &&
    agent.activityState === ACTIVITY_STATES.FORAGING
  ) {
    agent.activityState = ACTIVITY_STATES.RETURNING;
    agent.targetX = env.entrance.x;
    agent.targetY = env.entrance.y;
  }

  if (agent.activityState === ACTIVITY_STATES.RETURNING) {
    const distanceToNest = Math.hypot(
      agent.x - env.entrance.x,
      agent.y - env.entrance.y,
    );
    if (distanceToNest < cmToPx(4)) {
      if (
        agent.hasForageMemory &&
        agent.forageMemoryX != null &&
        agent.forageMemoryY != null
      ) {
        refreshSharedForageMemory(
          env.sharedForage,
          agent.forageMemoryX,
          agent.forageMemoryY,
        );
      }
      agent.scoutRestTimer = randomBetween(
        PARAMS.SCOUT_REST_MIN_S,
        PARAMS.SCOUT_REST_MAX_S,
      );
      const nextState = agent.hasForageMemory
        ? ACTIVITY_STATES.SIGNALING
        : ACTIVITY_STATES.IDLE;
      beginSettling(
        agent,
        {
          slotId: agent.homeSlotId,
          x: agent.anchorX,
          y: agent.anchorY,
        },
        nextState,
        agent.pollenLoaded
          ? PARAMS.HIVE_SETTLING_LOADED_SPEED_CM_S
          : PARAMS.HIVE_SETTLING_SPEED_CM_S,
      );
      if (nextState === ACTIVITY_STATES.SIGNALING) {
        agent.waggleRunSeconds = getWaggleRunSeconds(
          controls.TARGET_DISTANCE_M,
        );
        agent.shakeTimer = 0;
        agent.shakeCooldown = randomBetween(0.08, 0.24);
      }
    }
  }
};

const updateDance = (agent, env, controls, dt) => {
  if (agent.activityState !== ACTIVITY_STATES.DANCING) {
    return false;
  }

  agent.isAnchored = false;

  const waggleRunSeconds =
    agent.waggleRunSeconds || getWaggleRunSeconds(controls.TARGET_DISTANCE_M);
  const cycleSeconds = waggleRunSeconds + PARAMS.DANCE_RETURN_S * 2;
  agent.danceTimer += dt;

  if (agent.danceTimer >= cycleSeconds) {
    agent.danceTimer -= cycleSeconds;
    agent.danceRoundsLeft -= 1;
    if (agent.danceRoundsLeft <= 0) {
      agent.phaseTimer = randomBetween(
        PARAMS.SCOUT_FORAGE_MIN_S,
        PARAMS.SCOUT_FORAGE_MAX_S,
      );
      agent.hasForageMemory = false;
      agent.scoutRestTimer = Math.max(
        agent.scoutRestTimer,
        randomBetween(PARAMS.SCOUT_REST_MIN_S, PARAMS.SCOUT_REST_MAX_S),
      );
      snapToAnchor(agent);
      agent.activityState = ACTIVITY_STATES.IDLE;
      return false;
    }
  }

  const angle = getWaggleAngle(controls.SUN_AZIMUTH_DEG);
  const forward = { x: Math.cos(angle), y: Math.sin(angle) };
  const side = { x: -forward.y, y: forward.x };
  const loopRadius = cmToPx(PARAMS.DANCE_LOOP_RADIUS_CM);
  const waggleLength = loopRadius * 2.4;
  const t = agent.danceTimer;
  let offsetX = 0;
  let offsetY = 0;
  let tangent = forward;

  if (t < waggleRunSeconds) {
    const progress = t / waggleRunSeconds;
    offsetX =
      forward.x * lerp(-waggleLength * 0.5, waggleLength * 0.5, progress);
    offsetY =
      forward.y * lerp(-waggleLength * 0.5, waggleLength * 0.5, progress);
    tangent = forward;
  } else {
    const returnT = (t - waggleRunSeconds) / PARAMS.DANCE_RETURN_S;
    const sideSign = t < waggleRunSeconds + PARAMS.DANCE_RETURN_S ? 1 : -1;
    const arc = returnT * Math.PI;
    offsetX =
      forward.x * Math.cos(arc) * waggleLength * 0.5 +
      side.x * Math.sin(arc) * loopRadius * sideSign;
    offsetY =
      forward.y * Math.cos(arc) * waggleLength * 0.5 +
      side.y * Math.sin(arc) * loopRadius * sideSign;
    tangent = normalize(
      -forward.x * Math.sin(arc) + side.x * Math.cos(arc) * sideSign,
      -forward.y * Math.sin(arc) + side.y * Math.cos(arc) * sideSign,
      forward,
    );
  }

  const danceTarget = {
    x: agent.danceOriginX + offsetX,
    y: agent.danceOriginY + offsetY,
  };
  const remainingDistance = moveAlongSurface(
    agent,
    danceTarget,
    dt,
    PARAMS.DANCER_SPEED_CM_S,
  );
  if (remainingDistance < cmToPx(0.2)) {
    agent.vx = tangent.x * speedCmToPx(PARAMS.DANCER_SPEED_CM_S);
    agent.vy = tangent.y * speedCmToPx(PARAMS.DANCER_SPEED_CM_S);
    agent.displayRotation = advanceAngle(
      agent.displayRotation || PARAMS.ANCHORED_ROTATION_RAD,
      Math.atan2(tangent.y, tangent.x),
      PARAMS.MAX_TURN_RATE_RAD_S * dt,
    );
  }
  return true;
};

const updateShakingSignal = (
  agent,
  neighbors,
  controls,
  dt,
  colonyActivity,
) => {
  if (
    agent.role === ROLES.SCOUT &&
    agent.activityState !== ACTIVITY_STATES.SIGNALING
  ) {
    agent.shakeTimer = 0;
    return;
  }

  if (agent.role === ROLES.SCOUT) {
    if (agent.shakeTimer > 0) {
      agent.shakeTimer -= dt;
      neighbors.forEach(({ other, distance }) => {
        if (
          distance <= cmToPx(PARAMS.SHAKING_RADIUS_CM) &&
          other.isAnchored &&
          other.activityState === ACTIVITY_STATES.IDLE
        ) {
          other.activityLevel = clamp(
            other.activityLevel + PARAMS.SHAKING_ACTIVITY_BOOST * dt,
            0,
            1,
          );
        }
      });
      return;
    }

    agent.shakeCooldown -= dt;
    if (agent.shakeCooldown <= 0) {
      agent.shakeTimer = randomBetween(
        PARAMS.SHAKING_DURATION_MIN_S,
        PARAMS.SHAKING_DURATION_MAX_S,
      );
      agent.shakeCooldown = randomBetween(0.18, 0.45);
    }
    return;
  }

  if (agent.activityState !== ACTIVITY_STATES.DANCING) {
    agent.shakeTimer = Math.max(0, agent.shakeTimer - dt);
    return;
  }

  if (agent.shakeTimer > 0) {
    agent.shakeTimer -= dt;
    neighbors.forEach(({ other, distance }) => {
      if (distance <= cmToPx(PARAMS.SHAKING_RADIUS_CM)) {
        other.activityLevel = clamp(
          other.activityLevel + PARAMS.SHAKING_ACTIVITY_BOOST * dt,
          0,
          1,
        );
      }
    });
    return;
  }

  if (getThreatType(controls) !== THREAT_TYPES.NONE || colonyActivity > 0.4) {
    return;
  }

  agent.shakeCooldown -= dt;
  if (agent.shakeCooldown <= 0) {
    agent.shakeTimer = randomBetween(
      PARAMS.SHAKING_DURATION_MIN_S,
      PARAMS.SHAKING_DURATION_MAX_S,
    );
    agent.shakeCooldown = randomBetween(
      PARAMS.SHAKING_INTERVAL_MIN_S,
      PARAMS.SHAKING_INTERVAL_MAX_S,
    );
  }
};

const updateDefenseTask = (agent, env, controls, neighbors) => {
  if (getThreatType(controls) === THREAT_TYPES.NONE) {
    if (
      agent.activityState === ACTIVITY_STATES.DEFENDING ||
      agent.activityState === ACTIVITY_STATES.HEAT_BALLING
    ) {
      agent.activityState = ACTIVITY_STATES.RETURNING;
      agent.isAnchored = false;
      agent.targetX = agent.anchorX;
      agent.targetY = agent.anchorY;
    }
    return;
  }

  if (!agent.isAnchored) {
    return;
  }

  const seesPredator = canSeePredator(agent, env.predator);
  const distanceToPredator = Math.hypot(
    agent.x - env.predator.x,
    agent.y - env.predator.y,
  );
  const localWaveRadius = cmToPx(
    PARAMS.SHIMMER_LOCAL_TRIGGER_RADIUS_CM + PARAMS.SHIMMER_RADIUS_CM,
  );
  const isLocalWaveBand = seesPredator && distanceToPredator <= localWaveRadius;
  const hasRelay = neighbors.some(({ other, distance }) => {
    const otherDistanceToPredator = Math.hypot(
      other.x - env.predator.x,
      other.y - env.predator.y,
    );
    return (
      distance <= cmToPx(PARAMS.SHIMMER_RADIUS_CM) &&
      other.recentShimmerTimer > 0 &&
      otherDistanceToPredator <= localWaveRadius
    );
  });
  const isLocalShimmerZone =
    seesPredator &&
    distanceToPredator <= cmToPx(PARAMS.SHIMMER_LOCAL_TRIGGER_RADIUS_CM);
  const localThreatPressure =
    (isLocalShimmerZone ? 0.9 : 0) +
    (hasRelay ? 0.35 : 0) +
    clamp(
      1 - distanceToPredator / cmToPx(PARAMS.PREDATOR_VISUAL_RANGE_CM),
      0,
      1,
    ) *
      0.45;
  if (!isLocalShimmerZone && !hasRelay) {
    return;
  }

  if (!isLocalWaveBand && !hasRelay) {
    return;
  }

  if (
    agent.activityState !== ACTIVITY_STATES.DEFENDING &&
    Math.random() >
      clamp(localThreatPressure, 0.18, 1) *
        PARAMS.LOCAL_DEFENSE_COMMIT_PER_S *
        0.016
  ) {
    return;
  }

  agent.activityState = ACTIVITY_STATES.DEFENDING;
  agent.activityLevel = Math.max(agent.activityLevel, 0.72);

  triggerShimmer(agent, 1);

  neighbors.forEach(({ other, distance }) => {
    const otherDistanceToPredator = Math.hypot(
      other.x - env.predator.x,
      other.y - env.predator.y,
    );
    if (
      distance <= cmToPx(PARAMS.SHIMMER_RADIUS_CM) &&
      other.isAnchored &&
      other.shimmerState === SHIMMER_STATES.IDLE &&
      agent.recentShimmerTimer > 0 &&
      otherDistanceToPredator <= localWaveRadius &&
      Math.random() > PARAMS.SHIMMER_RELAY_IGNORE_PROBABILITY
    ) {
      triggerShimmer(other, 1);
    }
  });

  const distanceToEntrance = Math.hypot(
    env.predator.x - env.entrance.x,
    env.predator.y - env.entrance.y,
  );
  if (
    canAgentLaunchToHeatBall(agent, env) &&
    distanceToEntrance <= cmToPx(PARAMS.HEAT_BALL_TRIGGER_RADIUS_CM) &&
    distanceToPredator <= cmToPx(PARAMS.HEAT_BALL_SENSE_RADIUS_CM)
  ) {
    launchToHeatBall(agent);
  }
};

const updateReturningHome = (agent, neighbors, env, dt) => {
  const isAirReturn = agent.returningFromThrowOff;
  const threatActive =
    getThreatType(env.controls || DEFAULT_CONTROL_STATE) !== THREAT_TYPES.NONE;
  if (
    (isAirReturn && shouldReengageHornet(agent, env)) ||
    (threatActive &&
      canAgentLaunchToHeatBall(agent, env) &&
      shouldReengageHornet(agent, env))
  ) {
    launchToHeatBall(agent, {
      attachDelayS: isAirReturn ? PARAMS.THROWN_OFF_REENGAGE_ATTACH_DELAY_S : 0,
      predatorX: env.predator.x,
      predatorY: env.predator.y,
    });
    return;
  }

  const returnTarget = { x: agent.anchorX, y: agent.anchorY };
  agent.targetX = returnTarget.x;
  agent.targetY = returnTarget.y;

  if (isAirReturn) {
    agent.throwOffRecoveryTimer = Math.max(0, agent.throwOffRecoveryTimer - dt);
  }
  agent.thrownOffNoLandTimer = Math.max(
    0,
    (agent.thrownOffNoLandTimer || 0) - dt,
  );
  const recoveryBlend = isAirReturn
    ? 1 - agent.throwOffRecoveryTimer / PARAMS.THROWN_OFF_RECOVERY_S
    : 1;
  const easedRecoveryBlend = clamp(
    recoveryBlend * recoveryBlend * (3 - 2 * recoveryBlend),
    0,
    1,
  );
  const landingRadiusCm = isAirReturn
    ? PARAMS.THROWN_OFF_RETURN_ARRIVAL_RADIUS_CM
    : threatActive
      ? 0
      : agent.pollenLoaded
        ? PARAMS.POLLEN_LOADED_RETURN_ARRIVAL_RADIUS_CM
        : PARAMS.RETURN_ARRIVAL_RADIUS_CM;
  const landingSpeedScale = threatActive
    ? 1
    : agent.pollenLoaded
      ? PARAMS.RETURN_MIN_SPEED_SCALE * 0.7
      : PARAMS.RETURN_MIN_SPEED_SCALE;
  const baseSpeedScale = threatActive
    ? 1
    : isAirReturn
      ? lerp(
          PARAMS.THROWN_OFF_RETURN_SPEED_SCALE,
          PARAMS.THROWN_OFF_RETURN_SPEED_SCALE * 1.1,
          easedRecoveryBlend,
        )
      : 0.78 * (agent.pollenLoaded ? PARAMS.POLLEN_LOADED_SPEED_SCALE : 1);
  applyFreeFlight(agent, returnTarget, neighbors, dt, baseSpeedScale, {
    protean: threatActive,
    timeS: env.timeS,
    repulsionWeightScale: isAirReturn
      ? lerp(0.04, 0.1, easedRecoveryBlend)
      : 0.08,
    repelAnchored: false,
    repelAirborne: false,
    steerScale: isAirReturn
      ? lerp(
          PARAMS.THROWN_OFF_RETURN_STEER_SCALE,
          PARAMS.THROWN_OFF_RETURN_STEER_SCALE * 1.7,
          easedRecoveryBlend,
        )
      : 1,
    wanderScale: isAirReturn
      ? lerp(
          PARAMS.THROWN_OFF_RETURN_WANDER_SCALE,
          PARAMS.THROWN_OFF_RETURN_WANDER_SCALE * 0.55,
          easedRecoveryBlend,
        )
      : 1,
    liftY: isAirReturn
      ? speedCmToPx(PARAMS.THROWN_OFF_RETURN_SINK_CM_S2) *
        (1 - easedRecoveryBlend * 0.35)
      : 0,
    arrivalRadiusCm: landingRadiusCm,
    minArrivalSpeedScale: isAirReturn
      ? PARAMS.THROWN_OFF_RETURN_MIN_SPEED_SCALE
      : landingSpeedScale,
    cruiseRatio: threatActive ? 1 : PARAMS.FLIGHT_CRUISE_RATIO,
    curtainEnv: env,
    curtainPullWeight: isAirReturn
      ? lerp(2.3, 1.7, easedRecoveryBlend)
      : PARAMS.CURTAIN_PULL_WEIGHT,
  });
  if (isAirReturn) {
    if (
      Math.hypot(agent.x - returnTarget.x, agent.y - returnTarget.y) >=
      cmToPx(4.2)
    ) {
      return;
    }
    agent.returningFromThrowOff = false;
    agent.throwOffRecoveryTimer = 0;
    agent.throwOffRecoveryDuration = 0;
  }
  const wasPollenLoaded = agent.pollenLoaded;
  const distanceToAnchor = Math.hypot(
    agent.x - returnTarget.x,
    agent.y - returnTarget.y,
  );
  const curtainSurfaceGap = getCurtainSurfaceGap(env, agent.x, agent.y, 0.98);
  const currentSpeedCmS = Math.hypot(agent.vx, agent.vy) / PARAMS.PIXELS_PER_CM;
  const enteredCurtainSurface =
    (isAirReturn || !threatActive) &&
    (pointInsideCurtain(env, agent.x, agent.y, 0.98) ||
      curtainSurfaceGap <= cmToPx(2.8));
  if (
    enteredCurtainSurface &&
    agent.thrownOffNoLandTimer <= 0 &&
    currentSpeedCmS <= PARAMS.THROWN_OFF_LAND_MAX_SPEED_CM_S
  ) {
    agent.pollenLoaded = false;
    landOnCurtainAndWalkHome(agent, env, dt);
    return;
  }
  if (distanceToAnchor < cmToPx(PARAMS.HIVE_SETTLING_START_RADIUS_CM)) {
    agent.pollenLoaded = false;
    if (agent.role === ROLES.WORKER && wasPollenLoaded) {
      agent.workerPostForageRestTimer = randomBetween(
        PARAMS.WORKER_POST_FORAGE_REST_MIN_S,
        PARAMS.WORKER_POST_FORAGE_REST_MAX_S,
      );
      agent.workerResumeForagePending = true;
    }
    beginSettling(
      agent,
      {
        slotId: agent.homeSlotId,
        x: returnTarget.x,
        y: returnTarget.y,
      },
      ACTIVITY_STATES.IDLE,
      threatActive
        ? PARAMS.MAX_SPEED_CM_S
        : wasPollenLoaded
          ? PARAMS.HIVE_SETTLING_LOADED_SPEED_CM_S
          : PARAMS.HIVE_SETTLING_SPEED_CM_S,
    );
  }
};

const beginCulling = (agent) => {
  agent.isAnchored = false;
  agent.isAnchoredOnHornet = false;
  agent.heatBalling = false;
  agent.returningFromThrowOff = false;
  agent.throwOffRecoveryTimer = 0;
  agent.currentSlotId = null;
  agent.pollenLoaded = false;
  agent.shouldRemove = false;
  agent.activityState = ACTIVITY_STATES.CULLING;
  agent.vx = randomBetween(
    -speedCmToPx(PARAMS.CULLING_DRIFT_CM_S),
    speedCmToPx(PARAMS.CULLING_DRIFT_CM_S),
  );
  agent.vy = speedCmToPx(randomBetween(8, 20));
  agent.ax = 0;
  agent.ay = 0;
};

const updateCulling = (agent, env, dt) => {
  agent.vy += speedCmToPx(PARAMS.CULLING_FALL_GRAVITY_CM_S2) * dt;
  agent.vx *= 0.992;
  agent.x += agent.vx * dt;
  agent.y += agent.vy * dt;
  agent.displayRotation = advanceAngle(
    agent.displayRotation || PARAMS.ANCHORED_ROTATION_RAD,
    Math.PI / 2,
    PARAMS.MAX_TURN_RATE_RAD_S * dt * 0.7,
  );
  return agent.y > env.height + cmToPx(6);
};

const updateHeatBalling = (agent, neighbors, env, controls, dt) => {
  if (getThreatType(controls) === THREAT_TYPES.NONE) {
    agent.activityState = ACTIVITY_STATES.RETURNING;
    agent.isAnchoredOnHornet = false;
    agent.heatBalling = false;
    agent.targetX = agent.anchorX;
    agent.targetY = agent.anchorY;
    return;
  }

  agent.heatBalling = true;
  agent.heatBallTimer += dt;
  agent.reengageAttachDelayTimer = Math.max(
    0,
    (agent.reengageAttachDelayTimer || 0) - dt,
  );

  if (shouldShakeOffAttachedBee(agent, env, dt)) {
    throwOffHornetBee(agent, env);
    return;
  }

  if (agent.isAnchoredOnHornet) {
    agent.hornetAnchorAngle += randomBetween(-0.05, 0.05);
    attachToHornet(agent, env);
    return;
  }

  const isReengaging = agent.reengageAttachDelayTimer > 0;
  const ringRadius =
    env.predator.radius +
    cmToPx(
      PARAMS.HEAT_BALL_RING_GAP_CM +
        (isReengaging ? PARAMS.THROWN_OFF_REENGAGE_RING_BUFFER_CM : 0),
    );
  const pursuitLookahead = clamp(env.predator.speedPx / 18, 0, cmToPx(4.2));
  if (isReengaging) {
    agent.hornetAnchorAngle +=
      (agent.reengageOrbitDirection || 1) *
      PARAMS.THROWN_OFF_REENGAGE_ORBIT_RATE_RAD_S *
      dt;
  }
  const attackTarget = {
    x:
      env.predator.x +
      env.predator.vx * pursuitLookahead * 0.08 +
      Math.cos(agent.hornetAnchorAngle) * ringRadius,
    y:
      env.predator.y +
      env.predator.vy * pursuitLookahead * 0.08 +
      Math.sin(agent.hornetAnchorAngle) * ringRadius,
  };

  applyFreeFlight(
    agent,
    attackTarget,
    neighbors,
    dt,
    isReengaging ? PARAMS.THROWN_OFF_REENGAGE_SPEED_SCALE : 1,
    {
      protean: true,
      timeS: env.timeS,
      steerScale: isReengaging ? 0.42 : 1,
      wanderScale: isReengaging ? 1.35 : 1,
    },
  );

  const dx = agent.x - env.predator.x;
  const dy = agent.y - env.predator.y;
  const distance = Math.hypot(dx, dy);
  const radial = normalize(dx, dy, { x: 1, y: 0 });
  const ringError = distance - ringRadius;
  const pullWeight = isReengaging
    ? PARAMS.THROWN_OFF_REENGAGE_PULL_WEIGHT
    : 0.24;
  agent.vx += radial.x * (-ringError * pullWeight);
  agent.vy += radial.y * (-ringError * pullWeight);

  if (
    distance <=
      env.predator.radius + cmToPx(PARAMS.HEAT_BALL_ATTACH_RADIUS_CM) &&
    agent.reengageAttachDelayTimer <= 0
  ) {
    attachToHornet(agent, env);
  }
};

const updateThrownOff = (agent, neighbors, env, controls, dt) => {
  agent.isAnchored = false;
  agent.isAnchoredOnHornet = false;
  agent.heatBalling = false;
  agent.returningFromThrowOff = false;
  agent.thrownOffTimer = Math.max(0, agent.thrownOffTimer - dt);
  agent.thrownOffNoLandTimer = Math.max(
    0,
    (agent.thrownOffNoLandTimer || 0) - dt,
  );
  const damping = Math.pow(0.95, dt * 60);
  agent.vx *= damping;
  agent.vy =
    agent.vy * damping + speedCmToPx(PARAMS.THROWN_OFF_GRAVITY_CM_S2) * dt;

  if (agent.thrownOffTimer <= PARAMS.THROWN_OFF_RECOVERY_S) {
    const recoveryBlend =
      1 - agent.thrownOffTimer / Math.max(PARAMS.THROWN_OFF_RECOVERY_S, 1e-4);
    const easedRecoveryBlend = clamp(
      recoveryBlend * recoveryBlend * (3 - 2 * recoveryBlend),
      0,
      1,
    );
    applyFreeFlight(
      agent,
      { x: agent.anchorX, y: agent.anchorY },
      neighbors,
      dt,
      lerp(1.18, 1.08, easedRecoveryBlend),
      {
        protean: false,
        repulsionWeightScale: 0.06,
        repelAnchored: false,
        steerScale: lerp(0.08, 0.88, easedRecoveryBlend),
        wanderScale: lerp(0.04, 0.4, easedRecoveryBlend),
        liftY:
          -speedCmToPx(PARAMS.THROWN_OFF_RECOVERY_LIFT_CM_S2) *
          easedRecoveryBlend,
        curtainEnv: env,
        curtainPullWeight: 1.95,
      },
    );
  } else {
    agent.x += agent.vx * dt;
    agent.y += agent.vy * dt;
  }
  agent.displayRotation = advanceAngle(
    agent.displayRotation || PARAMS.ANCHORED_ROTATION_RAD,
    Math.atan2(agent.vy || 1, agent.vx || 0.001),
    PARAMS.MAX_TURN_RATE_RAD_S * dt,
  );

  const curtainSurfaceGap = getCurtainSurfaceGap(env, agent.x, agent.y, 0.98);
  const currentSpeedCmS = Math.hypot(agent.vx, agent.vy) / PARAMS.PIXELS_PER_CM;
  if (
    curtainSurfaceGap <= cmToPx(3.2) &&
    agent.thrownOffNoLandTimer <= 0 &&
    currentSpeedCmS <= PARAMS.THROWN_OFF_LAND_MAX_SPEED_CM_S
  ) {
    landOnCurtainAndWalkHome(agent, env, dt);
    return;
  }

  if (agent.thrownOffTimer > 0) {
    return;
  }

  if (shouldReengageHornet(agent, env)) {
    launchToHeatBall(agent, {
      attachDelayS: PARAMS.THROWN_OFF_REENGAGE_ATTACH_DELAY_S,
      predatorX: env.predator.x,
      predatorY: env.predator.y,
    });
    return;
  }

  agent.activityState = ACTIVITY_STATES.RETURNING;
  agent.returningFromThrowOff = true;
  agent.throwOffRecoveryDuration = Math.max(
    PARAMS.THROWN_OFF_RETURN_FATIGUE_S,
    agent.throwOffRecoveryDuration || 0,
  );
  agent.throwOffRecoveryTimer = agent.throwOffRecoveryDuration;
  agent.targetX = agent.anchorX;
  agent.targetY = agent.anchorY;
};

const updateAgents = (agents, env, controls, dt) => {
  const liveAgents = agents.filter(
    (agent) => agent.activityState !== ACTIVITY_STATES.CULLING,
  );
  const attachedHornetAgents = liveAgents.filter(
    (agent) => agent.isAnchoredOnHornet,
  );
  env.predator.attachedHornetCount = attachedHornetAgents.length;
  const shakeOffSelectedAgentIds = maybeSelectForcedShakeOffAgent(
    attachedHornetAgents,
    env,
  );
  if (shakeOffSelectedAgentIds?.size) {
    attachedHornetAgents.forEach((agent) => {
      if (shakeOffSelectedAgentIds.has(agent.id)) {
        throwOffHornetBee(agent, env);
      }
    });
  }
  const spatial = buildSpatialGrid(liveAgents);
  updateSharedForageMemory(env.sharedForage, dt);
  const colonyActivity =
    liveAgents.reduce((sum, agent) => sum + agent.activityLevel, 0) /
    Math.max(1, liveAgents.length);
  const occupiedSlotIds = new Set(
    liveAgents
      .map((agent) => getAgentReservedSlotId(agent))
      .filter((slotId) => slotId != null),
  );
  const occupiedSlotAgentsById = new Map(
    liveAgents
      .map((agent) => [getAgentReservedSlotId(agent), agent])
      .filter(([slotId]) => slotId != null),
  );

  agents.forEach((agent) => {
    if (agent.activityState === ACTIVITY_STATES.CULLING) {
      return;
    }
    agent.ax = 0;
    agent.ay = 0;
    agent.activityLevel = clamp(agent.activityLevel - dt * 0.025, 0.12, 1);
    updateShimmerState(agent, dt);
  });

  agents.forEach((agent) => {
    if (agent.activityState === ACTIVITY_STATES.CULLING) {
      agent.shouldRemove = updateCulling(agent, env, dt);
      return;
    }
    const neighbors = collectNeighbors(agent, spatial);
    if (agent.activityState === ACTIVITY_STATES.THROWN_OFF) {
      updateThrownOff(agent, neighbors, env, controls, dt);
      return;
    }

    if (agent.isAnchoredOnHornet) {
      updateHeatBalling(agent, neighbors, env, controls, dt);
      return;
    }

    if (agent.activityState === ACTIVITY_STATES.TAKEOFF) {
      updateTakeoff(agent, dt);
      return;
    }

    if (agent.activityState === ACTIVITY_STATES.SETTLING) {
      updateSettling(agent, env, dt);
      return;
    }

    if (agent.role === ROLES.SCOUT) {
      updateScoutState(agent, neighbors, env, controls, dt);
      updateShakingSignal(agent, neighbors, controls, dt, colonyActivity);
      const dancing = updateDance(agent, env, controls, dt);
      if (agent.isAnchored) {
        updateAnchoredIdle(
          agent,
          neighbors,
          env,
          dt,
          occupiedSlotIds,
          occupiedSlotAgentsById,
        );
        return;
      }
      if (agent.activityState === ACTIVITY_STATES.WANDERING) {
        updateSurfaceWandering(
          agent,
          neighbors,
          env,
          {
            slotId: agent.surfaceTargetSlotId,
            x: agent.surfaceTargetX,
            y: agent.surfaceTargetY,
          },
          dt,
          occupiedSlotIds,
        );
      } else if (agent.activityState === ACTIVITY_STATES.FORAGING) {
        return;
      } else if (!dancing) {
        const isScoutReturning =
          agent.activityState === ACTIVITY_STATES.RETURNING;
        applyFreeFlight(
          agent,
          { x: agent.targetX, y: agent.targetY },
          neighbors,
          dt,
          isScoutReturning ? 0.8 : 0.55,
          {
            protean:
              !isScoutReturning &&
              getThreatType(controls) !== THREAT_TYPES.NONE,
            timeS: env.timeS,
            repulsionWeightScale: isScoutReturning ? 0.08 : 1,
            repelAnchored: !isScoutReturning,
            repelAirborne: !isScoutReturning,
          },
        );
      }
      return;
    }

    if (agent.activityState === ACTIVITY_STATES.WANDERING) {
      updateSurfaceWandering(
        agent,
        neighbors,
        env,
        {
          slotId: agent.surfaceTargetSlotId,
          x: agent.surfaceTargetX,
          y: agent.surfaceTargetY,
        },
        dt,
        occupiedSlotIds,
      );
      return;
    }

    if (agent.activityState === ACTIVITY_STATES.FORAGING) {
      const hadTrackedFlower = agent.collectingFlowerId != null;
      const trackedFlower = getTrackedFlower(agent, env);
      const targetFlower = getTargetFlower(agent, env);
      if (
        targetFlower &&
        !hasFlowerCapacity(targetFlower, env, agent, env.timeS) &&
        agent.collectingFlowerId !== targetFlower.id
      ) {
        clearFlowerTarget(agent);
        const alternateFlower = chooseFlowerTarget(agent, env);
        if (alternateFlower) {
          setFlowerTarget(agent, alternateFlower, env.timeS);
        } else {
          agent.activityState = ACTIVITY_STATES.RETURNING;
          agent.targetX = agent.anchorX;
          agent.targetY = agent.anchorY;
        }
      }
      const scentedFlower = findScentTrackedFlower(agent, env);
      if (scentedFlower) {
        const blossom = getFlowerBlossomPosition(scentedFlower, env.timeS);
        agent.targetX = lerp(
          agent.targetX,
          blossom.x,
          clamp(PARAMS.WORKER_FLOWER_TARGET_BLEND_PER_S * dt, 0, 1),
        );
        agent.targetY = lerp(
          agent.targetY,
          blossom.y,
          clamp(PARAMS.WORKER_FLOWER_TARGET_BLEND_PER_S * dt, 0, 1),
        );
      }
      const reachedFlower =
        trackedFlower || findReachedFlower(agent, env, env.timeS);
      if (!reachedFlower) {
        applyFreeFlight(
          agent,
          { x: agent.targetX, y: agent.targetY },
          neighbors,
          dt,
          PARAMS.WORKER_FLOWER_APPROACH_SPEED_SCALE,
        );
      }
      if (reachedFlower) {
        const blossom = getFlowerBlossomPosition(reachedFlower, env.timeS);
        agent.targetFlowerId = reachedFlower.id;
        agent.targetX = blossom.x;
        agent.targetY = blossom.y;
        agent.forageMemoryX = reachedFlower.x;
        agent.forageMemoryY = reachedFlower.y;
        agent.pollenLoaded = true;
      }
      if (!reachedFlower && hadTrackedFlower && trackedFlower == null) {
        const alternateFlower = chooseFlowerTarget(agent, env);
        if (alternateFlower) {
          setFlowerTarget(agent, alternateFlower, env.timeS);
        }
      }
      const distanceToForage = Math.hypot(
        agent.x - agent.targetX,
        agent.y - agent.targetY,
      );
      if (
        !reachedFlower &&
        distanceToForage <= cmToPx(PARAMS.FLOWER_APPROACH_RADIUS_CM)
      ) {
        clearFlowerCollectionState(agent);
        const alternateFlower = chooseFlowerTarget(agent, env);
        if (alternateFlower) {
          setFlowerTarget(agent, alternateFlower, env.timeS);
        } else {
          clearFlowerTarget(agent);
          agent.activityState = ACTIVITY_STATES.RETURNING;
          agent.targetX = agent.anchorX;
          agent.targetY = agent.anchorY;
        }
        applyFreeFlight(
          agent,
          { x: agent.targetX, y: agent.targetY },
          neighbors,
          dt,
          agent.activityState === ACTIVITY_STATES.RETURNING
            ? PARAMS.FLOWER_RETURN_ESCAPE_SPEED_SCALE
            : PARAMS.FLOWER_RETARGET_ESCAPE_SPEED_SCALE,
        );
        return;
      }
      if (reachedFlower) {
        let landingDistance = Infinity;
        if (reachedFlower) {
          landingDistance = settleAgentOnFlower(
            agent,
            reachedFlower,
            dt,
            env.timeS,
          );
        }
        agent.vx *= PARAMS.FLOWER_COLLECTION_DAMPING;
        agent.vy *= PARAMS.FLOWER_COLLECTION_DAMPING;
        if (
          reachedFlower &&
          landingDistance <= cmToPx(PARAMS.FLOWER_COLLECTION_SETTLE_RADIUS_CM)
        ) {
          if (!agent.foragePauseStarted) {
            agent.foragePauseTimer = randomBetween(
              PARAMS.FORAGE_PAUSE_MIN_S,
              PARAMS.FORAGE_PAUSE_MAX_S,
            );
            agent.foragePauseStarted = true;
          } else {
            agent.foragePauseTimer -= dt;
          }
        }
      }
      if (
        distanceToForage <= cmToPx(PARAMS.FLOWER_APPROACH_RADIUS_CM) &&
        agent.foragePauseStarted &&
        agent.foragePauseTimer <= 0
      ) {
        clearFlowerCollectionState(agent);
        agent.foragePauseTimer = 0;
        agent.foragePauseStarted = false;
        clearFlowerTarget(agent);
        agent.activityState = ACTIVITY_STATES.RETURNING;
        agent.targetX = agent.anchorX;
        agent.targetY = agent.anchorY;
      }
      return;
    }

    if (agent.activityState === ACTIVITY_STATES.RETURNING) {
      updateReturningHome(agent, neighbors, env, dt);
      return;
    }

    if (agent.activityState === ACTIVITY_STATES.HEAT_BALLING) {
      updateHeatBalling(agent, neighbors, env, controls, dt);
      return;
    }

    if (agent.isAnchored) {
      updateAnchoredIdle(
        agent,
        neighbors,
        env,
        dt,
        occupiedSlotIds,
        occupiedSlotAgentsById,
      );
      updateDefenseTask(agent, env, controls, neighbors);
      return;
    }

    agent.activityState = ACTIVITY_STATES.RETURNING;
  });

  for (let index = agents.length - 1; index >= 0; index -= 1) {
    if (agents[index].shouldRemove) {
      agents.splice(index, 1);
    }
  }
};

const renderEnvironment = (
  ctx,
  env,
  controls,
  timeS,
  attachedHornetCount = 0,
) => {
  void ctx;
  void env;
  void controls;
  void timeS;
  void attachedHornetCount;
};

const renderAgent = (ctx, image, frameSize, agent, index, size, now, dt) => {
  const speed = Math.hypot(agent.vx, agent.vy);
  const isFanning = agent.activityState === ACTIVITY_STATES.FANNING;
  const isCollectingOnFlower =
    agent.activityState === ACTIVITY_STATES.FORAGING &&
    agent.collectingFlowerId != null &&
    agent.collectingFlowerX != null &&
    agent.collectingFlowerY != null;
  const isFlowerApproachLocked =
    !isCollectingOnFlower &&
    agent.activityState === ACTIVITY_STATES.FORAGING &&
    agent.targetFlowerId != null &&
    Math.hypot(agent.x - agent.targetX, agent.y - agent.targetY) <=
      cmToPx(PARAMS.FLOWER_APPROACH_LOCK_RADIUS_CM);
  const topStage = ATLAS.stages.bee_top_fly;
  const topFrames = topStage.frames || [{ x: 1, y: 0 }];
  const isSurfaceMovingBee =
    agent.activityState === ACTIVITY_STATES.WANDERING ||
    agent.activityState === ACTIVITY_STATES.SETTLING;
  const isAirborneBee =
    !agent.isAnchored && !agent.isAnchoredOnHornet && !isSurfaceMovingBee;
  const isRestingSurfaceBee =
    (agent.isAnchored &&
      agent.activityState !== ACTIVITY_STATES.TAKEOFF &&
      agent.activityState !== ACTIVITY_STATES.DANCING &&
      agent.activityState !== ACTIVITY_STATES.FANNING &&
      agent.shimmerState !== SHIMMER_STATES.ACTIVE) ||
    isSurfaceMovingBee;
  const exhaustedWingbeatMultiplier = agent.returningFromThrowOff
    ? PARAMS.THROWN_OFF_RETURN_WINGBEAT_MULTIPLIER
    : 1;
  const flightFrameIndex =
    Math.floor(
      (now * 1000 * exhaustedWingbeatMultiplier + agent.stageOffset) /
        topStage.durationMs,
    ) % topFrames.length;
  const frame =
    isCollectingOnFlower || isFlowerApproachLocked
      ? topFrames[0]
      : isFanning
        ? topFrames[flightFrameIndex]
        : isRestingSurfaceBee
          ? topFrames[0]
          : topFrames[flightFrameIndex];
  const targetRotation = isCollectingOnFlower
    ? agent.collectingFacingAngle ||
      agent.displayRotation ||
      PARAMS.ANCHORED_ROTATION_RAD
    : agent.isAnchoredOnHornet
      ? agent.hornetAnchorAngle + Math.PI
      : isSurfaceMovingBee && speed > 0.04
        ? Math.atan2(agent.vy, agent.vx)
        : (agent.isAnchored || isSurfaceMovingBee) && !agent.isAnchoredOnHornet
          ? agent.activityState === ACTIVITY_STATES.FANNING
            ? agent.displayRotation || PARAMS.ANCHORED_ROTATION_RAD
            : PARAMS.ANCHORED_ROTATION_RAD
          : speed > 0.04
            ? Math.atan2(agent.vy, agent.vx)
            : isAirborneBee
              ? Math.atan2(agent.targetY - agent.y, agent.targetX - agent.x)
              : agent.displayRotation || PARAMS.ANCHORED_ROTATION_RAD;
  const rotationBlend = isAirborneBee ? 0.4 : PARAMS.SPRITE_ROTATION_BLEND;
  const maxTurnRate = isAirborneBee
    ? PARAMS.MAX_TURN_RATE_RAD_S * 2.1
    : PARAMS.MAX_TURN_RATE_RAD_S;
  const blendedRotation =
    (agent.displayRotation || 0) +
    shortestAngleDelta(agent.displayRotation || 0, targetRotation) *
      (isCollectingOnFlower ? 0.42 : rotationBlend);
  agent.displayRotation = advanceAngle(
    agent.displayRotation || 0,
    blendedRotation,
    maxTurnRate * dt * (isCollectingOnFlower ? 1.28 : 1),
  );

  const shimmerTimeActive =
    PARAMS.SHIMMER_ACTIVE_S - Math.max(0, agent.shimmerTimer || 0);
  const abdomenShakeRotation =
    agent.shimmerState === SHIMMER_STATES.ACTIVE && !isCollectingOnFlower
      ? Math.sin(
          shimmerTimeActive * PARAMS.ABDOMEN_SHAKE_RATE_HZ * Math.PI * 2,
        ) * PARAMS.ABDOMEN_SHAKE_ROTATION_RAD
      : 0;
  const shakingLateral =
    agent.shakeTimer > 0 && !isCollectingOnFlower
      ? Math.sin(now * PARAMS.SHAKING_FREQUENCY_HZ * Math.PI * 2) *
        3.8 *
        (agent.pollenLoaded ? PARAMS.POLLEN_LANDING_SWAY_MULTIPLIER : 1)
      : 0;
  const shakingRotation =
    !isCollectingOnFlower &&
    (agent.shakeTimer > 0 || agent.shimmerState === SHIMMER_STATES.ACTIVE)
      ? Math.sin(now * PARAMS.SHAKING_FREQUENCY_HZ * Math.PI * 2) *
        0.18 *
        (agent.pollenLoaded ? PARAMS.POLLEN_LANDING_SWAY_MULTIPLIER : 1)
      : 0;
  const landingShake =
    !isCollectingOnFlower &&
    agent.pollenLoaded &&
    agent.activityState === ACTIVITY_STATES.SETTLING
      ? Math.sin(now * PARAMS.SHAKING_FREQUENCY_HZ * Math.PI * 2) * 2.1
      : 0;
  const landingRotation =
    !isCollectingOnFlower &&
    agent.pollenLoaded &&
    agent.activityState === ACTIVITY_STATES.SETTLING
      ? Math.sin(now * PARAMS.SHAKING_FREQUENCY_HZ * Math.PI * 2) * 0.12
      : 0;
  const bobOffset = isCollectingOnFlower
    ? 0
    : agent.isAnchored && !agent.isAnchoredOnHornet
      ? Math.sin(now * 1.5 + index * 0.73) * 0.3
      : Math.sin(now * 5.4 + index * 0.6) *
        PARAMS.VISUAL_BOB_PX *
        (0.4 + agent.activityLevel);
  const scale =
    PARAMS.SPRITE_SCALE *
    (agent.shimmerState === SHIMMER_STATES.ACTIVE ? 1.08 : 1);
  const heatJitterX = agent.isAnchoredOnHornet
    ? (Math.random() - 0.5) * PARAMS.HORNET_HEAT_JITTER_PX
    : 0;
  const heatJitterY = agent.isAnchoredOnHornet
    ? (Math.random() - 0.5) * PARAMS.HORNET_HEAT_JITTER_PX
    : 0;
  const pivotY =
    agent.shimmerState === SHIMMER_STATES.ACTIVE
      ? -(frameSize.height * scale) * 0.25
      : 0;
  const groomingRotation =
    agent.groomingTimer > 0 && !isCollectingOnFlower
      ? Math.sin(now * 28 + agent.stageOffset) * 0.08
      : 0;
  const groomingLateral =
    agent.groomingTimer > 0 && !isCollectingOnFlower
      ? Math.sin(now * 18 + agent.stageOffset) * 1.2
      : 0;

  ctx.save();
  if (agent.heatBalling) {
    ctx.fillStyle = "rgba(231, 112, 33, 0.22)";
    ctx.beginPath();
    ctx.arc(agent.x, agent.y, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.translate(agent.x + heatJitterX, agent.y + heatJitterY + bobOffset);
  ctx.rotate(agent.displayRotation);
  ctx.translate(0, pivotY);
  ctx.rotate(
    abdomenShakeRotation + shakingRotation + groomingRotation + landingRotation,
  );
  ctx.translate(0, -pivotY);
  ctx.translate(
    (agent.shimmerState === SHIMMER_STATES.ACTIVE ? shakingLateral : 0) +
      groomingLateral +
      landingShake,
    0,
  );
  ctx.scale(scale, scale);
  ctx.drawImage(
    image,
    frame.x * frameSize.width,
    frame.y * frameSize.height,
    frameSize.width,
    frameSize.height,
    -frameSize.width * 0.5,
    -frameSize.height * 0.5,
    frameSize.width,
    frameSize.height,
  );
  ctx.restore();
};

export function App({ controls, onGpuErrorChange, isPaused = false }) {
  const canvasRef = React.useRef(null);
  const imageRef = React.useRef(null);
  const rasterCanvasRef = React.useRef(null);
  const animationFrameRef = React.useRef(0);
  const agentsRef = React.useRef([]);
  const layoutRef = React.useRef(null);
  const layoutKeyRef = React.useRef("");
  const pointerRef = React.useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    speedPx: 0,
    accelPx: 0,
    turnSharpness: 0,
    reversalScore: 0,
    shakeEventId: 0,
    processedShakeEventId: 0,
    timeS: 0,
    hasPointer: false,
  });
  const flowersRef = React.useRef([]);
  const sharedForageRef = React.useRef({
    active: false,
    x: 0,
    y: 0,
    timer: 0,
    recruitsRemaining: 0,
  });
  const flowerDragRef = React.useRef({
    active: false,
    lastX: 0,
    lastY: 0,
  });
  const frameSizeRef = React.useRef(
    resolveAtlasFrameSize(ATLAS, { width: 64, height: 64 }),
  );
  const lastTimeRef = React.useRef(0);

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

    const ensureAgents = (width, height, nextControls) => {
      const nextCount = Math.round(nextControls.COUNT);
      const activeAgents = agentsRef.current.filter(
        (agent) => agent.activityState !== ACTIVITY_STATES.CULLING,
      );
      const layoutKey = [
        nextCount,
        nextControls.TEMPERATURE_C,
        Math.round(width),
        Math.round(height),
      ].join(":");
      if (
        layoutKeyRef.current === layoutKey &&
        activeAgents.length === nextCount
      ) {
        return;
      }

      layoutKeyRef.current = layoutKey;
      const nextLayout = buildAnchorLayout(
        width,
        height,
        nextCount,
        nextControls,
      );
      layoutRef.current = nextLayout;

      if (agentsRef.current.length === 0) {
        agentsRef.current = Array.from({ length: nextCount }, (_, index) =>
          createAgent(width, height, index, nextCount, nextLayout),
        );
        return;
      }

      const roleTargets = {
        [ROLES.SCOUT]: nextLayout.scoutLimit,
        [ROLES.DEFENDER]: nextLayout.defenderLimit,
        [ROLES.WORKER]: Math.max(
          0,
          nextCount - nextLayout.scoutLimit - nextLayout.defenderLimit,
        ),
      };
      const nextActiveAgents = [...activeAgents];
      const roleCounts = {
        [ROLES.SCOUT]: nextActiveAgents.filter(
          (agent) => agent.role === ROLES.SCOUT,
        ).length,
        [ROLES.DEFENDER]: nextActiveAgents.filter(
          (agent) => agent.role === ROLES.DEFENDER,
        ).length,
        [ROLES.WORKER]: nextActiveAgents.filter(
          (agent) => agent.role === ROLES.WORKER,
        ).length,
      };

      if (nextActiveAgents.length > nextCount) {
        [ROLES.WORKER, ROLES.DEFENDER, ROLES.SCOUT].forEach((role) => {
          for (
            let index = nextActiveAgents.length - 1;
            index >= 0 && nextActiveAgents.length > nextCount;
            index -= 1
          ) {
            const agent = nextActiveAgents[index];
            if (agent.role !== role || roleCounts[role] <= roleTargets[role]) {
              continue;
            }
            beginCulling(agent);
            nextActiveAgents.splice(index, 1);
            roleCounts[role] -= 1;
          }
        });
      }

      applyLayoutToExistingAgents(nextActiveAgents, nextLayout);

      while (nextActiveAgents.length < nextCount) {
        const role =
          roleCounts[ROLES.SCOUT] < roleTargets[ROLES.SCOUT]
            ? ROLES.SCOUT
            : roleCounts[ROLES.DEFENDER] < roleTargets[ROLES.DEFENDER]
              ? ROLES.DEFENDER
              : ROLES.WORKER;
        const agent = createAgent(
          width,
          height,
          nextActiveAgents.length,
          nextCount,
          nextLayout,
          {
            role,
            roleSlotIndex: roleCounts[role],
            spawnFromNest: true,
          },
        );
        roleCounts[role] += 1;
        nextActiveAgents.push(agent);
        agentsRef.current.push(agent);
      }
    };

    const render = (timestamp) => {
      const now = timestamp * 0.001;
      const dt = lastTimeRef.current
        ? Math.min(now - lastTimeRef.current, 0.05) * PARAMS.BEHAVIOR_TIME_SCALE
        : 0.016;
      lastTimeRef.current = now;

      const size = syncCanvasSize(canvas, ctx);
      const nextControls = App.sanitizeControlState(controls);
      ensureAgents(size.width, size.height, nextControls);

      const env = {
        ...getEnvironment(
          size.width,
          size.height,
          now,
          pointerRef.current,
          nextControls,
          flowersRef.current,
        ),
        agents: agentsRef.current,
        width: size.width,
        height: size.height,
        timeS: now,
        layout: layoutRef.current,
        sharedForage: sharedForageRef.current,
      };

      if (!isPaused) {
        updateAgents(agentsRef.current, env, nextControls, dt);
      }

      const attachedHornetCount = agentsRef.current.filter(
        (agent) => agent.isAnchoredOnHornet,
      ).length;
      const thrownOffCount = agentsRef.current.filter(
        (agent) => agent.activityState === ACTIVITY_STATES.THROWN_OFF,
      ).length;
      const heatBallingCount = agentsRef.current.filter(
        (agent) => agent.activityState === ACTIVITY_STATES.HEAT_BALLING,
      ).length;

      window.__beeDebug = {
        timeS: now,
        pointer: {
          ...pointerRef.current,
        },
        predator: {
          ...env.predator,
        },
        attachedHornetCount,
        thrownOffCount,
        heatBallingCount,
        suspiciousAgents: agentsRef.current
          .filter((agent) => agent.activityState === ACTIVITY_STATES.FORAGING)
          .map((agent) => {
            const targetFlower = env.flowers.find(
              (flower) => flower.id === agent.targetFlowerId,
            );
            const targetBlossom = targetFlower
              ? getFlowerBlossomPosition(targetFlower, now)
              : null;
            const speed = Math.hypot(agent.vx, agent.vy);
            const distanceToTarget = Math.hypot(
              agent.x - agent.targetX,
              agent.y - agent.targetY,
            );
            const distanceToTargetFlower = targetBlossom
              ? Math.hypot(agent.x - targetBlossom.x, agent.y - targetBlossom.y)
              : null;
            return {
              role: agent.role,
              targetFlowerId: agent.targetFlowerId,
              collectingFlowerId: agent.collectingFlowerId,
              x: agent.x,
              y: agent.y,
              targetX: agent.targetX,
              targetY: agent.targetY,
              speed,
              distanceToTarget,
              distanceToTargetFlower,
              foragePauseStarted: agent.foragePauseStarted,
              foragePauseTimer: agent.foragePauseTimer,
            };
          })
          .filter(
            (agent) =>
              agent.collectingFlowerId == null &&
              agent.targetFlowerId != null &&
              agent.distanceToTarget < cmToPx(6),
          )
          .sort((left, right) => left.speed - right.speed)
          .slice(0, 20)
          .map((agent) => ({
            ...agent,
          })),
      };

      clearTransparentCanvas2d(ctx, size.width, size.height);
      renderEnvironment(ctx, env, nextControls, now, attachedHornetCount);

      const image = rasterCanvasRef.current || imageRef.current;
      const frameSize = frameSizeRef.current;
      if (image) {
        const sortedFlowers = [...(env.flowers || [])].sort(
          (left, right) => left.y - right.y,
        );
        sortedFlowers.forEach((flower, index) => {
          renderFlower(ctx, flower, now, index);
        });

        const sortedAgents = [...agentsRef.current].sort(
          (left, right) => left.y - right.y,
        );
        sortedAgents.forEach((agent) => {
          const agentIndex = agentsRef.current.indexOf(agent);
          renderAgent(ctx, image, frameSize, agent, agentIndex, size, now, dt);
        });
      }

      animationFrameRef.current = window.requestAnimationFrame(render);
    };

    animationFrameRef.current = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
    };
  }, [controls, isPaused]);

  const handlePointerMove = React.useCallback(
    (event) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const nextX = event.clientX - rect.left;
      const nextY = event.clientY - rect.top;
      const previous = pointerRef.current;
      const timeS = performance.now() * 0.001;

      if (!previous.hasPointer) {
        pointerRef.current = {
          ...previous,
          x: nextX,
          y: nextY,
          vx: 0,
          vy: 0,
          speedPx: 0,
          accelPx: 0,
          turnSharpness: 0,
          reversalScore: 0,
          shakeEventId: previous.shakeEventId || 0,
          processedShakeEventId: previous.processedShakeEventId || 0,
          lastShakeTriggerTimeS: previous.lastShakeTriggerTimeS || -Infinity,
          timeS,
          hasPointer: true,
        };
        return;
      }

      const dt = Math.max(timeS - (previous.timeS || timeS), 0.001);
      const rawVx = nextX - previous.x;
      const rawVy = nextY - previous.y;
      const vx = rawVx / dt;
      const vy = rawVy / dt;
      const nextSpeed = Math.hypot(vx, vy);
      const prevSpeed = previous.speedPx || 0;
      const dot = vx * (previous.vx || 0) + vy * (previous.vy || 0);
      const magnitudeProduct = Math.max(
        1e-4,
        nextSpeed * Math.max(prevSpeed, 1e-4),
      );
      const turnCos = clamp(dot / magnitudeProduct, -1, 1);
      const instantTurnSharpness =
        prevSpeed > PARAMS.SHAKE_OFF_TURN_MIN_SPEED_PX * 0.6 &&
        nextSpeed > PARAMS.SHAKE_OFF_TURN_MIN_SPEED_PX
          ? (1 - turnCos) * 0.5
          : 0;
      const instantReversalScore =
        prevSpeed > PARAMS.SHAKE_OFF_TURN_MIN_SPEED_PX * 0.55 &&
        nextSpeed > PARAMS.SHAKE_OFF_TURN_MIN_SPEED_PX &&
        turnCos < -0.18
          ? clamp((-turnCos - 0.18) / 0.82, 0, 1)
          : 0;
      const turnSharpness = Math.max(
        instantTurnSharpness,
        (previous.turnSharpness || 0) * 0.7,
      );
      const reversalScore = Math.max(
        instantReversalScore,
        (previous.reversalScore || 0) * 0.78,
      );
      const shouldEmitShakeEvent =
        instantReversalScore >= PARAMS.SHAKE_OFF_REVERSAL_MIN_SCORE &&
        timeS - (previous.lastShakeTriggerTimeS || -Infinity) >=
          PARAMS.SHAKE_OFF_EVENT_COOLDOWN_S;
      const shakeEventId = shouldEmitShakeEvent
        ? (previous.shakeEventId || 0) + 1
        : previous.shakeEventId || 0;
      pointerRef.current = {
        x: nextX,
        y: nextY,
        vx,
        vy,
        speedPx: nextSpeed,
        accelPx: (nextSpeed - prevSpeed) / dt,
        turnSharpness,
        reversalScore,
        shakeEventId,
        processedShakeEventId: previous.processedShakeEventId || 0,
        lastShakeTriggerTimeS: shouldEmitShakeEvent
          ? timeS
          : previous.lastShakeTriggerTimeS || -Infinity,
        timeS,
        hasPointer: true,
      };

      const nextControls = App.sanitizeControlState(controls);
      if (
        flowerDragRef.current.active &&
        getThreatType(nextControls) === THREAT_TYPES.NONE &&
        Math.hypot(
          nextX - flowerDragRef.current.lastX,
          nextY - flowerDragRef.current.lastY,
        ) >= PARAMS.FLOWER_DRAG_STEP_PX
      ) {
        const nextPatch = createFlowerPatch(nextX, nextY);
        flowersRef.current = [...flowersRef.current, ...nextPatch].slice(
          -PARAMS.FLOWER_MAX_COUNT * PARAMS.FLOWER_PATCH_MAX_COUNT,
        );
        flowerDragRef.current.lastX = nextX;
        flowerDragRef.current.lastY = nextY;
      }
    },
    [controls],
  );

  const handlePointerLeave = React.useCallback(() => {
    const timeS = performance.now() * 0.001;
    pointerRef.current = {
      ...pointerRef.current,
      vx: 0,
      vy: 0,
      speedPx: 0,
      accelPx: 0,
      turnSharpness: 0,
      reversalScore: 0,
      processedShakeEventId: pointerRef.current.processedShakeEventId || 0,
      lastShakeTriggerTimeS:
        pointerRef.current.lastShakeTriggerTimeS || -Infinity,
      timeS,
      hasPointer: true,
    };
    flowerDragRef.current.active = false;
  }, []);

  const handlePointerDown = React.useCallback(
    (event) => {
      const nextControls = App.sanitizeControlState(controls);
      if (getThreatType(nextControls) !== THREAT_TYPES.NONE) {
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const nextPatch = createFlowerPatch(x, y);
      flowerDragRef.current = {
        active: true,
        lastX: x,
        lastY: y,
      };
      flowersRef.current = [...flowersRef.current, ...nextPatch].slice(
        -PARAMS.FLOWER_MAX_COUNT * PARAMS.FLOWER_PATCH_MAX_COUNT,
      );
    },
    [controls],
  );

  const handlePointerUp = React.useCallback(() => {
    flowerDragRef.current.active = false;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUp}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

App.ui = {
  controlFields: CONTROL_FIELDS,
  defaultControlState: DEFAULT_CONTROL_STATE,
};

App.sanitizeControlState = (rawControls = DEFAULT_CONTROL_STATE) => {
  const next = {
    ...DEFAULT_CONTROL_STATE,
    ...(rawControls ?? {}),
  };

  return {
    COUNT: clamp(Number(next.COUNT) || DEFAULT_CONTROL_STATE.COUNT, 60, 520),
    TEMPERATURE_C: clamp(
      Number(next.TEMPERATURE_C) || DEFAULT_CONTROL_STATE.TEMPERATURE_C,
      5,
      42,
    ),
    IS_THREAT_ACTIVE: Boolean(next.IS_THREAT_ACTIVE),
    SUN_AZIMUTH_DEG: clamp(
      Number(next.SUN_AZIMUTH_DEG) || DEFAULT_CONTROL_STATE.SUN_AZIMUTH_DEG,
      0,
      360,
    ),
    TARGET_DISTANCE_M: clamp(
      Number(next.TARGET_DISTANCE_M) || DEFAULT_CONTROL_STATE.TARGET_DISTANCE_M,
      100,
      3400,
    ),
  };
};

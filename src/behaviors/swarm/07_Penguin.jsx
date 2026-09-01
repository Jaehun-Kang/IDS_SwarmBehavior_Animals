import React from "react";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import {
  loadTexturedAtlasCanvas,
  resolveAtlasFrameSize,
} from "../../utils/spriteAtlas";
import { resolveCanvasAtlasSprite } from "../../utils/spritePose";
import {
  applyTransparentCanvasStyle,
  clearTransparentCanvas2d,
} from "../../utils/transparentCanvas";

// 기본 상태
const PARAMS = {
  DEFAULT_COUNT: 180,
  DEFAULT_APPARENT_TEMP_C: -48.2,
  DEFAULT_WIND_SPEED_MPS: 12,
  DEFAULT_GLOBAL_RADIATION: 180,
  DEFAULT_RELATIVE_HUMIDITY: 70,
  DEFAULT_DENSITY_PER_M2: 15,
  DEFAULT_REACTION_THRESHOLD_CM: 2,
  DEFAULT_HUDDLE_STEP_DISTANCE_CM: 7,
  BODY_HEIGHT_CM: 115,
  APPARENT_TEMP_HUDDLE_MIDPOINT_C: -48.2,
  APPARENT_TEMP_TRANSITION_WIDTH_C: 18.65,
  WIND_CHILL_FACTOR: -2.857,
  SOLAR_HEATING_FACTOR: 0.288,
  HUMIDITY_CHILL_FACTOR: -0.473,
  GAS_STATE_THRESHOLD: 0.26,
  HUDDLE_STATE_THRESHOLD: 0.62,
  SIMULATION_TIME_SCALE: 1,
  INITIAL_GROUP_COUNT_MIN: 3,
  INITIAL_GROUP_COUNT_MAX: 6,
  INITIAL_SPAWN_RADIUS_MIN: 1.45,
  INITIAL_SPAWN_RADIUS_MAX: 2.35,
  INITIAL_SPAWN_JITTER: 0.48,
  HUDDLE_RADIUS_RATIO: 0.24,
  HUDDLE_VERTICAL_SQUASH: 0.86,
  HUDDLE_CENTER_X: 0.36,
  HUDDLE_CENTER_Y: 0.52,
  TARGET_PULL: 9.2,
  VELOCITY_DAMPING: 0.88,
  SEPARATION_RATIO: 0.52,
  SEPARATION_FORCE: 220,
  ALIGNMENT_FORCE: 1.5,
  GAP_RESPONSE_FORCE: 228,
  BOUNDARY_INWARD_FORCE: 120,
  HUDDLE_INDIVIDUAL_SPEED_CMPS: 2,
  FREE_WALK_SPEED_CMPS: 30,
  RELOCATION_SPEED_CMPS: 25,
  COOLING_EXIT_SPEED_CMPS: 40,
  HUDDLE_WAVE_SPEED_CMPS: 12,
  FREE_WALK_STEP_DISTANCE_CM: 32,
  RELOCATION_STEP_DISTANCE_CM: 14,
  STEP_DURATION_SEC: 0.32,
  STEP_COOLDOWN_SEC: 0.42,
  FREE_STEP_DISTANCE_SCALE: 1.28,
  FREE_STEP_SPEED_SCALE: 1.8,
  WAVE_INTERVAL_MIN_SEC: 5,
  WAVE_INTERVAL_MAX_SEC: 12,
  REST_STEER_SCALE: 0.035,
  REST_VELOCITY_DAMPING: 0.97,
  HUDDLE_JAM_INTENT_THRESHOLD: 0.44,
  HUDDLE_JAM_DENSITY_THRESHOLD: 0.12,
  HUDDLE_JAM_TOUCH_THRESHOLD: 0.05,
  HUDDLE_RELEASE_CONTACT_DEFICIT: 0.42,
  HUDDLE_RELEASE_WARM_THRESHOLD: 0.08,
  HUDDLE_RELEASE_EDGE_THRESHOLD: 0.12,
  WAVE_REACTION_DELAY_MIN: 0.12,
  WAVE_REACTION_DELAY_MAX: 0.28,
  SHELTER_TRIGGER_RATIO: 0.84,
  SHELTER_RELEASE_RATIO: 0.52,
  SHELTER_WAIT_MIN_SEC: 10,
  SHELTER_WAIT_MAX_SEC: 24,
  SHELTER_ENTRY_HUDDLE_INTENT: 0.56,
  SHELTER_ENTRY_CONTACT_DEFICIT: 0.2,
  SHELTER_ENTRY_EDGE_EXPOSURE: 0.1,
  SHELTER_ENTRY_WINDWARD_EXPOSURE: 0.2,
  SHELTER_SIDE_PULL: 105,
  SHELTER_REJOIN_PULL: 132,
  SHELTER_LATERAL_RATIO: 0.92,
  BOUNDARY_WALK_RING_RATIO: 0.98,
  BOUNDARY_WALK_REJOIN_RATIO: 0.86,
  THERMAL_WARM_RATE: 0.18,
  THERMAL_COOL_RATE: 0.52,
  THERMAL_TOUCH_COUNT_WEIGHT: 0.58,
  THERMAL_TOUCH_TIGHTNESS_WEIGHT: 0.72,
  THERMAL_BASE_LOSS: 0.06,
  THERMAL_WIND_EDGE_MULTIPLIER: 1.65,
  THERMAL_COLD_DRIVE_WIDTH_C: 18.65,
  THERMAL_ASCENT_POWER: 1.85,
  THERMAL_WARM_TAU_SEC: 110,
  THERMAL_COOL_TAU_SEC: 90,
  THERMAL_BASELINE_LOSS_C: 0.5,
  THERMAL_EXPOSED_BASELINE_LOSS_C: 1.7,
  THERMAL_WIND_COOLING_C: 5.2,
  THERMAL_EDGE_COOLING_C: 2.4,
  THERMAL_CORE_CURVE_POWER: 1.7,
  THERMAL_HISTORY_BLEND: 0.18,
  THERMAL_HISTORY_FORCE: 0.2,
  THERMAL_HISTORY_LOSS_REDUCTION: 0.18,
  THERMAL_SOCIAL_GAIN_SCALE: 2.35,
  THERMAL_ENVIRONMENT_LOSS_SCALE: 0.94,
  THERMAL_HARD_EXIT_TEMP_C: 37.3,
  THERMAL_OVERHEAT_WARN_TEMP_C: 35,
  THERMAL_WARMTH_SEEK_ENTER_C: 1.1,
  THERMAL_COOLING_EXIT_ENTER_C: 1.6,
  THERMAL_BREAKUP_THRESHOLD: 0.68,
  THERMAL_BREAKUP_FORCE: 118,
  THERMAL_BREAKUP_LATERAL_FORCE: 76,
  PULSE_BREAKUP_FORCE: 164,
  PULSE_TRIGGER_MIN_RATIO: 0.45,
  THERMAL_CONVECTION_INWARD_FORCE: 94,
  THERMAL_CONVECTION_OUTWARD_FORCE: 52,
  CONTACT_SEEK_FORCE: 86,
  CONTACT_SEEK_STEP_SCALE: 0.62,
  CONTACT_SEEK_COOLDOWN_SEC: 0.42,
  SOCIAL_SEARCH_RADIUS_RATIO: 9.5,
  SOCIAL_SEARCH_CANVAS_RATIO: 0.24,
  SOCIAL_SEARCH_COLD_BONUS: 0.16,
  SOCIAL_SEEK_FORCE: 96,
  SOCIAL_SEEK_RING_SUPPRESS: 0.72,
  HUDDLE_SEEK_STEP_SCALE: 0.86,
  HUDDLE_SEEK_COOLDOWN_SEC: 0.28,
  COOLING_EXIT_STEP_SCALE: 1.24,
  COOLING_EXIT_STEP_COOLDOWN_SEC: 0.24,
  COOLING_EXIT_OUTWARD_FORCE_SCALE: 2.1,
  COOLING_EXIT_TANGENTIAL_FORCE_SCALE: 1.9,
  COOLING_EXIT_BOUNDARY_PULL_SCALE: 0,
  COOLING_EXIT_COHESION_SCALE: 0,
  COOLING_EXIT_LATTICE_SCALE: 0,
  EDGE_AVOIDANCE_START_RATIO: 0.84,
  EDGE_AVOIDANCE_FORCE: 108,
  EDGE_AVOIDANCE_FREE_WALK_SCALE: 0.72,
  SCREEN_REENTRY_MARGIN_RATIO: 0.9,
  SCREEN_REENTRY_FORCE: 168,
  SCREEN_REENTRY_TANGENTIAL_FORCE: 112,
  SCREEN_REENTRY_SWIRL_FORCE: 64,
  STEER_DIRECTION_TURN_RATE: 0.72,
  STEER_DIRECTION_FREE_WALK_TURN_RATE: 0.9,
  FREE_WALK_TARGET_PULL_SCALE: 0.08,
  FREE_WALK_WANDER_FORCE: 58,
  FREE_WALK_TANGENTIAL_WANDER_FORCE: 36,
  FREE_WALK_TRIGGER_STEP_INTERVAL_MIN_SEC: 0.6,
  FREE_WALK_TRIGGER_STEP_INTERVAL_MAX_SEC: 1.4,
  FREE_WALK_TRIGGER_STEP_SCALE: 1.45,
  FREE_WALK_TRIGGER_STEP_MIN_HEAT_C: 14,
  FREE_WALK_ACTIVE_DAMPING: 0.62,
  FREE_WALK_MIN_CRUISE_STEP_RATIO: 0.55,
  FREE_WALK_STALL_SPEED_PX: 0.24,
  FREE_WALK_CRUISE_SPEED_CMPS: 5.2,
  FREE_WALK_RANDOM_TURN_RATE: 0.45,
  FREE_WALK_RANDOM_TURN_JITTER: 0.18,
  FREE_WALK_ROAM_JITTER_FORCE: 82,
  FREE_WALK_CENTER_PULL_SCALE: 0.05,
  FREE_WALK_COHESION_SCALE: 0.08,
  FREE_WALK_BOUNDARY_PULL_SCALE: 0.22,
  FREE_WALK_WIND_SCALE: 0.35,
  IDEAL_DISTANCE_CM: 34,
  FREE_DISTANCE_CM: 44,
  MAX_INTERNAL_TEMP_C: 37.5,
  UPPER_CRITICAL_TEMP_C: 20,
  MIN_SKIN_TEMP_C: 12,
  VORTEX_RING_RATIO_X: 0.34,
  VORTEX_RING_RATIO_Y: 0.3,
  VORTEX_SWIRL_FORCE: 42,
  VORTEX_INWARD_FORCE: 34,
  FREE_MOVE_TARGET_PULL: 30,
  FREE_MOVE_TANGENTIAL_FORCE: 18,
  FREE_MOVE_OUTWARD_FORCE: 34,
  LIQUID_TARGET_PULL: 58,
  LIQUID_TANGENTIAL_FORCE: 10,
  LATTICE_NEIGHBOR_COUNT: 6,
  LATTICE_KEEP_FORCE: 34,
  LATTICE_EXTRA_REPEL_FORCE: 18,
  LATTICE_TARGET_RATIO: 0.46,
  BODY_CIRCLE_RADIUS_RATIO: 0.2,
  BODY_CIRCLE_RADIUS_DENSITY_SCALE: 0.08,
  BODY_CIRCLE_Y_OFFSET_RATIO: 0.16,
  HUDDLE_PROXIMITY_BAND_RATIO: 0.26,
  HUDDLE_PROXIMITY_SOFTNESS: 0.18,
  THERMAL_VIS_RADIUS_RATIO: 0.82,
  THERMAL_VIS_ALPHA: 0.42,
  MODE_DEBUG_ALPHA: 0.18,
  HARD_STOP_SPEED_PX: 0.08,
  HARD_STOP_STEP_RATIO: 0.06,
  HUDDLE_REST_PULL_SCALE: 0.12,
  HUDDLE_REST_LOCK_DISTANCE_PX: 1.8,
  HUDDLE_REST_LOCK_STEP_RATIO: 0.12,
  HUDDLE_STATIC_SEPARATION_SCALE: 0.14,
  HUDDLE_STATIC_OVERLAP_TOLERANCE: 0.09,
  HUDDLE_STATIC_HARD_STOP_SPEED_PX: 0.16,
  HUDDLE_STATIC_LOCK_CONTACT_DEFICIT: 0.18,
  HUDDLE_STATIC_ALIGNMENT_SCALE: 0,
  HUDDLE_STATIC_LATTICE_SCALE: 0.08,
  HUDDLE_CORE_EDGE_EXPOSURE_MAX: 0.06,
  HUDDLE_CORE_OVERHEAT_BUFFER_C: 1.2,
  HUDDLE_SURROUND_TOUCH_MIN: 4,
  HUDDLE_SURROUND_PROJECTION_RATIO: 0.24,
  HUDDLE_SURROUND_LATERAL_RATIO: 1.15,
  HUDDLE_MODE_ENTER_SCORE: 0.56,
  HUDDLE_MODE_EXIT_SCORE: 0.5,
  HUDDLE_LATCH_TOUCH_MIN: 2,
  HUDDLE_LATCH_TIGHTNESS: 0.26,
  HUDDLE_MEMBER_MIN_TOUCHES: 4,
  HUDDLE_MEMBER_MIN_TIGHTNESS: 0.52,
  HUDDLE_MEMBER_MIN_DENSITY: 0.28,
  EXPECTED_TEMP_DENSITY_WEIGHT: 7.5,
  EXPECTED_TEMP_CONTACT_WEIGHT: 9.5,
  EXPECTED_TEMP_EXPOSURE_WEIGHT: 4.2,
  EXPECTED_TEMP_HISTORY_WEIGHT: 2.4,
  EXPECTED_TEMP_RELOCATE_DELTA_C: 1.6,
  WAVE_GAP_TRIGGER_SCALE: 1.8,
  WAVE_GAP_MIN_STEP_RATIO: 0.28,
  WAVE_SUPPORT_STEP_RATIO: 0.22,
  WAVE_GAP_RATIO_THRESHOLD: 0.22,
  WAVE_GAP_MAX_SPACING_RATIO: 1.45,
  WAVE_VISUAL_BOB_HEIGHT_RATIO: 0.08,
  WAVE_VISUAL_BOB_DURATION_SCALE: 1.2,
  SPRITE_UPDATE_SPEED_PX: 0.34,
  SPRITE_SETTLE_SPEED_PX: 0.62,
  SPRITE_STEP_UPDATE_RATIO: 0.08,
  SPRITE_DIRECTION_TURN_RATE: 1.12,
  SPRITE_DIRECTION_FAST_TURN_RATE: 1.7,
  SPRITE_POSE_VERTICAL_ENTER_RATIO: 1.28,
  SPRITE_POSE_SIDE_ENTER_RATIO: 1.08,
  SPRITE_POSE_MIN_HOLD_SEC: 0.16,
  SPRITE_POSE_CONTACT_HOLD_SCALE: 2.1,
  SPRITE_POSE_CONTACT_VERTICAL_ENTER_RATIO: 1.68,
  SPRITE_POSE_CONTACT_SIDE_ENTER_RATIO: 1.28,
  SPRITE_CONTACT_TURN_RATE_SCALE: 0.55,
  HUDDLE_FACING_TURN_RATE: 2.4,
  FREE_WALK_MIN_CONTINUOUS_RATIO: 0.18,
  SPRITE_HEIGHT_MIN: 38,
  SPRITE_HEIGHT_MAX: 64,
  SPRITE_HEIGHT_RATIO: 0.058,
  WADDLE_SIDE_SCALE_RATIO: 0.038,
  WADDLE_MIN_SPEED_RATIO: 0.08,
  WADDLE_MAX_ROTATION: 0.075,
};

const AGENT_MODES = {
  FREE_WALK: "free_walk",
  SEEK_HUDDLE: "seek_huddle",
  REST_HUDDLE: "rest_huddle",
  WAVE_STEP: "wave_step",
  BOUNDARY_WALK: "boundary_walk",
  COOLING_EXIT: "cooling_exit",
};

const CONTROL_FIELDS = [
  {
    key: "MOUSE_INTERACTION",
    label: "마우스 상호작용",
    type: "static",
    formatValue: () => "없음",
  },
  {
    key: "COUNT",
    label: "개체 수",
    min: 30,
    max: 360,
    step: 5,
    formatValue: (value) => `${Math.round(value)} 마리`,
  },
  {
    key: "APPARENT_TEMP_C",
    label: "남극 기온",
    min: -60,
    max: -10,
    step: 1,
    formatValue: (value) => `${Math.round(value)} °C`,
  },
  {
    key: "WIND_SPEED_MPS",
    label: "눈보라 세기",
    min: 0,
    max: 30,
    step: 0.5,
    formatValue: (value) => `${Number(value).toFixed(1)} m/s`,
  },
  {
    key: "DENSITY_PER_M2",
    label: "밀집도",
    min: 10,
    max: 21,
    step: 0.5,
    formatValue: (value) => `${Number(value).toFixed(1)} /m²`,
  },
  {
    key: "SHOW_THERMAL_MAP",
    label: "열 지도",
    type: "toggle",
    formatValue: (value) => (value ? "ON" : "OFF"),
  },
];

const DEFAULT_CONTROL_STATE = {
  COUNT: PARAMS.DEFAULT_COUNT,
  APPARENT_TEMP_C: PARAMS.DEFAULT_APPARENT_TEMP_C,
  WIND_SPEED_MPS: PARAMS.DEFAULT_WIND_SPEED_MPS,
  GLOBAL_RADIATION: PARAMS.DEFAULT_GLOBAL_RADIATION,
  RELATIVE_HUMIDITY: PARAMS.DEFAULT_RELATIVE_HUMIDITY,
  DENSITY_PER_M2: PARAMS.DEFAULT_DENSITY_PER_M2,
  REACTION_THRESHOLD_CM: PARAMS.DEFAULT_REACTION_THRESHOLD_CM,
  HUDDLE_STEP_DISTANCE_CM: PARAMS.DEFAULT_HUDDLE_STEP_DISTANCE_CM,
  THERMAL_BREAKUP_THRESHOLD: PARAMS.THERMAL_BREAKUP_THRESHOLD,
  SHOW_THERMAL_MAP: true,
  DEBUG_OVERLAY: false,
};

// 아틀라스 참조
const ATLAS = HOME_SPRITE_ATLASES.penguin;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

// 공통 계산
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const randomBetween = (min, max) => min + Math.random() * (max - min);
const lerp = (start, end, amount) => start + (end - start) * amount;
const logistic = (value) => 1 / (1 + Math.exp(-value));

const normalize2D = (x, y, fallback = { x: 1, y: 0 }) => {
  const length = Math.hypot(x, y);
  if (length < 1e-6) {
    return { ...fallback };
  }

  return { x: x / length, y: y / length };
};

const resolvePenguinPoseKind = (direction) => {
  const normalized = normalize2D(direction.x, direction.y, { x: -1, y: 0 });

  if (Math.abs(normalized.y) > Math.abs(normalized.x) * 1.12) {
    return normalized.y >= 0 ? "front" : "back";
  }

  return "side";
};

const lockPenguinFacing = (agent, direction) => {
  const normalized = normalize2D(direction.x, direction.y, { x: -1, y: 0 });

  agent.spriteVelocity = normalized;
  agent.lockedFacingDirection = normalized;
  agent.spritePoseKind = resolvePenguinPoseKind(normalized);
  agent.spriteSideSign =
    Math.abs(normalized.x) > 0.12
      ? normalized.x >= 0
        ? 1
        : -1
      : agent.spriteSideSign || 1;
  agent.spritePoseCandidate = null;
  agent.spritePoseCandidateTime = 0;
};

const resolveRestFacingDirection = (agent, fallback) =>
  normalize2D(
    agent.lockedFacingDirection?.x ??
      agent.spriteVelocity?.x ??
      agent.steerDirection?.x ??
      agent.vx,
    agent.lockedFacingDirection?.y ??
      agent.spriteVelocity?.y ??
      agent.steerDirection?.y ??
      agent.vy,
    fallback,
  );

const rotateDirectionToward = (current, target, maxRadians) => {
  const currentDirection = normalize2D(current.x, current.y, { x: 1, y: 0 });
  const targetDirection = normalize2D(target.x, target.y, currentDirection);
  const currentAngle = Math.atan2(currentDirection.y, currentDirection.x);
  const targetAngle = Math.atan2(targetDirection.y, targetDirection.x);
  const delta = Math.atan2(
    Math.sin(targetAngle - currentAngle),
    Math.cos(targetAngle - currentAngle),
  );
  const nextAngle = currentAngle + clamp(delta, -maxRadians, maxRadians);

  return {
    x: Math.cos(nextAngle),
    y: Math.sin(nextAngle),
  };
};

const resolveStablePenguinSpriteVelocity = (agent, velocity, dt) => {
  const velocityMagnitude = Math.hypot(velocity.x, velocity.y);
  if (
    agent.mode === AGENT_MODES.REST_HUDDLE &&
    velocityMagnitude < PARAMS.SPRITE_SETTLE_SPEED_PX
  ) {
    return (
      agent.lockedFacingDirection ||
      agent.spriteVelocity || { x: -1, y: 0 }
    );
  }

  const direction = normalize2D(velocity.x, velocity.y, agent.spriteVelocity);
  const contactCount = agent.contactCount ?? 0;
  const contactLocked = contactCount >= 2;
  const absX = Math.abs(direction.x);
  const absY = Math.abs(direction.y);
  const previousPose = agent.spritePoseKind || "side";
  const verticalEnterRatio = contactLocked
    ? PARAMS.SPRITE_POSE_CONTACT_VERTICAL_ENTER_RATIO
    : PARAMS.SPRITE_POSE_VERTICAL_ENTER_RATIO;
  const sideEnterRatio = contactLocked
    ? PARAMS.SPRITE_POSE_CONTACT_SIDE_ENTER_RATIO
    : PARAMS.SPRITE_POSE_SIDE_ENTER_RATIO;
  const minHoldSec =
    PARAMS.SPRITE_POSE_MIN_HOLD_SEC *
    (contactLocked ? PARAMS.SPRITE_POSE_CONTACT_HOLD_SCALE : 1);
  let candidatePose = previousPose;

  if (previousPose === "side") {
    if (absY > absX * verticalEnterRatio) {
      candidatePose = direction.y >= 0 ? "front" : "back";
    }
  } else if (absX > absY * sideEnterRatio) {
    candidatePose = "side";
  } else if (absY > 0.36) {
    candidatePose = direction.y >= 0 ? "front" : "back";
  }

  if (contactLocked && velocityMagnitude < PARAMS.SPRITE_SETTLE_SPEED_PX) {
    candidatePose = previousPose;
  }

  if (candidatePose !== previousPose) {
    if (agent.spritePoseCandidate !== candidatePose) {
      agent.spritePoseCandidate = candidatePose;
      agent.spritePoseCandidateTime = 0;
    } else {
      agent.spritePoseCandidateTime =
        (agent.spritePoseCandidateTime ?? 0) + dt;
    }

    if (
      (agent.spritePoseCandidateTime ?? 0) >= minHoldSec
    ) {
      agent.spritePoseKind = candidatePose;
      agent.spritePoseCandidate = null;
      agent.spritePoseCandidateTime = 0;
    }
  } else {
    agent.spritePoseCandidate = null;
    agent.spritePoseCandidateTime = 0;
    agent.spritePoseKind = previousPose;
  }

  const resolvedPose = agent.spritePoseKind || previousPose;
  if (resolvedPose === "front") {
    return { x: 0, y: 1 };
  }
  if (resolvedPose === "back") {
    return { x: 0, y: -1 };
  }

  const previousSideSign = agent.spriteSideSign || 1;
  if (absX > (contactLocked ? 0.55 : 0.22)) {
    agent.spriteSideSign = direction.x >= 0 ? 1 : -1;
  }

  return { x: agent.spriteSideSign || previousSideSign, y: 0 };
};

const parseAspectRatio = (value, fallbackWidth, fallbackHeight) => {
  if (typeof value === "string") {
    const [widthToken, heightToken] = value
      .split("/")
      .map((token) => Number.parseFloat(token.trim()));
    if (widthToken > 0 && heightToken > 0) {
      return widthToken / heightToken;
    }
  }

  if (fallbackWidth > 0 && fallbackHeight > 0) {
    return fallbackWidth / fallbackHeight;
  }

  return 1;
};

const resolveBodyCircle = (agent, behavior, x = agent.x, y = agent.y) => {
  const densityScale =
    1 + behavior.densityRatio * PARAMS.BODY_CIRCLE_RADIUS_DENSITY_SCALE;
  const radius =
    agent.renderWidth * PARAMS.BODY_CIRCLE_RADIUS_RATIO * densityScale;

  return {
    x,
    y: y + agent.renderHeight * PARAMS.BODY_CIRCLE_Y_OFFSET_RATIO,
    radius,
  };
};

const resolveBodyCircleFromMetrics = (
  agent,
  metrics,
  behavior,
  frameAspect,
  x,
  y,
) => {
  const estimatedHeight = metrics.spriteHeight * agent.sizeJitter;
  const estimatedWidth = estimatedHeight * frameAspect;
  const densityScale =
    1 + behavior.densityRatio * PARAMS.BODY_CIRCLE_RADIUS_DENSITY_SCALE;

  return {
    x,
    y: y + estimatedHeight * PARAMS.BODY_CIRCLE_Y_OFFSET_RATIO,
    radius: estimatedWidth * PARAMS.BODY_CIRCLE_RADIUS_RATIO * densityScale,
  };
};

const resolveThermalVisual = (thermalState) => {
  const normalized = clamp((thermalState + 0.9) / 1.9, 0, 1);
  const cool = {
    r: 91,
    g: 140,
    b: 214,
  };
  const warm = {
    r: 240,
    g: 166,
    b: 92,
  };

  return {
    r: Math.round(lerp(cool.r, warm.r, normalized)),
    g: Math.round(lerp(cool.g, warm.g, normalized)),
    b: Math.round(lerp(cool.b, warm.b, normalized)),
    alpha: lerp(0.14, PARAMS.THERMAL_VIS_ALPHA, Math.abs(thermalState) / 1.1),
  };
};

const resolveModeDebugVisual = (mode) => {
  switch (mode) {
    case AGENT_MODES.REST_HUDDLE:
      return { r: 120, g: 170, b: 235, alpha: PARAMS.MODE_DEBUG_ALPHA * 0.7 };
    case AGENT_MODES.WAVE_STEP:
      return { r: 244, g: 206, b: 92, alpha: PARAMS.MODE_DEBUG_ALPHA };
    case AGENT_MODES.SEEK_HUDDLE:
      return { r: 168, g: 206, b: 226, alpha: PARAMS.MODE_DEBUG_ALPHA * 0.9 };
    case AGENT_MODES.BOUNDARY_WALK:
      return { r: 129, g: 214, b: 156, alpha: PARAMS.MODE_DEBUG_ALPHA * 0.95 };
    case AGENT_MODES.COOLING_EXIT:
      return { r: 236, g: 134, b: 120, alpha: PARAMS.MODE_DEBUG_ALPHA };
    case AGENT_MODES.FREE_WALK:
    default:
      return { r: 196, g: 190, b: 182, alpha: PARAMS.MODE_DEBUG_ALPHA * 0.45 };
  }
};

const resolvePenguinTagMode = (agent) => {
  if (agent.mode === AGENT_MODES.WAVE_STEP) {
    return AGENT_MODES.WAVE_STEP;
  }

  if (agent.mode === AGENT_MODES.COOLING_EXIT) {
    return AGENT_MODES.COOLING_EXIT;
  }

  return agent.baseMode || agent.mode;
};

const resolveSkinTempC = (thermalState) =>
  lerp(
    PARAMS.MIN_SKIN_TEMP_C,
    PARAMS.MAX_INTERNAL_TEMP_C,
    clamp((thermalState + 1) / 2.25, 0, 1),
  );

const resolveThermalStateFromSkinTempC = (skinTempC) =>
  lerp(
    -1,
    1.25,
    clamp(
      (skinTempC - PARAMS.MIN_SKIN_TEMP_C) /
        Math.max(PARAMS.MAX_INTERNAL_TEMP_C - PARAMS.MIN_SKIN_TEMP_C, 1e-3),
      0,
      1,
    ),
  );

const resolveBehaviorConfig = (controls = DEFAULT_CONTROL_STATE) => {
  const count = clamp(Math.round(controls.COUNT), 30, 360);
  const apparentTempC = clamp(controls.APPARENT_TEMP_C, -60, -10);
  const windSpeedMps = clamp(controls.WIND_SPEED_MPS, 0, 30);
  const globalRadiation = clamp(controls.GLOBAL_RADIATION, 0, 700);
  const relativeHumidity = clamp(controls.RELATIVE_HUMIDITY, 15, 100);
  const densityPerM2 = clamp(controls.DENSITY_PER_M2, 10, 21);
  const reactionThresholdCm = clamp(controls.REACTION_THRESHOLD_CM, 1, 4);
  const huddleStepDistanceCm = clamp(
    controls.HUDDLE_STEP_DISTANCE_CM,
    5,
    10,
  );
  const thermalBreakupThreshold = clamp(
    controls.THERMAL_BREAKUP_THRESHOLD,
    0.45,
    0.95,
  );
  const apparentTemperatureC =
    apparentTempC +
    PARAMS.WIND_CHILL_FACTOR * windSpeedMps +
    PARAMS.SOLAR_HEATING_FACTOR * globalRadiation +
    PARAMS.HUMIDITY_CHILL_FACTOR * relativeHumidity;
  const coldStress = clamp((-apparentTemperatureC - 14) / 40, 0, 1);
  const windStress = clamp(windSpeedMps / 30, 0, 1);
  const radiationRatio = clamp(globalRadiation / 700, 0, 1);
  const densityRatio = clamp((densityPerM2 - 10) / 11, 0, 1);
  const huddleProbability = logistic(
    (PARAMS.APPARENT_TEMP_HUDDLE_MIDPOINT_C - apparentTemperatureC) /
      (PARAMS.APPARENT_TEMP_TRANSITION_WIDTH_C * 0.62),
  );
  const huddleDrive = clamp(huddleProbability, 0, 1);
  const jamStrength = clamp(
    huddleProbability * 0.78 + densityRatio * 0.22,
    0,
    1,
  );
  const phase =
    huddleDrive < PARAMS.GAS_STATE_THRESHOLD
      ? "free_move"
      : huddleDrive < PARAMS.HUDDLE_STATE_THRESHOLD
        ? "liquid"
        : "huddling";
  const huddleStrength = clamp(
    (huddleDrive - PARAMS.GAS_STATE_THRESHOLD) /
      Math.max(1 - PARAMS.GAS_STATE_THRESHOLD, 1e-3),
    0,
    1,
  );
  const freeMoveStrength = clamp(
    (1 - jamStrength) * lerp(1, 0.72, windStress),
    0.04,
    1,
  );
  const liquidBlend =
    phase === "liquid"
      ? 1 -
        Math.abs(
          (huddleDrive -
            (PARAMS.GAS_STATE_THRESHOLD + PARAMS.HUDDLE_STATE_THRESHOLD) *
              0.5) /
            Math.max(
              (PARAMS.HUDDLE_STATE_THRESHOLD - PARAMS.GAS_STATE_THRESHOLD) *
                0.5,
              1e-3,
            ),
        )
      : 0;
  const packingUrgency = clamp(
    densityRatio * 0.42 + coldStress * 0.44 + windStress * 0.14,
    0,
    1,
  );

  return {
    count,
    apparentTempC,
    apparentTemperatureC,
    windSpeedMps,
    globalRadiation,
    relativeHumidity,
    densityPerM2,
    reactionThresholdCm,
    huddleStepDistanceCm,
    thermalBreakupThreshold,
    coldStress,
    windStress,
    radiationRatio,
    densityRatio,
    huddleDrive,
    huddleProbability,
    phase,
    huddleStrength,
    freeMoveStrength,
    liquidBlend: clamp(liquidBlend, 0, 1),
    jamStrength,
    packingUrgency,
    radiusScale:
      lerp(1.42, 0.78, jamStrength) *
      lerp(1.04, 0.88, densityRatio) *
      lerp(1.02, 0.84, windStress),
    targetPull:
      lerp(
        PARAMS.FREE_MOVE_TARGET_PULL * 0.45,
        PARAMS.TARGET_PULL * 1.96,
        jamStrength,
      ) * lerp(0.96, 1.12, coldStress),
    separationRatio:
      PARAMS.SEPARATION_RATIO *
      lerp(1.55, 0.72, huddleStrength) *
      lerp(1.08, 0.84, densityRatio),
    separationForce:
      PARAMS.SEPARATION_FORCE *
      lerp(0.7, 1.34, huddleStrength) *
      lerp(0.92, 1.18, densityRatio),
    alignmentForce: PARAMS.ALIGNMENT_FORCE * lerp(0.9, 1.22, densityRatio),
    gapResponseForce:
      PARAMS.GAP_RESPONSE_FORCE *
      lerp(0.1, 1.18, huddleStrength) *
      lerp(0.9, 1.16, densityRatio),
    boundaryInwardForce:
      PARAMS.BOUNDARY_INWARD_FORCE * lerp(0.18, 1.24, huddleStrength),
    preferredSpacingRatio: lerp(
      PARAMS.FREE_DISTANCE_CM / PARAMS.BODY_HEIGHT_CM,
      PARAMS.IDEAL_DISTANCE_CM / PARAMS.BODY_HEIGHT_CM,
      clamp(huddleStrength * 0.88 + densityRatio * 0.12, 0, 1),
    ),
    reactionThresholdRatio: reactionThresholdCm / PARAMS.BODY_HEIGHT_CM,
    huddleStepDistanceRatio: huddleStepDistanceCm / PARAMS.BODY_HEIGHT_CM,
    freeWalkStepDistanceRatio:
      PARAMS.FREE_WALK_STEP_DISTANCE_CM / PARAMS.BODY_HEIGHT_CM,
    relocationStepDistanceRatio:
      PARAMS.RELOCATION_STEP_DISTANCE_CM / PARAMS.BODY_HEIGHT_CM,
    centerXBias: windStress * lerp(0.004, 0.018, huddleStrength),
    roamRadiusScale: lerp(2.55, 1.06, huddleStrength),
    tangentialForce: lerp(
      PARAMS.FREE_MOVE_TANGENTIAL_FORCE,
      PARAMS.LIQUID_TANGENTIAL_FORCE,
      jamStrength,
    ),
    freeMoveOutwardForce: PARAMS.FREE_MOVE_OUTWARD_FORCE * freeMoveStrength,
    windDriftForce: windStress * lerp(6, 22, huddleStrength),
    vortexCount:
      count >= 100 && huddleStrength > 0.54 ? (windSpeedMps > 0.5 ? 2 : 4) : 0,
    pulseTriggerRatio: clamp(
      lerp(PARAMS.PULSE_TRIGGER_MIN_RATIO, 0.95, thermalBreakupThreshold),
      PARAMS.PULSE_TRIGGER_MIN_RATIO,
      0.95,
    ),
  };
};

const resolvePenguinMetrics = (width, height, behavior) => {
  const minDimension = Math.min(width, height);
  const baseRadius = clamp(minDimension * PARAMS.HUDDLE_RADIUS_RATIO, 110, 320);

  return {
    centerX: width * (PARAMS.HUDDLE_CENTER_X + behavior.centerXBias),
    centerY: height * PARAMS.HUDDLE_CENTER_Y,
    radiusX:
      baseRadius *
      1.02 *
      behavior.radiusScale *
      lerp(1, 1.16, behavior.windStress),
    radiusY:
      baseRadius *
      PARAMS.HUDDLE_VERTICAL_SQUASH *
      behavior.radiusScale *
      lerp(1, 0.9, behavior.windStress),
    spriteHeight: clamp(
      minDimension * PARAMS.SPRITE_HEIGHT_RATIO,
      PARAMS.SPRITE_HEIGHT_MIN,
      PARAMS.SPRITE_HEIGHT_MAX,
    ),
  };
};

const createAgents = (count, width, height, behavior) => {
  const metrics = resolvePenguinMetrics(width, height, behavior);

  return Array.from({ length: count }, (_, index) => {
    const normalizedRadius = Math.sqrt((index + 0.5) / count);
    const angle = index * GOLDEN_ANGLE;
    const slotX = Math.cos(angle) * normalizedRadius;
    const slotY = Math.sin(angle) * normalizedRadius * 0.9;
    const baseX = metrics.centerX + slotX * metrics.radiusX;
    const baseY = metrics.centerY + slotY * metrics.radiusY;
    const spawnMargin = metrics.spriteHeight * 0.4;
    const spawnX = randomBetween(spawnMargin, width - spawnMargin);
    const spawnY = randomBetween(spawnMargin, height - spawnMargin);
    const initialDirection = normalize2D(baseX - spawnX, baseY - spawnY, {
      x: Math.cos(angle),
      y: Math.sin(angle),
    });

    return {
      x: spawnX,
      y: spawnY,
      vx: initialDirection.x * randomBetween(2, 10),
      vy: initialDirection.y * randomBetween(2, 10),
      slotX,
      slotY,
      sizeJitter: randomBetween(0.92, 1.08),
      waddleOffset: randomBetween(0, Math.PI * 2),
      stageOffset: randomBetween(0, 1000),
      roamPhase: randomBetween(0, Math.PI * 2),
      roamDirection: Math.random() < 0.5 ? -1 : 1,
      roamRadiusJitter: randomBetween(0.82, 1.18),
      roamHeading: randomBetween(0, Math.PI * 2),
      previousScreenPosition: null,
      spriteVelocity: {
        x: initialDirection.x,
        y: initialDirection.y,
      },
      spritePoseKind: Math.abs(initialDirection.y) > Math.abs(initialDirection.x)
        ? initialDirection.y >= 0
          ? "front"
          : "back"
        : "side",
      spriteSideSign: initialDirection.x >= 0 ? 1 : -1,
      spritePoseCandidate: null,
      spritePoseCandidateTime: 0,
      steerDirection: {
        x: initialDirection.x,
        y: initialDirection.y,
      },
      spriteProfile: "simulation",
      spriteSpace: "2d",
      spriteState: undefined,
      lockedSpriteRender: null,
      renderHeight: metrics.spriteHeight,
      renderWidth: metrics.spriteHeight,
      waddleRotation: 0,
      waddleScaleY: 1,
      gaitPhaseRad: randomBetween(0, Math.PI * 4),
      gaitDistancePx: randomBetween(0, metrics.spriteHeight * 0.24),
      compression: 0,
      stepRemaining: 0,
      stepCooldown: randomBetween(0, PARAMS.STEP_COOLDOWN_SEC),
      contactSeekCooldown: randomBetween(0, PARAMS.CONTACT_SEEK_COOLDOWN_SEC),
      shelterSeeking: false,
      shelterWait: randomBetween(0, PARAMS.SHELTER_WAIT_MAX_SEC * 0.65),
      thermalState: randomBetween(-0.16, 0.08),
      skinTempC: randomBetween(16.5, 23),
      heatHistory: randomBetween(-0.12, 0.14),
      thermalInertia: randomBetween(0.88, 1.12),
      mode: AGENT_MODES.FREE_WALK,
      modeTimer: 0,
      waveDelay: randomBetween(0, 0.14),
      nextWaveTime: randomBetween(
        PARAMS.WAVE_INTERVAL_MIN_SEC * 0.25,
        PARAMS.WAVE_INTERVAL_MAX_SEC * 0.6,
      ),
      nextFreeStepTime: randomBetween(
        PARAMS.FREE_WALK_TRIGGER_STEP_INTERVAL_MIN_SEC * 0.3,
        PARAMS.FREE_WALK_TRIGGER_STEP_INTERVAL_MAX_SEC * 0.6,
      ),
      lightProxy: 1,
      boundarySide: Math.sign(slotY || 1),
    };
  });
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

// 플레이스홀더 앱
export function App({ controls, onGpuErrorChange, isPaused = false }) {
  const canvasRef = React.useRef(null);
  const imageRef = React.useRef(null);
  const rasterCanvasRef = React.useRef(null);
  const animationFrameRef = React.useRef(0);
  const agentsRef = React.useRef([]);
  const simulationTimeRef = React.useRef(0);
  const frameSizeRef = React.useRef(
    resolveAtlasFrameSize(ATLAS, { width: 64, height: 64 }),
  );
  const lastTimeRef = React.useRef(0);
  const lastDebugLogTimeRef = React.useRef(0);
  React.useEffect(() => {
    onGpuErrorChange?.("");
  }, [onGpuErrorChange]);

  // 이미지 로드
  React.useEffect(() => {
    let cancelled = false;

    loadTexturedAtlasCanvas(ATLAS).then(({ image, frameSize, canvas }) => {
      if (cancelled) {
        return;
      }

      imageRef.current = image;
      frameSizeRef.current = frameSize;
      rasterCanvasRef.current = canvas;
    });

    return () => {
      cancelled = true;
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

    const ensureAgents = (width, height, behavior) => {
      if (agentsRef.current.length === 0) {
        agentsRef.current = createAgents(
          behavior.count,
          width,
          height,
          behavior,
        );
        simulationTimeRef.current = 0;
        return;
      }

      if (agentsRef.current.length < behavior.count) {
        const nextAgents = createAgents(
          behavior.count - agentsRef.current.length,
          width,
          height,
          behavior,
        );
        agentsRef.current = [...agentsRef.current, ...nextAgents];
      } else if (agentsRef.current.length > behavior.count) {
        agentsRef.current = agentsRef.current.slice(0, behavior.count);
      }

      const metrics = resolvePenguinMetrics(width, height, behavior);
      agentsRef.current.forEach((agent) => {
        const margin =
          metrics.spriteHeight * PARAMS.SCREEN_REENTRY_MARGIN_RATIO;
        agent.x = clamp(agent.x, -margin, width + margin);
        agent.y = clamp(agent.y, -margin, height + margin);
        agent.renderHeight = metrics.spriteHeight * agent.sizeJitter;
      });
    };

    const render = (timestamp) => {
      const now = timestamp * 0.001;
      const dt = lastTimeRef.current
        ? Math.min(now - lastTimeRef.current, 0.05)
        : 0.016;
      lastTimeRef.current = now;
      const behavior = resolveBehaviorConfig(controls);
      simulationTimeRef.current += dt * PARAMS.SIMULATION_TIME_SCALE;
      const simTime = simulationTimeRef.current;
      const size = syncCanvasSize(canvas, ctx);
      ensureAgents(size.width, size.height, behavior);
      const metrics = resolvePenguinMetrics(size.width, size.height, behavior);

      clearTransparentCanvas2d(ctx, size.width, size.height);

      const image = rasterCanvasRef.current || imageRef.current;
      const frameSize = frameSizeRef.current;
      const debugOverlayEnabled = Boolean(controls?.DEBUG_OVERLAY);
      const thermalMapEnabled = Boolean(
        controls?.SHOW_THERMAL_MAP ?? DEFAULT_CONTROL_STATE.SHOW_THERMAL_MAP,
      );
      const frameAspect = parseAspectRatio(
        ATLAS.aspectRatio,
        frameSize.width,
        frameSize.height,
      );

      if (!isPaused) {
        const reactionThresholdPx =
          metrics.spriteHeight * behavior.reactionThresholdRatio;
        const stepDistancePx =
          metrics.spriteHeight * behavior.huddleStepDistanceRatio;
        const freeStepDistancePx =
          metrics.spriteHeight * behavior.freeWalkStepDistanceRatio;
        const relocationStepDistancePx =
          metrics.spriteHeight * behavior.relocationStepDistanceRatio;
        const pxPerCm = metrics.spriteHeight / PARAMS.BODY_HEIGHT_CM;
        const targetRadius = lerp(
          metrics.radiusX * 1.4,
          lerp(metrics.radiusY * 0.72, metrics.radiusX * 0.94, 0.5),
          behavior.huddleStrength,
        );
        const targetPullStrength = behavior.targetPull;
        const boundaryPullStrength = behavior.boundaryInwardForce;
        const stepSpeed =
          PARAMS.HUDDLE_INDIVIDUAL_SPEED_CMPS * pxPerCm;
        const freeStepSpeed =
          PARAMS.FREE_WALK_SPEED_CMPS * pxPerCm;
        const freeWalkCruiseSpeed =
          PARAMS.FREE_WALK_SPEED_CMPS * pxPerCm;
        const relocationStepSpeed =
          PARAMS.RELOCATION_SPEED_CMPS * pxPerCm;
        const waveStepSpeed =
          PARAMS.HUDDLE_WAVE_SPEED_CMPS * pxPerCm;
        const coolingExitSpeed =
          PARAMS.COOLING_EXIT_SPEED_CMPS * pxPerCm;
        const behaviorDt = dt * PARAMS.SIMULATION_TIME_SCALE;
        const overheatedRatio =
          agentsRef.current.length > 0
            ? agentsRef.current.filter(
                (agent) =>
                  (agent.skinTempC ?? resolveSkinTempC(agent.thermalState)) >=
                  PARAMS.MAX_INTERNAL_TEMP_C,
              ).length / agentsRef.current.length
            : 0;
        const pulseCollapseActive =
          overheatedRatio >= behavior.pulseTriggerRatio;
        const provisionalTargets = agentsRef.current.map(
          (agent, agentIndex) => {
            const inward = normalize2D(
              metrics.centerX - agent.x,
              metrics.centerY - agent.y,
              { x: 0, y: -1 },
            );
            const dxCenter = metrics.centerX - agent.x;
            const dyCenter = metrics.centerY - agent.y;
            const distanceToCenter = Math.hypot(dxCenter, dyCenter);
            const boundaryRatio = clamp(
              distanceToCenter / Math.max(targetRadius, 1),
              0,
              1.8,
            );
            const normalizedX = dxCenter / Math.max(metrics.radiusX, 1);
            const normalizedY = dyCenter / Math.max(metrics.radiusY, 1);
            const tangent = { x: -inward.y, y: inward.x };
            const huddleFacingDirection = { x: -1, y: 0 };
            const isStaticHuddleCandidate =
              behavior.phase === "huddling" &&
              agent.mode === AGENT_MODES.REST_HUDDLE &&
              agent.stepRemaining <
                stepDistancePx * PARAMS.HUDDLE_REST_LOCK_STEP_RATIO;
            agent.skinTempC ??= resolveSkinTempC(agent.thermalState);
            const thermalColdDrive = clamp(
              (PARAMS.UPPER_CRITICAL_TEMP_C - agent.skinTempC) / 10,
              0,
              1.2,
            );
            const thermalWarmDrive = clamp(
              (agent.skinTempC - PARAMS.UPPER_CRITICAL_TEMP_C) /
                Math.max(
                  PARAMS.MAX_INTERNAL_TEMP_C - PARAMS.UPPER_CRITICAL_TEMP_C,
                  1e-3,
                ),
              0,
              1.2,
            );
            const localHuddleIntent = clamp(
              behavior.huddleProbability * 0.72 +
                behavior.huddleStrength * 0.18 +
                thermalColdDrive * 0.5 -
                thermalWarmDrive * 0.78,
              0,
              1,
            );
            const agentDesiredSpacing =
              metrics.spriteHeight *
              lerp(
                1.04,
                behavior.preferredSpacingRatio,
                clamp(
                  localHuddleIntent +
                    behavior.coldStress * 0.12 +
                    behavior.windStress * 0.08,
                  0,
                  1,
                ),
              );
            agent.roamHeading =
              (agent.roamHeading ?? randomBetween(0, Math.PI * 2)) +
              Math.sin(simTime * 0.31 + agent.roamPhase) *
                PARAMS.FREE_WALK_RANDOM_TURN_RATE *
                dt *
                (0.28 + behavior.freeMoveStrength * 0.72) +
              randomBetween(-1, 1) *
                PARAMS.FREE_WALK_RANDOM_TURN_JITTER *
                dt *
                behavior.freeMoveStrength;
            const freeWalkRandomDir = {
              x: Math.cos(agent.roamHeading),
              y: Math.sin(agent.roamHeading),
            };
            const wanderSign = Math.sign(agent.slotY || 1);
            const isActiveFreeWalk = agent.mode === AGENT_MODES.FREE_WALK;
            const isSeekingHuddle = agent.mode === AGENT_MODES.SEEK_HUDDLE;
            const isCoolingExit = agent.mode === AGENT_MODES.COOLING_EXIT;
            let steerX =
              freeWalkRandomDir.x *
              PARAMS.FREE_MOVE_TARGET_PULL *
              behavior.freeMoveStrength;
            let steerY =
              freeWalkRandomDir.y *
              PARAMS.FREE_MOVE_TARGET_PULL *
              behavior.freeMoveStrength;
            let alignmentX = 0;
            let alignmentY = 0;
            let alignmentCount = 0;
            let cohesionX = 0;
            let cohesionY = 0;
            let cohesionCount = 0;
            let separationX = 0;
            let separationY = 0;
            let separationCount = 0;
            let localDensityCount = 0;
            let touchingNeighborCount = 0;
            let touchPackedness = 0;
            let closeNeighborCenterX = 0;
            let closeNeighborCenterY = 0;
            let nearestSocialDistance = null;
            let nearestSocialX = 0;
            let nearestSocialY = 0;
            let socialSeekDirection = null;
            let socialSeekStrength = 0;
            let frontOccupied = false;
            let backOccupied = false;
            let leftOccupied = false;
            let rightOccupied = false;
            const latticeNeighbors = [];
            let nearestAheadDistance = null;
            let nearestAheadWaveDistance = null;
            const agentBodyCircle = resolveBodyCircleFromMetrics(
              agent,
              metrics,
              behavior,
              frameAspect,
              agent.x,
              agent.y,
            );

            agentsRef.current.forEach((otherAgent, otherIndex) => {
              if (agentIndex === otherIndex) {
                return;
              }

              const dx = otherAgent.x - agent.x;
              const dy = otherAgent.y - agent.y;
              const distance = Math.hypot(dx, dy) || 1;
              const socialSearchRadius = Math.max(
                metrics.spriteHeight *
                  PARAMS.SOCIAL_SEARCH_RADIUS_RATIO *
                  lerp(0.72, 1.25, behavior.coldStress),
                Math.min(size.width, size.height) *
                  (PARAMS.SOCIAL_SEARCH_CANVAS_RATIO +
                    behavior.coldStress * PARAMS.SOCIAL_SEARCH_COLD_BONUS),
              );

              if (
                distance < socialSearchRadius &&
                otherAgent.mode !== AGENT_MODES.COOLING_EXIT &&
                (nearestSocialDistance === null ||
                  distance < nearestSocialDistance)
              ) {
                nearestSocialDistance = distance;
                nearestSocialX = otherAgent.x;
                nearestSocialY = otherAgent.y;
              }

              const otherBodyCircle = resolveBodyCircleFromMetrics(
                otherAgent,
                metrics,
                behavior,
                frameAspect,
                otherAgent.x,
                otherAgent.y,
              );
              const bodyDx = otherBodyCircle.x - agentBodyCircle.x;
              const bodyDy = otherBodyCircle.y - agentBodyCircle.y;
              const bodyDistance = Math.hypot(bodyDx, bodyDy) || 1;
              const collisionDistance =
                agentBodyCircle.radius + otherBodyCircle.radius;
              const huddleBand =
                collisionDistance * PARAMS.HUDDLE_PROXIMITY_BAND_RATIO;
              const huddleDistance = collisionDistance + huddleBand;
              if (distance > agentDesiredSpacing * 2.2) {
                return;
              }

              if (bodyDistance < huddleDistance) {
                localDensityCount += 1;
                closeNeighborCenterX += otherAgent.x;
                closeNeighborCenterY += otherAgent.y;
                const longitudinalOffset =
                  bodyDx * inward.x + bodyDy * inward.y;
                const lateralOffset = bodyDx * tangent.x + bodyDy * tangent.y;
                const surroundProjectionThreshold =
                  collisionDistance * PARAMS.HUDDLE_SURROUND_PROJECTION_RATIO;
                const surroundLateralThreshold =
                  collisionDistance * PARAMS.HUDDLE_SURROUND_LATERAL_RATIO;

                if (Math.abs(lateralOffset) <= surroundLateralThreshold) {
                  if (longitudinalOffset >= surroundProjectionThreshold) {
                    frontOccupied = true;
                  }
                  if (longitudinalOffset <= -surroundProjectionThreshold) {
                    backOccupied = true;
                  }
                }

                if (Math.abs(longitudinalOffset) <= surroundLateralThreshold) {
                  if (lateralOffset >= surroundProjectionThreshold) {
                    rightOccupied = true;
                  }
                  if (lateralOffset <= -surroundProjectionThreshold) {
                    leftOccupied = true;
                  }
                }
                latticeNeighbors.push({
                  bodyDx,
                  bodyDy,
                  bodyDistance,
                  collisionDistance,
                  huddleDistance,
                });
              }

              if (
                bodyDistance >= collisionDistance &&
                bodyDistance < huddleDistance
              ) {
                touchingNeighborCount += 1;
                touchPackedness += clamp(
                  (huddleDistance - bodyDistance) / Math.max(huddleBand, 1e-3),
                  0,
                  1,
                );
              }

              if (bodyDistance < collisionDistance) {
                const otherIsStaticHuddleCandidate =
                  behavior.phase === "huddling" &&
                  otherAgent.mode === AGENT_MODES.REST_HUDDLE &&
                  otherAgent.stepRemaining <
                    stepDistancePx * PARAMS.HUDDLE_REST_LOCK_STEP_RATIO;
                const overlapPushScale =
                  isStaticHuddleCandidate && otherIsStaticHuddleCandidate
                    ? PARAMS.HUDDLE_STATIC_SEPARATION_SCALE
                    : 1;
                const push =
                  ((collisionDistance - bodyDistance) /
                    Math.max(collisionDistance, 1e-3)) *
                  behavior.separationForce *
                  overlapPushScale;
                separationX -= (bodyDx / bodyDistance) * push;
                separationY -= (bodyDy / bodyDistance) * push;
                separationCount += 1;
              } else {
                cohesionX += dx / distance;
                cohesionY += dy / distance;
                cohesionCount += 1;
              }

              if (distance < agentDesiredSpacing * 1.8) {
                alignmentX += otherAgent.vx;
                alignmentY += otherAgent.vy;
                alignmentCount += 1;
              }

              const forwardDistance = dx * inward.x + dy * inward.y;
              const lateralDistance = Math.abs(dx * -inward.y + dy * inward.x);
              if (
                forwardDistance > 0 &&
                lateralDistance < agentDesiredSpacing * 0.7 &&
                (nearestAheadDistance === null ||
                  forwardDistance < nearestAheadDistance)
              ) {
                nearestAheadDistance = forwardDistance;
              }

              if (
                (otherAgent.mode === AGENT_MODES.WAVE_STEP ||
                  otherAgent.stepRemaining >
                    stepDistancePx * PARAMS.WAVE_SUPPORT_STEP_RATIO) &&
                forwardDistance > 0 &&
                lateralDistance < agentDesiredSpacing * 0.78 &&
                (nearestAheadWaveDistance === null ||
                  forwardDistance < nearestAheadWaveDistance)
              ) {
                nearestAheadWaveDistance = forwardDistance;
              }
            });

            if (separationCount > 0) {
              const separationScale = 1 / Math.sqrt(separationCount);
              steerX += separationX * separationScale;
              steerY += separationY * separationScale;
            }

            if (alignmentCount > 0) {
              const alignmentScale = isStaticHuddleCandidate
                ? PARAMS.HUDDLE_STATIC_ALIGNMENT_SCALE
                : 1;
              steerX +=
                (alignmentX / alignmentCount - agent.vx) *
                behavior.alignmentForce *
                alignmentScale;
              steerY +=
                (alignmentY / alignmentCount - agent.vy) *
                behavior.alignmentForce *
                alignmentScale;
            }

            if (cohesionCount > 0 && distanceToCenter > targetRadius * 0.42) {
              const cohesionScale = isActiveFreeWalk
                ? PARAMS.FREE_WALK_COHESION_SCALE
                : isSeekingHuddle
                  ? PARAMS.FREE_WALK_COHESION_SCALE * 1.6
                : isCoolingExit
                  ? PARAMS.COOLING_EXIT_COHESION_SCALE
                  : 0;
              steerX +=
                (cohesionX / cohesionCount) *
                targetPullStrength *
                metrics.spriteHeight *
                0.1 *
                cohesionScale;
              steerY +=
                (cohesionY / cohesionCount) *
                targetPullStrength *
                metrics.spriteHeight *
                0.1 *
                cohesionScale;
            }

            if (latticeNeighbors.length > 0 && localHuddleIntent > 0.5) {
              const latticeScale = isCoolingExit
                ? PARAMS.COOLING_EXIT_LATTICE_SCALE
                : 1;
              const sortedLatticeNeighbors = [...latticeNeighbors].sort(
                (left, right) => left.bodyDistance - right.bodyDistance,
              );
              const preferredNeighbors = sortedLatticeNeighbors.slice(
                0,
                PARAMS.LATTICE_NEIGHBOR_COUNT,
              );

              preferredNeighbors.forEach((neighbor) => {
                const preferredDistance = lerp(
                  neighbor.collisionDistance,
                  neighbor.huddleDistance,
                  PARAMS.LATTICE_TARGET_RATIO,
                );
                const distanceRatio =
                  (neighbor.bodyDistance - preferredDistance) /
                  Math.max(preferredDistance, 1e-3);
                const latticeForce =
                  distanceRatio *
                  PARAMS.LATTICE_KEEP_FORCE *
                  (agent.mode === AGENT_MODES.REST_HUDDLE
                    ? isStaticHuddleCandidate
                      ? PARAMS.HUDDLE_STATIC_LATTICE_SCALE
                      : 1
                    : 0.42) *
                  latticeScale;

                steerX +=
                  (neighbor.bodyDx / neighbor.bodyDistance) * latticeForce;
                steerY +=
                  (neighbor.bodyDy / neighbor.bodyDistance) * latticeForce;
              });

              sortedLatticeNeighbors
                .slice(PARAMS.LATTICE_NEIGHBOR_COUNT)
                .forEach((neighbor) => {
                  const repelRatio = clamp(
                    (neighbor.huddleDistance - neighbor.bodyDistance) /
                      Math.max(neighbor.huddleDistance, 1e-3),
                    0,
                    1,
                  );
                  if (repelRatio <= 0) {
                    return;
                  }

                  steerX -=
                    (neighbor.bodyDx / neighbor.bodyDistance) *
                    PARAMS.LATTICE_EXTRA_REPEL_FORCE *
                    repelRatio *
                    latticeScale;
                  steerY -=
                    (neighbor.bodyDy / neighbor.bodyDistance) *
                    PARAMS.LATTICE_EXTRA_REPEL_FORCE *
                    repelRatio *
                    latticeScale;
                });
            }

            if (boundaryRatio > PARAMS.EDGE_AVOIDANCE_START_RATIO) {
              const edgeAvoidanceRatio = clamp(
                (boundaryRatio - PARAMS.EDGE_AVOIDANCE_START_RATIO) /
                  Math.max(1 - PARAMS.EDGE_AVOIDANCE_START_RATIO, 1e-3),
                0,
                1.8,
              );
              const edgeAvoidanceScale = isCoolingExit
                ? 0
                : isActiveFreeWalk
                  ? PARAMS.EDGE_AVOIDANCE_FREE_WALK_SCALE
                  : 1;
              steerX +=
                inward.x *
                PARAMS.EDGE_AVOIDANCE_FORCE *
                edgeAvoidanceRatio *
                edgeAvoidanceScale;
              steerY +=
                inward.y *
                PARAMS.EDGE_AVOIDANCE_FORCE *
                edgeAvoidanceRatio *
                edgeAvoidanceScale;
            }

            const screenMargin =
              metrics.spriteHeight * PARAMS.SCREEN_REENTRY_MARGIN_RATIO;

            if (
              agent.x < 0 ||
              agent.x > size.width ||
              agent.y < 0 ||
              agent.y > size.height
            ) {
              const screenTargetX = clamp(agent.x, 0, size.width);
              const screenTargetY = clamp(agent.y, 0, size.height);
              const reentryDir = normalize2D(
                screenTargetX - agent.x,
                screenTargetY - agent.y,
                { x: 0, y: 1 },
              );
              const reentryTangent = {
                x: -reentryDir.y,
                y: reentryDir.x,
              };
              const preferClockwise =
                agent.x < 0
                  ? agent.y < metrics.centerY
                  : agent.x > size.width
                    ? agent.y >= metrics.centerY
                    : agent.y < 0
                      ? agent.x >= metrics.centerX
                      : agent.x < metrics.centerX;
              const tangentialSign = preferClockwise ? 1 : -1;
              const swirlSign = Math.sign(agent.slotY || 1);
              const reentryDistanceRatio = clamp(
                Math.max(
                  agent.x < 0
                    ? -agent.x / Math.max(screenMargin, 1)
                    : agent.x > size.width
                      ? (agent.x - size.width) / Math.max(screenMargin, 1)
                      : 0,
                  agent.y < 0
                    ? -agent.y / Math.max(screenMargin, 1)
                    : agent.y > size.height
                      ? (agent.y - size.height) / Math.max(screenMargin, 1)
                      : 0,
                ),
                0,
                1.4,
              );

              steerX +=
                reentryDir.x *
                PARAMS.SCREEN_REENTRY_FORCE *
                reentryDistanceRatio;
              steerY +=
                reentryDir.y *
                PARAMS.SCREEN_REENTRY_FORCE *
                reentryDistanceRatio;
              steerX +=
                reentryTangent.x *
                PARAMS.SCREEN_REENTRY_TANGENTIAL_FORCE *
                tangentialSign *
                reentryDistanceRatio;
              steerY +=
                reentryTangent.y *
                PARAMS.SCREEN_REENTRY_TANGENTIAL_FORCE *
                tangentialSign *
                reentryDistanceRatio;
              steerX +=
                tangent.x *
                PARAMS.SCREEN_REENTRY_SWIRL_FORCE *
                swirlSign *
                reentryDistanceRatio;
              steerY +=
                tangent.y *
                PARAMS.SCREEN_REENTRY_SWIRL_FORCE *
                swirlSign *
                reentryDistanceRatio;
            }

            if (behavior.freeMoveStrength > 0.05) {
              steerX +=
                tangent.x *
                behavior.tangentialForce *
                wanderSign *
                behavior.freeMoveStrength;
              steerY +=
                tangent.y *
                behavior.tangentialForce *
                wanderSign *
                behavior.freeMoveStrength;
              if (behavior.phase !== "free_move") {
                steerX -=
                  inward.x *
                  behavior.freeMoveOutwardForce *
                  behavior.freeMoveStrength;
                steerY -=
                  inward.y *
                  behavior.freeMoveOutwardForce *
                  behavior.freeMoveStrength;
              }
            }

            steerX -=
              behavior.windDriftForce *
              (isActiveFreeWalk ? PARAMS.FREE_WALK_WIND_SCALE : 1);
            agent.shelterWait = Math.max(0, (agent.shelterWait ?? 0) - dt);

            if (
              localHuddleIntent > 0.42 &&
              !agent.shelterSeeking &&
              agent.shelterWait <= 0 &&
              normalizedX > PARAMS.SHELTER_TRIGGER_RATIO &&
              Math.abs(normalizedY) < 1.1
            ) {
              agent.shelterSeeking = true;
            }

            if (agent.shelterSeeking) {
              const flankTargetY =
                metrics.centerY +
                Math.sign(agent.y - metrics.centerY || 1) *
                  metrics.radiusY *
                  PARAMS.SHELTER_LATERAL_RATIO;
              const leewardTargetX = metrics.centerX - metrics.radiusX * 0.72;
              const shelterDx = leewardTargetX - agent.x;
              const shelterDy = flankTargetY - agent.y;
              const shelterDir = normalize2D(shelterDx, shelterDy, {
                x: -1,
                y: 0,
              });

              steerX += shelterDir.x * PARAMS.SHELTER_SIDE_PULL;
              steerY += shelterDir.y * PARAMS.SHELTER_SIDE_PULL;

              if (
                normalizedX < PARAMS.SHELTER_RELEASE_RATIO ||
                distanceToCenter < targetRadius * 0.9
              ) {
                agent.shelterSeeking = false;
                agent.shelterWait = randomBetween(
                  PARAMS.SHELTER_WAIT_MIN_SEC,
                  PARAMS.SHELTER_WAIT_MAX_SEC,
                );
              }
            }

            const localDensityRatio = clamp(localDensityCount / 6, 0, 1.4);
            const touchingNeighborRatio = clamp(
              touchingNeighborCount / 5,
              0,
              1.4,
            );
            const contactTightnessRatio = clamp(
              touchPackedness / Math.max(touchingNeighborCount, 1),
              0,
              1,
            );
            const windwardExposure =
              clamp(normalizedX - 0.08, 0, 1.2) *
              clamp(boundaryRatio - 0.72, 0, 1.1);
            const edgeExposure = clamp(boundaryRatio - 0.78, 0, 1.2);
            const contactWarmth =
              touchingNeighborRatio * PARAMS.THERMAL_TOUCH_COUNT_WEIGHT +
              contactTightnessRatio * PARAMS.THERMAL_TOUCH_TIGHTNESS_WEIGHT;
            const exposureCooling =
              edgeExposure * (0.82 + behavior.windStress * 0.36) +
              windwardExposure *
                PARAMS.THERMAL_WIND_EDGE_MULTIPLIER *
                (0.6 + behavior.windStress);
            const heatHistoryTarget = clamp(
              contactWarmth * 0.68 +
                localDensityRatio * 0.24 -
                exposureCooling * 0.58 +
                behavior.radiationRatio * 0.12,
              -1,
              1,
            );
            agent.heatHistory = lerp(
              agent.heatHistory ?? 0,
              heatHistoryTarget,
              clamp(
                dt * PARAMS.THERMAL_HISTORY_BLEND * (agent.thermalInertia ?? 1),
                0,
                1,
              ),
            );
            const retainedHeat = Math.max(agent.heatHistory, 0);
            const latentCooling = Math.max(-agent.heatHistory, 0);
            const radialCoreRatio = clamp(
              1 -
                Math.pow(
                  Math.min(boundaryRatio, 1.08),
                  PARAMS.THERMAL_CORE_CURVE_POWER,
                ),
              0,
              1,
            );
            const lateralInsulationRatio = clamp(
              contactWarmth * 0.52 +
                localDensityRatio * 0.3 +
                radialCoreRatio * 0.18,
              0,
              0.96,
            );
            const exposedTargetTempC = clamp(
              PARAMS.MIN_SKIN_TEMP_C +
                1.2 +
                behavior.radiationRatio * 2.2 -
                behavior.coldStress * 1.4 -
                behavior.windStress * 0.9,
              PARAMS.MIN_SKIN_TEMP_C,
              PARAMS.UPPER_CRITICAL_TEMP_C,
            );
            const coreTargetTempC = clamp(
              lerp(
                PARAMS.UPPER_CRITICAL_TEMP_C + 1.2,
                PARAMS.MAX_INTERNAL_TEMP_C,
                radialCoreRatio,
              ) +
                localDensityRatio * 1.6 +
                contactWarmth * 2.2 +
                retainedHeat * 1.1,
              PARAMS.MIN_SKIN_TEMP_C,
              PARAMS.MAX_INTERNAL_TEMP_C,
            );
            const conductiveTargetTempC = lerp(
              exposedTargetTempC,
              coreTargetTempC,
              lateralInsulationRatio,
            );
            const baselineLossC =
              lerp(
                PARAMS.THERMAL_EXPOSED_BASELINE_LOSS_C,
                PARAMS.THERMAL_BASELINE_LOSS_C,
                lateralInsulationRatio,
              ) +
              latentCooling * 0.24;
            const windCoolingC =
              windwardExposure * PARAMS.THERMAL_WIND_COOLING_C +
              edgeExposure *
                PARAMS.THERMAL_EDGE_COOLING_C *
                (1 - lateralInsulationRatio * 0.4);
            const targetSkinTempC = clamp(
              conductiveTargetTempC -
                baselineLossC -
                windCoolingC +
                behavior.radiationRatio * 0.5,
              PARAMS.MIN_SKIN_TEMP_C,
              PARAMS.MAX_INTERNAL_TEMP_C,
            );
            const thermalRelaxationTau =
              targetSkinTempC >= agent.skinTempC
                ? PARAMS.THERMAL_WARM_TAU_SEC /
                  (0.92 +
                    contactWarmth * 0.32 +
                    localDensityRatio * 0.16 +
                    clamp((targetSkinTempC - agent.skinTempC) / 6, 0, 2.8))
                : PARAMS.THERMAL_COOL_TAU_SEC /
                  (1 + exposureCooling * 0.72 + edgeExposure * 0.28);
            const thermalRelaxationRate = clamp(
              1 - Math.exp(-behaviorDt / Math.max(thermalRelaxationTau, 1)),
              1e-4,
              0.14,
            );
            agent.skinTempC = clamp(
              agent.skinTempC +
                (targetSkinTempC - agent.skinTempC) * thermalRelaxationRate,
              PARAMS.MIN_SKIN_TEMP_C,
              PARAMS.MAX_INTERNAL_TEMP_C,
            );
            const expectedSkinTempC = targetSkinTempC;
            agent.expectedSkinTempC = expectedSkinTempC;
            const temperatureShortfallC = Math.max(
              0,
              expectedSkinTempC - agent.skinTempC,
            );
            agent.temperatureShortfallC = temperatureShortfallC;
            const temperatureExcessC = Math.max(
              0,
              agent.skinTempC - expectedSkinTempC,
            );
            agent.temperatureExcessC = temperatureExcessC;
            agent.thermalState = resolveThermalStateFromSkinTempC(
              agent.skinTempC,
            );
            agent.contactCount = touchingNeighborCount;
            agent.contactTightness = contactTightnessRatio;
            const lightProxy = clamp(
              1 -
                (touchingNeighborRatio * 0.52 +
                  contactTightnessRatio * 0.34 +
                  localDensityRatio * 0.14) +
                edgeExposure * 0.24 +
                windwardExposure * 0.28,
              0,
              1.4,
            );
            agent.lightProxy = lightProxy;
            const updatedColdDrive = clamp(
              (PARAMS.UPPER_CRITICAL_TEMP_C - agent.skinTempC) / 10,
              0,
              1.2,
            );
            const updatedWarmDrive = clamp(
              (agent.skinTempC - PARAMS.UPPER_CRITICAL_TEMP_C) /
                Math.max(
                  PARAMS.MAX_INTERNAL_TEMP_C - PARAMS.UPPER_CRITICAL_TEMP_C,
                  1e-3,
                ),
              0,
              1.2,
            );
            const updatedHuddleIntent = clamp(
              behavior.huddleProbability * 0.7 +
                updatedColdDrive * 0.52 +
                localDensityRatio * 0.12 -
                updatedWarmDrive * 0.84 -
                edgeExposure * 0.08,
              0,
              1,
            );
            const contactDeficit = clamp(0.92 - localDensityRatio, 0, 0.92);
            const exposureNeed = clamp(
              updatedColdDrive * 0.74 + windwardExposure * 0.34,
              0,
              1.2,
            );
            const isFullySurrounded =
              behavior.phase === "huddling" &&
              touchingNeighborCount >= PARAMS.HUDDLE_SURROUND_TOUCH_MIN &&
              contactTightnessRatio >= PARAMS.HUDDLE_MEMBER_MIN_TIGHTNESS &&
              frontOccupied &&
              backOccupied &&
              leftOccupied &&
              rightOccupied;
            agent.isFullySurrounded = isFullySurrounded;
            const hasStableHuddleContact =
              touchingNeighborCount >= PARAMS.HUDDLE_MEMBER_MIN_TOUCHES &&
              touchingNeighborRatio >
                PARAMS.HUDDLE_JAM_TOUCH_THRESHOLD * 1.45 &&
              contactTightnessRatio > PARAMS.HUDDLE_MEMBER_MIN_TIGHTNESS &&
              localDensityRatio > PARAMS.HUDDLE_MEMBER_MIN_DENSITY;
            const huddleModeScore = clamp(
              updatedColdDrive * 0.52 +
                localDensityRatio * 0.28 +
                touchingNeighborRatio * 0.2 -
                updatedWarmDrive * 0.68,
              0,
              1.25,
            );
            agent.huddleModeScore = huddleModeScore;
            const huddleModeEnterReady =
              huddleModeScore >= PARAMS.HUDDLE_MODE_ENTER_SCORE &&
              hasStableHuddleContact;
            const huddleModeStayReady =
              huddleModeScore >= PARAMS.HUDDLE_MODE_EXIT_SCORE &&
              touchingNeighborCount >= PARAMS.HUDDLE_MEMBER_MIN_TOUCHES &&
              touchingNeighborRatio >
                PARAMS.HUDDLE_JAM_TOUCH_THRESHOLD * 1.15 &&
              contactTightnessRatio > PARAMS.HUDDLE_MEMBER_MIN_TIGHTNESS &&
              localDensityRatio > PARAMS.HUDDLE_MEMBER_MIN_DENSITY;
            const huddleLatchReady =
              behavior.phase === "huddling" &&
              touchingNeighborCount >= PARAMS.HUDDLE_LATCH_TOUCH_MIN &&
              contactTightnessRatio >= PARAMS.HUDDLE_LATCH_TIGHTNESS &&
              localDensityRatio >= PARAMS.HUDDLE_MEMBER_MIN_DENSITY * 0.72;
            const compactHuddle =
              isFullySurrounded ||
              huddleModeEnterReady ||
              huddleLatchReady ||
              (agent.mode === AGENT_MODES.REST_HUDDLE && huddleModeStayReady);
            const huddleMember = compactHuddle;
            const baseMode = huddleMember
              ? AGENT_MODES.REST_HUDDLE
              : AGENT_MODES.FREE_WALK;
            agent.baseMode = baseMode;
            agent.huddleMember = huddleMember;
            const isInteriorHuddle = huddleMember && isFullySurrounded;
            const isEdgeHuddle = huddleMember && !isFullySurrounded;
            agent.isEdgeHuddle = isEdgeHuddle;
            const protectedHuddleCore =
              baseMode === AGENT_MODES.REST_HUDDLE &&
              isInteriorHuddle &&
              contactDeficit < PARAMS.HUDDLE_STATIC_LOCK_CONTACT_DEFICIT &&
              edgeExposure < PARAMS.HUDDLE_CORE_EDGE_EXPOSURE_MAX &&
              windwardExposure < PARAMS.SHELTER_ENTRY_WINDWARD_EXPOSURE;
            agent.protectedHuddleCore = protectedHuddleCore;
            const underperformingHuddle =
              baseMode === AGENT_MODES.REST_HUDDLE &&
              temperatureShortfallC > PARAMS.EXPECTED_TEMP_RELOCATE_DELTA_C;
            agent.underperformingHuddle = underperformingHuddle;
            const criticalOverheat =
              agent.skinTempC >= PARAMS.THERMAL_HARD_EXIT_TEMP_C;
            const coolingExitEligible = isEdgeHuddle || criticalOverheat;
            agent.coolingExitEligible = coolingExitEligible;
            const warmthNeedScore =
              temperatureShortfallC +
              updatedColdDrive * 1.4 +
              contactDeficit * 0.55 +
              edgeExposure * 0.8 +
              windwardExposure * 0.7;
            const coolingNeedScore =
              temperatureExcessC +
              updatedWarmDrive * 1.8 +
              Math.max(contactWarmth - 0.78, 0) * 1.2;
            const wantsCooling =
              criticalOverheat ||
              (coolingExitEligible &&
                (coolingNeedScore >= PARAMS.THERMAL_COOLING_EXIT_ENTER_C ||
                  (pulseCollapseActive && coolingNeedScore > 0.95)));
            const wantsWarmth =
              (underperformingHuddle ||
                warmthNeedScore >= PARAMS.THERMAL_WARMTH_SEEK_ENTER_C) &&
              !wantsCooling;
            const windwardColdRelocate =
              isEdgeHuddle &&
              windwardExposure > 0.16 &&
              !wantsCooling &&
              (agent.skinTempC <= PARAMS.MIN_SKIN_TEMP_C + 3.5 ||
                temperatureShortfallC > 0.75 ||
                updatedColdDrive > 0.45);
            if (
              wantsWarmth &&
              !huddleMember &&
              nearestSocialDistance !== null &&
              nearestSocialDistance > agentDesiredSpacing * 1.15 &&
              agent.mode !== AGENT_MODES.COOLING_EXIT
            ) {
              socialSeekDirection = normalize2D(
                nearestSocialX - agent.x,
                nearestSocialY - agent.y,
                inward,
              );
              const socialSeekRatio = clamp(
                nearestSocialDistance /
                  Math.max(metrics.spriteHeight * 5.5, 1),
                0.28,
                1.25,
              );
              socialSeekStrength =
                PARAMS.SOCIAL_SEEK_FORCE *
                socialSeekRatio *
                (0.42 + exposureNeed * 0.72);
            }
            const shouldRelocate =
              !protectedHuddleCore &&
              isEdgeHuddle &&
              (wantsWarmth || windwardColdRelocate);
            const looseRestHuddle =
              agent.mode === AGENT_MODES.REST_HUDDLE &&
              !isFullySurrounded &&
              (touchingNeighborCount < PARAMS.HUDDLE_MEMBER_MIN_TOUCHES ||
                contactTightnessRatio < PARAMS.HUDDLE_MEMBER_MIN_TIGHTNESS);
            if (agent.mode === AGENT_MODES.FREE_WALK) {
              const freeWalkActivityRatio = clamp(
                ((agent.skinTempC ?? PARAMS.UPPER_CRITICAL_TEMP_C) -
                  PARAMS.FREE_WALK_TRIGGER_STEP_MIN_HEAT_C) /
                  10,
                0,
                1.15,
              );
              const warmthSeekingFreeWalkRatio = clamp(
                (updatedHuddleIntent - 0.48) / 0.38,
                0,
                1,
              );
              const randomWalkScale = lerp(1, 0.26, warmthSeekingFreeWalkRatio);
              const randomRoamAngle =
                agent.roamPhase +
                simTime * (0.45 + agent.roamRadiusJitter * 0.25);
              const randomRoamDir = {
                x:
                  behavior.phase === "free_move"
                    ? freeWalkRandomDir.x
                    : Math.cos(randomRoamAngle),
                y:
                  behavior.phase === "free_move"
                    ? freeWalkRandomDir.y
                    : Math.sin(
                        randomRoamAngle * 0.92 + agent.waddleOffset * 0.35,
                      ),
              };

              steerX +=
                randomRoamDir.x *
                (behavior.phase === "free_move"
                  ? PARAMS.FREE_WALK_ROAM_JITTER_FORCE
                  : PARAMS.FREE_WALK_WANDER_FORCE) *
                randomWalkScale *
                (0.42 + freeWalkActivityRatio * 0.78);
              steerY +=
                randomRoamDir.y *
                (behavior.phase === "free_move"
                  ? PARAMS.FREE_WALK_ROAM_JITTER_FORCE
                  : PARAMS.FREE_WALK_WANDER_FORCE) *
                randomWalkScale *
                (0.42 + freeWalkActivityRatio * 0.78);
              steerX +=
                tangent.x *
                wanderSign *
                PARAMS.FREE_WALK_TANGENTIAL_WANDER_FORCE *
                randomWalkScale *
                (0.3 + freeWalkActivityRatio * 0.55);
              steerY +=
                tangent.y *
                wanderSign *
                PARAMS.FREE_WALK_TANGENTIAL_WANDER_FORCE *
                randomWalkScale *
                (0.3 + freeWalkActivityRatio * 0.55);

              agent.nextFreeStepTime = Math.max(
                0,
                (agent.nextFreeStepTime ?? 0) - behaviorDt,
              );
              if (
                agent.nextFreeStepTime <= 0 &&
                agent.stepCooldown <= 0 &&
                (behavior.phase === "free_move" ||
                  updatedHuddleIntent < 0.58 ||
                  socialSeekDirection)
              ) {
                agent.stepRemaining = Math.max(
                  agent.stepRemaining,
                  freeStepDistancePx *
                    (behavior.phase === "free_move"
                      ? PARAMS.FREE_WALK_TRIGGER_STEP_SCALE * 1.22
                      : PARAMS.FREE_WALK_TRIGGER_STEP_SCALE *
                        lerp(0.82, 1.18, warmthSeekingFreeWalkRatio)) *
                    randomBetween(0.8, 1.18),
                );
                agent.stepCooldown = PARAMS.STEP_COOLDOWN_SEC * 0.7;
                agent.nextFreeStepTime = randomBetween(
                  PARAMS.FREE_WALK_TRIGGER_STEP_INTERVAL_MIN_SEC,
                  PARAMS.FREE_WALK_TRIGGER_STEP_INTERVAL_MAX_SEC,
                );
              }

              if (
                (behavior.phase === "free_move" ||
                  updatedHuddleIntent < 0.54) &&
                agent.stepRemaining <
                  freeStepDistancePx * PARAMS.FREE_WALK_MIN_CRUISE_STEP_RATIO &&
                Math.hypot(agent.vx, agent.vy) < PARAMS.FREE_WALK_STALL_SPEED_PX
              ) {
                agent.stepRemaining = Math.max(
                  agent.stepRemaining,
                  freeStepDistancePx *
                    lerp(
                      PARAMS.FREE_WALK_MIN_CRUISE_STEP_RATIO,
                      0.82,
                      freeWalkActivityRatio,
                    ),
                );
                agent.stepCooldown = Math.max(
                  agent.stepCooldown,
                  PARAMS.STEP_COOLDOWN_SEC * 0.28,
                );
              }

              if (
                updatedWarmDrive > 0.18 &&
                agent.stepCooldown <= 0 &&
                agent.stepRemaining < freeStepDistancePx * 0.08
              ) {
                const thermalRelocationRatio = clamp(
                  updatedWarmDrive * 0.9 + contactDeficit * 0.24,
                  0,
                  1.15,
                );
                agent.stepRemaining = Math.max(
                  agent.stepRemaining,
                  freeStepDistancePx * (0.82 + thermalRelocationRatio * 0.46),
                );
                agent.stepCooldown = PARAMS.STEP_COOLDOWN_SEC * 0.32;
                steerX +=
                  tangent.x * wanderSign * PARAMS.LIQUID_TANGENTIAL_FORCE * 0.9;
                steerY +=
                  tangent.y * wanderSign * PARAMS.LIQUID_TANGENTIAL_FORCE * 0.9;
              }
            }
            if (agent.mode === AGENT_MODES.SEEK_HUDDLE) {
              const seekDirection = socialSeekDirection || inward;
              steerX +=
                seekDirection.x *
                PARAMS.SOCIAL_SEEK_FORCE *
                (0.38 + updatedColdDrive * 0.34 + contactDeficit * 0.28);
              steerY +=
                seekDirection.y *
                PARAMS.SOCIAL_SEEK_FORCE *
                (0.38 + updatedColdDrive * 0.34 + contactDeficit * 0.28);
            }
            if (behavior.vortexCount > 0 && updatedHuddleIntent > 0.54) {
              const ellipseAngle = Math.atan2(
                agent.y - metrics.centerY,
                agent.x - metrics.centerX,
              );
              const ringX =
                (agent.x - metrics.centerX) /
                Math.max(metrics.radiusX * PARAMS.VORTEX_RING_RATIO_X, 1);
              const ringY =
                (agent.y - metrics.centerY) /
                Math.max(metrics.radiusY * PARAMS.VORTEX_RING_RATIO_Y, 1);
              const ringRadius = Math.hypot(ringX, ringY);
              const vortexPhase = Math.sin(ellipseAngle * behavior.vortexCount);
              const vortexStrength =
                clamp(
                  localDensityRatio * 0.5 + updatedWarmDrive * 0.65,
                  0,
                  1.35,
                ) * clamp(1.25 - Math.abs(ringRadius - 1), 0, 1);

              steerX +=
                tangent.x *
                vortexPhase *
                PARAMS.VORTEX_SWIRL_FORCE *
                vortexStrength;
              steerY +=
                tangent.y *
                vortexPhase *
                PARAMS.VORTEX_SWIRL_FORCE *
                vortexStrength;
            }
            let nextMode = agent.mode;

            if (
              agent.mode === AGENT_MODES.WAVE_STEP &&
              agent.stepRemaining > stepDistancePx * 0.08
            ) {
              nextMode = AGENT_MODES.WAVE_STEP;
            } else if (criticalOverheat) {
              nextMode = AGENT_MODES.COOLING_EXIT;
            } else if (
              huddleLatchReady &&
              !wantsCooling &&
              !windwardColdRelocate
            ) {
              nextMode = AGENT_MODES.REST_HUDDLE;
            } else if (isInteriorHuddle) {
              nextMode = AGENT_MODES.REST_HUDDLE;
            } else if (isEdgeHuddle) {
              if (wantsCooling && (!protectedHuddleCore || criticalOverheat)) {
                nextMode = AGENT_MODES.COOLING_EXIT;
              } else if (
                wantsWarmth ||
                windwardColdRelocate ||
                agent.shelterSeeking
              ) {
                nextMode = AGENT_MODES.BOUNDARY_WALK;
              } else {
                nextMode = AGENT_MODES.REST_HUDDLE;
              }
            } else if (wantsWarmth || agent.shelterSeeking) {
              nextMode = AGENT_MODES.SEEK_HUDDLE;
            } else {
              nextMode = AGENT_MODES.FREE_WALK;
            }

            if (!huddleMember && nextMode === AGENT_MODES.REST_HUDDLE) {
              nextMode = wantsWarmth
                ? AGENT_MODES.SEEK_HUDDLE
                : AGENT_MODES.FREE_WALK;
            }

            if (
              looseRestHuddle &&
              !huddleLatchReady &&
              nextMode === AGENT_MODES.REST_HUDDLE
            ) {
              nextMode = wantsWarmth
                ? AGENT_MODES.SEEK_HUDDLE
                : AGENT_MODES.FREE_WALK;
            }

            if (nextMode !== agent.mode) {
              if (nextMode === AGENT_MODES.BOUNDARY_WALK) {
                agent.boundarySide = Math.sign(
                  agent.y - metrics.centerY || agent.slotY || 1,
                );
                agent.shelterWait = randomBetween(
                  PARAMS.SHELTER_WAIT_MIN_SEC,
                  PARAMS.SHELTER_WAIT_MAX_SEC,
                );
              }
              agent.mode = nextMode;
              agent.modeTimer = 0;
              if (nextMode === AGENT_MODES.REST_HUDDLE) {
                lockPenguinFacing(
                  agent,
                  resolveRestFacingDirection(agent, huddleFacingDirection),
                );
              } else if (nextMode !== AGENT_MODES.WAVE_STEP) {
                agent.lockedSpriteRender = null;
              }
            } else {
              agent.modeTimer += dt;
            }

            const motionDirection = normalize2D(
              steerX,
              steerY,
              freeWalkRandomDir,
            );
            let nearestMotionAheadDistance = null;

            agentsRef.current.forEach((otherAgent, otherIndex) => {
              if (agentIndex === otherIndex) {
                return;
              }

              const otherBodyCircle = resolveBodyCircleFromMetrics(
                otherAgent,
                metrics,
                behavior,
                frameAspect,
                otherAgent.x,
                otherAgent.y,
              );
              const bodyDx = otherBodyCircle.x - agentBodyCircle.x;
              const bodyDy = otherBodyCircle.y - agentBodyCircle.y;
              const forwardDistance =
                bodyDx * motionDirection.x + bodyDy * motionDirection.y;
              const lateralDistance = Math.abs(
                bodyDx * -motionDirection.y + bodyDy * motionDirection.x,
              );

              if (
                forwardDistance <= 0 ||
                forwardDistance > agentDesiredSpacing * 2.1 ||
                lateralDistance >
                  agentBodyCircle.radius + otherBodyCircle.radius
              ) {
                return;
              }

              if (
                nearestMotionAheadDistance === null ||
                forwardDistance < nearestMotionAheadDistance
              ) {
                nearestMotionAheadDistance = forwardDistance;
              }
            });

            const hasForwardPenguin =
              updatedHuddleIntent > 0.28 &&
              nearestMotionAheadDistance !== null &&
              nearestMotionAheadDistance < agentDesiredSpacing * 1.65;
            if (agent.mode === AGENT_MODES.REST_HUDDLE) {
              steerX *= PARAMS.REST_STEER_SCALE;
              steerY *= PARAMS.REST_STEER_SCALE;
            }

            if (socialSeekDirection && agent.mode !== AGENT_MODES.REST_HUDDLE) {
              steerX += socialSeekDirection.x * socialSeekStrength;
              steerY += socialSeekDirection.y * socialSeekStrength;
            }

            if (agent.mode === AGENT_MODES.BOUNDARY_WALK) {
              const sideSign =
                agent.boundarySide || Math.sign(agent.y - metrics.centerY || 1);
              const ringTargetX = metrics.centerX + metrics.radiusX * 0.92;
              const ringTargetY =
                metrics.centerY +
                sideSign * metrics.radiusY * PARAMS.BOUNDARY_WALK_RING_RATIO;
              const ringDir = normalize2D(
                ringTargetX - agent.x,
                ringTargetY - agent.y,
                tangent,
              );
              const flankDirection = normalize2D(
                -inward.y * sideSign,
                inward.x * sideSign,
                tangent,
              );
              const leewardTargetX = metrics.centerX - metrics.radiusX * 0.74;
              const leewardDx = leewardTargetX - agent.x;
              const leewardBias = clamp(
                (-leewardDx + metrics.radiusX * 0.24) /
                  Math.max(metrics.radiusX, 1),
                0,
                1,
              );
              const socialRingSuppress =
                socialSeekDirection && wantsWarmth
                  ? PARAMS.SOCIAL_SEEK_RING_SUPPRESS
                  : 0;

              steerX +=
                ringDir.x *
                PARAMS.SHELTER_SIDE_PULL *
                0.44 *
                (1 - socialRingSuppress);
              steerY +=
                ringDir.y *
                PARAMS.SHELTER_SIDE_PULL *
                0.44 *
                (1 - socialRingSuppress);
              steerX +=
                flankDirection.x *
                PARAMS.SHELTER_SIDE_PULL *
                0.6 *
                (1 - socialRingSuppress * 0.75);
              steerY +=
                flankDirection.y *
                PARAMS.SHELTER_SIDE_PULL *
                0.6 *
                (1 - socialRingSuppress * 0.75);
              steerX -= behavior.windDriftForce * 0.28;
              steerX += inward.x * boundaryPullStrength * 0.12;
              steerY += inward.y * boundaryPullStrength * 0.12;

              if (
                normalizedX < PARAMS.BOUNDARY_WALK_REJOIN_RATIO ||
                updatedHuddleIntent > 0.64 ||
                (leewardBias > 0.58 && edgeExposure < 0.16)
              ) {
                if (huddleMember) {
                  if (isInteriorHuddle) {
                    agent.mode = AGENT_MODES.REST_HUDDLE;
                  } else if (wantsCooling && coolingExitEligible) {
                    agent.mode = AGENT_MODES.COOLING_EXIT;
                  } else if (wantsWarmth || windwardColdRelocate) {
                    agent.mode = AGENT_MODES.BOUNDARY_WALK;
                  } else {
                    agent.mode = AGENT_MODES.REST_HUDDLE;
                  }
                } else {
                  agent.mode = wantsWarmth
                    ? AGENT_MODES.SEEK_HUDDLE
                    : AGENT_MODES.FREE_WALK;
                }
                agent.modeTimer = 0;
                agent.shelterSeeking = false;
                agent.shelterWait = Math.max(
                  agent.shelterWait ?? 0,
                  randomBetween(
                    PARAMS.SHELTER_WAIT_MIN_SEC,
                    PARAMS.SHELTER_WAIT_MAX_SEC,
                  ) * 0.55,
                );
              }
            }

            if (agent.mode === AGENT_MODES.COOLING_EXIT) {
              const thermalExitRatio = clamp(
                (agent.skinTempC - PARAMS.MAX_INTERNAL_TEMP_C + 1.5) / 2.2,
                0,
                1.35,
              );
              steerX -=
                inward.x *
                PARAMS.THERMAL_CONVECTION_OUTWARD_FORCE *
                PARAMS.COOLING_EXIT_OUTWARD_FORCE_SCALE;
              steerY -=
                inward.y *
                PARAMS.THERMAL_CONVECTION_OUTWARD_FORCE *
                PARAMS.COOLING_EXIT_OUTWARD_FORCE_SCALE;
              steerX +=
                tangent.x *
                wanderSign *
                PARAMS.LIQUID_TANGENTIAL_FORCE *
                PARAMS.COOLING_EXIT_TANGENTIAL_FORCE_SCALE;
              steerY +=
                tangent.y *
                wanderSign *
                PARAMS.LIQUID_TANGENTIAL_FORCE *
                PARAMS.COOLING_EXIT_TANGENTIAL_FORCE_SCALE;
              steerX -= behavior.windDriftForce * 0.22;
              if (agent.stepCooldown <= 0) {
                agent.stepRemaining = Math.max(
                  agent.stepRemaining,
                  freeStepDistancePx *
                    PARAMS.COOLING_EXIT_STEP_SCALE *
                    (0.78 + thermalExitRatio * 0.52 + contactDeficit * 0.18),
                );
                agent.stepCooldown = PARAMS.COOLING_EXIT_STEP_COOLDOWN_SEC;
              }
            }

            if (
              localDensityCount > 0 &&
              contactDeficit > 0.02 &&
              updatedHuddleIntent > 0.28 &&
              agent.mode !== AGENT_MODES.COOLING_EXIT &&
              !(
                agent.mode === AGENT_MODES.FREE_WALK &&
                updatedHuddleIntent < 0.62
              )
            ) {
              const localCenterX =
                closeNeighborCenterX / Math.max(localDensityCount, 1);
              const localCenterY =
                closeNeighborCenterY / Math.max(localDensityCount, 1);
              const localContactDir = normalize2D(
                localCenterX - agent.x,
                localCenterY - agent.y,
                inward,
              );
              const contactSeekForce =
                PARAMS.CONTACT_SEEK_FORCE *
                contactDeficit *
                (0.45 + exposureNeed * 0.85);
              steerX += localContactDir.x * contactSeekForce;
              steerY += localContactDir.y * contactSeekForce;
            }

            const flankSign = Math.sign(
              agent.y - metrics.centerY || agent.slotY || 1,
            );
            const breakupActive =
              !protectedHuddleCore &&
              updatedWarmDrive > behavior.thermalBreakupThreshold &&
              localDensityRatio > 0.72 &&
              boundaryRatio < 0.92;

            if (breakupActive) {
              const breakupRatio = clamp(
                (updatedWarmDrive - behavior.thermalBreakupThreshold) / 0.42,
                0,
                1.1,
              );
              steerY +=
                flankSign * PARAMS.THERMAL_BREAKUP_LATERAL_FORCE * breakupRatio;
              agent.compression = Math.max(
                0,
                agent.compression - dt * 2.8 * breakupRatio,
              );
              agent.stepRemaining = Math.max(
                0,
                agent.stepRemaining - stepDistancePx * 0.45 * dt,
              );
            } else if (
              agent.thermalState > 0.28 &&
              boundaryRatio < 0.84 &&
              !protectedHuddleCore
            ) {
              agent.compression = Math.max(0, agent.compression - dt * 0.8);
            }

            agent.waveCooldown = Math.max(0, (agent.waveCooldown ?? 0) - dt);
            const waveTriggerThresholdPx = Math.max(
              reactionThresholdPx * PARAMS.WAVE_GAP_TRIGGER_SCALE,
              stepDistancePx * PARAMS.WAVE_GAP_MIN_STEP_RATIO,
            );
            const waveFollowDistancePx = agentDesiredSpacing * 0.82;
            const waveGapActive =
              nearestAheadDistance !== null &&
              nearestAheadDistance > waveTriggerThresholdPx &&
              nearestAheadDistance <
                agentDesiredSpacing * PARAMS.WAVE_GAP_MAX_SPACING_RATIO;
            const adjacentWaveStep =
              nearestAheadWaveDistance !== null &&
              nearestAheadWaveDistance < waveFollowDistancePx;
            const interiorNeedsWarmth =
              isInteriorHuddle &&
              (underperformingHuddle ||
                updatedColdDrive > updatedWarmDrive + 0.08);
            const shouldWaveStep =
              isInteriorHuddle &&
              interiorNeedsWarmth &&
              (waveGapActive || adjacentWaveStep);

            if (isInteriorHuddle && (waveGapActive || adjacentWaveStep)) {
              const gapAmount =
                (nearestAheadDistance ??
                  nearestAheadWaveDistance ??
                  waveTriggerThresholdPx) - waveTriggerThresholdPx;
              const gapRatio = clamp(
                adjacentWaveStep && !waveGapActive
                  ? 0.28 + Math.min(0.5, updatedColdDrive * 0.3)
                  : gapAmount / Math.max(waveTriggerThresholdPx, 1),
                0,
                3,
              );
              agent.compression = clamp(
                agent.compression + gapRatio * dt * 2.4,
                0,
                1.4,
              );
              agent.waveDelay = Math.max(0, agent.waveDelay - dt);
              if (
                shouldWaveStep &&
                agent.stepCooldown <= 0 &&
                agent.waveDelay <= 0 &&
                agent.waveCooldown <= 0 &&
                (waveGapActive
                  ? gapRatio >= PARAMS.WAVE_GAP_RATIO_THRESHOLD
                  : adjacentWaveStep)
              ) {
                agent.mode = AGENT_MODES.WAVE_STEP;
                agent.modeTimer = 0;
                agent.waveFacingDirection =
                  agent.lockedFacingDirection || huddleFacingDirection;
                lockPenguinFacing(agent, agent.waveFacingDirection);
                agent.stepRemaining = Math.max(
                  agent.stepRemaining,
                  stepDistancePx *
                    (adjacentWaveStep && !waveGapActive
                      ? 0.74
                      : Math.min(1.05, 0.62 + gapRatio * 0.18)),
                );
                agent.stepCooldown = PARAMS.STEP_COOLDOWN_SEC;
                agent.waveCooldown = randomBetween(
                  PARAMS.WAVE_INTERVAL_MIN_SEC,
                  PARAMS.WAVE_INTERVAL_MAX_SEC,
                );
                agent.waveDelay = randomBetween(
                  PARAMS.WAVE_REACTION_DELAY_MIN,
                  PARAMS.WAVE_REACTION_DELAY_MAX,
                );
              }
            } else {
              agent.compression = Math.max(0, agent.compression - dt * 2.1);
              agent.waveDelay = Math.max(0, agent.waveDelay - dt);
            }

            const shouldStaticLock =
              behavior.phase === "huddling" &&
              (agent.mode === AGENT_MODES.REST_HUDDLE || isFullySurrounded) &&
              !wantsCooling &&
              !criticalOverheat &&
              !breakupActive &&
              !waveGapActive &&
              !adjacentWaveStep &&
              touchingNeighborCount >= PARAMS.HUDDLE_MEMBER_MIN_TOUCHES &&
              contactTightnessRatio >= PARAMS.HUDDLE_MEMBER_MIN_TIGHTNESS &&
              (isFullySurrounded ||
                (!shouldRelocate &&
                  !windwardColdRelocate &&
                  updatedWarmDrive < PARAMS.HUDDLE_RELEASE_WARM_THRESHOLD &&
                  contactDeficit <
                    PARAMS.HUDDLE_STATIC_LOCK_CONTACT_DEFICIT)) &&
              agent.stepRemaining <
                stepDistancePx * PARAMS.HUDDLE_REST_LOCK_STEP_RATIO;

            if (shouldStaticLock) {
              agent.stepRemaining = 0;
              agent.compression = Math.max(agent.compression - dt * 3.2, 0);

              return {
                x: agent.x,
                y: agent.y,
                maxMotionSpeed: 0,
                gaitStepDistance: stepDistancePx,
                staticLocked: true,
                facingDirection:
                  agent.lockedFacingDirection || huddleFacingDirection,
                lockFacing: true,
              };
            }

            agent.contactSeekCooldown = Math.max(
              0,
              agent.contactSeekCooldown - dt,
            );
            if (
              (agent.mode !== AGENT_MODES.REST_HUDDLE ||
                (isEdgeHuddle && wantsWarmth) ||
                windwardColdRelocate ||
                interiorNeedsWarmth) &&
              agent.mode !== AGENT_MODES.WAVE_STEP &&
              agent.mode !== AGENT_MODES.COOLING_EXIT &&
              updatedHuddleIntent > 0.44 &&
              contactDeficit > 0.12 &&
              exposureNeed > 0.18 &&
              agent.contactSeekCooldown <= 0
            ) {
              agent.stepRemaining = Math.max(
                agent.stepRemaining,
                relocationStepDistancePx *
                  PARAMS.CONTACT_SEEK_STEP_SCALE *
                  (0.72 + contactDeficit * 0.52),
              );
              agent.contactSeekCooldown = PARAMS.CONTACT_SEEK_COOLDOWN_SEC;
            }

            const shouldSeekHuddleByWalking =
              behavior.phase === "huddling" &&
              (agent.mode === AGENT_MODES.BOUNDARY_WALK ||
                agent.mode === AGENT_MODES.SEEK_HUDDLE ||
                (agent.mode === AGENT_MODES.FREE_WALK &&
                  updatedHuddleIntent > 0.58)) &&
              wantsWarmth &&
              !wantsCooling &&
              agent.stepRemaining < stepDistancePx * 0.12;

            if (shouldSeekHuddleByWalking && agent.stepCooldown <= 0) {
              agent.stepRemaining = Math.max(
                agent.stepRemaining,
                stepDistancePx *
                  PARAMS.HUDDLE_SEEK_STEP_SCALE *
                  (0.82 + contactDeficit * 0.42 + updatedColdDrive * 0.22),
              );
              agent.stepCooldown = PARAMS.HUDDLE_SEEK_COOLDOWN_SEC;
            }

            const rawMotionDirection = normalize2D(
              steerX,
              steerY,
              motionDirection,
            );
            const previousSteerDirection = normalize2D(
              agent.steerDirection?.x ?? rawMotionDirection.x,
              agent.steerDirection?.y ?? rawMotionDirection.y,
              rawMotionDirection,
            );
            const steerTurnRate = isActiveFreeWalk
              ? PARAMS.STEER_DIRECTION_FREE_WALK_TURN_RATE
              : PARAMS.STEER_DIRECTION_TURN_RATE;
            const finalMotionDirection = rotateDirectionToward(
              previousSteerDirection,
              rawMotionDirection,
              steerTurnRate * dt,
            );
            agent.steerDirection = finalMotionDirection;

            const activeStepDistance =
              agent.mode === AGENT_MODES.WAVE_STEP
                ? stepDistancePx
                : agent.mode === AGENT_MODES.BOUNDARY_WALK
                  ? relocationStepDistancePx
                  : agent.mode === AGENT_MODES.SEEK_HUDDLE
                    ? relocationStepDistancePx
                  : agent.mode === AGENT_MODES.COOLING_EXIT ||
                      agent.mode === AGENT_MODES.FREE_WALK
                    ? freeStepDistancePx
                    : hasForwardPenguin
                      ? stepDistancePx
                      : freeStepDistancePx;
            const activeStepSpeed =
              agent.mode === AGENT_MODES.WAVE_STEP
                ? waveStepSpeed
                : agent.mode === AGENT_MODES.BOUNDARY_WALK
                  ? relocationStepSpeed
                  : agent.mode === AGENT_MODES.SEEK_HUDDLE
                    ? relocationStepSpeed
                  : agent.mode === AGENT_MODES.COOLING_EXIT ||
                      agent.mode === AGENT_MODES.FREE_WALK
                    ? agent.mode === AGENT_MODES.COOLING_EXIT
                      ? coolingExitSpeed
                      : freeStepSpeed
                    : stepSpeed * 0.4;
            const stepDirection =
              agent.mode === AGENT_MODES.WAVE_STEP
                ? agent.waveFacingDirection ||
                  agent.lockedFacingDirection ||
                  huddleFacingDirection
                : agent.mode === AGENT_MODES.REST_HUDDLE
                  ? agent.lockedFacingDirection || huddleFacingDirection
                : finalMotionDirection;
            const restMotionLocked =
              agent.mode === AGENT_MODES.REST_HUDDLE &&
              !shouldRelocate &&
              !wantsCooling &&
              !criticalOverheat &&
              !breakupActive &&
              !interiorNeedsWarmth &&
              !windwardColdRelocate;

            agent.stepCooldown = Math.max(0, agent.stepCooldown - dt);
            const stepAdvance = restMotionLocked
              ? 0
              : Math.min(agent.stepRemaining, activeStepSpeed * dt);
            agent.stepRemaining = Math.max(
              0,
              agent.stepRemaining - stepAdvance,
            );
            if (
              agent.mode === AGENT_MODES.WAVE_STEP &&
              agent.stepRemaining <= stepDistancePx * 0.05
            ) {
              agent.mode = huddleMember
                ? AGENT_MODES.REST_HUDDLE
                : wantsWarmth
                  ? AGENT_MODES.SEEK_HUDDLE
                  : AGENT_MODES.FREE_WALK;
                agent.modeTimer = 0;
            }
            const huddleStepImpulse =
              agent.mode === AGENT_MODES.WAVE_STEP
                ? stepAdvance + activeStepDistance * agent.compression * 0.08
                : 0;
            const huddleCruiseBrake =
              behavior.phase === "huddling"
                ? clamp(
                    (distanceToCenter - targetRadius * 0.72) /
                      Math.max(targetRadius * 0.42, 1),
                    0,
                    1,
                  )
                : 1;
            const freeWalkCruiseRatio =
              agent.mode === AGENT_MODES.FREE_WALK
                ? clamp(
                    behavior.freeMoveStrength -
                      Math.max(updatedHuddleIntent - 0.44, 0) * 1.65,
                    socialSeekDirection
                      ? 0.24
                      : behavior.phase === "free_move"
                        ? PARAMS.FREE_WALK_MIN_CONTINUOUS_RATIO
                        : 0,
                    1,
                  ) * huddleCruiseBrake
                : 0;
            const boundaryCruiseRatio =
              agent.mode === AGENT_MODES.BOUNDARY_WALK
                ? clamp(
                    0.36 +
                      Number(Boolean(socialSeekDirection)) * 0.28 +
                      contactDeficit * 0.16,
                    0,
                    1,
                  ) * huddleCruiseBrake
                : 0;
            const freeWalkCruiseAdvance =
              freeWalkCruiseRatio > 0
                ? freeWalkCruiseSpeed *
                  dt *
                  clamp(
                    0.72 +
                      contactDeficit * 0.46 -
                      localDensityRatio * 0.18 -
                      Math.max(updatedHuddleIntent - 0.48, 0) * 0.42,
                    0.26,
                    1.08,
                  ) *
                  freeWalkCruiseRatio
                : 0;
            const boundaryCruiseAdvance =
              boundaryCruiseRatio > 0
                ? relocationStepSpeed * dt * boundaryCruiseRatio
                : 0;
            const seekCruiseRatio =
              agent.mode === AGENT_MODES.SEEK_HUDDLE && !huddleLatchReady
                ? clamp(
                    (distanceToCenter - targetRadius * 0.54) /
                      Math.max(targetRadius * 0.46, 1),
                    0,
                    1,
                  )
                : 0;
            const seekCruiseAdvance =
              seekCruiseRatio > 0
                ? relocationStepSpeed * dt * seekCruiseRatio
                : 0;
            const coolingCruiseAdvance =
              agent.mode === AGENT_MODES.COOLING_EXIT
                ? coolingExitSpeed * dt * 0.82
                : 0;
            const continuousWalkAdvance =
              freeWalkCruiseAdvance +
              seekCruiseAdvance +
              boundaryCruiseAdvance +
              coolingCruiseAdvance;
            const gaitSpeedPx =
              agent.mode === AGENT_MODES.WAVE_STEP && stepAdvance > 0
                ? activeStepSpeed
                : agent.mode === AGENT_MODES.FREE_WALK &&
                    freeWalkCruiseRatio > 0
                  ? freeWalkCruiseSpeed * freeWalkCruiseRatio
                  : agent.mode === AGENT_MODES.SEEK_HUDDLE &&
                      seekCruiseRatio > 0
                    ? relocationStepSpeed * seekCruiseRatio
                    : agent.mode === AGENT_MODES.BOUNDARY_WALK &&
                        boundaryCruiseRatio > 0
                      ? relocationStepSpeed * boundaryCruiseRatio
                      : agent.mode === AGENT_MODES.COOLING_EXIT
                        ? coolingExitSpeed
                        : 0;
            const nominalGaitSpeedPx =
              agent.mode === AGENT_MODES.WAVE_STEP
                ? activeStepSpeed
                : agent.mode === AGENT_MODES.FREE_WALK
                  ? freeWalkCruiseSpeed
                  : agent.mode === AGENT_MODES.SEEK_HUDDLE ||
                      agent.mode === AGENT_MODES.BOUNDARY_WALK
                    ? relocationStepSpeed
                    : agent.mode === AGENT_MODES.COOLING_EXIT
                      ? coolingExitSpeed
                      : 0;

            return {
              x: restMotionLocked
                ? agent.x
                : agent.x +
                  (agent.vx + steerX * dt) * dt +
                  stepDirection.x * huddleStepImpulse +
                  finalMotionDirection.x * continuousWalkAdvance,
              y: restMotionLocked
                ? agent.y
                : agent.y +
                  (agent.vy + steerY * dt) * dt +
                  stepDirection.y * huddleStepImpulse +
                  finalMotionDirection.y * continuousWalkAdvance,
              maxMotionSpeed:
                restMotionLocked
                  ? 0
                  : agent.mode === AGENT_MODES.FREE_WALK
                  ? Math.max(
                      activeStepSpeed,
                      freeWalkCruiseSpeed * Math.max(freeWalkCruiseRatio, 0.2),
                    )
                  : agent.mode === AGENT_MODES.BOUNDARY_WALK
                    ? Math.max(activeStepSpeed, relocationStepSpeed * 0.5)
                    : agent.mode === AGENT_MODES.SEEK_HUDDLE
                      ? Math.max(activeStepSpeed, relocationStepSpeed * 0.5)
                    : activeStepSpeed,
              gaitStepDistance: activeStepDistance,
              gaitSpeedPx: restMotionLocked ? 0 : gaitSpeedPx,
              nominalGaitSpeedPx: restMotionLocked ? 0 : nominalGaitSpeedPx,
              staticLocked: restMotionLocked,
              facingDirection:
                agent.mode === AGENT_MODES.REST_HUDDLE
                  ? agent.lockedFacingDirection || huddleFacingDirection
                  : agent.mode === AGENT_MODES.WAVE_STEP
                    ? agent.waveFacingDirection ||
                      agent.lockedFacingDirection ||
                      huddleFacingDirection
                    : agent.mode === AGENT_MODES.COOLING_EXIT
                      ? normalize2D(agent.x - metrics.centerX, agent.y - metrics.centerY, finalMotionDirection)
                      : finalMotionDirection,
              lockFacing:
                agent.mode === AGENT_MODES.REST_HUDDLE ||
                agent.mode === AGENT_MODES.WAVE_STEP,
            };
          },
        );

        const separationOffsets = provisionalTargets.map(() => ({
          x: 0,
          y: 0,
        }));
        const separationOffsetCounts = provisionalTargets.map(() => 0);

        for (let left = 0; left < provisionalTargets.length; left += 1) {
          for (
            let right = left + 1;
            right < provisionalTargets.length;
            right += 1
          ) {
            const leftCircle = resolveBodyCircle(
              agentsRef.current[left],
              behavior,
              provisionalTargets[left].x,
              provisionalTargets[left].y,
            );
            const rightCircle = resolveBodyCircle(
              agentsRef.current[right],
              behavior,
              provisionalTargets[right].x,
              provisionalTargets[right].y,
            );
            const dx = rightCircle.x - leftCircle.x;
            const dy = rightCircle.y - leftCircle.y;
            const distance = Math.hypot(dx, dy) || 1;
            const minDistance =
              (leftCircle.radius + rightCircle.radius) *
              lerp(
                1.02 + PARAMS.HUDDLE_PROXIMITY_SOFTNESS,
                1.0,
                behavior.densityRatio * 0.8,
              );

            if (distance >= minDistance) {
              continue;
            }

            const leftAgent = agentsRef.current[left];
            const rightAgent = agentsRef.current[right];
            const leftIsStaticHuddle =
              behavior.phase === "huddling" &&
              leftAgent.mode === AGENT_MODES.REST_HUDDLE &&
              leftAgent.stepRemaining <
                stepDistancePx * PARAMS.HUDDLE_REST_LOCK_STEP_RATIO;
            const rightIsStaticHuddle =
              behavior.phase === "huddling" &&
              rightAgent.mode === AGENT_MODES.REST_HUDDLE &&
              rightAgent.stepRemaining <
                stepDistancePx * PARAMS.HUDDLE_REST_LOCK_STEP_RATIO;
            const overlapRatio = (minDistance - distance) / minDistance;

            if (
              leftIsStaticHuddle &&
              rightIsStaticHuddle &&
              overlapRatio < PARAMS.HUDDLE_STATIC_OVERLAP_TOLERANCE
            ) {
              continue;
            }

            const pushScale =
              leftIsStaticHuddle && rightIsStaticHuddle
                ? PARAMS.HUDDLE_STATIC_SEPARATION_SCALE
                : 1;
            const push =
              overlapRatio * behavior.separationForce * pushScale * dt;
            const normalX = dx / distance;
            const normalY = dy / distance;

            separationOffsets[left].x -= normalX * push;
            separationOffsets[left].y -= normalY * push;
            separationOffsets[right].x += normalX * push;
            separationOffsets[right].y += normalY * push;
            separationOffsetCounts[left] += 1;
            separationOffsetCounts[right] += 1;
          }
        }

        agentsRef.current.forEach((agent, index) => {
          const target = provisionalTargets[index];
          const targetIsStaticLocked = Boolean(target.staticLocked);
          const separationOffsetScale =
            separationOffsetCounts[index] > 0
              ? 1 / Math.sqrt(separationOffsetCounts[index])
              : 1;
          const nextTargetX =
            targetIsStaticLocked
              ? agent.x
              : target.x + separationOffsets[index].x * separationOffsetScale;
          const nextTargetY =
            targetIsStaticLocked
              ? agent.y
              : target.y + separationOffsets[index].y * separationOffsetScale;
          const huddleRestLockDistance =
            PARAMS.HUDDLE_REST_LOCK_DISTANCE_PX * agent.sizeJitter;
          const isHuddleResting =
            behavior.phase === "huddling" &&
            agent.mode === AGENT_MODES.REST_HUDDLE &&
            agent.stepRemaining <
              stepDistancePx * PARAMS.HUDDLE_REST_LOCK_STEP_RATIO;
          const targetDeltaX = nextTargetX - agent.x;
          const targetDeltaY = nextTargetY - agent.y;
          const targetDelta = Math.hypot(targetDeltaX, targetDeltaY);
          const maxMotionSpeed = Math.max(target.maxMotionSpeed ?? 0, 1e-3);
          const gaitStepDistance = Math.max(
            target.gaitStepDistance ?? stepDistancePx,
            1,
          );
          const gaitSpeedPx = targetIsStaticLocked
            ? 0
            : Math.max(target.gaitSpeedPx ?? 0, 0);
          const nominalGaitSpeedPx = targetIsStaticLocked
            ? 0
            : Math.max(target.nominalGaitSpeedPx ?? gaitSpeedPx, 0);
          const pullStrength = isHuddleResting
            ? behavior.targetPull * PARAMS.HUDDLE_REST_PULL_SCALE
            : behavior.targetPull;
          const pull = 1 - Math.exp(-pullStrength * dt);
          const shouldUseRestPull = isHuddleResting;
          let nextX =
            shouldUseRestPull && targetDelta < huddleRestLockDistance
              ? agent.x
              : shouldUseRestPull
                ? lerp(agent.x, nextTargetX, pull)
                : nextTargetX;
          let nextY =
            shouldUseRestPull && targetDelta < huddleRestLockDistance
              ? agent.y
              : shouldUseRestPull
                ? lerp(agent.y, nextTargetY, pull)
                : nextTargetY;
          let measuredVx = targetIsStaticLocked
            ? 0
            : (nextX - agent.x) / Math.max(dt, 1e-3);
          let measuredVy = targetIsStaticLocked
            ? 0
            : (nextY - agent.y) / Math.max(dt, 1e-3);
          let measuredSpeed = Math.hypot(measuredVx, measuredVy);

          if (measuredSpeed > maxMotionSpeed) {
            const speedScale = maxMotionSpeed / measuredSpeed;
            measuredVx *= speedScale;
            measuredVy *= speedScale;
            nextX = agent.x + measuredVx * dt;
            nextY = agent.y + measuredVy * dt;
            measuredSpeed = maxMotionSpeed;
          }

          if (
            targetIsStaticLocked ||
            (isHuddleResting &&
              targetDelta < huddleRestLockDistance * 1.35 &&
              measuredSpeed < PARAMS.HUDDLE_STATIC_HARD_STOP_SPEED_PX)
          ) {
            nextX = agent.x;
            nextY = agent.y;
            measuredVx = 0;
            measuredVy = 0;
            measuredSpeed = 0;
          }

          const freeWalkActivityRatio =
            agent.mode === AGENT_MODES.FREE_WALK
              ? clamp(
                  ((agent.skinTempC ?? PARAMS.UPPER_CRITICAL_TEMP_C) -
                    PARAMS.FREE_WALK_TRIGGER_STEP_MIN_HEAT_C) /
                    10,
                  0,
                  1.1,
                )
              : 0;
          const effectiveVelocityDamping =
            agent.mode === AGENT_MODES.FREE_WALK
              ? lerp(
                  PARAMS.VELOCITY_DAMPING,
                  PARAMS.FREE_WALK_ACTIVE_DAMPING,
                  freeWalkActivityRatio,
                )
              : PARAMS.VELOCITY_DAMPING;
          const settledMotion = Math.hypot(measuredVx, measuredVy);

          if (
            agent.mode === AGENT_MODES.REST_HUDDLE &&
            agent.stepRemaining <
              stepDistancePx * PARAMS.HARD_STOP_STEP_RATIO &&
            settledMotion < PARAMS.HARD_STOP_SPEED_PX
          ) {
            agent.vx = 0;
            agent.vy = 0;
          } else {
            agent.vx = lerp(agent.vx, measuredVx, 1 - effectiveVelocityDamping);
            agent.vy = lerp(agent.vy, measuredVy, 1 - effectiveVelocityDamping);
          }
          if (agent.mode === AGENT_MODES.REST_HUDDLE) {
            agent.vx *= 1 - PARAMS.REST_VELOCITY_DAMPING;
            agent.vy *= 1 - PARAMS.REST_VELOCITY_DAMPING;
          }
          agent.x = nextX;
          agent.y = nextY;
          agent.renderHeight =
            metrics.spriteHeight *
            agent.sizeJitter *
            (1 + agent.slotY * 0.04 + agent.compression * 0.015);
          agent.renderWidth = agent.renderHeight * frameAspect;
          const bodyCircle = resolveBodyCircle(
            agent,
            behavior,
            agent.x,
            agent.y,
          );
          agent.bodyRadius = bodyCircle.radius;
          agent.bodyCenterY = bodyCircle.y;
          agent.lastMeasuredSpeed = measuredSpeed;
          const motionSpeed = measuredSpeed;
          const measuredFacingDirection =
            motionSpeed > PARAMS.SPRITE_UPDATE_SPEED_PX
              ? normalize2D(measuredVx, measuredVy, agent.spriteVelocity || {
                  x: -1,
                  y: 0,
                })
              : null;
          const targetFacingDirection = target.facingDirection
            ? normalize2D(
                target.facingDirection.x,
                target.facingDirection.y,
                agent.spriteVelocity || { x: -1, y: 0 },
              )
            : null;
          if (target.lockFacing && targetFacingDirection) {
            if (agent.mode === AGENT_MODES.WAVE_STEP) {
              lockPenguinFacing(agent, targetFacingDirection);
            } else if (
              agent.mode === AGENT_MODES.REST_HUDDLE &&
              !agent.lockedFacingDirection
            ) {
              lockPenguinFacing(
                agent,
                resolveRestFacingDirection(agent, targetFacingDirection),
              );
            }
          }
          const gaitSpeedRatio = clamp(
            gaitSpeedPx / Math.max(nominalGaitSpeedPx, 1),
            0,
            1,
          );
          const allowWalkGait =
            agent.mode === AGENT_MODES.FREE_WALK ||
            agent.mode === AGENT_MODES.SEEK_HUDDLE ||
            agent.mode === AGENT_MODES.BOUNDARY_WALK ||
            agent.mode === AGENT_MODES.COOLING_EXIT;
          const isGaitMoving =
            allowWalkGait &&
            (gaitSpeedPx > 0.01 || measuredSpeed > PARAMS.HARD_STOP_SPEED_PX);
          const visibleGaitRatio = isGaitMoving
            ? clamp(gaitSpeedRatio, 0.32, 1)
            : 0;
          if (isGaitMoving && nominalGaitSpeedPx > 0) {
            const gaitAngularSpeed =
              (nominalGaitSpeedPx / gaitStepDistance) * Math.PI * 2;
            agent.gaitPhaseRad =
              ((agent.gaitPhaseRad ?? agent.waddleOffset ?? 0) +
                gaitAngularSpeed * dt) %
              (Math.PI * 4);
            agent.gaitDistancePx =
              (agent.gaitDistancePx ?? 0) + gaitSpeedPx * dt;
          }
          const stridePhase = agent.gaitPhaseRad ?? agent.waddleOffset ?? 0;
          const verticalPhase = stridePhase * 0.5;
          agent.waddleRotation =
            Math.sin(verticalPhase) *
            PARAMS.WADDLE_MAX_ROTATION *
            visibleGaitRatio;
          agent.waddleScaleY =
            1 -
            ((1 - Math.cos(stridePhase)) * 0.5) *
              PARAMS.WADDLE_SIDE_SCALE_RATIO *
              visibleGaitRatio;
          const hardExitOverheat =
            (agent.skinTempC ?? PARAMS.MIN_SKIN_TEMP_C) >=
            PARAMS.THERMAL_HARD_EXIT_TEMP_C;
          if (hardExitOverheat) {
            agent.mode = AGENT_MODES.COOLING_EXIT;
            agent.modeTimer = 0;
            agent.stepCooldown = 0;
            agent.stepRemaining = Math.max(
              agent.stepRemaining,
              freeStepDistancePx * PARAMS.COOLING_EXIT_STEP_SCALE,
            );
          } else if (
            agent.mode === AGENT_MODES.REST_HUDDLE &&
            !targetIsStaticLocked &&
            (agent.contactCount ?? 0) < PARAMS.HUDDLE_MEMBER_MIN_TOUCHES
          ) {
            agent.mode = AGENT_MODES.FREE_WALK;
            agent.modeTimer = 0;
          } else if (
            agent.mode === AGENT_MODES.REST_HUDDLE &&
            !targetIsStaticLocked &&
            (agent.contactTightness ?? 0) < PARAMS.HUDDLE_MEMBER_MIN_TIGHTNESS
          ) {
            agent.mode = AGENT_MODES.FREE_WALK;
            agent.modeTimer = 0;
          }
          const spriteDirectionDeadZone =
            target.lockFacing ||
            motionSpeed <= PARAMS.SPRITE_UPDATE_SPEED_PX ||
            (agent.mode === AGENT_MODES.REST_HUDDLE &&
              agent.stepRemaining <=
                stepDistancePx * PARAMS.HARD_STOP_STEP_RATIO);
          if (
            !spriteDirectionDeadZone &&
            (motionSpeed > PARAMS.SPRITE_UPDATE_SPEED_PX ||
              agent.mode === AGENT_MODES.WAVE_STEP ||
              agent.mode === AGENT_MODES.COOLING_EXIT)
          ) {
            const previousSpriteVelocity = normalize2D(
              agent.spriteVelocity?.x ?? agent.vx,
              agent.spriteVelocity?.y ?? agent.vy,
              { x: 1, y: 0 },
            );
            const nextSpriteVelocity = normalize2D(
              measuredFacingDirection?.x ?? agent.vx,
              measuredFacingDirection?.y ?? agent.vy,
              previousSpriteVelocity,
            );
            const spriteTurnRate =
              (motionSpeed > PARAMS.SPRITE_UPDATE_SPEED_PX * 1.9
                ? PARAMS.SPRITE_DIRECTION_FAST_TURN_RATE
                : PARAMS.SPRITE_DIRECTION_TURN_RATE) *
              ((agent.contactCount ?? 0) >= 2
                ? PARAMS.SPRITE_CONTACT_TURN_RATE_SCALE
                : 1);

            agent.spriteVelocity = rotateDirectionToward(
              previousSpriteVelocity,
              nextSpriteVelocity,
              spriteTurnRate * dt,
            );
          }
        });

        if (debugOverlayEnabled && now - lastDebugLogTimeRef.current >= 0.75) {
          lastDebugLogTimeRef.current = now;
          const debugRows = agentsRef.current.map((agent, index) => {
            const speed = Math.hypot(agent.vx, agent.vy);
            const stationarySpeedThreshold =
              agent.mode === AGENT_MODES.REST_HUDDLE
                ? PARAMS.HARD_STOP_SPEED_PX
                : 0.08;
            const stationaryStepThreshold =
              agent.mode === AGENT_MODES.REST_HUDDLE
                ? stepDistancePx * PARAMS.HARD_STOP_STEP_RATIO
                : stepDistancePx * 0.02;

            return {
              id: index + 1,
              mode: agent.mode,
              x: Number(agent.x.toFixed(1)),
              y: Number(agent.y.toFixed(1)),
              huddleMember: Boolean(agent.huddleMember),
              surrounded: Boolean(agent.isFullySurrounded),
              skinTempC: Number(
                (
                  agent.skinTempC ?? resolveSkinTempC(agent.thermalState)
                ).toFixed(1),
              ),
              expectedTempC: Number(
                (agent.expectedSkinTempC ?? agent.skinTempC ?? 0).toFixed(1),
              ),
              shortfallC: Number((agent.temperatureShortfallC ?? 0).toFixed(2)),
              thermal: Number(agent.thermalState.toFixed(3)),
              speed: Number(speed.toFixed(2)),
              stepRemaining: Number(agent.stepRemaining.toFixed(2)),
              stepCooldown: Number(agent.stepCooldown.toFixed(2)),
              contacts: agent.contactCount,
              tightness: Number((agent.contactTightness || 0).toFixed(2)),
              stationary:
                speed < stationarySpeedThreshold &&
                agent.stepRemaining < stationaryStepThreshold,
            };
          });
          const stationaryCount = debugRows.filter(
            (row) => row.stationary,
          ).length;
          const hotStationary = debugRows.filter(
            (row) =>
              row.stationary &&
              row.skinTempC >= PARAMS.THERMAL_OVERHEAT_WARN_TEMP_C &&
              row.skinTempC - row.expectedTempC >= 0.5,
          );
          const looseHuddle = debugRows.filter(
            (row) =>
              row.mode === AGENT_MODES.REST_HUDDLE &&
              !row.surrounded &&
              ((row.contacts ?? 0) < 3 || (row.tightness ?? 0) < 0.28),
          );
          const coldClustered = debugRows.filter(
            (row) =>
              row.skinTempC <= PARAMS.MIN_SKIN_TEMP_C + 0.2 &&
              (row.contacts ?? 0) >= 3 &&
              (row.tightness ?? 0) >= 0.28,
          );
          console.groupCollapsed(
            `[Penguin Debug] t=${simTime.toFixed(2)}s count=${agentsRef.current.length}`,
          );
          console.log(
            `[Penguin Debug Summary] stationary=${stationaryCount}/${debugRows.length} hotStationary=${hotStationary.length} looseHuddle=${looseHuddle.length} coldClustered=${coldClustered.length}`,
          );
          console.log(
            `[Penguin Debug Rows]\n${debugRows
              .map(
                (row) =>
                  `#${row.id} mode=${row.mode} huddle=${row.huddleMember} surrounded=${row.surrounded} pos=(${row.x}, ${row.y}) temp=${row.skinTempC}C expected=${row.expectedTempC}C shortfall=${row.shortfallC} thermal=${row.thermal} speed=${row.speed} step=${row.stepRemaining} cooldown=${row.stepCooldown} contacts=${row.contacts} tightness=${row.tightness} stationary=${row.stationary}`,
              )
              .join("\n")}`,
          );
          if (hotStationary.length > 0) {
            console.warn(
              `[Penguin Debug Hot Stationary]\n${hotStationary
                .map(
                  (row) =>
                    `#${row.id} mode=${row.mode} pos=(${row.x}, ${row.y}) temp=${row.skinTempC}C thermal=${row.thermal} speed=${row.speed} contacts=${row.contacts} tightness=${row.tightness}`,
                )
                .join("\n")}`,
            );
          }
          if (looseHuddle.length > 0) {
            console.warn(
              `[Penguin Debug Loose Huddle]\n${looseHuddle
                .map(
                  (row) =>
                    `#${row.id} mode=${row.mode} huddle=${row.huddleMember} surrounded=${row.surrounded} temp=${row.skinTempC}C contacts=${row.contacts} tightness=${row.tightness} pos=(${row.x}, ${row.y})`,
                )
                .join("\n")}`,
            );
          }
          if (coldClustered.length > 0) {
            console.warn(
              `[Penguin Debug Cold Clustered]\n${coldClustered
                .map(
                  (row) =>
                    `#${row.id} mode=${row.mode} huddle=${row.huddleMember} surrounded=${row.surrounded} temp=${row.skinTempC}C expected=${row.expectedTempC}C shortfall=${row.shortfallC} contacts=${row.contacts} tightness=${row.tightness} pos=(${row.x}, ${row.y})`,
                )
                .join("\n")}`,
            );
          }
          console.groupEnd();
        }
      }

      const renderAgents = [...agentsRef.current].sort(
        (left, right) => left.y - right.y,
      );

      renderAgents.forEach((agent) => {
        if (!image) {
          return;
        }

        const spriteMotionSpeed = Math.max(
          Math.hypot(agent.vx, agent.vy),
          agent.lastMeasuredSpeed ?? 0,
        );
        const spriteSettleStepThreshold =
          metrics.spriteHeight * behavior.huddleStepDistanceRatio * 0.04;
        const spriteIsSettled =
          spriteMotionSpeed < PARAMS.SPRITE_SETTLE_SPEED_PX &&
          agent.stepRemaining < spriteSettleStepThreshold &&
          agent.mode !== AGENT_MODES.WAVE_STEP;
        const shouldLockSpriteRender =
          behavior.phase === "huddling" &&
          agent.mode === AGENT_MODES.REST_HUDDLE &&
          spriteIsSettled;
        const spriteVelocity = spriteIsSettled
          ? agent.spriteVelocity || { x: 1, y: 0 }
          : agent.spriteVelocity || { x: agent.vx, y: agent.vy };
        const stableSpriteVelocity = resolveStablePenguinSpriteVelocity(
          agent,
          spriteVelocity,
          dt,
        );
        let sprite = agent.lockedSpriteRender;

        if (!shouldLockSpriteRender || !sprite) {
          sprite = resolveCanvasAtlasSprite(ATLAS, {
            space: agent.spriteSpace || "2d",
            position: agent.spritePosition || { x: agent.x, y: agent.y },
            velocity: stableSpriteVelocity,
            previousScreenPosition: null,
            maxDt: dt,
            width: size.width,
            height: size.height,
            projectPoint: agent.projectPoint,
            state: agent.spriteState,
            profile: agent.spriteProfile || "simulation",
            timestampMs: now * 1000,
            animationOffsetMs: agent.stageOffset,
          });
          agent.previousScreenPosition = null;

          if (shouldLockSpriteRender) {
            agent.lockedSpriteRender = {
              frame: { ...sprite.frame },
              rotation: sprite.rotation,
              flipX: sprite.flipX,
            };
          } else {
            agent.lockedSpriteRender = null;
          }
        } else {
          agent.previousScreenPosition = null;
        }

        const waveBobProgress =
          agent.mode === AGENT_MODES.WAVE_STEP
            ? clamp(
                agent.modeTimer /
                  Math.max(
                    PARAMS.STEP_DURATION_SEC *
                      PARAMS.WAVE_VISUAL_BOB_DURATION_SCALE,
                    1e-3,
                  ),
                0,
                1,
              )
            : 0;
        const waveVisualBob =
          agent.mode === AGENT_MODES.WAVE_STEP
            ? Math.sin(waveBobProgress * Math.PI) *
              metrics.spriteHeight *
              PARAMS.WAVE_VISUAL_BOB_HEIGHT_RATIO
            : 0;

        ctx.save();
        ctx.translate(agent.x, agent.y - waveVisualBob);
        const isSideSprite = (agent.spritePoseKind || "side") === "side";
        const drawHeight = isSideSprite
          ? agent.renderHeight * (agent.waddleScaleY ?? 1)
          : agent.renderHeight;
        const drawBottomY = agent.renderHeight * 0.44;
        const drawY = drawBottomY - drawHeight;
        ctx.rotate(
          sprite.rotation + (isSideSprite ? 0 : agent.waddleRotation),
        );
        ctx.scale(sprite.flipX, 1);
        const thermalVisual = resolveThermalVisual(agent.thermalState);
        const modeVisual = resolveModeDebugVisual(resolvePenguinTagMode(agent));
        const thermalRadius =
          (agent.bodyRadius ||
            agent.renderWidth * PARAMS.BODY_CIRCLE_RADIUS_RATIO) *
          PARAMS.THERMAL_VIS_RADIUS_RATIO;
        ctx.drawImage(
          image,
          sprite.frame.x * frameSize.width,
          sprite.frame.y * frameSize.height,
          frameSize.width,
          frameSize.height,
          -agent.renderWidth * 0.5,
          drawY,
          agent.renderWidth,
          drawHeight,
        );
        if (thermalMapEnabled || debugOverlayEnabled) {
          if (thermalMapEnabled) {
            ctx.globalCompositeOperation = "screen";
            ctx.fillStyle = `rgba(${thermalVisual.r}, ${thermalVisual.g}, ${thermalVisual.b}, ${thermalVisual.alpha})`;
            ctx.beginPath();
            ctx.arc(
              0,
              agent.renderHeight * PARAMS.BODY_CIRCLE_Y_OFFSET_RATIO,
              thermalRadius,
              0,
              Math.PI * 2,
            );
            ctx.fill();
            ctx.globalCompositeOperation = "source-over";
          }
          if (debugOverlayEnabled) {
            ctx.fillStyle = `rgba(${modeVisual.r}, ${modeVisual.g}, ${modeVisual.b}, ${modeVisual.alpha})`;
            ctx.beginPath();
            ctx.arc(
              0,
              agent.renderHeight * PARAMS.BODY_CIRCLE_Y_OFFSET_RATIO,
              thermalRadius * 0.68,
              0,
              Math.PI * 2,
            );
            ctx.fill();
          }

          if (!debugOverlayEnabled) {
            ctx.restore();
            return;
          }

          const debugTempC = (
            agent.skinTempC ?? resolveSkinTempC(agent.thermalState)
          ).toFixed(1);
          ctx.font = `${Math.max(10, Math.round(agent.renderHeight * 0.12))}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.lineWidth = 3;
          ctx.strokeStyle = "rgba(10, 12, 16, 0.82)";
          ctx.strokeText(`${debugTempC}C`, 0, -agent.renderHeight * 0.42);
          ctx.fillStyle = "rgba(245, 248, 252, 0.96)";
          ctx.fillText(`${debugTempC}C`, 0, -agent.renderHeight * 0.42);
        }
        ctx.restore();
      });

      animationFrameRef.current = window.requestAnimationFrame(render);
    };

    animationFrameRef.current = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
    };
  }, [controls, isPaused]);

  void controls;

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
  ...DEFAULT_CONTROL_STATE,
  ...(rawControls ?? {}),
  COUNT: clamp(
    Math.round(Number(rawControls?.COUNT ?? DEFAULT_CONTROL_STATE.COUNT)),
    30,
    360,
  ),
  APPARENT_TEMP_C: clamp(
    Number(
      rawControls?.APPARENT_TEMP_C ?? DEFAULT_CONTROL_STATE.APPARENT_TEMP_C,
    ),
    -60,
    -10,
  ),
  WIND_SPEED_MPS: clamp(
    Number(rawControls?.WIND_SPEED_MPS ?? DEFAULT_CONTROL_STATE.WIND_SPEED_MPS),
    0,
    30,
  ),
  GLOBAL_RADIATION: clamp(
    Number(
      rawControls?.GLOBAL_RADIATION ?? DEFAULT_CONTROL_STATE.GLOBAL_RADIATION,
    ),
    0,
    700,
  ),
  RELATIVE_HUMIDITY: clamp(
    Number(
      rawControls?.RELATIVE_HUMIDITY ?? DEFAULT_CONTROL_STATE.RELATIVE_HUMIDITY,
    ),
    15,
    100,
  ),
  DENSITY_PER_M2: clamp(
    Number(rawControls?.DENSITY_PER_M2 ?? DEFAULT_CONTROL_STATE.DENSITY_PER_M2),
    10,
    21,
  ),
  REACTION_THRESHOLD_CM: clamp(
    Number(
      rawControls?.REACTION_THRESHOLD_CM ??
        DEFAULT_CONTROL_STATE.REACTION_THRESHOLD_CM,
    ),
    1,
    4,
  ),
  HUDDLE_STEP_DISTANCE_CM: clamp(
    Number(
      rawControls?.HUDDLE_STEP_DISTANCE_CM ??
        DEFAULT_CONTROL_STATE.HUDDLE_STEP_DISTANCE_CM,
    ),
    5,
    10,
  ),
  THERMAL_BREAKUP_THRESHOLD: clamp(
    Number(
      rawControls?.THERMAL_BREAKUP_THRESHOLD ??
        DEFAULT_CONTROL_STATE.THERMAL_BREAKUP_THRESHOLD,
    ),
    0.45,
    0.95,
  ),
  SHOW_THERMAL_MAP: Boolean(
    rawControls?.SHOW_THERMAL_MAP ?? DEFAULT_CONTROL_STATE.SHOW_THERMAL_MAP,
  ),
  DEBUG_OVERLAY: Boolean(
    rawControls?.DEBUG_OVERLAY ?? DEFAULT_CONTROL_STATE.DEBUG_OVERLAY,
  ),
});

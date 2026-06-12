import * as React from "react";
import { P5Canvas } from "@p5-wrapper/react";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { resolveAtlasFrameSize } from "../../utils/spriteAtlas";
import { resolveCanvasAtlasSprite } from "../../utils/spritePose";
import {
  applyTransparentCanvasStyle,
  clearTransparentP5,
} from "../../utils/transparentCanvas";

const ATLAS = HOME_SPRITE_ATLASES.ant;
const SOLDIER_ANT_BODY_LENGTH_MM = 8;
const ANT_BODY_LENGTH_CM = SOLDIER_ANT_BODY_LENGTH_MM / 10;
const ACTIVE_RAID_PARTICIPATION_RATIO = 0.4;
const MIN_ACTIVE_RAID_PARTICIPATION_RATIO = 0.12;
const MAX_ACTIVE_RAID_PARTICIPATION_RATIO = 0.46;
const COLONY_SIZE_REFERENCE = 500000;
const INITIAL_COLONY_DEMAND = 0.58;
const INITIAL_FOOD_BUFFER = 0.16;
const COLONY_DEMAND_ACCUMULATION_PER_S = 0.035;
const FOOD_BUFFER_CONSUMPTION_PER_S = 0.02;
const RETURNED_FOOD_REWARD = 0.08;
const RETURNED_DEMAND_RELIEF = 0.1;
const FOOD_INCOME_DECAY_PER_S = 0.45;
const RAID_DRIVE_RESPONSE_PER_S = 0.85;
const RAID_DRIVE_DEMAND_FLOOR = 0.28;
const SIMULATED_RAIDERS_DEFAULT = 720;
const SIMULATED_RAIDERS_MIN = 500;
const SIMULATED_RAIDERS_MAX = 1500;
const ANT_BODY_LENGTHS_ON_SHORT_EDGE = 116;
const ANT_MIN_BODY_LENGTH_PX = 5.2;
const ANT_MAX_BODY_LENGTH_PX = 7.2;
const FIELD_CELL_BODY_LENGTHS = 0.6;
const ANT_SPRITE_BODY_LENGTHS = 1.8;
const PHEROMONE_SATURATION_CONCENTRATION = 2.5;
const RECRUITMENT_FIELD_HALF_LIFE_MIN = 30;
const GOAL_PULL_WEIGHT = 0.62;
const SOURCE_REPULSION_WEIGHT = 0.45;
const MEMORY_WEIGHT = 0.95;
const GRADIENT_WEIGHT = 1.25;
const TROPOTAXIS_WEIGHT = 0.92;
const MIN_CRUISE_SPEED_BODY_LENGTHS_S = 2.5;
const TRAIL_SPEED_BODY_LENGTHS_S = 6.25;
const SUSTAINED_SPEED_BODY_LENGTHS_S = 10;
const MAX_SPEED_BODY_LENGTHS_S = 17.5;
const EXPLORATION_MEMORY_BOOST = 0.42;
const VIRGIN_TERRITORY_GRADIENT_DAMP = 0.55;
const EXPLORATION_WANDER_WEIGHT = 0.15;
const LOW_PHEROMONE_WANDER_BOOST = 0.5;
const OUTBOUND_MEMORY_BLEND = 0.12;
const INBOUND_MEMORY_BLEND = 0.38;
const TRAP_ESCAPE_SECONDS = 1.6;
const LOOPBACK_DISTANCE_CM = 3.0;
const LOOPBACK_LOW_PHEROMONE_RATIO = 0.08;
const LOOPBACK_CHANCE_PER_S = 0.45;
const LOOPBACK_COOLDOWN_S = 1.4;
const INFORMATION_QUALITY_DECAY_PER_S = 0.18;
const INFORMATION_DISCOVERY_THRESHOLD = 0.28;
const INFORMATION_RESET_THRESHOLD = 0.12;
const UNINFORMED_FOLLOW_SCALE = 0.8;
const INFORMED_FOLLOW_SCALE = 1.18;
const UNINFORMED_WANDER_SCALE = 1.2;
const INFORMED_WANDER_SCALE = 0.82;
const RECRUITMENT_DECISION_BASE_RATE = 0.18;
const RECRUITMENT_DECISION_QUALITY_RATE = 0.76;
const RECRUITMENT_DECISION_INFORMED_BONUS = 0.34;
const RECRUITMENT_FIELD_WEIGHT = 1.9;
const RECRUITMENT_EXPLORATORY_FIELD_SCALE = 0.04;
const RECRUITMENT_FINAL_NOISE_SCALE = 0.12;
const MILL_FINAL_NOISE_SCALE = 0.08;
const FOOD_DISCOVERY_AROUSAL_S = 3.6;
const FOOD_DISCOVERY_LOOP_DURATION_SCALE = 0.48;
const FOOD_DISCOVERY_SPEED_BOOST = 1.35;
const RECRUITMENT_CONTACT_AROUSAL_S = 1.8;
const SECONDARY_RECRUITMENT_LOOP_DURATION_SCALE = 0.24;
const SECONDARY_RECRUITMENT_LOOP_COOLDOWN_S = 0.9;
const SECONDARY_RECRUITMENT_SIGNAL_THRESHOLD = 0.055;
const SECONDARY_RECRUITMENT_DEPOSIT_SCALE = 0.6;
const SECONDARY_RECRUITMENT_DEPOSIT_RADIUS_SCALE = 0.82;
const SECONDARY_RECRUITMENT_GOAL_DAMP = 0.22;
const SECONDARY_RECRUITMENT_MEMORY_DAMP = 0.3;
const SECONDARY_RECRUITMENT_WANDER_DAMP = 0.12;
const SECONDARY_RECRUITMENT_FIELD_BOOST = 2.4;
const SECONDARY_RECRUITMENT_DIRECTION_BOOST = 3.4;
const RECRUITMENT_DIRECTION_WEIGHT = 1.35;
const RECRUITMENT_DIRECTION_MEMORY_BLEND = 2.8;
const RECRUITMENT_RETENTION_SIGNAL_THRESHOLD = 0.02;
const TRAIL_LANE_OFFSET_BODY_LENGTHS = 1.2;
const OUTBOUND_LANE_BIAS_WEIGHT = 0.72;
const INBOUND_LANE_BIAS_WEIGHT = 1.05;
const FOOD_LINKED_RECRUITMENT_GOAL_BOOST = 1.6;
const FOOD_LINKED_RECRUITMENT_MEMORY_BOOST = 1.18;
const FOOD_LINKED_RECRUITMENT_FIELD_BOOST = 1.2;
const FOOD_LINKED_RECRUITMENT_WANDER_SCALE = 0.18;
const FOOD_LINKED_RECRUITMENT_LANE_BIAS_BOOST = 1.25;
const FOOD_LINKED_OUTBOUND_DEPOSIT_SCALE = 2.0;
const FOOD_LINKED_OUTBOUND_DEPOSIT_RADIUS_SCALE = 0.96;
const FOOD_LINKED_INBOUND_DEPOSIT_SCALE = 1.1;
const FOOD_LINKED_INBOUND_DEPOSIT_RADIUS_SCALE = 0.66;
const FOOD_DISCOVERY_LOOP_DEPOSIT_SCALE = 0.45;
const FOOD_DISCOVERY_LOOP_DEPOSIT_RADIUS_SCALE = 0.8;
const FOOD_OVERRUN_CROWDING = 3.2;
const FOOD_PATCH_MAX_COUNT = 3;
const FOOD_PATCH_RADIUS_BODY_LENGTHS = 3.8;
const FOOD_PATCH_MIN_COLONY_DISTANCE_BODY_LENGTHS = 30;
const FOOD_PATCH_MIN_SEPARATION_BODY_LENGTHS = 12;
const SECTOR_LOOP_PRESSURE_THRESHOLD = 1.28;
const SECTOR_LOOP_PRESSURE_CHANCE_PER_S = 0.5;
const SECTOR_LOOPBACK_PRESSURE_CHANCE_PER_S = 0.42;
const LOOPING_DURATION_S = 1.6;
const LOOPING_RADIUS_CM = 2.4;
const LOOPING_FREQUENCY_HZ = 2.2;
const LOOPING_ANCHOR_PULL = 1.35;
const FRONT_LOOPING_INFLUENCE_RADIUS = 10.5;
const FRONT_CONGESTION_LOOP_WEIGHT = 0.75;
const FRONT_CONGESTION_RECRUITMENT_WEIGHT = 0.25;
const FRONT_CONGESTION_GOAL_DAMP = 1.15;
const FRONT_CONGESTION_SPEED_DAMP = 0.78;
const FRONT_EXPLORATORY_ADVANCE_BASE = 0.92;
const FRONT_EXPLORATORY_SPEED_BASE = 1.08;
const FRONT_EXPLORATORY_LATERAL_SPREAD = 0.78;
const MILL_TANGENT_WEIGHT = 1.55;
const MILL_MEMORY_WEIGHT = 0.78;
const MILL_GRADIENT_WEIGHT = 0.82;
const MILL_CROWD_WEIGHT = 0.22;
const PERCEPTION_RADIUS_BODY_LENGTHS = 1.2;
const COLLISION_RADIUS_BODY_LENGTHS = 0.4;
const ANTENNA_LENGTH_BODY_LENGTHS = 0.4;
const SOURCE_RADIUS_BODY_LENGTHS = 4.5;
const BIVOUAC_RADIUS_BODY_LENGTHS = 4.2;
const BIVOUAC_CORE_BODY_LENGTHS = 2.1;
const BIVOUAC_RESERVE_SHELL_INNER_RATIO = 1.04;
const BIVOUAC_RESERVE_SHELL_OUTER_RATIO = 1.28;
const INFORMED_RECRUITER_TURNAROUND_BIVOUAC_SCALE = 1.18;
const OUTBOUND_LOOKAHEAD_BODY_LENGTHS = 10.5;
const OUTBOUND_RETURN_DISTANCE_BODY_LENGTHS = 16;
const OUTBOUND_WEAK_TRAIL_RATIO = 0.12;
const OUTBOUND_RETURN_CHANCE_PER_S = 0.85;
const EXPLORATORY_DEPOSIT_BASE = 0.96;
const RECRUITMENT_DEPOSIT_BASE = 0.42;
const MILL_DEPOSIT_BASE = 0.34;
const DENSITY_DEPOSIT_SCALE = 0.12;
const EXPLORATORY_FIELD_RESPONSE_SCALE = 0.3;
const EXPLORATORY_DEPOSIT_SCALE = 1.38;
const EXPLORATORY_CORE_DEPOSIT_RAMP_BODY_LENGTHS = 12;
const EXPLORATORY_VIRGIN_DEPOSIT_FLOOR = 0.28;
const EXPLORATORY_TRAIL_FEEDBACK_EXPONENT = 1.85;
const EXPLORATORY_TRAIL_DEPOSIT_BOOST = 1.1;
const EXPLORATORY_TRAIL_LOCK_THRESHOLD = 0.2;
const EXPLORATORY_TRAIL_ESCAPE_BAND = 0.28;
const EXPLORATORY_TRAIL_ESCAPE_FIELD_DAMP = 0.88;
const EXPLORATORY_TRAIL_ESCAPE_WANDER_BOOST = 0.48;
const EXPLORATORY_TRAIL_ESCAPE_RADIAL_BOOST = 0.92;
const EXPLORATORY_TRAIL_ESCAPE_SPREAD_BOOST = 0.58;
const EXPLORATORY_TRAIL_ESCAPE_MEMORY_DAMP = 0.4;
const AROUSAL_DURATION_S = 1.2;
const AROUSAL_LOOP_TURN_RAD = 0.32;
const AROUSAL_SPEED_BOOST = 1.35;
const MILL_ENTRY_DISTANCE_BODY_LENGTHS = 1.2;
const MILL_EXIT_MARGIN_BODY_LENGTHS = 1.6;
const MILL_EYE_BODY_LENGTHS = 3.2;
const EYE_REPULSION_WEIGHT = 1.9;
const PHEROMONE_DIFFUSION_CM2_S = 0.01;
const HARD_COLLISION_TURN_DEG_S = 1000;
const INITIAL_FIELD_GUIDANCE_RAMP_S = 2.0;
const SIMULATION_STEP_S = 0.02;
const MAX_SIMULATION_STEPS_PER_FRAME = 24;
const FIELD_UPDATE_INTERVAL_S = 0.1;
const PHEROMONE_NOISE_CUTOFF_RATIO = 0.012;
const PHEROMONE_ACTIVE_CUTOFF_RATIO = 0.06;
const RECRUITMENT_NOISE_CUTOFF_RATIO = 0.0015;
const RECRUITMENT_ACTIVE_CUTOFF_RATIO = 0.01;
const RESERVE_RELEASE_INTERVAL_S = 0.05;
const FOOD_DEBUG_LOG_COOLDOWN_S = 0.25;
const RECRUITMENT_DEBUG_LOG_COOLDOWN_S = 0.35;
const TURNAROUND_DEBUG_LOG_COOLDOWN_S = 0.35;
const BIVOUAC_DEBUG_LOG_COOLDOWN_S = 0.35;
const INITIAL_ACTIVE_SEED_COUNT = 28;
const INITIAL_ACTIVE_SEED_RATIO = 0.12;
const CONFUSION_TRIGGER_DENSITY = 4;
const CONFUSION_TRIGGER_SECONDS = 1.1;
const CONFUSION_RECOVERY_RATIO = 0.24;
const CONFUSION_LOW_GRADIENT_RATIO = 0.18;
const CONFUSION_MAX_PHEROMONE_RATIO = 0.7;
const CONFUSION_MIN_PERSIST_SECONDS = 0.9;
const CONFUSION_WANDER_TURN_RAD = 0.85;
const CONFUSION_EXIT_DISTANCE_BODY_LENGTHS = 2.8;
const MILL_CONFUSION_DENSITY = 2;
const MILL_CONFUSION_SECONDS = 0.45;
const MILL_MIN_PERSIST_SECONDS = 1.2;
const MILL_LOW_GRADIENT_RATIO = 0.2;
const MILL_EXIT_DENSITY = 1;
const MILL_EXIT_RC_MARGIN = 0.3;
const MILL_HARD_EXIT_RC_MARGIN = 0.8;
const MILL_RING_TARGET_RATIO = 0.72;
const MILL_RADIAL_CORRECTION_WEIGHT = 1.15;
const RELEASE_SECTOR_COUNT = 12;
const OUTBOUND_WANDER_TARGET_WEIGHT = 0.72;
const OUTBOUND_MEMORY_TARGET_WEIGHT = 0.28;
const OUTBOUND_RELEASE_RELAX_BODY_LENGTHS = 10;
const OUTBOUND_RELEASE_GOAL_DAMP = 0.68;
const OUTBOUND_RELEASE_MEMORY_DAMP = 0.74;
const OUTBOUND_RELEASE_FIELD_DAMP = 0.42;
const OUTBOUND_RELEASE_WANDER_BOOST = 0.18;
const OUTBOUND_RADIAL_BIAS_WEIGHT = 1.1;
const OUTBOUND_TANGENTIAL_SPREAD_WEIGHT = 0.54;
const OUTBOUND_NEAR_COLONY_DEPOSIT_DAMP = 0.5;
const EXPLORATORY_FRONT_RADIAL_WEIGHT = 1.7;
const EXPLORATORY_FRONT_TANGENTIAL_WEIGHT = 0.66;
const RAID_FRONT_ARC_RAD = 1.2;
const RAID_FRONT_LOCK_DURATION_S = 3.5;
const DEBUG_LOG_INTERVAL_S = 2;

const bodyLengthsPerSecondToCmPerSecond = (
  bodyLengthsPerSecond,
  bodyLengthCm = ANT_BODY_LENGTH_CM,
) => bodyLengthsPerSecond * bodyLengthCm;

const SIMULATED_COLONY_REFERENCE = Math.round(
  COLONY_SIZE_REFERENCE * ACTIVE_RAID_PARTICIPATION_RATIO,
);
const DEFAULT_TRAIL_SPEED_CM_S = bodyLengthsPerSecondToCmPerSecond(
  TRAIL_SPEED_BODY_LENGTHS_S,
);
const DEFAULT_SUSTAINED_SPEED_CM_S = bodyLengthsPerSecondToCmPerSecond(
  SUSTAINED_SPEED_BODY_LENGTHS_S,
);
const DEFAULT_MAX_SPEED_CM_S = bodyLengthsPerSecondToCmPerSecond(
  MAX_SPEED_BODY_LENGTHS_S,
);
const MIN_CRUISE_SPEED_CM_S = bodyLengthsPerSecondToCmPerSecond(
  MIN_CRUISE_SPEED_BODY_LENGTHS_S,
);

const PARAMS = {
  AGENT_COUNT: SIMULATED_RAIDERS_DEFAULT,
  BODY_LENGTH_CM: ANT_BODY_LENGTH_CM,
  PERCEPTION_RADIUS_CM: ANT_BODY_LENGTH_CM * PERCEPTION_RADIUS_BODY_LENGTHS,
  COLLISION_RADIUS_CM: ANT_BODY_LENGTH_CM * COLLISION_RADIUS_BODY_LENGTHS,
  ANTENNA_LENGTH_CM: ANT_BODY_LENGTH_CM * ANTENNA_LENGTH_BODY_LENGTHS,
  PERCEPTION_ANGLE_DEG: 90,
  V_SEARCH_CM_S: DEFAULT_TRAIL_SPEED_CM_S,
  V_MAX_CM_S: DEFAULT_SUSTAINED_SPEED_CM_S,
  U_P_DEG_S: 500,
  U_A_INBOUND_DEG_S: 1000,
  U_A_OUTBOUND_DEG_S: 1400,
  RC_N_THRESHOLD: -2.0,
  GRADIENT_COUPLING_B: 15.0,
  PHEROMONE_HALF_LIFE_MIN: 36,
  TIME_ACCELERATION: 1,
  SENSORY_NOISE_RAD: 0.5,
  SIGMOID_K: 100,
  ENABLE_MILL: false,
};

const CONTROL_FIELDS = [
  {
    key: "AGENT_COUNT",
    label: "개체 수",
    min: SIMULATED_RAIDERS_MIN,
    max: SIMULATED_RAIDERS_MAX,
    step: 1,
    formatValue: (value) => String(Math.round(value)),
  },
  {
    key: "TIME_ACCELERATION",
    label: "시간 가속",
    min: 1,
    max: 120,
    step: 1,
    formatValue: (value) => String(Math.round(value)) + "x",
  },
  {
    key: "V_SEARCH_CM_S",
    label: "탐색 속도",
    min: bodyLengthsPerSecondToCmPerSecond(4.5),
    max: 14,
    step: 0.1,
    formatValue: (value) => value.toFixed(1) + " cm/s",
  },
  {
    key: "V_MAX_CM_S",
    label: "모집 속도",
    min: bodyLengthsPerSecondToCmPerSecond(7),
    max: 14.5,
    step: 0.2,
    formatValue: (value) => value.toFixed(1) + " cm/s",
  },
  {
    key: "SENSORY_NOISE_RAD",
    label: "탐색 노이즈",
    min: 0.2,
    max: 0.9,
    step: 0.02,
    formatValue: (value) => value.toFixed(2) + " rad",
  },
  {
    key: "ENABLE_MILL",
    label: "앤트밀 활성화",
    type: "toggle",
    formatValue: (value) => (value ? "ON" : "OFF"),
  },
  {
    key: "RC_N_THRESHOLD",
    label: "앤트밀 임계치",
    min: -3,
    max: 0,
    step: 0.1,
    formatValue: (value) => value.toFixed(1),
  },
  {
    key: "PHEROMONE_HALF_LIFE_MIN",
    label: "페로몬 반감기",
    min: 12,
    max: 72,
    step: 1,
    formatValue: (value) => String(Math.round(value)) + " min",
  },
];
const DEFAULT_CONTROL_STATE = { ...PARAMS };

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (start, end, amount) => start + (end - start) * amount;

const add = (left, right) => ({ x: left.x + right.x, y: left.y + right.y });
const subtract = (left, right) => ({
  x: left.x - right.x,
  y: left.y - right.y,
});
const scale = (vector, factor) => ({
  x: vector.x * factor,
  y: vector.y * factor,
});
const dot = (left, right) => left.x * right.x + left.y * right.y;
const length = (vector) => Math.hypot(vector.x, vector.y);

const normalize = (vector, fallback = { x: 1, y: 0 }) => {
  const magnitude = length(vector);
  if (magnitude < 1e-6) {
    return { ...fallback };
  }

  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
  };
};

const rotate = (vector, angle) => ({
  x: vector.x * Math.cos(angle) - vector.y * Math.sin(angle),
  y: vector.x * Math.sin(angle) + vector.y * Math.cos(angle),
});

const angleToVector = (angle) => ({ x: Math.cos(angle), y: Math.sin(angle) });
const vectorToAngle = (vector) => Math.atan2(vector.y, vector.x);
const distance = (left, right) =>
  Math.hypot(left.x - right.x, left.y - right.y);
const closestPointOnSegment = (point, start, end) => {
  const segment = subtract(end, start);
  const lengthSquared = dot(segment, segment);
  if (lengthSquared <= 1e-6) {
    return { ...start };
  }

  const projection = clamp(
    dot(subtract(point, start), segment) / lengthSquared,
    0,
    1,
  );
  return add(start, scale(segment, projection));
};

const pointToSegmentDistance = (point, start, end) => {
  const closestPoint = closestPointOnSegment(point, start, end);
  return distance(point, closestPoint);
};

const wrapAngle = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));
const roundDebug = (value, digits = 2) => Number(value.toFixed(digits));
const ANT_DEBUG_VERSION = "food-gate-v37";

const sampleGaussian = () => {
  let u = 0;
  let v = 0;

  while (u <= Number.EPSILON) {
    u = Math.random();
  }

  while (v <= Number.EPSILON) {
    v = Math.random();
  }

  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const turnToward = (current, target, maxStep) => {
  const diff = wrapAngle(target - current);
  if (Math.abs(diff) <= maxStep) {
    return target;
  }

  return current + Math.sign(diff) * maxStep;
};

const createField = (width, height, cellSizePx) => {
  const cols = Math.max(1, Math.ceil(width / cellSizePx));
  const rows = Math.max(1, Math.ceil(height / cellSizePx));
  return {
    cols,
    rows,
    cellSizePx,
    values: new Float32Array(cols * rows),
    scratch: new Float32Array(cols * rows),
    saturationConcentration: PHEROMONE_SATURATION_CONCENTRATION,
    maxConcentration: 1,
    activeConcentration: 1,
  };
};

const getFieldIndex = (field, column, row) => row * field.cols + column;

const sampleField = (field, x, y) => {
  const gx = clamp(x / field.cellSizePx, 0, field.cols - 1);
  const gy = clamp(y / field.cellSizePx, 0, field.rows - 1);
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const x1 = Math.min(x0 + 1, field.cols - 1);
  const y1 = Math.min(y0 + 1, field.rows - 1);
  const tx = gx - x0;
  const ty = gy - y0;

  const v00 = field.values[getFieldIndex(field, x0, y0)] || 0;
  const v10 = field.values[getFieldIndex(field, x1, y0)] || 0;
  const v01 = field.values[getFieldIndex(field, x0, y1)] || 0;
  const v11 = field.values[getFieldIndex(field, x1, y1)] || 0;

  return lerp(lerp(v00, v10, tx), lerp(v01, v11, tx), ty);
};

const depositField = (field, x, y, amount, radiusPx) => {
  const radiusCells = Math.max(1, Math.ceil(radiusPx / field.cellSizePx));
  const centerX = Math.floor(x / field.cellSizePx);
  const centerY = Math.floor(y / field.cellSizePx);

  for (
    let row = centerY - radiusCells;
    row <= centerY + radiusCells;
    row += 1
  ) {
    if (row < 0 || row >= field.rows) {
      continue;
    }

    for (
      let column = centerX - radiusCells;
      column <= centerX + radiusCells;
      column += 1
    ) {
      if (column < 0 || column >= field.cols) {
        continue;
      }

      const sampleX = (column + 0.5) * field.cellSizePx;
      const sampleY = (row + 0.5) * field.cellSizePx;
      const dist = Math.hypot(sampleX - x, sampleY - y);
      if (dist > radiusPx) {
        continue;
      }

      const falloff = Math.exp(
        -(dist * dist) / Math.max(radiusPx * radiusPx, 1),
      );
      const index = getFieldIndex(field, column, row);
      field.values[index] = Math.min(
        field.saturationConcentration,
        field.values[index] + amount * falloff,
      );
    }
  }
};

const resolveMetrics = (width, height, controls) => {
  const bodyLengthPx = clamp(
    Math.min(width, height) / ANT_BODY_LENGTHS_ON_SHORT_EDGE,
    ANT_MIN_BODY_LENGTH_PX,
    ANT_MAX_BODY_LENGTH_PX,
  );
  const pxPerCm = bodyLengthPx / controls.BODY_LENGTH_CM;
  const bodyLengthsToPx = (bodyLengths) => bodyLengths * bodyLengthPx;
  const pxToBodyLengths = (pixels) => pixels / Math.max(bodyLengthPx, 1e-6);
  const perceptionRadiusPx = bodyLengthsToPx(
    controls.PERCEPTION_RADIUS_CM / controls.BODY_LENGTH_CM,
  );
  const collisionRadiusPx = bodyLengthsToPx(
    controls.COLLISION_RADIUS_CM / controls.BODY_LENGTH_CM,
  );
  const antennaLengthPx = bodyLengthsToPx(
    controls.ANTENNA_LENGTH_CM / controls.BODY_LENGTH_CM,
  );
  const sourceRadiusPx = bodyLengthsToPx(SOURCE_RADIUS_BODY_LENGTHS);
  const bivouacRadiusPx = bodyLengthsToPx(BIVOUAC_RADIUS_BODY_LENGTHS);
  const bivouacCoreRadiusPx = bodyLengthsToPx(BIVOUAC_CORE_BODY_LENGTHS);
  const eyeRadiusPx = bodyLengthPx * MILL_EYE_BODY_LENGTHS;
  const fieldCellSizePx = bodyLengthsToPx(FIELD_CELL_BODY_LENGTHS);
  const fieldCellSizeCm = fieldCellSizePx / pxPerCm;

  return {
    pxPerCm,
    bodyLengthPx,
    bodyLengthsToPx,
    pxToBodyLengths,
    perceptionRadiusPx,
    collisionRadiusPx,
    antennaLengthPx,
    perceptionAngleRad: (controls.PERCEPTION_ANGLE_DEG * Math.PI) / 180,
    sourceRadiusPx,
    bivouacRadiusPx,
    bivouacCoreRadiusPx,
    eyeRadiusPx,
    fieldCellSizePx,
    fieldCellSizeCm,
  };
};

const createTrail = (width, height, metrics) => {
  const colony = { x: width * 0.5, y: height * 0.5 };

  return {
    colony,
    sourceRadiusPx: metrics.sourceRadiusPx,
    bivouacRadiusPx: metrics.bivouacRadiusPx,
  };
};

const createAnt = (world, controls, role, index = 0) => {
  const spawnPoint = world.trail.colony;
  const initialActiveSeedCount = Math.max(
    INITIAL_ACTIVE_SEED_COUNT,
    Math.round(controls.AGENT_COUNT * INITIAL_ACTIVE_SEED_RATIO),
  );
  const startsActive = index < initialActiveSeedCount;
  const spawnAngle = Math.random() * Math.PI * 2;
  const innerShellPx =
    world.trail.bivouacRadiusPx * BIVOUAC_RESERVE_SHELL_INNER_RATIO;
  const outerShellPx =
    world.trail.bivouacRadiusPx * BIVOUAC_RESERVE_SHELL_OUTER_RATIO;
  const spawnRadius = startsActive
    ? innerShellPx + (outerShellPx - innerShellPx) * (0.7 + Math.random() * 0.3)
    : innerShellPx + (outerShellPx - innerShellPx) * Math.sqrt(Math.random());
  const position = add(spawnPoint, {
    x: Math.cos(spawnAngle) * spawnRadius,
    y: Math.sin(spawnAngle) * spawnRadius,
  });
  const outwardDir = normalize(
    subtract(position, world.trail.colony),
    angleToVector(spawnAngle),
  );
  const heading = vectorToAngle(outwardDir) + (Math.random() - 0.5) * 0.35;
  return {
    debugId: index,
    position,
    heading,
    speedPxS: controls.V_SEARCH_CM_S * world.metrics.pxPerCm,
    role,
    trailMode: role === "inbound" ? "recruitment" : "exploratory",
    arousalTime: 0,
    trappedTime: 0,
    loopbackCooldownS: 0,
    confusionTime: 0,
    reserveTime: startsActive ? 0 : Math.random() * RESERVE_RELEASE_INTERVAL_S,
    state: startsActive ? "trail" : "reserve",
    laneSide: 0,
    stageOffset: Math.random() * 1000,
    bridgeLock: false,
    previousScreenPosition: null,
    separatedTime: 0,
    millDirection: Math.random() > 0.5 ? 1 : -1,
    millAnchor: null,
    millTime: 0,
    loopingTime: 0,
    loopingAnchor: null,
    loopExitRole: "inbound",
    memoryHeading: heading,
    wanderHeading: heading,
    lastRcN: -Infinity,
    trailDistanceCm: 0,
    targetFoodPatchIndex: null,
    targetFoodPatchId: null,
    knowsFoodLocation: false,
    foodExcitementCooldownS: 0,
    foodLinkedRecruitment: false,
    lastFoodDebugLogTime: Number.NEGATIVE_INFINITY,
    lastRecruitmentDebugLogTime: Number.NEGATIVE_INFINITY,
    lastTurnaroundDebugLogTime: Number.NEGATIVE_INFINITY,
    lastBivouacDebugLogTime: Number.NEGATIVE_INFINITY,
    informedBivouacOrbitAccum: 0,
    informedBivouacOrbitAngle: null,
  };
};

const createWorld = (width, height, controls) => {
  const metrics = resolveMetrics(width, height, controls);
  const trail = createTrail(width, height, metrics);
  const world = {
    width,
    height,
    time: 0,
    raidFrontAngle: Math.random() * Math.PI * 2 - Math.PI,
    nextDebugLogTime: DEBUG_LOG_INTERVAL_S,
    fieldUpdateAccumulator: 0,
    reserveReleaseAccumulator: 0,
    colonyDemand: INITIAL_COLONY_DEMAND,
    foodBuffer: INITIAL_FOOD_BUFFER,
    foodIncome: 0,
    raidDrive: 0,
    frontCongestion: 0,
    previousMeanRadiusPx: null,
    previousMeanRadiusTime: null,
    foodPatches: [],
    nextFoodPatchId: 1,
    metrics,
    trail,
    field: createField(width, height, metrics.fieldCellSizePx),
    recruitmentField: createField(width, height, metrics.fieldCellSizePx),
    ants: [],
    lastAgentCount: controls.AGENT_COUNT,
  };

  for (let index = 0; index < controls.AGENT_COUNT; index += 1) {
    world.ants.push(createAnt(world, controls, "outbound", index));
  }

  world.raidDrive = resolveRaidDrive(world);

  return world;
};

const rebuildWorld = (world, controls) =>
  createWorld(world.width, world.height, controls);

const countMobileAnts = (world) => world.ants.length;

const syncAntPopulation = (world, controls) => {
  if (countMobileAnts(world) === controls.AGENT_COUNT) {
    return;
  }

  world.lastAgentCount = controls.AGENT_COUNT;
  while (countMobileAnts(world) > controls.AGENT_COUNT) {
    const removableIndex = world.ants.length - 1;
    if (removableIndex < 0) {
      break;
    }
    world.ants.splice(removableIndex, 1);
  }

  while (countMobileAnts(world) < controls.AGENT_COUNT) {
    const index = countMobileAnts(world);
    world.ants.push(createAnt(world, controls, "outbound", index));
  }
};

const countActiveRaiders = (world) =>
  world.ants.reduce(
    (count, ant) => (ant.state === "reserve" ? count : count + 1),
    0,
  );

const resolveSectorIndex = (offset) => {
  const angle = wrapAngle(vectorToAngle(offset));
  const normalizedAngle = (angle + Math.PI) / (Math.PI * 2);
  return Math.min(
    RELEASE_SECTOR_COUNT - 1,
    Math.floor(normalizedAngle * RELEASE_SECTOR_COUNT),
  );
};

const resolveOutboundSectorPressure = (ant, world, minRadiusPx) => {
  const sectorOccupancy = new Array(RELEASE_SECTOR_COUNT).fill(0);
  let countedOutbound = 0;

  world.ants.forEach((otherAnt) => {
    if (otherAnt.state === "reserve" || otherAnt.role !== "outbound") {
      return;
    }

    const offset = subtract(otherAnt.position, world.trail.colony);
    if (length(offset) < minRadiusPx) {
      return;
    }

    sectorOccupancy[resolveSectorIndex(offset)] += 1;
    countedOutbound += 1;
  });

  const antOffset = subtract(ant.position, world.trail.colony);
  const antSector = resolveSectorIndex(antOffset);
  const meanSectorCount = countedOutbound / Math.max(RELEASE_SECTOR_COUNT, 1);
  const sectorPressure =
    meanSectorCount > 0
      ? sectorOccupancy[antSector] / Math.max(meanSectorCount, 1e-6)
      : 1;

  return {
    sectorPressure,
    overrepresented: sectorPressure >= SECTOR_LOOP_PRESSURE_THRESHOLD,
  };
};

const addFoodPatch = (world, position) => {
  const radiusPx = world.metrics.bodyLengthsToPx(
    FOOD_PATCH_RADIUS_BODY_LENGTHS,
  );
  const minColonyDistancePx = Math.max(
    world.metrics.bodyLengthsToPx(FOOD_PATCH_MIN_COLONY_DISTANCE_BODY_LENGTHS),
    world.trail.bivouacRadiusPx + radiusPx * 1.4,
  );
  const minPatchSeparationPx = world.metrics.bodyLengthsToPx(
    FOOD_PATCH_MIN_SEPARATION_BODY_LENGTHS,
  );
  let patchPosition = {
    x: clamp(position.x, radiusPx, world.width - radiusPx),
    y: clamp(position.y, radiusPx, world.height - radiusPx),
  };
  const offsetX = patchPosition.x - world.trail.colony.x;
  const offsetY = patchPosition.y - world.trail.colony.y;
  const offsetDistance = Math.hypot(offsetX, offsetY);

  if (offsetDistance < minColonyDistancePx) {
    const safeDistance = Math.max(offsetDistance, 1e-6);
    const dirX = offsetX / safeDistance;
    const dirY = offsetY / safeDistance;
    patchPosition = {
      x: clamp(
        world.trail.colony.x + dirX * minColonyDistancePx,
        radiusPx,
        world.width - radiusPx,
      ),
      y: clamp(
        world.trail.colony.y + dirY * minColonyDistancePx,
        radiusPx,
        world.height - radiusPx,
      ),
    };
  }

  const radialOffsetX = patchPosition.x - world.trail.colony.x;
  const radialOffsetY = patchPosition.y - world.trail.colony.y;
  const radialDistance = Math.max(
    Math.hypot(radialOffsetX, radialOffsetY),
    1e-6,
  );
  const radialDirX = radialOffsetX / radialDistance;
  const radialDirY = radialOffsetY / radialDistance;

  world.foodPatches.forEach((existingPatch) => {
    const dx = patchPosition.x - existingPatch.position.x;
    const dy = patchPosition.y - existingPatch.position.y;
    const separation = Math.hypot(dx, dy);
    if (separation >= minPatchSeparationPx) {
      return;
    }

    const targetDistance = Math.max(
      minColonyDistancePx,
      distance(existingPatch.position, world.trail.colony) +
        minPatchSeparationPx * 0.9,
    );
    patchPosition = {
      x: clamp(
        world.trail.colony.x + radialDirX * targetDistance,
        radiusPx,
        world.width - radiusPx,
      ),
      y: clamp(
        world.trail.colony.y + radialDirY * targetDistance,
        radiusPx,
        world.height - radiusPx,
      ),
    };
  });

  world.foodPatches.unshift({
    id: world.nextFoodPatchId,
    position: patchPosition,
    radiusPx,
    strength: 1,
  });
  world.nextFoodPatchId += 1;
  if (world.foodPatches.length > FOOD_PATCH_MAX_COUNT) {
    world.foodPatches.length = FOOD_PATCH_MAX_COUNT;
  }

  world.ants.forEach((ant) => {
    if (ant.state === "reserve") {
      return;
    }

    applyFoodDiscovery(ant, resolveFoodPatchOverlap(world, ant.position), {
      world,
      source: "food-spawn-overlap",
    });
  });
};

const sampleFoodPatchCue = () => {
  return {
    signal: 0,
    direction: null,
    patch: null,
    patchIndex: -1,
  };
};

const resolveFoodPatchContact = (world, startPosition, endPosition) => {
  let matchedPatch = null;
  let matchedPatchIndex = -1;
  let bestContactDistance = Number.POSITIVE_INFINITY;
  let matchedContactPoint = null;

  world.foodPatches.forEach((patch, patchIndex) => {
    const contactPoint = closestPointOnSegment(
      patch.position,
      startPosition,
      endPosition,
    );
    const contactDistance = pointToSegmentDistance(
      patch.position,
      startPosition,
      endPosition,
    );
    if (
      contactDistance > patch.radiusPx * 1.15 ||
      contactDistance >= bestContactDistance
    ) {
      return;
    }

    matchedPatch = patch;
    matchedPatchIndex = patchIndex;
    bestContactDistance = contactDistance;
    matchedContactPoint = contactPoint;
  });

  return {
    patch: matchedPatch,
    patchIndex: matchedPatchIndex,
    contactPoint: matchedContactPoint,
  };
};

const resolveFoodPatchOverlap = (world, position) => {
  let matchedPatch = null;
  let matchedPatchIndex = -1;
  let bestDistance = Number.POSITIVE_INFINITY;

  world.foodPatches.forEach((patch, patchIndex) => {
    const overlapDistance = distance(position, patch.position);
    if (overlapDistance > patch.radiusPx || overlapDistance >= bestDistance) {
      return;
    }

    matchedPatch = patch;
    matchedPatchIndex = patchIndex;
    bestDistance = overlapDistance;
  });

  return {
    patch: matchedPatch,
    patchIndex: matchedPatchIndex,
    contactPoint: matchedPatch ? { ...position } : null,
  };
};

const logFoodRecognition = (
  world,
  ant,
  patchContact,
  source,
  recognized,
  reason,
) => {
  if (!patchContact.patch) {
    return;
  }

  const now = world.time;
  const shouldThrottle =
    !recognized && now - ant.lastFoodDebugLogTime < FOOD_DEBUG_LOG_COOLDOWN_S;
  if (shouldThrottle) {
    return;
  }

  ant.lastFoodDebugLogTime = now;
  console.info(
    "[ant-food] " +
      JSON.stringify({
        version: ANT_DEBUG_VERSION,
        t: roundDebug(now, 2),
        antId: ant.debugId,
        source,
        recognized,
        reason,
        patchIndex: patchContact.patchIndex,
        role: ant.role,
        state: ant.state,
        trailMode: ant.trailMode,
        knowsFoodLocation: ant.knowsFoodLocation,
        foodLinkedRecruitment: ant.foodLinkedRecruitment,
        patchDistancePx: roundDebug(
          distance(ant.position, patchContact.patch.position),
          2,
        ),
        patchRadiusPx: roundDebug(patchContact.patch.radiusPx, 2),
      }),
  );
};

const logRecruitmentResponse = (
  world,
  ant,
  localRecruitmentRatio,
  tactileSignal,
  recruitmentSignalStrength,
  reaction,
  detail,
) => {
  const now = world.time;
  if (
    now - ant.lastRecruitmentDebugLogTime <
    RECRUITMENT_DEBUG_LOG_COOLDOWN_S
  ) {
    return;
  }

  ant.lastRecruitmentDebugLogTime = now;
  console.info(
    "[ant-recruitment] " +
      JSON.stringify({
        version: ANT_DEBUG_VERSION,
        t: roundDebug(now, 2),
        antId: ant.debugId,
        reaction,
        detail,
        role: ant.role,
        state: ant.state,
        trailMode: ant.trailMode,
        localRecruitmentRatio: roundDebug(localRecruitmentRatio, 3),
        tactileRecruitmentCue: roundDebug(tactileSignal.recruitmentCue, 3),
        tactileCue: roundDebug(tactileSignal.cue, 3),
        recruitmentSignalStrength: roundDebug(recruitmentSignalStrength, 3),
        foodLinkedRecruitment: ant.foodLinkedRecruitment,
        knowsFoodLocation: ant.knowsFoodLocation,
      }),
  );
};

const logTurnaroundEvent = (world, ant, event, detail = null) => {
  const now = world.time;
  if (now - ant.lastTurnaroundDebugLogTime < TURNAROUND_DEBUG_LOG_COOLDOWN_S) {
    return;
  }

  ant.lastTurnaroundDebugLogTime = now;
  console.info(
    "[ant-turnaround] " +
      JSON.stringify({
        version: ANT_DEBUG_VERSION,
        t: roundDebug(now, 2),
        antId: ant.debugId,
        event,
        detail,
        role: ant.role,
        state: ant.state,
        trailMode: ant.trailMode,
        knowsFoodLocation: ant.knowsFoodLocation,
        foodLinkedRecruitment: ant.foodLinkedRecruitment,
        targetFoodPatchIndex: ant.targetFoodPatchIndex,
        colonyDistancePx: roundDebug(
          distance(ant.position, world.trail.colony),
          2,
        ),
        orbitAccumRad: roundDebug(ant.informedBivouacOrbitAccum, 2),
      }),
  );
};

const logBivouacSteering = (world, ant, metrics) => {
  const now = world.time;
  if (now - ant.lastBivouacDebugLogTime < BIVOUAC_DEBUG_LOG_COOLDOWN_S) {
    return;
  }

  ant.lastBivouacDebugLogTime = now;
  console.info(
    "[ant-bivouac] " +
      JSON.stringify({
        version: ANT_DEBUG_VERSION,
        t: roundDebug(now, 2),
        antId: ant.debugId,
        role: ant.role,
        state: ant.state,
        trailMode: ant.trailMode,
        knowsFoodLocation: ant.knowsFoodLocation,
        foodLinkedRecruitment: ant.foodLinkedRecruitment,
        colonyDistancePx: roundDebug(metrics.colonyDistancePx, 2),
        laneCorrection: roundDebug(metrics.laneCorrection, 3),
        laneBiasMag: roundDebug(metrics.laneBiasMag, 3),
        avoidanceMag: roundDebug(metrics.avoidanceMag, 3),
        opposingTraffic: metrics.opposingTraffic,
        radialGoalAlignment: roundDebug(metrics.radialGoalAlignment, 3),
        tangentialGoalAlignment: roundDebug(metrics.tangentialGoalAlignment, 3),
      }),
  );
};

const resolveFoodLoopAnchor = (ant, patchContact, world) => {
  if (!patchContact.patch) {
    return { ...ant.position };
  }

  const anchorBase = patchContact.contactPoint || ant.position;
  const offsetFromPatch = subtract(anchorBase, patchContact.patch.position);
  const outwardDir = normalize(
    length(offsetFromPatch) > 1e-6
      ? offsetFromPatch
      : subtract(anchorBase, world.trail.colony),
    angleToVector(ant.heading),
  );
  const anchorRadius = Math.min(
    patchContact.patch.radiusPx * 0.72,
    world.metrics.bodyLengthPx * 1.45,
  );

  return add(patchContact.patch.position, scale(outwardDir, anchorRadius));
};

const performFoodCollectionTurnaround = (ant, patchContact, world) => {
  ant.state = "trail";
  ant.role = "inbound";
  ant.trailMode = "recruitment";
  ant.foodLinkedRecruitment = true;
  ant.knowsFoodLocation = true;
  ant.targetFoodPatchIndex = patchContact.patchIndex;
  ant.targetFoodPatchId = patchContact.patch.id;
  ant.loopingTime = 0;
  ant.loopingAnchor = null;
  ant.loopExitRole = "inbound";
  ant.arousalTime = Math.max(ant.arousalTime, FOOD_DISCOVERY_AROUSAL_S * 0.7);
  ant.confusionTime = 0;
  ant.millTime = 0;
  ant.millAnchor = null;

  if (patchContact.contactPoint) {
    ant.position = { ...patchContact.contactPoint };
  }

  const toColony = normalize(
    subtract(world.trail.colony, ant.position),
    angleToVector(ant.heading),
  );
  const inboundHeading = vectorToAngle(toColony);
  ant.heading = inboundHeading;
  ant.memoryHeading = inboundHeading;
  ant.wanderHeading = inboundHeading;

  ant.speedPxS = Math.max(
    ant.speedPxS,
    DEFAULT_TRAIL_SPEED_CM_S *
      world.metrics.pxPerCm *
      FOOD_DISCOVERY_SPEED_BOOST,
  );
};

const applyFoodDiscovery = (ant, patchContact, debugContext = null) => {
  if (!patchContact.patch || patchContact.patchIndex < 0) {
    return false;
  }

  const world = debugContext?.world ?? null;
  const source = debugContext?.source ?? "unknown";

  if (ant.state === "reserve") {
    if (world) {
      logFoodRecognition(world, ant, patchContact, source, false, "reserve");
    }
    return false;
  }

  if (ant.knowsFoodLocation) {
    if (
      ant.loopingTime > 0 &&
      ant.role === "outbound" &&
      ant.foodLinkedRecruitment &&
      ant.targetFoodPatchId === patchContact.patch.id
    ) {
      if (world) {
        logFoodRecognition(
          world,
          ant,
          patchContact,
          source,
          false,
          "loop-active",
        );
      }
      return false;
    }
    if (world && ant.role === "outbound" && ant.foodLinkedRecruitment) {
      performFoodCollectionTurnaround(ant, patchContact, world);
      logFoodRecognition(
        world,
        ant,
        patchContact,
        source,
        true,
        "collection-turnaround",
      );
      return true;
    }
    if (world) {
      logFoodRecognition(
        world,
        ant,
        patchContact,
        source,
        false,
        "already-recognized",
      );
    }
    return false;
  }

  ant.state = "trail";
  ant.confusionTime = 0;
  ant.millTime = 0;
  ant.millAnchor = null;
  ant.targetFoodPatchIndex = patchContact.patchIndex;
  ant.targetFoodPatchId = patchContact.patch.id;
  ant.knowsFoodLocation = true;
  ant.foodLinkedRecruitment = true;
  ant.trailMode = "recruitment";
  ant.arousalTime = Math.max(ant.arousalTime, FOOD_DISCOVERY_AROUSAL_S);

  if (ant.loopingTime <= 0) {
    startRecruitmentLoop(ant, {
      anchor: resolveFoodLoopAnchor(ant, patchContact, world),
      durationScale: FOOD_DISCOVERY_LOOP_DURATION_SCALE,
      arousalTime: FOOD_DISCOVERY_AROUSAL_S,
      trailMode: "recruitment",
      foodLinked: true,
    });
  }

  ant.foodExcitementCooldownS = Math.max(
    ant.foodExcitementCooldownS,
    FOOD_DISCOVERY_AROUSAL_S * 0.9,
  );

  if (world) {
    logFoodRecognition(world, ant, patchContact, source, true, "recognized");
  }

  return true;
};

const resolveTrackedFoodPatch = (ant, world) => {
  let trackedPatch = null;
  let trackedPatchIndex = -1;

  if (ant.targetFoodPatchId != null) {
    trackedPatchIndex = world.foodPatches.findIndex(
      (patch) => patch.id === ant.targetFoodPatchId,
    );
    trackedPatch =
      trackedPatchIndex >= 0 ? world.foodPatches[trackedPatchIndex] : null;
  } else {
    trackedPatch = world.foodPatches[ant.targetFoodPatchIndex] ?? null;
    trackedPatchIndex = trackedPatch ? ant.targetFoodPatchIndex : -1;
  }

  if (trackedPatch) {
    return {
      patch: trackedPatch,
      patchIndex: trackedPatchIndex,
    };
  }

  ant.targetFoodPatchIndex = null;
  ant.targetFoodPatchId = null;
  ant.knowsFoodLocation = false;
  ant.foodLinkedRecruitment = false;

  return {
    patch: null,
    patchIndex: -1,
  };
};

const resolveRaidDrive = (world) => {
  const rawDrive =
    world.colonyDemand * 0.92 -
    world.foodBuffer * 0.55 +
    world.foodIncome * 0.08;
  const demandFloor = world.colonyDemand * RAID_DRIVE_DEMAND_FLOOR;
  return clamp(Math.max(rawDrive, demandFloor), 0, 1);
};

const updateColonyState = (world, dt) => {
  world.foodBuffer = Math.max(
    0,
    world.foodBuffer - FOOD_BUFFER_CONSUMPTION_PER_S * dt,
  );
  const unmetDemandScale = 0.55 + 0.45 * clamp(1 - world.foodBuffer, 0, 1);
  world.colonyDemand = clamp(
    world.colonyDemand +
      COLONY_DEMAND_ACCUMULATION_PER_S * dt * unmetDemandScale,
    0,
    1.5,
  );
  world.foodIncome = Math.max(
    0,
    world.foodIncome - FOOD_INCOME_DECAY_PER_S * dt,
  );
  const targetRaidDrive = resolveRaidDrive(world);
  world.raidDrive = lerp(
    world.raidDrive,
    targetRaidDrive,
    clamp(RAID_DRIVE_RESPONSE_PER_S * dt, 0, 1),
  );
};

const updateFrontCongestion = (world) => {
  let farOutbound = 0;
  let loopingOutbound = 0;
  let recruitmentOutbound = 0;
  const influenceRadiusPx = world.metrics.bodyLengthsToPx(
    FRONT_LOOPING_INFLUENCE_RADIUS,
  );

  world.ants.forEach((ant) => {
    if (ant.role !== "outbound") {
      return;
    }

    const colonyDistancePx = distance(ant.position, world.trail.colony);
    if (colonyDistancePx <= influenceRadiusPx) {
      return;
    }

    farOutbound += 1;
    if (ant.loopingTime > 0) {
      loopingOutbound += 1;
    }
    if (ant.trailMode === "recruitment" || ant.arousalTime > 0) {
      recruitmentOutbound += 1;
    }
  });

  const loopingRatio = farOutbound > 0 ? loopingOutbound / farOutbound : 0;
  const recruitmentRatio =
    farOutbound > 0 ? recruitmentOutbound / farOutbound : 0;
  world.frontCongestion = clamp(
    loopingRatio * FRONT_CONGESTION_LOOP_WEIGHT +
      recruitmentRatio * FRONT_CONGESTION_RECRUITMENT_WEIGHT,
    0,
    1,
  );
};

const releaseReserveAnts = (world, controls) => {
  const desiredActiveRatio = lerp(
    MIN_ACTIVE_RAID_PARTICIPATION_RATIO,
    MAX_ACTIVE_RAID_PARTICIPATION_RATIO,
    world.raidDrive,
  );
  const desiredActive = Math.max(
    1,
    Math.round(controls.AGENT_COUNT * desiredActiveRatio),
  );
  let activeRaiders = countActiveRaiders(world);

  if (activeRaiders >= desiredActive) {
    return;
  }

  while (
    world.reserveReleaseAccumulator >= RESERVE_RELEASE_INTERVAL_S &&
    activeRaiders < desiredActive
  ) {
    const sectorOccupancy = new Array(RELEASE_SECTOR_COUNT).fill(0);
    world.ants.forEach((ant) => {
      if (ant.state === "reserve") {
        return;
      }

      const offset = subtract(ant.position, world.trail.colony);
      const dist = length(offset);
      if (dist > world.trail.bivouacRadiusPx * 3.2) {
        return;
      }

      const angle = wrapAngle(vectorToAngle(offset));
      const normalizedAngle = (angle + Math.PI) / (Math.PI * 2);
      const sector = Math.min(
        RELEASE_SECTOR_COUNT - 1,
        Math.floor(normalizedAngle * RELEASE_SECTOR_COUNT),
      );
      sectorOccupancy[sector] += 1;
    });

    const reserveAnts = world.ants.filter((ant) => ant.state === "reserve");
    const reserveAnt = reserveAnts.length
      ? reserveAnts[Math.floor(Math.random() * reserveAnts.length)]
      : null;

    if (!reserveAnt) {
      break;
    }

    const releaseWeights = sectorOccupancy.map(
      (count) => 1 / Math.pow(1 + count, 2),
    );
    const totalWeight = releaseWeights.reduce((sum, value) => sum + value, 0);
    let selection = Math.random() * Math.max(totalWeight, 1e-6);
    let selectedSector = 0;
    for (let index = 0; index < releaseWeights.length; index += 1) {
      selection -= releaseWeights[index];
      if (selection <= 0) {
        selectedSector = index;
        break;
      }
    }

    const sectorAngleSize = (Math.PI * 2) / RELEASE_SECTOR_COUNT;
    const sectorStart = -Math.PI + selectedSector * sectorAngleSize;
    const releaseAngle =
      sectorStart + Math.random() * sectorAngleSize + sampleGaussian() * 0.08;
    const releaseRadius =
      world.trail.bivouacRadiusPx * (1.04 + Math.random() * 0.2);
    reserveAnt.position = add(world.trail.colony, {
      x: Math.cos(releaseAngle) * releaseRadius,
      y: Math.sin(releaseAngle) * releaseRadius,
    });

    reserveAnt.state = "trail";
    reserveAnt.role = "outbound";
    reserveAnt.trailMode = "exploratory";
    reserveAnt.foodLinkedRecruitment = false;
    reserveAnt.targetFoodPatchIndex = null;
    reserveAnt.targetFoodPatchId = null;
    reserveAnt.knowsFoodLocation = false;
    reserveAnt.arousalTime = 0;
    reserveAnt.confusionTime = 0;
    reserveAnt.reserveTime = 0;
    reserveAnt.heading = releaseAngle + (Math.random() - 0.5) * 0.28;
    reserveAnt.memoryHeading = reserveAnt.heading;
    reserveAnt.wanderHeading = reserveAnt.heading;
    world.reserveReleaseAccumulator -= RESERVE_RELEASE_INTERVAL_S;
    activeRaiders += 1;
  }
};

const diffuseField = (field, metrics, dt) => {
  const alpha = clamp(
    (PHEROMONE_DIFFUSION_CM2_S * dt) /
      Math.max(metrics.fieldCellSizeCm * metrics.fieldCellSizeCm, 1e-6),
    0,
    0.24,
  );

  if (alpha <= 1e-6) {
    return;
  }

  const { values, scratch, cols, rows } = field;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < cols; column += 1) {
      const index = getFieldIndex(field, column, row);
      const center = values[index];
      const left = values[getFieldIndex(field, Math.max(column - 1, 0), row)];
      const right =
        values[getFieldIndex(field, Math.min(column + 1, cols - 1), row)];
      const up = values[getFieldIndex(field, column, Math.max(row - 1, 0))];
      const down =
        values[getFieldIndex(field, column, Math.min(row + 1, rows - 1))];
      scratch[index] = Math.min(
        field.saturationConcentration,
        center + alpha * (left + right + up + down - center * 4),
      );
    }
  }

  values.set(scratch);
};

const updateField = (world, controls, dt) => {
  const updateSingleField = (field) => {
    const halfLifeMinutes =
      field === world.recruitmentField
        ? RECRUITMENT_FIELD_HALF_LIFE_MIN
        : controls.PHEROMONE_HALF_LIFE_MIN;
    const decay = Math.pow(0.5, dt / Math.max(halfLifeMinutes * 60, 1));
    let maxConcentration = 1e-3;
    let activeConcentration = 1e-3;
    const noiseCutoff =
      field.saturationConcentration *
      (field === world.recruitmentField
        ? RECRUITMENT_NOISE_CUTOFF_RATIO
        : PHEROMONE_NOISE_CUTOFF_RATIO);
    const activeCutoff =
      field.saturationConcentration *
      (field === world.recruitmentField
        ? RECRUITMENT_ACTIVE_CUTOFF_RATIO
        : PHEROMONE_ACTIVE_CUTOFF_RATIO);

    for (let index = 0; index < field.values.length; index += 1) {
      field.values[index] *= decay;
    }

    diffuseField(field, world.metrics, dt);

    for (let index = 0; index < field.values.length; index += 1) {
      if (field.values[index] < noiseCutoff) {
        field.values[index] = 0;
        continue;
      }

      maxConcentration = Math.max(maxConcentration, field.values[index]);
      if (field.values[index] >= activeCutoff) {
        activeConcentration = Math.max(
          activeConcentration,
          field.values[index],
        );
      }
    }

    field.maxConcentration = maxConcentration;
    field.activeConcentration = activeConcentration;
  };

  updateSingleField(world.field);
  updateSingleField(world.recruitmentField);
};

const senseAntennae = (ant, world) => {
  const recruitmentExploratoryScale =
    ant.foodLinkedRecruitment && ant.trailMode === "recruitment"
      ? RECRUITMENT_EXPLORATORY_FIELD_SCALE
      : 1;
  const headingVector = angleToVector(ant.heading);
  const leftVector = rotate(headingVector, -Math.PI * 0.25);
  const rightVector = rotate(headingVector, Math.PI * 0.25);
  const antennaDistance = world.metrics.antennaLengthPx;
  const leftPoint = add(ant.position, scale(leftVector, antennaDistance));
  const rightPoint = add(ant.position, scale(rightVector, antennaDistance));
  const centerPoint = add(
    ant.position,
    scale(headingVector, antennaDistance * 0.9),
  );
  const left =
    sampleField(world.field, leftPoint.x, leftPoint.y) *
      recruitmentExploratoryScale +
    sampleField(world.recruitmentField, leftPoint.x, leftPoint.y) *
      RECRUITMENT_FIELD_WEIGHT;
  const right =
    sampleField(world.field, rightPoint.x, rightPoint.y) *
      recruitmentExploratoryScale +
    sampleField(world.recruitmentField, rightPoint.x, rightPoint.y) *
      RECRUITMENT_FIELD_WEIGHT;
  const center =
    sampleField(world.field, centerPoint.x, centerPoint.y) *
      recruitmentExploratoryScale +
    sampleField(world.recruitmentField, centerPoint.x, centerPoint.y) *
      RECRUITMENT_FIELD_WEIGHT;
  const turnBias = clamp(
    (right - left) / Math.max(world.field.saturationConcentration, 1e-3),
    -1,
    1,
  );
  const tropotaxisDir = normalize(
    rotate(headingVector, turnBias * Math.PI * 0.35),
    headingVector,
  );
  const gradientDir = normalize(
    add(scale(leftVector, left), scale(rightVector, right)),
    headingVector,
  );

  return {
    left,
    right,
    center,
    turnBias,
    tropotaxisDir,
    gradientDir,
    centerPoint,
  };
};

const resolveAnySourceDistance = (ant, world) =>
  distance(ant.position, world.trail.colony);
const computeNeighborCrowding = (ant, ants, world) => {
  let crowding = 0;

  ants.forEach((other) => {
    if (other === ant) {
      return;
    }

    if (
      distance(ant.position, other.position) <= world.metrics.perceptionRadiusPx
    ) {
      crowding += 1;
    }
  });

  return crowding;
};

const computeTrailDeposit = (ant, crowding, world, controls, dt) => {
  const baseDeposit =
    ant.trailMode === "recruitment"
      ? RECRUITMENT_DEPOSIT_BASE
      : EXPLORATORY_DEPOSIT_BASE;
  const densityBoost = 1 + crowding * DENSITY_DEPOSIT_SCALE;
  const speedBoost =
    ant.speedPxS / Math.max(controls.V_MAX_CM_S * world.metrics.pxPerCm, 1);
  const arousalBoost = ant.arousalTime > 0 ? AROUSAL_SPEED_BOOST : 1;
  const depositTimeScale = Math.max(dt, 0);

  return {
    amount:
      baseDeposit *
      densityBoost *
      (0.86 + speedBoost * 0.32) *
      arousalBoost *
      depositTimeScale,
    radiusPx:
      world.metrics.collisionRadiusPx *
      (ant.trailMode === "recruitment" ? 1.55 : 1.35),
  };
};

const computeAvoidance = (ant, ants, world) => {
  const headingVector = angleToVector(ant.heading);
  const neighborCos = Math.cos(world.metrics.perceptionAngleRad * 0.5);
  const collisionDiameterPx = world.metrics.collisionRadiusPx * 2;
  let avoidanceVector = { x: 0, y: 0 };
  let active = false;
  let opposingTraffic = 0;
  let hardCollision = false;

  ants.forEach((other) => {
    if (other === ant) {
      return;
    }

    const offset = subtract(other.position, ant.position);
    const dist = length(offset);
    if (dist <= 1e-6 || dist > world.metrics.perceptionRadiusPx) {
      return;
    }

    if (dist < collisionDiameterPx) {
      hardCollision = true;
      active = true;
      const overlap = 1 - dist / Math.max(collisionDiameterPx, 1e-6);
      avoidanceVector = add(
        avoidanceVector,
        scale(normalize(scale(offset, -1)), 4 + overlap * 8),
      );
    }

    const direction = scale(offset, 1 / dist);
    if (dot(direction, headingVector) < neighborCos) {
      return;
    }

    active = true;
    const oppositeRole = other.role !== ant.role;
    const weight = oppositeRole ? (ant.role === "outbound" ? 2.35 : 1.15) : 0.8;
    avoidanceVector = add(
      avoidanceVector,
      scale(normalize(scale(offset, -1)), weight / Math.max(dist, 1)),
    );

    if (oppositeRole) {
      opposingTraffic += 1;
    }
  });

  return {
    active,
    hardCollision,
    opposingTraffic,
    vector: normalize(avoidanceVector, headingVector),
  };
};

const computeNeighborFlow = (ant, ants, world) => {
  const contactRadius = world.metrics.collisionRadiusPx * 2.8;
  const headingVector = angleToVector(ant.heading);
  let contactCue = 0;
  let contactStrength = 0;
  let recruitmentCue = 0;
  let recruitmentDirectionVector = { x: 0, y: 0 };
  let recruitmentTargetFoodPatchIndex = null;
  let recruitmentTargetFoodPatchId = null;
  let recruitmentTargetWeight = 0;

  ants.forEach((other) => {
    if (other === ant) {
      return;
    }

    const offset = subtract(other.position, ant.position);
    const dist = length(offset);
    if (dist <= 1e-6 || dist > contactRadius) {
      return;
    }

    const roleWeight = other.role === ant.role ? 1 : 0.2;
    const contactWeight = roleWeight * (1 - dist / Math.max(contactRadius, 1));
    const weight = Math.max(contactWeight, 0);
    if (weight <= 0) {
      return;
    }

    contactCue +=
      weight *
      (other.trailMode === "recruitment" || other.arousalTime > 0 ? 1 : 0.35);
    contactStrength += weight;

    if (
      other.role === "inbound" &&
      other.foodLinkedRecruitment &&
      (other.trailMode === "recruitment" || other.arousalTime > 0)
    ) {
      recruitmentCue += weight;
      recruitmentDirectionVector = add(
        recruitmentDirectionVector,
        scale(scale(angleToVector(other.heading), -1), weight),
      );
      if (
        other.targetFoodPatchIndex != null &&
        other.targetFoodPatchIndex >= 0 &&
        weight > recruitmentTargetWeight
      ) {
        recruitmentTargetWeight = weight;
        recruitmentTargetFoodPatchIndex = other.targetFoodPatchIndex;
        recruitmentTargetFoodPatchId = other.targetFoodPatchId;
      }
    }
  });

  return {
    count: contactStrength,
    cue: contactCue,
    recruitmentCue,
    recruitmentDirection:
      recruitmentCue > 1e-6
        ? normalize(recruitmentDirectionVector, headingVector)
        : null,
    recruitmentTargetFoodPatchIndex,
    recruitmentTargetFoodPatchId,
  };
};

const computeSigmoidSpeed = (
  centerConcentration,
  maxConcentration,
  controls,
) => {
  const normalized = clamp(
    centerConcentration / Math.max(maxConcentration, 1e-3),
    0,
    1,
  );
  const stimulus = Math.atan(controls.SIGMOID_K * normalized) / (Math.PI * 0.5);
  return lerp(controls.V_SEARCH_CM_S, controls.V_MAX_CM_S, stimulus);
};

const resolveRoleTarget = (ant, world) => {
  if (ant.role !== "outbound") {
    return world.trail.colony;
  }

  if (ant.targetFoodPatchIndex != null && ant.trailMode === "recruitment") {
    const trackedFoodPatch = resolveTrackedFoodPatch(ant, world);
    if (trackedFoodPatch.patch) {
      ant.targetFoodPatchIndex = trackedFoodPatch.patchIndex;
      return trackedFoodPatch.patch.position;
    }
  }

  const headingFallback = angleToVector(ant.memoryHeading);
  const radialOutDir = normalize(
    subtract(ant.position, world.trail.colony),
    headingFallback,
  );
  const tangentialDir = rotate(
    radialOutDir,
    ant.stageOffset % 2 > 1 ? Math.PI * 0.5 : -Math.PI * 0.5,
  );
  const exploratoryFrontDir = normalize(
    add(
      add(
        scale(radialOutDir, EXPLORATORY_FRONT_RADIAL_WEIGHT),
        scale(tangentialDir, EXPLORATORY_FRONT_TANGENTIAL_WEIGHT),
      ),
      scale(angleToVector(ant.wanderHeading), 0.45),
    ),
    headingFallback,
  );
  const recruitmentFrontDir = normalize(
    add(
      scale(angleToVector(ant.memoryHeading), 1.15),
      scale(angleToVector(ant.wanderHeading), 0.08),
    ),
    headingFallback,
  );
  const targetDir =
    ant.trailMode === "exploratory"
      ? exploratoryFrontDir
      : ant.knowsFoodLocation
        ? normalize(
            add(
              scale(
                angleToVector(ant.wanderHeading),
                OUTBOUND_WANDER_TARGET_WEIGHT,
              ),
              scale(
                angleToVector(ant.memoryHeading),
                OUTBOUND_MEMORY_TARGET_WEIGHT,
              ),
            ),
            headingFallback,
          )
        : normalize(recruitmentFrontDir, headingFallback);

  return add(
    ant.position,
    scale(
      targetDir,
      world.metrics.bodyLengthsToPx(OUTBOUND_LOOKAHEAD_BODY_LENGTHS),
    ),
  );
};

const isInsideBivouac = (ant, world, scaleFactor = 1) =>
  distance(ant.position, world.trail.colony) <=
  world.trail.bivouacRadiusPx * scaleFactor;

const startRecruitmentLoop = (ant, options = {}) => {
  ant.loopingTime =
    LOOPING_DURATION_S *
    (options.durationScale ?? 1) *
    (0.85 + Math.random() * 0.3);
  ant.loopingAnchor = options.anchor
    ? { ...options.anchor }
    : { ...ant.position };
  ant.loopExitRole = options.exitRole ?? "inbound";
  ant.trailMode = options.trailMode ?? "recruitment";
  ant.foodLinkedRecruitment = Boolean(options.foodLinked);
  ant.arousalTime = Math.max(
    ant.arousalTime,
    options.arousalTime ?? AROUSAL_DURATION_S,
  );
};

const performInformedRecruiterTurnaround = (ant, world, controls, detail) => {
  world.foodBuffer = clamp(world.foodBuffer + RETURNED_FOOD_REWARD, 0, 0.9);
  world.colonyDemand = clamp(
    world.colonyDemand - RETURNED_DEMAND_RELIEF,
    0,
    1.5,
  );
  world.foodIncome = Math.min(1, lerp(world.foodIncome, 1, 0.18));
  world.raidDrive = resolveRaidDrive(world);
  ant.role = "outbound";
  ant.trailMode = "recruitment";
  ant.arousalTime = Math.max(ant.arousalTime, FOOD_DISCOVERY_AROUSAL_S * 0.55);
  ant.state = "trail";
  ant.reserveTime = 0;
  const trackedFoodPatch = resolveTrackedFoodPatch(ant, world);
  const foodTarget = trackedFoodPatch.patch?.position ?? world.trail.colony;
  const outboundVector = normalize(
    subtract(foodTarget, world.trail.colony),
    angleToVector(ant.heading),
  );
  const outboundHeading = vectorToAngle(outboundVector);
  ant.position = add(
    world.trail.colony,
    scale(outboundVector, world.trail.bivouacRadiusPx * 1.08),
  );
  ant.heading = outboundHeading;
  ant.memoryHeading = outboundHeading;
  ant.wanderHeading = outboundHeading;
  ant.speedPxS = Math.max(
    ant.speedPxS,
    controls.V_SEARCH_CM_S * world.metrics.pxPerCm * FOOD_DISCOVERY_SPEED_BOOST,
  );
  ant.informedBivouacOrbitAccum = 0;
  ant.informedBivouacOrbitAngle = null;
  logTurnaroundEvent(world, ant, "turnaround", detail);
};

const updateRoleSwap = (ant, world, controls) => {
  if (ant.loopingTime > 0 || ant.state === "mill") {
    return;
  }

  const informedRecruiterNearBivouac =
    ant.role === "inbound" &&
    ant.knowsFoodLocation &&
    ant.foodLinkedRecruitment &&
    isInsideBivouac(ant, world, 1.3);

  if (informedRecruiterNearBivouac) {
    const bivouacAngle = vectorToAngle(
      subtract(ant.position, world.trail.colony),
    );
    if (ant.informedBivouacOrbitAngle != null) {
      ant.informedBivouacOrbitAccum += Math.abs(
        wrapAngle(bivouacAngle - ant.informedBivouacOrbitAngle),
      );
    }
    ant.informedBivouacOrbitAngle = bivouacAngle;

    if (ant.informedBivouacOrbitAccum >= Math.PI * 0.9) {
      logTurnaroundEvent(world, ant, "orbit-detected", "informed-bivouac-loop");
    }
  } else {
    ant.informedBivouacOrbitAccum = 0;
    ant.informedBivouacOrbitAngle = null;
  }

  const informedRecruiterTouchingBivouac =
    ant.role === "inbound" &&
    ant.knowsFoodLocation &&
    ant.foodLinkedRecruitment &&
    isInsideBivouac(ant, world, INFORMED_RECRUITER_TURNAROUND_BIVOUAC_SCALE);

  if (ant.role === "outbound") {
    const localRecruitment = sampleField(
      world.recruitmentField,
      ant.position.x,
      ant.position.y,
    );
    const recruitmentActive =
      ant.trailMode === "recruitment" ||
      ant.arousalTime > 0 ||
      localRecruitment >
        world.recruitmentField.maxConcentration *
          RECRUITMENT_RETENTION_SIGNAL_THRESHOLD;
    if (recruitmentActive) {
      return;
    }

    const colonyDistancePx = distance(ant.position, world.trail.colony);
    const localPheromone = sampleField(
      world.field,
      ant.position.x,
      ant.position.y,
    );
    const farEnough =
      colonyDistancePx >=
      world.metrics.bodyLengthsToPx(OUTBOUND_RETURN_DISTANCE_BODY_LENGTHS);
    const weakTrail =
      localPheromone <=
      world.field.maxConcentration * OUTBOUND_WEAK_TRAIL_RATIO;
    if (!farEnough || !weakTrail) {
      return;
    }

    const homeHeading = vectorToAngle(
      subtract(world.trail.colony, ant.position),
    );
    ant.role = "inbound";
    ant.trailMode = "exploratory";
    ant.heading = homeHeading;
    ant.memoryHeading = homeHeading;
    ant.wanderHeading = homeHeading;
    return;
  } else if (
    !informedRecruiterTouchingBivouac &&
    !isInsideBivouac(ant, world, 0.92)
  ) {
    return;
  }

  if (ant.role === "inbound") {
    if (ant.knowsFoodLocation && ant.foodLinkedRecruitment) {
      performInformedRecruiterTurnaround(
        ant,
        world,
        controls,
        informedRecruiterTouchingBivouac
          ? "bivouac-edge-touch"
          : "deep-bivouac-touch",
      );
    } else {
      world.foodBuffer = clamp(world.foodBuffer + RETURNED_FOOD_REWARD, 0, 0.9);
      world.colonyDemand = clamp(
        world.colonyDemand - RETURNED_DEMAND_RELIEF,
        0,
        1.5,
      );
      world.foodIncome = Math.min(1, lerp(world.foodIncome, 1, 0.18));
      world.raidDrive = resolveRaidDrive(world);
      ant.role = "outbound";
      ant.trailMode = "exploratory";
      ant.foodLinkedRecruitment = false;
      ant.targetFoodPatchIndex = null;
      ant.targetFoodPatchId = null;
      ant.knowsFoodLocation = false;
      ant.arousalTime = 0;
      ant.state = "reserve";
      ant.reserveTime = 0;
    }
  } else {
    ant.role = "inbound";
    ant.trailMode = ant.foodLinkedRecruitment ? "recruitment" : "exploratory";
    ant.arousalTime = AROUSAL_DURATION_S;
  }

  ant.trappedTime = 0;
  ant.loopbackCooldownS = 0;
  if (ant.state !== "reserve") {
    ant.state = "trail";
  }
  ant.separatedTime = 0;
  ant.laneSide = 0;
  ant.millDirection = Math.random() > 0.5 ? 1 : -1;
  ant.millAnchor = null;
  ant.millTime = 0;
  ant.loopingTime = 0;
  ant.loopingAnchor = null;
  ant.confusionTime = 0;
  ant.speedPxS = controls.V_SEARCH_CM_S * world.metrics.pxPerCm;
  ant.wanderHeading = ant.heading;
};

const computePathReinforcementIndex = (ant, ants, world) => {
  const exploratoryConcentration = sampleField(
    world.field,
    ant.position.x,
    ant.position.y,
  );
  const recruitmentConcentration = sampleField(
    world.recruitmentField,
    ant.position.x,
    ant.position.y,
  );
  const crowding = computeNeighborCrowding(ant, ants, world);

  return Math.log10(
    (exploratoryConcentration + recruitmentConcentration * 0.18) *
      (1 + crowding * MILL_CROWD_WEIGHT) +
      1e-4,
  );
};

const resolveMillAnchor = (ant, ants, world) => {
  let centroid = { x: 0, y: 0 };
  let count = 0;
  const radiusLimit = world.metrics.perceptionRadiusPx * 1.4;

  ants.forEach((other) => {
    if (other === ant || other.state === "reserve") {
      return;
    }

    if (distance(ant.position, other.position) > radiusLimit) {
      return;
    }

    centroid = add(centroid, other.position);
    count += 1;
  });

  if (count === 0) {
    return ant.millAnchor || { ...ant.position };
  }

  const nextAnchor = scale(centroid, 1 / count);
  if (!ant.millAnchor) {
    return nextAnchor;
  }

  return {
    x: lerp(ant.millAnchor.x, nextAnchor.x, 0.14),
    y: lerp(ant.millAnchor.y, nextAnchor.y, 0.14),
  };
};

const shouldEnterMill = (
  ant,
  ants,
  world,
  controls,
  localCrowding,
  localConcentrationRatio,
  localGradientRatio,
) => {
  if (
    !controls.ENABLE_MILL ||
    ant.state === "mill" ||
    ant.role !== "outbound" ||
    ant.trailMode !== "exploratory" ||
    ant.foodLinkedRecruitment
  ) {
    return false;
  }

  const outsideBivouac =
    distance(ant.position, world.trail.colony) >
    world.trail.bivouacRadiusPx * 1.4;
  if (
    !outsideBivouac ||
    localCrowding < MILL_CONFUSION_DENSITY ||
    localGradientRatio > MILL_LOW_GRADIENT_RATIO ||
    localConcentrationRatio < PHEROMONE_ACTIVE_CUTOFF_RATIO ||
    ant.separatedTime < MILL_CONFUSION_SECONDS
  ) {
    return false;
  }

  ant.lastRcN = computePathReinforcementIndex(ant, ants, world);
  return ant.lastRcN >= controls.RC_N_THRESHOLD;
};

const shouldExitMill = (ant, ants, world, controls, localCrowding) => {
  if (ant.state !== "mill") {
    return false;
  }

  if (ant.millTime < MILL_MIN_PERSIST_SECONDS) {
    return false;
  }

  const sourceDistanceCm =
    resolveAnySourceDistance(ant, world) /
    Math.max(world.metrics.pxPerCm, 1e-6);
  ant.lastRcN = computePathReinforcementIndex(ant, ants, world);
  return (
    !controls.ENABLE_MILL ||
    sourceDistanceCm <
      controls.BODY_LENGTH_CM * MILL_EXIT_MARGIN_BODY_LENGTHS ||
    localCrowding < MILL_EXIT_DENSITY ||
    ant.lastRcN < controls.RC_N_THRESHOLD - MILL_EXIT_RC_MARGIN
  );
};

const steerInsideBounds = (ant, world) => {
  const margin = world.metrics.bodyLengthPx * 1.8;
  let correction = { x: 0, y: 0 };

  if (ant.position.x < margin) {
    correction.x += 1;
  } else if (ant.position.x > world.width - margin) {
    correction.x -= 1;
  }

  if (ant.position.y < margin) {
    correction.y += 1;
  } else if (ant.position.y > world.height - margin) {
    correction.y -= 1;
  }

  return correction.x === 0 && correction.y === 0
    ? null
    : normalize(correction, angleToVector(ant.heading));
};

const updateReserveAnt = (ant, world, controls, dt) => {
  ant.reserveTime += dt;
  ant.arousalTime = Math.max(0, ant.arousalTime - dt * 0.5);
  const toColony = subtract(world.trail.colony, ant.position);
  const distToColony = Math.max(length(toColony), 1e-6);
  const inwardDir = scale(toColony, 1 / distToColony);
  const outwardDir = scale(inwardDir, -1);
  const tangentDir = rotate(inwardDir, ant.stageOffset % 2 > 1 ? 1.2 : -1.2);
  const innerShellPx =
    world.trail.bivouacRadiusPx * BIVOUAC_RESERVE_SHELL_INNER_RATIO;
  const outerShellPx =
    world.trail.bivouacRadiusPx * BIVOUAC_RESERVE_SHELL_OUTER_RATIO;
  const shellCenterPx = (innerShellPx + outerShellPx) * 0.5;
  const shellHalfWidthPx = Math.max((outerShellPx - innerShellPx) * 0.5, 1e-6);
  const shellOffset = clamp(
    (distToColony - shellCenterPx) / shellHalfWidthPx,
    -1,
    1,
  );
  const radialCorrection =
    shellOffset < 0
      ? scale(outwardDir, Math.abs(shellOffset))
      : scale(inwardDir, Math.abs(shellOffset));
  const desired = normalize(
    add(scale(tangentDir, 0.55), scale(radialCorrection, 1.15)),
    angleToVector(ant.heading),
  );
  ant.heading = turnToward(ant.heading, vectorToAngle(desired), dt * 1.8);
  ant.memoryHeading = ant.heading;
  ant.speedPxS = lerp(
    ant.speedPxS,
    MIN_CRUISE_SPEED_CM_S * world.metrics.pxPerCm * 0.18,
    0.2,
  );
  ant.position = add(
    ant.position,
    scale(angleToVector(ant.heading), ant.speedPxS * dt),
  );
};

const updateMillAnt = (ant, ants, world, controls, dt) => {
  const previousPosition = { ...ant.position };
  if (
    applyFoodDiscovery(ant, resolveFoodPatchOverlap(world, ant.position), {
      world,
      source: "mill-overlap",
    })
  ) {
    ant.state = "trail";
    ant.millTime = 0;
    ant.millAnchor = null;
    return;
  }

  const sensors = senseAntennae(ant, world);
  const localCrowding = computeNeighborCrowding(ant, ants, world);
  const avoidance = computeAvoidance(ant, ants, world);
  const boundary = steerInsideBounds(ant, world);
  ant.millTime += dt;
  ant.millAnchor = resolveMillAnchor(ant, ants, world);

  const anchorOffset = subtract(ant.position, ant.millAnchor);
  const anchorRadius = Math.max(length(anchorOffset), 1e-6);
  const radialDir = scale(anchorOffset, 1 / anchorRadius);
  const tangentDir = rotate(
    radialDir,
    ant.millDirection >= 0 ? Math.PI * 0.5 : -Math.PI * 0.5,
  );
  const preferredRingRadius = Math.max(
    world.metrics.eyeRadiusPx * MILL_RING_TARGET_RATIO,
    world.metrics.collisionRadiusPx * 2.2,
  );
  const radialError = clamp(
    (anchorRadius - preferredRingRadius) / Math.max(preferredRingRadius, 1e-6),
    -1,
    1,
  );
  const radialCorrection = scale(
    radialDir,
    -radialError * MILL_RADIAL_CORRECTION_WEIGHT,
  );
  const desired = normalize(
    add(
      add(
        scale(tangentDir, MILL_TANGENT_WEIGHT),
        scale(sensors.gradientDir, MILL_GRADIENT_WEIGHT),
      ),
      add(
        add(
          scale(radialCorrection, 1),
          scale(angleToVector(ant.memoryHeading), MILL_MEMORY_WEIGHT),
        ),
        add(
          scale(avoidance.vector, avoidance.active ? 0.72 : 0),
          boundary ? scale(boundary, 1.1) : { x: 0, y: 0 },
        ),
      ),
    ),
    tangentDir,
  );

  ant.heading = turnToward(
    ant.heading,
    vectorToAngle(desired),
    ((Math.max(controls.U_P_DEG_S, HARD_COLLISION_TURN_DEG_S) * Math.PI) /
      180) *
      dt,
  );
  ant.memoryHeading = turnToward(ant.memoryHeading, ant.heading, dt * 2.2);
  ant.speedPxS = lerp(
    ant.speedPxS,
    Math.max(controls.V_SEARCH_CM_S, controls.V_MAX_CM_S * 0.82) *
      world.metrics.pxPerCm,
    0.18,
  );
  ant.position = add(
    ant.position,
    scale(angleToVector(ant.heading), ant.speedPxS * dt),
  );

  if (
    applyFoodDiscovery(
      ant,
      resolveFoodPatchContact(world, previousPosition, ant.position),
      {
        world,
        source: "mill-segment",
      },
    )
  ) {
    ant.state = "trail";
    ant.millTime = 0;
    ant.millAnchor = null;
    return;
  }

  depositField(
    world.field,
    ant.position.x,
    ant.position.y,
    (MILL_DEPOSIT_BASE + localCrowding * 0.04) *
      (0.9 + world.frontCongestion * 0.25) *
      Math.max(dt, 0),
    world.metrics.collisionRadiusPx * 1.7,
  );
};

const updateTrailAnt = (ant, ants, world, controls, dt) => {
  if (
    ant.role === "inbound" &&
    ant.knowsFoodLocation &&
    ant.foodLinkedRecruitment &&
    isInsideBivouac(ant, world, INFORMED_RECRUITER_TURNAROUND_BIVOUAC_SCALE)
  ) {
    performInformedRecruiterTurnaround(
      ant,
      world,
      controls,
      "pre-deposit-bivouac-touch",
    );
    return;
  }

  if (
    applyFoodDiscovery(ant, resolveFoodPatchOverlap(world, ant.position), {
      world,
      source: "trail-overlap",
    })
  ) {
    return;
  }

  const sensors = senseAntennae(ant, world);
  const target = resolveRoleTarget(ant, world);
  const localCrowding = computeNeighborCrowding(ant, ants, world);
  const tactileSignal = computeNeighborFlow(ant, ants, world);
  const foodCue = sampleFoodPatchCue(world, ant.position);
  const baseGoalDir = normalize(
    subtract(target, ant.position),
    angleToVector(ant.heading),
  );
  const avoidance = computeAvoidance(ant, ants, world);
  const boundary = steerInsideBounds(ant, world);
  const localConcentrationRatio = clamp(
    sensors.center / Math.max(world.field.saturationConcentration, 1e-3),
    0,
    1,
  );
  const localRecruitmentRatio = clamp(
    sampleField(world.recruitmentField, ant.position.x, ant.position.y) /
      Math.max(world.recruitmentField.saturationConcentration, 1e-3),
    0,
    1,
  );
  const localGradientRatio = clamp(
    Math.abs(sensors.right - sensors.left) /
      Math.max(world.field.saturationConcentration, 1e-3),
    0,
    1,
  );
  const exploratoryTrailLockRatio =
    ant.role === "outbound" && ant.trailMode === "exploratory"
      ? clamp(
          (localConcentrationRatio - EXPLORATORY_TRAIL_LOCK_THRESHOLD) /
            Math.max(EXPLORATORY_TRAIL_ESCAPE_BAND, 1e-6),
          0,
          1,
        )
      : 0;
  const colonyDistancePx = distance(ant.position, world.trail.colony);
  const fieldGuidanceRamp = clamp(
    world.time / Math.max(INITIAL_FIELD_GUIDANCE_RAMP_S, 1e-6),
    0,
    1,
  );
  const directedRecruitment = ant.trailMode === "recruitment";
  const secondaryRecruitment = directedRecruitment && !ant.knowsFoodLocation;
  const recruitmentDirection = tactileSignal.recruitmentDirection;
  const recruitmentTargetFoodPatchIndex =
    tactileSignal.recruitmentTargetFoodPatchIndex;
  const recruitmentTargetFoodPatchId =
    tactileSignal.recruitmentTargetFoodPatchId;
  const recruitmentSignalStrength = Math.max(
    localRecruitmentRatio,
    tactileSignal.recruitmentCue,
  );
  const distalTactileRecruitmentContact =
    tactileSignal.recruitmentCue > SECONDARY_RECRUITMENT_SIGNAL_THRESHOLD &&
    colonyDistancePx > world.trail.bivouacRadiusPx * 1.45;
  const exploratoryRecruitmentContact =
    ant.role === "outbound" &&
    ant.trailMode === "exploratory" &&
    (localRecruitmentRatio > RECRUITMENT_RETENTION_SIGNAL_THRESHOLD ||
      distalTactileRecruitmentContact);
  const recruitmentFieldContactOnly =
    ant.role === "outbound" &&
    ant.trailMode === "exploratory" &&
    localRecruitmentRatio > RECRUITMENT_RETENTION_SIGNAL_THRESHOLD;
  const virginRatio = 1 - localConcentrationRatio;
  const colonyDistanceCm =
    colonyDistancePx / Math.max(world.metrics.pxPerCm, 1e-6);
  const recruitmentReleaseBlend = clamp(
    colonyDistancePx /
      Math.max(
        world.metrics.bodyLengthsToPx(OUTBOUND_RELEASE_RELAX_BODY_LENGTHS),
        1e-6,
      ),
    0,
    1,
  );
  const outboundReleaseBlend =
    ant.role === "outbound"
      ? clamp(
          colonyDistancePx /
            Math.max(
              world.metrics.bodyLengthsToPx(
                OUTBOUND_RELEASE_RELAX_BODY_LENGTHS,
              ),
              1e-6,
            ),
          0,
          1,
        )
      : 1;
  const goalWeight =
    GOAL_PULL_WEIGHT *
    (ant.role === "outbound"
      ? OUTBOUND_RELEASE_GOAL_DAMP +
        (1 - OUTBOUND_RELEASE_GOAL_DAMP) * outboundReleaseBlend
      : 1) *
    (secondaryRecruitment ? SECONDARY_RECRUITMENT_GOAL_DAMP : 1) *
    (directedRecruitment ? FOOD_LINKED_RECRUITMENT_GOAL_BOOST : 1);
  const frontAdvanceDamp =
    ant.role === "outbound" && ant.trailMode === "exploratory"
      ? FRONT_EXPLORATORY_ADVANCE_BASE *
        (1 - world.frontCongestion * FRONT_CONGESTION_GOAL_DAMP) *
        (1 + exploratoryTrailLockRatio * 0.9)
      : 1;
  const exploratoryLateralSpread =
    ant.role === "outbound" && ant.trailMode === "exploratory"
      ? FRONT_EXPLORATORY_LATERAL_SPREAD * (0.6 + world.frontCongestion * 0.8) +
        exploratoryTrailLockRatio * EXPLORATORY_TRAIL_ESCAPE_SPREAD_BOOST
      : 0;
  const memoryWeightBase =
    MEMORY_WEIGHT + virginRatio * EXPLORATION_MEMORY_BOOST;
  const memoryWeight =
    memoryWeightBase *
    (ant.role === "outbound"
      ? OUTBOUND_RELEASE_MEMORY_DAMP +
        (1 - OUTBOUND_RELEASE_MEMORY_DAMP) * outboundReleaseBlend
      : 1) *
    (secondaryRecruitment ? SECONDARY_RECRUITMENT_MEMORY_DAMP : 1) *
    (1 - exploratoryTrailLockRatio * EXPLORATORY_TRAIL_ESCAPE_MEMORY_DAMP) *
    (directedRecruitment ? FOOD_LINKED_RECRUITMENT_MEMORY_BOOST : 1);
  const exploratoryFieldScale =
    ant.role === "outbound" && ant.trailMode === "exploratory"
      ? EXPLORATORY_FIELD_RESPONSE_SCALE *
        (0.18 + virginRatio * 0.82) *
        (1 - exploratoryTrailLockRatio * EXPLORATORY_TRAIL_ESCAPE_FIELD_DAMP)
      : 1;
  const gradientWeight =
    GRADIENT_WEIGHT *
    (1 - virginRatio * VIRGIN_TERRITORY_GRADIENT_DAMP) *
    fieldGuidanceRamp *
    (ant.role === "outbound"
      ? OUTBOUND_RELEASE_FIELD_DAMP +
        (1 - OUTBOUND_RELEASE_FIELD_DAMP) * outboundReleaseBlend
      : 1) *
    exploratoryFieldScale *
    (secondaryRecruitment ? SECONDARY_RECRUITMENT_FIELD_BOOST : 1) *
    (directedRecruitment ? FOOD_LINKED_RECRUITMENT_FIELD_BOOST : 1);
  const tropotaxisWeight =
    TROPOTAXIS_WEIGHT *
    fieldGuidanceRamp *
    (ant.role === "outbound"
      ? OUTBOUND_RELEASE_FIELD_DAMP +
        (1 - OUTBOUND_RELEASE_FIELD_DAMP) * outboundReleaseBlend
      : 1) *
    exploratoryFieldScale *
    (secondaryRecruitment ? SECONDARY_RECRUITMENT_FIELD_BOOST : 1) *
    (directedRecruitment ? FOOD_LINKED_RECRUITMENT_FIELD_BOOST : 1);

  if (ant.loopingTime > 0) {
    const previousPosition = { ...ant.position };
    ant.loopingTime = Math.max(0, ant.loopingTime - dt);
    ant.arousalTime = Math.max(ant.arousalTime, AROUSAL_DURATION_S * 0.8);
    ant.trailMode = "recruitment";

    const loopAnchor = ant.loopingAnchor || ant.position;
    const loopAxis = normalize(
      subtract(loopAnchor, world.trail.colony),
      angleToVector(ant.heading),
    );
    const oscillation = Math.sin(
      (world.time * LOOPING_FREQUENCY_HZ + ant.stageOffset * 0.01) *
        Math.PI *
        2,
    );
    const loopTarget = add(loopAnchor, {
      x: loopAxis.x * world.metrics.pxPerCm * LOOPING_RADIUS_CM * oscillation,
      y: loopAxis.y * world.metrics.pxPerCm * LOOPING_RADIUS_CM * oscillation,
    });
    const loopDir = normalize(
      subtract(loopTarget, ant.position),
      angleToVector(ant.heading),
    );
    const anchorPullDir = normalize(
      subtract(loopAnchor, ant.position),
      loopAxis,
    );
    const loopDesired = normalize(
      add(
        add(scale(loopDir, 1.3), scale(anchorPullDir, LOOPING_ANCHOR_PULL)),
        add(
          scale(avoidance.vector, avoidance.active ? 1.1 : 0),
          boundary ? scale(boundary, 1.1) : { x: 0, y: 0 },
        ),
      ),
      loopDir,
    );
    const loopTurn =
      ((Math.max(controls.U_A_OUTBOUND_DEG_S, HARD_COLLISION_TURN_DEG_S) *
        Math.PI) /
        180) *
      dt;
    ant.heading = turnToward(ant.heading, vectorToAngle(loopDesired), loopTurn);
    ant.memoryHeading = turnToward(
      ant.memoryHeading,
      ant.heading,
      loopTurn * 0.5,
    );
    ant.speedPxS = lerp(
      ant.speedPxS,
      controls.V_SEARCH_CM_S *
        world.metrics.pxPerCm *
        FOOD_DISCOVERY_SPEED_BOOST,
      0.2,
    );
    ant.position = add(
      ant.position,
      scale(angleToVector(ant.heading), ant.speedPxS * dt),
    );
    const loopFoodContact = resolveFoodPatchContact(
      world,
      previousPosition,
      ant.position,
    );
    if (
      applyFoodDiscovery(ant, loopFoodContact, {
        world,
        source: "trail-loop-segment",
      })
    ) {
      ant.loopingAnchor = resolveFoodLoopAnchor(ant, loopFoodContact, world);
      ant.loopExitRole = "inbound";
      ant.loopingTime = Math.min(
        ant.loopingTime,
        LOOPING_DURATION_S * FOOD_DISCOVERY_LOOP_DURATION_SCALE * 0.18,
      );
    }
    depositField(
      ant.foodLinkedRecruitment ? world.recruitmentField : world.field,
      ant.position.x,
      ant.position.y,
      RECRUITMENT_DEPOSIT_BASE *
        (1.8 + tactileSignal.recruitmentCue * 0.5 + foodCue.signal * 0.6) *
        (ant.foodLinkedRecruitment ? FOOD_DISCOVERY_LOOP_DEPOSIT_SCALE : 1) *
        Math.max(dt, 0),
      world.metrics.collisionRadiusPx *
        1.5 *
        (ant.foodLinkedRecruitment
          ? FOOD_DISCOVERY_LOOP_DEPOSIT_RADIUS_SCALE
          : 1),
    );

    if (ant.loopingTime <= 0) {
      const exitRole = ant.loopExitRole ?? "inbound";
      const exitHeading = vectorToAngle(
        exitRole === "inbound"
          ? subtract(world.trail.colony, ant.position)
          : angleToVector(ant.memoryHeading),
      );
      ant.role = exitRole;
      ant.trailMode = ant.foodLinkedRecruitment ? "recruitment" : "exploratory";
      ant.arousalTime = AROUSAL_DURATION_S;
      ant.loopingAnchor = null;
      ant.loopExitRole = "inbound";
      ant.loopbackCooldownS = LOOPBACK_COOLDOWN_S;
      ant.heading = exitHeading;
      ant.memoryHeading = exitHeading;
      ant.wanderHeading = exitHeading;
    }
    return;
  }

  ant.arousalTime = Math.max(0, ant.arousalTime - dt);
  ant.loopbackCooldownS = Math.max(0, ant.loopbackCooldownS - dt);
  ant.foodExcitementCooldownS = Math.max(0, ant.foodExcitementCooldownS - dt);
  if (secondaryRecruitment && recruitmentDirection) {
    const recruitmentHeading = vectorToAngle(recruitmentDirection);
    ant.memoryHeading = turnToward(
      ant.memoryHeading,
      recruitmentHeading,
      RECRUITMENT_DIRECTION_MEMORY_BLEND * dt,
    );
    ant.wanderHeading = turnToward(
      ant.wanderHeading,
      recruitmentHeading,
      RECRUITMENT_DIRECTION_MEMORY_BLEND * dt,
    );
  }
  if (
    recruitmentTargetFoodPatchIndex != null &&
    recruitmentTargetFoodPatchIndex >= 0 &&
    ant.role === "outbound"
  ) {
    ant.targetFoodPatchIndex = recruitmentTargetFoodPatchIndex;
    ant.targetFoodPatchId = recruitmentTargetFoodPatchId ?? null;
    if (ant.trailMode === "recruitment") {
      ant.foodLinkedRecruitment = true;
    }
  }

  if (tactileSignal.cue > 0.08) {
    ant.arousalTime = Math.max(
      ant.arousalTime,
      Math.min(RECRUITMENT_CONTACT_AROUSAL_S, tactileSignal.cue * 0.55),
    );
  }
  if (recruitmentFieldContactOnly) {
    if (
      localRecruitmentRatio > RECRUITMENT_RETENTION_SIGNAL_THRESHOLD &&
      ant.foodExcitementCooldownS <= 0 &&
      ant.loopingTime <= 0
    ) {
      logRecruitmentResponse(
        world,
        ant,
        localRecruitmentRatio,
        tactileSignal,
        recruitmentSignalStrength,
        "loop-start",
        "secondary-recruitment",
      );
      startRecruitmentLoop(ant, {
        anchor: ant.position,
        durationScale:
          SECONDARY_RECRUITMENT_LOOP_DURATION_SCALE *
          (0.92 + recruitmentSignalStrength * 0.3),
        arousalTime:
          RECRUITMENT_CONTACT_AROUSAL_S *
          (0.8 + recruitmentSignalStrength * 0.6),
        trailMode: "recruitment",
        foodLinked: false,
        exitRole: "outbound",
      });
      ant.foodExcitementCooldownS = SECONDARY_RECRUITMENT_LOOP_COOLDOWN_S;
      return;
    }
    ant.foodLinkedRecruitment = false;
    ant.trailMode = "recruitment";
    if (
      recruitmentTargetFoodPatchIndex != null &&
      recruitmentTargetFoodPatchIndex >= 0
    ) {
      ant.targetFoodPatchIndex = recruitmentTargetFoodPatchIndex;
      ant.targetFoodPatchId = recruitmentTargetFoodPatchId ?? null;
      ant.foodLinkedRecruitment = true;
    }
    ant.arousalTime = Math.max(
      ant.arousalTime,
      RECRUITMENT_CONTACT_AROUSAL_S * (0.8 + recruitmentSignalStrength * 0.6),
    );
    logRecruitmentResponse(
      world,
      ant,
      localRecruitmentRatio,
      tactileSignal,
      recruitmentSignalStrength,
      "switch-recruitment",
      ant.foodExcitementCooldownS > 0 ? "cooldown-active" : "direct-switch",
    );
  } else if (exploratoryRecruitmentContact) {
    ant.trailMode = "recruitment";
    ant.foodLinkedRecruitment = false;
    if (
      recruitmentTargetFoodPatchIndex != null &&
      recruitmentTargetFoodPatchIndex >= 0
    ) {
      ant.targetFoodPatchIndex = recruitmentTargetFoodPatchIndex;
      ant.targetFoodPatchId = recruitmentTargetFoodPatchId ?? null;
      ant.foodLinkedRecruitment = true;
    }
    ant.arousalTime = Math.max(
      ant.arousalTime,
      RECRUITMENT_CONTACT_AROUSAL_S * (0.7 + recruitmentSignalStrength * 0.75),
    );
    logRecruitmentResponse(
      world,
      ant,
      localRecruitmentRatio,
      tactileSignal,
      recruitmentSignalStrength,
      "switch-recruitment",
      distalTactileRecruitmentContact
        ? "tactile-switch"
        : ant.foodExcitementCooldownS > 0
          ? "cooldown-switch"
          : "field-edge-switch",
    );
  }
  ant.trappedTime =
    ant.role === "outbound" &&
    !directedRecruitment &&
    distance(ant.position, world.trail.colony) <
      world.trail.sourceRadiusPx * 1.2 &&
    localConcentrationRatio > 0.24
      ? ant.trappedTime + dt
      : Math.max(0, ant.trappedTime - dt * 2);
  if (
    ant.role === "outbound" &&
    !directedRecruitment &&
    ant.trappedTime >= TRAP_ESCAPE_SECONDS
  ) {
    ant.memoryHeading = wrapAngle(
      ant.memoryHeading + sampleGaussian() * controls.SENSORY_NOISE_RAD,
    );
    ant.wanderHeading = ant.memoryHeading;
    ant.trappedTime = 0;
  }
  const shouldLoopBack =
    ant.role === "outbound" &&
    !directedRecruitment &&
    ant.loopbackCooldownS <= 0 &&
    colonyDistanceCm >= LOOPBACK_DISTANCE_CM &&
    (() => {
      const sectorPressure = resolveOutboundSectorPressure(
        ant,
        world,
        world.trail.bivouacRadiusPx * 1.15,
      );
      const lowPheromoneLoopback =
        localConcentrationRatio <= LOOPBACK_LOW_PHEROMONE_RATIO &&
        Math.random() < LOOPBACK_CHANCE_PER_S * dt;
      const pressureLoopback =
        sectorPressure.overrepresented &&
        Math.random() <
          clamp(
            (sectorPressure.sectorPressure -
              SECTOR_LOOP_PRESSURE_THRESHOLD +
              1) *
              SECTOR_LOOPBACK_PRESSURE_CHANCE_PER_S *
              dt,
            0,
            0.35,
          );
      return lowPheromoneLoopback || pressureLoopback;
    })();
  if (shouldLoopBack) {
    const loopbackHeading = wrapAngle(
      ant.heading +
        Math.PI +
        sampleGaussian() * controls.SENSORY_NOISE_RAD * 0.35,
    );
    ant.heading = loopbackHeading;
    ant.memoryHeading = loopbackHeading;
    ant.wanderHeading = loopbackHeading;
    ant.loopbackCooldownS = LOOPBACK_COOLDOWN_S;
  }
  const arousalTurn =
    ant.arousalTime > 0
      ? Math.sin(world.time * 8 + ant.stageOffset * 0.01) *
        AROUSAL_LOOP_TURN_RAD *
        (directedRecruitment ? 0.28 : 1)
      : 0;
  const goalDir = normalize(rotate(baseGoalDir, arousalTurn), baseGoalDir);
  const radialOutDir = normalize(
    subtract(ant.position, world.trail.colony),
    angleToVector(ant.heading),
  );
  const tangentialSpreadDir = rotate(
    radialOutDir,
    ant.stageOffset % 2 > 1 ? Math.PI * 0.5 : -Math.PI * 0.5,
  );
  const trailAxis = normalize(
    foodCue.patch?.position
      ? subtract(foodCue.patch.position, world.trail.colony)
      : subtract(target, world.trail.colony),
    radialOutDir,
  );
  const trailLateralDir = rotate(trailAxis, Math.PI * 0.5);
  const desiredLaneOffsetPx =
    ant.role === "inbound"
      ? 0
      : world.metrics.bodyLengthsToPx(TRAIL_LANE_OFFSET_BODY_LENGTHS) *
        (ant.stageOffset % 2 > 1 ? 1 : -1);
  const currentLaneOffsetPx = dot(
    subtract(ant.position, world.trail.colony),
    trailLateralDir,
  );
  const laneCorrection = clamp(
    (desiredLaneOffsetPx - currentLaneOffsetPx) /
      Math.max(world.metrics.bodyLengthsToPx(4), 1e-6),
    -1,
    1,
  );
  const laneBias = scale(
    trailLateralDir,
    laneCorrection *
      (ant.role === "inbound"
        ? INBOUND_LANE_BIAS_WEIGHT
        : OUTBOUND_LANE_BIAS_WEIGHT) *
      (directedRecruitment ? FOOD_LINKED_RECRUITMENT_LANE_BIAS_BOOST : 1),
  );
  const informedInboundNearBivouac =
    ant.role === "inbound" &&
    ant.knowsFoodLocation &&
    ant.foodLinkedRecruitment &&
    colonyDistancePx <= world.trail.bivouacRadiusPx * 1.35;
  if (informedInboundNearBivouac) {
    logBivouacSteering(world, ant, {
      colonyDistancePx,
      laneCorrection,
      laneBiasMag: length(laneBias),
      avoidanceMag: avoidance.active ? length(avoidance.vector) : 0,
      opposingTraffic: avoidance.opposingTraffic,
      radialGoalAlignment: dot(
        goalDir,
        normalize(subtract(world.trail.colony, ant.position), goalDir),
      ),
      tangentialGoalAlignment: dot(goalDir, trailLateralDir),
    });
  }
  const informedInboundAvoidanceWeight = informedInboundNearBivouac
    ? 0
    : avoidance.active
      ? 1.2 + avoidance.opposingTraffic * 0.16
      : 0;
  ant.wanderHeading = turnToward(
    ant.wanderHeading,
    wrapAngle(
      ant.memoryHeading +
        sampleGaussian() *
          controls.SENSORY_NOISE_RAD *
          (directedRecruitment ? 0.14 : 0.4),
    ),
    (directedRecruitment ? 0.4 : 0.9 + virginRatio * 1.4) * dt,
  );
  const wanderDir = angleToVector(ant.wanderHeading);
  const wanderWeight =
    (EXPLORATION_WANDER_WEIGHT +
      virginRatio * LOW_PHEROMONE_WANDER_BOOST +
      (1 - localConcentrationRatio) * 0.18 +
      (ant.role === "outbound"
        ? (1 - outboundReleaseBlend) * OUTBOUND_RELEASE_WANDER_BOOST
        : 0) +
      exploratoryTrailLockRatio * EXPLORATORY_TRAIL_ESCAPE_WANDER_BOOST) *
    (secondaryRecruitment ? SECONDARY_RECRUITMENT_WANDER_DAMP : 1) *
    (directedRecruitment ? FOOD_LINKED_RECRUITMENT_WANDER_SCALE : 1);

  const desired = normalize(
    add(
      add(
        add(
          scale(goalDir, goalWeight * frontAdvanceDamp),
          add(
            add(
              scale(sensors.gradientDir, gradientWeight),
              scale(sensors.tropotaxisDir, tropotaxisWeight),
            ),
            add(
              scale(
                foodCue.direction || goalDir,
                ant.role === "outbound"
                  ? foodCue.signal *
                      (localCrowding >= FOOD_OVERRUN_CROWDING ? 0.4 : 1)
                  : 0,
              ),
              scale(
                recruitmentDirection || goalDir,
                secondaryRecruitment
                  ? recruitmentSignalStrength *
                      RECRUITMENT_DIRECTION_WEIGHT *
                      SECONDARY_RECRUITMENT_DIRECTION_BOOST
                  : 0,
              ),
              scale(wanderDir, wanderWeight),
              add(
                scale(
                  radialOutDir,
                  ant.role === "outbound" && !directedRecruitment
                    ? (1 - outboundReleaseBlend) * OUTBOUND_RADIAL_BIAS_WEIGHT
                    : 0,
                ),
                scale(
                  radialOutDir,
                  ant.role === "outbound" && !directedRecruitment
                    ? exploratoryTrailLockRatio *
                        EXPLORATORY_TRAIL_ESCAPE_RADIAL_BOOST
                    : 0,
                ),
                scale(
                  tangentialSpreadDir,
                  ant.role === "outbound" && !directedRecruitment
                    ? (1 - outboundReleaseBlend) *
                        OUTBOUND_TANGENTIAL_SPREAD_WEIGHT +
                        exploratoryLateralSpread
                    : 0,
                ),
                scale(
                  radialOutDir,
                  ant.role === "outbound" &&
                    foodCue.signal > 0.2 &&
                    localCrowding >= FOOD_OVERRUN_CROWDING
                    ? foodCue.signal * 0.55
                    : 0,
                ),
              ),
            ),
          ),
        ),
        add(
          scale(angleToVector(ant.memoryHeading), memoryWeight),
          add(laneBias, boundary ? scale(boundary, 1.1) : { x: 0, y: 0 }),
        ),
      ),
      scale(avoidance.vector, informedInboundAvoidanceWeight),
    ),
    goalDir,
  );

  const finalNoiseScale =
    ant.state === "mill"
      ? MILL_FINAL_NOISE_SCALE
      : directedRecruitment
        ? RECRUITMENT_FINAL_NOISE_SCALE
        : 1;
  const noise = sampleGaussian() * controls.SENSORY_NOISE_RAD * finalNoiseScale;
  const targetHeading = vectorToAngle(rotate(desired, noise));
  const maxTurn =
    ((avoidance.hardCollision
      ? HARD_COLLISION_TURN_DEG_S
      : avoidance.active
        ? ant.role === "outbound"
          ? controls.U_A_OUTBOUND_DEG_S
          : controls.U_A_INBOUND_DEG_S
        : controls.U_P_DEG_S) *
      Math.PI *
      dt) /
    180;
  ant.heading = turnToward(ant.heading, targetHeading, maxTurn);
  ant.memoryHeading = turnToward(
    ant.memoryHeading,
    ant.heading,
    maxTurn *
      (ant.role === "outbound" ? OUTBOUND_MEMORY_BLEND : INBOUND_MEMORY_BLEND),
  );

  const speedCmS = computeSigmoidSpeed(
    sensors.center,
    world.field.saturationConcentration,
    controls,
  );
  const desiredSpeedPxS =
    lerp(MIN_CRUISE_SPEED_CM_S, speedCmS, localConcentrationRatio) *
    world.metrics.pxPerCm *
    (ant.role === "outbound" && ant.trailMode === "exploratory"
      ? FRONT_EXPLORATORY_SPEED_BASE *
        (1 - world.frontCongestion * FRONT_CONGESTION_SPEED_DAMP)
      : 1);
  ant.speedPxS = lerp(ant.speedPxS, desiredSpeedPxS, 0.18);
  const trailStepStartPosition = { ...ant.position };
  ant.position = add(
    ant.position,
    scale(angleToVector(ant.heading), ant.speedPxS * dt),
  );
  const movedFoodContact = resolveFoodPatchContact(
    world,
    trailStepStartPosition,
    ant.position,
  );
  if (
    applyFoodDiscovery(ant, movedFoodContact, {
      world,
      source: "trail-segment",
    })
  ) {
    return;
  }

  const trailDeposit = computeTrailDeposit(
    ant,
    localCrowding,
    world,
    controls,
    dt,
  );
  const recruitmentDepositor =
    ant.trailMode === "recruitment" && ant.knowsFoodLocation;
  const recruitmentDepositScale = directedRecruitment
    ? ant.knowsFoodLocation
      ? ant.role === "outbound"
        ? FOOD_LINKED_OUTBOUND_DEPOSIT_SCALE
        : FOOD_LINKED_INBOUND_DEPOSIT_SCALE
      : FOOD_LINKED_OUTBOUND_DEPOSIT_SCALE * SECONDARY_RECRUITMENT_DEPOSIT_SCALE
    : 1;
  const recruitmentDepositRadiusScale = directedRecruitment
    ? ant.knowsFoodLocation
      ? ant.role === "outbound"
        ? FOOD_LINKED_OUTBOUND_DEPOSIT_RADIUS_SCALE
        : FOOD_LINKED_INBOUND_DEPOSIT_RADIUS_SCALE
      : FOOD_LINKED_OUTBOUND_DEPOSIT_RADIUS_SCALE *
        SECONDARY_RECRUITMENT_DEPOSIT_RADIUS_SCALE
    : 1;
  const nearColonyDepositScale = recruitmentDepositor
    ? OUTBOUND_NEAR_COLONY_DEPOSIT_DAMP +
      (1 - OUTBOUND_NEAR_COLONY_DEPOSIT_DAMP) * recruitmentReleaseBlend
    : ant.role === "outbound"
      ? OUTBOUND_NEAR_COLONY_DEPOSIT_DAMP +
        (1 - OUTBOUND_NEAR_COLONY_DEPOSIT_DAMP) * outboundReleaseBlend
      : 1;
  const exploratoryDepositScale =
    ant.role === "outbound" && ant.trailMode === "exploratory"
      ? EXPLORATORY_DEPOSIT_SCALE
      : 1;
  const exploratoryTrailFeedbackScale =
    ant.role === "outbound" && ant.trailMode === "exploratory"
      ? clamp(
          EXPLORATORY_VIRGIN_DEPOSIT_FLOOR +
            Math.pow(virginRatio, EXPLORATORY_TRAIL_FEEDBACK_EXPONENT) *
              EXPLORATORY_TRAIL_DEPOSIT_BOOST,
          EXPLORATORY_VIRGIN_DEPOSIT_FLOOR,
          1,
        )
      : 1;
  const exploratoryCoreDepositScale =
    ant.role === "outbound" && ant.trailMode === "exploratory"
      ? clamp(
          0.42 +
            (colonyDistancePx - world.trail.bivouacRadiusPx) /
              Math.max(
                world.metrics.bodyLengthsToPx(
                  EXPLORATORY_CORE_DEPOSIT_RAMP_BODY_LENGTHS,
                ),
                1e-6,
              ),
          0.42,
          1,
        )
      : 1;

  depositField(
    recruitmentDepositor ? world.recruitmentField : world.field,
    ant.position.x,
    ant.position.y,
    trailDeposit.amount *
      nearColonyDepositScale *
      exploratoryDepositScale *
      exploratoryTrailFeedbackScale *
      exploratoryCoreDepositScale *
      recruitmentDepositScale,
    trailDeposit.radiusPx * recruitmentDepositRadiusScale,
  );

  ant.trailDistanceCm =
    resolveAnySourceDistance(ant, world) / world.metrics.pxPerCm;
  ant.separatedTime =
    ant.trailDistanceCm >
    controls.BODY_LENGTH_CM * MILL_ENTRY_DISTANCE_BODY_LENGTHS
      ? ant.separatedTime + dt
      : Math.max(0, ant.separatedTime - dt * 2);

  if (
    shouldEnterMill(
      ant,
      ants,
      world,
      controls,
      localCrowding,
      localConcentrationRatio,
      localGradientRatio,
    )
  ) {
    ant.state = "mill";
    ant.millTime = 0;
    ant.millAnchor = resolveMillAnchor(ant, ants, world);
    ant.millDirection = ant.millDirection || (Math.random() > 0.5 ? 1 : -1);
  }
};

const updateAnt = (ant, ants, world, controls, dt) => {
  if (ant.state === "reserve") {
    updateReserveAnt(ant, world, controls, dt);
    ant.position.x = clamp(ant.position.x, 0, world.width);
    ant.position.y = clamp(ant.position.y, 0, world.height);
    return;
  }

  if (ant.state === "mill") {
    const localCrowding = computeNeighborCrowding(ant, ants, world);
    if (shouldExitMill(ant, ants, world, controls, localCrowding)) {
      ant.state = "trail";
      ant.millTime = 0;
      ant.millAnchor = null;
      ant.wanderHeading = ant.heading;
    } else {
      updateMillAnt(ant, ants, world, controls, dt);
    }
  } else {
    ant.state = "trail";
    ant.confusionTime = 0;
    ant.millTime = 0;
    ant.millAnchor = null;
    updateTrailAnt(ant, ants, world, controls, dt);
  }

  ant.position.x = clamp(ant.position.x, 0, world.width);
  ant.position.y = clamp(ant.position.y, 0, world.height);
  updateRoleSwap(ant, world, controls);
};

const stepWorld = (world, controls, dt) => {
  syncAntPopulation(world, controls);
  world.time += dt;
  updateColonyState(world, dt);
  world.reserveReleaseAccumulator += dt;
  releaseReserveAnts(world, controls);
  world.ants.forEach((ant) => updateAnt(ant, world.ants, world, controls, dt));
  updateFrontCongestion(world);

  world.fieldUpdateAccumulator += dt;
  if (world.fieldUpdateAccumulator >= FIELD_UPDATE_INTERVAL_S) {
    updateField(world, controls, world.fieldUpdateAccumulator);
    world.fieldUpdateAccumulator = 0;
  }
};

const drawPheromoneField = (p5, world) => {
  clearTransparentP5(p5);
  p5.noStroke();
  const drawFieldLayer = (
    field,
    red,
    green,
    blue,
    activeAlphaScale,
    residualAlphaBase,
    residualAlphaScale,
    noiseCutoffRatio = PHEROMONE_NOISE_CUTOFF_RATIO,
    activeCutoffRatio = PHEROMONE_ACTIVE_CUTOFF_RATIO,
  ) => {
    const noiseCutoff = field.saturationConcentration * noiseCutoffRatio;
    const activeCutoff = field.saturationConcentration * activeCutoffRatio;

    for (let row = 0; row < field.rows; row += 1) {
      for (let column = 0; column < field.cols; column += 1) {
        const value = field.values[getFieldIndex(field, column, row)];
        if (value <= noiseCutoff) {
          continue;
        }

        const activeIntensity = clamp(
          (value - activeCutoff) /
            Math.max(field.activeConcentration - activeCutoff, 1e-3),
          0,
          1,
        );
        const residualIntensity = clamp(
          (value - noiseCutoff) / Math.max(activeCutoff - noiseCutoff, 1e-3),
          0,
          1,
        );
        const isActive = value >= activeCutoff;
        const alpha = isActive
          ? 36 + activeIntensity * activeAlphaScale
          : residualAlphaBase + residualIntensity * residualAlphaScale;
        p5.fill(red, green, blue, alpha);
        p5.rect(
          column * field.cellSizePx,
          row * field.cellSizePx,
          field.cellSizePx,
          field.cellSizePx,
        );
      }
    }
  };

  if (world.foodPatches.length === 0) {
    drawFieldLayer(world.field, 111, 196, 122, 28, 0, 3, 0.025, 0.16);
  } else {
    drawFieldLayer(world.field, 111, 196, 122, 28, 2, 6, 0.016, 0.095);
  }
  drawFieldLayer(
    world.recruitmentField,
    239,
    129,
    65,
    220,
    10,
    32,
    0.003,
    0.012,
  );
};

const drawBivouac = (p5, world) => {
  p5.push();
  p5.noFill();
  p5.strokeWeight(1.25);
  p5.stroke(76, 88, 92, 64);
  p5.circle(
    world.trail.colony.x,
    world.trail.colony.y,
    world.trail.bivouacRadiusPx * 2.08,
  );
  p5.stroke(76, 88, 92, 34);
  p5.circle(
    world.trail.colony.x,
    world.trail.colony.y,
    world.trail.bivouacRadiusPx * 2.52,
  );
  p5.pop();
};

const drawAnt = (p5, ant, world, spriteSheet, frameSize, nowMs) => {
  const velocity = angleToVector(ant.heading);
  const sprite = resolveCanvasAtlasSprite(ATLAS, {
    space: "2d",
    position: ant.position,
    velocity,
    previousScreenPosition: ant.previousScreenPosition,
    maxDt: 1 / 60,
    width: world.width,
    height: world.height,
    state: { bridgeLock: ant.bridgeLock },
    profile: "swarm",
    timestampMs: nowMs,
    animationOffsetMs: ant.stageOffset,
  });
  const drawWidth = world.metrics.bodyLengthsToPx(ANT_SPRITE_BODY_LENGTHS);
  const drawHeight =
    drawWidth * (frameSize.height / Math.max(frameSize.width, 1));
  const sourceX = sprite.frame.x * frameSize.width;
  const sourceY = sprite.frame.y * frameSize.height;
  const arousalLift =
    ant.arousalTime > 0
      ? Math.sin(nowMs * 0.024 + ant.stageOffset * 0.01) *
        world.metrics.bodyLengthsToPx(0.18)
      : 0;

  ant.previousScreenPosition = sprite.pose.screenPosition;

  if (!spriteSheet) {
    p5.push();
    p5.translate(ant.position.x, ant.position.y + arousalLift);
    p5.rotate(ant.heading);
    p5.noStroke();
    p5.fill(70, 42, 18, ant.state === "mill" ? 230 : 210);
    p5.ellipse(
      0,
      0,
      world.metrics.bodyLengthsToPx(1.05),
      world.metrics.bodyLengthsToPx(0.52),
    );
    p5.pop();
    return;
  }

  p5.push();
  p5.translate(ant.position.x, ant.position.y + arousalLift);
  p5.rotate(sprite.rotation ?? ant.heading);
  p5.scale(sprite.flipX ?? 1, 1);
  if (ant.state === "mill") {
    p5.tint(228, 112, 62, 235);
  } else if (ant.trailMode === "recruitment") {
    p5.tint(255, 232, 205, 235);
  } else {
    p5.noTint();
  }
  p5.drawingContext.drawImage(
    spriteSheet,
    sourceX,
    sourceY,
    frameSize.width,
    frameSize.height,
    -drawWidth * 0.5,
    -drawHeight * 0.5,
    drawWidth,
    drawHeight,
  );
  p5.pop();
};

const drawWorld = (p5, world, spriteSheet, frameSize) => {
  drawPheromoneField(p5, world);
  drawBivouac(p5, world);
  world.foodPatches.forEach((patch) => {
    p5.push();
    p5.noStroke();
    p5.fill(242, 196, 72, 170);
    p5.circle(patch.position.x, patch.position.y, patch.radiusPx * 2);
    p5.pop();
  });
  const nowMs = world.time * 1000;

  world.ants.forEach((ant) => {
    if (ant.state === "reserve") {
      return;
    }
    drawAnt(p5, ant, world, spriteSheet, frameSize, nowMs);
  });
};

const sanitizeControlState = (rawControls = DEFAULT_CONTROL_STATE) => {
  const next = {
    ...DEFAULT_CONTROL_STATE,
    ...(rawControls ?? {}),
  };

  next.AGENT_COUNT = Math.round(
    clamp(next.AGENT_COUNT, SIMULATED_RAIDERS_MIN, SIMULATED_RAIDERS_MAX),
  );
  next.V_SEARCH_CM_S = clamp(
    next.V_SEARCH_CM_S,
    bodyLengthsPerSecondToCmPerSecond(4.5, next.BODY_LENGTH_CM),
    bodyLengthsPerSecondToCmPerSecond(
      MAX_SPEED_BODY_LENGTHS_S,
      next.BODY_LENGTH_CM,
    ),
  );
  next.V_MAX_CM_S = clamp(
    next.V_MAX_CM_S,
    bodyLengthsPerSecondToCmPerSecond(7, next.BODY_LENGTH_CM),
    bodyLengthsPerSecondToCmPerSecond(
      MAX_SPEED_BODY_LENGTHS_S,
      next.BODY_LENGTH_CM,
    ),
  );
  next.U_P_DEG_S = clamp(next.U_P_DEG_S, 100, 900);
  next.U_A_INBOUND_DEG_S = clamp(next.U_A_INBOUND_DEG_S, 800, 1600);
  next.U_A_OUTBOUND_DEG_S = clamp(next.U_A_OUTBOUND_DEG_S, 800, 1600);
  next.U_A_INBOUND_DEG_S = Math.max(
    next.U_A_INBOUND_DEG_S,
    HARD_COLLISION_TURN_DEG_S,
  );
  next.U_A_OUTBOUND_DEG_S = Math.max(
    next.U_A_OUTBOUND_DEG_S,
    HARD_COLLISION_TURN_DEG_S,
  );
  next.V_MAX_CM_S = Math.max(next.V_MAX_CM_S, next.V_SEARCH_CM_S);
  next.RC_N_THRESHOLD = clamp(next.RC_N_THRESHOLD, -3, 0);
  next.GRADIENT_COUPLING_B = clamp(next.GRADIENT_COUPLING_B, 2, 20);
  next.PHEROMONE_HALF_LIFE_MIN = clamp(next.PHEROMONE_HALF_LIFE_MIN, 12, 72);
  next.TIME_ACCELERATION = Math.round(clamp(next.TIME_ACCELERATION, 1, 120));
  next.SENSORY_NOISE_RAD = clamp(next.SENSORY_NOISE_RAD, 0.2, 0.9);
  next.ENABLE_MILL = Boolean(next.ENABLE_MILL);
  return next;
};

export function App({ controls, onGpuErrorChange, isPaused = false } = {}) {
  const p5InstanceRef = React.useRef(null);
  const controlsRef = React.useRef(sanitizeControlState(controls));
  const isPausedRef = React.useRef(isPaused);
  const imageRef = React.useRef(null);
  const frameSizeRef = React.useRef(
    resolveAtlasFrameSize(ATLAS, { width: 64, height: 64 }),
  );

  const resolvedControls = React.useMemo(
    () => sanitizeControlState(controls),
    [controls],
  );

  React.useEffect(() => {
    controlsRef.current = resolvedControls;
  }, [resolvedControls]);

  React.useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  React.useEffect(() => {
    onGpuErrorChange?.("");
  }, [onGpuErrorChange]);

  React.useEffect(() => {
    const image = new Image();
    image.decoding = "async";
    image.src = ATLAS.src;

    const handleLoad = () => {
      const width = image.naturalWidth || image.width || 64;
      const height = image.naturalHeight || image.height || 64;
      const rasterCanvas = document.createElement("canvas");
      rasterCanvas.width = width;
      rasterCanvas.height = height;

      const rasterContext = rasterCanvas.getContext("2d");
      if (!rasterContext) {
        imageRef.current = image;
        frameSizeRef.current = resolveAtlasFrameSize(ATLAS, {
          width,
          height,
        });
        onGpuErrorChange?.("");
        return;
      }

      rasterContext.clearRect(0, 0, width, height);
      rasterContext.drawImage(image, 0, 0, width, height);
      imageRef.current = rasterCanvas;
      frameSizeRef.current = resolveAtlasFrameSize(ATLAS, {
        width,
        height,
      });
      onGpuErrorChange?.("");
    };

    const handleError = () => {
      imageRef.current = null;
      onGpuErrorChange?.("");
    };

    image.addEventListener("load", handleLoad);
    image.addEventListener("error", handleError);
    if (image.complete) {
      handleLoad();
    }

    return () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
    };
  }, [onGpuErrorChange]);

  const sketch = React.useCallback((p5) => {
    p5InstanceRef.current = p5;

    let world = null;
    let simulationAccumulator = 0;

    p5.setup = () => {
      const renderer = p5.createCanvas(p5.windowWidth, p5.windowHeight);
      p5.frameRate(60);
      world = createWorld(p5.width, p5.height, controlsRef.current);
      simulationAccumulator = 0;

      const canvasElement = renderer?.canvas;
      if (canvasElement) {
        applyTransparentCanvasStyle(canvasElement);

        const handlePointerDown = (event) => {
          if (!world || event.button !== 0) {
            return;
          }

          const rect = canvasElement.getBoundingClientRect();
          addFoodPatch(world, {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          });
        };

        canvasElement.addEventListener("pointerdown", handlePointerDown);
      }
    };

    p5.draw = () => {
      if (!world) {
        return;
      }

      const liveControls = controlsRef.current;
      const dt = Math.min(p5.deltaTime * 0.001, 0.05);

      if (
        world.width !== p5.width ||
        world.height !== p5.height ||
        world.lastAgentCount !== liveControls.AGENT_COUNT
      ) {
        world = rebuildWorld(world, liveControls);
        simulationAccumulator = 0;
      }

      if (!isPausedRef.current) {
        simulationAccumulator = Math.min(
          simulationAccumulator + dt * liveControls.TIME_ACCELERATION,
          SIMULATION_STEP_S * MAX_SIMULATION_STEPS_PER_FRAME,
        );

        let steps = 0;
        while (
          simulationAccumulator >= SIMULATION_STEP_S &&
          steps < MAX_SIMULATION_STEPS_PER_FRAME
        ) {
          stepWorld(world, liveControls, SIMULATION_STEP_S);
          simulationAccumulator -= SIMULATION_STEP_S;
          steps += 1;
        }
      }

      drawWorld(p5, world, imageRef.current, frameSizeRef.current);
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      if (world) {
        world = createWorld(
          p5.windowWidth,
          p5.windowHeight,
          controlsRef.current,
        );
        simulationAccumulator = 0;
      }
    };
  }, []);

  React.useEffect(() => {
    return () => {
      if (p5InstanceRef.current) {
        try {
          p5InstanceRef.current.remove();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return <P5Canvas key={0} sketch={sketch} />;
}

App.ui = {
  controlFields: CONTROL_FIELDS,
  defaultControlState: DEFAULT_CONTROL_STATE,
};

App.sanitizeControlState = sanitizeControlState;

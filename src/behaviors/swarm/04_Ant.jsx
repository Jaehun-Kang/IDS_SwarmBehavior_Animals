import * as React from "react";
import { P5Canvas } from "@p5-wrapper/react";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { resolveAtlasFrameSize } from "../../utils/spriteAtlas";
import { resolveCanvasAtlasSprite } from "../../utils/spritePose";
import { getThemeBackgroundRgb } from "../../utils/theme";

const ATLAS = HOME_SPRITE_ATLASES.ant;
const SOLDIER_ANT_BODY_LENGTH_MM = 8;
const ANT_BODY_LENGTH_CM = SOLDIER_ANT_BODY_LENGTH_MM / 10;
const ANT_BODY_LENGTHS_ON_SHORT_EDGE = 116;
const ANT_MIN_BODY_LENGTH_PX = 5.2;
const ANT_MAX_BODY_LENGTH_PX = 7.2;
const FIELD_CELL_BODY_LENGTHS = 0.6;
const ANT_SPRITE_BODY_LENGTHS = 1.8;
const PHEROMONE_SATURATION_CONCENTRATION = 2.5;
const SOURCE_FIELD_STRENGTH = 0.06;
const GOAL_PULL_WEIGHT = 0.62;
const SOURCE_REPULSION_WEIGHT = 0.45;
const MEMORY_WEIGHT = 0.95;
const GRADIENT_WEIGHT = 1.25;
const TROPOTAXIS_WEIGHT = 0.92;
const MIN_CRUISE_SPEED_CM_S = 2.0;
const EXPLORATION_MEMORY_BOOST = 0.42;
const VIRGIN_TERRITORY_GRADIENT_DAMP = 0.55;
const EXPLORATION_WANDER_WEIGHT = 0.35;
const LOW_PHEROMONE_WANDER_BOOST = 0.5;
const OUTBOUND_MEMORY_BLEND = 0.12;
const INBOUND_MEMORY_BLEND = 0.38;
const TRAP_ESCAPE_SECONDS = 1.6;
const LOOPBACK_DISTANCE_CM = 3.0;
const LOOPBACK_LOW_PHEROMONE_RATIO = 0.08;
const LOOPBACK_CHANCE_PER_S = 0.45;
const LOOPBACK_COOLDOWN_S = 1.4;
const MILL_TANGENT_WEIGHT = 1.55;
const MILL_MEMORY_WEIGHT = 0.78;
const MILL_GRADIENT_WEIGHT = 0.82;
const MILL_CROWD_WEIGHT = 0.22;
const PERCEPTION_RADIUS_BODY_LENGTHS = 1.2;
const COLLISION_RADIUS_BODY_LENGTHS = 0.4;
const ANTENNA_LENGTH_BODY_LENGTHS = 0.4;
const SOURCE_RADIUS_BODY_LENGTHS = 4.5;
const OUTBOUND_LOOKAHEAD_BODY_LENGTHS = 6.5;
const OUTBOUND_RETURN_DISTANCE_BODY_LENGTHS = 10;
const OUTBOUND_WEAK_TRAIL_RATIO = 0.12;
const EXPLORATORY_DEPOSIT_BASE = 0.35;
const RECRUITMENT_DEPOSIT_BASE = 0.3;
const MILL_DEPOSIT_BASE = 0.34;
const DENSITY_DEPOSIT_SCALE = 0.12;
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

const PARAMS = {
  AGENT_COUNT: 84,
  BODY_LENGTH_CM: ANT_BODY_LENGTH_CM,
  PERCEPTION_RADIUS_CM: ANT_BODY_LENGTH_CM * PERCEPTION_RADIUS_BODY_LENGTHS,
  COLLISION_RADIUS_CM: ANT_BODY_LENGTH_CM * COLLISION_RADIUS_BODY_LENGTHS,
  ANTENNA_LENGTH_CM: ANT_BODY_LENGTH_CM * ANTENNA_LENGTH_BODY_LENGTHS,
  PERCEPTION_ANGLE_DEG: 90,
  V_SEARCH_CM_S: 12.8,
  V_MAX_CM_S: 13.6,
  U_P_DEG_S: 500,
  U_A_INBOUND_DEG_S: 1000,
  U_A_OUTBOUND_DEG_S: 1400,
  RC_N_THRESHOLD: -2.0,
  GRADIENT_COUPLING_B: 15.0,
  PHEROMONE_HALF_LIFE_MIN: 132,
  TIME_ACCELERATION: 1,
  SENSORY_NOISE_RAD: 0.5,
  SIGMOID_K: 100,
  ENABLE_MILL: true,
};

const CONTROL_FIELDS = [
  {
    key: "AGENT_COUNT",
    label: "개체 수",
    min: 24,
    max: 180,
    step: 1,
    formatValue: (value) => String(Math.round(value)) + " ants",
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
    key: "ENABLE_MILL",
    label: "앤트밀 활성화",
    type: "toggle",
    formatValue: (value) => (value ? "ON" : "OFF"),
  },
  {
    key: "V_SEARCH_CM_S",
    label: "탐색 속도",
    min: 10,
    max: 14,
    step: 0.1,
    formatValue: (value) => value.toFixed(1) + " cm/s",
  },
  {
    key: "V_MAX_CM_S",
    label: "보충 속도",
    min: 12,
    max: 14.5,
    step: 0.2,
    formatValue: (value) => value.toFixed(1) + " cm/s",
  },
  {
    key: "U_P_DEG_S",
    label: "페로몬 회전율",
    min: 100,
    max: 900,
    step: 10,
    formatValue: (value) => String(Math.round(value)) + " deg/s",
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
    key: "GRADIENT_COUPLING_B",
    label: "구배 결합 b",
    min: 2,
    max: 20,
    step: 0.5,
    formatValue: (value) => value.toFixed(1),
  },
  {
    key: "PHEROMONE_HALF_LIFE_MIN",
    label: "페로몬 반감기",
    min: 60,
    max: 180,
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

const wrapAngle = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));

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

const seedField = (field, x, y, amount, radiusPx) => {
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
        Math.max(field.values[index], amount * falloff),
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
    eyeRadiusPx,
    fieldCellSizePx,
    fieldCellSizeCm,
  };
};

const createTrail = (width, height, metrics) => {
  const colony = { x: width * 0.5, y: height * 0.5 };
  const food = { x: width * 0.86, y: height * 0.44 };

  return {
    colony,
    food,
    sourceRadiusPx: metrics.sourceRadiusPx,
  };
};

const createAnt = (world, controls, role) => {
  const spawnPoint = world.trail.colony;
  const spawnAngle = Math.random() * Math.PI * 2;
  const spawnRadius =
    Math.sqrt(Math.random()) * world.trail.sourceRadiusPx * 0.7;
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
    position,
    heading,
    speedPxS: controls.V_SEARCH_CM_S * world.metrics.pxPerCm,
    role,
    trailMode: role === "inbound" ? "recruitment" : "exploratory",
    arousalTime: 0,
    trappedTime: 0,
    loopbackCooldownS: 0,
    state: "trail",
    laneSide: 0,
    stageOffset: Math.random() * 1000,
    bridgeLock: false,
    previousScreenPosition: null,
    separatedTime: 0,
    millDirection: Math.random() > 0.5 ? 1 : -1,
    millAnchor: null,
    memoryHeading: heading,
    wanderHeading: heading,
    lastRcN: -Infinity,
    trailDistanceCm: 0,
  };
};

const createWorld = (width, height, controls) => {
  const metrics = resolveMetrics(width, height, controls);
  const trail = createTrail(width, height, metrics);
  const world = {
    width,
    height,
    time: 0,
    metrics,
    trail,
    field: createField(width, height, metrics.fieldCellSizePx),
    ants: [],
    lastAgentCount: controls.AGENT_COUNT,
  };

  for (let index = 0; index < controls.AGENT_COUNT; index += 1) {
    world.ants.push(createAnt(world, controls, "outbound", index));
  }

  return world;
};

const rebuildWorld = (world, controls) =>
  createWorld(world.width, world.height, controls);

const syncAntPopulation = (world, controls) => {
  if (world.ants.length === controls.AGENT_COUNT) {
    return;
  }

  world.lastAgentCount = controls.AGENT_COUNT;
  while (world.ants.length > controls.AGENT_COUNT) {
    world.ants.pop();
  }

  while (world.ants.length < controls.AGENT_COUNT) {
    const index = world.ants.length;
    world.ants.push(createAnt(world, controls, "outbound", index));
  }
};

const addSourceField = (world) => {
  seedField(
    world.field,
    world.trail.colony.x,
    world.trail.colony.y,
    SOURCE_FIELD_STRENGTH,
    world.trail.sourceRadiusPx,
  );
};

const diffuseField = (world, dt) => {
  const { field, metrics } = world;
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
  const decay = Math.pow(
    0.5,
    dt / Math.max(controls.PHEROMONE_HALF_LIFE_MIN * 60, 1),
  );
  const { field } = world;
  let maxConcentration = 1e-3;

  for (let index = 0; index < field.values.length; index += 1) {
    field.values[index] *= decay;
  }

  addSourceField(world);
  diffuseField(world, dt);

  for (let index = 0; index < field.values.length; index += 1) {
    maxConcentration = Math.max(maxConcentration, field.values[index]);
  }

  field.maxConcentration = maxConcentration;
};

const senseAntennae = (ant, world) => {
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
  const left = sampleField(world.field, leftPoint.x, leftPoint.y);
  const right = sampleField(world.field, rightPoint.x, rightPoint.y);
  const center = sampleField(world.field, centerPoint.x, centerPoint.y);
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

const resolveSourcePoint = (ant, world) =>
  ant.role === "outbound" ? world.trail.colony : world.trail.food;

const resolveAnySourceDistance = (ant, world) =>
  distance(ant.position, world.trail.colony);
const computeNeighborCrowding = (ant, ants, world) => {
  let crowding = 0;

  ants.forEach((other) => {
    if (other === ant || other.bridgeLock) {
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

const computeTrailDeposit = (ant, crowding, world, controls) => {
  const baseDeposit =
    ant.trailMode === "recruitment"
      ? RECRUITMENT_DEPOSIT_BASE
      : EXPLORATORY_DEPOSIT_BASE;
  const densityBoost = 1 + crowding * DENSITY_DEPOSIT_SCALE;
  const speedBoost =
    ant.speedPxS / Math.max(controls.V_MAX_CM_S * world.metrics.pxPerCm, 1);
  const arousalBoost = ant.arousalTime > 0 ? AROUSAL_SPEED_BOOST : 1;

  return {
    amount:
      baseDeposit * densityBoost * (0.86 + speedBoost * 0.32) * arousalBoost,
    radiusPx:
      world.metrics.collisionRadiusPx *
      (ant.trailMode === "recruitment" ? 1.55 : 1.15),
  };
};

const computeMillDeposit = (crowding, world, controls) => {
  const densityBoost = 1 + crowding * DENSITY_DEPOSIT_SCALE;
  return {
    amount:
      (MILL_DEPOSIT_BASE + controls.GRADIENT_COUPLING_B * 0.01) * densityBoost,
    radiusPx: world.metrics.collisionRadiusPx * 1.9,
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
    if (other === ant || other.bridgeLock) {
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
    const weight = oppositeRole ? 1.75 : 0.8;
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
  let contactCue = 0;
  let contactStrength = 0;

  ants.forEach((other) => {
    if (other === ant || other.bridgeLock) {
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
  });

  return {
    count: contactStrength,
    cue: contactCue,
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

const resolveRoleTarget = (ant, world) =>
  ant.role === "outbound"
    ? add(
        ant.position,
        scale(
          angleToVector(ant.memoryHeading),
          world.metrics.bodyLengthsToPx(OUTBOUND_LOOKAHEAD_BODY_LENGTHS),
        ),
      )
    : world.trail.colony;

const updateRoleSwap = (ant, world, controls) => {
  if (ant.role === "outbound") {
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
  } else if (
    distance(ant.position, world.trail.colony) >
    world.metrics.bodyLengthPx * 1.6
  ) {
    return;
  }

  ant.role = ant.role === "outbound" ? "inbound" : "outbound";
  ant.trailMode = ant.role === "inbound" ? "recruitment" : "exploratory";
  ant.arousalTime = ant.role === "inbound" ? AROUSAL_DURATION_S : 0;
  ant.trappedTime = 0;
  ant.loopbackCooldownS = 0;
  ant.state = "trail";
  ant.separatedTime = 0;
  ant.laneSide = 0;
  ant.millDirection = Math.random() > 0.5 ? 1 : -1;
  ant.millAnchor = null;
  ant.speedPxS = controls.V_SEARCH_CM_S * world.metrics.pxPerCm;
  ant.wanderHeading = ant.heading;
};

const computePathReinforcementIndex = (ant, ants, world) => {
  const concentration = sampleField(
    world.field,
    ant.position.x,
    ant.position.y,
  );
  const crowding = computeNeighborCrowding(ant, ants, world);
  const sourceDistanceCm =
    resolveAnySourceDistance(ant, world) / world.metrics.pxPerCm;

  return Math.log10(
    (concentration * (1 + crowding * MILL_CROWD_WEIGHT) + 1e-4) /
      (sourceDistanceCm + 1),
  );
};

const resolveMillAnchor = (ant, ants, world) => {
  let sum = { x: 0, y: 0 };
  let count = 0;
  const radiusLimit = world.metrics.perceptionRadiusPx * 1.35;

  ants.forEach((other) => {
    if (other === ant) {
      return;
    }

    if (distance(ant.position, other.position) > radiusLimit) {
      return;
    }

    sum = add(sum, other.position);
    count += 1;
  });

  if (count === 0) {
    return ant.millAnchor || ant.position;
  }

  const centroid = scale(sum, 1 / count);
  return ant.millAnchor
    ? {
        x: lerp(ant.millAnchor.x, centroid.x, 0.18),
        y: lerp(ant.millAnchor.y, centroid.y, 0.18),
      }
    : centroid;
};

const shouldEnterMill = (ant, ants, world, controls) => {
  if (!controls.ENABLE_MILL || ant.state === "mill") {
    return false;
  }

  ant.trailDistanceCm =
    resolveAnySourceDistance(ant, world) / world.metrics.pxPerCm;
  const crowding = computeNeighborCrowding(ant, ants, world);

  if (
    ant.trailDistanceCm <
      controls.BODY_LENGTH_CM * MILL_ENTRY_DISTANCE_BODY_LENGTHS ||
    crowding < 4
  ) {
    return false;
  }

  ant.lastRcN = computePathReinforcementIndex(ant, ants, world);
  return ant.lastRcN >= controls.RC_N_THRESHOLD;
};

const shouldExitMill = (ant, ants, world, controls) => {
  if (ant.state !== "mill") {
    return false;
  }

  const sourceDistanceCm =
    resolveAnySourceDistance(ant, world) / world.metrics.pxPerCm;
  const crowding = computeNeighborCrowding(ant, ants, world);
  ant.lastRcN = computePathReinforcementIndex(ant, ants, world);
  return (
    !controls.ENABLE_MILL ||
    crowding < 2 ||
    sourceDistanceCm <
      controls.BODY_LENGTH_CM * MILL_EXIT_MARGIN_BODY_LENGTHS ||
    ant.lastRcN < controls.RC_N_THRESHOLD - 0.6
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

const updateTrailAnt = (ant, ants, world, controls, dt) => {
  const sensors = senseAntennae(ant, world);
  const target = resolveRoleTarget(ant, world);
  const localCrowding = computeNeighborCrowding(ant, ants, world);
  const tactileSignal = computeNeighborFlow(ant, ants, world);
  const source = resolveSourcePoint(ant, world);
  const baseGoalDir = normalize(
    subtract(target, ant.position),
    angleToVector(ant.heading),
  );
  const avoidance = computeAvoidance(ant, ants, world);
  const boundary = steerInsideBounds(ant, world);
  const sourceOffset = subtract(ant.position, source);
  const sourceDistance = length(sourceOffset);
  const sourceRepelDir = normalize(sourceOffset, baseGoalDir);
  const sourceRepelStrength = clamp(
    1 - sourceDistance / Math.max(world.trail.sourceRadiusPx, 1),
    0,
    1,
  );
  const localConcentrationRatio = clamp(
    sensors.center / Math.max(world.field.saturationConcentration, 1e-3),
    0,
    1,
  );
  const fieldGuidanceRamp = clamp(
    world.time / Math.max(INITIAL_FIELD_GUIDANCE_RAMP_S, 1e-6),
    0,
    1,
  );
  const virginRatio = 1 - localConcentrationRatio;
  const sourceDistanceCm =
    sourceDistance / Math.max(world.metrics.pxPerCm, 1e-6);
  const memoryWeight = MEMORY_WEIGHT + virginRatio * EXPLORATION_MEMORY_BOOST;
  const gradientWeight =
    GRADIENT_WEIGHT *
    (1 - virginRatio * VIRGIN_TERRITORY_GRADIENT_DAMP) *
    fieldGuidanceRamp;
  const tropotaxisWeight = TROPOTAXIS_WEIGHT * fieldGuidanceRamp;
  ant.arousalTime = Math.max(0, ant.arousalTime - dt);
  ant.loopbackCooldownS = Math.max(0, ant.loopbackCooldownS - dt);
  if (tactileSignal.cue > 0.08) {
    ant.arousalTime = Math.max(
      ant.arousalTime,
      Math.min(AROUSAL_DURATION_S, tactileSignal.cue * 0.45),
    );
    if (ant.role === "outbound") {
      ant.trailMode = "recruitment";
    }
  }
  ant.trappedTime =
    ant.role === "outbound" &&
    sourceDistance < world.trail.sourceRadiusPx * 1.2 &&
    localConcentrationRatio > 0.24
      ? ant.trappedTime + dt
      : Math.max(0, ant.trappedTime - dt * 2);
  if (ant.role === "outbound" && ant.trappedTime >= TRAP_ESCAPE_SECONDS) {
    ant.memoryHeading = wrapAngle(
      ant.memoryHeading + sampleGaussian() * controls.SENSORY_NOISE_RAD,
    );
    ant.wanderHeading = ant.memoryHeading;
    ant.trappedTime = 0;
  }
  const shouldLoopBack =
    ant.role === "outbound" &&
    ant.loopbackCooldownS <= 0 &&
    localConcentrationRatio <= LOOPBACK_LOW_PHEROMONE_RATIO &&
    sourceDistanceCm >= LOOPBACK_DISTANCE_CM &&
    Math.random() < LOOPBACK_CHANCE_PER_S * dt;
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
        AROUSAL_LOOP_TURN_RAD
      : 0;
  const goalDir = normalize(rotate(baseGoalDir, arousalTurn), baseGoalDir);
  ant.wanderHeading = turnToward(
    ant.wanderHeading,
    wrapAngle(
      ant.memoryHeading + sampleGaussian() * controls.SENSORY_NOISE_RAD * 0.4,
    ),
    (0.9 + virginRatio * 1.4) * dt,
  );
  const wanderDir = angleToVector(ant.wanderHeading);

  const desired = normalize(
    add(
      add(
        add(
          add(
            scale(goalDir, GOAL_PULL_WEIGHT),
            scale(
              sourceRepelDir,
              SOURCE_REPULSION_WEIGHT * sourceRepelStrength,
            ),
          ),
          add(
            add(
              scale(sensors.gradientDir, gradientWeight),
              scale(sensors.tropotaxisDir, tropotaxisWeight),
            ),
            scale(
              wanderDir,
              EXPLORATION_WANDER_WEIGHT +
                virginRatio * LOW_PHEROMONE_WANDER_BOOST,
            ),
          ),
        ),
        add(
          scale(angleToVector(ant.memoryHeading), memoryWeight),
          boundary ? scale(boundary, 1.1) : { x: 0, y: 0 },
        ),
      ),
      scale(
        avoidance.vector,
        avoidance.active ? 1.2 + avoidance.opposingTraffic * 0.16 : 0,
      ),
    ),
    goalDir,
  );

  const noise = sampleGaussian() * controls.SENSORY_NOISE_RAD;
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
    world.metrics.pxPerCm;
  ant.speedPxS = lerp(ant.speedPxS, desiredSpeedPxS, 0.18);
  ant.position = add(
    ant.position,
    scale(angleToVector(ant.heading), ant.speedPxS * dt),
  );

  depositField(
    world.field,
    ant.position.x,
    ant.position.y,
    computeTrailDeposit(ant, localCrowding, world, controls).amount,
    computeTrailDeposit(ant, localCrowding, world, controls).radiusPx,
  );

  ant.trailDistanceCm =
    resolveAnySourceDistance(ant, world) / world.metrics.pxPerCm;
  ant.separatedTime =
    ant.trailDistanceCm >
    controls.BODY_LENGTH_CM * MILL_ENTRY_DISTANCE_BODY_LENGTHS
      ? ant.separatedTime + dt
      : Math.max(0, ant.separatedTime - dt * 2);
};

const updateMillAnt = (ant, ants, world, controls, dt) => {
  const sensors = senseAntennae(ant, world);
  const localCrowding = computeNeighborCrowding(ant, ants, world);
  const tactileSignal = computeNeighborFlow(ant, ants, world);
  ant.millAnchor = resolveMillAnchor(ant, ants, world);
  const toAnchor = subtract(ant.position, ant.millAnchor);
  const anchorRadius = Math.max(length(toAnchor), 1e-6);
  const radialDir = scale(toAnchor, 1 / anchorRadius);
  const headingVector = angleToVector(ant.heading);
  const tangentDir = rotate(
    radialDir,
    ant.millDirection >= 0 ? Math.PI * 0.35 : -Math.PI * 0.35,
  );
  const goalDir = normalize(
    subtract(resolveRoleTarget(ant, world), ant.position),
    headingVector,
  );
  const avoidance = computeAvoidance(ant, ants, world);
  const boundary = steerInsideBounds(ant, world);
  const eyePenetration = clamp(
    1 - anchorRadius / Math.max(world.metrics.eyeRadiusPx, 1e-6),
    0,
    1,
  );
  const eyeRepulsion = scale(radialDir, EYE_REPULSION_WEIGHT * eyePenetration);
  ant.arousalTime = Math.max(
    ant.arousalTime,
    Math.min(AROUSAL_DURATION_S, tactileSignal.cue * 0.3),
  );

  const desired = normalize(
    add(
      add(
        scale(tangentDir, MILL_TANGENT_WEIGHT),
        add(
          scale(
            sensors.gradientDir,
            MILL_GRADIENT_WEIGHT + controls.GRADIENT_COUPLING_B * 0.035,
          ),
          scale(sensors.tropotaxisDir, TROPOTAXIS_WEIGHT * 0.72),
        ),
      ),
      add(
        add(
          scale(angleToVector(ant.memoryHeading), MILL_MEMORY_WEIGHT),
          scale(goalDir, 0.14),
        ),
        add(
          add(
            scale(avoidance.vector, avoidance.active ? 0.55 : 0),
            eyeRepulsion,
          ),
          boundary ? scale(boundary, 1.1) : { x: 0, y: 0 },
        ),
      ),
    ),
    tangentDir,
  );

  const targetHeading = vectorToAngle(desired);
  const millTurnDeg = Math.max(controls.U_P_DEG_S, HARD_COLLISION_TURN_DEG_S);
  ant.heading = turnToward(
    ant.heading,
    targetHeading,
    ((millTurnDeg * Math.PI) / 180) * dt,
  );
  ant.memoryHeading = lerp(ant.memoryHeading, ant.heading, 0.36);

  const speedCmS = Math.max(
    computeSigmoidSpeed(
      sensors.center,
      world.field.saturationConcentration,
      controls,
    ),
    controls.V_MAX_CM_S * 0.78,
  );
  ant.speedPxS = lerp(ant.speedPxS, speedCmS * world.metrics.pxPerCm, 0.22);
  ant.position = add(
    ant.position,
    scale(angleToVector(ant.heading), ant.speedPxS * dt),
  );

  depositField(
    world.field,
    ant.position.x,
    ant.position.y,
    computeMillDeposit(localCrowding, world, controls).amount,
    computeMillDeposit(localCrowding, world, controls).radiusPx,
  );
};

const updateAnt = (ant, ants, world, controls, dt) => {
  if (shouldEnterMill(ant, ants, world, controls)) {
    ant.state = "mill";
    ant.millDirection = ant.millDirection || (Math.random() > 0.5 ? 1 : -1);
    ant.millAnchor = resolveMillAnchor(ant, ants, world);
  } else if (shouldExitMill(ant, ants, world, controls)) {
    ant.state = "trail";
    ant.separatedTime = 0;
    ant.millAnchor = null;
  }

  if (ant.state === "mill") {
    updateMillAnt(ant, ants, world, controls, dt);
  } else {
    updateTrailAnt(ant, ants, world, controls, dt);
  }

  ant.position.x = clamp(ant.position.x, 0, world.width);
  ant.position.y = clamp(ant.position.y, 0, world.height);
  updateRoleSwap(ant, world, controls);
};

const stepWorld = (world, controls, dt) => {
  syncAntPopulation(world, controls);
  world.time += dt;
  updateField(world, controls, dt);
  world.ants.forEach((ant) => updateAnt(ant, world.ants, world, controls, dt));
};

const drawPheromoneField = (p5, world) => {
  const background = getThemeBackgroundRgb();
  p5.background(background[0], background[1], background[2]);
  p5.noStroke();

  for (let row = 0; row < world.field.rows; row += 1) {
    for (let column = 0; column < world.field.cols; column += 1) {
      const value = world.field.values[getFieldIndex(world.field, column, row)];
      if (value <= world.field.maxConcentration * 0.05) {
        continue;
      }

      const intensity = clamp(
        value / Math.max(world.field.maxConcentration, 1e-3),
        0,
        1,
      );
      const alpha = 14 + intensity * 84;
      p5.fill(111, 196, 122, alpha);
      p5.rect(
        column * world.field.cellSizePx,
        row * world.field.cellSizePx,
        world.field.cellSizePx,
        world.field.cellSizePx,
      );
    }
  }
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
    profile: "simulation",
    timestampMs: nowMs,
    animationOffsetMs: ant.stageOffset,
  });
  const drawWidth = world.metrics.bodyLengthsToPx(ANT_SPRITE_BODY_LENGTHS);
  const drawHeight =
    drawWidth * (frameSize.height / Math.max(frameSize.width, 1));
  const sourceX = sprite.frame.x * frameSize.width;
  const sourceY = sprite.frame.y * frameSize.height;

  ant.previousScreenPosition = sprite.pose.screenPosition;

  if (!spriteSheet) {
    p5.push();
    p5.translate(ant.position.x, ant.position.y);
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
  p5.translate(ant.position.x, ant.position.y);
  p5.rotate(sprite.rotation ?? ant.heading);
  p5.scale(sprite.flipX ?? 1, 1);
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
  const nowMs = world.time * 1000;

  world.ants.forEach((ant) => {
    drawAnt(p5, ant, world, spriteSheet, frameSize, nowMs);
  });
};

const sanitizeControlState = (rawControls = DEFAULT_CONTROL_STATE) => {
  const next = {
    ...DEFAULT_CONTROL_STATE,
    ...(rawControls ?? {}),
  };

  next.AGENT_COUNT = Math.round(clamp(next.AGENT_COUNT, 24, 180));
  next.V_SEARCH_CM_S = clamp(next.V_SEARCH_CM_S, 10, 14);
  next.V_MAX_CM_S = clamp(next.V_MAX_CM_S, 12, 14.5);
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
  next.PHEROMONE_HALF_LIFE_MIN = clamp(next.PHEROMONE_HALF_LIFE_MIN, 60, 180);
  next.TIME_ACCELERATION = Math.round(clamp(next.TIME_ACCELERATION, 1, 120));
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
      p5.createCanvas(p5.windowWidth, p5.windowHeight);
      p5.frameRate(60);
      world = createWorld(p5.width, p5.height, controlsRef.current);
      simulationAccumulator = 0;
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

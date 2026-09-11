import React from "react";
import { createPausedFrameGate } from "../../utils/pausedFrameGate.js";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import {
  drawAtlasFrame,
  loadTexturedAtlasCanvas,
  resolveAtlasFrameSize,
} from "../../utils/spriteAtlas";
import { resolveCanvasAtlasSprite } from "../../utils/spritePose";
import {
  applyTransparentCanvasStyle,
  clearTransparentCanvas2d,
} from "../../utils/transparentCanvas";

const ATLAS = HOME_SPRITE_ATLASES.spiny_lobster;
const SPRITE_WIDTH_COMPENSATION = 175 / 165;

const STATES = {
  FORAGING: "FORAGING",
  MIGRATING: "MIGRATING",
  SEEKING_SHELTER: "SEEKING_SHELTER",
  VACATING: "VACATING",
  SHELTERING: "SHELTERING",
  DEFENDING: "DEFENDING",
  OFFSHORE_EXIT: "OFFSHORE_EXIT",
};

const PHASES = {
  ALGAL_PHASE: "ALGAL_PHASE",
  TRANSITIONAL: "TRANSITIONAL",
  POSTALGAL: "POSTALGAL",
};

const CIRCADIAN_PHASES = {
  DAY: "day",
  DUSK: "dusk",
  NIGHT: "night",
  DAWN: "dawn",
};

const CIRCADIAN_PHASE_HOURS = {
  [CIRCADIAN_PHASES.DAY]: 12,
  [CIRCADIAN_PHASES.DUSK]: 19,
  [CIRCADIAN_PHASES.NIGHT]: 22,
  [CIRCADIAN_PHASES.DAWN]: 5,
};

const DISEASE_STAGES = {
  HEALTHY: "HEALTHY",
  LATENT: "LATENT",
  DETECTABLE: "DETECTABLE",
  CONTAGIOUS: "CONTAGIOUS",
  REMOVED: "REMOVED",
};

const DIRECT_FINDING_PARAMS = {
  BODY_SIZE_SOCIAL_MM: 15,
  BODY_SIZE_POSTALGAL_MM: 24,
  QUEUE_TARGET_DISTANCE_CM: 16,
  QUEUE_BRAKE_DISTANCE_CM: 7,
  QUEUE_DETECTION_DISTANCE_CM: 34,
  BASE_SPEED_CM_S: 21,
  MIN_QUEUE_SPEED_CM_S: 15,
  MAX_QUEUE_SPEED_CM_S: 35,
  ANTENNAE_ANGLE_MIN_DEG: 30,
  ANTENNAE_ANGLE_MID_DEG: 92,
  ANTENNAE_ANGLE_MAX_DEG: 150,
};

const INFERRED_PARAMS = {
  SHELTER_SEARCH_WINDOW_HOURS: 5,
  FORAGING_RADIUS_CM: 150,
  SHELTER_CAPACITY_MIN: 4,
  SHELTER_CAPACITY_MAX: 9,
  LARGE_SHELTER_CAPACITY: 15,
  CHEMICAL_RADIUS_CM: 180,
  HEALTHY_CHEM_THRESHOLD: 0.015,
  DISEASE_CHEM_THRESHOLD: 0.05,
  DISEASE_REPULSION_WEIGHT: 2.35,
  HEALTHY_ATTRACTION_WEIGHT: 0.8,
  HEALTHY_WANDER_BLEND: 0.42,
  MIGRATION_ALIGN_WEIGHT: 1.35,
  MIGRATION_COHESION_WEIGHT: 1.65,
  MIGRATION_BRAKE_WEIGHT: 2.4,
  SEEK_SHELTER_SPEED_CM_S: 18,
  DISEASE_ESCAPE_SPEED_CM_S: 32,
  DEFENSE_SPEED_CM_S: 10,
};

const PARAMS = {
  DEFAULT_COUNT: 36,
  DEFAULT_START_HOUR: 20,
  DEFAULT_CIRCADIAN_PHASE: CIRCADIAN_PHASES.NIGHT,
  DEFAULT_QUEUE_TARGET_DISTANCE_CM:
    DIRECT_FINDING_PARAMS.QUEUE_TARGET_DISTANCE_CM,
  DEFAULT_QUEUE_BRAKE_DISTANCE_CM:
    DIRECT_FINDING_PARAMS.QUEUE_BRAKE_DISTANCE_CM,
  DEFAULT_QUEUE_DETECTION_DISTANCE_CM:
    DIRECT_FINDING_PARAMS.QUEUE_DETECTION_DISTANCE_CM,
  DEFAULT_BASE_SPEED_CM_S: DIRECT_FINDING_PARAMS.BASE_SPEED_CM_S,
  DEFAULT_MIN_QUEUE_SPEED_CM_S: DIRECT_FINDING_PARAMS.MIN_QUEUE_SPEED_CM_S,
  DEFAULT_MAX_QUEUE_SPEED_CM_S: DIRECT_FINDING_PARAMS.MAX_QUEUE_SPEED_CM_S,
  DEFAULT_SOCIAL_SIZE_MM: DIRECT_FINDING_PARAMS.BODY_SIZE_SOCIAL_MM,
  DEFAULT_FORAGING_RADIUS_CM: INFERRED_PARAMS.FORAGING_RADIUS_CM,
  DEFAULT_SHELTER_SEARCH_WINDOW_HOURS:
    INFERRED_PARAMS.SHELTER_SEARCH_WINDOW_HOURS,
  DEFAULT_DISEASE_REPULSION_WEIGHT: INFERRED_PARAMS.DISEASE_REPULSION_WEIGHT,
  DEFAULT_DISEASE_PRESSURE: 7,
  DEFAULT_POSTALGAL_RATIO: 100,
  DEFAULT_THREAT_ACTIVE: true,
  DEFAULT_QUEUE_COHESION: 72,
  DEFAULT_ODOR_TRAILS: true,
  MIN_COUNT: 12,
  MAX_COUNT: 64,
  PIXELS_PER_CM: 1,
  QUEUE_DISTANCE_PIXEL_SCALE: 2.55,
  VISUAL_SPEED_SCALE: 2.1,
  SIMULATION_TIME_SCALE: 1,
  CIRCADIAN_TIME_ACCELERATION: 14,
  SUNRISE_HOUR: 6,
  SUNSET_HOUR: 18,
  BODY_SIZE_MIN_MM: 6,
  BODY_SIZE_MAX_MM: 55,
  AGENT_RADIUS_MIN_PX: 8,
  AGENT_RADIUS_MAX_PX: 18,
  FORAGE_SPEED_MIN_CM_S: 5,
  FORAGE_SPEED_MAX_CM_S: 10,
  MAX_QUEUE_SIZE: 65,
  QUEUE_AHEAD_ALIGNMENT_MIN: 0.18,
  QUEUE_HEADING_ALIGNMENT_MIN: 0.12,
  QUEUE_TRAIL_WIDTH_CM: 5.5,
  QUEUE_CONTACT_MAX_RATIO: 30 / 16,
  QUEUE_REACQUIRE_RATIO: 34 / 16,
  QUEUE_CHASE_SPEED_SCALE: 1.12,
  QUEUE_FOLLOW_DELAY_S: 0.34,
  QUEUE_HISTORY_DURATION_S: 1.6,
  QUEUE_REACQUIRE_DISTANCE_CM: 96,
  NIGHT_DEPARTURE_LEADERS: 2,
  NIGHT_DEPARTURE_LEADER_GAP_S: 0.7,
  NIGHT_DEPARTURE_STAGGER_MIN_S: 0.9,
  NIGHT_DEPARTURE_STAGGER_MAX_S: 1.8,
  SHELTER_SEARCH_STAGGER_MIN_S: 0.6,
  SHELTER_SEARCH_STAGGER_MAX_S: 1.4,
  MIGRATION_ROUTE_PULL_WEIGHT: 1.38,
  MIGRATION_LEADER_WANDER_WEIGHT: 0.16,
  MIGRATION_TARGET_MARGIN_PX: 92,
  MIGRATION_WAYPOINT_REACHED_PX: 62,
  MIGRATION_INITIAL_SPACING_CM: 17,
  QUEUE_LOCK_RELEASE_DISTANCE_CM: 42,
  TACTILE_BOND_STRENGTH: 1.45,
  COLLISION_PADDING_PX: 4,
  SEPARATION_RADIUS_MULTIPLIER: 0.92,
  SEPARATION_FORCE_WEIGHT: 1.28,
  PLUME_FLOW_X: -1,
  PLUME_FLOW_Y: 0.22,
  PLUME_LENGTH_SCALE: 1.48,
  PLUME_WIDTH_SCALE: 0.56,
  QUEUE_BRAKE_CLEARANCE_PX: 4,
  ROSETTE_DIAMETER_OVERLAP_RATIO: 0.85,
  SHELTER_SLOT_OUTER_RADIUS_X: 0.72,
  SHELTER_SLOT_OUTER_RADIUS_Y: 0.72,
  SHELTER_SLOT_INNER_RADIUS_X: 0.36,
  SHELTER_SLOT_INNER_RADIUS_Y: 0.36,
  INITIAL_SHELTERED_POSTALGAL_RATIO: 0,
  INITIAL_MIGRATION_START_RATIO: 1,
  HEALTHY_CHEM_STRENGTH: 1.1,
  DISEASE_CHEM_STRENGTH: 2.8,
  DISEASE_DETECTABLE_START_S: 16,
  DISEASE_CONTAGIOUS_START_S: 28,
  DISEASE_MORTALITY_MIN_S: 25,
  DISEASE_MORTALITY_MAX_S: 55,
  DISEASE_PREDATION_CULL_RATE_S: 0.035,
  DISEASE_RESIDUAL_DECAY_S: 13,
  DISEASE_RESIDUAL_MIN_STRENGTH: 0.035,
  HOMING_MEMORY_WEIGHT: 0.65,
  HOMING_OLFACTORY_WEIGHT: 0.35,
  HOMING_WANDER_WEIGHT: 0.12,
  MEMORY_FIDELITY_DEFAULT: 0.95,
  MEMORY_FIDELITY_MIN: 0.72,
  HEALTHY_CHEM_DECAY_S: 8,
  DISEASE_CHEM_DECAY_S: 13,
  CHEMICAL_TRAIL_EMIT_INTERVAL_S: 0.22,
  CHEMICAL_FIELD_CELL_SIZE_PX: 5.5,
  CHEMICAL_FIELD_SATURATION: 3,
  HEALTHY_CHEM_DIFFUSION_ALPHA_S: 0.42,
  DISEASE_CHEM_DIFFUSION_ALPHA_S: 0.5,
  CHEMICAL_FIELD_FLOW_ALPHA_S: 0.72,
  CHEMICAL_FIELD_NOISE_CUTOFF: 0.006,
  CHEMICAL_TRAIL_DAY_ALPHA_MULTIPLIER: 1.75,
  SHELTER_CHEM_PULSE_MIN_S: 1.5,
  SHELTER_CHEM_PULSE_MAX_S: 3,
  INFECTED_POSTLARVAL_INFLOW_INTERVAL_S: 24,
  WANDER_TURN_RATE_RAD_S: 0.95,
  WANDER_JITTER_RATE_RAD_S: 0.7,
  WANDER_PULL_WEIGHT: 0.58,
  WANDER_NOISE_RATE_S: 0.38,
  WANDER_NOISE_AMPLITUDE: 0.72,
  BOUNDARY_MARGIN_PX: 34,
  BOUNDARY_SOFT_MARGIN_PX: 104,
  BOUNDARY_SOFT_STEER_WEIGHT: 2.2,
  BOUNDARY_SOFT_TURN_RATE_RAD_S: 1.15,
  BOUNDARY_CONTAIN_MARGIN_PX: 16,
  BOUNDARY_OUTWARD_DAMPING: 0.55,
  SPATIAL_GRID_CELL_SIZE_PX: 64,
  QUEUE_DOCKING_ENTRY_MARGIN_PX: 24,
  QUEUE_DOCKING_SPAWN_STEP_PX: 24,
  OFFSHORE_EXIT_REMOVE_MARGIN_PX: 128,
  OFFSHORE_EXIT_FADE_MARGIN_PX: 150,
  OFFSHORE_EXIT_SPEED_SCALE: 0.86,
  MAX_STEER_CM_S2: 45,
  VELOCITY_DAMPING: 0.985,
  THREAT_ROSETTE_RADIUS_CM: 42,
  THREAT_CENTER_PULL: 1.35,
  THREAT_TANGENTIAL_WEIGHT: 0.18,
  THREAT_SHELTER_INSIDE_RATIO: 0.92,
  THREAT_SHELTER_NEAR_MARGIN_PX: 74,
  LOCAL_THREAT_RADIUS_PX: 150,
  LOCAL_THREAT_RELEASE_RADIUS_PX: 220,
  LOCAL_THREAT_REJOIN_DELAY_S: 1.15,
  LOCAL_THREAT_MIN_DEFENDERS: 4,
  TAIL_FLIP_DISTANCE_RATIO: 0.44,
  TAIL_FLIP_IMPULSE_CM_S: 42,
  TAIL_FLIP_COOLDOWN_S: 0.72,
  HEADING_TURN_RATE_RAD_S: 2.2,
  THREAT_HEADING_TURN_RATE_RAD_S: 1.35,
  ANTENNA_LENGTH_CM: 14,
  ALGAE_COVER_RADIUS_CM: 80,
  DEBUG_OVERLAY_ALPHA: 0.16,
  ...DIRECT_FINDING_PARAMS,
  ...INFERRED_PARAMS,
};

const CONTROL_FIELDS = [
  {
    key: "THREAT_ACTIVE",
    label: "마우스 상호작용",
    type: "static",
    formatValue: () => "포식자",
  },
  {
    key: "COUNT",
    label: "개체 수",
    min: PARAMS.MIN_COUNT,
    max: PARAMS.MAX_COUNT,
    step: 1,
    formatValue: (value) => `${Math.round(value)} 마리`,
  },
  {
    key: "QUEUE_COHESION",
    label: "대열 유지력",
    min: 0,
    max: 100,
    step: 1,
    formatValue: (value) => `${Math.round(value)} %`,
  },
  {
    key: "ODOR_TRAILS",
    label: "화학 신호 표시",
    type: "toggle",
    formatValue: (value) => (value ? "표시" : "숨김"),
  },
  {
    key: "CIRCADIAN_PHASE",
    label: "시간대",
    type: "cycle-toggle",
    values: [
      CIRCADIAN_PHASES.DAWN,
      CIRCADIAN_PHASES.DAY,
      CIRCADIAN_PHASES.DUSK,
      CIRCADIAN_PHASES.NIGHT,
    ],
    visualCount: 4,
    cycleMode: "loop",
    formatValue: (value) =>
      value === CIRCADIAN_PHASES.DUSK
        ? "해질녘"
        : value === CIRCADIAN_PHASES.NIGHT
          ? "밤"
          : value === CIRCADIAN_PHASES.DAWN
            ? "새벽"
            : "낮",
  },
];

const DEFAULT_CONTROL_STATE = {
  COUNT: PARAMS.DEFAULT_COUNT,
  START_HOUR: PARAMS.DEFAULT_START_HOUR,
  CIRCADIAN_PHASE: PARAMS.DEFAULT_CIRCADIAN_PHASE,
  DISEASE_PRESSURE: PARAMS.DEFAULT_DISEASE_PRESSURE,
  POSTALGAL_RATIO: PARAMS.DEFAULT_POSTALGAL_RATIO,
  THREAT_ACTIVE: PARAMS.DEFAULT_THREAT_ACTIVE,
  QUEUE_COHESION: PARAMS.DEFAULT_QUEUE_COHESION,
  ODOR_TRAILS: PARAMS.DEFAULT_ODOR_TRAILS,
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const getControlField = (key) =>
  CONTROL_FIELDS.find((field) => field.key === key);
const lerp = (start, end, amount) => start + (end - start) * amount;
const inverseLerp = (value, start, end) => {
  if (Math.abs(end - start) < 1e-6) {
    return 0;
  }
  return clamp((value - start) / (end - start), 0, 1);
};
const smoothstep = (edge0, edge1, value) => {
  const amount = inverseLerp(value, edge0, edge1);
  return amount * amount * (3 - amount * 2);
};
const randomBetween = (min, max) => min + Math.random() * (max - min);
const magnitude = (x, y) => Math.hypot(x, y);
const normalizeCircadianPhase = (value, fallback = PARAMS.DEFAULT_CIRCADIAN_PHASE) =>
  Object.values(CIRCADIAN_PHASES).includes(value) ? value : fallback;

const normalize2D = (x, y, fallback = { x: 1, y: 0 }) => {
  const length = magnitude(x, y);
  if (length < 1e-6) {
    return { ...fallback };
  }
  return { x: x / length, y: y / length };
};

class SpatialHashGrid {
  constructor(width, height, cellSize = PARAMS.SPATIAL_GRID_CELL_SIZE_PX) {
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
    this.grid = Array.from({ length: this.cols * this.rows }, () => []);
  }

  clear() {
    this.grid.forEach((cell) => {
      cell.length = 0;
    });
  }

  insert(agent) {
    const column = Math.floor(agent.x / this.cellSize);
    const row = Math.floor(agent.y / this.cellSize);
    if (
      column < 0 ||
      column >= this.cols ||
      row < 0 ||
      row >= this.rows
    ) {
      return;
    }
    this.grid[row * this.cols + column].push(agent);
  }

  getNeighbors(agent, radiusPx) {
    const neighbors = [];
    const minColumn = clamp(
      Math.floor((agent.x - radiusPx) / this.cellSize),
      0,
      this.cols - 1,
    );
    const maxColumn = clamp(
      Math.floor((agent.x + radiusPx) / this.cellSize),
      0,
      this.cols - 1,
    );
    const minRow = clamp(
      Math.floor((agent.y - radiusPx) / this.cellSize),
      0,
      this.rows - 1,
    );
    const maxRow = clamp(
      Math.floor((agent.y + radiusPx) / this.cellSize),
      0,
      this.rows - 1,
    );

    for (let row = minRow; row <= maxRow; row += 1) {
      for (let column = minColumn; column <= maxColumn; column += 1) {
        const cell = this.grid[row * this.cols + column];
        cell.forEach((entry) => {
          if (entry.id !== agent.id) {
            neighbors.push(entry);
          }
        });
      }
    }

    return neighbors;
  }
}

const limitVector = (x, y, maxLength) => {
  const length = magnitude(x, y);
  if (length <= maxLength || length < 1e-6) {
    return { x, y };
  }
  const scale = maxLength / length;
  return { x: x * scale, y: y * scale };
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

const turnTowardAngle = (currentAngle, targetAngle, maxDelta) =>
  wrapAngle(
    currentAngle +
      clamp(wrapAngle(targetAngle - currentAngle), -maxDelta, maxDelta),
  );

const angleToVector = (angle) => ({ x: Math.cos(angle), y: Math.sin(angle) });

const getMainReefAnchor = (width, height) => ({
  x: width * 0.5,
  y: height * 0.5,
});

const getMigrationWaypoints = (width, height) => {
  const reef = getMainReefAnchor(width, height);
  return [
    { x: reef.x - Math.min(width, height) * 0.09, y: reef.y - 8 },
    { x: width * 0.26, y: height * 0.42 },
    { x: width * 0.5, y: height * 0.26 },
    { x: width * 0.78, y: height * 0.43 },
    { x: width * 0.68, y: height * 0.74 },
    { x: reef.x - Math.min(width, height) * 0.09, y: reef.y + 12 },
  ];
};

const getInitialMigrationRoute = (width, height) => {
  const waypoints = getMigrationWaypoints(width, height);
  const start = waypoints[0];
  const end = waypoints[1];
  const direction = normalize2D(end.x - start.x, end.y - start.y, {
    x: -1,
    y: -0.18,
  });
  return { start, end, direction, waypoints };
};

const ensureMigrationTarget = (agent, width, height) => {
  const waypoints = getMigrationWaypoints(width, height);
  if (!Number.isFinite(agent.migrationWaypointIndex)) {
    agent.migrationWaypointIndex = 1;
  }

  let target =
    waypoints[agent.migrationWaypointIndex % waypoints.length] || waypoints[1];
  const distance = magnitude(target.x - agent.x, target.y - agent.y);

  if (distance < PARAMS.MIGRATION_WAYPOINT_REACHED_PX) {
    agent.migrationWaypointIndex =
      (agent.migrationWaypointIndex + 1) % waypoints.length;
    if (agent.migrationWaypointIndex === 0) {
      agent.migrationWaypointIndex = 1;
    }
    target =
      waypoints[agent.migrationWaypointIndex % waypoints.length] ||
      waypoints[1];
  }

  return target;
};

const resolveOntogeneticPhase = (
  bodySizeMm,
  socialSizeMm = PARAMS.BODY_SIZE_SOCIAL_MM,
  postalgalSizeMm = PARAMS.BODY_SIZE_POSTALGAL_MM,
) => {
  if (bodySizeMm < socialSizeMm) {
    return PHASES.ALGAL_PHASE;
  }
  if (bodySizeMm < postalgalSizeMm) {
    return PHASES.TRANSITIONAL;
  }
  return PHASES.POSTALGAL;
};

const resolveAgentRadius = (bodySizeMm) =>
  lerp(
    PARAMS.AGENT_RADIUS_MIN_PX,
    PARAMS.AGENT_RADIUS_MAX_PX,
    inverseLerp(bodySizeMm, PARAMS.BODY_SIZE_MIN_MM, PARAMS.BODY_SIZE_MAX_MM),
  );

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

const resolveBehaviorConfig = (controls = DEFAULT_CONTROL_STATE) => {
  const count = clamp(
    Math.round(Number(controls.COUNT)),
    getControlField("COUNT")?.min,
    getControlField("COUNT")?.max,
  );
  const circadianPhase = normalizeCircadianPhase(controls.CIRCADIAN_PHASE);
  const startHour = CIRCADIAN_PHASE_HOURS[circadianPhase];
  const diseasePressure =
    clamp(Number(controls.DISEASE_PRESSURE), 0, 100) / 100;
  const postalgalRatio = clamp(Number(controls.POSTALGAL_RATIO), 0, 100) / 100;
  const threatActive = Boolean(controls.THREAT_ACTIVE);
  const queueCohesion =
    clamp(
      Number(controls.QUEUE_COHESION),
      getControlField("QUEUE_COHESION")?.min,
      getControlField("QUEUE_COHESION")?.max,
    ) / 100;
  const odorTrails = Boolean(controls.ODOR_TRAILS);
  const migrationUrge = 0.68;

  const distanceScale = PARAMS.QUEUE_DISTANCE_PIXEL_SCALE;
  const speedScale = PARAMS.VISUAL_SPEED_SCALE;

  return {
    count,
    startHour,
    circadianPhase,
    migrationUrge,
    queueTargetDistanceCm: PARAMS.QUEUE_TARGET_DISTANCE_CM * distanceScale,
    queueBrakeDistanceCm: PARAMS.QUEUE_BRAKE_DISTANCE_CM * distanceScale,
    queueDetectionDistanceCm:
      PARAMS.QUEUE_DETECTION_DISTANCE_CM * distanceScale,
    baseSpeedCmS: PARAMS.BASE_SPEED_CM_S * speedScale,
    minQueueSpeedCmS: PARAMS.MIN_QUEUE_SPEED_CM_S * speedScale,
    maxQueueSpeedCmS: PARAMS.MAX_QUEUE_SPEED_CM_S * speedScale,
    socialSizeMm: PARAMS.BODY_SIZE_SOCIAL_MM,
    postalgalAttractionSizeMm: PARAMS.BODY_SIZE_POSTALGAL_MM,
    foragingRadiusCm: PARAMS.FORAGING_RADIUS_CM,
    shelterSearchWindowHours: PARAMS.SHELTER_SEARCH_WINDOW_HOURS,
    diseaseRepulsionWeight: PARAMS.DISEASE_REPULSION_WEIGHT,
    diseasePressure,
    postalgalRatio,
    threatActive,
    queueCohesion,
    queueCohesionMultiplier: lerp(0.72, 1.58, queueCohesion),
    odorTrails,
    healthyAttractionThreshold: PARAMS.HEALTHY_CHEM_THRESHOLD,
    diseaseThreshold: PARAMS.DISEASE_CHEM_THRESHOLD,
    sunriseHour: PARAMS.SUNRISE_HOUR,
    sunsetHour: PARAMS.SUNSET_HOUR,
    shelterSearchStartHour:
      PARAMS.SUNRISE_HOUR - PARAMS.SHELTER_SEARCH_WINDOW_HOURS,
  };
};

const resolveShelters = (width, height) => {
  const anchor = getMainReefAnchor(width, height);
  return [
    {
      id: "central-reef",
      x: anchor.x,
      y: anchor.y,
      type: "sponge",
      rotation: -0.08,
      radius: clamp(Math.min(width, height) * 0.075, 48, 82),
      capacity: PARAMS.MAX_COUNT + 8,
    },
  ];
};

const resolveAlgaeCovers = () => [];

const isNightHour = (hour, behavior) =>
  hour >= behavior.sunsetHour || hour < behavior.shelterSearchStartHour;

const isShelterSearchHour = (hour, behavior) =>
  hour >= behavior.shelterSearchStartHour && hour < behavior.sunriseHour;

const resolveLightTransition = (hour) => {
  const normalizedHour = ((Number(hour) % 24) + 24) % 24;
  if (!Number.isFinite(normalizedHour)) {
    return 0;
  }
  if (normalizedHour >= 18) {
    return smoothstep(18, 20, normalizedHour);
  }
  if (normalizedHour <= 7) {
    return 1 - smoothstep(5, 7, normalizedHour);
  }
  return 0;
};

const resolveDiseaseStage = (agent) => {
  if (!agent?.isDiseased) {
    return DISEASE_STAGES.HEALTHY;
  }
  if (agent.isDiseaseRemoved) {
    return DISEASE_STAGES.REMOVED;
  }
  if (agent.infectionAgeS >= PARAMS.DISEASE_CONTAGIOUS_START_S) {
    return DISEASE_STAGES.CONTAGIOUS;
  }
  if (agent.infectionAgeS >= PARAMS.DISEASE_DETECTABLE_START_S) {
    return DISEASE_STAGES.DETECTABLE;
  }
  return DISEASE_STAGES.LATENT;
};

const doesAgentEmitDiseaseCue = (agent) =>
  [DISEASE_STAGES.DETECTABLE, DISEASE_STAGES.CONTAGIOUS].includes(
    resolveDiseaseStage(agent),
  );

const isAgentContagious = (agent) =>
  resolveDiseaseStage(agent) === DISEASE_STAGES.CONTAGIOUS;

const seedLatentInfection = (agent) => {
  agent.isDiseased = true;
  agent.infectionAgeS = 0;
  agent.diseaseStage = DISEASE_STAGES.LATENT;
  agent.diseaseMortalityTimerS = randomBetween(
    PARAMS.DISEASE_MORTALITY_MIN_S,
    PARAMS.DISEASE_MORTALITY_MAX_S,
  );
  agent.isDiseaseRemoved = false;
  agent.diseaseResidualAdded = false;
  agent.isDiseaseInflow = false;
};

const maybeSeedLatentInfectionAmongExistingAgents = (
  agents,
  behavior,
) => {
  if (
    behavior.diseasePressure <= 0 ||
    agents.some((agent) => agent.isDiseased && !agent.isDiseaseRemoved)
  ) {
    return false;
  }

  const candidates = agents.filter(
    (agent) =>
      !agent.isRetiring &&
      !agent.isDiseaseRemoved &&
      !agent.isDiseased &&
      resolveOntogeneticPhase(
        agent.bodySize,
        behavior.socialSizeMm,
        behavior.postalgalAttractionSizeMm,
      ) !== PHASES.ALGAL_PHASE,
  );

  if (candidates.length === 0) {
    return false;
  }

  seedLatentInfection(
    candidates[Math.floor(Math.random() * candidates.length)],
  );
  return true;
};

const createAgent = (
  index,
  width,
  height,
  behavior,
  shelters,
  algaeCovers,
  options = {},
) => {
  const isPostalgal = Math.random() < behavior.postalgalRatio;
  const bodySize = isPostalgal
    ? randomBetween(PARAMS.BODY_SIZE_POSTALGAL_MM, PARAMS.BODY_SIZE_MAX_MM)
    : randomBetween(PARAMS.BODY_SIZE_MIN_MM, behavior.socialSizeMm + 2);
  const phase = resolveOntogeneticPhase(
    bodySize,
    behavior.socialSizeMm,
    behavior.postalgalAttractionSizeMm,
  );
  const homeShelter = shelters[index % shelters.length];
  const algaeCover =
    algaeCovers.length > 0
      ? algaeCovers[index % algaeCovers.length]
      : homeShelter;
  const isDiseased =
    phase !== PHASES.ALGAL_PHASE &&
    Math.random() < behavior.diseasePressure;
  const infectionAgeS = isDiseased
    ? randomBetween(0, PARAMS.DISEASE_CONTAGIOUS_START_S + 8)
    : 0;
  const spawnAnchor = phase === PHASES.ALGAL_PHASE ? algaeCover : homeShelter;
  let heading = randomBetween(-Math.PI, Math.PI);
  let dir = angleToVector(heading);
  const startHour = behavior.startHour;
  const isMigrationHour =
    isNightHour(startHour, behavior) &&
    phase !== PHASES.ALGAL_PHASE &&
    behavior.migrationUrge > 0.5;
  const shouldStartMigrating = isMigrationHour && options.forceMigrating;
  const startState = isShelterSearchHour(startHour, behavior)
    ? STATES.SEEKING_SHELTER
    : shouldStartMigrating
      ? STATES.MIGRATING
      : isNightHour(startHour, behavior)
        ? phase === PHASES.ALGAL_PHASE
          ? STATES.FORAGING
          : STATES.SHELTERING
        : STATES.SHELTERING;
  let baseSpeed =
    startState === STATES.MIGRATING
      ? behavior.baseSpeedCmS
      : startState === STATES.FORAGING
        ? lerp(
            PARAMS.FORAGE_SPEED_MIN_CM_S,
            PARAMS.FORAGE_SPEED_MAX_CM_S,
            Math.random(),
          )
        : 0;
  const startDistance = randomBetween(0, spawnAnchor.radius * 0.75);
  let spawnX = spawnAnchor.x + Math.cos(heading) * startDistance;
  let spawnY = spawnAnchor.y + Math.sin(heading) * startDistance;
  let migrationTargetSide = "end";

  if (startState === STATES.MIGRATING && phase !== PHASES.ALGAL_PHASE) {
    const route = getInitialMigrationRoute(width, height);
    const queueOrder = Number.isFinite(options.queueOrder)
      ? options.queueOrder
      : index;
    const lateral = { x: -route.direction.y, y: route.direction.x };
    const lateralOffset = randomBetween(
      -PARAMS.QUEUE_TRAIL_WIDTH_CM * 0.7,
      PARAMS.QUEUE_TRAIL_WIDTH_CM * 0.7,
    );
    const spacing =
      behavior.queueTargetDistanceCm || PARAMS.MIGRATION_INITIAL_SPACING_CM;

    spawnX =
      route.start.x -
      route.direction.x * queueOrder * spacing +
      lateral.x * lateralOffset;
    spawnY =
      route.start.y -
      route.direction.y * queueOrder * spacing +
      lateral.y * lateralOffset;
    heading = Math.atan2(route.direction.y, route.direction.x);
    dir = route.direction;
    baseSpeed = behavior.baseSpeedCmS;
    migrationTargetSide = "end";
  }

  return {
    id: index,
    x: clamp(
      spawnX,
      PARAMS.BOUNDARY_MARGIN_PX,
      width - PARAMS.BOUNDARY_MARGIN_PX,
    ),
    y: clamp(
      spawnY,
      PARAMS.BOUNDARY_MARGIN_PX,
      height - PARAMS.BOUNDARY_MARGIN_PX,
    ),
    vx: dir.x * baseSpeed,
    vy: dir.y * baseSpeed,
    ax: 0,
    ay: 0,
    heading,
    state: startState,
    bodySize,
    ontogeneticPhase: phase,
    isDiseased,
    infectionAgeS,
    diseaseStage: isDiseased
      ? resolveDiseaseStage({ isDiseased, infectionAgeS })
      : DISEASE_STAGES.HEALTHY,
    inQueue: false,
    queueLeaderId: null,
    queueFollowerId: null,
    queueGapDistance: Infinity,
    queueLength: 1,
    queueOrder: Number.isFinite(options.queueOrder) ? options.queueOrder : index,
    migrationTargetSide,
    migrationWaypointIndex: 1,
    targetSpeed: baseSpeed,
    antennaeAngleDeg: PARAMS.ANTENNAE_ANGLE_MAX_DEG,
    wanderAngle: heading,
    shelterId: phase === PHASES.ALGAL_PHASE ? null : homeShelter.id,
    homeShelterId: phase === PHASES.ALGAL_PHASE ? null : homeShelter.id,
    homeShelterPos:
      phase === PHASES.ALGAL_PHASE
        ? null
        : { x: homeShelter.x, y: homeShelter.y },
    memoryFidelity: PARAMS.MEMORY_FIDELITY_DEFAULT,
    currentShelterId:
      startState === STATES.SHELTERING && phase !== PHASES.ALGAL_PHASE
        ? homeShelter.id
        : null,
    spatialMemory: [
      homeShelter.id,
      ...shelters
        .map((shelter) => shelter.id)
        .filter((shelterId) => shelterId !== homeShelter.id),
    ],
    foragingAnchorX: spawnAnchor.x,
    foragingAnchorY: spawnAnchor.y,
    foragingRadiusCm: randomBetween(
      behavior.foragingRadiusCm * 0.85,
      behavior.foragingRadiusCm * 1.15,
    ),
    stageOffset: randomBetween(0, 1000),
    wanderNoisePhase: randomBetween(0, Math.PI * 2),
    wanderNoiseRate: randomBetween(0.72, 1.28),
    previousScreenPosition: null,
    spriteProfile: "simulation",
    spriteSpace: "2d",
    spriteState: { forceTop: true },
    threatDrift: randomBetween(-1, 1),
    threatCooldownS: 0,
    threatRecoverS: 0,
    localThreat: null,
    shelterSlotIndex: index,
    shelterSlotShelterId: null,
    isDiseaseAvoiding: false,
    isVacatingShelter: false,
    diseaseMortalityTimerS: isDiseased
      ? randomBetween(
          PARAMS.DISEASE_MORTALITY_MIN_S,
          PARAMS.DISEASE_MORTALITY_MAX_S,
        )
      : Infinity,
    isDiseaseRemoved: false,
    diseaseResidualAdded: false,
    chemicalTrailEmitS: randomBetween(0, PARAMS.CHEMICAL_TRAIL_EMIT_INTERVAL_S),
    shelterChemicalPulseS: randomBetween(
      0,
      PARAMS.SHELTER_CHEM_PULSE_MAX_S,
    ),
    shelterChemicalPulseIntervalS: randomBetween(
      PARAMS.SHELTER_CHEM_PULSE_MIN_S,
      PARAMS.SHELTER_CHEM_PULSE_MAX_S,
    ),
    nightDepartureDelayS: null,
    nightDepartureElapsedS: 0,
    nightMigrationActive: startState === STATES.MIGRATING,
    shelterSearchDelayS: null,
    shelterSearchElapsedS: 0,
    shelterSearchActive: startState === STATES.SEEKING_SHELTER,
    positionHistory: [],
  };
};

const createAgents = (count, width, height, behavior, shelters, algaeCovers) =>
  Array.from({ length: count }, (_, index) =>
    createAgent(index, width, height, behavior, shelters, algaeCovers, {
      queueOrder: index,
    }),
  );

const stageNightMigrationQueue = (agents, width, height, behavior) => {
  const route = getInitialMigrationRoute(width, height);
  const migrants = agents
    .filter(
      (agent) =>
        !agent.isRetiring &&
        resolveOntogeneticPhase(
          agent.bodySize,
          behavior.socialSizeMm,
          behavior.postalgalAttractionSizeMm,
        ) !== PHASES.ALGAL_PHASE,
    )
    .sort((a, b) => {
      const aProgress =
        (a.x - route.start.x) * route.direction.x +
        (a.y - route.start.y) * route.direction.y;
      const bProgress =
        (b.x - route.start.x) * route.direction.x +
        (b.y - route.start.y) * route.direction.y;
      return bProgress - aProgress || a.id - b.id;
    });

  migrants.forEach((agent, index) => {
    const spacing =
      behavior.queueTargetDistanceCm || PARAMS.MIGRATION_INITIAL_SPACING_CM;
    const isEarlyLeader = index < PARAMS.NIGHT_DEPARTURE_LEADERS;
    agent.nightDepartureDelayS = isEarlyLeader
      ? index * PARAMS.NIGHT_DEPARTURE_LEADER_GAP_S
      : PARAMS.NIGHT_DEPARTURE_LEADER_GAP_S *
          PARAMS.NIGHT_DEPARTURE_LEADERS +
        (index - PARAMS.NIGHT_DEPARTURE_LEADERS + 1) *
          randomBetween(
            PARAMS.NIGHT_DEPARTURE_STAGGER_MIN_S,
            PARAMS.NIGHT_DEPARTURE_STAGGER_MAX_S,
          );
    agent.nightDepartureElapsedS = 0;
    agent.nightMigrationActive = false;
    agent.isJoiningQueue = false;
    agent.inQueue = index > 0;
    agent.queueLeaderId = null;
    agent.queueFollowerId = null;
    agent.queueGapDistance = index > 0 ? spacing : Infinity;
    agent.queueLength = migrants.length;
    agent.queueOrder = index;
    agent.migrationTargetSide = "end";
    agent.migrationWaypointIndex = 1;
    agent.targetSpeed = behavior.baseSpeedCmS;
    agent.threatRecoverS = 0;
    agent.localThreat = null;
    agent.renderAlpha = 1;
    agent.previousScreenPosition = null;
  });
};

const updateNightMigrationDepartures = (agents, dt, globalTimeHour, behavior) => {
  if (!isNightHour(globalTimeHour, behavior)) {
    agents.forEach((agent) => {
      agent.nightDepartureDelayS = null;
      agent.nightDepartureElapsedS = 0;
      agent.nightMigrationActive = false;
    });
    return;
  }

  agents.forEach((agent) => {
    if (
      agent.isRetiring ||
      agent.isDiseaseAvoiding ||
      doesAgentEmitDiseaseCue(agent) ||
      agent.ontogeneticPhase === PHASES.ALGAL_PHASE ||
      behavior.migrationUrge <= 0.5
    ) {
      agent.nightMigrationActive = false;
      return;
    }

    if (!Number.isFinite(agent.nightDepartureDelayS)) {
      agent.nightDepartureDelayS =
        (Number(agent.queueOrder) || 0) *
        randomBetween(
          PARAMS.NIGHT_DEPARTURE_STAGGER_MIN_S,
          PARAMS.NIGHT_DEPARTURE_STAGGER_MAX_S,
        );
      agent.nightDepartureElapsedS = 0;
    }

    agent.nightDepartureElapsedS = (agent.nightDepartureElapsedS || 0) + dt;
    if (agent.nightDepartureElapsedS >= agent.nightDepartureDelayS) {
      agent.nightMigrationActive = true;
      agent.currentShelterId = null;
    }
  });
};

const updateShelterSearchDepartures = (agents, dt, globalTimeHour, behavior) => {
  if (!isShelterSearchHour(globalTimeHour, behavior)) {
    agents.forEach((agent) => {
      agent.shelterSearchDelayS = null;
      agent.shelterSearchElapsedS = 0;
      agent.shelterSearchActive = false;
    });
    return;
  }

  agents.forEach((agent) => {
    if (
      agent.isRetiring ||
      agent.isDiseaseAvoiding ||
      agent.currentShelterId ||
      agent.ontogeneticPhase === PHASES.ALGAL_PHASE
    ) {
      return;
    }

    if (!Number.isFinite(agent.shelterSearchDelayS)) {
      agent.shelterSearchDelayS =
        (Number(agent.queueOrder) || 0) *
        randomBetween(
          PARAMS.SHELTER_SEARCH_STAGGER_MIN_S,
          PARAMS.SHELTER_SEARCH_STAGGER_MAX_S,
        );
      agent.shelterSearchElapsedS = 0;
    }

    agent.shelterSearchElapsedS = (agent.shelterSearchElapsedS || 0) + dt;
    if (agent.shelterSearchElapsedS >= agent.shelterSearchDelayS) {
      agent.shelterSearchActive = true;
      agent.nightMigrationActive = false;
    }
  });
};

const resolveOffshoreExitTarget = (agent, width, height) => {
  const angle = randomBetween(-Math.PI, Math.PI);
  const distance = Math.max(width, height) * 1.35;
  return {
    x: agent.x + Math.cos(angle) * distance,
    y: agent.y + Math.sin(angle) * distance,
  };
};

const isAgentOffscreen = (
  agent,
  width,
  height,
  margin = PARAMS.OFFSHORE_EXIT_REMOVE_MARGIN_PX,
) =>
  agent.x < -margin ||
  agent.x > width + margin ||
  agent.y < -margin ||
  agent.y > height + margin;

const isAgentInsideCanvas = (agent, width, height, margin = 0) =>
  agent.x >= margin &&
  agent.x <= width - margin &&
  agent.y >= margin &&
  agent.y <= height - margin;

const getRandomEdgeEntry = (
  width,
  height,
  margin = PARAMS.QUEUE_DOCKING_ENTRY_MARGIN_PX,
) => {
  const safeX = () => randomBetween(margin, Math.max(margin, width - margin));
  const safeY = () => randomBetween(margin, Math.max(margin, height - margin));
  const jitter = () => randomBetween(-0.28, 0.28);

  switch (Math.floor(Math.random() * 4)) {
    case 0:
      return {
        x: -margin,
        y: safeY(),
        direction: normalize2D(1, jitter()),
      };
    case 1:
      return {
        x: width + margin,
        y: safeY(),
        direction: normalize2D(-1, jitter()),
      };
    case 2:
      return {
        x: safeX(),
        y: -margin,
        direction: normalize2D(jitter(), 1),
      };
    default:
      return {
        x: safeX(),
        y: height + margin,
        direction: normalize2D(jitter(), -1),
      };
  }
};

const updateEdgeFade = (agent, width, height) => {
  const edgeDistance = Math.min(
    agent.x,
    width - agent.x,
    agent.y,
    height - agent.y,
  );
  agent.renderAlpha = smoothstep(
    0,
    PARAMS.OFFSHORE_EXIT_FADE_MARGIN_PX,
    edgeDistance,
  );
};

const markAgentForOffshoreExit = (agent, width, height) => {
  const target = resolveOffshoreExitTarget(agent, width, height);
  agent.isRetiring = true;
  agent.isJoiningQueue = false;
  agent.inQueue = false;
  agent.queueLeaderId = null;
  agent.queueFollowerId = null;
  agent.queueLength = 1;
  agent.currentShelterId = null;
  agent.offshoreExitTargetX = target.x;
  agent.offshoreExitTargetY = target.y;
  agent.state = STATES.OFFSHORE_EXIT;
  updateEdgeFade(agent, width, height);
};

const markAgentForQueueReentry = (agent, width, height, behavior, queueOrder) => {
  const entryMargin = Math.max(
    PARAMS.QUEUE_DOCKING_ENTRY_MARGIN_PX,
    resolveAgentRadius(agent.bodySize) * 2.4,
  );
  const entry = getRandomEdgeEntry(width, height, entryMargin);
  const entrySpeed = behavior.maxQueueSpeedCmS * 0.72;
  agent.isRetiring = false;
  agent.isJoiningQueue = true;
  agent.inQueue = false;
  agent.queueLeaderId = null;
  agent.queueFollowerId = null;
  agent.queueLength = 1;
  agent.queueOrder = queueOrder;
  agent.currentShelterId = null;
  agent.offshoreExitTargetX = null;
  agent.offshoreExitTargetY = null;
  agent.state = STATES.MIGRATING;
  agent.x = entry.x;
  agent.y = entry.y;
  agent.heading = Math.atan2(entry.direction.y, entry.direction.x);
  agent.vx = entry.direction.x * entrySpeed;
  agent.vy = entry.direction.y * entrySpeed;
  agent.targetSpeed = entrySpeed;
  agent.wanderAngle = agent.heading;
  updateEdgeFade(agent, width, height);
};

const isQueueExitCandidate = (agent) =>
  agent.isJoiningQueue || agent.inQueue || agent.state === STATES.MIGRATING;

const getEdgeDistance = (agent, width, height) =>
  Math.min(agent.x, width - agent.x, agent.y, height - agent.y);

const selectAgentsForOffshoreExit = (activeAgents, width, height, retireCount) => {
  const reef = getMainReefAnchor(width, height);
  return [...activeAgents]
    .sort((a, b) => {
      const aQueueRank = a.currentShelterId ? 0 : isQueueExitCandidate(a) ? 2 : 1;
      const bQueueRank = b.currentShelterId ? 0 : isQueueExitCandidate(b) ? 2 : 1;
      if (aQueueRank !== bQueueRank) return aQueueRank - bQueueRank;

      const aOrder = Number.isFinite(a.queueOrder) ? a.queueOrder : -1;
      const bOrder = Number.isFinite(b.queueOrder) ? b.queueOrder : -1;
      if (aOrder !== bOrder) return bOrder - aOrder;

      const aEdgeDistance = getEdgeDistance(a, width, height);
      const bEdgeDistance = getEdgeDistance(b, width, height);
      if (Math.abs(aEdgeDistance - bEdgeDistance) > 1) {
        return aEdgeDistance - bEdgeDistance;
      }

      const aReefDistance = magnitude(a.x - reef.x, a.y - reef.y);
      const bReefDistance = magnitude(b.x - reef.x, b.y - reef.y);
      if (Math.abs(aReefDistance - bReefDistance) > 1) {
        return bReefDistance - aReefDistance;
      }

      return (Number(b.id) || 0) - (Number(a.id) || 0);
    })
    .slice(0, retireCount);
};

const createQueueDockingAgent = (
  id,
  width,
  height,
  behavior,
  shelters,
  algaeCovers,
  queueOrder,
  groupIndex,
) => {
  const agent = createAgent(id, width, height, behavior, shelters, algaeCovers, {
    queueOrder,
  });
  const entryMargin = Math.max(
    PARAMS.QUEUE_DOCKING_ENTRY_MARGIN_PX + groupIndex * 3,
    resolveAgentRadius(agent.bodySize) * 2.4,
  );
  const entry = getRandomEdgeEntry(
    width,
    height,
    entryMargin,
  );
  const entrySpeed = behavior.maxQueueSpeedCmS * 0.72;

  agent.x = entry.x;
  agent.y = entry.y;
  agent.heading = Math.atan2(entry.direction.y, entry.direction.x);
  agent.vx = entry.direction.x * entrySpeed;
  agent.vy = entry.direction.y * entrySpeed;
  agent.targetSpeed = entrySpeed;
  agent.wanderAngle = agent.heading;
  agent.state = STATES.MIGRATING;
  agent.isJoiningQueue = true;
  agent.isRetiring = false;
  agent.currentShelterId = null;
  agent.renderAlpha = 1;
  return agent;
};

const reconcileAgents = (
  agents,
  count,
  width,
  height,
  behavior,
  shelters,
  algaeCovers,
) => {
  let activeAgents = agents.filter((agent) => !agent.isRetiring);
  let managedAgents = agents.filter(
    (agent) => !isAgentOffscreen(agent, width, height),
  );
  let countedActiveAgents = activeAgents.filter(
    (agent) => !agent.isDiseaseInflow,
  );
  let countedManagedAgents = managedAgents.filter(
    (agent) => !agent.isDiseaseInflow,
  );

  if (countedActiveAgents.length > count) {
    const retireCount = countedActiveAgents.length - count;
    selectAgentsForOffshoreExit(
      countedActiveAgents,
      width,
      height,
      retireCount,
    ).forEach((agent) => markAgentForOffshoreExit(agent, width, height));
    return agents;
  }

  if (countedActiveAgents.length === count || countedManagedAgents.length >= count) {
    return agents;
  }

  const reentryCandidates = agents
    .filter(
      (agent) =>
        agent.isRetiring &&
        !isAgentOffscreen(agent, width, height, PARAMS.OFFSHORE_EXIT_REMOVE_MARGIN_PX * 0.5),
    )
    .sort((a, b) => getEdgeDistance(b, width, height) - getEdgeDistance(a, width, height));
  const reentryCount = Math.min(count - activeAgents.length, reentryCandidates.length);
  for (let index = 0; index < reentryCount; index += 1) {
    markAgentForQueueReentry(
      reentryCandidates[index],
      width,
      height,
      behavior,
      activeAgents.length + index,
    );
  }

  if (reentryCount > 0) {
    activeAgents = agents.filter((agent) => !agent.isRetiring);
    managedAgents = agents.filter(
      (agent) => !isAgentOffscreen(agent, width, height),
    );
    countedActiveAgents = activeAgents.filter((agent) => !agent.isDiseaseInflow);
    countedManagedAgents = managedAgents.filter((agent) => !agent.isDiseaseInflow);
    if (
      countedActiveAgents.length === count ||
      countedManagedAgents.length >= count
    ) {
      return agents;
    }
  }

  const nextAgents = [...agents];
  const nextId =
    agents.reduce(
      (maxId, agent) => Math.max(maxId, Number(agent.id) || 0),
      -1,
    ) + 1;
  const createCount = count - countedManagedAgents.length;
  const dockingOffset = activeAgents.filter((agent) => agent.isJoiningQueue).length;
  for (let index = 0; index < createCount; index += 1) {
    nextAgents.push(
      createQueueDockingAgent(
        nextId + index,
        width,
        height,
        behavior,
        shelters,
        algaeCovers,
        activeAgents.length + index,
        dockingOffset + index,
      ),
    );
  }

  return nextAgents;
};

const getShelterOccupancy = (agents, shelters) => {
  const occupancy = new Map();
  shelters.forEach((shelter) => {
    occupancy.set(shelter.id, {
      total: 0,
      healthy: 0,
      diseased: 0,
    });
  });

  agents.forEach((agent) => {
    if (!agent.currentShelterId) {
      return;
    }
    const entry = occupancy.get(agent.currentShelterId);
    if (!entry) {
      return;
    }
    entry.total += 1;
    if (doesAgentEmitDiseaseCue(agent)) {
      entry.diseased += 1;
    } else {
      entry.healthy += 1;
    }
  });

  return occupancy;
};

const createShelterReservations = (shelters) => {
  const reservations = new Map();
  shelters.forEach((shelter) => {
    reservations.set(shelter.id, 0);
  });
  return reservations;
};

const getShelterLoad = (shelterId, occupancy, reservations) => {
  const occupied = occupancy.get(shelterId);
  const reserved = reservations?.get(shelterId) || 0;
  return (occupied?.total || 0) + reserved;
};

const hasResidualDiseaseSignal = (shelter, residualDiseaseSources = []) =>
  residualDiseaseSources.some(
    (source) =>
      source.shelterId === shelter?.id &&
      source.strength > PARAMS.DISEASE_RESIDUAL_MIN_STRENGTH,
  );

const isShelterContaminated = (
  shelterId,
  occupancy,
  residualDiseaseSources = [],
) => {
  if (!shelterId) {
    return false;
  }
  const occupied = occupancy.get(shelterId);
  return (
    (occupied?.diseased || 0) > 0 ||
    residualDiseaseSources.some(
      (source) =>
        source.shelterId === shelterId &&
        source.strength > PARAMS.DISEASE_RESIDUAL_MIN_STRENGTH,
    )
  );
};

const canEnterShelter = (
  shelter,
  occupancy,
  reservations,
  residualDiseaseSources = [],
) => {
  if (!shelter) {
    return false;
  }
  const occupied = occupancy.get(shelter.id);
  if (
    !occupied ||
    occupied.diseased > 0 ||
    hasResidualDiseaseSignal(shelter, residualDiseaseSources)
  ) {
    return false;
  }
  return getShelterLoad(shelter.id, occupancy, reservations) < shelter.capacity;
};

const resolveShelterThreatContext = (agent, shelters, previousShelterId) => {
  const shelter =
    shelters.find((entry) => entry.id === previousShelterId) ||
    shelters.reduce((best, entry) => {
      const distance = magnitude(agent.x - entry.x, agent.y - entry.y);
      if (!best || distance < best.distance) {
        return { ...entry, distance };
      }
      return best;
    }, null);

  if (!shelter) {
    return { zone: "outside", shelter: null, distance: Infinity };
  }

  const distance = Number.isFinite(shelter.distance)
    ? shelter.distance
    : magnitude(agent.x - shelter.x, agent.y - shelter.y);
  const insideDistance = shelter.radius * PARAMS.THREAT_SHELTER_INSIDE_RATIO;
  const nearDistance = shelter.radius + PARAMS.THREAT_SHELTER_NEAR_MARGIN_PX;

  if (previousShelterId || distance <= insideDistance) {
    return { zone: "inside", shelter, distance };
  }
  if (distance <= nearDistance) {
    return { zone: "near", shelter, distance };
  }
  return { zone: "outside", shelter, distance };
};

const reserveShelterSlot = (shelterId, reservations) => {
  if (!shelterId || !reservations?.has(shelterId)) {
    return;
  }
  reservations.set(shelterId, (reservations.get(shelterId) || 0) + 1);
};

const getShelterSlotIndex = (agent, shelter) => {
  if (!shelter) {
    return 0;
  }
  if (
    agent.shelterSlotShelterId !== shelter.id ||
    !Number.isFinite(agent.shelterSlotIndex)
  ) {
    agent.shelterSlotShelterId = shelter.id;
    agent.shelterSlotIndex = agent.id % Math.max(shelter.capacity, 1);
  }
  return agent.shelterSlotIndex % Math.max(shelter.capacity, 1);
};

const getShelterSlotPosition = (agent, shelter) => {
  const capacity = Math.max(shelter?.capacity || 1, 1);
  const slotIndex = getShelterSlotIndex(agent, shelter);
  const outerCount = Math.max(1, Math.ceil(capacity * 0.68));
  const usesOuterRing = slotIndex < outerCount;
  const ringIndex = usesOuterRing ? slotIndex : slotIndex - outerCount;
  const ringCount = usesOuterRing ? outerCount : Math.max(1, capacity - outerCount);
  const angleOffset = usesOuterRing ? 0 : Math.PI / Math.max(ringCount, 1);
  const angle = (ringIndex / ringCount) * Math.PI * 2 + angleOffset;
  const radiusX =
    shelter.radius *
    (usesOuterRing
      ? PARAMS.SHELTER_SLOT_OUTER_RADIUS_X
      : PARAMS.SHELTER_SLOT_INNER_RADIUS_X);
  const radiusY =
    shelter.radius *
    (usesOuterRing
      ? PARAMS.SHELTER_SLOT_OUTER_RADIUS_Y
      : PARAMS.SHELTER_SLOT_INNER_RADIUS_Y);

  return {
    x: shelter.x + Math.cos(angle) * radiusX,
    y: shelter.y + Math.sin(angle) * radiusY,
  };
};

const rememberShelterVisit = (agent, shelter) => {
  if (!agent || !shelter) {
    return;
  }

  agent.homeShelterId = shelter.id;
  agent.homeShelterPos = { x: shelter.x, y: shelter.y };
  agent.memoryFidelity = clamp(
    (agent.memoryFidelity ?? PARAMS.MEMORY_FIDELITY_DEFAULT) + 0.02,
    PARAMS.MEMORY_FIDELITY_MIN,
    PARAMS.MEMORY_FIDELITY_DEFAULT,
  );

  if (!Array.isArray(agent.spatialMemory)) {
    agent.spatialMemory = [shelter.id];
    return;
  }

  agent.spatialMemory = [
    shelter.id,
    ...agent.spatialMemory.filter((shelterId) => shelterId !== shelter.id),
  ];
};

const getRememberedShelterPosition = (agent, shelter) => {
  if (!shelter) {
    return null;
  }

  const remembered =
    agent.homeShelterId === shelter.id && agent.homeShelterPos
      ? agent.homeShelterPos
      : shelter;
  const fidelity = clamp(
    agent.memoryFidelity ?? PARAMS.MEMORY_FIDELITY_DEFAULT,
    PARAMS.MEMORY_FIDELITY_MIN,
    PARAMS.MEMORY_FIDELITY_DEFAULT,
  );
  const errorRadius =
    shelter.radius * (1 - fidelity) * 0.7;
  const errorAngle =
    ((agent.id * 1.618 + agent.stageOffset * 0.001) % 1) * Math.PI * 2;

  return {
    x: remembered.x + Math.cos(errorAngle) * errorRadius,
    y: remembered.y + Math.sin(errorAngle) * errorRadius,
  };
};

const deprioritizeShelterMemory = (agent, shelterId) => {
  if (!shelterId || !Array.isArray(agent.spatialMemory)) {
    return;
  }

  const currentIndex = agent.spatialMemory.indexOf(shelterId);
  if (currentIndex <= 0) {
    return;
  }

  const [removed] = agent.spatialMemory.splice(currentIndex, 1);
  agent.spatialMemory.push(removed);
};

const getBestShelterFromMemory = (
  agent,
  shelters,
  occupancy,
  reservations,
  residualDiseaseSources = [],
) => {
  for (const shelterId of agent.spatialMemory) {
    const shelter = shelters.find((entry) => entry.id === shelterId);
    if (
      canEnterShelter(shelter, occupancy, reservations, residualDiseaseSources)
    ) {
      return shelter;
    }
  }

  return (
    shelters.find((shelter) =>
      canEnterShelter(
        shelter,
        occupancy,
        reservations,
        residualDiseaseSources,
      ),
    ) || null
  );
};

const getNearestShelter = (agent, shelters) =>
  shelters.reduce((best, shelter) => {
    const distance = magnitude(agent.x - shelter.x, agent.y - shelter.y);
    if (!best || distance < best.distance) {
      return { shelter, distance };
    }
    return best;
  }, null)?.shelter || null;

const resolveOpenSubstrateRefuge = (agent, diseaseSource, shelters, width, height) => {
  const nearestShelter = shelters.reduce((best, shelter) => {
    const distance = magnitude(agent.x - shelter.x, agent.y - shelter.y);
    if (!best || distance < best.distance) {
      return { shelter, distance };
    }
    return best;
  }, null)?.shelter;
  const sourceX = diseaseSource?.x ?? nearestShelter?.x ?? width * 0.5;
  const sourceY = diseaseSource?.y ?? nearestShelter?.y ?? height * 0.5;
  const away = normalize2D(agent.x - sourceX, agent.y - sourceY, {
    x: Math.cos(agent.wanderAngle || agent.heading),
    y: Math.sin(agent.wanderAngle || agent.heading),
  });
  const tangent = { x: -away.y, y: away.x };
  const orbitSide = agent.id % 2 === 0 ? 1 : -1;
  const refugeDistance =
    (nearestShelter?.radius || 56) + behaviorSafeDistance(agent.bodySize);

  return {
    x: clamp(
      sourceX + away.x * refugeDistance + tangent.x * orbitSide * 44,
      PARAMS.BOUNDARY_MARGIN_PX,
      width - PARAMS.BOUNDARY_MARGIN_PX,
    ),
    y: clamp(
      sourceY + away.y * refugeDistance + tangent.y * orbitSide * 44,
      PARAMS.BOUNDARY_MARGIN_PX,
      height - PARAMS.BOUNDARY_MARGIN_PX,
    ),
  };
};

const behaviorSafeDistance = (bodySizeMm) =>
  96 + resolveAgentRadius(bodySizeMm) * 2.6;

const buildChemicalSources = (
  agents,
  shelters,
  occupancy,
  residualDiseaseSources = [],
) => {
  const healthySources = [];
  const diseaseSources = [...residualDiseaseSources];

  shelters.forEach((shelter) => {
    const count = occupancy.get(shelter.id) || { healthy: 0, diseased: 0 };

    if (count.healthy > 0 || shelters.length === 1) {
      healthySources.push({
        x: shelter.x,
        y: shelter.y,
        shelterId: shelter.id,
        strength:
          PARAMS.HEALTHY_CHEM_STRENGTH * (0.65 + count.healthy * 0.18),
      });
    }

    if (count.diseased > 0) {
      diseaseSources.push({
        x: shelter.x,
        y: shelter.y,
        shelterId: shelter.id,
        strength: PARAMS.DISEASE_CHEM_STRENGTH * (1 + count.diseased * 0.24),
      });
    }
  });

  agents.forEach((agent) => {
    if (!doesAgentEmitDiseaseCue(agent)) {
      return;
    }
    diseaseSources.push({
      x: agent.x,
      y: agent.y,
      strength: PARAMS.DISEASE_CHEM_STRENGTH * 0.82,
    });
  });

  return { healthySources, diseaseSources };
};

const createDiseaseResidualSource = (agent, shelters) => {
  const shelter =
    shelters.find((entry) => entry.id === agent.currentShelterId) ||
    shelters.find((entry) => entry.id === agent.shelterId);

  return {
    x: shelter?.x ?? agent.x,
    y: shelter?.y ?? agent.y,
    shelterId: shelter?.id ?? null,
    strength: PARAMS.DISEASE_CHEM_STRENGTH * 0.92,
  };
};

const updateResidualDiseaseSources = (sources, dt) =>
  sources
    .map((source) => ({
      ...source,
      strength:
        source.strength * Math.exp(-dt / PARAMS.DISEASE_RESIDUAL_DECAY_S),
    }))
    .filter((source) => source.strength > PARAMS.DISEASE_RESIDUAL_MIN_STRENGTH);

const sampleChemicalAtPoint = (point, sources) => {
  const radius = PARAMS.CHEMICAL_RADIUS_CM;
  const radiusSq = radius * radius;
  const flowAngle = Math.atan2(PARAMS.PLUME_FLOW_Y, PARAMS.PLUME_FLOW_X);
  const cosA = Math.cos(-flowAngle);
  const sinA = Math.sin(-flowAngle);
  let concentration = 0;
  let strongest = null;

  sources.forEach((source) => {
    const dx = point.x - source.x;
    const dy = point.y - source.y;
    const rotX = dx * cosA - dy * sinA;
    const rotY = dx * sinA + dy * cosA;
    const scaledX = rotX / PARAMS.PLUME_LENGTH_SCALE;
    const scaledY = rotY / PARAMS.PLUME_WIDTH_SCALE;
    const distanceSq = scaledX * scaledX + scaledY * scaledY;
    if (distanceSq > radiusSq * 4) {
      return;
    }

    const distance = Math.sqrt(distanceSq) || 1;
    const plumeFactor = lerp(
      0.24,
      1.18,
      clamp((scaledX / distance + 1) * 0.5, 0, 1),
    );
    const value = (source.strength * plumeFactor) / (1 + distanceSq / radiusSq);
    concentration += value;

    if (!strongest || value > strongest.value) {
      strongest = { ...source, value };
    }
  });

  return {
    concentration,
    strongestSource: strongest,
  };
};

const sampleChemicalGradient = (agent, sources) => {
  const forward = normalize2D(agent.vx, agent.vy, angleToVector(agent.heading));
  const antennaeAngleRad = (agent.antennaeAngleDeg * Math.PI) / 180;
  const halfSpread = antennaeAngleRad * 0.5;
  const antennaLength = PARAMS.ANTENNA_LENGTH_CM;
  const leftPoint = {
    x: agent.x + Math.cos(agent.heading - halfSpread) * antennaLength,
    y: agent.y + Math.sin(agent.heading - halfSpread) * antennaLength,
  };
  const rightPoint = {
    x: agent.x + Math.cos(agent.heading + halfSpread) * antennaLength,
    y: agent.y + Math.sin(agent.heading + halfSpread) * antennaLength,
  };
  const centerPoint = {
    x: agent.x + forward.x * antennaLength * 0.8,
    y: agent.y + forward.y * antennaLength * 0.8,
  };
  const left = sampleChemicalAtPoint(leftPoint, sources);
  const right = sampleChemicalAtPoint(rightPoint, sources);
  const center = sampleChemicalAtPoint(centerPoint, sources);

  return {
    concentration: Math.max(
      center.concentration,
      left.concentration,
      right.concentration,
    ),
    turn: clamp((right.concentration - left.concentration) * 1.8, -1, 1),
    strongestSource:
      center.strongestSource || left.strongestSource || right.strongestSource,
  };
};

const applyForce = (agent, x, y, weight = 1) => {
  agent.ax += x * weight;
  agent.ay += y * weight;
};

const steerTowardPoint = (agent, targetX, targetY, desiredSpeed) => {
  const toTargetX = targetX - agent.x;
  const toTargetY = targetY - agent.y;
  const distance = magnitude(toTargetX, toTargetY);
  if (distance < 1e-4) {
    return { x: 0, y: 0, distance };
  }

  const dir = { x: toTargetX / distance, y: toTargetY / distance };
  const desired = { x: dir.x * desiredSpeed, y: dir.y * desiredSpeed };
  return {
    x: desired.x - agent.vx,
    y: desired.y - agent.vy,
    distance,
  };
};

const steerAwayFromPoint = (agent, targetX, targetY, desiredSpeed) => {
  const awayX = agent.x - targetX;
  const awayY = agent.y - targetY;
  const distance = magnitude(awayX, awayY);
  if (distance < 1e-4) {
    return { x: 0, y: 0, distance };
  }

  const dir = { x: awayX / distance, y: awayY / distance };
  const desired = { x: dir.x * desiredSpeed, y: dir.y * desiredSpeed };
  return {
    x: desired.x - agent.vx,
    y: desired.y - agent.vy,
    distance,
  };
};

const advanceSmoothWander = (agent, dt, scale = 1) => {
  agent.wanderNoisePhase +=
    PARAMS.WANDER_NOISE_RATE_S * (agent.wanderNoiseRate || 1) * dt;
  const turn =
    Math.sin(agent.wanderNoisePhase) *
    PARAMS.WANDER_NOISE_AMPLITUDE *
    scale *
    dt;
  agent.wanderAngle = wrapAngle(agent.wanderAngle + turn);
  return angleToVector(agent.wanderAngle);
};

const resolveBoundaryAvoidance = (agent, width, height) => {
  const margin = PARAMS.BOUNDARY_SOFT_MARGIN_PX;
  let inwardX = 0;
  let inwardY = 0;

  if (agent.x < margin) {
    inwardX += 1 - agent.x / margin;
  } else if (agent.x > width - margin) {
    inwardX -= 1 - (width - agent.x) / margin;
  }

  if (agent.y < margin) {
    inwardY += 1 - agent.y / margin;
  } else if (agent.y > height - margin) {
    inwardY -= 1 - (height - agent.y) / margin;
  }

  const strength = magnitude(inwardX, inwardY);
  if (strength <= 1e-3) {
    return { active: false, x: 0, y: 0, intensity: 0 };
  }

  const dir = normalize2D(inwardX, inwardY);
  return {
    active: true,
    x: dir.x,
    y: dir.y,
    intensity: clamp(strength, 0, 1),
  };
};

const applySoftBoundaryMargin = (agent, width, height, dt) => {
  const boundary = resolveBoundaryAvoidance(agent, width, height);
  if (!boundary.active) {
    return;
  }

  const currentDir = normalize2D(agent.vx, agent.vy, angleToVector(agent.heading));
  const outwardness = clamp(
    -(currentDir.x * boundary.x + currentDir.y * boundary.y),
    0,
    1,
  );
  const urgency = clamp(boundary.intensity * 0.55 + outwardness * 0.45, 0, 1);
  const inwardSpeed = Math.max(
    magnitude(agent.vx, agent.vy),
    agent.targetSpeed || 0,
  );

  if (inwardSpeed > 1e-4) {
    const steer = {
      x: boundary.x * inwardSpeed - agent.vx,
      y: boundary.y * inwardSpeed - agent.vy,
    };
    applyForce(
      agent,
      steer.x,
      steer.y,
      PARAMS.BOUNDARY_SOFT_STEER_WEIGHT * urgency,
    );
  }

  agent.heading = turnTowardAngle(
    agent.heading,
    Math.atan2(boundary.y, boundary.x),
    PARAMS.BOUNDARY_SOFT_TURN_RATE_RAD_S * dt * urgency,
  );
};

const containSoftBoundaryMotion = (agent, nextX, nextY, width, height) => {
  const margin = PARAMS.BOUNDARY_CONTAIN_MARGIN_PX;
  const minX = margin;
  const maxX = width - margin;
  const minY = margin;
  const maxY = height - margin;
  let x = nextX;
  let y = nextY;
  let inwardX = 0;
  let inwardY = 0;

  if (x < minX) {
    x = minX;
    inwardX += 1;
  } else if (x > maxX) {
    x = maxX;
    inwardX -= 1;
  }

  if (y < minY) {
    y = minY;
    inwardY += 1;
  } else if (y > maxY) {
    y = maxY;
    inwardY -= 1;
  }

  if (inwardX === 0 && inwardY === 0) {
    return { x, y };
  }

  const inward = normalize2D(inwardX, inwardY);
  const outwardVelocity = Math.min(0, agent.vx * inward.x + agent.vy * inward.y);
  if (outwardVelocity < 0) {
    agent.vx -= inward.x * outwardVelocity * PARAMS.BOUNDARY_OUTWARD_DAMPING;
    agent.vy -= inward.y * outwardVelocity * PARAMS.BOUNDARY_OUTWARD_DAMPING;
  }

  agent.heading = turnTowardAngle(
    agent.heading,
    Math.atan2(inward.y, inward.x),
    PARAMS.BOUNDARY_SOFT_TURN_RATE_RAD_S * 0.18,
  );

  return { x, y };
};

const applySoftSeparation = (agent, agents, spatialGrid = null) => {
  if (agent.currentShelterId || agent.inQueue || agent.state === STATES.MIGRATING) {
    return;
  }

  const agentRadius = resolveAgentRadius(agent.bodySize);
  const neighborRadius =
    (agentRadius + PARAMS.AGENT_RADIUS_MAX_PX + PARAMS.COLLISION_PADDING_PX) *
    PARAMS.SEPARATION_RADIUS_MULTIPLIER;
  const neighbors = spatialGrid
    ? spatialGrid.getNeighbors(agent, neighborRadius)
    : agents;
  let pushX = 0;
  let pushY = 0;
  let pushCount = 0;

  neighbors.forEach((other) => {
    if (other.id === agent.id || other.currentShelterId) {
      return;
    }

    const dx = agent.x - other.x;
    const dy = agent.y - other.y;
    const distance = magnitude(dx, dy);
    const otherRadius = resolveAgentRadius(other.bodySize);
    const minimumDistance =
      (agentRadius + otherRadius + PARAMS.COLLISION_PADDING_PX) *
      PARAMS.SEPARATION_RADIUS_MULTIPLIER;

    if (distance <= 1e-4 || distance >= minimumDistance) {
      return;
    }

    const overlapRatio = (minimumDistance - distance) / minimumDistance;
    const queueDamping = agent.inQueue || other.inQueue ? 0.48 : 1;
    pushX += (dx / distance) * overlapRatio * queueDamping;
    pushY += (dy / distance) * overlapRatio * queueDamping;
    pushCount += 1;
  });

  if (pushCount > 0) {
    const push = normalize2D(pushX, pushY);
    applyForce(
      agent,
      push.x,
      push.y,
      PARAMS.SEPARATION_FORCE_WEIGHT * Math.min(1, pushCount / 3),
    );
  }
};

const isQueueBondEligible = (agent) =>
  agent?.state === STATES.MIGRATING &&
  agent.ontogeneticPhase !== PHASES.ALGAL_PHASE &&
  !agent.isRetiring &&
  !agent.isDiseaseAvoiding &&
  !doesAgentEmitDiseaseCue(agent) &&
  !agent.currentShelterId &&
  !(agent.localThreat?.active) &&
  !(agent.threatRecoverS > 0);

const releaseQueueBond = (agent, agentsById) => {
  if (!agent) {
    return;
  }

  const leader = agentsById?.get(agent.queueLeaderId);
  if (leader?.queueFollowerId === agent.id) {
    leader.queueFollowerId = null;
  }

  const follower = agentsById?.get(agent.queueFollowerId);
  if (follower?.queueLeaderId === agent.id) {
    follower.queueLeaderId = null;
  }

  agent.queueLeaderId = null;
  agent.queueFollowerId = null;
  agent.queueGapDistance = Infinity;
  agent.queueLength = 1;
  agent.inQueue = false;
};

const hasQueueCycle = (follower, leader, agentsById) => {
  const visited = new Set([follower.id]);
  let cursor = leader;

  while (cursor?.queueLeaderId != null) {
    if (visited.has(cursor.id)) {
      return true;
    }
    visited.add(cursor.id);
    cursor = agentsById.get(cursor.queueLeaderId);
  }

  return false;
};

const buildQueueAssignments = (agents) => {
  const agentsById = new Map(agents.map((agent) => [agent.id, agent]));
  const migrants = agents
    .filter((agent) => isQueueBondEligible(agent))
    .sort((a, b) => {
      return (
        (Number(a.queueOrder) || 0) - (Number(b.queueOrder) || 0) ||
        (Number(a.nightDepartureDelayS) || 0) -
          (Number(b.nightDepartureDelayS) || 0) ||
        a.id - b.id
      );
    });
  const eligibleIds = new Set(migrants.map((agent) => agent.id));

  agents.forEach((agent) => {
    if (!isQueueBondEligible(agent)) {
      releaseQueueBond(agent, agentsById);
    }
  });

  migrants.forEach((agent) => {
    const leader = agentsById.get(agent.queueLeaderId);
    const follower = agentsById.get(agent.queueFollowerId);
    const leaderInvalid =
      leader &&
      (!eligibleIds.has(leader.id) ||
        leader.queueFollowerId !== agent.id ||
        hasQueueCycle(agent, leader, agentsById));
    const followerInvalid =
      follower &&
      (!eligibleIds.has(follower.id) || follower.queueLeaderId !== agent.id);

    if (leaderInvalid || followerInvalid) {
      releaseQueueBond(agent, agentsById);
    }
  });

  migrants.forEach((agent, index) => {
    if (agent.queueLeaderId || index === 0) {
      return;
    }

    const leader = migrants
      .slice(0, index)
      .reverse()
      .find((candidate) => !candidate.queueFollowerId);
    if (!leader || hasQueueCycle(agent, leader, agentsById)) {
      return;
    }

    agent.queueLeaderId = leader.id;
    leader.queueFollowerId = agent.id;
  });

  migrants.forEach((agent) => {
    const leader = agentsById.get(agent.queueLeaderId);
    agent.queueGapDistance = leader
      ? magnitude(leader.x - agent.x, leader.y - agent.y)
      : Infinity;
    agent.inQueue = Boolean(leader);
    agent.queueLength = migrants.length;
  });
};

const resolveGlobalTimeHours = (startHour, elapsedSeconds, behavior) => {
  if (behavior?.circadianPhase) {
    return CIRCADIAN_PHASE_HOURS[behavior.circadianPhase] ?? startHour;
  }

  const advancedHours =
    (elapsedSeconds * PARAMS.CIRCADIAN_TIME_ACCELERATION) / 3600;
  let hour = (startHour + advancedHours) % 24;
  if (hour < 0) {
    hour += 24;
  }
  return hour;
};

const determineState = (agent, globalTimeHour, behavior) => {
  if (agent.isRetiring) {
    return STATES.OFFSHORE_EXIT;
  }
  if (agent.isVacatingShelter) {
    return STATES.VACATING;
  }
  if (agent.isDiseaseAvoiding) {
    return STATES.SEEKING_SHELTER;
  }
  if (isShelterSearchHour(globalTimeHour, behavior)) {
    return agent.currentShelterId ? STATES.SHELTERING : STATES.SEEKING_SHELTER;
  }
  if (agent.isJoiningQueue) {
    return STATES.MIGRATING;
  }
  if (isNightHour(globalTimeHour, behavior)) {
    if (
      agent.ontogeneticPhase !== PHASES.ALGAL_PHASE &&
      behavior.migrationUrge > 0.5 &&
      agent.nightMigrationActive
    ) {
      return STATES.MIGRATING;
    }
    return agent.currentShelterId ? STATES.SHELTERING : STATES.FORAGING;
  }
  if (
    agent.ontogeneticPhase !== PHASES.ALGAL_PHASE &&
    !agent.currentShelterId
  ) {
    return STATES.SEEKING_SHELTER;
  }
  return STATES.SHELTERING;
};

const resolveLocalThreat = (agent, pointerState, behavior) => {
  if (
    !behavior.threatActive ||
    !pointerState?.active ||
    agent.ontogeneticPhase === PHASES.ALGAL_PHASE
  ) {
    return { active: false, distance: Infinity, intensity: 0 };
  }

  const dx = agent.x - pointerState.x;
  const dy = agent.y - pointerState.y;
  const distance = magnitude(dx, dy);
  const alertRadius = PARAMS.LOCAL_THREAT_RADIUS_PX * 1.35;
  const releaseRadius = PARAMS.LOCAL_THREAT_RELEASE_RADIUS_PX * 1.35;
  const wasThreatened = agent.localThreat?.active || agent.threatRecoverS > 0;
  const activeRadius = wasThreatened ? releaseRadius : alertRadius;

  if (distance > activeRadius) {
    return { active: false, distance, intensity: 0 };
  }

  const away = normalize2D(dx, dy, angleToVector(agent.heading + Math.PI));
  const intensity = 1 - smoothstep(alertRadius * 0.42, activeRadius, distance);
  return {
    active: true,
    x: pointerState.x,
    y: pointerState.y,
    distance,
    intensity,
    away,
    tailFlip: distance < alertRadius * PARAMS.TAIL_FLIP_DISTANCE_RATIO,
  };
};

const updateAntennaeAngle = (agent, behavior) => {
  const speed = magnitude(agent.vx, agent.vy);
  const ratio = inverseLerp(
    speed,
    behavior.minQueueSpeedCmS,
    behavior.maxQueueSpeedCmS,
  );
  const turnSpread = clamp((agent.turnIntensity || 0) / 1.8, 0, 1);
  if (speed <= behavior.baseSpeedCmS) {
    agent.antennaeAngleDeg = lerp(
      PARAMS.ANTENNAE_ANGLE_MAX_DEG,
      PARAMS.ANTENNAE_ANGLE_MID_DEG,
      inverseLerp(speed, PARAMS.FORAGE_SPEED_MIN_CM_S, behavior.baseSpeedCmS),
    );
    return;
  }
  agent.antennaeAngleDeg = lerp(
    PARAMS.ANTENNAE_ANGLE_MID_DEG,
    PARAMS.ANTENNAE_ANGLE_MIN_DEG,
    ratio,
  );
  agent.antennaeAngleDeg = lerp(
    agent.antennaeAngleDeg,
    PARAMS.ANTENNAE_ANGLE_MAX_DEG,
    turnSpread * 0.92,
  );
};

const getDelayedLeaderFrame = (leader) => {
  const history = Array.isArray(leader.positionHistory)
    ? leader.positionHistory
    : [];
  return (
    history.find((entry) => entry.age >= PARAMS.QUEUE_FOLLOW_DELAY_S) || {
      x: leader.x,
      y: leader.y,
      heading: leader.heading,
    }
  );
};

const recordAgentPositionHistory = (agent, dt) => {
  const nextHistory = Array.isArray(agent.positionHistory)
    ? agent.positionHistory
        .map((entry) => ({ ...entry, age: entry.age + dt }))
        .filter((entry) => entry.age <= PARAMS.QUEUE_HISTORY_DURATION_S)
    : [];
  nextHistory.unshift({
    x: agent.x,
    y: agent.y,
    heading: agent.heading,
    age: 0,
  });
  agent.positionHistory = nextHistory;
};

const updateAgent = ({
  agent,
  agents,
  shelters,
  occupancy,
  shelterReservations,
  algaeCovers,
  healthySources,
  diseaseSources,
  chemicalField,
  spatialGrid,
  residualDiseaseSources,
  globalTimeHour,
  behavior,
  pointerState,
  dt,
  width,
  height,
}) => {
  const previousHeading = agent.heading;
  agent.ontogeneticPhase = resolveOntogeneticPhase(
    agent.bodySize,
    behavior.socialSizeMm,
    behavior.postalgalAttractionSizeMm,
  );
  if (agent.isDiseased && !agent.isDiseaseRemoved) {
    agent.infectionAgeS = (agent.infectionAgeS || 0) + dt;
  }
  agent.diseaseStage = resolveDiseaseStage(agent);
  if (isAgentContagious(agent)) {
    agent.diseaseMortalityTimerS = Math.max(
      0,
      (agent.diseaseMortalityTimerS || 0) - dt,
    );
  }
  const healthyChemSource = sampleChemicalGradient(agent, healthySources);
  const diseaseChemSource = sampleChemicalGradient(agent, diseaseSources);
  const healthyChemField = sampleChemicalFieldGradient(
    agent,
    chemicalField,
    "healthy",
  );
  const diseaseChemField = sampleChemicalFieldGradient(
    agent,
    chemicalField,
    "disease",
  );
  const healthyChem = {
    ...healthyChemField,
    strongestSource:
      healthyChemField.strongestSource || healthyChemSource.strongestSource,
  };
  const diseaseChem = {
    ...diseaseChemField,
    strongestSource:
      diseaseChemField.strongestSource || diseaseChemSource.strongestSource,
  };
  const previousShelterId = agent.currentShelterId;
  const currentShelterContaminated =
    !agent.isDiseased &&
    isShelterContaminated(
      previousShelterId,
      occupancy,
      residualDiseaseSources,
    );
  agent.isDiseaseAvoiding =
    !agent.isDiseased &&
    (currentShelterContaminated ||
      diseaseChem.concentration > behavior.diseaseThreshold);
  agent.isVacatingShelter = Boolean(
    currentShelterContaminated && previousShelterId,
  );
  agent.threatCooldownS = Math.max(0, (agent.threatCooldownS || 0) - dt);
  agent.threatRecoverS = Math.max(0, (agent.threatRecoverS || 0) - dt);
  const localThreat = resolveLocalThreat(agent, pointerState, behavior);
  agent.localThreat = localThreat;
  agent.state = determineState(agent, globalTimeHour, behavior);
  if (
    isAgentContagious(agent) &&
    previousShelterId &&
    !agent.isRetiring &&
    !agent.isDiseaseRemoved
  ) {
    agent.state = STATES.SHELTERING;
  }
  const shelterThreatContext = resolveShelterThreatContext(
    agent,
    shelters,
    previousShelterId,
  );
  agent.shelterThreatZone = shelterThreatContext.zone;
  if (
    localThreat.active &&
    localThreat.tailFlip &&
    shelterThreatContext.zone === "outside" &&
    agent.threatCooldownS <= 0
  ) {
    agent.vx += localThreat.away.x * PARAMS.TAIL_FLIP_IMPULSE_CM_S;
    agent.vy += localThreat.away.y * PARAMS.TAIL_FLIP_IMPULSE_CM_S;
    agent.threatCooldownS = PARAMS.TAIL_FLIP_COOLDOWN_S;
  }
  if (localThreat.active && !agent.isRetiring) {
    const agentsById = new Map(agents.map((entry) => [entry.id, entry]));
    agent.threatRecoverS = PARAMS.LOCAL_THREAT_REJOIN_DELAY_S;
    releaseQueueBond(agent, agentsById);

    if (agent.isDiseaseAvoiding) {
      agent.state = agent.isVacatingShelter
        ? STATES.VACATING
        : STATES.SEEKING_SHELTER;
    } else if (shelterThreatContext.zone === "inside") {
      agent.state = STATES.SHELTERING;
    } else if (shelterThreatContext.zone === "near") {
      agent.state = STATES.SEEKING_SHELTER;
    } else {
      agent.state = STATES.DEFENDING;
    }
  }
  if (agent.isJoiningQueue && agent.state !== STATES.MIGRATING) {
    releaseQueueBond(agent, new Map(agents.map((entry) => [entry.id, entry])));
    agent.isJoiningQueue = false;
    agent.inQueue = false;
    agent.queueLeaderId = null;
    agent.queueFollowerId = null;
    agent.queueLength = 1;
  }
  agent.currentShelterId = null;
  agent.ax = 0;
  agent.ay = 0;

  if (agent.isRetiring) {
    const targetX = Number.isFinite(agent.offshoreExitTargetX)
      ? agent.offshoreExitTargetX
      : resolveOffshoreExitTarget(agent, width, height).x;
    const targetY = Number.isFinite(agent.offshoreExitTargetY)
      ? agent.offshoreExitTargetY
      : resolveOffshoreExitTarget(agent, width, height).y;
    agent.offshoreExitTargetX = targetX;
    agent.offshoreExitTargetY = targetY;
    const steer = steerTowardPoint(
      agent,
      targetX,
      targetY,
      behavior.maxQueueSpeedCmS * PARAMS.OFFSHORE_EXIT_SPEED_SCALE,
    );
    applyForce(agent, steer.x, steer.y, 1.08);
    agent.targetSpeed =
      behavior.maxQueueSpeedCmS * PARAMS.OFFSHORE_EXIT_SPEED_SCALE;
  } else if (isAgentContagious(agent) && !previousShelterId) {
    releaseQueueBond(agent, new Map(agents.map((entry) => [entry.id, entry])));
    const nearestShelter = shelters.reduce((best, shelter) => {
      const distance = magnitude(agent.x - shelter.x, agent.y - shelter.y);
      if (!best || distance < best.distance) {
        return { shelter, distance };
      }
      return best;
    }, null);

    if (
      nearestShelter &&
      nearestShelter.distance <
        nearestShelter.shelter.radius + resolveAgentRadius(agent.bodySize) * 3
    ) {
      const shelterPosition = getShelterSlotPosition(
        agent,
        nearestShelter.shelter,
      );
      const settle = steerTowardPoint(
        agent,
        shelterPosition.x,
        shelterPosition.y,
        PARAMS.FORAGE_SPEED_MIN_CM_S,
      );
      applyForce(agent, settle.x, settle.y, 0.42);
      if (settle.distance < resolveAgentRadius(agent.bodySize) * 1.2) {
        agent.currentShelterId = nearestShelter.shelter.id;
        rememberShelterVisit(agent, nearestShelter.shelter);
        reserveShelterSlot(nearestShelter.shelter.id, shelterReservations);
      }
    } else {
      const lethargic = advanceSmoothWander(agent, dt, 0.16);
      applyForce(agent, lethargic.x, lethargic.y, 0.08);
    }

    agent.targetSpeed = PARAMS.FORAGE_SPEED_MIN_CM_S * 0.28;
  } else if (agent.isDiseaseAvoiding && diseaseChem.strongestSource) {
    deprioritizeShelterMemory(agent, diseaseChem.strongestSource.shelterId);
    const memoryShelter = getBestShelterFromMemory(
      agent,
      shelters,
      occupancy,
      shelterReservations,
      residualDiseaseSources,
    );
    const repel = steerAwayFromPoint(
      agent,
      diseaseChem.strongestSource.x,
      diseaseChem.strongestSource.y,
      PARAMS.DISEASE_ESCAPE_SPEED_CM_S,
    );
    applyForce(agent, repel.x, repel.y, behavior.diseaseRepulsionWeight);

    if (memoryShelter) {
      const memoryPosition = getShelterSlotPosition(agent, memoryShelter);
      const relocate = steerTowardPoint(
        agent,
        memoryPosition.x,
        memoryPosition.y,
        PARAMS.SEEK_SHELTER_SPEED_CM_S,
      );
      applyForce(agent, relocate.x, relocate.y, 0.72);
      if (relocate.distance < resolveAgentRadius(agent.bodySize) * 0.9) {
        agent.currentShelterId = memoryShelter.id;
        rememberShelterVisit(agent, memoryShelter);
        reserveShelterSlot(memoryShelter.id, shelterReservations);
      }
    } else {
      const openSubstrate = resolveOpenSubstrateRefuge(
        agent,
        diseaseChem.strongestSource,
        shelters,
        width,
        height,
      );
      const search = steerTowardPoint(
        agent,
        openSubstrate.x,
        openSubstrate.y,
        PARAMS.SEEK_SHELTER_SPEED_CM_S,
      );
      applyForce(agent, search.x, search.y, 0.82);
    }

    agent.targetSpeed = PARAMS.DISEASE_ESCAPE_SPEED_CM_S;
  } else if (agent.state === STATES.DEFENDING) {
    const threat = agent.localThreat;
    const nearbyDefenders = threat?.active
      ? agents.filter((entry) => {
          if (
            entry.ontogeneticPhase === PHASES.ALGAL_PHASE ||
            entry.isDiseaseAvoiding
          ) {
            return false;
          }
          return (
            magnitude(entry.x - threat.x, entry.y - threat.y) <
            PARAMS.LOCAL_THREAT_RELEASE_RADIUS_PX
          );
        })
      : [];
    const defenderCount = Math.max(
      nearbyDefenders.length,
      PARAMS.LOCAL_THREAT_MIN_DEFENDERS,
    );
    const averageDefenderDiameter =
      nearbyDefenders.length > 0
        ? nearbyDefenders.reduce(
            (sum, entry) => sum + resolveAgentRadius(entry.bodySize) * 2,
            0,
          ) / nearbyDefenders.length
        : PARAMS.AGENT_RADIUS_MAX_PX * 1.55;
    const physicalRequiredRadius =
      (defenderCount *
        averageDefenderDiameter *
        PARAMS.ROSETTE_DIAMETER_OVERLAP_RATIO) /
      (Math.PI * 2);
    const baseRosetteRadius = lerp(
      PARAMS.THREAT_ROSETTE_RADIUS_CM * 0.72,
      PARAMS.THREAT_ROSETTE_RADIUS_CM * 1.18,
      inverseLerp(defenderCount, 4, 18),
    );
    const rosetteRadius = Math.max(baseRosetteRadius, physicalRequiredRadius);
    const center =
      threat?.active && nearbyDefenders.length > 0
        ? nearbyDefenders.reduce(
            (accumulator, entry) => ({
              x: accumulator.x + entry.x / nearbyDefenders.length,
              y: accumulator.y + entry.y / nearbyDefenders.length,
            }),
            { x: 0, y: 0 },
          )
        : shelters.reduce(
            (accumulator, shelter) => ({
              x: accumulator.x + shelter.x / shelters.length,
              y: accumulator.y + shelter.y / shelters.length,
            }),
            { x: 0, y: 0 },
          );
    if (threat?.active && threat.tailFlip && agent.threatCooldownS <= 0) {
      agent.vx += threat.away.x * PARAMS.TAIL_FLIP_IMPULSE_CM_S;
      agent.vy += threat.away.y * PARAMS.TAIL_FLIP_IMPULSE_CM_S;
      agent.threatCooldownS = PARAMS.TAIL_FLIP_COOLDOWN_S;
    }
    const angle =
      (agent.id / Math.max(defenderCount, 1)) * Math.PI * 2 +
      agent.threatDrift * 0.28;
    const rosetteTarget = {
      x: center.x + Math.cos(angle) * rosetteRadius,
      y: center.y + Math.sin(angle) * rosetteRadius,
    };
    const rosetteSteer = steerTowardPoint(
      agent,
      rosetteTarget.x,
      rosetteTarget.y,
      PARAMS.DEFENSE_SPEED_CM_S,
    );
    applyForce(
      agent,
      rosetteSteer.x,
      rosetteSteer.y,
      PARAMS.THREAT_CENTER_PULL *
        (threat?.active ? 1 + threat.intensity : 0.72),
    );
    const tangent = normalize2D(-(agent.y - center.y), agent.x - center.x, {
      x: 0,
      y: -1,
    });
    applyForce(agent, tangent.x, tangent.y, PARAMS.THREAT_TANGENTIAL_WEIGHT);
    agent.targetSpeed = lerp(
      PARAMS.DEFENSE_SPEED_CM_S,
      behavior.maxQueueSpeedCmS,
      threat?.tailFlip ? 0.45 : 0.12,
    );
  } else if (agent.state === STATES.SEEKING_SHELTER) {
    if (agent.ontogeneticPhase === PHASES.ALGAL_PHASE) {
      const algaeTarget = algaeCovers.reduce((best, algae) => {
        const distance = magnitude(algae.x - agent.x, algae.y - agent.y);
        if (!best || distance < best.distance) {
          return { algae, distance };
        }
        return best;
      }, null)?.algae;
      if (algaeTarget) {
        const steer = steerTowardPoint(
          agent,
          algaeTarget.x,
          algaeTarget.y,
          PARAMS.SEEK_SHELTER_SPEED_CM_S * 0.8,
        );
        applyForce(agent, steer.x, steer.y, 1.2);
        agent.targetSpeed = PARAMS.SEEK_SHELTER_SPEED_CM_S * 0.8;
      }
    } else {
      const homeShelter = shelters.find(
        (entry) => entry.id === agent.homeShelterId,
      );
      const homeShelterContaminated = isShelterContaminated(
        homeShelter?.id,
        occupancy,
        residualDiseaseSources,
      );
      if (homeShelterContaminated) {
        deprioritizeShelterMemory(agent, homeShelter.id);
      }
      const memoryShelter = getBestShelterFromMemory(
        agent,
        shelters,
        occupancy,
        shelterReservations,
        residualDiseaseSources,
      );
      const nearestShelter = getNearestShelter(agent, shelters);
      const fallbackShelter =
        nearestShelter &&
        !isShelterContaminated(
          nearestShelter.id,
          occupancy,
          residualDiseaseSources,
        )
          ? nearestShelter
          : null;
      const shelterEntry = memoryShelter || fallbackShelter;
      let settleDistance = Infinity;
      const selectedShelterContaminated = isShelterContaminated(
        shelterEntry?.id,
        occupancy,
        residualDiseaseSources,
      );

      if (shelterEntry && !selectedShelterContaminated) {
        const rememberedPosition = getRememberedShelterPosition(
          agent,
          shelterEntry,
        );
        const memorySteer = steerTowardPoint(
          agent,
          rememberedPosition.x,
          rememberedPosition.y,
          PARAMS.SEEK_SHELTER_SPEED_CM_S,
        );
        applyForce(
          agent,
          memorySteer.x,
          memorySteer.y,
          PARAMS.HOMING_MEMORY_WEIGHT,
        );
      }

      if (
        agent.bodySize >= behavior.postalgalAttractionSizeMm &&
        healthyChem.concentration > behavior.healthyAttractionThreshold &&
        (healthyChemSource.strongestSource || healthyChem.strongestSource)
      ) {
        const olfactorySource =
          healthyChemSource.strongestSource || healthyChem.strongestSource;
        const olfactorySteer = steerTowardPoint(
          agent,
          olfactorySource.x,
          olfactorySource.y,
          PARAMS.SEEK_SHELTER_SPEED_CM_S,
        );
        applyForce(
          agent,
          olfactorySteer.x,
          olfactorySteer.y,
          PARAMS.HOMING_OLFACTORY_WEIGHT,
        );
        agent.heading = wrapAngle(
          agent.heading + healthyChem.turn * PARAMS.HEALTHY_WANDER_BLEND * dt,
        );
      }

      if (shelterEntry) {
        const targetPosition = getShelterSlotPosition(agent, shelterEntry);
        const settle = steerTowardPoint(
          agent,
          targetPosition.x,
          targetPosition.y,
          PARAMS.SEEK_SHELTER_SPEED_CM_S,
        );
        settleDistance = settle.distance;
        applyForce(agent, settle.x, settle.y, 0.38);
        if (settleDistance < resolveAgentRadius(agent.bodySize) * 0.9) {
          if (
            canEnterShelter(
              shelterEntry,
              occupancy,
              shelterReservations,
              residualDiseaseSources,
            )
          ) {
            agent.currentShelterId = shelterEntry.id;
            rememberShelterVisit(agent, shelterEntry);
            reserveShelterSlot(shelterEntry.id, shelterReservations);
          }
        }
      }
      const wander = advanceSmoothWander(agent, dt, 0.34);
      applyForce(
        agent,
        wander.x,
        wander.y,
        PARAMS.HOMING_WANDER_WEIGHT,
      );
      agent.targetSpeed = PARAMS.SEEK_SHELTER_SPEED_CM_S;
    }
  } else if (agent.state === STATES.MIGRATING) {
    if (agent.queueLeaderId) {
      const leader = agents.find((entry) => entry.id === agent.queueLeaderId);
      if (leader) {
        const leaderFrame = getDelayedLeaderFrame(leader);
        const tailTarget = {
          x: leaderFrame.x,
          y: leaderFrame.y,
        };
        const distanceToTail = magnitude(
          tailTarget.x - agent.x,
          tailTarget.y - agent.y,
        );
        agent.queueGapDistance = distanceToTail;
        const physicalTouchDistance =
          resolveAgentRadius(agent.bodySize) +
          resolveAgentRadius(leader.bodySize);
        const contactMaxDistance =
          physicalTouchDistance +
            behavior.queueTargetDistanceCm * PARAMS.QUEUE_CONTACT_MAX_RATIO;
        const brakeThreshold =
          physicalTouchDistance +
          behavior.queueBrakeDistanceCm * 0.5 +
          PARAMS.QUEUE_BRAKE_CLEARANCE_PX * 0.35;
        if (distanceToTail < brakeThreshold) {
          const brake = steerTowardPoint(agent, tailTarget.x, tailTarget.y, 0);
          const overlapSeverity = clamp(
            (brakeThreshold - distanceToTail) / Math.max(brakeThreshold, 1),
            0,
            1,
          );
          applyForce(
            agent,
            brake.x,
            brake.y,
            PARAMS.MIGRATION_BRAKE_WEIGHT * (1 + overlapSeverity * 1.2),
          );
        } else {
          const isReacquiringContact =
            distanceToTail > contactMaxDistance;
          const followSpeed = isReacquiringContact
            ? behavior.maxQueueSpeedCmS * PARAMS.QUEUE_CHASE_SPEED_SCALE
            : behavior.minQueueSpeedCmS;
          const tactileFollow = steerTowardPoint(
            agent,
            tailTarget.x,
            tailTarget.y,
            followSpeed,
          );
          applyForce(
            agent,
            tactileFollow.x,
            tactileFollow.y,
            PARAMS.TACTILE_BOND_STRENGTH *
              behavior.queueCohesionMultiplier *
              (isReacquiringContact ? 2 : 1.2),
          );
        }
        agent.inQueue = true;
      }
    }

    if (!agent.queueLeaderId) {
      const routeTarget = ensureMigrationTarget(agent, width, height);
      const routeSteer = steerTowardPoint(
        agent,
        routeTarget.x,
        routeTarget.y,
        behavior.maxQueueSpeedCmS,
      );
      applyForce(
        agent,
        routeSteer.x,
        routeSteer.y,
        PARAMS.MIGRATION_ROUTE_PULL_WEIGHT,
      );
      const wander = advanceSmoothWander(agent, dt, 0.42);
      applyForce(
        agent,
        wander.x,
        wander.y,
        PARAMS.MIGRATION_LEADER_WANDER_WEIGHT,
      );
      agent.inQueue = false;
    }

    const queueRatio = clamp(
      (agent.queueLength - 1) / Math.max(PARAMS.MAX_QUEUE_SIZE - 1, 1),
      0,
      1,
    );
    const isReacquiringLeader =
      agent.queueLeaderId &&
      agent.queueGapDistance >
        behavior.queueTargetDistanceCm * PARAMS.QUEUE_CONTACT_MAX_RATIO;
    agent.targetSpeed = agent.queueLeaderId
      ? isReacquiringLeader
        ? behavior.maxQueueSpeedCmS
        : lerp(
            behavior.minQueueSpeedCmS,
            behavior.baseSpeedCmS,
            queueRatio * 0.45,
          )
      : lerp(
          behavior.baseSpeedCmS,
          behavior.maxQueueSpeedCmS,
          queueRatio * 0.92,
        );
  } else if (agent.state === STATES.FORAGING) {
    const wander = advanceSmoothWander(agent, dt, 1);
    applyForce(agent, wander.x, wander.y, PARAMS.WANDER_PULL_WEIGHT);

    if (agent.ontogeneticPhase !== PHASES.ALGAL_PHASE) {
      const toAnchor = steerTowardPoint(
        agent,
        agent.foragingAnchorX,
        agent.foragingAnchorY,
        PARAMS.FORAGE_SPEED_MIN_CM_S,
      );
      if (toAnchor.distance > agent.foragingRadiusCm) {
        applyForce(agent, toAnchor.x, toAnchor.y, 0.95);
      }
    }

    agent.targetSpeed = lerp(
      PARAMS.FORAGE_SPEED_MIN_CM_S,
      PARAMS.FORAGE_SPEED_MAX_CM_S,
      agent.ontogeneticPhase === PHASES.ALGAL_PHASE ? 0.15 : 0.55,
    );
  } else {
    if (agent.ontogeneticPhase === PHASES.ALGAL_PHASE) {
      const algaeTarget = algaeCovers.reduce((best, algae) => {
        const distance = magnitude(algae.x - agent.x, algae.y - agent.y);
        if (!best || distance < best.distance) {
          return { algae, distance };
        }
        return best;
      }, null)?.algae;
      if (algaeTarget) {
        const settle = steerTowardPoint(agent, algaeTarget.x, algaeTarget.y, 0);
        applyForce(agent, settle.x, settle.y, 1.25);
      }
    } else {
      const shelter =
        shelters.find((entry) => entry.id === previousShelterId) ||
        shelters.find((entry) => entry.id === agent.shelterId) ||
        shelters[0];
      const shelterPosition = getShelterSlotPosition(agent, shelter);
      if (
        agent.localThreat?.active &&
        agent.shelterThreatZone === "inside"
      ) {
        const alertHeading = Math.atan2(
          agent.localThreat.y - agent.y,
          agent.localThreat.x - agent.x,
        );
        agent.heading = turnTowardAngle(
          agent.heading,
          alertHeading,
          PARAMS.THREAT_HEADING_TURN_RATE_RAD_S * dt,
        );
        agent.antennaeAngleDeg = PARAMS.ANTENNAE_ANGLE_MAX_DEG;
      }
      const settle = steerTowardPoint(
        agent,
        shelterPosition.x,
        shelterPosition.y,
        0,
      );
      applyForce(agent, settle.x, settle.y, 1.25);
      if (
        previousShelterId === shelter.id ||
        canEnterShelter(
          shelter,
          occupancy,
          shelterReservations,
          residualDiseaseSources,
        )
      ) {
        agent.currentShelterId = shelter.id;
        rememberShelterVisit(agent, shelter);
        if (previousShelterId !== shelter.id) {
          reserveShelterSlot(shelter.id, shelterReservations);
        }
      }
    }
    agent.targetSpeed = 0;
  }

  if (
    isAgentContagious(agent) &&
    !agent.isDiseaseRemoved
  ) {
    const predationPressure =
      behavior.threatActive && pointerState?.active && agent.localThreat?.active
        ? PARAMS.DISEASE_PREDATION_CULL_RATE_S * 2
        : agent.currentShelterId
          ? 0
          : PARAMS.DISEASE_PREDATION_CULL_RATE_S;
    const predationCull =
      predationPressure > 0 && Math.random() < predationPressure * dt;

    if (agent.diseaseMortalityTimerS <= 0 || predationCull) {
      agent.isDiseaseRemoved = true;
      agent.renderAlpha = 0;
      releaseQueueBond(agent, new Map(agents.map((entry) => [entry.id, entry])));
    }
  }

  applySoftSeparation(agent, agents, spatialGrid);
  if (!agent.isRetiring) {
    applySoftBoundaryMargin(agent, width, height, dt);
  }

  const limitedAccel = limitVector(agent.ax, agent.ay, PARAMS.MAX_STEER_CM_S2);
  agent.ax = limitedAccel.x;
  agent.ay = limitedAccel.y;

  agent.vx += agent.ax * dt * PARAMS.SIMULATION_TIME_SCALE;
  agent.vy += agent.ay * dt * PARAMS.SIMULATION_TIME_SCALE;

  const currentSpeed = magnitude(agent.vx, agent.vy);
  const desiredSpeed = agent.currentShelterId ? 0 : agent.targetSpeed;
  if (currentSpeed > 1e-4) {
    const desired = clamp(desiredSpeed, 0, behavior.maxQueueSpeedCmS);
    const blendedSpeed = lerp(
      currentSpeed,
      desired,
      agent.currentShelterId ? 0.28 : 0.08,
    );
    const dir = normalize2D(agent.vx, agent.vy, angleToVector(agent.heading));
    agent.vx = dir.x * blendedSpeed;
    agent.vy = dir.y * blendedSpeed;
  }

  agent.vx *= PARAMS.VELOCITY_DAMPING;
  agent.vy *= PARAMS.VELOCITY_DAMPING;

  const nextX = agent.x + agent.vx * dt;
  const nextY = agent.y + agent.vy * dt;
  const canMoveOffscreen =
    agent.isRetiring ||
    (agent.isJoiningQueue &&
      agent.state === STATES.MIGRATING &&
      !isAgentInsideCanvas(agent, width, height));
  if (canMoveOffscreen) {
    agent.x = nextX;
    agent.y = nextY;
  } else {
    const contained = containSoftBoundaryMotion(
      agent,
      nextX,
      nextY,
      width,
      height,
    );
    agent.x = contained.x;
    agent.y = contained.y;
  }
  if (magnitude(agent.vx, agent.vy) > 1e-4) {
    const nextHeading = Math.atan2(agent.vy, agent.vx);
    const maxTurnRate =
      agent.state === STATES.DEFENDING || agent.localThreat?.active
        ? PARAMS.THREAT_HEADING_TURN_RATE_RAD_S
        : PARAMS.HEADING_TURN_RATE_RAD_S;
    const nextVisualHeading = turnTowardAngle(
      agent.heading,
      nextHeading,
      maxTurnRate * dt,
    );
    agent.turnIntensity =
      Math.abs(wrapAngle(nextVisualHeading - previousHeading)) /
      Math.max(dt, 0.016);
    agent.heading = nextVisualHeading;
  } else {
    agent.turnIntensity = (agent.turnIntensity || 0) * 0.82;
  }

  if (agent.isRetiring) {
    updateEdgeFade(agent, width, height);
  } else if (agent.isJoiningQueue) {
    agent.renderAlpha = 1;
    if (isAgentInsideCanvas(agent, width, height, PARAMS.BOUNDARY_MARGIN_PX)) {
      agent.isJoiningQueue = false;
    }
  } else {
    agent.renderAlpha = 1;
  }

  updateAntennaeAngle(agent, behavior);
  recordAgentPositionHistory(agent, dt);
};

const createChemicalField = (width, height) => {
  const cellSizePx = PARAMS.CHEMICAL_FIELD_CELL_SIZE_PX;
  const cols = Math.max(1, Math.ceil(width / cellSizePx));
  const rows = Math.max(1, Math.ceil(height / cellSizePx));
  return {
    width,
    height,
    cellSizePx,
    cols,
    rows,
    healthy: new Float32Array(cols * rows),
    disease: new Float32Array(cols * rows),
    scratch: new Float32Array(cols * rows),
  };
};

const getChemicalFieldIndex = (field, column, row) => row * field.cols + column;

const sampleChemicalFieldAtPoint = (field, layerName, x, y) => {
  if (!field) {
    return 0;
  }
  const layer = field[layerName];
  const gx = clamp(x / field.cellSizePx, 0, field.cols - 1);
  const gy = clamp(y / field.cellSizePx, 0, field.rows - 1);
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const x1 = Math.min(x0 + 1, field.cols - 1);
  const y1 = Math.min(y0 + 1, field.rows - 1);
  const tx = gx - x0;
  const ty = gy - y0;
  const v00 = layer[getChemicalFieldIndex(field, x0, y0)] || 0;
  const v10 = layer[getChemicalFieldIndex(field, x1, y0)] || 0;
  const v01 = layer[getChemicalFieldIndex(field, x0, y1)] || 0;
  const v11 = layer[getChemicalFieldIndex(field, x1, y1)] || 0;

  return lerp(lerp(v00, v10, tx), lerp(v01, v11, tx), ty);
};

const sampleChemicalFieldGradient = (agent, field, layerName) => {
  const forward = normalize2D(agent.vx, agent.vy, angleToVector(agent.heading));
  const antennaeAngleRad = (agent.antennaeAngleDeg * Math.PI) / 180;
  const halfSpread = antennaeAngleRad * 0.5;
  const antennaLength = PARAMS.ANTENNA_LENGTH_CM;
  const left = sampleChemicalFieldAtPoint(
    field,
    layerName,
    agent.x + Math.cos(agent.heading - halfSpread) * antennaLength,
    agent.y + Math.sin(agent.heading - halfSpread) * antennaLength,
  );
  const right = sampleChemicalFieldAtPoint(
    field,
    layerName,
    agent.x + Math.cos(agent.heading + halfSpread) * antennaLength,
    agent.y + Math.sin(agent.heading + halfSpread) * antennaLength,
  );
  const center = sampleChemicalFieldAtPoint(
    field,
    layerName,
    agent.x + forward.x * antennaLength * 0.8,
    agent.y + forward.y * antennaLength * 0.8,
  );
  const probe = Math.max(field?.cellSizePx || 1, antennaLength * 0.75);
  const xGradient =
    sampleChemicalFieldAtPoint(field, layerName, agent.x + probe, agent.y) -
    sampleChemicalFieldAtPoint(field, layerName, agent.x - probe, agent.y);
  const yGradient =
    sampleChemicalFieldAtPoint(field, layerName, agent.x, agent.y + probe) -
    sampleChemicalFieldAtPoint(field, layerName, agent.x, agent.y - probe);
  const gradientDir = normalize2D(xGradient, yGradient, { x: 0, y: 0 });
  const concentration = Math.max(center, left, right);
  const hasFieldDirection = magnitude(gradientDir.x, gradientDir.y) > 1e-3;

  return {
    concentration,
    turn: clamp((right - left) * 1.8, -1, 1),
    strongestSource:
      concentration > PARAMS.CHEMICAL_FIELD_NOISE_CUTOFF && hasFieldDirection
        ? {
            x: agent.x + gradientDir.x * PARAMS.CHEMICAL_RADIUS_CM * 0.45,
            y: agent.y + gradientDir.y * PARAMS.CHEMICAL_RADIUS_CM * 0.45,
            value: concentration,
          }
        : null,
  };
};

const depositChemicalField = (field, layerName, x, y, amount, radiusPx) => {
  const layer = field[layerName];
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
      const index = getChemicalFieldIndex(field, column, row);
      layer[index] = Math.min(
        PARAMS.CHEMICAL_FIELD_SATURATION,
        layer[index] + amount * falloff,
      );
    }
  }
};

const updateChemicalFieldLayer = (field, layer, dt, options) => {
  const decay = Math.exp(-dt / options.decayS);
  const diffusionAlpha = clamp(
    options.diffusionAlphaS * dt,
    0,
    0.26,
  );
  const flowAlpha = clamp(PARAMS.CHEMICAL_FIELD_FLOW_ALPHA_S * dt, 0, 0.22);
  const flowColumnOffset = PARAMS.PLUME_FLOW_X < 0 ? 1 : -1;
  const flowRowOffset = PARAMS.PLUME_FLOW_Y < 0 ? 1 : -1;

  for (let row = 0; row < field.rows; row += 1) {
    for (let column = 0; column < field.cols; column += 1) {
      const index = getChemicalFieldIndex(field, column, row);
      const center = layer[index] * decay;
      const left =
        layer[getChemicalFieldIndex(field, Math.max(column - 1, 0), row)];
      const right =
        layer[
          getChemicalFieldIndex(field, Math.min(column + 1, field.cols - 1), row)
        ];
      const up =
        layer[getChemicalFieldIndex(field, column, Math.max(row - 1, 0))];
      const down =
        layer[
          getChemicalFieldIndex(field, column, Math.min(row + 1, field.rows - 1))
        ];
      const flowColumn = clamp(column + flowColumnOffset, 0, field.cols - 1);
      const flowRow = clamp(row + flowRowOffset, 0, field.rows - 1);
      const upstream =
        layer[getChemicalFieldIndex(field, flowColumn, row)] * 0.82 +
        layer[getChemicalFieldIndex(field, column, flowRow)] * 0.18;
      const diffused =
        center + diffusionAlpha * (left + right + up + down - center * 4);
      const flowed = diffused + flowAlpha * (upstream - center);
      field.scratch[index] =
        flowed > PARAMS.CHEMICAL_FIELD_NOISE_CUTOFF ? flowed : 0;
    }
  }

  layer.set(field.scratch);
};

const updateChemicalFields = (field, agents, dt, behavior) => {
  agents.forEach((agent) => {
    if (
      agent.isDiseaseRemoved ||
      agent.ontogeneticPhase === PHASES.ALGAL_PHASE
    ) {
      return;
    }

    const isSheltered = Boolean(agent.currentShelterId);
    const emitInterval = isSheltered
      ? agent.shelterChemicalPulseIntervalS ||
        PARAMS.SHELTER_CHEM_PULSE_MAX_S
      : PARAMS.CHEMICAL_TRAIL_EMIT_INTERVAL_S;
    const timerKey = isSheltered ? "shelterChemicalPulseS" : "chemicalTrailEmitS";
    agent[timerKey] = (agent[timerKey] || 0) + dt;
    if (agent[timerKey] < emitInterval) {
      return;
    }

    agent[timerKey] = 0;
    if (isSheltered) {
      agent.shelterChemicalPulseIntervalS = randomBetween(
        PARAMS.SHELTER_CHEM_PULSE_MIN_S,
        PARAMS.SHELTER_CHEM_PULSE_MAX_S,
      );
    }
    const speed = magnitude(agent.vx, agent.vy);
    const isActiveDiseaseSource = doesAgentEmitDiseaseCue(agent);
    if (
      !isSheltered &&
      !isActiveDiseaseSource &&
      speed < behavior.minQueueSpeedCmS * 0.35
    ) {
      return;
    }

    depositChemicalField(
      field,
      isActiveDiseaseSource ? "disease" : "healthy",
      agent.x,
      agent.y,
      isActiveDiseaseSource ? 0.7 : isSheltered ? 0.42 : 0.32,
      isActiveDiseaseSource ? 15 : isSheltered ? 14 : 11,
    );
  });

  updateChemicalFieldLayer(field, field.healthy, dt, {
    decayS: PARAMS.HEALTHY_CHEM_DECAY_S,
    diffusionAlphaS: PARAMS.HEALTHY_CHEM_DIFFUSION_ALPHA_S,
  });
  updateChemicalFieldLayer(field, field.disease, dt, {
    decayS: PARAMS.DISEASE_CHEM_DECAY_S,
    diffusionAlphaS: PARAMS.DISEASE_CHEM_DIFFUSION_ALPHA_S,
  });
};

const mixColor = (dayColor, nightColor, amount) =>
  dayColor.map((channel, index) =>
    Math.round(lerp(channel, nightColor[index], amount)),
  );

const formatRgb = (color) => color.join(", ");

const drawChemicalField = (ctx, field, nightProgress) => {
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  const twilightBoost = Math.sin(Math.PI * clamp(nightProgress, 0, 1));
  const alphaMultiplier = 1 + twilightBoost * 0.18;
  const signalLightProgress = smoothstep(0.15, 0.45, nightProgress);
  const healthySignalColor = mixColor(
    [0, 96, 138],
    [0, 245, 255],
    signalLightProgress,
  );
  const diseaseSignalColor = [138, 0, 62];

  const drawLayer = (layer, color, alphaScale) => {
    for (let row = 0; row < field.rows; row += 1) {
      for (let column = 0; column < field.cols; column += 1) {
        const value = layer[getChemicalFieldIndex(field, column, row)];
        if (value <= PARAMS.CHEMICAL_FIELD_NOISE_CUTOFF) {
          continue;
        }
        const intensity = clamp(
          value / PARAMS.CHEMICAL_FIELD_SATURATION,
          0,
          1,
        );
        const alpha = clamp(
          (0.025 + intensity * alphaScale) * alphaMultiplier,
          0,
          0.7,
        );
        ctx.fillStyle = `rgba(${color}, ${alpha})`;
        ctx.fillRect(
          column * field.cellSizePx,
          row * field.cellSizePx,
          field.cellSizePx,
          field.cellSizePx,
        );
      }
    }
  };

  drawLayer(
    field.healthy,
    formatRgb(healthySignalColor),
    0.42,
  );
  drawLayer(
    field.disease,
    formatRgb(diseaseSignalColor),
    0.45,
  );
  ctx.restore();
};

const drawSpongeShelter = (ctx, shelter) => {
  ctx.save();
  ctx.translate(shelter.x, shelter.y);
  ctx.fillStyle = "rgba(82, 72, 62, 0.32)";
  ctx.beginPath();
  ctx.arc(0, 0, shelter.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const drawCreviceShelter = (ctx, shelter) => {
  ctx.save();
  ctx.translate(shelter.x, shelter.y);
  ctx.rotate(shelter.rotation || 0);
  const radius = shelter.radius;
  ctx.fillStyle = "rgba(55, 61, 60, 0.34)";
  ctx.beginPath();
  ctx.moveTo(-radius * 1.45, -radius * 0.36);
  ctx.lineTo(-radius * 0.48, -radius * 0.64);
  ctx.lineTo(radius * 1.38, -radius * 0.42);
  ctx.lineTo(radius * 1.16, radius * 0.48);
  ctx.lineTo(-radius * 0.82, radius * 0.58);
  ctx.lineTo(-radius * 1.58, radius * 0.18);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(11, 15, 15, 0.36)";
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 1.0, radius * 0.22, -0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const drawAlgaeCover = (ctx, algae) => {
  ctx.save();
  ctx.translate(algae.x, algae.y);
  ctx.rotate(algae.rotation || 0);
  const tufts = 13;
  for (let index = 0; index < tufts; index += 1) {
    const angle = (index / tufts) * Math.PI * 2;
    const distance = algae.radius * (0.12 + (index % 5) * 0.11);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance * 0.58;
    const radius = algae.radius * (0.18 + ((index * 7) % 5) * 0.025);
    ctx.fillStyle =
      index % 3 === 0
        ? "rgba(83, 85, 49, 0.22)"
        : "rgba(47, 91, 69, 0.2)";
    ctx.beginPath();
    ctx.ellipse(x, y, radius * 0.86, radius * 0.42, angle * 0.32, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

const drawShelters = (ctx, shelters) => {
  shelters.forEach((shelter) => {
    if (shelter.type === "crevice") {
      drawCreviceShelter(ctx, shelter);
      return;
    }
    drawSpongeShelter(ctx, shelter);
  });
};

const drawEnvironment = (
  ctx,
  algaeCovers,
  behavior,
  chemicalField,
  nightProgress,
) => {
  ctx.save();
  if (behavior.odorTrails && chemicalField) {
    drawChemicalField(ctx, chemicalField, nightProgress);
  }

  algaeCovers.forEach((algae) => {
    drawAlgaeCover(ctx, algae);
  });
  ctx.restore();
};

export function App({ controls, onGpuErrorChange, isPaused = false }) {
  const canvasRef = React.useRef(null);
  const imageRef = React.useRef(null);
  const rasterCanvasRef = React.useRef(null);
  const frameCanvasesRef = React.useRef(null);
  const animationFrameRef = React.useRef(0);
  const agentsRef = React.useRef([]);
  const frameSizeRef = React.useRef(
    resolveAtlasFrameSize(ATLAS, { width: 64, height: 64 }),
  );
  const lastTimeRef = React.useRef(0);
  const elapsedTimeRef = React.useRef(0);
  const worldRef = React.useRef({ shelters: [], algaeCovers: [] });
  const residualDiseaseSourcesRef = React.useRef([]);
  const chemicalFieldRef = React.useRef(null);
  const diseaseInflowTimerRef = React.useRef(0);
  const behaviorRef = React.useRef(null);
  const isPausedRef = React.useRef(isPaused);
  const wasMigrationNightRef = React.useRef(null);
  const pointerRef = React.useRef({
    active: false,
    x: 0,
    y: 0,
    down: false,
  });

  const sanitizedControls = App.sanitizeControlState(controls);
  const behavior = resolveBehaviorConfig(sanitizedControls);
  behaviorRef.current = behavior;
  isPausedRef.current = isPaused;

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

      imageRef.current = image;
      frameSizeRef.current = frameSize;
      frameCanvasesRef.current = frameCanvases;
      rasterCanvasRef.current = canvas;
      },
    );

    return () => {
      cancelled = true;
      frameCanvasesRef.current = null;
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

    const updatePointer = (event, down = pointerRef.current.down) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      pointerRef.current = {
        active: x >= 0 && x <= rect.width && y >= 0 && y <= rect.height,
        x,
        y,
        down,
      };
    };
    const handlePointerMove = (event) => updatePointer(event);
    const handlePointerDown = (event) => updatePointer(event, true);
    const handlePointerUp = (event) => updatePointer(event, false);
    const handlePointerCancel = () => {
      pointerRef.current = {
        ...pointerRef.current,
        active: false,
        down: false,
      };
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
    window.addEventListener("blur", handlePointerCancel);

    lastTimeRef.current = 0;
    elapsedTimeRef.current = 0;

    const ensureWorld = (width, height, currentBehavior) => {
      worldRef.current = {
        shelters: resolveShelters(width, height),
        algaeCovers: resolveAlgaeCovers(width, height),
      };
      agentsRef.current = createAgents(
        currentBehavior.count,
        width,
        height,
        currentBehavior,
        worldRef.current.shelters,
        worldRef.current.algaeCovers,
      );
      residualDiseaseSourcesRef.current = [];
      chemicalFieldRef.current = createChemicalField(width, height);
      diseaseInflowTimerRef.current = 0;
    };

    const shouldRenderFrame = createPausedFrameGate();
    const render = (timestamp) => {
      if (!shouldRenderFrame(isPausedRef.current, window.innerWidth, window.innerHeight,
        window.devicePixelRatio || 1, behaviorRef.current, rasterCanvasRef.current, frameCanvasesRef.current)) {
        lastTimeRef.current = timestamp * 0.001;
        animationFrameRef.current = window.requestAnimationFrame(render);
        return;
      }
      const currentBehavior = behaviorRef.current;
      const currentIsPaused = isPausedRef.current;
      const now = timestamp * 0.001;
      const dt = lastTimeRef.current
        ? Math.min(now - lastTimeRef.current, 0.05)
        : 0.016;
      lastTimeRef.current = now;

      if (!currentIsPaused) {
        elapsedTimeRef.current += dt;
      }

      const { width, height } = syncCanvasSize(canvas, ctx);
      if (worldRef.current.shelters.length === 0) {
        ensureWorld(width, height, currentBehavior);
      } else if (
        agentsRef.current.filter((agent) => !agent.isRetiring).length !==
        currentBehavior.count
      ) {
        agentsRef.current = reconcileAgents(
          agentsRef.current,
          currentBehavior.count,
          width,
          height,
          currentBehavior,
          worldRef.current.shelters,
          worldRef.current.algaeCovers,
        );
      }

      const image = rasterCanvasRef.current || imageRef.current;
      const frameSize = frameSizeRef.current;
      const globalTimeHour = resolveGlobalTimeHours(
        currentBehavior.startHour,
        elapsedTimeRef.current,
        currentBehavior,
      );
      const isMigrationNight = isNightHour(globalTimeHour, currentBehavior);
      if (wasMigrationNightRef.current === null) {
        if (!currentIsPaused && isMigrationNight) {
          stageNightMigrationQueue(
            agentsRef.current,
            width,
            height,
            currentBehavior,
          );
        }
        wasMigrationNightRef.current = isMigrationNight;
      } else if (
        !currentIsPaused &&
        isMigrationNight &&
        !wasMigrationNightRef.current
      ) {
        stageNightMigrationQueue(
          agentsRef.current,
          width,
          height,
          currentBehavior,
        );
        wasMigrationNightRef.current = true;
      } else {
        wasMigrationNightRef.current = isMigrationNight;
      }
      if (!currentIsPaused) {
        updateNightMigrationDepartures(
          agentsRef.current,
          dt,
          globalTimeHour,
          currentBehavior,
        );
        updateShelterSearchDepartures(
          agentsRef.current,
          dt,
          globalTimeHour,
          currentBehavior,
        );
      }
      const occupancy = getShelterOccupancy(
        agentsRef.current,
        worldRef.current.shelters,
      );
      if (!currentIsPaused) {
        diseaseInflowTimerRef.current += dt;
        if (
          diseaseInflowTimerRef.current >=
            PARAMS.INFECTED_POSTLARVAL_INFLOW_INTERVAL_S &&
          !agentsRef.current.some(
            (agent) => agent.isDiseased && !agent.isDiseaseRemoved,
          )
        ) {
          maybeSeedLatentInfectionAmongExistingAgents(
            agentsRef.current,
            currentBehavior,
          );
          diseaseInflowTimerRef.current = 0;
        }
      }
      const shelterReservations = createShelterReservations(
        worldRef.current.shelters,
      );
      if (!currentIsPaused) {
        residualDiseaseSourcesRef.current = updateResidualDiseaseSources(
          residualDiseaseSourcesRef.current,
          dt,
        );
      }
      const { healthySources, diseaseSources } = buildChemicalSources(
        agentsRef.current,
        worldRef.current.shelters,
        occupancy,
        residualDiseaseSourcesRef.current,
      );
      const nightProgress = resolveLightTransition(globalTimeHour);
      if (
        !chemicalFieldRef.current ||
        chemicalFieldRef.current.width !== width ||
        chemicalFieldRef.current.height !== height
      ) {
        chemicalFieldRef.current = createChemicalField(width, height);
      }
      if (!currentIsPaused && currentBehavior.odorTrails) {
        updateChemicalFields(
          chemicalFieldRef.current,
          agentsRef.current,
          dt,
          currentBehavior,
        );
      } else if (!currentBehavior.odorTrails) {
        chemicalFieldRef.current = createChemicalField(width, height);
      }

      clearTransparentCanvas2d(ctx, width, height);
      drawEnvironment(
        ctx,
        worldRef.current.algaeCovers,
        currentBehavior,
        chemicalFieldRef.current,
        nightProgress,
      );

      const pointerState = pointerRef.current;
      agentsRef.current.forEach((agent) => {
        agent.localThreat = resolveLocalThreat(
          agent,
          pointerState,
          currentBehavior,
        );
        agent.state = determineState(agent, globalTimeHour, currentBehavior);
      });
      buildQueueAssignments(agentsRef.current);
      const spatialGrid = new SpatialHashGrid(width, height);
      spatialGrid.clear();
      agentsRef.current.forEach((agent) => {
        if (!agent.isDiseaseRemoved) {
          spatialGrid.insert(agent);
        }
      });

      agentsRef.current.forEach((agent) => {
        if (!currentIsPaused) {
          updateAgent({
            agent,
            agents: agentsRef.current,
            shelters: worldRef.current.shelters,
            occupancy,
            shelterReservations,
            algaeCovers: worldRef.current.algaeCovers,
            healthySources,
            diseaseSources,
            chemicalField: chemicalFieldRef.current,
            spatialGrid,
            residualDiseaseSources: residualDiseaseSourcesRef.current,
            globalTimeHour,
            behavior: currentBehavior,
            pointerState,
            dt,
            width,
            height,
          });
        }

        if (agent.isDiseaseRemoved) {
          if (!agent.diseaseResidualAdded) {
            const residualSource = createDiseaseResidualSource(
              agent,
              worldRef.current.shelters,
            );
            residualDiseaseSourcesRef.current.push(residualSource);
            if (currentBehavior.odorTrails && chemicalFieldRef.current) {
              depositChemicalField(
                chemicalFieldRef.current,
                "disease",
                residualSource.x,
                residualSource.y,
                0.58,
                18,
              );
            }
            agent.diseaseResidualAdded = true;
          }
          return;
        }

        if (!image) {
          return;
        }

        const sprite = resolveCanvasAtlasSprite(ATLAS, {
          space: agent.spriteSpace || "2d",
          position: { x: agent.x, y: agent.y },
          velocity: { x: agent.vx, y: agent.vy },
          previousScreenPosition: agent.previousScreenPosition,
          maxDt: dt,
          width,
          height,
          state: agent.spriteState,
          profile: agent.spriteProfile || "simulation",
          timestampMs: now * 1000,
          animationOffsetMs: agent.stageOffset,
        });

        const bodyScale =
          (resolveAgentRadius(agent.bodySize) * SPRITE_WIDTH_COMPENSATION) /
          Math.max(Math.max(frameSize.width, frameSize.height) * 0.5, 1);
        const renderRotation = agent.spriteState?.forceTop
          ? agent.heading
          : sprite.rotation;
        const renderFrame = agent.spriteState?.forceTop
          ? ATLAS.stages.lobster_top?.frames?.[0] || sprite.frame
          : sprite.frame;
        agent.previousScreenPosition = sprite.pose.screenPosition;
        const renderAlpha = clamp(agent.renderAlpha ?? 1, 0, 1);
        if (renderAlpha <= 0.01) {
          return;
        }

        ctx.save();
        ctx.globalAlpha = renderAlpha;
        ctx.translate(agent.x, agent.y);
        ctx.rotate(renderRotation);
        ctx.scale(sprite.flipX * bodyScale, bodyScale);
        drawAtlasFrame(ctx, {
          image,
          frameCanvases: frameCanvasesRef.current,
          frame: renderFrame,
          frameSize,
          dx: -frameSize.width * 0.5,
          dy: -frameSize.height * 0.5,
          dWidth: frameSize.width,
          dHeight: frameSize.height,
        });
        ctx.restore();
      });
      drawShelters(ctx, worldRef.current.shelters);

      agentsRef.current = agentsRef.current.filter(
        (agent) =>
          !agent.isDiseaseRemoved &&
          !(agent.isRetiring && isAgentOffscreen(agent, width, height)),
      );

      animationFrameRef.current = window.requestAnimationFrame(render);
    };

    animationFrameRef.current = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
      window.removeEventListener("blur", handlePointerCancel);
    };
  }, []);

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

App.sanitizeControlState = (rawControls = DEFAULT_CONTROL_STATE) => ({
  ...DEFAULT_CONTROL_STATE,
  ...(rawControls ?? {}),
  COUNT: clamp(
    Math.round(Number(rawControls?.COUNT ?? DEFAULT_CONTROL_STATE.COUNT)),
    getControlField("COUNT")?.min,
    getControlField("COUNT")?.max,
  ),
  START_HOUR: clamp(
    Number(rawControls?.START_HOUR ?? DEFAULT_CONTROL_STATE.START_HOUR),
    0,
    23,
  ),
  CIRCADIAN_PHASE: normalizeCircadianPhase(
    rawControls?.CIRCADIAN_PHASE ?? DEFAULT_CONTROL_STATE.CIRCADIAN_PHASE,
  ),
  DISEASE_PRESSURE: clamp(
    Number(
      rawControls?.DISEASE_PRESSURE ?? DEFAULT_CONTROL_STATE.DISEASE_PRESSURE,
    ),
    0,
    100,
  ),
  POSTALGAL_RATIO: clamp(
    Number(
      rawControls?.POSTALGAL_RATIO ?? DEFAULT_CONTROL_STATE.POSTALGAL_RATIO,
    ),
    0,
    100,
  ),
  THREAT_ACTIVE: Boolean(
    rawControls?.THREAT_ACTIVE ?? DEFAULT_CONTROL_STATE.THREAT_ACTIVE,
  ),
  QUEUE_COHESION: clamp(
    Number(rawControls?.QUEUE_COHESION ?? DEFAULT_CONTROL_STATE.QUEUE_COHESION),
    getControlField("QUEUE_COHESION")?.min,
    getControlField("QUEUE_COHESION")?.max,
  ),
  ODOR_TRAILS: Boolean(
    rawControls?.ODOR_TRAILS ?? DEFAULT_CONTROL_STATE.ODOR_TRAILS,
  ),
});

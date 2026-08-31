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

const ATLAS = HOME_SPRITE_ATLASES.spiny_lobster;

const STATES = {
  FORAGING: "FORAGING",
  MIGRATING: "MIGRATING",
  SEEKING_SHELTER: "SEEKING_SHELTER",
  SHELTERING: "SHELTERING",
  DEFENDING: "DEFENDING",
  OFFSHORE_EXIT: "OFFSHORE_EXIT",
};

const PHASES = {
  ALGAL_PHASE: "ALGAL_PHASE",
  TRANSITIONAL: "TRANSITIONAL",
  POSTALGAL: "POSTALGAL",
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
  SHELTER_SEARCH_WINDOW_HOURS: 4,
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
  DEFAULT_THREAT_ACTIVE: false,
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
  QUEUE_REACQUIRE_DISTANCE_CM: 96,
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
  WANDER_TURN_RATE_RAD_S: 0.95,
  WANDER_JITTER_RATE_RAD_S: 0.7,
  WANDER_PULL_WEIGHT: 0.58,
  BOUNDARY_MARGIN_PX: 34,
  BOUNDARY_STEER_WEIGHT: 1.8,
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
  LOCAL_THREAT_RADIUS_PX: 150,
  LOCAL_THREAT_RELEASE_RADIUS_PX: 220,
  LOCAL_THREAT_REJOIN_DELAY_S: 1.15,
  LOCAL_THREAT_MIN_DEFENDERS: 4,
  TAIL_FLIP_DISTANCE_RATIO: 0.44,
  TAIL_FLIP_IMPULSE_CM_S: 42,
  TAIL_FLIP_COOLDOWN_S: 0.72,
  ANTENNA_LENGTH_CM: 14,
  ALGAE_COVER_RADIUS_CM: 80,
  DEBUG_OVERLAY_ALPHA: 0.16,
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
    label: "시간대",
    min: 0,
    max: 23,
    step: 1,
    formatValue: (value) => `${Math.round(value)}시`,
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
    key: "THREAT_ACTIVE",
    label: "포식자 위협 발생",
    type: "toggle",
    formatValue: (value) => (value ? "출현" : "안전"),
  },
  {
    key: "ODOR_TRAILS",
    label: "화학 신호 표시",
    type: "toggle",
    formatValue: (value) => (value ? "표시" : "숨김"),
  },
];

const DEFAULT_CONTROL_STATE = {
  COUNT: PARAMS.DEFAULT_COUNT,
  START_HOUR: PARAMS.DEFAULT_START_HOUR,
  DISEASE_PRESSURE: PARAMS.DEFAULT_DISEASE_PRESSURE,
  POSTALGAL_RATIO: PARAMS.DEFAULT_POSTALGAL_RATIO,
  THREAT_ACTIVE: PARAMS.DEFAULT_THREAT_ACTIVE,
  QUEUE_COHESION: PARAMS.DEFAULT_QUEUE_COHESION,
  ODOR_TRAILS: PARAMS.DEFAULT_ODOR_TRAILS,
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
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
  let nextAngle = angle;
  while (nextAngle <= -Math.PI) {
    nextAngle += Math.PI * 2;
  }
  while (nextAngle > Math.PI) {
    nextAngle -= Math.PI * 2;
  }
  return nextAngle;
};

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
  const nearEdge =
    agent.x < PARAMS.MIGRATION_TARGET_MARGIN_PX ||
    agent.x > width - PARAMS.MIGRATION_TARGET_MARGIN_PX ||
    agent.y < PARAMS.MIGRATION_TARGET_MARGIN_PX ||
    agent.y > height - PARAMS.MIGRATION_TARGET_MARGIN_PX;

  if (distance < PARAMS.MIGRATION_WAYPOINT_REACHED_PX || nearEdge) {
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
    PARAMS.MIN_COUNT,
    PARAMS.MAX_COUNT,
  );
  const startHour = clamp(Number(controls.START_HOUR), 0, 23);
  const diseasePressure =
    clamp(Number(controls.DISEASE_PRESSURE), 0, 100) / 100;
  const postalgalRatio = clamp(Number(controls.POSTALGAL_RATIO), 0, 100) / 100;
  const threatActive = Boolean(controls.THREAT_ACTIVE);
  const queueCohesion = clamp(Number(controls.QUEUE_COHESION), 0, 100) / 100;
  const odorTrails = Boolean(controls.ODOR_TRAILS);
  const migrationUrge = 0.68;

  const distanceScale = PARAMS.QUEUE_DISTANCE_PIXEL_SCALE;
  const speedScale = PARAMS.VISUAL_SPEED_SCALE;

  return {
    count,
    startHour,
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
    Math.random() < behavior.diseasePressure * 0.45;
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
  };
};

const createAgents = (count, width, height, behavior, shelters, algaeCovers) =>
  Array.from({ length: count }, (_, index) =>
    createAgent(index, width, height, behavior, shelters, algaeCovers, {
      queueOrder: index,
      forceMigrating: true,
    }),
  );

const resolveOffshoreExitTarget = (agent, width, height) => {
  const reef = getMainReefAnchor(width, height);
  const fallbackAngle =
    -Math.PI * 0.24 + ((Number(agent.id) || 0) % 7) * 0.18;
  const away = normalize2D(agent.x - reef.x, agent.y - reef.y, {
    x: Math.cos(fallbackAngle),
    y: Math.sin(fallbackAngle),
  });
  const distance = Math.max(width, height) * 0.72;
  return {
    x: reef.x + away.x * distance,
    y: reef.y + away.y * distance,
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

const isPointOutsideCanvas = (point, width, height, margin = 0) =>
  point.x < -margin ||
  point.x > width + margin ||
  point.y < -margin ||
  point.y > height + margin;

const resolveRouteOffscreenDistance = (route, width, height, margin) => {
  const maxDistance = Math.max(width, height) * 2.2;
  for (
    let distance = 0;
    distance <= maxDistance;
    distance += PARAMS.QUEUE_DOCKING_SPAWN_STEP_PX
  ) {
    const point = {
      x: route.start.x - route.direction.x * distance,
      y: route.start.y - route.direction.y * distance,
    };
    if (isPointOutsideCanvas(point, width, height, margin)) {
      return distance;
    }
  }
  return maxDistance;
};

const updateEdgeFade = (agent, width, height) => {
  const edgeDistance = Math.min(
    agent.x,
    width - agent.x,
    agent.y,
    height - agent.y,
  );
  agent.renderAlpha = smoothstep(
    -PARAMS.OFFSHORE_EXIT_REMOVE_MARGIN_PX,
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
  const route = getInitialMigrationRoute(width, height);
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
  agent.heading = Math.atan2(route.direction.y, route.direction.x);
  agent.vx = route.direction.x * behavior.baseSpeedCmS;
  agent.vy = route.direction.y * behavior.baseSpeedCmS;
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
      const aQueueRank = isQueueExitCandidate(a) ? 0 : a.currentShelterId ? 2 : 1;
      const bQueueRank = isQueueExitCandidate(b) ? 0 : b.currentShelterId ? 2 : 1;
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
    forceMigrating: true,
  });
  const route = getInitialMigrationRoute(width, height);
  const lateral = { x: -route.direction.y, y: route.direction.x };
  const spacing =
    behavior.queueTargetDistanceCm || PARAMS.MIGRATION_INITIAL_SPACING_CM;
  const outsideDistance = resolveRouteOffscreenDistance(
    route,
    width,
    height,
    PARAMS.QUEUE_DOCKING_ENTRY_MARGIN_PX,
  );
  const spawnDistance =
    outsideDistance +
    PARAMS.QUEUE_DOCKING_ENTRY_MARGIN_PX * 0.6 +
    groupIndex * spacing * 0.78;
  const lateralOffset =
    Math.sin((id + groupIndex) * 1.731) * PARAMS.QUEUE_TRAIL_WIDTH_CM * 0.16;

  agent.x =
    route.start.x -
    route.direction.x * spawnDistance +
    lateral.x * lateralOffset;
  agent.y =
    route.start.y -
    route.direction.y * spawnDistance +
    lateral.y * lateralOffset;
  agent.heading = Math.atan2(route.direction.y, route.direction.x);
  agent.vx = route.direction.x * behavior.baseSpeedCmS;
  agent.vy = route.direction.y * behavior.baseSpeedCmS;
  agent.state = STATES.MIGRATING;
  agent.isJoiningQueue = true;
  agent.isRetiring = false;
  agent.currentShelterId = null;
  agent.renderAlpha = 0;
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

  if (activeAgents.length > count) {
    const retireCount = activeAgents.length - count;
    selectAgentsForOffshoreExit(activeAgents, width, height, retireCount).forEach(
      (agent) => markAgentForOffshoreExit(agent, width, height),
    );
    return agents;
  }

  if (activeAgents.length === count || managedAgents.length >= count) {
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
    if (activeAgents.length === count || managedAgents.length >= count) {
      return agents;
    }
  }

  const nextAgents = [...agents];
  const nextId =
    agents.reduce(
      (maxId, agent) => Math.max(maxId, Number(agent.id) || 0),
      -1,
    ) + 1;
  const createCount = count - managedAgents.length;
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
    if (agent.isDiseased) {
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

const canEnterShelter = (shelter, occupancy, reservations) => {
  if (!shelter) {
    return false;
  }
  const occupied = occupancy.get(shelter.id);
  if (!occupied || occupied.diseased > 0) {
    return false;
  }
  return getShelterLoad(shelter.id, occupancy, reservations) < shelter.capacity;
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

const getBestShelterFromMemory = (agent, shelters, occupancy, reservations) => {
  for (const shelterId of agent.spatialMemory) {
    const shelter = shelters.find((entry) => entry.id === shelterId);
    if (canEnterShelter(shelter, occupancy, reservations)) {
      return shelter;
    }
  }

  return (
    shelters.find((shelter) =>
      canEnterShelter(shelter, occupancy, reservations),
    ) || null
  );
};

const buildChemicalSources = (agents, shelters, occupancy) => {
  const healthySources = [];
  const diseaseSources = [];

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
    if (!agent.isDiseased) {
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

const applyBoundarySteer = (agent, width, height) => {
  let steerX = 0;
  let steerY = 0;

  if (agent.x < PARAMS.BOUNDARY_MARGIN_PX) {
    steerX += 1 - agent.x / PARAMS.BOUNDARY_MARGIN_PX;
  } else if (agent.x > width - PARAMS.BOUNDARY_MARGIN_PX) {
    steerX -= 1 - (width - agent.x) / PARAMS.BOUNDARY_MARGIN_PX;
  }

  if (agent.y < PARAMS.BOUNDARY_MARGIN_PX) {
    steerY += 1 - agent.y / PARAMS.BOUNDARY_MARGIN_PX;
  } else if (agent.y > height - PARAMS.BOUNDARY_MARGIN_PX) {
    steerY -= 1 - (height - agent.y) / PARAMS.BOUNDARY_MARGIN_PX;
  }

  if (Math.abs(steerX) > 1e-3 || Math.abs(steerY) > 1e-3) {
    const dir = normalize2D(steerX, steerY);
    applyForce(agent, dir.x, dir.y, PARAMS.BOUNDARY_STEER_WEIGHT);
  }
};

const applySoftSeparation = (agent, agents) => {
  if (agent.currentShelterId) {
    return;
  }

  const agentRadius = resolveAgentRadius(agent.bodySize);
  let pushX = 0;
  let pushY = 0;
  let pushCount = 0;

  agents.forEach((other) => {
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

const buildQueueAssignments = (agents, behavior, width, height) => {
  const migrants = agents.filter(
    (agent) =>
      agent.state === STATES.MIGRATING &&
      agent.ontogeneticPhase !== PHASES.ALGAL_PHASE &&
      !agent.isRetiring &&
      !agent.isDiseaseAvoiding &&
      !(agent.threatRecoverS > 0),
  );

  if (migrants.length === 0) {
    return;
  }

  const route = getInitialMigrationRoute(width, height);
  const routeDir = route.direction;
  const routeNormal = { x: -routeDir.y, y: routeDir.x };

  migrants.forEach((agent) => {
    agent.queueLeaderId = null;
    agent.queueFollowerId = null;
    agent.queueGapDistance = Infinity;
    agent.queueLength = 1;
    agent.inQueue = false;
  });

  const ordered = [...migrants].sort((a, b) => {
    const aRouteProgress =
      (a.x - route.start.x) * routeDir.x + (a.y - route.start.y) * routeDir.y;
    const bRouteProgress =
      (b.x - route.start.x) * routeDir.x + (b.y - route.start.y) * routeDir.y;
    const aLaneOffset =
      (a.x - route.start.x) * routeNormal.x +
      (a.y - route.start.y) * routeNormal.y;
    const bLaneOffset =
      (b.x - route.start.x) * routeNormal.x +
      (b.y - route.start.y) * routeNormal.y;
    return (
      (Number(a.queueOrder) || 0) - (Number(b.queueOrder) || 0) ||
      bRouteProgress - aRouteProgress ||
      Math.abs(aLaneOffset) - Math.abs(bLaneOffset) ||
      a.id - b.id
    );
  });

  ordered.forEach((agent, index) => {
    agent.queueOrder = index;
    agent.queueLength = ordered.length;

    if (index === 0) {
      agent.queueLeaderId = null;
      agent.queueGapDistance = Infinity;
      agent.inQueue = false;
      return;
    }

    const leader = ordered[index - 1];
    agent.queueLeaderId = leader.id;
    leader.queueFollowerId = agent.id;
    agent.queueGapDistance = magnitude(leader.x - agent.x, leader.y - agent.y);
    agent.inQueue = true;
  });
};

const resolveGlobalTimeHours = (startHour, elapsedSeconds) => {
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
  if (agent.isJoiningQueue) {
    return STATES.MIGRATING;
  }
  if (agent.isDiseaseAvoiding) {
    return STATES.SEEKING_SHELTER;
  }
  if (isShelterSearchHour(globalTimeHour, behavior)) {
    return STATES.SEEKING_SHELTER;
  }
  if (isNightHour(globalTimeHour, behavior)) {
    if (
      agent.ontogeneticPhase !== PHASES.ALGAL_PHASE &&
      behavior.migrationUrge > 0.5
    ) {
      return STATES.MIGRATING;
    }
    return STATES.FORAGING;
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
  globalTimeHour,
  behavior,
  pointerState,
  dt,
  width,
  height,
}) => {
  agent.ontogeneticPhase = resolveOntogeneticPhase(
    agent.bodySize,
    behavior.socialSizeMm,
    behavior.postalgalAttractionSizeMm,
  );
  const healthyChem = sampleChemicalGradient(agent, healthySources);
  const diseaseChem = sampleChemicalGradient(agent, diseaseSources);
  agent.isDiseaseAvoiding =
    diseaseChem.concentration > behavior.diseaseThreshold;
  agent.threatCooldownS = Math.max(0, (agent.threatCooldownS || 0) - dt);
  agent.threatRecoverS = Math.max(0, (agent.threatRecoverS || 0) - dt);
  const localThreat = resolveLocalThreat(agent, pointerState, behavior);
  agent.localThreat = localThreat;
  agent.state = determineState(agent, globalTimeHour, behavior);
  if (localThreat.active && !agent.isRetiring) {
    agent.state = STATES.DEFENDING;
    agent.threatRecoverS = PARAMS.LOCAL_THREAT_REJOIN_DELAY_S;
    agent.inQueue = false;
    agent.queueLeaderId = null;
    agent.queueFollowerId = null;
    agent.queueLength = 1;
  }
  const previousShelterId = agent.currentShelterId;
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
  } else if (agent.isDiseaseAvoiding && diseaseChem.strongestSource) {
    deprioritizeShelterMemory(agent, diseaseChem.strongestSource.shelterId);
    const memoryShelter = getBestShelterFromMemory(
      agent,
      shelters,
      occupancy,
      shelterReservations,
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
        reserveShelterSlot(memoryShelter.id, shelterReservations);
      }
    } else if (
      agent.bodySize >= behavior.postalgalAttractionSizeMm &&
      healthyChem.concentration > behavior.healthyAttractionThreshold &&
      healthyChem.strongestSource
    ) {
      const relocate = steerTowardPoint(
        agent,
        healthyChem.strongestSource.x,
        healthyChem.strongestSource.y,
        PARAMS.SEEK_SHELTER_SPEED_CM_S,
      );
      applyForce(agent, relocate.x, relocate.y, 0.38);
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
      const memoryShelter = getBestShelterFromMemory(
        agent,
        shelters,
        occupancy,
        shelterReservations,
      );
      const targetShelter =
        memoryShelter ||
        (healthyChem.concentration > behavior.healthyAttractionThreshold &&
        healthyChem.strongestSource
          ? {
              x: healthyChem.strongestSource.x,
              y: healthyChem.strongestSource.y,
              radius: 28,
              id: null,
            }
          : null);
      if (targetShelter) {
        const shelterEntry = targetShelter.id
          ? shelters.find((entry) => entry.id === targetShelter.id)
          : null;
        const targetPosition = shelterEntry
          ? getShelterSlotPosition(agent, shelterEntry)
          : targetShelter;
        const steer = steerTowardPoint(
          agent,
          targetPosition.x,
          targetPosition.y,
          PARAMS.SEEK_SHELTER_SPEED_CM_S,
        );
        applyForce(agent, steer.x, steer.y, 1.15);
        if (
          agent.bodySize >= behavior.postalgalAttractionSizeMm &&
          healthyChem.concentration > behavior.healthyAttractionThreshold
        ) {
          agent.heading = wrapAngle(
            agent.heading + healthyChem.turn * PARAMS.HEALTHY_WANDER_BLEND * dt,
          );
          const bias = angleToVector(agent.heading);
          applyForce(agent, bias.x, bias.y, PARAMS.HEALTHY_ATTRACTION_WEIGHT);
        }
        agent.targetSpeed = PARAMS.SEEK_SHELTER_SPEED_CM_S;
        if (
          shelterEntry &&
          steer.distance < resolveAgentRadius(agent.bodySize) * 0.9
        ) {
          if (canEnterShelter(shelterEntry, occupancy, shelterReservations)) {
            agent.currentShelterId = shelterEntry.id;
            reserveShelterSlot(shelterEntry.id, shelterReservations);
          }
        }
      }
    }
  } else if (agent.state === STATES.MIGRATING) {
    if (agent.queueLeaderId) {
      const leader = agents.find((entry) => entry.id === agent.queueLeaderId);
      if (leader) {
        const leaderDir = normalize2D(
          leader.vx,
          leader.vy,
          angleToVector(leader.heading),
        );
        const tailTarget = {
          x: leader.x - leaderDir.x * behavior.queueTargetDistanceCm,
          y: leader.y - leaderDir.y * behavior.queueTargetDistanceCm,
        };
        const lateralDir = { x: -leaderDir.y, y: leaderDir.x };
        const lateralOffset =
          (agent.x - tailTarget.x) * lateralDir.x +
          (agent.y - tailTarget.y) * lateralDir.y;
        const laneTarget = {
          x:
            tailTarget.x -
            lateralDir.x *
              clamp(
                lateralOffset,
                -PARAMS.QUEUE_TRAIL_WIDTH_CM,
                PARAMS.QUEUE_TRAIL_WIDTH_CM,
              ),
          y:
            tailTarget.y -
            lateralDir.y *
              clamp(
                lateralOffset,
                -PARAMS.QUEUE_TRAIL_WIDTH_CM,
                PARAMS.QUEUE_TRAIL_WIDTH_CM,
              ),
        };
        const physicalTouchDistance =
          resolveAgentRadius(agent.bodySize) +
          resolveAgentRadius(leader.bodySize);
        const brakeThreshold =
          physicalTouchDistance +
          behavior.queueBrakeDistanceCm +
          PARAMS.QUEUE_BRAKE_CLEARANCE_PX;
        if (agent.queueGapDistance < brakeThreshold) {
          const brake = steerTowardPoint(agent, leader.x, leader.y, 0);
          const overlapSeverity = clamp(
            (brakeThreshold - agent.queueGapDistance) /
              Math.max(brakeThreshold, 1),
            0,
            1,
          );
          applyForce(
            agent,
            -brake.x,
            -brake.y,
            PARAMS.MIGRATION_BRAKE_WEIGHT * (1 + overlapSeverity * 1.6),
          );
        } else {
          const alignDesired = {
            x: leaderDir.x * behavior.minQueueSpeedCmS,
            y: leaderDir.y * behavior.minQueueSpeedCmS,
          };
          applyForce(
            agent,
            alignDesired.x - agent.vx,
            alignDesired.y - agent.vy,
            PARAMS.MIGRATION_ALIGN_WEIGHT *
              PARAMS.TACTILE_BOND_STRENGTH *
              behavior.queueCohesionMultiplier,
          );
          const cohesion = steerTowardPoint(
            agent,
            laneTarget.x,
            laneTarget.y,
            behavior.minQueueSpeedCmS,
          );
          applyForce(
            agent,
            cohesion.x,
            cohesion.y,
            PARAMS.MIGRATION_COHESION_WEIGHT *
              PARAMS.TACTILE_BOND_STRENGTH *
              behavior.queueCohesionMultiplier,
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
      agent.wanderAngle = wrapAngle(
        agent.wanderAngle +
          randomBetween(-1, 1) * PARAMS.WANDER_TURN_RATE_RAD_S * 0.35 * dt,
      );
      const wander = angleToVector(agent.wanderAngle);
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
    agent.targetSpeed = agent.queueLeaderId
      ? lerp(behavior.minQueueSpeedCmS, behavior.maxQueueSpeedCmS, queueRatio)
      : lerp(
          behavior.baseSpeedCmS,
          behavior.maxQueueSpeedCmS,
          queueRatio * 0.92,
        );
  } else if (agent.state === STATES.FORAGING) {
    agent.wanderAngle = wrapAngle(
      agent.wanderAngle +
        randomBetween(-1, 1) * PARAMS.WANDER_JITTER_RATE_RAD_S * dt,
    );
    const wander = angleToVector(agent.wanderAngle);
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
        shelters.find((entry) => entry.id === agent.shelterId) || shelters[0];
      const shelterPosition = getShelterSlotPosition(agent, shelter);
      const settle = steerTowardPoint(
        agent,
        shelterPosition.x,
        shelterPosition.y,
        0,
      );
      applyForce(agent, settle.x, settle.y, 1.25);
      if (
        previousShelterId === shelter.id ||
        canEnterShelter(shelter, occupancy, shelterReservations)
      ) {
        agent.currentShelterId = shelter.id;
        if (previousShelterId !== shelter.id) {
          reserveShelterSlot(shelter.id, shelterReservations);
        }
      }
    }
    agent.targetSpeed = 0;
  }

  applySoftSeparation(agent, agents);
  if (!agent.isRetiring) {
    applyBoundarySteer(agent, width, height);
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
  if (agent.isRetiring || agent.isJoiningQueue) {
    agent.x = nextX;
    agent.y = nextY;
  } else {
    agent.x = clamp(nextX, 0, width);
    agent.y = clamp(nextY, 0, height);
  }
  if (magnitude(agent.vx, agent.vy) > 1e-4) {
    agent.heading = Math.atan2(agent.vy, agent.vx);
  }

  if (agent.isRetiring) {
    updateEdgeFade(agent, width, height);
  } else if (agent.isJoiningQueue) {
    updateEdgeFade(agent, width, height);
    if (
      isAgentInsideCanvas(agent, width, height, PARAMS.BOUNDARY_MARGIN_PX) &&
      agent.queueGapDistance < behavior.queueDetectionDistanceCm * 1.35
    ) {
      agent.isJoiningQueue = false;
      agent.renderAlpha = 1;
    }
  } else {
    agent.renderAlpha = 1;
  }

  updateAntennaeAngle(agent, behavior);
};

const drawDownstreamChemicalPlume = (
  ctx,
  source,
  radius,
  startColor,
  midColor,
  endColor,
) => {
  const flow = normalize2D(PARAMS.PLUME_FLOW_X, PARAMS.PLUME_FLOW_Y);
  const angle = Math.atan2(flow.y, flow.x);

  ctx.save();
  ctx.translate(source.x, source.y);
  ctx.rotate(angle);
  ctx.scale(PARAMS.PLUME_LENGTH_SCALE, PARAMS.PLUME_WIDTH_SCALE);

  const gradient = ctx.createRadialGradient(0, 0, 0, radius * 0.2, 0, radius);
  gradient.addColorStop(0, startColor);
  gradient.addColorStop(0.36, midColor);
  gradient.addColorStop(1, endColor);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const drawSpongeShelter = (ctx, shelter, behavior) => {
  ctx.save();
  ctx.translate(shelter.x, shelter.y);
  ctx.rotate(shelter.rotation || 0);
  const alertAlpha = behavior.threatActive ? 0.32 : 0.24;
  ctx.fillStyle = `rgba(82, 72, 62, ${alertAlpha})`;
  ctx.beginPath();
  ctx.ellipse(0, 0, shelter.radius * 1.06, shelter.radius * 1.0, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(20, 24, 25, 0.34)";
  ctx.beginPath();
  ctx.ellipse(
    shelter.radius * 0.08,
    -shelter.radius * 0.05,
    shelter.radius * 0.36,
    shelter.radius * 0.3,
    -0.08,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.strokeStyle = "rgba(242, 222, 174, 0.18)";
  ctx.lineWidth = Math.max(1, shelter.radius * 0.035);
  ctx.beginPath();
  ctx.ellipse(
    shelter.radius * 0.08,
    -shelter.radius * 0.05,
    shelter.radius * 0.4,
    shelter.radius * 0.34,
    -0.08,
    0,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.restore();
};

const drawCreviceShelter = (ctx, shelter, behavior) => {
  ctx.save();
  ctx.translate(shelter.x, shelter.y);
  ctx.rotate(shelter.rotation || 0);
  const radius = shelter.radius;
  ctx.fillStyle = `rgba(55, 61, 60, ${behavior.threatActive ? 0.34 : 0.25})`;
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

const drawEnvironment = (
  ctx,
  shelters,
  algaeCovers,
  behavior,
  healthySources,
  diseaseSources,
) => {
  ctx.save();
  if (behavior.odorTrails) {
    healthySources.forEach((source) => {
      const radius = PARAMS.CHEMICAL_RADIUS_CM * 0.58;
      drawDownstreamChemicalPlume(
        ctx,
        source,
        radius,
        "rgba(96, 176, 138, 0.18)",
        "rgba(96, 176, 138, 0.08)",
        "rgba(96, 176, 138, 0)",
      );
    });

    diseaseSources.forEach((source) => {
      const radius = PARAMS.CHEMICAL_RADIUS_CM * 0.42;
      drawDownstreamChemicalPlume(
        ctx,
        source,
        radius,
        "rgba(204, 108, 88, 0.08)",
        "rgba(204, 108, 88, 0.035)",
        "rgba(204, 108, 88, 0)",
      );
    });
  }

  shelters.forEach((shelter) => {
    if (shelter.type === "crevice") {
      drawCreviceShelter(ctx, shelter, behavior);
      return;
    }
    drawSpongeShelter(ctx, shelter, behavior);
  });

  algaeCovers.forEach((algae) => {
    drawAlgaeCover(ctx, algae);
  });
  ctx.restore();
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
  const elapsedTimeRef = React.useRef(0);
  const worldRef = React.useRef({ shelters: [], algaeCovers: [] });
  const behaviorRef = React.useRef(null);
  const isPausedRef = React.useRef(isPaused);
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
    };

    const render = (timestamp) => {
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
      );
      const occupancy = getShelterOccupancy(
        agentsRef.current,
        worldRef.current.shelters,
      );
      const shelterReservations = createShelterReservations(
        worldRef.current.shelters,
      );
      const { healthySources, diseaseSources } = buildChemicalSources(
        agentsRef.current,
        worldRef.current.shelters,
        occupancy,
      );

      clearTransparentCanvas2d(ctx, width, height);
      drawEnvironment(
        ctx,
        worldRef.current.shelters,
        worldRef.current.algaeCovers,
        currentBehavior,
        healthySources,
        diseaseSources,
      );

      const pointerState = pointerRef.current;
      agentsRef.current.forEach((agent) => {
        agent.localThreat = resolveLocalThreat(
          agent,
          pointerState,
          currentBehavior,
        );
        agent.state = determineState(agent, globalTimeHour, currentBehavior);
        if (agent.localThreat.active) {
          agent.state = STATES.DEFENDING;
        }
      });
      buildQueueAssignments(agentsRef.current, currentBehavior, width, height);

      agentsRef.current.forEach((agent, index) => {
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
            globalTimeHour,
            behavior: currentBehavior,
            pointerState,
            dt,
            width,
            height,
          });
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
          resolveAgentRadius(agent.bodySize) /
          Math.max(Math.max(frameSize.width, frameSize.height) * 0.5, 1);
        const bobOffset =
          Math.sin(now * 2.2 + index * 0.55) * (agent.inQueue ? 1.2 : 2.8);
        const renderRotation = agent.spriteState?.forceTop
          ? agent.heading
          : sprite.rotation;
        agent.previousScreenPosition = sprite.pose.screenPosition;
        const renderAlpha = clamp(agent.renderAlpha ?? 1, 0, 1);
        if (renderAlpha <= 0.01) {
          return;
        }

        ctx.save();
        ctx.globalAlpha = renderAlpha;
        ctx.translate(agent.x, agent.y + bobOffset);
        ctx.rotate(renderRotation);
        ctx.scale(sprite.flipX * bodyScale, bodyScale);
        ctx.drawImage(
          image,
          sprite.frame.x * frameSize.width,
          sprite.frame.y * frameSize.height,
          frameSize.width,
          frameSize.height,
          -frameSize.width * 0.5,
          -frameSize.height * 0.5,
          frameSize.width,
          frameSize.height,
        );
        ctx.restore();
      });

      agentsRef.current = agentsRef.current.filter(
        (agent) => !(agent.isRetiring && isAgentOffscreen(agent, width, height)),
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
    PARAMS.MIN_COUNT,
    PARAMS.MAX_COUNT,
  ),
  START_HOUR: clamp(
    Number(rawControls?.START_HOUR ?? DEFAULT_CONTROL_STATE.START_HOUR),
    0,
    23,
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
    0,
    100,
  ),
  ODOR_TRAILS: Boolean(
    rawControls?.ODOR_TRAILS ?? DEFAULT_CONTROL_STATE.ODOR_TRAILS,
  ),
});

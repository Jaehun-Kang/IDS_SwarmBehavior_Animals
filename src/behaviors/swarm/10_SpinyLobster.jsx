import React from "react";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { resolveAtlasFrameSize } from "../../utils/spriteAtlas";
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
  SHELTER_SEARCH_WINDOW_HOURS: 3,
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
  MIGRATION_ALIGN_WEIGHT: 1.15,
  MIGRATION_COHESION_WEIGHT: 1.25,
  MIGRATION_BRAKE_WEIGHT: 2.4,
  SEEK_SHELTER_SPEED_CM_S: 12,
  DISEASE_ESCAPE_SPEED_CM_S: 32,
  DEFENSE_SPEED_CM_S: 8,
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
  DEFAULT_DISEASE_PRESSURE: 18,
  DEFAULT_POSTALGAL_RATIO: 82,
  DEFAULT_THREAT_ACTIVE: false,
  PIXELS_PER_CM: 1,
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
  HEALTHY_CHEM_STRENGTH: 1.1,
  DISEASE_CHEM_STRENGTH: 2.8,
  WANDER_TURN_RATE_RAD_S: 0.95,
  WANDER_JITTER_RATE_RAD_S: 0.7,
  WANDER_PULL_WEIGHT: 0.58,
  BOUNDARY_MARGIN_PX: 34,
  BOUNDARY_STEER_WEIGHT: 1.8,
  MAX_STEER_CM_S2: 45,
  VELOCITY_DAMPING: 0.985,
  THREAT_ROSETTE_RADIUS_CM: 42,
  THREAT_CENTER_PULL: 1.35,
  THREAT_TANGENTIAL_WEIGHT: 0.18,
  ANTENNA_LENGTH_CM: 14,
  ALGAE_COVER_RADIUS_CM: 80,
  DEBUG_OVERLAY_ALPHA: 0.16,
  ...DIRECT_FINDING_PARAMS,
  ...INFERRED_PARAMS,
};

const CONTROL_FIELDS = [
  {
    key: "COUNT",
    label: "개체 밀도",
    min: 12,
    max: 72,
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
    key: "DISEASE_PRESSURE",
    label: "PaV1 바이러스 감염률",
    min: 0,
    max: 100,
    step: 1,
    formatValue: (value) => `${Math.round(value)} %`,
  },
  {
    key: "POSTALGAL_RATIO",
    label: "성체(군집형) 비율",
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
];

const DEFAULT_CONTROL_STATE = {
  COUNT: PARAMS.DEFAULT_COUNT,
  START_HOUR: PARAMS.DEFAULT_START_HOUR,
  DISEASE_PRESSURE: PARAMS.DEFAULT_DISEASE_PRESSURE,
  POSTALGAL_RATIO: PARAMS.DEFAULT_POSTALGAL_RATIO,
  THREAT_ACTIVE: PARAMS.DEFAULT_THREAT_ACTIVE,
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (start, end, amount) => start + (end - start) * amount;
const inverseLerp = (value, start, end) => {
  if (Math.abs(end - start) < 1e-6) {
    return 0;
  }
  return clamp((value - start) / (end - start), 0, 1);
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
  const count = clamp(Math.round(Number(controls.COUNT)), 12, 72);
  const startHour = clamp(Number(controls.START_HOUR), 0, 23);
  const diseasePressure =
    clamp(Number(controls.DISEASE_PRESSURE), 0, 100) / 100;
  const postalgalRatio = clamp(Number(controls.POSTALGAL_RATIO), 0, 100) / 100;
  const threatActive = Boolean(controls.THREAT_ACTIVE);
  const migrationUrge = 0.68;

  return {
    count,
    startHour,
    migrationUrge,
    queueTargetDistanceCm: PARAMS.QUEUE_TARGET_DISTANCE_CM,
    queueBrakeDistanceCm: PARAMS.QUEUE_BRAKE_DISTANCE_CM,
    queueDetectionDistanceCm: PARAMS.QUEUE_DETECTION_DISTANCE_CM,
    baseSpeedCmS: PARAMS.BASE_SPEED_CM_S,
    minQueueSpeedCmS: PARAMS.MIN_QUEUE_SPEED_CM_S,
    maxQueueSpeedCmS: PARAMS.MAX_QUEUE_SPEED_CM_S,
    socialSizeMm: PARAMS.BODY_SIZE_SOCIAL_MM,
    postalgalAttractionSizeMm: PARAMS.BODY_SIZE_POSTALGAL_MM,
    foragingRadiusCm: PARAMS.FORAGING_RADIUS_CM,
    shelterSearchWindowHours: PARAMS.SHELTER_SEARCH_WINDOW_HOURS,
    diseaseRepulsionWeight: PARAMS.DISEASE_REPULSION_WEIGHT,
    diseasePressure,
    postalgalRatio,
    threatActive,
    healthyAttractionThreshold: PARAMS.HEALTHY_CHEM_THRESHOLD,
    diseaseThreshold: PARAMS.DISEASE_CHEM_THRESHOLD,
    sunriseHour: PARAMS.SUNRISE_HOUR,
    sunsetHour: PARAMS.SUNSET_HOUR,
    shelterSearchStartHour:
      PARAMS.SUNRISE_HOUR - PARAMS.SHELTER_SEARCH_WINDOW_HOURS,
  };
};

const resolveShelters = (width, height) => {
  const centers = [
    { x: width * 0.26, y: height * 0.72 },
    { x: width * 0.52, y: height * 0.64 },
    { x: width * 0.76, y: height * 0.7 },
  ];

  return centers.map((center, index) => ({
    id: `shelter-${index}`,
    x: center.x,
    y: center.y,
    radius: index === 1 ? 46 : 34 + index * 5,
    capacity:
      index === 1
        ? PARAMS.LARGE_SHELTER_CAPACITY
        : clamp(
            PARAMS.SHELTER_CAPACITY_MIN + index * 2,
            PARAMS.SHELTER_CAPACITY_MIN,
            PARAMS.SHELTER_CAPACITY_MAX,
          ),
  }));
};

const resolveAlgaeCovers = (width, height) => [
  { x: width * 0.16, y: height * 0.3, radius: PARAMS.ALGAE_COVER_RADIUS_CM },
  { x: width * 0.84, y: height * 0.24, radius: PARAMS.ALGAE_COVER_RADIUS_CM },
];

const isNightHour = (hour, behavior) =>
  hour >= behavior.sunsetHour || hour < behavior.shelterSearchStartHour;

const isShelterSearchHour = (hour, behavior) =>
  hour >= behavior.shelterSearchStartHour && hour < behavior.sunriseHour;

const createAgent = (index, width, height, behavior, shelters, algaeCovers) => {
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
  const algaeCover = algaeCovers[index % algaeCovers.length];
  const isDiseased =
    phase !== PHASES.ALGAL_PHASE &&
    Math.random() < behavior.diseasePressure * 0.45;
  const spawnAnchor = phase === PHASES.ALGAL_PHASE ? algaeCover : homeShelter;
  const heading = randomBetween(-Math.PI, Math.PI);
  const dir = angleToVector(heading);
  const startHour = behavior.startHour;
  const startState = isShelterSearchHour(startHour, behavior)
    ? STATES.SEEKING_SHELTER
    : isNightHour(startHour, behavior) &&
        phase !== PHASES.ALGAL_PHASE &&
        behavior.migrationUrge > 0.5
      ? STATES.MIGRATING
      : isNightHour(startHour, behavior)
        ? STATES.FORAGING
        : STATES.SHELTERING;
  const baseSpeed =
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

  return {
    id: index,
    x: clamp(spawnAnchor.x + Math.cos(heading) * startDistance, 0, width),
    y: clamp(spawnAnchor.y + Math.sin(heading) * startDistance, 0, height),
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
    queueGapDistance: Infinity,
    queueLength: 1,
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
    isDiseaseAvoiding: false,
  };
};

const createAgents = (count, width, height, behavior, shelters, algaeCovers) =>
  Array.from({ length: count }, (_, index) =>
    createAgent(index, width, height, behavior, shelters, algaeCovers),
  );

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
    const count = occupancy.get(shelter.id);
    if (!count) {
      return;
    }

    if (count.healthy > 0) {
      healthySources.push({
        x: shelter.x,
        y: shelter.y,
        shelterId: shelter.id,
        strength: PARAMS.HEALTHY_CHEM_STRENGTH * (1 + count.healthy * 0.18),
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
  const radiusSq = PARAMS.CHEMICAL_RADIUS_CM * PARAMS.CHEMICAL_RADIUS_CM;
  let concentration = 0;
  let strongest = null;

  sources.forEach((source) => {
    const dx = point.x - source.x;
    const dy = point.y - source.y;
    const distanceSq = dx * dx + dy * dy;
    if (distanceSq > radiusSq * 4) {
      return;
    }

    const distance = Math.sqrt(distanceSq) || 1;
    const plumeFactor = lerp(
      0.42,
      1.18,
      clamp((dx / distance + 1) * 0.5, 0, 1),
    );
    const value = (source.strength * plumeFactor) / (1 + distanceSq / radiusSq);
    concentration += value;

    if (!strongest || value > strongest.value) {
      strongest = { x: source.x, y: source.y, value };
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

const buildQueueAssignments = (agents, behavior) => {
  const migrants = agents.filter(
    (agent) =>
      agent.state === STATES.MIGRATING &&
      agent.ontogeneticPhase !== PHASES.ALGAL_PHASE &&
      !agent.isDiseaseAvoiding,
  );
  const byId = new Map(migrants.map((agent) => [agent.id, agent]));

  migrants.forEach((agent) => {
    let bestLeader = null;
    let bestDistance = Infinity;
    const heading = normalize2D(
      agent.vx,
      agent.vy,
      angleToVector(agent.heading),
    );

    migrants.forEach((candidate) => {
      if (candidate.id === agent.id) {
        return;
      }

      const dx = candidate.x - agent.x;
      const dy = candidate.y - agent.y;
      const distance = magnitude(dx, dy);
      if (distance > behavior.queueDetectionDistanceCm || distance < 1e-4) {
        return;
      }

      const ahead = (dx * heading.x + dy * heading.y) / distance;
      if (ahead < 0.35) {
        return;
      }

      const candidateHeading = normalize2D(
        candidate.vx,
        candidate.vy,
        angleToVector(candidate.heading),
      );
      const headingAgreement =
        heading.x * candidateHeading.x + heading.y * candidateHeading.y;
      if (headingAgreement < 0.35) {
        return;
      }

      if (distance < bestDistance) {
        bestDistance = distance;
        bestLeader = candidate.id;
      }
    });

    agent.queueLeaderId = bestLeader;
    agent.queueGapDistance = bestDistance;
    agent.inQueue = Boolean(bestLeader);
    agent.queueLength = 1;
  });

  const children = new Map();
  migrants.forEach((agent) => {
    if (!agent.queueLeaderId) {
      return;
    }
    const list = children.get(agent.queueLeaderId) || [];
    list.push(agent.id);
    children.set(agent.queueLeaderId, list);
  });

  const collectQueueComponent = (agentId, componentIds) => {
    const agent = byId.get(agentId);
    if (!agent) {
      return;
    }
    componentIds.push(agentId);
    const childIds = children.get(agentId) || [];
    childIds.forEach((childId) => {
      collectQueueComponent(childId, componentIds);
    });
  };

  migrants
    .filter((agent) => !agent.queueLeaderId)
    .forEach((leader) => {
      const componentIds = [];
      collectQueueComponent(leader.id, componentIds);
      const queueSize = componentIds.length;
      componentIds.forEach((agentId) => {
        const queueAgent = byId.get(agentId);
        if (queueAgent) {
          queueAgent.queueLength = queueSize;
        }
      });
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
  if (agent.isDiseaseAvoiding) {
    return STATES.SEEKING_SHELTER;
  }
  if (behavior.threatActive && agent.ontogeneticPhase !== PHASES.ALGAL_PHASE) {
    return STATES.DEFENDING;
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
  agent.state = determineState(agent, globalTimeHour, behavior);
  agent.currentShelterId = null;
  agent.ax = 0;
  agent.ay = 0;

  if (agent.isDiseaseAvoiding && diseaseChem.strongestSource) {
    deprioritizeShelterMemory(agent, diseaseChem.strongestSource.shelterId);
    const memoryShelter = getBestShelterFromMemory(
      agent,
      shelters,
      occupancy,
      shelterReservations,
    );
    const repel = steerTowardPoint(
      agent,
      diseaseChem.strongestSource.x,
      diseaseChem.strongestSource.y,
      PARAMS.DISEASE_ESCAPE_SPEED_CM_S,
    );
    applyForce(agent, -repel.x, -repel.y, behavior.diseaseRepulsionWeight);

    if (memoryShelter) {
      const relocate = steerTowardPoint(
        agent,
        memoryShelter.x,
        memoryShelter.y,
        PARAMS.SEEK_SHELTER_SPEED_CM_S,
      );
      applyForce(agent, relocate.x, relocate.y, 0.72);
      if (relocate.distance < memoryShelter.radius * 0.7) {
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
    const defenderCount = agents.filter(
      (entry) => entry.ontogeneticPhase === PHASES.POSTALGAL,
    ).length;
    const rosetteRadius = lerp(
      PARAMS.THREAT_ROSETTE_RADIUS_CM * 0.72,
      PARAMS.THREAT_ROSETTE_RADIUS_CM * 1.38,
      inverseLerp(defenderCount, 3, 24),
    );
    const center = shelters.reduce(
      (accumulator, shelter) => ({
        x: accumulator.x + shelter.x / shelters.length,
        y: accumulator.y + shelter.y / shelters.length,
      }),
      { x: 0, y: 0 },
    );
    const angle =
      (agent.id / Math.max(agents.length, 1)) * Math.PI * 2 +
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
      PARAMS.THREAT_CENTER_PULL,
    );
    const tangent = normalize2D(-(agent.y - center.y), agent.x - center.x, {
      x: 0,
      y: -1,
    });
    applyForce(agent, tangent.x, tangent.y, PARAMS.THREAT_TANGENTIAL_WEIGHT);
    agent.targetSpeed = PARAMS.DEFENSE_SPEED_CM_S;
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
        const steer = steerTowardPoint(
          agent,
          targetShelter.x,
          targetShelter.y,
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
        if (targetShelter.id && steer.distance < targetShelter.radius * 0.7) {
          const shelter = shelters.find(
            (entry) => entry.id === targetShelter.id,
          );
          if (canEnterShelter(shelter, occupancy, shelterReservations)) {
            agent.currentShelterId = targetShelter.id;
            reserveShelterSlot(targetShelter.id, shelterReservations);
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
        if (agent.queueGapDistance < behavior.queueBrakeDistanceCm) {
          const brake = steerTowardPoint(agent, leader.x, leader.y, 0);
          applyForce(agent, -brake.x, -brake.y, PARAMS.MIGRATION_BRAKE_WEIGHT);
        } else {
          const alignDesired = {
            x: leaderDir.x * behavior.minQueueSpeedCmS,
            y: leaderDir.y * behavior.minQueueSpeedCmS,
          };
          applyForce(
            agent,
            alignDesired.x - agent.vx,
            alignDesired.y - agent.vy,
            PARAMS.MIGRATION_ALIGN_WEIGHT,
          );
          const cohesion = steerTowardPoint(
            agent,
            tailTarget.x,
            tailTarget.y,
            behavior.minQueueSpeedCmS,
          );
          applyForce(
            agent,
            cohesion.x,
            cohesion.y,
            PARAMS.MIGRATION_COHESION_WEIGHT,
          );
        }
        agent.inQueue = true;
      }
    }

    if (!agent.queueLeaderId) {
      agent.wanderAngle = wrapAngle(
        agent.wanderAngle +
          randomBetween(-1, 1) * PARAMS.WANDER_TURN_RATE_RAD_S * dt,
      );
      const wander = angleToVector(agent.wanderAngle);
      applyForce(agent, wander.x, wander.y, PARAMS.WANDER_PULL_WEIGHT);
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
      const settle = steerTowardPoint(agent, shelter.x, shelter.y, 0);
      applyForce(agent, settle.x, settle.y, 1.25);
      if (canEnterShelter(shelter, occupancy, shelterReservations)) {
        agent.currentShelterId = shelter.id;
        reserveShelterSlot(shelter.id, shelterReservations);
      }
    }
    agent.targetSpeed = 0;
  }

  applyBoundarySteer(agent, width, height);

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

  agent.x = clamp(agent.x + agent.vx * dt, 0, width);
  agent.y = clamp(agent.y + agent.vy * dt, 0, height);
  if (magnitude(agent.vx, agent.vy) > 1e-4) {
    agent.heading = Math.atan2(agent.vy, agent.vx);
  }

  updateAntennaeAngle(agent, behavior);
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
  healthySources.forEach((source) => {
    const radius = PARAMS.CHEMICAL_RADIUS_CM * 0.58;
    const gradient = ctx.createRadialGradient(
      source.x,
      source.y,
      0,
      source.x,
      source.y,
      radius,
    );
    gradient.addColorStop(0, "rgba(96, 176, 138, 0.18)");
    gradient.addColorStop(1, "rgba(96, 176, 138, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(source.x, source.y, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  diseaseSources.forEach((source) => {
    const radius = PARAMS.CHEMICAL_RADIUS_CM * 0.42;
    const gradient = ctx.createRadialGradient(
      source.x,
      source.y,
      0,
      source.x,
      source.y,
      radius,
    );
    gradient.addColorStop(0, "rgba(204, 108, 88, 0.16)");
    gradient.addColorStop(1, "rgba(204, 108, 88, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(source.x, source.y, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  shelters.forEach((shelter) => {
    ctx.fillStyle = `rgba(72, 88, 86, ${behavior.threatActive ? 0.26 : 0.18})`;
    ctx.beginPath();
    ctx.ellipse(
      shelter.x,
      shelter.y,
      shelter.radius * 1.18,
      shelter.radius * 0.72,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  });

  algaeCovers.forEach((algae) => {
    ctx.fillStyle = `rgba(66, 124, 96, ${PARAMS.DEBUG_OVERLAY_ALPHA})`;
    ctx.beginPath();
    ctx.ellipse(
      algae.x,
      algae.y,
      algae.radius,
      algae.radius * 0.52,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
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

  const sanitizedControls = App.sanitizeControlState(controls);
  const behavior = resolveBehaviorConfig(sanitizedControls);

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

    lastTimeRef.current = 0;
    elapsedTimeRef.current = 0;

    const ensureWorld = (width, height) => {
      worldRef.current = {
        shelters: resolveShelters(width, height),
        algaeCovers: resolveAlgaeCovers(width, height),
      };
      agentsRef.current = createAgents(
        behavior.count,
        width,
        height,
        behavior,
        worldRef.current.shelters,
        worldRef.current.algaeCovers,
      );
    };

    const render = (timestamp) => {
      const now = timestamp * 0.001;
      const dt = lastTimeRef.current
        ? Math.min(now - lastTimeRef.current, 0.05)
        : 0.016;
      lastTimeRef.current = now;

      if (!isPaused) {
        elapsedTimeRef.current += dt;
      }

      const { width, height } = syncCanvasSize(canvas, ctx);
      if (
        agentsRef.current.length !== behavior.count ||
        worldRef.current.shelters.length === 0
      ) {
        ensureWorld(width, height);
      }

      const image = rasterCanvasRef.current || imageRef.current;
      const frameSize = frameSizeRef.current;
      const globalTimeHour = resolveGlobalTimeHours(
        behavior.startHour,
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
        behavior,
        healthySources,
        diseaseSources,
      );

      agentsRef.current.forEach((agent) => {
        agent.state = determineState(agent, globalTimeHour, behavior);
      });
      buildQueueAssignments(agentsRef.current, behavior);

      agentsRef.current.forEach((agent, index) => {
        if (!isPaused) {
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
            behavior,
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

        ctx.save();
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

      animationFrameRef.current = window.requestAnimationFrame(render);
    };

    animationFrameRef.current = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
    };
  }, [behavior, isPaused]);

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
    12,
    72,
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
});

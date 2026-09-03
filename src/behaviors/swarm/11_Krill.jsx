import React from "react";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import {
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

// 기본 상태
const ATLAS = HOME_SPRITE_ATLASES.krill;

const DIRECT_FINDING_PARAMS = {
  OPTIMAL_SPEED_PX_S: 36,
  MAX_SPEED_PX_S: 120,
  MIN_SEPARATION_PX: 42,
  PERCEPTION_RADIUS_PX: 150,
  HIGH_FOOD_SPEED_PX_S: 12,
  LOW_FOOD_SPEED_PX_S: 36,
  HIGH_FOOD_TURN_RATE_RAD_S: Math.PI,
  LOW_FOOD_TURN_RATE_RAD_S: Math.PI * (75 / 180),
  DAY_DEPTH_RATIO: 0.18,
  NIGHT_DEPTH_RATIO: 0.74,
  CREPUSCULAR_COHESION_MULTIPLIER: 3,
};

const INFERRED_PARAMS = {
  TOPOLOGICAL_NEIGHBOR_COUNT: 6,
  SINKING_SPEED_PX_S: 22,
  PARACHUTE_EXIT_FULLNESS: 0.18,
  PARACHUTE_ENTRY_FULLNESS: 0.42,
  PARACHUTE_ACTIVE_RATIO: 0.65,
  PARACHUTE_DURATION_S: 4.8,
  PARACHUTE_COOLDOWN_MIN_S: 1.6,
  PARACHUTE_COOLDOWN_MAX_S: 5.5,
  PARACHUTE_DROP_MIN_PX: 54,
  PARACHUTE_DROP_MAX_PX: 140,
  PARACHUTE_BOTTOM_RATIO: 0.88,
  STOMACH_DIGESTION_PER_S: 0.045,
  STOMACH_FEED_RATE_PER_S: 0.46,
  PARACHUTE_DIGESTION_MULTIPLIER: 3.6,
  PARACHUTE_FEED_MULTIPLIER: 0.08,
  FOOD_PATCH_CONSUMPTION_PER_FULLNESS: 0.025,
  FEEDING_FOOD_THRESHOLD: 0.35,
  DVM_STEER_WEIGHT: 0.72,
  DVM_MAX_STEER_PX_S: 72,
  SEPARATION_WEIGHT: 2.8,
  ALIGNMENT_WEIGHT: 1.1,
  COHESION_WEIGHT: 1.45,
  NIGHT_COHESION_MULTIPLIER: 0.82,
  CREPUSCULAR_SEPARATION_MULTIPLIER: 0.72,
  BOUNDARY_RETURN_WEIGHT: 0.9,
  SWARM_CENTER_PULL_WEIGHT: 0.34,
  SWARM_COMFORT_RADIUS_RATIO: 0.16,
  FLOW_FIELD_WEIGHT: 0.38,
  FLOW_FIELD_SCALE_X: 0.006,
  FLOW_FIELD_SCALE_Y: 0.008,
  DAY_BAND_SPREAD_WEIGHT: 1.45,
  NIGHT_CLUSTER_COUNT: 7,
  NIGHT_CLUSTER_PULL_WEIGHT: 0.52,
  NIGHT_CLUSTER_SPREAD_PX: 170,
  PREDATOR_DETECTION_RADIUS_PX: 260,
  PREDATOR_IMPACT_RADIUS_PX: 150,
  PREDATOR_ESCAPE_FORCE: 5.5,
  PREDATOR_TANGENTIAL_FORCE: 1.15,
  PREDATOR_REJOIN_COHESION_MULTIPLIER: 1.55,
  PREDATOR_SPEED_MULTIPLIER: 1.55,
  OFFSCREEN_ALLOWANCE_PX: 120,
  SCREEN_REENTRY_START_RATIO: 0.95,
  SCREEN_REENTRY_FORCE: 1.85,
  SCREEN_REENTRY_TANGENTIAL_FORCE: 0.08,
  SCREEN_REENTRY_FORCE_FILTER: 0.45,
  SCREEN_REENTRY_COHESION_MULTIPLIER: 0.65,
  SCREEN_REENTRY_TURN_RATE_RAD_S: Math.PI * 0.75,
  SCREEN_OUTSIDE_TURN_RATE_RAD_S: Math.PI * 1.5,
  SWIM_RESPONSE_PER_S: 2.8,
  JITTER_BLEND_PER_S: 2.2,
  FOOD_PATCH_DRIFT_PX_S: 6,
  FOOD_PATCH_RADIUS_PX: 110,
  FOOD_BACKGROUND_WEIGHT: 0.08,
  MARINE_SNOW_PARTICLE_COUNT: 150,
  MARINE_SNOW_SINK_PX_S: 18,
  MARINE_SNOW_ALPHA: 0.12,
  BIOLUM_BASE_ALPHA: 0.042,
  BIOLUM_PREDATOR_ALPHA: 0.34,
  BIOLUM_SIDE_OFFSET_X_RATIO: 27.5 / 145,
  BIOLUM_SIDE_OFFSET_Y_RATIO: -23 / 75,
  BIOLUM_FRONT_OFFSET_X_RATIO: 2.5 / 145,
  BIOLUM_FRONT_OFFSET_Y_RATIO: -21.5 / 75,
  BIOLUM_RADIUS_RATIO: 0.22,
  BIOLUM_PANIC_RADIUS_RATIO: 0.34,
  BIOLUM_DECAY_PER_S: 1.1,
  BIOLUM_TRIGGER_RADIUS_PX: 190,
  BIOLUM_FLASH_THRESHOLD: 0.55,
  BIOLUM_FEEDING_ATTRACTION_WEIGHT: 3,
  BIOLUM_PANIC_CASCADE_FORCE: 5.5,
  LIGHT_PERCEPTION_RADIUS_PX: 150,
  PANIC_LATCH_DURATION_S: 1.15,
  FEEDING_LATCH_DURATION_S: 2.6,
  REJOIN_DURATION_S: 3,
  SWIM_TURN_RATE_RAD_S: 6,
  FEEDING_TURN_RATE_RAD_S: 18,
  CONDENSED_TURN_RATE_RAD_S: Math.PI * 1.5,
  PANIC_TURN_RATE_RAD_S: 24,
  REJOIN_TURN_RATE_RAD_S: 12,
};

const PARAMS = {
  DEFAULT_COUNT: 480,
  DEFAULT_LIGHT_PHASE: "night",
  DEFAULT_FOOD_ABUNDANCE: 58,
  DEFAULT_DENSITY_SURGE: 100,
  DEFAULT_NIGHT_COHESION: 82,
  MIN_COUNT: 180,
  MAX_COUNT: 900,
  BODY_LENGTH_MIN_PX: 9,
  BODY_LENGTH_MAX_PX: 18,
  BODY_RENDER_SCALE: 2.1,
  WORLD_MARGIN_PX: 28,
  FOOD_PATCH_COUNT: 4,
  FOOD_PATCH_WOBBLE_SCALE: 0.35,
  RENDER_FOOD_ALPHA: 0.075,
  RENDER_FOOD_COLOR: "99, 185, 124",
  LIGHT_PHASE_TRANSITION_DURATION_S: 7,
  TRANSITION_DEPTH_RATIO: 0.45,
  TIME_STEP_MAX: 0.05,
  ...DIRECT_FINDING_PARAMS,
  ...INFERRED_PARAMS,
};

const CONTROL_FIELDS = [
  {
    key: "INTERACTION_MODE",
    label: "마우스 상호작용",
    type: "binary-toggle",
    onValue: "food",
    offValue: "predator",
    formatValue: (value) => (value === "food" ? "먹이 놓기" : "포식자"),
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
    key: "FOOD_ABUNDANCE",
    label: "플랑크톤 농도",
    min: 0,
    max: 100,
    step: 1,
    formatValue: (value) => `${Math.round(value)} %`,
  },
  {
    key: "DENSITY_SURGE",
    label: "박명기 응집 증폭",
    min: 50,
    max: 180,
    step: 1,
    formatValue: (value) => `${Math.round(value)} %`,
  },
  {
    key: "NIGHT_COHESION",
    label: "야간 응집 유지율",
    min: 40,
    max: 120,
    step: 1,
    formatValue: (value) => `${Math.round(value)} %`,
  },
  {
    key: "LIGHT_PHASE",
    label: "시간대",
    type: "cycle-toggle",
    values: ["day", "sunset", "night", "sunrise"],
    visualCount: 3,
    visualPositions: [0, 1, 2, 1],
    cycleMode: "loop",
    formatValue: (value) =>
      value === "night"
        ? "밤"
        : value === "sunset"
          ? "일몰"
          : value === "sunrise"
            ? "일출"
            : "낮",
  },
];

const DEFAULT_CONTROL_STATE = {
  INTERACTION_MODE: "predator",
  COUNT: PARAMS.DEFAULT_COUNT,
  LIGHT_PHASE: PARAMS.DEFAULT_LIGHT_PHASE,
  FOOD_ABUNDANCE: PARAMS.DEFAULT_FOOD_ABUNDANCE,
  DENSITY_SURGE: PARAMS.DEFAULT_DENSITY_SURGE,
  NIGHT_COHESION: PARAMS.DEFAULT_NIGHT_COHESION,
};

// 공통 계산
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const getControlField = (key) =>
  CONTROL_FIELDS.find((field) => field.key === key);
const normalizeLightPhase = (value, fallbackHour = 12) => {
  if (value === "dusk") {
    return "sunset";
  }
  if (["day", "sunset", "night", "sunrise"].includes(value)) {
    return value;
  }

  const hour = numberOrDefault(fallbackHour, 12);
  if (hour < 5) {
    return "night";
  }
  if (hour < 7) {
    return "sunrise";
  }
  if (hour >= 19) {
    return "sunset";
  }
  return "day";
};
const lerp = (start, end, amount) => start + (end - start) * amount;
const inverseLerp = (value, start, end) => {
  if (Math.abs(end - start) < 1e-6) {
    return 0;
  }
  return clamp((value - start) / (end - start), 0, 1);
};
const smoothstep = (value) => {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};
const randomBetween = (min, max) => min + Math.random() * (max - min);
const magnitude = (x, y) => Math.hypot(x, y);
const randomParachuteCooldown = () =>
  randomBetween(
    PARAMS.PARACHUTE_COOLDOWN_MIN_S,
    PARAMS.PARACHUTE_COOLDOWN_MAX_S,
  );
const numberOrDefault = (value, fallback) => {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : fallback;
};

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
  let next = angle;
  while (next > Math.PI) {
    next -= Math.PI * 2;
  }
  while (next < -Math.PI) {
    next += Math.PI * 2;
  }
  return next;
};

const rotateToward = (current, target, maxDelta) => {
  const delta = wrapAngle(target - current);
  if (Math.abs(delta) <= maxDelta) {
    return target;
  }
  return current + Math.sign(delta) * maxDelta;
};

const angleToVector = (angle) => ({ x: Math.cos(angle), y: Math.sin(angle) });

const exponentialBlend = (ratePerSecond, dt) =>
  1 - Math.exp(-ratePerSecond * dt);
const getLightLevelKey = (lightStrength) => {
  if (lightStrength <= 0.14) {
    return "night";
  }
  if (lightStrength < 0.7) {
    return "twilight";
  }
  return "day";
};
const getSpriteBrightnessForLightKey = (lightKey) =>
  lightKey === "night" ? 0.42 : lightKey === "twilight" ? 0.66 : 1;

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

const resolveBehaviorConfig = (controls = DEFAULT_CONTROL_STATE) => ({
  interactionMode: controls.INTERACTION_MODE === "food" ? "food" : "predator",
  count: clamp(
    Math.round(numberOrDefault(controls.COUNT, PARAMS.DEFAULT_COUNT)),
    getControlField("COUNT")?.min,
    getControlField("COUNT")?.max,
  ),
  lightPhase: normalizeLightPhase(controls.LIGHT_PHASE),
  foodAbundance:
    clamp(
      numberOrDefault(controls.FOOD_ABUNDANCE, PARAMS.DEFAULT_FOOD_ABUNDANCE),
      getControlField("FOOD_ABUNDANCE")?.min,
      getControlField("FOOD_ABUNDANCE")?.max,
    ) / 100,
  densitySurgeMultiplier:
    (PARAMS.CREPUSCULAR_COHESION_MULTIPLIER *
      clamp(
        numberOrDefault(controls.DENSITY_SURGE, PARAMS.DEFAULT_DENSITY_SURGE),
        getControlField("DENSITY_SURGE")?.min,
        getControlField("DENSITY_SURGE")?.max,
      )) /
    100,
  nightCohesionMultiplier:
    clamp(
      numberOrDefault(controls.NIGHT_COHESION, PARAMS.DEFAULT_NIGHT_COHESION),
      getControlField("NIGHT_COHESION")?.min,
      getControlField("NIGHT_COHESION")?.max,
    ) / 100,
  densitySurgeRatio: inverseLerp(
    clamp(
      numberOrDefault(controls.DENSITY_SURGE, PARAMS.DEFAULT_DENSITY_SURGE),
      getControlField("DENSITY_SURGE")?.min,
      getControlField("DENSITY_SURGE")?.max,
    ),
    getControlField("DENSITY_SURGE")?.min,
    getControlField("DENSITY_SURGE")?.max,
  ),
  nightCohesionRatio: inverseLerp(
    clamp(
      numberOrDefault(controls.NIGHT_COHESION, PARAMS.DEFAULT_NIGHT_COHESION),
      getControlField("NIGHT_COHESION")?.min,
      getControlField("NIGHT_COHESION")?.max,
    ),
    getControlField("NIGHT_COHESION")?.min,
    getControlField("NIGHT_COHESION")?.max,
  ),
  countDensityRatio: inverseLerp(
    clamp(
      Math.round(numberOrDefault(controls.COUNT, PARAMS.DEFAULT_COUNT)),
      getControlField("COUNT")?.min,
      getControlField("COUNT")?.max,
    ),
    getControlField("COUNT")?.min,
    getControlField("COUNT")?.max,
  ),
});

const createFoodField = (width, height) => {
  const centerX = width * 0.5;
  const centerY = height * 0.48;

  return Array.from({ length: PARAMS.FOOD_PATCH_COUNT }, (_, index) => {
    const angle = (index / PARAMS.FOOD_PATCH_COUNT) * Math.PI * 2;
    const orbit = Math.min(width, height) * randomBetween(0.16, 0.29);
    return {
      anchorX: centerX + Math.cos(angle) * orbit,
      anchorY: centerY + Math.sin(angle) * orbit * 0.7,
      orbitX: randomBetween(30, 65),
      orbitY: randomBetween(18, 46),
      phase: randomBetween(-Math.PI, Math.PI),
      radius: randomBetween(
        PARAMS.FOOD_PATCH_RADIUS_PX * 0.72,
        PARAMS.FOOD_PATCH_RADIUS_PX * 1.18,
      ),
      intensity: randomBetween(0.72, 1.1),
      biomass: randomBetween(0.72, 1),
    };
  });
};

const createFoodPatch = (x, y, width, height, userPlaced = false) => ({
  anchorX: clamp(x, 0, width),
  anchorY: clamp(y, 0, height),
  orbitX: userPlaced ? randomBetween(10, 24) : randomBetween(30, 65),
  orbitY: userPlaced ? randomBetween(8, 18) : randomBetween(18, 46),
  phase: randomBetween(-Math.PI, Math.PI),
  radius: randomBetween(
    PARAMS.FOOD_PATCH_RADIUS_PX * (userPlaced ? 0.54 : 0.72),
    PARAMS.FOOD_PATCH_RADIUS_PX * (userPlaced ? 0.86 : 1.18),
  ),
  intensity: randomBetween(userPlaced ? 0.92 : 0.72, userPlaced ? 1.28 : 1.1),
  biomass: 1,
  userPlaced,
});

const addUserFoodPatch = (foodField, x, y, width, height) => {
  const nextPatch = createFoodPatch(x, y, width, height, true);
  return [...foodField, nextPatch];
};

const sampleFood = (foodField, x, y, elapsedS, config) => {
  const abundanceScale = lerp(0.02, 1.9, config.foodAbundance);
  const background =
    (PARAMS.FOOD_BACKGROUND_WEIGHT +
      (Math.sin(x * 0.009 + elapsedS * 0.22) * 0.5 + 0.5) * 0.12 +
      (Math.cos(y * 0.008 - elapsedS * 0.18) * 0.5 + 0.5) * 0.08) *
    abundanceScale;

  let food = background;

  foodField.forEach((patch, index) => {
    const wobble = elapsedS * PARAMS.FOOD_PATCH_DRIFT_PX_S * 0.1 + patch.phase;
    const patchX = patch.anchorX + Math.cos(wobble + index) * patch.orbitX;
    const patchY =
      patch.anchorY + Math.sin(wobble * 0.87 + index) * patch.orbitY;
    const dx = x - patchX;
    const dy = y - patchY;
    const radius =
      patch.radius *
      (1 + Math.sin(wobble * 0.5) * PARAMS.FOOD_PATCH_WOBBLE_SCALE * 0.12);
    const distanceSq = dx * dx + dy * dy;
    const gaussian = Math.exp(-distanceSq / (2 * radius * radius));
    const biomass = clamp(patch.biomass ?? 1, 0, 1);
    food += gaussian * patch.intensity * biomass * 0.95 * abundanceScale;
  });

  return clamp(food, 0, 1);
};

const consumeFoodAt = (foodField, x, y, elapsedS, amount) => {
  if (amount <= 0) {
    return;
  }

  foodField.forEach((patch, index) => {
    const wobble = elapsedS * PARAMS.FOOD_PATCH_DRIFT_PX_S * 0.1 + patch.phase;
    const patchX = patch.anchorX + Math.cos(wobble + index) * patch.orbitX;
    const patchY =
      patch.anchorY + Math.sin(wobble * 0.87 + index) * patch.orbitY;
    const radius =
      patch.radius *
      (1 + Math.sin(wobble * 0.5) * PARAMS.FOOD_PATCH_WOBBLE_SCALE * 0.12);
    const dx = x - patchX;
    const dy = y - patchY;
    const gaussian = Math.exp(-(dx * dx + dy * dy) / (2 * radius * radius));

    if (gaussian <= 0.01) {
      return;
    }

    patch.biomass = clamp((patch.biomass ?? 1) - amount * gaussian, 0, 1);
  });
};

const calculateFoodAttractionForce = (foodField, agent, elapsedS, config) => {
  if (agent.stomachFullness >= PARAMS.PARACHUTE_ENTRY_FULLNESS) {
    return { x: 0, y: 0, signal: 0 };
  }

  let targetX = 0;
  let targetY = 0;
  let totalWeight = 0;
  const abundanceScale = lerp(0.25, 1.6, config.foodAbundance);

  foodField.forEach((patch, index) => {
    const biomass = clamp(patch.biomass ?? 1, 0, 1);
    if (biomass <= 0.02) {
      return;
    }

    const wobble = elapsedS * PARAMS.FOOD_PATCH_DRIFT_PX_S * 0.1 + patch.phase;
    const patchX = patch.anchorX + Math.cos(wobble + index) * patch.orbitX;
    const patchY =
      patch.anchorY + Math.sin(wobble * 0.87 + index) * patch.orbitY;
    const dx = patchX - agent.x;
    const dy = patchY - agent.y;
    const distance = magnitude(dx, dy);
    const range = patch.radius * (patch.userPlaced ? 4.4 : 2.2);

    if (distance > range) {
      return;
    }

    const weight =
      (1 - distance / range) *
      biomass *
      patch.intensity *
      abundanceScale *
      (patch.userPlaced ? 1.8 : 1);
    targetX += patchX * weight;
    targetY += patchY * weight;
    totalWeight += weight;
  });

  if (totalWeight <= 0) {
    return { x: 0, y: 0, signal: 0 };
  }

  const direction = normalize2D(
    targetX / totalWeight - agent.x,
    targetY / totalWeight - agent.y,
    { x: 0, y: 0 },
  );

  return {
    x: direction.x * PARAMS.OPTIMAL_SPEED_PX_S * 4.4 * clamp(totalWeight, 0, 1),
    y: direction.y * PARAMS.OPTIMAL_SPEED_PX_S * 4.4 * clamp(totalWeight, 0, 1),
    signal: clamp(totalWeight, 0, 1),
  };
};

const resolvePhaseFlags = (lightPhase, transitionState, nowS) => {
  const isTransition =
    transitionState?.to === lightPhase &&
    nowS - transitionState.startedAt < PARAMS.LIGHT_PHASE_TRANSITION_DURATION_S;
  const transitionProgress = isTransition
    ? clamp(
        (nowS - transitionState.startedAt) /
          PARAMS.LIGHT_PHASE_TRANSITION_DURATION_S,
        0,
        1,
      )
    : 1;
  const isDay = lightPhase === "day";
  const isNight = lightPhase === "night";
  const isDuskPhase = lightPhase === "sunset" || lightPhase === "sunrise";
  const resolveDaylightStrength = (phase) =>
    phase === "night" ? 0 : phase === "sunset" || phase === "sunrise" ? 0.42 : 1;
  const phaseLightStrength = resolveDaylightStrength(lightPhase);
  const daylightStrength = isTransition
    ? lerp(
        resolveDaylightStrength(transitionState.from),
        resolveDaylightStrength(lightPhase),
        smoothstep(transitionProgress),
      )
    : isDay
      ? 1
      : isNight
        ? 0
        : 0.42;

  return {
    lightPhase,
    isDay,
    isNight,
    isDawn: lightPhase === "sunrise" || (isTransition && lightPhase === "day"),
    isDusk: lightPhase === "sunset" || (isTransition && lightPhase === "night"),
    isCrepuscular: isDuskPhase || isTransition,
    crepuscularStrength: isDuskPhase
      ? 1
      : isTransition
        ? 0.65 + Math.sin(transitionProgress * Math.PI) * 0.35
        : 0,
    transitionProgress,
    daylightStrength,
    phaseLightStrength,
  };
};

const resolveTargetDepthY = (height, timeFlags) => {
  if (timeFlags.lightPhase === "sunset" || timeFlags.lightPhase === "sunrise") {
    return height * PARAMS.TRANSITION_DEPTH_RATIO;
  }

  const phaseRatio = timeFlags.isDay
    ? PARAMS.DAY_DEPTH_RATIO
    : PARAMS.NIGHT_DEPTH_RATIO;
  const ratio = timeFlags.isCrepuscular
    ? lerp(
        PARAMS.TRANSITION_DEPTH_RATIO,
        phaseRatio,
        timeFlags.transitionProgress,
      )
    : phaseRatio;
  return height * ratio;
};

// 에이전트 생성
const createAgent = (index, width, height) => {
  const heading = randomBetween(-Math.PI, Math.PI);
  const speed = randomBetween(
    PARAMS.OPTIMAL_SPEED_PX_S * 0.75,
    PARAMS.OPTIMAL_SPEED_PX_S * 1.05,
  );
  const direction = angleToVector(heading);
  const bodyLength = randomBetween(
    PARAMS.BODY_LENGTH_MIN_PX,
    PARAMS.BODY_LENGTH_MAX_PX,
  );
  const renderWidth = bodyLength * PARAMS.BODY_RENDER_SCALE;
  const renderHeight =
    renderWidth *
    ((ATLAS.imageSize?.height || 75) /
      Math.max((ATLAS.imageSize?.width || 290) * 0.5, 1));

  return {
    id: index,
    x: randomBetween(0, width),
    y: randomBetween(0, height),
    vx: direction.x * speed,
    vy: direction.y * speed,
    ax: 0,
    ay: 0,
    heading,
    targetHeading: heading,
    currentSpeed: speed,
    targetSpeed: speed,
    turnNoise: randomBetween(-0.2, 0.2),
    stomachFullness: randomBetween(0.04, 0.36),
    stomachFeedScale: randomBetween(0.7, 1.3),
    stomachDigestScale: randomBetween(0.75, 1.25),
    isParachuting: false,
    parachuteTime: 0,
    parachuteCooldown: randomBetween(2, PARAMS.PARACHUTE_COOLDOWN_MAX_S),
    parachuteTargetY: null,
    parachuteDriftX: randomBetween(-1, 1),
    bioluminescence: randomBetween(0, 0.12),
    externalPanicTime: 0,
    panicTime: 0,
    feedingTime: 0,
    rejoinTime: 0,
    mode: "swim_layer",
    isReturning: false,
    bodyLength,
    renderWidth,
    renderHeight,
    spriteProfile: "simulation",
    spriteSpace: "2d",
    spriteState: undefined,
    spriteVelocity: { x: direction.x * speed, y: direction.y * speed },
    spritePosition: null,
    previousScreenPosition: null,
    stageOffset: randomBetween(0, 1000),
    time: randomBetween(0, 1000),
  };
};

const createAgents = (count, width, height) =>
  Array.from({ length: count }, (_, index) =>
    createAgent(index, width, height),
  );

const ensureAgents = (agentsRef, config, width, height) => {
  if (agentsRef.current.length < config.count) {
    const nextAgents = [...agentsRef.current];
    const startIndex = nextAgents.length;
    for (let index = startIndex; index < config.count; index += 1) {
      nextAgents.push(createAgent(index, width, height));
    }
    agentsRef.current = nextAgents;
  } else if (agentsRef.current.length > config.count) {
    agentsRef.current = agentsRef.current.slice(0, config.count);
  }

  const minX = -PARAMS.OFFSCREEN_ALLOWANCE_PX;
  const maxX = width + PARAMS.OFFSCREEN_ALLOWANCE_PX;
  const minY = -PARAMS.OFFSCREEN_ALLOWANCE_PX;
  const maxY = height + PARAMS.OFFSCREEN_ALLOWANCE_PX;

  agentsRef.current.forEach((agent) => {
    agent.x = clamp(agent.x, minX, maxX);
    agent.y = clamp(agent.y, minY, maxY);
  });
};

const resolveTopologicalNeighbors = (neighbors) =>
  neighbors
    .slice()
    .sort((left, right) => left.distance - right.distance)
    .slice(0, PARAMS.TOPOLOGICAL_NEIGHBOR_COUNT);

const calculateSeparation = (neighbors, separationDistance) => {
  let forceX = 0;
  let forceY = 0;

  neighbors.forEach((neighbor) => {
    if (neighbor.distance <= 1e-6 || neighbor.distance > separationDistance) {
      return;
    }

    const closeness = 1 - neighbor.distance / separationDistance;
    const weight = (Math.exp(closeness * 2.2) - 1) * PARAMS.SEPARATION_WEIGHT;
    forceX -= (neighbor.dx / neighbor.distance) * weight;
    forceY -= (neighbor.dy / neighbor.distance) * weight;
  });

  return { x: forceX, y: forceY };
};

const calculateAlignment = (neighbors, agent) => {
  if (neighbors.length === 0) {
    return { x: 0, y: 0 };
  }

  let dirX = 0;
  let dirY = 0;

  neighbors.forEach((neighbor) => {
    const direction = normalize2D(neighbor.agent.vx, neighbor.agent.vy);
    dirX += direction.x;
    dirY += direction.y;
  });

  const averageDir = normalize2D(dirX, dirY, angleToVector(agent.heading));
  const currentDir = normalize2D(
    agent.vx,
    agent.vy,
    angleToVector(agent.heading),
  );

  return {
    x:
      (averageDir.x - currentDir.x) *
      PARAMS.ALIGNMENT_WEIGHT *
      PARAMS.OPTIMAL_SPEED_PX_S,
    y:
      (averageDir.y - currentDir.y) *
      PARAMS.ALIGNMENT_WEIGHT *
      PARAMS.OPTIMAL_SPEED_PX_S,
  };
};

const calculateDensityGradientCohesion = (neighbors, separationDistance) => {
  if (neighbors.length === 0) {
    return { x: 0, y: 0 };
  }

  let forceX = 0;
  let forceY = 0;
  const preferredDistance = separationDistance * 1.55;

  neighbors.forEach((neighbor) => {
    const directionX = neighbor.dx / neighbor.distance;
    const directionY = neighbor.dy / neighbor.distance;
    let shellWeight = 0;

    if (neighbor.distance < preferredDistance) {
      const proximity = 1 - neighbor.distance / preferredDistance;
      shellWeight = -proximity * 0.75;
    } else {
      const outerProgress = inverseLerp(
        neighbor.distance,
        preferredDistance,
        PARAMS.PERCEPTION_RADIUS_PX,
      );
      shellWeight = Math.sin((1 - outerProgress) * Math.PI * 0.9) * 0.95;
    }

    const radialWeight = 1 - neighbor.distance / PARAMS.PERCEPTION_RADIUS_PX;
    forceX += directionX * shellWeight * radialWeight;
    forceY += directionY * shellWeight * radialWeight;
  });

  return {
    x: forceX * PARAMS.COHESION_WEIGHT * PARAMS.OPTIMAL_SPEED_PX_S,
    y: forceY * PARAMS.COHESION_WEIGHT * PARAMS.OPTIMAL_SPEED_PX_S,
  };
};

const calculateDvmForce = (agent, targetDepthY, height) => {
  const normalizedOffset =
    (targetDepthY - agent.y) / Math.max(height * 0.24, 1);
  return {
    x: 0,
    y: clamp(
      normalizedOffset * PARAMS.MAX_SPEED_PX_S * PARAMS.DVM_STEER_WEIGHT,
      -PARAMS.DVM_MAX_STEER_PX_S,
      PARAMS.DVM_MAX_STEER_PX_S,
    ),
  };
};

const calculateBoundaryForce = (agent, width, height) => {
  let forceX = 0;
  let forceY = 0;

  if (agent.x < PARAMS.WORLD_MARGIN_PX) {
    forceX += 1 - agent.x / PARAMS.WORLD_MARGIN_PX;
  } else if (agent.x > width - PARAMS.WORLD_MARGIN_PX) {
    forceX -= 1 - (width - agent.x) / PARAMS.WORLD_MARGIN_PX;
  }

  if (agent.y < PARAMS.WORLD_MARGIN_PX) {
    forceY += 1 - agent.y / PARAMS.WORLD_MARGIN_PX;
  } else if (agent.y > height - PARAMS.WORLD_MARGIN_PX) {
    forceY -= 1 - (height - agent.y) / PARAMS.WORLD_MARGIN_PX;
  }

  return {
    x: forceX * PARAMS.BOUNDARY_RETURN_WEIGHT * PARAMS.OPTIMAL_SPEED_PX_S,
    y: forceY * PARAMS.BOUNDARY_RETURN_WEIGHT * PARAMS.OPTIMAL_SPEED_PX_S,
  };
};

const calculateSwarmCenterForce = (agent, swarmCenter, width, height) => {
  if (!swarmCenter) {
    return { x: 0, y: 0 };
  }

  const dx = swarmCenter.x - agent.x;
  const dy = swarmCenter.y - agent.y;
  const distance = magnitude(dx, dy);
  const comfortRadius =
    Math.min(width, height) * PARAMS.SWARM_COMFORT_RADIUS_RATIO;

  if (distance < comfortRadius || distance < 1e-4) {
    return { x: 0, y: 0 };
  }

  const pullRatio = inverseLerp(
    distance,
    comfortRadius,
    Math.max(width, height) * 0.42,
  );

  return {
    x:
      (dx / distance) *
      PARAMS.OPTIMAL_SPEED_PX_S *
      PARAMS.SWARM_CENTER_PULL_WEIGHT *
      pullRatio,
    y:
      (dy / distance) *
      PARAMS.OPTIMAL_SPEED_PX_S *
      PARAMS.SWARM_CENTER_PULL_WEIGHT *
      pullRatio,
  };
};

const calculateCondensedCenterForce = (agent, width, targetDepthY) => {
  const dx = width * 0.5 - agent.x;
  const dy = targetDepthY - agent.y;
  const distance = magnitude(dx, dy);

  if (distance < 1e-4) {
    return { x: 0, y: 0 };
  }

  const pull = PARAMS.OPTIMAL_SPEED_PX_S * 4.2 * smoothstep(distance / 420);
  return {
    x: (dx / distance) * pull,
    y: (dy / distance) * pull,
  };
};

const calculateDayBandSpreadForce = (agent, width, targetDepthY) => {
  const normalizedX = width > 0 ? agent.x / width : 0.5;
  const edgeDistance = Math.min(normalizedX, 1 - normalizedX);
  const edgePull = smoothstep(1 - edgeDistance / 0.42);
  const outwardSign = normalizedX < 0.5 ? -1 : 1;
  const depthOffset = (targetDepthY - agent.y) / Math.max(width * 0.18, 1);

  return {
    x:
      outwardSign *
      PARAMS.OPTIMAL_SPEED_PX_S *
      PARAMS.DAY_BAND_SPREAD_WEIGHT *
      edgePull,
    y: clamp(depthOffset, -1, 1) * PARAMS.OPTIMAL_SPEED_PX_S * 0.42,
  };
};

const calculateNightClusterForce = (agent, width, height, targetDepthY) => {
  const clusterIndex = agent.id % PARAMS.NIGHT_CLUSTER_COUNT;
  const clusterRatio =
    PARAMS.NIGHT_CLUSTER_COUNT <= 1
      ? 0.5
      : clusterIndex / (PARAMS.NIGHT_CLUSTER_COUNT - 1);
  const targetX =
    width * (0.12 + clusterRatio * 0.76) +
    Math.sin(agent.id * 2.13) * PARAMS.NIGHT_CLUSTER_SPREAD_PX * 0.18;
  const targetY =
    targetDepthY +
    Math.sin(clusterIndex * 1.9 + agent.id * 0.17) *
      Math.min(height * 0.12, PARAMS.NIGHT_CLUSTER_SPREAD_PX);
  const direction = normalize2D(targetX - agent.x, targetY - agent.y, {
    x: 0,
    y: 1,
  });
  const distance = magnitude(targetX - agent.x, targetY - agent.y);
  const pull = smoothstep(distance / Math.max(width * 0.28, 1));

  return {
    x:
      direction.x *
      PARAMS.OPTIMAL_SPEED_PX_S *
      PARAMS.NIGHT_CLUSTER_PULL_WEIGHT *
      pull,
    y:
      direction.y *
      PARAMS.OPTIMAL_SPEED_PX_S *
      PARAMS.NIGHT_CLUSTER_PULL_WEIGHT *
      pull,
  };
};

const calculateScreenReentryForce = (agent, width, height) => {
  const minX = 0;
  const maxX = width;
  const minY = 0;
  const maxY = height;
  const insetX = width * (1 - PARAMS.SCREEN_REENTRY_START_RATIO) * 0.5;
  const insetY = height * (1 - PARAMS.SCREEN_REENTRY_START_RATIO) * 0.5;
  const safeMinX = minX + insetX;
  const safeMaxX = maxX - insetX;
  const safeMinY = minY + insetY;
  const safeMaxY = maxY - insetY;
  const outsideX = agent.x < minX || agent.x > maxX;
  const outsideY = agent.y < minY || agent.y > maxY;
  const nearEdgeX = agent.x < safeMinX || agent.x > safeMaxX;
  const nearEdgeY = agent.y < safeMinY || agent.y > safeMaxY;

  if (!outsideX && !outsideY && !nearEdgeX && !nearEdgeY) {
    return { x: 0, y: 0, active: false, realOutside: false };
  }

  const targetX = clamp(agent.x, safeMinX, safeMaxX);
  const targetY = clamp(agent.y, safeMinY, safeMaxY);
  const toInterior = normalize2D(targetX - agent.x, targetY - agent.y, {
    x: 0,
    y: 1,
  });
  const tangent = { x: -toInterior.y, y: toInterior.x };
  const tangentSign = agent.id % 2 === 0 ? 1 : -1;
  const outsideDistance = Math.hypot(targetX - agent.x, targetY - agent.y);
  const edgeDepth = Math.max(
    safeMinX - agent.x,
    agent.x - safeMaxX,
    safeMinY - agent.y,
    agent.y - safeMaxY,
    0,
  );
  const outsideRatio = clamp(
    Math.max(edgeDepth, outsideDistance) /
      Math.max(PARAMS.OFFSCREEN_ALLOWANCE_PX + Math.max(insetX, insetY), 1),
    0.18,
    1,
  );

  return {
    x:
      toInterior.x *
        PARAMS.MAX_SPEED_PX_S *
        PARAMS.SCREEN_REENTRY_FORCE *
        outsideRatio +
      tangent.x *
        PARAMS.OPTIMAL_SPEED_PX_S *
        PARAMS.SCREEN_REENTRY_TANGENTIAL_FORCE *
        tangentSign,
    y:
      toInterior.y *
        PARAMS.MAX_SPEED_PX_S *
        PARAMS.SCREEN_REENTRY_FORCE *
        outsideRatio +
      tangent.y *
        PARAMS.OPTIMAL_SPEED_PX_S *
        PARAMS.SCREEN_REENTRY_TANGENTIAL_FORCE *
        tangentSign,
    active: true,
    realOutside: outsideX || outsideY,
  };
};

const calculateFlowFieldForce = (agent, elapsedS) => {
  const waveA =
    Math.sin(agent.y * PARAMS.FLOW_FIELD_SCALE_Y + elapsedS * 0.37) +
    Math.sin((agent.x + agent.y) * 0.0036 - elapsedS * 0.24);
  const waveB =
    Math.cos(agent.x * PARAMS.FLOW_FIELD_SCALE_X - elapsedS * 0.31) +
    Math.sin((agent.x - agent.y) * 0.0042 + elapsedS * 0.19);

  return {
    x: waveA * PARAMS.OPTIMAL_SPEED_PX_S * PARAMS.FLOW_FIELD_WEIGHT,
    y: waveB * PARAMS.OPTIMAL_SPEED_PX_S * PARAMS.FLOW_FIELD_WEIGHT * 0.72,
  };
};

const calculatePredatorForce = (agent, pointer) => {
  if (!pointer?.active) {
    return { x: 0, y: 0, panic: 0, distance: Infinity };
  }

  const dx = agent.x - pointer.x;
  const dy = agent.y - pointer.y;
  const distanceToPredator = magnitude(dx, dy);

  if (distanceToPredator > PARAMS.PREDATOR_DETECTION_RADIUS_PX) {
    return { x: 0, y: 0, panic: 0, distance: distanceToPredator };
  }

  const away = normalize2D(dx, dy, angleToVector(agent.heading));
  const tangent = { x: -away.y, y: away.x };
  const tangentSign = agent.id % 2 === 0 ? 1 : -1;
  const panic = 1 - distanceToPredator / PARAMS.PREDATOR_DETECTION_RADIUS_PX;
  const hardPanic = inverseLerp(
    PARAMS.PREDATOR_IMPACT_RADIUS_PX - distanceToPredator,
    0,
    PARAMS.PREDATOR_IMPACT_RADIUS_PX,
  );
  const force =
    PARAMS.MAX_SPEED_PX_S *
    PARAMS.PREDATOR_ESCAPE_FORCE *
    Math.max(panic * panic, hardPanic);

  return {
    x:
      away.x * force +
      tangent.x *
        PARAMS.OPTIMAL_SPEED_PX_S *
        PARAMS.PREDATOR_TANGENTIAL_FORCE *
        panic *
        tangentSign,
    y:
      away.y * force +
      tangent.y *
        PARAMS.OPTIMAL_SPEED_PX_S *
        PARAMS.PREDATOR_TANGENTIAL_FORCE *
        panic *
        tangentSign,
    panic,
    distance: distanceToPredator,
  };
};

const calculateVisualSignalForces = (agent, neighbors) => {
  let panicSignal = 0;
  let escapeX = 0;
  let escapeY = 0;
  let feedingX = 0;
  let feedingY = 0;
  let feedingWeight = 0;

  neighbors.forEach((neighbor) => {
    if (neighbor.distance > PARAMS.LIGHT_PERCEPTION_RADIUS_PX) {
      return;
    }

    const neighborLight = neighbor.agent.bioluminescence ?? 0;
    if (
      neighborLight > PARAMS.BIOLUM_FLASH_THRESHOLD &&
      neighbor.agent.externalPanicTime > PARAMS.PANIC_LATCH_DURATION_S * 0.35
    ) {
      const strength =
        (1 - neighbor.distance / PARAMS.LIGHT_PERCEPTION_RADIUS_PX) *
        inverseLerp(neighborLight, PARAMS.BIOLUM_FLASH_THRESHOLD, 1) *
        1.5;
      panicSignal = Math.max(panicSignal, strength);
      const awayFromFlash = normalize2D(
        -neighbor.dx,
        -neighbor.dy,
        angleToVector(agent.heading),
      );
      escapeX += awayFromFlash.x * strength;
      escapeY += awayFromFlash.y * strength;
    }

    if (
      neighbor.agent.mode === "feeding" &&
      agent.stomachFullness < PARAMS.PARACHUTE_ENTRY_FULLNESS
    ) {
      const strength =
        (1 - neighbor.distance / PARAMS.LIGHT_PERCEPTION_RADIUS_PX) *
        clamp(1 - agent.stomachFullness, 0, 1);
      feedingX += neighbor.agent.x * strength;
      feedingY += neighbor.agent.y * strength;
      feedingWeight += strength;
    }
  });

  const escape = normalize2D(escapeX, escapeY, angleToVector(agent.heading));
  const foodAttraction =
    feedingWeight > 0
      ? normalize2D(
          feedingX / feedingWeight - agent.x,
          feedingY / feedingWeight - agent.y,
          { x: 0, y: 0 },
        )
      : { x: 0, y: 0 };
  const feedingSignal = clamp(feedingWeight, 0, 1);

  return {
    panic: panicSignal,
    x:
      escape.x *
        PARAMS.MAX_SPEED_PX_S *
        PARAMS.BIOLUM_PANIC_CASCADE_FORCE *
        panicSignal +
      foodAttraction.x *
        PARAMS.OPTIMAL_SPEED_PX_S *
        PARAMS.BIOLUM_FEEDING_ATTRACTION_WEIGHT *
        feedingSignal,
    y:
      escape.y *
        PARAMS.MAX_SPEED_PX_S *
        PARAMS.BIOLUM_PANIC_CASCADE_FORCE *
        panicSignal +
      foodAttraction.y *
        PARAMS.OPTIMAL_SPEED_PX_S *
        PARAMS.BIOLUM_FEEDING_ATTRACTION_WEIGHT *
        feedingSignal,
    feeding: feedingSignal,
  };
};

const resolveModeParameters = (mode, timeFlags) => {
  if (mode === "panic_split") {
    return {
      turnRate: PARAMS.PANIC_TURN_RATE_RAD_S,
      speedPx: PARAMS.MAX_SPEED_PX_S * 1.15,
      separationDistancePx: 65,
      separationScale: 5.5,
      alignmentScale: 0,
      cohesionXScale: 0,
      cohesionYScale: 0,
      dvmScale: 0,
      flowScale: 0,
      noiseScale: 0,
      forwardScale: 0.25,
      swarmCenterScale: 0,
      predatorScale: 1.5,
      visualSignalScale: 1.2,
    };
  }

  if (mode === "rejoin") {
    return {
      turnRate: PARAMS.REJOIN_TURN_RATE_RAD_S,
      speedPx: PARAMS.OPTIMAL_SPEED_PX_S * 1.1,
      separationDistancePx: 35,
      separationScale: 1.2,
      alignmentScale: 1.5,
      cohesionXScale: 2.5,
      cohesionYScale: 1.2,
      dvmScale: 1.4,
      flowScale: 0.3,
      noiseScale: 0.4,
      forwardScale: 0.55,
      swarmCenterScale: 0.8,
      predatorScale: 0.4,
      visualSignalScale: 0.6,
    };
  }

  if (mode === "condensed_swarm") {
    return {
      turnRate: PARAMS.CONDENSED_TURN_RATE_RAD_S,
      speedPx: 76,
      separationDistancePx: 10,
      separationScale: 0.08,
      alignmentScale: 1.4,
      cohesionXScale: 14,
      cohesionYScale: 12,
      dvmScale: 2.1,
      flowScale: 0,
      noiseScale: 0,
      forwardScale: 0.08,
      swarmCenterScale: 0,
      predatorScale: 0.5,
      visualSignalScale: 0.8,
    };
  }

  if (mode === "feeding") {
    return {
      turnRate: PARAMS.FEEDING_TURN_RATE_RAD_S,
      speedPx: 6,
      separationDistancePx: 25,
      separationScale: 1.8,
      alignmentScale: 0,
      cohesionXScale: 0,
      cohesionYScale: 0,
      dvmScale: 0,
      flowScale: 0.1,
      noiseScale: 6,
      forwardScale: 0.15,
      swarmCenterScale: 0,
      predatorScale: 0.3,
      visualSignalScale: 1,
    };
  }

  if (timeFlags.isNight) {
    return {
      turnRate: 1.2,
      speedPx: 34,
      separationDistancePx: 76,
      separationScale: 2.8,
      alignmentScale: 0.06,
      cohesionXScale: 0.04,
      cohesionYScale: 0.02,
      dvmScale: 1.8,
      flowScale: 2.2,
      noiseScale: 2.2,
      forwardScale: 1,
      swarmCenterScale: 0,
      predatorScale: 0.8,
      visualSignalScale: 0.8,
    };
  }

  return {
    turnRate: 1.35,
    speedPx: 48,
    separationDistancePx: 54,
    separationScale: 1.35,
    alignmentScale: 0.8,
    cohesionXScale: 0.18,
    cohesionYScale: 0.02,
    dvmScale: 1.8,
    flowScale: 1.35,
    noiseScale: 0.9,
    forwardScale: 1,
    swarmCenterScale: 0,
    predatorScale: 0.8,
    visualSignalScale: 0.8,
  };
};

const updateStomach = (agent, food, dt) => {
  const effectiveFood = Math.max(0, food - PARAMS.FEEDING_FOOD_THRESHOLD);
  const hunger = clamp(1 - agent.stomachFullness, 0, 1);
  const digestion =
    PARAMS.STOMACH_DIGESTION_PER_S *
    (agent.stomachDigestScale ?? 1) *
    (agent.isParachuting ? PARAMS.PARACHUTE_DIGESTION_MULTIPLIER : 1) *
    dt;
  const feeding =
    effectiveFood *
    hunger *
    PARAMS.STOMACH_FEED_RATE_PER_S *
    (agent.stomachFeedScale ?? 1) *
    (agent.isParachuting ? PARAMS.PARACHUTE_FEED_MULTIPLIER : 1) *
    dt;
  agent.stomachFullness = clamp(
    agent.stomachFullness + feeding - digestion,
    0,
    1.05,
  );
  return feeding;
};

const updateParachutingState = (agent, food, height, dt) => {
  agent.parachuteCooldown = Math.max(0, (agent.parachuteCooldown ?? 0) - dt);

  if (agent.isParachuting) {
    agent.parachuteTime = (agent.parachuteTime ?? 0) + dt;

    const reachedTarget =
      agent.y >=
      Math.min(
        agent.parachuteTargetY ?? height * PARAMS.PARACHUTE_BOTTOM_RATIO,
        height * PARAMS.PARACHUTE_BOTTOM_RATIO,
      );
    const finishedCycle =
      agent.parachuteTime >= PARAMS.PARACHUTE_DURATION_S || reachedTarget;

    if (finishedCycle) {
      agent.isParachuting = false;
      agent.mode = "swim_layer";
      agent.stomachFullness = Math.min(
        agent.stomachFullness,
        PARAMS.PARACHUTE_EXIT_FULLNESS,
      );
      agent.parachuteCooldown = randomParachuteCooldown();
      agent.parachuteTargetY = null;
      agent.parachuteTime = 0;
    }

    return;
  }

  const canParachute =
    agent.id % Math.max(1, Math.round(1 / PARAMS.PARACHUTE_ACTIVE_RATIO)) === 0;
  const feedingHotspot = food >= PARAMS.FEEDING_FOOD_THRESHOLD;

  if (
    canParachute &&
    feedingHotspot &&
    agent.parachuteCooldown <= 0 &&
    agent.stomachFullness >= PARAMS.PARACHUTE_ENTRY_FULLNESS
  ) {
    agent.isParachuting = true;
    agent.mode = "parachute";
    agent.parachuteTime = 0;
    agent.parachuteTargetY = Math.min(
      agent.y +
        randomBetween(
          PARAMS.PARACHUTE_DROP_MIN_PX,
          PARAMS.PARACHUTE_DROP_MAX_PX,
        ),
      height * PARAMS.PARACHUTE_BOTTOM_RATIO,
    );
    agent.parachuteDriftX = randomBetween(-1, 1);
  } else {
    agent.mode =
      food > PARAMS.FEEDING_FOOD_THRESHOLD ? "feeding" : "swim_layer";
  }
};

const gatherNeighbors = (agents, agentIndex) => {
  const agent = agents[agentIndex];
  const neighbors = [];

  for (let index = 0; index < agents.length; index += 1) {
    if (index === agentIndex) {
      continue;
    }

    const other = agents[index];
    if (other.isParachuting) {
      continue;
    }

    const dx = other.x - agent.x;
    const dy = other.y - agent.y;
    const distance = magnitude(dx, dy);

    if (distance <= PARAMS.PERCEPTION_RADIUS_PX) {
      neighbors.push({ agent: other, dx, dy, distance });
    }
  }

  return neighbors;
};

const calculateSwarmCenter = (agents) => {
  if (agents.length === 0) {
    return null;
  }

  const total = agents.reduce(
    (accumulator, agent) => ({
      x: accumulator.x + agent.x,
      y: accumulator.y + agent.y,
    }),
    { x: 0, y: 0 },
  );

  return {
    x: total.x / agents.length,
    y: total.y / agents.length,
  };
};

const advanceAgent = (agent, index, agents, context) => {
  const {
    dt,
    width,
    height,
    elapsedS,
    timeFlags,
    foodField,
    config,
    swarmCenter,
    predatorPointer,
  } = context;
  const food = sampleFood(foodField, agent.x, agent.y, elapsedS, config);
  const consumedFood = updateStomach(agent, food, dt);
  const hunger = clamp(1 - agent.stomachFullness, 0.12, 1);
  const foodSignal = food * hunger;
  const isInFoodPatch = food >= PARAMS.FEEDING_FOOD_THRESHOLD;
  consumeFoodAt(
    foodField,
    agent.x,
    agent.y,
    elapsedS,
    consumedFood * PARAMS.FOOD_PATCH_CONSUMPTION_PER_FULLNESS,
  );
  const isTooDeep = agent.y >= height * PARAMS.PARACHUTE_BOTTOM_RATIO;
  if (agent.isParachuting && isTooDeep) {
    agent.isParachuting = false;
    agent.mode = "swim_layer";
    agent.stomachFullness = Math.min(
      agent.stomachFullness,
      PARAMS.PARACHUTE_EXIT_FULLNESS,
    );
    agent.parachuteCooldown = randomParachuteCooldown();
    agent.parachuteTargetY = null;
    agent.parachuteTime = 0;
  } else {
    updateParachutingState(agent, food, height, dt);
  }

  const targetDepthY = resolveTargetDepthY(height, timeFlags);
  const reentry = calculateScreenReentryForce(agent, width, height);
  agent.isReturning = reentry.realOutside;
  const densitySeparationScale =
    lerp(1.08, 0.56, config.countDensityRatio) *
    lerp(1.18, 0.78, config.densitySurgeRatio);
  const densityCohesionScale =
    lerp(0.82, 2.15, config.countDensityRatio) *
    lerp(0.72, 1.85, config.densitySurgeRatio);
  const crepuscularCompression = lerp(
    1,
    config.densitySurgeMultiplier,
    timeFlags.crepuscularStrength,
  );
  const separationDistance =
    PARAMS.MIN_SEPARATION_PX *
    densitySeparationScale *
    lerp(
      1,
      PARAMS.CREPUSCULAR_SEPARATION_MULTIPLIER,
      timeFlags.crepuscularStrength,
    );
  const nightCohesionEffect = timeFlags.isNight && !timeFlags.isCrepuscular
    ? config.nightCohesionMultiplier * 0.36
    : lerp(0.86, 1.16, config.nightCohesionRatio);
  const cohesionMultiplier = (() => {
    const userCohesionScale = lerp(
      1,
      config.densitySurgeMultiplier * 0.5,
      config.densitySurgeRatio,
    );
    return (
      densityCohesionScale *
      nightCohesionEffect *
      crepuscularCompression *
      userCohesionScale *
      (predatorPointer?.active ? PARAMS.PREDATOR_REJOIN_COHESION_MULTIPLIER : 1)
    );
  })();
  const neighbors = gatherNeighbors(agents, index);
  const topologicalNeighbors = resolveTopologicalNeighbors(neighbors);
  agent.localDensity = clamp(neighbors.length / 22, 0, 1);

  agent.ax = 0;
  agent.ay = 0;
  let effectiveMode = agent.isParachuting ? "parachute" : agent.mode;

  if (agent.isParachuting) {
    agent.bioluminescence = Math.max(
      0,
      (agent.bioluminescence ?? 0) - PARAMS.BIOLUM_DECAY_PER_S * dt,
    );
    agent.targetSpeed = PARAMS.SINKING_SPEED_PX_S;
    const sinkBlend = exponentialBlend(PARAMS.SWIM_RESPONSE_PER_S * 0.85, dt);
    const remainingDrop = Math.max(
      0,
      (agent.parachuteTargetY ?? height * PARAMS.PARACHUTE_BOTTOM_RATIO) -
        agent.y,
    );
    const targetVy = Math.min(
      PARAMS.SINKING_SPEED_PX_S,
      remainingDrop / Math.max(dt, 1 / 60),
    );
    const wobble = Math.sin(agent.time * 0.7 + agent.id * 0.43);
    const driftVelocityX =
      (agent.parachuteDriftX ?? 0) * PARAMS.SINKING_SPEED_PX_S * 0.36 +
      wobble * PARAMS.SINKING_SPEED_PX_S * 0.08;
    agent.ax = driftVelocityX - agent.vx;
    agent.ay = targetVy - agent.vy;
    agent.vx = lerp(agent.vx, driftVelocityX, sinkBlend * 0.7);
    agent.vy = lerp(agent.vy, targetVy, sinkBlend);
    const sideHeading =
      Math.abs(agent.vx) > 0.05 ? (agent.vx >= 0 ? 0 : Math.PI) : agent.heading;
    agent.heading = rotateToward(
      agent.heading,
      sideHeading,
      PARAMS.HIGH_FOOD_TURN_RATE_RAD_S * dt,
    );
  } else {
    const baseTargetSpeed =
      lerp(
        PARAMS.LOW_FOOD_SPEED_PX_S,
        PARAMS.HIGH_FOOD_SPEED_PX_S * lerp(1, 0.45, config.foodAbundance),
        foodSignal,
      ) *
      lerp(
        1.08,
        0.72,
        timeFlags.crepuscularStrength * config.densitySurgeRatio,
      );
    const currentDirection = normalize2D(
      agent.vx,
      agent.vy,
      angleToVector(agent.heading),
    );
    const predator = calculatePredatorForce(agent, predatorPointer);
    agent.externalPanicTime =
      predator.panic > 0.03
        ? PARAMS.PANIC_LATCH_DURATION_S
        : Math.max(0, (agent.externalPanicTime ?? 0) - dt);
    const visualSignals = calculateVisualSignalForces(agent, neighbors);
    const foodAttraction = calculateFoodAttractionForce(
      foodField,
      agent,
      elapsedS,
      config,
    );
    const panicSignal = Math.max(predator.panic, visualSignals.panic);
    if (panicSignal > 0.03) {
      agent.panicVector = normalize2D(
        predator.x + visualSignals.x,
        predator.y + visualSignals.y,
        angleToVector(agent.heading),
      );
    }
    agent.panicTime =
      panicSignal > 0.03
        ? PARAMS.PANIC_LATCH_DURATION_S
        : Math.max(0, (agent.panicTime ?? 0) - dt);
    agent.feedingTime =
      isInFoodPatch || foodAttraction.signal > 0.14
        ? PARAMS.FEEDING_LATCH_DURATION_S
        : Math.max(0, (agent.feedingTime ?? 0) - dt);
    agent.rejoinTime =
      panicSignal > 0.03
        ? PARAMS.REJOIN_DURATION_S
        : Math.max(0, (agent.rejoinTime ?? 0) - dt);
    effectiveMode =
      agent.panicTime > 0
        ? "panic_split"
        : agent.isReturning
          ? "rejoin"
          : timeFlags.isCrepuscular
            ? "condensed_swarm"
            : agent.rejoinTime > 0
              ? "rejoin"
            : agent.feedingTime > 0
              ? "feeding"
              : "swim_layer";
    const modeParameters = resolveModeParameters(effectiveMode, timeFlags);
    const currentSeparationDistance =
      modeParameters.separationDistancePx ?? separationDistance;
    const targetSpeed = modeParameters.speedPx ?? baseTargetSpeed;
    let maxTurnRate = modeParameters.turnRate;
    if (agent.isReturning) {
      maxTurnRate = reentry.realOutside
        ? PARAMS.SCREEN_OUTSIDE_TURN_RATE_RAD_S
        : Math.min(PARAMS.SCREEN_REENTRY_TURN_RATE_RAD_S, maxTurnRate);
    }
    const separation = calculateSeparation(
      neighbors,
      currentSeparationDistance,
    );
    const alignment = calculateAlignment(topologicalNeighbors, agent);
    const cohesion = calculateDensityGradientCohesion(
      neighbors,
      currentSeparationDistance,
    );
    const dvm = calculateDvmForce(agent, targetDepthY, height);
    const boundary = calculateBoundaryForce(agent, width, height);
    const flow = calculateFlowFieldForce(agent, elapsedS);
    const condensedCenter =
      effectiveMode === "condensed_swarm"
        ? calculateCondensedCenterForce(agent, width, targetDepthY)
        : { x: 0, y: 0 };
    const dayBand =
      effectiveMode === "swim_layer" && timeFlags.isDay
        ? calculateDayBandSpreadForce(agent, width, targetDepthY)
        : { x: 0, y: 0 };
    const nightCluster =
      effectiveMode === "swim_layer" && timeFlags.isNight
        ? calculateNightClusterForce(agent, width, height, targetDepthY)
        : { x: 0, y: 0 };
    const latchedPanicSignal =
      effectiveMode === "panic_split"
        ? Math.max(panicSignal, clamp((agent.panicTime ?? 0) / PARAMS.PANIC_LATCH_DURATION_S, 0, 1) * 0.72)
        : panicSignal;
    const biolumDecay = Math.max(
      0,
      (agent.bioluminescence ?? 0) - PARAMS.BIOLUM_DECAY_PER_S * dt,
    );
    if (effectiveMode === "panic_split") {
      agent.bioluminescence = Math.max(
        biolumDecay,
        latchedPanicSignal > 0.16 ? 1 : Math.max(0.62, smoothstep(latchedPanicSignal)),
      );
    } else if (effectiveMode === "feeding") {
      agent.bioluminescence = Math.max(
        biolumDecay,
        0.46 + Math.sin(agent.time * 9 + agent.id) * 0.12,
      );
    } else if (effectiveMode === "condensed_swarm") {
      agent.bioluminescence = Math.max(
        biolumDecay,
        0.32 + Math.sin(elapsedS * 2.8) * 0.18,
      );
    } else {
      agent.bioluminescence = biolumDecay;
    }
    const swarmCenterForce = calculateSwarmCenterForce(
      agent,
      swarmCenter,
      width,
      height,
    );

    const jitterBlend = exponentialBlend(PARAMS.JITTER_BLEND_PER_S, dt);
    const jitterTarget = randomBetween(-1, 1) * food * modeParameters.noiseScale;
    agent.turnNoise = lerp(agent.turnNoise, jitterTarget, jitterBlend);
    const forceFilter = agent.isReturning
      ? PARAMS.SCREEN_REENTRY_FORCE_FILTER
      : 1;
    const activeCohesionMultiplier = agent.isReturning
      ? PARAMS.SCREEN_REENTRY_COHESION_MULTIPLIER
      : cohesionMultiplier;

    const maxDesiredSpeed =
      PARAMS.MAX_SPEED_PX_S *
      (1 + latchedPanicSignal * (PARAMS.PREDATOR_SPEED_MULTIPLIER - 1));
    const desiredVelocity = limitVector(
      currentDirection.x * targetSpeed * modeParameters.forwardScale +
        separation.x * modeParameters.separationScale +
        alignment.x * forceFilter * modeParameters.alignmentScale +
        cohesion.x *
          activeCohesionMultiplier *
          modeParameters.cohesionXScale +
        dvm.x * forceFilter * modeParameters.dvmScale +
        boundary.x * forceFilter +
        flow.x * forceFilter * modeParameters.flowScale +
        swarmCenterForce.x * forceFilter * modeParameters.swarmCenterScale +
        condensedCenter.x +
        dayBand.x +
        nightCluster.x +
        (effectiveMode === "panic_split" && agent.panicVector
          ? agent.panicVector.x * PARAMS.MAX_SPEED_PX_S * 1.2
          : 0) +
        predator.x * modeParameters.predatorScale +
        foodAttraction.x *
          (effectiveMode === "feeding"
            ? PARAMS.BIOLUM_FEEDING_ATTRACTION_WEIGHT
            : foodAttraction.signal > 0.24
              ? 1.2
              : 0) +
        visualSignals.x * modeParameters.visualSignalScale +
        reentry.x,
      currentDirection.y * targetSpeed * modeParameters.forwardScale +
        separation.y * modeParameters.separationScale +
        alignment.y * forceFilter * modeParameters.alignmentScale +
        cohesion.y *
          activeCohesionMultiplier *
          modeParameters.cohesionYScale +
        dvm.y * forceFilter * modeParameters.dvmScale +
        boundary.y * forceFilter +
        flow.y * forceFilter * modeParameters.flowScale +
        swarmCenterForce.y * forceFilter * modeParameters.swarmCenterScale +
        condensedCenter.y +
        dayBand.y +
        nightCluster.y +
        (effectiveMode === "panic_split" && agent.panicVector
          ? agent.panicVector.y * PARAMS.MAX_SPEED_PX_S * 1.2
          : 0) +
        predator.y * modeParameters.predatorScale +
        foodAttraction.y *
          (effectiveMode === "feeding"
            ? PARAMS.BIOLUM_FEEDING_ATTRACTION_WEIGHT
            : foodAttraction.signal > 0.24
              ? 1.2
              : 0) +
        visualSignals.y * modeParameters.visualSignalScale +
        reentry.y,
      maxDesiredSpeed,
    );
    agent.ax = desiredVelocity.x - agent.vx;
    agent.ay = desiredVelocity.y - agent.vy;

    const desiredHeading =
      Math.atan2(desiredVelocity.y, desiredVelocity.x) +
      agent.turnNoise * maxTurnRate * (agent.isReturning ? 0.08 : 0.45);
    agent.targetHeading = desiredHeading;
    agent.heading = rotateToward(
      agent.heading,
      desiredHeading,
      maxTurnRate * dt,
    );

    const desiredSpeed = clamp(
      magnitude(desiredVelocity.x, desiredVelocity.y),
      PARAMS.HIGH_FOOD_SPEED_PX_S * 0.45,
      maxDesiredSpeed,
    );
    const speedBlend = exponentialBlend(PARAMS.SWIM_RESPONSE_PER_S, dt);
    agent.currentSpeed = lerp(
      Math.max(
        magnitude(agent.vx, agent.vy),
        PARAMS.HIGH_FOOD_SPEED_PX_S * 0.25,
      ),
      desiredSpeed,
      speedBlend,
    );
    agent.targetSpeed = targetSpeed;
    agent.vx = Math.cos(agent.heading) * agent.currentSpeed;
    agent.vy = Math.sin(agent.heading) * agent.currentSpeed;
  }

  agent.currentSpeed = magnitude(agent.vx, agent.vy);

  agent.x += agent.vx * dt;
  agent.y += agent.vy * dt;
  agent.x = clamp(
    agent.x,
    -PARAMS.OFFSCREEN_ALLOWANCE_PX,
    width + PARAMS.OFFSCREEN_ALLOWANCE_PX,
  );
  agent.y = clamp(
    agent.y,
    -PARAMS.OFFSCREEN_ALLOWANCE_PX,
    height + PARAMS.OFFSCREEN_ALLOWANCE_PX,
  );
  agent.time += dt;
  agent.spriteVelocity = { x: agent.vx, y: agent.vy };
  agent.spritePosition = { x: agent.x, y: agent.y };
  if (!agent.isParachuting) {
    agent.mode = agent.isReturning
      ? "rejoin"
      : effectiveMode;
  }
  agent.spriteState = agent.isParachuting
    ? {
        mode: "parachuting",
        forceSide: true,
        density: agent.localDensity,
      }
    : {
        mode:
          effectiveMode === "panic_split"
            ? "panic"
            : effectiveMode === "condensed_swarm"
              ? "condensed"
              : effectiveMode,
        forceSide: true,
        density: agent.localDensity,
      };
};

const drawFoodField = (ctx, foodField, elapsedS) => {
  foodField.forEach((patch, index) => {
    const wobble = elapsedS * PARAMS.FOOD_PATCH_DRIFT_PX_S * 0.1 + patch.phase;
    const patchX = patch.anchorX + Math.cos(wobble + index) * patch.orbitX;
    const patchY =
      patch.anchorY + Math.sin(wobble * 0.87 + index) * patch.orbitY;
    const radius = patch.radius;
    const biomass = clamp(patch.biomass ?? 1, 0, 1);

    const gradient = ctx.createRadialGradient(
      patchX,
      patchY,
      0,
      patchX,
      patchY,
      radius,
    );
    gradient.addColorStop(
      0,
      `rgba(${PARAMS.RENDER_FOOD_COLOR}, ${PARAMS.RENDER_FOOD_ALPHA * biomass})`,
    );
    gradient.addColorStop(1, `rgba(${PARAMS.RENDER_FOOD_COLOR}, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(patchX, patchY, radius, 0, Math.PI * 2);
    ctx.fill();
  });
};

const pseudoRandom = (seed) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

const drawMarineSnow = (ctx, width, height, elapsedS, timeFlags) => {
  const alphaScale = lerp(1.15, 0.55, timeFlags.daylightStrength);
  ctx.save();
  ctx.fillStyle = `rgba(236, 248, 242, ${PARAMS.MARINE_SNOW_ALPHA * alphaScale})`;

  for (let index = 0; index < PARAMS.MARINE_SNOW_PARTICLE_COUNT; index += 1) {
    const seed = index + 1;
    const xBase = pseudoRandom(seed * 3.1) * width;
    const fallOffset =
      (elapsedS *
        PARAMS.MARINE_SNOW_SINK_PX_S *
        (0.55 + pseudoRandom(seed * 4.7)) +
        pseudoRandom(seed * 9.4) * height) %
      (height + 80);
    const sway =
      Math.sin(elapsedS * (0.18 + pseudoRandom(seed * 2.3) * 0.24) + seed) *
      (8 + pseudoRandom(seed * 6.9) * 18);
    const radius = 0.6 + pseudoRandom(seed * 8.2) * 1.4;

    ctx.beginPath();
    ctx.arc(xBase + sway, fallOffset - 40, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

const isVisibleBioluminescenceActive = (agent) =>
  (agent.bioluminescence ?? 0) > PARAMS.BIOLUM_BASE_ALPHA;

const drawBioluminescence = (ctx, renderedAgents, glowSprites) => {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  renderedAgents.forEach(({ agent, sprite, drawWidth, drawHeight, drawY }) => {
    const pulse = agent.bioluminescence ?? 0;
    if (!isVisibleBioluminescenceActive(agent)) {
      return;
    }

    const isPanic = agent.mode === "panic_split";
    const isFeeding = agent.mode === "feeding";
    const isCondensed = agent.mode === "condensed_swarm";
    const baseGlow =
      PARAMS.BIOLUM_BASE_ALPHA * (0.38 + agent.localDensity * 0.52);
    const glow =
      Math.max(0.03, baseGlow) + PARAMS.BIOLUM_PREDATOR_ALPHA * 0.86 * pulse;

    if (glow <= 0.003) {
      return;
    }

    const isFrontFrame = sprite.frame?.x === 1;
    const offsetX =
      drawWidth *
      (isFrontFrame
        ? PARAMS.BIOLUM_FRONT_OFFSET_X_RATIO
        : PARAMS.BIOLUM_SIDE_OFFSET_X_RATIO) *
      (sprite.flipX || 1);
    const offsetY =
      drawHeight *
      (isFrontFrame
        ? PARAMS.BIOLUM_FRONT_OFFSET_Y_RATIO
        : PARAMS.BIOLUM_SIDE_OFFSET_Y_RATIO);
    const rotation = sprite.rotation || 0;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const glowX = agent.x + offsetX * cos - offsetY * sin;
    const glowY = drawY + offsetX * sin + offsetY * cos;
    const radius = Math.max(
      2.2,
      drawWidth *
        lerp(PARAMS.BIOLUM_RADIUS_RATIO, PARAMS.BIOLUM_PANIC_RADIUS_RATIO, pulse),
    );
    const glowKey =
      isPanic
        ? "panic"
        : isFeeding
          ? "feeding"
          : isCondensed
            ? "condensed"
            : "ambient";
    const glowSprite = glowSprites?.[glowKey];

    if (glowSprite) {
      ctx.globalAlpha = Math.min(glow, 0.95);
      ctx.drawImage(
        glowSprite,
        glowX - radius,
        glowY - radius,
        radius * 2,
        radius * 2,
      );
      ctx.globalAlpha = 1;
    }
  });
  ctx.restore();
};

const createBrightnessFrameCanvases = (frameCanvases, frameSize, grid, brightness) => {
  const frames = new Map();
  const frameWidth = Math.round(frameSize.width);
  const frameHeight = Math.round(frameSize.height);

  if (!frameCanvases || frameWidth <= 0 || frameHeight <= 0) {
    return frames;
  }

  for (let y = 0; y < grid.rows; y += 1) {
    for (let x = 0; x < grid.columns; x += 1) {
      const sourceFrame = frameCanvases.get(`${x}:${y}`);
      if (!sourceFrame) {
        continue;
      }

      const frameCanvas = document.createElement("canvas");
      frameCanvas.width = frameWidth;
      frameCanvas.height = frameHeight;
      const context = frameCanvas.getContext("2d");

      if (context) {
        context.clearRect(0, 0, frameWidth, frameHeight);
        context.filter = `brightness(${brightness.toFixed(3)})`;
        context.drawImage(sourceFrame, 0, 0, frameWidth, frameHeight);
        context.filter = "none";
      }

      frames.set(`${x}:${y}`, frameCanvas);
    }
  }

  return frames;
};

const createKrillSpriteFrameVariants = (source, frameCanvases, frameSize) => {
  const grid = resolveAtlasGrid(ATLAS, {
    width: source.width,
    height: source.height,
  });
  return {
    day: frameCanvases,
    twilight: createBrightnessFrameCanvases(
      frameCanvases,
      frameSize,
      grid,
      getSpriteBrightnessForLightKey("twilight"),
    ),
    night: createBrightnessFrameCanvases(
      frameCanvases,
      frameSize,
      grid,
      getSpriteBrightnessForLightKey("night"),
    ),
  };
};

const createEmissiveFrameCanvases = (frameCanvases, frameSize) => {
  const frames = new Map();
  const frameWidth = Math.round(frameSize.width);
  const frameHeight = Math.round(frameSize.height);

  if (!frameCanvases || frameWidth <= 0 || frameHeight <= 0) {
    return frames;
  }

  frameCanvases.forEach((sourceFrame, key) => {
    const frameCanvas = document.createElement("canvas");
    frameCanvas.width = frameWidth;
    frameCanvas.height = frameHeight;
    const context = frameCanvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      return;
    }

    context.clearRect(0, 0, frameWidth, frameHeight);
    context.drawImage(sourceFrame, 0, 0, frameWidth, frameHeight);

    const imageData = context.getImageData(0, 0, frameWidth, frameHeight);
    const pixels = imageData.data;

    for (let index = 0; index < pixels.length; index += 4) {
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const alpha = pixels[index + 3];
      const isPhotophore = alpha > 0 && red > 180 && green > 160 && blue < 100;

      if (!isPhotophore) {
        pixels[index + 3] = 0;
      }
    }

    context.clearRect(0, 0, frameWidth, frameHeight);
    context.putImageData(imageData, 0, 0);
    frames.set(key, frameCanvas);
  });

  return frames;
};

const createGlowSprite = ({ core, mid }) => {
  const size = 64;
  const radius = size * 0.5;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
  gradient.addColorStop(0, `${core} 0.95)`);
  gradient.addColorStop(0.28, `${core} 0.59)`);
  gradient.addColorStop(0.56, `${mid} 0.42)`);
  gradient.addColorStop(1, `${mid} 0)`);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(radius, radius, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `${core} 0.95)`;
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.22, 0, Math.PI * 2);
  ctx.fill();
  return canvas;
};

const createKrillGlowSprites = () => ({
  panic: createGlowSprite({
    core: "rgba(235, 252, 255,",
    mid: "rgba(0, 191, 255,",
  }),
  feeding: createGlowSprite({
    core: "rgba(99, 242, 185,",
    mid: "rgba(32, 160, 100,",
  }),
  condensed: createGlowSprite({
    core: "rgba(72, 115, 242,",
    mid: "rgba(10, 42, 195,",
  }),
  ambient: createGlowSprite({
    core: "rgba(111, 229, 242,",
    mid: "rgba(72, 186, 218,",
  }),
});

// 플레이스홀더 앱
export function App({ controls, onGpuErrorChange, isPaused = false }) {
  const canvasRef = React.useRef(null);
  const imageRef = React.useRef(null);
  const rasterCanvasRef = React.useRef(null);
  const frameCanvasesRef = React.useRef(null);
  const frameVariantsRef = React.useRef(null);
  const emissiveFrameCanvasesRef = React.useRef(null);
  const glowSpritesRef = React.useRef(null);
  const animationFrameRef = React.useRef(0);
  const agentsRef = React.useRef([]);
  const foodFieldRef = React.useRef([]);
  const pointerRef = React.useRef({ active: false, x: 0, y: 0 });
  const frameSizeRef = React.useRef(
    resolveAtlasFrameSize(ATLAS, { width: 64, height: 64 }),
  );
  const lastTimeRef = React.useRef(0);
  const elapsedTimeRef = React.useRef(0);
  const phaseTransitionRef = React.useRef({
    from: PARAMS.DEFAULT_LIGHT_PHASE,
    to: PARAMS.DEFAULT_LIGHT_PHASE,
    startedAt: -Infinity,
  });
  const behaviorConfig = React.useMemo(
    () => resolveBehaviorConfig(controls || DEFAULT_CONTROL_STATE),
    [controls],
  );

  React.useEffect(() => {
    onGpuErrorChange?.("");
  }, [onGpuErrorChange]);

  React.useEffect(() => {
    const currentTransition = phaseTransitionRef.current;
    if (currentTransition.to === behaviorConfig.lightPhase) {
      return;
    }

    phaseTransitionRef.current = {
      from: currentTransition.to,
      to: behaviorConfig.lightPhase,
      startedAt: window.performance.now() * 0.001,
    };
  }, [behaviorConfig.lightPhase]);

  // 이미지 로드
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
        frameVariantsRef.current = createKrillSpriteFrameVariants(
          canvas || image,
          frameCanvases,
          frameSize,
        );
        emissiveFrameCanvasesRef.current = createEmissiveFrameCanvases(
          frameCanvases,
          frameSize,
        );
        glowSpritesRef.current = createKrillGlowSprites();
      },
    );

    return () => {
      cancelled = true;
      frameCanvasesRef.current = null;
      frameVariantsRef.current = null;
      emissiveFrameCanvasesRef.current = null;
      glowSpritesRef.current = null;
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

    const resetSimulation = (width, height) => {
      agentsRef.current = createAgents(behaviorConfig.count, width, height);
      foodFieldRef.current = createFoodField(width, height);
      elapsedTimeRef.current = 0;
      lastTimeRef.current = 0;
    };

    const updatePointer = (event, active = true) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = {
        active,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const placeFoodFromEvent = (event) => {
      if (behaviorConfig.interactionMode !== "food") {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      foodFieldRef.current = addUserFoodPatch(
        foodFieldRef.current,
        event.clientX - rect.left,
        event.clientY - rect.top,
        canvas.clientWidth || window.innerWidth,
        canvas.clientHeight || window.innerHeight,
      );
    };

    const handlePointerMove = (event) => {
      updatePointer(event, behaviorConfig.interactionMode === "predator");
      if (event.buttons === 1) {
        placeFoodFromEvent(event);
      }
    };

    const handlePointerDown = (event) => {
      if (event.button !== 0) {
        return;
      }
      updatePointer(event, behaviorConfig.interactionMode === "predator");
      placeFoodFromEvent(event);
    };

    const handlePointerLeave = () => {
      pointerRef.current = { ...pointerRef.current, active: false };
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    canvas.addEventListener("pointercancel", handlePointerLeave);

    const render = (timestamp) => {
      const now = timestamp * 0.001;
      const dt = lastTimeRef.current
        ? Math.min(now - lastTimeRef.current, PARAMS.TIME_STEP_MAX)
        : 0.016;
      lastTimeRef.current = now;

      const size = syncCanvasSize(canvas, ctx);

      if (agentsRef.current.length === 0 || foodFieldRef.current.length === 0) {
        resetSimulation(size.width, size.height);
      }

      ensureAgents(agentsRef, behaviorConfig, size.width, size.height);

      clearTransparentCanvas2d(ctx, size.width, size.height);
      const renderTimeFlags = resolvePhaseFlags(
        behaviorConfig.lightPhase,
        phaseTransitionRef.current,
        now,
      );
      drawMarineSnow(
        ctx,
        size.width,
        size.height,
        elapsedTimeRef.current,
        renderTimeFlags,
      );
      drawFoodField(ctx, foodFieldRef.current, elapsedTimeRef.current);

      if (!isPaused) {
        elapsedTimeRef.current += dt;
        const context = {
          dt,
          width: size.width,
          height: size.height,
          elapsedS: elapsedTimeRef.current,
          timeFlags: renderTimeFlags,
          foodField: foodFieldRef.current,
          config: behaviorConfig,
          swarmCenter: calculateSwarmCenter(agentsRef.current),
          predatorPointer:
            behaviorConfig.interactionMode === "predator"
              ? pointerRef.current
              : null,
        };

        agentsRef.current.forEach((agent, index) => {
          advanceAgent(agent, index, agentsRef.current, context);
        });
      }

      const image = rasterCanvasRef.current || imageRef.current;
      const frameSize = frameSizeRef.current;
      const renderedAgents = [];

      if (image) {
        const lightLevelKey = getLightLevelKey(renderTimeFlags.phaseLightStrength);
        const spriteFrameCanvases =
          frameVariantsRef.current?.[lightLevelKey] || frameCanvasesRef.current;
        const emissiveFrameCanvases =
          lightLevelKey === "day" ? null : emissiveFrameCanvasesRef.current;
        agentsRef.current.forEach((agent, index) => {
          const sprite = resolveCanvasAtlasSprite(ATLAS, {
            space: agent.spriteSpace || "2d",
            position: agent.spritePosition || { x: agent.x, y: agent.y },
            velocity: agent.spriteVelocity || { x: agent.vx, y: agent.vy },
            previousScreenPosition: agent.previousScreenPosition,
            maxDt: dt,
            width: size.width,
            height: size.height,
            state: agent.spriteState,
            profile: agent.spriteProfile || "simulation",
            timestampMs: now * 1000,
            animationOffsetMs: agent.stageOffset,
          });

          const bobAmplitude = agent.isParachuting ? 1.25 : 3.4;
          const bobRate = agent.isParachuting ? 0.8 : 2.1;
          const bobOffset =
            Math.sin(now * bobRate + index * 0.55) * bobAmplitude;
          const drawWidth = agent.renderWidth;
          const drawHeight = agent.renderHeight;
          const drawY = agent.y + bobOffset;
          agent.previousScreenPosition = sprite.pose.screenPosition;

          ctx.save();
          ctx.translate(agent.x, drawY);
          ctx.rotate(sprite.rotation);
          ctx.scale(sprite.flipX, 1);
          drawAtlasFrame(ctx, {
            image,
            frameCanvases: spriteFrameCanvases,
            frame: sprite.frame,
            frameSize,
            dx: -drawWidth * 0.5,
            dy: -drawHeight * 0.5,
            dWidth: drawWidth,
            dHeight: drawHeight,
          });
          if (
            emissiveFrameCanvases &&
            isVisibleBioluminescenceActive(agent)
          ) {
            drawAtlasFrame(ctx, {
              image,
              frameCanvases: emissiveFrameCanvases,
              frame: sprite.frame,
              frameSize,
              dx: -drawWidth * 0.5,
              dy: -drawHeight * 0.5,
              dWidth: drawWidth,
              dHeight: drawHeight,
            });
          }
          ctx.restore();

          renderedAgents.push({
            agent,
            sprite,
            drawWidth,
            drawHeight,
            drawY,
          });
        });
      }

      drawBioluminescence(
        ctx,
        renderedAgents,
        glowSpritesRef.current,
      );

      animationFrameRef.current = window.requestAnimationFrame(render);
    };

    animationFrameRef.current = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("pointercancel", handlePointerLeave);
    };
  }, [behaviorConfig, isPaused]);

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
  INTERACTION_MODE:
    rawControls.INTERACTION_MODE === "food" ? "food" : "predator",
  COUNT: clamp(
    Math.round(numberOrDefault(rawControls.COUNT, DEFAULT_CONTROL_STATE.COUNT)),
    getControlField("COUNT")?.min,
    getControlField("COUNT")?.max,
  ),
  LIGHT_PHASE: normalizeLightPhase(
    rawControls.LIGHT_PHASE,
    rawControls.CURRENT_HOUR ?? rawControls.START_HOUR,
  ),
  FOOD_ABUNDANCE: clamp(
    numberOrDefault(
      rawControls.FOOD_ABUNDANCE,
      DEFAULT_CONTROL_STATE.FOOD_ABUNDANCE,
    ),
    getControlField("FOOD_ABUNDANCE")?.min,
    getControlField("FOOD_ABUNDANCE")?.max,
  ),
  DENSITY_SURGE: clamp(
    numberOrDefault(
      rawControls.DENSITY_SURGE,
      DEFAULT_CONTROL_STATE.DENSITY_SURGE,
    ),
    getControlField("DENSITY_SURGE")?.min,
    getControlField("DENSITY_SURGE")?.max,
  ),
  NIGHT_COHESION: clamp(
    numberOrDefault(
      rawControls.NIGHT_COHESION,
      DEFAULT_CONTROL_STATE.NIGHT_COHESION,
    ),
    getControlField("NIGHT_COHESION")?.min,
    getControlField("NIGHT_COHESION")?.max,
  ),
});

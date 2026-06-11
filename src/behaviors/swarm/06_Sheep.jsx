import React from "react";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { resolveAtlasFrameSize } from "../../utils/spriteAtlas";
import { resolveCanvasAtlasSprite } from "../../utils/spritePose";
import {
  applyTransparentCanvasStyle,
  clearTransparentCanvas2d,
} from "../../utils/transparentCanvas";

const PARAMS = {
  DEFAULT_COUNT: 96,
  DEFAULT_DOG_ENABLED: true,
  DEFAULT_DOG_AUTO_MODE: true,
  DEFAULT_DOG_PRESSURE: 70,
  DEFAULT_NOISE: 50,
  PIXELS_PER_METER: 14,
  SIMULATION_TIME_SCALE: 2.4,
  WALK_SPEED_MPS: 0.15,
  RUN_SPEED_MPS: 1.3,
  PANIC_RUN_SPEED_MPS: 1.5,
  THREAT_WALK_SPEED_MPS: 0.45,
  MAX_ESCAPE_SPEED_MPS: 1.5,
  DOG_SPEED_RESPONSE_EXPONENT: 0.58,
  DOG_SPEED_MPS: 2.0,
  DOG_REPULSION_RANGE_M: 12,
  DOG_BEHIND_DISTANCE_MIN_M: 3,
  DOG_BEHIND_DISTANCE_MAX_M: 5,
  DOG_ZIGZAG_AMPLITUDE_M: 3.2,
  DOG_ZIGZAG_RATE: 1.35,
  DOG_BUBBLE_RADIUS_M: 15,
  DOG_DRIVE_CAPTURE_RADIUS_M: 5,
  DOG_ENVELOPE_TANGENT_WEIGHT: 2.4,
  DOG_BUBBLE_REPULSION_WEIGHT: 0.3,
  DOG_OUTRUN_SWITCH_EPSILON: 0.035,
  DOG_OUTRUN_SIDE_HOLD_SEC: 0.9,
  DOG_STANDBY_RADIUS_M: 10,
  DOG_STANDBY_OFFSET_M: 15,
  DOG_STANDBY_SPEED_SCALE: 0.42,
  DOG_STANDBY_ORBIT_M: 1.8,
  DOG_CLOSE_APPROACH_DISTANCE_M: 1.6,
  DOG_CLOSE_APPROACH_SPEED_MPS: 0.05,
  DOG_COLLECT_SEPARATION_M: 20,
  BODY_LENGTH_M: 1.2,
  NEIGHBOR_COUNT: 10,
  ATTRACTION_SAMPLE_COUNT: 5,
  ALIGNMENT_SAMPLE_COUNT: 1,
  REPULSION_RADIUS_M: 1.2,
  HARD_COLLISION_RADIUS_M: 0.95,
  INTERACTION_RADIUS_M: 18,
  REGROUP_DISTANCE_M: 31.6,
  REGROUP_EXPONENT: 4,
  SOCIAL_INERTIA: 0.5,
  NOISE_WEIGHT: 0.5,
  REPULSION_WEIGHT: 2.6,
  HARD_COLLISION_WEIGHT: 6.5,
  ATTRACTION_WEIGHT: 1.5,
  ALIGNMENT_WEIGHT: 1.3,
  DOG_WEIGHT: 1,
  SELFISH_HERD_WEIGHT: 1.1,
  RUN_GROUP_PULL: 1.8,
  CALM_ATTRACTION_WEIGHT: 0.42,
  CALM_ALIGNMENT_WEIGHT: 0.5,
  CALM_LINE_FOLLOW_WEIGHT: 0.4,
  CALM_SURFACE_TENSION_WEIGHT: 0.035,
  CALM_REGROUP_WEIGHT: 0.12,
  DOG_SCATTER_WEIGHT: 2.4,
  DOG_SCATTER_INVERSE_RADIUS_M: 3.2,
  DOG_INNER_PANIC_RATIO: 0.72,
  PULSE_START_FRONT_WEIGHT: 1,
  PULSE_START_SIDE_WEIGHT: 0.12,
  PULSE_STOP_BACK_WEIGHT: 1,
  PULSE_STOP_SIDE_WEIGHT: 0.1,
  WALK_TO_START_TAU_SEC: 35,
  WALK_TO_STOP_TAU_SEC: 8,
  RUN_RECOVERY_TAU_SEC: 4.5,
  MIMICRY_ALPHA: 15,
  REGROUP_ALPHA: 15,
  REGROUP_DELTA: 4,
  BOUNDARY_MARGIN_M: 2.4,
  REENTRY_MARGIN_M: 1.8,
  REENTRY_SETTLE_SEC: 0.8,
  REENTRY_RETURN_SPEED_MPS: 0.5,
  REENTRY_RETURN_WEIGHT: 3.8,
  REENTRY_SOCIAL_SCALE: 0.38,
  REENTRY_TARGET_INSET_RATIO: 0.2,
  CALM_MOTION_DURATION_MIN_SEC: 9,
  CALM_MOTION_DURATION_MAX_SEC: 18,
  CALM_GRAZE_PAUSE_MIN_SEC: 8,
  CALM_GRAZE_PAUSE_MAX_SEC: 16,
  CALM_MOTION_START_MOVING_RATIO: 0.08,
  CALM_MOTION_WALK_BOOST: 4.2,
  CALM_MOTION_STOP_SUPPRESSION: 0.2,
  CALM_GRAZE_STOP_BOOST: 1.55,
  THREAT_PACKING_SELFISH_MULTIPLIER: 2.6,
  THREAT_PACKING_REGROUP_MULTIPLIER: 2.15,
  THREAT_SOFT_REPULSION_SCALE: 0.72,
  THREAT_ATTRACTION_FLOOR: 0.4,
  VELOCITY_BLEND_WALK: 0.14,
  VELOCITY_BLEND_RUN: 0.24,
  VELOCITY_DAMPING_STATIONARY: 0.72,
  GROUP_RADIUS_M: 14,
  SPRITE_HEIGHT_MIN: 14,
  SPRITE_HEIGHT_MAX: 18,
  SPRITE_HEIGHT_RATIO: 0.022,
  BOB_WALK_AMPLITUDE: 2,
  BOB_RUN_AMPLITUDE: 4,
  BOB_RATE: 10,
  SMALL_GROUP_LINE_THRESHOLD: 4,
  LEADER_FOLLOW_FORCE: 2.8,
  FILE_LATERAL_BAND_M: 4.8,
  EDGE_WAVE_EXPOSURE_WEIGHT: 1.2,
  RUN_CHAIN_WEIGHT: 0.85,
  SPONTANEOUS_START_RATE: 0.018,
  SPONTANEOUS_STOP_RATE: 0.05,
  MAX_TURN_RATE_DEG_PER_SEC: 60,
  RELAY_DELAY_MAX_SEC: 1.1,
  RELAY_DELAY_MIN_SEC: 0.08,
  TEMPORAL_LEADER_RESET_SEC: 4.2,
  TEMPORAL_LEADER_JITTER: 0.75,
  MULTI_FILE_ANGLE_DEG: 45,
  MULTI_FILE_LATERAL_WEIGHT: 0.7,
  SURFACE_TENSION_WEIGHT: 0.16,
  OBLONG_ALONG_WEIGHT: 0.24,
  OBLONG_LATERAL_WEIGHT: 0.08,
  GRAZE_SWAY_RAD: 0.09,
  GRAZE_SWAY_RATE: 0.9,
};

const SHEEP_STATES = {
  STATIONARY: 0,
  WALKING: 1,
  RUNNING: 2,
};

const CONTROL_FIELDS = [
  {
    key: "COUNT",
    label: "개체 수",
    min: 24,
    max: 480,
    step: 8,
    formatValue: (value) => `${Math.round(value)} 마리`,
  },
  {
    key: "DOG_ENABLED",
    label: "양몰이개 활성화",
    type: "toggle",
    formatValue: (value) => (value ? "ON" : "OFF"),
  },
  {
    key: "DOG_AUTO_MODE",
    label: "개 조종 모드",
    type: "toggle",
    formatValue: (value) => (value ? "자동 (Auto)" : "수동 (Mouse)"),
  },
  {
    key: "DOG_PRESSURE",
    label: "개 압박 강도",
    min: 0,
    max: 100,
    step: 1,
    formatValue: (value) => `${Math.round(value)} %`,
  },
  {
    key: "NOISE",
    label: "무작위성",
    min: 0,
    max: 100,
    step: 1,
    formatValue: (value) => `${Math.round(value)} %`,
  },
];

const DEFAULT_CONTROL_STATE = {
  COUNT: PARAMS.DEFAULT_COUNT,
  DOG_ENABLED: PARAMS.DEFAULT_DOG_ENABLED,
  DOG_AUTO_MODE: PARAMS.DEFAULT_DOG_AUTO_MODE,
  DOG_PRESSURE: PARAMS.DEFAULT_DOG_PRESSURE,
  NOISE: PARAMS.DEFAULT_NOISE,
};

const ATLAS = HOME_SPRITE_ATLASES.sheep;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const randomBetween = (min, max) => min + Math.random() * (max - min);
const lerp = (start, end, amount) => start + (end - start) * amount;

const normalize2D = (x, y, fallback = { x: 1, y: 0 }) => {
  const length = Math.hypot(x, y);
  if (length < 1e-6) {
    return { ...fallback };
  }

  return { x: x / length, y: y / length };
};

const dot2D = (ax, ay, bx, by) => ax * bx + ay * by;

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

const rotateTowardAngle = (currentAngle, targetAngle, maxDelta) => {
  const delta = wrapAngle(targetAngle - currentAngle);
  if (Math.abs(delta) <= maxDelta) {
    return targetAngle;
  }
  return currentAngle + Math.sign(delta) * maxDelta;
};

const pseudoRandom = (seed, salt) => {
  const value = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

const resolveSpriteHeight = (width, height) =>
  clamp(
    Math.min(width, height) * PARAMS.SPRITE_HEIGHT_RATIO,
    PARAMS.SPRITE_HEIGHT_MIN,
    PARAMS.SPRITE_HEIGHT_MAX,
  );

const resolveStateSpeedPx = (state) => {
  const baseScale = PARAMS.PIXELS_PER_METER * PARAMS.SIMULATION_TIME_SCALE;
  switch (state) {
    case SHEEP_STATES.RUNNING:
      return PARAMS.RUN_SPEED_MPS * baseScale;
    case SHEEP_STATES.WALKING:
      return PARAMS.WALK_SPEED_MPS * baseScale;
    case SHEEP_STATES.STATIONARY:
    default:
      return 0;
  }
};

const resolveDogTarget = (width, height) => ({
  x: width * 0.5,
  y: height * 0.5,
});

const applyAgentReentry = (agent, width, height, marginPx) => {
  let didReenter = false;

  if (agent.x < -marginPx) {
    agent.x = -marginPx * 0.65;
    agent.vx = Math.abs(agent.vx);
    didReenter = true;
  } else if (agent.x > width + marginPx) {
    agent.x = width + marginPx * 0.65;
    agent.vx = -Math.abs(agent.vx);
    didReenter = true;
  }

  if (agent.y < -marginPx) {
    agent.y = -marginPx * 0.65;
    agent.vy = Math.abs(agent.vy);
    didReenter = true;
  } else if (agent.y > height + marginPx) {
    agent.y = height + marginPx * 0.65;
    agent.vy = -Math.abs(agent.vy);
    didReenter = true;
  }

  if (didReenter) {
    agent.previousScreenPosition = null;
    agent.reentryAssistTimer = PARAMS.REENTRY_SETTLE_SEC;
  }
};

const getCanvasRelativePoint = (canvas, clientX, clientY) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: clamp(clientX - rect.left, 0, rect.width),
    y: clamp(clientY - rect.top, 0, rect.height),
  };
};

const createAgent = (index, width, height) => {
  const radiusPx = PARAMS.GROUP_RADIUS_M * PARAMS.PIXELS_PER_METER;
  const angle = randomBetween(0, Math.PI * 2);
  const radial = Math.sqrt((index + 0.5) / Math.max(PARAMS.DEFAULT_COUNT, 1));
  const centerX = width * 0.45;
  const centerY = height * 0.55;
  const x = centerX + Math.cos(angle) * radiusPx * radial + randomBetween(-16, 16);
  const y = centerY + Math.sin(angle) * radiusPx * radial * 0.82 + randomBetween(-14, 14);
  const heading = randomBetween(0, Math.PI * 2);
  const initialState = Math.random() < 0.62 ? SHEEP_STATES.STATIONARY : SHEEP_STATES.WALKING;
  const speed = resolveStateSpeedPx(initialState) * randomBetween(0.85, 1.15);

  return {
    id: index + 1,
    x,
    y,
    vx: Math.cos(heading) * speed,
    vy: Math.sin(heading) * speed,
    ax: 0,
    ay: 0,
    heading,
    state: initialState,
    stageOffset: randomBetween(0, 1000),
    previousScreenPosition: null,
    spriteProfile: "simulation",
    spriteSpace: "2d",
    spriteState: undefined,
    bobOffset: randomBetween(0, Math.PI * 2),
    socialSelectionPhase: randomBetween(0, 1000),
    socialSelectionTimer: randomBetween(0.35, 0.95),
    lineRank: index,
    pendingState: null,
    relayDelayTimer: 0,
    grazePhase: randomBetween(0, Math.PI * 2),
    reentryAssistTimer: 0,
  };
};

const createAgents = (count, width, height) =>
  Array.from({ length: count }, (_, index) => createAgent(index, width, height));

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

export function App({ controls, onGpuErrorChange, isPaused = false }) {
  const canvasRef = React.useRef(null);
  const imageRef = React.useRef(null);
  const rasterCanvasRef = React.useRef(null);
  const animationFrameRef = React.useRef(0);
  const agentsRef = React.useRef([]);
  const dogRef = React.useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    outrunSide: 1,
    outrunHoldTimer: 0,
  });
  const pointerDogRef = React.useRef({ x: 0, y: 0, active: false });
  const pulseRef = React.useRef({
    id: 1,
    leaderId: null,
    lastRunningCount: 0,
    lastMovingCount: 0,
    calmLeaderTimer: 0,
    calmMotionActive: false,
    calmMotionTimer: 0,
    calmMotionDurationSec: randomBetween(
      PARAMS.CALM_MOTION_DURATION_MIN_SEC,
      PARAMS.CALM_MOTION_DURATION_MAX_SEC,
    ),
    calmPauseTimer: 0,
    calmPauseTargetSec: randomBetween(
      PARAMS.CALM_GRAZE_PAUSE_MIN_SEC,
      PARAMS.CALM_GRAZE_PAUSE_MAX_SEC,
    ),
  });
  const simulationTimeRef = React.useRef(0);
  const frameSizeRef = React.useRef(
    resolveAtlasFrameSize(ATLAS, { width: 64, height: 64 }),
  );
  const lastTimeRef = React.useRef(0);

  React.useEffect(() => {
    onGpuErrorChange?.("");
  }, [onGpuErrorChange]);

  // 이미지 로드
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

    const handlePointerMove = (event) => {
      pointerDogRef.current = {
        ...getCanvasRelativePoint(canvas, event.clientX, event.clientY),
        active: true,
      };
    };

    const handlePointerLeave = () => {
      pointerDogRef.current = {
        ...pointerDogRef.current,
        active: false,
      };
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
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

    const ensureAgents = (width, height, count) => {
      if (agentsRef.current.length === 0) {
        agentsRef.current = createAgents(count, width, height);
        dogRef.current = {
          x: width * 0.2,
          y: height * 0.5,
          vx: 0,
          vy: 0,
          outrunSide: 1,
          outrunHoldTimer: 0,
        };
        return;
      }

      if (agentsRef.current.length < count) {
        const nextAgents = createAgents(
          count - agentsRef.current.length,
          width,
          height,
        );
        agentsRef.current = [...agentsRef.current, ...nextAgents];
      } else if (agentsRef.current.length > count) {
        agentsRef.current = agentsRef.current.slice(0, count);
      }

      agentsRef.current.forEach((agent) => {
        const marginPx = PARAMS.REENTRY_MARGIN_M * PARAMS.PIXELS_PER_METER;
        agent.x = clamp(agent.x, -marginPx, width + marginPx);
        agent.y = clamp(agent.y, -marginPx, height + marginPx);
      });
    };

    const render = (timestamp) => {
      const now = timestamp * 0.001;
      const dt = lastTimeRef.current
        ? Math.min(now - lastTimeRef.current, 0.05)
        : 0.016;
      lastTimeRef.current = now;
      simulationTimeRef.current += dt * PARAMS.SIMULATION_TIME_SCALE;
      const simTime = simulationTimeRef.current;

      const count = clamp(
        Math.round(controls?.COUNT ?? DEFAULT_CONTROL_STATE.COUNT),
        24,
        480,
      );
      const dogEnabled = Boolean(
        controls?.DOG_ENABLED ?? DEFAULT_CONTROL_STATE.DOG_ENABLED,
      );
      const dogAutoMode = Boolean(
        controls?.DOG_AUTO_MODE ?? DEFAULT_CONTROL_STATE.DOG_AUTO_MODE,
      );
      const dogPressure = clamp(
        Number(controls?.DOG_PRESSURE ?? DEFAULT_CONTROL_STATE.DOG_PRESSURE) / 100,
        0,
        1,
      );
      const noiseScale = clamp(
        Number(controls?.NOISE ?? DEFAULT_CONTROL_STATE.NOISE) / 100,
        0,
        1,
      );
      const stepDt = dt * PARAMS.SIMULATION_TIME_SCALE;

      const size = syncCanvasSize(canvas, ctx);
      ensureAgents(size.width, size.height, count);

      const spriteHeight = resolveSpriteHeight(size.width, size.height);
      const reentryMarginPx = PARAMS.REENTRY_MARGIN_M * PARAMS.PIXELS_PER_METER;
      const repulsionRadiusPxBase = PARAMS.REPULSION_RADIUS_M * PARAMS.PIXELS_PER_METER;
      const interactionRadiusPx = PARAMS.INTERACTION_RADIUS_M * PARAMS.PIXELS_PER_METER;
      const regroupDistancePx = PARAMS.REGROUP_DISTANCE_M * PARAMS.PIXELS_PER_METER;
      const dogRangePx = PARAMS.DOG_REPULSION_RANGE_M * PARAMS.PIXELS_PER_METER;

      clearTransparentCanvas2d(ctx, size.width, size.height);

      const image = rasterCanvasRef.current || imageRef.current;
      const frameSize = frameSizeRef.current;
      const spriteAspectRatio = frameSize.height > 0
        ? frameSize.width / frameSize.height
        : 1;
      const spriteWidth = spriteHeight * spriteAspectRatio;
      const hardCollisionRadiusPx = clamp(
        Math.min(spriteWidth, spriteHeight) * 0.9,
        spriteHeight * 0.72,
        spriteHeight,
      );
      const repulsionRadiusPx = Math.max(
        repulsionRadiusPxBase,
        hardCollisionRadiusPx * 1.08,
      );

      const centroid = agentsRef.current.reduce(
        (accumulator, agent) => {
          accumulator.x += agent.x;
          accumulator.y += agent.y;
          return accumulator;
        },
        { x: 0, y: 0 },
      );
      centroid.x /= Math.max(agentsRef.current.length, 1);
      centroid.y /= Math.max(agentsRef.current.length, 1);
      const movingAgents = agentsRef.current.filter(
        (agent) => agent.state !== SHEEP_STATES.STATIONARY,
      );
      const movingCount = movingAgents.length;
      const runningCount = agentsRef.current.filter(
        (agent) => agent.state === SHEEP_STATES.RUNNING,
      ).length;
      if (pulseRef.current.lastMovingCount === 0 && movingCount > 0) {
        pulseRef.current.id += 1;
        pulseRef.current.leaderId =
          movingAgents[Math.floor(Math.random() * movingAgents.length)]?.id ?? null;
        pulseRef.current.calmLeaderTimer = 0;
      }
      if (pulseRef.current.lastRunningCount === 0 && runningCount > 0) {
        pulseRef.current.id += 1;
        pulseRef.current.calmLeaderTimer = 0;
      } else if (runningCount === 0) {
        pulseRef.current.calmLeaderTimer += stepDt;
        if (pulseRef.current.calmLeaderTimer >= PARAMS.TEMPORAL_LEADER_RESET_SEC) {
          pulseRef.current.id += 1;
          pulseRef.current.leaderId = null;
          pulseRef.current.calmLeaderTimer = 0;
        }
      } else {
        pulseRef.current.calmLeaderTimer = 0;
      }
      pulseRef.current.lastMovingCount = movingCount;
      pulseRef.current.lastRunningCount = runningCount;

      const headingAccumulator = agentsRef.current.reduce(
        (accumulator, agent) => {
          const direction = normalize2D(agent.vx, agent.vy, {
            x: Math.cos(agent.heading),
            y: Math.sin(agent.heading),
          });
          accumulator.x += direction.x;
          accumulator.y += direction.y;
          return accumulator;
        },
        { x: 0, y: 0 },
      );
      const meanHeading = normalize2D(
        headingAccumulator.x,
        headingAccumulator.y,
        { x: 1, y: 0 },
      );
      const flockRadiusPx = Math.max(
        ...agentsRef.current.map((agent) => Math.hypot(agent.x - centroid.x, agent.y - centroid.y)),
        spriteHeight,
      );
      const farthestSheep = agentsRef.current.reduce(
        (farthest, agent) => {
          const distance = Math.hypot(agent.x - centroid.x, agent.y - centroid.y);
          if (!farthest || distance > farthest.distance) {
            return { agent, distance };
          }
          return farthest;
        },
        null,
      );

      const dogGoal = resolveDogTarget(size.width, size.height);
      const pointerDog = pointerDogRef.current;
      if (dogEnabled) {
        if (!dogAutoMode) {
          if (pointerDog.active) {
            dogRef.current.vx = (pointerDog.x - dogRef.current.x) / Math.max(dt, 1e-3);
            dogRef.current.vy = (pointerDog.y - dogRef.current.y) / Math.max(dt, 1e-3);
            dogRef.current.x = pointerDog.x;
            dogRef.current.y = pointerDog.y;
          } else {
            dogRef.current.vx *= 0.84;
            dogRef.current.vy *= 0.84;
            dogRef.current.x += dogRef.current.vx * dt;
            dogRef.current.y += dogRef.current.vy * dt;
            applyAgentReentry(dogRef.current, size.width, size.height, reentryMarginPx);
          }
        } else {
          const collectSeparationPx =
            PARAMS.DOG_COLLECT_SEPARATION_M * PARAMS.PIXELS_PER_METER;
          const isCollecting = (farthestSheep?.distance ?? 0) > collectSeparationPx;
          const flockRef = isCollecting && farthestSheep
            ? farthestSheep.agent
            : centroid;
          const activeGoal = isCollecting ? centroid : dogGoal;
          const targetDx = activeGoal.x - flockRef.x;
          const targetDy = activeGoal.y - flockRef.y;
          const distanceToTarget = Math.hypot(targetDx, targetDy);
          const standbyRadiusPx = PARAMS.DOG_STANDBY_RADIUS_M * PARAMS.PIXELS_PER_METER;
          const bubbleRadiusPx = Math.max(
            PARAMS.DOG_BUBBLE_RADIUS_M * PARAMS.PIXELS_PER_METER,
            (isCollecting ? spriteHeight * 1.8 : flockRadiusPx) +
              PARAMS.DOG_BEHIND_DISTANCE_MAX_M * PARAMS.PIXELS_PER_METER,
          );
          const driveCaptureRadiusPx =
            PARAMS.DOG_DRIVE_CAPTURE_RADIUS_M * PARAMS.PIXELS_PER_METER;
          const closeApproachDistancePx =
            PARAMS.DOG_CLOSE_APPROACH_DISTANCE_M * PARAMS.PIXELS_PER_METER;
          const nearestSheepDistancePx = Math.min(
            ...agentsRef.current.map((agent) => Math.hypot(agent.x - dogRef.current.x, agent.y - dogRef.current.y)),
          );
          const herdToTarget = normalize2D(
            targetDx,
            targetDy,
            meanHeading,
          );
          const perpendicular = { x: -herdToTarget.y, y: herdToTarget.x };
          const dogCruiseSpeed =
            PARAMS.DOG_SPEED_MPS *
            PARAMS.PIXELS_PER_METER *
            PARAMS.SIMULATION_TIME_SCALE *
            lerp(0.55, 1.1, dogPressure);
          const dogCloseSpeed =
            PARAMS.DOG_CLOSE_APPROACH_SPEED_MPS *
            PARAMS.PIXELS_PER_METER *
            PARAMS.SIMULATION_TIME_SCALE;
          const closeApproachBlend = clamp(
            (nearestSheepDistancePx - closeApproachDistancePx) /
              Math.max(closeApproachDistancePx * 1.4, 1e-3),
            0,
            1,
          );
          const dogSpeed = lerp(dogCloseSpeed, dogCruiseSpeed, closeApproachBlend);

          if (!isCollecting && distanceToTarget <= standbyRadiusPx) {
            const standbyDirection = normalize2D(
              dogRef.current.x - centroid.x,
              dogRef.current.y - centroid.y,
              { x: -herdToTarget.x, y: -herdToTarget.y },
            );
            const orbitDirection = { x: -standbyDirection.y, y: standbyDirection.x };
            const standbyDistancePx =
              flockRadiusPx + PARAMS.DOG_STANDBY_OFFSET_M * PARAMS.PIXELS_PER_METER;
            const standbyOrbitPx =
              Math.sin(simTime * PARAMS.DOG_ZIGZAG_RATE * 0.75) *
              PARAMS.DOG_STANDBY_ORBIT_M *
              PARAMS.PIXELS_PER_METER;
            const standbyX =
              centroid.x + standbyDirection.x * standbyDistancePx + orbitDirection.x * standbyOrbitPx;
            const standbyY =
              centroid.y + standbyDirection.y * standbyDistancePx + orbitDirection.y * standbyOrbitPx;
            const dogDirection = normalize2D(
              standbyX - dogRef.current.x,
              standbyY - dogRef.current.y,
              standbyDirection,
            );
            const standbySpeed = Math.max(
              dogCloseSpeed,
              dogSpeed * PARAMS.DOG_STANDBY_SPEED_SCALE,
            );
            dogRef.current.vx = lerp(dogRef.current.vx, dogDirection.x * standbySpeed, 0.18);
            dogRef.current.vy = lerp(dogRef.current.vy, dogDirection.y * standbySpeed, 0.18);
          } else {
            const desiredBehindDistancePx =
              lerp(
                PARAMS.DOG_BEHIND_DISTANCE_MIN_M,
                PARAMS.DOG_BEHIND_DISTANCE_MAX_M,
                1 - dogPressure * 0.65,
              ) * PARAMS.PIXELS_PER_METER;
            const pDriveX = flockRef.x - herdToTarget.x * desiredBehindDistancePx;
            const pDriveY = flockRef.y - herdToTarget.y * desiredBehindDistancePx;
            const distanceToPDrive = Math.hypot(pDriveX - dogRef.current.x, pDriveY - dogRef.current.y);
            const sweepOffsetPx =
              !isCollecting && distanceToPDrive <= driveCaptureRadiusPx
                ? Math.sin(simTime * PARAMS.DOG_ZIGZAG_RATE) *
                  PARAMS.DOG_ZIGZAG_AMPLITUDE_M *
                  PARAMS.PIXELS_PER_METER
                : 0;
            const targetDogX = pDriveX + perpendicular.x * sweepOffsetPx;
            const targetDogY = pDriveY + perpendicular.y * sweepOffsetPx;
            const toDrive = normalize2D(
              targetDogX - dogRef.current.x,
              targetDogY - dogRef.current.y,
              herdToTarget,
            );
            const centroidToDog = normalize2D(
              dogRef.current.x - flockRef.x,
              dogRef.current.y - flockRef.y,
              { x: -herdToTarget.x, y: -herdToTarget.y },
            );
            const dogToCentroidDistance = Math.hypot(
              dogRef.current.x - flockRef.x,
              dogRef.current.y - flockRef.y,
            ) || 1;
            const bubblePressure = clamp(
              (bubbleRadiusPx - dogToCentroidDistance) / Math.max(bubbleRadiusPx, 1e-3),
              0,
              1,
            );
            const cross = centroidToDog.x * toDrive.y - centroidToDog.y * toDrive.x;
            if (bubblePressure > 0.05) {
              dogRef.current.outrunHoldTimer = Math.max(
                0,
                (dogRef.current.outrunHoldTimer ?? 0) - stepDt,
              );
              if (
                Math.abs(cross) > PARAMS.DOG_OUTRUN_SWITCH_EPSILON &&
                (dogRef.current.outrunHoldTimer ?? 0) <= 0
              ) {
                dogRef.current.outrunSide = cross >= 0 ? 1 : -1;
                dogRef.current.outrunHoldTimer = PARAMS.DOG_OUTRUN_SIDE_HOLD_SEC;
              }
            } else {
              dogRef.current.outrunHoldTimer = 0;
            }
            const tangentialSign = dogRef.current.outrunSide ?? 1;
            const tangent = {
              x: -centroidToDog.y * tangentialSign,
              y: centroidToDog.x * tangentialSign,
            };
            const tangentPressure = clamp(bubblePressure * 1.35 + 0.15, 0, 1.5);
            const dogDirection = normalize2D(
              toDrive.x +
                centroidToDog.x * bubblePressure * PARAMS.DOG_BUBBLE_REPULSION_WEIGHT +
                tangent.x * tangentPressure * PARAMS.DOG_ENVELOPE_TANGENT_WEIGHT,
              toDrive.y +
                centroidToDog.y * bubblePressure * PARAMS.DOG_BUBBLE_REPULSION_WEIGHT +
                tangent.y * tangentPressure * PARAMS.DOG_ENVELOPE_TANGENT_WEIGHT,
              toDrive,
            );
            dogRef.current.vx = dogDirection.x * dogSpeed;
            dogRef.current.vy = dogDirection.y * dogSpeed;
          }

          dogRef.current.x += dogRef.current.vx * dt;
          dogRef.current.y += dogRef.current.vy * dt;
          applyAgentReentry(dogRef.current, size.width, size.height, reentryMarginPx);
        }
      } else {
        dogRef.current.vx = 0;
        dogRef.current.vy = 0;
      }

      const dogToCentroid = normalize2D(
        centroid.x - dogRef.current.x,
        centroid.y - dogRef.current.y,
        meanHeading,
      );
      const centroidDogDistance = Math.hypot(
        centroid.x - dogRef.current.x,
        centroid.y - dogRef.current.y,
      );
      const dogThreatActive =
        dogEnabled &&
        agentsRef.current.some((agent) => {
          const dx = agent.x - dogRef.current.x;
          const dy = agent.y - dogRef.current.y;
          return Math.hypot(dx, dy) <= dogRangePx;
        });
      const calmMovingRatio = movingCount / Math.max(agentsRef.current.length, 1);
      if (!dogThreatActive && runningCount === 0) {
        if (pulseRef.current.calmMotionActive) {
          pulseRef.current.calmMotionTimer += stepDt;
          const leaderStillMoving = movingAgents.some(
            (agent) => agent.id === pulseRef.current.leaderId,
          );
          const motionExpired =
            pulseRef.current.calmMotionTimer >= pulseRef.current.calmMotionDurationSec;
          const motionCollapsed =
            pulseRef.current.calmMotionTimer > PARAMS.CALM_MOTION_DURATION_MIN_SEC * 0.45 &&
            calmMovingRatio < PARAMS.CALM_MOTION_START_MOVING_RATIO * 0.65;
          if (motionExpired || (!leaderStillMoving && motionCollapsed)) {
            pulseRef.current.calmMotionActive = false;
            pulseRef.current.calmMotionTimer = 0;
            pulseRef.current.calmPauseTimer = 0;
            pulseRef.current.calmPauseTargetSec = randomBetween(
              PARAMS.CALM_GRAZE_PAUSE_MIN_SEC,
              PARAMS.CALM_GRAZE_PAUSE_MAX_SEC,
            );
          }
        } else {
          pulseRef.current.calmPauseTimer += stepDt;
          if (
            pulseRef.current.calmPauseTimer >= pulseRef.current.calmPauseTargetSec &&
            calmMovingRatio <= PARAMS.CALM_MOTION_START_MOVING_RATIO
          ) {
            const calmStarterPool = agentsRef.current.filter(
              (agent) => agent.state !== SHEEP_STATES.RUNNING,
            );
            pulseRef.current.id += 1;
            pulseRef.current.leaderId =
              calmStarterPool[Math.floor(Math.random() * calmStarterPool.length)]?.id ?? null;
            pulseRef.current.calmMotionActive = true;
            pulseRef.current.calmMotionTimer = 0;
            pulseRef.current.calmMotionDurationSec = randomBetween(
              PARAMS.CALM_MOTION_DURATION_MIN_SEC,
              PARAMS.CALM_MOTION_DURATION_MAX_SEC,
            );
            pulseRef.current.calmPauseTimer = 0;
          }
        }
      } else {
        pulseRef.current.calmMotionActive = false;
        pulseRef.current.calmMotionTimer = 0;
        pulseRef.current.calmPauseTimer = 0;
      }
      const dogInsideFlock =
        dogThreatActive && centroidDogDistance <= flockRadiusPx * PARAMS.DOG_INNER_PANIC_RATIO;
      const fileAxis = dogThreatActive
        ? dogToCentroid
        : normalize2D(
            dogGoal.x - centroid.x,
            dogGoal.y - centroid.y,
            meanHeading,
          );
      const lateralAxis = { x: -fileAxis.y, y: fileAxis.x };

      const lineOrder = [...agentsRef.current]
        .map((agent, index) => ({ agent, index }))
        .sort((left, right) => {
          const leftProjection = dot2D(
            left.agent.x - centroid.x,
            left.agent.y - centroid.y,
            fileAxis.x,
            fileAxis.y,
          );
          const rightProjection = dot2D(
            right.agent.x - centroid.x,
            right.agent.y - centroid.y,
            fileAxis.x,
            fileAxis.y,
          );
          const leftBias =
            pseudoRandom(left.agent.id, pulseRef.current.id) *
            spriteHeight *
            PARAMS.TEMPORAL_LEADER_JITTER;
          const rightBias =
            pseudoRandom(right.agent.id, pulseRef.current.id) *
            spriteHeight *
            PARAMS.TEMPORAL_LEADER_JITTER;
          const leftLeaderBoost = left.agent.id === pulseRef.current.leaderId ? spriteHeight * 4 : 0;
          const rightLeaderBoost = right.agent.id === pulseRef.current.leaderId ? spriteHeight * 4 : 0;
          return (
            rightProjection +
            rightBias +
            rightLeaderBoost -
            (leftProjection + leftBias + leftLeaderBoost)
          );
        })
        .map((entry) => entry.index);

      lineOrder.forEach((agentIndex, orderIndex) => {
        agentsRef.current[agentIndex].lineRank = orderIndex;
      });

      agentsRef.current.forEach((agent, index) => {
        if (isPaused) {
          return;
        }

        agent.socialSelectionTimer = Math.max(0, agent.socialSelectionTimer - stepDt);
        if (agent.socialSelectionTimer <= 0) {
          agent.socialSelectionPhase = randomBetween(0, 1000);
          agent.socialSelectionTimer = randomBetween(0.45, 1.15);
        }

        const neighbors = [];
        agentsRef.current.forEach((otherAgent, otherIndex) => {
          if (otherIndex === index) {
            return;
          }

          const dx = otherAgent.x - agent.x;
          const dy = otherAgent.y - agent.y;
          const distance = Math.hypot(dx, dy) || 1;
          neighbors.push({
            index: otherIndex,
            agent: otherAgent,
            dx,
            dy,
            distance,
          });
        });

        neighbors.sort((left, right) => left.distance - right.distance);
        const nearestNeighbors = neighbors.slice(0, PARAMS.NEIGHBOR_COUNT);
        const interactionNeighbors = nearestNeighbors.filter(
          (neighbor) => neighbor.distance <= interactionRadiusPx,
        );
        const scopedNeighbors = interactionNeighbors.length > 0
          ? interactionNeighbors
          : nearestNeighbors;

        const hardCollisionNeighbors = nearestNeighbors.filter(
          (neighbor) => neighbor.distance < hardCollisionRadiusPx,
        );
        const hardCollisionPressure = clamp(
          hardCollisionNeighbors.length / Math.max(PARAMS.NEIGHBOR_COUNT * 0.35, 1),
          0,
          1,
        );
        const densePackNeighbors = nearestNeighbors.filter(
          (neighbor) => neighbor.distance < hardCollisionRadiusPx * 1.1,
        ).length;
        const densePackPressure = clamp(densePackNeighbors / 4, 0, 1.6);

        const repulsion = scopedNeighbors.reduce(
          (accumulator, neighbor) => {
            if (neighbor.distance > repulsionRadiusPx) {
              return accumulator;
            }

            if (neighbor.distance < hardCollisionRadiusPx) {
              const push =
                ((hardCollisionRadiusPx - neighbor.distance) /
                  Math.max(hardCollisionRadiusPx, 1e-3)) *
                PARAMS.HARD_COLLISION_WEIGHT;
              accumulator.x -= (neighbor.dx / neighbor.distance) * push;
              accumulator.y -= (neighbor.dy / neighbor.distance) * push;
              return accumulator;
            }

            const push =
              ((repulsionRadiusPx - neighbor.distance) / Math.max(repulsionRadiusPx, 1e-3)) *
              PARAMS.REPULSION_WEIGHT *
              (dogThreatActive
                ? lerp(
                    PARAMS.THREAT_SOFT_REPULSION_SCALE,
                    1,
                    clamp(hardCollisionPressure * 1.4, 0, 1),
                  )
                : 1);
            accumulator.x -= (neighbor.dx / neighbor.distance) * push;
            accumulator.y -= (neighbor.dy / neighbor.distance) * push;
            return accumulator;
          },
          { x: 0, y: 0 },
        );

        const scoredNeighbors = [...scopedNeighbors].sort((left, right) => {
          const leftScore = pseudoRandom(agent.socialSelectionPhase, left.index + 1);
          const rightScore = pseudoRandom(agent.socialSelectionPhase, right.index + 1);
          return rightScore - leftScore;
        });
        const attractionNeighbors = scoredNeighbors.slice(
          0,
          Math.min(PARAMS.ATTRACTION_SAMPLE_COUNT, scoredNeighbors.length),
        );
        const attractionVector = attractionNeighbors.length > 0
          ? normalize2D(
              attractionNeighbors.reduce((sum, neighbor) => sum + neighbor.agent.x, 0) /
                attractionNeighbors.length -
                agent.x,
              attractionNeighbors.reduce((sum, neighbor) => sum + neighbor.agent.y, 0) /
                attractionNeighbors.length -
                agent.y,
              { x: Math.cos(agent.heading), y: Math.sin(agent.heading) },
            )
          : { x: 0, y: 0 };

        const alignmentNeighbor = attractionNeighbors.length > 0
          ? attractionNeighbors[0]
          : null;
        const alignmentVector = alignmentNeighbor
          ? normalize2D(
              alignmentNeighbor.agent.vx,
              alignmentNeighbor.agent.vy,
              { x: Math.cos(agent.heading), y: Math.sin(agent.heading) },
            )
          : { x: 0, y: 0 };
        const attractionSuppression = 1 - hardCollisionPressure;

        const currentHeading = normalize2D(
          Math.cos(agent.heading),
          Math.sin(agent.heading),
          { x: 1, y: 0 },
        );

        const forwardAxis = normalize2D(
          agent.vx,
          agent.vy,
          fileAxis,
        );

        const dogDx = agent.x - dogRef.current.x;
        const dogDy = agent.y - dogRef.current.y;
        const dogDistance = Math.hypot(dogDx, dogDy) || 1;
        const dogUrgency = dogEnabled && dogDistance <= dogRangePx
          ? clamp(1 - dogDistance / dogRangePx, 0, 1)
          : 0;
        const isOutsideViewport =
          agent.x < 0 || agent.x > size.width || agent.y < 0 || agent.y > size.height;
        const reentryBlend = isOutsideViewport
          ? 1
          : clamp(
              (agent.reentryAssistTimer ?? 0) / Math.max(PARAMS.REENTRY_SETTLE_SEC, 1e-3),
              0,
              1,
            );
        const dogRepulsion = dogUrgency > 0
          ? normalize2D(dogDx, dogDy, currentHeading)
          : { x: 0, y: 0 };
        const panicScatter =
          dogInsideFlock && dogUrgency > 0.18 && dogDistance <= hardCollisionRadiusPx * 1.15;
        const dogScatterStrength = dogUrgency > 0
          ? clamp(
              panicScatter
                ? Math.pow(
                    (PARAMS.DOG_SCATTER_INVERSE_RADIUS_M * PARAMS.PIXELS_PER_METER) /
                      Math.max(dogDistance, 1),
                    2,
                  )
                : (PARAMS.DOG_SCATTER_INVERSE_RADIUS_M * PARAMS.PIXELS_PER_METER) /
                    Math.max(dogDistance, 1),
              0,
              panicScatter ? 9 : 3.2,
            )
          : 0;

        const distanceToCentroid = Math.hypot(centroid.x - agent.x, centroid.y - agent.y) || 1;
        const maxCentroidDistance = Math.max(regroupDistancePx * 0.85, 1);
        const selfishHerdRatio = clamp(distanceToCentroid / maxCentroidDistance, 0, 1.4);
        const selfishHerdVector = dogUrgency > 0
          ? normalize2D(centroid.x - agent.x, centroid.y - agent.y, currentHeading)
          : { x: 0, y: 0 };
        const dogFacingExposure = dogUrgency > 0
          ? clamp(dot2D(dogRepulsion.x, dogRepulsion.y, dogToCentroid.x, dogToCentroid.y), 0, 1)
          : 0;

        const meanNeighborDistancePx =
          nearestNeighbors.length > 0
            ? nearestNeighbors.reduce((sum, neighbor) => sum + neighbor.distance, 0) /
              nearestNeighbors.length
            : regroupDistancePx * 1.1;
        const meanNeighborDistanceM = meanNeighborDistancePx / PARAMS.PIXELS_PER_METER;
        const frontWalkingNeighbors = nearestNeighbors.filter((neighbor) => {
          const projection = dot2D(neighbor.dx, neighbor.dy, forwardAxis.x, forwardAxis.y);
          return projection > 0 && neighbor.agent.state !== SHEEP_STATES.STATIONARY;
        }).length;
        const sideWalkingNeighbors = nearestNeighbors.filter((neighbor) => {
          const projection = dot2D(neighbor.dx, neighbor.dy, forwardAxis.x, forwardAxis.y);
          return (
            projection >= -spriteHeight * 0.2 &&
            projection <= spriteHeight * 0.45 &&
            neighbor.agent.state !== SHEEP_STATES.STATIONARY
          );
        }).length;
        const backStationaryNeighbors = nearestNeighbors.filter((neighbor) => {
          const projection = dot2D(neighbor.dx, neighbor.dy, forwardAxis.x, forwardAxis.y);
          return projection < 0 && neighbor.agent.state === SHEEP_STATES.STATIONARY;
        }).length;
        const sideStationaryNeighbors = nearestNeighbors.filter((neighbor) => {
          const projection = dot2D(neighbor.dx, neighbor.dy, forwardAxis.x, forwardAxis.y);
          return (
            projection >= -spriteHeight * 0.45 &&
            projection <= spriteHeight * 0.2 &&
            neighbor.agent.state === SHEEP_STATES.STATIONARY
          );
        }).length;
        const nearbyRunningNeighbors = nearestNeighbors.filter((neighbor) => {
          const projection = dot2D(neighbor.dx, neighbor.dy, dogToCentroid.x, dogToCentroid.y);
          return projection > -spriteHeight * 0.4 && neighbor.agent.state === SHEEP_STATES.RUNNING;
        }).length;
        const regroupPressure = clamp(
          (meanNeighborDistanceM - PARAMS.REGROUP_DISTANCE_M) /
            Math.max(PARAMS.REGROUP_DISTANCE_M, 1e-3),
          0,
          2,
        );
        const centroidDx = centroid.x - agent.x;
        const centroidDy = centroid.y - agent.y;
        const centroidAlong = dot2D(centroidDx, centroidDy, fileAxis.x, fileAxis.y);
        const centroidLateral = dot2D(centroidDx, centroidDy, lateralAxis.x, lateralAxis.y);
        const surfaceTensionVector =
          dogUrgency < 0.1 && agent.state !== SHEEP_STATES.RUNNING
            ? normalize2D(centroidDx, centroidDy, currentHeading)
            : { x: 0, y: 0 };
        const oblongVector =
          dogUrgency > 0.08 || runningCount > agentsRef.current.length * 0.15
            ? {
                x:
                  fileAxis.x * centroidAlong * PARAMS.OBLONG_ALONG_WEIGHT / Math.max(regroupDistancePx, 1) +
                  lateralAxis.x * centroidLateral * PARAMS.OBLONG_LATERAL_WEIGHT / Math.max(regroupDistancePx, 1),
                y:
                  fileAxis.y * centroidAlong * PARAMS.OBLONG_ALONG_WEIGHT / Math.max(regroupDistancePx, 1) +
                  lateralAxis.y * centroidLateral * PARAMS.OBLONG_LATERAL_WEIGHT / Math.max(regroupDistancePx, 1),
              }
            : { x: 0, y: 0 };

        const noiseAngle = randomBetween(-Math.PI, Math.PI);
        const noiseVector = {
          x: Math.cos(noiseAngle),
          y: Math.sin(noiseAngle),
        };

        const lineLeaderIndex =
          agentsRef.current.length <= PARAMS.SMALL_GROUP_LINE_THRESHOLD
            ? lineOrder.indexOf(index)
            : -1;
        let lineFollowVector = { x: 0, y: 0 };
        let selectedLeader = null;
        const rankIndex = agent.lineRank;
        if (rankIndex > 0) {
          const lateralBandPx = PARAMS.FILE_LATERAL_BAND_M * PARAMS.PIXELS_PER_METER;
          const multiFileAngleCos = Math.cos((PARAMS.MULTI_FILE_ANGLE_DEG * Math.PI) / 180);
          let bestLeaderScore = -Infinity;
          for (let candidateIndex = rankIndex - 1; candidateIndex >= 0; candidateIndex -= 1) {
            const leader = agentsRef.current[lineOrder[candidateIndex]];
            const dx = leader.x - agent.x;
            const dy = leader.y - agent.y;
            const forwardProjection = dot2D(dx, dy, fileAxis.x, fileAxis.y);
            const lateralProjection = Math.abs(dot2D(dx, dy, lateralAxis.x, lateralAxis.y));
            if (forwardProjection <= 0) {
              continue;
            }
            const candidateDistance = Math.hypot(dx, dy) || 1;
            const forwardness = forwardProjection / candidateDistance;
            if (forwardness < multiFileAngleCos || lateralProjection > lateralBandPx * 1.5) {
              continue;
            }
            const score =
              forwardProjection -
              lateralProjection * PARAMS.MULTI_FILE_LATERAL_WEIGHT +
              pseudoRandom(leader.id, pulseRef.current.id + agent.id) * spriteHeight * 0.12;
            if (score > bestLeaderScore) {
              bestLeaderScore = score;
              selectedLeader = leader;
            }
          }
        }
        if (!selectedLeader && lineLeaderIndex > 0) {
          selectedLeader = agentsRef.current[lineOrder[lineLeaderIndex - 1]];
        }
        if (selectedLeader) {
          lineFollowVector = normalize2D(
            selectedLeader.x - agent.x,
            selectedLeader.y - agent.y,
            currentHeading,
          );
        }

        const regroupVector = normalize2D(
          centroid.x - agent.x,
          centroid.y - agent.y,
          currentHeading,
        );
        const returnTarget = {
          x: clamp(
            agent.x,
            size.width * PARAMS.REENTRY_TARGET_INSET_RATIO,
            size.width * (1 - PARAMS.REENTRY_TARGET_INSET_RATIO),
          ),
          y: clamp(
            agent.y,
            size.height * PARAMS.REENTRY_TARGET_INSET_RATIO,
            size.height * (1 - PARAMS.REENTRY_TARGET_INSET_RATIO),
          ),
        };
        const reentryVector = normalize2D(
          returnTarget.x - agent.x,
          returnTarget.y - agent.y,
          regroupVector,
        );
        const reentrySocialScale = lerp(1, PARAMS.REENTRY_SOCIAL_SCALE, reentryBlend);

        const attractionBasis = panicScatter
          ? { x: 0, y: 0 }
          : dogUrgency > 0
            ? selfishHerdVector
            : attractionVector;
        const calmAttractionWeight =
          PARAMS.ATTRACTION_WEIGHT * PARAMS.CALM_ATTRACTION_WEIGHT;
        const calmAlignmentWeight =
          PARAMS.ALIGNMENT_WEIGHT * PARAMS.CALM_ALIGNMENT_WEIGHT;
        const calmLineFollowWeight =
          PARAMS.LEADER_FOLLOW_FORCE * PARAMS.CALM_LINE_FOLLOW_WEIGHT;
        const calmRegroupWeight =
          PARAMS.RUN_GROUP_PULL * PARAMS.CALM_REGROUP_WEIGHT;
        const effectiveSelfishHerdWeight = dogInsideFlock
          ? PARAMS.SELFISH_HERD_WEIGHT * 0.28
          : PARAMS.SELFISH_HERD_WEIGHT;
        const effectiveDogWeight = dogInsideFlock
          ? PARAMS.DOG_WEIGHT * PARAMS.DOG_SCATTER_WEIGHT
          : PARAMS.DOG_WEIGHT;
        const threatPackingPressure = dogThreatActive
          ? clamp(
              dogUrgency * 0.75 + hardCollisionPressure * 0.45 + selfishHerdRatio * 0.35,
              0,
              1.6,
            )
          : 0;
        const effectiveAlignmentWeight = dogThreatActive
          ? PARAMS.ALIGNMENT_WEIGHT
          : calmAlignmentWeight;
        const effectiveLineFollowWeight = dogThreatActive
          ? PARAMS.LEADER_FOLLOW_FORCE
          : calmLineFollowWeight;
        const effectiveRegroupWeight = dogThreatActive
          ? PARAMS.RUN_GROUP_PULL *
            (1 + threatPackingPressure * PARAMS.THREAT_PACKING_REGROUP_MULTIPLIER)
          : calmRegroupWeight;
        const effectiveSurfaceTensionWeight = dogThreatActive
          ? PARAMS.SURFACE_TENSION_WEIGHT
          : PARAMS.CALM_SURFACE_TENSION_WEIGHT;
        const scatterAlignmentWeight = panicScatter ? 0 : effectiveAlignmentWeight;
        const scatterLineFollowWeight = panicScatter ? 0 : effectiveLineFollowWeight;
        const scatterRegroupWeight = panicScatter ? 0 : effectiveRegroupWeight;
        const scatterSurfaceTensionWeight = panicScatter ? 0 : effectiveSurfaceTensionWeight;
        const scatterOblongVector = panicScatter ? { x: 0, y: 0 } : oblongVector;
        const scatterSelfishWeight = panicScatter
          ? 0
          : dogThreatActive
            ? effectiveSelfishHerdWeight *
              (1 + threatPackingPressure * PARAMS.THREAT_PACKING_SELFISH_MULTIPLIER)
            : effectiveSelfishHerdWeight;
        const attractionBlend = dogThreatActive
          ? Math.max(PARAMS.THREAT_ATTRACTION_FLOOR, attractionSuppression)
          : attractionSuppression;
        const socialAttractionWeight =
          (dogUrgency > 0 ? scatterSelfishWeight : calmAttractionWeight) * reentrySocialScale;
        const socialAlignmentWeight = scatterAlignmentWeight * reentrySocialScale;
        const socialRegroupWeight = scatterRegroupWeight * reentrySocialScale;
        const socialLineFollowWeight = scatterLineFollowWeight * reentrySocialScale;
        const socialSurfaceTensionWeight = scatterSurfaceTensionWeight * reentrySocialScale;
        const reentryWeight = PARAMS.REENTRY_RETURN_WEIGHT * reentryBlend;

        const steering = {
          x:
            currentHeading.x * PARAMS.SOCIAL_INERTIA +
            repulsion.x +
            attractionBasis.x *
              socialAttractionWeight *
              (dogUrgency > 0 ? selfishHerdRatio : attractionBlend) +
            alignmentVector.x * socialAlignmentWeight * attractionBlend +
            dogRepulsion.x * effectiveDogWeight * dogPressure * (1 + dogScatterStrength) +
            dogToCentroid.x * PARAMS.RUN_CHAIN_WEIGHT * nearbyRunningNeighbors * (dogThreatActive ? 0.18 : 0.04) +
            regroupVector.x * socialRegroupWeight * Math.max(regroupPressure, dogUrgency * 0.6) +
            lineFollowVector.x * socialLineFollowWeight * attractionBlend +
            selfishHerdVector.x * PARAMS.EDGE_WAVE_EXPOSURE_WEIGHT * dogFacingExposure * dogUrgency +
            surfaceTensionVector.x * socialSurfaceTensionWeight +
            scatterOblongVector.x +
            reentryVector.x * reentryWeight +
            noiseVector.x * PARAMS.NOISE_WEIGHT * noiseScale,
          y:
            currentHeading.y * PARAMS.SOCIAL_INERTIA +
            repulsion.y +
            attractionBasis.y *
              socialAttractionWeight *
              (dogUrgency > 0 ? selfishHerdRatio : attractionBlend) +
            alignmentVector.y * socialAlignmentWeight * attractionBlend +
            dogRepulsion.y * effectiveDogWeight * dogPressure * (1 + dogScatterStrength) +
            dogToCentroid.y * PARAMS.RUN_CHAIN_WEIGHT * nearbyRunningNeighbors * (dogThreatActive ? 0.18 : 0.04) +
            regroupVector.y * socialRegroupWeight * Math.max(regroupPressure, dogUrgency * 0.6) +
            lineFollowVector.y * socialLineFollowWeight * attractionBlend +
            selfishHerdVector.y * PARAMS.EDGE_WAVE_EXPOSURE_WEIGHT * dogFacingExposure * dogUrgency +
            surfaceTensionVector.y * socialSurfaceTensionWeight +
            scatterOblongVector.y +
            reentryVector.y * reentryWeight +
            noiseVector.y * PARAMS.NOISE_WEIGHT * noiseScale,
        };

        const nextHeadingVector = normalize2D(
          steering.x,
          steering.y,
          currentHeading,
        );
        const targetHeading = Math.atan2(nextHeadingVector.y, nextHeadingVector.x);
        const maxTurnRate =
          ((PARAMS.MAX_TURN_RATE_DEG_PER_SEC * Math.PI) / 180) * stepDt;
        agent.heading = rotateTowardAngle(agent.heading, targetHeading, maxTurnRate);
        agent.ax = steering.x;
        agent.ay = steering.y;

        const walkStartRate =
          (PARAMS.SPONTANEOUS_START_RATE +
            PARAMS.MIMICRY_ALPHA *
              (frontWalkingNeighbors * PARAMS.PULSE_START_FRONT_WEIGHT +
                sideWalkingNeighbors * PARAMS.PULSE_START_SIDE_WEIGHT)) /
          PARAMS.WALK_TO_START_TAU_SEC;
        const stopRate =
          (PARAMS.SPONTANEOUS_STOP_RATE +
            PARAMS.MIMICRY_ALPHA *
              (backStationaryNeighbors * PARAMS.PULSE_STOP_BACK_WEIGHT +
                sideStationaryNeighbors * PARAMS.PULSE_STOP_SIDE_WEIGHT)) /
          PARAMS.WALK_TO_STOP_TAU_SEC;
        const calmMotionActive =
          pulseRef.current.calmMotionActive && !dogThreatActive && runningCount === 0;
        const calmMotionProgress = calmMotionActive
          ? clamp(
              pulseRef.current.calmMotionTimer /
                Math.max(pulseRef.current.calmMotionDurationSec, 1e-3),
              0,
              1,
            )
          : 0;
        const isCalmLeader = calmMotionActive && agent.id === pulseRef.current.leaderId;
        const calmWalkSignal = clamp(
          (isCalmLeader ? 1.2 : 0) +
            frontWalkingNeighbors * 0.38 +
            sideWalkingNeighbors * 0.1,
          0,
          2.4,
        );
        const effectiveWalkStartRate = calmMotionActive
          ? walkStartRate * (1 + PARAMS.CALM_MOTION_WALK_BOOST * Math.max(calmWalkSignal, 0.28))
          : walkStartRate;
        const calmStopScale = calmMotionActive
          ? lerp(
              PARAMS.CALM_MOTION_STOP_SUPPRESSION,
              1.3,
              Math.pow(calmMotionProgress, 1.1),
            )
          : !dogThreatActive && agent.state !== SHEEP_STATES.STATIONARY
            ? PARAMS.CALM_GRAZE_STOP_BOOST
            : 1;
        const effectiveStopRate = isOutsideViewport
          ? 0
          : !dogThreatActive || dogUrgency < 0.05
            ? stopRate *
              (1 + densePackPressure * 2.4 + backStationaryNeighbors * 0.45) *
              (1 - reentryBlend * 0.92) *
              calmStopScale
            : stopRate;
        const regroupRate =
          regroupPressure > 0
            ? (1 +
                PARAMS.REGROUP_ALPHA *
                  Math.pow(regroupPressure * PARAMS.REGROUP_DELTA, PARAMS.REGROUP_EXPONENT)) /
              2.5
            : 0;
        const edgeWaveBoost =
          dogUrgency > 0
            ? 1 + dogFacingExposure * PARAMS.EDGE_WAVE_EXPOSURE_WEIGHT + nearbyRunningNeighbors * 0.45
            : 0;
        const dogRunRate = dogUrgency > 0
          ? ((1 + dogUrgency * 18 * dogPressure) / 0.9) * edgeWaveBoost
          : nearbyRunningNeighbors > 0
            ? nearbyRunningNeighbors * 0.22
            : 0;
        const pRun = 1 - Math.exp(-(dogRunRate + regroupRate) * stepDt);
        const pWalk = 1 - Math.exp(-effectiveWalkStartRate * stepDt);
        const pStop = 1 - Math.exp(-effectiveStopRate * stepDt);

        const relayExposure = clamp(
          Math.max(dogFacingExposure, nearbyRunningNeighbors / Math.max(PARAMS.NEIGHBOR_COUNT * 0.6, 1)),
          0,
          1,
        );
        const resolveRelayDelay = (importance) =>
          lerp(
            PARAMS.RELAY_DELAY_MAX_SEC,
            PARAMS.RELAY_DELAY_MIN_SEC,
            clamp(importance, 0, 1),
          );
        const queuePendingState = (nextState, importance) => {
          if (agent.pendingState === nextState) {
            agent.relayDelayTimer = Math.min(
              agent.relayDelayTimer,
              resolveRelayDelay(importance),
            );
            return;
          }
          agent.pendingState = nextState;
          agent.relayDelayTimer = resolveRelayDelay(importance);
        };
        const commitPendingState = () => {
          if (agent.pendingState == null) {
            return false;
          }
          agent.relayDelayTimer = Math.max(0, agent.relayDelayTimer - stepDt);
          if (agent.relayDelayTimer > 0) {
            return false;
          }
          agent.state = agent.pendingState;
          agent.pendingState = null;
          agent.relayDelayTimer = 0;
          agent.stateTimer = 0;
          return true;
        };

        if (agent.state !== SHEEP_STATES.RUNNING && Math.random() < pRun) {
          queuePendingState(
            SHEEP_STATES.RUNNING,
            relayExposure + dogUrgency * 0.8 + hardCollisionPressure * 0.4,
          );
        } else if (agent.state === SHEEP_STATES.STATIONARY) {
          if (isCalmLeader) {
            queuePendingState(SHEEP_STATES.WALKING, 1);
          }
          if (Math.random() < pWalk) {
            queuePendingState(
              SHEEP_STATES.WALKING,
              clamp(calmWalkSignal, 0, 1),
            );
          }
        } else if (agent.state === SHEEP_STATES.WALKING) {
          if (Math.random() < pStop && dogUrgency < 0.08 && regroupPressure < 0.02) {
            queuePendingState(
              SHEEP_STATES.STATIONARY,
              clamp(
                calmMotionActive
                  ? Math.max(backStationaryNeighbors / Math.max(PARAMS.NEIGHBOR_COUNT * 0.5, 1), calmMotionProgress)
                  : backStationaryNeighbors / Math.max(PARAMS.NEIGHBOR_COUNT * 0.5, 1),
                0,
                1,
              ),
            );
          }
        } else if (
          agent.state === SHEEP_STATES.RUNNING &&
          dogUrgency < 0.06 &&
          meanNeighborDistanceM < PARAMS.REGROUP_DISTANCE_M * 0.82
        ) {
          const pRecover = 1 - Math.exp(-stepDt / PARAMS.RUN_RECOVERY_TAU_SEC);
          if (Math.random() < pRecover) {
            queuePendingState(SHEEP_STATES.WALKING, 0.75);
          }
        }

        if (
          !isOutsideViewport &&
          !dogThreatActive &&
          agent.state !== SHEEP_STATES.STATIONARY &&
          (densePackNeighbors >= 3 || backStationaryNeighbors >= 2)
        ) {
          queuePendingState(
            SHEEP_STATES.STATIONARY,
            clamp(Math.max(densePackPressure, backStationaryNeighbors / 3), 0, 1),
          );
        }

        if (reentryBlend > 0.2 && agent.state === SHEEP_STATES.STATIONARY) {
          queuePendingState(SHEEP_STATES.WALKING, 1);
        }

        commitPendingState();

        agent.stateTimer = (agent.stateTimer ?? 0) + stepDt;

        const baseSpeedMps =
          agent.state === SHEEP_STATES.RUNNING
            ? PARAMS.RUN_SPEED_MPS
            : PARAMS.WALK_SPEED_MPS;
        const threatSpeedMps =
          dogUrgency > 0
            ? lerp(
                PARAMS.THREAT_WALK_SPEED_MPS,
                PARAMS.MAX_ESCAPE_SPEED_MPS,
                Math.pow(dogUrgency, PARAMS.DOG_SPEED_RESPONSE_EXPONENT),
              )
            : 0;
        const desiredSpeedMps =
          agent.state === SHEEP_STATES.STATIONARY
            ? 0
            : Math.max(baseSpeedMps, threatSpeedMps);
        const desiredSpeedPx =
          agent.state === SHEEP_STATES.RUNNING
            ? desiredSpeedMps * PARAMS.PIXELS_PER_METER * PARAMS.SIMULATION_TIME_SCALE
            : desiredSpeedMps * PARAMS.PIXELS_PER_METER * PARAMS.SIMULATION_TIME_SCALE;
        const minimumReturnSpeedPx =
          PARAMS.REENTRY_RETURN_SPEED_MPS *
          PARAMS.PIXELS_PER_METER *
          PARAMS.SIMULATION_TIME_SCALE *
          reentryBlend;
        if (agent.state === SHEEP_STATES.STATIONARY) {
          agent.vx *= PARAMS.VELOCITY_DAMPING_STATIONARY;
          agent.vy *= PARAMS.VELOCITY_DAMPING_STATIONARY;
          if (Math.hypot(agent.vx, agent.vy) < 0.02) {
            agent.vx = 0;
            agent.vy = 0;
          }
        } else {
          const resolvedSpeedPx = Math.max(desiredSpeedPx, minimumReturnSpeedPx);
          const desiredVelocity = {
            x: Math.cos(agent.heading) * resolvedSpeedPx,
            y: Math.sin(agent.heading) * resolvedSpeedPx,
          };
          const blend =
            agent.state === SHEEP_STATES.RUNNING
              ? PARAMS.VELOCITY_BLEND_RUN
              : PARAMS.VELOCITY_BLEND_WALK;
          agent.vx = lerp(agent.vx, desiredVelocity.x, blend);
          agent.vy = lerp(agent.vy, desiredVelocity.y, blend);
        }

        agent.x += agent.vx * dt;
        agent.y += agent.vy * dt;
        applyAgentReentry(agent, size.width, size.height, reentryMarginPx);
        agent.reentryAssistTimer = Math.max(0, (agent.reentryAssistTimer ?? 0) - stepDt);
      });

      for (let index = 0; index < agentsRef.current.length; index += 1) {
        const agent = agentsRef.current[index];
        for (let otherIndex = index + 1; otherIndex < agentsRef.current.length; otherIndex += 1) {
          const otherAgent = agentsRef.current[otherIndex];
          const dx = otherAgent.x - agent.x;
          const dy = otherAgent.y - agent.y;
          const distance = Math.hypot(dx, dy) || 0.0001;
          if (distance >= hardCollisionRadiusPx) {
            continue;
          }

          const overlap = (hardCollisionRadiusPx - distance) * 0.5;
          const nx = dx / distance;
          const ny = dy / distance;

          agent.x = clamp(agent.x - nx * overlap, -reentryMarginPx, size.width + reentryMarginPx);
          agent.y = clamp(agent.y - ny * overlap, -reentryMarginPx, size.height + reentryMarginPx);
          otherAgent.x = clamp(
            otherAgent.x + nx * overlap,
            -reentryMarginPx,
            size.width + reentryMarginPx,
          );
          otherAgent.y = clamp(
            otherAgent.y + ny * overlap,
            -reentryMarginPx,
            size.height + reentryMarginPx,
          );

          const relativeVelocity =
            (otherAgent.vx - agent.vx) * nx + (otherAgent.vy - agent.vy) * ny;
          if (relativeVelocity < 0) {
            const impulse = relativeVelocity * 0.5;
            agent.vx += nx * impulse;
            agent.vy += ny * impulse;
            otherAgent.vx -= nx * impulse;
            otherAgent.vy -= ny * impulse;
          }
        }
      }

      if (dogEnabled) {
        ctx.save();
        ctx.translate(dogRef.current.x, dogRef.current.y);
        ctx.fillStyle = "rgba(42, 38, 34, 0.95)";
        ctx.beginPath();
        ctx.arc(0, 0, spriteHeight * 0.18, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      const renderAgents = [...agentsRef.current].sort((left, right) => {
        if (left.y === right.y) {
          return left.id - right.id;
        }
        return left.y - right.y;
      });

      renderAgents.forEach((agent, index) => {
        if (!image) {
          return;
        }

        const sprite = resolveCanvasAtlasSprite(ATLAS, {
          space: agent.spriteSpace || "2d",
          position: agent.spritePosition || { x: agent.x, y: agent.y },
          velocity: { x: agent.vx, y: agent.vy },
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
        const bobAmplitude =
          agent.state === SHEEP_STATES.RUNNING
            ? PARAMS.BOB_RUN_AMPLITUDE
            : agent.state === SHEEP_STATES.WALKING
              ? PARAMS.BOB_WALK_AMPLITUDE
              : 0;
        const grazeRotation =
          agent.state === SHEEP_STATES.STATIONARY
            ? Math.sin(simTime * PARAMS.GRAZE_SWAY_RATE + agent.grazePhase) *
              PARAMS.GRAZE_SWAY_RAD
            : 0;
        const bobOffset =
          Math.sin(simTime * PARAMS.BOB_RATE + agent.bobOffset + index * 0.21) *
          bobAmplitude;
        agent.previousScreenPosition = sprite.pose.screenPosition;

        ctx.save();
        ctx.translate(agent.x, agent.y + bobOffset);
        ctx.rotate(sprite.rotation + grazeRotation);
        ctx.scale(sprite.flipX, 1);
        ctx.drawImage(
          image,
          sprite.frame.x * frameSize.width,
          sprite.frame.y * frameSize.height,
          frameSize.width,
          frameSize.height,
          -spriteWidth * 0.5,
          -spriteHeight * 0.5,
          spriteWidth,
          spriteHeight,
        );
        ctx.restore();
      });

      animationFrameRef.current = window.requestAnimationFrame(render);
    };

    animationFrameRef.current = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
    };
  }, [
    controls?.COUNT,
    controls?.DOG_ENABLED,
    controls?.DOG_AUTO_MODE,
    controls?.DOG_PRESSURE,
    controls?.NOISE,
    isPaused,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        cursor:
          controls?.DOG_ENABLED && !(controls?.DOG_AUTO_MODE ?? DEFAULT_CONTROL_STATE.DOG_AUTO_MODE)
            ? "crosshair"
            : "default",
      }}
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
    24,
    480,
  ),
  DOG_ENABLED: Boolean(
    rawControls?.DOG_ENABLED ?? DEFAULT_CONTROL_STATE.DOG_ENABLED,
  ),
  DOG_AUTO_MODE: Boolean(
    rawControls?.DOG_AUTO_MODE ?? DEFAULT_CONTROL_STATE.DOG_AUTO_MODE,
  ),
  DOG_PRESSURE: clamp(
    Number(rawControls?.DOG_PRESSURE ?? DEFAULT_CONTROL_STATE.DOG_PRESSURE),
    0,
    100,
  ),
  NOISE: clamp(
    Number(rawControls?.NOISE ?? DEFAULT_CONTROL_STATE.NOISE),
    0,
    100,
  ),
});

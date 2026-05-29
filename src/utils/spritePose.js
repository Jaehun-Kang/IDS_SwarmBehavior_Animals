import { resolveStageFrameSequence } from "./spriteAtlas";

const EPSILON = 1e-6;
const RAD_TO_DEG = 180 / Math.PI;

export const SPRITE_POSE_TYPES = {
  SIDE_TOP_MIRROR_ROTATE: "side_top_mirror_rotate",
  SIDE_FRONT_BACK: "side_front_back",
  TOP_ONLY: "top_only",
};

export const SPRITE_RENDERERS = {
  DOM: "dom",
  WEBGL_POINT_SPRITE: "webgl-point-sprite",
};

const length2D = (vector) => Math.hypot(vector.x, vector.y);

const normalize2D = (vector, fallback = { x: 1, y: 0 }) => {
  const magnitude = length2D(vector);
  if (magnitude < EPSILON) {
    return { ...fallback };
  }

  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
  };
};

const resolveScreenSample = ({
  space,
  position,
  velocity,
  previousScreenPosition,
  maxDt,
  width,
  height,
  projectPoint,
}) => {
  const is3D = space === "3d";
  const current = is3D
    ? projectPoint(position, width, height)
    : { x: position.x, y: position.y, scale: 1 };
  const predictedWorld = is3D
    ? {
        x: position.x + velocity.x * maxDt,
        y: position.y + velocity.y * maxDt,
        z: position.z + velocity.z * maxDt,
      }
    : {
        x: position.x + velocity.x * maxDt,
        y: position.y + velocity.y * maxDt,
      };
  const predicted = is3D
    ? projectPoint(predictedWorld, width, height)
    : { x: predictedWorld.x, y: predictedWorld.y, scale: 1 };
  const screenDelta = previousScreenPosition
    ? {
        x: current.x - previousScreenPosition.x,
        y: current.y - previousScreenPosition.y,
      }
    : {
        x: predicted.x - current.x,
        y: predicted.y - current.y,
      };
  const fallbackDelta = {
    x: predicted.x - current.x,
    y: predicted.y - current.y,
  };
  const resolvedDelta =
    length2D(screenDelta) > 1e-3 ? screenDelta : fallbackDelta;

  return {
    screenPosition: current,
    screenDelta: resolvedDelta,
    screenVelocity: normalize2D(resolvedDelta, { x: 1, y: 0 }),
  };
};

const resolveMotionDescriptor = (options) => {
  const { screenPosition, screenDelta, screenVelocity } =
    resolveScreenSample(options);
  const rawAngle = Math.atan2(screenVelocity.y, screenVelocity.x);
  const absX = Math.abs(screenVelocity.x);
  const absY = Math.abs(screenVelocity.y);
  let sideAngle = rawAngle;
  let flipX = 1;

  if (Math.abs(sideAngle) > Math.PI * 0.5) {
    flipX = -1;
    sideAngle = sideAngle > 0 ? sideAngle - Math.PI : sideAngle + Math.PI;
  }

  return {
    screenPosition,
    screenDelta,
    screenVelocity,
    rawAngle,
    sideAngle,
    flipX,
    absX,
    absY,
    verticalRatio: absY,
    facingX: screenVelocity.x >= 0 ? "right" : "left",
    facingY: screenVelocity.y >= 0 ? "down" : "up",
    dominantAxis: absX >= absY ? "horizontal" : "vertical",
  };
};

const resolveConfiguredStage = (stages, keys, context) => {
  for (const key of keys) {
    const candidate = stages?.[key];
    if (!candidate) {
      continue;
    }

    return typeof candidate === "function" ? candidate(context) : candidate;
  }

  return null;
};

const resolveIsVertical = (motion, options = {}) => {
  if (Number.isFinite(options.verticalThreshold)) {
    return motion.verticalRatio > options.verticalThreshold;
  }

  return motion.dominantAxis === "vertical";
};

const resolveSpritePoseState = ({
  motion,
  options,
  state,
  resolver,
  profile,
}) => {
  if (typeof resolver !== "function") {
    return state || {};
  }

  return (
    resolver({ motion, options, state: state || {}, profile }) || state || {}
  );
};

const resolveCustomSpritePose = ({
  motion,
  options,
  state,
  stages,
  resolver,
  profile,
}) => {
  if (typeof resolver !== "function") {
    return null;
  }

  const resolved = resolver({ motion, options, state, stages, profile });
  if (!resolved) {
    return null;
  }

  return {
    stage: resolved.stage ?? null,
    orientation: resolved.orientation || "side",
    flipX: resolved.flipX ?? 1,
    rotation: resolved.rotation ?? 0,
    screenPosition: motion.screenPosition,
    facingY: resolved.facingY || motion.facingY,
  };
};

export const resolveSpritePose = ({
  type,
  motion,
  stages,
  options,
  state,
  resolver,
  profile,
}) => {
  const context = { motion, options, state };
  const isVertical = resolveIsVertical(motion, options);
  const customPose = resolveCustomSpritePose({
    motion,
    options,
    state,
    stages,
    resolver,
    profile,
  });

  if (customPose) {
    return customPose;
  }

  if (type === SPRITE_POSE_TYPES.TOP_ONLY) {
    return {
      stage: resolveConfiguredStage(stages, ["top", "defaultStage"], context),
      orientation: "top",
      flipX: 1,
      rotation: options?.rotateTop ? motion.rawAngle : 0,
      screenPosition: motion.screenPosition,
      facingY: motion.facingY,
    };
  }

  if (type === SPRITE_POSE_TYPES.SIDE_TOP_MIRROR_ROTATE) {
    if (isVertical) {
      return {
        stage: resolveConfiguredStage(
          stages,
          motion.facingY === "up" ? ["topUp", "top"] : ["topDown", "top"],
          context,
        ),
        orientation: "top",
        flipX: options?.mirrorVertical ? motion.flipX : 1,
        rotation: options?.rotateVertical ? motion.rawAngle : 0,
        screenPosition: motion.screenPosition,
        facingY: motion.facingY,
      };
    }

    return {
      stage: resolveConfiguredStage(
        stages,
        motion.facingY === "up" ? ["sideUp", "side"] : ["sideDown", "side"],
        context,
      ),
      orientation: "side",
      flipX: options?.mirrorSide === false ? 1 : motion.flipX,
      rotation: options?.rotateSide === false ? 0 : motion.sideAngle,
      screenPosition: motion.screenPosition,
      facingY: motion.facingY,
    };
  }

  if (type === SPRITE_POSE_TYPES.SIDE_FRONT_BACK) {
    if (isVertical) {
      return {
        stage: resolveConfiguredStage(
          stages,
          motion.facingY === "down"
            ? ["front", "down", "vertical"]
            : ["back", "up", "front", "down", "vertical"],
          context,
        ),
        orientation: motion.facingY === "down" ? "front" : "back",
        flipX: 1,
        rotation: options?.rotateVertical ? motion.rawAngle : 0,
        screenPosition: motion.screenPosition,
        facingY: motion.facingY,
      };
    }

    return {
      stage: resolveConfiguredStage(stages, ["side"], context),
      orientation: "side",
      flipX: options?.mirrorSide === false ? 1 : motion.flipX,
      rotation: options?.rotateSide === false ? 0 : motion.sideAngle,
      screenPosition: motion.screenPosition,
      facingY: motion.facingY,
    };
  }

  return {
    stage: resolveConfiguredStage(stages, ["defaultStage"], context),
    orientation: "side",
    flipX: 1,
    rotation: 0,
    screenPosition: motion.screenPosition,
    facingY: motion.facingY,
  };
};

export const resolveSpriteRenderState = (pose) => {
  return {
    angle: pose?.rotation || 0,
    flipX: pose?.flipX || 1,
  };
};

export const resolveDomAtlasSprite = (
  atlas,
  { velocity, state, previousScreenPosition = null, maxDt = 1, profile },
) => {
  const pose = resolveAtlasSpritePose(atlas, {
    space: "2d",
    position: { x: 0, y: 0 },
    velocity,
    previousScreenPosition,
    maxDt,
    state,
    profile,
  });
  const renderState = resolveSpriteRenderState(pose);

  return {
    pose,
    stage: pose.stage || atlas?.defaultStage,
    rotationDeg: renderState.angle * RAD_TO_DEG,
    scaleX: renderState.flipX,
    state: pose.state,
  };
};

export const resolveCanvasAtlasSprite = (
  atlas,
  {
    space,
    position,
    velocity,
    previousScreenPosition = null,
    maxDt = 1,
    width,
    height,
    projectPoint,
    state,
    profile,
    timestampMs = 0,
    animationOffsetMs = 0,
  },
) => {
  const pose = resolveAtlasSpritePose(atlas, {
    space,
    position,
    velocity,
    previousScreenPosition,
    maxDt,
    width,
    height,
    projectPoint,
    state,
    profile,
  });
  const renderState = resolveSpriteRenderState(pose);
  const stage = pose.stage || atlas?.defaultStage;
  const sequence = resolveStageFrameSequence(atlas, stage);
  const frames = sequence.frames?.length ? sequence.frames : [{ x: 0, y: 0 }];
  const frameIndex =
    frames.length > 1
      ? Math.floor(
          ((timestampMs + animationOffsetMs) /
            Math.max(sequence.durationMs ?? 140, 1)) %
            frames.length,
        )
      : 0;

  return {
    pose,
    stage,
    frame: frames[frameIndex] || frames[0],
    rotation: renderState.angle,
    flipX: renderState.flipX,
    state: pose.state,
  };
};

export const resolveAtlasSpritePose = (
  atlas,
  {
    space,
    position,
    velocity,
    previousScreenPosition,
    maxDt,
    width,
    height,
    projectPoint,
    state,
    profile,
  },
) => {
  const resolvedSpace = space || atlas?.space || "2d";
  const motion = resolveMotionDescriptor({
    space: resolvedSpace,
    position,
    velocity,
    previousScreenPosition,
    maxDt,
    width,
    height,
    projectPoint,
  });
  const resolvedState = resolveSpritePoseState({
    motion,
    options: atlas?.pose?.options,
    state,
    resolver: atlas?.pose?.state,
    profile,
  });

  return {
    ...resolveSpritePose({
      type: atlas?.pose?.type,
      stages: atlas?.pose?.stages,
      options: atlas?.pose?.options,
      state: resolvedState,
      motion,
      resolver: atlas?.pose?.resolve,
      profile,
    }),
    state: resolvedState,
    motion,
  };
};

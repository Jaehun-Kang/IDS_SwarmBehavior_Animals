const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const resolveConfiguredImageSize = (atlas, imageSize) => {
  if (atlas?.imageSize?.width && atlas?.imageSize?.height) {
    return {
      width: atlas.imageSize.width,
      height: atlas.imageSize.height,
    };
  }

  if (imageSize?.width && imageSize?.height) {
    return {
      width: imageSize.width,
      height: imageSize.height,
    };
  }

  return null;
};

export const toFrameCoordinate = (frame) => {
  if (!frame) {
    return null;
  }

  if (Array.isArray(frame)) {
    const [x = 0, y = 0] = frame;
    return { x, y };
  }

  if (typeof frame === "object") {
    return {
      x: Number.isFinite(frame.x) ? frame.x : 0,
      y: Number.isFinite(frame.y) ? frame.y : 0,
    };
  }

  return null;
};

export const resolveAtlasGrid = (atlas, imageSize) => {
  const resolvedImageSize = resolveConfiguredImageSize(atlas, imageSize);
  const configuredGrid = atlas?.grid || {};
  const configuredColumns =
    atlas?.columns ?? configuredGrid.columns ?? configuredGrid.x;
  const configuredRows = atlas?.rows ?? configuredGrid.rows ?? configuredGrid.y;

  if (Number.isFinite(configuredColumns) && Number.isFinite(configuredRows)) {
    return {
      columns: Math.max(1, Math.round(configuredColumns)),
      rows: Math.max(1, Math.round(configuredRows)),
    };
  }

  const frameSize = atlas?.frameSize;
  if (
    frameSize?.width &&
    frameSize?.height &&
    resolvedImageSize?.width &&
    resolvedImageSize?.height
  ) {
    return {
      columns: Math.max(
        1,
        Math.round(resolvedImageSize.width / frameSize.width),
      ),
      rows: Math.max(
        1,
        Math.round(resolvedImageSize.height / frameSize.height),
      ),
    };
  }

  return { columns: 1, rows: 1 };
};

export const resolveAtlasAspectRatio = (atlas, imageSize) => {
  const resolvedImageSize = resolveConfiguredImageSize(atlas, imageSize);
  if (atlas?.aspectRatio) {
    return atlas.aspectRatio;
  }

  if (resolvedImageSize?.width && resolvedImageSize?.height) {
    return `${resolvedImageSize.width} / ${resolvedImageSize.height}`;
  }

  return undefined;
};

export const resolveAtlasFrameSize = (atlas, imageSize) => {
  const resolvedImageSize = resolveConfiguredImageSize(atlas, imageSize);
  if (atlas?.frameSize?.width && atlas?.frameSize?.height) {
    return {
      width: atlas.frameSize.width,
      height: atlas.frameSize.height,
    };
  }

  const grid = resolveAtlasGrid(atlas, resolvedImageSize);
  if (resolvedImageSize?.width && resolvedImageSize?.height) {
    return {
      width: resolvedImageSize.width / Math.max(grid.columns, 1),
      height: resolvedImageSize.height / Math.max(grid.rows, 1),
    };
  }

  return {
    width: 1,
    height: 1,
  };
};

export const normalizeStageDefinition = (stageDefinition) => {
  if (!stageDefinition) {
    return null;
  }

  if (Array.isArray(stageDefinition)) {
    return {
      type: "still",
      frames: [toFrameCoordinate(stageDefinition)].filter(Boolean),
    };
  }

  if (stageDefinition.frame) {
    return {
      type: stageDefinition.type || "still",
      frames: [toFrameCoordinate(stageDefinition.frame)].filter(Boolean),
      durationMs: stageDefinition.durationMs,
      fps: stageDefinition.fps,
      loop: stageDefinition.loop,
    };
  }

  if (stageDefinition.frames) {
    return {
      type:
        stageDefinition.type ||
        (stageDefinition.frames.length > 1 ? "animation" : "still"),
      frames: stageDefinition.frames.map(toFrameCoordinate).filter(Boolean),
      durationMs: stageDefinition.durationMs,
      fps: stageDefinition.fps,
      loop: stageDefinition.loop,
    };
  }

  return null;
};

export const resolveStageFrameSequence = (atlas, stageName, fallbackFrame) => {
  if (fallbackFrame) {
    return {
      stageName: null,
      type: "still",
      frames: [toFrameCoordinate(fallbackFrame)].filter(Boolean),
      durationMs: undefined,
      fps: undefined,
      loop: false,
    };
  }

  const resolvedStageName = stageName || atlas?.defaultStage || null;
  const definition = normalizeStageDefinition(
    resolvedStageName ? atlas?.stages?.[resolvedStageName] : null,
  );

  if (definition) {
    return {
      stageName: resolvedStageName,
      type: definition.type,
      frames: definition.frames,
      durationMs: definition.durationMs,
      fps: definition.fps,
      loop: definition.loop ?? true,
    };
  }

  return {
    stageName: null,
    type: "still",
    frames: [{ x: 0, y: 0 }],
    durationMs: undefined,
    fps: undefined,
    loop: false,
  };
};

export const getAtlasFrameIndex = (frame, columns) => {
  const resolved = toFrameCoordinate(frame);
  if (!resolved) {
    return 0;
  }

  return resolved.y * Math.max(columns, 1) + resolved.x;
};

const getAxisPosition = (index, cellCount) => {
  if (cellCount <= 1) {
    return "0%";
  }

  return `calc(${clamp(index, 0, cellCount - 1)} * 100% / ${cellCount - 1})`;
};

export const getAtlasFrameStyle = ({ atlas, imageSize, frame }) => {
  const resolvedFrame = toFrameCoordinate(frame) || { x: 0, y: 0 };
  const grid = resolveAtlasGrid(atlas, imageSize);

  return {
    backgroundImage: `url("${atlas.src}")`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${grid.columns * 100}% ${grid.rows * 100}%`,
    backgroundPosition: `${getAxisPosition(resolvedFrame.x, grid.columns)} ${getAxisPosition(resolvedFrame.y, grid.rows)}`,
  };
};

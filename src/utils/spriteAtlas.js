const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const texturedAtlasCache = new Map();
const imageLoadCache = new Map();

const loadImage = (src) => {
  if (!src) {
    return Promise.reject(new Error("image-source-missing"));
  }

  const cached = imageLoadCache.get(src);
  if (cached) {
    return cached;
  }

  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`image-load-failed:${src}`));
    image.src = src;
  });

  imageLoadCache.set(src, promise);
  return promise;
};

const loadTransientImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`image-load-failed:${src}`));
    image.src = src;
  });

const isSvgSource = (src) => /\.svg(?:[?#]|$)/i.test(src || "");

const readSvgText = async (src) => {
  const response = await fetch(src);

  if (!response.ok) {
    throw new Error(`svg-load-failed:${src}`);
  }

  return response.text();
};

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

const getFrameKey = (frame) => {
  const resolvedFrame = toFrameCoordinate(frame) || { x: 0, y: 0 };
  return `${resolvedFrame.x}:${resolvedFrame.y}`;
};

export const createAtlasFrameCanvases = (source, frameSize, grid) => {
  const frames = new Map();
  const frameWidth = Math.round(frameSize.width);
  const frameHeight = Math.round(frameSize.height);

  if (frameWidth <= 0 || frameHeight <= 0) {
    return frames;
  }

  for (let y = 0; y < grid.rows; y += 1) {
    for (let x = 0; x < grid.columns; x += 1) {
      const frameCanvas = document.createElement("canvas");
      frameCanvas.width = frameWidth;
      frameCanvas.height = frameHeight;

      const context = frameCanvas.getContext("2d");
      if (context) {
        context.clearRect(0, 0, frameWidth, frameHeight);
        context.drawImage(
          source,
          x * frameWidth,
          y * frameHeight,
          frameWidth,
          frameHeight,
          0,
          0,
          frameWidth,
          frameHeight,
        );
      }

      frames.set(`${x}:${y}`, frameCanvas);
    }
  }

  return frames;
};

const createAtlasFrameCanvasesFromSvg = async (src, frameSize, grid) => {
  const frames = new Map();
  const frameWidth = Math.round(frameSize.width);
  const frameHeight = Math.round(frameSize.height);

  if (frameWidth <= 0 || frameHeight <= 0) {
    return frames;
  }

  const svgText = await readSvgText(src);
  const parser = new DOMParser();
  const serializer = new XMLSerializer();

  for (let y = 0; y < grid.rows; y += 1) {
    for (let x = 0; x < grid.columns; x += 1) {
      const svgDocument = parser.parseFromString(svgText, "image/svg+xml");
      const svg = svgDocument.documentElement;

      svg.setAttribute(
        "viewBox",
        `${x * frameWidth} ${y * frameHeight} ${frameWidth} ${frameHeight}`,
      );
      svg.setAttribute("width", String(frameWidth));
      svg.setAttribute("height", String(frameHeight));
      svg.setAttribute("preserveAspectRatio", "none");

      const serializedSvg = serializer.serializeToString(svg);
      const objectUrl = URL.createObjectURL(
        new Blob([serializedSvg], { type: "image/svg+xml" }),
      );

      try {
        const image = await loadTransientImage(objectUrl);
        const frameCanvas = document.createElement("canvas");
        frameCanvas.width = frameWidth;
        frameCanvas.height = frameHeight;

        const context = frameCanvas.getContext("2d");
        if (context) {
          context.clearRect(0, 0, frameWidth, frameHeight);
          context.drawImage(image, 0, 0, frameWidth, frameHeight);
        }

        frames.set(`${x}:${y}`, frameCanvas);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    }
  }

  return frames;
};

export const getAtlasFrameCanvas = (frameCanvases, frame) =>
  frameCanvases?.get(getFrameKey(frame)) || null;

export const drawAtlasFrame = (
  context,
  { image, frameCanvases, frame, frameSize, dx, dy, dWidth, dHeight },
) => {
  const frameCanvas = getAtlasFrameCanvas(frameCanvases, frame);

  if (frameCanvas) {
    context.drawImage(
      frameCanvas,
      0,
      0,
      frameSize.width,
      frameSize.height,
      dx,
      dy,
      dWidth,
      dHeight,
    );
    return;
  }

  const resolvedFrame = toFrameCoordinate(frame) || { x: 0, y: 0 };
  context.drawImage(
    image,
    resolvedFrame.x * frameSize.width,
    resolvedFrame.y * frameSize.height,
    frameSize.width,
    frameSize.height,
    dx,
    dy,
    dWidth,
    dHeight,
  );
};

export const loadTexturedAtlasCanvas = async (atlas) => {
  const cacheKey = [
    atlas?.src,
    atlas?.imageSize?.width || "",
    atlas?.imageSize?.height || "",
  ].join("|");

  const cached = texturedAtlasCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const promise = loadImage(atlas.src)
    .then(async (image) => {
      const width = atlas?.imageSize?.width || image.naturalWidth || image.width || 64;
      const height =
        atlas?.imageSize?.height || image.naturalHeight || image.height || 64;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (context) {
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
      }
      const imageSize = { width, height };
      const frameSize = resolveAtlasFrameSize(atlas, imageSize);
      const grid = resolveAtlasGrid(atlas, imageSize);
      const frameCanvases = isSvgSource(atlas?.src)
        ? await createAtlasFrameCanvasesFromSvg(atlas.src, frameSize, grid)
        : createAtlasFrameCanvases(context ? canvas : image, frameSize, grid);

      return {
        image,
        imageSize,
        frameSize,
        frameCanvases,
        canvas: context ? canvas : null,
      };
    });

  texturedAtlasCache.set(cacheKey, promise);
  return promise;
};

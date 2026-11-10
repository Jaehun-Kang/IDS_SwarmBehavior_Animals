const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const texturedAtlasCache = new Map();
const imageLoadCache = new Map();
const isolatedAtlasCache = new Map();
const FRAME_PADDING = 2;

export const getIsolatedFramePadding = (atlas, imageSize) => {
  const size = resolveAtlasFrameSize(atlas, imageSize);
  return isSvgSource(atlas?.src)
    ? { x: FRAME_PADDING / size.width, y: FRAME_PADDING / size.height }
    : { x: 0, y: 0 };
};

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

const isSvgSource = (src) =>
  /\.svg(?:[?#]|$)/i.test(src || "") ||
  /^data:image\/svg\+xml(?:;[^,]*)?,/i.test(src || "");

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

export const getAtlasFrameStyle = ({ atlas, imageSize, frame, frameSources }) => {
  if (frameSources !== undefined) {
    const src = frameSources?.get(getFrameKey(frame));
    const padding = getIsolatedFramePadding(atlas, imageSize);
    return {
      backgroundImage: src ? `url("${src}")` : "none",
      backgroundRepeat: "no-repeat",
      backgroundSize: `${100 + padding.x * 200}% ${100 + padding.y * 200}%`,
      backgroundPosition: "50% 50%",
    };
  }
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
          x * frameSize.width,
          y * frameSize.height,
          frameSize.width,
          frameSize.height,
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

  const { frameSources } = await loadIsolatedAtlasFrames({ src, frameSize, grid });

  for (let y = 0; y < grid.rows; y += 1) {
    for (let x = 0; x < grid.columns; x += 1) {
      const image = await loadTransientImage(frameSources.get(`${x}:${y}`));
      const frameCanvas = document.createElement("canvas");
      frameCanvas.width = frameWidth;
      frameCanvas.height = frameHeight;

      const context = frameCanvas.getContext("2d");
      if (context) {
        context.clearRect(0, 0, frameWidth, frameHeight);
        context.drawImage(image, FRAME_PADDING, FRAME_PADDING,
          frameSize.width, frameSize.height, 0, 0, frameWidth, frameHeight);
      }

      frames.set(`${x}:${y}`, frameCanvas);
    }
  }

  return frames;
};

export const getAtlasFrameCanvas = (frameCanvases, frame) =>
  frameCanvases?.get(getFrameKey(frame)) || null;

export const loadIsolatedAtlasFrames = (atlas) => {
  const key = JSON.stringify([atlas.src, atlas.imageSize, atlas.frameSize,
    atlas.grid, atlas.columns, atlas.rows]);
  if (isolatedAtlasCache.has(key)) return isolatedAtlasCache.get(key);

  const promise = loadImage(atlas.src).then(async (image) => {
    const imageSize = atlas.imageSize || {
      width: image.naturalWidth, height: image.naturalHeight,
    };
    const frameSize = resolveAtlasFrameSize(atlas, imageSize);
    const grid = resolveAtlasGrid(atlas, imageSize);
    const frameSources = new Map();
    if (isSvgSource(atlas.src)) {
      const doc = new DOMParser().parseFromString(await readSvgText(atlas.src), "image/svg+xml");
      if (doc.querySelector("parsererror")) throw new Error("invalid-atlas-svg");
      const serializer = new XMLSerializer();
      // The exported SVGs contain one artwork group per frame. Remove the
      // other groups entirely: clipping the sheet alone can sample a neighbor.
      const probe = document.importNode(doc.documentElement, true);
      probe.style.cssText = "position:fixed;left:-100000px;top:0;visibility:hidden;pointer-events:none";
      document.body.appendChild(probe);
      const frameGroupIndices = new Map();
      try {
        const layer = Array.from(probe.children).find(node => node.tagName === "g");
        const groups = Array.from(layer?.children || []);
        if (groups.length !== grid.columns * grid.rows || groups.some(node => node.tagName !== "g")) {
          throw new Error("atlas-frame-groups-mismatch");
        }
        groups.forEach((group, index) => {
          const bounds = group.getBBox();
          const column = Math.floor((bounds.x + bounds.width / 2) / frameSize.width);
          const row = Math.floor((bounds.y + bounds.height / 2) / frameSize.height);
          const frameKey = `${column}:${row}`;
          if (column < 0 || column >= grid.columns || row < 0 || row >= grid.rows || frameGroupIndices.has(frameKey)) {
            throw new Error("atlas-frame-group-out-of-range");
          }
          frameGroupIndices.set(frameKey, index);
        });
      } finally {
        probe.remove();
      }
      for (let y = 0; y < grid.rows; y += 1) {
        for (let x = 0; x < grid.columns; x += 1) {
          // Isolate the viewport before scaling, retaining vector detail.
          const svg = doc.documentElement.cloneNode(true);
          const layer = Array.from(svg.children).find(node => node.tagName === "g");
          const selectedIndex = frameGroupIndices.get(`${x}:${y}`);
          Array.from(layer.children).forEach((group, index) => {
            if (index !== selectedIndex) group.remove();
          });
          svg.setAttribute("viewBox", `${x * frameSize.width - FRAME_PADDING} ${y * frameSize.height - FRAME_PADDING} ${frameSize.width + FRAME_PADDING * 2} ${frameSize.height + FRAME_PADDING * 2}`);
          svg.setAttribute("width", String(frameSize.width + FRAME_PADDING * 2));
          svg.setAttribute("height", String(frameSize.height + FRAME_PADDING * 2));
          svg.setAttribute("preserveAspectRatio", "none");
          svg.style.overflow = "hidden";
          frameSources.set(`${x}:${y}`, `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serializer.serializeToString(svg))}`);
        }
      }
    } else {
      const frames = createAtlasFrameCanvases(image, frameSize, grid);
      frames.forEach((canvas, frameKey) => frameSources.set(frameKey, canvas.toDataURL()));
    }
    // Keep decoded frames alive so hover/animation swaps do not show blank images.
    const frameImages = new Map(await Promise.all(
      Array.from(frameSources, async ([frameKey, src]) => {
        const frameImage = await loadTransientImage(src);
        await frameImage.decode();
        return [frameKey, frameImage];
      }),
    ));
    return { imageSize, frameSources, frameImages };
  });
  isolatedAtlasCache.set(key, promise);
  promise.catch(() => isolatedAtlasCache.delete(key));
  return promise;
};

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
      frameCanvas.width,
      frameCanvas.height,
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

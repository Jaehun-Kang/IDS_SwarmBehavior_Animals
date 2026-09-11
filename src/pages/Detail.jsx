import React from "react";
import { getAnimalDetails } from "../behaviors/animalDetails";
import { behaviorMap } from "../behaviors/animalData";
import RulePreview from "../components/RulePreview";
import BookBehaviorPanel from "../components/BookBehaviorPanel";
import { resolveRuleControls } from "../utils/bookControls.js";
import { HOME_SPRITE_ATLASES } from "../data/spriteAtlases";
import chevronLeftIconUrl from "../assets/icons/chevron-left.svg";
import chevronRightIconUrl from "../assets/icons/chevron-right.svg";
import closeIconUrl from "../assets/icons/close.svg";
import paperTextureUrl from "../assets/texture/paper/white-paper-texture-seamless.webp";
import {
  getAtlasFrameStyle,
  resolveAtlasFrameSize,
  resolveStageFrameSequence,
} from "../utils/spriteAtlas";
import { resolveDomAtlasSprite } from "../utils/spritePose";
import {
  createBookCurlRenderer,
  renderBookCurlTransition,
} from "../utils/bookCurlWebgl";
import "../styles/Detail.css";

const SPINY_LOBSTER_FRAME_WIDTH_COMPENSATION = 175 / 165;

const bookCoverTextureModules = import.meta.glob(
  "../assets/texture/book_cover/*.webp",
  {
    eager: true,
    import: "default",
  },
);

const getBookCoverTexture = (animalId) => {
  return bookCoverTextureModules[
    `../assets/texture/book_cover/${animalId}.webp`
  ];
};

const getCssImageValue = (imageUrl) => (imageUrl ? `url(${imageUrl})` : "none");

const CANVAS_TURN_DURATION = 520;
const BOOK_OPEN_DELAY_MS = 720;
const BOOK_CLOSE_DELAY_MS = 720;
const BOOK_AUTO_FIRST_TURN_DELAY_MS = 50;
const DRAG_TURN_THRESHOLD = 72;
const INTRO_GRASSHOPPER_TAKEOFF_MS = 25;
const DETAIL_PRINTED_FONT =
  '"Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", Arial, sans-serif';
const INTRO_HOME_STEER_WEIGHT = 0.075;
const INTRO_POINTER_STEER_WEIGHT = 0.095;
const INTRO_POINTER_MAX_SPEED_RATIO = 1.25;
const INTRO_POINTER_TURN_RADIUS_RATIO = 1.85;
const INTRO_BOUNDARY_MARGIN_RATIO = 0.12;
const INTRO_BOUNDARY_STEER_WEIGHT = 0.16;
const INTRO_DASHLESS_ANIMAL_IDS = new Set(["sardine", "krill"]);
const INTRO_DIRECT_POINTER_ANIMAL_IDS = new Set(["sardine", "krill"]);
const INTRO_GRASSHOPPER_JUMP_CYCLE_MS = 920;
const INTRO_GRASSHOPPER_JUMP_STAGE_RATIO = 0.24;
const INTRO_PENGUIN_WADDLE_RATE = (Math.PI * 2) / 0.6;
const INTRO_PENGUIN_SIDE_SWAY_DEG = 1.1;
const INTRO_PENGUIN_FRONT_BACK_SWAY_DEG = 1.8;
const INTRO_BASE_SPEED_BY_ANIMAL = {
  starling: 1.55,
  sardine: 1.5,
  grasshopper: 1.45,
  ant: 1.35,
  bat: 1.45,
  sheep: 1.25,
  penguin: 1.28,
  bee: 1.45,
  firefly: 1.35,
  spiny_lobster: 1.3,
  krill: 1.45,
};
const INTRO_ANIMATION_DURATION_SCALE = {
  starling: 1.85,
  grasshopper: 1.4,
  bat: 1.65,
  bee: 1.9,
  firefly: 1.9,
};

const ANIMAL_ACCENT_COLORS = {
  starling: "rgb(27 81 108)",
  sardine: "rgb(52 69 79)",
  grasshopper: "rgb(156 133 0)",
  ant: "rgb(171 114 39)",
  bat: "rgb(135 114 97)",
  sheep: "rgb(151 133 84)",
  penguin: "rgb(220 98 50)",
  bee: "rgb(179 122 4)",
  firefly: "rgb(134 141 0)",
  spiny_lobster: "rgb(198 93 89)",
  krill: "rgb(104 137 184)",
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const normalizeVector = (x, y, fallback = { x: 1, y: 0 }) => {
  const length = Math.hypot(x, y);

  if (length < 0.001) {
    return fallback;
  }

  return {
    x: x / length,
    y: y / length,
  };
};

const lerpAngle = (current, target, amount) => {
  const diff = Math.atan2(Math.sin(target - current), Math.cos(target - current));

  return current + diff * amount;
};

const resolveIntroBaseSpeed = (animalId) =>
  INTRO_BASE_SPEED_BY_ANIMAL[animalId] ?? 1.45;

const setIntroAnimalSpeed = (animal, animalId) => {
  const speed = resolveIntroBaseSpeed(animalId);
  const direction = normalizeVector(animal.vx || 1, animal.vy || 0);

  animal.baseSpeed = speed;
  animal.vx = direction.x * speed;
  animal.vy = direction.y * speed;
};

const limitIntroAnimalSpeed = (animal, maxSpeed) => {
  const speed = Math.hypot(animal.vx || 0, animal.vy || 0);

  if (speed <= maxSpeed || speed < 0.001) {
    return;
  }

  const scale = maxSpeed / speed;
  animal.vx *= scale;
  animal.vy *= scale;
};

const disableIntroDash = (animalId, animal) => {
  if (!INTRO_DASHLESS_ANIMAL_IDS.has(animalId)) {
    return;
  }

  animal.isDashing = false;
  animal.dashTimer = 0;
  animal.dashMultiplier = 1;
  animal.nextDashAt = Number.POSITIVE_INFINITY;
};

const shouldUseDirectIntroPointer = (animalId) =>
  INTRO_DIRECT_POINTER_ANIMAL_IDS.has(animalId);

const getIntroPenguinWaddleRotation = (introAnimal, sprite, timestampMs) => {
  const swayDeg =
    sprite.stage === "penguin_walk"
      ? INTRO_PENGUIN_SIDE_SWAY_DEG
      : INTRO_PENGUIN_FRONT_BACK_SWAY_DEG;
  const phaseOffset = introAnimal?.waddlePhaseOffset || 0;

  return (
    Math.sin(timestampMs * 0.001 * INTRO_PENGUIN_WADDLE_RATE + phaseOffset) *
    swayDeg
  );
};

const applyIntroBoundarySteer = (
  animal,
  animalId,
  rect,
  spriteWidth,
  spriteHeight,
) => {
  const margin = Math.max(
    Math.min(rect.width, rect.height) * INTRO_BOUNDARY_MARGIN_RATIO,
    Math.max(spriteWidth, spriteHeight) * 0.75,
  );
  const centerX = animal.x + spriteWidth * 0.5;
  const centerY = animal.y + spriteHeight * 0.5;
  let steerX = 0;
  let steerY = 0;

  if (centerX < margin) {
    steerX += (margin - centerX) / margin;
  } else if (centerX > rect.width - margin) {
    steerX -= (centerX - (rect.width - margin)) / margin;
  }

  if (centerY < margin) {
    steerY += (margin - centerY) / margin;
  } else if (centerY > rect.height - margin) {
    steerY -= (centerY - (rect.height - margin)) / margin;
  }

  if (Math.hypot(steerX, steerY) < 0.001) {
    return;
  }

  const speed = Math.max(
    resolveIntroBaseSpeed(animalId),
    Math.hypot(animal.vx || 0, animal.vy || 0),
  );
  const currentDirection = normalizeVector(animal.vx || 1, animal.vy || 0);
  const inwardDirection = normalizeVector(steerX, steerY, currentDirection);
  const nextDirection = normalizeVector(
    currentDirection.x * (1 - INTRO_BOUNDARY_STEER_WEIGHT) +
      inwardDirection.x * INTRO_BOUNDARY_STEER_WEIGHT,
    currentDirection.y * (1 - INTRO_BOUNDARY_STEER_WEIGHT) +
      inwardDirection.y * INTRO_BOUNDARY_STEER_WEIGHT,
    currentDirection,
  );

  animal.vx = nextDirection.x * speed;
  animal.vy = nextDirection.y * speed;
};

const containIntroAnimalInBook = (animal, rect, spriteWidth, spriteHeight) => {
  const maxX = Math.max(0, rect.width - spriteWidth);
  const maxY = Math.max(0, rect.height - spriteHeight);
  const nextX = clamp(animal.x, 0, maxX);
  const nextY = clamp(animal.y, 0, maxY);

  if (nextX !== animal.x) {
    animal.vx =
      nextX <= 0 ? Math.abs(animal.vx || 0) : -Math.abs(animal.vx || 0);
    animal.vx *= 0.45;
    animal.x = nextX;
  }

  if (nextY !== animal.y) {
    animal.vy =
      nextY <= 0 ? Math.abs(animal.vy || 0) : -Math.abs(animal.vy || 0);
    animal.vy *= 0.45;
    animal.y = nextY;
  }
};

const getIntroSpriteState = ({
  animalId,
  pointerVector,
  timestampMs,
  grasshopperFlightStartMs,
}) => {
  if (animalId === "starling") {
    return {
      spriteVariant: 0.75,
      spriteBranchLock: true,
    };
  }

  if (animalId === "grasshopper") {
    const shouldFly = Math.hypot(pointerVector.x, pointerVector.y) > 0.35;
    const jumpPhase =
      (timestampMs % INTRO_GRASSHOPPER_JUMP_CYCLE_MS) /
      INTRO_GRASSHOPPER_JUMP_CYCLE_MS;
    const isJumping =
      shouldFly &&
      (jumpPhase < INTRO_GRASSHOPPER_JUMP_STAGE_RATIO ||
        jumpPhase > 1 - INTRO_GRASSHOPPER_JUMP_STAGE_RATIO * 0.55);
    const takeoffElapsedMs = Math.max(
      0,
      timestampMs - grasshopperFlightStartMs,
    );
    const isTakingOff =
      shouldFly && takeoffElapsedMs < INTRO_GRASSHOPPER_TAKEOFF_MS;

    return {
      directionX: pointerVector.x,
      directionY: pointerVector.y,
      isFlying: shouldFly,
      isJumping,
      isTakingOff,
      jumpProgress: jumpPhase,
    };
  }

  if (animalId === "firefly") {
    const glowCycle = (timestampMs % 1200) / 1200;
    return {
      glow: glowCycle < 0.2 || (glowCycle > 0.34 && glowCycle < 0.42),
      idle: false,
    };
  }

  if (animalId === "spiny_lobster") {
    const verticalDominance =
      Math.abs(pointerVector.y) >= Math.abs(pointerVector.x) * 0.72;

    return { forceTop: verticalDominance };
  }

  return undefined;
};

const getIntroAtlas = (animalId, atlas) => {
  if (!atlas) {
    return null;
  }

  if (animalId === "sardine") {
    return {
      ...atlas,
      pose: {
        ...atlas.pose,
        options: {
          ...atlas.pose?.options,
          verticalThreshold: 0.92,
        },
      },
    };
  }

  return atlas;
};

const applyIntroSpriteOverrides = (
  animalId,
  sprite,
  pointerVector,
  state,
  introAnimal,
  timestampMs,
) => {
  if (animalId === "ant") {
    return {
      ...sprite,
      stage: "ant_top",
      rotationDeg:
        (Math.atan2(pointerVector.y, pointerVector.x) * 180) / Math.PI,
      scaleX: 1,
    };
  }

  if (animalId === "spiny_lobster" && state?.forceTop) {
    return {
      ...sprite,
      rotationDeg:
        (Math.atan2(pointerVector.y, pointerVector.x) * 180) / Math.PI,
      scaleX: 1,
    };
  }

  if (animalId === "penguin") {
    return {
      ...sprite,
      rotationDeg:
        (sprite.rotationDeg || 0) +
        getIntroPenguinWaddleRotation(introAnimal, sprite, timestampMs),
      scaleY: 1,
    };
  }

  if (animalId === "grasshopper") {
    const direction = normalizeVector(pointerVector.x, pointerVector.y);
    let rotationDeg = (Math.atan2(direction.y, direction.x) * 180) / Math.PI;
    let scaleX = 1;

    if (Math.abs(rotationDeg) > 90) {
      scaleX = -1;
      rotationDeg = rotationDeg > 0 ? rotationDeg - 180 : rotationDeg + 180;
    }

    return {
      ...sprite,
      rotationDeg,
      scaleX,
    };
  }

  return sprite;
};

const getIntroSpriteFrameSequence = (animalId, stage, sequence) => {
  let nextSequence = sequence;

  if (animalId === "bat" && stage === "bat_fly3") {
    nextSequence = {
      ...sequence,
      frames: [
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ],
      durationMs: 120,
    };
  }

  const durationScale = INTRO_ANIMATION_DURATION_SCALE[animalId];

  if (!durationScale || nextSequence.frames?.length <= 1) {
    return nextSequence;
  }

  return {
    ...nextSequence,
    durationMs: Math.round((nextSequence.durationMs || 120) * durationScale),
    fps: nextSequence.fps ? nextSequence.fps / durationScale : nextSequence.fps,
  };
};

const getIntroSpriteFrame = (sequence, timestampMs) => {
  const frames = sequence.frames?.length ? sequence.frames : [{ x: 0, y: 0 }];

  if (frames.length <= 1) {
    return frames[0];
  }

  const stepMs = sequence.fps
    ? Math.max(16, 1000 / sequence.fps)
    : Math.max(16, (sequence.durationMs || 120) / frames.length);
  const frameIndex = Math.floor(timestampMs / stepMs) % frames.length;

  return frames[frameIndex] || frames[0];
};

const waitForAnimationFrame = () =>
  new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });

const waitForSpreadKey = async (expectedKey, getNode) => {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await waitForAnimationFrame();

    if (getNode()?.dataset?.pageKey === expectedKey) {
      await waitForAnimationFrame();
      return true;
    }
  }

  return false;
};

const getDocumentStyleText = () =>
  Array.from(document.styleSheets)
    .map((styleSheet) => {
      try {
        return Array.from(styleSheet.cssRules)
          .map((rule) => rule.cssText)
          .join("\n");
      } catch {
        return "";
      }
    })
    .join("\n");

const getLiveCanvasEntries = (sourceNode) => {
  const rootRect = sourceNode.getBoundingClientRect();

  return Array.from(sourceNode.querySelectorAll("canvas"))
    .map((sourceCanvas) => {
      const rect = sourceCanvas.getBoundingClientRect();

      if (rect.width <= 0 || rect.height <= 0) {
        return null;
      }

      return {
        sourceCanvas,
        x: rect.left - rootRect.left,
        y: rect.top - rootRect.top,
        width: rect.width,
        height: rect.height,
      };
    })
    .filter(Boolean);
};

const attachLiveCanvasRefresh = (targetCanvas, liveCanvasEntries) => {
  if (!liveCanvasEntries.length) {
    return null;
  }

  const context = targetCanvas.getContext("2d");
  const baseCanvas = document.createElement("canvas");
  const baseContext = baseCanvas.getContext("2d");

  if (!context || !baseContext) {
    return null;
  }

  baseCanvas.width = targetCanvas.width;
  baseCanvas.height = targetCanvas.height;
  baseContext.drawImage(targetCanvas, 0, 0);

  return () => {
    context.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
    context.drawImage(baseCanvas, 0, 0);

    liveCanvasEntries.forEach(({ sourceCanvas, x, y, width, height }) => {
      try {
        context.drawImage(sourceCanvas, x, y, width, height);
      } catch {
        // Ignore transient canvas read failures during page teardown.
      }
    });

    return true;
  };
};

const createCanvasSnapshotFromImage = ({
  image,
  width,
  height,
  cssWidth = width,
  cssHeight = height,
  liveCanvasEntries,
  source,
}) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;
  context?.drawImage(image, 0, 0, width, height);

  const refresh = attachLiveCanvasRefresh(canvas, liveCanvasEntries);
  refresh?.();

  return {
    image: canvas,
    width: cssWidth,
    height: cssHeight,
    source,
    refresh,
  };
};

const createTransparentCanvasDataUrl = (width, height) => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  return canvas.toDataURL("image/png");
};

const createCanvasDataUrl = (sourceCanvas) => {
  const width = Math.max(
    1,
    sourceCanvas.width || Math.round(sourceCanvas.clientWidth) || 1,
  );
  const height = Math.max(
    1,
    sourceCanvas.height || Math.round(sourceCanvas.clientHeight) || 1,
  );

  try {
    const snapshotCanvas = document.createElement("canvas");
    const snapshotContext = snapshotCanvas.getContext("2d");
    snapshotCanvas.width = width;
    snapshotCanvas.height = height;
    if (snapshotContext) {
      snapshotContext.clearRect(0, 0, width, height);
      snapshotContext.drawImage(sourceCanvas, 0, 0, width, height);
    }
    return snapshotCanvas.toDataURL("image/png");
  } catch {
    return createTransparentCanvasDataUrl(width, height);
  }
};

const inlineCanvasSnapshots = (sourceNode, clonedNode) => {
  const sourceCanvases = sourceNode.querySelectorAll("canvas");
  const clonedCanvases = clonedNode.querySelectorAll("canvas");

  sourceCanvases.forEach((sourceCanvas, index) => {
    const clonedCanvas = clonedCanvases[index];

    if (!clonedCanvas) {
      return;
    }

    const cssWidth = Math.max(1, sourceCanvas.clientWidth);
    const cssHeight = Math.max(1, sourceCanvas.clientHeight);
    const snapshot = document.createElement("img");
    snapshot.decoding = "sync";
    snapshot.src = createCanvasDataUrl(sourceCanvas);
    snapshot.width = cssWidth;
    snapshot.height = cssHeight;
    snapshot.style.width = `${cssWidth}px`;
    snapshot.style.height = `${cssHeight}px`;
    snapshot.style.display = "block";
    snapshot.style.background = "transparent";
    clonedCanvas.replaceWith(snapshot);
  });
};

const waitForImages = async (node) => {
  const images = Array.from(node.querySelectorAll("img"));

  await Promise.all(
    images.map((image) => {
      if (image.complete && image.naturalWidth > 0) {
        return Promise.resolve();
      }

      if (typeof image.decode === "function") {
        return image.decode().catch(() => undefined);
      }

      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    }),
  );
};

const canUseHtmlInCanvas = () => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  return (
    typeof canvas.requestPaint === "function" &&
    typeof context?.drawElementImage === "function"
  );
};

const createHtmlInCanvasStage = ({
  width,
  height,
  cssWidth,
  cssHeight,
  node,
}) => {
  const container = document.createElement("div");
  const canvas = document.createElement("canvas");
  const content = document.createElement("div");

  container.className = "detail-html-canvas-stage";
  container.style.position = "absolute";
  container.style.right = "0";
  container.style.bottom = "0";
  container.style.width = "1px";
  container.style.height = "1px";
  container.style.overflow = "hidden";
  container.style.pointerEvents = "none";
  container.style.zIndex = "-1";

  canvas.setAttribute("layoutsubtree", "");
  canvas.width = width;
  canvas.height = height;
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  content.style.width = `${cssWidth}px`;
  content.style.height = `${cssHeight}px`;
  content.style.boxSizing = "border-box";
  content.appendChild(node);
  canvas.appendChild(content);
  container.appendChild(canvas);
  document.body.appendChild(container);

  return { container, canvas, content };
};

const captureHtmlNodeWithHtmlInCanvas = (node, coverTextureUrl) =>
  new Promise((resolve, reject) => {
    if (!canUseHtmlInCanvas()) {
      reject(new Error("HTML-in-Canvas is not available"));
      return;
    }

    const rect = node.getBoundingClientRect();
    const cssWidth = Math.max(1, rect.width);
    const cssHeight = Math.max(1, rect.height);
    const width = Math.max(1, Math.round(cssWidth));
    const height = Math.max(1, Math.round(cssHeight));
    const liveCanvasEntries = getLiveCanvasEntries(node);
    const clonedNode = node.cloneNode(true);

    inlineCanvasSnapshots(node, clonedNode);
    clonedNode.style.width = `${cssWidth}px`;
    clonedNode.style.height = `${cssHeight}px`;
    clonedNode.style.boxSizing = "border-box";
    clonedNode.style.setProperty(
      "--detail-paper-texture",
      `url(${paperTextureUrl})`,
    );
    clonedNode.style.setProperty(
      "--detail-cover-texture",
      getCssImageValue(coverTextureUrl),
    );

    const { container, canvas, content } = createHtmlInCanvasStage({
      width,
      height,
      cssWidth,
      cssHeight,
      node: clonedNode,
    });
    const context = canvas.getContext("2d");
    let settled = false;
    let timeoutId = 0;

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      container.remove();
    };

    const finish = () => {
      if (settled) {
        return;
      }

      settled = true;

      try {
        context.reset?.();
        if (!context.reset) {
          context.setTransform(1, 0, 0, 1, 0, 0);
          context.clearRect(0, 0, canvas.width, canvas.height);
        }
        context.drawElementImage(content, 0, 0);
        cleanup();
        const refresh = attachLiveCanvasRefresh(canvas, liveCanvasEntries);
        refresh?.();
        resolve({
          image: canvas,
          width: cssWidth,
          height: cssHeight,
          source: "html-in-canvas",
          refresh,
        });
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    const fail = () => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      reject(new Error("HTML-in-Canvas paint timed out"));
    };

    waitForImages(content)
      .then(() => {
        if (settled) {
          return;
        }

        canvas.addEventListener("paint", finish, { once: true });
        canvas.onpaint = finish;
        timeoutId = window.setTimeout(fail, 600);
        canvas.requestPaint();
      })
      .catch((error) => {
        cleanup();
        reject(error);
      });
  });

const captureHtmlNodeWithSvg = (node, coverTextureUrl) =>
  new Promise((resolve, reject) => {
    if (!node) {
      reject(new Error("No node to capture"));
      return;
    }

    const rect = node.getBoundingClientRect();
    const cssWidth = Math.max(1, rect.width);
    const cssHeight = Math.max(1, rect.height);
    const width = Math.max(1, Math.round(cssWidth));
    const height = Math.max(1, Math.round(cssHeight));
    const liveCanvasEntries = getLiveCanvasEntries(node);
    const clonedNode = node.cloneNode(true);

    inlineCanvasSnapshots(node, clonedNode);
    clonedNode.style.width = `${cssWidth}px`;
    clonedNode.style.height = `${cssHeight}px`;
    clonedNode.style.boxSizing = "border-box";
    clonedNode.style.setProperty(
      "--detail-paper-texture",
      `url(${paperTextureUrl})`,
    );
    clonedNode.style.setProperty(
      "--detail-cover-texture",
      getCssImageValue(coverTextureUrl),
    );

    waitForImages(clonedNode)
      .then(() => {
        const styleText = getDocumentStyleText();
        const container = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
        container.setAttribute("style", `width:${width}px;height:${height}px;`);
        const style = document.createElementNS("http://www.w3.org/1999/xhtml", "style");
        style.textContent = styleText;
        container.append(style, clonedNode);
        // SVG requires XML-safe void elements and escaped text, including range inputs.
        const html = new XMLSerializer().serializeToString(container);
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            <foreignObject width="100%" height="100%">${html}</foreignObject>
          </svg>
        `;
        const image = new Image();

        image.onload = () => {
          resolve(
            createCanvasSnapshotFromImage({
              image,
              width,
              height,
              cssWidth,
              cssHeight,
              liveCanvasEntries,
              source: "svg-foreignObject",
            }),
          );
        };
        image.onerror = reject;
        image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      })
      .catch(reject);
  });

const captureHtmlNodeAsImage = async (node, coverTextureUrl) => {
  try {
    return await captureHtmlNodeWithHtmlInCanvas(node, coverTextureUrl);
  } catch {
    return captureHtmlNodeWithSvg(node, coverTextureUrl);
  }
};

const getCoverTurnMode = (fromPage, toPage) => {
  if (fromPage?.type === "cover" && toPage?.type === "intro") {
    return 1;
  }

  if (fromPage?.type === "intro" && toPage?.type === "cover") {
    return 2;
  }

  return 0;
};

const refreshSnapshotTextures = (renderer, fromSnapshot, toSnapshot) => {
  const didRefreshFrom = fromSnapshot?.refresh?.() || false;
  const didRefreshTo = toSnapshot?.refresh?.() || false;

  if (!didRefreshFrom && !didRefreshTo) {
    return;
  }

  renderer?.updateTextures?.({
    fromImage: didRefreshFrom ? fromSnapshot.image : null,
    toImage: didRefreshTo ? toSnapshot.image : null,
  });
};

const easeInOutCubic = (value) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

const drawBookTurnFrame = (
  ctx,
  fromSnapshot,
  toSnapshot,
  direction,
  progress,
) => {
  const { width, height } = fromSnapshot;
  const eased = easeInOutCubic(progress);
  const halfWidth = width * 0.5;
  const pageLeft = direction > 0 ? halfWidth : 0;
  const pageRight = direction > 0 ? width : halfWidth;
  const turnX =
    direction > 0
      ? pageRight - halfWidth * eased
      : pageLeft + halfWidth * eased;
  const curlWidth = Math.max(56, halfWidth * 0.22) * Math.sin(eased * Math.PI);
  const cornerY = height * (0.94 - eased * 0.72);
  const creaseTopY = height * (0.08 + eased * 0.1);
  const creaseBottomY = height * (0.98 - eased * 0.02);

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(toSnapshot.image, 0, 0, width, height);

  ctx.save();
  if (direction > 0) {
    ctx.beginPath();
    ctx.rect(0, 0, halfWidth, height);
    ctx.moveTo(halfWidth, 0);
    ctx.lineTo(turnX, creaseTopY);
    ctx.quadraticCurveTo(
      turnX - curlWidth * 0.35,
      height * 0.5,
      turnX,
      creaseBottomY,
    );
    ctx.lineTo(halfWidth, height);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(fromSnapshot.image, 0, 0, width, height);
  } else {
    ctx.beginPath();
    ctx.rect(halfWidth, 0, halfWidth, height);
    ctx.moveTo(halfWidth, 0);
    ctx.lineTo(turnX, creaseTopY);
    ctx.quadraticCurveTo(
      turnX + curlWidth * 0.35,
      height * 0.5,
      turnX,
      creaseBottomY,
    );
    ctx.lineTo(halfWidth, height);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(fromSnapshot.image, 0, 0, width, height);
  }
  ctx.restore();

  if (curlWidth <= 0.5) {
    return;
  }

  const curlGradient = ctx.createLinearGradient(
    direction > 0 ? turnX - curlWidth : turnX + curlWidth,
    0,
    turnX,
    0,
  );

  curlGradient.addColorStop(0, "rgb(255 252 238 / 0)");
  curlGradient.addColorStop(0.45, "rgb(255 252 238 / 0.82)");
  curlGradient.addColorStop(0.7, "rgb(196 172 126 / 0.5)");
  curlGradient.addColorStop(1, "rgb(44 32 20 / 0.34)");

  ctx.save();
  if (direction > 0) {
    ctx.beginPath();
    ctx.moveTo(turnX, creaseTopY);
    ctx.quadraticCurveTo(
      turnX - curlWidth * 0.65,
      cornerY,
      turnX - curlWidth,
      height,
    );
    ctx.lineTo(turnX, height);
    ctx.quadraticCurveTo(
      turnX - curlWidth * 0.35,
      height * 0.55,
      turnX,
      creaseTopY,
    );
    ctx.closePath();
  } else {
    ctx.beginPath();
    ctx.moveTo(turnX, creaseTopY);
    ctx.quadraticCurveTo(
      turnX + curlWidth * 0.65,
      cornerY,
      turnX + curlWidth,
      height,
    );
    ctx.lineTo(turnX, height);
    ctx.quadraticCurveTo(
      turnX + curlWidth * 0.35,
      height * 0.55,
      turnX,
      creaseTopY,
    );
    ctx.closePath();
  }
  ctx.fillStyle = curlGradient;
  ctx.fill();
  ctx.strokeStyle = "rgb(75 55 32 / 0.28)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
};

function Detail({
  animalId,
  enterDuration = 400,
  isOpen = true,
  onOpen,
  onBackClick,
  onEnterComplete,
  inactivityRemainingSeconds,
}) {
  const [isAnimating, setIsAnimating] = React.useState(true);
  const [activePageKey, setActivePageKey] = React.useState(null);
  const [isTurningPage, setIsTurningPage] = React.useState(false);
  const [turningTargetPageIndex, setTurningTargetPageIndex] =
    React.useState(null);
  const [isTurnSnapshotReady, setIsTurnSnapshotReady] = React.useState(false);
  const [turnCapturePageKey, setTurnCapturePageKey] = React.useState(null);
  const [turnCaptureSize, setTurnCaptureSize] = React.useState(null);
  const [isBookOpen, setIsBookOpen] = React.useState(false);
  const [isBookReturning, setIsBookReturning] = React.useState(false);
  const [isBookLaunching, setIsBookLaunching] = React.useState(false);
  const [isBookExpanding, setIsBookExpanding] = React.useState(false);
  const [introPointerVector, setIntroPointerVector] = React.useState({
    x: 1,
    y: 0,
  });
  const [introSpriteOffset, setIntroSpriteOffset] = React.useState({
    x: 0,
    y: 0,
  });
  const [introAnimationTimeMs, setIntroAnimationTimeMs] = React.useState(0);
  const bookOpenTimerRef = React.useRef(null);
  const bookCloseTimerRef = React.useRef(null);
  const bookLaunchFrameRef = React.useRef(null);
  const bookTransitionLockRef = React.useRef(false);
  const introPointerTargetRef = React.useRef({
    x: 0,
    y: 0,
    isInsideBook: false,
    lookX: 1,
    lookY: 0,
  });
  const introHomeAnimalRef = React.useRef(null);
  const introHomeAnimalIdRef = React.useRef(null);
  const [previewControls, setPreviewControls] = React.useState({});
  const animal = getAnimalDetails(animalId);
  const animalAccentColor =
    ANIMAL_ACCENT_COLORS[animalId] || "rgb(80 62 42)";
  const introAtlas = HOME_SPRITE_ATLASES[animalId];
  const coverTextureUrl = getBookCoverTexture(animalId);
  const coverTextureCssValue = getCssImageValue(coverTextureUrl);
  const introArtworkRef = React.useRef(null);
  const pageSurfaceRef = React.useRef(null);
  const turnCaptureSurfaceRef = React.useRef(null);
  const turnCanvasRef = React.useRef(null);
  const isPageTurnRunningRef = React.useRef(false);
  const dragStartXRef = React.useRef(null);
  const dragTurnRef = React.useRef(null);
  const didAutoFirstTurnRef = React.useRef(false);
  const pendingCloseAfterCoverRef = React.useRef(false);
  const closeBookFromCoverRef = React.useRef(null);
  const grasshopperIntroFlightRef = React.useRef({
    isFlying: false,
    startedAtMs: 0,
  });

  const ruleSpreads = React.useMemo(() => {
    return Array.isArray(animal?.rules)
      ? animal.rules.map((ruleGroup) => ({
          key: ruleGroup.id,
          label: ruleGroup.category,
          ruleGroup,
          type: "rule",
        }))
      : [];
  }, [animal]);

  const bookSpreads = React.useMemo(
    () => [
      {
        key: "cover",
        label: "Cover",
        type: "cover",
      },
      {
        key: "intro",
        label: "소개",
        type: "intro",
      },
      ...ruleSpreads,
    ],
    [ruleSpreads],
  );

  const activePageIndex = React.useMemo(() => {
    if (!bookSpreads.length) {
      return -1;
    }

    const foundIndex = bookSpreads.findIndex(
      (page) => page.key === activePageKey,
    );

    return foundIndex >= 0 ? foundIndex : 0;
  }, [activePageKey, bookSpreads]);

  const activePage = activePageIndex >= 0 ? bookSpreads[activePageIndex] : null;
  const navigationPageIndex = turningTargetPageIndex ?? activePageIndex;
  const turnCapturePage = React.useMemo(() => {
    if (!turnCapturePageKey) {
      return null;
    }

    return bookSpreads.find((page) => page.key === turnCapturePageKey) || null;
  }, [bookSpreads, turnCapturePageKey]);
  const isBookSpreadOpen = isOpen && isBookOpen;
  const isBookClosedSpread = !isBookSpreadOpen;
  const bookStageStyle = {
    position: "relative",
    width: "min(94rem, calc(100% - 1.5rem))",
    height: "min(58rem, calc(100vh - 1rem))",
    margin: "0 auto",
    padding: 0,
    boxSizing: "border-box",
    perspective: "90rem",
  };
  const bookContainerStyle = {
    width: "100%",
    padding: 0,
    margin: 0,
  };
  const turnCanvasStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 230,
    pointerEvents: "none",
    opacity: isTurningPage && isTurnSnapshotReady ? 1 : 0,
    transformOrigin: "left center",
  };
  const bookSpreadStyle = {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
    height: "100%",
  };
  const turnCaptureWrapperStyle = turnCaptureSize
    ? {
        position: "fixed",
        left: "-10000px",
        top: 0,
        width: `${turnCaptureSize.width}px`,
        height: `${turnCaptureSize.height}px`,
        pointerEvents: "none",
        overflow: "hidden",
        opacity: 1,
        zIndex: -1,
      }
    : null;
  const introSprite = React.useMemo(() => {
    if (!introAtlas) {
      return null;
    }
    const resolvedAtlas = getIntroAtlas(animalId, introAtlas);
    if (animalId === "grasshopper") {
      const shouldFly = Math.hypot(introPointerVector.x, introPointerVector.y) > 0.35;

      if (shouldFly !== grasshopperIntroFlightRef.current.isFlying) {
        grasshopperIntroFlightRef.current = {
          isFlying: shouldFly,
          startedAtMs: shouldFly ? introAnimationTimeMs : 0,
        };
      }
    }

    const introState = getIntroSpriteState({
      animalId,
      pointerVector: introPointerVector,
      timestampMs: introAnimationTimeMs,
      grasshopperFlightStartMs: grasshopperIntroFlightRef.current.startedAtMs,
    });

    const resolvedSprite = resolveDomAtlasSprite(resolvedAtlas, {
      velocity: introPointerVector,
      state: introState,
      profile: "detail",
    });
    const displaySprite = applyIntroSpriteOverrides(
      animalId,
      resolvedSprite,
      introPointerVector,
      introState,
      introHomeAnimalRef.current,
      introAnimationTimeMs,
    );
    const sequence = getIntroSpriteFrameSequence(
      animalId,
      displaySprite.stage,
      resolveStageFrameSequence(resolvedAtlas, displaySprite.stage),
    );
    const frame = getIntroSpriteFrame(sequence, introAnimationTimeMs);
    const frameSize = resolveAtlasFrameSize(resolvedAtlas);
    const frameRatio =
      frameSize.width > 0 && frameSize.height > 0
        ? frameSize.width / frameSize.height
        : 1;

    return {
      ...displaySprite,
      frame,
      style: {
        ...getAtlasFrameStyle({
          atlas: resolvedAtlas,
          frame,
        }),
        "--detail-intro-sprite-ratio": frameRatio,
        ...(animalId === "spiny_lobster"
          ? {
              "--detail-intro-artwork-size": `min(${(
                74 * SPINY_LOBSTER_FRAME_WIDTH_COMPENSATION
              ).toFixed(2)}%, ${(
                24 * SPINY_LOBSTER_FRAME_WIDTH_COMPENSATION
              ).toFixed(2)}rem)`,
            }
          : null),
        aspectRatio: `${frameSize.width} / ${frameSize.height}`,
      },
    };
  }, [animalId, introAnimationTimeMs, introAtlas, introPointerVector]);

  const updateIntroPointerVector = React.useCallback((clientX, clientY) => {
    const node = introArtworkRef.current;

    if (!node) {
      return;
    }

    const rect = node.getBoundingClientRect();
    const bookRect = pageSurfaceRef.current?.getBoundingClientRect();
    const isInsideBook =
      bookRect &&
      clientX >= bookRect.left &&
      clientX <= bookRect.right &&
      clientY >= bookRect.top &&
      clientY <= bookRect.bottom;

    const artworkHomeX = rect.left + rect.width * 0.74;
    const artworkHomeY = rect.top + rect.height * 0.42;
    const nextVector = {
      x: clientX - artworkHomeX,
      y: clientY - artworkHomeY,
    };

    if (isInsideBook) {
      const targetInsetX = rect.width * INTRO_BOUNDARY_MARGIN_RATIO;
      const targetInsetY = rect.height * INTRO_BOUNDARY_MARGIN_RATIO;
      const targetX = clamp(
        clientX,
        rect.left + targetInsetX,
        rect.right - targetInsetX,
      );
      const targetY = clamp(
        clientY,
        rect.top + targetInsetY,
        rect.bottom - targetInsetY,
      );

      introPointerTargetRef.current = {
        x: targetX - rect.left,
        y: targetY - rect.top,
        isInsideBook: true,
        lookX: nextVector.x,
        lookY: nextVector.y,
      };
    } else {
      introPointerTargetRef.current = {
        x: rect.width * 0.74,
        y: rect.height * 0.42,
        isInsideBook: false,
        lookX: nextVector.x,
        lookY: nextVector.y,
      };
    }
  }, []);

  const clearTurnCanvas = React.useCallback(() => {
    const canvas = turnCanvasRef.current;

    if (!canvas) {
      return;
    }

    canvas.width = 0;
    canvas.height = 0;
    canvas.style.width = "0px";
    canvas.style.height = "0px";
    setIsTurnSnapshotReady(false);
  }, []);

  const clearTurnCapture = React.useCallback(() => {
    setTurnCapturePageKey(null);
    setTurnCaptureSize(null);
  }, []);

  const capturePreparedPage = React.useCallback(
    async (pageKey, size) => {
      setTurnCaptureSize(size);
      setTurnCapturePageKey(pageKey);

      await waitForSpreadKey(pageKey, () => turnCaptureSurfaceRef.current);

      const captureNode = turnCaptureSurfaceRef.current;

      if (!captureNode) {
        throw new Error("Turn capture surface was not mounted");
      }

      return captureHtmlNodeAsImage(captureNode, coverTextureUrl);
    },
    [coverTextureUrl],
  );

  React.useEffect(() => {
    setActivePageKey("cover");
  }, [animalId]);

  React.useEffect(() => {
    grasshopperIntroFlightRef.current = {
      isFlying: false,
      startedAtMs: 0,
    };
    introPointerTargetRef.current = {
      x: 0,
      y: 0,
      isInsideBook: false,
      lookX: 1,
      lookY: 0,
    };
    introHomeAnimalRef.current = null;
    introHomeAnimalIdRef.current = null;
    setIntroSpriteOffset({
      x: 0,
      y: 0,
    });
  }, [activePageKey, animalId]);

  React.useEffect(() => {
    if (!isOpen || activePageKey !== "intro") {
      return undefined;
    }

    const handlePointerMove = (event) => {
      updateIntroPointerVector(event.clientX, event.clientY);
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [activePageKey, isOpen, updateIntroPointerVector]);

  React.useEffect(() => {
    if (!isOpen || activePageKey !== "intro" || !introAtlas) {
      return undefined;
    }

    let animationFrameId = 0;

    const updateAnimationTime = (timestampMs) => {
      setIntroAnimationTimeMs(timestampMs);
      const node = introArtworkRef.current;
      const behavior = behaviorMap[animalId];

      if (node && behavior?.init && behavior?.update) {
        const rect = node.getBoundingClientRect();
        const spriteWidth = Math.max(36, rect.width * 0.12);
        const spriteHeight = Math.max(24, rect.height * 0.12);
        const homeX = rect.width * 0.74 - spriteWidth * 0.5;
        const homeY = rect.height * 0.42 - spriteHeight * 0.5;

        if (
          !introHomeAnimalRef.current ||
          introHomeAnimalIdRef.current !== animalId
        ) {
          const introAnimal = behavior.init(
            { width: rect.width, height: rect.height },
            spriteWidth,
            spriteHeight,
          );

          introAnimal.isHome = true;
          introAnimal.x = homeX;
          introAnimal.y = homeY;
          introAnimal.width = spriteWidth;
          introAnimal.height = spriteHeight;
          setIntroAnimalSpeed(introAnimal, animalId);
          disableIntroDash(animalId, introAnimal);
          introHomeAnimalRef.current = introAnimal;
          introHomeAnimalIdRef.current = animalId;
        }

        const introAnimal = introHomeAnimalRef.current;
        introAnimal.width = spriteWidth;
        introAnimal.height = spriteHeight;
        introAnimal.time = (introAnimal.time || 0) + 1;
        introAnimal.baseSpeed = resolveIntroBaseSpeed(animalId);
        disableIntroDash(animalId, introAnimal);

        const target = introPointerTargetRef.current;
        const animalCenterX = introAnimal.x + spriteWidth * 0.5;
        const animalCenterY = introAnimal.y + spriteHeight * 0.5;
        const targetCenterX = target.isInsideBook
          ? target.x
          : rect.width * 0.74;
        const targetCenterY = target.isInsideBook
          ? target.y
          : rect.height * 0.42;
        const dx = targetCenterX - animalCenterX;
        const dy = targetCenterY - animalCenterY;
        const distance = Math.hypot(dx, dy);

        if (distance > 0.01) {
          const baseSpeed = resolveIntroBaseSpeed(animalId);
          const currentDirection = normalizeVector(
            introAnimal.vx || 1,
            introAnimal.vy || 0,
          );
          let desiredDirection = normalizeVector(dx, dy, currentDirection);

          if (
            target.isInsideBook &&
            !shouldUseDirectIntroPointer(animalId)
          ) {
            const turnRadius =
              Math.max(spriteWidth, spriteHeight) *
              INTRO_POINTER_TURN_RADIUS_RATIO;
            const proximity = clamp(1 - distance / turnRadius, 0, 1);

            if (proximity > 0) {
              const tangentDirection = normalizeVector(
                -desiredDirection.y,
                desiredDirection.x,
                currentDirection,
              );
              const awayDirection = normalizeVector(
                -desiredDirection.x,
                -desiredDirection.y,
                currentDirection,
              );

              desiredDirection = normalizeVector(
                desiredDirection.x * (1 - proximity) +
                  tangentDirection.x * (0.9 * proximity) +
                  awayDirection.x * (0.38 * proximity),
                desiredDirection.y * (1 - proximity) +
                  tangentDirection.y * (0.9 * proximity) +
                  awayDirection.y * (0.38 * proximity),
                currentDirection,
              );
            }
          }

          const desiredSpeed =
            baseSpeed * (target.isInsideBook ? INTRO_POINTER_MAX_SPEED_RATIO : 1.1);
          const steerWeight = target.isInsideBook
            ? INTRO_POINTER_STEER_WEIGHT
            : INTRO_HOME_STEER_WEIGHT;
          const desiredVx = desiredDirection.x * desiredSpeed;
          const desiredVy = desiredDirection.y * desiredSpeed;

          introAnimal.vx += (desiredVx - introAnimal.vx) * steerWeight;
          introAnimal.vy += (desiredVy - introAnimal.vy) * steerWeight;
        }

        applyIntroBoundarySteer(
          introAnimal,
          animalId,
          rect,
          spriteWidth,
          spriteHeight,
        );
        limitIntroAnimalSpeed(
          introAnimal,
          resolveIntroBaseSpeed(animalId) * (target.isInsideBook ? 1.45 : 1.2),
        );

        if (shouldUseDirectIntroPointer(animalId)) {
          const currentHeading = Number.isFinite(introAnimal.heading)
            ? introAnimal.heading
            : Math.atan2(introAnimal.vy || 0, introAnimal.vx || 1);
          const targetHeading = Math.atan2(dy, dx || 1);
          const nextHeading = lerpAngle(currentHeading, targetHeading, 0.16);
          const swimSpeed =
            resolveIntroBaseSpeed(animalId) *
            (target.isInsideBook ? INTRO_POINTER_MAX_SPEED_RATIO : 1.1);

          introAnimal.heading = nextHeading;
          introAnimal.targetHeading = targetHeading;
          introAnimal.vx = Math.cos(nextHeading) * swimSpeed;
          introAnimal.vy = Math.sin(nextHeading) * swimSpeed;
          introAnimal.x += introAnimal.vx;
          introAnimal.y += introAnimal.vy;
        } else {
          const updateRect =
            animalId === "firefly"
              ? {
                  width: rect.width + spriteWidth * 2,
                  height: rect.height + spriteHeight * 2,
                }
              : {
                  width: rect.width,
                  height: rect.height,
                };

          behavior.update(introAnimal, updateRect);
        }

        disableIntroDash(animalId, introAnimal);
        limitIntroAnimalSpeed(
          introAnimal,
          resolveIntroBaseSpeed(animalId) * (target.isInsideBook ? 1.45 : 1.2),
        );
        containIntroAnimalInBook(
          introAnimal,
          rect,
          spriteWidth,
          spriteHeight,
        );

        const speed = Math.hypot(introAnimal.vx || 0, introAnimal.vy || 0);

        if (!target.isInsideBook && distance < 2.5) {
          introAnimal.vx *= 0.76;
          introAnimal.vy *= 0.76;
          if (Math.hypot(target.lookX || 0, target.lookY || 0) > 1) {
            setIntroPointerVector({
              x: target.lookX,
              y: target.lookY,
            });
          }
        } else if (speed > 0.01) {
          setIntroPointerVector({
            x: introAnimal.vx,
            y: introAnimal.vy,
          });
        }

        setIntroSpriteOffset({
          x: introAnimal.x - homeX,
          y: introAnimal.y - homeY,
        });

        animationFrameId = window.requestAnimationFrame(updateAnimationTime);
        return;
      }

      setIntroSpriteOffset((current) => {
        const target = introPointerTargetRef.current;
        const fallbackTarget = target.isInsideBook
          ? { x: target.x, y: target.y }
          : { x: 0, y: 0 };
        const next = {
          x: current.x + (fallbackTarget.x - current.x) * 0.08,
          y: current.y + (fallbackTarget.y - current.y) * 0.08,
        };

        if (
          Math.abs(next.x - current.x) < 0.05 &&
          Math.abs(next.y - current.y) < 0.05
        ) {
          return current;
        }

        return next;
      });
      animationFrameId = window.requestAnimationFrame(updateAnimationTime);
    };

    animationFrameId = window.requestAnimationFrame(updateAnimationTime);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [activePageKey, animalId, introAtlas, isOpen]);

  React.useEffect(() => {
    window.clearTimeout(bookOpenTimerRef.current);
    window.clearTimeout(bookCloseTimerRef.current);

    if (!isOpen) {
      bookTransitionLockRef.current = false;
      setIsBookOpen(false);
      setIsAnimating(false);
      setActivePageKey("cover");
      didAutoFirstTurnRef.current = false;
      pendingCloseAfterCoverRef.current = false;
      setIsBookReturning(false);
      setIsBookLaunching(false);
      setIsBookExpanding(false);
      return undefined;
    }

    setIsAnimating(true);
    bookTransitionLockRef.current = true;
    setIsBookOpen(false);
    setIsBookReturning(false);
    setActivePageKey("cover");
    didAutoFirstTurnRef.current = false;
    pendingCloseAfterCoverRef.current = false;

    if (isBookLaunching) {
      setIsBookExpanding(true);
      window.cancelAnimationFrame(bookLaunchFrameRef.current);
      bookLaunchFrameRef.current = window.requestAnimationFrame(() => {
        bookLaunchFrameRef.current = window.requestAnimationFrame(() => {
          setIsBookLaunching(false);
        });
      });
    }

    bookOpenTimerRef.current = window.setTimeout(() => {
      setIsBookOpen(true);
      setIsBookExpanding(false);
      bookTransitionLockRef.current = false;
    }, BOOK_OPEN_DELAY_MS);

    return () => {
      window.clearTimeout(bookOpenTimerRef.current);
      window.cancelAnimationFrame(bookLaunchFrameRef.current);
    };
  }, [animalId, isBookLaunching, isOpen]);

  React.useEffect(
    () => () => {
      window.clearTimeout(bookOpenTimerRef.current);
      window.clearTimeout(bookCloseTimerRef.current);
      window.cancelAnimationFrame(bookLaunchFrameRef.current);
    },
    [],
  );

  React.useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      onEnterComplete?.();
    }, enterDuration);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [enterDuration, isOpen, onEnterComplete]);

  const closeBookFromCover = React.useCallback(() => {
    if (bookTransitionLockRef.current) {
      return;
    }

    bookTransitionLockRef.current = true;
    pendingCloseAfterCoverRef.current = false;
    window.clearTimeout(bookOpenTimerRef.current);
    window.cancelAnimationFrame(bookLaunchFrameRef.current);
    setIsBookLaunching(false);
    setIsBookExpanding(false);
    setIsBookReturning(true);
    setIsBookOpen(false);
    window.clearTimeout(bookCloseTimerRef.current);
    bookCloseTimerRef.current = window.setTimeout(() => {
      setActivePageKey("cover");
      setIsBookReturning(false);
      setIsAnimating(false);
      bookTransitionLockRef.current = false;
      onBackClick();
    }, BOOK_CLOSE_DELAY_MS);
  }, [onBackClick]);

  closeBookFromCoverRef.current = closeBookFromCover;

  const handleClosedBookOpen = () => {
    if (isOpen || bookTransitionLockRef.current) {
      return;
    }

    bookTransitionLockRef.current = true;
    setIsBookLaunching(true);
    onOpen?.();
  };

  const animatePageTurn = React.useCallback(
    async (nextIndex) => {
      const nextPage = bookSpreads[nextIndex];

      if (
        !nextPage ||
        nextIndex === activePageIndex ||
        isPageTurnRunningRef.current
      ) {
        return;
      }

      const pageNode = pageSurfaceRef.current;
      const canvas = turnCanvasRef.current;

      if (!pageNode || !canvas) {
        setActivePageKey(nextPage.key);
        setTurningTargetPageIndex(null);
        if (nextPage.type === "cover" && pendingCloseAfterCoverRef.current) {
          window.setTimeout(() => {
            closeBookFromCoverRef.current?.();
          }, BOOK_AUTO_FIRST_TURN_DELAY_MS);
        }
        return;
      }

      isPageTurnRunningRef.current = true;
      setTurningTargetPageIndex(nextIndex);

      try {
        const fromSnapshot = await captureHtmlNodeAsImage(
          pageNode,
          coverTextureUrl,
        );
        const coverMode = getCoverTurnMode(activePage, nextPage);

        const direction = nextIndex > activePageIndex ? 1 : -1;
        const dpr = window.devicePixelRatio || 1;
        const captureSize = {
          width: fromSnapshot.width,
          height: fromSnapshot.height,
        };

        canvas.width = Math.round(fromSnapshot.width * dpr);
        canvas.height = Math.round(fromSnapshot.height * dpr);
        canvas.style.width = `${fromSnapshot.width}px`;
        canvas.style.height = `${fromSnapshot.height}px`;

        let stagingRenderer = null;

        try {
          stagingRenderer = createBookCurlRenderer({
            canvas,
            fromImage: fromSnapshot.image,
            toImage: fromSnapshot.image,
            width: fromSnapshot.width,
            height: fromSnapshot.height,
            direction,
            coverMode,
          });
          refreshSnapshotTextures(stagingRenderer, fromSnapshot, fromSnapshot);
          stagingRenderer?.render(1);
        } catch {
          stagingRenderer = null;
        }

        setIsTurningPage(true);
        setIsTurnSnapshotReady(false);

        window.requestAnimationFrame(async () => {
          try {
            const toSnapshot = await capturePreparedPage(
              nextPage.key,
              captureSize,
            );
            clearTurnCapture();
            setIsTurnSnapshotReady(true);
            const completeTurn = () => {
              setActivePageKey(nextPage.key);
              setIsTurningPage(false);
              setIsTurnSnapshotReady(false);
              setTurningTargetPageIndex(null);
              isPageTurnRunningRef.current = false;
              if (
                nextPage.type === "cover" &&
                pendingCloseAfterCoverRef.current
              ) {
                window.setTimeout(() => {
                  closeBookFromCoverRef.current?.();
                }, BOOK_AUTO_FIRST_TURN_DELAY_MS);
              }
              window.requestAnimationFrame(clearTurnCanvas);
            };
            let dispose = null;

            try {
              stagingRenderer?.dispose?.();
              dispose = renderBookCurlTransition({
                canvas,
                fromImage: fromSnapshot.image,
                toImage: toSnapshot.image,
                width: fromSnapshot.width,
                height: fromSnapshot.height,
                direction,
                durationMs: CANVAS_TURN_DURATION,
                beforeRender: (renderer) =>
                  refreshSnapshotTextures(renderer, fromSnapshot, toSnapshot),
                onComplete: completeTurn,
                coverMode,
              });
            } catch {
              dispose = null;
            }

            if (dispose) {
              return;
            }

            const ctx = canvas.getContext("2d");

            if (!ctx) {
              completeTurn();
              return;
            }

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const startTime = performance.now();
            setIsTurningPage(true);
            setIsTurnSnapshotReady(true);

            const draw = (now) => {
              const progress = Math.min(
                1,
                (now - startTime) / CANVAS_TURN_DURATION,
              );

              fromSnapshot.refresh?.();
              toSnapshot.refresh?.();
              drawBookTurnFrame(
                ctx,
                fromSnapshot,
                toSnapshot,
                direction,
                progress,
              );

              if (progress < 1) {
                window.requestAnimationFrame(draw);
                return;
              }

              completeTurn();
            };

            window.requestAnimationFrame(draw);
          } catch {
            stagingRenderer?.dispose?.();
            clearTurnCapture();
            setIsTurningPage(false);
            setIsTurnSnapshotReady(false);
            setTurningTargetPageIndex(null);
            isPageTurnRunningRef.current = false;
            window.requestAnimationFrame(clearTurnCanvas);
          }
        });
      } catch {
        clearTurnCapture();
        setActivePageKey(nextPage.key);
        setIsTurningPage(false);
        setIsTurnSnapshotReady(false);
        setTurningTargetPageIndex(null);
        isPageTurnRunningRef.current = false;
        window.requestAnimationFrame(clearTurnCanvas);
      }
    },
    [
      activePage,
      activePageIndex,
      bookSpreads,
      capturePreparedPage,
      clearTurnCanvas,
      clearTurnCapture,
      coverTextureUrl,
    ],
  );

  const goToPage = (nextIndex) => {
    if (nextIndex === 0) {
      pendingCloseAfterCoverRef.current = true;
    }

    animatePageTurn(nextIndex);
  };

  const getCurlPosFromClientX = React.useCallback((clientX, direction) => {
    const pageNode = pageSurfaceRef.current;

    if (!pageNode) {
      return 1;
    }

    const rect = pageNode.getBoundingClientRect();
    const normalized =
      direction > 0
        ? (clientX - rect.left) / Math.max(rect.width, 1)
        : (rect.right - clientX) / Math.max(rect.width, 1);

    return clamp(normalized, 0.005, 1);
  }, []);

  const cleanupDragTurn = React.useCallback(() => {
    dragTurnRef.current?.renderer?.dispose?.();
    dragTurnRef.current?.stagingRenderer?.dispose?.();
    dragTurnRef.current = null;
    dragStartXRef.current = null;
    setTurningTargetPageIndex(null);
  }, []);

  const finishInteractiveTurn = React.useCallback(
    ({ shouldComplete }) => {
      const dragTurn = dragTurnRef.current;

      if (!dragTurn?.renderer) {
        if (dragTurn) {
          dragTurn.releaseRequested = true;
          dragTurn.shouldComplete = shouldComplete;
        }
        return;
      }

      const startCurl = dragTurn.currentCurl ?? 1;
      const endCurl = shouldComplete ? 0.005 : 1;
      const startTime = performance.now();
      const duration = Math.max(
        140,
        CANVAS_TURN_DURATION * Math.abs(startCurl - endCurl),
      );

      const draw = (now) => {
        if (dragTurnRef.current !== dragTurn) {
          return;
        }

        const progress = Math.min(1, (now - startTime) / duration);
        const eased =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        const nextCurl = startCurl + (endCurl - startCurl) * eased;

        dragTurn.currentCurl = nextCurl;
        refreshSnapshotTextures(
          dragTurn.renderer,
          dragTurn.fromSnapshot,
          dragTurn.toSnapshot,
        );
        dragTurn.renderer.render(nextCurl, now);

        if (progress < 1) {
          window.requestAnimationFrame(draw);
          return;
        }

        if (shouldComplete) {
          const completedPage = bookSpreads[dragTurn.nextIndex];
          if (completedPage) {
            setActivePageKey(completedPage.key);
            if (completedPage.type === "cover") {
              window.setTimeout(() => {
                closeBookFromCoverRef.current?.();
              }, BOOK_AUTO_FIRST_TURN_DELAY_MS);
            }
          }
        } else {
          setActivePageKey(dragTurn.fromKey);
        }

        setIsTurningPage(false);
        setIsTurnSnapshotReady(false);
        setTurningTargetPageIndex(null);
        isPageTurnRunningRef.current = false;
        cleanupDragTurn();
        window.requestAnimationFrame(clearTurnCanvas);
      };

      window.requestAnimationFrame(draw);
    },
    [bookSpreads, cleanupDragTurn, clearTurnCanvas],
  );

  React.useEffect(() => {
    if (
      !isOpen ||
      !isBookOpen ||
      activePageKey !== "cover" ||
      didAutoFirstTurnRef.current ||
      pendingCloseAfterCoverRef.current
    ) {
      return undefined;
    }

    didAutoFirstTurnRef.current = true;
    const timerId = window.setTimeout(() => {
      if (!isPageTurnRunningRef.current) {
        animatePageTurn(1);
      }
    }, BOOK_AUTO_FIRST_TURN_DELAY_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [activePageKey, animatePageTurn, isBookOpen, isOpen]);

  React.useEffect(() => {
    if (
      !pendingCloseAfterCoverRef.current ||
      activePageKey !== "intro" ||
      isPageTurnRunningRef.current
    ) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      animatePageTurn(0);
    }, BOOK_AUTO_FIRST_TURN_DELAY_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [activePageKey, animatePageTurn]);

  const handleBack = () => {
    if (isPageTurnRunningRef.current || bookTransitionLockRef.current) {
      return;
    }

    if (activePageIndex <= 0) {
      closeBookFromCover();
      return;
    }

    pendingCloseAfterCoverRef.current = true;
    animatePageTurn(0);
  };

  const handleBackdropClick = (event) => {
    if (!isOpen) {
      return;
    }

    if (bookTransitionLockRef.current) {
      return;
    }

    if (
      event.target.closest(".detail-book-stage") ||
      event.target.closest("button")
    ) {
      return;
    }

    handleBack();
  };

  const startInteractiveTurn = React.useCallback(
    async ({ clientX, direction }) => {
      const nextIndex = activePageIndex + (direction > 0 ? 1 : -1);
      const nextPage = bookSpreads[nextIndex];
      const pageNode = pageSurfaceRef.current;
      const canvas = turnCanvasRef.current;

      if (!nextPage || !pageNode || !canvas || isPageTurnRunningRef.current) {
        return;
      }

      isPageTurnRunningRef.current = true;
      setTurningTargetPageIndex(nextIndex);

      const dragTurn = {
        fromKey: activePage?.key,
        nextIndex,
        direction,
        renderer: null,
        stagingRenderer: null,
        fromSnapshot: null,
        toSnapshot: null,
        currentCurl: getCurlPosFromClientX(clientX, direction),
        pendingClientX: clientX,
        releaseRequested: false,
        shouldComplete: false,
      };

      dragTurnRef.current = dragTurn;

      try {
        const fromSnapshot = await captureHtmlNodeAsImage(
          pageNode,
          coverTextureUrl,
        );
        const coverMode = getCoverTurnMode(activePage, nextPage);

        const dpr = window.devicePixelRatio || 1;
        const captureSize = {
          width: fromSnapshot.width,
          height: fromSnapshot.height,
        };

        dragTurn.fromSnapshot = fromSnapshot;

        canvas.width = Math.round(fromSnapshot.width * dpr);
        canvas.height = Math.round(fromSnapshot.height * dpr);
        canvas.style.width = `${fromSnapshot.width}px`;
        canvas.style.height = `${fromSnapshot.height}px`;

        try {
          dragTurn.stagingRenderer = createBookCurlRenderer({
            canvas,
            fromImage: fromSnapshot.image,
            toImage: fromSnapshot.image,
            width: fromSnapshot.width,
            height: fromSnapshot.height,
            direction,
            coverMode,
          });
          refreshSnapshotTextures(
            dragTurn.stagingRenderer,
            fromSnapshot,
            fromSnapshot,
          );
          dragTurn.stagingRenderer?.render(1);
        } catch {
          dragTurn.stagingRenderer = null;
        }

        setIsTurningPage(true);
        setIsTurnSnapshotReady(false);

        window.requestAnimationFrame(async () => {
          if (dragTurnRef.current !== dragTurn) {
            return;
          }

          try {
            const toSnapshot = await capturePreparedPage(
              nextPage.key,
              captureSize,
            );
            clearTurnCapture();
            dragTurn.fromSnapshot = fromSnapshot;
            dragTurn.toSnapshot = toSnapshot;
            dragTurn.stagingRenderer?.dispose?.();
            const renderer = createBookCurlRenderer({
              canvas,
              fromImage: fromSnapshot.image,
              toImage: toSnapshot.image,
              width: fromSnapshot.width,
              height: fromSnapshot.height,
              direction,
              coverMode,
            });

            if (!renderer) {
              throw new Error("WebGL page curl unavailable");
            }

            dragTurn.renderer = renderer;
            dragTurn.currentCurl = getCurlPosFromClientX(
              dragTurn.pendingClientX ?? clientX,
              direction,
            );
            refreshSnapshotTextures(renderer, fromSnapshot, toSnapshot);
            renderer.render(dragTurn.currentCurl);
            setIsTurnSnapshotReady(true);

            if (dragTurn.releaseRequested) {
              finishInteractiveTurn({
                shouldComplete: dragTurn.shouldComplete,
              });
            }
          } catch {
            clearTurnCapture();
            setIsTurningPage(false);
            setIsTurnSnapshotReady(false);
            setTurningTargetPageIndex(null);
            isPageTurnRunningRef.current = false;
            cleanupDragTurn();
            window.requestAnimationFrame(clearTurnCanvas);
          }
        });
      } catch {
        clearTurnCapture();
        setIsTurningPage(false);
        setIsTurnSnapshotReady(false);
        setTurningTargetPageIndex(null);
        isPageTurnRunningRef.current = false;
        cleanupDragTurn();
        window.requestAnimationFrame(clearTurnCanvas);
      }
    },
    [
      activePage,
      activePageIndex,
      bookSpreads,
      capturePreparedPage,
      clearTurnCanvas,
      clearTurnCapture,
      cleanupDragTurn,
      coverTextureUrl,
      finishInteractiveTurn,
      getCurlPosFromClientX,
    ],
  );

  const handleBookPointerDown = (event) => {
    if (!isOpen) {
      dragStartXRef.current = null;
      return;
    }

    if (event.target.closest("input, button")) {
      dragStartXRef.current = null;
      return;
    }

    const pageNode = pageSurfaceRef.current;

    if (!pageNode) {
      return;
    }

    const rect = pageNode.getBoundingClientRect();
    const direction = event.clientX >= rect.left + rect.width * 0.5 ? 1 : -1;
    const nextIndex = activePageIndex + (direction > 0 ? 1 : -1);

    if (nextIndex < 0 || nextIndex >= bookSpreads.length) {
      return;
    }

    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragStartXRef.current = event.clientX;
    startInteractiveTurn({ clientX: event.clientX, direction });
  };

  const handleBookPointerMove = (event) => {
    const dragTurn = dragTurnRef.current;

    if (!dragTurn || dragStartXRef.current === null) {
      return;
    }

    dragTurn.pendingClientX = event.clientX;

    if (!dragTurn.renderer) {
      return;
    }

    dragTurn.currentCurl = getCurlPosFromClientX(
      event.clientX,
      dragTurn.direction,
    );
    refreshSnapshotTextures(
      dragTurn.renderer,
      dragTurn.fromSnapshot,
      dragTurn.toSnapshot,
    );
    dragTurn.renderer.render(dragTurn.currentCurl);
  };

  const handleBookPointerUp = (event) => {
    if (dragStartXRef.current === null) {
      return;
    }

    const dragTurn = dragTurnRef.current;
    const curlPos = dragTurn
      ? getCurlPosFromClientX(event.clientX, dragTurn.direction)
      : 1;
    const deltaX = event.clientX - dragStartXRef.current;
    dragStartXRef.current = null;

    if (!dragTurn) {
      return;
    }

    const draggedTowardTurn = dragTurn.direction > 0 ? deltaX < 0 : deltaX > 0;
    const shouldComplete =
      draggedTowardTurn &&
      (curlPos < 0.62 || Math.abs(deltaX) >= DRAG_TURN_THRESHOLD);

    dragTurn.currentCurl = curlPos;
    finishInteractiveTurn({ shouldComplete });
  };

  const handleBookPointerCancel = () => {
    const dragTurn = dragTurnRef.current;

    if (!dragTurn) {
      return;
    }

    finishInteractiveTurn({ shouldComplete: false });
  };

  const getPageRenderData = (page) => {
    const pageIndex = bookSpreads.findIndex((item) => item.key === page?.key);
    const ruleIndex = Math.max(0, pageIndex - 2);
    const pageLeftNumber =
      page?.type === "cover"
        ? null
        : page?.type === "intro"
          ? null
          : 2 + ruleIndex * 2;
    const pageRightNumber =
      page?.type === "cover"
        ? null
        : page?.type === "intro"
          ? null
          : pageLeftNumber + 1;
    const controlKey = `${animalId}:${page?.key}`;
    const pagePreviewControls = resolveRuleControls(page?.ruleGroup, previewControls[controlKey]);

    return {
      pageIndex,
      ruleIndex,
      leftNumber: pageLeftNumber,
      rightNumber: pageRightNumber,
      previewControls: pagePreviewControls,
      controlKey,
    };
  };

  const renderBookSpread = (page, { surfaceRef, isCapture = false } = {}) => {
    const {
      leftNumber,
      rightNumber,
      previewControls: pagePreviewControls,
      controlKey,
    } = getPageRenderData(page);
    const idSuffix = isCapture ? "-capture" : "";
    const handleParameterChange = (name, value) => {
      if (isCapture) return;
      setPreviewControls((current) => ({
        ...current,
        [controlKey]: { ...current[controlKey], [name]: value },
      }));
    };

    if (page?.type === "cover") {
      return (
        <section
          key={`${page.key}${idSuffix}`}
          data-page-key={page.key}
          className={[
            "detail-book-spread",
            "detail-book-spread--cover",
            isBookOpen ? "is-open" : "is-closed",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-labelledby={`detail-intro-title${idSuffix}`}
          ref={surfaceRef}
          style={bookSpreadStyle}
        >
          <div className="detail-book-page detail-book-page--empty" />
          <div className="detail-book-page detail-book-page--cover">
            <div className="detail-page-inner detail-page-inner--cover">
              <div className="detail-intro-copy">
                <p className="detail-page-kicker">군집사전</p>
                <h1
                  id={`detail-intro-title${idSuffix}`}
                  className="theme-page-title"
                >
                  {animal.korean}
                </h1>
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (page?.type === "intro") {
      return (
        <section
          key={`${page.key}${idSuffix}`}
          data-page-key={page.key}
          className={[
            "detail-book-spread",
            "detail-book-spread--intro",
            isBookOpen ? "is-open" : "is-closed",
          ].join(" ")}
          aria-labelledby={`detail-intro-title${idSuffix}`}
          ref={surfaceRef}
          style={bookSpreadStyle}
        >
          {introSprite ? (
            <div
              ref={isCapture ? null : introArtworkRef}
              className="detail-intro-artwork detail-intro-artwork--spread"
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
                pointerEvents: "none",
              }}
            >
              <span
                className={[
                  "detail-header-artwork__image",
                  "detail-header-artwork__sprite",
                  introAtlas.baseClassName,
                  introSprite.stage,
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  ...introSprite.style,
                  position: "absolute",
                  left: "74%",
                  top: "42%",
                  transform: `translate(-50%, -50%) translate(${introSpriteOffset.x}px, ${introSpriteOffset.y}px) rotate(${introSprite.rotationDeg || 0}deg) scaleX(${introSprite.scaleX}) scaleY(${introSprite.scaleY ?? 1})`,
                  transformOrigin:
                    animalId === "penguin" ? "50% 100%" : undefined,
                }}
              />
            </div>
          ) : null}
          <div className="detail-book-page detail-book-page--inside-cover" />
          <div className="detail-book-page detail-book-page--intro">
            <div className="detail-page-inner detail-page-inner--intro">
              <div className="detail-intro-artwork" aria-hidden="true" />
              <div className="detail-intro-copy">
                <h1
                  id={`detail-intro-title${idSuffix}`}
                  className="theme-page-title"
                  style={{ color: animalAccentColor }}
                >
                  {animal.korean}
                </h1>
                <p
                  className="detail-english"
                  style={{ color: animalAccentColor }}
                >
                  {animal.english}
                </p>
                <p
                  className="detail-scientific"
                  style={{ color: animalAccentColor }}
                >
                  {animal.scientific}
                </p>
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (page?.type === "rule") {
      return (
        <section
          key={`${page.key}${idSuffix}`}
          data-page-key={page.key}
          className={[
            "detail-book-spread",
            isBookOpen ? "is-open" : "is-closed",
          ].join(" ")}
          aria-labelledby={`detail-page-title-${page.key}${idSuffix}`}
          ref={surfaceRef}
          style={bookSpreadStyle}
        >
          <div className="detail-book-page detail-book-page--simulation">
            {isCapture ? (
              <div
                className="canvas-placeholder rule-preview rule-preview--capture"
                aria-hidden="true"
              />
            ) : (
              <RulePreview
                animalId={animalId}
                ruleGroup={page.ruleGroup}
                previewControls={pagePreviewControls}
              />
            )}
            <span className="detail-page-number detail-page-number--left">
              {leftNumber}
            </span>
          </div>
          <div className="detail-book-page detail-book-page--notes">
            <div className="detail-page-inner">
              <div className="rule-header">
                <h2
                  id={`detail-page-title-${page.key}${idSuffix}`}
                  className="rule-category"
                  style={{ color: animalAccentColor }}
                >
                  {page.ruleGroup.category}
                </h2>
                <p
                  className="rule-title"
                  style={{ color: animalAccentColor }}
                >
                  {page.ruleGroup.title}
                </p>
                {page.ruleGroup.summary ? (
                  <p className="rule-summary">{page.ruleGroup.summary}</p>
                ) : null}
              </div>

              <BookBehaviorPanel
                ruleGroup={page.ruleGroup}
                controls={pagePreviewControls}
                accentColor={animalAccentColor}
                onChange={handleParameterChange}
              />
              <span className="detail-page-number detail-page-number--right">
                {rightNumber}
              </span>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section
        data-page-key="empty"
        className={[
          "detail-book-spread",
          isBookOpen ? "is-open" : "is-closed",
        ].join(" ")}
        ref={surfaceRef}
        style={bookSpreadStyle}
      >
        <div className="detail-book-page detail-book-page--simulation">
          <div className="detail-page-inner">
            <p className="no-rules">아직 규칙이 등록되지 않았습니다.</p>
          </div>
        </div>
        <div className="detail-book-page detail-book-page--notes">
          <div className="detail-page-inner">
            <header className="detail-page-header">
              <div className="detail-title">
                <h1 className="theme-page-title">{animal.korean}</h1>
                <p className="detail-english">{animal.english}</p>
                <p className="detail-scientific">{animal.scientific}</p>
              </div>
            </header>
          </div>
        </div>
      </section>
    );
  };

  if (!animal) {
    return <div>동물 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div
      className={[
        "detail-container",
        isOpen ? "detail-container--open" : "detail-container--closed",
        isBookLaunching ? "detail-container--launching" : "",
        isBookExpanding ? "detail-container--expanding" : "",
        isBookReturning ? "detail-container--returning" : "",
        isAnimating ? "slide-up" : "slide-down",
      ].join(" ")}
      style={{
        "--detail-cover-texture": coverTextureCssValue,
        "--detail-paper-texture": `url(${paperTextureUrl})`,
        "--detail-animal-accent": animalAccentColor,
        "--detail-printed-font": DETAIL_PRINTED_FONT,
      }}
      onClick={handleBackdropClick}
      onDragStart={(event) => event.preventDefault()}
    >
      <button
        type="button"
        className="detail-book-close"
        aria-label="책 접기"
        onClick={handleBack}
      >
        <img src={closeIconUrl} alt="" draggable="false" />
      </button>
      <div className="rules-scroll-layer">
        <div
          className={[
            "detail-book-stage",
            isBookOpen ? "is-book-open" : "",
            isBookClosedSpread ? "is-book-closed-spread" : "",
            isTurningPage ? "is-turning" : "",
            isTurnSnapshotReady ? "is-turn-snapshot-ready" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={bookStageStyle}
          onPointerDown={handleBookPointerDown}
          onPointerMove={handleBookPointerMove}
          onPointerUp={handleBookPointerUp}
          onPointerCancel={handleBookPointerCancel}
          onClick={handleClosedBookOpen}
        >
          {isOpen && inactivityRemainingSeconds !== null ? (
            <p className="detail-inactivity-warning" aria-live="polite">
              {inactivityRemainingSeconds}초 후 처음으로 돌아갑니다
            </p>
          ) : null}
          <main
            className="rules-container detail-book"
            style={bookContainerStyle}
          >
            {renderBookSpread(activePage, { surfaceRef: pageSurfaceRef })}
          </main>
          {navigationPageIndex > 0 ? (
            <button
              type="button"
              className="detail-page-chevron detail-page-chevron--prev"
              aria-label="이전 페이지"
              onClick={() => goToPage(activePageIndex - 1)}
            >
              <img src={chevronLeftIconUrl} alt="" draggable="false" />
            </button>
          ) : null}
          {navigationPageIndex >= 0 &&
          navigationPageIndex < bookSpreads.length - 1 ? (
            <button
              type="button"
              className="detail-page-chevron detail-page-chevron--next"
              aria-label="다음 페이지"
              onClick={() => goToPage(activePageIndex + 1)}
            >
              <img src={chevronRightIconUrl} alt="" draggable="false" />
            </button>
          ) : null}
          <canvas
            layoutsubtree=""
            ref={turnCanvasRef}
            className={`detail-book-turn-canvas${
              isTurningPage && isTurnSnapshotReady ? " is-active" : ""
            }`}
            style={turnCanvasStyle}
            aria-hidden="true"
          />
        </div>
      </div>
      {turnCapturePage && turnCaptureWrapperStyle ? (
        <div
          aria-hidden="true"
          style={{
            ...turnCaptureWrapperStyle,
            "--detail-cover-texture": coverTextureCssValue,
            "--detail-paper-texture": `url(${paperTextureUrl})`,
          }}
        >
          <main
            className="rules-container detail-book"
            style={{
              ...bookContainerStyle,
              width: "100%",
              height: "100%",
            }}
          >
            {renderBookSpread(turnCapturePage, {
              surfaceRef: turnCaptureSurfaceRef,
              isCapture: true,
            })}
          </main>
        </div>
      ) : null}
    </div>
  );
}

export default Detail;

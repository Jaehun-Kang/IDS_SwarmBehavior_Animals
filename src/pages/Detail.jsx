import React from "react";
import { getAnimalDetails } from "../behaviors/animalDetails";
import RulePreview from "../components/RulePreview";
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
const INTRO_ANT_FRONT_RADIUS_PX = 56;
const INTRO_PENGUIN_CENTER_RADIUS_PX = 70;
const INTRO_PENGUIN_LOWER_ROW_Y_PX = 70;
const INTRO_INSECT_IDLE_Y_PX = 0;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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
    const shouldFly = pointerVector.y < 0;
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
      isTakingOff,
      jumpProgress: isTakingOff ? 0.12 : 1,
    };
  }

  if (animalId === "firefly") {
    const glowCycle = (timestampMs % 1200) / 1200;
    return {
      glow: glowCycle < 0.2 || (glowCycle > 0.34 && glowCycle < 0.42),
      idle: pointerVector.y > INTRO_INSECT_IDLE_Y_PX,
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

const applyIntroSpriteOverrides = (animalId, sprite, pointerVector, state) => {
  if (animalId === "bee" && pointerVector.y > INTRO_INSECT_IDLE_Y_PX) {
    return {
      ...sprite,
      stage: sprite.stage === "bee_top_fly" ? "bee_top_idle" : "bee_idle",
    };
  }

  if (animalId === "firefly" && pointerVector.y > INTRO_INSECT_IDLE_Y_PX) {
    const idleStageByStage = {
      firefly_glow: "firefly_glow_idle",
      firefly_dark: "firefly_dark_idle",
      firefly_lit_top_fly: "firefly_lit_top_idle",
      firefly_dark_top_fly: "firefly_dark_top_idle",
    };

    return {
      ...sprite,
      stage: idleStageByStage[sprite.stage] || sprite.stage,
      state,
    };
  }

  if (animalId === "ant") {
    const pointerDistance = Math.hypot(pointerVector.x, pointerVector.y);
    const verticalDominance =
      Math.abs(pointerVector.y) >= Math.abs(pointerVector.x) * 0.82;

    if (pointerDistance <= INTRO_ANT_FRONT_RADIUS_PX) {
      return {
        ...sprite,
        stage: "ant_front",
        rotationDeg: 0,
        scaleX: 1,
      };
    }

    if (verticalDominance) {
      return {
        ...sprite,
        stage: "ant_top",
        rotationDeg:
          (Math.atan2(pointerVector.y, pointerVector.x) * 180) / Math.PI,
        scaleX: 1,
      };
    }

    return {
      ...sprite,
      stage: "ant_walk",
      rotationDeg: 0,
      scaleX: pointerVector.x < 0 ? -1 : 1,
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
    const isCenterCell =
      Math.abs(pointerVector.x) <= INTRO_PENGUIN_CENTER_RADIUS_PX &&
      Math.abs(pointerVector.y) <= INTRO_PENGUIN_CENTER_RADIUS_PX;

    if (isCenterCell) {
      return {
        ...sprite,
        stage: "penguin_front",
        rotationDeg: 0,
        scaleX: 1,
        scaleY: 1,
      };
    }

    if (pointerVector.y > INTRO_PENGUIN_LOWER_ROW_Y_PX) {
      const isLowerSide =
        Math.abs(pointerVector.x) > INTRO_PENGUIN_CENTER_RADIUS_PX;

      return {
        ...sprite,
        stage: isLowerSide ? "penguin_slide" : "penguin_front_slide",
        rotationDeg: 90,
        scaleX: 1,
        scaleY: pointerVector.x < 0 ? -1 : 1,
      };
    }
  }

  return sprite;
};

const getIntroSpriteFrameSequence = (animalId, stage, sequence) => {
  if (sequence.frames?.length > 1) {
    return sequence;
  }

  if (animalId === "bat" && stage === "bat_fly3") {
    return {
      ...sequence,
      frames: [
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ],
      durationMs: 120,
    };
  }

  return sequence;
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
        const html = `
          <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;">
            <style>${styleText}</style>
            ${clonedNode.outerHTML}
          </div>
        `;
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

const getBehaviorParameterMeta = (behavior) => {
  const name = behavior?.name || "";

  if (/항속|속력|속도/.test(name)) {
    return {
      label: "목표 속도",
      unit: "미터/초",
      min: 7,
      max: 12,
      decimals: 1,
    };
  }

  if (/배제|거리|구역|간격/.test(name)) {
    return {
      label: "최소 거리",
      unit: "미터",
      min: 0.3,
      max: 0.6,
      decimals: 2,
    };
  }

  if (/반응|지연|시간/.test(name)) {
    return {
      label: "반응 지연",
      unit: "초",
      min: 0.03,
      max: 0.12,
      decimals: 3,
    };
  }

  if (/위상|이웃/.test(name)) {
    return {
      label: "참조 이웃 수",
      unit: "마리",
      min: 3,
      max: 10,
      decimals: 0,
    };
  }

  if (/시야/.test(name)) {
    return {
      label: "시야 편향",
      unit: "퍼센트",
      min: 0,
      max: 100,
      decimals: 0,
    };
  }

  if (/회피/.test(name)) {
    return {
      label: "회피 우선도",
      unit: "퍼센트",
      min: 0,
      max: 100,
      decimals: 0,
    };
  }

  if (/정렬|응집/.test(name)) {
    return {
      label: "동조 강도",
      unit: "퍼센트",
      min: 0,
      max: 100,
      decimals: 0,
    };
  }

  if (/반경|회전/.test(name)) {
    return {
      label: "회전 민감도",
      unit: "퍼센트",
      min: 0,
      max: 100,
      decimals: 0,
    };
  }

  if (/뱅킹|고도|기울/.test(name)) {
    return { label: "기울기 각도", unit: "도", min: 0, max: 45, decimals: 0 };
  }

  if (/전파|파/.test(name)) {
    return {
      label: "전파 속도",
      unit: "미터/초",
      min: 20,
      max: 40,
      decimals: 0,
    };
  }

  if (/형태|종횡/.test(name)) {
    return {
      label: "형태 비율",
      unit: "퍼센트",
      min: 0,
      max: 100,
      decimals: 0,
    };
  }

  if (/밀도/.test(name)) {
    return {
      label: "밀도 차이",
      unit: "퍼센트",
      min: 0,
      max: 100,
      decimals: 0,
    };
  }

  if (/시작|가장자리/.test(name)) {
    return {
      label: "가장자리 영향",
      unit: "퍼센트",
      min: 0,
      max: 100,
      decimals: 0,
    };
  }

  return { label: "영향 정도", unit: "퍼센트", min: 0, max: 100, decimals: 0 };
};

const formatBehaviorParameterValue = (value, meta) => {
  const normalized = clamp(Number(value) || 0, 0, 100) / 100;
  const scaled = meta.min + (meta.max - meta.min) * normalized;
  const formatted = scaled.toFixed(meta.decimals);
  const unitSymbolMap = {
    퍼센트: "%",
    도: "°",
  };
  const compactUnits = new Set(["%", "°"]);
  const displayUnit = unitSymbolMap[meta.unit] ?? meta.unit;
  const separator = compactUnits.has(displayUnit) ? "" : " ";

  return `${formatted}${separator}${displayUnit}`;
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
  const [introAnimationTimeMs, setIntroAnimationTimeMs] = React.useState(0);
  const bookOpenTimerRef = React.useRef(null);
  const bookCloseTimerRef = React.useRef(null);
  const bookLaunchFrameRef = React.useRef(null);
  const bookTransitionLockRef = React.useRef(false);
  const [previewControls, setPreviewControls] = React.useState({});
  const animal = getAnimalDetails(animalId);
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
      const shouldFly = introPointerVector.y < 0;

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
    const nextVector = {
      x: clientX - (rect.left + rect.width * 0.5),
      y: clientY - (rect.top + rect.height * 0.5),
    };

    if (Math.hypot(nextVector.x, nextVector.y) < 1) {
      return;
    }

    setIntroPointerVector((current) => {
      if (
        Math.abs(current.x - nextVector.x) < 0.5 &&
        Math.abs(current.y - nextVector.y) < 0.5
      ) {
        return current;
      }

      return nextVector;
    });
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
      animationFrameId = window.requestAnimationFrame(updateAnimationTime);
    };

    animationFrameId = window.requestAnimationFrame(updateAnimationTime);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [activePageKey, introAtlas, isOpen]);

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

  const updatePreviewControl = (name, value) => {
    if (!activePage?.key) {
      return;
    }

    setPreviewControls((current) => ({
      ...current,
      [activePage.key]: {
        ...current[activePage.key],
        [name]: Number(value),
      },
    }));
  };

  const getPageRenderData = (page) => {
    const pageIndex = bookSpreads.findIndex((item) => item.key === page?.key);
    const ruleIndex = Math.max(0, pageIndex - 2);
    const pageLeftNumber =
      page?.type === "cover"
        ? null
        : page?.type === "intro"
          ? null
          : 3 + ruleIndex * 2;
    const pageRightNumber =
      page?.type === "cover"
        ? null
        : page?.type === "intro"
          ? null
          : pageLeftNumber + 1;
    const pagePreviewControls = previewControls[page?.key] || {
      ruleStrength: 68,
      responseRange: 54,
    };
    const pageBehaviorControlValues = Object.entries(pagePreviewControls)
      .filter(([key]) => key.startsWith("behavior_"))
      .map(([, value]) => Number(value))
      .filter(Number.isFinite);
    const pageBehaviorAverage =
      pageBehaviorControlValues.length > 0
        ? pageBehaviorControlValues.reduce((sum, value) => sum + value, 0) /
          pageBehaviorControlValues.length
        : 62;

    return {
      pageIndex,
      ruleIndex,
      leftNumber: pageLeftNumber,
      rightNumber: pageRightNumber,
      previewControls: pagePreviewControls,
      resolvedControls: {
        ...pagePreviewControls,
        ruleStrength: pagePreviewControls.ruleStrength ?? pageBehaviorAverage,
        responseRange: pagePreviewControls.responseRange ?? pageBehaviorAverage,
      },
    };
  };

  const renderBookSpread = (page, { surfaceRef, isCapture = false } = {}) => {
    const {
      leftNumber,
      rightNumber,
      previewControls: pagePreviewControls,
      resolvedControls,
    } = getPageRenderData(page);
    const idSuffix = isCapture ? "-capture" : "";
    const handleParameterChange = (name, value) => {
      if (!isCapture) {
        updatePreviewControl(name, value);
      }
    };

    const handleParameterWheel = (event, name, value) => {
      event.stopPropagation();

      const current = Number(value);
      if (!Number.isFinite(current)) {
        return;
      }

      const direction = event.deltaY > 0 ? -1 : 1;
      const step = event.shiftKey ? 5 : 1;
      handleParameterChange(name, clamp(current + direction * step, 0, 100));
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
          <div className="detail-book-page detail-book-page--inside-cover" />
          <div className="detail-book-page detail-book-page--intro">
            <div className="detail-page-inner detail-page-inner--intro">
              {introSprite ? (
                <div
                  ref={isCapture ? null : introArtworkRef}
                  className="detail-intro-artwork"
                  aria-hidden="true"
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
                      transform: `rotate(${introSprite.rotationDeg}deg) scaleX(${introSprite.scaleX}) scaleY(${introSprite.scaleY ?? 1})`,
                    }}
                  />
                </div>
              ) : null}
              <div className="detail-intro-copy">
                <h1
                  id={`detail-intro-title${idSuffix}`}
                  className="theme-page-title"
                >
                  {animal.korean}
                </h1>
                <p className="detail-english">{animal.english}</p>
                <p className="detail-scientific">{animal.scientific}</p>
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
                previewControls={resolvedControls}
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
                >
                  {page.ruleGroup.category}
                </h2>
                <p className="rule-title">{page.ruleGroup.title}</p>
                {page.ruleGroup.summary ? (
                  <p className="rule-summary">{page.ruleGroup.summary}</p>
                ) : null}
              </div>

              <section
                className="detail-parameter-panel"
                aria-label="규칙 조절"
              >
                <div className="behaviors-list">
                  <div className="behaviors-group">
                    {page.ruleGroup.behaviors.map((behavior, idx) => {
                      const parameterName = `behavior_${idx}`;
                      const parameterValue =
                        pagePreviewControls[parameterName] ?? 50;
                      const parameterMeta = getBehaviorParameterMeta(behavior);

                      return (
                        <article key={idx} className="behavior-item">
                          <h3 className="behavior-name">{behavior.name}</h3>
                          <div className="behavior-body">
                            <p className="behavior-description">
                              {behavior.description}
                            </p>
                            <label className="detail-parameter-row">
                              <span className="detail-parameter-row__label">
                                {parameterMeta.label}
                              </span>
                              <span className="detail-parameter-row__value">
                                {formatBehaviorParameterValue(
                                  parameterValue,
                                  parameterMeta,
                                )}
                              </span>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={parameterValue}
                                style={{
                                  "--detail-range-progress": `${parameterValue}%`,
                                }}
                                aria-label={`${behavior.name} ${parameterMeta.label}`}
                                onChange={(event) =>
                                  handleParameterChange(
                                    parameterName,
                                    event.target.value,
                                  )
                                }
                                onWheel={(event) =>
                                  handleParameterWheel(
                                    event,
                                    parameterName,
                                    parameterValue,
                                  )
                                }
                              />
                            </label>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </section>
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

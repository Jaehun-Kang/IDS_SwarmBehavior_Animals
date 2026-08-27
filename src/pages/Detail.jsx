import React from "react";
import { getAnimalDetails } from "../behaviors/animalDetails";
import RulePreview from "../components/RulePreview";
import paperTextureUrl from "../assets/texture/white-paper-texture-seamless.webp";
import {
  createBookCurlRenderer,
  renderBookCurlTransition,
} from "../utils/bookCurlWebgl";
import "../styles/Detail.css";

const headerArtworkModules = import.meta.glob("../assets/detail/*.svg", {
  eager: true,
  import: "default",
});
const bookCoverTextureModules = import.meta.glob(
  "../assets/texture/book_cover/*.webp",
  {
    eager: true,
    import: "default",
  },
);

const HEADER_ARTWORK_ASSET_KEYS = {
  spiny_lobster: {
    assetKey: "spinylobster",
  },
};

const getHeaderArtwork = (animalId) => {
  const assetKey = HEADER_ARTWORK_ASSET_KEYS[animalId]?.assetKey || animalId;
  const src = headerArtworkModules[`../assets/detail/${assetKey}.svg`];

  if (!src) {
    return null;
  }

  return { src };
};

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

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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

const inlineCanvasSnapshots = (sourceNode, clonedNode) => {
  const sourceCanvases = sourceNode.querySelectorAll("canvas");
  const clonedCanvases = clonedNode.querySelectorAll("canvas");

  sourceCanvases.forEach((sourceCanvas, index) => {
    const clonedCanvas = clonedCanvases[index];

    if (!clonedCanvas) {
      return;
    }

    const snapshot = document.createElement("img");
    snapshot.src = sourceCanvas.toDataURL("image/png");
    snapshot.width = sourceCanvas.clientWidth;
    snapshot.height = sourceCanvas.clientHeight;
    snapshot.style.width = `${sourceCanvas.clientWidth}px`;
    snapshot.style.height = `${sourceCanvas.clientHeight}px`;
    snapshot.style.display = "block";
    clonedCanvas.replaceWith(snapshot);
  });
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

    canvas.addEventListener("paint", finish, { once: true });
    canvas.onpaint = finish;
    timeoutId = window.setTimeout(fail, 600);
    canvas.requestPaint();
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

  return `${formatted} ${meta.unit}`;
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
}) {
  const [isAnimating, setIsAnimating] = React.useState(true);
  const [activePageKey, setActivePageKey] = React.useState(null);
  const [isTurningPage, setIsTurningPage] = React.useState(false);
  const [isTurnSnapshotReady, setIsTurnSnapshotReady] = React.useState(false);
  const [turnCapturePageKey, setTurnCapturePageKey] = React.useState(null);
  const [turnCaptureSize, setTurnCaptureSize] = React.useState(null);
  const [isBookOpen, setIsBookOpen] = React.useState(false);
  const [isBookReturning, setIsBookReturning] = React.useState(false);
  const [isBookLaunching, setIsBookLaunching] = React.useState(false);
  const [isBookExpanding, setIsBookExpanding] = React.useState(false);
  const bookOpenTimerRef = React.useRef(null);
  const bookCloseTimerRef = React.useRef(null);
  const bookLaunchFrameRef = React.useRef(null);
  const [previewControls, setPreviewControls] = React.useState({});
  const animal = getAnimalDetails(animalId);
  const artwork = getHeaderArtwork(animalId);
  const coverTextureUrl = getBookCoverTexture(animalId);
  const coverTextureCssValue = getCssImageValue(coverTextureUrl);
  const pageSurfaceRef = React.useRef(null);
  const turnCaptureSurfaceRef = React.useRef(null);
  const turnCanvasRef = React.useRef(null);
  const isPageTurnRunningRef = React.useRef(false);
  const dragStartXRef = React.useRef(null);
  const dragTurnRef = React.useRef(null);
  const didAutoFirstTurnRef = React.useRef(false);
  const pendingCloseAfterCoverRef = React.useRef(false);
  const closeBookFromCoverRef = React.useRef(null);

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
  const turnCapturePage = React.useMemo(() => {
    if (!turnCapturePageKey) {
      return null;
    }

    return bookSpreads.find((page) => page.key === turnCapturePageKey) || null;
  }, [bookSpreads, turnCapturePageKey]);
  const activeRuleIndex = Math.max(0, activePageIndex - 2);
  const pageCount = 3 + ruleSpreads.length * 2;
  const leftPageNumber =
    activePage?.type === "cover"
      ? null
      : activePage?.type === "intro"
        ? 1
        : 3 + activeRuleIndex * 2;
  const rightPageNumber =
    activePage?.type === "cover"
      ? null
      : activePage?.type === "intro"
        ? 2
        : leftPageNumber + 1;
  const activePreviewControls = previewControls[activePage?.key] || {
    ruleStrength: 68,
    responseRange: 54,
  };
  const behaviorControlValues = Object.entries(activePreviewControls)
    .filter(([key]) => key.startsWith("behavior_"))
    .map(([, value]) => Number(value))
    .filter(Number.isFinite);
  const behaviorAverage =
    behaviorControlValues.length > 0
      ? behaviorControlValues.reduce((sum, value) => sum + value, 0) /
        behaviorControlValues.length
      : 62;
  const resolvedPreviewControls = {
    ...activePreviewControls,
    ruleStrength: activePreviewControls.ruleStrength ?? behaviorAverage,
    responseRange: activePreviewControls.responseRange ?? behaviorAverage,
  };
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
    opacity: isTurningPage ? 1 : 0,
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
    window.clearTimeout(bookOpenTimerRef.current);
    window.clearTimeout(bookCloseTimerRef.current);

    if (!isOpen) {
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
    }, BOOK_OPEN_DELAY_MS);

    return () => {
      window.clearTimeout(bookOpenTimerRef.current);
      window.cancelAnimationFrame(bookLaunchFrameRef.current);
    };
  }, [animalId, isOpen]);

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
    pendingCloseAfterCoverRef.current = false;
    setIsBookReturning(true);
    setIsBookOpen(false);
    window.clearTimeout(bookCloseTimerRef.current);
    bookCloseTimerRef.current = window.setTimeout(() => {
      setIsAnimating(false);
      onBackClick();
    }, BOOK_CLOSE_DELAY_MS);
  }, [onBackClick]);

  closeBookFromCoverRef.current = closeBookFromCover;

  if (!animal) {
    return <div>동물 정보를 찾을 수 없습니다.</div>;
  }

  const handleClosedBookOpen = () => {
    if (isOpen) {
      return;
    }

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
        return;
      }

      isPageTurnRunningRef.current = true;

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
            isPageTurnRunningRef.current = false;
            window.requestAnimationFrame(clearTurnCanvas);
          }
        });
      } catch {
        clearTurnCapture();
        setActivePageKey(nextPage.key);
        setIsTurningPage(false);
        setIsTurnSnapshotReady(false);
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
    ],
  );

  const goToPage = (nextIndex) => {
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
    if (isPageTurnRunningRef.current) {
      return;
    }

    if (activePageIndex <= 0) {
      closeBookFromCover();
      return;
    }

    pendingCloseAfterCoverRef.current = true;

    if (activePageIndex === 1) {
      animatePageTurn(0);
      return;
    }

    setActivePageKey("intro");
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
            isPageTurnRunningRef.current = false;
            cleanupDragTurn();
            window.requestAnimationFrame(clearTurnCanvas);
          }
        });
      } catch {
        clearTurnCapture();
        setIsTurningPage(false);
        setIsTurnSnapshotReady(false);
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
          ? 1
          : 3 + ruleIndex * 2;
    const pageRightNumber =
      page?.type === "cover"
        ? null
        : page?.type === "intro"
          ? 2
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
      ruleIndex,
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
          <div className="detail-book-page detail-book-page--inside-cover">
            <span className="detail-page-number detail-page-number--left">
              {leftNumber}
            </span>
          </div>
          <div className="detail-book-page detail-book-page--intro">
            <div className="detail-page-inner detail-page-inner--intro">
              {artwork ? (
                <div
                  className="detail-intro-artwork"
                  aria-hidden="true"
                  style={{ "--detail-artwork-mask": `url(${artwork.src})` }}
                >
                  <img
                    className="detail-header-artwork__image"
                    src={artwork.src}
                    alt=""
                    draggable="false"
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
              <span className="detail-page-number detail-page-number--right">
                {rightNumber}
              </span>
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
            <RulePreview
              animalId={animalId}
              ruleGroup={page.ruleGroup}
              previewControls={resolvedControls}
            />
            <span className="detail-page-number detail-page-number--left">
              {leftNumber}
            </span>
          </div>
          <div className="detail-book-page detail-book-page--notes">
            <div className="detail-page-inner">
              <header className="detail-page-header">
                <p className="detail-page-kicker">
                  {animal.korean} / 규칙 {ruleIndex + 1}
                </p>
              </header>

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
                              aria-label={`${behavior.name} ${parameterMeta.label}`}
                              onChange={(event) =>
                                handleParameterChange(
                                  parameterName,
                                  event.target.value,
                                )
                              }
                            />
                          </label>
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
      onDragStart={(event) => event.preventDefault()}
    >
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
          <button
            type="button"
            className="detail-book-close"
            aria-label="책 접기"
            onClick={handleBack}
          >
            ×
          </button>
          <main
            className="rules-container detail-book"
            style={bookContainerStyle}
          >
            {renderBookSpread(activePage, { surfaceRef: pageSurfaceRef })}
          </main>
          <button
            type="button"
            className="detail-page-chevron detail-page-chevron--prev"
            aria-label="이전 페이지"
            disabled={activePageIndex <= 0}
            onClick={() => goToPage(activePageIndex - 1)}
          >
            ‹
          </button>
          <button
            type="button"
            className="detail-page-chevron detail-page-chevron--next"
            aria-label="다음 페이지"
            disabled={
              activePageIndex < 0 || activePageIndex >= bookSpreads.length - 1
            }
            onClick={() => goToPage(activePageIndex + 1)}
          >
            ›
          </button>
          <canvas
            layoutsubtree=""
            ref={turnCanvasRef}
            className={`detail-book-turn-canvas${
              isTurningPage ? " is-active" : ""
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

import React from "react";
import "../styles/Sim.css";
import { animals } from "../behaviors/animalData";
import SpriteAtlas from "../components/SpriteAtlas.jsx";
import { HOME_SPRITE_ATLASES } from "../data/spriteAtlases";
import refreshIconUrl from "../assets/icons/refresh.svg";
import blackPaperTextureUrl from "../assets/texture/paper/black-paper-texture-seamless.webp";
import grassPaperTextureUrl from "../assets/texture/paper/grass-paper-texture-seamless.webp";
import oceanSandDarkPaperTextureUrl from "../assets/texture/paper/ocean-sand-dark-paper-texture-seamless.webp";
import oceanSandPaperTextureUrl from "../assets/texture/paper/ocean-sand-paper-texture-seamless.webp";
import sandPaperTextureUrl from "../assets/texture/paper/sand-paper-texture-seamless.webp";
import seaLightPaperTextureUrl from "../assets/texture/paper/sea-light-paper-texture-seamless.webp";
import seaPaperTextureUrl from "../assets/texture/paper/sea-paper-texture-seamless.webp";
import skyPaperTextureUrl from "../assets/texture/paper/sky-paper-texture-seamless.webp";
import snowPaperTextureUrl from "../assets/texture/paper/snow-paper-texture-seamless.webp";
import soilPaperTextureUrl from "../assets/texture/paper/soil-paper-texture-seamless.webp";
import blackStickyNoteTextureUrl from "../assets/texture/sticky-note/black-sticky-note-texture-seamless.webp";
import blueStickyNoteTextureUrl from "../assets/texture/sticky-note/blue-sticky-note-texture-seamless.webp";
import darkBlueLightStickyNoteTextureUrl from "../assets/texture/sticky-note/dark-blue-light-sticky-note-texture-seamless.webp";
import darkBlueStickyNoteTextureUrl from "../assets/texture/sticky-note/dark-blue-sticky-note-texture-seamless.webp";
import darkYellowStickyNoteTextureUrl from "../assets/texture/sticky-note/dark-yellow-sticky-note-texture-seamless.webp";
import greenStickyNoteTextureUrl from "../assets/texture/sticky-note/green-sticky-note-texture-seamless.webp";
import lightYellowStickyNoteTextureUrl from "../assets/texture/sticky-note/light-yellow-sticky-note-texture-seamless.webp";
import tealStickyNoteTextureUrl from "../assets/texture/sticky-note/teal-sticky-note-texture-seamless.webp";
import whiteStickyNoteTextureUrl from "../assets/texture/sticky-note/white-sticky-note-texture-seamless.webp";
import yellowStickyNoteTextureUrl from "../assets/texture/sticky-note/yellow-sticky-note-texture-seamless.webp";

const textureModules = import.meta.glob("../assets/texture/**/*.webp", {
  eager: true,
  import: "default",
});

const PRELOAD_TEXTURE_URLS = [
  ...new Set(Object.values(textureModules).filter(Boolean)),
];
const preloadedTextureUrls = new Set();

const animalNames = {
  starling: "흰점찌르레기",
  sardine: "태평양정어리",
  grasshopper: "사막메뚜기",
  ant: "군대개미",
  bat: "멕시코자유꼬리박쥐",
  sheep: "메리노양",
  penguin: "황제펭귄",
  bee: "재래꿀벌",
  firefly: "동기반딧불이",
  spiny_lobster: "카리브해닭새우",
  krill: "남극크릴",
};

const DETAIL_PAGE_DISABLED = false;

const ANIMAL_ORDER = [
  "starling",
  "sardine",
  "grasshopper",
  "ant",
  "bat",
  "sheep",
  "penguin",
  "bee",
  "firefly",
  "spiny_lobster",
  "krill",
];

const SIM_TEXTURES = {
  starling: skyPaperTextureUrl,
  sardine: seaPaperTextureUrl,
  grasshopper: sandPaperTextureUrl,
  ant: soilPaperTextureUrl,
  bat: blackPaperTextureUrl,
  sheep: grassPaperTextureUrl,
  penguin: snowPaperTextureUrl,
  bee: grassPaperTextureUrl,
  firefly: blackPaperTextureUrl,
  spiny_lobster: oceanSandPaperTextureUrl,
  krill: seaPaperTextureUrl,
};

const SIM_STICKY_NOTES = {
  starling: {
    texture: blueStickyNoteTextureUrl,
    text: "rgb(33 48 64)",
    muted: "rgb(54 77 98 / 0.78)",
    strong: "rgb(19 38 58)",
    rotate: "-0.22deg",
  },
  sardine: {
    texture: darkBlueStickyNoteTextureUrl,
    text: "rgb(224 235 238 / 0.92)",
    muted: "rgb(204 220 226 / 0.72)",
    strong: "rgb(245 252 252)",
    rotate: "0.18deg",
  },
  grasshopper: {
    texture: yellowStickyNoteTextureUrl,
    text: "rgb(82 62 25)",
    muted: "rgb(105 82 38 / 0.72)",
    strong: "rgb(64 47 14)",
    rotate: "0.32deg",
  },
  ant: {
    texture: darkYellowStickyNoteTextureUrl,
    text: "rgb(69 48 15)",
    muted: "rgb(86 61 21 / 0.74)",
    strong: "rgb(53 35 8)",
    rotate: "-0.16deg",
  },
  bat: {
    texture: blackStickyNoteTextureUrl,
    text: "rgb(232 226 207 / 0.9)",
    muted: "rgb(204 195 172 / 0.72)",
    strong: "rgb(255, 247, 214)",
    rotate: "0.24deg",
  },
  sheep: {
    texture: greenStickyNoteTextureUrl,
    text: "rgb(38 62 35)",
    muted: "rgb(58 88 51 / 0.74)",
    strong: "rgb(22 50 23)",
    rotate: "-0.28deg",
  },
  penguin: {
    texture: whiteStickyNoteTextureUrl,
    text: "rgb(54 55 52)",
    muted: "rgb(91 90 84 / 0.72)",
    strong: "rgb(28 30 29)",
    rotate: "0.14deg",
  },
  bee: {
    texture: greenStickyNoteTextureUrl,
    text: "rgb(38 62 35)",
    muted: "rgb(58 88 51 / 0.74)",
    strong: "rgb(22 50 23)",
    rotate: "0.26deg",
  },
  firefly: {
    texture: blackStickyNoteTextureUrl,
    text: "rgb(232 226 207 / 0.9)",
    muted: "rgb(204 195 172 / 0.72)",
    strong: "rgb(255, 247, 214)",
    rotate: "-0.18deg",
  },
  spiny_lobster: {
    texture: lightYellowStickyNoteTextureUrl,
    text: "rgb(79 58 24)",
    muted: "rgb(102 78 37 / 0.72)",
    strong: "rgb(62 42 11)",
    rotate: "0.2deg",
  },
  krill: {
    texture: darkBlueStickyNoteTextureUrl,
    text: "rgb(224 235 238 / 0.92)",
    muted: "rgb(204 220 226 / 0.72)",
    strong: "rgb(245 252 252)",
    rotate: "-0.24deg",
  },
};

const animalsById = Object.fromEntries(
  animals.map((animal) => [animal.id, animal]),
);

const animalDockItems = ANIMAL_ORDER.map((id) => {
  const animal = animalsById[id];
  return {
    id,
    label: animalNames[id] || animal?.name || id,
  };
}).filter((animal) => animalsById[animal.id]);

const CANVAS_POINTER_BLOCK_SELECTOR = [
  ".sim-control-panel",
  ".sim-animal-title",
  ".sim-overlay-stack",
  ".info_btn",
  ".sim-gpu-error",
  ".sim-animal-dock",
  "button",
  "input",
  "select",
].join(", ");

const CONTROL_RESET_LERP_DURATION_MS = 320;
const SPINY_LOBSTER_HOUR_AUTO_ADVANCE_MS = 2000;
const SPINY_LOBSTER_HOUR_MANUAL_HOLD_MS = 2000;
const AUTO_ADVANCING_HOUR_CONTROLS = {
  spiny_lobster: "START_HOUR",
};

const PHASE_PREVIEW_CONTROLS = {
  krill: "LIGHT_PHASE",
};

const KRILL_LIGHT_PHASES = new Set(["day", "sunset", "night", "sunrise"]);

const FIREFLY_SIM_THEME = {
  "--theme-bg": "oklch(0.14 0.015 91.51)",
  "--theme-bg-soft": "oklch(0.18 0.018 91.51)",
  "--theme-text-strong": "oklch(0.9 0.028 95)",
  "--theme-text": "rgb(232 226 207 / 0.88)",
  "--theme-text-muted": "rgb(206 198 176 / 0.74)",
  "--theme-text-soft": "rgb(184 176 156 / 0.62)",
  "--theme-border": "rgb(224 214 188 / 0.18)",
  "--theme-border-soft": "rgb(224 214 188 / 0.1)",
  "--theme-panel": "rgb(10 14 17 / 0.7)",
  "--theme-panel-strong": "rgb(18 23 28 / 0.9)",
  "--theme-panel-hover": "rgb(28 35 42 / 0.96)",
  "--theme-shadow": "0 0.875rem 2.5rem rgb(0 0 0 / 0.34)",
  "--theme-shadow-soft": "0 0.375rem 1rem rgb(0 0 0 / 0.3)",
  "--theme-surface-tint": "rgb(212 201 153 / 0.08)",
  "--theme-accent": "rgb(247 220 116 / 0.32)",
  "--theme-accent-strong": "rgb(255 229 126)",
  "--sim-control-dim": "rgb(255 244 188 / 0.14)",
  "--sim-control-dim-soft": "rgb(255 244 188 / 0.1)",
  "--sim-control-dim-active": "rgb(255 244 188 / 0.2)",
  "--sim-control-reset-filter":
    "brightness(0) saturate(100%) invert(92%) sepia(17%) saturate(760%) hue-rotate(358deg) brightness(104%) contrast(97%) opacity(0.96)",
};

const clamp01 = (value) => Math.max(0, Math.min(1, value));
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getDecimalPlaces = (value) => {
  const text = String(value);
  if (!text.includes(".")) {
    return 0;
  }

  const [, decimal = ""] = text.split(".");
  return decimal.replace(/0+$/, "").length;
};

const normalizeControlDisplayValue = (field, value) => {
  if (
    field.type === "toggle" ||
    field.type === "binary-toggle" ||
    field.type === "cycle-toggle" ||
    field.type === "select" ||
    field.type === "static"
  ) {
    return value;
  }

  const numericValue = Number(value);
  const numericStep = Number(field.step);
  if (
    !Number.isFinite(numericValue) ||
    !Number.isFinite(numericStep) ||
    numericStep <= 0
  ) {
    return value;
  }

  const decimalPlaces = getDecimalPlaces(field.step);
  if (decimalPlaces === 0) {
    return Math.round(numericValue);
  }

  return Number(numericValue.toFixed(decimalPlaces));
};

const normalizeControlInputValue = (field, value) => {
  if (
    !field ||
    field.type === "toggle" ||
    field.type === "binary-toggle" ||
    field.type === "cycle-toggle" ||
    field.type === "select" ||
    field.type === "static"
  ) {
    return value;
  }

  const numericValue = Number(value);
  const numericStep = Number(field.step);
  if (!Number.isFinite(numericValue) || !Number.isFinite(numericStep)) {
    return value;
  }

  const min = Number(field.min);
  const max = Number(field.max);
  const stepOrigin = Number.isFinite(min) ? min : 0;
  const decimalPlaces = getDecimalPlaces(field.step);
  let nextValue =
    stepOrigin +
    Math.round((numericValue - stepOrigin) / numericStep) * numericStep;

  if (Number.isFinite(min) && Number.isFinite(max)) {
    nextValue = clamp(nextValue, min, max);
  }

  if (decimalPlaces === 0) {
    return Math.round(nextValue);
  }

  return Number(nextValue.toFixed(decimalPlaces));
};

const formatControlDisplayValue = (field, controls, timeS) => {
  const value = normalizeControlDisplayValue(field, controls[field.key]);

  return field.formatValue
    ? field.formatValue(value, controls, timeS)
    : String(value);
};

const mix = (from, to, ratio) => from + (to - from) * ratio;

const smoothstep = (edge0, edge1, value) => {
  const ratio = clamp01((value - edge0) / (edge1 - edge0));
  return ratio * ratio * (3 - 2 * ratio);
};

const getNightProgressFromHour = (hour) => {
  const normalizedHour = ((Number(hour) % 24) + 24) % 24;
  if (!Number.isFinite(normalizedHour)) {
    return 0;
  }

  if (normalizedHour >= 18) {
    return smoothstep(18, 20, normalizedHour);
  }

  if (normalizedHour <= 7) {
    return 1 - smoothstep(5, 7, normalizedHour);
  }

  return 0;
};

const getKrillPhaseVisual = (phase) => {
  switch (phase) {
    case "night":
      return {
        darkProgress: 1,
        stickyNightProgress: 1,
        grainOpacity: 0.46,
        overlayOpacity: 0,
        overlayTexture: seaLightPaperTextureUrl,
        stickyTexture: darkBlueStickyNoteTextureUrl,
        controlLightProgress: 0,
      };
    case "sunset":
      return {
        darkProgress: 0.79,
        stickyNightProgress: 0.52,
        grainOpacity: 0.55,
        overlayOpacity: 0.49,
        overlayTexture: seaLightPaperTextureUrl,
        stickyTexture: darkBlueStickyNoteTextureUrl,
        controlLightProgress: 0.28,
      };
    case "sunrise":
      return {
        darkProgress: 0.79,
        stickyNightProgress: 0.52,
        grainOpacity: 0.55,
        overlayOpacity: 0.49,
        overlayTexture: seaLightPaperTextureUrl,
        stickyTexture: darkBlueStickyNoteTextureUrl,
        controlLightProgress: 0.28,
      };
    default:
      return {
        darkProgress: 0,
        stickyNightProgress: 0,
        grainOpacity: 0.76,
        overlayOpacity: 0.94,
        overlayTexture: seaLightPaperTextureUrl,
        stickyTexture: darkBlueStickyNoteTextureUrl,
        controlLightProgress: 1,
      };
  }
};

const mixRgb = (from, to, ratio, alpha = null) => {
  const easedRatio = clamp01(ratio);
  const channels = from.map((channel, index) =>
    Math.round(mix(channel, to[index], easedRatio)),
  );

  return alpha === null
    ? `rgb(${channels[0]} ${channels[1]} ${channels[2]})`
    : `rgb(${channels[0]} ${channels[1]} ${channels[2]} / ${alpha})`;
};

const shallowEqualObject = (a, b) => {
  if (a === b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }

  return aKeys.every((key) => Object.is(a[key], b[key]));
};

// 동적으로 모든 Swarm 모듈 로드
const swarmModuleFiles = import.meta.glob("../behaviors/swarm/[0-9]*_*.jsx", {
  eager: false,
});

// 캐멜케이스를 스네이크케이스로 변환 (첫 글자는 소문자만)
const camelToSnake = (str) => {
  return (
    str.charAt(0).toLowerCase() +
    str.slice(1).replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`)
  );
};

// 파일명으로부터 동물 ID 추출 및 매핑
const generateSwarmModules = () => {
  const moduleMap = {};

  Object.entries(swarmModuleFiles).forEach(([path, moduleLoader]) => {
    // "./behaviors/swarm/01_Starling.jsx" -> "01_Starling"
    const filename = path.split("/").pop().replace(".jsx", "");
    const match = filename.match(/^\d+_(.+)$/);
    if (match) {
      const name = match[1]; // "Starling"
      const id = camelToSnake(name); // "starling"
      moduleMap[id] = moduleLoader;
    }
  });

  return moduleMap;
};

const swarmModules = generateSwarmModules();

function AnimalDockItem({ animal, atlas, isActive, onAnimalSelect }) {
  const [isAnimated, setIsAnimated] = React.useState(false);
  const dockStage = isAnimated
    ? atlas?.dockHoverStage || atlas?.defaultStage
    : atlas?.dockIdleStage || atlas?.defaultStage;

  return (
    <button
      type="button"
      className={["sim-animal-dock__item", isActive ? "is-active" : ""].join(
        " ",
      )}
      data-animal-id={animal.id}
      onClick={() => onAnimalSelect?.(animal.id)}
      onMouseEnter={() => setIsAnimated(true)}
      onMouseLeave={() => setIsAnimated(false)}
      onFocus={() => setIsAnimated(true)}
      onBlur={() => setIsAnimated(false)}
      aria-label={`${animal.label} 시뮬레이션으로 이동`}
      aria-pressed={isActive}
    >
      <span className="sim-animal-dock__sprite" aria-hidden="true">
        {atlas ? (
          <SpriteAtlas
            atlas={atlas}
            stage={dockStage}
            baseClassName={atlas.baseClassName}
            animated={isAnimated}
            renderMode="image"
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        ) : null}
      </span>
      <span className="sim-animal-dock__label">{animal.label}</span>
    </button>
  );
}

// 캔버스 렌더링 컴포넌트
function SwarmCanvas({
  animalId,
  animalLabel,
  onBackClick,
  onDetailClick,
  onAnimalSelect,
  isPaused,
  inactivityRemainingSeconds,
  onControlSnapshot,
}) {
  const [SwarmComponent, setSwarmComponent] = React.useState(null);
  const [swarmUi, setSwarmUi] = React.useState(null);
  const [sanitizeControls, setSanitizeControls] = React.useState(() => null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(null);
  const [gpuError, setGpuError] = React.useState("");
  const [controls, setControls] = React.useState(null);
  const [resetVisualValues, setResetVisualValues] = React.useState({});
  const [controlValueTime, setControlValueTime] = React.useState(0);
  const [retryCount, setRetryCount] = React.useState(0);
  const containerRef = React.useRef(null);
  const controlPanelRef = React.useRef(null);
  const timeoutRef = React.useRef(null);
  const resetAnimationFrameRef = React.useRef(null);
  const lastControlSnapshotRef = React.useRef(null);
  const controlSnapshotFrameRef = React.useRef(null);
  const pendingControlSnapshotRef = React.useRef(null);
  const lastSpinyLobsterHourInteractionAtRef = React.useRef(0);
  const cycleToggleDirectionRef = React.useRef({});

  const loadSwarmModule = React.useCallback(
    async (attempt = 0) => {
      if (!animalId) return;

      try {
        setIsLoading(true);
        setLoadError(null);

        const loader = swarmModules[animalId];
        if (!loader) {
          throw new Error(`Module loader not found for ${animalId}`);
        }

        // 타임아웃 설정 (15초)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Module load timeout")), 15000),
        );

        const modulePromise = loader();
        const module = await Promise.race([modulePromise, timeoutPromise]);

        setSwarmComponent(() => module.App);
        setSwarmUi(module.App?.ui ?? null);
        setSanitizeControls(() => module.App?.sanitizeControlState ?? null);
        setControls(
          module.App?.ui?.defaultControlState
            ? { ...module.App.ui.defaultControlState }
            : null,
        );
        setResetVisualValues({});
        setGpuError("");
        // setIsControlPanelOpen(true);
        setIsLoading(false);
        setRetryCount(0);
      } catch (err) {
        // 최대 3회까지 재시도
        if (attempt < 2) {
          timeoutRef.current = setTimeout(() => {
            setRetryCount(attempt + 1);
            loadSwarmModule(attempt + 1);
          }, 2000); // 2초 후 재시도
        } else {
          setLoadError(err);
          setIsLoading(false);
        }
      }
    },
    [animalId],
  );

  React.useEffect(() => {
    loadSwarmModule();
    const container = containerRef.current;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (resetAnimationFrameRef.current) {
        window.cancelAnimationFrame(resetAnimationFrameRef.current);
        resetAnimationFrameRef.current = null;
      }
      if (controlSnapshotFrameRef.current) {
        window.cancelAnimationFrame(controlSnapshotFrameRef.current);
        controlSnapshotFrameRef.current = null;
      }
      pendingControlSnapshotRef.current = null;

      // 언마운트 시 제거
      setSwarmComponent(null);
      setSwarmUi(null);
      setSanitizeControls(null);
      setControls(null);
      setResetVisualValues({});
      setGpuError("");

      // 모든 캔버스, WebGL 정리
      if (container) {
        const canvases = container.querySelectorAll("canvas");
        canvases.forEach((canvas) => {
          const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
          if (gl) {
            const ext = gl.getExtension("WEBGL_lose_context");
            if (ext) ext.loseContext();
          }
          canvas.remove();
        });
      }
    };
  }, [animalId, loadSwarmModule]);

  React.useEffect(() => {
    if (!SwarmComponent?.ui) {
      return;
    }

    setSwarmUi(SwarmComponent.ui);
    setSanitizeControls(() => SwarmComponent.sanitizeControlState ?? null);
    setControls((current) => {
      const defaults = SwarmComponent.ui?.defaultControlState;
      if (!defaults) {
        return current;
      }

      if (!current) {
        return { ...defaults };
      }

      const merged = {
        ...defaults,
        ...current,
      };
      return SwarmComponent.sanitizeControlState
        ? SwarmComponent.sanitizeControlState(merged)
        : merged;
    });
  }, [SwarmComponent]);

  React.useEffect(() => {
    const hasAnimatedValue = swarmUi?.controlFields?.some(
      (field) => field.animatedValue,
    );
    if (!hasAnimatedValue) {
      return undefined;
    }

    setControlValueTime(window.performance.now() * 0.001);
    const intervalId = window.setInterval(() => {
      setControlValueTime(window.performance.now() * 0.001);
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [swarmUi]);

  React.useEffect(() => {
    const panel = controlPanelRef.current;
    if (!panel) {
      return undefined;
    }

    const updatePaperOffset = () => {
      const height = panel.getBoundingClientRect().height;
      const offset = Math.max(-24, Math.min(0, (260 - height) * 0.072));
      panel.style.setProperty("--sim-control-paper-x", `${offset}px`);
    };

    updatePaperOffset();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updatePaperOffset);
      return () => window.removeEventListener("resize", updatePaperOffset);
    }

    const resizeObserver = new ResizeObserver(updatePaperOffset);
    resizeObserver.observe(panel);
    window.addEventListener("resize", updatePaperOffset);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePaperOffset);
    };
  }, [swarmUi]);

  const handleCanvasPointerProxy = React.useCallback((event) => {
    const targetElement = event.target instanceof Element ? event.target : null;
    const isInteractiveTarget = Boolean(
      targetElement?.closest(CANVAS_POINTER_BLOCK_SELECTOR),
    );

    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas || canvas === event.target) {
      return;
    }

    const nativeEvent = event.nativeEvent;
    const proxyType =
      isInteractiveTarget && event.type === "pointerdown"
        ? "pointermove"
        : event.type;
    const proxiedEvent = new PointerEvent(proxyType, {
      bubbles: true,
      cancelable: true,
      composed: true,
      pointerId: nativeEvent.pointerId,
      pointerType: nativeEvent.pointerType,
      isPrimary: nativeEvent.isPrimary,
      width: nativeEvent.width,
      height: nativeEvent.height,
      pressure: nativeEvent.pressure,
      tangentialPressure: nativeEvent.tangentialPressure,
      tiltX: nativeEvent.tiltX,
      tiltY: nativeEvent.tiltY,
      twist: nativeEvent.twist,
      button:
        proxyType === "pointermove" && isInteractiveTarget
          ? -1
          : nativeEvent.button,
      buttons:
        proxyType === "pointermove" && isInteractiveTarget
          ? 0
          : nativeEvent.buttons,
      clientX: nativeEvent.clientX,
      clientY: nativeEvent.clientY,
      screenX: nativeEvent.screenX,
      screenY: nativeEvent.screenY,
      ctrlKey: nativeEvent.ctrlKey,
      shiftKey: nativeEvent.shiftKey,
      altKey: nativeEvent.altKey,
      metaKey: nativeEvent.metaKey,
    });

    canvas.dispatchEvent(proxiedEvent);
  }, []);

  const resolvedControls = React.useMemo(() => {
    if (!controls) {
      return null;
    }

    return sanitizeControls ? sanitizeControls(controls) : controls;
  }, [controls, sanitizeControls]);

  const notifyControlSnapshot = React.useCallback(
    (nextControls) => {
      if (!onControlSnapshot) {
        return;
      }

      const snapshotValue = (() => {
        if (animalId === "bat") {
          const nextLightIntensityLux = Number(
            nextControls?.LIGHT_INTENSITY_LUX,
          );
          return Number.isFinite(nextLightIntensityLux)
            ? nextLightIntensityLux
            : null;
        }

        const phaseControlKey = PHASE_PREVIEW_CONTROLS[animalId];
        if (phaseControlKey) {
          const nextPhase = nextControls?.[phaseControlKey];
          return KRILL_LIGHT_PHASES.has(nextPhase) ? nextPhase : null;
        }

        const hourControlKey = AUTO_ADVANCING_HOUR_CONTROLS[animalId];
        if (hourControlKey) {
          const nextHour = Number(nextControls?.[hourControlKey]);
          return Number.isFinite(nextHour) ? nextHour : null;
        }

        return null;
      })();

      if (snapshotValue === null) {
        return;
      }

      if (Object.is(lastControlSnapshotRef.current, snapshotValue)) {
        return;
      }

      pendingControlSnapshotRef.current = snapshotValue;

      if (controlSnapshotFrameRef.current !== null) {
        return;
      }

      controlSnapshotFrameRef.current = window.requestAnimationFrame(() => {
        controlSnapshotFrameRef.current = null;
        const pendingValue = pendingControlSnapshotRef.current;
        pendingControlSnapshotRef.current = null;

        if (Object.is(lastControlSnapshotRef.current, pendingValue)) {
          return;
        }

        lastControlSnapshotRef.current = pendingValue;
        if (animalId === "bat") {
          onControlSnapshot({ lightIntensityLux: pendingValue });
        } else if (PHASE_PREVIEW_CONTROLS[animalId]) {
          onControlSnapshot({ lightPhase: pendingValue });
        } else {
          onControlSnapshot({ startHour: pendingValue });
        }
      });
    },
    [animalId, onControlSnapshot],
  );

  React.useEffect(() => {
    if (
      (animalId !== "bat" &&
        !AUTO_ADVANCING_HOUR_CONTROLS[animalId] &&
        !PHASE_PREVIEW_CONTROLS[animalId]) ||
      !resolvedControls
    ) {
      return;
    }

    notifyControlSnapshot(resolvedControls);
  }, [animalId, notifyControlSnapshot, resolvedControls]);

  const hasControls = Boolean(controls);

  React.useEffect(() => {
    const hourControlKey = AUTO_ADVANCING_HOUR_CONTROLS[animalId];
    if (!hourControlKey || !hasControls || isPaused) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const now = window.performance.now();
      if (
        now - lastSpinyLobsterHourInteractionAtRef.current <
        SPINY_LOBSTER_HOUR_MANUAL_HOLD_MS
      ) {
        return;
      }

      if (resetAnimationFrameRef.current) {
        return;
      }

      setControls((current) => {
        if (!current) {
          return current;
        }

        const currentHour = Number(current[hourControlKey]);
        const nextHour =
          ((Number.isFinite(currentHour) ? Math.round(currentHour) : 0) + 1) %
          24;
        const nextControls = {
          ...current,
          [hourControlKey]: nextHour,
        };
        const sanitizedControls = sanitizeControls
          ? sanitizeControls(nextControls)
          : nextControls;

        return shallowEqualObject(current, sanitizedControls)
          ? current
          : sanitizedControls;
      });
    }, SPINY_LOBSTER_HOUR_AUTO_ADVANCE_MS);

    return () => window.clearInterval(intervalId);
  }, [animalId, hasControls, isPaused, sanitizeControls]);

  if (isLoading) {
    return (
      <div className="sim-state sim-state--loading">
        <p>시뮬레이션 로딩 중...</p>
        {retryCount > 0 && (
          <p className="sim-state__subtext">재시도 중... ({retryCount}/2)</p>
        )}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="sim-state sim-state--error">
        <div className="sim-state__content">
          <p className="sim-state__title">⚠ 시뮬레이션 로드 실패</p>
          <p className="sim-state__subtext sim-state__subtext--tight">
            {String(loadError?.message || "Unknown error")}
          </p>
          <p className="sim-state__caption">
            페이지를 새로고침하거나 나중에 다시 시도해주세요.
          </p>
        </div>
      </div>
    );
  }

  const handleControlChange = (key, rawValue) => {
    const field = swarmUi?.controlFields?.find(
      (controlField) => controlField.key === key,
    );

    if (resetAnimationFrameRef.current) {
      window.cancelAnimationFrame(resetAnimationFrameRef.current);
      resetAnimationFrameRef.current = null;
    }
    setResetVisualValues((current) => {
      if (!(key in current)) {
        return current;
      }

      const { [key]: _removed, ...rest } = current;
      void _removed;
      return rest;
    });

    const parsedValue =
      typeof rawValue === "boolean"
        ? rawValue
        : typeof rawValue === "string" &&
            rawValue.trim() !== "" &&
            !Number.isNaN(Number(rawValue))
          ? Number(rawValue)
          : rawValue;
    const nextValue = normalizeControlInputValue(field, parsedValue);

    const hourControlKey = AUTO_ADVANCING_HOUR_CONTROLS[animalId];
    const phaseControlKey = PHASE_PREVIEW_CONTROLS[animalId];
    const shouldPreviewControl =
      (animalId === "bat" && key === "LIGHT_INTENSITY_LUX") ||
      key === hourControlKey ||
      key === phaseControlKey;

    if (key === hourControlKey) {
      lastSpinyLobsterHourInteractionAtRef.current = window.performance.now();
    }

    if (shouldPreviewControl) {
      const nextPreviewControls = {
        ...(resolvedControls ?? controls ?? {}),
        [key]: nextValue,
      };
      notifyControlSnapshot(
        sanitizeControls
          ? sanitizeControls(nextPreviewControls)
          : nextPreviewControls,
      );
    }

    setControls((current) => {
      if (!current) {
        return current;
      }

      if (Object.is(current[key], nextValue)) {
        return current;
      }

      const nextControls = {
        ...current,
        [key]: nextValue,
      };

      const sanitizedControls = sanitizeControls
        ? sanitizeControls(nextControls)
        : nextControls;
      return shallowEqualObject(current, sanitizedControls)
        ? current
        : sanitizedControls;
    });
  };

  const handleControlSliderWheel = (event, field) => {
    event.stopPropagation();

    const min = Number(field.min);
    const max = Number(field.max);
    const current = Number(resolvedControls?.[field.key]);
    const step = Number(field.step);

    if (
      !Number.isFinite(min) ||
      !Number.isFinite(max) ||
      min >= max ||
      !Number.isFinite(current)
    ) {
      return;
    }

    const resolvedStep =
      Number.isFinite(step) && step > 0 ? step : Math.max((max - min) / 100, 1);
    const direction = event.deltaY > 0 ? -1 : 1;
    const multiplier = event.shiftKey ? 5 : 1;
    const nextValue = clamp(
      current + direction * resolvedStep * multiplier,
      min,
      max,
    );

    handleControlChange(field.key, nextValue);
  };

  const handleCycleToggleChange = (field) => {
    const values = field.values || [];
    if (values.length === 0) {
      return;
    }

    const currentValue = resolvedControls?.[field.key];
    const currentIndex = Math.max(0, values.indexOf(currentValue));
    if (field.cycleMode === "loop") {
      handleControlChange(
        field.key,
        values[(currentIndex + 1) % values.length],
      );
      return;
    }

    const directionKey = `${animalId}:${field.key}`;
    let direction = cycleToggleDirectionRef.current[directionKey] ?? 1;

    if (currentIndex >= values.length - 1) {
      direction = -1;
    } else if (currentIndex <= 0) {
      direction = 1;
    }

    const nextIndex = clamp(currentIndex + direction, 0, values.length - 1);
    if (nextIndex >= values.length - 1) {
      direction = -1;
    } else if (nextIndex <= 0) {
      direction = 1;
    }

    cycleToggleDirectionRef.current[directionKey] = direction;
    handleControlChange(field.key, values[nextIndex]);
  };

  const handleControlReset = (key) => {
    if (!swarmUi?.defaultControlState || !resolvedControls) {
      return;
    }

    const field = swarmUi.controlFields?.find(
      (controlField) => controlField.key === key,
    );

    if (resetAnimationFrameRef.current) {
      window.cancelAnimationFrame(resetAnimationFrameRef.current);
      resetAnimationFrameRef.current = null;
    }

    const fromValue = Number(resolvedControls[key]);
    const targetValue = Number(swarmUi.defaultControlState[key]);

    if (!Number.isFinite(fromValue) || !Number.isFinite(targetValue)) {
      handleControlChange(key, swarmUi.defaultControlState[key]);
      return;
    }

    if (Math.abs(fromValue - targetValue) < Number.EPSILON) {
      return;
    }

    const hourControlKey = AUTO_ADVANCING_HOUR_CONTROLS[animalId];
    if (key === hourControlKey) {
      lastSpinyLobsterHourInteractionAtRef.current = window.performance.now();
    }

    const startedAt = window.performance.now();
    const animateReset = (now) => {
      const progress = Math.min(
        1,
        (now - startedAt) / CONTROL_RESET_LERP_DURATION_MS,
      );
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const visualValue =
        progress >= 1
          ? targetValue
          : fromValue + (targetValue - fromValue) * easedProgress;
      const nextValue = normalizeControlInputValue(field, visualValue);

      setResetVisualValues((current) =>
        progress >= 1
          ? (() => {
              const { [key]: _removed, ...rest } = current;
              void _removed;
              return rest;
            })()
          : {
              ...current,
              [key]: visualValue,
            },
      );

      const shouldPreviewControl =
        (animalId === "bat" && key === "LIGHT_INTENSITY_LUX") ||
        key === hourControlKey ||
        key === PHASE_PREVIEW_CONTROLS[animalId];

      if (shouldPreviewControl) {
        const nextPreviewControls = {
          ...(resolvedControls ?? controls ?? {}),
          [key]: visualValue,
        };
        notifyControlSnapshot(
          sanitizeControls
            ? sanitizeControls(nextPreviewControls)
            : nextPreviewControls,
        );
      }

      setControls((current) => {
        if (!current) {
          return current;
        }

        const nextControls = {
          ...current,
          [key]: nextValue,
        };

        const sanitizedControls = sanitizeControls
          ? sanitizeControls(nextControls)
          : nextControls;
        return shallowEqualObject(current, sanitizedControls)
          ? current
          : sanitizedControls;
      });

      if (progress < 1) {
        resetAnimationFrameRef.current =
          window.requestAnimationFrame(animateReset);
      } else {
        resetAnimationFrameRef.current = null;
      }
    };

    resetAnimationFrameRef.current = window.requestAnimationFrame(animateReset);
  };

  return (
    <div
      ref={containerRef}
      className="sim-canvas"
      onPointerDown={handleCanvasPointerProxy}
      onPointerMove={handleCanvasPointerProxy}
      onPointerUp={handleCanvasPointerProxy}
      onPointerCancel={handleCanvasPointerProxy}
    >
      {SwarmComponent ? (
        <SwarmComponent
          controls={resolvedControls}
          onGpuErrorChange={setGpuError}
          isPaused={isPaused}
        />
      ) : (
        <div className="sim-state sim-state--placeholder">
          <p>컴포넌트 준비 중...</p>
        </div>
      )}
      <div className="sim-overlay-stack">
        <button
          className="sim-overlay-button sim-back-button"
          onClick={onBackClick}
        >
          <span>← 처음으로</span>
        </button>
      </div>
      <button
        className="info_btn sim-overlay-button theme-button"
        onClick={onDetailClick}
        disabled={DETAIL_PAGE_DISABLED}
        aria-disabled={DETAIL_PAGE_DISABLED}
        title={
          DETAIL_PAGE_DISABLED
            ? "상세 페이지는 현재 비활성화되어 있습니다."
            : undefined
        }
        style={
          DETAIL_PAGE_DISABLED
            ? {
                cursor: "not-allowed",
                opacity: 0.45,
              }
            : undefined
        }
      >
        <span className="info_btn__eyebrow">Encyclopedia</span>
        <span className="info_btn__title">{animalLabel || "상세 보기"}</span>
      </button>
      {gpuError ? (
        <div className="sim-gpu-error sim-overlay-panel">{gpuError}</div>
      ) : null}
      {animalLabel ? (
        <div className="animal_name theme-panel-title sim-animal-title">
          {animalLabel}
        </div>
      ) : null}
      {swarmUi?.controlFields && resolvedControls ? (
        <div
          ref={controlPanelRef}
          className="sim-control-panel sim-overlay-panel"
        >
          <div className="sim-control-paper">
            {inactivityRemainingSeconds !== null ? (
              <p className="sim-inactivity-warning" aria-live="polite">
                {inactivityRemainingSeconds}초 후 처음으로 돌아갑니다
              </p>
            ) : null}
          </div>
          <div className="sim-control-panel__content">
            <div className="sim-control-panel__header">
              <div className="theme-panel-title sim-control-panel__title">
                시뮬레이션 옵션
                {/* Simulation Params */}
              </div>
            </div>
            <div className="sim-control-panel__body">
              {swarmUi.controlFields.map((field) => (
                <div
                  key={field.key}
                  className={[
                    "sim-control-field",
                    field.type === "toggle" ||
                    field.type === "binary-toggle" ||
                    field.type === "cycle-toggle"
                      ? "sim-control-field--toggle"
                      : "",
                  ].join(" ")}
                >
                  <div className="sim-control-field__row">
                    <span>{field.label}</span>
                    <div className="sim-control-field__value-group">
                      <span className="sim-control-field__value">
                        {formatControlDisplayValue(
                          field,
                          resolvedControls,
                          controlValueTime,
                        )}
                      </span>
                      {field.type === "static" ? null : field.type ===
                        "toggle" ? (
                        <button
                          type="button"
                          className={[
                            "sim-control-toggle-switch",
                            "sim-control-toggle-switch--inline",
                            resolvedControls[field.key] ? "is-on" : "is-off",
                          ].join(" ")}
                          onClick={() =>
                            handleControlChange(
                              field.key,
                              !resolvedControls[field.key],
                            )
                          }
                          aria-pressed={resolvedControls[field.key]}
                        >
                          <span className="sim-control-toggle-switch__track">
                            <span className="sim-control-toggle-switch__thumb" />
                          </span>
                        </button>
                      ) : field.type === "binary-toggle" ? (
                        <button
                          type="button"
                          className={[
                            "sim-control-toggle-switch",
                            "sim-control-toggle-switch--inline",
                            resolvedControls[field.key] === field.onValue
                              ? "is-on"
                              : "is-off",
                          ].join(" ")}
                          onClick={() =>
                            handleControlChange(
                              field.key,
                              resolvedControls[field.key] === field.onValue
                                ? field.offValue
                                : field.onValue,
                            )
                          }
                          aria-pressed={
                            resolvedControls[field.key] === field.onValue
                          }
                        >
                          <span className="sim-control-toggle-switch__track">
                            <span className="sim-control-toggle-switch__thumb" />
                          </span>
                        </button>
                      ) : field.type === "cycle-toggle" ? (
                        (() => {
                          const values = field.values || [];
                          const valueIndex = Math.max(
                            0,
                            values.indexOf(resolvedControls[field.key]),
                          );
                          const visualPositions =
                            field.visualPositions ||
                            values.map((_, index) => index);
                          const visualCount =
                            field.visualCount ||
                            Math.max(...visualPositions, values.length - 1) + 1;
                          const visualIndex =
                            visualPositions[valueIndex] ?? valueIndex;

                          return (
                            <button
                              type="button"
                              className="sim-control-cycle-toggle"
                              style={{
                                "--sim-cycle-index": visualIndex,
                                "--sim-cycle-count": visualCount,
                              }}
                              onClick={() => handleCycleToggleChange(field)}
                              aria-label={`${field.label} 변경`}
                            >
                              <span className="sim-control-cycle-toggle__track">
                                {Array.from(
                                  { length: visualCount },
                                  (_, index) => (
                                    <span
                                      key={index}
                                      className="sim-control-cycle-toggle__marker"
                                    />
                                  ),
                                )}
                                <span className="sim-control-cycle-toggle__thumb" />
                              </span>
                            </button>
                          );
                        })()
                      ) : field.type === "select" ? (
                        <select
                          value={resolvedControls[field.key]}
                          onChange={(event) =>
                            handleControlChange(field.key, event.target.value)
                          }
                        >
                          {field.options?.map((option) => {
                            const optionValue =
                              typeof option === "string"
                                ? option
                                : option.value;
                            const optionLabel =
                              typeof option === "string"
                                ? option
                                : option.label;
                            return (
                              <option key={optionValue} value={optionValue}>
                                {optionLabel}
                              </option>
                            );
                          })}
                        </select>
                      ) : (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleControlReset(field.key);
                          }}
                          className="sim-control-reset"
                          aria-label={`${field.label} 초기화`}
                          title={`${field.label} 초기화`}
                        >
                          <img
                            aria-hidden="true"
                            src={refreshIconUrl}
                            alt=""
                            draggable="false"
                          />
                        </button>
                      )}
                    </div>
                  </div>
                  {field.type === "toggle" ||
                  field.type === "binary-toggle" ||
                  field.type === "cycle-toggle" ||
                  field.type === "select" ||
                  field.type === "static" ? null : (
                    <input
                      className="sim-control-slider"
                      type="range"
                      min={field.min}
                      max={field.max}
                      step={
                        resetVisualValues[field.key] == null
                          ? field.step
                          : "any"
                      }
                      value={
                        resetVisualValues[field.key] ??
                        resolvedControls[field.key]
                      }
                      onChange={(event) =>
                        handleControlChange(field.key, event.target.value)
                      }
                      onWheel={(event) =>
                        handleControlSliderWheel(event, field)
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      <nav className="sim-animal-dock" aria-label="동물 시뮬레이션 이동">
        {animalDockItems.map((animal) => {
          const atlas = HOME_SPRITE_ATLASES[animal.id];

          return (
            <AnimalDockItem
              key={animal.id}
              animal={animal}
              atlas={atlas}
              isActive={animal.id === animalId}
              onAnimalSelect={onAnimalSelect}
            />
          );
        })}
      </nav>
    </div>
  );
}

function Sim(props) {
  const {
    selectedAnimal,
    onBackClick,
    onDetailClick,
    onAnimalSelect,
    isPaused,
    inactivityRemainingSeconds,
  } = props;
  const [batLightIntensityLux, setBatLightIntensityLux] = React.useState(null);
  const [spinyLobsterStartHour, setSpinyLobsterStartHour] =
    React.useState(null);
  const [krillLightPhase, setKrillLightPhase] = React.useState(null);
  const animalLabel = selectedAnimal ? animalNames[selectedAnimal] : "";
  const textureUrl = selectedAnimal ? SIM_TEXTURES[selectedAnimal] : null;
  const stickyNote = selectedAnimal ? SIM_STICKY_NOTES[selectedAnimal] : null;
  const isBat = selectedAnimal === "bat";
  const isSpinyLobster = selectedAnimal === "spiny_lobster";
  const isKrill = selectedAnimal === "krill";
  const batLightProgress = isBat
    ? clamp01(((batLightIntensityLux ?? 1.4) - 1.4) / (400 - 1.4))
    : 0;
  const batNightOpacity = Math.max(0.08, 1 - batLightProgress * 0.86);
  const batStickyNightOpacity = Math.max(0.04, 1 - batLightProgress * 0.92);
  const batSurfaceLightProgress = smoothstep(0.46, 0.7, 1 - batNightOpacity);
  const batControlDimProgress = smoothstep(0.62, 0.86, 1 - batNightOpacity);
  const batBrightnessStyle = isBat
    ? {
        "--sim-bright-paper-texture": `url(${skyPaperTextureUrl})`,
        "--sim-bright-sticky-texture": `url(${blueStickyNoteTextureUrl})`,
        "--sim-night-background-opacity": String(batNightOpacity.toFixed(3)),
        "--sim-night-sticky-opacity": String(batStickyNightOpacity.toFixed(3)),
        "--sim-paper-grain-opacity": String(
          (0.2 + batNightOpacity * 0.52).toFixed(3),
        ),
        "--sim-sticky-text": mixRgb(
          [232, 226, 207],
          [33, 48, 64],
          batSurfaceLightProgress,
          (0.96 + batSurfaceLightProgress * 0.04).toFixed(3),
        ),
        "--sim-sticky-muted": mixRgb(
          [204, 195, 172],
          [54, 77, 98],
          batSurfaceLightProgress,
          (0.78 + batSurfaceLightProgress * 0.04).toFixed(3),
        ),
        "--sim-sticky-strong": mixRgb(
          [255, 247, 214],
          [19, 38, 58],
          batSurfaceLightProgress,
        ),
        "--sim-control-dim": mixRgb(
          [255, 247, 214],
          [8, 20, 31],
          batControlDimProgress,
          (0.18 - batControlDimProgress * 0.075).toFixed(3),
        ),
        "--sim-control-dim-soft": mixRgb(
          [255, 247, 214],
          [8, 20, 31],
          batControlDimProgress,
          (0.13 - batControlDimProgress * 0.05).toFixed(3),
        ),
        "--sim-control-dim-active": mixRgb(
          [255, 247, 214],
          [8, 20, 31],
          batControlDimProgress,
          (0.24 - batControlDimProgress * 0.115).toFixed(3),
        ),
        "--sim-control-reset-filter":
          batSurfaceLightProgress > 0.55
            ? "brightness(0) saturate(100%) opacity(0.92)"
            : FIREFLY_SIM_THEME["--sim-control-reset-filter"],
      }
    : null;
  const spinyNightProgress = isSpinyLobster
    ? getNightProgressFromHour(spinyLobsterStartHour ?? 20)
    : 0;
  const spinyDayProgress = 1 - spinyNightProgress;
  const spinyTextLightProgress = smoothstep(0.68, 0.94, spinyNightProgress);
  const spinyLobsterStyle = isSpinyLobster
    ? {
        "--sim-bright-sticky-texture": `url(${lightYellowStickyNoteTextureUrl})`,
        "--sim-night-sticky-opacity": String(spinyNightProgress.toFixed(3)),
        "--sim-sticky-texture": `url(${tealStickyNoteTextureUrl})`,
        "--sim-sticky-text": mixRgb(
          [62, 42, 11],
          [232, 255, 241],
          spinyTextLightProgress,
          (0.94 + spinyTextLightProgress * 0.04).toFixed(3),
        ),
        "--sim-sticky-muted": mixRgb(
          [86, 61, 21],
          [204, 231, 216],
          spinyTextLightProgress,
          (0.74 + spinyTextLightProgress * 0.06).toFixed(3),
        ),
        "--sim-sticky-strong": mixRgb(
          [48, 31, 7],
          [244, 255, 248],
          spinyTextLightProgress,
        ),
        "--sim-control-dim": mixRgb(
          [255, 247, 214],
          [0, 0, 0],
          spinyDayProgress,
          (0.14 - spinyDayProgress * 0.065).toFixed(3),
        ),
        "--sim-control-dim-soft": mixRgb(
          [255, 247, 214],
          [0, 0, 0],
          spinyDayProgress,
          (0.1 - spinyDayProgress * 0.045).toFixed(3),
        ),
        "--sim-control-dim-active": mixRgb(
          [255, 247, 214],
          [0, 0, 0],
          spinyDayProgress,
          (0.2 - spinyDayProgress * 0.1).toFixed(3),
        ),
        "--sim-control-reset-filter":
          spinyTextLightProgress > 0.5
            ? FIREFLY_SIM_THEME["--sim-control-reset-filter"]
            : "brightness(0) saturate(100%) opacity(0.92)",
      }
    : null;
  const spinyLobsterBackgroundOverlayStyle = isSpinyLobster
    ? {
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background: `url(${oceanSandDarkPaperTextureUrl}), linear-gradient(135deg, rgb(40 76 73), rgb(60 107 101))`,
        backgroundSize: "544px 544px, 100% 100%",
        opacity: String((spinyNightProgress * 0.58).toFixed(3)),
        transition: "opacity 180ms linear",
      }
    : null;
  const krillPhaseVisual = isKrill
    ? getKrillPhaseVisual(krillLightPhase ?? "day")
    : null;
  const krillStyle = krillPhaseVisual
    ? {
        "--sim-bright-sticky-texture": `url(${darkBlueLightStickyNoteTextureUrl})`,
        "--sim-night-sticky-opacity": String(
          krillPhaseVisual.stickyNightProgress.toFixed(3),
        ),
        "--sim-sticky-texture": `url(${krillPhaseVisual.stickyTexture})`,
        "--sim-paper-grain-opacity": String(
          krillPhaseVisual.grainOpacity.toFixed(3),
        ),
        "--sim-sticky-text": mixRgb(
          [33, 48, 64],
          [238, 250, 245],
          Math.max(0.78, krillPhaseVisual.darkProgress),
          (0.92 + krillPhaseVisual.darkProgress * 0.06).toFixed(3),
        ),
        "--sim-sticky-muted": mixRgb(
          [54, 77, 98],
          [198, 228, 221],
          Math.max(0.72, krillPhaseVisual.darkProgress),
          (0.72 + krillPhaseVisual.darkProgress * 0.08).toFixed(3),
        ),
        "--sim-sticky-strong": mixRgb(
          [19, 38, 58],
          [250, 255, 247],
          Math.max(0.84, krillPhaseVisual.darkProgress),
        ),
        "--sim-control-dim": mixRgb(
          [0, 0, 0],
          [250, 255, 247],
          1 - krillPhaseVisual.controlLightProgress,
          (0.075 + krillPhaseVisual.darkProgress * 0.065).toFixed(3),
        ),
        "--sim-control-dim-soft": mixRgb(
          [0, 0, 0],
          [250, 255, 247],
          1 - krillPhaseVisual.controlLightProgress,
          (0.055 + krillPhaseVisual.darkProgress * 0.045).toFixed(3),
        ),
        "--sim-control-dim-active": mixRgb(
          [0, 0, 0],
          [250, 255, 247],
          1 - krillPhaseVisual.controlLightProgress,
          (0.1 + krillPhaseVisual.darkProgress * 0.1).toFixed(3),
        ),
        "--sim-control-reset-filter":
          krillPhaseVisual.darkProgress > 0.42
            ? FIREFLY_SIM_THEME["--sim-control-reset-filter"]
            : "brightness(0) saturate(100%) opacity(0.92)",
      }
    : null;
  const krillBackgroundOverlayStyle = krillPhaseVisual
    ? {
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background: `url(${krillPhaseVisual.overlayTexture})`,
        backgroundSize: "544px 544px",
        opacity: String(krillPhaseVisual.overlayOpacity.toFixed(3)),
        transition: "opacity 180ms linear",
      }
    : null;
  const simTextureStyle = textureUrl
    ? {
        "--sim-paper-texture": `url(${textureUrl})`,
        "--sim-black-paper-texture": `url(${textureUrl})`,
      }
    : null;
  const stickyNoteStyle = stickyNote
    ? {
        "--sim-sticky-texture": `url(${stickyNote.texture})`,
        "--sim-sticky-text": stickyNote.text,
        "--sim-sticky-muted": stickyNote.muted,
        "--sim-sticky-strong": stickyNote.strong,
        "--sim-sticky-rotate": stickyNote.rotate,
      }
    : null;
  const usesDarkControlTheme =
    selectedAnimal === "firefly" || selectedAnimal === "bat";
  const simStyle = usesDarkControlTheme
    ? {
        ...FIREFLY_SIM_THEME,
        ...simTextureStyle,
        ...stickyNoteStyle,
        ...batBrightnessStyle,
        ...spinyLobsterStyle,
        ...krillStyle,
      }
    : {
        ...simTextureStyle,
        ...stickyNoteStyle,
        ...spinyLobsterStyle,
        ...krillStyle,
      };
  const simClassName = [
    "sim",
    usesDarkControlTheme ? "sim--firefly" : "",
    isBat ? "sim--bat" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleControlSnapshot = React.useCallback(
    (snapshot) => {
      if (isBat) {
        setBatLightIntensityLux((current) =>
          Object.is(current, snapshot.lightIntensityLux)
            ? current
            : snapshot.lightIntensityLux,
        );
      }

      if (isSpinyLobster) {
        setSpinyLobsterStartHour((current) =>
          Object.is(current, snapshot.startHour) ? current : snapshot.startHour,
        );
      }

      if (isKrill) {
        setKrillLightPhase((current) =>
          Object.is(current, snapshot.lightPhase)
            ? current
            : snapshot.lightPhase,
        );
      }
    },
    [isBat, isSpinyLobster, isKrill],
  );

  React.useEffect(() => {
    if (!isBat) {
      setBatLightIntensityLux(null);
    }
    if (!isSpinyLobster) {
      setSpinyLobsterStartHour(null);
    }
    if (!isKrill) {
      setKrillLightPhase(null);
    }
  }, [isBat, isSpinyLobster, isKrill]);

  React.useEffect(() => {
    if (PRELOAD_TEXTURE_URLS.length === 0) {
      return undefined;
    }

    let isCancelled = false;
    let idleCallbackId = null;
    let timeoutId = null;
    const scheduleIdle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback
        : (callback) =>
            window.setTimeout(
              () =>
                callback({
                  didTimeout: false,
                  timeRemaining: () => 8,
                }),
              120,
            );
    const cancelIdle =
      typeof window.cancelIdleCallback === "function"
        ? window.cancelIdleCallback
        : window.clearTimeout;

    const preloadNextTexture = (index = 0) => {
      if (isCancelled || index >= PRELOAD_TEXTURE_URLS.length) {
        return;
      }

      const textureUrl = PRELOAD_TEXTURE_URLS[index];
      if (preloadedTextureUrls.has(textureUrl)) {
        preloadNextTexture(index + 1);
        return;
      }

      preloadedTextureUrls.add(textureUrl);
      const image = new Image();
      image.decoding = "async";
      image.src = textureUrl;

      const continuePreloading = () => {
        if (isCancelled) {
          return;
        }

        timeoutId = window.setTimeout(() => {
          idleCallbackId = scheduleIdle(() => preloadNextTexture(index + 1));
        }, 24);
      };

      if (typeof image.decode === "function") {
        image.decode().then(continuePreloading, continuePreloading);
      } else {
        image.onload = continuePreloading;
        image.onerror = continuePreloading;
      }
    };

    idleCallbackId = scheduleIdle(() => preloadNextTexture());

    return () => {
      isCancelled = true;
      if (idleCallbackId !== null) {
        cancelIdle(idleCallbackId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div className={simClassName} style={simStyle}>
      {spinyLobsterBackgroundOverlayStyle ? (
        <div aria-hidden="true" style={spinyLobsterBackgroundOverlayStyle} />
      ) : null}
      {krillBackgroundOverlayStyle ? (
        <div aria-hidden="true" style={krillBackgroundOverlayStyle} />
      ) : null}
      {selectedAnimal && (
        <SwarmCanvas
          key={selectedAnimal}
          animalId={selectedAnimal}
          animalLabel={animalLabel}
          onBackClick={onBackClick}
          onDetailClick={onDetailClick}
          onAnimalSelect={onAnimalSelect}
          isPaused={isPaused}
          inactivityRemainingSeconds={inactivityRemainingSeconds}
          onControlSnapshot={
            isBat || isSpinyLobster || isKrill
              ? handleControlSnapshot
              : undefined
          }
        />
      )}
    </div>
  );
}

export default Sim;

import React from "react";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { resolveAtlasFrameSize } from "../../utils/spriteAtlas";
import { resolveCanvasAtlasSprite } from "../../utils/spritePose";
import { getThemeBackgroundRgb } from "../../utils/theme";

// 기본 상태
const PARAMS = {
  SLIDER: 50,
};

const CONTROL_FIELDS = [
  {
    key: "SLIDER",
    label: "슬라이더 예시",
    min: 0,
    max: 100,
    step: 1,
    formatValue: (value) => `${value}`,
  },
  {
    key: "TOGGLE",
    label: "토글 예시",
    type: "toggle",
    formatValue: (value) => (value ? "TRUE" : "FALSE"),
  },
];

const DEFAULT_CONTROL_STATE = {
  SLIDER: PARAMS.SLIDER,
  TOGGLE: true,
};

// 아틀라스 참조
const ATLAS = HOME_SPRITE_ATLASES.spiny_lobster;
const AGENT_COUNT = 24;

// 공통 계산
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const randomBetween = (min, max) => min + Math.random() * (max - min);

// 에이전트 생성
const createAgent = (width, height) => {
  return {
    x: randomBetween(0, width),
    y: randomBetween(0, height),
    vx: Math.random() > 0.5 ? 24 : -24,
    vy: randomBetween(-8, 8),
    stageOffset: randomBetween(0, 1000),
    previousScreenPosition: null,
    spriteProfile: "simulation",
    spriteSpace: "2d",
    spriteState: undefined,
  };
};

const createAgents = (count, width, height) =>
  Array.from({ length: count }, () => createAgent(width, height));

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

// 플레이스홀더 앱
export function App({ controls, onGpuErrorChange, isPaused = false }) {
  const canvasRef = React.useRef(null);
  const imageRef = React.useRef(null);
  const rasterCanvasRef = React.useRef(null);
  const animationFrameRef = React.useRef(0);
  const agentsRef = React.useRef([]);
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

  // 프레임 루프
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return undefined;
    }

    const ensureAgents = (width, height) => {
      if (agentsRef.current.length === 0) {
        agentsRef.current = createAgents(AGENT_COUNT, width, height);
        return;
      }

      agentsRef.current.forEach((agent) => {
        agent.x = clamp(agent.x, 0, width);
        agent.y = clamp(agent.y, 0, height);
      });
    };

    const render = (timestamp) => {
      const now = timestamp * 0.001;
      const dt = lastTimeRef.current
        ? Math.min(now - lastTimeRef.current, 0.05)
        : 0.016;
      lastTimeRef.current = now;

      const size = syncCanvasSize(canvas, ctx);
      ensureAgents(size.width, size.height);

      const backgroundRgb = getThemeBackgroundRgb();
      ctx.clearRect(0, 0, size.width, size.height);
      ctx.fillStyle = `rgb(${backgroundRgb.join(", ")})`;
      ctx.fillRect(0, 0, size.width, size.height);

      const image = rasterCanvasRef.current || imageRef.current;
      const frameSize = frameSizeRef.current;

      agentsRef.current.forEach((agent, index) => {
        if (!isPaused) {
          let didWrap = false;

          agent.x += agent.vx * dt;
          agent.y += agent.vy * dt;

          if (agent.x < -frameSize.width) {
            agent.x = size.width + frameSize.width;
            didWrap = true;
          } else if (agent.x > size.width + frameSize.width) {
            agent.x = -frameSize.width;
            didWrap = true;
          }

          if (agent.y < -frameSize.height * 0.5) {
            agent.y = size.height + frameSize.height * 0.35;
            didWrap = true;
          } else if (agent.y > size.height + frameSize.height * 0.5) {
            agent.y = -frameSize.height * 0.35;
            didWrap = true;
          }

          if (didWrap) {
            agent.previousScreenPosition = null;
          }
        }

        if (!image) {
          return;
        }

        const sprite = resolveCanvasAtlasSprite(ATLAS, {
          space: agent.spriteSpace || "2d",
          position: agent.spritePosition || { x: agent.x, y: agent.y },
          velocity: agent.spriteVelocity || { x: agent.vx, y: agent.vy },
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
        const bobOffset = Math.sin(now * 2 + index * 0.7) * 4;
        agent.previousScreenPosition = sprite.pose.screenPosition;

        ctx.save();
        ctx.translate(agent.x, agent.y + bobOffset);
        ctx.rotate(sprite.rotation);
        ctx.scale(sprite.flipX, 1);
        ctx.drawImage(
          image,
          sprite.frame.x * frameSize.width,
          sprite.frame.y * frameSize.height,
          frameSize.width,
          frameSize.height,
          -frameSize.width * 0.5,
          -frameSize.height * 0.5,
          frameSize.width,
          frameSize.height,
        );
        ctx.restore();
      });

      animationFrameRef.current = window.requestAnimationFrame(render);
    };

    animationFrameRef.current = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPaused]);

  void controls;
  void PARAMS;

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
  ...DEFAULT_CONTROL_STATE,
  ...(rawControls ?? {}),
});

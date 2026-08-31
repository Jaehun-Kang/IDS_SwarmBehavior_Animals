import React from "react";
import {
  resolveAtlasGrid,
  getAtlasFrameStyle,
  resolveAtlasAspectRatio,
  resolveAtlasFrameSize,
  resolveStageFrameSequence,
} from "../utils/spriteAtlas";

const getObservedStageName = (element, atlas) => {
  if (!element || !atlas?.stages) {
    return null;
  }

  const stageNames = new Set(Object.keys(atlas.stages));
  const tokens = Array.from(element.classList);

  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    const token = tokens[index];
    if (stageNames.has(token)) {
      return token;
    }
  }

  return null;
};

function SpriteAtlas({
  atlas,
  stage,
  frame,
  baseClassName,
  className,
  observeClassNameStages = false,
  animated = true,
  aspectRatio,
  renderMode = "background",
  style,
}) {
  const containerRef = React.useRef(null);
  const [imageSize, setImageSize] = React.useState(null);
  const [observedStage, setObservedStage] = React.useState(null);
  const [activeFrameIndex, setActiveFrameIndex] = React.useState(0);

  React.useEffect(() => {
    if (!atlas?.src) {
      return undefined;
    }

    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) {
        return;
      }

      setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.src = atlas.src;

    return () => {
      cancelled = true;
    };
  }, [atlas?.src]);

  React.useEffect(() => {
    if (!observeClassNameStages || !containerRef.current) {
      return undefined;
    }

    const element = containerRef.current;
    const syncStage = () => {
      setObservedStage(getObservedStageName(element, atlas));
    };

    syncStage();

    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.attributeName === "class")) {
        syncStage();
      }
    });

    observer.observe(element, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, [atlas, observeClassNameStages]);

  const sequence = React.useMemo(
    () => resolveStageFrameSequence(atlas, stage || observedStage, frame),
    [atlas, frame, observedStage, stage],
  );

  React.useEffect(() => {
    setActiveFrameIndex(0);
  }, [sequence.stageName, sequence.type, sequence.frames.length]);

  React.useEffect(() => {
    if (
      !animated ||
      sequence.type !== "animation" ||
      sequence.frames.length <= 1
    ) {
      return undefined;
    }

    const frameCount = sequence.frames.length;
    const stepMs = sequence.fps
      ? Math.max(16, 1000 / sequence.fps)
      : Math.max(16, (sequence.durationMs || 120) / frameCount);

    const intervalId = window.setInterval(() => {
      setActiveFrameIndex((current) => {
        const next = current + 1;
        if (next < frameCount) {
          return next;
        }

        return sequence.loop === false ? frameCount - 1 : 0;
      });
    }, stepMs);

    return () => window.clearInterval(intervalId);
  }, [
    animated,
    sequence.durationMs,
    sequence.fps,
    sequence.frames,
    sequence.loop,
    sequence.type,
  ]);

  const activeFrame = sequence.frames[activeFrameIndex] ||
    sequence.frames[0] || { x: 0, y: 0 };

  const outerStyle = {
    width: "100%",
    height: "100%",
    position: "relative",
    background: "none",
    animation: "none",
    aspectRatio: aspectRatio || resolveAtlasAspectRatio(atlas, imageSize),
    ...style,
  };

  const innerStyle = {
    width: "100%",
    height: "100%",
    ...getAtlasFrameStyle({ atlas, imageSize, frame: activeFrame }),
  };

  const grid = resolveAtlasGrid(atlas, imageSize);
  const frameSize = resolveAtlasFrameSize(atlas, imageSize);
  const resolvedImageSize = atlas?.imageSize || imageSize;
  const imageStyle = {
    position: "absolute",
    left: `${-activeFrame.x * 100}%`,
    top: `${-activeFrame.y * 100}%`,
    width: `${grid.columns * 100}%`,
    height: `${grid.rows * 100}%`,
    maxWidth: "none",
    display: "block",
    userSelect: "none",
    pointerEvents: "none",
  };
  const svgFrameStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "block",
    overflow: "hidden",
    userSelect: "none",
    pointerEvents: "none",
  };
  const canRenderSvgFrame =
    resolvedImageSize?.width &&
    resolvedImageSize?.height &&
    frameSize?.width &&
    frameSize?.height;

  return (
    <div
      ref={containerRef}
      className={[baseClassName, className].filter(Boolean).join(" ")}
      data-sprite-stage={sequence.stageName || undefined}
      data-sprite-frame-x={activeFrame.x}
      data-sprite-frame-y={activeFrame.y}
      style={
        renderMode === "image"
          ? { ...outerStyle, overflow: "hidden" }
          : outerStyle
      }
    >
      {renderMode === "image" && canRenderSvgFrame ? (
        <svg
          aria-hidden="true"
          viewBox={`${activeFrame.x * frameSize.width} ${
            activeFrame.y * frameSize.height
          } ${frameSize.width} ${frameSize.height}`}
          preserveAspectRatio="none"
          draggable="false"
          style={svgFrameStyle}
        >
          <image
            href={atlas.src}
            x="0"
            y="0"
            width={resolvedImageSize.width}
            height={resolvedImageSize.height}
          />
        </svg>
      ) : renderMode === "image" ? (
        <img
          aria-hidden="true"
          alt=""
          src={atlas.src}
          draggable="false"
          style={imageStyle}
        />
      ) : (
        <div aria-hidden="true" style={innerStyle} />
      )}
    </div>
  );
}

export default SpriteAtlas;

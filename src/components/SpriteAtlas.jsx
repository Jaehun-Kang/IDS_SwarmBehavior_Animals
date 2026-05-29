import React from "react";
import {
  getAtlasFrameStyle,
  resolveAtlasAspectRatio,
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

  return (
    <div
      ref={containerRef}
      className={[baseClassName, className].filter(Boolean).join(" ")}
      data-sprite-stage={sequence.stageName || undefined}
      data-sprite-frame-x={activeFrame.x}
      data-sprite-frame-y={activeFrame.y}
      style={outerStyle}
    >
      <div aria-hidden="true" style={innerStyle} />
    </div>
  );
}

export default SpriteAtlas;

import React from "react";
import { createBookCanvasLoop } from "../../utils/bookCanvasLoop.js";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { loadTexturedAtlasCanvas, getAtlasFrameCanvas,
  resolveStageFrameSequence } from "../../utils/spriteAtlas";
import { advanceFlightModel, createFlightModel, getFlightRenderPose,
  FLIGHT_STEP_S } from "./starlingFlightModel.js";

const atlas = HOME_SPRITE_ATLASES.starling;
const sequence = resolveStageFrameSequence(atlas, "starling_fly4");
const flightEngine = {
  create: createFlightModel,
  advance: advanceFlightModel,
  pose: getFlightRenderPose,
  step: FLIGHT_STEP_S,
};

export default function StarlingFlightPreview({ ruleGroup, controls, engine = flightEngine }) {
  const canvasRef = React.useRef(null);
  const controlsRef = React.useRef(controls);
  const [error, setError] = React.useState("");
  React.useEffect(() => { controlsRef.current = controls; }, [controls]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    let disposed = false, model, frames;
    const pose = {};
    const loop = createBookCanvasLoop(canvas, {
      onResize: ({ width, height }) => { model = engine.create(width / height); },
      onFrame: ({ context, width, height, elapsedSeconds }) => {
        engine.advance(model, controlsRef.current, elapsedSeconds);
        context.clearRect(0, 0, width, height);
      const viewport = engine.viewport?.(model) ?? { x: 0, y: 0, width: model.width };
      const scale = width / viewport.width;
      const spriteSize = scale * 0.42;
      const renderTime = Math.max(0, model.time - engine.step + model.remainder);
      for (let index = 0; index < model.agents.length; index += 1) {
        const agent = model.agents[index];
        engine.pose(model, index, pose);
        const phase = (renderTime * 10 + agent.id * 0.37) % 1;
        const frame = frames[Math.floor(phase * frames.length)];
        context.save();
        context.translate((pose.x - viewport.x) * scale, (pose.y - viewport.y) * scale);
        context.rotate(pose.heading);
        if (pose.bank) context.scale(1, Math.cos(pose.bank));
        context.drawImage(frame, -spriteSize / 2, -spriteSize / 2, spriteSize, spriteSize);
        context.restore();
      }
      },
    });
    loadTexturedAtlasCanvas(atlas).then((result) => {
      if (disposed) return;
      frames = sequence.frames.map((frame) => getAtlasFrameCanvas(result.frameCanvases, frame));
      if (frames.some((frame) => !frame)) throw new Error("starling-frame-missing");
      loop.start();
    }).catch(() => {
      if (!disposed) setError("찌르레기 이미지를 불러오지 못했습니다.");
    });
    return () => { disposed = true; loop.dispose(); };
  }, [engine]);

  return (
    <div className="canvas-placeholder rule-preview" aria-label={`${ruleGroup.category} 미니 시뮬레이션`}>
      {error ? <span role="alert">{error}</span> : null}
      <canvas ref={canvasRef} className="rule-preview__canvas" />
    </div>
  );
}

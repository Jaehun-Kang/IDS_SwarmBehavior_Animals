import React from "react";
import { ANT_SIGNAL_COLORS } from "../../data/antSignalColors.js";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { loadTexturedAtlasCanvas, getAtlasFrameCanvas, resolveStageFrameSequence } from "../../utils/spriteAtlas";
import { createBookCanvasLoop } from "../../utils/bookCanvasLoop.js";
import { createAntExploration, advanceAntExploration, antExplorationPose } from "./antExplorationModel.js";
import { antTrailAlpha } from "./antTrailField.js";
import { createAntTraffic, advanceAntTraffic, antTrafficPose } from "./antTrafficModel.js";
import { createAntMill, advanceAntMill, antMillPose } from "./antMillModel.js";

const atlas = HOME_SPRITE_ATLASES.ant;
const engines = {
  ant_exploration: { create: createAntExploration, advance: advanceAntExploration, pose: antExplorationPose },
  ant_traffic: { create: createAntTraffic, advance: advanceAntTraffic, pose: antTrafficPose },
  ant_mill: { create: createAntMill, advance: advanceAntMill, pose: antMillPose },
};
export default function AntExplorationPreview({ controls, ruleGroup }) {
  const engine = engines[ruleGroup.previewId];
  const canvasRef = React.useRef(null), controlsRef = React.useRef(controls);
  const [error, setError] = React.useState("");
  React.useEffect(() => { controlsRef.current = controls; }, [controls]);
  React.useEffect(() => {
    let model, frame, disposed = false;
    const trailCanvas = document.createElement("canvas");
    const trailContext = trailCanvas.getContext("2d");
    let pixels, revision = -1;
    const pose = {};
    const loop = createBookCanvasLoop(canvasRef.current, {
      onResize: ({ width, height }) => {
        model = engine.create(width / height);
        trailCanvas.width = model.field.cols; trailCanvas.height = model.field.rows;
        pixels = trailContext.createImageData(model.field.cols, model.field.rows);
        revision = -1;
      },
      onFrame: ({ context, width, height, elapsedSeconds }) => {
        engine.advance(model, controlsRef.current, elapsedSeconds);
        context.clearRect(0, 0, width, height);
        const scale = width / model.width;
        if (model.showTrail || model.traffic || controlsRef.current.deposit_strength !== undefined) {
          if (revision !== model.field.revision) {
            for (let i = 0; i < model.field.values.length; i++) {
              pixels.data[i * 4] = ANT_SIGNAL_COLORS.trail[0];
              pixels.data[i * 4 + 1] = ANT_SIGNAL_COLORS.trail[1];
              pixels.data[i * 4 + 2] = ANT_SIGNAL_COLORS.trail[2];
              pixels.data[i * 4 + 3] = antTrailAlpha(model.field.values[i]);
            }
            trailContext.putImageData(pixels, 0, 0);
            revision = model.field.revision;
          }
          context.drawImage(trailCanvas, -model.field.cell * scale / 2, -model.field.cell * scale / 2,
            model.field.cols * model.field.cell * scale, model.field.rows * model.field.cell * scale);
        }
        for (let i = 0; i < model.agents.length; i++) {
          engine.pose(model, i, pose);
          const size = scale * 2.3;
          context.save();
          context.translate(pose.x * scale, pose.y * scale);
          context.rotate(pose.heading);
          if (model.agents[i].carrying) {
            context.fillStyle = "rgba(210, 82, 58, 0.667)";
            context.beginPath();
            context.arc(size * 0.425, 0, size * 0.05, 0, Math.PI * 2);
            context.fill();
          }
          context.drawImage(frame, -size / 2, -size * 70 / 320, size, size * 70 / 160);
          context.restore();
        }
      },
    });
    loadTexturedAtlasCanvas(atlas).then(result => {
      if (disposed) return;
      const sequence = resolveStageFrameSequence(atlas, "ant_top");
      frame = getAtlasFrameCanvas(result.frameCanvases, sequence.frames[0]);
      if (!frame) throw new Error("ant-top-frame-missing");
      loop.start();
    }).catch(() => { if (!disposed) setError("개미 이미지를 불러오지 못했습니다."); });
    return () => { disposed = true; loop.dispose(); };
  }, [engine]);
  return <div className="canvas-placeholder rule-preview" aria-label={`${ruleGroup.category} 미니 시뮬레이션`}>
    {error ? <span role="alert">{error}</span> : null}
    <canvas ref={canvasRef} className="rule-preview__canvas" />
  </div>;
}

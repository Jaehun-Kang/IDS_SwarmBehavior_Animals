import React from "react";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { loadTexturedAtlasCanvas, getAtlasFrameCanvas, resolveStageFrameSequence } from "../../utils/spriteAtlas";
import { createBookCanvasLoop } from "../../utils/bookCanvasLoop.js";
import { createBatFlight, advanceBatFlight, batFlightPose } from "./batFlightModel.js";
import { createBatEmergence, advanceBatEmergence, batEmergencePose } from "./batEmergenceModel.js";
const atlas = HOME_SPRITE_ATLASES.bat;
const engines = {
  bat_flight: { create: createBatFlight, advance: advanceBatFlight, pose: batFlightPose },
  bat_emergence: { create: createBatEmergence, advance: advanceBatEmergence, pose: batEmergencePose },
};
export default function BatFlightPreview({ controls, ruleGroup }) {
  const engine = engines[ruleGroup.previewId];
  const canvasRef = React.useRef(null), controlsRef = React.useRef(controls);
  const [error, setError] = React.useState("");
  React.useEffect(() => { controlsRef.current = controls; }, [controls]);
  React.useEffect(() => {
    let model, frames, disposed = false;
    const pose = {};
    const loop = createBookCanvasLoop(canvasRef.current, {
      onResize: ({ width, height }) => { model = engine.create(width / height); },
      onFrame: ({ context, width, height, elapsedSeconds }) => {
        engine.advance(model, controlsRef.current, elapsedSeconds);
        const scale = width / model.width;
        context.clearRect(0, 0, width, height);
        if (model.opening !== undefined) {
          context.fillStyle = "rgba(94,79,68,0.22)";
          const top = (model.height - model.opening) / 2 * scale;
          const bottom = (model.height + model.opening) / 2 * scale;
          context.fillRect(0, 0, scale * 1.5, top);
          context.fillRect(0, bottom, scale * 1.5, height - bottom);
        }
        const focal = model.agents[0];
        for (const pulse of focal?.pulses ?? []) {
          const age = model.time - pulse.time, alpha = Math.max(0, 1 - age / 0.4);
          context.strokeStyle = `rgba(34,105,116,${alpha * 0.65})`;
          context.lineWidth = 1.2;
          context.beginPath();
          context.arc(pulse.x * scale, pulse.y * scale, age * 20 * scale,
            pulse.heading - 1.25, pulse.heading + 1.25);
          context.stroke();
        }
        for (const echo of focal?.echoes ?? []) {
          context.strokeStyle = `rgba(34,105,116,${Math.exp(-(model.time - echo.time) / 0.15) * 0.65})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(echo.x * scale, echo.y * scale);
          context.lineTo(focal.x * scale, focal.y * scale);
          context.stroke();
        }
        for (let i = 0; i < model.agents.length; i++) {
          engine.pose(model, i, pose);
          const left = Math.cos(pose.heading) < 0;
          const frame = frames[Math.floor((model.time + model.agents[i].id * 0.037) * 10) % frames.length];
          const size = scale * 1.5;
          context.save(); context.translate(pose.x * scale, pose.y * scale);
          context.rotate(pose.heading - (left ? Math.PI : 0)); context.scale(left ? -1 : 1, 1);
          context.drawImage(frame, -size / 2, -size * 215 / 190, size, size * 215 / 95);
          context.restore();
        }
      },
    });
    loadTexturedAtlasCanvas(atlas).then(result => {
      if (disposed) return;
      frames = resolveStageFrameSequence(atlas, "bat_fly1").frames.map(f => getAtlasFrameCanvas(result.frameCanvases, f));
      if (frames.some(f => !f)) throw new Error("bat-flight-frame-missing");
      loop.start();
    }).catch(() => { if (!disposed) setError("박쥐 이미지를 불러오지 못했습니다."); });
    return () => { disposed = true; loop.dispose(); };
  }, [engine]);
  return <div className="canvas-placeholder rule-preview" aria-label={`${ruleGroup.category} 미니 시뮬레이션`}>
    {error ? <span role="alert">{error}</span> : null}
    <canvas ref={canvasRef} className="rule-preview__canvas" />
  </div>;
}

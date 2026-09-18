import React from "react";
import { drawThreatMarker } from "./bookThreatDrawing.js";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { loadTexturedAtlasCanvas, getAtlasFrameCanvas, resolveStageFrameSequence } from "../../utils/spriteAtlas";
import { createBookCanvasLoop } from "../../utils/bookCanvasLoop.js";
import { createSwimmingModel, advanceSwimmingModel, swimmingPose } from "./sardineSwimmingModel.js";

const atlas = HOME_SPRITE_ATLASES.sardine;
const sequence = resolveStageFrameSequence(atlas, "sardine_swim1");

export default function SardineSwimmingPreview({ ruleGroup, controls }) {
  const canvasRef = React.useRef(null);
  const controlsRef = React.useRef(controls);
  const [error, setError] = React.useState("");
  React.useEffect(() => { controlsRef.current = controls; }, [controls]);
  React.useEffect(() => {
    let model, frame, disposed = false, pointer = null;
    const canvas = canvasRef.current;
    const interactive = ruleGroup.interaction === "predator";
    const move = event => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height };
    };
    const leave = () => { pointer = null; };
    const release = event => { if (event.pointerType !== "mouse") leave(); };
    if (interactive) {
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerdown", move);
      canvas.addEventListener("pointerleave", leave);
      canvas.addEventListener("pointercancel", leave);
      canvas.addEventListener("pointerup", release);
    }
    const pose = {};
    const loop = createBookCanvasLoop(canvasRef.current, {
      onResize: ({ width, height }) => { model = createSwimmingModel(width / height); },
      onFrame: ({ context, width, height, elapsedSeconds }) => {
        const predator = pointer ? { x: pointer.x * model.width, y: pointer.y * model.height } : null;
        advanceSwimmingModel(model, controlsRef.current, elapsedSeconds, predator);
        context.clearRect(0, 0, width, height);
        if (controlsRef.current.light_level !== undefined) {
          const light = model.agents.reduce((sum, agent) => sum + agent.light, 0) / model.agents.length;
          context.fillStyle = `rgba(26, 43, 49, ${(1 - light) * 0.24})`;
          context.fillRect(0, 0, width, height);
        }
        const scale = width / model.width;
        const length = scale * 0.36;
        for (let index = 0; index < model.agents.length; index += 1) {
          swimmingPose(model, index, pose);
          const left = Math.cos(pose.heading) < 0;
          context.save();
          context.translate(pose.x * scale, pose.y * scale);
          context.rotate(pose.heading - (left ? Math.PI : 0));
          context.scale(left ? -1 : 1, 1);
          context.drawImage(frame, -length / 2, -length / 6, length, length / 3);
          context.restore();
        }
        if (pointer) {
          drawThreatMarker(context, pointer.x * width, pointer.y * height, width, height);
        }
      },
    });
    loadTexturedAtlasCanvas(atlas).then(result => {
      if (disposed) return;
      frame = getAtlasFrameCanvas(result.frameCanvases, sequence.frames[0]);
      if (!frame) throw new Error("sardine-frame-missing");
      loop.start();
    }).catch(() => { if (!disposed) setError("정어리 이미지를 불러오지 못했습니다."); });
    return () => {
      disposed = true; loop.dispose();
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerdown", move);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("pointercancel", leave);
      canvas.removeEventListener("pointerup", release);
    };
  }, [ruleGroup.interaction]);
  return <div className="canvas-placeholder rule-preview" aria-label={`${ruleGroup.category} 미니 시뮬레이션`}>
    {error ? <span role="alert">{error}</span> : null}
    <canvas ref={canvasRef} className="rule-preview__canvas"
      aria-label={ruleGroup.interaction === "predator" ? "포식자 위치에 반응하는 정어리 무리" : undefined} />
  </div>;
}

import React from "react";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { loadTexturedAtlasCanvas, getAtlasFrameCanvas } from "../../utils/spriteAtlas";
import { createBookCanvasLoop } from "../../utils/bookCanvasLoop.js";
import { createSheepMovement, advanceSheepMovement, sheepMovementPose } from "./sheepMovementModel.js";
import { createSheepNeighbors, advanceSheepNeighbors, sheepNeighborPose } from "./sheepNeighborModel.js";
import { createSheepLeaders, advanceSheepLeaders, sheepLeaderPose } from "./sheepLeaderModel.js";
import { createSheepThreat, advanceSheepThreat, sheepThreatPose } from "./sheepThreatModel.js";
const atlas = HOME_SPRITE_ATLASES.sheep;
const engines = {
  sheep_threat: { create: createSheepThreat, advance: advanceSheepThreat, pose: sheepThreatPose },
  sheep_leaders: { create: createSheepLeaders, advance: advanceSheepLeaders, pose: sheepLeaderPose },
  sheep_movement: { create: createSheepMovement, advance: advanceSheepMovement, pose: sheepMovementPose },
  sheep_neighbors: { create: createSheepNeighbors, advance: advanceSheepNeighbors, pose: sheepNeighborPose },
};
export default function SheepMovementPreview({ controls, ruleGroup }) {
  const engine = engines[ruleGroup.previewId];
  const canvasRef = React.useRef(null), controlsRef = React.useRef(controls);
  const pointerRef = React.useRef(null);
  const [error, setError] = React.useState("");
  React.useEffect(() => { controlsRef.current = controls; }, [controls]);
  React.useEffect(() => {
    let model, frames, disposed = false;
    const pose = {};
    const loop = createBookCanvasLoop(canvasRef.current, {
      onResize: ({ width, height }) => { model = engine.create(width / height); },
      onFrame: ({ context, width, height, elapsedSeconds }) => {
        engine.advance(model, controlsRef.current, elapsedSeconds, pointerRef.current);
        const scale = width / model.width;
        context.clearRect(0, 0, width, height);
        if (model.threatMode && pointerRef.current) {
          context.fillStyle = "#2a2622";
          context.beginPath();
          context.arc(pointerRef.current.x * width, pointerRef.current.y * height, scale * 0.3, 0, Math.PI * 2);
          context.fill();
          context.strokeStyle = "#98424a";
          context.lineWidth = 1;
          context.beginPath();
          context.arc(pointerRef.current.x * width, pointerRef.current.y * height, scale * 8, 0, Math.PI * 2);
          context.stroke();
        }
        for (let i = 0; i < model.agents.length; i++) {
          const a = model.agents[i];
          engine.pose(model, i, pose);
          const vertical = Math.abs(Math.sin(pose.heading)) > 0.75;
          const frame = vertical ? (Math.sin(pose.heading) > 0 ? frames.front : frames.back) : frames.side;
          const size = scale * 1.2;
          const bob = Math.sin(a.distance * 12) * Math.min(1, a.speed * 2) * scale * 0.025;
          context.save(); context.translate(pose.x * scale, pose.y * scale + bob);
          context.scale(!vertical && Math.cos(pose.heading) < 0 ? -1 : 1, 1);
          context.drawImage(frame, -size / 2, -size * 75 / 230, size, size * 75 / 115);
          context.restore();
        }
      },
    });
    loadTexturedAtlasCanvas(atlas).then(result => {
      if (disposed) return;
      frames = Object.fromEntries(Object.entries({ side: "sheep_walk", front: "sheep_front", back: "sheep_back" })
        .map(([key, stage]) => [key, getAtlasFrameCanvas(result.frameCanvases, atlas.stages[stage].frame)]));
      if (Object.values(frames).some(frame => !frame)) throw new Error("sheep-frame-missing");
      loop.start();
    }).catch(() => { if (!disposed) setError("양 이미지를 불러오지 못했습니다."); });
    return () => { disposed = true; loop.dispose(); };
  }, [engine]);
  return <div className="canvas-placeholder rule-preview" aria-label={`${ruleGroup.category} 미니 시뮬레이션`}>
    {error ? <span role="alert">{error}</span> : null}
    <canvas ref={canvasRef} className="rule-preview__canvas"
      onPointerMove={event => {
        if (ruleGroup.previewId !== "sheep_threat") return;
        const r = event.currentTarget.getBoundingClientRect();
        pointerRef.current = { x: (event.clientX-r.left)/r.width, y: (event.clientY-r.top)/r.height };
      }}
      onPointerLeave={() => { pointerRef.current = null; }}
      onPointerCancel={() => { pointerRef.current = null; }}
      onPointerUp={event => { if (event.pointerType !== "mouse") pointerRef.current = null; }} />
  </div>;
}

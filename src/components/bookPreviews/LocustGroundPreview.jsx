import React from "react";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { loadTexturedAtlasCanvas, getAtlasFrameCanvas, resolveStageFrameSequence } from "../../utils/spriteAtlas";
import { createBookCanvasLoop } from "../../utils/bookCanvasLoop.js";
import { createLocustGroundModel, advanceLocustGround, locustGroundPose, locustFoodTargets } from "./locustGroundModel.js";

const atlas = HOME_SPRITE_ATLASES.grasshopper;
const idle = resolveStageFrameSequence(atlas, "grasshopper_idle").frames[0];
const jump = resolveStageFrameSequence(atlas, "grasshopper_jump").frames[0];
export default function LocustGroundPreview({ controls, ruleGroup }) {
  const canvasRef = React.useRef(null), controlsRef = React.useRef(controls);
  const [error, setError] = React.useState("");
  React.useEffect(() => { controlsRef.current = controls; }, [controls]);
  React.useEffect(() => {
    let model, idleFrame, jumpFrame, disposed = false, pointer = null;
    const canvas = canvasRef.current;
    const interactive = ruleGroup.interaction === "food_threat";
    const move = event => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x:(event.clientX-rect.left)/rect.width, y:(event.clientY-rect.top)/rect.height };
    };
    const leave = () => { pointer = null; };
    const release = event => { if(event.pointerType !== "mouse") leave(); };
    if(interactive) {
      canvas.addEventListener("pointermove",move); canvas.addEventListener("pointerdown",move);
      canvas.addEventListener("pointerleave",leave); canvas.addEventListener("pointercancel",leave);
      canvas.addEventListener("pointerup",release);
    }
    const pose = {};
    const loop = createBookCanvasLoop(canvasRef.current, {
      onResize: ({ width, height }) => { model = createLocustGroundModel(width / height); },
      onFrame: ({ context, width, height, elapsedSeconds }) => {
        advanceLocustGround(model, controlsRef.current, elapsedSeconds,
          pointer ? {x:pointer.x*model.width,y:pointer.y*model.height} : null);
        context.clearRect(0, 0, width, height);
        const scale = width / model.width, size = scale * 3.4;
        if(interactive) {
          context.strokeStyle = "#54714e"; context.lineWidth = 1.5;
          for(const food of locustFoodTargets(model)) for(let i=0;i<7;i++) {
            const x=(food.x+Math.cos(i*2.4)*2)*scale,y=(food.y+Math.sin(i*2.4)*2)*scale;
            context.beginPath(); context.moveTo(x-3,y-4); context.lineTo(x,y+2); context.lineTo(x+3,y-5); context.stroke();
          }
          if(pointer) {
            context.strokeStyle="#98424a"; context.beginPath();
            const x=pointer.x*width,y=pointer.y*height;
            context.moveTo(x-7,y);context.lineTo(x+7,y);context.moveTo(x,y-7);context.lineTo(x,y+7);context.stroke();
          }
        }
        for (let i = 0; i < model.agents.length; i++) {
          locustGroundPose(model, i, pose);
          const left = Math.cos(pose.heading) < 0;
          context.save();
          context.translate(pose.x * scale, (pose.y - pose.z) * scale);
          context.rotate(pose.heading - (left ? Math.PI : 0));
          context.scale(left ? -1 : 1, pose.state === "prepare" ? 0.9 : 1);
          context.drawImage(pose.state === "hop" ? jumpFrame : idleFrame,
            -size / 2, -size / 2, size, size * 110 / 115);
          context.restore();
        }
      },
    });
    loadTexturedAtlasCanvas(atlas).then(result => {
      if (disposed) return;
      idleFrame = getAtlasFrameCanvas(result.frameCanvases, idle);
      jumpFrame = getAtlasFrameCanvas(result.frameCanvases, jump);
      if (!idleFrame || !jumpFrame) throw new Error("locust-frame-missing");
      loop.start();
    }).catch(() => { if (!disposed) setError("메뚜기 이미지를 불러오지 못했습니다."); });
    return () => {
      disposed = true; loop.dispose();
      canvas.removeEventListener("pointermove",move);canvas.removeEventListener("pointerdown",move);
      canvas.removeEventListener("pointerleave",leave);canvas.removeEventListener("pointercancel",leave);
      canvas.removeEventListener("pointerup",release);
    };
  }, [ruleGroup.interaction]);
  return <div className="canvas-placeholder rule-preview" aria-label={`${ruleGroup.category} 미니 시뮬레이션`}>
    {error ? <span role="alert">{error}</span> : null}
    <canvas ref={canvasRef} className="rule-preview__canvas" />
  </div>;
}

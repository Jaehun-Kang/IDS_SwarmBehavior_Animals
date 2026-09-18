import React from "react";
import { drawThreatMarker } from "./bookThreatDrawing.js";
import { drawGrassMark } from "./bookEnvironmentDrawing.js";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { loadTexturedAtlasCanvas, getAtlasFrameCanvas } from "../../utils/spriteAtlas";
import { resolveCanvasAtlasSprite } from "../../utils/spritePose";
import { createBookCanvasLoop } from "../../utils/bookCanvasLoop.js";
import { createLocustGroundModel, advanceLocustGround, locustGroundPose, locustFoodTargets } from "./locustGroundModel.js";

const atlas = HOME_SPRITE_ATLASES.grasshopper;
export default function LocustGroundPreview({ controls, ruleGroup }) {
  const canvasRef = React.useRef(null), controlsRef = React.useRef(controls);
  const [error, setError] = React.useState("");
  React.useEffect(() => { controlsRef.current = controls; }, [controls]);
  React.useEffect(() => {
    let model, frameCanvases, disposed = false, pointer = null;
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
          for(const food of locustFoodTargets(model)) for(let i=0;i<5;i++) {
            const angle=i*2.39996,radius=i===0?0:1.8;
            const x=(food.x+Math.cos(angle)*radius)*scale,y=(food.y+Math.sin(angle)*radius)*scale;
            drawGrassMark(context,x,y,Math.max(7,Math.min(11,scale*1.05)));
          }
        }
        for (let i = 0; i < model.agents.length; i++) {
          locustGroundPose(model, i, pose);
          const direction = { x: Math.cos(pose.heading), y: Math.sin(pose.heading) };
          const sprite = resolveCanvasAtlasSprite(atlas, {
            space: "2d", position: pose, velocity: direction,
            state: { isJumping: pose.state === "hop", directionX: direction.x, directionY: direction.y },
            profile: "simulation", timestampMs: model.time * 1000,
          });
          context.save();
          context.translate(pose.x * scale, (pose.y - pose.z) * scale);
          context.rotate(sprite.rotation);
          context.scale(sprite.flipX, 1);
          context.drawImage(getAtlasFrameCanvas(frameCanvases, sprite.frame),
            -size / 2, -size / 2, size, size * 110 / 115);
          context.restore();
        }
        if(interactive && pointer) drawThreatMarker(context,pointer.x*width,pointer.y*height,width,height);
      },
    });
    loadTexturedAtlasCanvas(atlas).then(result => {
      if (disposed) return;
      frameCanvases = result.frameCanvases;
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

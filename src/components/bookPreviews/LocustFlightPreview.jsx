import React from "react";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { loadTexturedAtlasCanvas, getAtlasFrameCanvas } from "../../utils/spriteAtlas";
import { resolveCanvasAtlasSprite } from "../../utils/spritePose";
import { createBookCanvasLoop } from "../../utils/bookCanvasLoop.js";
import { createLocustFlight, advanceLocustFlight, locustFlightPose, locustFlightViewport } from "./locustFlightModel.js";
const atlas = HOME_SPRITE_ATLASES.grasshopper;
export default function LocustFlightPreview({ controls, ruleGroup }) {
  const canvasRef = React.useRef(null), controlsRef = React.useRef(controls);
  const [error, setError] = React.useState("");
  React.useEffect(() => { controlsRef.current = controls; }, [controls]);
  React.useEffect(() => {
    let model, frameCanvases, disposed = false;
    const pose = {};
    const loop = createBookCanvasLoop(canvasRef.current, {
      onResize: ({ width, height }) => { model = createLocustFlight(width/height); },
      onFrame: ({ context, width, height, elapsedSeconds }) => {
        advanceLocustFlight(model, controlsRef.current, elapsedSeconds);
        const view = locustFlightViewport(model), scale = width/view.width;
        context.clearRect(0,0,width,height);
        for(let j=1;j<16;j++) {
          context.strokeStyle=`rgba(114, 104, 47, ${j/16*0.2})`;
          context.lineWidth=1;
          context.beginPath();
          for(const a of model.agents) {
            if(j>=a.trail.length) continue;
            context.moveTo((a.trail[j-1].x-view.x)*scale,(a.trail[j-1].y-view.y)*scale);
            context.lineTo((a.trail[j].x-view.x)*scale,(a.trail[j].y-view.y)*scale);
          }
          context.stroke();
        }
        for (let i=0;i<model.agents.length;i++) {
          locustFlightPose(model,i,pose);
          const direction = { x: Math.cos(pose.heading), y: Math.sin(pose.heading) };
          const sprite = resolveCanvasAtlasSprite(atlas, {
            space: "2d", position: pose, velocity: direction,
            state: { isFlying: pose.activity >= 0.05, directionX: direction.x, directionY: direction.y },
            profile: "simulation", timestampMs: model.time * 1000, animationOffsetMs: i * 37,
          });
          const size=scale*(0.8+pose.activity*0.15);
          context.save();
          context.translate((pose.x-view.x)*scale,(pose.y-view.y)*scale);
          context.rotate(sprite.rotation); context.scale(sprite.flipX,1);
          context.drawImage(getAtlasFrameCanvas(frameCanvases, sprite.frame),-size/2,-size/2,size,size*110/115);
          context.restore();
        }
      },
    });
    loadTexturedAtlasCanvas(atlas).then(result=>{
      if(disposed) return;
      frameCanvases = result.frameCanvases;
      loop.start();
    }).catch(()=>{if(!disposed) setError("메뚜기 이미지를 불러오지 못했습니다.");});
    return ()=>{disposed=true;loop.dispose();};
  },[]);
  return <div className="canvas-placeholder rule-preview" aria-label={`${ruleGroup.category} 미니 시뮬레이션`}>
    {error?<span role="alert">{error}</span>:null}
    <canvas ref={canvasRef} className="rule-preview__canvas" />
  </div>;
}

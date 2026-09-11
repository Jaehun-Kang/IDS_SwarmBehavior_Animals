import React from "react";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { loadTexturedAtlasCanvas, getAtlasFrameCanvas, resolveStageFrameSequence } from "../../utils/spriteAtlas";
import { createBookCanvasLoop } from "../../utils/bookCanvasLoop.js";
import { createLocustFlight, advanceLocustFlight, locustFlightPose, locustFlightViewport } from "./locustFlightModel.js";
const atlas = HOME_SPRITE_ATLASES.grasshopper;
export default function LocustFlightPreview({ controls, ruleGroup }) {
  const canvasRef = React.useRef(null), controlsRef = React.useRef(controls);
  const [error, setError] = React.useState("");
  React.useEffect(() => { controlsRef.current = controls; }, [controls]);
  React.useEffect(() => {
    let model, frames, disposed = false;
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
          const left=Math.cos(pose.heading)<0;
          const frame=pose.activity<0.05 ? frames.idle[0] : pose.activity<0.3 ? frames.jump[0]
            : frames.fly[Math.floor((model.time+i*0.037)/0.12)%frames.fly.length];
          const size=scale*(0.8+pose.activity*0.15);
          context.save();
          context.translate((pose.x-view.x)*scale,(pose.y-view.y)*scale);
          context.rotate(pose.heading-(left?Math.PI:0)); context.scale(left?-1:1,1);
          context.drawImage(frame,-size/2,-size/2,size,size*110/115);
          context.restore();
        }
      },
    });
    loadTexturedAtlasCanvas(atlas).then(result=>{
      if(disposed) return;
      frames={};
      for(const [key,stage] of [["idle","grasshopper_idle"],["jump","grasshopper_jump"],["fly","grasshopper_fly"]])
        frames[key]=resolveStageFrameSequence(atlas,stage).frames.map(f=>getAtlasFrameCanvas(result.frameCanvases,f));
      if(Object.values(frames).flat().some(f=>!f)) throw new Error("locust-flight-frame-missing");
      loop.start();
    }).catch(()=>{if(!disposed) setError("메뚜기 이미지를 불러오지 못했습니다.");});
    return ()=>{disposed=true;loop.dispose();};
  },[]);
  return <div className="canvas-placeholder rule-preview" aria-label={`${ruleGroup.category} 미니 시뮬레이션`}>
    {error?<span role="alert">{error}</span>:null}
    <canvas ref={canvasRef} className="rule-preview__canvas" />
  </div>;
}

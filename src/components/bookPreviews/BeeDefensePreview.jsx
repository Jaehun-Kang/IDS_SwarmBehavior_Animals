import React from "react";
import { drawThreatMarker } from "./bookThreatDrawing.js";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { loadTexturedAtlasCanvas, getAtlasFrameCanvas } from "../../utils/spriteAtlas";
import { createBookCanvasLoop } from "../../utils/bookCanvasLoop.js";
import { createBeeDefense, advanceBeeDefense, beeDefensePose } from "./beeDefenseModel.js";
const atlas=HOME_SPRITE_ATLASES.bee;
export default function BeeDefensePreview({controls,ruleGroup}){
  const canvasRef=React.useRef(null),controlsRef=React.useRef(controls);
  const [error,setError]=React.useState("");
  React.useEffect(()=>{controlsRef.current=controls;},[controls]);
  React.useEffect(()=>{
    let model,frames,disposed=false,stillFrames=0;
    const pose={};
    const loop=createBookCanvasLoop(canvasRef.current,{
      onResize:({width,height})=>{model=createBeeDefense(width/height);stillFrames=0;},
      onFrame:({context:ctx,width,height,elapsedSeconds})=>{
        advanceBeeDefense(model,controlsRef.current,elapsedSeconds);
        stillFrames=model.moving?0:stillFrames+1;if(stillFrames>2)return;
        ctx.clearRect(0,0,width,height);
        const s=width/model.width;
        ctx.fillStyle="#a9b2ac";ctx.fillRect(0,0,width*0.23,height);
        ctx.fillStyle="#263c36";ctx.fillRect(width*0.23-0.2*s,height/2-4.2*s,0.4*s,8.4*s);
        const t=model.remainder/(1/60);
        const x=model.previousThreat.x+(model.threat.x-model.previousThreat.x)*t,y=model.threat.y;
        for(let i=0;i<model.agents.length;i++){
          const a=model.agents[i];beeDefensePose(model,i,pose);
          const warning=a.state==="warning"||a.state==="recovering";
          // A traveling pose accent only; sensing and recovery remain local.
          const wave=warning?Math.pow(Math.max(0,Math.sin(model.time*7-a.id*0.55)),4):0;
          const stage=atlas.stages;
          const frame=warning?stage.bee_top_fly.frames[Math.floor(model.time*20+a.id)%2]:stage.bee_top_idle.frame;
          const size=s*0.95;
          ctx.save();ctx.translate(pose.x*s,(pose.y-wave*0.14)*s);
          ctx.rotate(pose.heading+wave*0.32);
          ctx.drawImage(getAtlasFrameCanvas(frames,frame),-size/2,-size*0.75,size,size*1.5);ctx.restore();
        }
        drawThreatMarker(ctx,x*s,y*s,width,height);
      },
    });
    loadTexturedAtlasCanvas(atlas).then(result=>{if(!disposed){frames=result.frameCanvases;loop.start();}})
      .catch(()=>{if(!disposed)setError("꿀벌 이미지를 불러오지 못했습니다.");});
    return()=>{disposed=true;loop.dispose();};
  },[]);
  return <div className="canvas-placeholder rule-preview" aria-label={`${ruleGroup.category} 미니 시뮬레이션`}>
    {error?<span role="alert">{error}</span>:null}<canvas ref={canvasRef} className="rule-preview__canvas" />
  </div>;
}

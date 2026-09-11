import React from "react";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { loadTexturedAtlasCanvas, getAtlasFrameCanvas } from "../../utils/spriteAtlas";
import { createBookCanvasLoop } from "../../utils/bookCanvasLoop.js";
import { createBeeFanning, advanceBeeFanning } from "./beeFanningModel.js";
const atlas=HOME_SPRITE_ATLASES.bee;
export default function BeeFanningPreview({controls,ruleGroup}){
  const canvasRef=React.useRef(null),controlsRef=React.useRef(controls);
  const [error,setError]=React.useState("");
  React.useEffect(()=>{controlsRef.current=controls;},[controls]);
  React.useEffect(()=>{
    let model,frames,disposed=false,stillFrames=0;
    const loop=createBookCanvasLoop(canvasRef.current,{
      onResize:({width,height})=>{model=createBeeFanning(width/height);stillFrames=0;},
      onFrame:({context:ctx,width,height,elapsedSeconds})=>{
        advanceBeeFanning(model,controlsRef.current,elapsedSeconds);
        stillFrames=model.agents.some(a=>a.fanning)?0:stillFrames+1;
        if(stillFrames>2)return;
        ctx.clearRect(0,0,width,height);
        const s=width/model.width,entrance=model.width*0.24;
        ctx.fillStyle="#a9b2ac";ctx.fillRect(0,0,entrance*s,height);
        ctx.fillStyle="#263c36";ctx.fillRect((entrance-0.2)*s,(model.height/2-4.4)*s,0.4*s,8.8*s);
        for(const a of model.agents){
          if(a.fanning){
            ctx.strokeStyle="#59787f";ctx.lineWidth=1.5;
            for(let j=0;j<3;j++){
              const progress=(model.time*0.75+j/3+a.id*0.07)%1;
              const x=a.x-0.8-progress*2;
              ctx.globalAlpha=Math.sin(progress*Math.PI)*0.75;
              ctx.beginPath();ctx.moveTo(x*s,(a.y-0.35)*s);ctx.lineTo((x-0.45)*s,(a.y-0.35)*s);ctx.stroke();
            }
            ctx.globalAlpha=1;
          }
          const stage=atlas.stages;
          const frame=a.fanning?stage.bee_top_fly.frames[Math.floor(model.time*16+a.id)%2]:stage.bee_top_idle.frame;
          const size=s*1.15;
          ctx.save();ctx.translate(a.x*s,a.y*s);
          ctx.drawImage(getAtlasFrameCanvas(frames,frame),-size/2,-size*0.75,size,size*1.5);ctx.restore();
        }
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

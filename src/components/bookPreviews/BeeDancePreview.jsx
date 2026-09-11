import React from "react";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { loadTexturedAtlasCanvas, getAtlasFrameCanvas } from "../../utils/spriteAtlas";
import { createBookCanvasLoop } from "../../utils/bookCanvasLoop.js";
import { createBeeDance, advanceBeeDance, beeDancePose } from "./beeDanceModel.js";
const atlas=HOME_SPRITE_ATLASES.bee;
export default function BeeDancePreview({controls,ruleGroup}){
  const canvasRef=React.useRef(null),controlsRef=React.useRef(controls);
  const [error,setError]=React.useState("");
  React.useEffect(()=>{controlsRef.current=controls;},[controls]);
  React.useEffect(()=>{
    let model,frame,disposed=false;
    const pose={};
    const loop=createBookCanvasLoop(canvasRef.current,{
      onResize:({width,height})=>{model=createBeeDance(width/height);},
      onFrame:({context:ctx,width,height,elapsedSeconds})=>{
        advanceBeeDance(model,controlsRef.current,elapsedSeconds);ctx.clearRect(0,0,width,height);
        const s=width/model.width;
        ctx.strokeStyle="#b0a27d";ctx.lineWidth=1;
        ctx.setLineDash([4,6]);ctx.beginPath();ctx.moveTo(width/2,height/2-4*s);ctx.lineTo(width/2,height/2+4*s);ctx.stroke();ctx.setLineDash([]);
        ctx.strokeStyle="#987016";ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(width/2,height/2);
        ctx.lineTo(width/2+Math.sin(model.angle)*3*s,height/2-Math.cos(model.angle)*3*s);ctx.stroke();
        for(let i=model.agents.length-1;i>=0;i--){
          beeDancePose(model,i,pose);
          const size=s*(i?0.9:1.15);
          ctx.save();ctx.translate(pose.x*s,pose.y*s);
          ctx.rotate(pose.heading+(i===0&&model.waggle?Math.sin(model.time*36)*0.12:0));
          ctx.drawImage(frame,-size/2,-size*0.75,size,size*1.5);ctx.restore();
        }
      },
    });
    loadTexturedAtlasCanvas(atlas).then(result=>{if(!disposed){frame=getAtlasFrameCanvas(result.frameCanvases,atlas.stages.bee_top_idle.frame);loop.start();}})
      .catch(()=>{if(!disposed)setError("꿀벌 이미지를 불러오지 못했습니다.");});
    return()=>{disposed=true;loop.dispose();};
  },[]);
  return <div className="canvas-placeholder rule-preview" aria-label={`${ruleGroup.category} 미니 시뮬레이션`}>
    {error?<span role="alert">{error}</span>:null}<canvas ref={canvasRef} className="rule-preview__canvas" />
  </div>;
}

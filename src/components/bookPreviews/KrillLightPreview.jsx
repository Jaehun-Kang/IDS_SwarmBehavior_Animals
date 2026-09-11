import React from "react";
import {HOME_SPRITE_ATLASES} from "../../data/spriteAtlases";
import {loadTexturedAtlasCanvas,getAtlasFrameCanvas} from "../../utils/spriteAtlas";
import {createBookCanvasLoop} from "../../utils/bookCanvasLoop.js";
import {createKrillLight,advanceKrillLight,krillLightPose} from "./krillLightModel.js";
const atlas=HOME_SPRITE_ATLASES.krill;
export default function KrillLightPreview({controls,ruleGroup}){
  const canvasRef=React.useRef(null),controlsRef=React.useRef(controls);
  const [error,setError]=React.useState("");
  React.useEffect(()=>{controlsRef.current=controls;},[controls]);
  React.useEffect(()=>{
    let model,frames,disposed=false;const pose={};
    const loop=createBookCanvasLoop(canvasRef.current,{
      onResize:({width,height})=>{model=createKrillLight(width/height);},
      onFrame:({context:ctx,width,height,elapsedSeconds})=>{
        advanceKrillLight(model,controlsRef.current,elapsedSeconds);ctx.clearRect(0,0,width,height);
        const s=width/model.width,size=1.5*s,h=size*75/145;
        ctx.fillStyle=`rgba(0,67,94,${0.025+model.levels[0]*0.12})`;ctx.fillRect(0,0,width,height*0.36);
        ctx.strokeStyle="rgba(0,67,94,0.18)";ctx.lineWidth=1;
        for(const y of [0.36,0.66]){ctx.beginPath();ctx.moveTo(width*0.1,height*y);ctx.lineTo(width*0.9,height*y);ctx.stroke();}
        model.agents.forEach((a,i)=>{
          krillLightPose(model,i,pose);ctx.save();ctx.translate(pose.x*s,pose.y*s);
          const left=Math.cos(pose.heading)<0;ctx.rotate(left?pose.heading-Math.PI:pose.heading);if(left)ctx.scale(-1,1);
          ctx.drawImage(getAtlasFrameCanvas(frames,atlas.stages.krill_swim.frame),-size/2,-h/2,size,h);ctx.restore();
        });
      },
    });
    loadTexturedAtlasCanvas(atlas).then(result=>{if(!disposed){frames=result.frameCanvases;loop.start();}})
      .catch(()=>{if(!disposed)setError("크릴 이미지를 불러오지 못했습니다.");});
    return()=>{disposed=true;loop.dispose();};
  },[]);
  return <div className="canvas-placeholder rule-preview" aria-label={`${ruleGroup.category} 미니 시뮬레이션`}>
    {error?<span role="alert">{error}</span>:null}<canvas ref={canvasRef} className="rule-preview__canvas" />
  </div>;
}

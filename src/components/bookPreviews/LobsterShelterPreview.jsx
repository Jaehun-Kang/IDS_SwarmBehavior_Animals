import React from "react";
import {HOME_SPRITE_ATLASES} from "../../data/spriteAtlases";
import {loadTexturedAtlasCanvas,getAtlasFrameCanvas} from "../../utils/spriteAtlas";
import {createBookCanvasLoop} from "../../utils/bookCanvasLoop.js";
import {createLobsterShelter,advanceLobsterShelter,lobsterShelterPose} from "./lobsterShelterModel.js";
const atlas=HOME_SPRITE_ATLASES.spiny_lobster;
export default function LobsterShelterPreview({controls,ruleGroup}){
  const canvasRef=React.useRef(null),controlsRef=React.useRef(controls);
  const [error,setError]=React.useState("");
  React.useEffect(()=>{controlsRef.current=controls;},[controls]);
  React.useEffect(()=>{
    let model,frames,disposed=false,stillFrames=0,light=0.4;
    const pose={};
    const loop=createBookCanvasLoop(canvasRef.current,{
      onResize:({width,height})=>{model=createLobsterShelter(width/height);stillFrames=0;},
      onFrame:({context:ctx,width,height,elapsedSeconds})=>{
        advanceLobsterShelter(model,controlsRef.current,elapsedSeconds);
        const targetLight=Math.max(0,Math.min(1,(controlsRef.current.light_level??40)/100));
        light+=(targetLight-light)*(1-Math.exp(-elapsedSeconds/0.2));
        const active=Math.abs(targetLight-light)>0.001||model.agents.some((a,i)=>a.moving||model.previous[i].moving);
        stillFrames=active?0:stillFrames+1;if(stillFrames>2)return;
        ctx.clearRect(0,0,width,height);
        ctx.fillStyle=`rgba(26,43,49,${(1-light)*0.24})`;ctx.fillRect(0,0,width,height);
        const s=width/model.width,size=2.1*s,h=size*180/175;
        model.agents.forEach((a,i)=>{
          lobsterShelterPose(model,i,pose);const frame=atlas.stages.lobster_top.frames[Math.floor(a.distance/0.65)%2];
          ctx.save();ctx.translate(pose.x*s,pose.y*s);ctx.rotate(pose.heading);
          ctx.drawImage(getAtlasFrameCanvas(frames,frame),-size/2,-h/2,size,h);ctx.restore();
        });
        ctx.fillStyle="rgba(63,59,55,0.42)";ctx.beginPath();ctx.arc(width/2,height/2,3*s,0,Math.PI*2);ctx.fill();
      },
    });
    loadTexturedAtlasCanvas(atlas).then(result=>{if(!disposed){frames=result.frameCanvases;loop.start();}})
      .catch(()=>{if(!disposed)setError("닭새우 이미지를 불러오지 못했습니다.");});
    return()=>{disposed=true;loop.dispose();};
  },[]);
  return <div className="canvas-placeholder rule-preview" aria-label={`${ruleGroup.category} 미니 시뮬레이션`}>
    {error?<span role="alert">{error}</span>:null}<canvas ref={canvasRef} className="rule-preview__canvas" />
  </div>;
}

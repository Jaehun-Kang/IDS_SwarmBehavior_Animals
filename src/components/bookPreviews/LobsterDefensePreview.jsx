import React from "react";
import {HOME_SPRITE_ATLASES} from "../../data/spriteAtlases";
import {loadTexturedAtlasCanvas,getAtlasFrameCanvas} from "../../utils/spriteAtlas";
import {createBookCanvasLoop} from "../../utils/bookCanvasLoop.js";
import {createLobsterDefense,advanceLobsterDefense,lobsterDefensePose} from "./lobsterDefenseModel.js";
const atlas=HOME_SPRITE_ATLASES.spiny_lobster;
export default function LobsterDefensePreview({controls,ruleGroup}){
  const canvasRef=React.useRef(null),controlsRef=React.useRef(controls);
  const [error,setError]=React.useState("");
  React.useEffect(()=>{controlsRef.current=controls;},[controls]);
  React.useEffect(()=>{
    let model,frames,disposed=false,still=0,lastLevels="";
    const pose={};
    const loop=createBookCanvasLoop(canvasRef.current,{
      onResize:({width,height})=>{model=createLobsterDefense(width/height);still=0;lastLevels="";},
      onFrame:({context:ctx,width,height,elapsedSeconds})=>{
        advanceLobsterDefense(model,controlsRef.current,elapsedSeconds);
        const key=model.levels.join();
        still=model.threatMoving||model.agents.some(a=>a.moving)||lastLevels!==key?0:still+1;lastLevels=key;if(still>2)return;
        ctx.clearRect(0,0,width,height);const s=width/model.width,size=2.3*s,h=size*180/175;
        model.agents.forEach((a,i)=>{
          lobsterDefensePose(model,i,pose);ctx.save();ctx.translate(pose.x*s,pose.y*s);ctx.rotate(pose.heading);
          ctx.drawImage(getAtlasFrameCanvas(frames,atlas.stages.lobster_top.frames[Math.floor(a.distance/0.65)%2]),-size/2,-h/2,size,h);ctx.restore();
        });
        ctx.fillStyle="rgba(48,52,43,0.35)";
        model.dens.forEach(d=>{ctx.beginPath();ctx.arc(d.x*s,d.y*s,2*s,0,Math.PI*2);ctx.fill();});
        model.threats.forEach((p,i)=>{if(!model.levels[i])return;ctx.fillStyle="#8a003e";ctx.beginPath();ctx.arc(p.x*s,p.y*s,0.6*s,0,Math.PI*2);ctx.fill();});
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

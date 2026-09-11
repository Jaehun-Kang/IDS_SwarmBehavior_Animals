import React from "react";
import {HOME_SPRITE_ATLASES} from "../../data/spriteAtlases";
import {loadTexturedAtlasCanvas,getAtlasFrameCanvas} from "../../utils/spriteAtlas";
import {createBookCanvasLoop} from "../../utils/bookCanvasLoop.js";
import {createLobsterWalking,advanceLobsterWalking,lobsterWalkingPose} from "./lobsterWalkingModel.js";
const atlas=HOME_SPRITE_ATLASES.spiny_lobster;
export default function LobsterWalkingPreview({controls,ruleGroup}){
  const canvasRef=React.useRef(null),controlsRef=React.useRef(controls);
  const [error,setError]=React.useState("");
  React.useEffect(()=>{controlsRef.current=controls;},[controls]);
  React.useEffect(()=>{
    let model,frames,disposed=false,stillFrames=0;
    const pose={};
    const loop=createBookCanvasLoop(canvasRef.current,{
      onResize:({width,height})=>{model=createLobsterWalking(width/height);stillFrames=0;},
      onFrame:({context:ctx,width,height,elapsedSeconds})=>{
        advanceLobsterWalking(model,controlsRef.current,elapsedSeconds);
        stillFrames=model.speed>0?0:stillFrames+1;if(stillFrames>2)return;
        ctx.clearRect(0,0,width,height);lobsterWalkingPose(model,pose);
        const s=width/model.width,size=5*s,h=size*180/175;
        const frame=atlas.stages.lobster_top.frames[Math.floor(model.distance/0.65)%2];
        ctx.save();ctx.translate(pose.x*s,pose.y*s);ctx.rotate(pose.heading);
        ctx.drawImage(getAtlasFrameCanvas(frames,frame),-size/2,-h/2,size,h);ctx.restore();
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

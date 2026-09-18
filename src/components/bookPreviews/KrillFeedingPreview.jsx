import React from "react";
import {drawKrillFoodPatch} from "./bookEnvironmentDrawing.js";
import {HOME_SPRITE_ATLASES} from "../../data/spriteAtlases";
import {loadTexturedAtlasCanvas,getAtlasFrameCanvas} from "../../utils/spriteAtlas";
import {createBookCanvasLoop} from "../../utils/bookCanvasLoop.js";
import {createKrillFeeding,advanceKrillFeeding,krillFeedingPose} from "./krillFeedingModel.js";
import {createKrillSocial,advanceKrillSocial,krillSocialPose} from "./krillSocialModel.js";
const atlas=HOME_SPRITE_ATLASES.krill;
export default function KrillFeedingPreview({controls,ruleGroup}){
  const social=ruleGroup.previewId==="krill_social";
  const canvasRef=React.useRef(null),controlsRef=React.useRef(controls);
  const [error,setError]=React.useState("");
  React.useEffect(()=>{controlsRef.current=controls;},[controls]);
  React.useEffect(()=>{
    let model,frames,disposed=false,still=0,lastFood=-1;
    const pose={};
    const loop=createBookCanvasLoop(canvasRef.current,{
      onResize:({width,height})=>{model=(social?createKrillSocial:createKrillFeeding)(width/height);still=0;lastFood=-1;},
      onFrame:({context:ctx,width,height,elapsedSeconds})=>{
        (social?advanceKrillSocial:advanceKrillFeeding)(model,controlsRef.current,elapsedSeconds);
        still=social||model.agents.some(a=>a.speed>0)||lastFood!==model.foodAmount?0:still+1;lastFood=model.foodAmount;if(still>2)return;
        ctx.clearRect(0,0,width,height);const s=width/model.width,size=(social?0.55:2.2)*s,h=size*75/145;
        if(!social)drawKrillFoodPatch(ctx,model.patch.x*s,model.patch.y*s,model.patch.radius*s,model.foodAmount);
        model.agents.forEach((a,i)=>{
          (social?krillSocialPose:krillFeedingPose)(model,i,pose);ctx.save();ctx.translate(pose.x*s,pose.y*s);
          const left=Math.cos(pose.heading)<0;ctx.rotate(left?pose.heading-Math.PI:pose.heading);if(left)ctx.scale(-1,1);
          ctx.drawImage(getAtlasFrameCanvas(frames,atlas.stages.krill_swim.frame),-size/2,-h/2,size,h);ctx.restore();
        });
      },
    });
    loadTexturedAtlasCanvas(atlas).then(result=>{if(!disposed){frames=result.frameCanvases;loop.start();}})
      .catch(()=>{if(!disposed)setError("크릴 이미지를 불러오지 못했습니다.");});
    return()=>{disposed=true;loop.dispose();};
  },[social]);
  return <div className="canvas-placeholder rule-preview" aria-label={`${ruleGroup.category} 미니 시뮬레이션`}>
    {error?<span role="alert">{error}</span>:null}<canvas ref={canvasRef} className="rule-preview__canvas" />
  </div>;
}

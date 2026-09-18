import React from "react";
import { drawBookSpriteGlow } from "./bookGlowDrawing.js";
import { drawThreatMarker } from "./bookThreatDrawing.js";
import {HOME_SPRITE_ATLASES} from "../../data/spriteAtlases";
import {loadTexturedAtlasCanvas,getAtlasFrameCanvas} from "../../utils/spriteAtlas";
import {createBookCanvasLoop} from "../../utils/bookCanvasLoop.js";
import {createKrillThreat,advanceKrillThreat,krillThreatPose} from "./krillThreatModel.js";
const atlas=HOME_SPRITE_ATLASES.krill;
export default function KrillThreatPreview({controls,ruleGroup}){
 const canvasRef=React.useRef(null),controlsRef=React.useRef(controls);
 const [error,setError]=React.useState("");
 React.useEffect(()=>{controlsRef.current=controls;},[controls]);
 React.useEffect(()=>{
  let model,frames,disposed=false;const pose={};
  const loop=createBookCanvasLoop(canvasRef.current,{
   onResize:({width,height})=>{model=createKrillThreat(width/height);},
   onFrame:({context:ctx,width,height,elapsedSeconds})=>{
    advanceKrillThreat(model,controlsRef.current,elapsedSeconds);ctx.clearRect(0,0,width,height);
    const s=width/model.width,size=0.55*s,h=size*75/145,glow=Math.max(0,Math.min(1,(controlsRef.current.glow_display??60)/100));
    model.agents.forEach((a,i)=>{
     krillThreatPose(model,i,pose);ctx.save();ctx.translate(pose.x*s,pose.y*s);
     const left=Math.cos(pose.heading)<0;ctx.rotate(left?pose.heading-Math.PI:pose.heading);if(left)ctx.scale(-1,1);
     ctx.drawImage(getAtlasFrameCanvas(frames,atlas.stages.krill_swim.frame),-size/2,-h/2,size,h);
     // Display-only light marks. They do not enter threat sensing or social forces.
     drawBookSpriteGlow(ctx,getAtlasFrameCanvas(frames,atlas.stages.krill_swim.frame),-size/2,-h/2,size,h,glow,"krill");
     ctx.restore();
    });
    drawThreatMarker(ctx,model.predator.x*s,model.predator.y*s,width,height);
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

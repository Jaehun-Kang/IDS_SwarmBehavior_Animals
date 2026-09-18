import React from "react";
import {HOME_SPRITE_ATLASES} from "../../data/spriteAtlases";
import {loadTexturedAtlasCanvas,getAtlasFrameCanvas} from "../../utils/spriteAtlas";
import {createBookCanvasLoop} from "../../utils/bookCanvasLoop.js";
import {createKrillRest,advanceKrillRest,krillRestPose} from "./krillRestModel.js";
const atlas=HOME_SPRITE_ATLASES.krill;
export default function KrillRestPreview({controls,ruleGroup}){
 const canvasRef=React.useRef(null),controlsRef=React.useRef(controls);
 const [error,setError]=React.useState("");
 React.useEffect(()=>{controlsRef.current=controls;},[controls]);
 React.useEffect(()=>{
  let model,frames,disposed=false,still=0;const pose={};
  const loop=createBookCanvasLoop(canvasRef.current,{
   onResize:({width,height})=>{model=createKrillRest(width/height);still=0;},
   onFrame:({context:ctx,width,height,elapsedSeconds})=>{
    advanceKrillRest(model,controlsRef.current,elapsedSeconds);still=model.agents.some(a=>a.moving)?0:still+1;if(still>2)return;
    ctx.clearRect(0,0,width,height);const s=width/model.width,size=3.5*s,h=size*75/145;
    ctx.strokeStyle="rgba(0,67,94,0.18)";ctx.lineWidth=1;
    for(const x of [1/3,2/3]){ctx.beginPath();ctx.moveTo(width*x,height*0.12);ctx.lineTo(width*x,height*0.88);ctx.stroke();}
    model.agents.forEach((a,i)=>{
     krillRestPose(model,i,pose);ctx.save();ctx.translate(pose.x*s,pose.y*s);ctx.rotate(pose.heading);
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

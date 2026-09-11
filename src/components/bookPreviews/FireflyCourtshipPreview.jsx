import React from "react";
import {HOME_SPRITE_ATLASES} from "../../data/spriteAtlases";
import {loadTexturedAtlasCanvas,getAtlasFrameCanvas} from "../../utils/spriteAtlas";
import {createBookCanvasLoop} from "../../utils/bookCanvasLoop.js";
import {createFireflyCourtship,advanceFireflyCourtship,fireflyCourtshipPose} from "./fireflyCourtshipModel.js";
const atlas=HOME_SPRITE_ATLASES.firefly;
export default function FireflyCourtshipPreview({controls,ruleGroup}){
  const canvasRef=React.useRef(null),controlsRef=React.useRef(controls);
  const [error,setError]=React.useState("");
  React.useEffect(()=>{controlsRef.current=controls;},[controls]);
  React.useEffect(()=>{
    let model,frames,disposed=false,stillFrames=0;
    const pose={};
    const loop=createBookCanvasLoop(canvasRef.current,{
      onResize:({width,height})=>{model=createFireflyCourtship(width/height);stillFrames=0;},
      onFrame:({context:ctx,width,height,elapsedSeconds})=>{
        advanceFireflyCourtship(model,controlsRef.current,elapsedSeconds);
        const active=model.agents.some((a,i)=>a.moving||model.previous[i].moving||a.light>0||model.previous[i].light>0);
        stillFrames=active?0:stillFrames+1;if(stillFrames>2)return;
        ctx.clearRect(0,0,width,height);
        const s=width/model.width,female=model.agents[3];
        ctx.fillStyle="#8f9f70";ctx.beginPath();ctx.ellipse(female.x*s,(female.y+0.7)*s,2.1*s,0.6*s,-0.3,0,Math.PI*2);ctx.fill();
        model.agents.forEach((a,i)=>{
          fireflyCourtshipPose(model,i,pose);
          const walking=model.phase==="walk",fly=a.moving&&!walking,index=Math.floor(model.time*12)%2;
          const dark=fly?atlas.stages.firefly_dark_top_fly.frames[index]:atlas.stages.firefly_dark_top_idle.frame;
          const lit=fly?atlas.stages.firefly_lit_top_fly.frames[index]:atlas.stages.firefly_lit_top_idle.frame;
          const size=3*s,h=size*160/135,alpha=model.remainder/(1/60);
          const light=model.previous[i].light+(a.light-model.previous[i].light)*alpha;
          ctx.save();ctx.translate(pose.x*s,pose.y*s);ctx.rotate(pose.heading);
          ctx.drawImage(getAtlasFrameCanvas(frames,dark),-size/2,-h/2,size,h);
          if(light>0){ctx.globalAlpha=light;ctx.drawImage(getAtlasFrameCanvas(frames,lit),-size/2,-h/2,size,h);}
          ctx.restore();
        });
      },
    });
    loadTexturedAtlasCanvas(atlas).then(result=>{if(!disposed){frames=result.frameCanvases;loop.start();}})
      .catch(()=>{if(!disposed)setError("반딧불이 이미지를 불러오지 못했습니다.");});
    return()=>{disposed=true;loop.dispose();};
  },[]);
  return <div className="canvas-placeholder rule-preview" aria-label={`${ruleGroup.category} 미니 시뮬레이션`}>
    {error?<span role="alert">{error}</span>:null}<canvas ref={canvasRef} className="rule-preview__canvas" />
  </div>;
}

import React from "react";
import { drawBookSpriteGlow } from "./bookGlowDrawing.js";
import {HOME_SPRITE_ATLASES} from "../../data/spriteAtlases";
import {loadTexturedAtlasCanvas,getAtlasFrameCanvas} from "../../utils/spriteAtlas";
import {createBookCanvasLoop} from "../../utils/bookCanvasLoop.js";
import {createFireflyIndividual,advanceFireflyIndividual,fireflyIndividualPose} from "./fireflyIndividualModel.js";
const atlas=HOME_SPRITE_ATLASES.firefly;
export default function FireflyIndividualPreview({controls,ruleGroup}){
  const canvasRef=React.useRef(null),controlsRef=React.useRef(controls);
  const [error,setError]=React.useState("");
  React.useEffect(()=>{controlsRef.current=controls;},[controls]);
  React.useEffect(()=>{
    let model,frames,disposed=false,stillFrames=0;
    const pose={};
    const loop=createBookCanvasLoop(canvasRef.current,{
      onResize:({width,height})=>{model=createFireflyIndividual(width/height);stillFrames=0;},
      onFrame:({context:ctx,width,height,elapsedSeconds})=>{
        advanceFireflyIndividual(model,controlsRef.current,elapsedSeconds);
        const active=model.agents.some((a,i)=>a.flight>0||a.light>0||model.previous[i].light>0||Math.abs(a.heading)>0.001);
        stillFrames=active?0:stillFrames+1;if(stillFrames>2)return;
        ctx.clearRect(0,0,width,height);
        const s=width/model.width;
        for(let i=0;i<model.agents.length;i++){
          const a=model.agents[i];fireflyIndividualPose(model,i,pose);
          const idle=a.flight===0,index=Math.floor(model.time*17.5+a.id)%2;
          const dark=idle?atlas.stages.firefly_dark_top_idle.frame:atlas.stages.firefly_dark_top_fly.frames[index];
          const lit=idle?atlas.stages.firefly_lit_top_idle.frame:atlas.stages.firefly_lit_top_fly.frames[index];
          const size=s*1.45,h=size*160/135;
          const alpha=model.remainder/(1/60),light=model.previous[i].light+(a.light-model.previous[i].light)*alpha;
          ctx.save();ctx.translate(pose.x*s,pose.y*s);ctx.rotate(pose.heading);
          ctx.drawImage(getAtlasFrameCanvas(frames,dark),-size/2,-h/2,size,h);
          if(light>0){ctx.globalAlpha=light;ctx.drawImage(getAtlasFrameCanvas(frames,lit),-size/2,-h/2,size,h);}
          drawBookSpriteGlow(ctx,getAtlasFrameCanvas(frames,lit),-size/2,-h/2,size,h,light);
          ctx.restore();
        }
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

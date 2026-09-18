import React from "react";
import { drawBookSpriteGlow } from "./bookGlowDrawing.js";
import {HOME_SPRITE_ATLASES} from "../../data/spriteAtlases";
import {loadTexturedAtlasCanvas,getAtlasFrameCanvas} from "../../utils/spriteAtlas";
import {createBookCanvasLoop} from "../../utils/bookCanvasLoop.js";
import {createFireflyCoupling,advanceFireflyCoupling,fireflyBarrier} from "./fireflyCouplingModel.js";
const atlas=HOME_SPRITE_ATLASES.firefly;
export default function FireflyCouplingPreview({controls,ruleGroup}){
  const canvasRef=React.useRef(null),controlsRef=React.useRef(controls);
  const [error,setError]=React.useState("");
  React.useEffect(()=>{controlsRef.current=controls;},[controls]);
  React.useEffect(()=>{
    let model,frames,disposed=false,stillFrames=0,lastControls;
    const loop=createBookCanvasLoop(canvasRef.current,{
      onResize:({width,height})=>{model=createFireflyCoupling(width/height);stillFrames=0;},
      onFrame:({context:ctx,width,height,elapsedSeconds})=>{
        const c=controlsRef.current;
        advanceFireflyCoupling(model,c,elapsedSeconds);
        const active=model.agents.some((a,i)=>a.light>0||model.previousLight[i]>0);
        stillFrames=active||c!==lastControls?0:stillFrames+1;lastControls=c;
        if(stillFrames>2)return;
        ctx.clearRect(0,0,width,height);
        const s=width/model.width,wall=fireflyBarrier(model,c);
        if(wall.bottom>wall.top){
          const thickness=Math.max(6,s*0.4);
          ctx.fillStyle="#797e80";
          ctx.fillRect(wall.x*s-thickness/2,wall.top*s,thickness,(wall.bottom-wall.top)*s);
        }
        const dark=getAtlasFrameCanvas(frames,atlas.stages.firefly_dark_top_idle.frame);
        const lit=getAtlasFrameCanvas(frames,atlas.stages.firefly_lit_top_idle.frame);
        const size=2.6*s,h=size*160/135,alpha=model.remainder/(1/60);
        model.agents.forEach((a,i)=>{
          const light=model.previousLight[i]+(a.light-model.previousLight[i])*alpha;
          ctx.drawImage(dark,a.x*s-size/2,a.y*s-h/2,size,h);
          if(light>0){ctx.globalAlpha=light;ctx.drawImage(lit,a.x*s-size/2,a.y*s-h/2,size,h);ctx.globalAlpha=1;}
          drawBookSpriteGlow(ctx,lit,a.x*s-size/2,a.y*s-h/2,size,h,light);
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

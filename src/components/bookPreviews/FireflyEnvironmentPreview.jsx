import React from "react";
import { drawBookSpriteGlow } from "./bookGlowDrawing.js";
import {HOME_SPRITE_ATLASES} from "../../data/spriteAtlases";
import {loadTexturedAtlasCanvas,getAtlasFrameCanvas} from "../../utils/spriteAtlas";
import {createBookCanvasLoop} from "../../utils/bookCanvasLoop.js";
import {createFireflyEnvironment,advanceFireflyEnvironment} from "./fireflyEnvironmentModel.js";
const atlas=HOME_SPRITE_ATLASES.firefly;
export default function FireflyEnvironmentPreview({controls,ruleGroup}){
  const canvasRef=React.useRef(null),controlsRef=React.useRef(controls);
  const [error,setError]=React.useState("");
  React.useEffect(()=>{controlsRef.current=controls;},[controls]);
  React.useEffect(()=>{
    let model,frames,disposed=false,stillFrames=0,lastControls;
    const loop=createBookCanvasLoop(canvasRef.current,{
      onResize:({width,height})=>{model=createFireflyEnvironment(width/height);stillFrames=0;},
      onFrame:({context:ctx,width,height,elapsedSeconds})=>{
        const c=controlsRef.current;advanceFireflyEnvironment(model,c,elapsedSeconds);
        const active=model.agents.some((a,i)=>a.light>0||model.previousLight[i]>0);
        stillFrames=active||c!==lastControls?0:stillFrames+1;lastControls=c;if(stillFrames>2)return;
        ctx.clearRect(0,0,width,height);
        const s=width/model.width,size=2.8*s,h=size*160/135,alpha=model.remainder/(1/60);
        const dark=getAtlasFrameCanvas(frames,atlas.stages.firefly_dark_top_idle.frame);
        const lit=getAtlasFrameCanvas(frames,atlas.stages.firefly_lit_top_idle.frame);
        model.agents.forEach((a,i)=>{
          const x=a.x*s,y=a.y*s;
          if(a.trapped){
            ctx.strokeStyle="#8b7b79";ctx.lineWidth=1;
            for(let j=-1;j<=1;j++){
              ctx.beginPath();ctx.moveTo(x-size*0.7,y+j*size*0.22-size*0.2);ctx.lineTo(x+size*0.7,y+j*size*0.22+size*0.2);ctx.stroke();
              ctx.beginPath();ctx.moveTo(x+j*size*0.22-size*0.2,y-size*0.55);ctx.lineTo(x+j*size*0.22+size*0.2,y+size*0.55);ctx.stroke();
            }
          }
          ctx.drawImage(dark,x-size/2,y-h/2,size,h);
          const light=model.previousLight[i]+(a.light-model.previousLight[i])*alpha;
          if(light>0){ctx.globalAlpha=light;ctx.drawImage(lit,x-size/2,y-h/2,size,h);ctx.globalAlpha=1;}
          drawBookSpriteGlow(ctx,lit,x-size/2,y-h/2,size,h,light);
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

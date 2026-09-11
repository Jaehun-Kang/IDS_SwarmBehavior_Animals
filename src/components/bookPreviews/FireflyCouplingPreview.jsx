import React from "react";
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
          ctx.strokeStyle="#648349";ctx.lineWidth=2;
          ctx.beginPath();ctx.moveTo(wall.x*s,wall.top*s);ctx.lineTo(wall.x*s,wall.bottom*s);ctx.stroke();
          for(let y=wall.top+0.4;y<wall.bottom;y+=1.1){
            ctx.fillStyle="#8f9f70";ctx.beginPath();ctx.ellipse(wall.x*s,y*s,0.65*s,0.25*s,-0.4,0,Math.PI*2);ctx.fill();
          }
        }
        const dark=getAtlasFrameCanvas(frames,atlas.stages.firefly_dark_top_idle.frame);
        const lit=getAtlasFrameCanvas(frames,atlas.stages.firefly_lit_top_idle.frame);
        const size=2.6*s,h=size*160/135,alpha=model.remainder/(1/60);
        model.agents.forEach((a,i)=>{
          const light=model.previousLight[i]+(a.light-model.previousLight[i])*alpha;
          ctx.drawImage(dark,a.x*s-size/2,a.y*s-h/2,size,h);
          if(light>0){ctx.globalAlpha=light;ctx.drawImage(lit,a.x*s-size/2,a.y*s-h/2,size,h);ctx.globalAlpha=1;}
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

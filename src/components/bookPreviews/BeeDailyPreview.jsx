import React from "react";
import { renderFlower } from "../../utils/beeFlower.js";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { loadTexturedAtlasCanvas, getAtlasFrameCanvas } from "../../utils/spriteAtlas";
import { resolveCanvasAtlasSprite } from "../../utils/spritePose";
import { createBookCanvasLoop } from "../../utils/bookCanvasLoop.js";
import { createBeeDaily, advanceBeeDaily, beeDailyPose } from "./beeDailyModel.js";
const atlas=HOME_SPRITE_ATLASES.bee;
export default function BeeDailyPreview({controls,ruleGroup}){
  const canvasRef=React.useRef(null),controlsRef=React.useRef(controls);
  const [error,setError]=React.useState("");
  React.useEffect(()=>{controlsRef.current=controls;},[controls]);
  React.useEffect(()=>{
    let model,frames,disposed=false,stillFrames=0;
    const pose={};
    const loop=createBookCanvasLoop(canvasRef.current,{
      onResize:({width,height})=>{model=createBeeDaily(width/height);stillFrames=0;},
      onFrame:({context:ctx,width,height,elapsedSeconds})=>{
        advanceBeeDaily(model,controlsRef.current,elapsedSeconds);
        stillFrames=model.agents.every(a=>a.state==="inside")?stillFrames+1:0;
        if(stillFrames>2)return;
        ctx.clearRect(0,0,width,height);
        const scale=width/model.width,nest=model.nest;
        ctx.fillStyle="#a9b2ac";ctx.fillRect(0,0,nest.x*scale,height);
        ctx.fillStyle="#263c36";ctx.fillRect((nest.x-0.25)*scale,(nest.y-1)*scale,0.5*scale,2*scale);
        for(const f of model.flowers){
          const flowerScale=scale*0.1;
          ctx.save();ctx.translate(f.x*scale,f.y*scale);ctx.scale(flowerScale,flowerScale);
          renderFlower(ctx,{x:0,y:0},model.time);
          ctx.restore();
        }
        for(let i=0;i<model.agents.length;i++){
          const a=model.agents[i];if(a.state==="inside")continue;
          beeDailyPose(model,i,pose);
          const sprite=resolveCanvasAtlasSprite(atlas,{space:"2d",position:pose,
            velocity:{x:Math.cos(pose.heading),y:Math.sin(pose.heading)},profile:"simulation",
            timestampMs:model.time*1250,animationOffsetMs:a.id*23});
          const frame=a.state==="gathering"?atlas.stages.bee_top_idle.frame:sprite.frame;
          const size=scale*1.3;
          ctx.save();ctx.translate(pose.x*scale,pose.y*scale);ctx.rotate(sprite.rotation);ctx.scale(sprite.flipX,1);
          ctx.drawImage(getAtlasFrameCanvas(frames,frame),-size/2,-size*0.75,size,size*1.5);ctx.restore();
        }
      },
    });
    loadTexturedAtlasCanvas(atlas).then(result=>{if(!disposed){frames=result.frameCanvases;loop.start();}})
      .catch(()=>{if(!disposed)setError("꿀벌 이미지를 불러오지 못했습니다.");});
    return()=>{disposed=true;loop.dispose();};
  },[]);
  return <div className="canvas-placeholder rule-preview" aria-label={`${ruleGroup.category} 미니 시뮬레이션`}>
    {error?<span role="alert">{error}</span>:null}<canvas ref={canvasRef} className="rule-preview__canvas" />
  </div>;
}

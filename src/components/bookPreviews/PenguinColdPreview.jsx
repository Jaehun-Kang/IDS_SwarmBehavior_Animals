import React from "react";
import { createFlowMarkers, advanceFlowMarkers, drawFlowMarkers } from "./bookEnvironmentDrawing.js";
import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { loadTexturedAtlasCanvas, getAtlasFrameCanvas } from "../../utils/spriteAtlas";
import { resolveCanvasAtlasSprite } from "../../utils/spritePose";
import { createBookCanvasLoop } from "../../utils/bookCanvasLoop.js";
import { createPenguinCold, advancePenguinCold, penguinColdPose } from "./penguinColdModel.js";
import { createPenguinHuddle, createPenguinCooling, advancePenguinHuddle, penguinHuddlePose, penguinWindExposure } from "./penguinHuddleModel.js";
import { createPenguinWave, advancePenguinWave, penguinWavePose } from "./penguinWaveModel.js";
const atlas = HOME_SPRITE_ATLASES.penguin;
export default function PenguinColdPreview({controls,ruleGroup}) {
  const isHuddle = ruleGroup.previewId === "penguin_huddle";
  const isWave = ruleGroup.previewId === "penguin_wave";
  const isCooling = ruleGroup.previewId === "penguin_cooling";
  const canvasRef = React.useRef(null), controlsRef = React.useRef(controls);
  const [error,setError] = React.useState("");
  React.useEffect(()=>{controlsRef.current=controls;},[controls]);
  React.useEffect(()=>{
    let model,frames,flow,disposed=false,idleFrames=0;
    const createModel = isWave ? createPenguinWave : isCooling ? createPenguinCooling : isHuddle ? createPenguinHuddle : createPenguinCold;
    const advanceModel = isWave ? advancePenguinWave : isHuddle || isCooling ? advancePenguinHuddle : advancePenguinCold;
    const getPose = isWave ? penguinWavePose : isHuddle || isCooling ? penguinHuddlePose : penguinColdPose;
    const pose={};
    const loop=createBookCanvasLoop(canvasRef.current,{
      onResize:({width,height})=>{model=createModel(width/height);flow=createFlowMarkers(width,height);idleFrames=0;},
      onFrame:({context,width,height,elapsedSeconds})=>{
        advanceModel(model,controlsRef.current,elapsedSeconds);
        idleFrames = isWave && !model.active ? idleFrames + 1 : 0;
        if (idleFrames > 2) return;
        context.clearRect(0,0,width,height);
        const scale=width/model.width;
        if (isHuddle || (!isWave && !isCooling)) {
          const angle = (controlsRef.current.wind_direction ?? 0) * Math.PI / 180;
          const speed = (isHuddle ? 8 : controlsRef.current.wind_speed ?? 8) * 3;
          advanceFlowMarkers(flow,angle,speed,elapsedSeconds);
          drawFlowMarkers(context,flow,angle,speed,point=>
            penguinWindExposure({x:point.x/scale,y:point.y/scale},model.agents,angle));
        }
        for(let i=0;i<model.agents.length;i++) {
          const a=model.agents[i];
          getPose(model,i,pose);
          const sprite=resolveCanvasAtlasSprite(atlas,{
            space:"2d",position:pose,velocity:{x:Math.cos(pose.heading),y:Math.sin(pose.heading)},profile:"simulation",
          });
          const size=scale*0.9;
          context.save();context.translate(pose.x*scale,pose.y*scale);
          context.rotate(Math.sin(a.distance*10)*0.05*Math.min(1,a.speed*3));
          context.scale(sprite.flipX,1);
          context.drawImage(getAtlasFrameCanvas(frames,sprite.frame),-size/2,-size*85/90,size,size*85/45);
          context.restore();
        }
      },
    });
    loadTexturedAtlasCanvas(atlas).then(result=>{
      if(disposed)return;
      frames=result.frameCanvases;loop.start();
    }).catch(()=>{if(!disposed)setError("펭귄 이미지를 불러오지 못했습니다.");});
    return()=>{disposed=true;loop.dispose();};
  },[isHuddle,isWave,isCooling]);
  return <div className="canvas-placeholder rule-preview" aria-label={`${ruleGroup.category} 미니 시뮬레이션`}>
    {error?<span role="alert">{error}</span>:null}
    <canvas ref={canvasRef} className="rule-preview__canvas" />
  </div>;
}

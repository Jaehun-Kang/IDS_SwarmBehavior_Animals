import React from "react";
import {createFlowMarkers,advanceFlowMarkers,drawFlowMarkers} from "./bookEnvironmentDrawing.js";
import {HOME_SPRITE_ATLASES} from "../../data/spriteAtlases";
import {loadTexturedAtlasCanvas,getAtlasFrameCanvas} from "../../utils/spriteAtlas";
import {createBookCanvasLoop} from "../../utils/bookCanvasLoop.js";
import {createLobsterDisease,advanceLobsterDisease,lobsterDiseasePose} from "./lobsterDiseaseModel.js";
import {lobsterChemicalAlpha,LOBSTER_CHEMICAL_COLORS} from "./lobsterChemicalModel.js";
const atlas=HOME_SPRITE_ATLASES.spiny_lobster;
export default function LobsterDiseasePreview({controls,ruleGroup}){
  const canvasRef=React.useRef(null),controlsRef=React.useRef(controls);
  const [error,setError]=React.useState("");
  React.useEffect(()=>{controlsRef.current=controls;},[controls]);
  React.useEffect(()=>{
    let model,frames,flow,disposed=false,buffer,data,still=0;
    const pose={};
    const loop=createBookCanvasLoop(canvasRef.current,{
      onResize:({width,height})=>{
        model=createLobsterDisease(width/height);flow=createFlowMarkers(width,height,58);buffer=document.createElement("canvas");buffer.width=model.field.cols;buffer.height=model.field.rows;
        data=buffer.getContext("2d").createImageData(buffer.width,buffer.height);still=0;
      },
      onFrame:({context:ctx,width,height,elapsedSeconds})=>{
        advanceLobsterDisease(model,controlsRef.current,elapsedSeconds);
        const flowSpeed=Math.max(0,Math.min(100,controlsRef.current.flushing??50))/100*1.6*width/model.width;
        still=flowSpeed>0||model.agents.some(a=>a.moving)||lobsterChemicalAlpha(model.field.max)>0?0:still+1;if(still>2)return;
        ctx.clearRect(0,0,width,height);const s=width/model.width,size=2.1*s,h=size*180/175,field=model.field;
        advanceFlowMarkers(flow,Math.PI,flowSpeed,elapsedSeconds);
        drawFlowMarkers(ctx,flow,Math.PI,flowSpeed);
        const color=LOBSTER_CHEMICAL_COLORS[1];
        field.layers[1].forEach((v,i)=>{data.data[i*4]=color[0];data.data[i*4+1]=color[1];data.data[i*4+2]=color[2];data.data[i*4+3]=lobsterChemicalAlpha(v);});
        buffer.getContext("2d").putImageData(data,0,0);ctx.drawImage(buffer,0,0,field.cols*field.cell*s,field.rows*field.cell*s);
        model.agents.forEach(a=>{
          lobsterDiseasePose(model,a,pose);ctx.save();ctx.translate(pose.x*s,pose.y*s);ctx.rotate(pose.heading);
          ctx.drawImage(getAtlasFrameCanvas(frames,atlas.stages.lobster_top.frames[Math.floor(a.distance/0.65)%2]),-size/2,-h/2,size,h);ctx.restore();
        });
        ctx.fillStyle="rgba(48,52,43,0.35)";ctx.beginPath();ctx.arc(width/2,height/2,2.8*s,0,Math.PI*2);ctx.fill();
      },
    });
    loadTexturedAtlasCanvas(atlas).then(result=>{if(!disposed){frames=result.frameCanvases;loop.start();}})
      .catch(()=>{if(!disposed)setError("닭새우 이미지를 불러오지 못했습니다.");});
    return()=>{disposed=true;loop.dispose();};
  },[]);
  return <div className="canvas-placeholder rule-preview" aria-label={`${ruleGroup.category} 미니 시뮬레이션`}>
    {error?<span role="alert">{error}</span>:null}<canvas ref={canvasRef} className="rule-preview__canvas" />
  </div>;
}

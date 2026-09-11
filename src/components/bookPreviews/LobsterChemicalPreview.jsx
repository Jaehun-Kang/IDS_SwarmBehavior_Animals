import React from "react";
import {HOME_SPRITE_ATLASES} from "../../data/spriteAtlases";
import {loadTexturedAtlasCanvas,getAtlasFrameCanvas} from "../../utils/spriteAtlas";
import {createBookCanvasLoop} from "../../utils/bookCanvasLoop.js";
import {createLobsterChemical,advanceLobsterChemical,lobsterChemicalAlpha,LOBSTER_CHEMICAL_COLORS} from "./lobsterChemicalModel.js";
const atlas=HOME_SPRITE_ATLASES.spiny_lobster;
export default function LobsterChemicalPreview({controls,ruleGroup}){
  const canvasRef=React.useRef(null),controlsRef=React.useRef(controls);
  const [error,setError]=React.useState("");
  React.useEffect(()=>{controlsRef.current=controls;},[controls]);
  React.useEffect(()=>{
    let model,frames,disposed=false,buffer,imageData,lastRevision=-1,wasVisible=true;
    const loop=createBookCanvasLoop(canvasRef.current,{
      onResize:({width,height})=>{
        model=createLobsterChemical(width/height);buffer=document.createElement("canvas");
        buffer.width=model.cols;buffer.height=model.rows;
        imageData=buffer.getContext("2d").createImageData(model.cols,model.rows);lastRevision=-1;wasVisible=true;
      },
      onFrame:({context:ctx,width,height,elapsedSeconds})=>{
        advanceLobsterChemical(model,controlsRef.current,elapsedSeconds);
        const visible=lobsterChemicalAlpha(model.max)>0;
        if(lastRevision===model.revision||(!visible&&!wasVisible))return;
        lastRevision=model.revision;wasVisible=visible;
        ctx.clearRect(0,0,width,height);
        const bctx=buffer.getContext("2d");
        model.layers.forEach((layer,k)=>{
          const color=LOBSTER_CHEMICAL_COLORS[k];
          for(let i=0;i<layer.length;i++){
            imageData.data[i*4]=color[0];imageData.data[i*4+1]=color[1];imageData.data[i*4+2]=color[2];
            imageData.data[i*4+3]=lobsterChemicalAlpha(layer[i]);
          }
          bctx.putImageData(imageData,0,0);
          ctx.drawImage(buffer,0,0,model.cols*model.cell*width/model.width,model.rows*model.cell*height/model.height);
        });
        const s=width/model.width,size=3*s,h=size*180/175;
        model.sources.forEach(a=>{
          ctx.save();ctx.translate(a.x*s,a.y*s);ctx.rotate(Math.PI);
          ctx.drawImage(getAtlasFrameCanvas(frames,atlas.stages.lobster_top.frames[0]),-size/2,-h/2,size,h);ctx.restore();
        });
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

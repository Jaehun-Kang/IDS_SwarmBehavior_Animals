import { BOOK_MOVEMENT_SCALE } from "./bookMotion.js";
import {advanceFixedStep,interpolatePose} from "../../utils/bookAnimation.js";
const STEP=1/60,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const delta=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
export function createLobsterDefense(aspect=1){
  const width=30*Math.max(1,aspect),height=width/aspect;
  const dens=[{x:width*0.32,y:height*0.18},{x:width*0.32,y:height*0.45}];
  const agents=[{x:dens[0].x,y:dens[0].y,row:0},{x:width*0.53,y:dens[1].y,row:1}];
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;agents.push({x:width*0.44+Math.cos(a)*4,y:height*0.78+Math.sin(a)*2.5,row:2,angle:a});}
  agents.forEach((a,id)=>Object.assign(a,{id,heading:0,distance:0,moving:false,state:"resting"}));
  return {width,height,dens,agents,homes:agents.map(a=>({...a})),previous:agents.map(a=>({...a})),
    threats:dens.map(d=>({x:width*0.9,y:d.y})).concat({x:width*0.9,y:height*0.78}),
    levels:[0,0,0],remainder:0,time:0};
}
function move(a,target,orientation){
  const dx=target.x-a.x,dy=target.y-a.y,d=Math.hypot(dx,dy);
  const turn=delta(a.heading,d>0.07?Math.atan2(dy,dx):orientation);
  a.heading+=clamp(turn,-2.2*STEP,2.2*STEP);
  a.moving=d>0.07||Math.abs(turn)>0.005;
  if(d>0.07){const step=Math.min(2.2,d*1.6)*BOOK_MOVEMENT_SCALE*STEP*Math.max(0.1,Math.cos(turn));a.x+=Math.cos(a.heading)*step;a.y+=Math.sin(a.heading)*step;a.distance+=step;}
}
function step(m,c){
  m.previous=m.agents.map(a=>({...a}));
  m.levels=[c.den_threat??50,c.near_threat??65,c.open_threat??65].map(v=>clamp(v,0,100)/100);
  m.threatMoving=false;
  m.threats.forEach((p,i)=>{const target=m.width*(0.9-m.levels[i]*0.23),dx=target-p.x;p.x+=dx*(1-Math.exp(-STEP/0.18));if(Math.abs(dx)>0.001)m.threatMoving=true;});
  for(const a of m.agents){
    const intensity=m.levels[a.row],home=m.homes[a.id];
    if(a.row===0){a.state="sheltered";move(a,home,Math.atan2(m.threats[0].y-a.y,m.threats[0].x-a.x));}
    else if(a.row===1){a.state=intensity>0.25?"retreat":"resting";move(a,intensity>0.25?m.dens[1]:home,0);}
    else{
      // Prescribed group-defense comparison, not a claim about spontaneous formation thresholds.
      a.state=intensity>0.3?"rosette":"resting";
      const target=a.state==="rosette"?{x:m.width*0.44+Math.cos(a.angle)*2,y:m.height*0.78+Math.sin(a.angle)*2}:home;
      move(a,target,a.state==="rosette"?a.angle:0);
    }
  }
  m.time+=STEP;
}
export function advanceLobsterDefense(m,c,elapsed){advanceFixedStep(m,elapsed,STEP,1,()=>step(m,c));}
export function lobsterDefensePose(m,i,out={}){return interpolatePose(m.previous[i],m.agents[i],m.remainder/STEP,out);}

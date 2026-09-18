import { BOOK_MOVEMENT_SCALE } from "./bookMotion.js";
import {advanceFixedStep,interpolatePose} from "../../utils/bookAnimation.js";
const STEP=1/60,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createKrillRest(aspect=1){
 const width=24*Math.max(1,aspect),height=width/aspect;
 const agents=Array.from({length:3},(_,id)=>({id,x:width*(id+0.5)/3,y:height*0.35,heading:0,vy:0,moving:true}));
 return {width,height,agents,previous:agents.map(a=>({...a})),time:0,remainder:0};
}
export function krillRestVelocity(id,c){
 if(id===0)return 1.8*clamp(c.sinking_rate??50,0,100)/100;
 if(id===1)return 0.9-1.8*(1-clamp(c.fullness??70,0,100)/100);
 return 0.9-1.8*clamp(c.swimming_effort??70,0,100)/100;
}
function step(m,c){
 m.previous=m.agents.map(a=>({...a}));
 for(const a of m.agents){
  a.vy+=(krillRestVelocity(a.id,c)*BOOK_MOVEMENT_SCALE-a.vy)*(1-Math.exp(-STEP/0.35));
  // Window limits only slow translation. They never empty a stomach or trigger swimming.
  const room=a.vy>0?m.height-3-a.y:a.y-3;
  const dy=a.vy*STEP*clamp(room/2,0,1);
  const orientation=a.vy< -0.02?-0.45:0;
  const turn=orientation-a.heading;a.heading+=clamp(turn,-STEP,STEP);
  a.moving=Math.abs(dy)>1e-6||Math.abs(turn)>0.001;
  if(Math.abs(dy)>1e-6)a.y+=dy;
 }
 m.time+=STEP;
}
export function advanceKrillRest(m,c,elapsed){advanceFixedStep(m,elapsed,STEP,1,()=>step(m,c));}
export function krillRestPose(m,i,out={}){return interpolatePose(m.previous[i],m.agents[i],m.remainder/STEP,out);}

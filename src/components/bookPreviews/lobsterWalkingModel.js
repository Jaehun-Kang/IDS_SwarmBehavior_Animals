import {advanceFixedStep,interpolatePose} from "../../utils/bookAnimation.js";
const STEP=1/60,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createLobsterWalking(aspect){
  const width=24*Math.max(1,aspect),height=width/aspect,rx=width*0.25;
  const agent={x:width*0.5+rx,y:height*0.5,heading:Math.PI/2};
  return {width,height,rx,phase:0,speed:2.4,distance:0,agent,previous:{...agent},time:0,remainder:0};
}
function step(m,c){
  m.previous={...m.agent};
  const speed=2.4*clamp(c.walk_speed??1,0,2);
  m.speed+=clamp(speed-m.speed,-STEP*3,STEP*3);
  const targetRx=m.width*clamp(c.turn_width??50,30,70)/200;
  if(m.speed>0.001)m.rx+=clamp(targetRx-m.rx,-STEP*0.5,STEP*0.5);
  const ry=m.height*0.23;
  const tangent=Math.hypot(m.rx*Math.sin(m.phase),ry*Math.cos(m.phase));
  m.phase+=m.speed*STEP/Math.max(tangent,0.1);
  m.agent.x=m.width*0.5+m.rx*Math.cos(m.phase);
  m.agent.y=m.height*0.5+ry*Math.sin(m.phase);
  const dx=m.agent.x-m.previous.x,dy=m.agent.y-m.previous.y;
  if(Math.hypot(dx,dy)>1e-8){
    const target=Math.atan2(dy,dx),turn=Math.atan2(Math.sin(target-m.agent.heading),Math.cos(target-m.agent.heading));
    m.agent.heading+=clamp(turn,-STEP*2,STEP*2);
  }
  m.distance+=Math.hypot(dx,dy);m.time+=STEP;
}
export function advanceLobsterWalking(m,c,elapsed){advanceFixedStep(m,elapsed,STEP,1,()=>step(m,c));}
export function lobsterWalkingPose(m,result={}){return interpolatePose(m.previous,m.agent,m.remainder/STEP,result);}

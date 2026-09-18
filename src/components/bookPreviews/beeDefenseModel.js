import { BOOK_MOVEMENT_SCALE } from "./bookMotion.js";
import { advanceFixedStep, interpolatePose } from "../../utils/bookAnimation.js";
const STEP=1/60;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
export function createBeeDefense(aspect){
  const width=22*Math.max(1,aspect),height=width/aspect;
  const agents=Array.from({length:18},(_,id)=>({id,x:width*0.3+(id%3)*1.2,
    y:height/2+(Math.floor(id/3)-2.5)*1.3,heading:0,state:"guarding",timer:0,exposure:0}));
  return {width,height,agents,homes:agents.map(a=>({x:a.x,y:a.y})),previous:agents.map(a=>({...a})),
    threat:{x:width*0.65,y:height/2},previousThreat:{x:width*0.65,y:height/2},time:0,remainder:0,moving:true};
}
function step(m,c){
  m.previous=m.agents.map(a=>({...a}));m.previousThreat={...m.threat};
  const distance=clamp(c.threat_distance??55,0,100)/100;
  const targetX=m.width*0.3+2+distance*(m.width*0.55-2);
  m.threat.x+=(targetX-m.threat.x)*(1-Math.exp(-STEP/0.18));
  m.moving=Math.abs(targetX-m.threat.x)>0.001;
  const radius=clamp(c.alert_range??7,4,10);
  const close=m.threat.x<m.width*0.3+4;
  for(const a of m.agents){
    const d=Math.hypot(a.x-m.threat.x,a.y-m.threat.y);
    // Local arousal and return delay are exhibition timing, not a mortality model.
    if(d<radius){
      a.exposure+=STEP;
      a.state=close&&a.exposure>0.7+a.id*0.06?"surrounding":"warning";
      a.timer=clamp(c.recovery_time??3,1,8)*(1+Math.min(a.exposure,15)/15);
    }else{
      a.timer=Math.max(0,a.timer-STEP);
      a.state=a.timer>0?"recovering":"guarding";
      if(a.timer===0)a.exposure=0;
    }
    let target=m.homes[a.id];
    if(a.state==="surrounding"){
      const angle=a.id*Math.PI*2/18,r=1.1+(a.id%2)*0.65;
      target={x:m.threat.x+Math.cos(angle)*r,y:m.threat.y+Math.sin(angle)*r};
    }
    const dx=target.x-a.x,dy=target.y-a.y,gap=Math.hypot(dx,dy);
    const heading=gap>0.03?Math.atan2(dy,dx):a.state==="guarding"?0:Math.atan2(m.threat.y-a.y,m.threat.x-a.x);
    const turn=Math.atan2(Math.sin(heading-a.heading),Math.cos(heading-a.heading));
    a.heading+=clamp(turn,-STEP*3,STEP*3);
    if(gap>0.03){
      const speed=BOOK_MOVEMENT_SCALE*Math.min(3,gap*3)*Math.max(0,Math.cos(turn));
      a.x+=Math.cos(a.heading)*speed*STEP;a.y+=Math.sin(a.heading)*speed*STEP;
    }
    if(gap>0.03||Math.abs(turn)>0.001||a.state!=="guarding")m.moving=true;
  }
  m.time+=STEP;
}
export function advanceBeeDefense(m,c,elapsed){advanceFixedStep(m,elapsed,STEP,1,()=>step(m,c));}
export function beeDefensePose(m,i,result={}){return interpolatePose(m.previous[i],m.agents[i],m.remainder/STEP,result);}

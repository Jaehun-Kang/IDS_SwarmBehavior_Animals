import { BOOK_MOVEMENT_SCALE } from "./bookMotion.js";
import { advanceFixedStep, interpolatePose } from "../../utils/bookAnimation.js";
const STEP=1/120;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function createSheepThreat(aspect=1.5) {
  const width=20*Math.max(1,aspect),height=20/Math.min(1,aspect);
  const agents=Array.from({length:9},(_,id)=>{
    const x=width/2+(id%3-1)*2.8,y=height/2+(Math.floor(id/3)-1)*2.8,heading=id*2.4;
    return {id,x,y,heading,speed:0,distance:0,alarm:0,previous:{x,y,heading}};
  });
  return {width,height,agents,time:0,remainder:0,threatMode:true};
}
export function sheepThreatCue(a,dog,range=8) {
  if(!dog)return 0;
  return clamp(1-Math.hypot(a.x-dog.x,a.y-dog.y)/range,0,1);
}
export function advanceSheepThreat(m,controls,elapsed,pointer=null) {
  advanceFixedStep(m,elapsed,STEP,1,()=>{
    m.time+=STEP;
    const snapshot=m.agents.map(a=>({...a}));
    const dog=pointer?{x:pointer.x*m.width,y:pointer.y*m.height}:null;
    for(const a of m.agents) {
      Object.assign(a.previous,{x:a.x,y:a.y,heading:a.heading});
      const cue=sheepThreatCue(a,dog)*clamp(controls.dog_response??70,0,100)/100;
      a.alarm+=(cue-a.alarm)*(1-Math.exp(-STEP/(cue>a.alarm?0.3:clamp(controls.recovery_time??3,1,8))));
      let dx=Math.cos(a.id*2.4+m.time*0.15)*0.13,dy=Math.sin(a.id*2.4+m.time*0.15)*0.13;
      const neighbors=snapshot.filter(b=>b.id!==a.id).map(b=>({a:b,d:Math.hypot(b.x-a.x,b.y-a.y)}))
        .filter(b=>b.d<8).sort((a,b)=>a.d-b.d).slice(0,4);
      let nearestAhead=Infinity;
      for(const b of neighbors) {
        const ux=(b.a.x-a.x)/Math.max(b.d,0.01),uy=(b.a.y-a.y)/Math.max(b.d,0.01);
        const attraction=clamp((b.d-2)/3,0,1)*(0.1+a.alarm*clamp(controls.group_response??60,0,100)/100)*0.7;
        const separation=Math.max(0,1.8-b.d)*2;
        dx+=ux*(attraction-separation);dy+=uy*(attraction-separation);
        if(ux*Math.cos(a.heading)+uy*Math.sin(a.heading)>0.5)nearestAhead=Math.min(nearestAhead,b.d);
      }
      if(dog) {
        const d=Math.max(0.01,Math.hypot(a.x-dog.x,a.y-dog.y));
        dx+=(a.x-dog.x)/d*cue*2;dy+=(a.y-dog.y)/d*cue*2;
      }
      dx+=Math.max(0,4-a.x)-Math.max(0,a.x-m.width+4);
      dy+=Math.max(0,4-a.y)-Math.max(0,a.y-m.height+4);
      const desiredHeading=Math.atan2(dy,dx),delta=Math.atan2(Math.sin(desiredHeading-a.heading),Math.cos(desiredHeading-a.heading));
      a.heading+=clamp(delta,-1.8*STEP,1.8*STEP);
      const desired=Math.min(1.6,Math.hypot(dx,dy)*(1+a.alarm))*Math.max(0,Math.cos(delta))*clamp((nearestAhead-1)/0.8,0,1);
      a.speed+=clamp(desired*BOOK_MOVEMENT_SCALE-a.speed,-2*STEP,2*STEP);
      a.x+=Math.cos(a.heading)*a.speed*STEP;a.y+=Math.sin(a.heading)*a.speed*STEP;
      a.distance+=a.speed*STEP;
    }
  });
}
export function sheepThreatPose(m,index,result={}) {
  return interpolatePose(m.agents[index].previous,m.agents[index],m.remainder/STEP,result);
}

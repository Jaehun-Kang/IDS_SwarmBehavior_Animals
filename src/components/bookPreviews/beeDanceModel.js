import { advanceFixedStep, interpolatePose } from "../../utils/bookAnimation.js";
const STEP=1/60;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
export const beeWaggleDuration=c=>0.8+clamp(c.food_distance??40,0,100)/100*4;
export function createBeeDance(aspect){
  const width=18*Math.max(1,aspect),height=width/aspect;
  const agents=Array.from({length:7},(_,id)=>({id,x:width/2+(id?Math.cos(id)*2:0),
    y:height/2+(id?Math.sin(id)*2:1.2),heading:-Math.PI/2,listened:0,knownAngle:null,
    state:id?"following":"dancing",timer:0,visits:0}));
  return {width,height,agents,previous:agents.map(a=>({...a})),time:0,remainder:0,phase:0,side:1,
    waggle:true,duration:beeWaggleDuration({}),angle:0,cycles:0};
}
function step(m,c){
  m.previous=m.agents.map(a=>({...a}));
  const desiredAngle=clamp(c.food_direction??0,-180,180)*Math.PI/180;
  const turn=Math.atan2(Math.sin(desiredAngle-m.angle),Math.cos(desiredAngle-m.angle));
  m.angle+=clamp(turn,-STEP*0.8,STEP*0.8);
  m.phase+=STEP;
  const duration=m.waggle?m.duration:1.4;
  if(m.phase>=duration){
    m.phase-=duration;m.waggle=!m.waggle;
    if(m.waggle){m.side*=-1;m.cycles++;m.duration=beeWaggleDuration(c);}
  }
  const t=clamp(m.phase/(m.waggle?m.duration:1.4),0,1);
  const x=m.waggle?Math.sin(t*Math.PI*12)*0.1:m.side*Math.sin(Math.PI*t)*1.8;
  const y=m.waggle?1.2-2.4*t:-1.2+2.4*t;
  const dancer=m.agents[0],old=m.previous[0];
  dancer.x=m.width/2+x*Math.cos(m.angle)-y*Math.sin(m.angle);
  dancer.y=m.height/2+x*Math.sin(m.angle)+y*Math.cos(m.angle);
  const heading=m.waggle?m.angle-Math.PI/2:Math.atan2(dancer.y-old.y,dancer.x-old.x);
  const dh=Math.atan2(Math.sin(heading-dancer.heading),Math.cos(heading-dancer.heading));
  dancer.heading+=clamp(dh,-STEP*4,STEP*4);
  for(const a of m.agents.slice(1)){
    a.timer=Math.max(0,a.timer-STEP);
    const distance=Math.hypot(a.x-dancer.x,a.y-dancer.y);
    if(a.state==="following" && m.waggle && distance<3){
      a.listened+=STEP;
      if(a.listened>=clamp(c.listening_time??2,0.5,4)){
        a.knownAngle=m.angle; a.state="leaving"; a.visits++;
      }
    }
    let target;
    if(a.state==="leaving" || a.state==="resting")target={x:m.width/2+Math.cos(a.id)*6,y:m.height/2+Math.sin(a.id)*6};
    else target={x:dancer.x+Math.cos(a.id)*1.4,y:dancer.y+Math.sin(a.id)*1.4};
    const dx=target.x-a.x,dy=target.y-a.y,d=Math.hypot(dx,dy);
    if(d>0.05){
      const angle=Math.atan2(dy,dx),diff=Math.atan2(Math.sin(angle-a.heading),Math.cos(angle-a.heading));
      a.heading+=clamp(diff,-STEP*3,STEP*3);
      const move=Math.min(d*STEP*2,STEP*2)*Math.max(0,Math.cos(diff));
      a.x+=Math.cos(a.heading)*move;a.y+=Math.sin(a.heading)*move;
    }
    if(a.state==="leaving"&&d<0.2){a.state="resting";a.timer=2+a.id*0.3;}
    if(a.state==="resting"&&a.timer===0){a.state="following";a.listened=0;a.knownAngle=null;}
  }
  m.time+=STEP;
}
export function advanceBeeDance(m,c,elapsed){advanceFixedStep(m,elapsed,STEP,1,()=>step(m,c));}
export function beeDancePose(m,i,result={}){return interpolatePose(m.previous[i],m.agents[i],m.remainder/STEP,result);}

import { advanceFixedStep, interpolatePose } from "../../utils/bookAnimation.js";
const STEP=1/60;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
export function createBeeDaily(aspect) {
  const width=28*Math.max(1,aspect),height=width/aspect;
  const nest={x:width*0.18,y:height*0.5};
  const flowers=Array.from({length:6},(_,i)=>({x:width*(0.63+(i%2)*0.15),y:height*(0.3+Math.floor(i/2)*0.2)}));
  const agents=Array.from({length:18},(_,id)=>({id,x:nest.x,y:nest.y+(id%3-1)*0.3,
    heading:0,speed:0,state:"inside",timer:id*0.17,flower:id%6,trips:0,distance:0,attempts:0}));
  return {width,height,nest,flowers,agents,previous:agents.map(a=>({...a})),time:0,remainder:0};
}
function step(m,c) {
  m.previous=m.agents.map(a=>({...a}));
  const activity=clamp(c.departure_activity??60,0,100)/100;
  const speedScale=clamp(c.flight_speed??1,0.5,2);
  for(const a of m.agents){
    a.timer=Math.max(0,a.timer-STEP);
    if(a.state==="inside"){
      // Changing task participation is illustrative, not an age-development model.
      if(a.timer>0)continue;
      a.attempts++;
      const sample=Math.sin((a.id+1)*12.9898+a.attempts*78.233)*43758.5453;
      if(sample-Math.floor(sample)<activity){a.state="outbound";a.flower=(a.id+a.trips)%6;}
      else {a.timer=0.7+(a.id%5)*0.1;continue;}
    }
    if(a.state==="gathering"){
      if(a.timer===0)a.state="returning";
      else continue;
    }
    const target=a.state==="returning"?m.nest:m.flowers[a.flower];
    const dx=target.x-a.x,dy=target.y-a.y,d=Math.hypot(dx,dy);
    const turn=Math.atan2(Math.sin(Math.atan2(dy,dx)-a.heading),Math.cos(Math.atan2(dy,dx)-a.heading));
    a.heading+=clamp(turn,-STEP*3,STEP*3);
    const desired=Math.min(5*speedScale,d*2)*Math.max(0,Math.cos(turn));
    a.speed+=(desired-a.speed)*(1-Math.exp(-STEP*8));
    const move=Math.min(d,a.speed*STEP);
    a.x+=Math.cos(a.heading)*move; a.y+=Math.sin(a.heading)*move;a.distance+=move;
    if(d<0.18){
      a.speed=0;
      if(a.state==="returning"){a.state="inside";a.trips++;a.timer=1+(a.id%5)*0.3;}
      else {a.state="gathering";a.timer=clamp(c.collection_time??2,0.5,5);}
    }
  }
  m.time+=STEP;
}
export function advanceBeeDaily(m,c,elapsed){advanceFixedStep(m,elapsed,STEP,1,()=>step(m,c));}
export function beeDailyPose(m,index,result={}){return interpolatePose(m.previous[index],m.agents[index],m.remainder/STEP,result);}

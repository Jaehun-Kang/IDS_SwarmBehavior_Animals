import {advanceFixedStep} from "../../utils/bookAnimation.js";
const STEP=1/60;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createFireflyCoupling(aspect){
  const width=24*Math.max(1,aspect),height=width/aspect;
  const agents=Array.from({length:24},(_,id)=>({id,
    x:width*(0.14+(id%6)*0.144),y:height*(0.2+Math.floor(id/6)*0.2),
    wait:0.4+(id*11%24)*0.24,rest:5+(id*7%13)*0.12,
    elapsed:0,burst:false,onset:false,light:0,bursts:0}));
  return {width,height,agents,previousLight:agents.map(()=>0),time:0,remainder:0};
}
export function fireflyBarrier(m,c){
  const half=m.height*0.5*clamp(c.occlusion??40,0,100)/100;
  return {x:m.width*0.5,top:m.height*0.5-half,bottom:m.height*0.5+half};
}
export function fireflyCanSee(m,a,b,c){
  const reach=m.width*clamp(c.sight_range??45,0,100)/100;
  if(a.id===b.id||Math.hypot(a.x-b.x,a.y-b.y)>reach)return false;
  const wall=fireflyBarrier(m,c);
  if(wall.bottom===wall.top||(a.x-wall.x)*(b.x-wall.x)>=0)return true;
  const y=a.y+(b.y-a.y)*(wall.x-a.x)/(b.x-a.x);
  return y<wall.top||y>wall.bottom;
}
function step(m,c){
  const sources=m.agents.filter(a=>a.onset);
  m.previousLight=m.agents.map(a=>a.light);
  for(const a of m.agents){
    a.onset=false;
    if(a.burst){
      a.elapsed+=STEP;
      const phase=a.elapsed%0.55;
      a.light=phase<0.12?Math.sin(Math.PI*phase/0.12):0;
      if(a.elapsed>=2.87){a.burst=false;a.light=0;a.wait=a.rest;}
    }else{
      a.wait-=STEP;
      // Local onset response is an exhibition model, not the paper's all-to-all IF equation.
      if(a.wait<a.rest*0.7){
        const visible=sources.some(b=>fireflyCanSee(m,a,b,c));
        if(visible)a.wait*=1-clamp(c.coupling??80,0,100)/100;
      }
      if(a.wait<=0){a.burst=true;a.onset=true;a.elapsed=0;a.bursts++;}
    }
  }
  m.time+=STEP;
}
export function advanceFireflyCoupling(m,c,elapsed){advanceFixedStep(m,elapsed,STEP,1,()=>step(m,c));}

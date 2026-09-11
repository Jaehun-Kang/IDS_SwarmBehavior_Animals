import { advanceFixedStep } from "../../utils/bookAnimation.js";
const STEP=1/60;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
export function createBeeFanning(aspect){
  const width=20*Math.max(1,aspect),height=width/aspect;
  const agents=Array.from({length:12},(_,id)=>({id,x:width*0.38+(id%3)*2.7,
    y:height/2+(Math.floor(id/3)-1.5)*2.3,heat:0.25,fanning:false,starts:0}));
  return {width,height,agents,time:0,remainder:0};
}
function step(m,c){
  const load=clamp(c.heat_load??65,0,100)/100;
  const spread=clamp(c.response_difference??60,0,100)/100;
  const cooling=clamp(c.cooling_effect??60,0,100)/100;
  const previous=m.agents.map(a=>a.fanning);
  for(const a of m.agents){
    // Dimensionless local heat balance; not a fitted hive temperature model.
    let ventilation=previous[a.id]?1:0;
    for(const b of m.agents){
      if(b.id!==a.id && previous[b.id] && Math.hypot(a.x-b.x,a.y-b.y)<3)ventilation+=0.2;
    }
    a.heat=clamp(a.heat+STEP*(0.14*(load-a.heat)-0.18*cooling*ventilation),0,1);
    const threshold=0.4+spread*((a.id*7%12)/11-0.5)*0.35;
    if(!a.fanning && a.heat>threshold){a.fanning=true;a.starts++;}
    else if(a.fanning && a.heat<threshold-0.1)a.fanning=false;
  }
  m.time+=STEP;
}
export function advanceBeeFanning(m,c,elapsed){advanceFixedStep(m,elapsed,STEP,1,()=>step(m,c));}

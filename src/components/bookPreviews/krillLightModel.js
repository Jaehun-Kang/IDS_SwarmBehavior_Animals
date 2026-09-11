import {advanceFixedStep,interpolatePose} from "../../utils/bookAnimation.js";
const STEP=1/60,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createKrillLight(aspect=1){
  const width=30*Math.max(1,aspect),height=width/aspect;
  const agents=Array.from({length:30},(_,id)=>({id,row:Math.floor(id/10),x:width/2,y:height*(0.2+Math.floor(id/10)*0.3),heading:0}));
  return {width,height,agents,previous:agents.map(a=>({...a})),time:0,remainder:0,levels:[0,0.5,0.5]};
}
export function krillLightTarget(m,a,c){
  const night=clamp(c.light_phase??0,0,100)/100,spacing=clamp(c.twilight_spacing??50,0,100)/100,cohesion=clamp(c.night_group??50,0,100)/100;
  const i=a.id%10,angle=i*Math.PI*2/10+m.time*0.16;
  // Three independent, prescribed comparisons; not an inferred universal diel state machine.
  if(a.row===0)return {x:m.width*(0.5+0.22*Math.cos(angle)),y:m.height*(0.14+0.14*night+0.035*Math.sin(angle))};
  if(a.row===1)return {x:m.width*(0.5+(0.08+0.18*spacing)*Math.cos(angle)),y:m.height*(0.51+(0.02+0.04*spacing)*Math.sin(angle))};
  const side=i<5?-1:1;
  return {x:m.width*(0.5+side*0.16+(0.025+0.07*(1-cohesion))*Math.cos(angle*2)),y:m.height*(0.81+(0.02+0.035*(1-cohesion))*Math.sin(angle*2))};
}
function step(m,c){
  m.previous=m.agents.map(a=>({...a}));
  m.levels=[c.light_phase??0,c.twilight_spacing??50,c.night_group??50].map(v=>clamp(v,0,100)/100);
  for(const a of m.agents){
    const p=krillLightTarget(m,a,c),dx=p.x-a.x,dy=p.y-a.y,d=Math.hypot(dx,dy);
    const angle=Math.atan2(dy,dx),turn=Math.atan2(Math.sin(angle-a.heading),Math.cos(angle-a.heading));
    a.heading+=clamp(turn,-1.8*STEP,1.8*STEP);
    // Bounded target interpolation prevents overshoot in the compact comparison rows.
    const k=1-Math.exp(-1.1*STEP);a.x+=dx*k;a.y+=dy*k;a.moving=d>0.01;
  }
  m.time+=STEP;
}
export function advanceKrillLight(m,c,elapsed){advanceFixedStep(m,elapsed,STEP,1,()=>step(m,c));}
export function krillLightPose(m,i,out={}){return interpolatePose(m.previous[i],m.agents[i],m.remainder/STEP,out);}

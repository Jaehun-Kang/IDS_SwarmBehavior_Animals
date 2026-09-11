import {advanceFixedStep,interpolatePose} from "../../utils/bookAnimation.js";
const STEP=1/60;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createFireflyCourtship(aspect){
  const width=24*Math.max(1,aspect),height=width/aspect;
  const agents=[0,1,2].map(id=>({id,x:width*(0.2+id*0.26),y:height*0.3,heading:0,light:0,moving:false}));
  agents.push({id:3,x:width*0.62,y:height*0.7,heading:Math.PI,light:0,moving:false});
  return {width,height,agents,homes:agents.map(a=>({x:a.x,y:a.y})),previous:agents.map(a=>({...a})),
    phase:"display",phaseTime:0,time:0,remainder:0,cycles:0};
}
function pulse(t,count,interval){
  if(t<0||t>=(count-1)*interval+0.12)return 0;
  const p=t%interval;return p<0.12?Math.sin(Math.PI*p/0.12):0;
}
function move(a,target,speed){
  const dx=target.x-a.x,dy=target.y-a.y,d=Math.hypot(dx,dy);
  a.moving=d>0.03;
  if(!a.moving)return true;
  const angle=Math.atan2(dy,dx),turn=Math.atan2(Math.sin(angle-a.heading),Math.cos(angle-a.heading));
  a.heading+=clamp(turn,-2*STEP,2*STEP);
  const distance=Math.min(d*STEP*1.5,speed*STEP)*Math.max(0.12,Math.cos(turn));
  a.x+=Math.cos(a.heading)*distance;a.y+=Math.sin(a.heading)*distance;
  return false;
}
function step(m,c){
  m.previous=m.agents.map(a=>({...a}));m.phaseTime+=STEP;
  m.agents.forEach(a=>{a.light=0;a.moving=false;});
  const spread=clamp(c.male_spread??0.1,0,2),female=m.agents[3];
  if(m.phase==="display"){
    for(const a of m.agents.slice(0,3))a.light=pulse(m.phaseTime-a.id*spread,6,0.55);
    if(m.phaseTime>=2.87+2*spread){m.phase="wait";m.phaseTime=0;}
  }else if(m.phase==="wait"){
    if(m.phaseTime>=clamp(c.response_delay??3,1,5)){m.phase="reply";m.phaseTime=0;}
  }else if(m.phase==="reply"){
    // Doublet spacing is a display choice; the response is shown, not probabilistically predicted.
    female.light=pulse(m.phaseTime,2,0.35);
    if(m.phaseTime>=0.47){m.phase="approach";m.phaseTime=0;}
  }else if(m.phase==="approach"){
    const male=m.agents[2],target={x:female.x+1.8,y:female.y-0.4};
    if(move(male,target,clamp(c.approach_speed??2,1,4))){m.phase="walk";m.phaseTime=0;}
  }else if(m.phase==="walk"){
    if(move(m.agents[2],{x:female.x+1.3,y:female.y},0.4*clamp(c.approach_speed??2,1,4))){m.phase="nearby";m.phaseTime=0;}
  }else if(m.phase==="nearby"){
    if(m.phaseTime>=2){m.phase="return";m.phaseTime=0;}
  }else if(m.phase==="return"){
    if(move(m.agents[2],m.homes[2],clamp(c.approach_speed??2,1,4))){m.phase="display";m.phaseTime=0;m.cycles++;}
  }
  m.time+=STEP;
}
export function advanceFireflyCourtship(m,c,elapsed){advanceFixedStep(m,elapsed,STEP,1,()=>step(m,c));}
export function fireflyCourtshipPose(m,i,result={}){return interpolatePose(m.previous[i],m.agents[i],m.remainder/STEP,result);}

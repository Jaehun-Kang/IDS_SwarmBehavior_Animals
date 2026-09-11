import {advanceFixedStep,interpolatePose} from "../../utils/bookAnimation.js";
const STEP=1/60,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createLobsterShelter(aspect){
  const width=24*Math.max(1,aspect),height=width/aspect;
  const agents=Array.from({length:8},(_,id)=>{
    const angle=id*Math.PI/4;
    return {id,x:width/2+Math.cos(angle)*1.3,y:height/2+Math.sin(angle)*1.3,heading:angle,
      phase:angle,state:"sheltered",delay:0,distance:0,moving:false};
  });
  return {width,height,agents,homes:agents.map(a=>({x:a.x,y:a.y})),previous:agents.map(a=>({...a})),time:0,remainder:0};
}
function move(a,target){
  const dx=target.x-a.x,dy=target.y-a.y,d=Math.hypot(dx,dy);
  a.moving=d>0.1;if(!a.moving)return true;
  const angle=Math.atan2(dy,dx),turn=Math.atan2(Math.sin(angle-a.heading),Math.cos(angle-a.heading));
  a.heading+=clamp(turn,-STEP*2.2,STEP*2.2);
  const step=Math.min(2.2,d*1.5)*STEP*Math.max(0.12,Math.cos(turn));
  a.x+=Math.cos(a.heading)*step;a.y+=Math.sin(a.heading)*step;a.distance+=step;
  return false;
}
function step(m,c){
  m.previous=m.agents.map(a=>({...a}));
  const light=clamp(c.light_level??40,0,100),memory=clamp(c.home_memory??75,0,100)/100;
  const radius=clamp(c.explore_range??65,30,100)/100;
  for(const a of m.agents){
    const threshold=30+a.id*5,wantsOut=light<threshold;
    a.moving=false;
    if(a.state==="sheltered"){
      if(wantsOut){a.state="waiting";a.delay=0.6+a.id*0.35;}
    }else if(a.state==="waiting"){
      if(!wantsOut){a.state="sheltered";continue;}
      a.delay-=STEP;if(a.delay<=0)a.state="foraging";
    }else{
      if(light>threshold+8&&a.state==="foraging")a.state="returning";
      if(wantsOut&&a.state==="returning")a.state="foraging";
      const remembers=a.id/8<memory;
      const seesShelter=Math.hypot(a.x-m.width/2,a.y-m.height/2)<3.5;
      if(a.state==="returning"&&(remembers||seesShelter)){
        if(move(a,m.homes[a.id]))a.state="sheltered";
      }else{
        // Bounded exploratory route; returning agents can discover the den locally.
        a.phase+=STEP*0.22;
        move(a,{x:m.width/2+Math.sin(a.phase)*m.width*0.3*radius,
          y:m.height/2+Math.sin(a.phase*2)*m.height*0.25*radius});
      }
    }
  }
  m.time+=STEP;
}
export function advanceLobsterShelter(m,c,elapsed){advanceFixedStep(m,elapsed,STEP,1,()=>step(m,c));}
export function lobsterShelterPose(m,i,result={}){return interpolatePose(m.previous[i],m.agents[i],m.remainder/STEP,result);}

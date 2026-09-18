import { BOOK_MOVEMENT_SCALE } from "./bookMotion.js";
import {advanceFixedStep,interpolatePose} from "../../utils/bookAnimation.js";
const STEP=1/60;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
function random(a){a.seed=(Math.imul(a.seed,1664525)+1013904223)>>>0;return a.seed/4294967296;}
export function createFireflyIndividual(aspect){
  const width=24*Math.max(1,aspect),height=width/aspect;
  const agents=Array.from({length:6},(_,id)=>({id,x:width*(0.23+(id%3)*0.27),y:height*(0.36+Math.floor(id/3)*0.28),
    heading:0,orbit:0,flight:0,burst:false,elapsed:0,wait:0.6+id*0.7,pulseCount:6,interval:0.55,
    light:0,seed:1234+id*391,bursts:0,lastWait:0}));
  return {width,height,agents,homes:agents.map(a=>({x:a.x,y:a.y})),previous:agents.map(a=>({...a})),time:0,remainder:0};
}
function step(m,c){
  m.previous=m.agents.map(a=>({...a}));
  for(const a of m.agents){
    if(!a.burst){
      a.wait-=STEP;a.light=0;
      if(a.wait<=0){a.burst=true;a.elapsed=0;a.interval=clamp(c.flash_interval??0.55,0.4,0.7);a.bursts++;}
    }else{
      a.elapsed+=STEP;
      const pulsePhase=a.elapsed%a.interval;
      a.light=pulsePhase<0.12?Math.sin(Math.PI*pulsePhase/0.12):0;
      if(a.elapsed>=(a.pulseCount-1)*a.interval+0.12){
        a.burst=false;a.light=0;
        // Bounded display waiting times, not the observed isolated IBI distribution.
        a.wait=4+random(a)*clamp(c.wait_spread??8,0,20);a.lastWait=a.wait;
      }
    }
    const flying=a.id/6<clamp(c.flying_ratio??35,0,100)/100;
    a.flight+=clamp((flying?1:0)-a.flight,-STEP*0.6,STEP*0.6);
    a.orbit+=STEP*0.5*a.flight*BOOK_MOVEMENT_SCALE;
    const home=m.homes[a.id];
    a.x=home.x+Math.sin(a.orbit)*1.8*a.flight;
    a.y=home.y+(Math.cos(a.orbit)-1)*1.2*a.flight;
    const old=m.previous[a.id],dx=a.x-old.x,dy=a.y-old.y;
    const target=Math.hypot(dx,dy)>1e-5?Math.atan2(dy,dx):0;
    const turn=Math.atan2(Math.sin(target-a.heading),Math.cos(target-a.heading));
    a.heading+=clamp(turn,-STEP*2,STEP*2);
  }
  m.time+=STEP;
}
export function advanceFireflyIndividual(m,c,elapsed){advanceFixedStep(m,elapsed,STEP,1,()=>step(m,c));}
export function fireflyIndividualPose(m,i,result={}){return interpolatePose(m.previous[i],m.agents[i],m.remainder/STEP,result);}

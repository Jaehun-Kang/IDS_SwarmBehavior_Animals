import {advanceFixedStep,interpolatePose} from "../../utils/bookAnimation.js";
const STEP=1/60,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createKrillFeeding(aspect=1){
  const width=24*Math.max(1,aspect),height=width/aspect;
  const agents=Array.from({length:8},(_,id)=>({id,x:width/2+Math.cos(id*Math.PI/4)*3,y:height/2+Math.sin(id*Math.PI/4)*3,heading:id*Math.PI/4+Math.PI/2,speed:2.4,stomach:0,food:0,distance:0}));
  return {width,height,agents,previous:agents.map(a=>({...a})),time:0,remainder:0,foodAmount:0.65,patch:{x:width*0.57,y:height/2,radius:4.5}};
}
export function krillFoodAt(m,x,y){const d=Math.hypot(x-m.patch.x,y-m.patch.y)/m.patch.radius;return Math.max(0,1-d*d)*m.foodAmount;}
function step(m,c){
  m.previous=m.agents.map(a=>({...a}));
  const base=2.4*clamp(c.swim_speed??1,0,2),digestion=clamp(c.digestion_rate??1,0,2);
  m.foodAmount=clamp(c.food_amount??65,0,100)/100;
  for(const a of m.agents){
    a.food=krillFoodAt(m,a.x,a.y);
    a.stomach=clamp(a.stomach+STEP*(0.35*a.food*(1-a.stomach)-0.12*digestion*a.stomach),0,1);
    const targetSpeed=base*(1-0.55*a.food)*(1-0.3*a.stomach);
    a.speed+=clamp(targetSpeed-a.speed,-3*STEP,3*STEP);
    if(a.speed<1e-6){a.speed=0;continue;}
    const wander=Math.sin(m.time*1.3+a.id*1.7)*(0.22+1.4*a.food);
    let x=Math.cos(a.heading)-Math.sin(a.heading)*wander,y=Math.sin(a.heading)+Math.cos(a.heading)*wander;
    const edge=Math.min(a.x,m.width-a.x,a.y,m.height-a.y),pressure=clamp((6-edge)/3,0,1);
    const dx=m.width/2-a.x,dy=m.height/2-a.y,d=Math.hypot(dx,dy)||1;
    x=x*(1-pressure)+dx/d*pressure*3;y=y*(1-pressure)+dy/d*pressure*3;
    const target=Math.atan2(y,x),turn=Math.atan2(Math.sin(target-a.heading),Math.cos(target-a.heading));
    a.heading+=clamp(turn,-1.8*STEP,1.8*STEP);
    const ds=a.speed*(1-0.65*pressure)*STEP;
    a.x+=Math.cos(a.heading)*ds;a.y+=Math.sin(a.heading)*ds;a.distance+=ds;
  }
  m.time+=STEP;
}
export function advanceKrillFeeding(m,c,elapsed){advanceFixedStep(m,elapsed,STEP,1,()=>step(m,c));}
export function krillFeedingPose(m,i,out={}){return interpolatePose(m.previous[i],m.agents[i],m.remainder/STEP,out);}

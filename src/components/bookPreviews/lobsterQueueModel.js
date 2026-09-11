import {advanceFixedStep,interpolatePose} from "../../utils/bookAnimation.js";
const STEP=1/60,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function route(width,height){
  const points=[];let length=0;
  for(let i=0;i<=512;i++){
    const t=i/512*Math.PI*2,p={x:width/2+width*0.3*Math.cos(t),y:height/2+height*0.28*Math.sin(t)};
    if(i)length+=Math.hypot(p.x-points[i-1].x,p.y-points[i-1].y);
    points.push({...p,s:length});
  }
  return {points,length};
}
export function lobsterQueuePoint(path,distance){
  const s=((distance%path.length)+path.length)%path.length;
  let lo=0,hi=path.points.length-1;
  while(hi-lo>1){const mid=(hi+lo)>>1;if(path.points[mid].s<=s)lo=mid;else hi=mid;}
  const a=path.points[lo],b=path.points[hi],t=(s-a.s)/(b.s-a.s);
  return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,heading:Math.atan2(b.y-a.y,b.x-a.x)};
}
export function createLobsterQueue(aspect){
  const width=24*Math.max(1,aspect),height=width/aspect,path=route(width,height);
  const agents=Array.from({length:6},(_,id)=>({id,leaderId:id? id-1:null,s:-id*3,speed:2.4,distance:0,...lobsterQueuePoint(path,-id*3)}));
  return {width,height,path,agents,previous:agents.map(a=>({...a})),time:0,remainder:0};
}
function step(m,c){
  m.previous=m.agents.map(a=>({...a}));
  const base=2.4*clamp(c.queue_speed??1,0,2),gap=3*clamp(c.queue_gap??1,0.8,1.3);
  const response=clamp(c.follow_response??1,0.5,2);
  for(const a of m.agents){
    const old=m.previous[a.id],leader=a.leaderId===null?null:m.previous[a.leaderId];
    const separation=leader?leader.s-old.s:Infinity;
    const desired=leader?clamp(base+response*(separation-gap),0,base*1.6):base;
    a.speed+=clamp(desired-a.speed,-STEP*4,STEP*4);
    const advance=Math.max(0,Math.min(a.speed*STEP,separation-2.1));
    a.s+=advance;a.distance+=advance;
    const pose=lobsterQueuePoint(m.path,a.s);
    a.x=pose.x;a.y=pose.y;
    const turn=Math.atan2(Math.sin(pose.heading-a.heading),Math.cos(pose.heading-a.heading));
    a.heading+=clamp(turn,-STEP*2,STEP*2);
  }
  m.time+=STEP;
}
export function advanceLobsterQueue(m,c,elapsed){advanceFixedStep(m,elapsed,STEP,1,()=>step(m,c));}
export function lobsterQueuePose(m,i,result={}){return interpolatePose(m.previous[i],m.agents[i],m.remainder/STEP,result);}

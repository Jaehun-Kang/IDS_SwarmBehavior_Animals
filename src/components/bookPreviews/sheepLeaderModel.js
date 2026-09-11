import { advanceFixedStep, interpolatePose } from "../../utils/bookAnimation.js";
const STEP=1/120;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function createSheepLeaders(aspect=1.5) {
  const width=24*Math.max(1,aspect),height=24/Math.min(1,aspect);
  const agents=Array.from({length:4},(_,id)=>{
    const x=width*0.55-id*2,y=height*0.5,heading=0;
    return {id,x,y,heading,speed:0,distance:0,leaderId:id===0?null:id-1,previous:{x,y,heading}};
  });
  return {width,height,agents,leaderId:0,time:0,remainder:0,episodeAge:0,paused:false,episode:0,waypoint:0};
}
function bindEpisode(m) {
  m.episode++;
  // Reproducible episode-level choice; positions and headings are never reset.
  const id=Math.floor(((Math.sin(m.episode*127.1)*43758.5453)%1+1)%1*4);
  m.leaderId=id;
  const remaining=new Set(m.agents.map(a=>a.id));
  let front=m.agents.find(a=>a.id===id); front.leaderId=null; remaining.delete(id);
  while(remaining.size) {
    const next=m.agents.filter(a=>remaining.has(a.id)).sort((a,b)=>
      Math.hypot(a.x-front.x,a.y-front.y)-Math.hypot(b.x-front.x,b.y-front.y))[0];
    next.leaderId=front.id;remaining.delete(next.id);front=next;
  }
}
export function advanceSheepLeaders(m,controls,elapsed) {
  advanceFixedStep(m,elapsed,STEP,1,()=>{
    m.time+=STEP;m.episodeAge+=STEP;
    if(m.episodeAge>=(m.paused?4:clamp(controls.episode_duration??15,5,25))) {
      m.episodeAge=0;m.paused=!m.paused;
      if(!m.paused) bindEpisode(m);
    }
    const snapshot=m.agents.map(a=>({...a}));
    const points=[[0.74,0.35],[0.7,0.7],[0.3,0.7],[0.3,0.3]];
    for(const a of m.agents) {
      Object.assign(a.previous,{x:a.x,y:a.y,heading:a.heading});
      const front=snapshot.find(b=>b.id===a.leaderId);
      const target=front??{x:points[m.waypoint][0]*m.width,y:points[m.waypoint][1]*m.height};
      const d=Math.hypot(target.x-a.x,target.y-a.y);
      if(!front && d<2) m.waypoint=(m.waypoint+1)%points.length;
      let dx=(target.x-a.x)/Math.max(d,0.01),dy=(target.y-a.y)/Math.max(d,0.01);
      dx+=Math.max(0,5-a.x)-Math.max(0,a.x-m.width+5);
      dy+=Math.max(0,5-a.y)-Math.max(0,a.y-m.height+5);
      const delta=Math.atan2(Math.sin(Math.atan2(dy,dx)-a.heading),Math.cos(Math.atan2(dy,dx)-a.heading));
      const response=front?clamp(controls.following_response??70,20,100)/100:1;
      const nearest=snapshot.filter(b=>b.id!==a.id &&
        (b.x-a.x)*Math.cos(a.heading)+(b.y-a.y)*Math.sin(a.heading)>0)
        .reduce((min,b)=>Math.min(min,Math.hypot(b.x-a.x,b.y-a.y)),Infinity);
      const speed=clamp(controls.leader_speed??1,0.5,1.5);
      const desired=m.paused?0:(front?Math.min(speed*1.4,Math.max(0,d-1.6)*response):speed)
        *clamp((nearest-1.1)/0.8,0,1)*Math.max(0,Math.cos(delta));
      a.speed+=clamp(desired-a.speed,-2*STEP,2*STEP);
      if(!m.paused) a.heading+=clamp(delta,-1.5*response*STEP,1.5*response*STEP);
      a.x+=Math.cos(a.heading)*a.speed*STEP;a.y+=Math.sin(a.heading)*a.speed*STEP;
      a.distance+=a.speed*STEP;
    }
  });
}
export function sheepLeaderPose(m,index,result={}) {
  return interpolatePose(m.agents[index].previous,m.agents[index],m.remainder/STEP,result);
}

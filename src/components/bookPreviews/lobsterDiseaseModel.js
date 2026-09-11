import {advanceFixedStep,interpolatePose} from "../../utils/bookAnimation.js";
import {createLobsterChemical,advanceLobsterChemical,sampleLobsterChemical} from "./lobsterChemicalModel.js";
const STEP=1/60,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function random(m){m.seed=(1664525*m.seed+1013904223)>>>0;return m.seed/4294967296;}
function home(m,id){const angle=id*Math.PI/3;return{x:m.width/2+Math.cos(angle)*1.2,y:m.height/2+Math.sin(angle)*1.2};}
export function createLobsterDisease(aspect=1){
  const field=createLobsterChemical(aspect),m={width:field.width,height:field.height,field,seed:7151,time:0,remainder:0,episode:0,age:0,detectedFor:0,recovery:0,nextId:6,removed:false};
  m.agents=Array.from({length:6},(_,id)=>({...home(m,id),id,slot:id,heading:Math.PI,distance:0,moving:false,entering:false,state:"sheltered"}));
  m.infectedId=Math.floor(random(m)*6);m.previous=m.agents.map(a=>({...a}));
  field.sources.forEach(s=>{s.enabled=false;});return m;
}
function move(a,target){
  const dx=target.x-a.x,dy=target.y-a.y,d=Math.hypot(dx,dy);a.moving=d>0.08;if(!a.moving)return;
  const turn=Math.atan2(Math.sin(Math.atan2(dy,dx)-a.heading),Math.cos(Math.atan2(dy,dx)-a.heading));
  a.heading+=clamp(turn,-2.2*STEP,2.2*STEP);
  const ds=Math.min(2,d*1.6)*STEP*Math.max(0.1,Math.cos(turn));a.x+=Math.cos(a.heading)*ds;a.y+=Math.sin(a.heading)*ds;a.distance+=ds;
}
export function diseaseDenBlocked(m){
  if(!m.removed&&m.age>=6)return true;
  const field=m.field;
  for(let i=0;i<9;i++){const a=i*Math.PI/4,r=i===8?0:2;
    if(sampleLobsterChemical(field,field.layers[1],m.width/2+Math.cos(a)*r,m.height/2+Math.sin(a)*r)>0.01)return true;
  }
  return false;
}
function step(m,c){
  m.previous=m.agents.map(a=>({...a}));
  const rate=clamp(c.disease_pace??1,0,2);m.age+=STEP*rate;
  const infected=m.agents.find(a=>a.id===m.infectedId);
  if(!m.removed&&m.age>=20){
    m.removed=true;
    const slot=infected.slot;m.agents=m.agents.filter(a=>a.id!==m.infectedId);
    const side=Math.floor(random(m)*4),p=random(m)*0.6+0.2;
    const x=side===0?-2:side===1?m.width+2:m.width*p;
    const y=side===2?-2:side===3?m.height+2:m.height*p;
    const a={id:m.nextId++,slot,x,y,heading:Math.atan2(m.height/2-y,m.width/2-x),distance:0,moving:true,entering:true,state:"entering"};
    m.agents.push(a);m.previous.push({...a});
  }
  const source=m.field.sources[1];source.enabled=!m.removed&&m.age>=6;
  m.detectedFor=source.enabled?m.detectedFor+STEP:0;
  if(infected){source.x=infected.x;source.y=infected.y;}
  advanceLobsterChemical(m.field,{signal_release:source.enabled?70:0,water_flow:c.flushing??50,signal_spread:45},STEP);
  const blocked=diseaseDenBlocked(m),delay=clamp(c.avoidance_delay??1,0.2,3);
  for(const a of m.agents){
    a.moving=false;
    if(a.id===m.infectedId){a.state=m.age>=14?"clinical":m.age>=6?"detectable":"latent";continue;}
    const target=home(m,a.slot);
    if(a.entering){
      a.state="entering";move(a,{x:m.width/2+Math.cos(a.slot*Math.PI/3)*5.5,y:m.height/2+Math.sin(a.slot*Math.PI/3)*5.5});
      if(a.x>2&&a.x<m.width-2&&a.y>2&&a.y<m.height-2)a.entering=false;
    }else if(blocked&&(m.removed||m.detectedFor>=delay+a.slot*0.15)){
      a.state="seeking";const angle=a.slot*Math.PI/3+m.time*0.055;
      move(a,{x:m.width/2+Math.cos(angle)*5.5,y:m.height/2+Math.sin(angle)*5.5});
    }else{a.state="sheltered";move(a,target);if(a.moving)a.state="returning";}
  }
  // Replenishment and renewed random infection are exhibition maintenance, not transmission.
  if(m.removed&&!blocked&&m.agents.every(a=>a.state==="sheltered"&&!a.moving)){
    m.recovery+=STEP*rate;
    if(m.recovery>=4){m.episode++;m.age=0;m.recovery=0;m.removed=false;m.infectedId=m.agents[Math.floor(random(m)*m.agents.length)].id;}
  }else m.recovery=0;
  m.time+=STEP;
}
export function advanceLobsterDisease(m,c,elapsed){advanceFixedStep(m,elapsed,STEP,1,()=>step(m,c));}
export function lobsterDiseasePose(m,a,out={}){const old=m.previous.find(p=>p.id===a.id)||a;return interpolatePose(old,a,m.remainder/STEP,out);}

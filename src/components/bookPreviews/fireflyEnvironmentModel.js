import {advanceFixedStep} from "../../utils/bookAnimation.js";
const STEP=1/60,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createFireflyEnvironment(aspect){
  const width=24*Math.max(1,aspect),height=width/aspect;
  const agents=Array.from({length:12},(_,id)=>({id,x:width*(0.2+(id%4)*0.2),y:height*(0.25+Math.floor(id/4)*0.25),
    clock:id*0.63,distressTime:0,trapped:false,recovery:0,light:0}));
  return {width,height,agents,previousLight:agents.map(()=>0),time:0,remainder:0};
}
function step(m,c){
  m.previousLight=m.agents.map(a=>a.light);
  for(const a of m.agents){
    const trapped=a.id<Math.round(12*clamp(c.disturbed_share??0,0,100)/100);
    if(a.trapped&&!trapped)a.recovery=clamp(c.recovery_time??3,1,8)*(0.8+a.id*0.04);
    if(trapped&&!a.trapped)a.distressTime=0;
    a.trapped=trapped;
    // Preserve individual clocks through disturbance; recovery duration is an exhibition setting.
    a.clock+=STEP;a.light=0;
    if(trapped){
      a.distressTime+=STEP;
      const phase=a.distressTime%(1.5+a.id/11*1.5);
      if(phase<0.12)a.light=Math.sin(Math.PI*phase/0.12);
    }else if(a.recovery>0){a.recovery=Math.max(0,a.recovery-STEP);}
    else{
      const cycle=a.clock%(8+a.id*0.17),pulse=cycle%0.55;
      const exposure=clamp(c.artificial_light??0,0,100)/100;
      // Qualitative individual participation thresholds, not measured lux-response curves.
      const threshold=0.15+((a.id*7)%12)/12*0.8;
      if(exposure<threshold&&cycle<2.87&&pulse<0.12)a.light=Math.sin(Math.PI*pulse/0.12);
    }
  }
  m.time+=STEP;
}
export function advanceFireflyEnvironment(m,c,elapsed){advanceFixedStep(m,elapsed,STEP,1,()=>step(m,c));}

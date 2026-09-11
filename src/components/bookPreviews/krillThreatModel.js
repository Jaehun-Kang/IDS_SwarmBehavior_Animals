import {advanceFixedStep} from "../../utils/bookAnimation.js";
import {createSwimmingModel,stepSwimmingModel,swimmingPose,SWIM_STEP} from "./sardineSwimmingModel.js";
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createKrillThreat(aspect=1){const m=createSwimmingModel(aspect);m.predator={x:m.width*0.96,y:m.height/2};return m;}
export function krillThreatControls(c){return {swim_speed:0.9,turn_rate:180,neighbor_radius:1.6,spacing_strength:55,alignment_strength:45,cohesion_strength:50,threat_strength:100,threat_cohesion:25,recovery_time:clamp(c.recovery_delay??2,1,5)};}
export function advanceKrillThreat(m,c,elapsed){
 const level=clamp(c.predator_approach??60,0,100)/100,settings=krillThreatControls(c);
 advanceFixedStep(m,elapsed,SWIM_STEP,0.35,()=>{
  const target=m.width*(0.96-0.46*level);
  m.predator.x+=(target-m.predator.x)*(1-Math.exp(-SWIM_STEP/0.5));
  stepSwimmingModel(m,settings,level>0?m.predator:null);
 });
}
export const krillThreatPose=swimmingPose;

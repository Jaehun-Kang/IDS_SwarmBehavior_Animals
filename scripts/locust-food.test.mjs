import test from "node:test";
import assert from "node:assert/strict";
import { createLocustGroundModel,stepLocustGround,locustStimulus,locustFoodTargets } from "../src/components/bookPreviews/locustGroundModel.js";
test("nutrition changes interactions, not isolated baseline movement",()=>{
  const a={id:0,x:0,y:0,heading:0,satiety:0},front={...a,id:1,x:3},rear={...a,id:2,x:-3};
  const low=locustStimulus(a,[a,front,rear],{hunger:0},null,[]);
  const high=locustStimulus(a,[a,front,rear],{hunger:100},null,[]);
  assert.equal(low.rear,false); assert.equal(high.rear,true); assert.ok(high.x>low.x);
  assert.equal(locustStimulus({...a,satiety:1},[front,rear],{hunger:100},null,[]).rear,false);
  const model=createLocustGroundModel(1),other=createLocustGroundModel(1);
  model.agents=model.agents.slice(0,1);other.agents=other.agents.slice(0,1);
  for(let i=0;i<1000;i++) {
    stepLocustGround(model,{hunger:0,feeding_duration:0});
    stepLocustGround(other,{hunger:100,feeding_duration:0});
  }
  assert.deepEqual(model.agents,other.agents);
});
test("feeding stops movement and external threat can interrupt it without teleportation",()=>{
  const model=createLocustGroundModel(1),a=model.agents[0],food=locustFoodTargets(model)[0];
  a.x=food.x;a.y=food.y;
  stepLocustGround(model,{hunger:0,feeding_duration:5});
  assert.equal(a.state,"feeding");assert.equal(a.x,food.x);assert.equal(a.y,food.y);assert.ok(a.satiety>0);
  stepLocustGround(model,{hunger:0,feeding_duration:5},{x:a.x+1,y:a.y});
  assert.equal(a.state,"prepare");assert.equal(a.x,food.x);assert.equal(a.y,food.y);
});
test("food and moving threats remain bounded at control extremes",()=>{
  for(const aspect of [0.55,1,2]) for(const hunger of [0,100]) for(const feeding of [0,5]) for(const radius of [2,10]) {
    const model=createLocustGroundModel(aspect);
    for(let i=0;i<3600;i++) {
      const predator={x:model.width*(0.5+0.48*Math.sin(i/200)),y:model.height*(0.5+0.48*Math.cos(i/250))};
      stepLocustGround(model,{hunger,feeding_duration:feeding,escape_strength:radius},predator);
      for(const a of model.agents) assert.ok(Number.isFinite(a.heading)&&a.x>2&&a.x<model.width-2&&a.y-a.z>2&&a.y<model.height-2);
    }
  }
});

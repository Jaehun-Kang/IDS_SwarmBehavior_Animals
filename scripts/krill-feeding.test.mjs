import { BOOK_MOVEMENT_SCALE } from "../src/components/bookPreviews/bookMotion.js";
import test from "node:test";
import assert from "node:assert/strict";
import {createKrillFeeding,advanceKrillFeeding,krillFoodAt} from "../src/components/bookPreviews/krillFeedingModel.js";
const run=(m,c,s,fps=60)=>{for(let i=0;i<s*fps;i++)advanceKrillFeeding(m,c,1/fps);};
test("food response is local and food availability affects feeding",()=>{
  const a=createKrillFeeding(),b=createKrillFeeding();run(a,{food_amount:0},5);run(b,{food_amount:100},5);
  assert.ok(a.agents.every(x=>x.stomach===0));assert.ok(b.agents.some(x=>x.stomach>0.1));assert.equal(krillFoodAt(b,0,0),0);
});
test("digestion is independent of food input and does not reset at an edge",()=>{
  const a=createKrillFeeding(),b=createKrillFeeding();for(const m of [a,b])m.agents.forEach(x=>{x.stomach=0.8;});
  run(a,{food_amount:0,digestion_rate:0},3);run(b,{food_amount:0,digestion_rate:2},3);
  assert.ok(a.agents.every(x=>x.stomach===0.8));assert.ok(b.agents.every(x=>x.stomach<0.4));
  assert.ok(b.agents[0].speed>a.agents[0].speed);
});
test("speed control stops and resumes without resetting coordinates",()=>{
  const m=createKrillFeeding();run(m,{swim_speed:0},3);const old=m.agents.map(a=>({x:a.x,y:a.y,heading:a.heading}));run(m,{swim_speed:0},4);
  assert.deepEqual(m.agents.map(a=>({x:a.x,y:a.y,heading:a.heading})),old);run(m,{swim_speed:1},1);assert.ok(m.agents.every(a=>a.speed>0));
});
test("all control extremes maintain finite state and smooth bounded swimming",()=>{
  for(const aspect of [0.6,2.5])for(const food_amount of [0,100]){
    const m=createKrillFeeding(aspect);for(let i=0;i<7200;i++){
      const old=m.agents.map(a=>({...a}));advanceKrillFeeding(m,{swim_speed:2,food_amount,digestion_rate:2},1/60);
      m.agents.forEach((a,j)=>{assert.ok(a.x>1.2&&a.x<m.width-1.2&&a.y>1.2&&a.y<m.height-1.2);assert.ok(Math.hypot(a.x-old[j].x,a.y-old[j].y)<=0.081*BOOK_MOVEMENT_SCALE);assert.ok(Math.abs(a.heading-old[j].heading)<=0.031);assert.ok(a.stomach>=0&&a.stomach<=1);});
    }
  }
});
test("feeding and swimming do not depend on rendering frame rate",()=>{
  const a=createKrillFeeding(),b=createKrillFeeding();run(a,{},20,30);run(b,{},20,120);assert.deepEqual(a.agents,b.agents);
});

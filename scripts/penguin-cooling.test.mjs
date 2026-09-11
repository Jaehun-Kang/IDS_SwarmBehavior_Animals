import test from "node:test";
import assert from "node:assert/strict";
import { createPenguinCooling, advancePenguinHuddle } from "../src/components/bookPreviews/penguinHuddleModel.js";
function run(controls,seconds=30,fps=60,aspect=1.5) {
  const m=createPenguinCooling(aspect);
  for(let i=0;i<seconds*fps;i++)advancePenguinHuddle(m,controls,1/fps);
  return m;
}
test("more accumulated heat causes earlier loosening",()=>{
  const cold=run({heat_gain:20},5),warm=run({heat_gain:100},5);
  assert.ok(warm.agents.filter(a=>a.loose).length>cold.agents.filter(a=>a.loose).length);
});
test("cooling rate changes return timing",()=>{
  const fast=run({cooling_rate:3}),slow=run({cooling_rate:0.5});
  assert.ok(fast.agents.reduce((s,a)=>s+a.transitions,0)>slow.agents.reduce((s,a)=>s+a.transitions,0));
});
test("loose spacing affects actual positions",()=>{
  const a=run({loose_spacing:2,cooling_rate:0.5},12),b=run({loose_spacing:3.5,cooling_rate:0.5},12);
  const radius=m=>m.agents.reduce((s,a)=>s+Math.hypot(a.x-m.width/2,a.y-m.height/2),0);
  assert.ok(radius(b)>radius(a));
});
test("cycles stay finite and inside frame across control extremes",()=>{
  for(const aspect of [0.6,2.5])for(const heat_gain of [20,100]){
    const m=run({heat_gain,loose_spacing:3.5,cooling_rate:0.5},120,30,aspect);
    assert.ok(m.agents.every(a=>a.transitions>=2));
    for(const a of m.agents){assert.ok(a.warmth>=0&&a.warmth<=1);assert.ok(a.x>1&&a.x<m.width-1&&a.y>1&&a.y<m.height-1);}
  }
});
test("fixed-step cooling agrees at different frame rates",()=>{
  const a=run({},20,30),b=run({},20,120);
  a.agents.forEach((p,i)=>assert.ok(Math.hypot(p.x-b.agents[i].x,p.y-b.agents[i].y)<1e-8));
});

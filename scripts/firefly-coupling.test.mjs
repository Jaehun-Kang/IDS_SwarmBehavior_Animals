import test from "node:test";
import assert from "node:assert/strict";
import {createFireflyCoupling,advanceFireflyCoupling,fireflyCanSee} from "../src/components/bookPreviews/fireflyCouplingModel.js";
test("range and intervening leaves independently limit visibility",()=>{
  const m=createFireflyCoupling(2),a=m.agents[12],b=m.agents[17];
  assert.equal(fireflyCanSee(m,a,b,{sight_range:100,occlusion:0}),true);
  assert.equal(fireflyCanSee(m,a,b,{sight_range:5,occlusion:0}),false);
  assert.equal(fireflyCanSee(m,a,b,{sight_range:100,occlusion:100}),false);
  assert.equal(fireflyCanSee(m,a,m.agents[13],{sight_range:100,occlusion:100}),true);
});
test("visible onset advances a ready neighbor but zero coupling does not",()=>{
  for(const strength of [0,100]){
    const m=createFireflyCoupling(2);m.agents[0].onset=true;m.agents[1].wait=2;
    advanceFireflyCoupling(m,{coupling:strength,sight_range:100,occlusion:0},1/60);
    assert.equal(m.agents[1].burst,strength===100);
  }
});
test("blocked onset and refractory rest prevent forced simultaneous flashing",()=>{
  const m=createFireflyCoupling(2),a=m.agents[12],b=m.agents[17];
  a.onset=true;b.wait=2;
  advanceFireflyCoupling(m,{coupling:100,sight_range:100,occlusion:100},1/60);
  assert.equal(b.burst,false);
  a.onset=true;b.wait=b.rest;
  advanceFireflyCoupling(m,{coupling:100,sight_range:100,occlusion:0},1/60);
  assert.equal(b.burst,false);
});
test("zero sight makes coupling irrelevant and fixed stepping is frame-rate independent",()=>{
  const models=[createFireflyCoupling(2),createFireflyCoupling(2),createFireflyCoupling(2)];
  models.forEach((m,j)=>{const fps=j===2?120:30;for(let i=0;i<fps*20;i++)advanceFireflyCoupling(m,{sight_range:0,coupling:j?100:0},1/fps);});
  models[0].agents.forEach((a,i)=>models.slice(1).forEach(m=>{
    assert.equal(a.bursts,m.agents[i].bursts);assert.ok(Math.abs(a.wait-m.agents[i].wait)<1e-8);
  }));
});
test("long runs at control extremes remain bounded with finite light and repeated bursts",()=>{
  for(const aspect of [0.6,2.5])for(const strength of [0,100]){
    const m=createFireflyCoupling(aspect);
    for(let i=0;i<3600;i++)advanceFireflyCoupling(m,{sight_range:100,coupling:strength,occlusion:strength},1/60);
    for(const a of m.agents){assert.ok(a.x>0&&a.x<m.width&&a.y>0&&a.y<m.height);assert.ok(a.light>=0&&a.light<=1);assert.ok(a.bursts>3);}
  }
});

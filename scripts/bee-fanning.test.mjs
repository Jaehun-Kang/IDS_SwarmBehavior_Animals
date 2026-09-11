import test from "node:test";
import assert from "node:assert/strict";
import {createBeeFanning,advanceBeeFanning} from "../src/components/bookPreviews/beeFanningModel.js";
function run(c,seconds=30,fps=60,aspect=1){const m=createBeeFanning(aspect);for(let i=0;i<seconds*fps;i++)advanceBeeFanning(m,c,1/fps);return m;}
test("heat recruits stationary fanners, cold leaves them resting",()=>{
  const cold=run({heat_load:0}),hot=run({heat_load:100,cooling_effect:0});
  assert.equal(cold.agents.filter(a=>a.fanning).length,0);
  assert.equal(hot.agents.filter(a=>a.fanning).length,12);
  assert.deepEqual(hot.agents.map(a=>[a.x,a.y]),createBeeFanning(1).agents.map(a=>[a.x,a.y]));
});
test("response variation spreads recruitment rather than broadcasting one state",()=>{
  const c={heat_load:45,cooling_effect:0};
  const same=run({...c,response_difference:0}),varied=run({...c,response_difference:100});
  assert.equal(same.agents.filter(a=>a.fanning).length,12);
  const n=varied.agents.filter(a=>a.fanning).length;assert.ok(n>0&&n<12);
});
test("cooling causes rests and renewed participation",()=>{
  const weak=run({cooling_effect:0},120),strong=run({cooling_effect:100},120);
  assert.ok(strong.agents.reduce((s,a)=>s+a.starts,0)>weak.agents.reduce((s,a)=>s+a.starts,0));
  assert.ok(strong.agents.reduce((s,a)=>s+a.heat,0)<weak.agents.reduce((s,a)=>s+a.heat,0));
});
test("frame rates agree",()=>{
  const a=run({},30,30),b=run({},30,120);
  for(let i=0;i<12;i++){assert.ok(Math.abs(a.agents[i].heat-b.agents[i].heat)<1e-9);assert.equal(a.agents[i].starts,b.agents[i].starts);}
});
test("extremes stay bounded and cooling to zero load stops all",()=>{
  for(const aspect of [0.6,2.5])for(const heat_load of [0,100]){
    const m=run({heat_load},120,60,aspect);
    for(const a of m.agents)assert.ok(Number.isFinite(a.heat)&&a.heat>=0&&a.heat<=1&&a.x>0&&a.x<m.width&&a.y>0&&a.y<m.height);
    for(let i=0;i<1200;i++)advanceBeeFanning(m,{heat_load:0},1/60);
    assert.ok(m.agents.every(a=>!a.fanning));
  }
});

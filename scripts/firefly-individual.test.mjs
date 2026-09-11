import test from "node:test";
import assert from "node:assert/strict";
import {createFireflyIndividual,advanceFireflyIndividual} from "../src/components/bookPreviews/fireflyIndividualModel.js";
function run(c,seconds=30,fps=60,aspect=1){const m=createFireflyIndividual(aspect);for(let i=0;i<seconds*fps;i++)advanceFireflyIndividual(m,c,1/fps);return m;}
test("one burst has six short pulses separated by darkness",()=>{
 const m=createFireflyIndividual(1),starts=[];let on=false;
 for(let i=0;i<250;i++){advanceFireflyIndividual(m,{},1/60);const next=m.agents[0].light>0.01;if(next&&!on)starts.push(m.time);on=next;}
 assert.equal(starts.length,6);for(let i=1;i<starts.length;i++)assert.ok(Math.abs(starts[i]-starts[i-1]-0.55)<0.02);
 assert.equal(m.agents[0].burst,false);
});
test("interval and waiting variation have independent effects",()=>{
 const fast=run({flash_interval:0.4,wait_spread:0}),slow=run({flash_interval:0.7,wait_spread:0});
 assert.ok(fast.agents[0].bursts>slow.agents[0].bursts);
 assert.equal(fast.agents[0].lastWait,4);
 const varied=run({wait_spread:20});assert.ok(varied.agents.some(a=>a.lastWait>4));
 assert.ok(new Set(varied.agents.map(a=>a.lastWait)).size>1);
});
test("flight does not force light and landing does not reset flashes",()=>{
 const rest=run({flying_ratio:0}),fly=run({flying_ratio:100});
 assert.ok(rest.agents.every(a=>a.flight===0));assert.ok(fly.agents.every(a=>a.flight===1));
 assert.deepEqual(rest.agents.map(a=>[a.bursts,a.elapsed,a.wait]),fly.agents.map(a=>[a.bursts,a.elapsed,a.wait]));
});
test("fps independence",()=>{
 const a=run({},30,30),b=run({},30,120);for(let i=0;i<6;i++)assert.ok(Math.hypot(a.agents[i].x-b.agents[i].x,a.agents[i].y-b.agents[i].y)<1e-9);
});
test("flight changes remain continuous and bounded",()=>{
 for(const aspect of [0.6,2.5]){
  const m=createFireflyIndividual(aspect);
  for(let i=0;i<3600;i++){const old=m.agents.map(a=>({...a}));advanceFireflyIndividual(m,{flying_ratio:Math.floor(i/300)%2?100:0},1/60);
   for(const a of m.agents){assert.ok(a.x>0&&a.x<m.width&&a.y>0&&a.y<m.height);assert.ok(Math.hypot(a.x-old[a.id].x,a.y-old[a.id].y)<0.08);}
  }
 }
});

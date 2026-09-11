import test from "node:test";
import assert from "node:assert/strict";
import { createPenguinWave, advancePenguinWave, penguinWavePose } from "../src/components/bookPreviews/penguinWaveModel.js";
function untilDone(controls) {
  const m=createPenguinWave(1.5);
  for(let i=0;i<3000;i++) {
    advancePenguinWave(m,controls,1/60);
    if(m.cycle && !m.active)return m;
  }
  throw new Error("wave did not finish");
}
test("one starter propagates through local neighbors and stops",()=>{
  const m=createPenguinWave(1.5);
  for(let i=0;i<31;i++)advancePenguinWave(m,{},1/60);
  assert.equal(m.agents.filter(a=>a.started).length,1);
  const end=untilDone({});
  assert.ok(end.agents.every(a=>a.progress===1 && a.speed===0));
  const x=end.agents.map(a=>a.x);
  for(let i=0;i<60;i++)advancePenguinWave(end,{},1/60);
  assert.deepEqual(end.agents.map(a=>a.x),x);
});
test("threshold changes propagation time independently of final step",()=>{
  const fast=untilDone({reaction_gap:1}), slow=untilDone({reaction_gap:4});
  assert.ok(fast.time<slow.time);
  assert.ok(Math.abs(fast.agents[0].distance-slow.agents[0].distance)<1e-9);
});
test("stride controls final displacement",()=>{
  assert.ok(Math.abs(untilDone({step_length:10}).agents[0].distance / untilDone({step_length:5}).agents[0].distance-2)<1e-9);
});
test("rest interval controls next start",()=>{
  const a=untilDone({}),b=untilDone({});
  for(let i=0;i<180;i++){advancePenguinWave(a,{pause_duration:2},1/60);advancePenguinWave(b,{pause_duration:12},1/60);}
  assert.equal(a.cycle,2);assert.equal(b.cycle,1);
});
test("frame rates agree and tracking view retains long-run bounds",()=>{
  for(const aspect of [0.6,2.5]){
    const a=createPenguinWave(aspect),b=createPenguinWave(aspect);
    for(let i=0;i<3600;i++)advancePenguinWave(a,{},1/30);
    for(let i=0;i<14400;i++)advancePenguinWave(b,{},1/120);
    a.agents.forEach((p,i)=>{
      assert.ok(Math.abs(p.x-b.agents[i].x)<1e-7);
      const pose=penguinWavePose(a,i);
      assert.ok(pose.x>1 && pose.x<a.width-1 && pose.y>1 && pose.y<a.height-1);
    });
  }
});

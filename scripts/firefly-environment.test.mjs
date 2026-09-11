import test from "node:test";
import assert from "node:assert/strict";
import {createFireflyEnvironment,advanceFireflyEnvironment} from "../src/components/bookPreviews/fireflyEnvironmentModel.js";
const run=(m,c,s,fps=60)=>{let sum=0;for(let i=0;i<s*fps;i++){advanceFireflyEnvironment(m,c,1/fps);sum+=m.agents.reduce((n,a)=>n+a.light,0);}return sum;};
test("lighting reduces courtship participation without resetting clocks",()=>{
  const a=createFireflyEnvironment(2),b=createFireflyEnvironment(2);
  assert.ok(run(a,{artificial_light:0},20)>0);assert.equal(run(b,{artificial_light:100},20),0);
  a.agents.forEach((agent,i)=>assert.equal(agent.clock,b.agents[i].clock));
});
test("distress pulses are 1.5 to 3 seconds apart and stay local",()=>{
  const m=createFireflyEnvironment(2),times=[];let previous=false;
  for(let i=0;i<600;i++){
    advanceFireflyEnvironment(m,{disturbed_share:50},1/60);const on=m.agents[0].light>0;
    if(on&&!previous)times.push(m.time);previous=on;
  }
  assert.equal(m.agents.filter(a=>a.trapped).length,6);
  assert.ok(Math.abs(times[2]-times[1]-1.5)<0.04);
});
test("release preserves distinct clocks, waits individually, then resumes",()=>{
  const m=createFireflyEnvironment(2);run(m,{disturbed_share:100},4);
  advanceFireflyEnvironment(m,{disturbed_share:0,recovery_time:3},1/60);
  assert.ok(m.agents.every(a=>a.recovery>0&&a.light===0));
  assert.ok(new Set(m.agents.map(a=>a.recovery)).size>1);
  assert.ok(run(m,{disturbed_share:0,recovery_time:3},15)>0);
});
test("recovery slider changes waiting duration only",()=>{
  const models=[createFireflyEnvironment(2),createFireflyEnvironment(2)];
  models.forEach((m,i)=>{run(m,{disturbed_share:100},1);run(m,{disturbed_share:0,recovery_time:i?8:1},1);});
  assert.ok(models[0].agents[0].recovery===0);assert.ok(models[1].agents[0].recovery>5);
  assert.equal(models[0].agents[0].clock,models[1].agents[0].clock);
});
test("fixed stepping and bounds hold at both aspect ratios",()=>{
  for(const aspect of [0.6,2.5]){
    const a=createFireflyEnvironment(aspect),b=createFireflyEnvironment(aspect);run(a,{},20,30);run(b,{},20,120);
    a.agents.forEach((agent,i)=>{assert.ok(Math.abs(agent.light-b.agents[i].light)<1e-8);assert.ok(agent.x>0&&agent.x<a.width&&agent.y>0&&agent.y<a.height);});
  }
});

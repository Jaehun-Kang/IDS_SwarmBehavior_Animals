import { BOOK_MOVEMENT_SCALE } from "../src/components/bookPreviews/bookMotion.js";
import test from 'node:test';
import assert from 'node:assert/strict';
import {createSheepThreat,advanceSheepThreat,sheepThreatCue} from '../src/components/bookPreviews/sheepThreatModel.js';
test('dog cue is local and absent without a pointer',()=>{
  assert.equal(sheepThreatCue({x:0,y:0},null),0);
  assert.equal(sheepThreatCue({x:0,y:0},{x:9,y:0}),0);
  assert.ok(sheepThreatCue({x:0,y:0},{x:1,y:0})>sheepThreatCue({x:0,y:0},{x:5,y:0}));
});
test('alarm decreases continuously after removal with independent recovery time',()=>{
  const models=[1,8].map(recovery_time=>{
    const m=createSheepThreat();for(const a of m.agents)a.alarm=1;
    for(let i=0;i<180;i++)advanceSheepThreat(m,{recovery_time},1/60);
    return m;
  });
  assert.ok(models[0].agents[0].alarm<models[1].agents[0].alarm);
  assert.ok(models[1].agents[0].alarm<1);
});
test('prolonged moving threats stay finite and within the canvas without jumps',()=>{
  for(const aspect of [0.5,1,2]){
    const m=createSheepThreat(aspect);
    for(let i=0;i<14400;i++){
      const old=m.agents.map(a=>({...a}));
      const pointer={x:0.5+0.45*Math.sin(i/800),y:0.5+0.45*Math.cos(i/900)};
      advanceSheepThreat(m,{dog_response:100,group_response:100,recovery_time:8},1/60,pointer);
      m.agents.forEach((a,j)=>{
        assert.ok(Number.isFinite(a.heading)&&a.x>0.6&&a.x<m.width-0.6&&a.y>0.6&&a.y<m.height-0.6);
        assert.ok(Math.hypot(a.x-old[j].x,a.y-old[j].y)<0.03*BOOK_MOVEMENT_SCALE);
      });
    }
  }
});
test('dog and grouping controls affect distinct responses and are frame independent',()=>{
  const simulate=(controls,hz=60)=>{
    const m=createSheepThreat();
    for(let i=0;i<10*hz;i++)advanceSheepThreat(m,controls,1/hz,{x:0.3,y:0.5});
    return m;
  };
  const off=simulate({dog_response:0}),on=simulate({dog_response:100,group_response:0});
  assert.equal(off.agents[0].alarm,0);assert.ok(on.agents.some(a=>a.alarm>0));
  const group=simulate({dog_response:100,group_response:100});
  assert.ok(group.agents.some((a,i)=>Math.hypot(a.x-on.agents[i].x,a.y-on.agents[i].y)>0.01));
  const other=simulate({dog_response:100,group_response:100},120);
  group.agents.forEach((a,i)=>assert.ok(Math.hypot(a.x-other.agents[i].x,a.y-other.agents[i].y)<1e-8));
});

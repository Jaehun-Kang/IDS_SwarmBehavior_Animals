import { BOOK_MOVEMENT_SCALE } from "../src/components/bookPreviews/bookMotion.js";
import test from 'node:test';
import assert from 'node:assert/strict';
import {createSheepLeaders,advanceSheepLeaders} from '../src/components/bookPreviews/sheepLeaderModel.js';
test('bindings persist during a movement and change only after a pause',()=>{
  const m=createSheepLeaders(); const ids=m.agents.map(a=>a.leaderId);
  for(let i=0;i<300;i++)advanceSheepLeaders(m,{},1/60);
  assert.deepEqual(m.agents.map(a=>a.leaderId),ids);
  for(let i=0;i<1200;i++)advanceSheepLeaders(m,{},1/60);
  assert.equal(m.episode,1);assert.equal(m.agents.filter(a=>a.leaderId===null).length,1);
  for(const a of m.agents){const seen=new Set();let x=a;
    while(x){assert.ok(!seen.has(x.id));seen.add(x.id);x=m.agents.find(b=>b.id===x.leaderId);}}
});
test('leader model has no position jumps and stays within margins across episodes',()=>{
  for(const aspect of [0.5,1,2]){const m=createSheepLeaders(aspect);
    for(let i=0;i<14400;i++){
      const old=m.agents.map(a=>({...a}));
      advanceSheepLeaders(m,{episode_duration:5,following_response:100,leader_speed:1.5},1/60);
      m.agents.forEach((a,j)=>{
        assert.ok(Number.isFinite(a.heading));assert.ok(a.x>1&&a.x<m.width-1&&a.y>1&&a.y<m.height-1);
        assert.ok(Math.hypot(a.x-old[j].x,a.y-old[j].y)<0.04*BOOK_MOVEMENT_SCALE);
      });
    }
  }
});
test('leader motion is frame independent',()=>{
  const a=createSheepLeaders(),b=createSheepLeaders();
  for(let i=0;i<1800;i++)advanceSheepLeaders(a,{},1/30);
  for(let i=0;i<7200;i++)advanceSheepLeaders(b,{},1/120);
  a.agents.forEach((x,i)=>assert.ok(Math.hypot(x.x-b.agents[i].x,x.y-b.agents[i].y)<1e-8));
});

import test from "node:test";
import assert from "node:assert/strict";
import {createLobsterQueue,advanceLobsterQueue,lobsterQueuePoint} from "../src/components/bookPreviews/lobsterQueueModel.js";
const run=(m,c,s,fps=60)=>{for(let i=0;i<s*fps;i++)advanceLobsterQueue(m,c,1/fps);};
test("chain bindings persist and every follower stays on the curved spatial route",()=>{
  const m=createLobsterQueue(2);run(m,{},50);
  m.agents.forEach((a,i)=>{assert.equal(a.leaderId,i?i-1:null);const p=lobsterQueuePoint(m.path,a.s);assert.ok(Math.hypot(p.x-a.x,p.y-a.y)<1e-8);});
});
test("gap and recovery response affect separation without changing leader speed",()=>{
  const a=createLobsterQueue(2),b=createLobsterQueue(2),c=createLobsterQueue(2);
  run(a,{queue_gap:1.3,follow_response:0.5},3);run(b,{queue_gap:1.3,follow_response:2},3);run(c,{queue_gap:0.8},3);
  assert.equal(a.agents[0].s,b.agents[0].s);
  assert.ok(b.agents[0].s-b.agents[1].s>a.agents[0].s-a.agents[1].s);
  assert.ok(c.agents[0].s-c.agents[1].s<3);
});
test("gap steps never reorder agents, teleport, or escape the canvas",()=>{
  for(const aspect of [0.6,2.5]){
    const m=createLobsterQueue(aspect);
    for(let i=0;i<6000;i++){
      const old=m.agents.map(a=>({...a}));advanceLobsterQueue(m,{queue_speed:2,queue_gap:i%1200<600?0.8:1.3,follow_response:2},1/60);
      m.agents.forEach((a,j)=>{assert.ok(Math.hypot(a.x-old[j].x,a.y-old[j].y)<0.14);assert.ok(a.x>1.5&&a.x<m.width-1.5&&a.y>1.5&&a.y<m.height-1.5);if(j)assert.ok(m.agents[j-1].s-a.s>=2.1-1e-8);});
    }
  }
});
test("zero speed comes to rest and resumes without position reset",()=>{
  const m=createLobsterQueue(2);run(m,{queue_speed:0},3);const old=m.agents.map(a=>a.s);run(m,{queue_speed:0},4);
  assert.deepEqual(m.agents.map(a=>a.s),old);run(m,{queue_speed:1},2);assert.ok(m.agents[0].s>old[0]);
});
test("render frame rate does not change spatial following",()=>{
  const a=createLobsterQueue(2),b=createLobsterQueue(2);run(a,{},30,30);run(b,{},30,120);
  a.agents.forEach((agent,i)=>assert.ok(Math.abs(agent.s-b.agents[i].s)<1e-8));
});

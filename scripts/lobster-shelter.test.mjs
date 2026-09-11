import test from "node:test";
import assert from "node:assert/strict";
import {createLobsterShelter,advanceLobsterShelter} from "../src/components/bookPreviews/lobsterShelterModel.js";
const run=(m,c,s,fps=60)=>{for(let i=0;i<s*fps;i++)advanceLobsterShelter(m,c,1/fps);};
test("bright conditions stay sheltered; darkness releases agents at individual times",()=>{
  const m=createLobsterShelter(2);run(m,{light_level:100},10);assert.ok(m.agents.every(a=>a.state==="sheltered"));
  run(m,{light_level:0},1);assert.ok(m.agents.some(a=>a.state==="foraging"));assert.ok(m.agents.some(a=>a.state==="waiting"));
  run(m,{light_level:0},10);assert.ok(m.agents.every(a=>a.state==="foraging"));
});
test("dawn returns remembered and unfamiliar agents without migration targets",()=>{
  for(const memory of [0,100]){
    const m=createLobsterShelter(2);run(m,{light_level:0,explore_range:100},20);
    run(m,{light_level:100,home_memory:memory,explore_range:100},100);
    assert.ok(m.agents.every(a=>a.state==="sheltered"),`memory ${memory}`);
  }
});
test("range changes exploration extent independently of participation",()=>{
  const extents=[30,100].map(range=>{
    const m=createLobsterShelter(2);let max=0;
    for(let i=0;i<2400;i++){advanceLobsterShelter(m,{light_level:0,explore_range:range},1/60);max=Math.max(max,...m.agents.map(a=>Math.abs(a.x-m.width/2)));}
    assert.ok(m.agents.every(a=>a.state==="foraging"));return max;
  });
  assert.ok(extents[1]>extents[0]*1.5);
});
test("stage edits keep continuous turning and movement in the canvas",()=>{
  for(const aspect of [0.6,2.5]){
    const m=createLobsterShelter(aspect);
    for(let i=0;i<6000;i++){
      const old=m.agents.map(a=>({...a}));advanceLobsterShelter(m,{light_level:i%2000<1000?0:100,home_memory:0,explore_range:100},1/60);
      m.agents.forEach((a,j)=>{assert.ok(Math.hypot(a.x-old[j].x,a.y-old[j].y)<0.04);assert.ok(a.x>1.5&&a.x<m.width-1.5&&a.y>1.5&&a.y<m.height-1.5);});
    }
  }
});
test("fixed stepping matches 30 and 120 fps",()=>{
  const a=createLobsterShelter(2),b=createLobsterShelter(2);run(a,{light_level:0},30,30);run(b,{light_level:0},30,120);
  a.agents.forEach((agent,i)=>assert.ok(Math.abs(agent.x-b.agents[i].x)<1e-8));
});

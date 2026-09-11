import test from "node:test";
import assert from "node:assert/strict";
import {createLobsterDefense,advanceLobsterDefense} from "../src/components/bookPreviews/lobsterDefenseModel.js";
const run=(m,c,s,fps=60)=>{for(let i=0;i<s*fps;i++)advanceLobsterDefense(m,c,1/fps);};
test("sheltered animals stay inside rather than joining the open-ground defense",()=>{
  const m=createLobsterDefense();run(m,{den_threat:100},20);assert.equal(m.agents[0].state,"sheltered");assert.deepEqual({x:m.agents[0].x,y:m.agents[0].y},m.dens[0]);
});
test("three threat inputs affect only their corresponding comparison",()=>{
  const a=createLobsterDefense(),b=createLobsterDefense();run(a,{near_threat:0},15);run(b,{near_threat:100},15);
  assert.equal(a.agents[1].state,"resting");assert.equal(b.agents[1].state,"retreat");
  assert.ok(Math.hypot(b.agents[1].x-b.dens[1].x,b.agents[1].y-b.dens[1].y)<0.1);
  assert.deepEqual(a.agents.slice(2),b.agents.slice(2));
});
test("open group faces outward after assembly and disperses when threat is released",()=>{
  const m=createLobsterDefense();run(m,{open_threat:100},20);
  for(const a of m.agents.slice(2)){assert.equal(a.state,"rosette");assert.ok(Math.abs(Math.atan2(Math.sin(a.heading-a.angle),Math.cos(a.heading-a.angle)))<0.01);}
  run(m,{open_threat:0},20);assert.ok(m.agents.slice(2).every(a=>a.state==="resting"&&!a.moving));
});
test("changes preserve bounded motion and gradual orientation at desktop and mobile aspect ratios",()=>{
  for(const aspect of [0.6,2.5]){const m=createLobsterDefense(aspect);for(let i=0;i<3600;i++){
    const old=m.agents.map(a=>({...a}));advanceLobsterDefense(m,{near_threat:i%1200<600?0:100,open_threat:i%1200<600?0:100},1/60);
    m.agents.forEach((a,j)=>{assert.ok(Math.hypot(a.x-old[j].x,a.y-old[j].y)<0.05);assert.ok(Math.abs(a.heading-old[j].heading)<0.038);assert.ok(a.x>1.5&&a.x<m.width-1.5&&a.y>1.5&&a.y<m.height-1.5);});
  }}
});
test("all comparisons settle, resume, and remain independent of rendering frame rate",()=>{
  const a=createLobsterDefense(),b=createLobsterDefense();run(a,{},25,30);run(b,{},25,120);
  assert.deepEqual(a.agents,b.agents);assert.ok(a.agents.every(x=>!x.moving));assert.equal(a.threatMoving,false);
  run(a,{open_threat:0},0.5);assert.ok(a.agents.some(x=>x.moving));
});

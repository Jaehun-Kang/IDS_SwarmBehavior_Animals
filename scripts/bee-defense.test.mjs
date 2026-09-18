import { BOOK_MOVEMENT_SCALE } from "../src/components/bookPreviews/bookMotion.js";
import test from "node:test";
import assert from "node:assert/strict";
import {createBeeDefense,advanceBeeDefense} from "../src/components/bookPreviews/beeDefenseModel.js";
function advance(m,c,seconds,fps=60){for(let i=0;i<seconds*fps;i++)advanceBeeDefense(m,c,1/fps);return m;}
test("far threat leaves guards, nearby threat recruits and surrounds",()=>{
  const far=advance(createBeeDefense(1),{threat_distance:100},20);
  assert.ok(far.agents.every(a=>a.state==="guarding"));
  const close=advance(createBeeDefense(1),{threat_distance:0},20);
  assert.ok(close.agents.every(a=>a.state==="surrounding"));
  assert.ok(close.agents.every(a=>Math.hypot(a.x-close.threat.x,a.y-close.threat.y)<2));
});
test("alert radius changes local responders",()=>{
  const a=advance(createBeeDefense(1),{threat_distance:40,alert_range:4},10);
  const b=advance(createBeeDefense(1),{threat_distance:40,alert_range:10},10);
  assert.ok(b.agents.filter(a=>a.state==="warning").length>a.agents.filter(a=>a.state==="warning").length);
});
test("recovery control changes return to rest, without deletion",()=>{
  const a=advance(createBeeDefense(1),{threat_distance:0},10),b=structuredClone(a);
  advance(a,{threat_distance:100,recovery_time:1},9);
  advance(b,{threat_distance:100,recovery_time:8},9);
  assert.ok(a.agents.every(a=>a.state==="guarding"));
  assert.ok(b.agents.some(a=>a.state==="recovering"));
  advance(b,{threat_distance:100},30);assert.equal(b.agents.length,18);assert.ok(!b.moving);
});
test("frame rates agree",()=>{
  const a=advance(createBeeDefense(1),{threat_distance:0},20,30),b=advance(createBeeDefense(1),{threat_distance:0},20,120);
  for(let i=0;i<18;i++){assert.ok(Math.hypot(a.agents[i].x-b.agents[i].x,a.agents[i].y-b.agents[i].y)<1e-9);}
});
test("changing targets stays bounded without position jumps",()=>{
  for(const aspect of [0.6,2.5]){
    const m=createBeeDefense(aspect);
    for(let i=0;i<7200;i++){
      const old=m.agents.map(a=>({...a}));advanceBeeDefense(m,{threat_distance:Math.floor(i/600)%2?100:0,alert_range:10},1/60);
      for(const a of m.agents){assert.ok(a.x>0&&a.x<m.width&&a.y>0&&a.y<m.height);assert.ok(Math.hypot(a.x-old[a.id].x,a.y-old[a.id].y)<=3*BOOK_MOVEMENT_SCALE/60+1e-9);}
    }
  }
});

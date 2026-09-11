import test from "node:test";
import assert from "node:assert/strict";
import {createLobsterWalking,advanceLobsterWalking} from "../src/components/bookPreviews/lobsterWalkingModel.js";
const run=(m,c,s,fps=60)=>{for(let i=0;i<s*fps;i++)advanceLobsterWalking(m,c,1/fps);};
test("speed changes distance while turn width changes path geometry",()=>{
  const a=createLobsterWalking(2),b=createLobsterWalking(2),c=createLobsterWalking(2);
  run(a,{walk_speed:0.5},20);run(b,{walk_speed:2},20);run(c,{walk_speed:0.5,turn_width:30},20);
  assert.ok(b.distance>a.distance*3);assert.ok(c.rx<a.rx);assert.equal(a.speed,c.speed);
});
test("zero speed stops walking and its animation distance until resumed",()=>{
  const m=createLobsterWalking(2);run(m,{walk_speed:0},3);const old={...m.agent},distance=m.distance;
  run(m,{walk_speed:0,turn_width:70},4);assert.deepEqual(m.agent,old);assert.equal(m.distance,distance);
  run(m,{walk_speed:1},2);assert.ok(m.distance>distance);
});
test("all control corners and edits preserve finite smooth contained poses",()=>{
  for(const aspect of [0.6,2.5])for(const speed of [0,2])for(const width of [30,70]){
    const m=createLobsterWalking(aspect);
    for(let i=0;i<3600;i++){
      const old={...m.agent};advanceLobsterWalking(m,{walk_speed:speed,turn_width:width},1/60);
      assert.ok(Math.hypot(m.agent.x-old.x,m.agent.y-old.y)<0.11);
      const angle=Math.atan2(Math.sin(m.agent.heading-old.heading),Math.cos(m.agent.heading-old.heading));assert.ok(Math.abs(angle)<=2/60+1e-9);
      assert.ok(m.agent.x>2.5&&m.agent.x<m.width-2.5&&m.agent.y>2.5&&m.agent.y<m.height-2.5);
    }
  }
});
test("fixed stepping is independent of render frequency",()=>{
  const a=createLobsterWalking(2),b=createLobsterWalking(2);run(a,{},40,30);run(b,{},40,120);
  assert.ok(Math.abs(a.agent.x-b.agent.x)<1e-8);assert.ok(Math.abs(a.agent.heading-b.agent.heading)<1e-8);
});

import test from "node:test";
import assert from "node:assert/strict";
import {createBeeDance,advanceBeeDance,beeWaggleDuration} from "../src/components/bookPreviews/beeDanceModel.js";
function run(c,seconds=30,fps=60,aspect=1.5){const m=createBeeDance(aspect);for(let i=0;i<seconds*fps;i++)advanceBeeDance(m,c,1/fps);return m;}
test("relative distance changes waggle duration and cycle frequency",()=>{
 assert.ok(beeWaggleDuration({food_distance:100})>beeWaggleDuration({food_distance:0}));
 assert.ok(run({food_distance:0}).cycles>run({food_distance:100}).cycles);
});
test("direction is clockwise from vertical and changes continuously",()=>{
 const m=createBeeDance(1.5);
 for(let i=0;i<300;i++)advanceBeeDance(m,{food_direction:90},1/60);
 assert.ok(Math.abs(m.angle-Math.PI/2)<1e-8);
 const old=m.agents[0].x;advanceBeeDance(m,{food_direction:-90},1/60);
 assert.ok(Math.abs(m.agents[0].x-old)<0.2);
});
test("distant bees do not acquire global knowledge",()=>{
 const m=createBeeDance(1.5);m.agents[1].x=1000;
 for(let i=0;i<90;i++)advanceBeeDance(m,{listening_time:0.5},1/60);
 assert.equal(m.agents[1].knownAngle,null);assert.equal(m.agents[1].listened,0);
 assert.ok(m.agents.some(a=>a.knownAngle!==null));
});
test("longer observation delays departure",()=>{
 const short=run({listening_time:0.5},3),long=run({listening_time:4},3);
 assert.ok(short.agents.reduce((s,a)=>s+a.visits,0)>long.agents.reduce((s,a)=>s+a.visits,0));
});
test("long runs and render rates preserve finite interior trajectories",()=>{
 for(const aspect of [0.6,2.5]){
  const a=run({food_direction:180},90,30,aspect),b=run({food_direction:180},90,120,aspect);
  a.agents.forEach((p,i)=>{assert.ok(p.x>1&&p.x<a.width-1&&p.y>1&&p.y<a.height-1);assert.ok(Math.hypot(p.x-b.agents[i].x,p.y-b.agents[i].y)<1e-8);});
 }
});

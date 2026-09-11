import test from 'node:test';
import assert from 'node:assert/strict';
import {createKrillThreat,advanceKrillThreat} from '../src/components/bookPreviews/krillThreatModel.js';
const run=(m,c,s,fps=60)=>{for(let i=0;i<s*fps;i++)advanceKrillThreat(m,c,1/fps);};
test('light is display-only and cannot cause an alarm cascade',()=>{
 const a=createKrillThreat(),b=createKrillThreat();run(a,{glow_display:0},15);run(b,{glow_display:100},15);assert.deepEqual(a,b);
});
test('threat response is local and removed threat permits graded recovery',()=>{
 const m=createKrillThreat();m.predator.x=m.width/2;advanceKrillThreat(m,{predator_approach:100},1/30);
 const fears=m.agents.map(a=>a.fear);assert.ok(Math.max(...fears)>Math.min(...fears));
 const a=structuredClone(m),b=structuredClone(m);run(a,{predator_approach:0,recovery_delay:1},8);run(b,{predator_approach:0,recovery_delay:5},8);
 assert.ok(a.agents.reduce((s,x)=>s+x.fear,0)<b.agents.reduce((s,x)=>s+x.fear,0));
});
test('extreme threat does not throw agents out of frame or snap headings',()=>{
 for(const aspect of [0.6,2.5]){const m=createKrillThreat(aspect);for(let i=0;i<6000;i++){
  const old=m.agents.map(a=>a.heading);advanceKrillThreat(m,{predator_approach:100},1/60);
  for(const a of m.agents){assert.ok(a.x>0.3&&a.x<m.width-0.3&&a.y>0.3&&a.y<m.height-0.3);assert.ok(Math.abs(a.heading-old[a.id])<0.06);}
 }}
});
test('predator and agents use the same frame-rate-independent clock',()=>{
 const a=createKrillThreat(),b=createKrillThreat();run(a,{},20,30);run(b,{},20,120);assert.deepEqual(a,b);
});

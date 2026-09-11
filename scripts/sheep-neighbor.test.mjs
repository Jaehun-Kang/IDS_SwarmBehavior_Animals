import test from 'node:test';
import assert from 'node:assert/strict';
import { createSheepNeighbors, advanceSheepNeighbors, sheepNeighborRates } from '../src/components/bookPreviews/sheepNeighborModel.js';
test('start and stop respond to distinct local cues', () => {
  const a = {x:0,y:0,heading:0};
  const front = {x:2,y:0,moving:true}, back = {x:-2,y:0,moving:false};
  const base = sheepNeighborRates(a,[],{});
  assert.ok(sheepNeighborRates(a,[front],{}).start > base.start);
  assert.equal(sheepNeighborRates(a,[front],{}).stop,base.stop);
  assert.ok(sheepNeighborRates(a,[back],{}).stop > base.stop);
  assert.equal(sheepNeighborRates(a,[front,back],{start_influence:0}).start,base.start);
  assert.equal(sheepNeighborRates(a,[front,back],{stop_influence:0}).stop,base.stop);
});
test('synchronous sheep states are independent of rendering and array order', () => {
  const a=createSheepNeighbors(), b=createSheepNeighbors(); b.agents.reverse();
  for(let i=0;i<3600;i++) advanceSheepNeighbors(a,{},1/60);
  for(let i=0;i<7200;i++) advanceSheepNeighbors(b,{},1/120);
  for(const x of a.agents) { const y=b.agents.find(v=>v.id===x.id);
    assert.equal(x.moving,y.moving); assert.ok(Math.hypot(x.x-y.x,x.y-y.y)<1e-8); }
  assert.ok(a.starts>0 && a.stops>0);
});
test('local braking avoids overlap across prolonged extreme controls', () => {
  for(const aspect of [0.5,1,2]) {
    const m=createSheepNeighbors(aspect);
    for(let t=0;t<14400;t++) {
      advanceSheepNeighbors(m,{start_influence:100,stop_influence:100,personal_space:1},1/60);
      for(const a of m.agents) {
        assert.ok(Number.isFinite(a.x) && a.x>1 && a.x<m.width-1 && a.y>1 && a.y<m.height-1);
        for(const b of m.agents) if(a.id!==b.id) assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>0.65);
      }
    }
  }
});
test('larger spacing produces earlier braking independently of transition controls', () => {
  const totals = [1,3].map(personal_space => {
    const m=createSheepNeighbors();
    for(let i=0;i<7200;i++) advanceSheepNeighbors(m,{personal_space},1/60);
    return m.agents.reduce((sum,a)=>sum+a.distance,0);
  });
  assert.ok(totals[1] < totals[0]);
});

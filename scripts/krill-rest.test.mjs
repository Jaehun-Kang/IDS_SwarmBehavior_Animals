import test from 'node:test';
import assert from 'node:assert/strict';
import {createKrillRest,advanceKrillRest,krillRestVelocity} from '../src/components/bookPreviews/krillRestModel.js';
test('passive sinking, fullness and active swimming are independent comparisons',()=>{
 for(const [key,id] of [['sinking_rate',0],['fullness',1],['swimming_effort',2]])for(let i=0;i<3;i++){
  const a=krillRestVelocity(i,{[key]:0}),b=krillRestVelocity(i,{[key]:100});if(i===id)assert.notEqual(a,b);else assert.equal(a,b);
 }
 assert.ok(krillRestVelocity(0,{sinking_rate:100})>0);assert.ok(krillRestVelocity(2,{swimming_effort:100})<0);
});
test('no 75 percent state switch, digestion reset or boundary-triggered ascent',()=>{
 assert.ok(Math.abs(krillRestVelocity(1,{fullness:74})-krillRestVelocity(1,{fullness:76}))<0.05);
 const m=createKrillRest(),c={sinking_rate:100,fullness:100,swimming_effort:0};
 for(let i=0;i<18000;i++)advanceKrillRest(m,c,1/60);
 assert.deepEqual(c,{sinking_rate:100,fullness:100,swimming_effort:0});assert.ok(m.agents.every(a=>a.y>m.height-3.01&&!a.moving));
 const y=m.agents[2].y;for(let i=0;i<120;i++)advanceKrillRest(m,{...c,swimming_effort:100},1/60);assert.ok(m.agents[2].y<y-0.5);
});
test('extremes remain bounded and fixed step preserves results',()=>{
 for(const aspect of [0.7,1.3])for(const v of [0,100]){
  const a=createKrillRest(aspect),b=createKrillRest(aspect),c={sinking_rate:v,fullness:v,swimming_effort:v};
  for(let i=0;i<1800;i++)advanceKrillRest(a,c,1/30);for(let i=0;i<7200;i++)advanceKrillRest(b,c,1/120);
  for(let i=0;i<3;i++){assert.ok(a.agents[i].y>=3&&a.agents[i].y<=a.height-3);assert.ok(Math.abs(a.agents[i].y-b.agents[i].y)<1e-9);}
 }
});

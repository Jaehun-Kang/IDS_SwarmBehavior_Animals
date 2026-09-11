import test from 'node:test';
import assert from 'node:assert/strict';
import {createKrillLight,advanceKrillLight,krillLightTarget} from '../src/components/bookPreviews/krillLightModel.js';
test('three inputs affect only their own comparison row',()=>{
 const m=createKrillLight();
 for(const [key,row] of [['light_phase',0],['twilight_spacing',1],['night_group',2]]){
  for(let i=0;i<3;i++){
   const a=m.agents[i*10],p=krillLightTarget(m,a,{[key]:0}),q=krillLightTarget(m,a,{[key]:100});
   if(i===row)assert.notDeepEqual(p,q);else assert.deepEqual(p,q);
  }
 }
});
test('manual phase stays fixed and depth transition is continuous',()=>{
 const m=createKrillLight();for(let i=0;i<600;i++)advanceKrillLight(m,{light_phase:0},1/60);
 assert.equal(m.levels[0],0);const y=m.agents[0].y;
 advanceKrillLight(m,{light_phase:100},1/60);assert.ok(m.agents[0].y-y<0.1);
 for(let i=0;i<600;i++)advanceKrillLight(m,{light_phase:100},1/60);
 assert.ok(m.agents.slice(0,10).reduce((s,a)=>s+a.y,0)/10>m.height*0.26);
});
test('all extremes stay in frame and headings turn gradually',()=>{
 for(const aspect of [0.7,1.3])for(const value of [0,100]){
  const m=createKrillLight(aspect),c={light_phase:value,twilight_spacing:value,night_group:value};
  for(let i=0;i<3600;i++){
   advanceKrillLight(m,c,1/60);
   for(const a of m.agents){assert.ok(a.x>1&&a.x<m.width-1&&a.y>1&&a.y<m.height-1);assert.ok(Math.abs(a.heading-m.previous[a.id].heading)<=1.8/60+1e-9);}
  }
 }
});
test('comparison is frame-rate independent',()=>{
 const a=createKrillLight(),b=createKrillLight();for(let i=0;i<300;i++)advanceKrillLight(a,{},1/30);for(let i=0;i<1200;i++)advanceKrillLight(b,{},1/120);
 for(let i=0;i<30;i++){assert.ok(Math.abs(a.agents[i].x-b.agents[i].x)<1e-9);assert.ok(Math.abs(a.agents[i].y-b.agents[i].y)<1e-9);}
});

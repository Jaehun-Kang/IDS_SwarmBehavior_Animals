import test from 'node:test';
import assert from 'node:assert/strict';
import { createPenguinCold, advancePenguinCold, penguinColdResponse } from '../src/components/bookPreviews/penguinColdModel.js';
test('air temperature and wind independently increase the cold response',()=>{
  assert.ok(penguinColdResponse({air_temperature:-40},0)>penguinColdResponse({air_temperature:-5},0));
  assert.ok(penguinColdResponse({wind_speed:20},0)>penguinColdResponse({wind_speed:0},0));
});
test('variation changes individual responses without a shared hard switch',()=>{
  const values=Array.from({length:24},(_,i)=>penguinColdResponse({response_variation:100},i));
  assert.ok(Math.max(...values)-Math.min(...values)>.3);
  assert.equal(penguinColdResponse({response_variation:0},0),penguinColdResponse({response_variation:0},5));
});
test('render rates preserve positions and response changes remain continuous',()=>{
  const models=[30,60,120].map(fps=>{
    const m=createPenguinCold(1.2);
    for(let i=0;i<fps*8;i++)advancePenguinCold(m,{},1/fps);
    return m;
  });
  for(const m of models.slice(1))for(let i=0;i<24;i++)assert.ok(Math.abs(m.agents[i].x-models[0].agents[i].x)<1e-8);
});
test('control extremes stay finite and within margins',()=>{
  for(const aspect of [.5,1.5])for(const temperature of [-40,-5])for(const wind of [0,20]){
    const m=createPenguinCold(aspect);
    for(let i=0;i<3600;i++)advancePenguinCold(m,{air_temperature:temperature,wind_speed:wind,response_variation:100},1/60);
    for(const a of m.agents){assert.ok(a.x>1&&a.x<m.width-1&&a.y>1&&a.y<m.height-1);assert.ok(Number.isFinite(a.heading));}
  }
});
test('colder conditions reduce realized neighbor spacing',()=>{
  const spacing=temperature=>{
    const m=createPenguinCold(1.2);
    for(let i=0;i<3600;i++)advancePenguinCold(m,{air_temperature:temperature,wind_speed:8,response_variation:60},1/60);
    return m.agents.reduce((sum,a)=>sum+Math.min(...m.agents.filter(b=>b.id!==a.id).map(b=>Math.hypot(a.x-b.x,a.y-b.y))),0)/24;
  };
  assert.ok(spacing(-40)<spacing(-5));
});

import test from "node:test";
import assert from "node:assert/strict";
import {createLobsterDisease,advanceLobsterDisease,diseaseDenBlocked} from "../src/components/bookPreviews/lobsterDiseaseModel.js";
const run=(m,c,s,fps=60)=>{for(let i=0;i<s*fps;i++)advanceLobsterDisease(m,c,1/fps);};
test("latent infection remains sheltered before a detectable cue",()=>{
  const m=createLobsterDisease();run(m,{},4);assert.equal(m.field.max,0);assert.ok(m.agents.every(a=>!a.moving));assert.equal(diseaseDenBlocked(m),false);
  run(m,{},7);assert.ok(m.field.max>0);assert.ok(m.agents.filter(a=>a.id!==m.infectedId).every(a=>a.state==="seeking"));
});
test("reaction delay changes departure but not the infection clock or cue field",()=>{
  const a=createLobsterDisease(),b=createLobsterDisease();run(a,{avoidance_delay:0.2},7);run(b,{avoidance_delay:3},7);
  assert.equal(a.age,b.age);assert.deepEqual(a.field.layers,b.field.layers);assert.ok(a.agents.some(x=>x.state==="seeking"));assert.ok(b.agents.every(x=>x.state!=="seeking"));
});
test("removal stops emission and replacement starts strictly outside without fade",()=>{
  const m=createLobsterDisease();let entering;
  for(let i=0;i<1300;i++){advanceLobsterDisease(m,{},1/60);entering=m.agents.find(a=>a.id>=6);if(entering)break;}
  assert.ok(m.removed);assert.ok(m.field.max>0);assert.equal(m.field.sources[1].enabled,false);
  assert.ok(entering.x<0||entering.x>m.width||entering.y<0||entering.y>m.height);assert.equal(entering.state,"entering");assert.equal(entering.alpha,undefined);
  run(m,{disease_pace:0},35);assert.ok(m.agents.every(a=>!a.entering));
});
test("residual cue blocks reuse then fades and a resident gets the next infection",()=>{
  const m=createLobsterDisease();run(m,{},21);assert.equal(diseaseDenBlocked(m),true);
  let next=false,clear=false;
  for(let i=0;i<12000;i++){const ids=m.agents.map(a=>a.id);advanceLobsterDisease(m,{},1/60);if(m.removed&&!diseaseDenBlocked(m))clear=true;
    if(m.episode){assert.ok(ids.includes(m.infectedId));next=true;break;}}
  assert.ok(clear);assert.ok(next);assert.equal(m.agents.length,6);
});
test("existing agents never leave the canvas and replacement entry stays continuous",()=>{
  for(const aspect of [0.6,2.5]){const m=createLobsterDisease(aspect);for(let i=0;i<7200;i++){
    const old=new Map(m.agents.map(a=>[a.id,{...a}]));advanceLobsterDisease(m,{disease_pace:2,flushing:100},1/60);
    for(const a of m.agents){const p=old.get(a.id);if(p){assert.ok(Math.hypot(a.x-p.x,a.y-p.y)<0.04);assert.ok(Math.abs(a.heading-p.heading)<0.038);}
      if(!a.entering)assert.ok(a.x>1&&a.x<m.width-1&&a.y>1&&a.y<m.height-1);}
  }}
});
test("zero progression can rest and fixed stepping is render independent",()=>{
  const a=createLobsterDisease(),b=createLobsterDisease();run(a,{disease_pace:0},8);assert.equal(a.age,0);assert.ok(a.agents.every(x=>!x.moving));
  const c=createLobsterDisease();run(b,{},25,30);run(c,{},25,120);assert.deepEqual(b.agents,c.agents);
});

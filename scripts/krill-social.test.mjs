import test from "node:test";
import assert from "node:assert/strict";
import {createKrillSocial,advanceKrillSocial,krillSocialControls} from "../src/components/bookPreviews/krillSocialModel.js";
import {swimSocialForces,swimSeparation} from "../src/components/bookPreviews/sardineSwimmingModel.js";
const run=(m,c,s,fps=60)=>{for(let i=0;i<s*fps;i++)advanceKrillSocial(m,c,1/fps);};
test("neighbor selection is local, not a fixed count of six",()=>{
  const m=createKrillSocial(1),a=m.agents[10];
  const near=swimSocialForces(a,m.agents,krillSocialControls({neighbor_range:0.6}));
  const far=swimSocialForces(a,m.agents,krillSocialControls({neighbor_range:2.4}));
  assert.ok(far.neighbourIds.length>near.neighbourIds.length);assert.ok(far.neighbourIds.length>6);
});
test("spacing and cohesion controls map to independent force components",()=>{
  const m=createKrillSocial(1),a=m.agents[0],low=krillSocialControls({group_attraction:0}),high=krillSocialControls({group_attraction:100});
  const x=swimSocialForces(a,m.agents,low),y=swimSocialForces(a,m.agents,high);assert.deepEqual(x.alignment,y.alignment);assert.equal(x.cohesion.x,0);assert.notEqual(y.cohesion.x,0);
  assert.deepEqual(swimSeparation(a,m.agents,0),{x:0,y:0});assert.notDeepEqual(swimSeparation(a,m.agents,100),{x:0,y:0});
});
test("krill comparison retains inherited bounded gradual steering at extremes",()=>{
  for(const aspect of [0.6,2.5])for(const strength of [0,100]){const m=createKrillSocial(aspect);for(let i=0;i<6000;i++){
    const old=m.agents.map(a=>({...a}));advanceKrillSocial(m,{group_attraction:strength,spacing_response:strength,neighbor_range:2.4},1/60);
    m.agents.forEach((a,j)=>{assert.ok(a.x>0.3&&a.x<m.width-0.3&&a.y>0.3&&a.y<m.height-0.3);assert.ok(Math.abs(a.heading-old[j].heading)<0.06);});
  }}
});
test("shared fixed-step model is independent of display frame rate",()=>{const a=createKrillSocial(1),b=createKrillSocial(1);run(a,{},20,30);run(b,{},20,120);assert.deepEqual(a.agents,b.agents);});

import test from "node:test";
import assert from "node:assert/strict";
import {createLobsterChemical,advanceLobsterChemical,lobsterChemicalAlpha,sampleLobsterChemical} from "../src/components/bookPreviews/lobsterChemicalModel.js";
const run=(m,c,s,fps=30)=>{for(let i=0;i<s*fps;i++)advanceLobsterChemical(m,c,1/fps);};
const mass=m=>m.layers[0].reduce((a,b)=>a+b,0);
const stats=m=>{let sum=0,x=0,y=0,yy=0;m.layers[0].forEach((v,i)=>{const py=(Math.floor(i/m.cols)+0.5)*m.cell;sum+=v;x+=v*(i%m.cols+0.5)*m.cell;y+=v*py;yy+=v*py*py;});return{x:x/sum,variance:yy/sum-(y/sum)**2};};
test("emission amount changes concentration, not transport direction",()=>{
  const a=createLobsterChemical(),b=createLobsterChemical();run(a,{signal_release:25},3);run(b,{signal_release:75},3);
  assert.ok(Math.abs(mass(b)/mass(a)-3)<1e-5);assert.ok(Math.abs(stats(a).x-stats(b).x)<1e-5);
});
test("flow advects downstream and spreading broadens the same scalar field",()=>{
  const a=createLobsterChemical(),b=createLobsterChemical(),c=createLobsterChemical();
  run(a,{water_flow:0,signal_spread:0},5);run(b,{water_flow:100,signal_spread:0},5);run(c,{water_flow:0,signal_spread:100},5);
  assert.ok(stats(b).x<stats(a).x-1);assert.ok(stats(c).variance>stats(a).variance+1);
});
test("source shutdown leaves a smoothly decaying field without a lifetime deletion",()=>{
  const m=createLobsterChemical();run(m,{water_flow:0,signal_spread:0},3);const initial=mass(m);
  run(m,{signal_release:0,water_flow:0,signal_spread:0},5);
  assert.ok(Math.abs(mass(m)/initial-Math.exp(-1))<1e-5);
  const i=m.layers[0].findIndex(v=>v>0.1),before=m.layers[0][i];
  assert.equal(sampleLobsterChemical(m,m.layers[0],(i%m.cols+0.5)*m.cell,(Math.floor(i/m.cols)+0.5)*m.cell),before);
  assert.ok(lobsterChemicalAlpha(before)>0);
  run(m,{signal_release:0},60);assert.equal(lobsterChemicalAlpha(m.max),0);
  run(m,{signal_release:100},3);assert.ok(lobsterChemicalAlpha(m.max)>0);
});
test("healthy and disease cue use identical transport at equivalent starting positions",()=>{
  const m=createLobsterChemical();m.sources[1]={...m.sources[0]};run(m,{},6);assert.deepEqual(m.layers[0],m.layers[1]);
});
test("extreme controls stay finite and nonnegative on both aspect ratios",()=>{
  for(const aspect of [0.6,2.5]){const m=createLobsterChemical(aspect);run(m,{signal_release:100,water_flow:100,signal_spread:100},20);assert.ok(m.layers.every(l=>l.every(v=>Number.isFinite(v)&&v>=0)));}
});
test("fixed grid step is independent of rendering frame rate",()=>{
  const a=createLobsterChemical(),b=createLobsterChemical();run(a,{},6,30);run(b,{},6,120);assert.deepEqual(a.layers,b.layers);
});

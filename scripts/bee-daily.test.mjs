import test from "node:test";
import assert from "node:assert/strict";
import {createBeeDaily,advanceBeeDaily} from "../src/components/bookPreviews/beeDailyModel.js";
function run(c,seconds=60,fps=60,aspect=1.5){const m=createBeeDaily(aspect);for(let i=0;i<seconds*fps;i++)advanceBeeDaily(m,c,1/fps);return m;}
const trips=m=>m.agents.reduce((s,a)=>s+a.trips,0);
test("zero participation rests and higher participation yields more trips",()=>{
 const rest=run({departure_activity:0});assert.ok(rest.agents.every(a=>a.distance===0));
 assert.ok(trips(run({departure_activity:100}))>trips(run({departure_activity:20})));
});
test("speed and collection time independently affect trip throughput",()=>{
 assert.ok(trips(run({flight_speed:2}))>trips(run({flight_speed:0.5})));
 assert.ok(trips(run({collection_time:0.5}))>trips(run({collection_time:5})));
});
test("agents complete departure, collection and return without teleportation",()=>{
 const m=createBeeDaily(1.5),states=new Set();
 for(let i=0;i<3600;i++){
  const old=m.agents.map(a=>({...a}));advanceBeeDaily(m,{},1/60);
  m.agents.forEach((a,j)=>{states.add(a.state);assert.ok(Math.hypot(a.x-old[j].x,a.y-old[j].y)<0.18);});
 }
 assert.deepEqual([...states].sort(),["gathering","inside","outbound","returning"]);
 assert.ok(trips(m)>0);
});
test("control extremes keep agents inside the scene",()=>{
 for(const aspect of [0.6,2.5]){
  const m=run({departure_activity:100,flight_speed:2,collection_time:0.5},120,30,aspect);
  assert.ok(m.agents.every(a=>a.x>1&&a.x<m.width-1&&a.y>1&&a.y<m.height-1));
  assert.ok(m.agents.every(a=>a.trips>0));
 }
});
test("fixed step agrees at different render rates",()=>{
 const a=run({},20,30),b=run({},20,120);
 a.agents.forEach((p,i)=>assert.ok(Math.hypot(p.x-b.agents[i].x,p.y-b.agents[i].y)<1e-8));
});

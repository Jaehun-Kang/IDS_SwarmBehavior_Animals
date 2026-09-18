import test from 'node:test';
import assert from 'node:assert/strict';
import { createBeeFanningFlow, advanceBeeFanningFlow } from '../src/components/bookPreviews/beeFanningFlow.js';

test('released flow continues through the entrance after fanning stops',()=>{
  const flow=createBeeFanningFlow(400,400);
  const agents=[{id:0,x:13,y:10,fanning:true}];
  advanceBeeFanningFlow(flow,agents,20,1/60);
  const packet=flow.markers[0],start=packet.x;
  agents[0].fanning=false;
  advanceBeeFanningFlow(flow,agents,20,1/60);
  assert.equal(flow.markers.length,1);
  assert.ok(packet.x<start);
  for(let i=0;i<150;i++)advanceBeeFanningFlow(flow,agents,20,1/60);
  assert.ok(flow.markers.includes(packet));
  assert.ok(packet.x<400*0.24);
  for(let i=0;i<360;i++)advanceBeeFanningFlow(flow,agents,20,1/60);
  assert.equal(flow.markers.length,0);
});

test('idle sources emit nothing and long-running flow stays bounded',()=>{
  const flow=createBeeFanningFlow(400,400),agents=[{id:0,x:13,y:10,fanning:false}];
  for(let i=0;i<60;i++)advanceBeeFanningFlow(flow,agents,20,1/60);
  assert.equal(flow.markers.length,0);
  agents[0].fanning=true;
  for(let i=0;i<3600;i++)advanceBeeFanningFlow(flow,agents,20,1/60);
  assert.ok(flow.markers.length>0&&flow.markers.length<12);
});

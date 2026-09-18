import test from "node:test";
import assert from "node:assert/strict";
import {createFlowMarkers,advanceFlowMarkers,drawFlowMarkers,drawGrassMark,drawKrillFoodPatch} from "../src/components/bookPreviews/bookEnvironmentDrawing.js";
import {createAntExploration} from "../src/components/bookPreviews/antExplorationModel.js";
import {createAntTraffic} from "../src/components/bookPreviews/antTrafficModel.js";
import {createAntMill} from "../src/components/bookPreviews/antMillModel.js";

test("flow markers have stable density and follow the chosen direction and speed",()=>{
  for(const [width,height] of [[220,300],[600,400]]){
    const field=createFlowMarkers(width,height),before=structuredClone(field);
    advanceFlowMarkers(field,0,0,0.1);
    assert.deepEqual(field,before);
    advanceFlowMarkers(field,0,20,0.1);
    field.markers.forEach((p,i)=>{
      assert.ok(Math.abs(p.x-before.markers[i].x-2)<1e-8);
      assert.ok(Math.abs(p.y-before.markers[i].y)<1e-8);
    });
    advanceFlowMarkers(field,Math.PI,20,0.1);
    field.markers.forEach((p,i)=>assert.ok(Math.hypot(p.x-before.markers[i].x,p.y-before.markers[i].y)<1e-8));
    for(let i=0;i<1000;i++)advanceFlowMarkers(field,2.7,100,0.1);
    assert.ok(field.markers.every(p=>p.x>=0&&p.x<width&&p.y>=0&&p.y<height));
    assert.equal(field.markers.length,before.markers.length);
  }
});

test("drawn flow tails stay short across wrap boundaries and calm has no strokes",()=>{
  let start,strokes=0;
  const ctx={save(){},restore(){},beginPath(){},moveTo(x,y){start={x,y};},
    lineTo(x,y){assert.ok(Math.hypot(x-start.x,y-start.y)<=11);},stroke(){strokes++;}};
  const field=createFlowMarkers(220,300);
  drawFlowMarkers(ctx,field,0,0);assert.equal(strokes,0);
  drawFlowMarkers(ctx,field,Math.PI,100);
  assert.equal(strokes,field.markers.length*3);
});

test("food gradients reject invalid values and grass uses separate upright strokes",()=>{
  const stops=[];let gradients=0,moves=0,lines=0;
  const ctx={save(){},restore(){},beginPath(){},arc(){},fill(){},stroke(){},
    moveTo(){moves++;},lineTo(){lines++;},
    createRadialGradient(){gradients++;return {addColorStop(r,color){stops.push({r,color});}};}};
  for(const args of [[0,0,4,NaN],[0,0,-1,1],[Infinity,0,4,1],[0,0,4,0]])drawKrillFoodPatch(ctx,...args);
  assert.equal(gradients,0);
  drawKrillFoodPatch(ctx,20,20,10,0.5);
  assert.equal(gradients,1);assert.equal(stops.length,5);
  assert.equal(stops[0].color,"rgba(99, 185, 124, 0.17)");
  assert.equal(stops.at(-1).color,"rgba(99, 185, 124, 0)");
  drawGrassMark(ctx,20,20);assert.equal(moves,4);assert.equal(lines,4);
});

test("initial ant layouts have room between bodies and match their first render pose",()=>{
  for(const create of [createAntExploration,createAntTraffic,createAntMill]){
    for(const aspect of [0.55,1,2]){
      const m=create(aspect);
      for(const a of m.agents){
        assert.ok(a.x>1.5&&a.y>1.5&&a.x<m.width-1.5&&a.y<m.height-1.5);
        assert.deepEqual(a.previous,{x:a.x,y:a.y,heading:a.heading});
        for(const b of m.agents)if(a.id!==b.id)assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>2.15);
      }
    }
  }
});

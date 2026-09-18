import test from 'node:test';
import assert from 'node:assert/strict';
import { drawThreatMarker } from '../src/components/bookPreviews/bookThreatDrawing.js';

function context() {
  const points=[], texts=[];
  return {points,texts,saves:0,restores:0,strokes:0,
    save(){this.saves++;},restore(){this.restores++;},
    beginPath(){},closePath(){},fill(){},stroke(){this.strokes++;},strokeText(){this.strokes++;},
    moveTo(...p){points.push(p);},lineTo(...p){points.push(p);},
    measureText(s){return {width:s.length*12};},
    fillText(...args){texts.push(args);}};
}
test('threat marker is a filled triangle without text or border',()=>{
  const ctx=context();drawThreatMarker(ctx,80,60,300,200);
  assert.deepEqual(ctx.points,[[80,48],[92,70],[68,70]]);
  assert.deepEqual(ctx.texts,[]);
  assert.equal(ctx.strokes,0);
  assert.equal(ctx.saves,ctx.restores);
});
test('marker keeps the actual threat position near edges',()=>{
  const ctx=context();drawThreatMarker(ctx,298,197,300,200);
  assert.deepEqual(ctx.points[0],[298,185]);
  assert.deepEqual(ctx.texts,[]);
});
test('invalid coordinates do not reach canvas drawing',()=>{
  const ctx=context();drawThreatMarker(ctx,NaN,0,300,200);
  assert.equal(ctx.saves,0);
});

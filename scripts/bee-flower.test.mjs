import test from 'node:test';
import assert from 'node:assert/strict';
import { getFlowerBlossomPosition, renderFlower } from '../src/utils/beeFlower.js';

test('shared flower keeps six yellow petals, purple center and green stem', () => {
  const arcs=[], fills=[], lines=[];
  const ctx={beginPath(){},arc(...args){arcs.push(args);},
    fill(){fills.push(this.fillStyle);},moveTo(...args){lines.push(args);},
    lineTo(...args){lines.push(args);},stroke(){}};
  renderFlower(ctx,{x:10,y:20},0);
  assert.equal(arcs.length,7);
  assert.deepEqual(lines,[[10,27],[10,40]]);
  assert.equal(ctx.strokeStyle,'rgba(68, 126, 66, 0.68)');
  assert.ok(fills.slice(0,6).every(v=>v==='rgba(247, 199, 66, 0.96)'));
  assert.equal(fills[6],'rgba(164, 80, 122, 0.92)');
  assert.deepEqual(arcs[6],[10,20,3.3,0,Math.PI*2]);
});

test('flower sway preserves the existing amplitude and phase', () => {
  const f={x:10,y:20,swayPhase:0.7};
  assert.deepEqual(getFlowerBlossomPosition(f,2),{x:10+Math.sin(2*2.4+0.7)*0.8,y:20});
});

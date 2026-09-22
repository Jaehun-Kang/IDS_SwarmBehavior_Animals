import test from 'node:test';
import assert from 'node:assert/strict';
import { advancePenguinArrival } from '../src/utils/penguinArrival.js';

test('entry motion slows down and never overshoots its docking point', () => {
  let position = {x:0,y:0};
  const target = {x:10,y:5};
  let previousDistance = Math.hypot(10,5);
  for(let i=0;i<600;i++) {
    position=advancePenguinArrival(position,target,60,1/60,20);
    const distance=Math.hypot(target.x-position.x,target.y-position.y);
    assert.ok(distance<=previousDistance);
    assert.ok(position.x<=target.x && position.y<=target.y);
    previousDistance=distance;
  }
  assert.ok(previousDistance<0.01);
});

test('large frames and exact arrival cannot reverse the movement', () => {
  assert.equal(advancePenguinArrival({x:0,y:0},{x:1,y:0},100,2,3).x,1);
  assert.deepEqual(advancePenguinArrival({x:1,y:0},{x:1,y:0},100,1,3),{x:1,y:0,speed:0});
});

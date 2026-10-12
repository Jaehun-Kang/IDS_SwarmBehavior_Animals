import test from 'node:test';
import assert from 'node:assert/strict';
import { createSimulationFrameScheduler } from '../src/utils/simulationFrameScheduler.js';

function harness(options = {}) {
  let id = 0, hidden = false;
  const callbacks = new Map();
  const clock = createSimulationFrameScheduler({
    ...options,
    requestFrame(callback) { callbacks.set(++id, callback); return id; },
    cancelFrame(id) { callbacks.delete(id); },
    isHidden: () => hidden,
  });
  return {
    clock,
    frame(time) {
      const queued = [...callbacks.values()]; callbacks.clear();
      for (const callback of queued) callback(time);
      assert(callbacks.size <= 1);
    },
    hide(value) { hidden = value; },
    get pending() { return callbacks.size; },
  };
}

for (const hz of [15,30,48,50,60,90,120,144,165,240]) {
  test(hz+'Hz: one elapsed-time update per display frame, same speed and damping', () => {
    const h=harness(); let updates=0, draws=0, x=0, v=1;
    const render=(_,frame)=>{
      frame.advance(dt=>{
        x+=120*dt;
        v*=Math.pow(0.99,dt*60);
        updates++;
      });
      frame.draw([],()=>draws++);
      h.clock.request(render);
    };
    h.clock.request(render);
    for(let i=0;i<=hz*10;i++)h.frame(i*1000/hz);
    assert.equal(updates,hz*10+1);
    assert.equal(draws,hz*10+1);
    assert(Math.abs(x-1202)<1e-8);
    assert(Math.abs(v-Math.pow(.99,601))<1e-10);
  });
}

test('slow frames update once with elapsed time, never replay a backlog',()=>{
  const h=harness(), dts=[];
  const render=(_,f)=>{f.advance(dt=>dts.push(dt));h.clock.request(render);};
  h.clock.request(render);h.frame(0);h.frame(100);h.frame(300);
  assert.deepEqual(dts,[1/60,.1,.2]);
});

test('pause, hidden tabs, and long gaps do not cause a leap',()=>{
  const h=harness(), dts=[];let paused=false;
  const render=(_,f)=>{f.advance(dt=>dts.push(dt),paused);h.clock.request(render);};
  h.clock.request(render);h.frame(0);
  paused=true;h.frame(100);h.frame(200);
  paused=false;h.frame(300);
  h.hide(true);h.frame(400);h.hide(false);h.frame(1000);
  h.frame(3000);
  assert.deepEqual(dts,[1/60,1/60,1/60,1/60]);
});

test('effect restarts retain elapsed time and cancellation removes callbacks',()=>{
  const h=harness(), dts=[];
  const render=(_,f)=>f.advance(dt=>dts.push(dt));
  h.clock.request(render);h.frame(100);
  const cancelled=h.clock.request(render);h.clock.cancel(cancelled);
  assert.equal(h.pending,0);
  h.clock.request(render);h.frame(105);
  assert.deepEqual(dts,[1/60,.005]);
});

test('zero elapsed time does not advance; duplicate advance is rejected',()=>{
  const h=harness();let updates=0;
  const render=(_,f)=>{
    f.advance(()=>updates++);
    assert.throws(()=>f.advance(()=>{}),/once/);
    h.clock.request(render);
  };
  h.clock.request(render);h.frame(0);h.frame(0);
  assert.equal(updates,1);
});

test('legacy 50Hz reference affects first frame only, not update frequency',()=>{
  const h=harness({stepSeconds:.02}), dts=[];
  const render=(_,f)=>{f.advance(dt=>dts.push(dt));h.clock.request(render);};
  h.clock.request(render);h.frame(0);h.frame(10);h.frame(20);
  assert.deepEqual(dts,[.02,.01,.01]);
});

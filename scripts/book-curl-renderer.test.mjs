import test from 'node:test';
import assert from 'node:assert/strict';
import { createBookCurlRenderer, renderBookCurlTransition } from '../src/utils/bookCurlWebgl.js';

const fixture = () => {
  const calls = [];
  let lost = false;
  const listeners = new Map();
  const gl = new Proxy({}, {
    get: (_, name) => {
      if (name === 'isContextLost') return () => lost;
      if (name === 'getShaderParameter' || name === 'getProgramParameter') return () => true;
      if (name === 'getUniformLocation') return (_, key) => key;
      if (/^[A-Z_0-9]+$/.test(name)) return name;
      return (...args) => { calls.push([name, ...args]); return {}; };
    },
  });
  const canvas = {
    width: 1200, height: 800, getContext: () => gl,
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: name => listeners.delete(name),
  };
  const options = { canvas, fromImage: {}, toImage: {}, width: 600, height: 400, direction: 1 };
  return { calls, options, listeners, setLost: value => { lost = value; } };
};

test('page changes reuse GPU resources and update dimensions/direction/cover', () => {
  const f = fixture();
  const renderer = createBookCurlRenderer(f.options);
  renderer.configure({ ...f.options, width: 700, height: 500, direction: -1, coverMode: 2 });
  renderer.render(0.5, 100);
  const count = name => f.calls.filter(call => call[0] === name).length;
  assert.equal(count('createProgram'), 1);
  assert.equal(count('createBuffer'), 1);
  assert.equal(count('createTexture'), 2);
  assert.equal(count('texImage2D'), 4);
  assert(f.calls.some(c => c[0] === 'uniform2f' && c[1] === 'u_resolution' && c[2] === 700 && c[3] === 500));
  assert(f.calls.some(c => c[1] === 'u_direction' && c[2] === -1));
  assert(f.calls.some(c => c[1] === 'u_coverMode' && c[2] === 2));
  renderer.dispose();
  renderer.dispose();
  assert.equal(count('deleteProgram'), 1);
  assert.equal(count('deleteTexture'), 2);
  assert.equal(renderer.isUsable(), false);
});

test('context loss invalidates resources even after restoration', () => {
  const f = fixture();
  const renderer = createBookCurlRenderer(f.options);
  f.setLost(true);
  assert.equal(createBookCurlRenderer(f.options), null);
  let prevented = false;
  f.listeners.get('webglcontextlost')({ preventDefault: () => { prevented = true; } });
  f.setLost(false);
  assert(prevented);
  assert.equal(renderer.isUsable(), false);
  assert.equal(createBookCurlRenderer(f.options).isUsable(), true);
});

test('transition completion and cancellation leave borrowed renderer alive', () => {
  const previousWindow = globalThis.window;
  let next;
  globalThis.window = { requestAnimationFrame: cb => { next = cb; return 1; }, cancelAnimationFrame: () => { next = null; } };
  try {
    let disposed = 0, completed = 0;
    const renderer = { render() {}, dispose() { disposed++; } };
    const cancel = renderBookCurlTransition({ renderer, durationMs: 520, onComplete: () => { completed++; } });
    next(performance.now() + 600);
    assert.equal(completed, 1);
    cancel();
    assert.equal(disposed, 0);
    const cancelAgain = renderBookCurlTransition({ renderer, durationMs: 520 });
    cancelAgain();
    assert.equal(next, null);
    assert.equal(disposed, 0);
  } finally {
    globalThis.window = previousWindow;
  }
});

import test from "node:test";
import assert from "node:assert/strict";
import { createBookCanvasLoop } from "../src/utils/bookCanvasLoop.js";

function setup(t, options) {
  const frames = new Map();
  let id = 0, time = 0, resizeObserver, intersectionObserver;
  const win = new EventTarget(), doc = new EventTarget(), canvas = new EventTarget();
  win.devicePixelRatio = 1;
  doc.hidden = false;
  Object.assign(canvas, { parentElement: {}, width: 0, height: 0, dataset: {},
    getContext: () => ({ setTransform() {} }) });
  const replacements = {
    window: win, document: doc,
    requestAnimationFrame: callback => { frames.set(++id, callback); return id; },
    cancelAnimationFrame: key => frames.delete(key),
    ResizeObserver: class { constructor(cb) { resizeObserver = cb; } observe() {} disconnect() {} },
    IntersectionObserver: class { constructor(cb) { intersectionObserver = cb; } observe() {} disconnect() {} },
  };
  const restore = [];
  for (const [key, value] of Object.entries(replacements)) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    restore.push(() => descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key]);
  }
  const loop = createBookCanvasLoop(canvas, options);
  t.after(() => { loop.dispose(); restore.forEach(callback => callback()); });
  const resize = (width = 400, height = 300) => resizeObserver([{ contentRect: { width, height } }]);
  resize();
  return { loop, canvas, win, doc, frames, resize,
    visible: value => intersectionObserver([{ isIntersecting: value }]),
    tick(ms = 16.67) {
      time += ms;
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach(callback => callback(time));
    },
  };
}

test("explicit idle cancels repeat work; undefined still advances waiting models", t => {
  let calls = 0, idle = false;
  const h = setup(t, { onFrame() { calls++; return idle ? false : undefined; } });
  h.loop.start(); h.tick(); h.tick();
  assert.equal(calls, 2);
  assert.equal(h.frames.size, 1);
  idle = true; h.tick();
  assert.equal(h.frames.size, 0);
  for (let i = 0; i < 100; i++) h.tick();
  assert.equal(calls, 3);
  assert.equal(h.canvas.dataset.bookFrameReady, "true");
});

test("control/reset invalidation wakes once and discards sleeping elapsed time", t => {
  const elapsed = [];
  const h = setup(t, { onFrame: frame => { elapsed.push(frame.elapsedSeconds); return false; } });
  h.loop.start(); h.tick(); h.tick(60000);
  h.loop.invalidate(); h.loop.invalidate();
  assert.equal(h.frames.size, 1);
  h.tick();
  assert.deepEqual(elapsed, [0, 0]);
  assert.equal(h.frames.size, 0);
});

test("idle redraws on resize, DPR, pointer input and visibility, then sleeps again", t => {
  let calls = 0, invalidations = 0;
  const h = setup(t, {
    onInvalidate() { invalidations++; },
    onFrame() { calls++; return false; },
  });
  h.loop.start(); h.tick();
  h.resize(600, 300); h.tick();
  assert.equal(h.canvas.width, 600);
  h.win.devicePixelRatio = 2;
  h.win.dispatchEvent(new Event("resize")); h.tick();
  assert.equal(h.canvas.width, 1200);
  for (const type of ["pointermove", "pointerdown", "pointerup", "pointerleave"]) {
    h.canvas.dispatchEvent(new Event(type)); h.tick();
  }
  h.doc.hidden = true; h.doc.dispatchEvent(new Event("visibilitychange"));
  assert.equal(h.frames.size, 0);
  h.doc.hidden = false; h.doc.dispatchEvent(new Event("visibilitychange")); h.tick();
  assert.equal(calls, 8);
  assert.ok(invalidations >= calls);
  assert.equal(h.frames.size, 0);
});

test("offscreen snapshot renders once; returning on screen resumes running model", t => {
  let calls = 0;
  const h = setup(t, { onFrame() { calls++; } });
  h.loop.start(); h.visible(false); h.tick();
  assert.equal(calls, 1);
  assert.equal(h.frames.size, 0);
  assert.equal(h.canvas.dataset.bookFrameReady, "true");
  h.visible(true); h.tick();
  assert.equal(calls, 2);
  assert.equal(h.frames.size, 1);
  h.resize(0, 0);
  assert.equal(h.frames.size, 0);
  h.resize(); h.tick();
  assert.equal(calls, 3);
});

test("disposal removes wake listeners and prevents queued or late invalidation", t => {
  let calls = 0;
  const h = setup(t, { onFrame() { calls++; } });
  h.loop.start(); h.loop.dispose();
  h.loop.invalidate();
  h.canvas.dispatchEvent(new Event("pointermove"));
  h.win.dispatchEvent(new Event("resize"));
  h.doc.dispatchEvent(new Event("visibilitychange"));
  h.tick();
  assert.equal(h.frames.size, 0);
  assert.equal(calls, 0);
});

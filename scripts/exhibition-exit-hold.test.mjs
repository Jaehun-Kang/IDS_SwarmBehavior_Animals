import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { createExitHold, HOLD_MS } = createRequire(import.meta.url)("./exhibition-exit-hold.cjs");

function setup() {
  let now = 0, calls = 0, id = 0;
  const timers = new Map();
  const hold = createExitHold({ confirm: () => calls++,
    setTimer: (fn, ms) => { timers.set(++id, { fn, at: now + ms }); return id; },
    clearTimer: id => timers.delete(id),
  });
  return { hold, timers, get calls() { return calls; },
    input(type, extra = {}) { return hold.input({ type, x: 10, y: 790, button: "left", ...extra }, 800); },
    advance(ms) { now += ms; for (const [id, t] of timers) if (t.at <= now) { timers.delete(id); t.fn(); } },
  };
}
test("main-process hold confirms once at five seconds", () => {
  const s = setup(); assert.equal(HOLD_MS, 5000); assert(s.input("mouseDown"));
  s.advance(4999); assert.equal(s.calls, 0); s.advance(1); assert.equal(s.calls, 1);
  s.advance(10000); assert.equal(s.calls, 1);
});
test("release before deadline cancels", () => {
  const s = setup(); s.input("mouseDown"); s.advance(4999); assert(s.input("mouseUp"));
  s.advance(6000); assert.equal(s.calls, 0); assert.equal(s.timers.size, 0);
});
test("departure, reentry and window leave never restart the timer", () => {
  for (const [type, extra] of [["mouseMove", { x: 32 }], ["mouseMove", { y: 767 }], ["mouseLeave", {}]]) {
    const s = setup(); s.input("mouseDown"); s.advance(4000); assert(s.input(type, extra));
    s.input("mouseEnter"); s.input("mouseMove"); s.advance(6000); assert.equal(s.calls, 0);
    assert(s.input("mouseUp")); assert(!s.input("mouseMove"));
    s.input("mouseDown"); s.advance(5000); assert.equal(s.calls, 1);
  }
});
test("focus loss, resize and navigation reset releases the gesture", () => {
  const s = setup(); s.input("mouseDown"); s.advance(4000); s.hold.reset();
  s.advance(6000); assert.equal(s.calls, 0); assert(!s.input("mouseMove"));
  s.input("mouseDown"); s.advance(5000); assert.equal(s.calls, 1);
});
test("ordinary artwork input and non-left buttons are untouched", () => {
  for (const extra of [{ x: 32 }, { x: -1 }, { y: 767 }, { y: 800 }, { button: "right" }, { button: "middle" }]) {
    const s = setup(); assert(!s.input("mouseDown", extra)); s.advance(6000); assert.equal(s.calls, 0);
  }
});
test("right-button release does not complete a held left-button gesture", () => {
  const s = setup(); s.input("mouseDown"); assert(s.input("mouseUp", { button: "right" }));
  s.advance(5000); assert.equal(s.calls, 1);
});
test("window disposal clears timers and rejects future input", () => {
  const s = setup(); s.input("mouseDown"); s.hold.dispose(); s.advance(6000);
  assert.equal(s.calls, 0); assert.equal(s.timers.size, 0); assert(!s.input("mouseDown"));
});

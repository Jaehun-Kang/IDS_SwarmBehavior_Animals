import test from "node:test";
import assert from "node:assert/strict";
import { createBatEmergence, advanceBatEmergence, batEmergenceRate } from "../src/components/bookPreviews/batEmergenceModel.js";
const run = (m, c, seconds, hz = 60) => {
  for (let i = 0; i < seconds * hz; i++) advanceBatEmergence(m, c, 1 / hz);
  return m;
};
test("emergence fixed steps do not depend on rendering frequency", () => {
  assert.deepEqual(run(createBatEmergence(), {}, 8, 30), run(createBatEmergence(), {}, 8, 120));
});
test("activity and opening control prescribed release, not agent speed", () => {
  assert.equal(batEmergenceRate({ emergence_activity: 0 }), 0);
  const narrow = run(createBatEmergence(), { exit_width: 3 }, 20);
  const wide = run(createBatEmergence(), { exit_width: 12 }, 20);
  assert.ok(wide.emitted > narrow.emitted * 3);
  const stopped = run(wide, { emergence_activity: 0 }, 1);
  const count = stopped.emitted;
  run(stopped, { emergence_activity: 0 }, 40);
  assert.equal(stopped.emitted, count);
  assert.equal(stopped.agents.length, 0);
});
test("new agents arrive fully outside and existing ones exit without wrapping", () => {
  const m = createBatEmergence();
  let seen = new Set();
  for (let i = 0; i < 3600; i++) {
    advanceBatEmergence(m, {}, 1 / 60);
    for (const a of m.agents) if (!seen.has(a.id)) {
      assert.ok(a.x < -2.5);
      seen.add(a.id);
    }
  }
  assert.ok(m.exited > 0);
  assert.equal(m.emitted, m.exited + m.agents.length);
});
test("spread changes downstream width independently of release count", () => {
  const thin = run(createBatEmergence(), { stream_spread: 0 }, 30);
  const broad = run(createBatEmergence(), { stream_spread: 100 }, 30);
  const variance = m => {
    const agents = m.agents.filter(a => a.x > 20);
    return agents.reduce((sum, a) => sum + (a.y - m.height / 2) ** 2, 0) / agents.length;
  };
  assert.equal(thin.emitted, broad.emitted);
  assert.ok(variance(broad) > variance(thin) * 2);
});
test("stream stays bounded vertically with finite continuous headings", () => {
  for (const aspect of [0.6, 1.5, 3]) for (const value of [0, 100]) {
    const m = createBatEmergence(aspect);
    for (let i = 0; i < 7200; i++) {
      advanceBatEmergence(m, { emergence_activity: 100, exit_width: value ? 12 : 3, stream_spread: value }, 1 / 60);
      for (const a of m.agents) {
        assert.ok(Number.isFinite(a.x + a.y + a.heading));
        assert.ok(a.y > 1 && a.y < m.height - 1);
        assert.ok(Math.abs(a.heading - a.previous.heading) <= 1.2 / 120 + 1e-9);
      }
      assert.ok(m.agents.length <= 96);
    }
  }
});

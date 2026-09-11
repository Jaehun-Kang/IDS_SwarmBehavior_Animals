import test from "node:test";
import assert from "node:assert/strict";
import { delayedBatHeading } from "../src/components/bookPreviews/batNeighborModel.js";
import { createBatNeighbors, advanceBatEmergence } from "../src/components/bookPreviews/batEmergenceModel.js";
const run = (c, hz = 60) => {
  const m = createBatNeighbors();
  for (let i = 0; i < 30 * hz; i++) advanceBatEmergence(m, c, 1 / hz);
  return m;
};
test("bat neighbor sensing ignores rear and distant individuals and reads past headings", () => {
  const a = { id: 0, x: 0, y: 0, heading: 0 };
  const b = { id: 1, x: 9, y: 0, heading: 0.8, history: [{ time: 0, heading: 0.1 }, { time: 1.5, heading: 0.8 }] };
  assert.ok(Math.abs(delayedBatHeading(a, [b], 2) - 0.1) < 1e-9);
  assert.equal(delayedBatHeading(a, [{ ...b, x: -1 }], 2), null);
  assert.equal(delayedBatHeading(a, [{ ...b, x: 13 }], 2), null);
});
test("each bat neighbor control changes paths without changing emission count", () => {
  const base = run({});
  for (const key of ["forward_following", "near_avoidance", "stream_spread"]) {
    const altered = run({ [key]: 0 });
    assert.equal(base.emitted, altered.emitted);
    assert.ok(base.agents.some(a => {
      const b = altered.agents.find(other => other.id === a.id);
      return b && Math.hypot(a.x - b.x, a.y - b.y) > 0.01;
    }), key);
  }
});
test("bat neighbor fixed steps are deterministic and histories bounded", () => {
  assert.deepEqual(run({}, 30), run({}, 120));
  for (const aspect of [0.6, 1.5, 3]) for (const value of [0, 100]) {
    const m = createBatNeighbors(aspect);
    for (let i = 0; i < 7200; i++) {
      advanceBatEmergence(m, { forward_following: value, near_avoidance: value, stream_spread: value }, 1 / 60);
      for (const a of m.agents) {
        assert.ok(Number.isFinite(a.x + a.y + a.heading));
        assert.ok(a.y > 1 && a.y < m.height - 1);
        assert.ok(a.history.length < 48);
      }
    }
  }
});

import test from "node:test";
import assert from "node:assert/strict";
import { createLocustGroundModel, advanceLocustGround, stepLocustGround, LOCUST_STEP,
  locustGroundPose } from "../src/components/bookPreviews/locustGroundModel.js";

test("ground stages are asynchronous and never use flight", () => {
  const model = createLocustGroundModel(1), states = new Set();
  let asynchronous = false;
  for (let i = 0; i < 2400; i++) {
    stepLocustGround(model, {});
    for (const a of model.agents) states.add(a.state);
    asynchronous ||= new Set(model.agents.map(a => a.state)).size > 1;
  }
  assert.deepEqual([...states].sort(), ["hop", "land", "pause", "prepare", "walk"]);
  assert.ok(asynchronous);
});
test("ground control extremes preserve page margins, stops and launch direction", () => {
  for (const aspect of [0.55, 1, 2]) for (const speed of [0.5, 3])
    for (const pause of [0.5, 4]) for (const length of [2, 8]) {
      const model = createLocustGroundModel(aspect);
      for (let i = 0; i < 6000; i++) {
        stepLocustGround(model, { walk_speed: speed, pause_duration: pause, hop_distance: length });
        model.agents.forEach((a, j) => {
          const old = model.previous[j];
          assert.ok(a.x > 2 && a.x < model.width - 2 && a.y - a.z > 2 && a.y < model.height - 2);
          if (a.state === "hop") assert.equal(a.heading, old.heading);
          if (["pause", "prepare", "land"].includes(a.state)) {
            assert.equal(a.x, old.x); assert.equal(a.y, old.y);
          }
          if (a.state === "walk") assert.ok(Math.abs(Math.hypot(a.x-old.x,a.y-old.y)-speed*LOCUST_STEP)<1e-10);
          assert.ok(Number.isFinite(locustGroundPose(model,j).z));
        });
      }
    }
});
test("fixed ground motion is independent of display rate and controls change motion", () => {
  const a = createLocustGroundModel(1), b = createLocustGroundModel(1);
  for (let i=0;i<300;i++) advanceLocustGround(a,{},1/30);
  for (let i=0;i<1200;i++) advanceLocustGround(b,{},1/120);
  assert.deepEqual(a.agents,b.agents);
  for (const controls of [{walk_speed:3},{pause_duration:4},{hop_distance:8}]) {
    const other=createLocustGroundModel(1);
    for (let i=0;i<1200;i++) stepLocustGround(other,controls);
    assert.notDeepEqual(a.agents,other.agents);
  }
});

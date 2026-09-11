import test from "node:test";
import assert from "node:assert/strict";
import { createLocustGroundModel, stepLocustGround, locustSocialForce } from "../src/components/bookPreviews/locustGroundModel.js";
test("locust interactions use separate local zones and ignore distant agents", () => {
  const a = { id: 1, x: 0, y: 0, heading: 0, state: "walk" };
  const agents = [a, { ...a, id: 2, x: 1 }, { ...a, id: 3, x: 5 },
    { ...a, id: 4, x: 10 }, { ...a, id: 5, x: 20 }];
  const forces = locustSocialForce(a, agents, {});
  assert.deepEqual(forces.neighbourIds,[2,3,4]);
  assert.ok(forces.separation.x < 0 && forces.alignment.x > 0 && forces.attraction.x > 0);
  for (const [control, field] of [["separation_strength","separation"],
    ["alignment_strength","alignment"],["attraction_strength","attraction"]]) {
    const off = locustSocialForce(a,agents,{[control]:0});
    assert.equal(Math.hypot(off[field].x,off[field].y),0);
    for (const other of ["separation","alignment","attraction"].filter(k=>k!==field))
      assert.deepEqual(off[other],forces[other]);
  }
});
test("social ground motion is finite at overlap and bounded at all control corners", () => {
  for (const aspect of [0.55,1,2]) for(const s of [0,100]) for(const a of [0,100]) for(const c of [0,100]) {
    const model=createLocustGroundModel(aspect);
    model.agents[1].x=model.agents[0].x; model.agents[1].y=model.agents[0].y;
    for(let i=0;i<3600;i++) {
      stepLocustGround(model,{separation_strength:s,alignment_strength:a,attraction_strength:c});
      for(const agent of model.agents) assert.ok(Number.isFinite(agent.heading) &&
        agent.x>2 && agent.x<model.width-2 && agent.y-agent.z>2 && agent.y<model.height-2);
    }
  }
});

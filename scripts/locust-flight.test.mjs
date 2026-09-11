import test from "node:test";
import assert from "node:assert/strict";
import { createLocustFlight, stepLocustFlight, advanceLocustFlight, locustFlightVelocity,
  locustFlightViewport, locustFlightPose, FLIGHT_STEP } from "../src/components/bookPreviews/locustFlightModel.js";
test("air and ground velocities differ without instantly reversing heading",()=>{
  const a={heading:Math.PI,activity:1};
  assert.ok(locustFlightVelocity(a,{wind_speed:2}).x<0);
  assert.ok(locustFlightVelocity(a,{wind_speed:6}).x>0);
  assert.equal(a.heading,Math.PI);
  const model=createLocustFlight(1);
  for(let i=0;i<500;i++) stepLocustFlight(model,{});
  const old=model.agents[0].heading;
  stepLocustFlight(model,{wind_direction:90});
  assert.ok(Math.abs(model.agents[0].heading-old)<=1.2*FLIGHT_STEP);
});
test("temperature transitions are continuous, asynchronous and stop ground drift when cold",()=>{
  const model=createLocustFlight(1);
  stepLocustFlight(model,{temperature:35});
  assert.ok(model.agents.every(a=>a.activity>0 && a.activity<0.02));
  assert.notEqual(model.agents[0].activity,model.agents[1].activity);
  for(let i=0;i<500;i++) stepLocustFlight(model,{temperature:35});
  for(let i=0;i<6000;i++) stepLocustFlight(model,{temperature:18,wind_speed:6});
  assert.ok(model.agents.every(a=>a.activity<1e-10 && Math.hypot(a.vx,a.vy)<1e-9));
});
test("flight camera keeps every pose in frame through reversals without wrapping",()=>{
  for(const aspect of [0.55,1,2]) {
    const model=createLocustFlight(aspect);
    for(let i=0;i<6000;i++) {
      stepLocustFlight(model,{temperature:i%2000<1000?35:18,wind_speed:i%1000<500?0:6,wind_direction:(i%1200)/1200*360});
      const view=locustFlightViewport(model);
      for(let j=0;j<model.agents.length;j++) {
        const p=locustFlightPose(model,j),a=model.agents[j],old=model.previous[j];
        assert.ok(p.x>view.x+1 && p.x<view.x+view.width-1);
        assert.ok(p.y>view.y+1 && p.y<view.y+view.width/aspect-1);
        assert.ok(Math.hypot(a.x-old.x,a.y-old.y)<=10*FLIGHT_STEP+1e-10);
        assert.ok(a.trail.length<=16);
      }
    }
  }
});
test("flight fixed stepping is independent of rendering rate",()=>{
  const a=createLocustFlight(1),b=createLocustFlight(1);
  for(let i=0;i<300;i++) advanceLocustFlight(a,{},1/30);
  for(let i=0;i<1200;i++) advanceLocustFlight(b,{},1/120);
  assert.deepEqual(a.agents,b.agents);
});

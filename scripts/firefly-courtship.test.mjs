import test from "node:test";
import assert from "node:assert/strict";
import {createFireflyCourtship,advanceFireflyCourtship} from "../src/components/bookPreviews/fireflyCourtshipModel.js";
function run(m,c,seconds,fps=60){for(let i=0;i<seconds*fps;i++)advanceFireflyCourtship(m,c,1/fps);}
test("female waits until the male train ends and emits two pulses",()=>{
  const m=createFireflyCourtship(2);let pulses=0,lit=false,first=0;
  for(let i=0;i<600;i++){
    advanceFireflyCourtship(m,{male_spread:0,response_delay:3},1/60);
    const on=m.agents[3].light>0;if(on&&!lit){pulses++;first=first||m.time;}lit=on;
  }
  assert.equal(pulses,2);assert.ok(first>5.8&&first<6.1);
});
test("signal spread and response delay independently shift reply timing",()=>{
  const onset=(c)=>{const m=createFireflyCourtship(2);while(m.time<20){run(m,c,1/60);if(m.agents[3].light>0)return m.time;}};
  const base=onset({male_spread:0,response_delay:1});
  assert.ok(Math.abs(onset({male_spread:1,response_delay:1})-base-2)<0.06);
  assert.ok(Math.abs(onset({male_spread:0,response_delay:3})-base-2)<0.06);
});
test("approach follows reply, lands nearby, walks and returns without teleporting",()=>{
  for(const aspect of [0.6,2.5]){
    const m=createFireflyCourtship(aspect),phases=new Set();
    for(let i=0;i<7200;i++){
      const old={...m.agents[2]};advanceFireflyCourtship(m,{approach_speed:4},1/60);phases.add(m.phase);
      const a=m.agents[2];assert.ok(Math.hypot(a.x-old.x,a.y-old.y)<=4/60+1e-8);
      assert.ok(a.x>0&&a.x<m.width&&a.y>0&&a.y<m.height);
      assert.equal(m.agents[3].x,m.homes[3].x);assert.equal(m.agents[3].y,m.homes[3].y);
    }
    for(const phase of ["reply","approach","walk","nearby","return"])assert.ok(phases.has(phase),phase);
    assert.ok(m.cycles>1);
  }
});
test("frame rate does not change courtship state or position",()=>{
  const a=createFireflyCourtship(2),b=createFireflyCourtship(2);run(a,{},40,30);run(b,{},40,120);
  assert.equal(a.phase,b.phase);assert.ok(Math.abs(a.agents[2].x-b.agents[2].x)<1e-8);
});

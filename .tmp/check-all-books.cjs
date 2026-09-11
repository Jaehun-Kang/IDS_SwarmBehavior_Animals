const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const routes={starling:'Starling',sardine:'PacificSardine',grasshopper:'DesertLocust',ant:'ArmyAnt',bat:'MexicanFreeTailedBat',sheep:'Merino',penguin:'EmperorPenguin',bee:'EasternHoneyBee',firefly:'SynchronousFirefly',spiny_lobster:'CaribbeanSpinyLobster',krill:'AntarcticKrill'};
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});let passes=0;
 try{
  for(const width of [1440,390])for(const [id,route] of Object.entries(routes)){
   const page=await browser.newPage({viewport:{width,height:1000}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(`http://127.0.0.1:5173/IDS_SwarmBehavior_Animals/${route}/detail`);await page.waitForTimeout(2500);
   const rules=await page.evaluate(async id=>(await import('/IDS_SwarmBehavior_Animals/src/behaviors/animalDetails.js')).ANIMAL_DETAILS[id].rules,id);
   const spread=page.locator('.detail-book-spread:not(.detail-book-spread--capture)'),saved=[];
   for(let i=0;i<rules.length;i++){
    await page.getByRole('button',{name:'다음 페이지',exact:true}).click();await page.waitForTimeout(1700);
    assert.equal((await spread.locator('.rule-category').innerText()).trim(),rules[i].category);
    assert.equal(await spread.locator('.rule-preview--pending,[role=alert]').count(),0);
    const canvas=spread.locator('.rule-preview__canvas');assert.equal(await canvas.count(),1);
    await canvas.waitFor({state:'visible'});
    const pixels=()=>canvas.evaluate(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let j=3;j<d.length;j+=4)if(d[j]>0)n++;return n;});
    let n=await pixels();for(let retry=0;retry<150&&n===0;retry++){await page.waitForTimeout(100);n=await pixels();}assert.ok(n>0,`${id} ${i} blank`);
    const sliders=spread.locator('input[type=range]');assert.equal(await sliders.count(),rules[i].behaviors.filter(b=>b.parameter).length);
    saved[i]=[];for(let j=0;j<await sliders.count();j++){const el=sliders.nth(j),v=await el.getAttribute('max');await el.fill(v);assert.equal(await el.inputValue(),v);saved[i].push(v);}
    passes++;
   }
   for(let i=rules.length-2;i>=0;i--){await page.getByRole('button',{name:'이전 페이지',exact:true}).click();await page.waitForTimeout(1700);assert.equal((await spread.locator('.rule-category').innerText()).trim(),rules[i].category);assert.deepEqual(await spread.locator('input[type=range]').evaluateAll(es=>es.map(e=>e.value)),saved[i]);}
   assert.deepEqual(errors,[]);console.log({width,id,pages:rules.length,pixels:true,controls:true,backwardValues:true,errors});await page.close();
  }
  assert.equal(passes,94);console.log({totalBookPages:passes,groups:47});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

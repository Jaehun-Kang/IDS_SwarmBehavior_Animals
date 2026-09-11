const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const routes={starling:'Starling',sardine:'PacificSardine',grasshopper:'DesertLocust',ant:'ArmyAnt',bat:'MexicanFreeTailedBat',sheep:'Merino',penguin:'EmperorPenguin',bee:'EasternHoneyBee',firefly:'SynchronousFirefly',spiny_lobster:'CaribbeanSpinyLobster',krill:'AntarcticKrill'};
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{for(const [id,route]of Object.entries(routes)){
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:5173/IDS_SwarmBehavior_Animals/${route}/detail`);
  const sprite=page.locator('.detail-book-spread:not(.detail-book-spread--capture) .detail-header-artwork__sprite');
  await sprite.waitFor();await page.waitForTimeout(1600);
  const sample=()=>sprite.evaluate(el=>{
   const m=el.style.transform.match(/translate\(([-\d.e]+)px, ([-\d.e]+)px\)/);
   return {x:+m[1],y:+m[2],classes:el.className,transform:el.style.transform};
  });
  await page.mouse.move(1,999);await page.waitForTimeout(150);
  const initial=await sample();
  assert.ok(Math.hypot(initial.x,initial.y)<1);
  if(id==='ant')assert.ok(initial.classes.includes('ant_walk'));
  if(id==='bee'||id==='firefly')assert.ok(initial.classes.includes('idle'));
  if(id==='penguin')assert.ok(initial.classes.includes('penguin_slide'));
  if(id==='grasshopper')assert.ok(initial.classes.includes('grasshopper_idle'));
  await page.mouse.move(450,480);await page.waitForTimeout(3500);
  const inside=await sample();assert.ok(Math.hypot(inside.x,inside.y)>1,`${id}: inside movement`);
  if(id==='ant')assert.ok(inside.classes.includes('ant_top'));
  await page.mouse.move(1,999);await page.waitForTimeout(11000);
  const returned=await sample();assert.ok(Math.hypot(returned.x,returned.y)<1,`${id}: ${JSON.stringify(returned)}`);
  await page.waitForTimeout(350);
  assert.ok(Math.hypot((await sample()).x,(await sample()).y)<1);
  assert.deepEqual(errors,[]);
  await page.screenshot({path:`C:/Users/user/AppData/Local/Temp/intro-outside-${id}.png`});
  console.log({id,insideMovement:true,outsideReturned:true,classes:returned.classes,errors});
  await page.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

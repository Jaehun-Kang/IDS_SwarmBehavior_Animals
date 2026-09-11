const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/IDS_SwarmBehavior_Animals/EmperorPenguin/detail');
 const sprite=page.locator('.detail-book-spread:not(.detail-book-spread--capture) .sprite_penguin');
 await sprite.waitFor();await page.waitForTimeout(1800);
 const homeX=await sprite.evaluate(e=>{const r=e.getBoundingClientRect();return r.x+r.width/2;});
 for(const [x,y,stage] of [[1,999,'penguin_slide'],[homeX,999,'penguin_front_slide'],[homeX,1,'penguin_back']]){
  await page.mouse.move(x,y);await page.waitForTimeout(150);
  assert.ok(await sprite.evaluate((e,s)=>e.classList.contains(s),stage));
  assert.equal(await sprite.evaluate(e=>e.style.transformOrigin),'50% 50%');
  const before=await sprite.getAttribute('style');await page.waitForTimeout(650);
  assert.equal(await sprite.getAttribute('style'),before,'outside pose must not waddle');
 }
 await page.mouse.move(width*.3,500);await page.waitForTimeout(2000);
 assert.equal(await sprite.evaluate(e=>e.style.transformOrigin),'50% 100%');
 const inside=await sprite.getAttribute('style');await page.waitForTimeout(150);
 assert.notEqual(await sprite.getAttribute('style'),inside);
 await page.mouse.move(1,999);await page.waitForTimeout(12000);
 assert.equal(await sprite.evaluate(e=>e.style.transformOrigin),'50% 50%');
 const home=await sprite.evaluate(e=>({cls:e.className,transform:e.style.transform}));
 assert.ok(home.cls.includes('penguin_slide'));
 const offset=home.transform.match(/translate\(([-\d.e]+)px, ([-\d.e]+)px\)/);
 assert.ok(Math.hypot(+offset[1],+offset[2])<1);
 assert.deepEqual(errors,[]);
 await page.screenshot({path:`C:/Users/user/AppData/Local/Temp/penguin-intro-${width}.png`});
 console.log({width,slides:true,outsideWaddle:false,returnHome:true,errors});await page.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

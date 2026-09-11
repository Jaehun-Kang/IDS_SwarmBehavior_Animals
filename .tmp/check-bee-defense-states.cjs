const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.addInitScript(()=>{window.draws=0;const original=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(...args){if(this.canvas.matches('.rule-preview__canvas')&&!this.canvas.closest('.detail-book-spread--capture'))window.draws++;return original.apply(this,args);};});
  await page.goto('http://127.0.0.1:5173/IDS_SwarmBehavior_Animals/EasternHoneyBee/detail');await page.waitForTimeout(3000);
  for(let i=0;i<4;i++){await page.getByRole('button',{name:'다음 페이지',exact:true}).click();await page.waitForTimeout(2000);}
  const sliders=page.locator('.detail-book-spread:not(.detail-book-spread--capture) input[type=range]');
  await sliders.nth(0).fill('0');await page.waitForTimeout(12000);
  await page.screenshot({path:'C:/Users/user/AppData/Local/Temp/bee-defense-surround.png'});
  await sliders.nth(2).fill('1');await sliders.nth(0).fill('100');await page.waitForTimeout(16000);
  await page.evaluate(()=>{window.draws=0;});await page.waitForTimeout(800);assert.equal(await page.evaluate(()=>window.draws),0);
  await sliders.nth(0).fill('0');await page.waitForTimeout(6000);
  await page.evaluate(()=>{window.draws=0;});await page.waitForTimeout(800);assert.ok(await page.evaluate(()=>window.draws>0));
  console.log({restDraws:0,threatResumes:true});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
